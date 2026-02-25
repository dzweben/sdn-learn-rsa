# TimingFiles/Fixed2/

This folder is the output of **Stage 2** (`scripts/2_generate_timing.sh`).

## What's in here

Per-subject AFNI timing files (.1D format). Each subject folder contains:

```
sub-958/
├── sub-958_task-learn_run-01_events.tsv   (copied from bids_fixed)
├── sub-958_task-learn_run-02_events.tsv
├── sub-958_task-learn_run-03_events.tsv
├── sub-958_task-learn_run-04_events.tsv
│
├── NonPM_Mean60_fdkm_run1.1D             ── 8 feedback conditions
├── NonPM_Mean60_fdkm_run2.1D                × 4 runs = 32 files
├── NonPM_Mean60_fdkm_run3.1D                (onset:duration pairs,
├── NonPM_Mean60_fdkm_run4.1D                 padded to 4 rows)
├── NonPM_Mean60_fdkm.1D                  ── multi-run versions
│   ... (same for fdkn, Mean80, Nice60, Nice80)
│
├── Mean60_pred_run1.1D                   ── prediction onset:duration
├── Mean60_pred_run2.1D                      × 4 runs
├── Mean60_pred_run3.1D
├── Mean60_pred_run4.1D
├── Mean60_pred.1D                        ── multi-run version
├── Mean60_rsp.1D                         ── response
│   ... (same for Mean80, Nice60, Nice80)
│
├── Anticipation_pred_fdk.1D              ── ISI between prediction and feedback
├── Anticipation_pred_fdk_run1.1D
├── Anticipation_pred_fdk_run2.1D
├── Anticipation_pred_fdk_run3.1D
└── Anticipation_pred_fdk_run4.1D
```

## The conditions

| BIDS event name | Timing file prefix | What it is |
|---|---|---|
| `Mean_60_fdkm` | `NonPM_Mean60_fdkm` | Mean peer, 60% accuracy, feedback match |
| `Mean_60_fdkn` | `NonPM_Mean60_fdkn` | Mean peer, 60% accuracy, feedback no-match |
| `Mean80_fdkm` | `NonPM_Mean80_fdkm` | Mean peer, 80% accuracy, feedback match |
| `Mean80_fdkn` | `NonPM_Mean80_fdkn` | Mean peer, 80% accuracy, feedback no-match |
| `Nice_60_fdkm` | `NonPM_Nice60_fdkm` | Nice peer, 60% accuracy, feedback match |
| `Nice_60_fdkn` | `NonPM_Nice60_fdkn` | Nice peer, 60% accuracy, feedback no-match |
| `Nice80_fdkm` | `NonPM_Nice80_fdkm` | Nice peer, 80% accuracy, feedback match |
| `Nice80_fdkn` | `NonPM_Nice80_fdkn` | Nice peer, 80% accuracy, feedback no-match |
| `*_pred` | `*_pred` | Prediction phase |
| `*_rsp` | `*_rsp` | Response phase |
| `isi` | `Anticipation_pred_fdk` | Interval between prediction and feedback |

## .1D file format

Each run-wise file has 4 rows (one per run). The target run has `onset:duration` pairs; non-target runs have `*`:

```
*
12.5:2.0 45.3:1.8 78.1:2.2
*
*
```

This is AFNI's multi-run local timing format.

## How it was produced

```bash
bash scripts/2_generate_timing.sh
```

38 subject folders, each with ~77 .1D files + 4 events.tsv copies.
