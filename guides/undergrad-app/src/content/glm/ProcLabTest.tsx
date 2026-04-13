/**
 * GLM Labs — Module 7: Lab: Test on One Subject
 * Run proc on one subject. Examine the generated script. Run the GLM. Check output.
 */

import Callout from '@src/components/Callout'
import TryCommand from '@src/components/TryCommand'

export default function ProcLabTest(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            GLM Labs
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Lab 7 of 10</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Lab: Test on One Subject
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Run your proc template on a single subject. Examine the generated script. Execute
          the GLM. Verify the output before scaling to all subjects.
        </p>
      </div>

      <div className="prose-container">
        <h2>Step 1: Get Your Template to the Server</h2>
        <p>
          Copy your <code className="code-inline">my_proc_template.sh</code> to the server
          (or paste it via nano/vim). Then:
        </p>

        <TryCommand
          command="cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses"
          description="Navigate to the GLM output directory on the server."
        />

        <h2>Step 2: Generate the Proc Script</h2>
        <p>
          Run your template with one subject. This calls afni_proc.py, which generates a
          subject-specific processing script:
        </p>

        <TryCommand
          command="tcsh /data/projects/STUDIES/LEARN/fMRI/RSA-learn/my_proc_template.sh"
          description="Generate the proc script. This runs afni_proc.py, NOT the actual GLM."
        />

        <p>
          If afni_proc.py runs successfully, you will see output about the generated script
          and no errors. Check that the proc script was created:
        </p>

        <TryCommand
          command="ls -la /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/958/proc.958.LEARN_RSA_runwise_AFNI"
          execute={true}
          description="Verify the proc script exists. It should be ~1000+ lines."
        />

        <h2>Step 3: Examine the Generated Script</h2>
        <p>
          The generated script is worth looking at. It is the complete preprocessing + GLM
          pipeline for one subject, fully expanded from your template:
        </p>

        <TryCommand
          command="wc -l /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/958/proc.958.LEARN_RSA_runwise_AFNI"
          execute={true}
          description="Count lines — should be 1000+ lines."
        />

        <TryCommand
          command="head -50 /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/958/proc.958.LEARN_RSA_runwise_AFNI"
          execute={true}
          description="See the beginning of the generated script — header, paths, setup."
        />

        <Callout variant="learn">
          This generated script is what AFNI actually runs. Your template is just a way to
          configure afni_proc.py. Understanding the generated script helps you debug problems
          and understand what each processing block actually does under the hood.
        </Callout>

        <h2>Step 4: Run the GLM</h2>
        <p>
          Now execute the generated script. This runs all preprocessing blocks and the GLM.
          It takes <strong>15&ndash;45 minutes</strong> per subject depending on server load:
        </p>

        <TryCommand
          command={`cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/958 && \\
tcsh -xef proc.958.LEARN_RSA_runwise_AFNI 2>&1 | tee output.proc.958`}
          description="Run the GLM for one subject. Output is saved to output.proc.958 and displayed live."
        />

        <Callout variant="tip">
          Use <code className="code-inline">tmux</code> or{' '}
          <code className="code-inline">screen</code> before running so the job survives if
          your SSH connection drops. Run{' '}
          <code className="code-inline">tmux new -s glm</code> first, then the command.
          Detach with <code className="code-inline">Ctrl-b d</code>, reconnect with{' '}
          <code className="code-inline">tmux attach -t glm</code>.
        </Callout>

        <h2>Step 5: Verify the Output</h2>
        <p>
          After the script finishes, check that the output directory exists and contains the
          key files:
        </p>

        <TryCommand
          command="ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/958/958.results.LEARN_RSA_runwise_AFNI/"
          execute={true}
          description="List the output directory. Should contain stats, errts, anat_final, mask files."
        />

        <TryCommand
          command="3dinfo -label /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/958/958.results.LEARN_RSA_runwise_AFNI/stats.958.LEARN_RSA_runwise_AFNI+tlrc | head -20"
          execute={true}
          description="List the first 20 sub-brick labels in the stats file."
        />

        <p>
          You should see labels like{' '}
          <code className="code-inline">FBM.Mean60.r1#0_Coef</code> and{' '}
          <code className="code-inline">FBM.Mean60.r1#0_Tstat</code>. For a 4-run subject, the
          stats file has 173 sub-bricks: (41 regressors + 45 GLTs) &times; 2 (coef + tstat) + 1
          (full F).
        </p>

        <Callout variant="exercise" title="Verify Your Output">
          <p>After the GLM finishes for one subject:</p>
          <ul className="mt-2 list-disc list-inside">
            <li>Count sub-bricks in the stats file (should be 173 for 4 runs)</li>
            <li>Check that the beta labels match your stim_labels</li>
            <li>Verify the cbucket file exists (betas only, no t-stats)</li>
            <li>Look at the HTML QC report for alignment and motion issues</li>
          </ul>
        </Callout>
      </div>
    </div>
  )
}
