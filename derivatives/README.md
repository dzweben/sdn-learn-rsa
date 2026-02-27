# derivatives/

This folder is the output of **Stage 3** (`scripts/3_run_glm.sh`).

## What's in here

Per-subject AFNI preprocessing and GLM results:

```
derivatives/afni/IndvlLvlAnalyses/
├── 958/
│   ├── proc.958.LEARN_RSA_runwise_AFNI       ← the proc script that was run
│   ├── output.proc.958.LEARN_RSA_runwise_AFNI ← stdout/stderr log
│   └── 958.results.LEARN_RSA_runwise_AFNI/    ← results directory
│       ├── stats.958+tlrc.HEAD                ← THE FINAL PRODUCT
│       ├── stats.958+tlrc.BRIK.gz
│       ├── cbucket.stats.958+tlrc.HEAD        ← coefficient bucket
│       ├── errts.958+tlrc.*                   ← residual time series
│       ├── mask_epi_anat.958+tlrc.*           ← EPI-anat intersection mask
│       ├── IDEAL_sum.1D                       ← ideal sum for sanity check
│       └── ... (AFNI preprocessing intermediates)
├── 1028/
│   └── ...
└── (38 subjects total)
```

## What the GLM does

Processing blocks (in order): despike, tshift, align, tlrc, volreg, mask, scale, regress.

No blur block — patterns are kept unsmoothed for RSA.

### Regressors (41 total)

- **32 run-wise feedback**: 8 peer×feedback conditions × 4 runs
  - FBM.Mean60.r1, FBN.Mean60.r1, ... FBN.Nice80.r4
- **8 prediction/response**: Pred.Mean60, Resp.Mean60, ... Resp.Nice80
- **1 anticipation**: Anticipation.PredFdk (ISI between prediction and feedback)

All use AM1 stimulus type with `dmBLOCK(0)` basis function. `-goforit 10` is set in `-regress_opts_3dD` to handle expected collinearity between anticipation and feedback regressors.

### GLTs (45 total)

| # | Label | What it tests |
|---|---|---|
| 1 | Task.V.BL | All task regressors vs baseline |
| 2 | Prediction.V.BL | All predictions vs baseline |
| 3 | Prediction.Mean.V.Nice | Mean predictions vs Nice predictions |
| 4 | FB.V.BL | All feedback vs baseline |
| 5 | FBM.V.BL | Feedback match vs baseline |
| 6 | FBN.V.BL | Feedback no-match vs baseline |
| 7 | FBM.V.FBN | Feedback match vs no-match |
| 8-23 | Cond.rN | Per-run condition means (4 conditions × 4 runs) |
| 24-31 | FBM.rN / FBN.rN | Per-run FBM and FBN averages |
| 32-39 | FBM.Cond.all / FBN.Cond.all | Cross-run condition averages |
| 40-43 | Cond.all | Cross-run condition averages (collapsed across FBM/FBN) |
| 44-45 | FBM.all / FBN.all | Grand averages |

## How it was produced

```bash
bash scripts/3_run_glm.sh
```

For subjects with fewer than 4 runs, `3b_fallback_patch.py` rewrites the proc template to use only available runs, includes the anticipation regressor, and adjusts all GLT weights.

## The final product

`stats.<id>+tlrc.HEAD` — this is the AFNI stats dataset containing all beta coefficients and GLT results. This is what you extract run-wise betas from for RSA.
