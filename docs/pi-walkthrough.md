# LEARN RSA PI Walkthrough (Final Canonical)

This walkthrough is final-production only. It does not include forked alternatives.

**Step 0 - Environment and Paths**

Canonical root:

`/data/projects/STUDIES/LEARN/fMRI/RSA-learn`

Critical paths:

- raw BIDS: `/data/projects/STUDIES/LEARN/fMRI/bids`
- fixed events: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed`
- timing root: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2`
- outputs: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses`

**Step 1 - Fix `nopred_fdbk` Labels**

Purpose:

When prediction is missed, feedback can appear as `nopred_fdbk`. This step relabels those rows to canonical feedback labels so timing generation is valid.

Command:

```bash
python3 /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/1_fix_events.py \
  --bids-dir /data/projects/STUDIES/LEARN/fMRI/bids \
  --out-dir /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed \
  --report /data/projects/STUDIES/LEARN/fMRI/RSA-learn/reports/nopred_fdbk_fix_template.tsv \
  --mode majority
```

**Step 2 - Generate Run-wise Timing Files**

Purpose:

Create one timing set per subject with run-wise feedback, prediction/response, and anticipation (`isi`) regressors.

Command:

```bash
SUBJ_LIST_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt \
BIDS_DIR_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed \
TIMING_ROOT_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/2_generate_timing.sh
```

Quick proof that anticipation files exist:

```bash
ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2/sub-958/Anticipation_pred_fdk*.1D
```

**Step 3 - Run GLM**

Purpose:

Generate per-subject AFNI proc scripts and run preprocessing + GLM using raw BIDS and no blur.

Command:

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/3_run_glm.sh
```

This internally calls `3a_afni_proc_template.sh` (or `3b_fallback_patch.py` for subjects with fewer than 4 runs) to generate proc scripts, then executes them.

Key GLM flags:
- `-goforit 10` in `-regress_opts_3dD`: allows `3dDeconvolve` to proceed through up to 10 collinearity warnings. Some subjects have correlated timing between anticipation and feedback regressors; this is expected and does not invalidate the model.
- `-test_stim_files no`: disables the `afni_proc.py` pre-check of stimulus timing files.

**Step 4 - Audit Completion**

Run these checks after the GLM finishes. No output = all clear.

1. Missing stats (any ID printed has no stats file):

```bash
RESULTS=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses
TIMING=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2
for d in $TIMING/sub-*; do
  id=${d##*sub-}
  stats="$RESULTS/$id/${id}.results.LEARN_RSA_runwise_AFNI/stats.${id}+tlrc.HEAD"
  [ ! -f "$stats" ] && echo "$id"
done | sort -n
```

2. Real errors (filters out known benign matches like matplotlib warnings):

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

3. Verify anticipation regressor and `-goforit 10` in every proc script:

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

4. Full structural audit:

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/audit_server.sh
```

Known benign log messages (safe to ignore):
- `Matrix inverse average error = ...e-14 ++ VERY GOOD ++` — numerical precision report, not an error
- `failed to load module matplotlib` — AFNI QC HTML rendering, does not affect GLM
- `'apqc_title_info' object has no attribute 'ses'` — AFNI QC cosmetic issue

**Step 5 - QC Summary**

Purpose:

Generate a single markdown report summarizing per-subject quality control metrics. This pulls data from AFNI's `out.ss_review.*.txt` files and flags subjects that exceed common QC thresholds.

Command:

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/qc_summary.sh
```

Output: `docs/qc-summary.md`

What it reports:
- **Group summary table**: min/mean/max for censor fraction, average motion, max displacement, TSNR, GCOR, and anat/EPI Dice coefficient
- **Flagged subjects**: any subject exceeding thresholds (censor >15% warn, >30% exclude, max displacement >3mm, TSNR <40, Dice <0.90, any single run >40% censored)
- **Full subject table**: one row per subject with all QC metrics and per-run censor fractions
- **Metric definitions**: plain-English explanation of each metric

Flag thresholds (configurable at top of script):

| Threshold | Meaning |
|---|---|
| Censor fraction ≥ 30% | Heavy motion — consider excluding |
| Censor fraction ≥ 15% | Moderate motion — note in methods |
| Max displacement ≥ 3mm | Large single-TR head jerk |
| TSNR < 40 | Low temporal signal-to-noise |
| Dice < 0.90 | Poor anatomy-to-EPI alignment |
| Any run ≥ 40% censored | That run may be unusable |

