# LEARN RSA Project

This is a Year 1 PhD project analyzing fMRI data from the LEARN social learning task using Representational Similarity Analysis (RSA). The pipeline produces run-wise beta maps via AFNI GLM (no spatial smoothing, explicit anticipation modeling) for the 33-subject analytic sample, then runs three analyses.

## Canonical pipeline (`pipeline/`)

**`pipeline/` is THE production pipeline** — one numbered, idempotent, config-driven set that goes raw BIDS → the three findings. All paths + the 33-subject list come from `pipeline/config.sh`. `GLM_LABEL=feedback_runwise_glm`.

| Step | Script | In → Out |
|---|---|---|
| — | `config.sh` | single source of truth (paths, subject list, masks, clinical) |
| 01 | `01_fix_events.py` | `bids/` → `events_fixed/` |
| 02 | `02_make_timing.sh` | `events_fixed/` → `timing/` (correct pre-enrichment timing) |
| 03 | `03_glm.sh` | raw BIDS + `timing/` → `…/<id>.results.feedback_runwise_glm/` (AFNI no-blur → pb04 → 3dDeconvolve, 41 reg) |
| 04 | `04_model_alignment_and_temporal_isc.py` | betas → `results/` — **Finding #1** (Model Alignment RSA, rACC SA×Run q=.025) + **#2** (Temporal ISC, rACC ρ=−.53) |
| 05 | `05_wholebrain_isc.py` | pb04 → `results/` — **Finding #3** (Schaefer-400 ISC, RH_Cont_Cing q=.017) |

Run: `bash pipeline/run_all.sh` (or `--analysis` to skip 01–03). Details: `pipeline/README.md`.
**ISC (04/05) = warped LOO per run, then averaged across runs (z-scored per run)** — not concatenated; faithful ports of `archive/original-isc-producers/`.

The interactive report is `analysis/new-v2/index.html`. Repo-of-record = CR1; run-box = CR2.

## Legacy stage-based scripts (`scripts/`)

Superseded by `pipeline/`; kept for reference. The repo root mirrors the server layout at `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/`. Data folders (`bids_fixed/`, `TimingFiles/`, `derivatives/`) exist on the server and are gitignored locally.

### Scripts (in `scripts/`)

| Script | What it does |
|---|---|
| `1_fix_events.py` | Stage 1: relabels missed-prediction feedback events to canonical labels |
| `2_generate_timing.sh` | Stage 2: builds run-wise .1D timing files with anticipation regressors |
| `3a_afni_proc_template.sh` | Stage 3a: AFNI proc generator template (raw BIDS, no blur) |
| `3b_fallback_patch.py` | Stage 3b: adjusts proc for subjects with fewer than 4 runs |
| `3_run_glm.sh` | Stage 3c: orchestrates proc generation + GLM over all subjects |
| `4_extract_rois.sh` | Stage 4: extracts ROI mean betas from GLM stats files |
| `4b_extract_mentalizing_rois.sh` | Stage 4b: extracts R-TPJ and dmPFC mentalizing ROI betas |
| `5_extract_patterns.sh` | Stage 5: extracts voxel-wise beta patterns for RSA (all 8 ROIs) |
| `qc_summary.sh` | QC: generates per-subject quality control report from AFNI ss_review files |
| `audit_server.sh` | Checks server structure for drift |

### Key Server Paths

- Raw BIDS: `/data/projects/STUDIES/LEARN/fMRI/bids`
- Fixed events: `RSA-learn/bids_fixed`
- Timing files: `RSA-learn/TimingFiles/Fixed2`
- GLM outputs: `RSA-learn/derivatives/afni/IndvlLvlAnalyses`
- ROI extractions: `RSA-learn/derivatives/afni/ROI_extractions`
- ROI patterns (voxel-wise): `RSA-learn/derivatives/afni/ROI_patterns`
- QC summary report: `RSA-learn/docs/qc-summary.md`
- ROI masks: `/data/projects/STUDIES/LEARN/fMRI/Masks/`
- Shared anatomical masks: `/data/AnatomicalROI_Masks/ROIs/`
- Subject list: `/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt`
- SSW anatomy: `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/ssw/sub-<id>/`
- Confounds: `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/confounds/sub-<id>/`

### Running the Pipeline

Stage 1 — fix event labels:
```bash
python3 /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/1_fix_events.py \
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
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/2_generate_timing.sh
```

Stage 3 — run GLM:
```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/3_run_glm.sh
```

QC summary — generate quality control report:
```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/qc_summary.sh
```

Stage 4 — extract ROI betas:
```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/4_extract_rois.sh
```

Stage 4b — extract mentalizing ROI betas (R-TPJ, dmPFC):
```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/4b_extract_mentalizing_rois.sh
```

Stage 5 — extract voxel-wise patterns for RSA (all 8 ROIs):
```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/5_extract_patterns.sh
```

## Rules for Making Changes

1. One production pipeline only. No `v2`, `final2`, or parallel variants.
2. If you change a script, update `docs/decisions.md` and `docs/run-status.md` in the same change.
3. Never leave experimental scripts in `scripts/`. Non-canonical material goes to `sandbox/` on the server.
4. The safe execution order is: fix events -> generate timing -> generate proc -> run GLM -> audit -> QC summary -> extract ROIs -> extract patterns.

## Server Sync

The repo root and the server `RSA-learn/` folder have the same layout. The server is **not** a git repo — sync changed files manually:

1. Via mount: copy files to `/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/RSA-learn/`.
2. Via SSH: `scp` files to `tur50045@155.247.67.31:/data/projects/STUDIES/LEARN/fMRI/RSA-learn/`.
3. Run `bash scripts/audit_server.sh` on the server to verify.

## Repository Layout

- `scripts/` — production pipeline scripts and audit tool
- `docs/` — masterplan, PI walkthrough, decisions, run status
- `bids_fixed/` — Stage 1 output (gitignored, exists on server)
- `TimingFiles/Fixed2/` — Stage 2 output (gitignored, exists on server)
- `derivatives/` — Stage 3 output (gitignored, exists on server)
- `guides/` — PI walkthrough site and undergrad tutorial
- `literature/` — papers, presentations, background emails, reference code
- `analysis/` — clinical/demographic data and trial-level behavioral data
- `proposals/` — project proposal, RSA coding notes, meeting notes
- `archive/` — dead ends, legacy docs (do not use for new work)
- `fmri-data/` — symlink to server data share
