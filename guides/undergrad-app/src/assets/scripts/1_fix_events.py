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
