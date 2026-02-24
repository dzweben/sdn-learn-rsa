# RSA-learn

This is the **production home** for the LEARN run-wise RSA GLM pipeline.
If you are new to this project, read this file first.

## 1) What this folder is for

This folder contains:
- the canonical scripts that build/run the current model
- the canonical timing inputs used by that model
- subject-level AFNI outputs
- runbook documentation for humans

This folder should **not** be used as a scratchpad. Old attempts, forks, and abandoned variants must live under `sandbox/`.

## 2) Canonical production root paths

Linux server root:
- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn`

Mac mounted equivalent:
- `/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/RSA-learn`

All canonical paths below refer to the Linux path.

## 3) Final model status (what has been run)

The active subject-level outputs in:
- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses`

were generated from the AFNI raw run-wise model:
- model tag: `LEARN_RSA_runwise_AFNI`
- timing root: `TimingFiles/Fixed2`
- blur removed in AFNI proc generation (no smoothing block)
- anticipation regressor included (`Anticipation_pred_fdk`)

## 4) One command to run canonical pipeline

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

This runs three stages:
1. Event relabeling (`nopred_fdbk` -> canonical feedback labels) into `bids_fixed/`
2. Timing generation into `TimingFiles/Fixed2/` (including anticipation files)
3. AFNI proc generation + GLM execution into `derivatives/afni/IndvlLvlAnalyses/`

## 5) Stage-controlled runs (when you only need one step)

Only event relabeling:

```bash
FIX_EVENTS=1 MAKE_TIMING=0 MAKE_PROC=0 CLEAN_OUT=0 RUN_GLM=0 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

Only timing generation:

```bash
FIX_EVENTS=0 MAKE_TIMING=1 MAKE_PROC=0 CLEAN_OUT=0 RUN_GLM=0 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

Only GLM run from existing proc scripts:

```bash
FIX_EVENTS=0 MAKE_TIMING=0 MAKE_PROC=0 CLEAN_OUT=1 RUN_GLM=1 MAX_JOBS=8 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

## 6) Required upstream data contracts

These inputs must exist before running:
- raw BIDS events + bold: `/data/projects/STUDIES/LEARN/fMRI/bids`
- subject list: `/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt`
- AFNI SSW anat: `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/ssw/sub-<id>/`
- AFNI confounds: `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/confounds/sub-<id>/`

## 7) Folder map (human version)

- `scripts/`
  - active executable scripts only
  - no abandoned variants here
- `docs/`
  - canonical run docs, governance docs, and handoff specs
- `bids_fixed/`
  - corrected events produced by relabel stage
- `TimingFiles/Fixed2/`
  - canonical timing inputs for the active model
  - includes run-wise feedback files, prediction/response files, and `Anticipation_pred_fdk*.1D`
  - name is historical, but this is the final active timing root
- `derivatives/afni/IndvlLvlAnalyses/`
  - per-subject proc scripts, logs, and AFNI GLM outputs
- `reports/`
  - machine-readable reports from fixes/audits
- `logs/`
  - human-facing run logs for active runs
- `notes/`
  - short current notes only
- `sandbox/`
  - non-canonical legacy/fork artifacts moved out of production

## 8) Canonical script list

- `scripts/LEARN_run_RSA_FINAL.sh`
- `scripts/LEARN_fix_nopred_fdbk_by_template.py`
- `scripts/LEARN_1D_AFNItiming_Full_RSA_runwise_Anticipation.sh`
- `scripts/LEARN_ap_Full_RSA_runwise_AFNI_noblur_Anticipation.sh`
- `scripts/LEARN_ap_fallback_patch_afni_raw.py`
- `scripts/LEARN_run_RSA_runwise_pipeline_afni_raw_Anticipation.sh`
- `scripts/sync_repo_to_server.sh`
- `scripts/audit_server_layout.sh`

## 9) Fast audit commands

Full structure audit:

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/audit_server_layout.sh
```

Missing subject stats:

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

## 10) Documentation map

Core run docs:
- `docs/PIPELINE_FINAL_CANONICAL.md`
- `docs/RUN_STATUS_AND_DATA_REQUIREMENTS.md`
- `docs/REPO_SERVER_OPERATING_MODEL.md`

Project governance docs:
- `docs/PROJECT_SOUL_GUIDELINES.md`
- `docs/PROJECT_SOUL_INTERNAL.md`
- `docs/DECISION_LOG.md`
- `docs/HTML_MAINTENANCE_PROTOCOL.md`

Next-agent handoff specs:
- `docs/NEXT_AGENT_SPEC_NEW_RA_WALKTHROUGH.md`
- `docs/NEXT_AGENT_UNDERGRAD_PIPELINE_PREP.md`

Narrative walkthrough outputs:
- `docs/LEARN_RSA_MASTERPLAN_FINAL.md/.html`
- `docs/LEARN_RSA_PI_WALKTHROUGH.md/.html`

## 11) Hard operating rules

1. One production pipeline only. No `final2`, `v3`, or parallel canonical tracks.
2. If behavior changes, patch canonical scripts in place and update docs in the same change.
3. Never leave deprecated scripts in production folders.
4. Move non-canonical material into `sandbox/`.
5. Keep README and docs human-readable first, automation-friendly second.
6. Sync repo -> server after doc/script changes.
