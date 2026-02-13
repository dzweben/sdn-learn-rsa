#!/bin/bash

#######################################################
# SCRIPT SUMMARY
#######################################################
# Targeted RSA-learn rerun for subjects that have
# standard AFNI stats but are missing RSA-runwise stats.
#
# Discovery (no subject list):
#   - Standard AFNI stats:
#       /data/projects/STUDIES/LEARN/fMRI/derivatives/afni/IndvlLvlAnalyses/*/*.results.* /stats.*+tlrc.HEAD
#   - RSA stats:
#       /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/*/*.results.LEARN_RSA_runwise/stats.*+tlrc.HEAD
#
# Filtering:
#   - Skip if timing folder missing
#   - Skip if confounds missing
#   - Skip if fMRIPrep has <2 runs
#
# Fallback:
#   - If 2–3 runs, rewrite afni_proc inputs to available runs
#     and disable GLTs (run-wise model still runs)
#
# Parallelization:
#   - MAX_JOBS defaults to CPU cores
#   - LOAD_LIMIT defaults to MAX_JOBS
#
# Usage:
#   bash LEARN_run_RSA_runwise_rerun_from_standard.sh
#   MAX_JOBS=16 LOAD_LIMIT=20 bash LEARN_run_RSA_runwise_rerun_from_standard.sh
#
# Author: RSA-learn adaptation
# Date: 2026-02-12

set -euo pipefail

TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
RSA_DIR="$TOPDIR/RSA-learn"
SCRIPT_DIR="$RSA_DIR/scripts"
TMP_DIR="$RSA_DIR/tmp"
LOG_DIR="$RSA_DIR/logs"
RSA_RESULTS="$RSA_DIR/derivatives/afni/IndvlLvlAnalyses"
STD_RESULTS="$TOPDIR/derivatives/afni/IndvlLvlAnalyses"
TIMING_ROOT="$RSA_DIR/TimingFiles/Full"
CONFOUND_DIR="$TOPDIR/derivatives/afni/confounds"
FMRIPREP_DIR="$TOPDIR/derivatives/fmriprep"

AP_ORIG="$SCRIPT_DIR/LEARN_ap_Full_RSA_runwise.sh"

MAX_JOBS="${MAX_JOBS:-}"
LOAD_LIMIT="${LOAD_LIMIT:-}"

mkdir -p "$TMP_DIR" "$LOG_DIR" "$RSA_RESULTS"
RUN_LOG="$LOG_DIR/rerun_missing_$(date +%Y%m%d_%H%M).log"

# Defaults from CPU cores if not set
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

log() { echo "[$(date '+%F %T')] $*" | tee -a "$RUN_LOG"; }

is_running() {
  local subj="$1"
  pgrep -f "proc\.${subj}\.LEARN_RSA_runwise" >/dev/null 2>&1
}

discover_std_stats() {
  find "$STD_RESULTS" -type f -name "stats.*+tlrc.HEAD" -path "*/*.results.*/*" 2>/dev/null \
    | sed -E 's#.*/stats\.([0-9]+)\+tlrc\.HEAD#\1#' | sort -u
}

discover_rsa_stats() {
  find "$RSA_RESULTS" -type f -name "stats.*+tlrc.HEAD" -path "*/*.results.LEARN_RSA_runwise/*" 2>/dev/null \
    | sed -E 's#.*/stats\.([0-9]+)\+tlrc\.HEAD#\1#' | sort -u
}

missing_subjects() {
  comm -23 <(discover_std_stats) <(discover_rsa_stats)
}

