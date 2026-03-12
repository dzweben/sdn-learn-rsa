# Decision Log (Canonical Project Decisions)

## 2026-02-24

1. Canonical timing root is `TimingFiles/Fixed2` (with anticipation files present).
2. Production scripts list reduced to five active scripts (fix, timing, proc template, fallback, GLM).
3. Non-canonical artifacts must be moved to `sandbox/`, never left in production paths.
4. Top-level README must remain a complete folder map and runbook.
5. Undergrad training handoff starts at timing generation and GLM execution, not historical fixes.

## 2026-03-12

1. ROI extraction (Stage 4) completed on server: 6 ROIs × 38 subjects, 0 failures, 42 columns per CSV (Subject + 41 conditions). Output in `derivatives/afni/ROI_extractions/`. All 4 pipeline stages now complete.

2. Added mentalizing ROI extraction (Stage 4b): R-TPJ and dmPFC.

   **R-TPJ mask**: Mars et al. (2012) right TPJ parcellation — all right-hemisphere clusters combined, thresholded at 50%. Source file: `AnatomicalROI_Masks/ROIs/MNI_MarsTPJParcellation/TPJ_thr50_summaryimage_3mm_clustALL_R.nii.gz`. Center of mass: MNI (56, -44, 23). 438 voxels at 3mm, resampled to GLM grid with nearest-neighbor interpolation.

   **dmPFC mask**: 8mm sphere at Schurz et al. (2014) mentalizing meta-analysis peak coordinates MNI (0, 54, 33). Created with `3dUndump -srad 8`. Citation: Schurz, M., Radua, J., Aichhorn, M., Richlan, F., & Perner, J. (2014). Fractionating theory of mind: A meta-analysis of functional brain imaging studies. *Neuroscience & Biobehavioral Reviews*, 42, 9–34. 81 voxels on 3mm GLM grid.

   **Mask provenance note**: The lab's existing `Preferred_ROI_Combination/Medial_Prefrontal+tlrc` was evaluated and rejected — its center of mass (0, 49 anterior, z=6) places it in pregenual/ventral mPFC, overlapping the existing vmPFC ROI. The Schurz coordinate (z=33) is unambiguously dorsal and distinct from all 6 existing ROIs.

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
