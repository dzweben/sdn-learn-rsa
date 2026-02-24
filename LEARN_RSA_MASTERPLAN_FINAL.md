# LEARN RSA Master Plan (Final Canonical)

## Purpose

This document defines the single production LEARN RSA pipeline and the exact paths, scripts, and audit commands required to run and verify it.

## Canonical Root (Linux)

`/data/projects/STUDIES/LEARN/fMRI/RSA-learn`

## Canonical Production Inputs

- Raw BIDS: `/data/projects/STUDIES/LEARN/fMRI/bids`
- Fixed events: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed`
- Subject list: `/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt`
- AFNI SSW anatomy: `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/ssw/sub-<id>/`
- Confounds: `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/confounds/sub-<id>/`

## Canonical Production Timing Root

`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2`

This root is the single active timing root and includes:
- run-wise feedback regressors (`NonPM_*_run*.1D`)
- prediction/response regressors (`*pred*`, `*rsp*`)
- anticipation regressors (`Anticipation_pred_fdk*.1D`)

## Canonical Script Chain

1. `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_fix_nopred_fdbk_by_template.py`
2. `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_1D_AFNItiming_Full_RSA_runwise_Anticipation.sh`
3. `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_ap_Full_RSA_runwise_AFNI_noblur_Anticipation.sh`
4. `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_ap_fallback_patch_afni_raw.py`
5. `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_runwise_pipeline_afni_raw_Anticipation.sh`
6. `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh`

## One-command Production Run

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

## Controlled Stage Runs

Only run event fix:

```bash
FIX_EVENTS=1 MAKE_TIMING=0 MAKE_PROC=0 CLEAN_OUT=0 RUN_GLM=0 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

Only run timing generation:

```bash
FIX_EVENTS=0 MAKE_TIMING=1 MAKE_PROC=0 CLEAN_OUT=0 RUN_GLM=0 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

Only run GLM (existing proc):

```bash
FIX_EVENTS=0 MAKE_TIMING=0 MAKE_PROC=0 CLEAN_OUT=1 RUN_GLM=1 MAX_JOBS=8 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

## Canonical Outputs

- Subject outputs: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/<id>/`
- Primary stats output: `stats.<id>+tlrc.HEAD` in `<id>.results.LEARN_RSA_runwise_AFNI/`

## Verification Commands

Missing stats check:

```bash
RESULTS=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses
TIMING=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2
for d in $TIMING/sub-*; do
  id=${d##*sub-}
  stats="$RESULTS/$id/${id}.results.LEARN_RSA_runwise_AFNI/stats.${id}+tlrc.HEAD"
  [ ! -f "$stats" ] && echo "$id"
done | sort -n
```

Error scan:

```bash
egrep -R "ERROR|FATAL|FAILED|ABORT" \
/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/*/output.proc.*LEARN_RSA_runwise_AFNI
```

## Production Organization Rule

Production folders contain only active paths.
Any non-canonical or legacy artifacts must live under:

`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/sandbox/`

## Change-control Rule

Any script/path/model change must update, in the same change:

1. `LEARN_RSA_MASTERPLAN_FINAL.md`
2. `LEARN_RSA_PI_WALKTHROUGH.md`
3. `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/README.md`
4. `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/docs/DECISION_LOG.md`
