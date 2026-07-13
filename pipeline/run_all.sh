#!/bin/bash
# =============================================================================
# run_all.sh · the whole pipeline, raw BIDS -> the three findings, in order.
# =============================================================================
# Every step is idempotent (skips finished work), so this is safe to re-run.
# Heavy step is 03 (preprocessing+GLM). Recommended run-box: CR2.
#
#   bash pipeline/run_all.sh              # everything
#   bash pipeline/run_all.sh --analysis  # skip 01-03, just re-run analyses 04-05
# =============================================================================
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
source "$HERE/config.sh"
mkdir -p "$EVENTS_FIXED" "$TIMING" "$GLMDIR" "$RESULTS" "$RSA/reports"

if [ "$1" != "--analysis" ]; then
  echo "===== 01 · fix events (raw BIDS -> canonical labels) ====="
  python3 "$HERE/01_fix_events.py" \
      --bids-dir "$BIDS" --out-dir "$EVENTS_FIXED" \
      --report "$RSA/reports/nopred_fix_report.tsv" --mode majority

  echo "===== 02 · make timing (canonical events -> run-wise .1D) ====="
  bash "$HERE/02_make_timing.sh"

  echo "===== 03 · GLM (raw BIDS -> AFNI no-blur -> feedback betas) ====="
  bash "$HERE/03_glm.sh"
fi

echo "===== 04 · Model Alignment RSA + Temporal ISC (findings #1, #2) ====="
python3 "$HERE/04_model_alignment_and_temporal_isc.py" --n-perm "$N_PERM"

echo "===== 05 · Whole-brain Schaefer-400 ISC (finding #3) ====="
python3 "$HERE/05_wholebrain_isc.py"

echo
echo "DONE. Results in: $RESULTS"
echo "Report: results/index.html (the interactive atlas + findings)"
