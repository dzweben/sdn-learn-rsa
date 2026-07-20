# LEARN RSA Project

Year 1 PhD project analyzing fMRI data from the LEARN social-feedback task using Representational Similarity
Analysis and Inter-Subject Correlation. The pipeline produces run-wise, valence-split feedback betas via AFNI GLM
(no spatial smoothing, explicit anticipation modeling) for the 33-subject analytic sample, then runs three
analyses.

## Canonical pipeline (`pipeline/`)

One numbered, idempotent, config-driven set that goes raw BIDS to the three findings. Every path and the
33-subject list come from `pipeline/config.sh`. `GLM_LABEL=feedback_runwise_glm`.

| Step | Script | In to out |
|---|---|---|
| -- | `config.sh` | single source of truth (paths, subject list, mask, clinical table) |
| 01 | `01_fix_events.py` | `bids/` to `events_fixed/` |
| 02 | `02_make_timing.sh` | `events_fixed/` to `timing/` |
| 03 | `03_glm.sh` | raw BIDS + `timing/` to `<id>.results.feedback_runwise_glm/` (AFNI no-blur, then 3dDeconvolve, 41 regressors) |
| 04 | `04_model_alignment_and_temporal_isc.py` | betas to `results/`. Finding 1 (Model Alignment RSA, rACC SA x Run q=.025) and Finding 2 (Temporal ISC, rACC rho=-.53) |
| 05 | `05_wholebrain_isc.py` | pb04 to `results/`. Finding 3 (Schaefer-400 ISC, RH_Cont_Cing q=.017) |

Run: `bash pipeline/run_all.sh`, or `--analysis` to skip 01 to 03. Details in `pipeline/README.md`.

**ISC (04 and 05) is warped leave-one-out per run, then averaged across runs, z-scored per run.** It is not
concatenated. This is what reproduces the reported numbers.

The interactive report is `analysis/report/index.html`. The methods walkthrough is
`guides/pipeline-walkthrough/index.html`, published to GitHub Pages.

## Clusters

`RSA-learn/` has the same layout and the same absolute path on both clusters.

| Copy | Host | Path |
|---|---|---|
| CR1 (record) | cla19097.tu.temple.edu / 155.247.67.31 | `/data/projects/STUDIES/LEARN/fMRI/RSA-learn` |
| CR2 (compute) | 155.247.66.164 | `/data/projects/STUDIES/LEARN/fMRI/RSA-learn` |

Fit the GLM (step 03) on CR2. The older CR1 box terminates long `3dDeconvolve` jobs under load.

Source data read from the parent LEARN study, outside `RSA-learn/`:

- Raw BIDS `/data/projects/STUDIES/LEARN/fMRI/bids`
- SSW anatomical warps `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/ssw/sub-<id>`
- Group EPI mask `/data/projects/STUDIES/LEARN/fMRI/Masks/LEARN_Grp90+tlrc`

Derivatives on the clusters hold the canonical `feedback_runwise_glm` output per subject
(`stats.<id>+tlrc` and `pb04.<id>.r0?.scale+tlrc`) plus the three result JSONs. Every directory carries a README.

## Rules for making changes

1. One production pipeline only. No `v2`, `final2`, or parallel variants.
2. Safe execution order: fix events, generate timing, run GLM, then the analyses.
3. Documentation describes the preprocessing and analyses. Terse and explanatory, no em dashes.
