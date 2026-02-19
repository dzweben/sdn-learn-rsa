**LEARN RSA Runwise AFNI (No Blur) – PI Walkthrough**

This is a front-to-back walkthrough of what was run, where it lives, and how each step works. Each step includes file paths, commands, and full scripts used. The two key setbacks (timing fix and sub-1522 collinearity) are documented with audits and fixes.

**Step 0 – Map of Paths and Environment**
Paths used on server:
- `/data/projects/STUDIES/LEARN/fMRI/bids` (raw BIDS inputs)
- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed2` (events after nopred_fdbk relabel)
- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2` (run-wise timing output)
- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses` (AFNI outputs)
- `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/ssw` (AFNI SSW anatomy)
- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts` (server scripts)

Local repo:
- `/Users/dannyzweben/Desktop/SDN/Y1_project`
- `/Users/dannyzweben/Desktop/SDN/Y1_project/rsa-learn/scripts`

AFNI version in logs: `AFNI_25.1.11` (May 23 2025), afni_proc.py `v7.92` (May 16 2025).

**Step 1 – Fix events (nopred_fdbk relabel)**
Purpose: some feedback events were labeled `nopred_fdbk` in BIDS events when a prediction was missed. This broke run-wise timing generation because those events did not match the expected peer×feedback labels. Fix = relabel those events using a canonical run template.

Command used:
```bash
python3 /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_fix_nopred_fdbk_by_template.py \
  --bids-dir /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed \
  --out-dir  /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed2 \
  --report   /data/projects/STUDIES/LEARN/fMRI/RSA-learn/reports/nopred_fdbk_fix_template.tsv \
  --mode majority
```

Script (full): `rsa-learn/scripts/LEARN_fix_nopred_fdbk_by_template.py`
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

Outputs:
- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed2` (corrected events)
- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/reports/nopred_fdbk_fix_template.tsv` (audit report)

**Step 2 – Generate run-wise timing files (NonPM)**
Purpose: convert corrected events into run-wise `NonPM_*_runX.1D` timing files and prediction/response timing files.

Important detail: the server copy of the timing script was hard-coded to `bids` and `TimingFiles/Full`. We patched a temporary copy to point at `bids_fixed2` and `TimingFiles/Fixed2`.

Command used (temp patch + run):
```bash
TMP=/tmp/LEARN_1D_AFNItiming_Full_RSA_runwise_fixed2.sh
cp /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_1D_AFNItiming_Full_RSA_runwise.sh "$TMP"
sed -i 's|BIDS_DIR="[^"]*"|BIDS_DIR="/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed2"|' "$TMP"
sed -i 's|TIMING_ROOT="[^"]*"|TIMING_ROOT="/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2"|' "$TMP"
bash "$TMP"
```

