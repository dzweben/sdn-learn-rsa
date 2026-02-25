# Run Status And Data Requirements (Current Snapshot)

Date: 2026-02-25

## 1) What Is Currently Run

Current completed GLM outputs are:
- `LEARN_RSA_runwise_AFNI`
- root: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses`
- cohort with timing folders in `TimingFiles/Fixed2`: 38 subjects
- completion check: all 38/38 have `stats.<subj>+tlrc.HEAD`

Operational meaning:
- the existing completed outputs are tied to `TimingFiles/Fixed2` design.

## 2) Final Canonical Version

Final canonical scripts are the Anticipation chain:
- `scripts/fix_nopred_fdbk.py`
- `scripts/generate_timing.sh`
- `scripts/afni_proc_template.sh`
- `scripts/fallback_patch.py`
- `scripts/run_glm.sh`

Canonical timing target path:
- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2`

Current snapshot note:
- canonical timing root is `Fixed2`.
- anticipation regressor files (`Anticipation_pred_fdk*.1D`) are present in that root.
- rerun the canonical pipeline when refreshed outputs are needed.

## 3) Required Inputs

1. Raw BIDS events and bold:
`/data/projects/STUDIES/LEARN/fMRI/bids`

2. Subject list:
`/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt`

3. AFNI SSW anatomy:
`/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/ssw/sub-<id>/`

4. Confounds expected by proc:
`/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/confounds/sub-<id>/`

## 4) Outputs Produced By Canonical Pipeline

1. Fixed BIDS events:
`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed`

2. Timing files:
`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2`

3. Subject-level proc and GLM outputs:
`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/<id>/`

## 5) Fast Verification Commands

```bash
RESULTS=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses
TIMING=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2
for d in $TIMING/sub-*; do
  id=${d##*sub-}
  stats="$RESULTS/$id/${id}.results.LEARN_RSA_runwise_AFNI/stats.${id}+tlrc.HEAD"
  [ ! -f "$stats" ] && echo "$id"
done | sort -n
```

```bash
egrep -R "ERROR|FATAL|FAILED|ABORT" \
/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/*/output.proc.*LEARN_RSA_runwise_AFNI
```
