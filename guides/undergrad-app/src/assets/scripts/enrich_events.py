#!/usr/bin/env python3
"""
Enrich BIDS events.tsv with behavioral data.

For each (run, trial) we first establish the PEER (Mean_60 / Mean80 /
Nice_60 / Nice80) by majority-vote across subjects on the feedback event.
Then we rewrite every trial-level event using that peer and the subject's
behavioral data:

  Feedback events:
    nopred_fdbk        → the real feedback label from majority-vote
                          (Mean_60_fdkm / Mean_60_fdkn / … / Nice80_fdkn)
    Peer_fdkm/n        → unchanged (already correct)

  Prediction events:
    Peer_pred  &  Prediction=1  in behavioral → Peer_pred_nice
    Peer_pred  &  Prediction=0  in behavioral → Peer_pred_mean
    Peer_pred  &  Prediction=NA or no-behavioral → Peer_no_pred   (nuisance)
    no_pred (BIDS-labeled missed)              → Peer_no_pred

  Response events:
    Peer_rsp         → unchanged
    no_resp          → Peer_rsp   (folded into the peer's response regressor)

  Task-structure events (class, isi, iti, class_menu, iti_resp) → unchanged.

Usage:
  python3 enrich_events.py \
    --bids-dir /data/.../bids \
    --behavioral /data/.../analysis/learn_behavioral.csv \
    --out-dir /data/.../events_enriched \
    --report /data/.../events_enriched/enrichment_report.tsv
"""

from __future__ import annotations

import argparse
import csv
from collections import Counter, defaultdict
from pathlib import Path

# ── Event label sets ─────────────────────────────────────────────────────────
FEEDBACK_LABELS = {
    "Mean_60_fdkm", "Mean_60_fdkn",
    "Mean80_fdkm",  "Mean80_fdkn",
    "Nice_60_fdkm", "Nice_60_fdkn",
    "Nice80_fdkm",  "Nice80_fdkn",
}

PEER_PRED_LABELS = {
    "Mean_60_pred", "Mean80_pred",
    "Nice_60_pred", "Nice80_pred",
}

PEER_RSP_LABELS = {
    "Mean_60_rsp", "Mean80_rsp",
    "Nice_60_rsp", "Nice80_rsp",
}

# Map a feedback event to its peer prefix (used for no_pred / no_resp labels).
def peer_of_feedback(event: str) -> str | None:
    for peer in ("Mean_60", "Mean80", "Nice_60", "Nice80"):
        if event.startswith(peer + "_fdk"):
            return peer
    return None


# ─────────────────────────────────────────────────────────────────────────────
# File discovery
# ─────────────────────────────────────────────────────────────────────────────

def find_events(bids_dir: Path):
    return sorted(bids_dir.glob("sub-*/func/sub-*_task-learn_run-*_events.tsv"))


def sub_run_from_name(path: Path):
    name = path.name
    subj = name.split("_task-")[0].replace("sub-", "")
    run = int(name.split("run-")[1].split("_events.tsv")[0])
    return subj, run


# ─────────────────────────────────────────────────────────────────────────────
# Peer template — majority vote on feedback events across subjects
# ─────────────────────────────────────────────────────────────────────────────

def build_peer_template(bids_dir: Path):
    """
    For each (run, trial), return the peer prefix that most subjects received.
    e.g. peer_template[1][5] == "Mean_60"  (Mean_60 peer, run 1, trial 5).
    Also returns the majority-vote full feedback label so we can fix nopred_fdbk.
    """
    counts: dict[int, dict[int, Counter]] = defaultdict(lambda: defaultdict(Counter))

    for ev in find_events(bids_dir):
        _, run = sub_run_from_name(ev)
        with ev.open() as f:
            header = f.readline().rstrip("\r\n").split("\t")
            if "event" not in header:
                continue
            i_event = header.index("event")
            i_trial = header.index("trial")
            for line in f:
                if not line.strip():
                    continue
                cols = line.rstrip("\r\n").split("\t")
                event = cols[i_event].strip()
                if event not in FEEDBACK_LABELS:
                    continue
                try:
                    trial = int(float(cols[i_trial]))
                except ValueError:
                    continue
                counts[run][trial][event] += 1

    fdbk_template: dict[int, dict[int, str]] = defaultdict(dict)
    peer_template: dict[int, dict[int, str]] = defaultdict(dict)
    for run, trial_map in counts.items():
        for trial, counter in trial_map.items():
            if not counter:
                continue
            top = counter.most_common()
            if len(top) > 1 and top[0][1] == top[1][1]:
                continue  # tie — leave unresolved
            fdbk_label = top[0][0]
            fdbk_template[run][trial] = fdbk_label
            peer_template[run][trial] = peer_of_feedback(fdbk_label)
    return fdbk_template, peer_template


