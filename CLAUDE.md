# LEARN RSA Project

This is a Year 1 PhD project analyzing fMRI data from the LEARN social learning task using Representational Similarity Analysis (RSA). The pipeline produces run-wise beta maps via AFNI GLM for 38 subjects, with no spatial smoothing and explicit anticipation modeling.

## Pipeline

The production pipeline lives in `pipeline/` (local) and `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/` (server). The local repo is the source of truth for scripts and docs; the server holds data outputs.

### Scripts (in `pipeline/scripts/`)

| Script | What it does |
|---|---|
| `fix_nopred_fdbk.py` | Stage 1: relabels missed-prediction feedback events to canonical labels |
| `generate_timing.sh` | Stage 2: builds run-wise .1D timing files with anticipation regressors |
| `afni_proc_template.sh` | Stage 3a: AFNI proc generator template (raw BIDS, no blur) |
| `fallback_patch.py` | Stage 3b: adjusts proc for subjects with fewer than 4 runs |
| `run_glm.sh` | Stage 3c: orchestrates proc generation + GLM over all subjects |
| `sync_to_server.sh` | Pushes repo scripts/docs to server |
| `audit_server.sh` | Checks server structure for drift |

### Key Server Paths

- Raw BIDS: `/data/projects/STUDIES/LEARN/fMRI/bids`
- Fixed events: `RSA-learn/bids_fixed`
- Timing files: `RSA-learn/TimingFiles/Fixed2`
- GLM outputs: `RSA-learn/derivatives/afni/IndvlLvlAnalyses`
- Subject list: `/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt`
- SSW anatomy: `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/ssw/sub-<id>/`
- Confounds: `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/confounds/sub-<id>/`

### Running the Pipeline

Stage 1 — fix event labels:
```bash
python3 /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/fix_nopred_fdbk.py \
  --bids-dir /data/projects/STUDIES/LEARN/fMRI/bids \
  --out-dir /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed \
  --report /data/projects/STUDIES/LEARN/fMRI/RSA-learn/reports/nopred_fdbk_fix_template.tsv \
  --mode majority
```

Stage 2 — generate timing files:
```bash
SUBJ_LIST_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt \
BIDS_DIR_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed \
TIMING_ROOT_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/generate_timing.sh
```

Stage 3 — run GLM:
```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/run_glm.sh
```

## Rules for Making Changes

1. One production pipeline only. No `v2`, `final2`, or parallel variants.
2. If you change a script, update `pipeline/docs/decisions.md` and `pipeline/docs/run-status.md` in the same change.
3. Never leave experimental scripts in `pipeline/scripts/`. Non-canonical material goes to `sandbox/` on the server.
4. After changing scripts or docs locally, run `sync_to_server.sh` to push to the server.
5. The safe execution order is: fix events -> generate timing -> generate proc -> run GLM -> audit.

## Server Sync

The repo copy of scripts/docs is authoritative. The server has a runtime copy.

1. Edit scripts/docs in `pipeline/`.
2. Run `bash pipeline/scripts/sync_to_server.sh`.
3. Run `bash pipeline/scripts/audit_server.sh` to verify.

## Repository Layout

- `pipeline/` — production scripts and operational docs
- `literature/` — papers, presentations, background emails, reference code
- `guides/` — PI walkthrough site and undergrad tutorial
- `analysis/` — subject table with clinical measures
- `proposals/` — project proposal, RSA coding notes, meeting notes
- `archive/` — dead ends, legacy docs (do not use for new work)
- `fmri-data/` — symlink to server data share
