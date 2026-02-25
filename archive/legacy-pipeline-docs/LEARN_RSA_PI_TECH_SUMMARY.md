# LEARN RSA — PI‑Facing Technical Summary

## Overview
This document explains what I implemented for the RSA run‑wise GLM and how it works at a practical, syntax‑level without turning into a full methods appendix. The goal was to keep the model run‑wise, produce per‑run betas, and also compute across‑run averages, while ensuring missing confounds were correctly reconstructed when absent.

## Timing (run‑wise)
Timing files are generated per subject directly from the BIDS events into `RSA-learn/TimingFiles/Full/sub-<ID>/NonPM_*_runX.1D`. Each timing file has **four rows** (one per run), and runs with no events are marked with `*`. AFNI is explicitly told to interpret these as local (run‑wise) timings using `-local_times`, which prevents the “global timing” misinterpretation that produces warnings when rows are `*`.

## Model (GLM / AFNI)
The model is generated via `afni_proc.py` (script: `LEARN_ap_Full_RSA_runwise.sh`). I used AM1 timing with `dmBLOCK(0)`:
- `-regress_stim_times_AM1`
- `-regress_basis_multi 'dmBLOCK(0)'`

For each run, the model includes **8 peer×feedback regressors** (FBM/FBN × Mean60/Mean80/Nice60/Nice80). It also includes **8 prediction/response regressors** (`Pred.*`, `Resp.*`). For 4‑run subjects, that is **40 stimulus regressors** total. Serial autocorrelation is modeled with **3dREMLfit**.

## Outputs (run‑wise + across‑run averages)
Per run, the model yields **14 betas** (4 peer + 2 feedback + 8 peer×feedback). Across‑run averages are computed as **GLTs** over the run‑wise betas:
- For 4‑run subjects, weights are 1/4.
- For 2–3 run subjects, weights are 1/N (dynamic GLTs).

This yields the **same 14 contrasts** averaged across all available runs without collapsing the run‑wise design.

## Confounds (nuisance regressors)
The GLM includes three confound files per subject:
- `aCompCor6.1D` = a_comp_cor_00–05 (WM/CSF noise components)
- `cosine.1D` = cosine* drift regressors
- `fd.1D` = framewise displacement (NaN→0)

These live at:
`/derivatives/afni/confounds/sub-<ID>/sub-<ID>_task-learn_allruns_{aCompCor6,cosine,fd}.1D`

## Missing confounds — what happened and how it was fixed
Some subjects failed with errors like `cp: cannot stat ... aCompCor6/cosine/fd`. That meant the AFNI confounds `.1D` files were missing, not that the task data were missing. The fix was to **rebuild the `.1D` files directly from fMRIPrep confounds TSVs**, using a deterministic mapping:
- Source: `/derivatives/fmriprep/sub-<ID>/func/sub-<ID>_task-learn_run-*_desc-confounds_timeseries.tsv`
- Mapping:
  - `a_comp_cor_00..05 → aCompCor6.1D`
  - `cosine* → cosine.1D`
  - `framewise_displacement (NaN→0) → fd.1D`
- Then concatenate run‑wise rows into all‑runs `.1D` files per subject.

This is not guesswork; it directly reproduces the same columns already used in subjects with intact confounds.

## Key AFNI options that matter
Two AFNI options are essential for the run‑wise model:
- `-local_times` ensures each timing row maps to a run.
- `-allzero_OK` allows regressors that are empty in a run.

GLTs then encode across‑run averages without collapsing the design.
