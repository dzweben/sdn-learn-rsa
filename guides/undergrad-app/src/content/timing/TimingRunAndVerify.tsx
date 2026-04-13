/**
 * Timing Labs — Module 3: Run & Verify
 * Execute the script on the server, debug errors, and verify output.
 * Uses events_enriched/ as source and TimingFiles/Enriched/ as output.
 */

import Callout from '@src/components/Callout'
import TryCommand from '@src/components/TryCommand'

export default function TimingRunAndVerify(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Timing Labs
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 3 of 3</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Run &amp; Verify
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Your script is written. Now run it on the server, check the output, and prove
          it&rsquo;s correct.
        </p>
      </div>

      <div className="prose-container">
        {/* ── GET IT ON THE SERVER ─────────────────────────── */}
        <h2>Get Your Script to the Server</h2>
        <p>
          SSH into the server and either paste your script into nano, or copy it up with{' '}
          <code className="code-inline">scp</code>:
        </p>

        <TryCommand
          command="cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn && nano my_timing.sh"
          description="Open nano on the server. Paste your script, Ctrl+O to save, Ctrl+X to exit."
        />

        {/* ── TEST WITH ONE SUBJECT ───────────────────────── */}
        <h2>Test with One Subject</h2>
        <p>
          Always test on one subject first. Create a single-subject list, then run:
        </p>

        <TryCommand
          command={`echo "LEARN958" > /tmp/test_subj.txt`}
          description="Create a one-subject test list."
        />

        <TryCommand
          command={`SUBJ_LIST_OVERRIDE=/tmp/test_subj.txt \\
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/my_timing.sh`}
          description="Run YOUR script for one subject. Watch for errors."
        />

        <p>
          You should see <code className="code-inline">Generating timing files for sub-LEARN958</code>{' '}
          and then <code className="code-inline">All subjects complete.</code> If the script
          finishes without errors, immediately check the output:
        </p>

        <TryCommand
          command="ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Enriched/sub-LEARN958/*.1D | wc -l"
          execute={true}
          description="Count .1D files. Expect ~100+ for a 4-run subject (23 concatenated + per-run files)."
        />

        {/* ── COMMON ERRORS ───────────────────────────────── */}
        <h2>If Something Went Wrong</h2>

        <div className="my-4 space-y-4 text-sm">
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <div className="text-[var(--color-accent-bright)] font-bold">Permission denied</div>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Run with <code className="code-inline">bash my_timing.sh</code> (which we do above),
              or add permissions: <code className="code-inline">chmod +x my_timing.sh</code>
            </p>
          </div>

          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <div className="text-[var(--color-accent-bright)] font-bold">Syntax error near unexpected token</div>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Usually a missing quote, missing backslash, or invisible characters from copy-paste.
              Open the script in nano and check the line number from the error message.
            </p>
          </div>

          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <div className="text-[var(--color-accent-bright)] font-bold">All files are empty (all stars)</div>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              The events.tsv files weren&rsquo;t found. Check that{' '}
              <code className="code-inline">BIDS_DIR</code> points to{' '}
              <code className="code-inline">events_enriched/</code>:
            </p>
            <TryCommand
              command="ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/events_enriched/sub-LEARN958/func/"
              execute={true}
              description="Verify enriched events.tsv files exist."
            />
          </div>

          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <div className="text-[var(--color-accent-bright)] font-bold">Script finishes instantly</div>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              The subject list is empty or the path is wrong. Check:
            </p>
            <TryCommand
              command="wc -l /data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt"
              execute={true}
              description="Should show 38 subjects."
            />
          </div>
        </div>

        <Callout variant="tip">
          Re-running is safe. The script cleans old files before writing new ones. Fix the bug,
          re-run, check again.
        </Callout>

        {/* ── VERIFY: 5 CHECKS ────────────────────────────── */}
        <h2 className="mt-12">Verify Your Output</h2>
        <p>
          Timing errors are <strong>silent killers</strong> &mdash; AFNI will happily run the
          GLM on bad timing files and produce output that looks perfectly normal. The only way
          to catch problems is to actively verify. Here are five checks:
        </p>

        <h3>Check 1: File count</h3>
        <p>
          A 4-run subject should have ~100+ .1D files (23 concatenated + 32 padded feedback
          per-run + intermediate per-run files for other conditions).
        </p>

        <TryCommand
          command={`for subj in LEARN001 LEARN002 LEARN958; do
  echo -n "sub-$subj: "
  ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Enriched/sub-$subj/*.1D 2>/dev/null | wc -l
done`}
          execute={true}
          description="Count .1D files for three subjects. Similar counts = good sign."
        />

        <h3>Check 2: File format</h3>
        <p>
          Every padded per-run file should have exactly 4 lines. The run number in the filename
          tells you which line has data:
        </p>

        <TryCommand
          command="cat -n /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Enriched/sub-LEARN958/NonPM_Mean60_fdkm_run1.1D"
          execute={true}
          description="Run-1 file: data on line 1, stars on lines 2-4."
        />

        <TryCommand
          command="cat -n /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Enriched/sub-LEARN958/NonPM_Mean60_fdkm_run3.1D"
          execute={true}
          description="Run-3 file: data on line 3, stars on lines 1, 2, and 4."
        />

        <h3>Check 3: Cross-reference against events.tsv</h3>
        <p>
          Pick an onset from a .1D file and trace it back to the events.tsv to confirm it matches:
        </p>

        <TryCommand
          command="cat /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Enriched/sub-LEARN958/NonPM_Mean60_fdkm.1D"
          execute={true}
          description="View the concatenated file — note an onset from line 1 (run 1)."
        />

        <TryCommand
          command={`grep Mean_60_fdkm /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Enriched/sub-LEARN958/sub-LEARN958_task-learn_run-01_events.tsv`}
          execute={true}
          description="Find all Mean_60_fdkm events in run 1. Onsets should match the .1D file."
        />

        <h3>Check 4: Prediction enrichment worked</h3>
        <p>
          Verify that prediction files have data (not all stars):
        </p>

        <TryCommand
          command="cat /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Enriched/sub-LEARN958/Mean60_pred_nice.1D"
          execute={true}
          description="Should show onset:duration pairs — not just stars."
        />

        <TryCommand
          command="cat /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Enriched/sub-LEARN958/Mean60_pred_mean.1D"
          execute={true}
          description="The other choice for the same peer. Both should have data."
        />

        <h3>Check 5: Padding alignment</h3>
        <p>
          For the same condition, check that all 4 run files have data on the correct line:
        </p>

        <TryCommand
          command={`echo "=== run1 ===" && cat -n /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Enriched/sub-LEARN958/NonPM_Nice60_fdkn_run1.1D && echo "=== run2 ===" && cat -n /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Enriched/sub-LEARN958/NonPM_Nice60_fdkn_run2.1D && echo "=== run3 ===" && cat -n /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Enriched/sub-LEARN958/NonPM_Nice60_fdkn_run3.1D && echo "=== run4 ===" && cat -n /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Enriched/sub-LEARN958/NonPM_Nice60_fdkn_run4.1D`}
          execute={true}
          description="Data should appear on the line matching the run number."
        />

        {/* ── WHAT CORRECT LOOKS LIKE ─────────────────────── */}
        <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <div className="text-[var(--color-accent-bright)] font-bold mb-3">What &ldquo;correct&rdquo; looks like</div>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>File count:</strong> ~100+ .1D files per 4-run subject</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Row count:</strong> exactly 4 lines in every padded per-run .1D file</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Onsets:</strong> positive numbers, typically 0&ndash;360 seconds</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Stars:</strong> <code className="code-inline">*</code> (not blank) for missing conditions</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Alignment:</strong> data on the line matching the run number</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Cross-ref:</strong> onsets match the enriched events.tsv source</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span><strong>Predictions:</strong> _nice and _mean files both have data (not all stars)</span>
            </div>
          </div>
        </div>

        {/* ── RUN ALL SUBJECTS ────────────────────────────── */}
        <h2>Run for All Subjects</h2>
        <p>
          Once the single-subject test passes all checks, run for everyone:
        </p>

        <TryCommand
          command={`SUBJ_LIST_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt \\
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/my_timing.sh`}
          description="Run for all 38 subjects. Takes a few minutes."
        />

        <p>
          You&rsquo;ll see a status line for each subject. Warnings about missing run-04 files
          are expected for subjects with fewer than 4 runs. When it finishes, spot-check 2&ndash;3
          more subjects with the same checks above.
        </p>

        {/* ── WHAT'S NEXT ─────────────────────────────────── */}
        <Callout variant="learn">
          <strong>You&rsquo;re done with timing files.</strong> The .1D files are the direct
          input to the GLM. They tell AFNI exactly when each condition happened and how long it
          lasted. In the next section, you&rsquo;ll build the script that feeds these timing files
          into AFNI to produce beta maps &mdash; the raw material for RSA.
        </Callout>
      </div>
    </div>
  )
}
