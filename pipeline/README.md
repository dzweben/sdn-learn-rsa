# LEARN RSA Pipeline

Production AFNI run-wise GLM pipeline for the LEARN social learning fMRI study. No spatial smoothing, explicit anticipation modeling, 38 subjects complete.

## Server Paths

| What | Path |
|---|---|
| Pipeline root | `/data/projects/STUDIES/LEARN/fMRI/RSA-learn` |
| Raw BIDS | `/data/projects/STUDIES/LEARN/fMRI/bids` |
| Fixed events | `RSA-learn/bids_fixed` |
| Timing files | `RSA-learn/TimingFiles/Fixed2` |
| GLM outputs | `RSA-learn/derivatives/afni/IndvlLvlAnalyses` |
| Subject list | `/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt` |
| SSW anatomy | `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/ssw/sub-<id>/` |
| Confounds | `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/confounds/sub-<id>/` |

Mac mounted equivalent: `/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/RSA-learn`

## How to Run

**Stage 1 — Fix event labels** (relabel `nopred_fdbk` to canonical feedback labels):
```bash
python3 scripts/fix_nopred_fdbk.py \
  --bids-dir /data/projects/STUDIES/LEARN/fMRI/bids \
  --out-dir /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed \
  --report /data/projects/STUDIES/LEARN/fMRI/RSA-learn/reports/nopred_fdbk_fix_template.tsv \
  --mode majority
```

**Stage 2 — Generate timing files** (run-wise feedback + prediction/response + anticipation):
```bash
SUBJ_LIST_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt \
BIDS_DIR_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed \
TIMING_ROOT_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2 \
bash scripts/generate_timing.sh
```

**Stage 3 — Run GLM** (generates proc scripts + runs AFNI preprocessing + GLM):
```bash
bash scripts/run_glm.sh
```

## Scripts

| Script | Purpose |
|---|---|
| `fix_nopred_fdbk.py` | Relabels missed-prediction feedback events to canonical labels |
| `generate_timing.sh` | Builds run-wise .1D timing files with anticipation regressors |
| `afni_proc_template.sh` | AFNI proc generator template (raw BIDS, no blur) |
| `fallback_patch.py` | Adjusts proc for subjects with fewer than 4 runs |
| `run_glm.sh` | Orchestrates proc generation + GLM over all subjects |
| `sync_to_server.sh` | Pushes repo scripts/docs to server |
| `audit_server.sh` | Checks server structure for drift |

## Folder Layout

### Local (repo)
```
pipeline/
├── scripts/          # Source of truth for all scripts
└── docs/
    ├── masterplan.md       # Scientific/methodological plan
    ├── pi-walkthrough.md   # Step-by-step for the PI
    ├── decisions.md        # Decision log
    └── run-status.md       # Current completion status
```

### Server (runtime)
```
RSA-learn/
├── scripts/          # Synced copy from repo
├── docs/             # Synced copy from repo
├── bids_fixed/       # Stage 1 output
├── TimingFiles/Fixed2/  # Stage 2 output
├── derivatives/      # Stage 3 output
├── reports/          # Fix/audit reports
├── logs/             # Run logs
└── sandbox/          # Legacy artifacts only
```

## Audit Commands

Missing stats check:
```bash
RESULTS=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses
TIMING=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2
for d in $TIMING/sub-*; do
  id=${d##*sub-}
  stats="$RESULTS/$id/${id}.results.LEARN_RSA_runwise_AFNI/stats.${id}+tlrc.HEAD"
  [ ! -f "$stats" ] && echo "$id"
done | sort -n
```

Error scan:
```bash
egrep -R "ERROR|FATAL|FAILED|ABORT" \
/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/*/output.proc.*LEARN_RSA_runwise_AFNI
```

Full structure audit:
```bash
bash scripts/audit_server.sh
```

## Change Rules

1. One production pipeline. No parallel variants.
2. If you change a script, update `docs/decisions.md` in the same change.
3. After local changes, run `bash scripts/sync_to_server.sh` to push to server.
4. Non-canonical material goes to `sandbox/` on the server.
