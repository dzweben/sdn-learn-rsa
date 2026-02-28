# Run Status And Data Requirements (Current Snapshot)

Date: 2026-02-28

## 1) What Is Currently Run

GLM **complete** (anticipation template + `-goforit 10`):
- `LEARN_RSA_runwise_AFNI`
- root: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses`
- cohort: 38 subjects
- completion: **38/38** have `stats.<subj>+tlrc.HEAD`
- all proc scripts confirmed to contain `Anticipation.PredFdk` (regressor 41) and `-goforit 10`
- fallback subjects (1028, 1178, 1422) also confirmed with anticipation regressor

Error audit (2026-02-28):
- all 38 output logs scanned for ERROR/FATAL/FAILED/ABORT
- only benign matches found:
  - `Matrix inverse average error = ...e-14 ++ VERY GOOD ++` (numerical precision, not an error)
  - `failed to load module matplotlib` (AFNI QC HTML rendering, does not affect GLM)
  - `'apqc_title_info' object has no attribute 'ses'` (AFNI QC cosmetic, does not affect GLM)

## 2) Final Canonical Version

Final canonical scripts are the Anticipation chain:
- `scripts/1_fix_events.py`
- `scripts/2_generate_timing.sh`
- `scripts/3a_afni_proc_template.sh`
- `scripts/3b_fallback_patch.py`
- `scripts/3_run_glm.sh`

Canonical timing target path:
- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2`

Current snapshot note:
- canonical timing root is `Fixed2`.
- anticipation regressor files (`Anticipation_pred_fdk*.1D`) are present in that root.

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

## 5) Post-GLM Audit Commands

### Quick: missing stats check

Any subject ID printed is missing its stats file:

```bash
RESULTS=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses
TIMING=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2
for d in $TIMING/sub-*; do
  id=${d##*sub-}
  stats="$RESULTS/$id/${id}.results.LEARN_RSA_runwise_AFNI/stats.${id}+tlrc.HEAD"
  [ ! -f "$stats" ] && echo "$id"
done | sort -n
```

### Quick: real error scan

Scan for genuine errors (excludes known benign matches):

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

### Deep: verify anticipation regressor in proc scripts

Confirms every subject's proc script includes `Anticipation.PredFdk` as regressor 41:

```bash
RESULTS=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses
TIMING=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2
for d in $TIMING/sub-*; do
  id=${d##*sub-}
  proc="$RESULTS/$id/proc.${id}.LEARN_RSA_runwise_AFNI"
  if [ -f "$proc" ]; then
    has_antic=$(grep -c "Anticipation.PredFdk" "$proc")
    has_goforit=$(grep -c "goforit" "$proc")
    [ "$has_antic" -eq 0 ] && echo "MISSING anticipation: $id"
    [ "$has_goforit" -eq 0 ] && echo "MISSING goforit: $id"
  else
    echo "MISSING proc: $id"
  fi
done
```

### Deep: full audit (structure + GLM + content)

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/audit_server.sh
```
