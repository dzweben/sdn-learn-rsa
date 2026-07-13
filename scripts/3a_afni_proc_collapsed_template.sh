#!/bin/tcsh

############################################################################################
# RSA-learn run-wise afni_proc generator -- COLLAPSED design
#
# 19 stim regressors:
#   16x  FB.<peer>.r<run>       (feedback, valence collapsed, per peer per run)
#    1x  Prediction             (all peers/runs collapsed)
#    1x  Anticipation           (existing Anticipation_pred_fdk.1D, all 4 runs)
#    1x  Response               (all peers/runs collapsed)
#
# Same preproc as the OLD per-peer/per-run/per-valence template (raw BIDS, no blur).
# Timing inputs come from TimingFiles/Fixed2_collapsed/ (produced by 2b_collapse_timing.py).
############################################################################################

# **CHANGE ME**: subjects (no sub- prefix)
set subjects = ( 958 1158 1267 1380 )

# GLM tag used for output dirs/files
set GLM = LEARN_RSA_runwise_AFNI_collapsed

set motion_max = 1
set jobs = 30

############################################################################################
# LOCATIONS
############################################################################################

set topdir = /data/projects/STUDIES/LEARN/fMRI

set subjbids = $topdir/bids
set subjecttiming = $topdir/RSA-learn/TimingFiles/Fixed2_collapsed
set results = $topdir/RSA-learn/derivatives/afni/IndvlLvlAnalyses
set anat_dir = $topdir/derivatives/afni/ssw

if ( $?BIDS_DIR_OVERRIDE ) then
    set subjbids = "$BIDS_DIR_OVERRIDE"
endif
if ( $?TIMING_ROOT_OVERRIDE ) then
    set subjecttiming = "$TIMING_ROOT_OVERRIDE"
endif

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
        -regress_stim_times \
            $stimdir/FB_Mean60_r1.1D \
            $stimdir/FB_Mean80_r1.1D \
            $stimdir/FB_Nice60_r1.1D \
            $stimdir/FB_Nice80_r1.1D \
            $stimdir/FB_Mean60_r2.1D \
            $stimdir/FB_Mean80_r2.1D \
            $stimdir/FB_Nice60_r2.1D \
            $stimdir/FB_Nice80_r2.1D \
            $stimdir/FB_Mean60_r3.1D \
            $stimdir/FB_Mean80_r3.1D \
            $stimdir/FB_Nice60_r3.1D \
            $stimdir/FB_Nice80_r3.1D \
            $stimdir/FB_Mean60_r4.1D \
            $stimdir/FB_Mean80_r4.1D \
            $stimdir/FB_Nice60_r4.1D \
            $stimdir/FB_Nice80_r4.1D \
            $stimdir/Prediction_all.1D \
            $stimdir/Anticipation_pred_fdk.1D \
            $stimdir/Response_all.1D \
        -regress_stim_labels \
            FB.Mean60.r1 \
            FB.Mean80.r1 \
            FB.Nice60.r1 \
            FB.Nice80.r1 \
            FB.Mean60.r2 \
            FB.Mean80.r2 \
            FB.Nice60.r2 \
            FB.Nice80.r2 \
            FB.Mean60.r3 \
            FB.Mean80.r3 \
            FB.Nice60.r3 \
            FB.Nice80.r3 \
            FB.Mean60.r4 \
            FB.Mean80.r4 \
            FB.Nice60.r4 \
            FB.Nice80.r4 \
            Prediction \
            Anticipation \
            Response \
        -regress_stim_types \
            AM1 AM1 AM1 AM1 \
            AM1 AM1 AM1 AM1 \
            AM1 AM1 AM1 AM1 \
            AM1 AM1 AM1 AM1 \
            AM1 AM1 AM1 \
        -regress_basis_multi \
            'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \
            'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \
            'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \
            'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \
            'dmBLOCK(0)' 'dmBLOCK(0)' 'dmBLOCK(0)' \
        -regress_opts_3dD \
            -GOFORIT 1 \
            -cbucket cbucket.stats.$subj \
            -jobs $jobs

    cd ..
end