Script (full): `rsa-learn/scripts/LEARN_1D_AFNItiming_Full_RSA_runwise.sh`
```bash
#!/bin/bash

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA‑learn RUN‑WISE timing generator (NonPM only)
#
# This script is intentionally derived from:
#   /data/projects/STUDIES/LEARN/fMRI/code/afni/LEARN_1D_AFNItiming_Full.sh
#
# Key goal:
#   Create NON‑PARAMETRIC (onset:duration only) timing files
#   for each run and each peer×feedback condition so we can
#   estimate RUN‑WISE betas in AFNI.
#
# IMPORTANT: This script is *not* replacing the existing pipeline.
# It is a parallel RSA‑learn pipeline that matches the original
# naming conventions and event logic, but outputs run‑wise files.
#
# Author: RSA‑learn adaptation (based on Tessa Clarkson script)
# Date: 2026‑02‑08

############################################################################################
# GENERAL SETUP
############################################################################################

# **CHANGE ME**: Subject list file (one ID per line, no "sub-")
SUBJ_LIST="${SUBJ_LIST_OVERRIDE:-/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt}"

# **CHECK ME**: Root directories
TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
BIDS_DIR="${BIDS_DIR_OVERRIDE:-$TOPDIR/bids}"

# **RSA‑learn output root (new)**
TIMING_ROOT="${TIMING_ROOT_OVERRIDE:-$TOPDIR/RSA-learn/TimingFiles/Full}"

############################################################################################
# COPY EVENTS + BUILD NON‑PARAMETRIC RUN‑WISE TIMING FILES
############################################################################################

# For each subject...
for subj in `cat ${SUBJ_LIST}`; do
    echo "[RSA‑learn] Generating NonPM run‑wise timing files for sub-${subj}"

    # Create output folder (keep RSA‑learn timing separate)
    mkdir -p "${TIMING_ROOT}/sub-${subj}"

    # Clean any old event files so we know these are current
    rm -f "${TIMING_ROOT}/sub-${subj}/sub-${subj}_task-learn_run-0"*_events.tsv

    # Copy BIDS events into RSA‑learn timing folder (so everything is self‑contained)
    cp "${BIDS_DIR}/sub-${subj}/func/sub-${subj}_task-learn_run-01_events.tsv" "${TIMING_ROOT}/sub-${subj}/"
    cp "${BIDS_DIR}/sub-${subj}/func/sub-${subj}_task-learn_run-02_events.tsv" "${TIMING_ROOT}/sub-${subj}/"
    cp "${BIDS_DIR}/sub-${subj}/func/sub-${subj}_task-learn_run-03_events.tsv" "${TIMING_ROOT}/sub-${subj}/"
    cp "${BIDS_DIR}/sub-${subj}/func/sub-${subj}_task-learn_run-04_events.tsv" "${TIMING_ROOT}/sub-${subj}/"

    # Move into subject timing folder
    cd "${TIMING_ROOT}/sub-${subj}/"

    ############################################################
    # NOTE ON NAMING
    ############################################################
    # Event names in events.tsv use:
    #   Mean_60_* and Nice_60_*   (underscore)
    #   Mean80_*  and Nice80_*    (no underscore)
    # We preserve the existing naming convention for files:
    #   Mean60_*, Mean80_*, Nice60_*, Nice80_*
    ############################################################

    ############################################################
    # NON‑PARAMETRIC FEEDBACK (peer × feedback) — RUN‑WISE
    ############################################################

    # Mean_60 feedback
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run4.1D
    rm -f NonPM_Mean60_fdkm.1D
    for f in NonPM_Mean60_fdkm_run1.1D NonPM_Mean60_fdkm_run2.1D NonPM_Mean60_fdkm_run3.1D NonPM_Mean60_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Mean60_fdkm.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run4.1D
    rm -f NonPM_Mean60_fdkn.1D
    for f in NonPM_Mean60_fdkn_run1.1D NonPM_Mean60_fdkn_run2.1D NonPM_Mean60_fdkn_run3.1D NonPM_Mean60_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Mean60_fdkn.1D; done

    # Mean80 feedback
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run4.1D
    rm -f NonPM_Mean80_fdkm.1D
    for f in NonPM_Mean80_fdkm_run1.1D NonPM_Mean80_fdkm_run2.1D NonPM_Mean80_fdkm_run3.1D NonPM_Mean80_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Mean80_fdkm.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run4.1D
    rm -f NonPM_Mean80_fdkn.1D
    for f in NonPM_Mean80_fdkn_run1.1D NonPM_Mean80_fdkn_run2.1D NonPM_Mean80_fdkn_run3.1D NonPM_Mean80_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Mean80_fdkn.1D; done

    # Nice_60 feedback
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run4.1D
    rm -f NonPM_Nice60_fdkm.1D
    for f in NonPM_Nice60_fdkm_run1.1D NonPM_Nice60_fdkm_run2.1D NonPM_Nice60_fdkm_run3.1D NonPM_Nice60_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Nice60_fdkm.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run4.1D
    rm -f NonPM_Nice60_fdkn.1D
    for f in NonPM_Nice60_fdkn_run1.1D NonPM_Nice60_fdkn_run2.1D NonPM_Nice60_fdkn_run3.1D NonPM_Nice60_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Nice60_fdkn.1D; done

    # Nice80 feedback
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run4.1D
    rm -f NonPM_Nice80_fdkm.1D
    for f in NonPM_Nice80_fdkm_run1.1D NonPM_Nice80_fdkm_run2.1D NonPM_Nice80_fdkm_run3.1D NonPM_Nice80_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Nice80_fdkm.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run4.1D
    rm -f NonPM_Nice80_fdkn.1D
    for f in NonPM_Nice80_fdkn_run1.1D NonPM_Nice80_fdkn_run2.1D NonPM_Nice80_fdkn_run3.1D NonPM_Nice80_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Nice80_fdkn.1D; done

    ############################################################
    # NON‑PARAMETRIC PREDICTION + RESPONSE (RUN‑WISE)
    ############################################################

    # Mean_60 prediction/response
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_pred") {printf "%s:%s ", $1, $2}}' > Mean60_pred_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_pred") {printf "%s:%s ", $1, $2}}' > Mean60_pred_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_pred") {printf "%s:%s ", $1, $2}}' > Mean60_pred_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_pred") {printf "%s:%s ", $1, $2}}' > Mean60_pred_run4.1D
    rm -f Mean60_pred.1D
    for f in Mean60_pred_run1.1D Mean60_pred_run2.1D Mean60_pred_run3.1D Mean60_pred_run4.1D; do (cat $f; echo '') >> Mean60_pred.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_rsp") {printf "%s:%s ", $1, $2}}' > Mean60_rsp_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_rsp") {printf "%s:%s ", $1, $2}}' > Mean60_rsp_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_rsp") {printf "%s:%s ", $1, $2}}' > Mean60_rsp_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_rsp") {printf "%s:%s ", $1, $2}}' > Mean60_rsp_run4.1D
    rm -f Mean60_rsp.1D
    for f in Mean60_rsp_run1.1D Mean60_rsp_run2.1D Mean60_rsp_run3.1D Mean60_rsp_run4.1D; do (cat $f; echo '') >> Mean60_rsp.1D; done

    # Mean80 prediction/response
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_pred") {printf "%s:%s ", $1, $2}}' > Mean80_pred_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_pred") {printf "%s:%s ", $1, $2}}' > Mean80_pred_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_pred") {printf "%s:%s ", $1, $2}}' > Mean80_pred_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_pred") {printf "%s:%s ", $1, $2}}' > Mean80_pred_run4.1D
    rm -f Mean80_pred.1D
    for f in Mean80_pred_run1.1D Mean80_pred_run2.1D Mean80_pred_run3.1D Mean80_pred_run4.1D; do (cat $f; echo '') >> Mean80_pred.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_rsp") {printf "%s:%s ", $1, $2}}' > Mean80_rsp_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_rsp") {printf "%s:%s ", $1, $2}}' > Mean80_rsp_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_rsp") {printf "%s:%s ", $1, $2}}' > Mean80_rsp_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_rsp") {printf "%s:%s ", $1, $2}}' > Mean80_rsp_run4.1D
    rm -f Mean80_rsp.1D
    for f in Mean80_rsp_run1.1D Mean80_rsp_run2.1D Mean80_rsp_run3.1D Mean80_rsp_run4.1D; do (cat $f; echo '') >> Mean80_rsp.1D; done

    # Nice_60 prediction/response
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_pred") {printf "%s:%s ", $1, $2}}' > Nice60_pred_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_pred") {printf "%s:%s ", $1, $2}}' > Nice60_pred_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_pred") {printf "%s:%s ", $1, $2}}' > Nice60_pred_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_pred") {printf "%s:%s ", $1, $2}}' > Nice60_pred_run4.1D
    rm -f Nice60_pred.1D
    for f in Nice60_pred_run1.1D Nice60_pred_run2.1D Nice60_pred_run3.1D Nice60_pred_run4.1D; do (cat $f; echo '') >> Nice60_pred.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_rsp") {printf "%s:%s ", $1, $2}}' > Nice60_rsp_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_rsp") {printf "%s:%s ", $1, $2}}' > Nice60_rsp_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_rsp") {printf "%s:%s ", $1, $2}}' > Nice60_rsp_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_rsp") {printf "%s:%s ", $1, $2}}' > Nice60_rsp_run4.1D
    rm -f Nice60_rsp.1D
    for f in Nice60_rsp_run1.1D Nice60_rsp_run2.1D Nice60_rsp_run3.1D Nice60_rsp_run4.1D; do (cat $f; echo '') >> Nice60_rsp.1D; done

    # Nice80 prediction/response
    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_pred") {printf "%s:%s ", $1, $2}}' > Nice80_pred_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_pred") {printf "%s:%s ", $1, $2}}' > Nice80_pred_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_pred") {printf "%s:%s ", $1, $2}}' > Nice80_pred_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_pred") {printf "%s:%s ", $1, $2}}' > Nice80_pred_run4.1D
    rm -f Nice80_pred.1D
    for f in Nice80_pred_run1.1D Nice80_pred_run2.1D Nice80_pred_run3.1D Nice80_pred_run4.1D; do (cat $f; echo '') >> Nice80_pred.1D; done

    cat sub-${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_rsp") {printf "%s:%s ", $1, $2}}' > Nice80_rsp_run1.1D
    cat sub-${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_rsp") {printf "%s:%s ", $1, $2}}' > Nice80_rsp_run2.1D
    cat sub-${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_rsp") {printf "%s:%s ", $1, $2}}' > Nice80_rsp_run3.1D
    cat sub-${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_rsp") {printf "%s:%s ", $1, $2}}' > Nice80_rsp_run4.1D
    rm -f Nice80_rsp.1D
    for f in Nice80_rsp_run1.1D Nice80_rsp_run2.1D Nice80_rsp_run3.1D Nice80_rsp_run4.1D; do (cat $f; echo '') >> Nice80_rsp.1D; done


    ############################################################
    # PAD RUN‑WISE NonPM FILES TO 4 ROWS (AFNI MULTI‑RUN)
    ############################################################
    # AFNI expects one row per run for multi‑run datasets.
    # Each run‑wise file currently has 1 row. Pad to 4 rows
    # using '*' for non‑target runs.

    for f in NonPM_*_run*.1D; do
        run=$(echo "$f" | sed -E 's/.*_run([1-4])\.1D/\1/')
        line=$(tr -d '
' < "$f")
        if [ -z "$line" ]; then
            line="*"
        fi
        case "$run" in
            1) printf "%s
*
*
*
" "$line" > "$f" ;;
            2) printf "*
%s
*
*
" "$line" > "$f" ;;
            3) printf "*
*
%s
*
" "$line" > "$f" ;;
            4) printf "*
*
*
%s
" "$line" > "$f" ;;
        esac
    done

done

```

Source script (lab original): `/data/projects/STUDIES/LEARN/fMRI/code/afni/LEARN_1D_AFNItiming_Full.sh`

The RSA timing script above is a run‑wise adaptation of this lab script. The original script is not reproduced here verbatim to avoid redundancy, but the full source is available at the path above.

Output example:

Example (run‑wise files for one condition; note `*` fillers for non‑target runs):

| Run 1 file | Run 2 file | Run 3 file | Run 4 file |
| --- | --- | --- | --- |
| 217.826:3 <br>`*`<br>`*`<br>`*` | `*`<br>32.757:3 356.689:3 <br>`*`<br>`*` | `*`<br>`*`<br>217.827:3 <br>`*` | `*`<br>`*`<br>`*`<br>125.305:3 310.371:3 |

This shows how each run‑specific file contains timing only for its run, with `*` in the other three rows.

- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2/sub-1522/NonPM_Mean80_fdkn_run1.1D`

**Step 3 – Generate AFNI proc scripts (no blur) from raw BIDS**

This step is **not a new preprocessing design**. It is a **replica of the lab’s AFNI preprocessing script**, with **one intentional change** for RSA: **remove blur**. Everything else (despike/tshift/align/tlrc/volreg/mask/scale/regress, censoring, SSW anatomy usage) stays aligned with the lab’s AFNI pipeline.

**3.1 The lab AFNI preprocessing recipe we cloned**
- Source script (lab pipeline): `/data/projects/STUDIES/LEARN/fMRI/code/afni/LEARN_ap_Full_all.sh`
- This is the canonical AFNI preprocessing recipe already used by the lab pipeline.
- Same file via the mounted drive on my computer:
- `/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/code/afni/LEARN_ap_Full_all.sh`
- How to open it quickly:
```bash
less /data/projects/STUDIES/LEARN/fMRI/code/afni/LEARN_ap_Full_all.sh
# or (mounted drive)
less /Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/code/afni/LEARN_ap_Full_all.sh
```

Key lines in the lab script (show blur is included):
```tcsh
-blocks despike tshift align tlrc volreg blur mask scale regress \
...
-blur_size 6 \
```

**3.2 The RSA adaptation (same pipeline, blur removed)**
- Script we ran: `rsa-learn/scripts/LEARN_ap_Full_RSA_runwise_AFNI_noblur.sh`
- It is a **direct adaptation** of the lab script. The only changes were:
- Inputs **remain raw BIDS** (`sub-<id>_task-learn_run-01_bold.nii.gz`), matching the lab AFNI recipe.
- Timing inputs switched to **run‑wise NonPM** files under `TimingFiles/Fixed2`.
- **Blur removed** (no `blur` block, no `-blur_size`).

How to verify the adaptation (diff vs lab script):
```bash
diff -u /data/projects/STUDIES/LEARN/fMRI/code/afni/LEARN_ap_Full_all.sh \
  /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_ap_Full_RSA_runwise_AFNI_noblur.sh | less
