#!/usr/bin/env python3
"""
Fix BIDS events.tsv files by re-labeling `nopred_fdbk` rows to the
correct feedback condition using BehavData run files as source-of-truth.

Logic:
- Find every `nopred_fdbk` event in BIDS events.tsv.
- Look up the same run in BehavData (files like Mean80_fdkn_run3.txt).
- If BehavData is time-coded (floats w/ decimals), match by onset.
- If BehavData is trial-coded (mostly integers), match by trial number.
- Replace `nopred_fdbk` with the correct feedback label.

Output:
- Writes corrected events.tsv to --out-dir (mirrors BIDS folder layout).
- Generates a TSV report of replacements and any unresolved rows.
"""

from __future__ import annotations

import argparse
import csv
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple


def label_to_events_label(label: str) -> str:
    # BehavData uses Mean60/Nice60 while BIDS events use Mean_60/Nice_60.
    if label.startswith("Mean60"):
        return label.replace("Mean60", "Mean_60", 1)
    if label.startswith("Nice60"):
        return label.replace("Nice60", "Nice_60", 1)
    return label


def parse_feedback_files(behav_sub_dir: Path, run: int) -> Tuple[Dict[float, set], Dict[int, set], bool]:
    """
    Returns:
      by_onset: rounded onset (3 dp) -> set(labels)
      by_trial: trial (int) -> set(labels)
      trial_scale: True if BehavData looks trial-coded for this run
    """
    by_onset: Dict[float, set] = defaultdict(set)
    by_trial: Dict[int, set] = defaultdict(set)
    values: List[float] = []

    for fp in behav_sub_dir.glob(f"*_run{run}.txt"):
        name = fp.name
        if "fdkm" not in name and "fdkn" not in name:
            continue
        label = name.replace(f"_run{run}.txt", "")
        for line in fp.read_text().splitlines():
            if not line.strip():
                continue
            try:
                val = float(line.split()[0])
            except ValueError:
                continue
            values.append(val)
            by_onset[round(val, 3)].add(label)
            by_trial[int(round(val))].add(label)

    # Heuristic: trial-coded files are mostly integer values and low max.
    trial_scale = False
    if values:
        frac_close = sum(1 for v in values if abs(v - round(v)) < 1e-3)
        frac_ratio = frac_close / len(values)
        max_val = max(values)
        if frac_ratio > 0.9 and max_val < 200:
            trial_scale = True

    return by_onset, by_trial, trial_scale


def find_events_files(bids_dir: Path) -> Iterable[Path]:
    return bids_dir.glob("sub-*/func/sub-*_task-learn_run-*_events.tsv")


def extract_sub_run(path: Path) -> Tuple[str, int]:
    # Filename pattern: sub-XXXX_task-learn_run-0Y_events.tsv
    name = path.name
    subj = name.split("_task-")[0].replace("sub-", "")
    run_str = name.split("run-")[1].split("_events.tsv")[0]
    return subj, int(run_str)


def fix_events_file(
    events_path: Path,
    behav_root: Path,
    out_path: Path,
    report_rows: List[Dict[str, str]],
    strict: bool,
) -> Tuple[int, int, int]:
    """Return (fixed, unresolved, total_nopred)."""
    subj, run = extract_sub_run(events_path)
    behav_sub = behav_root / f"sub-{subj}"
    fixed = 0
    unresolved = 0
    total = 0

    if not behav_sub.exists():
        report_rows.append(
            {
                "subj": subj,
                "run": str(run),
                "onset": "NA",
                "trial": "NA",
                "old_event": "nopred_fdbk",
                "new_event": "NA",
                "source": "missing_behav_dir",
                "status": "unresolved",
            }
        )
        return 0, 1, 0

    by_onset, by_trial, trial_scale = parse_feedback_files(behav_sub, run)

    rows: List[Dict[str, str]] = []
    with events_path.open() as f:
        reader = csv.DictReader(f, delimiter="\t")
        fieldnames = reader.fieldnames or []
        for row in reader:
            rows.append(row)

    for row in rows:
        if row.get("event") != "nopred_fdbk":
            continue
        total += 1
        onset = float(row["onset"])
        trial = int(float(row["trial"]))
        label = None
        source = None

        # Prefer onset mapping for time-coded data; trial mapping for trial-coded data.
        if not trial_scale:
            labels = by_onset.get(round(onset, 3), set())
            if len(labels) == 1:
                label = next(iter(labels))
                source = "onset"
        if label is None and trial_scale:
            labels = by_trial.get(trial, set())
            if len(labels) == 1:
                label = next(iter(labels))
                source = "trial"
        # fallback: try the other mapping if primary failed
        if label is None:
            labels = by_onset.get(round(onset, 3), set())
            if len(labels) == 1:
                label = next(iter(labels))
                source = "onset_fallback"
        if label is None:
            labels = by_trial.get(trial, set())
            if len(labels) == 1:
                label = next(iter(labels))
                source = "trial_fallback"

        if label is None:
            unresolved += 1
            report_rows.append(
                {
                    "subj": subj,
                    "run": str(run),
                    "onset": row["onset"],
                    "trial": row["trial"],
                    "old_event": "nopred_fdbk",
                    "new_event": "NA",
                    "source": "no_match",
                    "status": "unresolved",
                }
            )
            continue

        new_event = label_to_events_label(label)
        row["event"] = new_event
        fixed += 1
        report_rows.append(
            {
                "subj": subj,
                "run": str(run),
                "onset": row["onset"],
                "trial": row["trial"],
                "old_event": "nopred_fdbk",
                "new_event": new_event,
                "source": source or "match",
                "status": "fixed",
            }
        )

    # Write out corrected file
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="") as f:
        writer = csv.DictWriter(f, delimiter="\t", fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    if strict and unresolved > 0:
        print(f"[ERROR] {events_path}: {unresolved} unresolved nopred_fdbk rows", file=sys.stderr)

    return fixed, unresolved, total


def main() -> int:
    ap = argparse.ArgumentParser(description="Fix nopred_fdbk labels in BIDS events using BehavData")
    ap.add_argument("--bids-dir", required=True, type=Path, help="BIDS root (contains sub-*/func/*events.tsv)")
    ap.add_argument("--behav-dir", required=True, type=Path, help="BehavData root (contains sub-*/ *run*.txt)")
    ap.add_argument("--out-dir", required=True, type=Path, help="Output root for corrected BIDS events")
    ap.add_argument("--report", required=True, type=Path, help="Path to write TSV report")
    ap.add_argument("--strict", action="store_true", help="Exit non-zero if any nopred_fdbk rows unresolved")
    args = ap.parse_args()

    report_rows: List[Dict[str, str]] = []
    total_fixed = 0
    total_unresolved = 0
    total_nopred = 0

    for events_path in sorted(find_events_files(args.bids_dir)):
        rel = events_path.relative_to(args.bids_dir)
        out_path = args.out_dir / rel
        fixed, unresolved, total = fix_events_file(
            events_path, args.behav_dir, out_path, report_rows, args.strict
        )
        total_fixed += fixed
        total_unresolved += unresolved
        total_nopred += total

    args.report.parent.mkdir(parents=True, exist_ok=True)
    with args.report.open("w", newline="") as f:
        fieldnames = ["subj", "run", "onset", "trial", "old_event", "new_event", "source", "status"]
        writer = csv.DictWriter(f, delimiter="\t", fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(report_rows)

    print(f"[nopred_fdbk] total={total_nopred} fixed={total_fixed} unresolved={total_unresolved}")

    if args.strict and total_unresolved > 0:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
