/**
 * GLM Labs — Module 8: Lab: The Fallback Patch
 * Write 3b_fallback_patch.py for subjects with fewer than 4 runs.
 */

import Callout from '@src/components/Callout'
import CreateFile from '@src/components/CreateFile'
import InsertCode from '@src/components/InsertCode'
import PeekScript from '@src/components/PeekScript'

export default function FallbackLab(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            GLM Labs
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Lab 8 of 10</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Lab: The Fallback Patch
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Not every subject has 4 runs. Write a Python script that adjusts the proc template
          for subjects with 2 or 3 runs &mdash; rewriting data inputs, timing files, labels,
          and GLT weights.
        </p>
      </div>

      <div className="prose-container">
        <h2>The Problem</h2>
        <p>
          Your proc template assumes 4 runs. But some subjects completed only 2 or 3 runs.
          If you run the 4-run template on a 3-run subject, AFNI will look for run-04 BOLD and
          timing files that do not exist &mdash; and crash.
        </p>
        <p>
          We need a script that takes the 4-run template and rewrites it for the actual number
          of runs. This means adjusting:
        </p>
        <ul>
          <li><strong>-dsets:</strong> Only include BOLD files for runs that exist</li>
          <li><strong>Timing files:</strong> Remove run-4 files, keep runs 1-3</li>
          <li><strong>Labels, types, basis:</strong> Remove entries for missing runs</li>
          <li><strong>GLT weights:</strong> Recalculate &mdash; averaging 3 runs means 1/3
            (0.333), not 1/4 (0.25)</li>
        </ul>

        <Callout variant="warning">
          The weight recalculation is the most error-prone part. If you average 3 betas with
          0.25 weights (from the 4-run template), the weights do not sum to 1 and the contrast
          is wrong. Each weight must be recalculated as 1/num_runs.
        </Callout>

        <h2>Create the File</h2>
        <CreateFile
          filename="my_fallback_patch.py"
          language="python"
          description="Opens a blank Python script for the fallback patch."
        />

        <h2>The Structure</h2>
        <p>
          The script takes three arguments: the template path, the subject ID, and the available
          run numbers. It reads the template, rewrites the relevant sections, and saves the
          modified version.
        </p>

        <InsertCode language="python" description="Fallback patch — skeleton with argument parsing and stim_defs">
{`#!/usr/bin/env python3
from pathlib import Path
import sys

# Usage: my_fallback_patch.py <template_path> <subj> <runs...>
# Example: my_fallback_patch.py proc_template.sh 958 1 2 3

def main():
    if len(sys.argv) < 4:
        raise SystemExit("Usage: my_fallback_patch.py <template> <subj> <runs...>")

    ap = Path(sys.argv[1])
    subj = sys.argv[2]
    runs = [int(r) for r in sys.argv[3:] if r.strip().isdigit()]
    if not runs:
        raise SystemExit("No runs provided")

    # tcsh variable references (these get substituted by the shell at runtime)
    stimdir = "$stimdir"
    subj_dir = "$subj_dir"

    # Mapping: timing file prefix → regressor label
    stim_defs = [
        ("NonPM_Mean60_fdkm", "FBM.Mean60"),
        ("NonPM_Mean60_fdkn", "FBN.Mean60"),
        ("NonPM_Mean80_fdkm", "FBM.Mean80"),
        ("NonPM_Mean80_fdkn", "FBN.Mean80"),
        ("NonPM_Nice60_fdkm", "FBM.Nice60"),
        ("NonPM_Nice60_fdkn", "FBN.Nice60"),
        ("NonPM_Nice80_fdkm", "FBM.Nice80"),
        ("NonPM_Nice80_fdkn", "FBN.Nice80"),
    ]

    pred_resp = [
        ("Mean60_pred", "Pred.Mean60"),
        ("Mean60_rsp", "Resp.Mean60"),
        ("Mean80_pred", "Pred.Mean80"),
        ("Mean80_rsp", "Resp.Mean80"),
        ("Nice60_pred", "Pred.Nice60"),
        ("Nice60_rsp", "Resp.Nice60"),
        ("Nice80_pred", "Pred.Nice80"),
        ("Nice80_rsp", "Resp.Nice80"),
    ]

    text = ap.read_text()
    lines = text.splitlines()

    # ... rewrite logic goes here ...

if __name__ == "__main__":
    main()`}
        </InsertCode>

        <h2>Key Logic: Rewriting the Template</h2>
        <p>
          The fallback patch needs to find and replace specific sections of the template.
          The core logic involves:
        </p>
        <ol>
          <li>
            <strong>Replace -dsets:</strong> Only include BOLD files for available runs
          </li>
          <li>
            <strong>Replace stim_times:</strong> Build the run-wise timing file list using only
            available runs (e.g., for 3 runs: run1, run2, run3 only)
          </li>
          <li>
            <strong>Replace stim_labels/types/basis:</strong> Match the new timing file count
          </li>
          <li>
            <strong>Regenerate all GLTs:</strong> Recalculate weights as 1/num_runs
          </li>
        </ol>

        <Callout variant="learn">
          <strong>Weight formula by run count:</strong><br />
          4 runs: weight = 0.25 (1/4)<br />
          3 runs: weight = 0.333333 (1/3)<br />
          2 runs: weight = 0.5 (1/2)<br /><br />
          The total number of regressors also changes:<br />
          4 runs: 41 regressors (32 feedback + 8 pred/rsp + 1 anticipation)<br />
          3 runs: 33 regressors (24 feedback + 8 pred/rsp + 1 anticipation)<br />
          2 runs: 25 regressors (16 feedback + 8 pred/rsp + 1 anticipation)
        </Callout>

        <p>
          The full fallback patch is about 200 lines of Python. The trickiest part is
          regenerating the GLTs with correct weights. Danny&rsquo;s approach: instead of editing
          existing GLT lines, regenerate them all from scratch using the available runs.
        </p>

        <PeekScript
          script="3b_fallback_patch.py"
          label="See Danny's complete fallback patch"
        />

        <Callout variant="exercise" title="Understand the Weight Math">
          <p>
            For a 3-run subject, calculate the correct weight for each GLT category:
          </p>
          <ul className="mt-2 list-disc list-inside">
            <li>Grand average of one condition across 3 runs = ?</li>
            <li>Per-run peer average (2 conditions) = ? (same: 0.5)</li>
            <li>Grand mean/nice average across all Mean conditions and all runs = ?</li>
          </ul>
        </Callout>
      </div>
    </div>
  )
}
