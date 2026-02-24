# Next-Agent Spec: Build A New-RA Full Walkthrough Project

This is a build spec, not the walkthrough itself.

## Goal

Create a separate beginner-friendly project that teaches a new RA from zero to full execution:
- timing generation
- proc generation
- GLM execution
- audit and QC checks

No fork history in the teaching flow. Use only canonical execution steps.

## Mandatory Source Of Truth

The walkthrough must be based on:
1. `docs/PIPELINE_FINAL_CANONICAL.md`
2. `docs/RUN_STATUS_AND_DATA_REQUIREMENTS.md`
3. `scripts/LEARN_run_RSA_FINAL.sh`

## Deliverables The Next Agent Must Build

1. `new_ra_walkthrough/index.html`
2. chaptered pages with sticky nav
3. side-by-side:
   - concept explanation
   - exact command
   - expected output
   - failure mode and fix
4. terminal mini-tutorial blocks for each step
5. one short QA checklist page

## Required Chapters

1. Environment and paths
2. Inputs and data contracts
3. Event relabel step
4. Timing generation step
5. Proc generation and what a proc script is
6. GLM execution
7. Audit and troubleshooting
8. Known exceptions (example: collinearity/GOFORIT handling)

## Content Rules

1. Use concrete file paths, not abstract placeholders.
2. Do not mention deprecated branches unless in an appendix.
3. Every chapter includes at least one full command block and one real file example.
4. Keep explanations simple and operational; avoid unnecessary theory drift.

## Quality Gates

1. A first-time RA can execute end-to-end with only this walkthrough.
2. Every command is copy/paste safe.
3. The walkthrough names one canonical script chain only.
4. Any deviation from canonical chain is explicitly marked "exception".

## Explicit Anti-Pattern Ban

Do not create multiple production walkthrough variants (v2, final2, final_fixed).
If a correction is needed, patch the same walkthrough and log the change.
