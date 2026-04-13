/**
 * BIDS Data — Module 8: Lab: Enrich the Events
 * Walk through running enrich_events.py and inspecting the output.
 */

import Callout from '@src/components/Callout'
import TryCommand from '@src/components/TryCommand'

export default function EnrichEventsLab(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Your Data
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 8 of 8</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Lab: Enrich the Events
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Run the enrichment script, then inspect the output to verify it worked.
        </p>
      </div>

      <div className="prose-container">
        {/* ── INSPECT THE SCRIPT ──────────────────────────── */}
        <h2>Look at the Script</h2>
        <p>
          Before running anything, let&rsquo;s see what the enrichment script expects:
        </p>

        <TryCommand
          command="head -15 /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/enrich_events.py"
          execute={true}
          description="Read the docstring. Note the four required arguments."
        />

        <p>
          The script takes four arguments:
        </p>
        <ul>
          <li><code className="code-inline">--bids-dir</code> &mdash; where the raw events.tsv files live</li>
          <li><code className="code-inline">--behavioral</code> &mdash; path to learn_behavioral.csv</li>
          <li><code className="code-inline">--out-dir</code> &mdash; where to write enriched events</li>
          <li><code className="code-inline">--report</code> &mdash; path for the audit report</li>
        </ul>

        {/* ── RUN IT ──────────────────────────────────────── */}
        <h2>Run the Enrichment</h2>

        <TryCommand
          command={`python3 /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/enrich_events.py \\
  --bids-dir /data/projects/STUDIES/LEARN/fMRI/bids \\
  --behavioral /data/projects/STUDIES/LEARN/fMRI/RSA-learn/analysis/learn_behavioral.csv \\
  --out-dir /data/projects/STUDIES/LEARN/fMRI/RSA-learn/events_enriched \\
  --report /data/projects/STUDIES/LEARN/fMRI/RSA-learn/events_enriched/enrichment_report.tsv`}
          description="Run the enrichment. Watch the summary stats at the end."
        />

        <p>
          The script will print a summary showing how many events were fixed, enriched, or left
          unchanged. It should take under a minute for all 38 subjects.
        </p>

        {/* ── VERIFY: COMPARE RAW VS ENRICHED ─────────────── */}
        <h2>Verify: Compare Raw vs Enriched</h2>
        <p>
          Let&rsquo;s pick one subject and compare the raw and enriched events side by side.
        </p>

        <h3>Check 1: Prediction events got choice labels</h3>
        <TryCommand
          command={`grep "_pred" /data/projects/STUDIES/LEARN/fMRI/bids/sub-LEARN958/func/sub-LEARN958_task-learn_run-01_events.tsv | head -5`}
          execute={true}
          description="Raw events: prediction events have no choice info."
        />

        <TryCommand
          command={`grep "_pred" /data/projects/STUDIES/LEARN/fMRI/RSA-learn/events_enriched/sub-LEARN958/func/sub-LEARN958_task-learn_run-01_events.tsv | head -5`}
          execute={true}
          description="Enriched: predictions now end in _nice or _mean."
        />

        <h3>Check 2: nopred_fdbk events got relabeled</h3>
        <TryCommand
          command={`grep "nopred_fdbk" /data/projects/STUDIES/LEARN/fMRI/bids/sub-LEARN958/func/sub-LEARN958_task-learn_run-01_events.tsv | wc -l`}
          execute={true}
          description="Raw: count nopred_fdbk events (should be > 0 for most subjects)."
        />

        <TryCommand
          command={`grep "nopred_fdbk" /data/projects/STUDIES/LEARN/fMRI/RSA-learn/events_enriched/sub-LEARN958/func/sub-LEARN958_task-learn_run-01_events.tsv | wc -l`}
          execute={true}
          description="Enriched: should be 0 — all nopred_fdbk events have been relabeled."
        />

        <h3>Check 3: The audit report</h3>
        <TryCommand
          command={`head -20 /data/projects/STUDIES/LEARN/fMRI/RSA-learn/events_enriched/enrichment_report.tsv`}
          execute={true}
          description="Every change is logged. Check that actions look correct."
        />

        <h3>Check 4: File structure matches BIDS</h3>
        <TryCommand
          command="ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/events_enriched/sub-LEARN958/func/"
          execute={true}
          description="Same files as raw BIDS — one events.tsv per run."
        />

        {/* ── WHAT CORRECT LOOKS LIKE ─────────────────────── */}
        <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <div className="text-[var(--color-accent-bright)] font-bold mb-3">What &ldquo;correct&rdquo; looks like</div>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span>All prediction events end in <code className="code-inline">_nice</code> or <code className="code-inline">_mean</code> (except when Prediction=NA)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span>Zero <code className="code-inline">nopred_fdbk</code> events remain (or very few unresolved)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span>Feedback, response, isi, no_pred, no_resp events are unchanged</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span>Same file count and structure as raw BIDS</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 shrink-0">&#10003;</span>
              <span>Audit report shows every change with subject, run, trial, old label, new label</span>
            </div>
          </div>
        </div>

        <Callout variant="learn">
          <strong>You now have ground-truth event files.</strong> The enriched events in{' '}
          <code className="code-inline">events_enriched/</code> are what all downstream steps will
          read from. Next up: building the timing file script that converts these events into
          AFNI&rsquo;s .1D format.
        </Callout>
      </div>
    </div>
  )
}
