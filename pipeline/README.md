# `pipeline/` - raw BIDS to the three findings

> The full methods walkthrough is at https://dzweben.github.io/sdn-learn-rsa/walkthrough/ : every script, its exact command, inputs and outputs, where the data live, and every source.


This is the entire analysis, start to finish, as a numbered, idempotent set of
scripts. Everything reads paths and the subject list from **`config.sh`**, so a path
changes in one place, nowhere else.

## The three findings this produces

1. **Model Alignment RSA** - higher social anxiety to neural peer representations that better match ground truth and sharpen faster across runs (headline: rostral ACC SA x Run interaction).
2. **Temporal ISC** - higher SA to BOLD time course drifts further from the group (idiosyncrasy), strongest in rACC / aMCC.
3. **Whole-brain Schaefer-400 ISC** - the same idiosyncrasy test across all cortex, for context + FDR.

## The steps

| # | script | in to out | what |
|---|--------|----------|------|
| -- | `config.sh` | -- | paths, 33-subject list, `GLM_LABEL=feedback_runwise_glm`, ROI/mask/clinical |
| 01 | `01_fix_events.py` | `bids/` to `events_fixed/` | relabel missed-prediction feedback to canonical peerxfeedback |
| 02 | `02_make_timing.sh` | `events_fixed/` to `timing/` | run-wise `.1D` (FBM/FBN x peer x run, pred, resp, anticipation) |
| 03 | `03_glm.sh` | raw BIDS + `timing/` to `.../<id>.results.feedback_runwise_glm/` | AFNI **no-blur** proc to pb04 to 3dDeconvolve (valence-split, 41 reg) |
| 04 | `04_model_alignment_and_temporal_isc.py` | betas to `results/` | **finding #1 + #2** (36 ROI RSA + temporal ISC) |
| 05 | `05_wholebrain_isc.py` | pb04 to `results/` | **finding #3** (Schaefer-400 whole-brain ISC) |

`lib/` holds the two validated engines (`_gen_timing_engine.sh`, `_afni_proc_engine.sh`)
that 02 and 03 drive - kept intact so the numbers reproduce exactly.

## Run it

```bash
source pipeline/config.sh          # optional; run_all sources it for you
bash   pipeline/run_all.sh         # everything, raw BIDS to results
bash   pipeline/run_all.sh --analysis   # skip preprocessing, re-run just 04-05
```

Individual steps are runnable on their own (`bash pipeline/03_glm.sh 1055`).
Step 03 is the only heavy one (~20-40 min/subject); it **skips** any subject already
fit, so re-running is cheap.

## Method notes

- **No spatial smoothing.** RSA reads fine-grained multivoxel patterns that a spatial blur would remove.
- **ISC is computed per run, then averaged.** Each warped run is z-scored and leave-one-out ISC is computed
  within that run; the four run values are averaged. It is not a concatenated series.
