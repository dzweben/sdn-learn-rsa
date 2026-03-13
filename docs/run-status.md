# Run Status And Data Requirements (Current Snapshot)

Date: 2026-03-12

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

QC summary **complete** (2026-03-05):
- script: `scripts/qc_summary.sh`
- output: `docs/qc-summary.md`
- result: 38 subjects, 24 flagged (mostly benign maxDisp>3mm), 0 exceed 30% censor threshold
- 6 subjects with >15% censoring: 1028 (20.5%), 1178 (16.0%), 1267 (15.8%), 1351 (19.0%), 1407 (24.0%), 1422 (24.8%)
- weakest subject: 1422 (24.8% censored, 0.527mm/TR avg motion, TSNR 44.1) — still within acceptable bounds
- group means: censor 5.4%, TSNR 87.7, Dice 0.944 — all excellent
- conclusion: all 38 subjects pass standard exclusion criteria

ROI extraction **complete** (2026-03-12, re-extracted after audit):
- scripts: `scripts/4_extract_rois.sh` (6 core) + `scripts/4b_extract_mentalizing_rois.sh` (2 mentalizing)
- output: 8 CSVs in `derivatives/afni/ROI_extractions/` (38 subjects x 42 columns each, 0 NAs for full-run subjects)
- conditions: 41 per subject (32 feedback + 8 pred/resp + 1 anticipation)
- extraction method: `3dROIstats -nzmean -quiet`, NZMean column parsed with `awk '{print $NF}'`
- masks (all verified with 3dCM):
  - vmPFC: VMPFC-mask-final.nii.gz (1245 voxels)
  - dACC1: dACC1-6mm-bilat.nii.gz (46 voxels)
  - dACC2: dACC2-6mm-bilat.nii.gz (65 voxels)
  - AntInsula: AntInsula-thr10-3mm-bilat.nii.gz (162 voxels)
  - VS: striatum-structural-3mm-VS-bilat.nii.gz (107 voxels)
  - Amygdala: Amyg_LR_resample+tlrc, resampled to GLM grid (98 voxels)
  - R-TPJ: Mars et al. (2012) clustALL_R, resampled to GLM grid (438 voxels, CM MNI ~56, -44, 23)
  - dmPFC: 8mm sphere at Schurz et al. (2014) MNI (0, 54, 33), 81 voxels
- audit fixes applied (see decisions.md 2026-03-12):
  1. Parsing: `awk '{print $NF}'` replaces `tr -d '[:space:]'` (was concatenating Mean+NZMean columns)
  2. dmPFC LPI coordinate: Z negated (-33, was +33 — sphere was 65mm off-target)
  3. Amygdala: resampled from 65x77x65 (sub-1158 grid) to 64x76x64 (GLM grid)

## 2) Final Canonical Version

Final canonical scripts are the Anticipation chain:
- `scripts/1_fix_events.py`
- `scripts/2_generate_timing.sh`
- `scripts/3a_afni_proc_template.sh`
- `scripts/3b_fallback_patch.py`
- `scripts/3_run_glm.sh`
- `scripts/qc_summary.sh`
- `scripts/4_extract_rois.sh`
- `scripts/4b_extract_mentalizing_rois.sh`

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

4. QC summary report:
`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/docs/qc-summary.md`

5. ROI extractions:
`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/ROI_extractions/`

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
