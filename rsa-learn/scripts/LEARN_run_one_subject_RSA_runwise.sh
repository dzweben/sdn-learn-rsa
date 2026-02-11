#!/bin/bash

#######################################################
# SCRIPT SUMMARY
#######################################################
# One‑subject runner for RSA‑learn run‑wise pipeline
#
# This wrapper:
#   1) Builds a one‑subject list
#   2) Clones the RSA‑learn timing + afni_proc + run scripts
#   3) Injects the single subject into those temp scripts
#   4) Runs timing generation, proc generation, and the GLM
#
# IMPORTANT:
#   - Does NOT modify the original RSA‑learn scripts
#   - Writes temporary scripts to RSA‑learn/tmp
#   - Writes logs to RSA‑learn/logs
#
# Usage:
#   bash LEARN_run_one_subject_RSA_runwise.sh 1055
#
# Author: RSA‑learn adaptation
# Date: 2026‑02‑09

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "USAGE: bash LEARN_run_one_subject_RSA_runwise.sh <SUBJECT_ID>"
  exit 1
fi

SUBJ="$1"

TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
RSA_DIR="$TOPDIR/RSA-learn"
SCRIPT_DIR="$RSA_DIR/scripts"
TMP_DIR="$RSA_DIR/tmp"
LOG_DIR="$RSA_DIR/logs"
NOTE_DIR="$RSA_DIR/notes"

mkdir -p "$TMP_DIR" "$LOG_DIR" "$NOTE_DIR"

# Paths to base scripts
TIMING_ORIG="$SCRIPT_DIR/LEARN_1D_AFNItiming_Full_RSA_runwise.sh"
AP_ORIG="$SCRIPT_DIR/LEARN_ap_Full_RSA_runwise.sh"
RUN_ORIG="$SCRIPT_DIR/LEARN_RunAFNIProc_RSA_runwise.sh"

# Quick sanity checks
for f in "$TIMING_ORIG" "$AP_ORIG" "$RUN_ORIG"; do
  if [ ! -f "$f" ]; then
    echo "MISSING: $f"
    echo "Aborting."
    exit 2
  fi
done

# One‑subject list for timing script
SUBJ_LIST="$NOTE_DIR/subjList_RSA_runwise.txt"
echo "$SUBJ" > "$SUBJ_LIST"

# Temp script paths
TIMING_TMP="$TMP_DIR/LEARN_1D_AFNItiming_Full_RSA_runwise_${SUBJ}.sh"
AP_TMP="$TMP_DIR/LEARN_ap_Full_RSA_runwise_${SUBJ}.sh"
RUN_TMP="$TMP_DIR/LEARN_RunAFNIProc_RSA_runwise_${SUBJ}.sh"

# Clone scripts
cp "$TIMING_ORIG" "$TIMING_TMP"
cp "$AP_ORIG" "$AP_TMP"
cp "$RUN_ORIG" "$RUN_TMP"

# Inject subject list + subject ID
sed -i "s|^SUBJ_LIST=.*|SUBJ_LIST=\"$SUBJ_LIST\"|" "$TIMING_TMP"
sed -i "s|^set subjects = .*|set subjects = ( $SUBJ )|" "$AP_TMP"
sed -i "s|^set subjects = .*|set subjects = ( $SUBJ )|" "$RUN_TMP"

# Run steps

echo "[RSA‑learn] Step 1/3: Build run‑wise NonPM timing files for $SUBJ"
bash "$TIMING_TMP" |& tee "$LOG_DIR/timing.${SUBJ}.log"

echo "[RSA‑learn] Step 2/3: Generate afni_proc script for $SUBJ"
tcsh "$AP_TMP" |& tee "$LOG_DIR/ap.${SUBJ}.log"

# Ensure output dir does not already exist (afni_proc will abort otherwise)
OUT_BASE="$RSA_DIR/derivatives/afni/IndvlLvlAnalyses/$SUBJ"
OUT_DIR="$OUT_BASE/${SUBJ}.results.LEARN_RSA_runwise"
ALT_OUT_DIR="$SCRIPT_DIR/${SUBJ}.results.LEARN_RSA_runwise"

if [ -d "$OUT_DIR" ]; then
  echo "[RSA‑learn] Removing existing output dir: $OUT_DIR"
  rm -rf "$OUT_DIR"
fi
if [ -d "$ALT_OUT_DIR" ]; then
  echo "[RSA‑learn] Removing stray output dir: $ALT_OUT_DIR"
  rm -rf "$ALT_OUT_DIR"
fi

if [ -d "$OUT_DIR" ]; then
  echo "[RSA‑learn] ERROR: Output dir still exists after removal: $OUT_DIR"
  echo "[RSA‑learn] Aborting to avoid immediate afni_proc failure."
  exit 3
fi


echo "[RSA‑learn] Step 3/3: Run afni_proc (GLM) for $SUBJ"
tcsh "$RUN_TMP" |& tee "$LOG_DIR/run.${SUBJ}.log"

echo "[RSA‑learn] DONE: $SUBJ"
echo "Outputs: $RSA_DIR/derivatives/afni/IndvlLvlAnalyses/$SUBJ"
