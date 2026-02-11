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
# SAFETY:
#   - Skips any subject that appears to be running already.
#   - Does not touch running jobs.
#
# Usage:
#   bash LEARN_run_RSA_runwise_pipeline.sh 1055
#   SUBJ_LIST=/path/to/list bash LEARN_run_RSA_runwise_pipeline.sh
#
# Optional toggles (default = 1):
#   MAKE_PROC=1   # generate proc scripts
#   CLEAN_OUT=1   # remove existing output dirs
#   RUN_GLM=1     # run GLM
#
# Author: RSA-learn adaptation
# Date: 2026-02-11

set -euo pipefail

TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
RSA_DIR="$TOPDIR/RSA-learn"
SCRIPT_DIR="$RSA_DIR/scripts"
TMP_DIR="$RSA_DIR/tmp"
LOG_DIR="$RSA_DIR/logs"
RESULTS_DIR="$RSA_DIR/derivatives/afni/IndvlLvlAnalyses"

AP_ORIG="$SCRIPT_DIR/LEARN_ap_Full_RSA_runwise.sh"

MAKE_PROC="${MAKE_PROC:-1}"
CLEAN_OUT="${CLEAN_OUT:-1}"
RUN_GLM="${RUN_GLM:-1}"

mkdir -p "$TMP_DIR" "$LOG_DIR" "$RESULTS_DIR"

usage() {
  cat <<EOF
Usage:
  bash LEARN_run_RSA_runwise_pipeline.sh <SUBJ1> [SUBJ2 ...]
  SUBJ_LIST=/path/to/list bash LEARN_run_RSA_runwise_pipeline.sh

Env toggles:
  MAKE_PROC=1   CLEAN_OUT=1   RUN_GLM=1
  (set any to 0 to skip that step)
EOF
}

if [ "$#" -gt 0 ]; then
  SUBJECTS=( "$@" )
elif [ -n "${SUBJ_LIST:-}" ]; then
  if [ ! -f "$SUBJ_LIST" ]; then
    echo "[RSA-learn] ERROR: SUBJ_LIST not found: $SUBJ_LIST"
    exit 2
  fi
  mapfile -t SUBJECTS < <(awk 'NF && $1 !~ /^#/{print $1}' "$SUBJ_LIST")
else
  usage
  exit 1
fi

if [ "${#SUBJECTS[@]}" -eq 0 ]; then
  echo "[RSA-learn] ERROR: No subjects provided."
  exit 1
fi

is_running() {
  local subj="$1"
  pgrep -f "proc\.${subj}\.LEARN_RSA_runwise" >/dev/null 2>&1
}

if [ "$MAKE_PROC" -eq 1 ]; then
  for subj in "${SUBJECTS[@]}"; do
    if is_running "$subj"; then
      echo "[RSA-learn] SKIP (running): $subj"
      continue
    fi

    if [ ! -f "$AP_ORIG" ]; then
      echo "[RSA-learn] ERROR: Missing $AP_ORIG"
      exit 3
    fi

    AP_TMP="$TMP_DIR/LEARN_ap_Full_RSA_runwise_${subj}.sh"
    cp "$AP_ORIG" "$AP_TMP"
    sed -i "s|^set subjects = .*|set subjects = ( ${subj} )|" "$AP_TMP"

    echo "[RSA-learn] PROC GEN: $subj"
    if ! tcsh "$AP_TMP" |& tee "$LOG_DIR/ap.${subj}.log"; then
      echo "[RSA-learn] WARNING: proc generation failed for $subj"
      continue
    fi
  done
fi

if [ "$CLEAN_OUT" -eq 1 ]; then
  for subj in "${SUBJECTS[@]}"; do
    if is_running "$subj"; then
      echo "[RSA-learn] SKIP CLEAN (running): $subj"
      continue
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
  done
fi

if [ "$RUN_GLM" -eq 1 ]; then
  for subj in "${SUBJECTS[@]}"; do
    if is_running "$subj"; then
      echo "[RSA-learn] SKIP RUN (running): $subj"
      continue
    fi

    PROC="$RESULTS_DIR/$subj/proc.${subj}.LEARN_RSA_runwise"
    if [ ! -f "$PROC" ]; then
      echo "[RSA-learn] MISSING PROC: $PROC"
      continue
    fi

    mkdir -p "$RESULTS_DIR/$subj"
    echo "[RSA-learn] RUN: $subj"
    if ! ( cd "$RESULTS_DIR/$subj" && tcsh -xef "proc.${subj}.LEARN_RSA_runwise" |& tee "output.proc.${subj}.LEARN_RSA_runwise" ); then
      echo "[RSA-learn] WARNING: GLM failed for $subj"
      continue
    fi
  done
fi
