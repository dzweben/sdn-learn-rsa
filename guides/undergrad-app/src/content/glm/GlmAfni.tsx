/**
 * GLM Labs — Module 2: AFNI & afni_proc.py
 * What AFNI is, what afni_proc.py generates, processing blocks overview.
 */

import Callout from '@src/components/Callout'
import TryCommand from '@src/components/TryCommand'

export default function GlmAfni(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            GLM Labs
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Lab 2 of 10</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          AFNI &amp; afni_proc.py
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          AFNI is the tool that runs the GLM. <code className="code-inline">afni_proc.py</code>{' '}
          is the meta-script you will use to configure it. Here is how the two-step workflow works.
        </p>
      </div>

      <div className="prose-container">
        <h2>AFNI: The Engine</h2>
        <p>
          AFNI (Analysis of Functional NeuroImages) is an open-source fMRI analysis suite from
          NIMH, used in neuroimaging for over 30 years. It provides hundreds of command-line
          programs for preprocessing, GLM estimation, visualization, and statistics.
        </p>
        <p>
          We chose AFNI over alternatives (SPM, FSL) because it gives fine control over the GLM
          &mdash; particularly important for our 41-regressor, run-wise design with 45 contrasts.
        </p>

        <h2>The Two-Step Workflow</h2>
        <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-bright)] font-bold shrink-0 text-lg">1</span>
              <div>
                <strong className="text-[var(--color-text-primary)]">afni_proc.py</strong>
                <span className="text-[var(--color-text-muted)]"> &mdash; you write this</span>
                <p className="text-[var(--color-text-secondary)] mt-1">
                  A Python script that reads your parameters (blocks, regressors, contrasts) and{' '}
                  <em>generates</em> a subject-specific tcsh script. It does not process any data.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-bright)] font-bold shrink-0 text-lg">2</span>
              <div>
                <strong className="text-[var(--color-text-primary)]">proc.SUBJ.LEARN_RSA_runwise_AFNI</strong>
                <span className="text-[var(--color-text-muted)]"> &mdash; AFNI generates this</span>
                <p className="text-[var(--color-text-secondary)] mt-1">
                  A 1,000+ line tcsh script that actually runs all preprocessing steps and the GLM.
                  You run it with <code className="code-inline">tcsh -xef proc.SUBJ...</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Callout variant="learn">
          You never write the processing script directly. You configure{' '}
          <code className="code-inline">afni_proc.py</code> with the right options, and it
          generates the script for you. This is why the template approach works: one set of
          options can generate scripts for every subject, with only the subject ID and file
          paths changing.
        </Callout>

        <h2>The 8 Processing Blocks</h2>
        <p>
          Our pipeline uses 8 processing blocks, specified in order:
        </p>
        <pre className="code-block"><code>-blocks despike tshift align tlrc volreg mask scale regress</code></pre>

        <div className="my-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 px-3 text-[var(--color-text-muted)] font-medium">Block</th>
                <th className="text-left py-2 px-3 text-[var(--color-text-muted)] font-medium">What It Does</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              <tr className="border-b border-[var(--color-border-dim)]">
                <td className="py-2 px-3 font-mono text-xs">despike</td>
                <td className="py-2 px-3">Remove transient signal spikes (hardware artifacts)</td>
              </tr>
              <tr className="border-b border-[var(--color-border-dim)]">
                <td className="py-2 px-3 font-mono text-xs">tshift</td>
                <td className="py-2 px-3">Correct for slice timing differences within each volume</td>
              </tr>
              <tr className="border-b border-[var(--color-border-dim)]">
                <td className="py-2 px-3 font-mono text-xs">align</td>
                <td className="py-2 px-3">Align anatomy to EPI (functional) images</td>
              </tr>
              <tr className="border-b border-[var(--color-border-dim)]">
                <td className="py-2 px-3 font-mono text-xs">tlrc</td>
                <td className="py-2 px-3">Warp to MNI template space (standard coordinates)</td>
              </tr>
              <tr className="border-b border-[var(--color-border-dim)]">
                <td className="py-2 px-3 font-mono text-xs">volreg</td>
                <td className="py-2 px-3">Volume registration &mdash; correct head motion</td>
              </tr>
              <tr className="border-b border-[var(--color-border-dim)]">
                <td className="py-2 px-3 font-mono text-xs">mask</td>
                <td className="py-2 px-3">Create brain mask (exclude non-brain voxels)</td>
              </tr>
              <tr className="border-b border-[var(--color-border-dim)]">
                <td className="py-2 px-3 font-mono text-xs">scale</td>
                <td className="py-2 px-3">Scale to percent signal change (each voxel, mean=100)</td>
              </tr>
              <tr className="border-b border-[var(--color-border-dim)]">
                <td className="py-2 px-3 font-mono text-xs font-bold text-[var(--color-accent-bright)]">regress</td>
                <td className="py-2 px-3 font-bold">Run the GLM &mdash; this is where betas are estimated</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="warning">
          Notice: <strong>no blur block</strong>. Standard AFNI pipelines include a{' '}
          <code className="code-inline">blur</code> block for spatial smoothing. We deliberately
          omit it because RSA needs fine-grained spatial patterns. Smoothing destroys those
          patterns.
        </Callout>

        <h2>Output Structure</h2>
        <p>
          After the GLM runs, each subject gets a results directory:
        </p>
        <pre className="code-block"><code>{`derivatives/afni/IndvlLvlAnalyses/<subj>/
  <subj>.results.LEARN_RSA_runwise_AFNI/
    stats.<subj>.LEARN_RSA_runwise_AFNI+tlrc   ← beta maps live here
    errts.<subj>.LEARN_RSA_runwise_AFNI+tlrc   ← residuals
    anat_final.<subj>+tlrc                      ← warped anatomy
    ...`}</code></pre>
        <p>
          The <code className="code-inline">stats</code> file is a 4D dataset with 173
          sub-bricks for a 4-run subject: coefficient + t-statistic for each of the 41
          regressors and 45 GLTs, plus a full F-statistic.
        </p>

        <TryCommand
          command="ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/"
          execute={true}
          description="See the subject folders in the GLM output directory."
        />

        <h2>What You&rsquo;re About to Build</h2>
        <p>
          Starting in the next lab, you will write the{' '}
          <code className="code-inline">afni_proc.py</code> call from scratch. It is long (~280
          lines) because it configures every detail of the pipeline. You will build it in four
          pieces: setup/locations, processing blocks, the 41 regressors, and the 45 GLTs.
        </p>
      </div>
    </div>
  )
}
