# Project Soul (Internal, Living Document)

## Purpose

This project exists to produce reproducible, interpretable LEARN RSA subject-level beta maps using one canonical AFNI run-wise pipeline.

The operational objective is not just to run scripts; it is to maintain a stable, auditable system where:
1. inputs are explicit,
2. outputs are predictable,
3. every change is documented,
4. production paths stay clean.

This file is intentionally expansive and must be kept current by future agents.

## Scientific Intent (Operational Form)

The canonical RSA GLM models:
1. run-wise feedback conditions (peer x feedback),
2. prediction and response regressors,
3. anticipation interval (prediction->feedback, event `isi`) as an explicit regressor.

Feedback->response interval is not a dedicated modeled phase in this project because the gap is effectively negligible in practice.

## Canonical Data Flow

1. Raw BIDS:
`/data/projects/STUDIES/LEARN/fMRI/bids`

2. Fixed events (relabel `nopred_fdbk`):
`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed`

3. Timing files (canonical):
`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2`

4. Subject AFNI outputs:
`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses`

## Canonical Script Chain

1. `scripts/LEARN_fix_nopred_fdbk_by_template.py`
2. `scripts/LEARN_1D_AFNItiming_Full_RSA_runwise_Anticipation.sh`
3. `scripts/LEARN_ap_Full_RSA_runwise_AFNI_noblur_Anticipation.sh`
4. `scripts/LEARN_ap_fallback_patch_afni_raw.py`
5. `scripts/LEARN_run_RSA_runwise_pipeline_afni_raw_Anticipation.sh`
6. `scripts/LEARN_run_RSA_FINAL.sh`

Only this chain is production.

## Why The Pipeline Looks Like This

1. Event relabel fix is required to prevent missing feedback-condition timing rows after missed predictions.
2. Timing is run-wise because RSA beta extraction depends on run-level condition estimates.
3. AFNI raw no-blur path is used to preserve spatial pattern information for RSA.
4. Anticipation is modeled explicitly through `isi`-derived timing to avoid treating meaningful pre-feedback interval as unmodeled variance.

## Folder Contract

Top-level RSA-learn folder must remain organized as:

1. `scripts/` active production scripts only.
2. `docs/` canonical project docs.
3. `bids_fixed/` canonical fixed events.
4. `TimingFiles/Fixed2/` canonical timing.
5. `derivatives/` outputs.
6. `reports/` compact reports.
7. `logs/` current run logs.
8. `sandbox/` any legacy or non-canonical material.

No legacy attempts in production folders.

## Change Management Rules

When any modeling logic changes:
1. patch canonical script directly,
2. update `PIPELINE_FINAL_CANONICAL.md`,
3. update `RUN_STATUS_AND_DATA_REQUIREMENTS.md`,
4. append one entry to `DECISION_LOG.md`,
5. update PI/masterplan documents in the same work cycle.

## No-Fork Rule

Disallowed:
1. parallel production script families,
2. multiple active timing roots that represent variants of the same pipeline,
3. leaving attempted scripts in production directories.

Allowed:
1. one production chain,
2. optional retention of old artifacts only under `sandbox/`.

## QA / Audit Minimum

Any “run complete” claim requires:
1. stats existence check against canonical timing cohort,
2. error scan of output logs,
3. explicit note of unresolved exceptions.

## Exception Handling

Example: subject-level collinearity hard-stop (`-GOFORIT` threshold) should be handled with:
1. explicit subject-scoped patch,
2. log evidence,
3. documented reason in decision log and PI-facing docs.

## What Future Agents Must Not Do

1. do not invent new production path names for minor modifications,
2. do not leave temporary generated scripts in production root,
3. do not update scripts without docs,
4. do not keep old and new canonical claims simultaneously.

## What Future Agents Must Do

1. keep top-level README as complete operational map,
2. keep canonical script defaults aligned with real data paths,
3. keep docs coherent with actual run state,
4. keep production and sandbox sharply separated.

## Living Update Footer

When updating this document, append:
1. date,
2. what changed,
3. why it changed,
4. which files were updated.
