/**
 * BIDS Data — Module 4: Events Files Deep Dive
 */

import Callout from '@src/components/Callout'
import TryCommand from '@src/components/TryCommand'

export default function EventsDeepDive(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Your Data
          </span>
          <span className="text-[var(--color-text-dim)]">·</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 4 of 6</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Events Files Deep Dive
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Open a real events file and understand every column — this is where the pipeline begins.
        </p>
      </div>

      <div className="prose-container">
        <h2>The Most Important File You Will Work With</h2>
        <p>
          Every functional run in our dataset has an events file — a tab-separated text file
          (<code className="code-inline">.tsv</code>) that records every moment of the
          experiment. This file is the ground truth for our analysis. It tells us exactly when
          each prediction, feedback, and response occurred, and it is what our pipeline reads
          to extract timing information for the GLM.
        </p>
        <p>
          Let's open a real events file and walk through it together. We will use{' '}
          <code className="code-inline">sub-958_task-learn_run-01_events.tsv</code> from{' '}
          <code className="code-inline">bids_fixed/sub-958/func/</code>.
        </p>

        <h2>The Columns</h2>
        <p>
          Here are the key columns you will find in every events file:
        </p>
        <ul>
          <li>
            <strong><code className="code-inline">onset</code></strong> — When the event started,
            measured in <strong>seconds from the beginning of the run</strong>. The first event
            might be at 0.0 seconds, the next at 2.0 seconds, and so on. This is the most
            critical column — it tells the GLM exactly when to look in the brain data.
          </li>
          <li>
            <strong><code className="code-inline">duration</code></strong> — How long the event
            lasted, in seconds. A prediction screen might last 2.0 seconds, an ISI (waiting
            period) might last 3.5 seconds. The GLM uses this to model the full window of brain
            activity for each event.
          </li>
          <li>
            <strong><code className="code-inline">event</code></strong> — What type of event
            this is. This is the label that tells us whether this row represents a prediction
            phase, an ISI, a feedback event, or a response. The event labels contain the
            condition information we discussed in Module 3.
          </li>
          <li>
            <strong><code className="code-inline">trial</code></strong> — Which trial number
            this event belongs to within the run. Trial 1 contains a prediction, ISI, feedback,
            and response — all marked with trial number 1. This lets you trace the complete
            sequence of a single interaction.
          </li>
          <li>
            <strong>Peer info columns</strong> — Additional columns indicate which peer was
            involved and their type (e.g., PN, PM, U_N, U_M).
          </li>
          <li>
            <strong>Response columns</strong> — What the participant chose (their prediction and
            rating responses).
          </li>
        </ul>

        <h2>A Real Example: Walking Through Trial 1</h2>
        <p>
          Here is what the first trial looks like in an events file (simplified to show the most
          important columns):
        </p>
        <pre className="code-block"><code>{`onset    duration  event                      trial
0.0      2.0       Prediction_Mean_80_PM      1
2.0      3.5       ISI                        1
5.5      3.0       Mean_80_fdkm               1
8.5      2.0       Response_Mean_80_PM        1
10.5     4.0       ISI                        1
14.5     2.0       Prediction_Nice_80_PN      2
16.5     2.5       ISI                        2
19.0     3.0       Nice_80_fdkm               2
22.0     2.0       Response_Nice_80_PN        2
...`}</code></pre>
        <p>
          Let's trace through trial 1 event by event:
        </p>
        <ol>
          <li>
            <strong>At 0.0 seconds:</strong> The prediction screen appears. The participant
            sees peer PM (the mean-predictable peer) and is asked to predict what feedback
            they will receive. This lasts 2.0 seconds. The event label{' '}
            <code className="code-inline">Prediction_Mean_80_PM</code> tells us exactly which
            peer and type.
          </li>
          <li>
            <strong>At 2.0 seconds:</strong> An inter-stimulus interval (ISI) — a brief waiting
            period of 3.5 seconds. These jittered pauses are essential for fMRI: they let the
            brain's hemodynamic response unfold and allow the GLM to separate responses to
            different events.
          </li>
          <li>
            <strong>At 5.5 seconds:</strong> The feedback is revealed!{' '}
            <code className="code-inline">Mean_80_fdkm</code> tells us this is a{' '}
            <strong>Mean-predictable peer, feedback mean</strong> — PM gave mean feedback,
            exactly as expected from a mean peer. This is the key event for our analysis. It lasts 3.0 seconds.
          </li>
          <li>
            <strong>At 8.5 seconds:</strong> The response phase — the participant rates how
            they feel about this peer. Lasts 2.0 seconds.
          </li>
        </ol>
        <p>
          Then there is another ISI before trial 2 begins at 14.5 seconds with a different peer
          (PN, the nice-predictable peer). You can see how the entire experiment is a continuous
          stream of events, each precisely timestamped.
        </p>

        <h2>Event Types You Will See</h2>
        <p>
          The <code className="code-inline">event</code> column contains several types of labels:
        </p>
        <ul>
          <li>
            <strong><code className="code-inline">Prediction_*</code></strong> — The prediction
            phase. The suffix identifies the peer (e.g.,{' '}
            <code className="code-inline">Prediction_Nice_80_PN</code>). These events are
            modeled as "anticipation" regressors in our GLM.
          </li>
          <li>
            <strong><code className="code-inline">ISI</code></strong> — Inter-stimulus intervals.
            These are not modeled in the GLM (they serve as implicit baseline).
          </li>
          <li>
            <strong><code className="code-inline">{'{Condition}'}</code> feedback labels</strong>{' '}
            — The 8 feedback conditions from Module 3 (e.g.,{' '}
            <code className="code-inline">Mean_80_fdkm</code>,{' '}
            <code className="code-inline">Nice_60_fdkn</code>). These are the critical events
            that our pipeline extracts into timing files.
          </li>
          <li>
            <strong><code className="code-inline">Response_*</code></strong> — The rating phase.
            These are modeled as nuisance regressors (we want to account for motor activity
            without confounding our feedback estimates).
          </li>
        </ul>

        <Callout variant="tip">
          <p>
            Reading events files becomes much easier if you remember that each trial always
            follows the same pattern:{' '}
            <strong>Prediction → ISI (anticipation) → Feedback → Response</strong>. The
            Prediction event represents the participant seeing the peer and making their
            prediction in one combined phase. The ISI is the anticipation period while they
            wait to see if they were right. If you see a{' '}
            <code className="code-inline">Prediction_*</code> row, you know the feedback event
            for that trial is a few rows below it.
          </p>
          <p className="mt-2">
            To view TSV files nicely in the terminal, you can use the{' '}
            <code className="code-inline">column</code> command:
          </p>
          <TryCommand
            command={`column -t -s $'\\t' sub-958_task-learn_run-01_events.tsv | head -20`}
            description="Format the TSV as a clean, readable table"
            execute={true}
          />
          <p className="mt-1">
            This aligns the tab-separated columns into a clean, readable table.
          </p>
        </Callout>

        <h2>Understanding Onset + Duration</h2>
        <p>
          The <code className="code-inline">onset</code> and{' '}
          <code className="code-inline">duration</code> columns together define the{' '}
          <strong>temporal window</strong> of each event. The GLM needs to know not just{' '}
          <em>when</em> something happened, but <em>how long</em> it lasted, because the brain's
          hemodynamic response (the BOLD signal) is sluggish — it takes several seconds to peak
          after a neural event.
        </p>
        <p>
          When our timing file generator (Stage 2) reads the events file, it extracts the onset
          and duration for each feedback event and groups them by condition. For example, it
          collects all the onsets for <code className="code-inline">Mean_80_fdkm</code> events
          in run 1, and writes them to a timing file that AFNI can read. This is the bridge
          from the raw behavioral log to the GLM.
        </p>

        <Callout variant="exercise">
          <p><strong>Explore a real events file:</strong></p>
          <p className="mt-2">
            Open a terminal and try these commands:
          </p>
          <TryCommand
            command="cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed/sub-958/func/"
            description="Navigate to the subject's func directory"
            execute={true}
          />
          <TryCommand
            command={`column -t -s $'\\t' sub-958_task-learn_run-01_events.tsv | head -20`}
            description="View the first 20 rows, nicely formatted"
            execute={true}
          />
          <TryCommand
            command={`awk -F'\\t' 'NR==1 || $4==3' sub-958_task-learn_run-01_events.tsv | column -t -s $'\\t'`}
            description="Trace a complete trial: find all rows for trial 3"
            execute={true}
          />
          <p className="mt-2">
            Walk through the first 10 rows. Can you identify each phase of the first two trials?
            Can you figure out which peer was involved and what feedback was given?
          </p>
        </Callout>

        <Callout variant="exercise">
          <p><strong>Count feedback events by condition:</strong></p>
          <p className="mt-2">
            Try this in the terminal to count how many{' '}
            <code className="code-inline">Mean_60_fdkm</code> events appear across all runs
            for subject 958:
          </p>
          <TryCommand
            command={`grep "Mean_60_fdkm" bids_fixed/sub-958/func/*events.tsv | wc -l`}
            description="Count Mean_60_fdkm events across all runs for sub-958"
            execute={true}
          />
          <p className="mt-2">
            Try the same for <code className="code-inline">Mean_60_fdkn</code>. Which condition
            has more events? Does that make sense given what you know about the 60% match rate?
          </p>
        </Callout>

        <h2>From Events to Timing Files</h2>
        <p>
          The events file contains <em>everything</em> — predictions, ISIs, feedback, responses.
          But for the GLM, we need each condition's timing information in a separate file. That
          is what Stage 2 of our pipeline does: it reads these events files and produces one
          timing file per condition per run, containing just the onset times and durations.
        </p>
        <p>
          Understanding the events file deeply is the best investment you can make in learning
          this pipeline. Every downstream step — timing files, the GLM, beta maps, and
          ultimately RSA — traces back to these rows and columns.
        </p>

        <h2>Key Takeaways</h2>
        <ul>
          <li>
            Events files are tab-separated text files with columns for onset, duration, event
            type, trial number, and more.
          </li>
          <li>
            Each trial follows the pattern: Prediction (see peer + predict) → ISI
            (anticipation) → Feedback → Response.
          </li>
          <li>
            The <code className="code-inline">onset</code> and{' '}
            <code className="code-inline">duration</code> columns define when and how long each
            event lasted — this is what the GLM uses.
          </li>
          <li>
            Feedback events contain the 8 condition labels (e.g.,{' '}
            <code className="code-inline">Mean_80_fdkm</code>) that drive our entire analysis.
          </li>
          <li>
            The <code className="code-inline">bids_fixed/</code> files have clean, consistent
            labels ready for the pipeline.
          </li>
        </ul>
      </div>
    </div>
  )
}
