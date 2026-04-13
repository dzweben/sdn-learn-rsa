/**
 * BIDS Data — Module 6: Why This Matters
 */

import Callout from '@src/components/Callout'

export default function WhyThisMatters(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Your Data
          </span>
          <span className="text-[var(--color-text-dim)]">·</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 6 of 6</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Why This Matters
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Connecting everything you have learned to the pipeline ahead — and why understanding
          your data deeply is the most valuable skill you can build.
        </p>
      </div>

      <div className="prose-container">
        <h2>What You Now Know</h2>
        <p>
          Take a moment to appreciate how much ground you have covered. You now understand:
        </p>
        <ul>
          <li>
            <strong>BIDS</strong> — the organizational standard that makes our data navigable,
            shareable, and reproducible. You can find any subject's functional data, anatomy,
            or events file by following the predictable folder structure.
          </li>
          <li>
            <strong>The LEARN task</strong> — what participants actually did in the scanner.
            Four peers, two dimensions (valence and predictability), a trial structure that
            generates predictions and feedback. A controlled social learning experiment.
          </li>
          <li>
            <strong>The 8 feedback conditions</strong> — how every feedback event falls into
            one of 8 bins based on valence, predictability, and feedback type. You can decode any
            condition name (like <code className="code-inline">Nice80_fdkn</code>) on sight.
          </li>
          <li>
            <strong>Events files</strong> — the column-by-column structure of these TSV files,
            how to trace a trial, and why the onset and duration columns are the raw material
            for everything downstream.
          </li>
          <li>
            <strong>The 38 subjects</strong> — variable run counts, non-sequential IDs,
            clinical anxiety measures, and why individual differences are the whole point.
          </li>
        </ul>
        <p>
          This is a strong foundation. Everything that follows in the pipeline builds directly
          on these concepts.
        </p>

        <h2>The Key Realization</h2>
        <p>
          Here is the most important insight from this module: <strong>the events files contain
          all the raw information about WHEN things happened during the experiment</strong>.
          Every prediction, every feedback event, every response — timestamped to the second.
        </p>
        <p>
          But to analyze brain activity, we cannot just point the GLM at the events file and
          say "figure it out." We need to transform this information into a format that the
          GLM can use. Specifically, we need to answer questions like:
        </p>
        <ul>
          <li>
            When did <code className="code-inline">Mean60_fdkm</code> events happen in run 1
            of subject 958? At exactly which seconds?
          </li>
          <li>
            When did <code className="code-inline">Nice80_fdkn</code> events happen in run 3?
          </li>
          <li>
            When did prediction (anticipation) events happen for each peer in each run?
          </li>
        </ul>
        <p>
          These are exactly the questions that <strong>timing files</strong> answer. And creating
          those timing files from the events data is the next step in the pipeline.
        </p>

        <h2>The Pipeline Flow</h2>
        <p>
          Here is the full picture of how data flows through our pipeline, from raw behavioral
          logs to the RSA analysis:
        </p>
        <div className="my-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent-bright)] text-sm font-bold shrink-0">
                1
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Events Files (BIDS)
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Raw behavioral logs with onsets, durations, and condition labels for every
                  event in every run.
                </p>
              </div>
            </div>
            <div className="ml-4 border-l-2 border-dashed border-[var(--color-border)] h-4" />
            <div className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent-bright)] text-sm font-bold shrink-0">
                2
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Timing Files
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  One file per condition per run — extracted onset times in AFNI's .1D format.
                  This is what the GLM reads.
                </p>
              </div>
            </div>
            <div className="ml-4 border-l-2 border-dashed border-[var(--color-border)] h-4" />
            <div className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent-bright)] text-sm font-bold shrink-0">
                3
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  GLM (General Linear Model)
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  AFNI models brain activity using the timing information, producing a beta
                  coefficient for each condition at every voxel.
                </p>
              </div>
            </div>
            <div className="ml-4 border-l-2 border-dashed border-[var(--color-border)] h-4" />
            <div className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent-bright)] text-sm font-bold shrink-0">
                4
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Beta Maps
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Whole-brain images showing the estimated response for each condition — one
                  beta map per condition per run.
                </p>
              </div>
            </div>
            <div className="ml-4 border-l-2 border-dashed border-[var(--color-border)] h-4" />
            <div className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent-bright)] text-sm font-bold shrink-0">
                5
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  RSA (Representational Similarity Analysis)
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Compare patterns across the 8 beta maps to reveal how the brain organizes
                  social feedback representations — and how this relates to anxiety.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Callout variant="learn">
          <p>
            Each step in the pipeline transforms the data into a form that the next step needs:
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              <strong>Events files → Timing files:</strong> Extract condition-specific onset
              times from the full behavioral log.
            </li>
            <li>
              <strong>Timing files → GLM:</strong> Tell AFNI when each condition happened so it
              can model the brain's response.
            </li>
            <li>
              <strong>GLM → Beta maps:</strong> Estimate the average neural pattern for each
              condition.
            </li>
            <li>
              <strong>Beta maps → RSA:</strong> Compare patterns to reveal the brain's
              representational geometry.
            </li>
          </ul>
          <p className="mt-2">
            No step can work without the one before it. And every step traces back to the events
            files you just learned to read.
          </p>
        </Callout>

        <h2>What Comes Next: Timing Files</h2>
        <p>
          The next module will take you inside the timing files — Stage 2 of our pipeline. You
          will see how the script reads events files for each subject, finds all feedback events
          matching each of the 8 conditions, extracts their onset times and durations, and
          writes them out in AFNI's <code className="code-inline">.1D</code> format.
        </p>
        <p>
          You will also learn about the anticipation regressors — how we model the prediction
          phase of each trial separately from the feedback phase, which is critical for cleanly
          isolating the brain's response to feedback outcomes.
        </p>
        <p>
          The timing files module will feel natural because you already understand the events
          files that feed into it. You know what the 8 conditions are, you know what onsets and
          durations mean, and you understand why we need to extract this information. The next
          step just makes it concrete.
        </p>

        <Callout variant="tip">
          Understanding events files deeply makes everything downstream easier. If you ever
          feel confused by a timing file, a GLM output, or an RSA result, come back to the
          events file. Ask yourself: what events were there? When did they happen? How were they
          categorized? The answers are always in the events file — it is your ground truth for
          the entire analysis.
        </Callout>

        <h2>A Note on Your Progress</h2>
        <p>
          You have just completed the first section of this tutorial — understanding the data
          that feeds our pipeline. This is the foundation everything else rests on. Many
          researchers rush past the data to get to the "exciting" analysis parts, but the truth
          is: <strong>the researchers who understand their data most deeply produce the best
          science</strong>.
        </p>
        <p>
          You can now look at a BIDS directory and understand its structure. You can open an
          events file and trace a participant's experience trial by trial. You know what the
          8 conditions represent and why they matter for RSA. You know about the 38 subjects,
          their variable run counts, and the clinical measures that make this study meaningful.
        </p>
        <p>
          That knowledge is not just background — it is the lens through which everything in
          the pipeline will make sense. You are ready for what comes next.
        </p>

        <h2>Key Takeaways</h2>
        <ul>
          <li>
            Events files contain all the raw temporal information the pipeline needs — every
            subsequent step extracts from and builds on them.
          </li>
          <li>
            The pipeline flow is: Events → Timing Files → GLM → Beta Maps → RSA.
          </li>
          <li>
            Each transformation prepares the data for the next step in a chain that ultimately
            reveals how the brain represents social feedback.
          </li>
          <li>
            Timing files (the next module) extract condition-specific onset times from the
            events files for the GLM.
          </li>
          <li>
            Understanding your data deeply is the single most valuable skill in neuroimaging
            research.
          </li>
        </ul>
      </div>
    </div>
  )
}
