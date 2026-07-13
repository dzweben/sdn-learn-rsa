# `pipeline/` — raw BIDS → the three findings

> **The full visual guideline is [`walkthrough.html`](walkthrough.html)** — open it in a browser for the top-to-bottom map: every script, its exact command, inputs/outputs, where the data live, and every source link.


This is the **entire** analysis, start to finish, as a numbered, idempotent set of
scripts. Everything reads paths + the subject list from **`config.sh`** — change a
path in one place, nowhere else. Nothing here is a dead end; the dead ends and
exploratory work live in `../archive/`.

## The three findings this produces

1. **Model Alignment RSA** — higher social anxiety → neural peer representations that better match ground truth and sharpen faster across runs (headline: rostral ACC SA × Run interaction).
2. **Temporal ISC** — higher SA → BOLD time course drifts further from the group (idiosyncrasy), strongest in rACC / aMCC.
3. **Whole-brain Schaefer-400 ISC** — the same idiosyncrasy test across all cortex, for context + FDR.

## The steps

| # | script | in → out | what |
|---|--------|----------|------|
| — | `config.sh` | — | paths, 33-subject list, `GLM_LABEL=feedback_runwise_glm`, ROI/mask/clinical |
| 01 | `01_fix_events.py` | `bids/` → `events_fixed/` | relabel missed-prediction feedback to canonical peer×feedback |
| 02 | `02_make_timing.sh` | `events_fixed/` → `timing/` | run-wise `.1D` (FBM/FBN × peer × run, pred, resp, anticipation) |
| 03 | `03_glm.sh` | raw BIDS + `timing/` → `…/<id>.results.feedback_runwise_glm/` | AFNI **no-blur** proc → pb04 → 3dDeconvolve (valence-split, 41 reg) |
| 04 | `04_model_alignment_and_temporal_isc.py` | betas → `results/` | **finding #1 + #2** (36 ROI RSA + temporal ISC) |
| 05 | `05_wholebrain_isc.py` | pb04 → `results/` | **finding #3** (Schaefer-400 whole-brain ISC) |

`lib/` holds the two validated engines (`_gen_timing_engine.sh`, `_afni_proc_engine.sh`)
that 02 and 03 drive — kept intact so the numbers reproduce exactly.

## Run it

```bash
source pipeline/config.sh          # optional; run_all sources it for you
bash   pipeline/run_all.sh         # everything, raw BIDS → results
bash   pipeline/run_all.sh --analysis   # skip preprocessing, re-run just 04–05
```

Individual steps are runnable on their own (`bash pipeline/03_glm.sh 1055`).
Step 03 is the only heavy one (~20–40 min/subject); it **skips** any subject already
fit, so re-running is cheap.

## Why "no blur" and "corrected timing"

- **No spatial smoothing** — RSA needs unsmoothed multivoxel patterns.
- **Corrected (pre-enrichment) timing** — an intermediate "enriched" event set altered
  the prediction/response regressors and attenuated the effect. A controlled re-fit
  (same pb04, only timing swapped) proved it. See `../docs/` for the provenance trail.
