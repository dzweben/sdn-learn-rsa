/**
 * GLM Labs — Module 1: GLM in 5 Minutes
 * Brief: Y=Xβ+ε, HRF, betas, run-wise design. Just enough to start coding.
 */

import Callout from '@src/components/Callout'

export default function GlmConcepts(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            GLM Labs
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Lab 1 of 10</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          GLM in 5 Minutes
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Just enough theory to write the code. The General Linear Model turns your timing files
          and fMRI data into beta maps &mdash; the numbers RSA analyzes.
        </p>
      </div>

      <div className="prose-container">
        <h2>The Equation</h2>
        <pre className="code-block"><code>Y = X * β + ε</code></pre>
        <ul>
          <li>
            <strong>Y</strong> = the fMRI signal at one voxel over time (a column of brain
            activity measurements)
          </li>
          <li>
            <strong>X</strong> = the design matrix &mdash; what we <em>think</em> the signal
            should look like based on task events. Each column is one regressor (condition).
          </li>
          <li>
            <strong>β</strong> = beta weights &mdash; how much each regressor contributes to
            the actual signal. <strong>This is what we want.</strong>
          </li>
          <li>
            <strong>ε</strong> = noise (everything the model cannot explain)
          </li>
        </ul>
        <p>
          AFNI solves for β at every voxel in the brain. The result is a <strong>beta map</strong>
          &mdash; a 3D brain image where each voxel&rsquo;s value is that condition&rsquo;s beta
          weight.
        </p>

        <h2>The HRF: Why Timing Needs Convolution</h2>
        <p>
          The brain&rsquo;s response to an event is not instant. Blood flow changes (what fMRI
          measures) peak about 5&ndash;6 seconds <em>after</em> the event. The hemodynamic
          response function (HRF) describes this shape. AFNI convolves your timing onsets with
          the HRF to build each column of X.
        </p>
        <p>
          We use <code className="code-inline">dmBLOCK(0)</code> as our basis function because
          our events have variable durations. It generates an HRF whose amplitude and width
          scale with the event duration &mdash; a 3-second feedback produces a different predicted
          response than a 1.5-second one.
        </p>

        <h2>41 Regressors: Our Design</h2>
        <p>
          Our GLM has <strong>41 regressors</strong> (task-related columns in X):
        </p>
        <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-bright)] font-bold shrink-0 w-6 text-right">32</span>
              <span className="text-[var(--color-text-secondary)]">
                Run-wise feedback regressors (8 conditions &times; 4 runs). Each gets its own
                beta so RSA can compare patterns run by run.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-bright)] font-bold shrink-0 w-6 text-right">8</span>
              <span className="text-[var(--color-text-secondary)]">
                Prediction + response regressors (4 pred + 4 rsp, collapsed across runs).
                Nuisance &mdash; we model them to keep their variance out of feedback.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-bright)] font-bold shrink-0 w-6 text-right">1</span>
              <span className="text-[var(--color-text-secondary)]">
                Anticipation regressor (collapsed across runs and peers). Soaks up ISI variance.
              </span>
            </div>
          </div>
        </div>
        <p>
          AFNI automatically adds nuisance regressors for motion (6 parameters per run),
          baseline drift (polynomial regressors per run), and censoring of high-motion TRs.
        </p>

        <Callout variant="learn">
          <strong>Why run-wise?</strong> RSA compares <em>patterns</em> of betas across
          conditions. Having independent betas for each run gives us 4 independent measurements
          of each condition, which we need for cross-validated RDMs. If we collapsed runs, we
          would have only 8 beta maps total &mdash; not enough for robust RSA.
        </Callout>

        <h2>No Smoothing</h2>
        <p>
          Standard fMRI analyses smooth the data (blur it spatially) to increase signal-to-noise.
          We deliberately skip this. RSA relies on fine-grained spatial <em>patterns</em> of
          activity. Smoothing blurs those patterns, destroying exactly what we want to measure.
        </p>

        <h2>Beta Maps &rarr; RSA</h2>
        <p>
          After the GLM runs, you get 41 beta maps per subject (one per regressor). The 32
          feedback betas (8 conditions &times; 4 runs) are what we feed into RSA. For each
          brain region, we extract the pattern of beta values, compute similarity between all
          pairs of conditions, and build a representational dissimilarity matrix (RDM).
        </p>

        <Callout variant="definition">
          <strong>The pipeline so far:</strong> events.tsv &rarr; .1D timing files (you built
          this!) &rarr; design matrix (X) &rarr; GLM (solve for β) &rarr; beta maps &rarr; RSA.
          You are about to build the GLM step.
        </Callout>

        <h2>What You&rsquo;re Building Next</h2>
        <p>
          You will write <strong>three scripts</strong>:
        </p>
        <ol>
          <li>
            <code className="code-inline">3a_afni_proc_template.sh</code> &mdash; the afni_proc.py
            call that defines all processing and GLM parameters
          </li>
          <li>
            <code className="code-inline">3b_fallback_patch.py</code> &mdash; adjusts the template
            for subjects with fewer than 4 runs
          </li>
          <li>
            <code className="code-inline">3_run_glm.sh</code> &mdash; orchestrates everything
            across all subjects in parallel
          </li>
        </ol>
      </div>
    </div>
  )
}
