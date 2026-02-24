# RSA-learn

Canonical production folder for LEARN RSA run-wise AFNI modeling.

## One-command Production Run

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

This executes:
1. event relabel fix (`nopred_fdbk` -> canonical feedback labels)
2. run-wise timing generation (includes `Anticipation_pred_fdk`)
3. AFNI proc generation + GLM run (raw BIDS, no blur)

## What Was Actually Run

The active subject-level outputs currently present in:

`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses`

were generated with:
- AFNI raw run-wise model (`LEARN_RSA_runwise_AFNI`)
- canonical timing root `TimingFiles/Fixed2`
- no smoothing (`blur` removed from AFNI blocks)

## Folder Map (What each folder means)

- `scripts/`
  - only active production scripts; no deprecated forks
- `docs/`
  - operating docs, standards, and project soul
- `bids_fixed/`
  - corrected event files used as timing source input
- `TimingFiles/Fixed2/`
  - canonical timing files used by the active GLM
  - includes `Anticipation_pred_fdk*.1D`
- `TimingFiles/Fixed2/` naming:
  - the name is historical ("second corrected timing lineage")
  - despite the name, it is the current final production timing root
- `derivatives/afni/IndvlLvlAnalyses/`
  - subject-level proc scripts, logs, and GLM outputs
- `reports/`
  - machine-readable reports from fix/audit stages
- `logs/`
  - run logs from active pipeline runs
- `sandbox/`
  - non-canonical legacy/fork artifacts kept out of production paths

## Canonical Active Scripts

- `scripts/LEARN_run_RSA_FINAL.sh`
- `scripts/LEARN_fix_nopred_fdbk_by_template.py`
- `scripts/LEARN_1D_AFNItiming_Full_RSA_runwise_Anticipation.sh`
- `scripts/LEARN_ap_Full_RSA_runwise_AFNI_noblur_Anticipation.sh`
- `scripts/LEARN_ap_fallback_patch_afni_raw.py`
- `scripts/LEARN_run_RSA_runwise_pipeline_afni_raw_Anticipation.sh`

## Canonical Docs

- `docs/PIPELINE_FINAL_CANONICAL.md`
- `docs/RUN_STATUS_AND_DATA_REQUIREMENTS.md`
- `docs/PROJECT_SOUL_GUIDELINES.md`
- `docs/PROJECT_SOUL_INTERNAL.md`
- `docs/DECISION_LOG.md`
- `docs/HTML_MAINTENANCE_PROTOCOL.md`
- `docs/NEXT_AGENT_SPEC_NEW_RA_WALKTHROUGH.md`
- `docs/REPO_SERVER_OPERATING_MODEL.md`

## Hard Rules

1. Only one production pipeline is allowed.
2. New fixes patch canonical scripts; do not fork production paths.
3. If any behavior/path changes, docs must be updated in the same change.
4. Server scripts/docs are synced from repo; do not let them drift.