```
What you should see in the diff:
- Timing file paths updated to `RSA-learn/TimingFiles/Fixed2/...`
- The `blur` block removed and no `-blur_size`
- Everything else (despike/tshift/align/tlrc/volreg/mask/scale/regress + SSW anatomy usage) preserved

Key diff hunks (minimal):
```diff
-    -blocks despike tshift align tlrc volreg blur mask scale regress \
-    -blur_size 6 \
+    -blocks despike tshift align tlrc volreg mask scale regress \
```
```diff
-        $stimdurmoddir/Mean60_fdkm.1D \
+        $stimdir/NonPM_Mean60_fdkm_run1.1D \
+        $stimdir/NonPM_Mean60_fdkm_run2.1D \
+        $stimdir/NonPM_Mean60_fdkm_run3.1D \
+        $stimdir/NonPM_Mean60_fdkm_run4.1D \
```

Proof of blur removal in the RSA script (actual line from the script):
```tcsh
-blocks despike tshift align tlrc volreg mask scale regress \
# (lab default includes 'blur' between volreg and mask)
```
There is **no** `-blur_size` line anywhere in this script.

**3.3 What a “proc file” is, and when preprocessing vs GLM happens**
- `afni_proc.py` **generates a proc file** (a full AFNI script).
- That proc file **runs preprocessing first** (despike → tshift → align → tlrc → volreg → mask → scale), then runs the **GLM** (`3dDeconvolve`/`3dREMLfit`) at the end.
- Running the proc file is what actually performs preprocessing and the GLM.
- Example proc file location: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/<id>/proc.<id>.LEARN_RSA_runwise_AFNI`

Purpose: use the **lab AFNI preprocessing** on raw BIDS **without blur**, and embed the run‑wise timing + GLTs for RSA.

