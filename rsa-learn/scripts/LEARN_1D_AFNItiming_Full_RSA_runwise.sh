#!/bin/bash

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA‑learn RUN‑WISE timing generator (NonPM only)
#
# This script is intentionally derived from:
#   /data/projects/STUDIES/LEARN/fMRI/code/afni/LEARN_1D_AFNItiming_Full.sh
#
# Key goal:
#   Create NON‑PARAMETRIC (onset:duration only) timing files
#   for each run and each peer×feedback condition so we can
#   estimate RUN‑WISE betas in AFNI.
#
# IMPORTANT: This script is *not* replacing the existing pipeline.
# It is a parallel RSA‑learn pipeline that matches the original
# naming conventions and event logic, but outputs run‑wise files.
#
# Author: RSA‑learn adaptation (based on Tessa Clarkson script)
# Date: 2026‑02‑08

############################################################################################
# GENERAL SETUP
############################################################################################

# **CHANGE ME**: Subject list file (one ID per line, no "sub-")
SUBJ_LIST="/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt"

# **CHECK ME**: Root directories
TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
BIDS_DIR="$TOPDIR/bids"

# **RSA‑learn output root (new)**
TIMING_ROOT="$TOPDIR/RSA-learn/TimingFiles/Full"

############################################################################################
# COPY EVENTS + BUILD NON‑PARAMETRIC RUN‑WISE TIMING FILES
############################################################################################

# For each subject...
for subj in `cat ${SUBJ_LIST}`; do
    echo "[RSA‑learn] Generating NonPM run‑wise timing files for sub-${subj}"

    # Create output folder (keep RSA‑learn timing separate)
    mkdir -p "${TIMING_ROOT}/sub-${subj}"

    # Clean any old event files so we know these are current
    rm -f "${TIMING_ROOT}/sub-${subj}/sub-${subj}_task-learn_run-0"*_events.tsv

    # Copy BIDS events into RSA‑learn timing folder (so everything is self‑contained)
    cp "${BIDS_DIR}/sub-${subj}/func/sub-${subj}_task-learn_run-01_events.tsv" "${TIMING_ROOT}/sub-${subj}/"
    cp "${BIDS_DIR}/sub-${subj}/func/sub-${subj}_task-learn_run-02_events.tsv" "${TIMING_ROOT}/sub-${subj}/"
    cp "${BIDS_DIR}/sub-${subj}/func/sub-${subj}_task-learn_run-03_events.tsv" "${TIMING_ROOT}/sub-${subj}/"
    cp "${BIDS_DIR}/sub-${subj}/func/sub-${subj}_task-learn_run-04_events.tsv" "${TIMING_ROOT}/sub-${subj}/"

    # Move into subject timing folder
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

    ############################################################
    # NON‑PARAMETRIC FEEDBACK (peer × feedback) — RUN‑WISE
    ############################################################

    # Mean_60 feedback
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run4.1D
    rm -f NonPM_Mean60_fdkm.1D
    for f in NonPM_Mean60_fdkm_run1.1D NonPM_Mean60_fdkm_run2.1D NonPM_Mean60_fdkm_run3.1D NonPM_Mean60_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Mean60_fdkm.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run4.1D
    rm -f NonPM_Mean60_fdkn.1D
    for f in NonPM_Mean60_fdkn_run1.1D NonPM_Mean60_fdkn_run2.1D NonPM_Mean60_fdkn_run3.1D NonPM_Mean60_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Mean60_fdkn.1D; done

    # Mean80 feedback
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run4.1D
    rm -f NonPM_Mean80_fdkm.1D
    for f in NonPM_Mean80_fdkm_run1.1D NonPM_Mean80_fdkm_run2.1D NonPM_Mean80_fdkm_run3.1D NonPM_Mean80_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Mean80_fdkm.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run4.1D
    rm -f NonPM_Mean80_fdkn.1D
    for f in NonPM_Mean80_fdkn_run1.1D NonPM_Mean80_fdkn_run2.1D NonPM_Mean80_fdkn_run3.1D NonPM_Mean80_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Mean80_fdkn.1D; done

    # Nice_60 feedback
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run4.1D
    rm -f NonPM_Nice60_fdkm.1D
    for f in NonPM_Nice60_fdkm_run1.1D NonPM_Nice60_fdkm_run2.1D NonPM_Nice60_fdkm_run3.1D NonPM_Nice60_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Nice60_fdkm.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run4.1D
    rm -f NonPM_Nice60_fdkn.1D
    for f in NonPM_Nice60_fdkn_run1.1D NonPM_Nice60_fdkn_run2.1D NonPM_Nice60_fdkn_run3.1D NonPM_Nice60_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Nice60_fdkn.1D; done

    # Nice80 feedback
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run4.1D
    rm -f NonPM_Nice80_fdkm.1D
    for f in NonPM_Nice80_fdkm_run1.1D NonPM_Nice80_fdkm_run2.1D NonPM_Nice80_fdkm_run3.1D NonPM_Nice80_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Nice80_fdkm.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run4.1D
    rm -f NonPM_Nice80_fdkn.1D
    for f in NonPM_Nice80_fdkn_run1.1D NonPM_Nice80_fdkn_run2.1D NonPM_Nice80_fdkn_run3.1D NonPM_Nice80_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Nice80_fdkn.1D; done

    ############################################################
    # NON‑PARAMETRIC PREDICTION + RESPONSE (RUN‑WISE)
    ############################################################

    # Mean_60 prediction/response
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_pred") {printf "%s:%s ", $1, $2}}' > Mean60_pred_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_pred") {printf "%s:%s ", $1, $2}}' > Mean60_pred_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_pred") {printf "%s:%s ", $1, $2}}' > Mean60_pred_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_pred") {printf "%s:%s ", $1, $2}}' > Mean60_pred_run4.1D
    rm -f Mean60_pred.1D
    for f in Mean60_pred_run1.1D Mean60_pred_run2.1D Mean60_pred_run3.1D Mean60_pred_run4.1D; do (cat $f; echo '') >> Mean60_pred.1D; done

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
    # PAD RUN‑WISE NonPM FILES TO 4 ROWS (AFNI MULTI‑RUN)
    ############################################################
    # AFNI expects one row per run for multi‑run datasets.
    # Each run‑wise file currently has 1 row. Pad to 4 rows
    # using '*' for non‑target runs.

    for f in NonPM_*_run*.1D; do
        run=$(echo "$f" | sed -E 's/.*_run([1-4])\.1D/\1/')
        line=$(tr -d '
' < "$f")
        if [ -z "$line" ]; then
            line="*"
        fi
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

done
