# Run Status And Data Requirements (Current Snapshot)

Date: 2026-07-14

## Current state

Analytic sample: **33 subjects** (`Usable_fMRI == 1`). GLM label: `feedback_runwise_glm`.

Both clusters hold the same clean tree at `/data/projects/STUDIES/LEARN/fMRI/RSA-learn`:

| Item | State |
|------|-------|
| `pipeline/` | Steps 01 to 05 plus `config.sh` and `lib/`. Identical on both clusters. |
| `events_fixed/` | 33 subjects, stage 01 output. |
| `timing/` | 33 subjects, stage 02 output. |
| `derivatives/afni/IndvlLvlAnalyses/` | 33 subjects, canonical `feedback_runwise_glm` only. Ten real files per subject. 40 GB (CR2), 44 GB (CR1). |
| `derivatives/afni/results/` | The three result JSONs. |
| `analysis/` | Clinical and behavioral CSVs plus the interactive report. |
| `presentations/`, `docs/`, `walkthrough.html`, `README.md` | Present on both. |

Verified reproduction (both clusters, `run_all.sh --analysis`):

- Finding 1, Model Alignment RSA: rACC b = +0.0320, p = 0.00070, q = 0.0252.
- Finding 2, Temporal ISC: rACC rho = -0.5317 q = 0.0522; aMCC rho = -0.4969 q = 0.0588.
- Finding 3, Whole-brain ISC: RH_Cont_Cing_1 rho = -0.6495, p = 0.000043, q = 0.0173, one survivor of 400.

Superseded material is in `RSA-cleanup-quarantine-20260714` on each cluster, pending deletion.

---

## Historical notes (superseded)

Date: 2026-03-17

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

Voxel-wise pattern extraction **complete** (2026-03-14):
- script: `scripts/5_extract_patterns.sh`
- purpose: Stage 4/4b extracted ROI means (scalars). RSA requires multi-voxel patterns (vectors). Stage 5 dumps the full voxel pattern within each ROI mask using `3dmaskdump`.
- output: `derivatives/afni/ROI_patterns/<ROI>/sub-<id>_<ROI>_patterns.1D` (41 conditions × N voxels per file)
- results: 304 .1D files (38 subjects × 8 ROIs), all verified 41 data rows each
- cross-validation: 12,464 checks against Stage 4/4b NZmean CSVs — **all passed** (max diff 0.000639, tol 0.001)
- voxel counts: vmPFC=1245, dACC1=46, dACC2=65, AntInsula=162, VS=107, Amygdala=98, RTPJ=438, dmPFC=81
- grid: all 38 subjects on same grid (64×76×64×259), masks resampled with NN interpolation
- runtime: 2 min 46 sec on server
- log: `logs/5_extract_patterns_20260314_185123.log`

IS-RSA Anna Karenina ROI analysis **complete** (rerun 2026-03-17):
- script: `analysis/isrsa_anna_karenina.py`
- **BUG FOUND 2026-03-16**: FBM/FBN condition grouping was wrong — code treated M as "match" and N as "nonmatch" instead of M = mean, N = nice. **Fixed and rerun 2026-03-17.**
- models: NN + AnnaK_Gradient (sensitivity models removed)
- results: 32 tests (8 ROIs × 2 feedback × 2 models), FDR-corrected per model×feedback family
- output: `derivatives/afni/IS-RSA/` (results CSVs + 34 figures)
- runtime: 2.5 min, 33 subjects, 10K permutations
- key result: dACC1 × Mean feedback × AnnaK_Gradient: ρ = -0.166, p_fdr = 0.036 (significant idiosyncrasy)
- report: `analysis/isrsa_report.html`

Searchlight IS-RSA **complete** (rerun 2026-03-17):
- script: `analysis/searchlight_isrsa.py`
- same FBM/FBN bug fix as ROI analysis
- model: AnnaK_Gradient only, radius=3 (9mm), 10K permutations, no cluster correction
- output: `derivatives/afni/IS-RSA-searchlight/results/` (rho/p/z NIfTIs for Nice + Mean)
- runtime: 51 min, 70,573 voxel centers, 33 subjects

Searchlight atlas labeling **NEEDS RERUN** (depends on new searchlight results):
- script: `analysis/label_searchlight_clusters.py`
- status: **can now run on new searchlight output**

Searchlight cluster correction **NEEDS RERUN** (not run this cycle by design):
- script: `analysis/searchlight_cluster_correction.py`
- FBM/FBN bug fixed in this script
- status: **can now run on new searchlight output when ready**

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
- `scripts/5_extract_patterns.sh`

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

5. ROI extractions (means):
`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/ROI_extractions/`

6. ROI patterns (voxel-wise, for RSA):
`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/ROI_patterns/`

7. IS-RSA results (ROI-based):
`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IS-RSA/`

8. Searchlight IS-RSA results (whole-brain):
`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IS-RSA-searchlight/`

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
