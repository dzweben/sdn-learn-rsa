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

1. `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/1_fix_events.py`
2. `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/2_generate_timing.sh`
3. `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/3a_afni_proc_template.sh`
4. `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/3b_fallback_patch.py`
5. `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/3_run_glm.sh`

## How to Run Each Stage

Stage 1 — Fix nopred_fdbk labels:

```bash
python3 /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/1_fix_events.py \
  --bids-dir /data/projects/STUDIES/LEARN/fMRI/bids \
  --out-dir /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed \
  --report /data/projects/STUDIES/LEARN/fMRI/RSA-learn/reports/nopred_fdbk_fix_template.tsv \
  --mode majority
```

Stage 2 — Generate timing files:

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/2_generate_timing.sh
```

Stage 3 — Run GLM:

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/3_run_glm.sh
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

1. `pipeline/docs/masterplan.md`
2. `pipeline/docs/pi-walkthrough.md`
3. `pipeline/README.md`
4. `pipeline/docs/decisions.md`
