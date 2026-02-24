# HTML Maintenance Protocol

This protocol keeps the master and PI-facing HTMLs synchronized with pipeline reality.

## Primary Targets

- Master plan HTML (project-facing)
- PI walkthrough HTML (communication-facing)

Use the current canonical files in your environment and keep both in sync.

## Required Update Triggers

Update both HTMLs when any of the following changes:
1. regressor set
2. timing source path
3. proc generator options
4. run command sequence
5. special-case fixes (example: sub-1522 GOFORIT)

## Required Sections To Keep Current

1. Canonical script paths
2. Canonical run command
3. Current timing root and bids_fixed path
4. Audit commands (success/failure checks)
5. Known exceptions and one-line reason

## Rule For New Pipeline Changes

Every pipeline change must be represented as:
- one short explanation block
- one exact command block
- one proof block (grep/path snippet)

No ambiguous prose without concrete command/path evidence.

## Snapshot Hygiene

If embedding large images:
1. store in deterministic folder
2. use collapsible sections by default
3. do not break nav/layout

## Absolute Rule

If HTML and scripts disagree, scripts win temporarily, but HTML must be fixed in the same work session.
