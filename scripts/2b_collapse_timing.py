#!/usr/bin/env python3
"""Collapse Fixed2 run-wise timing files for the new (collapsed) GLM design.

Reads:  TimingFiles/Fixed2/sub-<sid>/*.1D       (existing per-peer, per-run files)
Writes: TimingFiles/Fixed2_collapsed/sub-<sid>/*.1D  (19 files per subject)

Output files per subject:
  16x  FB_<peer>_r<run>.1D     merge of NonPM_<peer>_fdkm_run<run>.1D + NonPM_<peer>_fdkn_run<run>.1D
                               (valence collapsed; events only in that run's row)
   1x  Prediction_all.1D       all 4 peers x 4 runs of <peer>_pred_run<run>.1D collapsed
   1x  Response_all.1D         all 4 peers x 4 runs of <peer>_rsp_run<run>.1D collapsed
   1x  Anticipation_pred_fdk.1D  copied as-is from input dir
"""
import argparse, os, shutil
from pathlib import Path

PEERS = ['Mean60', 'Mean80', 'Nice60', 'Nice80']
RUNS = [1, 2, 3, 4]


def parse_row(line):
    s = line.strip()
    if s in ('', '*'):
        return []
    events = []
    for tok in s.split():
        if ':' in tok:
            onset, dur = tok.split(':', 1)
        else:
            onset, dur = tok, None
        events.append((float(onset), dur))
    return events


def read_rows(path, n_runs=4):
    rows = [[] for _ in range(n_runs)]
    if not os.path.isfile(path):
        return rows
    with open(path) as f:
        lines = f.read().splitlines()
    for i in range(min(n_runs, len(lines))):
        rows[i] = parse_row(lines[i])
    return rows


def write_rows(path, rows):
    out_lines = []
    for events in rows:
        if not events:
            out_lines.append('*')
        else:
            events_sorted = sorted(events, key=lambda e: e[0])
            toks = []
            for onset, dur in events_sorted:
                if dur is None:
                    toks.append(str(onset))
                else:
                    toks.append(f'{onset}:{dur}')
            out_lines.append(' '.join(toks))
    with open(path, 'w') as f:
        f.write('\n'.join(out_lines) + '\n')


def merge_rows(*row_lists):
    n_runs = max((len(r) for r in row_lists), default=4)
    out = [[] for _ in range(n_runs)]
    for rl in row_lists:
        for i, evs in enumerate(rl):
            out[i].extend(evs)
    return out


def collapse_subject(in_dir: Path, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    n_written = 0

    for peer in PEERS:
        for run in RUNS:
            fdkm = read_rows(in_dir / f'NonPM_{peer}_fdkm_run{run}.1D')
            fdkn = read_rows(in_dir / f'NonPM_{peer}_fdkn_run{run}.1D')
            write_rows(out_dir / f'FB_{peer}_r{run}.1D', merge_rows(fdkm, fdkn))
            n_written += 1

    pred_rows = [read_rows(in_dir / f'{p}_pred_run{r}.1D') for p in PEERS for r in RUNS]
    write_rows(out_dir / 'Prediction_all.1D', merge_rows(*pred_rows))
    n_written += 1

    rsp_rows = [read_rows(in_dir / f'{p}_rsp_run{r}.1D') for p in PEERS for r in RUNS]
    write_rows(out_dir / 'Response_all.1D', merge_rows(*rsp_rows))
    n_written += 1

    src = in_dir / 'Anticipation_pred_fdk.1D'
    if src.exists():
        shutil.copy2(src, out_dir / 'Anticipation_pred_fdk.1D')
        n_written += 1
    else:
        raise FileNotFoundError(f'missing Anticipation_pred_fdk.1D in {in_dir}')

    return n_written


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--in-root', default='/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2')
    ap.add_argument('--out-root', default='/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2_collapsed')
    ap.add_argument('--subject-list', default='/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt')
    ap.add_argument('--subjects', nargs='*', help='override list (IDs without sub-)')
    args = ap.parse_args()

    if args.subjects:
        subjects = args.subjects
    else:
        with open(args.subject_list) as f:
            subjects = [ln.strip().replace('sub-', '') for ln in f if ln.strip()]

    in_root = Path(args.in_root)
    out_root = Path(args.out_root)
    out_root.mkdir(parents=True, exist_ok=True)

    n_done = 0
    for sid in subjects:
        in_dir = in_root / f'sub-{sid}'
        if not in_dir.is_dir():
            print(f'[skip] sub-{sid}: no timing dir')
            continue
        out_dir = out_root / f'sub-{sid}'
        nw = collapse_subject(in_dir, out_dir)
        print(f'[done] sub-{sid}: {nw} files -> {out_dir}')
        n_done += 1

    print(f'\n{n_done} subjects processed.')


if __name__ == '__main__':
    main()