Script (full): `rsa-learn/scripts/LEARN_ap_Full_RSA_runwise_AFNI_noblur.sh`
```tcsh
#!/bin/tcsh

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA‑learn RUN‑WISE afni_proc generator (AFNI raw‑BIDS, NO smoothing)
#
# This script adapts the lab’s AFNI preprocessing pipeline to RSA run‑wise
# betas using raw BIDS inputs (not fMRIPrep). It removes the blur block to
# keep patterns unsmoothed for RSA.
#
# Author: RSA‑learn adaptation
# Date: 2026‑02‑14

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

# RSA‑learn timing files (run‑wise NonPM)
set subjecttiming = $topdir/RSA-learn/TimingFiles/Full

# RSA‑learn output root
set results = $topdir/RSA-learn/derivatives/afni/IndvlLvlAnalyses

# AFNI SSW anatomy outputs
set anat_dir = $topdir/derivatives/afni/ssw

# Optional overrides
if ( $?BIDS_DIR_OVERRIDE ) set subjbids = $BIDS_DIR_OVERRIDE
if ( $?TIMING_ROOT_OVERRIDE ) set subjecttiming = $TIMING_ROOT_OVERRIDE

############################################################################################
# BEGIN
############################################################################################

cd $results

foreach subj ( $subjects )

    mkdir -p $subj
    cd $subj

    set subj_dir = $subjbids/sub-$subj
    set stimdir = $subjecttiming/sub-$subj

    afni_proc.py -subj_id $subj \
        -dsets \
            $subj_dir/func/sub-${subj}_task-learn_run-01_bold.nii.gz \
            $subj_dir/func/sub-${subj}_task-learn_run-02_bold.nii.gz \
            $subj_dir/func/sub-${subj}_task-learn_run-03_bold.nii.gz \
            $subj_dir/func/sub-${subj}_task-learn_run-04_bold.nii.gz \
        -scr_overwrite \
        -script $results/$subj/proc.$subj.$GLM \
        -out_dir $subj.results.$GLM \
        -blocks despike tshift align tlrc volreg mask scale regress \
        -copy_anat $anat_dir/sub-${subj}/anatSS.$subj.nii \
        -anat_has_skull no \
        -anat_follower anat_w_skull anat $anat_dir/sub-${subj}/anatU.$subj.nii \
        -mask_epi_anat yes \
        -tlrc_base MNI152_2009_template_SSW.nii.gz \
        -tshift_align_to -tzero 0 \
        -align_opts_aea \
            -giant_move \
            -cost lpc+ZZ \
            -AddEdge \
            -anat_uniform_method unifize \
        -tlrc_NL_warped_dsets \
            $anat_dir/sub-${subj}/anatQQ.${subj}.nii \
            $anat_dir/sub-${subj}/anatQQ.${subj}.aff12.1D \
            $anat_dir/sub-${subj}/anatQQ.${subj}_WARP.nii \
        -volreg_align_to MIN_OUTLIER \
        -volreg_align_e2a \
        -volreg_tlrc_warp \
        -mask_dilate 1 \
        -scale_max_val 200 \
        -regress_censor_outliers 0.1 \
        -regress_motion_per_run \
        -regress_censor_motion $motion_max \
        -regress_est_blur_epits \
        -regress_est_blur_errts \
        -regress_run_clustsim yes \
        -html_review_style pythonic \
        -test_stim_files no \
        -regress_stim_times \
        $stimdir/NonPM_Mean60_fdkm_run1.1D \
        $stimdir/NonPM_Mean60_fdkn_run1.1D \
        $stimdir/NonPM_Mean80_fdkm_run1.1D \
        $stimdir/NonPM_Mean80_fdkn_run1.1D \
        $stimdir/NonPM_Nice60_fdkm_run1.1D \
        $stimdir/NonPM_Nice60_fdkn_run1.1D \
        $stimdir/NonPM_Nice80_fdkm_run1.1D \
        $stimdir/NonPM_Nice80_fdkn_run1.1D \
        $stimdir/NonPM_Mean60_fdkm_run2.1D \
        $stimdir/NonPM_Mean60_fdkn_run2.1D \
        $stimdir/NonPM_Mean80_fdkm_run2.1D \
        $stimdir/NonPM_Mean80_fdkn_run2.1D \
        $stimdir/NonPM_Nice60_fdkm_run2.1D \
        $stimdir/NonPM_Nice60_fdkn_run2.1D \
        $stimdir/NonPM_Nice80_fdkm_run2.1D \
        $stimdir/NonPM_Nice80_fdkn_run2.1D \
        $stimdir/NonPM_Mean60_fdkm_run3.1D \
        $stimdir/NonPM_Mean60_fdkn_run3.1D \
        $stimdir/NonPM_Mean80_fdkm_run3.1D \
        $stimdir/NonPM_Mean80_fdkn_run3.1D \
        $stimdir/NonPM_Nice60_fdkm_run3.1D \
        $stimdir/NonPM_Nice60_fdkn_run3.1D \
        $stimdir/NonPM_Nice80_fdkm_run3.1D \
        $stimdir/NonPM_Nice80_fdkn_run3.1D \
        $stimdir/NonPM_Mean60_fdkm_run4.1D \
        $stimdir/NonPM_Mean60_fdkn_run4.1D \
        $stimdir/NonPM_Mean80_fdkm_run4.1D \
        $stimdir/NonPM_Mean80_fdkn_run4.1D \
        $stimdir/NonPM_Nice60_fdkm_run4.1D \
        $stimdir/NonPM_Nice60_fdkn_run4.1D \
        $stimdir/NonPM_Nice80_fdkm_run4.1D \
        $stimdir/NonPM_Nice80_fdkn_run4.1D \
        $stimdir/Mean60_pred.1D \
        $stimdir/Mean60_rsp.1D \
        $stimdir/Mean80_pred.1D \
        $stimdir/Mean80_rsp.1D \
        $stimdir/Nice60_pred.1D \
        $stimdir/Nice60_rsp.1D \
        $stimdir/Nice80_pred.1D \
        $stimdir/Nice80_rsp.1D \
        -regress_stim_labels \
        FBM.Mean60.r1 \
        FBN.Mean60.r1 \
        FBM.Mean80.r1 \
        FBN.Mean80.r1 \
        FBM.Nice60.r1 \
        FBN.Nice60.r1 \
        FBM.Nice80.r1 \
        FBN.Nice80.r1 \
        FBM.Mean60.r2 \
        FBN.Mean60.r2 \
        FBM.Mean80.r2 \
        FBN.Mean80.r2 \
        FBM.Nice60.r2 \
        FBN.Nice60.r2 \
        FBM.Nice80.r2 \
        FBN.Nice80.r2 \
        FBM.Mean60.r3 \
        FBN.Mean60.r3 \
        FBM.Mean80.r3 \
        FBN.Mean80.r3 \
        FBM.Nice60.r3 \
        FBN.Nice60.r3 \
        FBM.Nice80.r3 \
        FBN.Nice80.r3 \
        FBM.Mean60.r4 \
        FBN.Mean60.r4 \
        FBM.Mean80.r4 \
        FBN.Mean80.r4 \
        FBM.Nice60.r4 \
        FBN.Nice60.r4 \
        FBM.Nice80.r4 \
        FBN.Nice80.r4 \
        Pred.Mean60 \
        Resp.Mean60 \
        Pred.Mean80 \
        Resp.Mean80 \
        Pred.Nice60 \
        Resp.Nice60 \
        Pred.Nice80 \
        Resp.Nice80 \
        -regress_stim_types \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        AM1 \
        -regress_basis_multi \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        'dmBLOCK(0)' \
        -regress_make_ideal_sum IDEAL_sum.1D \
        -regress_opts_3dD \
            -local_times \
            -num_glt 45 \
        -gltsym 'SYM: +FBM.Mean60.r1 +FBN.Mean60.r1 +FBM.Mean80.r1 +FBN.Mean80.r1 +FBM.Nice60.r1 +FBN.Nice60.r1 +FBM.Nice80.r1 +FBN.Nice80.r1 +FBM.Mean60.r2 +FBN.Mean60.r2 +FBM.Mean80.r2 +FBN.Mean80.r2 +FBM.Nice60.r2 +FBN.Nice60.r2 +FBM.Nice80.r2 +FBN.Nice80.r2 +FBM.Mean60.r3 +FBN.Mean60.r3 +FBM.Mean80.r3 +FBN.Mean80.r3 +FBM.Nice60.r3 +FBN.Nice60.r3 +FBM.Nice80.r3 +FBN.Nice80.r3 +FBM.Mean60.r4 +FBN.Mean60.r4 +FBM.Mean80.r4 +FBN.Mean80.r4 +FBM.Nice60.r4 +FBN.Nice60.r4 +FBM.Nice80.r4 +FBN.Nice80.r4 +Pred.Mean60 +Resp.Mean60 +Pred.Mean80 +Resp.Mean80 +Pred.Nice60 +Resp.Nice60 +Pred.Nice80 +Resp.Nice80' -glt_label 1 Task.V.BL \
        -gltsym 'SYM: +Pred.Mean60 +Pred.Mean80 +Pred.Nice60 +Pred.Nice80' -glt_label 2 Prediction.V.BL \
        -gltsym 'SYM: +Pred.Mean60 +Pred.Mean80 -Pred.Nice60 -Pred.Nice80' -glt_label 3 Prediction.Mean.V.Nice \
        -gltsym 'SYM: +FBM.Mean60.r1 +FBN.Mean60.r1 +FBM.Mean80.r1 +FBN.Mean80.r1 +FBM.Nice60.r1 +FBN.Nice60.r1 +FBM.Nice80.r1 +FBN.Nice80.r1 +FBM.Mean60.r2 +FBN.Mean60.r2 +FBM.Mean80.r2 +FBN.Mean80.r2 +FBM.Nice60.r2 +FBN.Nice60.r2 +FBM.Nice80.r2 +FBN.Nice80.r2 +FBM.Mean60.r3 +FBN.Mean60.r3 +FBM.Mean80.r3 +FBN.Mean80.r3 +FBM.Nice60.r3 +FBN.Nice60.r3 +FBM.Nice80.r3 +FBN.Nice80.r3 +FBM.Mean60.r4 +FBN.Mean60.r4 +FBM.Mean80.r4 +FBN.Mean80.r4 +FBM.Nice60.r4 +FBN.Nice60.r4 +FBM.Nice80.r4 +FBN.Nice80.r4' -glt_label 4 FB.V.BL \
        -gltsym 'SYM: +FBM.Mean60.r1 +FBM.Mean80.r1 +FBM.Nice60.r1 +FBM.Nice80.r1 +FBM.Mean60.r2 +FBM.Mean80.r2 +FBM.Nice60.r2 +FBM.Nice80.r2 +FBM.Mean60.r3 +FBM.Mean80.r3 +FBM.Nice60.r3 +FBM.Nice80.r3 +FBM.Mean60.r4 +FBM.Mean80.r4 +FBM.Nice60.r4 +FBM.Nice80.r4' -glt_label 5 FBM.V.BL \
        -gltsym 'SYM: +FBN.Mean60.r1 +FBN.Mean80.r1 +FBN.Nice60.r1 +FBN.Nice80.r1 +FBN.Mean60.r2 +FBN.Mean80.r2 +FBN.Nice60.r2 +FBN.Nice80.r2 +FBN.Mean60.r3 +FBN.Mean80.r3 +FBN.Nice60.r3 +FBN.Nice80.r3 +FBN.Mean60.r4 +FBN.Mean80.r4 +FBN.Nice60.r4 +FBN.Nice80.r4' -glt_label 6 FBN.V.BL \
        -gltsym 'SYM: +FBM.Mean60.r1 +FBM.Mean80.r1 +FBM.Nice60.r1 +FBM.Nice80.r1 +FBM.Mean60.r2 +FBM.Mean80.r2 +FBM.Nice60.r2 +FBM.Nice80.r2 +FBM.Mean60.r3 +FBM.Mean80.r3 +FBM.Nice60.r3 +FBM.Nice80.r3 +FBM.Mean60.r4 +FBM.Mean80.r4 +FBM.Nice60.r4 +FBM.Nice80.r4 -FBN.Mean60.r1 -FBN.Mean80.r1 -FBN.Nice60.r1 -FBN.Nice80.r1 -FBN.Mean60.r2 -FBN.Mean80.r2 -FBN.Nice60.r2 -FBN.Nice80.r2 -FBN.Mean60.r3 -FBN.Mean80.r3 -FBN.Nice60.r3 -FBN.Nice80.r3 -FBN.Mean60.r4 -FBN.Mean80.r4 -FBN.Nice60.r4 -FBN.Nice80.r4' -glt_label 7 FBM.V.FBN \
        -gltsym 'SYM: +0.5*FBM.Mean60.r1 +0.5*FBN.Mean60.r1' -glt_label 8 Mean60.r1 \
        -gltsym 'SYM: +0.5*FBM.Mean80.r1 +0.5*FBN.Mean80.r1' -glt_label 9 Mean80.r1 \
        -gltsym 'SYM: +0.5*FBM.Nice60.r1 +0.5*FBN.Nice60.r1' -glt_label 10 Nice60.r1 \
        -gltsym 'SYM: +0.5*FBM.Nice80.r1 +0.5*FBN.Nice80.r1' -glt_label 11 Nice80.r1 \
        -gltsym 'SYM: +0.5*FBM.Mean60.r2 +0.5*FBN.Mean60.r2' -glt_label 12 Mean60.r2 \
        -gltsym 'SYM: +0.5*FBM.Mean80.r2 +0.5*FBN.Mean80.r2' -glt_label 13 Mean80.r2 \
        -gltsym 'SYM: +0.5*FBM.Nice60.r2 +0.5*FBN.Nice60.r2' -glt_label 14 Nice60.r2 \
        -gltsym 'SYM: +0.5*FBM.Nice80.r2 +0.5*FBN.Nice80.r2' -glt_label 15 Nice80.r2 \
        -gltsym 'SYM: +0.5*FBM.Mean60.r3 +0.5*FBN.Mean60.r3' -glt_label 16 Mean60.r3 \
        -gltsym 'SYM: +0.5*FBM.Mean80.r3 +0.5*FBN.Mean80.r3' -glt_label 17 Mean80.r3 \
        -gltsym 'SYM: +0.5*FBM.Nice60.r3 +0.5*FBN.Nice60.r3' -glt_label 18 Nice60.r3 \
        -gltsym 'SYM: +0.5*FBM.Nice80.r3 +0.5*FBN.Nice80.r3' -glt_label 19 Nice80.r3 \
        -gltsym 'SYM: +0.5*FBM.Mean60.r4 +0.5*FBN.Mean60.r4' -glt_label 20 Mean60.r4 \
        -gltsym 'SYM: +0.5*FBM.Mean80.r4 +0.5*FBN.Mean80.r4' -glt_label 21 Mean80.r4 \
        -gltsym 'SYM: +0.5*FBM.Nice60.r4 +0.5*FBN.Nice60.r4' -glt_label 22 Nice60.r4 \
        -gltsym 'SYM: +0.5*FBM.Nice80.r4 +0.5*FBN.Nice80.r4' -glt_label 23 Nice80.r4 \
        -gltsym 'SYM: +0.25*FBM.Mean60.r1 +0.25*FBM.Mean80.r1 +0.25*FBM.Nice60.r1 +0.25*FBM.Nice80.r1' -glt_label 24 FBM.r1 \
        -gltsym 'SYM: +0.25*FBN.Mean60.r1 +0.25*FBN.Mean80.r1 +0.25*FBN.Nice60.r1 +0.25*FBN.Nice80.r1' -glt_label 25 FBN.r1 \
        -gltsym 'SYM: +0.25*FBM.Mean60.r2 +0.25*FBM.Mean80.r2 +0.25*FBM.Nice60.r2 +0.25*FBM.Nice80.r2' -glt_label 26 FBM.r2 \
        -gltsym 'SYM: +0.25*FBN.Mean60.r2 +0.25*FBN.Mean80.r2 +0.25*FBN.Nice60.r2 +0.25*FBN.Nice80.r2' -glt_label 27 FBN.r2 \
        -gltsym 'SYM: +0.25*FBM.Mean60.r3 +0.25*FBM.Mean80.r3 +0.25*FBM.Nice60.r3 +0.25*FBM.Nice80.r3' -glt_label 28 FBM.r3 \
        -gltsym 'SYM: +0.25*FBN.Mean60.r3 +0.25*FBN.Mean80.r3 +0.25*FBN.Nice60.r3 +0.25*FBN.Nice80.r3' -glt_label 29 FBN.r3 \
        -gltsym 'SYM: +0.25*FBM.Mean60.r4 +0.25*FBM.Mean80.r4 +0.25*FBM.Nice60.r4 +0.25*FBM.Nice80.r4' -glt_label 30 FBM.r4 \
        -gltsym 'SYM: +0.25*FBN.Mean60.r4 +0.25*FBN.Mean80.r4 +0.25*FBN.Nice60.r4 +0.25*FBN.Nice80.r4' -glt_label 31 FBN.r4 \
        -gltsym 'SYM: +0.25*FBM.Mean60.r1 +0.25*FBM.Mean60.r2 +0.25*FBM.Mean60.r3 +0.25*FBM.Mean60.r4' -glt_label 32 FBM.Mean60.all \
        -gltsym 'SYM: +0.25*FBN.Mean60.r1 +0.25*FBN.Mean60.r2 +0.25*FBN.Mean60.r3 +0.25*FBN.Mean60.r4' -glt_label 33 FBN.Mean60.all \
        -gltsym 'SYM: +0.25*FBM.Mean80.r1 +0.25*FBM.Mean80.r2 +0.25*FBM.Mean80.r3 +0.25*FBM.Mean80.r4' -glt_label 34 FBM.Mean80.all \
        -gltsym 'SYM: +0.25*FBN.Mean80.r1 +0.25*FBN.Mean80.r2 +0.25*FBN.Mean80.r3 +0.25*FBN.Mean80.r4' -glt_label 35 FBN.Mean80.all \
        -gltsym 'SYM: +0.25*FBM.Nice60.r1 +0.25*FBM.Nice60.r2 +0.25*FBM.Nice60.r3 +0.25*FBM.Nice60.r4' -glt_label 36 FBM.Nice60.all \
        -gltsym 'SYM: +0.25*FBN.Nice60.r1 +0.25*FBN.Nice60.r2 +0.25*FBN.Nice60.r3 +0.25*FBN.Nice60.r4' -glt_label 37 FBN.Nice60.all \
        -gltsym 'SYM: +0.25*FBM.Nice80.r1 +0.25*FBM.Nice80.r2 +0.25*FBM.Nice80.r3 +0.25*FBM.Nice80.r4' -glt_label 38 FBM.Nice80.all \
        -gltsym 'SYM: +0.25*FBN.Nice80.r1 +0.25*FBN.Nice80.r2 +0.25*FBN.Nice80.r3 +0.25*FBN.Nice80.r4' -glt_label 39 FBN.Nice80.all \
        -gltsym 'SYM: +0.125*FBM.Mean60.r1 +0.125*FBN.Mean60.r1 +0.125*FBM.Mean60.r2 +0.125*FBN.Mean60.r2 +0.125*FBM.Mean60.r3 +0.125*FBN.Mean60.r3 +0.125*FBM.Mean60.r4 +0.125*FBN.Mean60.r4' -glt_label 40 Mean60.all \
        -gltsym 'SYM: +0.125*FBM.Mean80.r1 +0.125*FBN.Mean80.r1 +0.125*FBM.Mean80.r2 +0.125*FBN.Mean80.r2 +0.125*FBM.Mean80.r3 +0.125*FBN.Mean80.r3 +0.125*FBM.Mean80.r4 +0.125*FBN.Mean80.r4' -glt_label 41 Mean80.all \
        -gltsym 'SYM: +0.125*FBM.Nice60.r1 +0.125*FBN.Nice60.r1 +0.125*FBM.Nice60.r2 +0.125*FBN.Nice60.r2 +0.125*FBM.Nice60.r3 +0.125*FBN.Nice60.r3 +0.125*FBM.Nice60.r4 +0.125*FBN.Nice60.r4' -glt_label 42 Nice60.all \
        -gltsym 'SYM: +0.125*FBM.Nice80.r1 +0.125*FBN.Nice80.r1 +0.125*FBM.Nice80.r2 +0.125*FBN.Nice80.r2 +0.125*FBM.Nice80.r3 +0.125*FBN.Nice80.r3 +0.125*FBM.Nice80.r4 +0.125*FBN.Nice80.r4' -glt_label 43 Nice80.all \
        -gltsym 'SYM: +0.0625*FBM.Mean60.r1 +0.0625*FBM.Mean80.r1 +0.0625*FBM.Nice60.r1 +0.0625*FBM.Nice80.r1 +0.0625*FBM.Mean60.r2 +0.0625*FBM.Mean80.r2 +0.0625*FBM.Nice60.r2 +0.0625*FBM.Nice80.r2 +0.0625*FBM.Mean60.r3 +0.0625*FBM.Mean80.r3 +0.0625*FBM.Nice60.r3 +0.0625*FBM.Nice80.r3 +0.0625*FBM.Mean60.r4 +0.0625*FBM.Mean80.r4 +0.0625*FBM.Nice60.r4 +0.0625*FBM.Nice80.r4' -glt_label 44 FBM.all \
        -gltsym 'SYM: +0.0625*FBN.Mean60.r1 +0.0625*FBN.Mean80.r1 +0.0625*FBN.Nice60.r1 +0.0625*FBN.Nice80.r1 +0.0625*FBN.Mean60.r2 +0.0625*FBN.Mean80.r2 +0.0625*FBN.Nice60.r2 +0.0625*FBN.Nice80.r2 +0.0625*FBN.Mean60.r3 +0.0625*FBN.Mean80.r3 +0.0625*FBN.Nice60.r3 +0.0625*FBN.Nice80.r3 +0.0625*FBN.Mean60.r4 +0.0625*FBN.Mean80.r4 +0.0625*FBN.Nice60.r4 +0.0625*FBN.Nice80.r4' -glt_label 45 FBN.all \
        -cbucket cbucket.stats.$subj \
        -jobs $jobs

    cd ..
end

```

