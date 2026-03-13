# Decision Log (Canonical Project Decisions)

## 2026-02-24

1. Canonical timing root is `TimingFiles/Fixed2` (with anticipation files present).
2. Production scripts list reduced to five active scripts (fix, timing, proc template, fallback, GLM).
3. Non-canonical artifacts must be moved to `sandbox/`, never left in production paths.
4. Top-level README must remain a complete folder map and runbook.
5. Undergrad training handoff starts at timing generation and GLM execution, not historical fixes.

## 2026-03-12

1. ROI extraction (Stage 4) completed: 6 core ROIs × 38 subjects + 2 mentalizing ROIs × 38 subjects = 8 CSVs total. Output in `derivatives/afni/ROI_extractions/`.

2. **Extraction audit and re-extraction (2026-03-12 evening)**: Self-audit found three bugs. All 8 CSVs re-extracted with fixes:

   **Bug 1 — `3dROIstats` parsing** (affected all 6 core ROI CSVs): `3dROIstats -nzmean` outputs TWO tab-separated columns per line (Mean and NZMean). The parser used `tr -d '[:space:]'` which stripped the tab, concatenating the two values into a single garbled string (e.g., `0.0853600.085360`). Fix: `awk '{print $NF}'` to extract only the NZMean column.

   **Bug 2 — dmPFC Z-coordinate sign error** (affected dmPFC_betas.csv): When converting MNI RAS (0, 54, 33) to LPI for `3dUndump -orient LPI`, Y was correctly negated (54 → -54) but Z was not (33 should have been -33). In LPI, +Z = Inferior, so +33 placed the sphere 33mm inferior (ventral/orbital mPFC at MNI z≈-31) instead of 33mm superior (dorsal mPFC at MNI z≈+33). Fix: negate all three axes in MNI→LPI conversion.

   **Bug 3 — Amygdala grid mismatch** (affected Amygdala_betas.csv — was 100% NA): The lab's `Amyg_LR_resample+tlrc` was resampled to sub-1158's grid (65×77×65) which doesn't match our subjects' grid (64×76×64). `3dROIstats` requires exact grid match and silently returned empty output. Fix: resample Amygdala mask to GLM grid with nearest-neighbor interpolation before extraction.

3. **Mask provenance** (all verified with `3dCM` after re-extraction):

   | ROI | Source | Center of Mass (DICOM) | Voxels |
   |-----|--------|----------------------|--------|
   | vmPFC | VMPFC-mask-final.nii.gz | (-0.06, -42.2, -14.6) | 1245 |
   | dACC1 | dACC1-6mm-bilat.nii.gz | (0, 1.5, 37.5) | 46 |
   | dACC2 | dACC2-6mm-bilat.nii.gz | (1.5, -22.5, 40.5) | 65 |
   | AntInsula | AntInsula-thr10-3mm-bilat.nii.gz | (-5.3, -17.1, -1.7) | 162 |
   | VS | striatum-structural-3mm-VS-bilat.nii.gz | (-0.01, -10.3, -8.6) | 107 |
   | Amygdala | Amyg_LR_resample+tlrc (resampled to GLM grid) | (-1.9, 5.3, -16.3) | 98 |
   | R-TPJ | Mars et al. (2012) clustALL_R (resampled) | (-54.8, 43.4, 24.1) | 438 |
   | dmPFC | 8mm sphere, Schurz et al. (2014) MNI (0,54,33) | (1.5, 55.5, -34.5) | 81 |

   **R-TPJ**: Mars et al. (2012) right TPJ parcellation — all R clusters combined, thr50. Source: `AnatomicalROI_Masks/ROIs/MNI_MarsTPJParcellation/TPJ_thr50_summaryimage_3mm_clustALL_R.nii.gz`.

   **dmPFC**: Schurz, M., Radua, J., Aichhorn, M., Richlan, F., & Perner, J. (2014). Fractionating theory of mind: A meta-analysis of functional brain imaging studies. *Neuroscience & Biobehavioral Reviews*, 42, 9–34.

   **Mask provenance note**: The lab's `Preferred_ROI_Combination/Medial_Prefrontal+tlrc` was evaluated and rejected — center of mass z=6 (pregenual/ventral mPFC, overlaps vmPFC). The Schurz coordinate (z=33) is unambiguously dorsal.

## 2026-03-05

1. Added `scripts/qc_summary.sh`: parses AFNI's per-subject `out.ss_review.*.txt` QC files and produces a single markdown report (`docs/qc-summary.md`) with group-level summary statistics, flagged subjects, a full subject table, and metric definitions. Flag thresholds: censor >15%/30%, max displacement >3mm, TSNR <40, Dice <0.90, any run >40% censored.
2. Initial QC report generated: 38 subjects, 24 flagged (mostly benign maxDisp>3mm from single-TR head jerks already handled by censoring), 0 exceed 30% censor exclusion threshold. All 38 subjects pass standard QC criteria.

## 2026-02-28

1. Replaced `analysis/subject_table.csv` (scraped/merged from server sources) with canonical participant data files: `learn_clinical.csv` (59 subjects, 92 clinical/demographic columns) and `learn_behavioral.csv` (6649 trials, 9 columns of LEARN task behavioral data). Old `subject_table_README.md` and `subject_table_qc.txt` removed.
2. GLM rerun completed on server (38/38, Stages 1-3 all passed audit).
3. Added `scripts/4_extract_rois.sh` (Stage 4): extracts NZmean beta coefficients from 6 anatomical ROI masks (vmPFC, dACC1, dACC2, AntInsula, VS, Amygdala) using `3dROIstats`. Outputs one CSV per ROI. Handles fallback subjects (2-3 runs) by parsing HEAD files to detect available conditions. Follows lab's standard protocol (see `literature/Extracting_ROIs_Slab.pdf`).
4. Lab's ROI extraction protocol PDF (`Extracting ROIs - Slab.pdf`) added to `literature/`.

## 2026-02-27

1. Added `-goforit 10` to `-regress_opts_3dD` in proc template to handle timing collinearity warnings in some subjects.
2. Fixed bug in fallback patch (`3b_fallback_patch.py`): Anticipation regressor (`Anticipation_pred_fdk.1D` / `Anticipation.PredFdk`) was dropped when rewriting stim list for 2–3 run subjects.
3. Existing 38/38 GLM outputs are from the pre-anticipation template; GLM rerun required.

## 2026-02-25

1. Repository reimagined: `rsa-learn/` renamed to `pipeline/`, scripts given clean names.
2. Codex governance docs (soul files, HTML protocol, operating model, next-agent specs) deleted — content consolidated into `CLAUDE.md`.
3. Single-command wrapper `run_pipeline.sh` removed — stages run individually via `1_fix_events.py`, `2_generate_timing.sh`, `3_run_glm.sh`.
4. Server synced to match new structure; old files moved to `sandbox/`.
5. Repo flattened: `pipeline/` removed so repo root mirrors server layout. `scripts/` and `docs/` now live at root. `sync_to_server.sh` deleted — server uses `git pull` directly.
6. Data folder READMEs placed inside actual data folders (`bids_fixed/README.md`, etc.) with gitignore negation patterns.
