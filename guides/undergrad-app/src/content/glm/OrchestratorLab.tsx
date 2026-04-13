/**
 * GLM Labs — Module 9: Lab: The Orchestrator
 * Write 3_run_glm.sh: subject discovery, parallel execution, error handling.
 */

import Callout from '@src/components/Callout'
import CreateFile from '@src/components/CreateFile'
import InsertCode from '@src/components/InsertCode'
import PeekScript from '@src/components/PeekScript'

export default function OrchestratorLab(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            GLM Labs
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Lab 9 of 10</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Lab: The Orchestrator
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Build the script that ties everything together &mdash; discovers subjects, generates
          proc scripts, invokes the fallback patch for &lt;4-run subjects, and runs GLMs in
          parallel.
        </p>
      </div>

      <div className="prose-container">
        <h2>What the Orchestrator Does</h2>
        <p>
          The orchestrator (<code className="code-inline">3_run_glm.sh</code>) has three phases:
        </p>
        <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-bright)] font-bold shrink-0">MAKE_PROC</span>
              <span className="text-[var(--color-text-secondary)]">
                Generate afni_proc scripts for every subject. Detect run counts, apply fallback
                patch for &lt;4-run subjects.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-bright)] font-bold shrink-0">CLEAN_OUT</span>
              <span className="text-[var(--color-text-secondary)]">
                Remove old output directories to prevent &ldquo;directory already exists&rdquo;
                errors from AFNI.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-bright)] font-bold shrink-0">RUN_GLM</span>
              <span className="text-[var(--color-text-secondary)]">
                Execute proc scripts in parallel, throttled by MAX_JOBS and server load.
              </span>
            </div>
          </div>
        </div>

        <h2>Create the File</h2>
        <CreateFile
          filename="my_run_glm.sh"
          language="shell"
          description="Opens a blank Bash script for the orchestrator."
        />

        <h2>The Setup Section</h2>
        <InsertCode language="bash" description="Orchestrator — shebang, paths, phase toggles">
{`#!/bin/bash
set -euo pipefail

#######################################################
# my_run_glm.sh — Orchestrate proc generation + GLM execution
#######################################################

TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
RSA_DIR="$TOPDIR/RSA-learn"
SCRIPT_DIR="$RSA_DIR/scripts"
TMP_DIR="$RSA_DIR/tmp"
LOG_DIR="$RSA_DIR/logs"
RESULTS_DIR="$RSA_DIR/derivatives/afni/IndvlLvlAnalyses"
TIMING_ROOT="\${TIMING_ROOT_OVERRIDE:-$RSA_DIR/TimingFiles/Fixed2}"
BIDS_DIR="\${BIDS_DIR_OVERRIDE:-$TOPDIR/bids}"

AP_ORIG="$SCRIPT_DIR/3a_afni_proc_template.sh"
AP_FALLBACK="$SCRIPT_DIR/3b_fallback_patch.py"

# Phase toggles (set any to 0 to skip)
MAKE_PROC="\${MAKE_PROC:-1}"
CLEAN_OUT="\${CLEAN_OUT:-1}"
RUN_GLM="\${RUN_GLM:-1}"
MAX_JOBS="\${MAX_JOBS:-}"

mkdir -p "$TMP_DIR" "$LOG_DIR" "$RESULTS_DIR"`}
        </InsertCode>

        <h2>Subject Discovery</h2>
        <p>
          Instead of maintaining a subject list, the orchestrator discovers subjects
          automatically from the timing file directory:
        </p>

        <InsertCode language="bash" description="Discover subjects from timing folders">
{`
discover_subjects() {
    local subjects=()
    for d in "$TIMING_ROOT"/sub-*; do
        [ -d "$d" ] || continue
        local subj=$(basename "$d" | sed 's/^sub-//')
        subjects+=("$subj")
    done
    echo "\${subjects[@]}"
}

SUBJECTS=( $(discover_subjects) )
echo "[RSA-learn] Found \${#SUBJECTS[@]} subjects"`}
        </InsertCode>

        <Callout variant="learn">
          <strong>Why discover instead of list?</strong> If you add or remove subjects from the
          timing directory, the orchestrator automatically picks up the changes. No separate
          subject list file to maintain and keep in sync.
        </Callout>

        <h2>Phase 1: Generate Proc Scripts</h2>
        <p>
          For each subject, detect how many runs they have and generate the appropriate proc
          script:
        </p>

        <InsertCode language="bash" description="Phase 1: Generate proc scripts with fallback for <4-run subjects">
{`
if [ "$MAKE_PROC" = "1" ]; then
    echo "[RSA-learn] Phase 1: Generating proc scripts"
    for subj in "\${SUBJECTS[@]}"; do
        # Count available BOLD runs
        nruns=$(ls "$BIDS_DIR/sub-$subj/func/sub-\${subj}_task-learn_run-"*"_bold.nii.gz" 2>/dev/null | wc -l)

        if [ "$nruns" -lt 2 ]; then
            echo "  SKIP sub-$subj: only $nruns runs"
            continue
        fi

        if [ "$nruns" -eq 4 ]; then
            # Standard 4-run template
            echo "  sub-$subj: 4 runs (standard)"
            # Copy and run template for this subject
        else
            # Fallback: generate 4-run proc, then patch to actual runs
            echo "  sub-$subj: $nruns runs (fallback patch)"
            # Generate 4-run proc, then apply fallback patch
        fi
    done
fi`}
        </InsertCode>

        <h2>Phase 3: Run GLMs in Parallel</h2>
        <p>
          The key feature: run multiple subjects simultaneously, throttled to avoid overloading
          the server:
        </p>

        <InsertCode language="bash" description="Phase 3: Run GLMs with parallel job control">
{`
if [ "$RUN_GLM" = "1" ]; then
    echo "[RSA-learn] Phase 3: Running GLMs"
    for subj in "\${SUBJECTS[@]}"; do
        procfile="$RESULTS_DIR/$subj/proc.$subj.LEARN_RSA_runwise_AFNI"
        [ -f "$procfile" ] || continue

        # Wait if too many jobs are running
        if [ -n "$MAX_JOBS" ]; then
            while [ $(jobs -r | wc -l) -ge "$MAX_JOBS" ]; do
                sleep 10
            done
        fi

        echo "  Starting sub-$subj"
        (
            cd "$RESULTS_DIR/$subj"
            tcsh -xef "$procfile" > "output.proc.$subj" 2>&1
        ) &
    done

    # Wait for all background jobs to finish
    wait
    echo "[RSA-learn] All GLMs complete"
fi`}
        </InsertCode>

        <Callout variant="tip">
          <strong>Usage examples:</strong><br />
          <code className="code-inline">bash my_run_glm.sh</code> &mdash; run everything<br />
          <code className="code-inline">MAX_JOBS=4 bash my_run_glm.sh</code> &mdash; limit to 4
          parallel subjects<br />
          <code className="code-inline">MAKE_PROC=1 RUN_GLM=0 bash my_run_glm.sh</code> &mdash;
          only generate scripts, do not run GLMs (dry run)
        </Callout>

        <PeekScript
          script="3_run_glm.sh"
          label="See Danny's complete orchestrator"
        />

        <Callout variant="exercise" title="Understand the Workflow">
          <p>Before running, make sure you can answer:</p>
          <ul className="mt-2 list-disc list-inside">
            <li>How does the script discover subjects?</li>
            <li>What happens when a subject has only 3 runs?</li>
            <li>How do you do a &ldquo;dry run&rdquo; (generate scripts without running GLMs)?</li>
            <li>How do you limit parallel jobs to prevent server overload?</li>
          </ul>
        </Callout>
      </div>
    </div>
  )
}
