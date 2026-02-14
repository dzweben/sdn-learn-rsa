#!/bin/tcsh

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA‑learn RUN‑WISE afni_proc generator (AFNI raw‑BIDS, NO smoothing)
#
# This script adapts the lab’s AFNI preprocessing pipeline to RSA run‑wise
# betas using raw BIDS inputs (not fMRIPrep). It removes the blur block to
# keep patterns unsmoothed for RSA.
#
# Author: RSA‑learn adaptation
# Date: 2026‑02‑14

############################################################################################
# GENERAL SETUP
############################################################################################

# **CHANGE ME**: Specify subject numbers in a single row. Do not include the sub- prefix
set subjects = ( 958 1158 1267 1380 )

# **CHECK ME**: GLM name (used for outputs)
set GLM = LEARN_RSA_runwise_AFNI

# **CHECK ME**: motion censor threshold (matches lab AFNI pipeline)
set motion_max = 1

# **CHECK ME**: Number of jobs for 3dDeconvolve
set jobs = 30

############################################################################################
# LOCATIONS
############################################################################################

set topdir = /data/projects/STUDIES/LEARN/fMRI

# Raw BIDS inputs
set subjbids = $topdir/bids

# RSA‑learn timing files (run‑wise NonPM)
set subjecttiming = $topdir/RSA-learn/TimingFiles/Full

# RSA‑learn output root
set results = $topdir/RSA-learn/derivatives/afni/IndvlLvlAnalyses

# AFNI SSW anatomy outputs
set anat_dir = $topdir/derivatives/afni/ssw

# Optional overrides
if ( $?BIDS_DIR_OVERRIDE ) set subjbids = $BIDS_DIR_OVERRIDE
if ( $?TIMING_ROOT_OVERRIDE ) set subjecttiming = $TIMING_ROOT_OVERRIDE

############################################################################################
# BEGIN
############################################################################################

cd $results

