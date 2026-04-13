#!/usr/bin/env python3
"""
Enrich BIDS events.tsv with behavioral data and fix nopred_fdbk labels.

Reads raw BIDS events.tsv + learn_behavioral.csv, then:
  1. Fixes nopred_fdbk → correct feedback label (majority-vote across subjects)
  2. Enriches prediction events with subject's choice:
       Mean_60_pred → Mean_60_pred_nice  or  Mean_60_pred_mean
  3. Writes enriched events to events_enriched/sub-XXXX/func/

Usage:
  python3 enrich_events.py \
    --bids-dir /data/projects/STUDIES/LEARN/fMRI/bids \
    --behavioral /data/projects/STUDIES/LEARN/fMRI/RSA-learn/analysis/learn_behavioral.csv \
    --out-dir /data/projects/STUDIES/LEARN/fMRI/RSA-learn/events_enriched \
    --report /data/projects/STUDIES/LEARN/fMRI/RSA-learn/events_enriched/enrichment_report.tsv
"""

from __future__ import annotations

import argparse
import csv
from collections import Counter, defaultdict
from pathlib import Path

# ── Feedback event labels (used by nopred_fdbk fixer) ────────────────────────
FEEDBACK = {
    "Mean_60_fdkm", "Mean_60_fdkn",
    "Mean80_fdkm",  "Mean80_fdkn",
    "Nice_60_fdkm", "Nice_60_fdkn",
    "Nice80_fdkm",  "Nice80_fdkn",
}

# ── Prediction event labels (enriched with _nice / _mean) ────────────────────
PREDICTION = {
    "Mean_60_pred", "Mean80_pred",
    "Nice_60_pred", "Nice80_pred",
}


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def find_events(bids_dir: Path):
    """Find all learn task events.tsv files."""
    return sorted(bids_dir.glob("sub-*/func/sub-*_task-learn_run-*_events.tsv"))


def sub_run_from_name(path: Path):
    """Extract (subject_id, run_int) from an events.tsv filename."""
    name = path.name
    subj = name.split("_task-")[0].replace("sub-", "")
    run = int(name.split("run-")[1].split("_events.tsv")[0])
    return subj, run


def normalize_behavioral_id(raw_id: str) -> str:
    """Convert behavioral CSV ID (sub-958) to BIDS ID (LEARN958)."""
    num = raw_id.replace("sub-", "")
    return f"LEARN{num}"


# ─────────────────────────────────────────────────────────────────────────────
# Step 1: Build majority-vote template for nopred_fdbk fix
# (Reuses logic from 1_fix_events.py)
# ─────────────────────────────────────────────────────────────────────────────

def build_nopred_template(bids_dir: Path) -> dict[int, dict[int, str]]:
    """Build per-run, per-trial majority-vote template from all subjects."""
    counts: dict[int, dict[int, Counter]] = defaultdict(lambda: defaultdict(Counter))

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

    template: dict[int, dict[int, str]] = defaultdict(dict)
    for run, trial_map in counts.items():
        for trial, counter in trial_map.items():
            if not counter:
                continue
            most_common = counter.most_common()
            if len(most_common) > 1 and most_common[0][1] == most_common[1][1]:
                continue  # tie — skip
            template[run][trial] = most_common[0][0]
    return template


# ─────────────────────────────────────────────────────────────────────────────
# Step 2: Load behavioral data for prediction enrichment
# ─────────────────────────────────────────────────────────────────────────────

def load_behavioral(csv_path: Path) -> dict[tuple[str, int, int], dict]:
    """
    Load learn_behavioral.csv into a lookup keyed by (bids_subj_id, run, trial).
    Returns dict mapping to the full row dict.
    """
    lookup: dict[tuple[str, int, int], dict] = {}
    with csv_path.open() as f:
        reader = csv.DictReader(f)
        for row in reader:
            subj = normalize_behavioral_id(row["s"])
            run = int(row["r"])
            trial = int(row["trial"])
            lookup[(subj, run, trial)] = row
    return lookup


