#!/bin/tcsh

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA‑learn RUN‑WISE afni_proc generator
#
# This script is derived from the LEARN first‑level pipeline
# and the exact afni_proc.py command used in:
#   /data/projects/STUDIES/LEARN/fMRI/derivatives/afni/IndvlLvlAnalyses/<SUBJ>/proc.<SUBJ>.LEARN_070422
#
# Goal:
#   Run‑wise peer×feedback betas + peer‑only + feedback‑only betas
#   in a new RSA‑learn output directory, without changing the
#   preprocessing logic or confound structure.
#
# IMPORTANT: This script only *creates* proc scripts. Execution
# is handled separately (see RunAFNIProc scripts).
#
# Author: RSA‑learn adaptation
# Date: 2026‑02‑08

############################################################################################
# GENERAL SETUP
############################################################################################

######################################################
# LIST OF SUBJECTS WHOSE DATA YOU WANT TO ANALYZE
######################################################

# **CHANGE ME**: Specify subject numbers in a single row. Do not include the sub- prefix
set subjects = ( 958 1158 1267 1380 )

######################################################
# SPECIFY ANALYSIS NAME AND PARAMETERS
######################################################

# **CHECK ME**: GLM name (used for outputs)
set GLM = LEARN_RSA_runwise

# **CHECK ME**: Offset applied to stimulus times (matches original pipeline)
set stim_offset = -0.831

# **CHECK ME**: Number of jobs for 3dDeconvolve
set jobs = 30

######################################################
# SPECIFY LOCATIONS
######################################################

# Top‑level study directory
set topdir = /data/projects/STUDIES/LEARN/fMRI

# fMRIPrep outputs (preprocessed BOLD + T1)
set fmriprep = $topdir/derivatives/fmriprep

# Confounds directory (motion, aCompCor, cosine, fd)
set confounds = $topdir/derivatives/afni/confounds

# RSA‑learn timing files (run‑wise NonPM)
set subjecttiming = $topdir/RSA-learn/TimingFiles/Full

# RSA‑learn output root
set results = $topdir/RSA-learn/derivatives/afni/IndvlLvlAnalyses

############################################################################################
# THE ANALYSIS SCRIPT BEGINS HERE
############################################################################################

# Go to the results tree and work from there
cd $results

# For each subject...
foreach subj ( $subjects )

	# Make a new subject results folder
	mkdir -p $subj

	# Change directories into that folder to work
	cd $subj

	##### Subject‑specific data #####

	# fMRIPrep subject directory
	set subj_dir = $fmriprep/sub-$subj

	# RSA‑learn timing directory (run‑wise NonPM)
	set stimdir = $subjecttiming/sub-$subj

	######################################################
	# MODEL SUMMARY (RUN‑WISE)
	######################################################
	# - Feedback regressors are split by run: 4 runs × 8 conditions
	# - Prediction/Response regressors are included (collapsed across runs)
	# - GLTs include:
	#   a) legacy GLTs updated for run‑wise feedback
	#   b) peer‑only + feedback‑only per run
	#   c) peer×feedback collapsed across runs
	#   d) peer‑only + feedback‑only collapsed across runs

	######################################################
	# AFNI_PROC.PY CALL
	######################################################

	afni_proc.py -subj_id $subj \
		-dsets \
			$subj_dir/func/sub-${subj}_task-learn_run-1_space-MNI152NLin2009cAsym_desc-preproc_bold.nii.gz \
			$subj_dir/func/sub-${subj}_task-learn_run-2_space-MNI152NLin2009cAsym_desc-preproc_bold.nii.gz \
			$subj_dir/func/sub-${subj}_task-learn_run-3_space-MNI152NLin2009cAsym_desc-preproc_bold.nii.gz \
			$subj_dir/func/sub-${subj}_task-learn_run-4_space-MNI152NLin2009cAsym_desc-preproc_bold.nii.gz \
		-scr_overwrite \
		-script $results/$subj/proc.$subj.$GLM \
		-out_dir $subj.results.$GLM \
		-blocks blur mask scale regress \
		-copy_anat \
			$subj_dir/anat/sub-${subj}_space-MNI152NLin2009cAsym_desc-preproc_T1w.nii.gz \
		-blur_size 6 \
		-regress_est_blur_errts \
		-regress_run_clustsim yes \
		-regress_stim_times_offset $stim_offset \
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
		-regress_motion_file \
			$confounds/sub-${subj}/sub-${subj}_task-learn_allruns_motion.1D \
		-regress_motion_per_run \
		-regress_extra_ortvec \
			$confounds/sub-${subj}/sub-${subj}_task-learn_allruns_aCompCor6.1D \
			$confounds/sub-${subj}/sub-${subj}_task-learn_allruns_cosine.1D \
			$confounds/sub-${subj}/sub-${subj}_task-learn_allruns_fd.1D \
		-regress_extra_ortvec_labels aCompcor6 cosine fd \
		-regress_opts_3dD \
			-local_times \
			-allzero_OK \
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
