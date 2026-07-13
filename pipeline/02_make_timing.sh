#!/bin/bash
# =============================================================================
# 02 · make timing  —  fixed events  →  run-wise .1D timing files
# =============================================================================
# Turns the canonical event labels (from 01) into AFNI stim-timing files: per
# peer × run feedback (FBM/FBN), per-peer prediction & response, and the
# prediction→feedback anticipation (ISI) regressor. This is the CORRECT,
# pre-enrichment timing behind the settled results.
#
#   in  : $EVENTS_FIXED/sub-<id>/func/*_events.tsv     (canonical labels)
#   out : $TIMING/sub-<id>/*.1D                        (run-wise timing)
#   engine: pipeline/lib/_gen_timing_engine.sh         (validated generator)
#
# Run:  bash pipeline/02_make_timing.sh
# =============================================================================
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
source "$HERE/config.sh"

mkdir -p "$TIMING"
SUBJ_FILE="$TIMING/.subjects.txt"
printf '%s\n' $SUBJECTS > "$SUBJ_FILE"

echo "[02] generating timing for $N_SUBJECTS subjects"
echo "     events: $EVENTS_FIXED   ->   timing: $TIMING"

SUBJ_LIST_OVERRIDE="$SUBJ_FILE" \
BIDS_DIR_OVERRIDE="$EVENTS_FIXED" \
TIMING_ROOT_OVERRIDE="$TIMING" \
  bash "$HERE/lib/_gen_timing_engine.sh"

echo "[02] done. Example (sub-$(echo $SUBJECTS | awk '{print $1}')):"
ls "$TIMING/sub-$(echo $SUBJECTS | awk '{print $1}')" 2>/dev/null | head -6