Key inputs in this script:
- Raw BIDS runs: `/data/projects/STUDIES/LEARN/fMRI/bids/sub-<id>/func/sub-<id>_task-learn_run-01_bold.nii.gz` (runs 01–04)
- AFNI SSW anatomy: `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/ssw/sub-<id>/anatSS.<id>.nii`
- Run-wise timing: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2/sub-<id>/NonPM_*_runX.1D`

**Step 4 – Run availability audit (raw BIDS)**
Purpose: verify whether any subjects truly have only 2–3 runs in raw BIDS, before deciding whether a fallback is needed.

Audit command (run on mounted BIDS):
```bash
python3 - <<'PY'
import glob, os, re
bids="/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/bids"
subs=sorted([d for d in glob.glob(os.path.join(bids,"sub-*")) if os.path.isdir(d)])
missing=[]
for s in subs:
    sid=os.path.basename(s).split("-")[1]
    files=glob.glob(os.path.join(s,"func",f"sub-{sid}_task-learn_run-*_bold.nii.gz"))
    runs=set()
    for f in files:
        m=re.search(r"run-(\\d+)_bold",f)
        if m:
            runs.add(int(m.group(1)))
    if runs:
        if len(runs) != 4:
            missing.append((sid,sorted(runs)))
    else:
        missing.append((sid,[]))
