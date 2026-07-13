# Flux 2026 — Methods walkthrough

**Neural Representation and Learning of Peers in Youth Social Anxiety**
Zweben, Helion, Mitchell, Clarkson, Jarcho

This document walks through *exactly* how every result in the Flux 2026 abstract was produced — raw scans to the numbers on the poster. It is the human-readable companion to the `pipeline/` scripts. Numbers below are the settled values from the final analysis; the abstract reports the same set of findings (a few p-values shifted slightly during the final re-fit but the story is identical).

---

## 1. Sample & task

- **33 youth** (ages 10–15; M = 12.73, SD = 1.38; 45% female) — the deterministic analytic sample, defined as everyone with `Usable_fMRI == 1` in `learn_clinical.csv`.
- **Task:** 4 virtual peers who differ in how often they give positive vs. negative feedback. Each trial: participant *predicts* the peer's feedback, then *receives* it. 4 runs, learning each peer's disposition over time.
- **Social anxiety (SA):** SCARED child social-anxiety subscale (`scared_ch_social`), used dimensionally.
- **Peer ground truth (the RSA model):** peers differ in P(nice) — Nice80 .80, Nice60 .60, Mean60 .40, Mean80 .20. The model RDM is the pairwise `|P(nice)_i − P(nice)_j| / 0.60`.

## 2. Preprocessing → GLM (single betas per condition/run)

Raw BIDS → **AFNI `afni_proc.py`, no spatial smoothing** (unsmoothed patterns for RSA), MNI152-2009 template, 3 mm. No fMRIPrep, no blur. Motion + outlier censoring as in the lab AFNI pipeline.

**Event timing** comes from the corrected event labels (`1_fix_events.py`: missed-prediction feedback relabeled to canonical peer×feedback), turned into run-wise `.1D` timing files by `2_make_timing`. Feedback, prediction, response, and an explicit prediction→feedback anticipation (ISI) regressor.

**GLM:** `3dDeconvolve`, 41 regressors — feedback modeled per **peer × run × valence** (FBM/FBN), plus per-peer prediction, per-peer response, and anticipation; `dmBLOCK(0)`, `AM1`. The per-peer feedback pattern used by RSA is the `0.5·FBM + 0.5·FBN` contrast per peer per run.

> **Provenance note.** The betas of record are the valence-split GLM fit on the corrected pre-enrichment timing (the timing behind the abstract numbers). An intermediate "enriched" event set altered the prediction/response regressors and slightly attenuated the effect; the final pipeline uses the corrected timing, verified by a controlled re-fit that held preprocessing (pb04) fixed and swapped only the timing (rACC returned from b=.024 to b=.032). See `docs/`.

## 3. Analysis 1 — Model Alignment RSA (`pipeline/04_model_alignment_and_temporal_isc.py`)

For each subject × run × ROI (36 a priori social-brain ROIs from Alcalá-López et al. 2018; 30 cortical 10 mm spheres + 6 Harvard-Oxford subcortical):

1. Extract the 4 peer feedback patterns; build the 4×4 neural RDM (1 − Pearson r).
2. Spearman-correlate the neural RDM with the M3 peer-identity model RDM; Fisher-z → `z_rsa`.
3. Fit OLS across subject×run: `z_rsa ~ 1 + run_c + SA_c + run_c·SA_c` (run and SA mean-centered).
   - **SA main effect** (β_SA) = total alignment level as a function of SA.
   - **SA × Run interaction** (β_int) = *rate* alignment changes across runs as a function of SA.

**Permutation (the correct null for each term):**
- **SA main effect:** SA-only shuffle (SA labels swapped between subjects; run order fixed).
- **SA × Run interaction:** **joint shuffle** — SA swapped between subjects AND each subject's `z_rsa` scrambled across their 4 runs. Run must be randomized for a moderation term. 10,000 perms; BH-FDR across 36 ROIs.

**Result.** More severe SA → neural representations that more closely reflect true peer differences, and that strengthen faster across runs. Strongest in **rostral ACC**: higher overall level (β = .021, p = .038) and steeper across-run slope (**β = .032, p_joint = .0007, q_FDR = .025** — the single FDR survivor across 36 ROIs). Sub-threshold same-direction slope effects in L anterior insula (β = .025, p = .014), dmPFC (β = .024, p = .016), L amygdala (β = .027, p = .045).

## 4. Analysis 2 — Temporal ISC (`pipeline/04_model_alignment_and_temporal_isc.py`)

Temporally-warped leave-one-out ISC (Nastase et al. 2019) over the 36 social-brain ROIs. Per subject × ROI × **run**: the full 217-TR pb04 time course is warped to the group-median feedback-event onsets (piecewise-linear, correcting self-paced timing), z-scored, then correlated with the mean of the other 32 (Fisher-z). The four per-run ISC values are **averaged** (not concatenated). Each ROI's mean LOO-ISC is Spearman-correlated with SA; BH-FDR across 36.

**Result.** More severe SA → BOLD time course that drifts *further* from the group average (negative ρ = idiosyncrasy rises with SA), strongest in **rostral ACC** (ρ = −.532, p = .001, q = .052) and **anterior midcingulate** (ρ = −.497, p = .003, q = .059) — just outside FDR, in the same medial-frontal cortex as the RSA hit.

## 5. Analysis 3 — Whole-brain Schaefer-400 ISC (`pipeline/05_wholebrain_isc.py`)

The identical warped, per-run-averaged temporal-ISC ~ SA test extended to all 400 Schaefer-400 cortical parcels, for whole-brain context and FDR. **One parcel survives FDR** — a dorsal medial-frontal parcel (`RH_Cont_Cing`) adjacent to the aMCC sphere: **ρ = −.649, p = 4×10⁻⁵, q = .017** (1 of 400) — converging with the ROI-level Temporal ISC and the rACC RSA result.

## 6. Interpretation (abstract Discussion)

Higher SA is associated with **more accurate and faster learning** of peers' dispositions (RSA), *alongside* **more idiosyncratic processing** of the shared experience (ISC), concentrated in rostral ACC and neighboring regions that weigh the personal significance of social information. Socially anxious youth may be especially attuned to peers in accurate ways while remaining out of sync with how others experience the same moments.

---

## Reproducing this

Everything runs from `pipeline/` (see the top-level `README.md` and the "Run it" tab of the results report). The three result files backing the abstract:

- Model Alignment RSA + Temporal ISC (36 ROI): `al18_hybrid` outputs
- Whole-brain Schaefer ISC: `wholebrain_400_*_isc` outputs
- Interactive report (the "king" HTML): `results/index.html`
