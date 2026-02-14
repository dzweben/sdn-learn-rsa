#!/bin/bash

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA‑learn RUN‑WISE pipeline (AFNI raw‑BIDS, NO smoothing)
#
# Standard workflow:
#   1) Generate afni_proc scripts (per subject)
#   2) Clean output directories (avoid "already exists")
#   3) Run the GLM from the correct working directory
#
# SUBJECT DISCOVERY:
#   - No subject list required.
#   - By default, discovers subjects from:
#       $TIMING_ROOT/sub-*
#   - If no timing folders found, falls back to:
#       $BIDS_DIR/sub-*
#
# PARALLELIZATION:
#   - Use MAX_JOBS to cap parallel subjects (default: CPU cores)
#
# FALLBACK:
#   - If a subject has 2–3 runs, rewrite afni_proc inputs to those runs
#     and recompute GLTs over available runs.
#   - If a subject has <2 runs, skip.
#
# Usage:
#   bash LEARN_run_RSA_runwise_pipeline_afni_raw.sh
#   MAX_JOBS=4 bash LEARN_run_RSA_runwise_pipeline_afni_raw.sh
#   SUBJ_ROOT=/path/to/sub-*/ bash LEARN_run_RSA_runwise_pipeline_afni_raw.sh
#
# Optional toggles (default = 1):
#   MAKE_PROC=1   CLEAN_OUT=1   RUN_GLM=1
#
# Author: RSA‑learn adaptation
# Date: 2026‑02‑14

set -euo pipefail

TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
RSA_DIR="$TOPDIR/RSA-learn"
SCRIPT_DIR="$RSA_DIR/scripts"
TMP_DIR="$RSA_DIR/tmp"
LOG_DIR="$RSA_DIR/logs"
RESULTS_DIR="$RSA_DIR/derivatives/afni/IndvlLvlAnalyses"
TIMING_ROOT="${TIMING_ROOT_OVERRIDE:-$RSA_DIR/TimingFiles/Full}"
BIDS_DIR="${BIDS_DIR_OVERRIDE:-$TOPDIR/bids}"

AP_ORIG="$SCRIPT_DIR/LEARN_ap_Full_RSA_runwise_AFNI_noblur.sh"
AP_FALLBACK="$SCRIPT_DIR/LEARN_ap_fallback_patch_afni_raw.py"

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
  bash LEARN_run_RSA_runwise_pipeline_afni_raw.sh

Env:
  MAX_JOBS=N            # parallel subjects (default: CPU cores)
  LOAD_LIMIT=N          # 1-min loadavg threshold to start a new subject (default: MAX_JOBS)
  SUBJ_ROOT=/path/to/sub-*/  # override discovery root
  TIMING_ROOT_OVERRIDE=/path/to/timing
  BIDS_DIR_OVERRIDE=/path/to/bids

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
  pgrep -f "proc\.${subj}\.LEARN_RSA_runwise_AFNI" >/dev/null 2>&1
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
  AP_TMP="$TMP_DIR/LEARN_ap_Full_RSA_runwise_AFNI_${subj}.sh"
  cp "$AP_ORIG" "$AP_TMP"
  sed -i "s|^set subjects = .*|set subjects = ( ${subj} )|" "$AP_TMP"

  mapfile -t RUNS < <(find "$BIDS_DIR/sub-${subj}/func" -maxdepth 1 -type f \
    -name "sub-${subj}_task-learn_run-*_bold.nii.gz" 2>/dev/null \
    | sed -E 's/.*run-0*([0-9]+).*/\1/' | sort -n)
  local run_count="${#RUNS[@]}"

  if [ "$run_count" -lt 2 ]; then
    echo "[RSA-learn] SKIP (runs <2): $subj"
    return 0
  fi

  if [ "$run_count" -lt 4 ]; then
    echo "[RSA-learn] FALLBACK (runs=${RUNS[*]}): $subj"
    python3 "$AP_FALLBACK" "$AP_TMP" "$subj" ${RUNS[*]}
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
  OUT_DIR="$OUT_BASE/${subj}.results.LEARN_RSA_runwise_AFNI"
  ALT_OUT_DIR="$SCRIPT_DIR/${subj}.results.LEARN_RSA_runwise_AFNI"
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
  PROC="$RESULTS_DIR/$subj/proc.${subj}.LEARN_RSA_runwise_AFNI"
  if [ ! -f "$PROC" ]; then
    echo "[RSA-learn] MISSING PROC: $PROC"
    return 0
  fi
  mkdir -p "$RESULTS_DIR/$subj"
  echo "[RSA-learn] RUN: $subj"
  ( cd "$RESULTS_DIR/$subj" && tcsh -xef "proc.${subj}.LEARN_RSA_runwise_AFNI" |& tee "output.proc.${subj}.LEARN_RSA_runwise_AFNI" )
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
