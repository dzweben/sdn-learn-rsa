#!/bin/bash

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA-learn RUN-WISE pipeline (proc + cleanup + GLM)
#
# This script standardizes the per-subject workflow:
#   1) Generate afni_proc scripts (per subject)
#   2) Clean output directories (to avoid "already exists")
#   3) Run the GLM from the correct working directory
#
# SUBJECT DISCOVERY:
#   - No subject list required.
#   - By default, discovers subjects from:
#       /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Full/sub-*
#   - If no timing folders found, falls back to:
#       /data/projects/STUDIES/LEARN/fMRI/bids/sub-*
#
# PARALLELIZATION:
#   - Use MAX_JOBS to cap parallel subjects (default: 2).
#   - Skips any subject that appears to be running already.
#
# FALLBACK:
#   - If a subject has 2–3 runs, rewrite afni_proc inputs to those runs
#     and recompute GLTs over available runs.
#   - If a subject has <2 runs, skip.
#
# Usage:
#   bash LEARN_run_RSA_runwise_pipeline.sh
#   MAX_JOBS=4 bash LEARN_run_RSA_runwise_pipeline.sh
#   SUBJ_ROOT=/path/to/sub-*/ bash LEARN_run_RSA_runwise_pipeline.sh
#
# Optional toggles (default = 1):
#   MAKE_PROC=1   # generate proc scripts
#   CLEAN_OUT=1   # remove existing output dirs
#   RUN_GLM=1     # run GLM
#
# Author: RSA-learn adaptation
# Date: 2026-02-12

set -euo pipefail

TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
RSA_DIR="$TOPDIR/RSA-learn"
SCRIPT_DIR="$RSA_DIR/scripts"
TMP_DIR="$RSA_DIR/tmp"
LOG_DIR="$RSA_DIR/logs"
RESULTS_DIR="$RSA_DIR/derivatives/afni/IndvlLvlAnalyses"
TIMING_ROOT="$RSA_DIR/TimingFiles/Full"
BIDS_DIR="$TOPDIR/bids"
FMRIPREP_DIR="$TOPDIR/derivatives/fmriprep"

AP_ORIG="$SCRIPT_DIR/LEARN_ap_Full_RSA_runwise.sh"

MAKE_PROC="${MAKE_PROC:-1}"
CLEAN_OUT="${CLEAN_OUT:-1}"
RUN_GLM="${RUN_GLM:-1}"
MAX_JOBS="${MAX_JOBS:-}"
LOAD_LIMIT="${LOAD_LIMIT:-}"
SUBJ_ROOT="${SUBJ_ROOT:-$TIMING_ROOT}"

mkdir -p "$TMP_DIR" "$LOG_DIR" "$RESULTS_DIR"

usage() {
  cat <<EOF
Usage:
  bash LEARN_run_RSA_runwise_pipeline.sh

Env:
  MAX_JOBS=N            # parallel subjects (default: CPU cores)
  LOAD_LIMIT=N          # 1-min loadavg threshold to start a new subject (default: MAX_JOBS)
  SUBJ_ROOT=/path/to/sub-*/  # override discovery root

Toggles:
  MAKE_PROC=1   CLEAN_OUT=1   RUN_GLM=1
  (set any to 0 to skip that step)
EOF
}

discover_subjects() {
  local root="$1"
  if [ ! -d "$root" ]; then
    return 1
  fi
  find "$root" -maxdepth 1 -type d -name "sub-*" -printf "%f\n" 2>/dev/null \
    | sed 's/^sub-//' | sort -u
}

# Default MAX_JOBS/LOAD_LIMIT from CPU cores if not set
if [ -z "${MAX_JOBS}" ]; then
  if command -v nproc >/dev/null 2>&1; then
    MAX_JOBS=$(nproc)
  else
    MAX_JOBS=$(getconf _NPROCESSORS_ONLN 2>/dev/null || echo 4)
  fi
fi
if [ -z "${LOAD_LIMIT}" ]; then
  LOAD_LIMIT="$MAX_JOBS"
fi

SUBJECTS=()
mapfile -t SUBJECTS < <(discover_subjects "$SUBJ_ROOT" || true)

if [ "${#SUBJECTS[@]}" -eq 0 ]; then
  echo "[RSA-learn] No subjects found in $SUBJ_ROOT"
  echo "[RSA-learn] Falling back to BIDS: $BIDS_DIR"
  mapfile -t SUBJECTS < <(discover_subjects "$BIDS_DIR" || true)
fi

if [ "${#SUBJECTS[@]}" -eq 0 ]; then
  echo "[RSA-learn] ERROR: No subjects discovered."
  usage
  exit 1
fi

echo "[RSA-learn] Found ${#SUBJECTS[@]} subjects."
echo "[RSA-learn] MAX_JOBS=$MAX_JOBS  LOAD_LIMIT=$LOAD_LIMIT"