# ─────────────────────────────────────────────────────────────────────────────
# Main enrichment
# ─────────────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description="Enrich BIDS events with behavioral data")
    ap.add_argument("--bids-dir", required=True, type=Path,
                    help="Raw BIDS directory (contains sub-*/func/*_events.tsv)")
    ap.add_argument("--behavioral", required=True, type=Path,
                    help="Path to learn_behavioral.csv")
    ap.add_argument("--out-dir", required=True, type=Path,
                    help="Output directory for enriched events")
    ap.add_argument("--report", required=True, type=Path,
                    help="Path for enrichment audit report TSV")
    args = ap.parse_args()

    # Build nopred fix template
    print("[enrich] Building nopred_fdbk majority-vote template...")
    nopred_template = build_nopred_template(args.bids_dir)

    # Load behavioral data
    print("[enrich] Loading behavioral data...")
    behavioral = load_behavioral(args.behavioral)

    # Counters for report
    report_rows = []
    stats = {
        "nopred_fixed": 0,
        "nopred_unresolved": 0,
        "pred_enriched": 0,
        "pred_no_behavioral": 0,
        "pred_missed": 0,  # Prediction=NA in behavioral
        "files_written": 0,
        "rows_total": 0,
    }

    for ev in find_events(args.bids_dir):
        subj, run = sub_run_from_name(ev)
        rel = ev.relative_to(args.bids_dir)
        out_path = args.out_dir / rel
        out_path.parent.mkdir(parents=True, exist_ok=True)

        with ev.open() as f:
            header = f.readline().strip().split("\t")
            if "event" not in header:
                # Copy file unchanged if no event column
                with ev.open() as src, out_path.open("w") as dst:
                    dst.write(src.read())
                continue
            i_event = header.index("event")
            i_trial = header.index("trial")
            rows = [r.rstrip("\n").split("\t") for r in f if r.strip()]

        for row in rows:
            stats["rows_total"] += 1
            event = row[i_event]
            trial = int(float(row[i_trial]))

            # Fix nopred_fdbk
            if event == "nopred_fdbk":
                new_event = nopred_template.get(run, {}).get(trial)
                if new_event:
                    row[i_event] = new_event
                    stats["nopred_fixed"] += 1
                    report_rows.append([subj, run, trial, "nopred_fdbk", new_event, "nopred_fixed"])
                else:
                    stats["nopred_unresolved"] += 1
                    report_rows.append([subj, run, trial, "nopred_fdbk", "NA", "nopred_unresolved"])

            # Enrich prediction events with choice
            elif event in PREDICTION:
                beh = behavioral.get((subj, run, trial))
                if beh is None:
                    stats["pred_no_behavioral"] += 1
                    report_rows.append([subj, run, trial, event, event, "no_behavioral_match"])
                elif beh["Prediction"] == "NA" or beh["Prediction"] == "":
                    stats["pred_missed"] += 1
                    report_rows.append([subj, run, trial, event, event, "prediction_NA"])
                else:
                    choice = "nice" if beh["Prediction"] == "1" else "mean"
                    new_event = f"{event}_{choice}"
                    row[i_event] = new_event
                    stats["pred_enriched"] += 1
                    report_rows.append([subj, run, trial, event, new_event, "pred_enriched"])

        # Write enriched events
        with out_path.open("w", newline="") as f:
            writer = csv.writer(f, delimiter="\t")
            writer.writerow(header)
            writer.writerows(rows)
        stats["files_written"] += 1

    # Write audit report
    args.report.parent.mkdir(parents=True, exist_ok=True)
    with args.report.open("w", newline="") as f:
        writer = csv.writer(f, delimiter="\t")
        writer.writerow(["subj", "run", "trial", "old_event", "new_event", "action"])
        writer.writerows(report_rows)

    # Summary
    print(f"[enrich] Done.")
    print(f"  Files written:       {stats['files_written']}")
    print(f"  Total event rows:    {stats['rows_total']}")
    print(f"  nopred_fdbk fixed:   {stats['nopred_fixed']}")
    print(f"  nopred_fdbk unresolved: {stats['nopred_unresolved']}")
    print(f"  Predictions enriched:   {stats['pred_enriched']}")
    print(f"  Predictions w/o behavioral: {stats['pred_no_behavioral']}")
    print(f"  Predictions NA (missed):    {stats['pred_missed']}")
    print(f"  Report: {args.report}")


if __name__ == "__main__":
    main()
