# Decision Log (Canonical Project Decisions)

## 2026-02-24

1. Canonical timing root is `TimingFiles/Fixed2` (with anticipation files present).
2. Production scripts list reduced to five active scripts (fix, timing, proc template, fallback, GLM).
3. Non-canonical artifacts must be moved to `sandbox/`, never left in production paths.
4. Top-level README must remain a complete folder map and runbook.
5. Undergrad training handoff starts at timing generation and GLM execution, not historical fixes.

## 2026-02-28

1. Replaced `analysis/subject_table.csv` (scraped/merged from server sources) with canonical participant data files: `learn_clinical.csv` (59 subjects, 92 clinical/demographic columns) and `learn_behavioral.csv` (6649 trials, 9 columns of LEARN task behavioral data). Old `subject_table_README.md` and `subject_table_qc.txt` removed.
2. GLM rerun initiated on server (Stages 1-2 completed, Stage 3 running in tmux).

## 2026-02-27

1. Added `-goforit 10` to `-regress_opts_3dD` in proc template to handle timing collinearity warnings in some subjects.
2. Fixed bug in fallback patch (`3b_fallback_patch.py`): Anticipation regressor (`Anticipation_pred_fdk.1D` / `Anticipation.PredFdk`) was dropped when rewriting stim list for 2–3 run subjects.
3. Existing 38/38 GLM outputs are from the pre-anticipation template; GLM rerun required.

## 2026-02-25

1. Repository reimagined: `rsa-learn/` renamed to `pipeline/`, scripts given clean names.
2. Codex governance docs (soul files, HTML protocol, operating model, next-agent specs) deleted — content consolidated into `CLAUDE.md`.
3. Single-command wrapper `run_pipeline.sh` removed — stages run individually via `1_fix_events.py`, `2_generate_timing.sh`, `3_run_glm.sh`.
4. Server synced to match new structure; old files moved to `sandbox/`.
5. Repo flattened: `pipeline/` removed so repo root mirrors server layout. `scripts/` and `docs/` now live at root. `sync_to_server.sh` deleted — server uses `git pull` directly.
6. Data folder READMEs placed inside actual data folders (`bids_fixed/README.md`, etc.) with gitignore negation patterns.
