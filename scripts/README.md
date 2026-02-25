# scripts/ -- RSA-learn AFNI Pipeline Scripts

This folder contains the complete RSA-learn fMRI analysis pipeline. The scripts
take raw BIDS events and bold data through event relabeling, timing file
generation, AFNI preprocessing, and GLM estimation to produce run-wise beta
maps suitable for Representational Similarity Analysis.

There are **5 pipeline scripts** (numbered to show execution order) and
**1 utility script** (audit).

---

## Pipeline Flow

```
Raw BIDS events.tsv files
        |
        v
  1_fix_events.py            Fix mislabeled nopred_fdbk rows
        |
        v
  bids_fixed/ events.tsv
        |
        v
  2_generate_timing.sh       Extract onset:duration pairs -> .1D files
        |
        v
  TimingFiles/Fixed2/sub-*/  (NonPM run-wise, pred/resp, anticipation)
        |
        v
  3a_afni_proc_template.sh   afni_proc.py template (4-run, 41 regressors, 45 GLTs)
        |                        |
        |  (if <4 runs)          |
        +-> 3b_fallback_patch.py rewrites template for 2-3 runs
        |                        |
        v                        v
  3_run_glm.sh               Orchestrator: discover subjects, gen proc, clean, run
        |
        v
  derivatives/afni/IndvlLvlAnalyses/  (per-subject GLM results)
```

---

## 1. Fix Mislabeled Events

**File:** `scripts/1_fix_events.py`

### What it does

Some participants have feedback events recorded as `nopred_fdbk` instead of
their true condition label (e.g., `Mean_60_fdkm`). This happens when the
prediction was not recorded but the feedback still played. Since the
peer-by-feedback order is fixed across subjects, we can recover the correct
label.

This script builds a "template" of what condition each trial should be, then
walks through every subject's events.tsv and replaces any `nopred_fdbk` with
the correct label. It writes corrected copies to `bids_fixed/` (never modifies
the originals) and produces a TSV report of every fix it made.

**Two template modes:**

- **majority** (default): For each run and trial number, count how many
  subjects have each label. The most common label wins. This is robust because
  the task order is deterministic -- only mislabeled subjects will differ.
- **subject**: Use one known-good subject's labels as the template.

### Full script