print("n_subs",len(subs))
print("missing_count",len(missing))
for sid,runs in missing:
    print(sid, runs)
PY
```

Audit result (raw BIDS run files):
- `n_subs 55`
- `missing_count 2`
- `1165 [1, 2, 3]` (missing run 4)
- `1274 [1, 2]` (missing runs 3–4)

Why this did not necessarily crash earlier runs:
- The **orchestrator script checks run availability** per subject.
- If a subject has `<4` runs, it **invokes the fallback patcher** to rewrite the proc script with only those runs (so AFNI doesn’t try to load missing data).
- This is why missing‑run subjects can still run without a hard error.

**Optional fallback (only if a subject truly has <4 runs)**
The script below shows how a proc would be rewritten to only include the available runs and recompute GLTs. It was kept as a reference.

<details>
<summary>Fallback patch script (example only)</summary>

Script (full): `rsa-learn/scripts/LEARN_ap_fallback_patch_afni_raw.py`
```python
#!/usr/bin/env python3
from pathlib import Path
import sys

# Usage: LEARN_ap_fallback_patch_afni_raw.py <ap_tmp> <subj> <runs...>

def main():
    if len(sys.argv) < 4:
        raise SystemExit("Usage: LEARN_ap_fallback_patch_afni_raw.py <ap_tmp> <subj> <runs...>")

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

    text = ap.read_text()
    lines = text.splitlines()

    def replace_block(lines_in, start_key, end_key, new_lines):
        out = []
        i = 0
        while i < len(lines_in):
            line = lines_in[i]
            if start_key in line:
                out.append(line)
                i += 1
                while i < len(lines_in) and end_key not in lines_in[i]:
                    i += 1
                out.extend(new_lines)
                continue
            if end_key in line:
                out.append(line)
                i += 1
                continue
            out.append(line)
            i += 1
        return out

    def replace_stim_times(lines_in, stim_times_lines):
        out = []
        i = 0
        while i < len(lines_in):
            line = lines_in[i]
            if line.lstrip().startswith("-regress_stim_times"):
                out.append(line)
                i += 1
                while i < len(lines_in) and "-regress_stim_labels" not in lines_in[i]:
                    i += 1
                out.extend(stim_times_lines)
                continue
            out.append(line)
            i += 1
        return out

    def build_dsets():
        out = []
        for r in runs:
            out.append(f"\t\t\t{subj_dir}/func/sub-{subj}_task-learn_run-{r:02d}_bold.nii.gz \\")
        return out

    stim_times = []
    stim_labels = []
    for r in runs:
        for s, lab in stim_defs:
            stim_times.append(f"\t\t{stimdir}/{s}_run{r}.1D \\")
            stim_labels.append(f"\t\t{lab}.r{r} \\")

    for s, lab in pred_resp:
        stim_times.append(f"\t\t{stimdir}/{s}.1D \\")
        stim_labels.append(f"\t\t{lab} \\")

    stim_count = len(stim_labels)
    stim_types = ["\t\tAM1 \\"] * stim_count
    basis_multi = ["\t\t'dmBLOCK(0)' \\"] * stim_count

    lines2 = replace_block(lines, "-dsets", "-scr_overwrite", build_dsets())
    lines2 = replace_stim_times(lines2, stim_times)
    lines2 = replace_block(lines2, "-regress_stim_labels", "-regress_stim_types", stim_labels)
    lines2 = replace_block(lines2, "-regress_stim_types", "-regress_basis_multi", stim_types)
    lines2 = replace_block(lines2, "-regress_basis_multi", "-regress_make_ideal_sum", basis_multi)

    # Ensure -regress_stim_times exists
    if not any(l.lstrip().startswith("-regress_stim_times") for l in lines2):
        for i, l in enumerate(lines2):
            if "-test_stim_files" in l or "-regress_stim_times_offset" in l:
                lines2.insert(i + 1, "\t\t-regress_stim_times \\")
                break

    def fmt_w(x):
        return "" if abs(x - 1.0) < 1e-8 else f"{x:.6f}*"

    def glt(sym, label, idx):
        return f"\t\t-gltsym 'SYM: {sym}' -glt_label {idx} {label} \\"

    runs_sorted = runs
    num_runs = len(runs_sorted)

    def all_run_terms(peer=None, cond=None):
        terms = []
        for r in runs_sorted:
            if peer and cond:
                terms.append(f"+{peer}.{cond}.r{r}")
            elif peer:
                for c in ["Mean60", "Mean80", "Nice60", "Nice80"]:
                    terms.append(f"+{peer}.{c}.r{r}")
            else:
                for p in ["FBM", "FBN"]:
                    for c in ["Mean60", "Mean80", "Nice60", "Nice80"]:
                        terms.append(f"+{p}.{c}.r{r}")
        return terms

    glt_lines = []
    idx = 1

    task_terms = all_run_terms() + [
        "+Pred.Mean60", "+Resp.Mean60", "+Pred.Mean80", "+Resp.Mean80",
        "+Pred.Nice60", "+Resp.Nice60", "+Pred.Nice80", "+Resp.Nice80",
    ]
    glt_lines.append(glt(" ".join(task_terms), "Task.V.BL", idx)); idx += 1
    glt_lines.append(glt("+Pred.Mean60 +Pred.Mean80 +Pred.Nice60 +Pred.Nice80", "Prediction.V.BL", idx)); idx += 1
    glt_lines.append(glt("+Pred.Mean60 +Pred.Mean80 -Pred.Nice60 -Pred.Nice80", "Prediction.Mean.V.Nice", idx)); idx += 1
    glt_lines.append(glt(" ".join(all_run_terms()), "FB.V.BL", idx)); idx += 1
    glt_lines.append(glt(" ".join(all_run_terms(peer="FBM")), "FBM.V.BL", idx)); idx += 1
    glt_lines.append(glt(" ".join(all_run_terms(peer="FBN")), "FBN.V.BL", idx)); idx += 1

    fbm_terms = all_run_terms(peer="FBM")
    fbn_terms = [t.replace("+", "-") for t in all_run_terms(peer="FBN")]
    glt_lines.append(glt(" ".join(fbm_terms + fbn_terms), "FBM.V.FBN", idx)); idx += 1

    for r in runs_sorted:
        glt_lines.append(glt(f"+0.5*FBM.Mean60.r{r} +0.5*FBN.Mean60.r{r}", f"Mean60.r{r}", idx)); idx += 1
        glt_lines.append(glt(f"+0.5*FBM.Mean80.r{r} +0.5*FBN.Mean80.r{r}", f"Mean80.r{r}", idx)); idx += 1
        glt_lines.append(glt(f"+0.5*FBM.Nice60.r{r} +0.5*FBN.Nice60.r{r}", f"Nice60.r{r}", idx)); idx += 1
        glt_lines.append(glt(f"+0.5*FBM.Nice80.r{r} +0.5*FBN.Nice80.r{r}", f"Nice80.r{r}", idx)); idx += 1

    for r in runs_sorted:
        glt_lines.append(glt(f"+0.25*FBM.Mean60.r{r} +0.25*FBM.Mean80.r{r} +0.25*FBM.Nice60.r{r} +0.25*FBM.Nice80.r{r}", f"FBM.r{r}", idx)); idx += 1
        glt_lines.append(glt(f"+0.25*FBN.Mean60.r{r} +0.25*FBN.Mean80.r{r} +0.25*FBN.Nice60.r{r} +0.25*FBN.Nice80.r{r}", f"FBN.r{r}", idx)); idx += 1

    wr = 1.0 / num_runs
    for cond in ["Mean60", "Mean80", "Nice60", "Nice80"]:
        fbm = " ".join([f"+{fmt_w(wr)}FBM.{cond}.r{r}" for r in runs_sorted])
        fbn = " ".join([f"+{fmt_w(wr)}FBN.{cond}.r{r}" for r in runs_sorted])
        glt_lines.append(glt(fbm, f"FBM.{cond}.all", idx)); idx += 1
        glt_lines.append(glt(fbn, f"FBN.{cond}.all", idx)); idx += 1

    wpr = 1.0 / (2 * num_runs)
    for cond in ["Mean60", "Mean80", "Nice60", "Nice80"]:
        terms = []
        for r in runs_sorted:
            terms.append(f"+{fmt_w(wpr)}FBM.{cond}.r{r}")
            terms.append(f"+{fmt_w(wpr)}FBN.{cond}.r{r}")
        glt_lines.append(glt(" ".join(terms), f"{cond}.all", idx)); idx += 1

    wfb = 1.0 / (4 * num_runs)
    fbm_terms = []
    fbn_terms = []
    for r in runs_sorted:
        for cond in ["Mean60", "Mean80", "Nice60", "Nice80"]:
            fbm_terms.append(f"+{fmt_w(wfb)}FBM.{cond}.r{r}")
            fbn_terms.append(f"+{fmt_w(wfb)}FBN.{cond}.r{r}")

    glt_lines.append(glt(" ".join(fbm_terms), "FBM.all", idx)); idx += 1
    glt_lines.append(glt(" ".join(fbn_terms), "FBN.all", idx)); idx += 1

    filtered = []
    inserted = False
    for line in lines2:
        if " -num_glt " in line or line.strip().startswith("-gltsym") or " -glt_label " in line:
            continue
        filtered.append(line)
        if (not inserted) and line.strip().startswith("-local_times"):
            filtered.append(f"\t\t-num_glt {len(glt_lines)} \\")
            filtered.extend(glt_lines)
            inserted = True

    ap.write_text("\n".join(filtered) + "\n")