# ─────────────────────────────────────────────────────────────────────────────
# Behavioral lookup
# ─────────────────────────────────────────────────────────────────────────────

def load_behavioral(csv_path: Path):
    """(bids_subj, run, trial) → {Prediction, Response, ...} with values stripped."""
    lookup = {}
    with csv_path.open(newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            row = {k.strip(): (v.strip() if v else v) for k, v in row.items() if k}
            subj = row["s"].replace("sub-", "")
            try:
                run = int(row["r"])
                trial = int(row["trial"])
            except (ValueError, KeyError):
                continue
            lookup[(subj, run, trial)] = row
    return lookup


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--bids-dir", required=True, type=Path)
    ap.add_argument("--behavioral", required=True, type=Path)
    ap.add_argument("--out-dir", required=True, type=Path)
    ap.add_argument("--report", required=True, type=Path)
    args = ap.parse_args()

    print("[enrich] Building peer / feedback majority-vote templates...")
    fdbk_template, peer_template = build_peer_template(args.bids_dir)

    print("[enrich] Loading behavioral data...")
    behavioral = load_behavioral(args.behavioral)

    report_rows = []
    stats = Counter()

    for ev in find_events(args.bids_dir):
        subj, run = sub_run_from_name(ev)
        rel = ev.relative_to(args.bids_dir)
        out_path = args.out_dir / rel
        out_path.parent.mkdir(parents=True, exist_ok=True)

        with ev.open() as f:
            header = f.readline().rstrip("\r\n").split("\t")
            rows = []
            for line in f:
                if not line.strip():
                    continue
                rows.append(line.rstrip("\r\n").split("\t"))

        # ── Detect schema ──
        # Schema A: "event" + "trial" columns, behavioral Prediction via external CSV
        # Schema B: "trial_type" column, inline Reputation + Prediction cols (no trial col)
        if "event" in header and "trial" in header:
            schema = "A"
            i_event = header.index("event")
            i_trial = header.index("trial")
            i_pred_inline = None
            i_rep_inline = None
        elif "trial_type" in header:
            schema = "B"
            i_event = header.index("trial_type")
            i_trial = None
            i_pred_inline = header.index("Prediction") if "Prediction" in header else None
            i_rep_inline = header.index("Reputation") if "Reputation" in header else None
        else:
            # Unknown schema — copy unchanged
            with out_path.open("w", newline="") as f:
                w = csv.writer(f, delimiter="\t")
                w.writerow(header)
                w.writerows(rows)
            stats["files_unknown_schema"] += 1
            continue

        # Trial counter for Schema B (derived from per-run row order — each
        # condition event increments it; really just used to key reporting).
        schema_b_trial = 0

        for row in rows:
            stats["rows_total"] += 1
            event = row[i_event].strip()

            # Resolve trial number
            if schema == "A":
                try:
                    trial = int(float(row[i_trial]))
                except (ValueError, IndexError):
                    continue
                peer = peer_template.get(run, {}).get(trial)
            else:  # Schema B
                # Schema B has no trial column. Derive peer from inline Reputation.
                # Trial number is just for the report.
                if event in PEER_PRED_LABELS or event in FEEDBACK_LABELS or event in PEER_RSP_LABELS:
                    schema_b_trial += 1
                trial = schema_b_trial
                peer = None
                if i_rep_inline is not None:
                    rep = row[i_rep_inline].strip() if i_rep_inline < len(row) else ""
                    # Reputation values: "Mean60"/"Mean80"/"Nice60"/"Nice80"
                    peer_map = {"Mean60": "Mean_60", "Mean80": "Mean80",
                                "Nice60": "Nice_60", "Nice80": "Nice80"}
                    peer = peer_map.get(rep)
                if peer is None:
                    # Fallback: peer from event label itself (works for condition events)
                    for p in ("Mean_60", "Mean80", "Nice_60", "Nice80"):
                        if event.startswith(p + "_"):
                            peer = p
                            break

            # ── 1. Fix nopred_fdbk → real feedback label (Schema A only) ──
            if event == "nopred_fdbk":
                new_event = fdbk_template.get(run, {}).get(trial)
                if new_event:
                    row[i_event] = new_event
                    stats["fdbk_fixed_from_nopred"] += 1
                    report_rows.append([subj, run, trial, event, new_event, "fdbk_fixed_from_nopred"])
                else:
                    stats["fdbk_unresolved"] += 1
                    report_rows.append([subj, run, trial, event, "NA", "fdbk_unresolved"])
                continue

            # ── 2. Enrich peer prediction with subject choice ──
            if event in PEER_PRED_LABELS:
                if schema == "A":
                    beh = behavioral.get((subj, run, trial))
                    pred_raw = beh.get("Prediction") if beh else None
                    # Schema A: Prediction = "1" (nice) / "0" (mean) / "NA"
                    if pred_raw == "1":
                        choice = "nice"
                    elif pred_raw == "0":
                        choice = "mean"
                    else:
                        choice = None
                else:
                    # Schema B: inline Prediction column = "Nice" / "Mean" / "NA" / "NULL" / ""
                    pred_raw = (row[i_pred_inline].strip().strip('"')
                                if i_pred_inline is not None and i_pred_inline < len(row) else "")
                    if pred_raw == "Nice":
                        choice = "nice"
                    elif pred_raw == "Mean":
                        choice = "mean"
                    else:
                        choice = None

                if choice == "nice":
                    row[i_event] = f"{event}_nice"
                    stats["pred_enriched_nice"] += 1
                    report_rows.append([subj, run, trial, event, row[i_event], f"pred_enriched_nice_{schema}"])
                elif choice == "mean":
                    row[i_event] = f"{event}_mean"
                    stats["pred_enriched_mean"] += 1
                    report_rows.append([subj, run, trial, event, row[i_event], f"pred_enriched_mean_{schema}"])
                else:
                    # NA / missing → relabel as peer-level no_pred nuisance
                    if peer is None and event.endswith("_pred"):
                        peer = event[:-len("_pred")]
                    if peer:
                        row[i_event] = f"{peer}_no_pred"
                        stats["pred_na_to_no_pred"] += 1
                        report_rows.append([subj, run, trial, event, row[i_event], f"pred_na_to_no_pred_{schema}"])
                    else:
                        stats["pred_unresolved_peer"] += 1
                        report_rows.append([subj, run, trial, event, event, "pred_unresolved_peer"])
                continue

            # ── 3. Peer-split literal no_pred events (Schema A only) ──
            if event == "no_pred":
                if peer:
                    row[i_event] = f"{peer}_no_pred"
                    stats["no_pred_peer_split"] += 1
                    report_rows.append([subj, run, trial, event, row[i_event], "no_pred_peer_split"])
                else:
                    stats["no_pred_unresolved"] += 1
                    report_rows.append([subj, run, trial, event, event, "no_pred_unresolved"])
                continue

            # ── 4. Fold no_resp into peer-level response regressor (Schema A only) ──
            if event == "no_resp":
                if peer:
                    row[i_event] = f"{peer}_rsp"
                    stats["no_resp_folded"] += 1
                    report_rows.append([subj, run, trial, event, row[i_event], "no_resp_folded"])
                else:
                    stats["no_resp_unresolved"] += 1
                    report_rows.append([subj, run, trial, event, event, "no_resp_unresolved"])
                continue

            # Everything else (class, isi, iti, Peer_rsp, task feedback) passes through.

        with out_path.open("w", newline="") as f:
            writer = csv.writer(f, delimiter="\t")
            writer.writerow(header)
            writer.writerows(rows)
        stats["files_written"] += 1
        stats[f"files_schema_{schema}"] += 1

    args.report.parent.mkdir(parents=True, exist_ok=True)
    with args.report.open("w", newline="") as f:
        w = csv.writer(f, delimiter="\t")
        w.writerow(["subj", "run", "trial", "old_event", "new_event", "action"])
        w.writerows(report_rows)

    print("[enrich] Done.")
    print(f"  Files written:              {stats['files_written']}"
          f"  (Schema A: {stats['files_schema_A']}, Schema B: {stats['files_schema_B']})")
    print(f"  Files with unknown schema:  {stats['files_unknown_schema']}")
    print(f"  Total event rows processed: {stats['rows_total']}")
    print(f"  nopred_fdbk  → real fdbk:   {stats['fdbk_fixed_from_nopred']}")
    print(f"  nopred_fdbk  unresolved:    {stats['fdbk_unresolved']}")
    print(f"  Peer_pred    → _nice:       {stats['pred_enriched_nice']}")
    print(f"  Peer_pred    → _mean:       {stats['pred_enriched_mean']}")
    print(f"  Peer_pred    → _no_pred:    {stats['pred_na_to_no_pred']}")
    print(f"  Peer_pred    unresolved:    {stats['pred_unresolved_peer']}")
    print(f"  no_pred      → peer split:  {stats['no_pred_peer_split']}")
    print(f"  no_pred      unresolved:    {stats['no_pred_unresolved']}")
    print(f"  no_resp      → peer rsp:    {stats['no_resp_folded']}")
    print(f"  no_resp      unresolved:    {stats['no_resp_unresolved']}")
    print(f"  Report: {args.report}")


if __name__ == "__main__":
    main()
