# LEARN · RSA and inter-subject correlation of social-evaluative feedback

Representational Similarity Analysis and Inter-Subject Correlation of the LEARN social-feedback fMRI task.
Thirty-three adolescents completed four runs of a social-evaluation learning task. Single-subject GLMs estimate
run-wise, valence-split feedback responses for four peers with no spatial smoothing, and three analyses relate
those responses to trait social anxiety (SCARED child social subscale).

**[Methods walkthrough](https://dzweben.github.io/sdn-learn-rsa/walkthrough/)** ·
**[Interactive results report](https://dzweben.github.io/sdn-learn-rsa/report/)** ·
**[ROI atlas (36 regions)](rois/)**

---

## The three findings

| # | Analysis | Result | FDR |
|---|----------|--------|-----|
| 1 | **Model Alignment RSA** | Higher social anxiety tracks rostral-ACC peer representations that sharpen across runs. SA by run interaction, b = +0.032, t = +3.62, p<sub>joint</sub> = .0007 | **q = .025** |
| 2 | **Temporal ISC** (36 social-brain ROIs) | Higher social anxiety tracks a BOLD time course that drifts from the group. rACC rho = -0.53, aMCC rho = -0.50 | q = .052 / .059 |
| 3 | **Whole-brain ISC** (Schaefer-400) | One parcel survives across the cortex, dorsal medial frontal (RH_Cont_Cing), rho = -0.65 | **q = .017** |

All three converge on rostral and mid-cingulate medial frontal cortex.

---

## The pipeline

One numbered, idempotent, config-driven script set. Every path and the 33-subject list come from
`pipeline/config.sh`, so nothing is hard-coded anywhere else. `GLM_LABEL=feedback_runwise_glm`.

```
bids/  ->  events_fixed/  ->  timing/  ->  derivatives/afni/IndvlLvlAnalyses/  ->  derivatives/afni/results/
   01            02             03                      04 + 05
```

| Step | Script | In to out |
|------|--------|-----------|
| -- | `pipeline/config.sh` | single source of truth: paths, 33-subject list, GLM label, mask, clinical table |
| 01 | `pipeline/01_fix_events.py` | `bids/` to `events_fixed/`. Relabels missed-prediction feedback to canonical peer x valence by majority vote |
| 02 | `pipeline/02_make_timing.sh` | `events_fixed/` to `timing/`. Run-wise AFNI `.1D` onset:duration files, including the prediction-to-feedback anticipation regressor |
| 03 | `pipeline/03_glm.sh` | raw BIDS + `timing/` to per-subject GLM. `afni_proc.py` (despike, tshift, align, tlrc, volreg, mask, scale, regress, **no blur**) then `3dDeconvolve`, 41 regressors |
| 04 | `pipeline/04_model_alignment_and_temporal_isc.py` | betas to `results/`. **Findings 1 and 2** |
| 05 | `pipeline/05_wholebrain_isc.py` | pb04 timeseries to `results/`. **Finding 3** |

```bash
bash pipeline/run_all.sh              # raw BIDS to results
bash pipeline/run_all.sh --analysis   # skip 01-03, re-run only the analyses
bash pipeline/03_glm.sh 1055 958      # any single step, any subset of subjects
```

Every step skips finished work, so re-running is safe. Step 03 is the heavy one; fit it on CR2.

### Two method choices that matter
- **No spatial smoothing.** RSA reads fine-grained multivoxel patterns that a blur would destroy.
- **ISC is computed per run, then averaged.** Each warped run is z-scored and leave-one-out ISC is computed
  within that run; the four values are averaged. It is not a concatenated series.

---

## Repository map

```
Learn-CR-Pipeline/
├── pipeline/              the settled analytic pipeline (01 to 05 + config + lib engines)
├── analysis/
│   ├── report/            interactive results report (index.html + data)
│   ├── learn_clinical.csv     subject-level clinical table, de-identified (SA measure, usability flags)
│   └── learn_behavioral.csv   trial-level behavioral data
├── guides/
│   ├── pipeline-walkthrough/  the methods walkthrough (published to Pages)
│   └── pi-walkthrough/        PI-facing summary site
├── rois/                  the 36-region social-brain atlas (labeled NIfTI + masks + label table)
├── presentations/
│   ├── Flux_2026/         conference abstract + methods
│   └── first-year-talk/   first-year talk deck
├── site/                  landing page published to GitHub Pages
├── bids_fixed/ TimingFiles/ derivatives/   data directories (contents live on the clusters)
└── .github/workflows/     Pages deployment
```

Other RSA methodologies that were explored (searchlight, Anna-Karenina IS-RSA, parcel-wise RSA, LSS, Glasser
and Schaefer variants) are kept separately, not in this repo.

---

## Where the data live

The pipeline runs on two Temple clusters. `RSA-learn/` has the same layout and the same absolute path on both,
so any script that runs on one runs on the other unchanged.

| Copy | Host | Path |
|------|------|------|
| CR1 (record) | cla19097.tu.temple.edu / 155.247.67.31 | `/data/projects/STUDIES/LEARN/fMRI/RSA-learn` |
| CR2 (compute) | 155.247.66.164 | `/data/projects/STUDIES/LEARN/fMRI/RSA-learn` |

Source data read from the parent LEARN study (not inside `RSA-learn/`):

- Raw BIDS `/data/projects/STUDIES/LEARN/fMRI/bids`
- SSW anatomical warps `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/ssw/sub-<id>`
- Group EPI mask `/data/projects/STUDIES/LEARN/fMRI/Masks/LEARN_Grp90+tlrc`

Each data directory on the clusters carries its own README describing what is in it and what reads it.

---

## Reproducing the findings

```bash
ssh tur50045@155.247.66.164
cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn
source pipeline/config.sh
bash pipeline/run_all.sh --analysis
```

Writes three JSON files to `derivatives/afni/results/`:

| File | Finding |
|------|---------|
| `al18_hybrid_learning_rsa.json` | 1. Model Alignment RSA |
| `al18_hybrid_temporal_isc.json` | 2. Temporal ISC |
| `wholebrain_400_temporal_isc_results.json` | 3. Whole-brain Schaefer-400 ISC |

Expected: rACC b = +0.032 q = .025 · rACC rho = -0.53 q = .052 · RH_Cont_Cing rho = -0.65 q = .017.
