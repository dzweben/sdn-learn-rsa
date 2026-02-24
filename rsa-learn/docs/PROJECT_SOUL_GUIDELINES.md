# PROJECT SOUL GUIDELINES (For Future Agents)

## 1) Single Canonical Pipeline Rule

There must be one primary runnable pipeline:
- `scripts/LEARN_run_RSA_FINAL.sh`

If a new modeling choice is accepted, update the canonical chain directly.  
Do not create parallel production scripts unless there is a hard incompatibility.

## 2) No Silent Forks

Do not create new production folders like `Fixed2_X`, `Fixed2_NEW`, `Fixed2_final2` silently.  
If a new branch is unavoidable:
1. create it once,
2. document why in `docs/DECISION_LOG.md`,
3. mark which path is canonical in `docs/PIPELINE_FINAL_CANONICAL.md`.

## 3) Every Code Change Requires Doc Change

In the same change set, update:
- `docs/PIPELINE_FINAL_CANONICAL.md` if behavior/paths changed
- `docs/DECISION_LOG.md` with what changed and why
- `docs/HTML_MAINTENANCE_PROTOCOL.md` if reporting requirements changed
- `README.md` and `docs/README.md` if folder meanings or run surfaces changed

## 4) Keep Operational Surfaces Small

Keep only active scripts in `scripts/`.  
Move deprecated artifacts to `sandbox/` and keep production paths clean.

## 5) Preserve Traceability

Never mix legacy attempts into production folders.  
If retained, keep them only in `sandbox/` with short reason/date note.

## 6) Safe Execution Order

1. fix events
2. generate timing
3. generate proc
4. run GLM
5. audit outputs

Do not skip stage ordering without documenting why.

## 7) Path Discipline

Hardcode server defaults to `/data/projects/STUDIES/LEARN/fMRI/...`  
Allow overrides through env vars for mounted-drive runs.

## 8) If You Touch GLM Design, Prove It

When regressors/labels change:
1. grep proof in generator script
2. grep proof in generated proc
3. update docs with exact command used
