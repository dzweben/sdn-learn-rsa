# Decision Log (Canonical Project Decisions)

## 2026-07-13

1. **Clean `pipeline/` reproduces all three findings — ISC method locked in.** The refactored
   `pipeline/` (config-driven `01`→`05`, `GLM_LABEL=feedback_runwise_glm`) is deployed and verified
   on CR2. Reproduces exactly: **#1** rACC Model-Alignment SA×Run `b=+.032, p_joint=.0007, q=.025`;
   **#2** temporal ISC rACC `ρ=−.532, q=.052` / aMCC `ρ=−.497, q=.059`; **#3** whole-brain Schaefer-400
   survivor `RH_Cont_Cing ρ=−.649, q=.017` (1 FDR of 400).
2. **The two ISC findings use warped LOO ISC computed PER RUN then AVERAGED across runs, with each
   warped run z-scored** — NOT concatenated. `pipeline/04:run_temporal_isc` and `pipeline/05` are
   faithful ports of the original CR1 producers `analysis/isc_warped_36_hybrid.py` (finding #2) and
   `analysis/wholebrain_temporal_isc.py` (finding #3). An earlier concatenate-then-ISC implementation
   under-reproduced (rACC −.485, survivor −.58) and was wrong; corrected here.
3. `pipeline/05` uses the nilearn Schaefer-400 2mm atlas (equivalent to the original's uploaded copy)
   with the original `affine_transform` resampling. Survivor parcel is labeled `RH_Cont_Cing_1` by
   nilearn vs `RH_Cont_Cing_2` in the report — same parcel/stats, label-index offset only.
4. `pipeline/04` no longer computes the exploratory spatial pattern IS-RSA (archived); it produces
   only findings #1 and #2. `isc_analysis.py` (feedback-TR-masked "AllFeedback" ISC) is NOT one of
   the three findings and must not be used for them.
5. Fixed broken literal-`*` pb04 symlinks for subjects 1158/1196 in `_oldtiming` (pointed to the
   preprocessing-identical `_collapsed` pb04); minor effect, but ISC scripts now use all 33.

## 2026-04-07

1. **Searchlight Learning RSA** (`analysis/searchlight_learning_rsa.py`): Whole-brain searchlight testing H1 — whether neural peer representations progressively align with the M3 peer-identity model RDM across runs, moderated by continuous trait SA.

   Key design decisions:
   - **Uses run-wise peer GLT contrasts** — `{peer}.r{run}_GLT#0_Coef` (avg of FBM+FBN per peer per run), not prediction-phase betas (which are collapsed across runs in the current GLM).
   - **Model RDM (M3)** — Peer identity dissimilarity: `d(i,j) = |P(Nice)_i - P(Nice)_j| / 0.60`. 4×4 matrix, 6 upper-triangle values. Same RDM used for prediction and feedback phases per poster.
   - **Within-subject RSA per run** — 4×4 neural RDM (1 - Pearson r) correlated with M3 upper triangle via Spearman → Fisher-z.
   - **Moderation model** — `z_rsa ~ b0 + b1*run + b2*SA + b3*(run × SA)`. b3 tests whether SA moderates the alignment trajectory.
   - **Permutation test** — SA labels permuted across subjects (within-subject run structure preserved), 10,000 permutations, two-tailed p for b3.
   - **Cluster correction** — Voxel threshold p<0.01, cluster extent reporting (same framework as searchlight IS-RSA).

## 2026-02-24

1. Canonical timing root is `TimingFiles/Fixed2` (with anticipation files present).
2. Production scripts list reduced to five active scripts (fix, timing, proc template, fallback, GLM).
3. Non-canonical artifacts must be moved to `sandbox/`, never left in production paths.
4. Top-level README must remain a complete folder map and runbook.
5. Undergrad training handoff starts at timing generation and GLM execution, not historical fixes.

## 2026-03-17

1. **Trimmed to NN + AnnaK Gradient only** — Removed AnnaK_Threshold and AnnaK_Product sensitivity models from `isrsa_anna_karenina.py`. Two models are the standard in the IS-RSA literature (Finn & Scheinost 2020, Ilomäki et al. 2025): NN tests parametric similarity, AnnaK Gradient tests the idiosyncrasy hypothesis. Both are now FDR-corrected as primary models. 32 total tests (8 ROIs × 2 feedback × 2 models) instead of 64.

2. **Config metadata fix** — Lines 831-832 of `isrsa_anna_karenina.py` still recorded old wrong condition names in the saved `run_config.json`. Fixed to match corrected NICE/MEAN indices.

3. **Mount-safe overnight runner** (`analysis/run_isrsa_overnight.py`) — Master script that copies all input data to `/tmp` before running, so mount drops during computation cannot crash the analysis. Runs ROI IS-RSA + searchlight IS-RSA, copies results back, generates HTML report.

4. **HTML report generator** (`analysis/generate_isrsa_report.py`) — Standalone zero-dependency script that reads result CSVs and figures, produces a self-contained HTML report with methods, results tables, embedded figures, and auto-generated pattern interpretation.

5. **PI-focused AnnaK results report** (`analysis/generate_annak_results.py`) — New standalone HTML generator structured for PI review: (1) ROIs, Analysis 1, Hypotheses, (2) ROI IS-RSA Results, (3) Analysis 2: Searchlight (exploratory), (4) Searchlight Results, (5) Conclusions. Labels AnnaK vs NN models clearly, explains convergence = inverted gradient (low-SA idiosyncrasy), no em dashes, doesn't over-explain ROI functions.

## 2026-03-16

1. **BUGFIX: FBM/FBN condition grouping** — FBM = Feedback Mean, FBN = Feedback Nice (M/N is the valence of the delivered feedback). Previous code incorrectly interpreted M as "match" and N as "nonmatch," grouping conditions by congruence with peer type instead of by feedback valence. Fixed in all three IS-RSA scripts (`isrsa_anna_karenina.py`, `searchlight_isrsa.py`, `searchlight_cluster_correction.py`) and in `TimingFiles/Fixed2/README.md` and `derivatives/README.md`. **All prior IS-RSA results (ROI, searchlight, cluster correction) used wrong condition groupings and must be rerun.**

2. **Searchlight IS-RSA** (`analysis/searchlight_isrsa.py`): Whole-brain searchlight IS-RSA testing the AnnaK Gradient model at every 3-voxel radius sphere (~123 voxels), extending the ROI-based H2 analysis brain-wide.

   Key design decisions:
   - **Same condition collapse as ROI analysis** — Nice/Mean feedback, 33 subjects, SCARED social anxiety, AnnaK Gradient model `mean(SA_i, SA_j)`.
   - **10K Mantel permutations per voxel** — same as ROI script, two-tailed, simultaneous row/column shuffling.
   - **Minimum p-value: 1/10001 = 0.0001** — conservative permutation p.
   - **Group mask (90% overlap, 70573 voxels)** — ensures all subjects contribute.
   - **Results**: NIfTI volumes (rho, z, p) per feedback type.
   - **Runtime**: ~48 minutes on local machine over network mount.
   - **Output**: `derivatives/afni/IS-RSA-searchlight/results/`.

2. **Atlas-based cluster labeling** (`analysis/label_searchlight_clusters.py`): Publication-quality anatomical labeling per COBIDAS guidelines (Nichols et al. 2017, Nat Neurosci).

   Key design decisions:
   - **Harvard-Oxford cortical + subcortical** (25% probability threshold) — primary anatomical labels, resampled to 3mm searchlight grid via nearest-neighbor interpolation.
   - **Schaefer 400 / Yeo 7-network** — functional network labels at each peak.
   - **White-matter fallback** — when peak voxel falls in atlas white-matter/unclassified zone (common at cortical boundaries), falls back to the dominant specific cortical region in the cluster overlap.
   - **Cerebellar fallback** — Harvard-Oxford doesn't cover cerebellum; coordinate-based heuristic labels cerebellar clusters (z ≤ -25, y ≤ -25, per Diedrichsen et al. 2009).
   - **Sub-peaks** — up to 2 sub-peaks per cluster, ≥8mm apart (SPM convention).
   - **Cluster overlap** — supplementary table reports %-overlap with each atlas region per cluster.
   - **COBIDAS-compliant table columns** — Region, Hemisphere, k(vox), k(mm³), Peak ρ, MNI x/y/z, Network.
   - **Two thresholds reported** — p < 0.01 (exploratory) and p < 0.001 (conservative).
   - **Output**: CSV cluster tables + overlap tables + text report at `IS-RSA-searchlight/cluster_tables/` and `cluster_tables_p001/`.

3. **Cluster-level correction** (`analysis/searchlight_cluster_correction.py`): Permutation-based cluster-level FWE correction for the searchlight.

   Key design decisions:
   - **Two-pass approach** — Pass 1: 1000 Mantel permutations (shuffle subjects, compute raw rho at each voxel without inner permutations). Pass 2: derive voxel-specific thresholds from the null rho distribution, then find max cluster size per null map.
   - **Voxel-specific thresholds** — the 99th percentile of |null_rho| at each voxel corresponds to p < 0.01. This properly accounts for voxel-to-voxel variability in the null distribution.
   - **Multiprocessing support** — `--n-jobs 8` for parallel execution on the server.
   - **Status**: Script written, awaiting server execution.
   - **Expected runtime**: ~30 min on 8-core server (much faster than inner-permutation approach).

4. **ROI-based IS-RSA FDR correction updated** (`analysis/isrsa_anna_karenina.py`): FDR correction families changed from per-model (16 tests) to per-model × per-feedback (8 tests per family). Rationale: Nice and Mean represent separate hypotheses — Nice = classical AnnaK (idiosyncrasy), Mean = inverted AnnaK (convergence). User identified that combining them inflates the correction burden for independent predictions.

   Results (Run 4):
   - AntInsula/Mean AnnaK Gradient: rho=+0.229, p_fdr=0.014 (**significant**)
   - AntInsula/Mean idiosyncrasy: r=-0.499, p_fdr=0.004 (**significant**)
   - dACC1/Nice AnnaK Gradient: rho=-0.220, p_fdr=0.071 (trend, does not survive FDR)

## 2026-03-15

1. **IS-RSA Anna Karenina analysis rewrite** (`analysis/isrsa_anna_karenina.py`): Rewrote to match poster H2 exactly. Prior version ran IS-RSA on all 8 conditions separately with 2 models — wrong. Correct analysis: collapse to Nice vs Mean feedback valence, test with 4 models.

   Key design decisions:
   - **Feedback valence collapse (Nice vs Mean)** — per poster H2: "2-condition neural RDM contrasting Nice versus Mean feedback." FBM = Feedback Mean, FBN = Feedback Nice (M/N indicates the valence of the feedback delivered). Nice feedback = all FBN conditions (FBN.Mean60, FBN.Mean80, FBN.Nice60, FBN.Nice80). Mean feedback = all FBM conditions (FBM.Mean60, FBM.Mean80, FBM.Nice60, FBM.Nice80). Tested separately for Nice, Mean, and Nice-Mean contrast.
   - **Four behavioral models** — per poster + Finn & Scheinost (2020) + literature verification (Ilomäki et al. 2025): (1) NN: `1/(1+|SA_i-SA_j|)`, (2) AnnaK Gradient: `mean(SA_i,SA_j)`, (3) AnnaK Threshold: `min(SA_i,SA_j)`, (4) AnnaK Product: `SA_i*SA_j`. NN is the competing hypothesis (parametric); the 3 AnnaK models test idiosyncrasy with different geometric assumptions. Testing all 4 is standard practice.
   - **33 subjects (Usable_fMRI=1 only)** — 5 excluded subjects (1028, 1178, 1351, 1407, 1422) have legitimate QC concerns. Matches Clarkson (2024).
   - **SCARED social anxiety as primary measure** — plus BFNE-II, parent-report SCARED social, SCARED total.
   - **Two analyses**: (1) Valence IS-RSA — Mantel test of neural ISM vs behavioral model per ROI × feedback type × measure × model, (2) Idiosyncrasy scores — leave-one-out distance from group average, correlated with raw SCARED.
   - **Mantel test: Spearman + 10K permutations, two-tailed** — FDR correction across all tests.
   - **Placed in `analysis/` not `scripts/`** — downstream analysis, not pipeline stage.

## 2026-03-13

1. **Stage 5 — voxel-wise pattern extraction** (`5_extract_patterns.sh`): Stage 4/4b extracted ROI means (one scalar per condition per ROI per subject) using `3dROIstats -nzmean`. RSA requires multi-voxel patterns — vectors of beta values across all voxels in each ROI — to compute representational dissimilarity (1 − Pearson r between condition vectors). Stage 5 uses `3dmaskdump` + `1dtranspose` to extract the full voxel-level data.

   Key design decisions:
   - **AFNI-native, not Python**: `3dmaskdump` is purpose-built for dumping voxel values within a mask. Consistent with the all-bash/AFNI pipeline (Stages 1–4b). No new dependencies (nibabel/nilearn not needed on server).
   - **Explicit mask resampling**: Stage 4 relied on `3dROIstats` auto-resampling; `3dmaskdump` requires exact grid match. All 8 masks resampled to GLM grid with `3dresample -rmode NN` before extraction.
   - **Grid consistency verification**: Script verifies all 38 subjects share the same grid dimensions before extracting. Fails loudly on mismatch.
   - **Cross-validation**: For every subject × ROI × condition, computes NZmean of the voxel pattern and compares against the known-good Stage 4/4b CSV values. Any discrepancy > tolerance (default 0.001) is flagged.
   - **Output format**: One `.1D` text file per subject per ROI. Rows = 41 conditions, columns = N voxels. Comment headers. NaN rows for missing conditions (fallback subjects). Loadable with `np.genfromtxt(file, comments='#')`.
   - **All 8 ROIs in one script**: Unlike Stage 4 (core 6) + 4b (mentalizing 2), Stage 5 handles all 8 ROIs in a single self-contained script, including R-TPJ resampling and dmPFC sphere creation.

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
