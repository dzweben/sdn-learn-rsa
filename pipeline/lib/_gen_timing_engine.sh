#!/bin/bash

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA-learn RUN-WISE timing generator (NonPM + Anticipation between prediction->feedback)
#
# This script is intentionally derived from:
#   /data/projects/STUDIES/LEARN/fMRI/code/afni/LEARN_1D_AFNItiming_Full.sh
#
# Key goal:
#   Create NON-PARAMETRIC (onset:duration only) timing files
#   for each run and each peer×feedback condition so we can
#   estimate RUN-WISE betas in AFNI.
#
#   NEW (Anticipation):
#   - Adds an explicit regressor for the interval between
#     prediction and feedback, using the "isi" events in BIDS.
#
# IMPORTANT: This script is *not* replacing the existing pipeline.
# It is a parallel RSA-learn pipeline that matches the original
# naming conventions and event logic, but outputs run-wise files.
#
# Author: RSA-learn adaptation (based on Tessa Clarkson script)
# Date: 2026-02-08
#
# ============================================================================
# ORIENTATION FOR A NEW LAB MEMBER - WHAT THIS FILE PRODUCES AND WHY
# ============================================================================
# The end product is a directory of AFNI ".1D" timing files, one file per
# experimental regressor. AFNI's 3dDeconvolve reads these to know WHEN each
# event happened so it can build the design matrix for the GLM.
#
# The critical format concept is "onset:duration" (a.k.a. "married" or
# non-parametric-modulated timing, hence the "NonPM" prefix on the feedback
# files). Each entry is two numbers glued by a colon:
#       ONSET:DURATION
# where ONSET is the event start time (seconds, relative to the start of that
# run) and DURATION is how long the event lasted (seconds). When AFNI is told
# a stimulus uses a duration-modulated basis function (e.g. dmUBLOCK), it
# convolves a boxcar of exactly that DURATION with the HRF. This lets each
# trial have its own length instead of assuming a fixed impulse.
#
# The design of the RUN-WISE files is the whole point of this script:
#   - For a MULTI-RUN AFNI dataset, a timing file must have exactly ONE ROW
#     PER RUN. Row 1 = run 1's onsets, row 2 = run 2's, etc.
#   - A run that has NO events of a given type is marked with a single "*"
#     placeholder on its row (AFNI's "this run has nothing for this regressor"
#     token). Two consecutive "*" ("* *") would mean "no events but still fit"
#     - here a lone "*" is used for an empty run.
#   - "Run-wise betas" means we want a SEPARATE beta for the same condition in
#     each run (so RSA can compare representations across runs). We achieve
#     that by making 4 files per condition - Mean60_fdkm_run1.1D ... _run4.1D -
#     where each file carries that condition's events on ONLY its own run's row
#     and "*" on the other three rows. AFNI then treats each _runN file as an
#     independent regressor, yielding one beta per run.
#
# So each condition here is emitted TWICE, in two shapes:
#   1. A concatenated "<cond>.1D" (all 4 runs stacked, one row each) - the
#      classic across-run regressor, kept for compatibility.
#   2. Four "<cond>_runN.1D" files, each later padded to 4 rows so exactly one
#      row is populated - the run-wise regressors that drive RSA.
# ============================================================================

############################################################################################
# GENERAL SETUP
############################################################################################

# **CHANGE ME**: Subject list file (one ID per line, no "sub-")
# Each line is a bare numeric subject ID (e.g. "1028"); the "sub-" prefix is
# added in code below. The `${VAR:-default}` form lets the caller override the
# path via an environment variable, otherwise falls back to the server default.
SUBJ_LIST="${SUBJ_LIST_OVERRIDE:-/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt}"

# **CHECK ME**: Root directories
# Top of the study tree on the HPC cluster; everything else hangs off this.
TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
# Input BIDS events live here. `bids_fixed` = events after Stage-1 relabeling
# (missed-prediction feedback events corrected to canonical condition labels).
# Overridable so the same engine can point at any events tree.
BIDS_DIR="${BIDS_DIR_OVERRIDE:-$TOPDIR/RSA-learn/bids_fixed}"

# **RSA-learn output root (new)**
# Where the generated .1D timing files are written. Kept separate from the
# original pipeline's timing so the run-wise variant never clobbers it.
TIMING_ROOT="${TIMING_ROOT_OVERRIDE:-$TOPDIR/RSA-learn/TimingFiles/Fixed2}"

