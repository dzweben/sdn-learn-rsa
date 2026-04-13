/**
 * Timing Labs — Module 1: What We're Building
 * Overview of .1D files, naming, multi-run format, anticipation, and the full
 * condition set (feedback, prediction-by-choice, response, anticipation, nuisance).
 * Reads from events_enriched/ (output of enrich_events.py).
 */

import Callout from '@src/components/Callout'
import TryCommand from '@src/components/TryCommand'

export default function TimingOverview(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Timing Labs
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 1 of 3</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          What We&rsquo;re Building
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Before you write a single line of code, let&rsquo;s see the target output. By the end
          of these labs, you will have built a script that produces all of this from scratch.
        </p>
      </div>

      <div className="prose-container">
        <Callout variant="learn">
          <strong>The big picture:</strong> We need to tell AFNI <em>when</em> each experimental
          event happened and <em>how long</em> it lasted. AFNI does not read events.tsv directly
          &mdash; it needs its own format called <code className="code-inline">.1D</code>. Your
          job is to write the script that performs this translation.
        </Callout>

        <Callout variant="tip">
          <strong>Source data:</strong> Your script will read from{' '}
          <code className="code-inline">events_enriched/</code> &mdash; the enriched events
          you created in the previous lab. These already have prediction choices (_nice/_mean)
          and fixed nopred_fdbk labels.
        </Callout>

        <h2>The Target: .1D Timing Files</h2>
        <p>
          A <code className="code-inline">.1D</code> file is just a plain text file with{' '}
          <strong>onset:duration</strong> pairs. Here is what a real one looks like:
        </p>
        <pre className="code-block"><code>{`12.5:3.0 25.1:3.0 44.8:3.0 67.2:3.0
8.9:3.0 31.4:3.0
*
22.3:3.0 55.7:3.0 78.1:3.0`}</code></pre>
        <p>
          Four lines = four runs. Each <code className="code-inline">onset:duration</code> pair
          says &ldquo;at 12.5 seconds, an event lasted 3.0 seconds.&rdquo; The{' '}
          <code className="code-inline">*</code> means &ldquo;no events of this type in that
          run.&rdquo;
        </p>

        <h2>One File Per Condition Per Subject</h2>
        <p>
          The enriched LEARN task has <strong>23 condition types</strong> that we need to extract.
          For each subject, we produce one .1D file per condition. Here is the complete list:
        </p>

        {/* Compact condition table */}
        <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-[var(--color-accent-bright)] font-bold mb-2">
                8 Feedback Conditions (per-run)
              </div>
              <div className="font-mono text-xs text-[var(--color-text-secondary)] space-y-0.5">
                <div>NonPM_Mean60_fdkm.1D &nbsp;<span className="text-[var(--color-text-dim)]"># Mean-60% feedback mean</span></div>
                <div>NonPM_Mean60_fdkn.1D &nbsp;<span className="text-[var(--color-text-dim)]"># Mean-60% feedback nice</span></div>
                <div>NonPM_Mean80_fdkm.1D</div>
                <div>NonPM_Mean80_fdkn.1D</div>
                <div>NonPM_Nice60_fdkm.1D</div>
                <div>NonPM_Nice60_fdkn.1D</div>
                <div>NonPM_Nice80_fdkm.1D</div>
                <div>NonPM_Nice80_fdkn.1D</div>
              </div>
              <p className="text-[10px] text-[var(--color-text-dim)] mt-2">
                + 32 padded per-run files (8 conditions &times; 4 runs)
              </p>
            </div>
            <div>
              <div className="text-[var(--color-accent-bright)] font-bold mb-2">
                8 Prediction-by-Choice (multi-run)
              </div>
              <div className="font-mono text-xs text-[var(--color-text-secondary)] space-y-0.5">
                <div>Mean60_pred_nice.1D &nbsp;<span className="text-[var(--color-text-dim)]"># predicted nice</span></div>
                <div>Mean60_pred_mean.1D &nbsp;<span className="text-[var(--color-text-dim)]"># predicted mean</span></div>
                <div>Mean80_pred_nice.1D</div>
                <div>Mean80_pred_mean.1D</div>
                <div>Nice60_pred_nice.1D</div>
                <div>Nice60_pred_mean.1D</div>
                <div>Nice80_pred_nice.1D</div>
                <div>Nice80_pred_mean.1D</div>
              </div>

              <div className="text-[var(--color-accent-bright)] font-bold mb-2 mt-4">
                4 Response + 1 Anticipation + 2 Nuisance
              </div>
              <div className="font-mono text-xs text-[var(--color-text-secondary)] space-y-0.5">
                <div>Mean60_rsp.1D &nbsp;<span className="text-[var(--color-text-dim)]"># response per peer</span></div>
                <div>Mean80_rsp.1D</div>
                <div>Nice60_rsp.1D</div>
                <div>Nice80_rsp.1D</div>
                <div className="mt-1">Anticipation_pred_fdk.1D &nbsp;<span className="text-[var(--color-text-dim)]"># ISI</span></div>
                <div className="mt-1">NoPred.1D &nbsp;<span className="text-[var(--color-text-dim)]"># missed prediction</span></div>
                <div>NoResp.1D &nbsp;<span className="text-[var(--color-text-dim)]"># missed response</span></div>
              </div>
            </div>
          </div>
        </div>

        <Callout variant="definition">
          <strong>Why 23?</strong> 8 feedback + 8 prediction-by-choice + 4 response + 1
          anticipation + 2 nuisance = 23 condition types. The feedback conditions also get
          per-run padded files (32 more files), but those are the same 8 conditions split by run.
        </Callout>

        <h2>Naming Conventions</h2>
        <p>A few things to know about the names:</p>
        <ul>
          <li>
            <strong>NonPM_</strong> = Non-Parametric Modulation (onset:duration only, no
            amplitude). Used for feedback conditions.
          </li>
          <li>
            <strong>fdkm</strong> = feedback mean (the peer was mean).{' '}
            <strong>fdkn</strong> = feedback nice (the peer was nice).
          </li>
          <li>
            <strong>Mean60</strong>, <strong>Nice80</strong>, etc. = peer personality + reliability
            level.
          </li>
          <li>
            <strong>_pred_nice</strong>, <strong>_pred_mean</strong> = what the subject predicted.
            These come from the enriched events.
          </li>
          <li>
            <strong>Anticipation_pred_fdk</strong> = the waiting period between prediction and
            feedback. In events.tsv this is labeled <code className="code-inline">isi</code>.
          </li>
          <li>
            <strong>NoPred</strong>, <strong>NoResp</strong> = nuisance regressors for trials
            where the subject missed a prediction or response.
          </li>
        </ul>

        <Callout variant="tip">
          The BIDS events.tsv files have an inconsistency:{' '}
          <code className="code-inline">Mean_60_fdkm</code> (with underscore) vs{' '}
          <code className="code-inline">Mean80_fdkm</code> (no underscore). Our output files
          always standardize to no underscore:{' '}
          <code className="code-inline">Mean60</code>,{' '}
          <code className="code-inline">Nice60</code>. Your script will handle this.
        </Callout>

        <h2>Multi-Run Format &amp; Padding</h2>
        <p>
          AFNI determines which run an event belongs to by its <strong>line number</strong>. Line
          1 = run 1, line 2 = run 2, etc. If a condition had no events in a run, that line
          must be <code className="code-inline">*</code> (not blank &mdash; blank would shift
          everything and silently assign events to wrong runs).
        </p>
        <p>
          Your script will produce per-run files first, then pad them to 4 rows. A padded run-1
          file looks like:
        </p>
        <pre className="code-block"><code>{`12.5:3.0 25.1:3.0 44.8:3.0   ← run 1 data
*                              ← no events in run 2
*                              ← no events in run 3
*                              ← no events in run 4`}</code></pre>

        <h2>Per-Run vs Multi-Run Files</h2>
        <p>
          Not every condition needs per-run files. Here&rsquo;s the rule:
        </p>
        <div className="my-4 rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4 text-sm">
          <div className="space-y-2 text-[var(--color-text-secondary)]">
            <div>
              <strong className="text-[var(--color-accent-bright)]">Feedback (8):</strong>{' '}
              Per-run padded files + concatenated multi-run files. We need per-run betas for RSA.
            </div>
            <div>
              <strong className="text-[var(--color-accent-bright)]">Everything else (15):</strong>{' '}
              Multi-run concatenated files only. Prediction and response have too few trials
              per run to estimate stable per-run betas, so we collapse across runs.
            </div>
          </div>
        </div>

        <h2>Why Model Anticipation?</h2>
        <p>
          The waiting period between prediction and feedback is neurally active &mdash; the brain
          is processing uncertainty, and this is especially relevant for anxiety research. If we
          do not model it explicitly, anticipation variance bleeds into our <strong>feedback
          betas</strong>, contaminating the exact signal we care about for RSA. So we include
          it as a regressor to soak up that variance and keep feedback estimates clean.
        </p>

        <h2>Why Model Nuisance Events?</h2>
        <p>
          When subjects miss a prediction (<code className="code-inline">no_pred</code>) or
          response (<code className="code-inline">no_resp</code>), something still happened on
          screen. If we ignore these events, their variance contaminates the baseline. Modeling
          them as nuisance regressors absorbs that variance so it doesn&rsquo;t leak into our
          conditions of interest.
        </p>

        <h2>See It on the Server</h2>
        <p>
          Let&rsquo;s look at real output so you know what you&rsquo;re building toward.
        </p>

        <TryCommand
          command="ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Enriched/sub-LEARN958/*.1D | head -25"
          execute={true}
          description="List the first 25 .1D files for one subject. See the naming pattern."
        />

        <TryCommand
          command="cat /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Enriched/sub-LEARN958/NonPM_Mean60_fdkm_run1.1D"
          execute={true}
          description="View a real padded per-run file. Data on line 1, stars on lines 2-4."
        />

        <Callout variant="definition">
          <strong>Your goal:</strong> Write a Bash script that reads enriched events.tsv files,
          extracts onset:duration pairs for each of the 23 conditions using awk, and produces
          these .1D files for every subject. You will build it from an empty file, one section at
          a time, over the next two labs.
        </Callout>
      </div>
    </div>
  )
}