is_running() {
  local subj="$1"
  pgrep -f "proc\.${subj}\.LEARN_RSA_runwise" >/dev/null 2>&1
}

proc_gen() {
  local subj="$1"
  if is_running "$subj"; then
    echo "[RSA-learn] SKIP (running): $subj"
    return 0
  fi
  if [ ! -f "$AP_ORIG" ]; then
    echo "[RSA-learn] ERROR: Missing $AP_ORIG"
    return 1
  fi
  AP_TMP="$TMP_DIR/LEARN_ap_Full_RSA_runwise_${subj}.sh"
  cp "$AP_ORIG" "$AP_TMP"
  sed -i "s|^set subjects = .*|set subjects = ( ${subj} )|" "$AP_TMP"
  # Determine available runs from fMRIPrep
  mapfile -t RUNS < <(find "$FMRIPREP_DIR/sub-${subj}/func" -maxdepth 1 -type f -name "sub-${subj}_task-learn_run-*_desc-preproc_bold.nii.gz" 2>/dev/null \
    | sed -E 's/.*run-([0-9]+).*/\\1/' | sort -n)
  local run_count="${#RUNS[@]}"

  if [ "$run_count" -lt 2 ]; then
    echo "[RSA-learn] SKIP (runs <2): $subj"
    return 0
  fi

  # Fallback for <4 runs: build a reduced afni_proc call (no GLTs)
  if [ "$run_count" -lt 4 ]; then
    echo "[RSA-learn] FALLBACK (runs=${RUNS[*]}): $subj"
    python3 - <<PY
from pathlib import Path

ap = Path("$AP_TMP")
subj = "$subj"
runs = [int(r) for r in "${RUNS[*]}".split() if r.strip()]

stimdir = f"\\$stimdir"  # keep literal for tcsh
subj_dir = f"\\$subj_dir"

def build_dsets():
    lines = []
    for r in runs:
        lines.append(f\"\\t\\t\\t{subj_dir}/func/sub-{subj}_task-learn_run-{r:02d}_space-MNI152NLin2009cAsym_desc-preproc_bold.nii.gz \\\\\")
    return lines

stim_defs = [
    ("NonPM_Mean60_fdkm", "FBM.Mean60"),
    ("NonPM_Mean60_fdkn", "FBN.Mean60"),
    ("NonPM_Mean80_fdkm", "FBM.Mean80"),
    ("NonPM_Mean80_fdkn", "FBN.Mean80"),
    ("NonPM_Nice60_fdkm", "FBM.Nice60"),
    ("NonPM_Nice60_fdkn", "FBN.Nice60"),
    ("NonPM_Nice80_fdkm", "FBM.Nice80"),
    ("NonPM_Nice80_fdkn", "FBN.Nice80"),
]
pred_resp = [
    ("Mean60_pred", "Pred.Mean60"),
    ("Mean60_rsp", "Resp.Mean60"),
    ("Mean80_pred", "Pred.Mean80"),
    ("Mean80_rsp", "Resp.Mean80"),
    ("Nice60_pred", "Pred.Nice60"),
    ("Nice60_rsp", "Resp.Nice60"),
    ("Nice80_pred", "Pred.Nice80"),
    ("Nice80_rsp", "Resp.Nice80"),
]

stim_times = []
stim_labels = []
for r in runs:
    for s, lab in stim_defs:
        stim_times.append(f\"\\t\\t{stimdir}/{s}_run{r}.1D \\\\\")
        stim_labels.append(f\"\\t\\t{lab}.r{r} \\\\\")
for s, lab in pred_resp:
    stim_times.append(f"\\t\\t{stimdir}/{s}.1D \\\\")
    stim_labels.append(f"\\t\\t{lab} \\\\")

stim_count = len(stim_labels)
stim_types = ["\\t\\tAM1 \\\\" for _ in range(stim_count)]
basis_multi = ["\\t\\t'dmBLOCK(0)' \\\\" for _ in range(stim_count)]

text = ap.read_text()
lines = text.splitlines()

def replace_block(start_key, end_key, new_lines):
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if start_key in line:
            out.append(line)
            i += 1
            while i < len(lines) and end_key not in lines[i]:
                i += 1
            out.extend(new_lines)
            continue
        if end_key in line:
            out.append(line)
            i += 1
            continue
        out.append(line)
        i += 1
    return out

lines = replace_block('-dsets', '-scr_overwrite', build_dsets())
lines = replace_block('-regress_stim_times', '-regress_stim_labels', stim_times)
lines = replace_block('-regress_stim_labels', '-regress_stim_types', stim_labels)
lines = replace_block('-regress_stim_types', '-regress_basis_multi', stim_types)
lines = replace_block('-regress_basis_multi', '-regress_make_ideal_sum', basis_multi)

def fmt_w(x):
    if abs(x - 1.0) < 1e-8:
        return ""
    return f\"{x:.6f}*\"

def glt(sym, label, idx):
    return f\"\\t\\t-gltsym 'SYM: {sym}' -glt_label {idx} {label} \\\\\"

runs_sorted = runs
num_runs = len(runs_sorted)

def all_run_terms(peer=None, cond=None):
    terms = []
    for r in runs_sorted:
        if peer and cond:
            terms.append(f\"+{peer}.{cond}.r{r}\")
        elif peer:
            for c in [\"Mean60\",\"Mean80\",\"Nice60\",\"Nice80\"]:
                terms.append(f\"+{peer}.{c}.r{r}\")
        else:
            for p in [\"FBM\",\"FBN\"]:
                for c in [\"Mean60\",\"Mean80\",\"Nice60\",\"Nice80\"]:
                    terms.append(f\"+{p}.{c}.r{r}\")
    return terms

glt_lines = []
idx = 1

# 1 Task.V.BL (all FB + pred/resp)
task_terms = all_run_terms() + [
    \"+Pred.Mean60\", \"+Resp.Mean60\", \"+Pred.Mean80\", \"+Resp.Mean80\",
    \"+Pred.Nice60\", \"+Resp.Nice60\", \"+Pred.Nice80\", \"+Resp.Nice80\",
]
glt_lines.append(glt(\" \".join(task_terms), \"Task.V.BL\", idx)); idx += 1

# 2 Prediction.V.BL
glt_lines.append(glt(\"+Pred.Mean60 +Pred.Mean80 +Pred.Nice60 +Pred.Nice80\", \"Prediction.V.BL\", idx)); idx += 1

# 3 Prediction.Mean.V.Nice
glt_lines.append(glt(\"+Pred.Mean60 +Pred.Mean80 -Pred.Nice60 -Pred.Nice80\", \"Prediction.Mean.V.Nice\", idx)); idx += 1

# 4 FB.V.BL
glt_lines.append(glt(\" \".join(all_run_terms()), \"FB.V.BL\", idx)); idx += 1

# 5 FBM.V.BL
glt_lines.append(glt(\" \".join(all_run_terms(peer=\"FBM\")), \"FBM.V.BL\", idx)); idx += 1

# 6 FBN.V.BL
glt_lines.append(glt(\" \".join(all_run_terms(peer=\"FBN\")), \"FBN.V.BL\", idx)); idx += 1

# 7 FBM.V.FBN
fbm_terms = all_run_terms(peer=\"FBM\")
fbn_terms = [t.replace(\"+\", \"-\") for t in all_run_terms(peer=\"FBN\")]
glt_lines.append(glt(\" \".join(fbm_terms + fbn_terms), \"FBM.V.FBN\", idx)); idx += 1

# 8-? run-specific mean/nice per run
for r in runs_sorted:
    glt_lines.append(glt(f\"+0.5*FBM.Mean60.r{r} +0.5*FBN.Mean60.r{r}\", f\"Mean60.r{r}\", idx)); idx += 1
    glt_lines.append(glt(f\"+0.5*FBM.Mean80.r{r} +0.5*FBN.Mean80.r{r}\", f\"Mean80.r{r}\", idx)); idx += 1
    glt_lines.append(glt(f\"+0.5*FBM.Nice60.r{r} +0.5*FBN.Nice60.r{r}\", f\"Nice60.r{r}\", idx)); idx += 1
    glt_lines.append(glt(f\"+0.5*FBM.Nice80.r{r} +0.5*FBN.Nice80.r{r}\", f\"Nice80.r{r}\", idx)); idx += 1

# FBM/FBN per run (avg across 4 conditions)
for r in runs_sorted:
    glt_lines.append(glt(f\"+0.25*FBM.Mean60.r{r} +0.25*FBM.Mean80.r{r} +0.25*FBM.Nice60.r{r} +0.25*FBM.Nice80.r{r}\", f\"FBM.r{r}\", idx)); idx += 1
    glt_lines.append(glt(f\"+0.25*FBN.Mean60.r{r} +0.25*FBN.Mean80.r{r} +0.25*FBN.Nice60.r{r} +0.25*FBN.Nice80.r{r}\", f\"FBN.r{r}\", idx)); idx += 1

# Across-run averages
wr = 1.0 / num_runs
for cond in [\"Mean60\",\"Mean80\",\"Nice60\",\"Nice80\"]:
    fbm = \" \".join([f\"+{fmt_w(wr)}FBM.{cond}.r{r}\" for r in runs_sorted])
    fbn = \" \".join([f\"+{fmt_w(wr)}FBN.{cond}.r{r}\" for r in runs_sorted])
    glt_lines.append(glt(fbm, f\"FBM.{cond}.all\", idx)); idx += 1
    glt_lines.append(glt(fbn, f\"FBN.{cond}.all\", idx)); idx += 1

wpr = 1.0 / (2 * num_runs)
for cond in [\"Mean60\",\"Mean80\",\"Nice60\",\"Nice80\"]:
    terms = []
    for r in runs_sorted:
        terms.append(f\"+{fmt_w(wpr)}FBM.{cond}.r{r}\")
        terms.append(f\"+{fmt_w(wpr)}FBN.{cond}.r{r}\")
    glt_lines.append(glt(\" \".join(terms), f\"{cond}.all\", idx)); idx += 1

wfb = 1.0 / (4 * num_runs)
fbm_terms = []
fbn_terms = []
for r in runs_sorted:
    for cond in [\"Mean60\",\"Mean80\",\"Nice60\",\"Nice80\"]:
        fbm_terms.append(f\"+{fmt_w(wfb)}FBM.{cond}.r{r}\")
        fbn_terms.append(f\"+{fmt_w(wfb)}FBN.{cond}.r{r}\")
glt_lines.append(glt(\" \".join(fbm_terms), \"FBM.all\", idx)); idx += 1
glt_lines.append(glt(\" \".join(fbn_terms), \"FBN.all\", idx)); idx += 1

filtered = []
inserted = False
for line in lines:
    if ' -num_glt ' in line or line.strip().startswith('-gltsym') or ' -glt_label ' in line:
        continue
    filtered.append(line)
    if (not inserted) and line.strip().startswith('-allzero_OK'):
        filtered.append(f\"\\t\\t-num_glt {len(glt_lines)} \\\\\")
        filtered.extend(glt_lines)
        inserted = True

ap.write_text(\"\\n\".join(filtered) + \"\\n\")
PY
  fi
  echo "[RSA-learn] PROC GEN: $subj"
  tcsh "$AP_TMP" |& tee "$LOG_DIR/ap.${subj}.log"
}

clean_out() {
  local subj="$1"
  if is_running "$subj"; then
    echo "[RSA-learn] SKIP CLEAN (running): $subj"
    return 0
  fi
  OUT_BASE="$RESULTS_DIR/$subj"
  OUT_DIR="$OUT_BASE/${subj}.results.LEARN_RSA_runwise"
  ALT_OUT_DIR="$SCRIPT_DIR/${subj}.results.LEARN_RSA_runwise"
  if [ -d "$OUT_DIR" ]; then
    echo "[RSA-learn] CLEAN: $OUT_DIR"
    rm -rf "$OUT_DIR"
  fi
  if [ -d "$ALT_OUT_DIR" ]; then
    echo "[RSA-learn] CLEAN stray: $ALT_OUT_DIR"
    rm -rf "$ALT_OUT_DIR"
  fi
}

run_glm() {
  local subj="$1"
  if is_running "$subj"; then
    echo "[RSA-learn] SKIP RUN (running): $subj"
    return 0
  fi
  PROC="$RESULTS_DIR/$subj/proc.${subj}.LEARN_RSA_runwise"
  if [ ! -f "$PROC" ]; then
    echo "[RSA-learn] MISSING PROC: $PROC"
    return 0
  fi
  mkdir -p "$RESULTS_DIR/$subj"
  echo "[RSA-learn] RUN: $subj"
  ( cd "$RESULTS_DIR/$subj" && tcsh -xef "proc.${subj}.LEARN_RSA_runwise" |& tee "output.proc.${subj}.LEARN_RSA_runwise" )
}

run_parallel() {
  local fn="$1"; shift
  local subj
  if [ "$MAX_JOBS" -gt 1 ]; then
    set -m
  fi
  wait_for_load() {
    local limit="$1"
    while true; do
      local load
      load=$(awk '{print $1}' /proc/loadavg 2>/dev/null || echo 0)
      awk -v l="$load" -v t="$limit" 'BEGIN{exit !(l < t)}' && break
      sleep 5
    done
  }
  for subj in "$@"; do
    while [ "$(jobs -pr | wc -l | tr -d ' ')" -ge "$MAX_JOBS" ]; do
      sleep 5
    done
    wait_for_load "$LOAD_LIMIT"
    "$fn" "$subj" &
  done
  wait
}

if [ "$MAKE_PROC" -eq 1 ]; then
  run_parallel proc_gen "${SUBJECTS[@]}"
fi

if [ "$CLEAN_OUT" -eq 1 ]; then
  run_parallel clean_out "${SUBJECTS[@]}"
fi

if [ "$RUN_GLM" -eq 1 ]; then
  run_parallel run_glm "${SUBJECTS[@]}"
fi
