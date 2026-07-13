#!/bin/bash
# =============================================================================
# RSA-Learn · pipeline/config.sh — single source of truth for the whole pipeline
# =============================================================================
# Every pipeline script sources this. Change a path or the subject list HERE and
# nowhere else. Runs on either Temple cluster (paths are identical on both).
#
#   repo of record   : CR1 (cla19097 / 155.247.67.31) — parent LEARN study lives here
#   recommended run-box : CR2 (155.247.66.164) — more free cores, less contention
# =============================================================================

# --- roots -------------------------------------------------------------------
export TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
export RSA="$TOPDIR/RSA-learn"
export BIDS="$TOPDIR/bids"                        # raw BIDS (never modified)
export SSW="$TOPDIR/derivatives/afni/ssw"         # SSW anatomical warps (per subject)

# --- pipeline outputs (all under RSA-learn) ----------------------------------
export EVENTS_FIXED="$RSA/events_fixed"           # 01 output: canonical event labels
export TIMING="$RSA/timing"                       # 02 output: run-wise .1D timing files
export GLMDIR="$RSA/derivatives/afni/IndvlLvlAnalyses"  # 03 output: per-subject GLM dirs
export RESULTS="$RSA/derivatives/afni/results"    # 04-06 output: analysis result JSONs

# --- the ONE canonical GLM label (self-documenting; no version cruft) --------
export GLM_LABEL="feedback_runwise_glm"

# --- analysis constants ------------------------------------------------------
export MEASURE="scared_ch_social"                 # dimensional social-anxiety score
export CLINICAL="$RSA/analysis/learn_clinical.csv"
export GROUP_MASK="$TOPDIR/Masks/LEARN_Grp90+tlrc.HEAD"
export N_PERM=10000
export AFNI_BIN="/usr/local/abin"
export PATH="$AFNI_BIN:$PATH"

# --- the 33-subject analytic sample (Usable_fMRI == 1) -----------------------
# deterministic; regenerate from CLINICAL if the cohort ever changes.
export SUBJECTS="958 1055 1158 1172 1196 1215 1267 1284 1290 1308 1310 1313 1318 1325 1343 1346 1348 1367 1369 1375 1380 1413 1424 1441 1452 1469 1477 1479 1505 1513 1522 1527 1534"
export N_SUBJECTS=33