check_prereqs() {
  local subj="$1"
  local timing_dir="$TIMING_ROOT/sub-${subj}"
  local conf_dir="$CONFOUND_DIR/sub-${subj}"

  if [ ! -d "$timing_dir" ]; then
    log "SKIP $subj: missing timing folder ($timing_dir)"
    return 1
  fi

  if [ ! -f "$conf_dir/sub-${subj}_task-learn_allruns_aCompCor6.1D" ] || \
     [ ! -f "$conf_dir/sub-${subj}_task-learn_allruns_cosine.1D" ] || \
     [ ! -f "$conf_dir/sub-${subj}_task-learn_allruns_fd.1D" ]; then
    log "SKIP $subj: missing confounds (aCompCor6/cosine/fd)"
    return 1
  fi

  local run_count
  run_count=$(find "$FMRIPREP_DIR/sub-${subj}/func" -maxdepth 1 -type f -name "sub-${subj}_task-learn_run-*_desc-preproc_bold.nii.gz" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$run_count" -lt 2 ]; then
    log "SKIP $subj: fMRIPrep runs <2 (found $run_count)"
    return 1
  fi

  return 0
}

process_subj() {
  local subj="$1"

  if is_running "$subj"; then
    log "SKIP $subj: already running"
    return 0
  fi

  # Skip if stats already exist (safety)
  if [ -f "$RSA_RESULTS/$subj/${subj}.results.LEARN_RSA_runwise/stats.${subj}+tlrc.HEAD" ]; then
    log "SKIP $subj: RSA stats already exist"
    return 0
  fi

  check_prereqs "$subj" || return 0

  if [ ! -f "$AP_ORIG" ]; then
    log "ERROR $subj: missing $AP_ORIG"
    return 1
  fi

  # Determine available runs from fMRIPrep
  mapfile -t RUNS < <(find "$FMRIPREP_DIR/sub-${subj}/func" -maxdepth 1 -type f -name "sub-${subj}_task-learn_run-*_desc-preproc_bold.nii.gz" 2>/dev/null \
    | sed -E 's/.*run-([0-9]+).*/\\1/' | sort -n)
  local run_count="${#RUNS[@]}"

  AP_TMP="$TMP_DIR/LEARN_ap_Full_RSA_runwise_${subj}.sh"
  cp "$AP_ORIG" "$AP_TMP"
  sed -i "s|^set subjects = .*|set subjects = ( ${subj} )|" "$AP_TMP"

  # Fallback for <4 runs: build a reduced afni_proc call (no GLTs)
  if [ "$run_count" -lt 4 ]; then
    log "FALLBACK $subj: runs=${RUNS[*]} (GLTs disabled, run-wise model restricted)"
    python3 - <<PY
from pathlib import Path

ap = Path("$AP_TMP")
subj = "$subj"
runs = [r.strip() for r in "${RUNS[*]}".split() if r.strip()]

stimdir = f"\\$stimdir"  # keep literal for tcsh
subj_dir = f"\\$subj_dir"

def build_dsets():
    lines = []
    for r in runs:
        lines.append(f"\\t\\t\\t{subj_dir}/func/sub-{subj}_task-learn_run-{r}_space-MNI152NLin2009cAsym_desc-preproc_bold.nii.gz \\\\")
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
        stim_times.append(f"\\t\\t{stimdir}/{s}_run{r}.1D \\\\")
        stim_labels.append(f"\\t\\t{lab}.r{r} \\\\")
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
            # skip old block
            while i < len(lines) and end_key not in lines[i]:
                i += 1
            # insert new block
            out.extend(new_lines)
            continue
        if end_key in line:
            out.append(line)
            i += 1
            continue
        out.append(line)
        i += 1
    return out

# Replace blocks
lines = replace_block('-dsets', '-scr_overwrite', build_dsets())
lines = replace_block('-regress_stim_times', '-regress_stim_labels', stim_times)
lines = replace_block('-regress_stim_labels', '-regress_stim_types', stim_labels)
lines = replace_block('-regress_stim_types', '-regress_basis_multi', stim_types)
lines = replace_block('-regress_basis_multi', '-regress_make_ideal_sum', basis_multi)

# Remove GLTs entirely for fallback
filtered = []
for line in lines:
    if ' -num_glt ' in line or line.strip().startswith('-gltsym') or ' -glt_label ' in line:
        continue
    filtered.append(line)

ap.write_text(\"\\n\".join(filtered) + \"\\n\")
PY
  fi

  log "PROC GEN $subj"
  tcsh "$AP_TMP" |& tee "$LOG_DIR/ap.${subj}.log" || { log "FAIL PROC $subj"; return 1; }

  OUT_DIR="$RSA_RESULTS/$subj/${subj}.results.LEARN_RSA_runwise"
  ALT_OUT_DIR="$SCRIPT_DIR/${subj}.results.LEARN_RSA_runwise"
  rm -rf "$OUT_DIR" "$ALT_OUT_DIR"

  log "RUN GLM $subj"
  mkdir -p "$RSA_RESULTS/$subj"
  ( cd "$RSA_RESULTS/$subj" && tcsh -xef "proc.${subj}.LEARN_RSA_runwise" |& tee "output.proc.${subj}.LEARN_RSA_runwise" ) \
    || { log "FAIL GLM $subj"; return 1; }
}

wait_for_load() {
  local limit="$1"
  while true; do
    local load
    load=$(awk '{print $1}' /proc/loadavg 2>/dev/null || echo 0)
    awk -v l="$load" -v t="$limit" 'BEGIN{exit !(l < t)}' && break
    sleep 5
  done
}

run_parallel() {
  local subj
  if [ "$MAX_JOBS" -gt 1 ]; then
    set -m
  fi
  for subj in "$@"; do
    while [ "$(jobs -pr | wc -l | tr -d ' ')" -ge "$MAX_JOBS" ]; do
      sleep 5
    done
    wait_for_load "$LOAD_LIMIT"
    process_subj "$subj" &
  done
  wait
}

log "RERUN START"
log "MAX_JOBS=$MAX_JOBS LOAD_LIMIT=$LOAD_LIMIT"

mapfile -t MISSING < <(missing_subjects)
if [ "${#MISSING[@]}" -eq 0 ]; then
  log "Nothing to rerun (RSA stats already present for all standard AFNI subjects)."
  exit 0
fi

log "Subjects to rerun: ${MISSING[*]}"
run_parallel "${MISSING[@]}"
log "RERUN DONE"