if __name__ == "__main__":
    main()
```
</details>

**Step 5 – Run the full AFNI pipeline (proc + GLM) in tmux**
Purpose: run the AFNI proc scripts and GLM for all subjects using the fixed timing files.

How pre‑processing vs GLM happens in practice:
- `MAKE_PROC=1` only generates the `proc.<id>.LEARN_RSA_runwise_AFNI` scripts (no data processed yet).
- `RUN_GLM=1` executes each proc script. Each proc script performs **all preprocessing steps first**, then runs the **GLM** (3dDeconvolve/3dREMLfit) in the same script.

Call chain (who calls what):
- Orchestrator: `LEARN_run_RSA_runwise_pipeline_afni_raw.sh`
- Generates a single‑subject proc via `LEARN_ap_Full_RSA_runwise_AFNI_noblur.sh`
- Checks available runs from raw BIDS; if `<4`, calls the fallback patcher to rewrite the proc
- If `RUN_GLM=1`, runs the proc to do preprocessing + GLM

Minimal excerpt showing fallback invocation:
```bash
AP_FALLBACK="$SCRIPT_DIR/LEARN_ap_fallback_patch_afni_raw.py"
...
if [ "$run_count" -lt 4 ]; then
  echo "[RSA-learn] FALLBACK (runs=${RUNS[*]}): $subj"
  python3 "$AP_FALLBACK" "$AP_TMP" "$subj" ${RUNS[*]}
fi
```

Command used (tmux):
```bash
tmux kill-session -t rsa_afni
tmux new -s rsa_afni \
"SUBJ_ROOT=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2 \
TIMING_ROOT_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2 \
BIDS_DIR_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/bids \
MAKE_PROC=1 CLEAN_OUT=1 RUN_GLM=1 \
MAX_JOBS=16 LOAD_LIMIT=999 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_runwise_pipeline_afni_raw.sh"
```

Script (full): `rsa-learn/scripts/LEARN_run_RSA_runwise_pipeline_afni_raw.sh`
```bash
#!/bin/bash

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA‑learn RUN‑WISE pipeline (AFNI raw‑BIDS, NO smoothing)
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
#   - If a subject has 2–3 runs, rewrite afni_proc inputs to those runs
#     and recompute GLTs over available runs.
#   - If a subject has <2 runs, skip.
#
# Usage:
#   bash LEARN_run_RSA_runwise_pipeline_afni_raw.sh
#   MAX_JOBS=4 bash LEARN_run_RSA_runwise_pipeline_afni_raw.sh
#   SUBJ_ROOT=/path/to/sub-*/ bash LEARN_run_RSA_runwise_pipeline_afni_raw.sh
#
# Optional toggles (default = 1):
#   MAKE_PROC=1   CLEAN_OUT=1   RUN_GLM=1
#
# Author: RSA‑learn adaptation
# Date: 2026‑02‑14

set -euo pipefail

TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
RSA_DIR="$TOPDIR/RSA-learn"
SCRIPT_DIR="$RSA_DIR/scripts"
TMP_DIR="$RSA_DIR/tmp"
LOG_DIR="$RSA_DIR/logs"
RESULTS_DIR="$RSA_DIR/derivatives/afni/IndvlLvlAnalyses"
TIMING_ROOT="${TIMING_ROOT_OVERRIDE:-$RSA_DIR/TimingFiles/Full}"
BIDS_DIR="${BIDS_DIR_OVERRIDE:-$TOPDIR/bids}"

AP_ORIG="$SCRIPT_DIR/LEARN_ap_Full_RSA_runwise_AFNI_noblur.sh"
AP_FALLBACK="$SCRIPT_DIR/LEARN_ap_fallback_patch_afni_raw.py"

MAKE_PROC="${MAKE_PROC:-1}"
CLEAN_OUT="${CLEAN_OUT:-1}"
RUN_GLM="${RUN_GLM:-1}"
MAX_JOBS="${MAX_JOBS:-}"
LOAD_LIMIT="${LOAD_LIMIT:-}"
SUBJ_ROOT="${SUBJ_ROOT:-$TIMING_ROOT}"

mkdir -p "$TMP_DIR" "$LOG_DIR" "$RESULTS_DIR"

usage() {
  cat <<EOF
Usage:
  bash LEARN_run_RSA_runwise_pipeline_afni_raw.sh

Env:
  MAX_JOBS=N            # parallel subjects (default: CPU cores)
  LOAD_LIMIT=N          # 1-min loadavg threshold to start a new subject (default: MAX_JOBS)
  SUBJ_ROOT=/path/to/sub-*/  # override discovery root
  TIMING_ROOT_OVERRIDE=/path/to/timing
  BIDS_DIR_OVERRIDE=/path/to/bids

Toggles:
  MAKE_PROC=1   CLEAN_OUT=1   RUN_GLM=1
  (set any to 0 to skip that step)
EOF
}

discover_subjects() {
  local root="$1"
  if [ ! -d "$root" ]; then
    return 1
  fi
  find "$root" -maxdepth 1 -type d -name "sub-*" -printf "%f\n" 2>/dev/null \
    | sed 's/^sub-//' | sort -u
}

if [ -z "${MAX_JOBS}" ]; then
  if command -v nproc >/dev/null 2>&1; then
    MAX_JOBS=$(nproc)
  else
    MAX_JOBS=$(getconf _NPROCESSORS_ONLN 2>/dev/null || echo 4)
  fi
fi
if [ -z "${LOAD_LIMIT}" ]; then
  LOAD_LIMIT="$MAX_JOBS"
fi

SUBJECTS=()
mapfile -t SUBJECTS < <(discover_subjects "$SUBJ_ROOT" || true)

if [ "${#SUBJECTS[@]}" -eq 0 ]; then
  echo "[RSA-learn] No subjects found in $SUBJ_ROOT"
  echo "[RSA-learn] Falling back to BIDS: $BIDS_DIR"
  mapfile -t SUBJECTS < <(discover_subjects "$BIDS_DIR" || true)
fi

if [ "${#SUBJECTS[@]}" -eq 0 ]; then
  echo "[RSA-learn] ERROR: No subjects discovered."
  usage
  exit 1
fi

echo "[RSA-learn] Found ${#SUBJECTS[@]} subjects."
echo "[RSA-learn] MAX_JOBS=$MAX_JOBS  LOAD_LIMIT=$LOAD_LIMIT"

is_running() {
  local subj="$1"
  pgrep -f "proc\.${subj}\.LEARN_RSA_runwise_AFNI" >/dev/null 2>&1
}