foreach subj ( $subjects )

    mkdir -p $subj
    cd $subj

    set subj_dir = $subjbids/sub-$subj
    set stimdir = $subjecttiming/sub-$subj

    afni_proc.py -subj_id $subj \
        -dsets \
            $subj_dir/func/sub-${subj}_task-learn_run-01_bold.nii.gz \
            $subj_dir/func/sub-${subj}_task-learn_run-02_bold.nii.gz \
            $subj_dir/func/sub-${subj}_task-learn_run-03_bold.nii.gz \
            $subj_dir/func/sub-${subj}_task-learn_run-04_bold.nii.gz \
        -scr_overwrite \
        -script $results/$subj/proc.$subj.$GLM \
        -out_dir $subj.results.$GLM \
        -blocks despike tshift align tlrc volreg mask scale regress \
        -copy_anat $anat_dir/sub-${subj}/anatSS.$subj.nii \
        -anat_has_skull no \
        -anat_follower anat_w_skull anat $anat_dir/sub-${subj}/anatU.$subj.nii \
        -mask_epi_anat yes \
        -tlrc_base MNI152_2009_template_SSW.nii.gz \
        -tshift_align_to -tzero 0 \
        -align_opts_aea \
            -giant_move \
            -cost lpc+ZZ \
            -AddEdge \
            -anat_uniform_method unifize \
        -tlrc_NL_warped_dsets \
            $anat_dir/sub-${subj}/anatQQ.${subj}.nii \
            $anat_dir/sub-${subj}/anatQQ.${subj}.aff12.1D \
            $anat_dir/sub-${subj}/anatQQ.${subj}_WARP.nii \
        -volreg_align_to MIN_OUTLIER \
        -volreg_align_e2a \
        -volreg_tlrc_warp \
        -mask_dilate 1 \
        -scale_max_val 200 \
        -regress_censor_outliers 0.1 \
        -regress_motion_per_run \
        -regress_censor_motion $motion_max \
        -regress_est_blur_epits \
        -regress_est_blur_errts \
        -regress_run_clustsim yes \
        -html_review_style pythonic \
        -test_stim_files no \
        -regress_stim_times \
        $stimdir/NonPM_Mean60_fdkm_run1.1D \
        $stimdir/NonPM_Mean60_fdkn_run1.1D \
        $stimdir/NonPM_Mean80_fdkm_run1.1D \
        $stimdir/NonPM_Mean80_fdkn_run1.1D \
        $stimdir/NonPM_Nice60_fdkm_run1.1D \
        $stimdir/NonPM_Nice60_fdkn_run1.1D \
        $stimdir/NonPM_Nice80_fdkm_run1.1D \
        $stimdir/NonPM_Nice80_fdkn_run1.1D \
        $stimdir/NonPM_Mean60_fdkm_run2.1D \
        $stimdir/NonPM_Mean60_fdkn_run2.1D \
        $stimdir/NonPM_Mean80_fdkm_run2.1D \
        $stimdir/NonPM_Mean80_fdkn_run2.1D \
        $stimdir/NonPM_Nice60_fdkm_run2.1D \
        $stimdir/NonPM_Nice60_fdkn_run2.1D \
        $stimdir/NonPM_Nice80_fdkm_run2.1D \
        $stimdir/NonPM_Nice80_fdkn_run2.1D \
        $stimdir/NonPM_Mean60_fdkm_run3.1D \
        $stimdir/NonPM_Mean60_fdkn_run3.1D \
        $stimdir/NonPM_Mean80_fdkm_run3.1D \
        $stimdir/NonPM_Mean80_fdkn_run3.1D \
        $stimdir/NonPM_Nice60_fdkm_run3.1D \
        $stimdir/NonPM_Nice60_fdkn_run3.1D \
        $stimdir/NonPM_Nice80_fdkm_run3.1D \
        $stimdir/NonPM_Nice80_fdkn_run3.1D \
        $stimdir/NonPM_Mean60_fdkm_run4.1D \
        $stimdir/NonPM_Mean60_fdkn_run4.1D \
        $stimdir/NonPM_Mean80_fdkm_run4.1D \
        $stimdir/NonPM_Mean80_fdkn_run4.1D \
        $stimdir/NonPM_Nice60_fdkm_run4.1D \
        $stimdir/NonPM_Nice60_fdkn_run4.1D \
        $stimdir/NonPM_Nice80_fdkm_run4.1D \
        $stimdir/NonPM_Nice80_fdkn_run4.1D \
        $stimdir/Mean60_pred.1D \
        $stimdir/Mean60_rsp.1D \
        $stimdir/Mean80_pred.1D \
        $stimdir/Mean80_rsp.1D \
        $stimdir/Nice60_pred.1D \
        $stimdir/Nice60_rsp.1D \
        $stimdir/Nice80_pred.1D \
        $stimdir/Nice80_rsp.1D \
        -regress_stim_labels \
        FBM.Mean60.r1 \
        FBN.Mean60.r1 \
        FBM.Mean80.r1 \
        FBN.Mean80.r1 \
        FBM.Nice60.r1 \
        FBN.Nice60.r1 \
        FBM.Nice80.r1 \
        FBN.Nice80.r1 \
        FBM.Mean60.r2 \
        FBN.Mean60.r2 \
        FBM.Mean80.r2 \
        FBN.Mean80.r2 \
        FBM.Nice60.r2 \
        FBN.Nice60.r2 \
        FBM.Nice80.r2 \
        FBN.Nice80.r2 \
        FBM.Mean60.r3 \
        FBN.Mean60.r3 \
        FBM.Mean80.r3 \
        FBN.Mean80.r3 \
        FBM.Nice60.r3 \
        FBN.Nice60.r3 \
        FBM.Nice80.r3 \
        FBN.Nice80.r3 \
        FBM.Mean60.r4 \
        FBN.Mean60.r4 \
        FBM.Mean80.r4 \
        FBN.Mean80.r4 \
        FBM.Nice60.r4 \
        FBN.Nice60.r4 \
        FBM.Nice80.r4 \
        FBN.Nice80.r4 \
        Pred.Mean60 \
        Resp.Mean60 \
        Pred.Mean80 \
        Resp.Mean80 \
        Pred.Nice60 \
        Resp.Nice60 \
        Pred.Nice80 \
        Resp.Nice80 \
        -regress_stim_types \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        -regress_basis_multi \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        -regress_make_ideal_sum IDEAL_sum.1D \
        -regress_opts_3dD \
            -local_times \
            -num_glt 45 \
        -gltsym 'SYM: +FBM.Mean60.r1 +FBN.Mean60.r1 +FBM.Mean80.r1 +FBN.Mean80.r1 +FBM.Nice60.r1 +FBN.Nice60.r1 +FBM.Nice80.r1 +FBN.Nice80.r1 +FBM.Mean60.r2 +FBN.Mean60.r2 +FBM.Mean80.r2 +FBN.Mean80.r2 +FBM.Nice60.r2 +FBN.Nice60.r2 +FBM.Nice80.r2 +FBN.Nice80.r2 +FBM.Mean60.r3 +FBN.Mean60.r3 +FBM.Mean80.r3 +FBN.Mean80.r3 +FBM.Nice60.r3 +FBN.Nice60.r3 +FBM.Nice80.r3 +FBN.Nice80.r3 +FBM.Mean60.r4 +FBN.Mean60.r4 +FBM.Mean80.r4 +FBN.Mean80.r4 +FBM.Nice60.r4 +FBN.Nice60.r4 +FBM.Nice80.r4 +FBN.Nice80.r4 +Pred.Mean60 +Resp.Mean60 +Pred.Mean80 +Resp.Mean80 +Pred.Nice60 +Resp.Nice60 +Pred.Nice80 +Resp.Nice80' -glt_label 1 Task.V.BL \
        -gltsym 'SYM: +Pred.Mean60 +Pred.Mean80 +Pred.Nice60 +Pred.Nice80' -glt_label 2 Prediction.V.BL \
        -gltsym 'SYM: +Pred.Mean60 +Pred.Mean80 -Pred.Nice60 -Pred.Nice80' -glt_label 3 Prediction.Mean.V.Nice \
        -gltsym 'SYM: +FBM.Mean60.r1 +FBN.Mean60.r1 +FBM.Mean80.r1 +FBN.Mean80.r1 +FBM.Nice60.r1 +FBN.Nice60.r1 +FBM.Nice80.r1 +FBN.Nice80.r1 +FBM.Mean60.r2 +FBN.Mean60.r2 +FBM.Mean80.r2 +FBN.Mean80.r2 +FBM.Nice60.r2 +FBN.Nice60.r2 +FBM.Nice80.r2 +FBN.Nice80.r2 +FBM.Mean60.r3 +FBN.Mean60.r3 +FBM.Mean80.r3 +FBN.Mean80.r3 +FBM.Nice60.r3 +FBN.Nice60.r3 +FBM.Nice80.r3 +FBN.Nice80.r3 +FBM.Mean60.r4 +FBN.Mean60.r4 +FBM.Mean80.r4 +FBN.Mean80.r4 +FBM.Nice60.r4 +FBN.Nice60.r4 +FBM.Nice80.r4 +FBN.Nice80.r4' -glt_label 4 FB.V.BL \
        -gltsym 'SYM: +FBM.Mean60.r1 +FBM.Mean80.r1 +FBM.Nice60.r1 +FBM.Nice80.r1 +FBM.Mean60.r2 +FBM.Mean80.r2 +FBM.Nice60.r2 +FBM.Nice80.r2 +FBM.Mean60.r3 +FBM.Mean80.r3 +FBM.Nice60.r3 +FBM.Nice80.r3 +FBM.Mean60.r4 +FBM.Mean80.r4 +FBM.Nice60.r4 +FBM.Nice80.r4' -glt_label 5 FBM.V.BL \
        -gltsym 'SYM: +FBN.Mean60.r1 +FBN.Mean80.r1 +FBN.Nice60.r1 +FBN.Nice80.r1 +FBN.Mean60.r2 +FBN.Mean80.r2 +FBN.Nice60.r2 +FBN.Nice80.r2 +FBN.Mean60.r3 +FBN.Mean80.r3 +FBN.Nice60.r3 +FBN.Nice80.r3 +FBN.Mean60.r4 +FBN.Mean80.r4 +FBN.Nice60.r4 +FBN.Nice80.r4' -glt_label 6 FBN.V.BL \
        -gltsym 'SYM: +FBM.Mean60.r1 +FBM.Mean80.r1 +FBM.Nice60.r1 +FBM.Nice80.r1 +FBM.Mean60.r2 +FBM.Mean80.r2 +FBM.Nice60.r2 +FBM.Nice80.r2 +FBM.Mean60.r3 +FBM.Mean80.r3 +FBM.Nice60.r3 +FBM.Nice80.r3 +FBM.Mean60.r4 +FBM.Mean80.r4 +FBM.Nice60.r4 +FBM.Nice80.r4 -FBN.Mean60.r1 -FBN.Mean80.r1 -FBN.Nice60.r1 -FBN.Nice80.r1 -FBN.Mean60.r2 -FBN.Mean80.r2 -FBN.Nice60.r2 -FBN.Nice80.r2 -FBN.Mean60.r3 -FBN.Mean80.r3 -FBN.Nice60.r3 -FBN.Nice80.r3 -FBN.Mean60.r4 -FBN.Mean80.r4 -FBN.Nice60.r4 -FBN.Nice80.r4' -glt_label 7 FBM.V.FBN \
        -gltsym 'SYM: +0.5*FBM.Mean60.r1 +0.5*FBN.Mean60.r1' -glt_label 8 Mean60.r1 \
        -gltsym 'SYM: +0.5*FBM.Mean80.r1 +0.5*FBN.Mean80.r1' -glt_label 9 Mean80.r1 \
        -gltsym 'SYM: +0.5*FBM.Nice60.r1 +0.5*FBN.Nice60.r1' -glt_label 10 Nice60.r1 \
        -gltsym 'SYM: +0.5*FBM.Nice80.r1 +0.5*FBN.Nice80.r1' -glt_label 11 Nice80.r1 \
        -gltsym 'SYM: +0.5*FBM.Mean60.r2 +0.5*FBN.Mean60.r2' -glt_label 12 Mean60.r2 \
        -gltsym 'SYM: +0.5*FBM.Mean80.r2 +0.5*FBN.Mean80.r2' -glt_label 13 Mean80.r2 \
        -gltsym 'SYM: +0.5*FBM.Nice60.r2 +0.5*FBN.Nice60.r2' -glt_label 14 Nice60.r2 \
        -gltsym 'SYM: +0.5*FBM.Nice80.r2 +0.5*FBN.Nice80.r2' -glt_label 15 Nice80.r2 \
        -gltsym 'SYM: +0.5*FBM.Mean60.r3 +0.5*FBN.Mean60.r3' -glt_label 16 Mean60.r3 \
        -gltsym 'SYM: +0.5*FBM.Mean80.r3 +0.5*FBN.Mean80.r3' -glt_label 17 Mean80.r3 \
        -gltsym 'SYM: +0.5*FBM.Nice60.r3 +0.5*FBN.Nice60.r3' -glt_label 18 Nice60.r3 \
        -gltsym 'SYM: +0.5*FBM.Nice80.r3 +0.5*FBN.Nice80.r3' -glt_label 19 Nice80.r3 \
        -gltsym 'SYM: +0.5*FBM.Mean60.r4 +0.5*FBN.Mean60.r4' -glt_label 20 Mean60.r4 \
        -gltsym 'SYM: +0.5*FBM.Mean80.r4 +0.5*FBN.Mean80.r4' -glt_label 21 Mean80.r4 \
        -gltsym 'SYM: +0.5*FBM.Nice60.r4 +0.5*FBN.Nice60.r4' -glt_label 22 Nice60.r4 \
        -gltsym 'SYM: +0.5*FBM.Nice80.r4 +0.5*FBN.Nice80.r4' -glt_label 23 Nice80.r4 \
        -gltsym 'SYM: +0.25*FBM.Mean60.r1 +0.25*FBM.Mean80.r1 +0.25*FBM.Nice60.r1 +0.25*FBM.Nice80.r1' -glt_label 24 FBM.r1 \
        -gltsym 'SYM: +0.25*FBN.Mean60.r1 +0.25*FBN.Mean80.r1 +0.25*FBN.Nice60.r1 +0.25*FBN.Nice80.r1' -glt_label 25 FBN.r1 \
        -gltsym 'SYM: +0.25*FBM.Mean60.r2 +0.25*FBM.Mean80.r2 +0.25*FBM.Nice60.r2 +0.25*FBM.Nice80.r2' -glt_label 26 FBM.r2 \
        -gltsym 'SYM: +0.25*FBN.Mean60.r2 +0.25*FBN.Mean80.r2 +0.25*FBN.Nice60.r2 +0.25*FBN.Nice80.r2' -glt_label 27 FBN.r2 \
        -gltsym 'SYM: +0.25*FBM.Mean60.r3 +0.25*FBM.Mean80.r3 +0.25*FBM.Nice60.r3 +0.25*FBM.Nice80.r3' -glt_label 28 FBM.r3 \
        -gltsym 'SYM: +0.25*FBN.Mean60.r3 +0.25*FBN.Mean80.r3 +0.25*FBN.Nice60.r3 +0.25*FBN.Nice80.r3' -glt_label 29 FBN.r3 \
        -gltsym 'SYM: +0.25*FBM.Mean60.r4 +0.25*FBM.Mean80.r4 +0.25*FBM.Nice60.r4 +0.25*FBM.Nice80.r4' -glt_label 30 FBM.r4 \
        -gltsym 'SYM: +0.25*FBN.Mean60.r4 +0.25*FBN.Mean80.r4 +0.25*FBN.Nice60.r4 +0.25*FBN.Nice80.r4' -glt_label 31 FBN.r4 \
        -gltsym 'SYM: +0.25*FBM.Mean60.r1 +0.25*FBM.Mean60.r2 +0.25*FBM.Mean60.r3 +0.25*FBM.Mean60.r4' -glt_label 32 FBM.Mean60.all \
        -gltsym 'SYM: +0.25*FBN.Mean60.r1 +0.25*FBN.Mean60.r2 +0.25*FBN.Mean60.r3 +0.25*FBN.Mean60.r4' -glt_label 33 FBN.Mean60.all \
        -gltsym 'SYM: +0.25*FBM.Mean80.r1 +0.25*FBM.Mean80.r2 +0.25*FBM.Mean80.r3 +0.25*FBM.Mean80.r4' -glt_label 34 FBM.Mean80.all \
        -gltsym 'SYM: +0.25*FBN.Mean80.r1 +0.25*FBN.Mean80.r2 +0.25*FBN.Mean80.r3 +0.25*FBN.Mean80.r4' -glt_label 35 FBN.Mean80.all \
        -gltsym 'SYM: +0.25*FBM.Nice60.r1 +0.25*FBM.Nice60.r2 +0.25*FBM.Nice60.r3 +0.25*FBM.Nice60.r4' -glt_label 36 FBM.Nice60.all \
        -gltsym 'SYM: +0.25*FBN.Nice60.r1 +0.25*FBN.Nice60.r2 +0.25*FBN.Nice60.r3 +0.25*FBN.Nice60.r4' -glt_label 37 FBN.Nice60.all \
        -gltsym 'SYM: +0.25*FBM.Nice80.r1 +0.25*FBM.Nice80.r2 +0.25*FBM.Nice80.r3 +0.25*FBM.Nice80.r4' -glt_label 38 FBM.Nice80.all \
        -gltsym 'SYM: +0.25*FBN.Nice80.r1 +0.25*FBN.Nice80.r2 +0.25*FBN.Nice80.r3 +0.25*FBN.Nice80.r4' -glt_label 39 FBN.Nice80.all \
        -gltsym 'SYM: +0.125*FBM.Mean60.r1 +0.125*FBN.Mean60.r1 +0.125*FBM.Mean60.r2 +0.125*FBN.Mean60.r2 +0.125*FBM.Mean60.r3 +0.125*FBN.Mean60.r3 +0.125*FBM.Mean60.r4 +0.125*FBN.Mean60.r4' -glt_label 40 Mean60.all \
        -gltsym 'SYM: +0.125*FBM.Mean80.r1 +0.125*FBN.Mean80.r1 +0.125*FBM.Mean80.r2 +0.125*FBN.Mean80.r2 +0.125*FBM.Mean80.r3 +0.125*FBN.Mean80.r3 +0.125*FBM.Mean80.r4 +0.125*FBN.Mean80.r4' -glt_label 41 Mean80.all \
        -gltsym 'SYM: +0.125*FBM.Nice60.r1 +0.125*FBN.Nice60.r1 +0.125*FBM.Nice60.r2 +0.125*FBN.Nice60.r2 +0.125*FBM.Nice60.r3 +0.125*FBN.Nice60.r3 +0.125*FBM.Nice60.r4 +0.125*FBN.Nice60.r4' -glt_label 42 Nice60.all \
        -gltsym 'SYM: +0.125*FBM.Nice80.r1 +0.125*FBN.Nice80.r1 +0.125*FBM.Nice80.r2 +0.125*FBN.Nice80.r2 +0.125*FBM.Nice80.r3 +0.125*FBN.Nice80.r3 +0.125*FBM.Nice80.r4 +0.125*FBN.Nice80.r4' -glt_label 43 Nice80.all \
        -gltsym 'SYM: +0.0625*FBM.Mean60.r1 +0.0625*FBM.Mean80.r1 +0.0625*FBM.Nice60.r1 +0.0625*FBM.Nice80.r1 +0.0625*FBM.Mean60.r2 +0.0625*FBM.Mean80.r2 +0.0625*FBM.Nice60.r2 +0.0625*FBM.Nice80.r2 +0.0625*FBM.Mean60.r3 +0.0625*FBM.Mean80.r3 +0.0625*FBM.Nice60.r3 +0.0625*FBM.Nice80.r3 +0.0625*FBM.Mean60.r4 +0.0625*FBM.Mean80.r4 +0.0625*FBM.Nice60.r4 +0.0625*FBM.Nice80.r4' -glt_label 44 FBM.all \
        -gltsym 'SYM: +0.0625*FBN.Mean60.r1 +0.0625*FBN.Mean80.r1 +0.0625*FBN.Nice60.r1 +0.0625*FBN.Nice80.r1 +0.0625*FBN.Mean60.r2 +0.0625*FBN.Mean80.r2 +0.0625*FBN.Nice60.r2 +0.0625*FBN.Nice80.r2 +0.0625*FBN.Mean60.r3 +0.0625*FBN.Mean80.r3 +0.0625*FBN.Nice60.r3 +0.0625*FBN.Nice80.r3 +0.0625*FBN.Mean60.r4 +0.0625*FBN.Mean80.r4 +0.0625*FBN.Nice60.r4 +0.0625*FBN.Nice80.r4' -glt_label 45 FBN.all \
        -cbucket cbucket.stats.$subj \
        -jobs $jobs

    cd ..
end