############################################################################################
# COPY EVENTS + BUILD NON-PARAMETRIC RUN-WISE TIMING FILES
############################################################################################

# For each subject...
# Word-split the subject list file on whitespace/newlines; `subj` is one bare ID.
for subj in `cat ${SUBJ_LIST}`; do
    echo "[RSA-learn] Generating NonPM run-wise timing files for sub-${subj}"

    # Create output folder (keep RSA-learn timing separate)
    # -p: make parents as needed and don't error if it already exists (idempotent).
    mkdir -p "${TIMING_ROOT}/sub-${subj}"

    # Clean any old event files so we know these are current
    # Removes any previously copied per-run events.tsv (glob on run-0*), so a
    # re-run can't leave stale inputs lying around. -f: don't complain if none.
    rm -f "${TIMING_ROOT}/sub-${subj}/sub-${subj}_task-learn_run-0"*_events.tsv

    # Copy BIDS events into RSA-learn timing folder (so everything is self-contained)
    # Pull the 4 run event tables next to the outputs; downstream awk reads these
    # local copies (see `cd` below) rather than reaching back into BIDS_DIR.
    cp "${BIDS_DIR}/sub-${subj}/func/sub-${subj}_task-learn_run-01_events.tsv" "${TIMING_ROOT}/sub-${subj}/"
    cp "${BIDS_DIR}/sub-${subj}/func/sub-${subj}_task-learn_run-02_events.tsv" "${TIMING_ROOT}/sub-${subj}/"
    cp "${BIDS_DIR}/sub-${subj}/func/sub-${subj}_task-learn_run-03_events.tsv" "${TIMING_ROOT}/sub-${subj}/"
    cp "${BIDS_DIR}/sub-${subj}/func/sub-${subj}_task-learn_run-04_events.tsv" "${TIMING_ROOT}/sub-${subj}/"

    # Move into subject timing folder
    # All subsequent relative filenames (both reads and writes) resolve here.
    cd "${TIMING_ROOT}/sub-${subj}/"

    ############################################################
    # NOTE ON NAMING
    ############################################################
    # Event names in events.tsv use:
    #   Mean_60_* and Nice_60_*   (underscore)
    #   Mean80_*  and Nice80_*    (no underscore)
    # We preserve the existing naming convention for files:
    #   Mean60_*, Mean80_*, Nice60_*, Nice80_*
    ############################################################
    # WHY THIS MATTERS: the awk `$3==` string on each line must match the
    # exact spelling used in the events.tsv "trial_type" column, INCLUDING the
    # inconsistent underscore. So the source-label ("Mean_60_fdkm") differs
    # from the output-file token ("Mean60"). Don't "fix" one without the other.

    ############################################################
    # NON-PARAMETRIC FEEDBACK (peer × feedback) - RUN-WISE
    ############################################################
    # DESIGN OF THE FEEDBACK REGRESSORS:
    #   "peer" is the reputation×probability identity of the on-screen face,
    #   encoded here by the four condition stems Mean60 / Mean80 / Nice60 /
    #   Nice80 (each is one of the four peers the subject learns about).
    #   "valence" is the feedback actually delivered on that trial:
    #       fdkm = feedback MEAN  (negative feedback received)
    #       fdkn = feedback NICE  (positive feedback received)
    #   So we split each peer into two regressors (..._fdkm and ..._fdkn) = the
    #   peer × valence cells that RSA compares. Estimating these separately per
    #   run is what lets us later build a neural RDM across peers.
    #
    # HOW THE awk WORKS (same idiom on every line below):
    #   Column layout of a BIDS events.tsv row is tab/space separated:
    #       $1 = onset (s)   $2 = duration (s)   $3 = trial_type   (...more...)
    #   `if ($3=="LABEL")` keeps only rows whose trial_type equals this cell.
    #   `printf "%s:%s ", $1, $2` emits ONSET:DURATION followed by a space, so
    #   all matching events for the run land on ONE space-separated line - the
    #   AFNI onset:duration row for that run. The header row (which has a
    #   non-matching $3) is naturally skipped by the equality test.

    # Mean_60 feedback
    # One awk per physical run file -> four single-row _runN.1D files, each
    # containing only run N's Mean60 MEAN-feedback (fdkm) onsets:durations.
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run4.1D
    # Fresh start for the concatenated (all-runs) file so appends below are clean.
    rm -f NonPM_Mean60_fdkm.1D
    # Stack the 4 run files into one multi-run file, ONE ROW PER RUN. The
    # subshell `(cat $f; echo '')` prints the run's onsets then a newline, so
    # each run occupies its own line even when empty (yielding a blank row).
    for f in NonPM_Mean60_fdkm_run1.1D NonPM_Mean60_fdkm_run2.1D NonPM_Mean60_fdkm_run3.1D NonPM_Mean60_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Mean60_fdkm.1D; done

    # Same peer (Mean60) but NICE feedback received (fdkn) - the other valence cell.
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run4.1D
    rm -f NonPM_Mean60_fdkn.1D
    for f in NonPM_Mean60_fdkn_run1.1D NonPM_Mean60_fdkn_run2.1D NonPM_Mean60_fdkn_run3.1D NonPM_Mean60_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Mean60_fdkn.1D; done

    # Mean80 feedback
    # Peer Mean80 (note: no underscore in the source label "Mean80_fdkm"),
    # MEAN feedback received. Identical run-wise pattern as above.
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run4.1D
    rm -f NonPM_Mean80_fdkm.1D
    for f in NonPM_Mean80_fdkm_run1.1D NonPM_Mean80_fdkm_run2.1D NonPM_Mean80_fdkm_run3.1D NonPM_Mean80_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Mean80_fdkm.1D; done

    # Peer Mean80, NICE feedback received.
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run4.1D
    rm -f NonPM_Mean80_fdkn.1D
    for f in NonPM_Mean80_fdkn_run1.1D NonPM_Mean80_fdkn_run2.1D NonPM_Mean80_fdkn_run3.1D NonPM_Mean80_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Mean80_fdkn.1D; done

    # Nice_60 feedback
    # Peer Nice60 (underscore in source label "Nice_60_fdkm"), MEAN feedback received.
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run4.1D
    rm -f NonPM_Nice60_fdkm.1D
    for f in NonPM_Nice60_fdkm_run1.1D NonPM_Nice60_fdkm_run2.1D NonPM_Nice60_fdkm_run3.1D NonPM_Nice60_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Nice60_fdkm.1D; done

    # Peer Nice60, NICE feedback received.
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run4.1D
    rm -f NonPM_Nice60_fdkn.1D
    for f in NonPM_Nice60_fdkn_run1.1D NonPM_Nice60_fdkn_run2.1D NonPM_Nice60_fdkn_run3.1D NonPM_Nice60_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Nice60_fdkn.1D; done

    # Nice80 feedback
    # Peer Nice80 (no underscore in source label), MEAN feedback received.
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run4.1D
    rm -f NonPM_Nice80_fdkm.1D
    for f in NonPM_Nice80_fdkm_run1.1D NonPM_Nice80_fdkm_run2.1D NonPM_Nice80_fdkm_run3.1D NonPM_Nice80_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Nice80_fdkm.1D; done

    # Peer Nice80, NICE feedback received.
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run4.1D
    rm -f NonPM_Nice80_fdkn.1D
    for f in NonPM_Nice80_fdkn_run1.1D NonPM_Nice80_fdkn_run2.1D NonPM_Nice80_fdkn_run3.1D NonPM_Nice80_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Nice80_fdkn.1D; done

    ############################################################
    # NON-PARAMETRIC PREDICTION + RESPONSE (RUN-WISE)
    ############################################################
    # These regressors model the EARLIER phases of each trial, per peer:
    #   *_pred = the prediction phase (subject predicts how the peer will rate them)
    #   *_rsp  = the response/button-press phase
    # They are NOT the RSA target (feedback is), but they must be modeled so
    # their variance is captured and doesn't leak into the feedback betas.
    # Same awk onset:duration extraction + run-wise splitting as the feedback block;
    # note these outputs have NO "NonPM_" prefix (naming inherited from the original).

    # Mean_60 prediction/response
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_pred") {printf "%s:%s ", $1, $2}}' > Mean60_pred_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_pred") {printf "%s:%s ", $1, $2}}' > Mean60_pred_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_pred") {printf "%s:%s ", $1, $2}}' > Mean60_pred_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_pred") {printf "%s:%s ", $1, $2}}' > Mean60_pred_run4.1D
    rm -f Mean60_pred.1D
    for f in Mean60_pred_run1.1D Mean60_pred_run2.1D Mean60_pred_run3.1D Mean60_pred_run4.1D; do (cat $f; echo '') >> Mean60_pred.1D; done

    # Mean60 response phase (button press).
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_rsp") {printf "%s:%s ", $1, $2}}' > Mean60_rsp_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_rsp") {printf "%s:%s ", $1, $2}}' > Mean60_rsp_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_rsp") {printf "%s:%s ", $1, $2}}' > Mean60_rsp_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_rsp") {printf "%s:%s ", $1, $2}}' > Mean60_rsp_run4.1D
    rm -f Mean60_rsp.1D
    for f in Mean60_rsp_run1.1D Mean60_rsp_run2.1D Mean60_rsp_run3.1D Mean60_rsp_run4.1D; do (cat $f; echo '') >> Mean60_rsp.1D; done

    # Mean80 prediction/response
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_pred") {printf "%s:%s ", $1, $2}}' > Mean80_pred_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_pred") {printf "%s:%s ", $1, $2}}' > Mean80_pred_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_pred") {printf "%s:%s ", $1, $2}}' > Mean80_pred_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_pred") {printf "%s:%s ", $1, $2}}' > Mean80_pred_run4.1D
    rm -f Mean80_pred.1D
    for f in Mean80_pred_run1.1D Mean80_pred_run2.1D Mean80_pred_run3.1D Mean80_pred_run4.1D; do (cat $f; echo '') >> Mean80_pred.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_rsp") {printf "%s:%s ", $1, $2}}' > Mean80_rsp_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_rsp") {printf "%s:%s ", $1, $2}}' > Mean80_rsp_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_rsp") {printf "%s:%s ", $1, $2}}' > Mean80_rsp_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_rsp") {printf "%s:%s ", $1, $2}}' > Mean80_rsp_run4.1D
    rm -f Mean80_rsp.1D
    for f in Mean80_rsp_run1.1D Mean80_rsp_run2.1D Mean80_rsp_run3.1D Mean80_rsp_run4.1D; do (cat $f; echo '') >> Mean80_rsp.1D; done

    # Nice_60 prediction/response
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_pred") {printf "%s:%s ", $1, $2}}' > Nice60_pred_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_pred") {printf "%s:%s ", $1, $2}}' > Nice60_pred_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_pred") {printf "%s:%s ", $1, $2}}' > Nice60_pred_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_pred") {printf "%s:%s ", $1, $2}}' > Nice60_pred_run4.1D
    rm -f Nice60_pred.1D
    for f in Nice60_pred_run1.1D Nice60_pred_run2.1D Nice60_pred_run3.1D Nice60_pred_run4.1D; do (cat $f; echo '') >> Nice60_pred.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_rsp") {printf "%s:%s ", $1, $2}}' > Nice60_rsp_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_rsp") {printf "%s:%s ", $1, $2}}' > Nice60_rsp_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_rsp") {printf "%s:%s ", $1, $2}}' > Nice60_rsp_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_rsp") {printf "%s:%s ", $1, $2}}' > Nice60_rsp_run4.1D
    rm -f Nice60_rsp.1D
    for f in Nice60_rsp_run1.1D Nice60_rsp_run2.1D Nice60_rsp_run3.1D Nice60_rsp_run4.1D; do (cat $f; echo '') >> Nice60_rsp.1D; done

    # Nice80 prediction/response
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_pred") {printf "%s:%s ", $1, $2}}' > Nice80_pred_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_pred") {printf "%s:%s ", $1, $2}}' > Nice80_pred_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_pred") {printf "%s:%s ", $1, $2}}' > Nice80_pred_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_pred") {printf "%s:%s ", $1, $2}}' > Nice80_pred_run4.1D
    rm -f Nice80_pred.1D
    for f in Nice80_pred_run1.1D Nice80_pred_run2.1D Nice80_pred_run3.1D Nice80_pred_run4.1D; do (cat $f; echo '') >> Nice80_pred.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_rsp") {printf "%s:%s ", $1, $2}}' > Nice80_rsp_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_rsp") {printf "%s:%s ", $1, $2}}' > Nice80_rsp_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_rsp") {printf "%s:%s ", $1, $2}}' > Nice80_rsp_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_rsp") {printf "%s:%s ", $1, $2}}' > Nice80_rsp_run4.1D
    rm -f Nice80_rsp.1D
    for f in Nice80_rsp_run1.1D Nice80_rsp_run2.1D Nice80_rsp_run3.1D Nice80_rsp_run4.1D; do (cat $f; echo '') >> Nice80_rsp.1D; done

    ############################################################
    # Anticipation: PREDICTION -> FEEDBACK (RUN-WISE + MULTI-RUN)
    ############################################################
    # THE ANTICIPATION REGRESSOR - why it exists and how it's built:
    #   Between the subject's prediction and the delivery of feedback there is a
    #   jittered inter-stimulus interval, logged in BIDS as trial_type "isi".
    #   During this window the subject is ANTICIPATING the peer's evaluation.
    #   If left unmodeled, anticipation-related BOLD would smear into the
    #   adjacent feedback estimate and bias the RSA patterns. So we pull the
    #   "isi" onsets:durations into their own explicit regressor, exactly like
    #   the events above (single awk per run, ONSET:DURATION via $1:$2), which
    #   soaks up that anticipatory variance and keeps the feedback betas clean.
    #   One regressor collapses across all peers/valences - we only need to
    #   partial it out, not to compare it in RSA.

    # Event name in BIDS: "isi"
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="isi") {printf "%s:%s ", $1, $2}}' > Anticipation_pred_fdk_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="isi") {printf "%s:%s ", $1, $2}}' > Anticipation_pred_fdk_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="isi") {printf "%s:%s ", $1, $2}}' > Anticipation_pred_fdk_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="isi") {printf "%s:%s ", $1, $2}}' > Anticipation_pred_fdk_run4.1D
    rm -f Anticipation_pred_fdk.1D
    # Concatenate to a 4-row multi-run anticipation file, one row per run.
    for f in Anticipation_pred_fdk_run1.1D Anticipation_pred_fdk_run2.1D Anticipation_pred_fdk_run3.1D Anticipation_pred_fdk_run4.1D; do (cat $f; echo '') >> Anticipation_pred_fdk.1D; done


    ############################################################
    # PAD RUN-WISE NonPM FILES TO 4 ROWS (AFNI MULTI-RUN)
    ############################################################
    # AFNI expects one row per run for multi-run datasets.
    # Each run-wise file currently has 1 row. Pad to 4 rows
    # using '*' for non-target runs.
    #
    # RECAP OF WHY: at this point each *_runN.1D holds a single line - that
    # run's onsets:durations. But a run-wise regressor must still be a valid
    # multi-run file with 4 rows so it aligns with the 4-run dataset. We put
    # the real onsets on row N and a lone "*" (empty-run placeholder) on the
    # other three rows. That makes _run1's events fire only in run 1, etc.,
    # so 3dDeconvolve fits an INDEPENDENT beta per run -> the run-wise betas RSA
    # needs. (The prediction/response *_runN.1D files are intentionally NOT
    # padded here - the glob below only targets NonPM_* and Anticipation_*.)

    # Loop over every run-wise feedback and anticipation file just written.
    for f in NonPM_*_run*.1D Anticipation_*_run*.1D; do
        # Skip gracefully if a glob matched nothing (literal pattern, no file).
        [ -e "$f" ] || continue
        # Recover which run this file is for by capturing the digit in "_runN.1D".
        # sed -E (extended regex): replace the whole name with just the 1-4 group.
        run=$(echo "$f" | sed -E 's/.*_run([1-4])\.1D/\1/')
        # Read the file's content, stripping newlines with `tr -d '\n'` (the
        # literal newline inside the quotes) so `line` is the single onset:dur row.
        line=$(tr -d '
' < "$f")
        # If this run had no events, awk produced an empty file -> use "*"
        # so the row is the empty-run placeholder rather than a blank line.
        if [ -z "$line" ]; then
            line="*"
        fi
        # Rewrite the file as exactly 4 lines. Each printf format string below
        # contains literal newlines: the real "%s" (this run's onsets) goes on
        # row `run`, and "*" fills the other three rows. This is the 4-row,
        # one-populated-row layout AFNI reads as "events only in run N".
        case "$run" in
            1) printf "%s
*
*
*
" "$line" > "$f" ;;
            2) printf "*
%s
*
*
" "$line" > "$f" ;;
            3) printf "*
*
%s
*
" "$line" > "$f" ;;
            4) printf "*
*
*
%s
" "$line" > "$f" ;;
        esac
    done

# End of per-subject loop; continue to the next subject ID.
done
