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

## Key GLM Parameters

- 41 regressors: 32 run-wise feedback + 8 prediction/response + 1 anticipation
- 45 GLTs (for 4-run subjects; fewer for 2-3 run subjects)
- `-goforit 10` in `-regress_opts_3dD`: tolerates up to 10 collinearity warnings per subject (expected due to anticipation–feedback timing correlation)
- No spatial smoothing (blur block omitted for RSA)
- AM1 stimulus type with `dmBLOCK(0)` basis function

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

No output from any command = all clear.

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

Real error scan (filters benign matplotlib/QC messages):

```bash
RESULTS=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses
for f in $RESULTS/*/output.proc.*LEARN_RSA_runwise_AFNI; do
  id=$(basename "$(dirname "$f")")
  errs=$(grep -iE "ERROR|FATAL|FAILED|ABORT" "$f" \
    | grep -viE "inverse.*error.*VERY GOOD|failed to load module matplotlib|apqc_title_info" \
    | grep -c . || true)
  [ "$errs" -gt 0 ] && echo "$id: $errs real errors"
done
```

Verify anticipation + goforit in every proc script:

```bash
RESULTS=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses
TIMING=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2
for d in $TIMING/sub-*; do
  id=${d##*sub-}
  proc="$RESULTS/$id/proc.${id}.LEARN_RSA_runwise_AFNI"
  if [ -f "$proc" ]; then
    [ $(grep -c "Anticipation.PredFdk" "$proc") -eq 0 ] && echo "MISSING anticipation: $id"
    [ $(grep -c "goforit" "$proc") -eq 0 ] && echo "MISSING goforit: $id"
  else
    echo "MISSING proc: $id"
  fi
done
```

Full structural audit:

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/audit_server.sh
```

## Production Organization Rule

Production folders contain only active paths.
Any non-canonical or legacy artifacts must live under:

`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/sandbox/`

## Change-control Rule

Any script/path/model change must update, in the same change:

1. `docs/masterplan.md`
2. `docs/pi-walkthrough.md`
3. `README.md`
4. `docs/decisions.md`
