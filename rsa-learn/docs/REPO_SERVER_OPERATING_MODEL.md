# Repo/Server Operating Model

## Why there are two locations

This project has two legitimate homes:

1. **GitHub/local repo** (`rsa-learn/`): code, docs, and operational tooling.
2. **Server runtime folder** (`/data/projects/STUDIES/LEARN/fMRI/RSA-learn`): data-adjacent runtime files and analysis outputs.

They serve different purposes. They should be coordinated, not identical byte-for-byte.

## Single source of truth

For scripts and docs, the source of truth is the repo copy:

- `rsa-learn/scripts/`
- `rsa-learn/docs/`
- `rsa-learn/docs/LEARN_RSA_MASTERPLAN_FINAL.md`
- `rsa-learn/docs/LEARN_RSA_PI_WALKTHROUGH.md`

Server copies of these files should be overwritten from repo via sync script.

## What belongs where

### Repo-only (version controlled)

- active scripts
- docs and walkthrough sources
- sync/audit tooling
- decision and soul documents

### Server-only (runtime/data)

- `derivatives/` outputs
- heavy logs and temporary runtime traces
- fixed events and timing outputs used during actual runs

## Production vs sandbox

In server RSA-learn:

- Production paths are top-level operational folders (`scripts`, `docs`, `bids_fixed`, `TimingFiles/Fixed2`, `derivatives`).
- Legacy/fork artifacts belong only under `sandbox/`.

No legacy attempts should remain in production folders.

## Required operational cycle

1. Update repo scripts/docs.
2. Run repo audit script.
3. Sync repo -> server.
4. Run server audit script.
5. Commit and push repo.

## Non-negotiable rules for future agents

1. Do not create parallel production pipelines.
2. Do not add new production timing roots for minor edits.
3. Do not edit server scripts/docs directly unless repo update is made in same cycle.
4. If a model/path changes, update:
   - `README.md`
   - `docs/PIPELINE_FINAL_CANONICAL.md`
   - `docs/RUN_STATUS_AND_DATA_REQUIREMENTS.md`
   - `docs/DECISION_LOG.md`
   - PI and masterplan walkthrough files

## Fixed2 naming note

`TimingFiles/Fixed2` is the canonical timing root name because it is the second corrected timing generation lineage that replaced earlier broken/partial versions. The folder name is historical, but its contents are current production and include the anticipation regressors.