Review the report before proceeding to ROI extraction. No subjects need to be excluded unless they exceed the 30% censor threshold or show poor alignment (Dice < 0.90).

**Step 6 - Extract ROI Betas**

Purpose:

Extract mean beta coefficients from anatomical ROI masks for each subject's stats file. This produces one CSV per ROI with 41 columns (32 run-wise feedback + 8 pred/resp + 1 anticipation). These CSVs are the input for RSA and behavioral correlation analyses.

Command:

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/4_extract_rois.sh
```

What it does:
1. Discovers all subjects with completed GLM stats files
2. For each of 6 anatomical ROI masks (vmPFC, dACC1, dACC2, AntInsula, VS, Amygdala), extracts the non-zero mean beta (NZmean) for each condition using `3dROIstats`
3. Handles fallback subjects (2-3 runs) automatically: missing conditions are coded as "NA"
4. Outputs one CSV per ROI to `derivatives/afni/ROI_extractions/`

ROI masks used (from `$TOPDIR/Masks/`):
- `VMPFC-mask-final.nii.gz`
- `dACC1-6mm-bilat.nii.gz`, `dACC2-6mm-bilat.nii.gz`
- `AntInsula-thr10-3mm-bilat.nii.gz`
- `striatum-structural-3mm-VS-bilat.nii.gz`
- `Amyg_LR_resample+tlrc`

To verify setup without running extraction (e.g., from a local machine without AFNI):

```bash
DRY_RUN=1 bash scripts/4_extract_rois.sh
```

Output files:

```
derivatives/afni/ROI_extractions/
├── vmPFC_betas.csv
├── dACC1_betas.csv
├── dACC2_betas.csv
├── AntInsula_betas.csv
├── VS_betas.csv
└── Amygdala_betas.csv
```

Reference: The lab's standard ROI extraction protocol is documented in `literature/Extracting_ROIs_Slab.pdf`.

**Step 6b - Extract Mentalizing ROI Betas**

Following the core ROI extraction, we added two mentalizing-network ROIs to test social cognition hypotheses:

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/4b_extract_mentalizing_rois.sh
```

**R-TPJ** (right temporoparietal junction):
- Source: Mars et al. (2012) TPJ parcellation, all right-hemisphere clusters combined
- File: `AnatomicalROI_Masks/ROIs/MNI_MarsTPJParcellation/TPJ_thr50_summaryimage_3mm_clustALL_R.nii.gz`
- Center of mass: MNI (56, -44, 23), 438 voxels at 3mm
- Resampled to GLM grid with nearest-neighbor interpolation

**dmPFC** (dorsomedial prefrontal cortex):
- Source: 8mm sphere at Schurz et al. (2014) mentalizing meta-analysis peak
- Coordinates: MNI (0, 54, 33), created with `3dUndump -srad 8`
- Citation: Schurz, M., Radua, J., Aichhorn, M., Richlan, F., & Perner, J. (2014). Fractionating theory of mind: A meta-analysis of functional brain imaging studies. *Neuroscience & Biobehavioral Reviews*, 42, 9–34.
- 81 voxels on 3mm GLM grid

Note: The lab's existing `Preferred_ROI_Combination/Medial_Prefrontal+tlrc` was evaluated but rejected — center of mass at z=6 places it in pregenual/ventral mPFC, overlapping the existing vmPFC ROI. The Schurz coordinate (z=33) is unambiguously dorsal.

Output files:

```
derivatives/afni/ROI_extractions/
├── RTPJ_betas.csv
└── dmPFC_betas.csv
```

Same 41 conditions as Stage 4 (32 feedback + 8 pred/resp + 1 anticipation).

**Step 7 - Subject-level Exception Handling**

The proc template includes `-goforit 10` which handles the expected collinearity between anticipation and feedback regressors. If a subject still fails (i.e., has more than 10 collinearity warnings), investigate subject-specific timing issues and document any rerun decisions in:

`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/docs/decisions.md`

No global model changes are allowed for single-subject exceptions without explicit decision logging.

**Step 8 - Maintenance Rules**

1. Keep only one production path set.
2. Keep non-canonical artifacts under `sandbox/` only.
3. Update masterplan + PI walkthrough + README + decision log together.
4. Do not leave temporary attempt scripts in production folders.
