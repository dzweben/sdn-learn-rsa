# Next-Agent Prep: Undergrad Pipeline Build

## Purpose of this handoff

This document prepares the next agent to build a beginner-facing pipeline walkthrough for an undergrad RA.

Important scope constraint:
- Do **not** revisit blur-removal work.
- Do **not** revisit the `nopred_fdbk` correction logic.
- Start from the operational flow: **generate timing from events -> run GLM -> verify outputs**.

## Canonical project roots

Linux:
- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn`

Mounted Mac equivalent:
- `/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/RSA-learn`

## What the next agent should assume is already solved

1. Canonical timing root exists at:
   - `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2`
2. Canonical events fix destination exists at:
   - `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed`
3. Canonical AFNI raw no-blur anticipation model scripts are in:
   - `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts`
4. Existing subject outputs are in:
   - `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses`

## Undergrad training objective (new project to build)

Build a clear teaching pipeline where a new RA can:
1. Understand event files and what timing files represent.
2. Generate timing files from event files.
3. Generate and run AFNI proc/GLM for subjects.
4. Audit completion and debug basic failures.
5. Practice commands in an interactive, tutorial-like terminal flow.

## Required teaching flow (order is fixed)

1. **Inputs and orientation**
   - show where BIDS events live
   - show one participant/run event TSV example
2. **Timing generation**
   - run canonical timing script
   - inspect one subject folder in `TimingFiles/Fixed2`
3. **GLM generation/execution**
   - run canonical pipeline with stage flags (timing-only, then GLM-only)
   - explain what proc files are
4. **Audit**
   - missing stats check
   - error scan
5. **Interpret outputs**
   - where `stats.<id>+tlrc.HEAD` lives
   - how regressors map to labels in stats

## Canonical scripts to use (no alternatives)

- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_1D_AFNItiming_Full_RSA_runwise_Anticipation.sh`
- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh`
- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_runwise_pipeline_afni_raw_Anticipation.sh`
- `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/audit_server_layout.sh`

## Command set the undergrad tutorial must include

Timing generation:

```bash
SUBJ_LIST_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt \
BIDS_DIR_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed \
TIMING_ROOT_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_1D_AFNItiming_Full_RSA_runwise_Anticipation.sh
```

GLM-only execution from existing proc:

```bash
FIX_EVENTS=0 MAKE_TIMING=0 MAKE_PROC=0 CLEAN_OUT=1 RUN_GLM=1 MAX_JOBS=8 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

Completion check:

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

## Interactive terminal concept (for next build phase)

The next agent should build a guided tutorial shell experience with:
1. Step-by-step prompts (`Step 1/6`, `Step 2/6`, etc.)
2. Copy/paste command blocks with expected output examples
3. Lightweight quizzes (for example: "which file contains stats output?")
4. Stop-on-error checks with plain-English remediation hints

Do not implement this interactive tutorial in production scripts.
Build it as a separate teaching project area (for example `training/` or `new_ra_walkthrough/`).

## Acceptance criteria for next agent

1. A new RA can run timing generation and GLM without reading legacy docs.
2. Every teaching command maps to canonical paths used in production.
3. No references to deprecated script variants.
4. Undergrad walkthrough explains concepts without hiding file paths.
5. Master docs are updated if canonical behavior changes.

## Change control

If the next agent modifies canonical scripts or path contracts, they must update:
1. `README.md`
2. `docs/PIPELINE_FINAL_CANONICAL.md`
3. `docs/RUN_STATUS_AND_DATA_REQUIREMENTS.md`
4. `docs/DECISION_LOG.md`
5. `docs/NEXT_AGENT_UNDERGRAD_PIPELINE_PREP.md`
