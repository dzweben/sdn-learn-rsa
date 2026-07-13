#!/bin/bash
# =============================================================================
# 03 · GLM  —  raw BIDS  →  AFNI preprocessing (NO blur)  →  single-subject betas
# =============================================================================
# For each subject: afni_proc.py builds + runs the pipeline
#   despike → tshift → align → tlrc (MNI152-2009, 3mm) → volreg → mask → scale → regress
# with NO spatial smoothing (unsmoothed patterns for RSA). 3dDeconvolve fits the
# run-wise, valence-split feedback design (41 regressors: FBM/FBN × peer × run,
# per-peer prediction, per-peer response, prediction→feedback anticipation).
#
#   in  : $BIDS/sub-<id>  +  $TIMING/sub-<id>  +  $SSW/sub-<id> (anatomical warps)
#   out : $GLMDIR/<id>/<id>.results.$GLM_LABEL/stats.<id>+tlrc  (the betas of record)
#   engine: pipeline/lib/_afni_proc_engine.sh  (validated raw-BIDS no-blur proc)
#
# Idempotent: skips a subject whose stats file already exists.
# Heavy step (~20-40 min/subject). Recommended run-box: CR2.
#
# Run:  bash pipeline/03_glm.sh            (all subjects)
#       bash pipeline/03_glm.sh 1055 958   (specific subjects)
# =============================================================================
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
source "$HERE/config.sh"
SUBS="${*:-$SUBJECTS}"

mkdir -p "$GLMDIR"
GENSCRIPT="$GLMDIR/.proc_gen.$GLM_LABEL.tcsh"

# 1) generate the afni_proc.py scripts for the requested subjects, with the
#    canonical GLM label and the correct timing (env override read by the engine)
sed -e "s|^set GLM = .*|set GLM = $GLM_LABEL|" \
    -e "s|^set subjects = .*|set subjects = ( $SUBS )|" \
    "$HERE/lib/_afni_proc_engine.sh" > "$GENSCRIPT"

echo "[03] generating proc scripts (GLM=$GLM_LABEL, timing=$TIMING)"
TIMING_ROOT_OVERRIDE="$TIMING" tcsh "$GENSCRIPT"

# 2) run each generated proc (skip if already fit)
for sid in $SUBS; do
  OUT="$GLMDIR/$sid/$sid.results.$GLM_LABEL"
  if [ -f "$OUT/stats.$sid+tlrc.HEAD" ]; then
    echo "[03] $sid — already fit, skipping"; continue
  fi
  echo "[03] $sid — running proc..."
  ( cd "$GLMDIR/$sid" && tcsh -xef "proc.$sid.$GLM_LABEL" > "output.proc.$sid.$GLM_LABEL" 2>&1 )
  [ -f "$OUT/stats.$sid+tlrc.HEAD" ] && echo "[03] $sid OK" || echo "[03] $sid FAILED (see output.proc.$sid.$GLM_LABEL)"
done
echo "[03] done."
