# LEARN RSA — nopred_fdbk Relabeling Fix

**Goal:** Convert `nopred_fdbk` rows in BIDS events to the *correct* peer×feedback label, so timing files and GLMs reflect the actual feedback that occurred after missed predictions.

This is not a data‑loss issue. It is a **labeling issue**: the feedback still occurs, but the BIDS events file labels it as `nopred_fdbk` rather than `Mean80_fdkn`, `Nice80_fdkm`, etc.

## What Happened (Plain English)

When a participant **misses a prediction**, the events file inserts:

1. `no_pred`  
2. `nopred_fdbk` (feedback still happens)

The feedback is real and belongs to a specific peer×feedback condition (e.g., `Mean80_fdkn`).  
However, in the BIDS events.tsv it is **labeled generically**, which makes the RSA timing generator miss it.

## Proof (Two Concrete Examples)

### Example A: `sub-1215`, run 01

**BIDS events**  
`/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/bids/sub-1215/func/sub-1215_task-learn_run-01_events.tsv`

You will see:
- `nopred_fdbk` at onset `218.506`

**BehavData source**  
`/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/code/afni/BehavData/sub-1215/Mean80_fdkn_run1.txt`

Contains:
- `218.506 3 ...`

**Conclusion:** that `nopred_fdbk` row should be `Mean80_fdkn`.

---

### Example B: `sub-1534`, run 03

**BIDS events**  
`/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/bids/sub-1534/func/sub-1534_task-learn_run-03_events.tsv`

You will see:
- `no_pred` at trial `83`
- `nopred_fdbk` at trial `83`

**BehavData source**  
`/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/code/afni/BehavData/sub-1534/Mean80_fdkn_run3.txt`

Contains:
- `83 3`

**Conclusion:** that `nopred_fdbk` row should be `Mean80_fdkn`.

---

## What Exactly Gets Fixed

For **every** `nopred_fdbk` row in BIDS events:

1. Identify the correct peer×feedback label using BehavData run files  
   (files like `Mean80_fdkn_run3.txt`, `Nice80_fdkm_run1.txt`, etc.)
2. Replace the event label:

```
nopred_fdbk  ->  Mean_60_fdkm / Mean_60_fdkn / Mean80_fdkm / Mean80_fdkn /
                 Nice_60_fdkm / Nice_60_fdkn / Nice80_fdkm / Nice80_fdkn
```

The correct label is determined by matching **onset** (if BehavData is time‑coded)  
or **trial number** (if BehavData is trial‑coded).

## Script (Source‑of‑Truth Fix)

Repo script that does the relabeling:

`rsa-learn/scripts/LEARN_fix_nopred_fdbk_events.py`

### How it decides the correct label

For each subject and run:
- Reads all feedback files in BehavData: `*fdkm_runX.txt`, `*fdkn_runX.txt`
- Detects whether the file is **time‑coded** (float onsets) or **trial‑coded** (integers)
- Matches each `nopred_fdbk` row to the **single** feedback label with the same onset or trial.

## Recommended Run (Produces Corrected Events, No Overwrite)

```bash
python3 /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_fix_nopred_fdbk_events.py \
  --bids-dir  /data/projects/STUDIES/LEARN/fMRI/bids \
  --behav-dir /data/projects/STUDIES/LEARN/fMRI/code/afni/BehavData \
  --out-dir   /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed \
  --report    /data/projects/STUDIES/LEARN/fMRI/RSA-learn/reports/nopred_fdbk_fix.tsv
```

The report lists every replacement and any unresolved rows.

## Next Step (Regenerate Timing Files)

Point the timing generator at the **fixed** BIDS tree and re‑generate RSA timing files.

If you want to keep originals intact, do **not** overwrite `/bids`.  
Use the fixed tree from above.

---

## Why This Matters for RSA

The run‑wise RSA timing generator pulls events **directly from BIDS**.  
If `nopred_fdbk` remains:

- The correct peer×feedback event is missing
- The matching `NonPM_*_runX.1D` line becomes `*` (empty)
- AFNI `afni_proc.py` throws errors or drops that regressor

Relabeling restores the exact same feedback structure that all participants should have.