```python
#!/usr/bin/env python3
"""
Relabel `nopred_fdbk` in BIDS events.tsv using the canonical
peer×feedback order derived from normal participants.

Two modes:
  - majority: build a per-run template from the majority label at each trial
  - subject:  use a single normal subject as the template
"""

from __future__ import annotations

import argparse
import csv
from collections import Counter, defaultdict
from pathlib import Path

FEEDBACK = {
    "Mean_60_fdkm",
    "Mean_60_fdkn",
    "Mean80_fdkm",
    "Mean80_fdkn",
    "Nice_60_fdkm",
    "Nice_60_fdkn",
    "Nice80_fdkm",
    "Nice80_fdkn",
}


def find_events(bids_dir: Path):
    return sorted(bids_dir.glob("sub-*/func/sub-*_task-learn_run-*_events.tsv"))


def sub_run_from_name(path: Path):
    name = path.name
    subj = name.split("_task-")[0].replace("sub-", "")
    run = int(name.split("run-")[1].split("_events.tsv")[0])
    return subj, run


def build_template_majority(bids_dir: Path):
    counts = defaultdict(lambda: defaultdict(Counter))
    for ev in find_events(bids_dir):
        _, run = sub_run_from_name(ev)
        with ev.open() as f:
            header = f.readline().strip().split("\t")
            if "event" not in header:
                continue
            i_event = header.index("event")
            i_trial = header.index("trial")
            for line in f:
                if not line.strip():
                    continue
                cols = line.rstrip("\n").split("\t")
                event = cols[i_event]
                if event not in FEEDBACK:
                    continue
                trial = int(float(cols[i_trial]))
                counts[run][trial][event] += 1
    template = defaultdict(dict)
    for run, trial_map in counts.items():
        for trial, counter in trial_map.items():
            if not counter:
                continue
            most_common = counter.most_common()
            if len(most_common) > 1 and most_common[0][1] == most_common[1][1]:
                continue
            template[run][trial] = most_common[0][0]
    return template


def build_template_from_subject(bids_dir: Path, subj: str):
    template = defaultdict(dict)
    for ev in find_events(bids_dir):
        s, run = sub_run_from_name(ev)
        if s != subj:
            continue
        with ev.open() as f:
            header = f.readline().strip().split("\t")
            if "event" not in header:
                continue
            i_event = header.index("event")
            i_trial = header.index("trial")
            for line in f:
                if not line.strip():
                    continue
                cols = line.rstrip("\n").split("\t")
                event = cols[i_event]
                if event not in FEEDBACK:
                    continue
                trial = int(float(cols[i_trial]))
                template[run][trial] = event
    return template


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--bids-dir", required=True, type=Path)
    ap.add_argument("--out-dir", required=True, type=Path)
    ap.add_argument("--report", required=True, type=Path)
    ap.add_argument("--mode", choices=["majority", "subject"], default="majority")
    ap.add_argument("--template-subj", help="Required if mode=subject")
    args = ap.parse_args()

    if args.mode == "subject":
        if not args.template_subj:
            raise SystemExit("Need --template-subj when mode=subject")
        template = build_template_from_subject(args.bids_dir, args.template_subj)
    else:
        template = build_template_majority(args.bids_dir)

    report_rows = []
    fixed = 0
    unresolved = 0
    total = 0

    for ev in find_events(args.bids_dir):
        rel = ev.relative_to(args.bids_dir)
        out_path = args.out_dir / rel
        out_path.parent.mkdir(parents=True, exist_ok=True)

        with ev.open() as f:
            header = f.readline().strip().split("\t")
            if "event" not in header:
                continue
            i_event = header.index("event")
            i_trial = header.index("trial")
            rows = [r.rstrip("\n").split("\t") for r in f if r.strip()]

        for row in rows:
            if row[i_event] != "nopred_fdbk":
                continue
            total += 1
            trial = int(float(row[i_trial]))
            _, run = sub_run_from_name(ev)
            new_event = template.get(run, {}).get(trial)
            if new_event:
                row[i_event] = new_event
                fixed += 1
                report_rows.append([*sub_run_from_name(ev), row[i_trial], "nopred_fdbk", new_event, "fixed"])
            else:
                unresolved += 1
                report_rows.append([*sub_run_from_name(ev), row[i_trial], "nopred_fdbk", "NA", "unresolved"])

        with out_path.open("w", newline="") as f:
            writer = csv.writer(f, delimiter="\t")
            writer.writerow(header)
            writer.writerows(rows)

    args.report.parent.mkdir(parents=True, exist_ok=True)
    with args.report.open("w", newline="") as f:
        writer = csv.writer(f, delimiter="\t")
        writer.writerow(["subj", "run", "trial", "old_event", "new_event", "status"])
        writer.writerows(report_rows)

    print(f"[template_fix] total={total} fixed={fixed} unresolved={unresolved}")


if __name__ == "__main__":
    main()
```

### Key details

- **FEEDBACK set** (line 18): The 8 valid feedback condition names. Anything
  matching `nopred_fdbk` that falls at a trial position where one of these
  is expected gets relabeled.
- **Tie-breaking** (line 66): If two labels tie for most-common at a trial,
  that trial is left unresolved rather than guessing.
- **Output structure**: Mirrors the BIDS directory tree under `--out-dir`,
  so downstream scripts can point at `bids_fixed/` as a drop-in replacement.

---

## 2. Generate Timing Files

**File:** `scripts/2_generate_timing.sh`

### What it does

