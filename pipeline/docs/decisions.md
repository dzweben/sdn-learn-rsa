# Decision Log (Canonical Project Decisions)

## 2026-02-24

1. Canonical timing root is `TimingFiles/Fixed2` (with anticipation files present).
2. Production scripts list reduced to five active scripts (fix, timing, proc template, fallback, GLM).
3. Non-canonical artifacts must be moved to `sandbox/`, never left in production paths.
4. Top-level README must remain a complete folder map and runbook.
5. Undergrad training handoff starts at timing generation and GLM execution, not historical fixes.

## 2026-02-25

1. Repository reimagined: `rsa-learn/` renamed to `pipeline/`, scripts given clean names.
2. Codex governance docs (soul files, HTML protocol, operating model, next-agent specs) deleted — content consolidated into `CLAUDE.md`.
3. Single-command wrapper `run_pipeline.sh` removed — stages run individually via `1_fix_events.py`, `2_generate_timing.sh`, `3_run_glm.sh`.
4. Server synced to match new structure; old files moved to `sandbox/`.
