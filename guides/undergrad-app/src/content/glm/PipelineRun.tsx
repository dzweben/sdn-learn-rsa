/**
 * GLM Labs — Module 10: Lab: Run & Audit the Full Pipeline
 * Execute everything. Audit. Troubleshoot.
 */

import Callout from '@src/components/Callout'
import TryCommand from '@src/components/TryCommand'

export default function PipelineRun(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            GLM Labs
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Lab 10 of 10</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Lab: Run &amp; Audit the Full Pipeline
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Execute the orchestrator for all subjects. Monitor, troubleshoot, and audit the output
          to verify everything worked.
        </p>
      </div>

      <div className="prose-container">
        <h2>Prerequisites</h2>
        <ul>
          <li>Stage 1 complete (fixed events.tsv in bids_fixed/)</li>
          <li>Stage 2 complete (timing files in TimingFiles/Fixed2/)</li>
          <li>SSWarper anatomy available for all subjects</li>
          <li>Your three scripts on the server (proc template, fallback patch, orchestrator)</li>
          <li>tmux or screen session (this will take hours)</li>
        </ul>

        <Callout variant="warning">
          <strong>Disk space:</strong> The GLM generates 100&ndash;200 GB of output for 38
          subjects. Check available space before starting:{' '}
          <code className="code-inline">df -h /data/projects/</code>
        </Callout>

        <h2>Step 1: Dry Run (Generate Scripts Only)</h2>
        <p>
          First, generate proc scripts without running GLMs. This lets you inspect and verify
          before committing to hours of computation:
        </p>

        <TryCommand
          command="MAKE_PROC=1 CLEAN_OUT=0 RUN_GLM=0 bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/3_run_glm.sh"
          description="Dry run — generate proc scripts only. Check output for errors."
        />

        <p>
          Verify that proc scripts were generated for all subjects:
        </p>

        <TryCommand
          command={`ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/*/proc.*.LEARN_RSA_runwise_AFNI | wc -l`}
          execute={true}
          description="Count proc scripts. Should match your subject count."
        />

        <h2>Step 2: Start the Full Run</h2>
        <p>
          Open a tmux session and run the full pipeline:
        </p>

        <TryCommand
          command="tmux new -s glm"
          description="Create a tmux session that survives SSH disconnection."
        />

        <TryCommand
          command="MAX_JOBS=4 bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/3_run_glm.sh"
          description="Run everything with 4 parallel subjects. Adjust MAX_JOBS based on server resources."
        />

        <h2>Step 3: Monitor Progress</h2>

        <TryCommand
          command={`ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/*/output.proc.* 2>/dev/null | wc -l`}
          execute={true}
          description="Count subjects that have started (output files created)."
        />

        <TryCommand
          command={`ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/*/*results*/stats.*+tlrc.HEAD 2>/dev/null | wc -l`}
          execute={true}
          description="Count subjects that have finished (stats files exist)."
        />

        <h2>Step 4: Audit the Output</h2>
        <p>
          After all subjects finish, run the audit script:
        </p>

        <TryCommand
          command="bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/audit_server.sh"
          execute={true}
          description="Run the audit script. It checks required paths, timing files, and output integrity."
        />

        <h3>Manual Audit Checks</h3>

        <TryCommand
          command={`for subj_dir in /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/*/; do
  subj=$(basename "$subj_dir")
  stats="$subj_dir/$subj.results.LEARN_RSA_runwise_AFNI/stats.$subj.LEARN_RSA_runwise_AFNI+tlrc.HEAD"
  if [ ! -f "$stats" ]; then
    echo "MISSING: sub-$subj"
  fi
done`}
          execute={true}
          description="Check for subjects missing stats files — these failed or did not run."
        />

        <TryCommand
          command={`grep -l "FATAL" /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/*/output.proc.* 2>/dev/null`}
          execute={true}
          description="Search for FATAL errors in any subject's output log."
        />

        <h2>Common Failure Modes</h2>

        <div className="my-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 px-3 text-[var(--color-text-muted)] font-medium">Symptom</th>
                <th className="text-left py-2 px-3 text-[var(--color-text-muted)] font-medium">Likely Cause</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              <tr className="border-b border-[var(--color-border-dim)]">
                <td className="py-2 px-3">No stats file</td>
                <td className="py-2 px-3">Script crashed &mdash; check output.proc log for errors</td>
              </tr>
              <tr className="border-b border-[var(--color-border-dim)]">
                <td className="py-2 px-3">Collinearity warning</td>
                <td className="py-2 px-3">Too many censored TRs or nearly identical regressors</td>
              </tr>
              <tr className="border-b border-[var(--color-border-dim)]">
                <td className="py-2 px-3">Alignment failure</td>
                <td className="py-2 px-3">Poor EPI-anatomy alignment &mdash; check QC images</td>
              </tr>
              <tr className="border-b border-[var(--color-border-dim)]">
                <td className="py-2 px-3">&gt;30% TRs censored</td>
                <td className="py-2 px-3">Excessive motion &mdash; may need to exclude subject</td>
              </tr>
              <tr className="border-b border-[var(--color-border-dim)]">
                <td className="py-2 px-3">Wrong sub-brick count</td>
                <td className="py-2 px-3">Regressor/GLT mismatch between template and timing files</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="exercise" title="Full Pipeline Audit">
          <p>After the pipeline finishes for all subjects:</p>
          <ol className="mt-2 list-decimal list-inside space-y-1">
            <li>Run the audit script</li>
            <li>Check for missing stats files</li>
            <li>Scan logs for FATAL errors</li>
            <li>Verify sub-brick count for 2&ndash;3 subjects</li>
            <li>Inspect the QC HTML report for at least 2 subjects</li>
          </ol>
          <p className="mt-2">
            If all checks pass, your beta maps are ready for RSA. You built the entire pipeline
            from scratch &mdash; from events.tsv to beta maps.
          </p>
        </Callout>

        <h2>What You Built</h2>
        <p>
          Across these 10 labs, you wrote the complete GLM pipeline:
        </p>
        <ul>
          <li>
            <strong>Proc template</strong> (afni_proc.py call with 8 blocks, 41 regressors,
            45 GLTs, no smoothing)
          </li>
          <li>
            <strong>Fallback patch</strong> (Python script to adjust for 2&ndash;3 run subjects)
          </li>
          <li>
            <strong>Orchestrator</strong> (subject discovery, parallel execution, phase control)
          </li>
        </ul>
        <p>
          Combined with your timing script from the Timing Labs, you now own the entire
          pipeline from raw events to beta maps. The next section covers what comes after: using
          those beta maps for RSA.
        </p>
      </div>
    </div>
  )
}