This script reads the corrected events.tsv files from `bids_fixed/` and
creates AFNI-format `.1D` timing files for every subject. It produces three
categories of timing files:

1. **NonPM feedback files** (run-wise): One file per peer-by-feedback condition
   per run. 8 conditions x 4 runs = 32 files. These use non-parametric
   `onset:duration` format (no amplitude modulation).
2. **Prediction and response files**: One file per condition for prediction
   events and response events. 8 files total (4 conditions x pred/resp).
3. **Anticipation files**: The interval between prediction and feedback,
   extracted from `isi` events in the BIDS data.

Every run-wise file is then **padded to 4 rows** using `*` for non-target runs,
which is the format AFNI requires for multi-run datasets.

### Header and setup (first ~40 lines)

```bash
#!/bin/bash

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA-learn RUN-WISE timing generator (NonPM + Anticipation between prediction->feedback)
#
# This script is intentionally derived from:
#   /data/projects/STUDIES/LEARN/fMRI/code/afni/LEARN_1D_AFNItiming_Full.sh
#
# Key goal:
#   Create NON-PARAMETRIC (onset:duration only) timing files
#   for each run and each peer x feedback condition so we can
#   estimate RUN-WISE betas in AFNI.
#
#   NEW (Anticipation):
#   - Adds an explicit regressor for the interval between
#     prediction and feedback, using the "isi" events in BIDS.
#
# IMPORTANT: This script is *not* replacing the existing pipeline.
# It is a parallel RSA-learn pipeline that matches the original
# naming conventions and event logic, but outputs run-wise files.
#
# Author: RSA-learn adaptation (based on Tessa Clarkson script)
# Date: 2026-02-08

############################################################################################
# GENERAL SETUP
############################################################################################

# **CHANGE ME**: Subject list file (one ID per line, no "sub-")
SUBJ_LIST="${SUBJ_LIST_OVERRIDE:-/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt}"

# **CHECK ME**: Root directories
TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
BIDS_DIR="${BIDS_DIR_OVERRIDE:-$TOPDIR/RSA-learn/bids_fixed}"

# **RSA-learn output root (new)**
TIMING_ROOT="${TIMING_ROOT_OVERRIDE:-$TOPDIR/RSA-learn/TimingFiles/Fixed2}"
```

### How the rest of the script works (section by section)

**Subject loop and event file copy (lines 46-62):**
For each subject in the subject list, creates an output folder under
`TimingFiles/Fixed2/sub-{id}/`, removes any stale event files, then copies
the 4 runs of corrected events.tsv into the timing folder so everything is
self-contained.

**NonPM feedback extraction (lines 78-136):**
Uses `awk` to pull `onset:duration` pairs from each run's events.tsv for each
of the 8 feedback conditions. The naming convention maps BIDS event names
to file names:

| BIDS event name  | Output file pattern          |
|------------------|------------------------------|
| `Mean_60_fdkm`   | `NonPM_Mean60_fdkm_run*.1D`  |
| `Mean_60_fdkn`   | `NonPM_Mean60_fdkn_run*.1D`  |
| `Mean80_fdkm`    | `NonPM_Mean80_fdkm_run*.1D`  |
| `Mean80_fdkn`    | `NonPM_Mean80_fdkn_run*.1D`  |
| `Nice_60_fdkm`   | `NonPM_Nice60_fdkm_run*.1D`  |
| `Nice_60_fdkn`   | `NonPM_Nice60_fdkn_run*.1D`  |
| `Nice80_fdkm`    | `NonPM_Nice80_fdkm_run*.1D`  |
| `Nice80_fdkn`    | `NonPM_Nice80_fdkn_run*.1D`  |

Each per-run file contains space-separated `onset:duration` pairs for that
condition in that run. A combined multi-run file (e.g., `NonPM_Mean60_fdkm.1D`)
is also created by concatenating all 4 run files with newlines between them.