proc_gen() {
  local subj="$1"
  if is_running "$subj"; then
    echo "[RSA-learn] SKIP (running): $subj"
    return 0
  fi
  if [ ! -f "$AP_ORIG" ]; then
    echo "[RSA-learn] ERROR: Missing $AP_ORIG"
    return 1
  fi
  AP_TMP="$TMP_DIR/LEARN_ap_Full_RSA_runwise_AFNI_${subj}.sh"
  cp "$AP_ORIG" "$AP_TMP"
  sed -i "s|^set subjects = .*|set subjects = ( ${subj} )|" "$AP_TMP"

  mapfile -t RUNS < <(find "$BIDS_DIR/sub-${subj}/func" -maxdepth 1 -type f \
    -name "sub-${subj}_task-learn_run-*_bold.nii.gz" 2>/dev/null \
    | sed -E 's/.*run-0*([0-9]+).*/\1/' | sort -n)
  local run_count="${#RUNS[@]}"

  if [ "$run_count" -lt 2 ]; then
    echo "[RSA-learn] SKIP (runs <2): $subj"
    return 0
  fi

  if [ "$run_count" -lt 4 ]; then
    echo "[RSA-learn] FALLBACK (runs=${RUNS[*]}): $subj"
    python3 "$AP_FALLBACK" "$AP_TMP" "$subj" ${RUNS[*]}
  fi
  echo "[RSA-learn] PROC GEN: $subj"
  tcsh "$AP_TMP" |& tee "$LOG_DIR/ap.${subj}.log"
}

clean_out() {
  local subj="$1"
  if is_running "$subj"; then
    echo "[RSA-learn] SKIP CLEAN (running): $subj"
    return 0
  fi
  OUT_BASE="$RESULTS_DIR/$subj"
  OUT_DIR="$OUT_BASE/${subj}.results.LEARN_RSA_runwise_AFNI"
  ALT_OUT_DIR="$SCRIPT_DIR/${subj}.results.LEARN_RSA_runwise_AFNI"
  if [ -d "$OUT_DIR" ]; then
    echo "[RSA-learn] CLEAN: $OUT_DIR"
    rm -rf "$OUT_DIR"
  fi
  if [ -d "$ALT_OUT_DIR" ]; then
    echo "[RSA-learn] CLEAN stray: $ALT_OUT_DIR"
    rm -rf "$ALT_OUT_DIR"
  fi
}

run_glm() {
  local subj="$1"
  if is_running "$subj"; then
    echo "[RSA-learn] SKIP RUN (running): $subj"
    return 0
  fi
  PROC="$RESULTS_DIR/$subj/proc.${subj}.LEARN_RSA_runwise_AFNI"
  if [ ! -f "$PROC" ]; then
    echo "[RSA-learn] MISSING PROC: $PROC"
    return 0
  fi
  mkdir -p "$RESULTS_DIR/$subj"
  echo "[RSA-learn] RUN: $subj"
  ( cd "$RESULTS_DIR/$subj" && tcsh -xef "proc.${subj}.LEARN_RSA_runwise_AFNI" |& tee "output.proc.${subj}.LEARN_RSA_runwise_AFNI" )
}

run_parallel() {
  local fn="$1"; shift
  local subj
  if [ "$MAX_JOBS" -gt 1 ]; then
    set -m
  fi
  wait_for_load() {
    local limit="$1"
    while true; do
      local load
      load=$(awk '{print $1}' /proc/loadavg 2>/dev/null || echo 0)
      awk -v l="$load" -v t="$limit" 'BEGIN{exit !(l < t)}' && break
      sleep 5
    done
  }
  for subj in "$@"; do
    while [ "$(jobs -pr | wc -l | tr -d ' ')" -ge "$MAX_JOBS" ]; do
      sleep 5
    done
    wait_for_load "$LOAD_LIMIT"
    "$fn" "$subj" &
  done
  wait
}

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

**Step 6 – Audit (post-run checks)**
Purpose: confirm that all subjects produced stats outputs and catch failures quickly.

Commands used:
```bash
# how many finished
grep -R "execution finished" /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/*/output.proc.*LEARN_RSA_runwise_AFNI | wc -l

# list missing stats
RESULTS=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses
TIMING=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2
for d in $TIMING/sub-*; do
  id=${d##*sub-}
  stats="$RESULTS/$id/${id}.results.LEARN_RSA_runwise_AFNI/stats.${id}+tlrc.HEAD"
  [ ! -f "$stats" ] && echo "$id"
done | sort -n

# scan errors
egrep -R "ERROR|FATAL|FAILED|ABORT" \
  /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/*/output.proc.*LEARN_RSA_runwise_AFNI | head -n 50
```

<details>
<summary><strong>Example beta map snapshots (sub‑1290)</strong> — click to expand</summary>

Four peer×feedback betas (one per run), rendered with `@chauffeur_afni` and saved as PNGs:

| Condition | Axial | Coronal | Sagittal |
| --- | --- | --- | --- |
| `FBM.Mean60.r1` | ![](assets/brain_snapshots/1290_FBM.Mean60.r1.axi.png) | ![](assets/brain_snapshots/1290_FBM.Mean60.r1.cor.png) | ![](assets/brain_snapshots/1290_FBM.Mean60.r1.sag.png) |
| `FBN.Mean80.r2` | ![](assets/brain_snapshots/1290_FBN.Mean80.r2.axi.png) | ![](assets/brain_snapshots/1290_FBN.Mean80.r2.cor.png) | ![](assets/brain_snapshots/1290_FBN.Mean80.r2.sag.png) |
| `FBM.Nice60.r3` | ![](assets/brain_snapshots/1290_FBM.Nice60.r3.axi.png) | ![](assets/brain_snapshots/1290_FBM.Nice60.r3.cor.png) | ![](assets/brain_snapshots/1290_FBM.Nice60.r3.sag.png) |
| `FBN.Nice80.r4` | ![](assets/brain_snapshots/1290_FBN.Nice80.r4.axi.png) | ![](assets/brain_snapshots/1290_FBN.Nice80.r4.cor.png) | ![](assets/brain_snapshots/1290_FBN.Nice80.r4.sag.png) |

</details>

**Setback B – sub-1522 GLM collinearity**
Problem: 3dDeconvolve reported collinearity between `FBN.Mean80.r1` and `FBN.Mean80.r3` and stopped because `-GOFORIT` was not set. For sub‑1522, Mean80_fdkn onsets in run‑1 vs run‑3 were nearly identical (217.826 vs 217.827 s), making the run‑wise regressors almost the same after convolution.
Preprocessing had already completed (pb04.*.scale files exist), so the fix is **GLM‑only**, not a full re‑preprocess.

Audit commands used:
```bash
id=1522
LOG=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/$id/output.proc.${id}.LEARN_RSA_runwise_AFNI
egrep -n "WARNING|ERROR|FATAL" "$LOG" | tail -n 30
sed -n '1,40p' /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/1522/1522.results.LEARN_RSA_runwise_AFNI/3dDeconvolve.err

# confirm onsets in events
awk -F"	" '$3=="Mean80_fdkn"{print $1}' /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed2/sub-1522/func/sub-1522_task-learn_run-01_events.tsv
awk -F"	" '$3=="Mean80_fdkn"{print $1}' /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed2/sub-1522/func/sub-1522_task-learn_run-03_events.tsv
```

Fix + rerun (GLM‑only, in tmux):
```bash
tmux kill-session -t rsa_1522_glm 2>/dev/null
tmux new -s rsa_1522_glm "
set -e
id=1522
BASE=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/\$id
OUT=\$BASE/\${id}.results.LEARN_RSA_runwise_AFNI
PROC=\$BASE/proc.\${id}.LEARN_RSA_runwise_AFNI

# Ensure GOFORIT is in the 3dDeconvolve block (GLM only)
python3 - <<'PY'
from pathlib import Path
path = Path('$PROC')
lines = path.read_text().splitlines()
if any('GOFORIT' in l for l in lines):
    raise SystemExit(0)
out = []
inserted = False
for l in lines:
    out.append(l)
    if (not inserted) and '-polort 3 -float' in l:
        out.append('    -GOFORIT 1                                                     \\\\')
        inserted = True
if not inserted:
    raise SystemExit('GOFORIT insertion point not found')
path.write_text('\\n'.join(out) + '\\n')
PY

# Clean GLM outputs only (keep preprocessing)
rm -f \$OUT/stats.\${id}+tlrc.* \$OUT/stats.\${id}_REML* \$OUT/cbucket* \$OUT/fitts* \$OUT/errts* \$OUT/X.* \$OUT/3dDeconvolve.err \
      run_3dDeconvolve.body.tcsh run_3dDeconvolve.tcsh

cd \$OUT
awk 'BEGIN{p=0} /^3dDeconvolve /{p=1} p{if (\$0 ~ /^if \\( \\$status \\)/) {exit} else print}' \"\$PROC\" > run_3dDeconvolve.body.tcsh
{ echo \"set subj = 1522\"; cat run_3dDeconvolve.body.tcsh; } > run_3dDeconvolve.tcsh
tcsh -xef run_3dDeconvolve.tcsh |& tee 3dDeconvolve.rerun.log
tcsh -xef stats.REML_cmd |& tee 3dREMLfit.rerun.log
"
```
