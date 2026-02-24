#!/usr/bin/env bash
set -euo pipefail

# Canonical LEARN RSA runner:
# 1) Fix nopred_fdbk labels in BIDS events
# 2) Generate run-wise timing files with Anticipation (prediction->feedback)
# 3) Generate proc scripts and run AFNI GLM (raw BIDS, no blur)

TOPDIR="${TOPDIR:-/data/projects/STUDIES/LEARN/fMRI}"
RSA_DIR="${RSA_DIR:-$TOPDIR/RSA-learn}"
SCRIPT_DIR="$RSA_DIR/scripts"

SUBJ_LIST="${SUBJ_LIST:-$TOPDIR/code/afni/subjList_LEARN.txt}"
BIDS_IN="${BIDS_IN:-$TOPDIR/bids}"
BIDS_FIXED="${BIDS_FIXED:-$RSA_DIR/bids_fixed}"
TIMING_OUT="${TIMING_OUT:-$RSA_DIR/TimingFiles/Fixed2}"
REPORT="${REPORT:-$RSA_DIR/reports/nopred_fdbk_fix_template.tsv}"

FIX_EVENTS="${FIX_EVENTS:-1}"
MAKE_TIMING="${MAKE_TIMING:-1}"
MAKE_PROC="${MAKE_PROC:-1}"
CLEAN_OUT="${CLEAN_OUT:-1}"
RUN_GLM="${RUN_GLM:-1}"
MAX_JOBS="${MAX_JOBS:-}"
LOAD_LIMIT="${LOAD_LIMIT:-}"

echo "[RSA FINAL] TOPDIR=$TOPDIR"
echo "[RSA FINAL] RSA_DIR=$RSA_DIR"

if [[ "$FIX_EVENTS" == "1" ]]; then
  echo "[RSA FINAL] Step 1/3: fix nopred_fdbk -> canonical feedback labels"
  python3 "$SCRIPT_DIR/LEARN_fix_nopred_fdbk_by_template.py" \
    --bids-dir "$BIDS_IN" \
    --out-dir "$BIDS_FIXED" \
    --report "$REPORT" \
    --mode majority
fi

if [[ "$MAKE_TIMING" == "1" ]]; then
  echo "[RSA FINAL] Step 2/3: generate run-wise timing (with Anticipation)"
  SUBJ_LIST_OVERRIDE="$SUBJ_LIST" \
  BIDS_DIR_OVERRIDE="$BIDS_FIXED" \
  TIMING_ROOT_OVERRIDE="$TIMING_OUT" \
  bash "$SCRIPT_DIR/LEARN_1D_AFNItiming_Full_RSA_runwise_Anticipation.sh"
fi

if [[ "$MAKE_PROC" == "1" || "$CLEAN_OUT" == "1" || "$RUN_GLM" == "1" ]]; then
  echo "[RSA FINAL] Step 3/3: AFNI proc + GLM"
  TIMING_ROOT_OVERRIDE="$TIMING_OUT" \
  BIDS_DIR_OVERRIDE="$TOPDIR/bids" \
  MAKE_PROC="$MAKE_PROC" \
  CLEAN_OUT="$CLEAN_OUT" \
  RUN_GLM="$RUN_GLM" \
  MAX_JOBS="$MAX_JOBS" \
  LOAD_LIMIT="$LOAD_LIMIT" \
  bash "$SCRIPT_DIR/LEARN_run_RSA_runwise_pipeline_afni_raw_Anticipation.sh"
fi

echo "[RSA FINAL] done."