**Prediction and response extraction (lines 138-200):**
Same approach for prediction (`*_pred`) and response (`*_rsp`) events. These
are not split per-run in the final output -- they produce a single 4-row
multi-run `.1D` file per condition.

**Anticipation extraction (lines 202-212):**
Extracts `isi` events (the interval between prediction and feedback display)
into `Anticipation_pred_fdk_run*.1D` files, one per run.

**Padding to 4 rows (lines 217-252):**
AFNI's multi-run format requires one row per run. Each run-wise file has its
single data line placed at the correct row position (1-4) and all other rows
filled with `*` (AFNI's marker for "no events in this run"). For example,
a run-2 file becomes:

```
*
12.5:3.0 25.1:3.0 ...
*
*
```

---

## 3a. AFNI Proc Template

**File:** `scripts/3a_afni_proc_template.sh`

### What it does

This is a `tcsh` script that calls AFNI's `afni_proc.py` to generate a
subject-level preprocessing and GLM estimation script. It defines the full
4-run pipeline configuration: what processing blocks to apply, what stimulus
timing files to use, how to label each regressor, and all 45 General Linear
Tests (GLTs).

This is the **template** -- it assumes all 4 runs are present. For subjects
with fewer runs, `3b_fallback_patch.py` rewrites it before execution.

### Header and setup (first ~50 lines)

```tcsh
#!/bin/tcsh

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA-learn RUN-WISE afni_proc generator (AFNI raw-BIDS, NO smoothing)
#
# Adds an explicit Anticipation regressor for prediction->feedback (event = "isi").
#
# This script adapts the lab's AFNI preprocessing pipeline to RSA run-wise
# betas using raw BIDS inputs (not fMRIPrep). It removes the blur block to
# keep patterns unsmoothed for RSA.
#
# Author: RSA-learn adaptation
# Date: 2026-02-14

############################################################################################
# GENERAL SETUP
############################################################################################

# **CHANGE ME**: Specify subject numbers in a single row. Do not include the sub- prefix
set subjects = ( 958 1158 1267 1380 )

# **CHECK ME**: GLM name (used for outputs)
set GLM = LEARN_RSA_runwise_AFNI

# **CHECK ME**: motion censor threshold (matches lab AFNI pipeline)
set motion_max = 1

# **CHECK ME**: Number of jobs for 3dDeconvolve
set jobs = 30

############################################################################################
# LOCATIONS
############################################################################################

set topdir = /data/projects/STUDIES/LEARN/fMRI

# Raw BIDS inputs
set subjbids = $topdir/bids

# RSA-learn timing files (run-wise NonPM + ISI)
set subjecttiming = $topdir/RSA-learn/TimingFiles/Fixed2

# RSA-learn output root
set results = $topdir/RSA-learn/derivatives/afni/IndvlLvlAnalyses

# AFNI SSW anatomy outputs
set anat_dir = $topdir/derivatives/afni/ssw
```

### How the rest of the script works

**Processing blocks (line 82):**
```
-blocks despike tshift align tlrc volreg mask scale regress
```
Note: There is **no blur block**. Spatial smoothing is deliberately omitted
to preserve fine-grained voxel patterns for RSA. The pipeline includes:
- `despike` -- remove large transient signal spikes
- `tshift` -- correct for slice timing differences
- `align` -- align anatomy to EPI
- `tlrc` -- warp to MNI template space (using nonlinear SSW warps)
- `volreg` -- volume registration (motion correction), aligned to MIN_OUTLIER
- `mask` -- create brain mask from EPI-anat intersection
- `scale` -- scale each voxel's time series to percent signal change
- `regress` -- run 3dDeconvolve with the stimulus model

**Anatomy inputs (lines 83-97):**
Uses pre-computed `@SSwarper` outputs: skull-stripped anatomy (`anatSS`),
nonlinearly warped anatomy (`anatQQ`), affine transform (`.aff12.1D`), and
nonlinear warp field (`_WARP.nii`).

**41 stimulus regressors (lines 111-194):**
- 32 run-wise feedback regressors: 8 conditions x 4 runs
  (e.g., `FBM.Mean60.r1`, `FBN.Mean60.r1`, ..., `FBN.Nice80.r4`)
- 8 prediction/response regressors: `Pred.Mean60`, `Resp.Mean60`, etc.
- 1 anticipation regressor: `Anticipation.PredFdk`

All are type `AM1` (amplitude modulated, 1 parameter) with `dmBLOCK(0)` basis
function. The duration comes from the `onset:duration` format in the timing
files; `dmBLOCK(0)` convolves each event with a duration-modulated block.

**45 GLTs (lines 283-327):**

| GLT # | Label | What it tests |
|-------|-------|---------------|
| 1 | Task.V.BL | All task regressors vs. baseline |
| 2 | Prediction.V.BL | All prediction conditions vs. baseline |
| 3 | Prediction.Mean.V.Nice | Mean predictions minus Nice predictions |
| 4 | FB.V.BL | All feedback (all runs) vs. baseline |
| 5 | FBM.V.BL | All feedback-match vs. baseline |
| 6 | FBN.V.BL | All feedback-nonmatch vs. baseline |
| 7 | FBM.V.FBN | Match vs. nonmatch feedback |
| 8-23 | {Cond}.r{N} | Per-run condition means (0.5*FBM + 0.5*FBN for each condition and run) |
| 24-31 | FBM.r{N}, FBN.r{N} | Per-run feedback-match and nonmatch means (averaged across conditions) |
| 32-39 | FBM.{Cond}.all, FBN.{Cond}.all | Cross-run weighted averages per condition per feedback type |
| 40-43 | {Cond}.all | Cross-run weighted averages per condition (averaging FBM+FBN) |
| 44-45 | FBM.all, FBN.all | Grand mean of match / nonmatch across all runs and conditions |

---

## 3b. Fallback Patch (2-3 Run Subjects)

**File:** `scripts/3b_fallback_patch.py`

### What it does

Not every subject completed all 4 runs. Some have 2 or 3 usable runs. The
`afni_proc.py` template in `3a` is hard-coded for 4 runs, so this script
rewrites it on the fly for subjects with fewer runs.

It takes the path to a copy of the template, the subject ID, and the list of
available run numbers as arguments. It then:

1. **Rebuilds `-dsets`** to list only the available bold files
2. **Rebuilds `-regress_stim_times`** with only the run-wise timing files
   that exist (e.g., for runs 1,2,4 -- skip run 3 files)
3. **Rebuilds `-regress_stim_labels`** to match
4. **Rebuilds `-regress_stim_types`** and **`-regress_basis_multi`** with the
   correct count of `AM1` / `dmBLOCK(0)` entries
5. **Regenerates all GLTs** with correct weights. For example, if only 3 runs
   are available, cross-run averages use `1/3` weights instead of `0.25`.

### Header and stim definitions (first ~40 lines)

```python
#!/usr/bin/env python3
from pathlib import Path
import sys

# Usage: fallback_patch.py <ap_tmp> <subj> <runs...>

def main():
    if len(sys.argv) < 4:
        raise SystemExit("Usage: 3b_fallback_patch.py <ap_tmp> <subj> <runs...>")

    ap = Path(sys.argv[1])
    subj = sys.argv[2]
    runs = [int(r) for r in sys.argv[3:] if r.strip().isdigit()]
    if not runs:
        raise SystemExit("No runs provided")

    stimdir = "$stimdir"
    subj_dir = "$subj_dir"

    stim_defs = [
        ("NonPM_Mean60_fdkm", "FBM.Mean60"),
        ("NonPM_Mean60_fdkn", "FBN.Mean60"),
        ("NonPM_Mean80_fdkm", "FBM.Mean80"),
        ("NonPM_Mean80_fdkn", "FBN.Mean80"),
        ("NonPM_Nice60_fdkm", "FBM.Nice60"),
        ("NonPM_Nice60_fdkn", "FBN.Nice60"),
        ("NonPM_Nice80_fdkm", "FBM.Nice80"),
        ("NonPM_Nice80_fdkn", "FBN.Nice80"),
    ]

    pred_resp = [
        ("Mean60_pred", "Pred.Mean60"),
        ("Mean60_rsp", "Resp.Mean60"),
        ("Mean80_pred", "Pred.Mean80"),
        ("Mean80_rsp", "Resp.Mean80"),
        ("Nice60_pred", "Pred.Nice60"),
        ("Nice60_rsp", "Resp.Nice60"),
        ("Nice80_pred", "Pred.Nice80"),
        ("Nice80_rsp", "Resp.Nice80"),
    ]
```

### How the rest of the script works

**Block replacement helpers (lines 45-79):**
Two utility functions (`replace_block` and `replace_stim_times`) that find
sections of the tcsh template by their starting/ending flags and splice in
new content. This is string-level surgery on the afni_proc template.

**Building new stim lists (lines 87-100):**
Iterates over only the available runs and the 8 stim definitions to build the
new `-regress_stim_times`, `-regress_stim_labels`, `-regress_stim_types`, and
`-regress_basis_multi` blocks. The prediction/response regressors are always
included regardless of run count (they span all runs).

**GLT regeneration (lines 121-201):**
Rebuilds all GLTs from scratch using only the available runs. The weight
calculations adapt automatically:
- Per-run condition means: `0.5*FBM + 0.5*FBN` (same regardless of run count)
- Cross-run averages: weight = `1/num_runs` instead of the hard-coded `0.25`
- Grand means: weight = `1/(4*num_runs)` instead of `0.0625`

The total GLT count will be smaller than 45 because per-run GLTs only exist
for runs that are present.

---

## 3. Run GLM (Orchestrator)

**File:** `scripts/3_run_glm.sh`

### What it does

This is the main driver script. It discovers subjects automatically, generates
their proc scripts (calling 3a and 3b as needed), cleans old outputs, and runs
the GLMs in parallel. You run this one script to process the entire cohort.

### Header and setup (first ~60 lines)

```bash
#!/bin/bash

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA-learn RUN-WISE pipeline (AFNI raw-BIDS, NO smoothing, +Anticipation regressor)
#
# Standard workflow:
#   1) Generate afni_proc scripts (per subject)
#   2) Clean output directories (avoid "already exists")
#   3) Run the GLM from the correct working directory
#
# SUBJECT DISCOVERY:
#   - No subject list required.
#   - By default, discovers subjects from:
#       $TIMING_ROOT/sub-*
#   - If no timing folders found, falls back to:
#       $BIDS_DIR/sub-*
#
# PARALLELIZATION:
#   - Use MAX_JOBS to cap parallel subjects (default: CPU cores)
#
# FALLBACK:
#   - If a subject has 2-3 runs, rewrite afni_proc inputs to those runs
#     and recompute GLTs over available runs.
#   - If a subject has <2 runs, skip.
#
# Usage:
#   bash 3_run_glm.sh
#   MAX_JOBS=4 bash 3_run_glm.sh
#   SUBJ_ROOT=/path/to/sub-*/ bash 3_run_glm.sh
#
# Optional toggles (default = 1):
#   MAKE_PROC=1   CLEAN_OUT=1   RUN_GLM=1
#
# Author: RSA-learn adaptation
# Date: 2026-02-14

set -euo pipefail

TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
RSA_DIR="$TOPDIR/RSA-learn"
SCRIPT_DIR="$RSA_DIR/scripts"
TMP_DIR="$RSA_DIR/tmp"
LOG_DIR="$RSA_DIR/logs"
RESULTS_DIR="$RSA_DIR/derivatives/afni/IndvlLvlAnalyses"
TIMING_ROOT="${TIMING_ROOT_OVERRIDE:-$RSA_DIR/TimingFiles/Fixed2}"
BIDS_DIR="${BIDS_DIR_OVERRIDE:-$TOPDIR/bids}"

AP_ORIG="$SCRIPT_DIR/3a_afni_proc_template.sh"
AP_FALLBACK="$SCRIPT_DIR/3b_fallback_patch.py"

MAKE_PROC="${MAKE_PROC:-1}"
CLEAN_OUT="${CLEAN_OUT:-1}"
RUN_GLM="${RUN_GLM:-1}"
MAX_JOBS="${MAX_JOBS:-}"
LOAD_LIMIT="${LOAD_LIMIT:-}"
SUBJ_ROOT="${SUBJ_ROOT:-$TIMING_ROOT}"

mkdir -p "$TMP_DIR" "$LOG_DIR" "$RESULTS_DIR"
```

### How the rest of the script works

**Subject discovery -- `discover_subjects()` (lines 80-87):**
Finds all `sub-*` directories under a given root and extracts the numeric IDs.
First tries the timing root; if nothing is found there, falls back to the BIDS
directory. This means you do not need to maintain a subject list file.

**Parallelism setup (lines 89-98):**
Detects CPU count via `nproc` (or `getconf`) and sets `MAX_JOBS` to match.
`LOAD_LIMIT` prevents starting new jobs when the system's 1-minute load average
is too high.

**`proc_gen()` -- Generate proc scripts (lines 123-153):**
For each subject:
1. Skips if a GLM is already running for that subject (checks via `pgrep`)
2. Copies the 4-run template to a temp file
3. Rewrites the `set subjects = (...)` line to the current subject
4. Counts how many bold files exist for the subject
5. If fewer than 4 runs: calls `3b_fallback_patch.py` to rewrite the template
6. If fewer than 2 runs: skips entirely
7. Runs `tcsh` on the template, which executes `afni_proc.py` and produces
   the actual proc script

**`clean_out()` -- Remove old results (lines 155-172):**
Deletes the old results directory for a subject so `afni_proc.py` does not
fail with "directory already exists" errors. Also cleans up stray results
that may have landed in the scripts directory.

**`run_glm()` -- Execute the proc script (lines 174-188):**
Changes to the subject's results directory and runs the proc script with
`tcsh -xef` (trace + exit-on-error). Output is tee'd to a log file.

**`run_parallel()` -- Job management (lines 190-213):**
A generic parallel executor. It runs the given function for each subject in
the background, but waits if the number of background jobs reaches `MAX_JOBS`
or if the system load exceeds `LOAD_LIMIT`. The three phases (proc_gen,
clean_out, run_glm) each run in parallel across subjects but sequentially
relative to each other.

**Main execution (lines 215-225):**
Runs the three phases in order, each controlled by its toggle variable:
```bash
if [ "$MAKE_PROC" -eq 1 ]; then
  run_parallel proc_gen "${SUBJECTS[@]}"
fi
if [ "$CLEAN_OUT" -eq 1 ]; then
  run_parallel clean_out "${SUBJECTS[@]}"
fi
if [ "$RUN_GLM" -eq 1 ]; then
  run_parallel run_glm "${SUBJECTS[@]}"
fi
```

---

## Utility Scripts

The audit script validates server structure. There is no sync script —
the server gets updates via `git pull` directly.

---

### audit_server.sh

**File:** `scripts/audit_server.sh`

#### What it does

Validates the server's RSA-learn directory structure. It checks that all
expected files and directories exist, that no forbidden legacy paths are
present (from older pipeline iterations), that a sample timing file is in
place, and that no Apple sidecar files have crept in. Exits with code 1 if
any check fails.

This is meant to be run periodically (e.g., after `git pull` on the server) to
catch drift between what should be on the server and what actually is.

#### Full script

```bash
#!/usr/bin/env bash
set -euo pipefail

# Audit canonical server RSA-learn layout and flag drift.

SERVER_RSA="${SERVER_RSA:-/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/RSA-learn}"

die=0

must_exist=(
  "$SERVER_RSA/README.md"
  "$SERVER_RSA/scripts/1_fix_events.py"
  "$SERVER_RSA/scripts/2_generate_timing.sh"
  "$SERVER_RSA/scripts/3a_afni_proc_template.sh"
  "$SERVER_RSA/scripts/3b_fallback_patch.py"
  "$SERVER_RSA/scripts/3_run_glm.sh"
  "$SERVER_RSA/scripts/audit_server.sh"
  "$SERVER_RSA/scripts/README.md"
  "$SERVER_RSA/docs/masterplan.md"
  "$SERVER_RSA/docs/pi-walkthrough.md"
  "$SERVER_RSA/docs/decisions.md"
  "$SERVER_RSA/docs/run-status.md"
  "$SERVER_RSA/bids_fixed"
  "$SERVER_RSA/TimingFiles/Fixed2"
  "$SERVER_RSA/derivatives"
  "$SERVER_RSA/stage_1_fixed_events"
  "$SERVER_RSA/stage_2_timing"
  "$SERVER_RSA/stage_3_glm_results"
)

must_absent=(
  "$SERVER_RSA/bids_fixed2"
  "$SERVER_RSA/TimingFiles/Fixed2_Anticipation"
  "$SERVER_RSA/TimingFiles/Fixed2_ISI"
  "$SERVER_RSA/TimingFiles/Full"
  "$SERVER_RSA/scripts/archive"
)

echo "== Required paths =="
for p in "${must_exist[@]}"; do
  if [[ -e "$p" ]] || [[ -L "$p" ]]; then
    echo "OK   $p"
  else
    echo "MISS $p"
    die=1
  fi
done

echo
echo "== Forbidden legacy paths =="
for p in "${must_absent[@]}"; do
  if [[ -e "$p" ]]; then
    echo "BAD  $p"
    die=1
  else
    echo "OK   $p"
  fi
done

echo
echo "== Canonical timing check =="
sample="$SERVER_RSA/TimingFiles/Fixed2/sub-958/Anticipation_pred_fdk.1D"
if [[ -f "$sample" ]]; then
  echo "OK   $sample"
else
  echo "MISS $sample"
  die=1
fi

echo
echo "== Apple sidecar check (._*) =="
sidecar_list=$(
  {
    find "$SERVER_RSA" -maxdepth 1 -type f -name '._*' 2>/dev/null
    find "$SERVER_RSA/scripts" -maxdepth 2 -type f -name '._*' 2>/dev/null
    find "$SERVER_RSA/docs" -maxdepth 2 -type f -name '._*' 2>/dev/null
    find "$SERVER_RSA/logs" -maxdepth 2 -type f -name '._*' 2>/dev/null
  } | sed '/^$/d'
)
sidecars=$(printf "%s\n" "$sidecar_list" | sed '/^$/d' | wc -l | tr -d ' ')
if [[ "$sidecars" == "0" ]]; then
  echo "OK   none found"
else
  echo "WARN $sidecars sidecar files present"
  printf "%s\n" "$sidecar_list" | sed -n '1,20p'
fi

echo
if [[ "$die" == "1" ]]; then
  echo "AUDIT FAILED"
  exit 1
fi
echo "AUDIT PASSED"
```

#### Audit checks explained

| Check | What it catches |
|-------|-----------------|
| **Required paths** | Missing scripts, docs, data directories, or stage symlinks after a sync |
| **Forbidden legacy paths** | Old directory names from previous pipeline iterations that should have been removed (e.g., `bids_fixed2`, `Fixed2_Anticipation`) |
| **Canonical timing check** | Spot-checks that at least one subject's anticipation timing file exists, confirming the timing generation ran |
| **Apple sidecar check** | macOS creates `._*` resource fork files when copying to network shares; these can confuse AFNI file discovery |
