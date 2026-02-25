# bids_fixed/

This folder is the output of **Stage 1** (`scripts/1_fix_events.py`).

## What's in here

Corrected BIDS events.tsv files. The structure mirrors the original BIDS layout:

```
bids_fixed/
├── sub-958/
│   └── func/
│       ├── sub-958_task-learn_run-01_events.tsv
│       ├── sub-958_task-learn_run-02_events.tsv
│       ├── sub-958_task-learn_run-03_events.tsv
│       └── sub-958_task-learn_run-04_events.tsv
├── sub-1028/
│   └── func/
│       └── ...
└── (38 subjects total)
```

## Why this exists

In the LEARN task, when a participant misses a prediction trial, the subsequent feedback event gets logged as `nopred_fdbk` instead of its real condition label (e.g. `Mean_60_fdkm`, `Nice80_fdkn`). This breaks timing file generation because those events get lost.

`1_fix_events.py` builds a template from the majority label at each trial position across all subjects, then relabels `nopred_fdbk` rows to match. The corrected files here are what Stage 2 reads from.

## How it was produced

```bash
python3 scripts/1_fix_events.py \
  --bids-dir /data/projects/STUDIES/LEARN/fMRI/bids \
  --out-dir /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed \
  --report /data/projects/STUDIES/LEARN/fMRI/RSA-learn/reports/nopred_fdbk_fix_template.tsv \
  --mode majority
```

The fix report (which rows were changed) is in `reports/nopred_fdbk_fix_template.tsv`.
