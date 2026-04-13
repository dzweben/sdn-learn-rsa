/**
 * Timing Labs — Module 2: Build the Script
 * One flowing walkthrough that builds the timing generation script from scratch.
 * Reads from events_enriched/ (enriched events with prediction choices).
 * Covers: feedback, anticipation, nuisance, then challenges Nyx on prediction + response.
 */

import Callout from '@src/components/Callout'
import CreateFile from '@src/components/CreateFile'
import InsertCode from '@src/components/InsertCode'
import PeekScript from '@src/components/PeekScript'
import TryCommand from '@src/components/TryCommand'

export default function TimingBuildScript(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Timing Labs
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 2 of 3</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Build the Script
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          You&rsquo;re going to write a complete Bash script that reads the enriched events files
          and produces .1D timing files for every subject. We&rsquo;ll build it in five parts.
        </p>
      </div>

      <div className="prose-container">
        {/* ── ROADMAP ────────────────────────────────────────── */}
        <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <div className="text-[var(--color-accent-bright)] font-bold mb-3">Roadmap</div>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-bright)] font-mono font-bold shrink-0">1.</span>
              <span><strong>The skeleton</strong> &mdash; shebang, paths, subject loop, copy events</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-bright)] font-mono font-bold shrink-0">2.</span>
              <span><strong>Extract feedback events</strong> &mdash; the awk pattern for all 8 feedback conditions</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-bright)] font-mono font-bold shrink-0">3.</span>
              <span><strong>Anticipation + nuisance</strong> &mdash; ISI, no_pred, no_resp</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-bright)] font-mono font-bold shrink-0">4.</span>
              <span><strong>Challenge: prediction + response</strong> &mdash; you add the remaining 12 conditions</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[var(--color-accent-bright)] font-mono font-bold shrink-0">5.</span>
              <span><strong>Pad &amp; close</strong> &mdash; pad per-run files to 4 rows, close the loop</span>
            </div>
          </div>
        </div>

        <p>
          First, peek at the finished production script so you can see where we&rsquo;re headed.
          Don&rsquo;t try to understand it all now &mdash; we&rsquo;ll build your own version
          piece by piece.
        </p>

        <PeekScript
          script="2_generate_timing.sh"
          label="Preview: the production script (for reference)"
        />

        <p>
          Open a blank file in the editor. This is <strong>your</strong> script.
        </p>

        <CreateFile
          filename="my_timing.sh"
          language="shell"
          description="Opens a blank Bash script in the editor."
        />

        {/* ════════════════════════════════════════════════════════
            PART 1: THE SKELETON
            ════════════════════════════════════════════════════════ */}
        <h2 className="mt-12">Part 1: The Skeleton</h2>
        <p>
          Every script needs three things before it does real work: tell the system what
          language it&rsquo;s written in, define the paths it operates on, and loop over subjects.
        </p>

        <InsertCode language="bash" description="Part 1 — shebang, paths, and subject loop">
{`#!/bin/bash
# my_timing.sh — Generate .1D timing files from enriched BIDS events

SUBJ_LIST="\${SUBJ_LIST_OVERRIDE:-/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt}"
TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
BIDS_DIR="\${BIDS_DIR_OVERRIDE:-$TOPDIR/RSA-learn/events_enriched}"
TIMING_ROOT="\${TIMING_ROOT_OVERRIDE:-$TOPDIR/RSA-learn/TimingFiles/Enriched}"

for subj in \`cat \${SUBJ_LIST}\`; do
    echo "Generating timing files for sub-\${subj}"

    mkdir -p "\${TIMING_ROOT}/sub-\${subj}"
    rm -f "\${TIMING_ROOT}/sub-\${subj}/sub-\${subj}_task-learn_run-0"*_events.tsv

    cp "\${BIDS_DIR}/sub-\${subj}/func/sub-\${subj}_task-learn_run-01_events.tsv" "\${TIMING_ROOT}/sub-\${subj}/"
    cp "\${BIDS_DIR}/sub-\${subj}/func/sub-\${subj}_task-learn_run-02_events.tsv" "\${TIMING_ROOT}/sub-\${subj}/"
    cp "\${BIDS_DIR}/sub-\${subj}/func/sub-\${subj}_task-learn_run-03_events.tsv" "\${TIMING_ROOT}/sub-\${subj}/"
    cp "\${BIDS_DIR}/sub-\${subj}/func/sub-\${subj}_task-learn_run-04_events.tsv" "\${TIMING_ROOT}/sub-\${subj}/"

    cd "\${TIMING_ROOT}/sub-\${subj}/"`}
        </InsertCode>

        <h3>Line by line</h3>
        <div className="my-4 space-y-4 text-sm">
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">#!/bin/bash</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              The <strong>shebang</strong>. Must be the very first line. It tells the OS to use the
              Bash shell to run this script.
            </p>
          </div>

          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'BIDS_DIR="${BIDS_DIR_OVERRIDE:-$TOPDIR/RSA-learn/events_enriched}"'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Points to <strong>events_enriched/</strong> &mdash; the enriched events with
              prediction choices and fixed nopred labels. The{' '}
              <code className="code-inline">{'${VAR:-default}'}</code> syntax means: use the
              environment variable if set, otherwise use the default path.
            </p>
          </div>

          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'for subj in `cat ${SUBJ_LIST}`; do'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              A <strong>for loop</strong>. The backticks run{' '}
              <code className="code-inline">cat</code> and return its output. The loop runs once
              per subject ID (like <code className="code-inline">LEARN001</code>,{' '}
              <code className="code-inline">LEARN958</code>, etc.).
            </p>
          </div>

          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'cp "${BIDS_DIR}/sub-${subj}/func/..." "${TIMING_ROOT}/sub-${subj}/"'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Copy enriched events.tsv files into the timing output folder so everything is
              self-contained. The script will read from these local copies.
            </p>
          </div>
        </div>

        <TryCommand
          command="head -1 /data/projects/STUDIES/LEARN/fMRI/RSA-learn/events_enriched/sub-LEARN958/func/sub-LEARN958_task-learn_run-01_events.tsv"
          execute={true}
          description="Check the header of an enriched events file. You'll reference column positions."
        />

        {/* ════════════════════════════════════════════════════════
            PART 2: EXTRACT FEEDBACK EVENTS
            ════════════════════════════════════════════════════════ */}
        <h2 className="mt-12">Part 2: Extract Feedback Events with awk</h2>
        <p>
          The core pattern is always the same: use <code className="code-inline">awk</code> to
          scan each row of the events file, check if column 3 (the event label) matches our
          condition, and if so, print <code className="code-inline">onset:duration</code>.
        </p>
        <p>
          Here&rsquo;s one condition &mdash; Mean-60% feedback mean &mdash; for all four runs:
        </p>

        <InsertCode language="bash" description="Part 2 — first feedback condition (Mean60 fdkm)">
{`    # ── Feedback: Mean_60 feedback mean ──
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkm_run4.1D
    rm -f NonPM_Mean60_fdkm.1D
    for f in NonPM_Mean60_fdkm_run1.1D NonPM_Mean60_fdkm_run2.1D NonPM_Mean60_fdkm_run3.1D NonPM_Mean60_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Mean60_fdkm.1D; done`}
        </InsertCode>

        <h3>Line by line</h3>
        <div className="my-4 space-y-4 text-sm">
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'cat events.tsv | awk \'{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}\''}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              <code className="code-inline">cat</code> reads the file and pipes it to{' '}
              <code className="code-inline">awk</code>. Awk processes each line:{' '}
              <code className="code-inline">$3</code> is the 3rd column (event label),{' '}
              <code className="code-inline">$1</code> is onset, <code className="code-inline">$2</code> is
              duration. If the event matches, it prints <code className="code-inline">onset:duration </code>{' '}
              (space-separated, all on one line).
            </p>
          </div>

          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'> NonPM_Mean60_fdkm_run1.1D'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              The <code className="code-inline">&gt;</code> redirects output to a file, creating it
              or overwriting it. Each run gets its own file.
            </p>
          </div>

          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'for f in ...run1.1D ...run4.1D; do (cat $f; echo \'\') >> concat.1D; done'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Concatenates all 4 run files into one multi-run file. The{' '}
              <code className="code-inline">echo &apos;&apos;</code> adds a newline after each run
              (AFNI needs each run on its own line). The{' '}
              <code className="code-inline">&gt;&gt;</code> appends instead of overwriting.
            </p>
          </div>
        </div>

        <Callout variant="tip">
          Notice the BIDS inconsistency: the event label is{' '}
          <code className="code-inline">Mean_60_fdkm</code> (with underscore between Mean and 60),
          but we name the output file <code className="code-inline">NonPM_Mean60_fdkm</code> (no
          underscore). The awk pattern must match the exact event label in the TSV.
        </Callout>

        <p>
          Now repeat this exact pattern for the other 7 feedback conditions. Each block is
          identical except for the event name and output filename:
        </p>

        {/* Condition mapping table */}
        <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <div className="text-[var(--color-accent-bright)] font-bold mb-3">
            All 8 Feedback Conditions
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono text-[var(--color-text-secondary)]">
            <div className="font-bold text-[var(--color-text-muted)]">Event in TSV</div>
            <div className="font-bold text-[var(--color-text-muted)]">Output filename</div>
            <div>Mean_60_fdkm</div><div>NonPM_Mean60_fdkm</div>
            <div>Mean_60_fdkn</div><div>NonPM_Mean60_fdkn</div>
            <div>Mean80_fdkm</div><div>NonPM_Mean80_fdkm</div>
            <div>Mean80_fdkn</div><div>NonPM_Mean80_fdkn</div>
            <div>Nice_60_fdkm</div><div>NonPM_Nice60_fdkm</div>
            <div>Nice_60_fdkn</div><div>NonPM_Nice60_fdkn</div>
            <div>Nice80_fdkm</div><div>NonPM_Nice80_fdkm</div>
            <div>Nice80_fdkn</div><div>NonPM_Nice80_fdkn</div>
          </div>
        </div>

        <InsertCode language="bash" description="Part 2 continued — remaining 7 feedback conditions">
{`    # ── Feedback: Mean_60 feedback nice ──
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean60_fdkn_run4.1D
    rm -f NonPM_Mean60_fdkn.1D
    for f in NonPM_Mean60_fdkn_run1.1D NonPM_Mean60_fdkn_run2.1D NonPM_Mean60_fdkn_run3.1D NonPM_Mean60_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Mean60_fdkn.1D; done

    # ── Feedback: Mean80 feedback mean ──
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkm_run4.1D
    rm -f NonPM_Mean80_fdkm.1D
    for f in NonPM_Mean80_fdkm_run1.1D NonPM_Mean80_fdkm_run2.1D NonPM_Mean80_fdkm_run3.1D NonPM_Mean80_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Mean80_fdkm.1D; done

    # ── Feedback: Mean80 feedback nice ──
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Mean80_fdkn_run4.1D
    rm -f NonPM_Mean80_fdkn.1D
    for f in NonPM_Mean80_fdkn_run1.1D NonPM_Mean80_fdkn_run2.1D NonPM_Mean80_fdkn_run3.1D NonPM_Mean80_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Mean80_fdkn.1D; done

    # ── Feedback: Nice_60 feedback mean ──
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkm_run4.1D
    rm -f NonPM_Nice60_fdkm.1D
    for f in NonPM_Nice60_fdkm_run1.1D NonPM_Nice60_fdkm_run2.1D NonPM_Nice60_fdkm_run3.1D NonPM_Nice60_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Nice60_fdkm.1D; done

    # ── Feedback: Nice_60 feedback nice ──
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice60_fdkn_run4.1D
    rm -f NonPM_Nice60_fdkn.1D
    for f in NonPM_Nice60_fdkn_run1.1D NonPM_Nice60_fdkn_run2.1D NonPM_Nice60_fdkn_run3.1D NonPM_Nice60_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Nice60_fdkn.1D; done

    # ── Feedback: Nice80 feedback mean ──
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_fdkm") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkm_run4.1D
    rm -f NonPM_Nice80_fdkm.1D
    for f in NonPM_Nice80_fdkm_run1.1D NonPM_Nice80_fdkm_run2.1D NonPM_Nice80_fdkm_run3.1D NonPM_Nice80_fdkm_run4.1D; do (cat $f; echo '') >> NonPM_Nice80_fdkm.1D; done

    # ── Feedback: Nice80 feedback nice ──
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_fdkn") {printf "%s:%s ", $1, $2}}' > NonPM_Nice80_fdkn_run4.1D
    rm -f NonPM_Nice80_fdkn.1D
    for f in NonPM_Nice80_fdkn_run1.1D NonPM_Nice80_fdkn_run2.1D NonPM_Nice80_fdkn_run3.1D NonPM_Nice80_fdkn_run4.1D; do (cat $f; echo '') >> NonPM_Nice80_fdkn.1D; done`}
        </InsertCode>

        <p>
          That&rsquo;s all 8 feedback conditions. Each one follows the exact same pattern &mdash;
          the only things that change are the event name in the awk condition and the output
          filename. Let&rsquo;s verify one condition works:
        </p>

        <TryCommand
          command={`cat /data/projects/STUDIES/LEARN/fMRI/RSA-learn/events_enriched/sub-LEARN958/func/sub-LEARN958_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_fdkm") {printf "%s:%s ", $1, $2}}'`}
          execute={true}
          description="Test the awk pattern on one file. Should output onset:duration pairs."
        />

        {/* ════════════════════════════════════════════════════════
            PART 3: ANTICIPATION + NUISANCE
            ════════════════════════════════════════════════════════ */}
        <h2 className="mt-12">Part 3: Anticipation + Nuisance</h2>
        <p>
          Three more conditions use the same awk pattern but only need multi-run concatenated
          files (no per-run padding needed for these):
        </p>

        <div className="my-4 rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4 text-sm">
          <div className="space-y-2 text-[var(--color-text-secondary)]">
            <div>
              <strong className="text-[var(--color-accent-bright)]">isi</strong> &rarr;{' '}
              <code className="code-inline">Anticipation_pred_fdk.1D</code> &mdash; the waiting
              period between prediction and feedback
            </div>
            <div>
              <strong className="text-[var(--color-accent-bright)]">no_pred</strong> &rarr;{' '}
              <code className="code-inline">NoPred.1D</code> &mdash; trials where the subject
              missed the prediction window
            </div>
            <div>
              <strong className="text-[var(--color-accent-bright)]">no_resp</strong> &rarr;{' '}
              <code className="code-inline">NoResp.1D</code> &mdash; trials where the subject
              missed the response window
            </div>
          </div>
        </div>

        <InsertCode language="bash" description="Part 3 — anticipation and nuisance regressors">
{`    # ── Anticipation: prediction → feedback interval ──
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="isi") {printf "%s:%s ", $1, $2}}' > Anticipation_pred_fdk_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="isi") {printf "%s:%s ", $1, $2}}' > Anticipation_pred_fdk_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="isi") {printf "%s:%s ", $1, $2}}' > Anticipation_pred_fdk_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="isi") {printf "%s:%s ", $1, $2}}' > Anticipation_pred_fdk_run4.1D
    rm -f Anticipation_pred_fdk.1D
    for f in Anticipation_pred_fdk_run1.1D Anticipation_pred_fdk_run2.1D Anticipation_pred_fdk_run3.1D Anticipation_pred_fdk_run4.1D; do (cat $f; echo '') >> Anticipation_pred_fdk.1D; done

    # ── Nuisance: missed predictions ──
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="no_pred") {printf "%s:%s ", $1, $2}}' > NoPred_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="no_pred") {printf "%s:%s ", $1, $2}}' > NoPred_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="no_pred") {printf "%s:%s ", $1, $2}}' > NoPred_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="no_pred") {printf "%s:%s ", $1, $2}}' > NoPred_run4.1D
    rm -f NoPred.1D
    for f in NoPred_run1.1D NoPred_run2.1D NoPred_run3.1D NoPred_run4.1D; do (cat $f; echo '') >> NoPred.1D; done

    # ── Nuisance: missed responses ──
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="no_resp") {printf "%s:%s ", $1, $2}}' > NoResp_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="no_resp") {printf "%s:%s ", $1, $2}}' > NoResp_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="no_resp") {printf "%s:%s ", $1, $2}}' > NoResp_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="no_resp") {printf "%s:%s ", $1, $2}}' > NoResp_run4.1D
    rm -f NoResp.1D
    for f in NoResp_run1.1D NoResp_run2.1D NoResp_run3.1D NoResp_run4.1D; do (cat $f; echo '') >> NoResp.1D; done`}
        </InsertCode>

        <Callout variant="learn">
          <strong>Why nuisance regressors?</strong> When a subject misses a prediction or response,
          visual stimuli still appear on screen and the brain still responds. If we don&rsquo;t
          model these events, their variance contaminates the baseline, making every other beta
          estimate noisier. Explicit nuisance regressors &ldquo;soak up&rdquo; that variance.
        </Callout>

        {/* ════════════════════════════════════════════════════════
            PART 4: CHALLENGE — PREDICTION + RESPONSE
            ════════════════════════════════════════════════════════ */}
        <h2 className="mt-12">Part 4: Your Turn &mdash; Prediction + Response</h2>

        <Callout variant="definition">
          <strong>Challenge:</strong> You now know the awk pattern. Add the remaining 12 conditions
          yourself: 8 prediction-by-choice and 4 response. Use the tables below to know exactly
          what event labels to match and what filenames to use.
        </Callout>

        <h3>8 Prediction-by-Choice Conditions</h3>
        <p>
          Thanks to the enriched events, predictions now include the subject&rsquo;s choice.
          These are multi-run only (no per-run padding needed).
        </p>

        <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono text-[var(--color-text-secondary)]">
            <div className="font-bold text-[var(--color-text-muted)]">Event in TSV</div>
            <div className="font-bold text-[var(--color-text-muted)]">Output filename</div>
            <div>Mean_60_pred_nice</div><div>Mean60_pred_nice</div>
            <div>Mean_60_pred_mean</div><div>Mean60_pred_mean</div>
            <div>Mean80_pred_nice</div><div>Mean80_pred_nice</div>
            <div>Mean80_pred_mean</div><div>Mean80_pred_mean</div>
            <div>Nice_60_pred_nice</div><div>Nice60_pred_nice</div>
            <div>Nice_60_pred_mean</div><div>Nice60_pred_mean</div>
            <div>Nice80_pred_nice</div><div>Nice80_pred_nice</div>
            <div>Nice80_pred_mean</div><div>Nice80_pred_mean</div>
          </div>
        </div>

        <p>
          <strong>What you need to do:</strong> For each of the 8 prediction conditions, write the
          same awk pattern (4 lines for 4 runs + concatenation). The only things that change are
          the event name in the awk condition and the output filename.
        </p>

        <h3>4 Response Conditions</h3>
        <p>
          Responses are per-peer (not split by rating). Also multi-run only.
        </p>

        <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono text-[var(--color-text-secondary)]">
            <div className="font-bold text-[var(--color-text-muted)]">Event in TSV</div>
            <div className="font-bold text-[var(--color-text-muted)]">Output filename</div>
            <div>Mean_60_rsp</div><div>Mean60_rsp</div>
            <div>Mean80_rsp</div><div>Mean80_rsp</div>
            <div>Nice_60_rsp</div><div>Nice60_rsp</div>
            <div>Nice80_rsp</div><div>Nice80_rsp</div>
          </div>
        </div>

        <p>
          Once you&rsquo;ve added all 12 conditions, check the solution below to compare:
        </p>

        {/* Peekable solution */}
        <details className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <summary className="cursor-pointer p-4 text-sm font-bold text-[var(--color-accent-bright)] hover:text-[var(--color-accent)] transition-colors">
            Reveal solution: Prediction + Response extraction
          </summary>
          <div className="px-4 pb-4">
            <pre className="code-block text-xs overflow-x-auto"><code>{`    # ── Prediction-by-choice (8 conditions, multi-run) ──
    # Mean60 predictions
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_pred_nice") {printf "%s:%s ", $1, $2}}' > Mean60_pred_nice_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_pred_nice") {printf "%s:%s ", $1, $2}}' > Mean60_pred_nice_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_pred_nice") {printf "%s:%s ", $1, $2}}' > Mean60_pred_nice_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_pred_nice") {printf "%s:%s ", $1, $2}}' > Mean60_pred_nice_run4.1D
    rm -f Mean60_pred_nice.1D
    for f in Mean60_pred_nice_run1.1D Mean60_pred_nice_run2.1D Mean60_pred_nice_run3.1D Mean60_pred_nice_run4.1D; do (cat $f; echo '') >> Mean60_pred_nice.1D; done

    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_pred_mean") {printf "%s:%s ", $1, $2}}' > Mean60_pred_mean_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_pred_mean") {printf "%s:%s ", $1, $2}}' > Mean60_pred_mean_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_pred_mean") {printf "%s:%s ", $1, $2}}' > Mean60_pred_mean_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_pred_mean") {printf "%s:%s ", $1, $2}}' > Mean60_pred_mean_run4.1D
    rm -f Mean60_pred_mean.1D
    for f in Mean60_pred_mean_run1.1D Mean60_pred_mean_run2.1D Mean60_pred_mean_run3.1D Mean60_pred_mean_run4.1D; do (cat $f; echo '') >> Mean60_pred_mean.1D; done

    # Mean80 predictions
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_pred_nice") {printf "%s:%s ", $1, $2}}' > Mean80_pred_nice_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_pred_nice") {printf "%s:%s ", $1, $2}}' > Mean80_pred_nice_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_pred_nice") {printf "%s:%s ", $1, $2}}' > Mean80_pred_nice_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_pred_nice") {printf "%s:%s ", $1, $2}}' > Mean80_pred_nice_run4.1D
    rm -f Mean80_pred_nice.1D
    for f in Mean80_pred_nice_run1.1D Mean80_pred_nice_run2.1D Mean80_pred_nice_run3.1D Mean80_pred_nice_run4.1D; do (cat $f; echo '') >> Mean80_pred_nice.1D; done

    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_pred_mean") {printf "%s:%s ", $1, $2}}' > Mean80_pred_mean_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_pred_mean") {printf "%s:%s ", $1, $2}}' > Mean80_pred_mean_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_pred_mean") {printf "%s:%s ", $1, $2}}' > Mean80_pred_mean_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_pred_mean") {printf "%s:%s ", $1, $2}}' > Mean80_pred_mean_run4.1D
    rm -f Mean80_pred_mean.1D
    for f in Mean80_pred_mean_run1.1D Mean80_pred_mean_run2.1D Mean80_pred_mean_run3.1D Mean80_pred_mean_run4.1D; do (cat $f; echo '') >> Mean80_pred_mean.1D; done

    # Nice60 predictions
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_pred_nice") {printf "%s:%s ", $1, $2}}' > Nice60_pred_nice_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_pred_nice") {printf "%s:%s ", $1, $2}}' > Nice60_pred_nice_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_pred_nice") {printf "%s:%s ", $1, $2}}' > Nice60_pred_nice_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_pred_nice") {printf "%s:%s ", $1, $2}}' > Nice60_pred_nice_run4.1D
    rm -f Nice60_pred_nice.1D
    for f in Nice60_pred_nice_run1.1D Nice60_pred_nice_run2.1D Nice60_pred_nice_run3.1D Nice60_pred_nice_run4.1D; do (cat $f; echo '') >> Nice60_pred_nice.1D; done

    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_pred_mean") {printf "%s:%s ", $1, $2}}' > Nice60_pred_mean_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_pred_mean") {printf "%s:%s ", $1, $2}}' > Nice60_pred_mean_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_pred_mean") {printf "%s:%s ", $1, $2}}' > Nice60_pred_mean_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_pred_mean") {printf "%s:%s ", $1, $2}}' > Nice60_pred_mean_run4.1D
    rm -f Nice60_pred_mean.1D
    for f in Nice60_pred_mean_run1.1D Nice60_pred_mean_run2.1D Nice60_pred_mean_run3.1D Nice60_pred_mean_run4.1D; do (cat $f; echo '') >> Nice60_pred_mean.1D; done

    # Nice80 predictions
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_pred_nice") {printf "%s:%s ", $1, $2}}' > Nice80_pred_nice_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_pred_nice") {printf "%s:%s ", $1, $2}}' > Nice80_pred_nice_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_pred_nice") {printf "%s:%s ", $1, $2}}' > Nice80_pred_nice_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_pred_nice") {printf "%s:%s ", $1, $2}}' > Nice80_pred_nice_run4.1D
    rm -f Nice80_pred_nice.1D
    for f in Nice80_pred_nice_run1.1D Nice80_pred_nice_run2.1D Nice80_pred_nice_run3.1D Nice80_pred_nice_run4.1D; do (cat $f; echo '') >> Nice80_pred_nice.1D; done

    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_pred_mean") {printf "%s:%s ", $1, $2}}' > Nice80_pred_mean_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_pred_mean") {printf "%s:%s ", $1, $2}}' > Nice80_pred_mean_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_pred_mean") {printf "%s:%s ", $1, $2}}' > Nice80_pred_mean_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_pred_mean") {printf "%s:%s ", $1, $2}}' > Nice80_pred_mean_run4.1D
    rm -f Nice80_pred_mean.1D
    for f in Nice80_pred_mean_run1.1D Nice80_pred_mean_run2.1D Nice80_pred_mean_run3.1D Nice80_pred_mean_run4.1D; do (cat $f; echo '') >> Nice80_pred_mean.1D; done

    # ── Response per peer (4 conditions, multi-run) ──
    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean_60_rsp") {printf "%s:%s ", $1, $2}}' > Mean60_rsp_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean_60_rsp") {printf "%s:%s ", $1, $2}}' > Mean60_rsp_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean_60_rsp") {printf "%s:%s ", $1, $2}}' > Mean60_rsp_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean_60_rsp") {printf "%s:%s ", $1, $2}}' > Mean60_rsp_run4.1D
    rm -f Mean60_rsp.1D
    for f in Mean60_rsp_run1.1D Mean60_rsp_run2.1D Mean60_rsp_run3.1D Mean60_rsp_run4.1D; do (cat $f; echo '') >> Mean60_rsp.1D; done

    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Mean80_rsp") {printf "%s:%s ", $1, $2}}' > Mean80_rsp_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Mean80_rsp") {printf "%s:%s ", $1, $2}}' > Mean80_rsp_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Mean80_rsp") {printf "%s:%s ", $1, $2}}' > Mean80_rsp_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Mean80_rsp") {printf "%s:%s ", $1, $2}}' > Mean80_rsp_run4.1D
    rm -f Mean80_rsp.1D
    for f in Mean80_rsp_run1.1D Mean80_rsp_run2.1D Mean80_rsp_run3.1D Mean80_rsp_run4.1D; do (cat $f; echo '') >> Mean80_rsp.1D; done

    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice_60_rsp") {printf "%s:%s ", $1, $2}}' > Nice60_rsp_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice_60_rsp") {printf "%s:%s ", $1, $2}}' > Nice60_rsp_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice_60_rsp") {printf "%s:%s ", $1, $2}}' > Nice60_rsp_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice_60_rsp") {printf "%s:%s ", $1, $2}}' > Nice60_rsp_run4.1D
    rm -f Nice60_rsp.1D
    for f in Nice60_rsp_run1.1D Nice60_rsp_run2.1D Nice60_rsp_run3.1D Nice60_rsp_run4.1D; do (cat $f; echo '') >> Nice60_rsp.1D; done

    cat sub-\${subj}_task-learn_run-01_events.tsv | awk '{if ($3=="Nice80_rsp") {printf "%s:%s ", $1, $2}}' > Nice80_rsp_run1.1D
    cat sub-\${subj}_task-learn_run-02_events.tsv | awk '{if ($3=="Nice80_rsp") {printf "%s:%s ", $1, $2}}' > Nice80_rsp_run2.1D
    cat sub-\${subj}_task-learn_run-03_events.tsv | awk '{if ($3=="Nice80_rsp") {printf "%s:%s ", $1, $2}}' > Nice80_rsp_run3.1D
    cat sub-\${subj}_task-learn_run-04_events.tsv | awk '{if ($3=="Nice80_rsp") {printf "%s:%s ", $1, $2}}' > Nice80_rsp_run4.1D
    rm -f Nice80_rsp.1D
    for f in Nice80_rsp_run1.1D Nice80_rsp_run2.1D Nice80_rsp_run3.1D Nice80_rsp_run4.1D; do (cat $f; echo '') >> Nice80_rsp.1D; done`}</code></pre>
          </div>
        </details>

        {/* ════════════════════════════════════════════════════════
            PART 5: PAD & CLOSE
            ════════════════════════════════════════════════════════ */}
        <h2 className="mt-12">Part 5: Pad &amp; Close</h2>
        <p>
          AFNI needs per-run files to have exactly 4 lines (one per run). Right now each per-run
          file has only 1 line of data. We need to pad it with{' '}
          <code className="code-inline">*</code> lines so the data lands on the correct line number.
        </p>

        <InsertCode language="bash" description="Part 5 — pad per-run files to 4 rows and close the loop">
{`    # ── Pad per-run files to 4 rows ──
    for f in NonPM_*_run*.1D Anticipation_*_run*.1D; do
        [ -e "$f" ] || continue
        run=$(echo "$f" | sed -E 's/.*_run([1-4])\\.1D/\\1/')
        line=$(tr -d '\\n' < "$f")
        if [ -z "$line" ]; then
            line="*"
        fi
        case "$run" in
            1) printf "%s\\n*\\n*\\n*\\n" "$line" > "$f" ;;
            2) printf "*\\n%s\\n*\\n*\\n" "$line" > "$f" ;;
            3) printf "*\\n*\\n%s\\n*\\n" "$line" > "$f" ;;
            4) printf "*\\n*\\n*\\n%s\\n" "$line" > "$f" ;;
        esac
    done

done

echo "All subjects complete."`}
        </InsertCode>

        <h3>Line by line</h3>
        <div className="my-4 space-y-4 text-sm">
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'for f in NonPM_*_run*.1D Anticipation_*_run*.1D; do'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Loops over all per-run files that need padding. The glob{' '}
              <code className="code-inline">NonPM_*_run*.1D</code> matches all feedback per-run
              files; <code className="code-inline">Anticipation_*_run*.1D</code> matches the
              anticipation per-run files.
            </p>
          </div>

          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'run=$(echo "$f" | sed -E \'s/.*_run([1-4])\\.1D/\\1/\')'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Extracts the run number from the filename. For{' '}
              <code className="code-inline">NonPM_Mean60_fdkm_run3.1D</code>, this returns{' '}
              <code className="code-inline">3</code>.
            </p>
          </div>

          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'case "$run" in 1) ... 2) ... esac'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              A <strong>case statement</strong> &mdash; Bash&rsquo;s version of switch/case. If the
              file is for run 2, it writes: <code className="code-inline">*</code> (line 1),
              data (line 2), <code className="code-inline">*</code> (line 3),{' '}
              <code className="code-inline">*</code> (line 4). This ensures the data lands on the
              line matching its run number.
            </p>
          </div>

          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">done</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              The outer <code className="code-inline">done</code> closes the subject loop. Every
              subject gets processed, then the script prints &ldquo;All subjects complete.&rdquo;
            </p>
          </div>
        </div>

        <Callout variant="tip">
          Notice that prediction, response, and nuisance per-run files are NOT padded &mdash;
          they&rsquo;re intermediate files used only for concatenation. The glob pattern
          deliberately excludes them. Only the feedback and anticipation per-run files get padded
          because those are the ones AFNI reads directly as separate regressors.
        </Callout>

        {/* ── SUMMARY ─────────────────────────────────────── */}
        <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <div className="text-[var(--color-accent-bright)] font-bold mb-3">What your script produces per subject</div>
          <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent-bright)] font-bold shrink-0">8</span>
              <span>concatenated feedback .1D files (multi-run)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent-bright)] font-bold shrink-0">32</span>
              <span>padded per-run feedback .1D files (8 conditions &times; 4 runs)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent-bright)] font-bold shrink-0">8</span>
              <span>prediction-by-choice .1D files (multi-run)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent-bright)] font-bold shrink-0">4</span>
              <span>response .1D files (multi-run)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent-bright)] font-bold shrink-0">1</span>
              <span>anticipation .1D file (multi-run)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent-bright)] font-bold shrink-0">2</span>
              <span>nuisance .1D files (multi-run)</span>
            </div>
          </div>
        </div>

        <Callout variant="learn">
          <strong>Your script is complete.</strong> In the next module, you&rsquo;ll run it on the
          server, debug any errors, and verify the output with five specific checks.
        </Callout>
      </div>
    </div>
  )
}
