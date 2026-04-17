/**
 * Timing Labs — Module 2: Build the Script
 * Loop-based, short version — reads enriched events with peer-split no_pred
 * and folded-in no_resp, produces 25 regressors via nested loops.
 */

import Callout from '@src/components/Callout'
import CreateFile from '@src/components/CreateFile'
import InsertCode from '@src/components/InsertCode'
import PeekScript from '@src/components/PeekScript'
import TryCommand from '@src/components/TryCommand'

export default function TimingBuildScript(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
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
          Write a Bash script that turns the enriched events into 25 AFNI .1D regressors per
          subject. Four parts, nested loops &mdash; no copy-pasted blocks of awk.
        </p>
      </div>

      <div className="prose-container">
        <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
          <div className="text-[var(--color-accent-bright)] font-bold mb-3">The 25 regressors</div>
          <div className="space-y-1.5 text-sm text-[var(--color-text-secondary)]">
            <div><strong>8</strong> feedback &mdash; <code className="code-inline">NonPM_&lt;Peer&gt;_fdkm</code>, <code className="code-inline">NonPM_&lt;Peer&gt;_fdkn</code> × 4 peers</div>
            <div><strong>8</strong> prediction × choice &mdash; <code className="code-inline">&lt;Peer&gt;_pred_nice</code>, <code className="code-inline">&lt;Peer&gt;_pred_mean</code> × 4 peers</div>
            <div><strong>4</strong> response &mdash; <code className="code-inline">&lt;Peer&gt;_rsp</code> (no_resp folded in during enrichment)</div>
            <div><strong>4</strong> no-pred nuisance &mdash; <code className="code-inline">&lt;Peer&gt;_no_pred</code> (peer-split during enrichment)</div>
            <div><strong>1</strong> anticipation &mdash; <code className="code-inline">Anticipation_isi</code></div>
          </div>
        </div>

        <p>
          Peek the finished script so you know where you&rsquo;re headed, then start yours blank
          and build it piece by piece.
        </p>

        <PeekScript script="2_generate_timing.sh" label="Preview: the production script" />

        <CreateFile
          filename="my_timing.sh"
          language="shell"
          description="Open a blank script in VS Code and save it as my_timing.sh in the scripts/ folder."
        />

        {/* ════════════════════════════════════════════════════════
            PART 1: SKELETON + ARRAYS + SUBJECT LOOP
            ════════════════════════════════════════════════════════ */}
        <h2 className="mt-12">Part 1: Skeleton &amp; regressor arrays</h2>
        <p>
          The trick to keeping this script short is <strong>bash arrays</strong>. Instead of
          writing out 25 awk commands, you list the pieces once and let nested loops combine them.
        </p>

        <InsertCode language="bash" description="Part 1 — paths, arrays, subject loop">
{`#!/bin/bash
# my_timing.sh — enriched events → 25 AFNI .1D regressors per subject

SUBJ_LIST="\${SUBJ_LIST_OVERRIDE:-/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt}"
TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
BIDS_DIR="\${BIDS_DIR_OVERRIDE:-\$TOPDIR/RSA-learn/events_enriched}"
TIMING_ROOT="\${TIMING_ROOT_OVERRIDE:-\$TOPDIR/RSA-learn/TimingFiles/Enriched}"

# Arrays describe the regressor space — edit these instead of rewriting awk lines
PEERS=(Mean_60 Mean80 Nice_60 Nice80)
SFX_FB=(fdkm fdkn)                # <peer>_fdkm / <peer>_fdkn  (8 feedback)
SFX_PRED=(pred_nice pred_mean)    # <peer>_pred_nice / _mean    (8 prediction)
SFX_RSP=(rsp)                     # <peer>_rsp                  (4 response)
SFX_NP=(no_pred)                  # <peer>_no_pred              (4 nuisance)
ANTIC=(isi)                       # Anticipation_isi            (1)
RUNS=(01 02 03 04)

for subj in \$(cat "\$SUBJ_LIST"); do
    echo "[timing] sub-\${subj}"
    out="\${TIMING_ROOT}/sub-\${subj}"
    mkdir -p "\$out"
    rm -f "\$out"/*.1D "\$out"/*_events.tsv

    for run in "\${RUNS[@]}"; do
        cp "\${BIDS_DIR}/sub-\${subj}/func/sub-\${subj}_task-learn_run-\${run}_events.tsv" "\$out/"
    done
    cd "\$out"
`}
        </InsertCode>

        <h3>The bash patterns you need to know</h3>
        <div className="my-4 space-y-3 text-sm">
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">PEERS=(Mean_60 Mean80 Nice_60 Nice80)</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              A bash array literal. Parentheses group the values, spaces separate them.
              No commas.
            </p>
          </div>
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'for run in "${RUNS[@]}"; do'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              <code className="code-inline">{'"${ARR[@]}"'}</code> expands to every element of the
              array, each as a separate word. The quotes matter &mdash; they keep elements intact
              if any had spaces. The loop body runs once per element.
            </p>
          </div>
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'"${VAR:-default}"'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Use <code className="code-inline">$VAR</code> if it&rsquo;s set, otherwise use{' '}
              <code className="code-inline">default</code>. Lets you override paths from the command
              line without editing the script.
            </p>
          </div>
        </div>

        <TryCommand
          command="awk 'NR>1 {print $3}' /data/projects/STUDIES/LEARN/fMRI/RSA-learn/events_enriched/sub-1028/func/*_events.tsv | sort -u"
          execute={true}
          description="See every event label your script will filter on. Column 3 is the event name in both BIDS schemas."
        />

        {/* ════════════════════════════════════════════════════════
            PART 2: BUILD THE (tag, label) PAIRS
            ════════════════════════════════════════════════════════ */}
        <h2 className="mt-12">Part 2: Build a list of (tag, label) pairs</h2>
        <p>
          Every regressor is two things: the event label you filter on (e.g.{' '}
          <code className="code-inline">Mean_60_fdkm</code>) and the output filename tag (e.g.{' '}
          <code className="code-inline">NonPM_Mean60_fdkm</code>). Build the pairs once with
          nested loops; later loops iterate this list to do actual work.
        </p>

        <InsertCode language="bash" description="Part 2 — build (tag, label) pairs via nested loops">
{`    pairs=()
    for peer in "\${PEERS[@]}"; do
        short=\${peer/_60/60}                                       # Mean_60 → Mean60
        for sfx in "\${SFX_FB[@]}";   do pairs+=("NonPM_\${short}_\${sfx}:\${peer}_\${sfx}"); done
        for sfx in "\${SFX_PRED[@]}"; do pairs+=("\${short}_\${sfx}:\${peer}_\${sfx}"); done
        for sfx in "\${SFX_RSP[@]}";  do pairs+=("\${short}_\${sfx}:\${peer}_\${sfx}"); done
        for sfx in "\${SFX_NP[@]}";   do pairs+=("\${short}_\${sfx}:\${peer}_\${sfx}"); done
    done
    for a in "\${ANTIC[@]}"; do pairs+=("Anticipation_\${a}:\${a}"); done
`}
        </InsertCode>

        <h3>The bash patterns you need to know</h3>
        <div className="my-4 space-y-3 text-sm">
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">pairs=()</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Empty array. <code className="code-inline">{'pairs+=("X")'}</code> appends one element.
            </p>
          </div>
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'short=${peer/_60/60}'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Parameter expansion &mdash; replace the first occurrence of{' '}
              <code className="code-inline">_60</code> with <code className="code-inline">60</code>.
              So <code className="code-inline">Mean_60</code> becomes <code className="code-inline">Mean60</code>,
              <code className="code-inline">Nice_60</code> becomes <code className="code-inline">Nice60</code>,
              and <code className="code-inline">Mean80</code>/<code className="code-inline">Nice80</code> pass
              through unchanged (no match). Keeps the output filenames tidy.
            </p>
          </div>
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'pairs+=("NonPM_${short}_${sfx}:${peer}_${sfx}")'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Each entry is <code className="code-inline">tag:label</code>, joined with a colon.
              We&rsquo;ll split them back apart in the next loop. The <code className="code-inline">NonPM_</code>{' '}
              prefix on feedback regressors is just historical convention.
            </p>
          </div>
        </div>

        <Callout variant="tip" title="Why this works">
          Four peers × (2 fb + 2 pred + 1 rsp + 1 np) = 24 combinations, plus 1 for anticipation = 25.
          Every name follows the same template, so one nested loop covers all of them.
        </Callout>

        {/* ════════════════════════════════════════════════════════
            PART 3: EXTRACT + MERGE
            ════════════════════════════════════════════════════════ */}
        <h2 className="mt-12">Part 3: Extract per-run, merge into 4-row files</h2>
        <p>
          For each pair, do two things: (a) for each run, run awk to pull onsets into a per-run
          .1D; (b) stitch the 4 per-run files into one 4-row merged .1D.
        </p>

        <InsertCode language="bash" description="Part 3 — extract + merge">
{`    for pair in "\${pairs[@]}"; do
        tag="\${pair%%:*}"       # everything before the ":"  →  output basename
        label="\${pair##*:}"     # everything after  the ":"  →  event label

        for run in "\${RUNS[@]}"; do
            cat "sub-\${subj}_task-learn_run-\${run}_events.tsv" \\
                | awk -v L="\$label" '{ if (\$3==L) { printf "%s:%s ", \$1, \$2 } }' \\
                > "\${tag}_run\${run#0}.1D"
        done

        rm -f "\${tag}.1D"
        for r in 1 2 3 4; do
            line=\$(cat "\${tag}_run\${r}.1D")
            [ -z "\$line" ] && line="*"
            echo "\$line" >> "\${tag}.1D"
        done
    done
`}
        </InsertCode>

        <h3>The bash patterns you need to know</h3>
        <div className="my-4 space-y-3 text-sm">
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'tag="${pair%%:*}"   label="${pair##*:}"'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              More parameter expansion. <code className="code-inline">{'%%:*'}</code> strips the longest
              match of <code className="code-inline">:*</code> from the <em>end</em> (everything from the
              colon on), leaving the tag. <code className="code-inline">{'##*:'}</code> strips the longest match
              of <code className="code-inline">*:</code> from the <em>start</em>, leaving the label. So
              "<code className="code-inline">{'NonPM_Mean60_fdkm:Mean_60_fdkm'}</code>" splits cleanly into
              its two halves.
            </p>
          </div>
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'awk -v L="$label" \'{ if ($3==L) {...} }\''}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              <code className="code-inline">-v NAME=value</code> is the only way to pass a bash variable
              into awk &mdash; awk runs in its own world and doesn&rsquo;t see <code className="code-inline">$label</code>
              directly. Inside awk the value lives in <code className="code-inline">L</code>, and you compare column 3 (<code className="code-inline">$3</code>, the event name) to it.
            </p>
          </div>
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'printf "%s:%s ", $1, $2'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Writes <code className="code-inline">onset:duration </code> with no newline, so all matches on a run
              concatenate onto one line &mdash; AFNI&rsquo;s stim_times_subtract format.
            </p>
          </div>
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'line=$(cat file); [ -z "$line" ] && line="*"'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Read the per-run file; if empty, use <code className="code-inline">*</code>. AFNI interprets
              <code className="code-inline"> *</code> as &ldquo;no events this run.&rdquo; Then{' '}
              <code className="code-inline">{'echo "$line" >> tag.1D'}</code> appends it as one of the 4 rows.
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            PART 4: PAD PER-RUN FILES
            ════════════════════════════════════════════════════════ */}
        <h2 className="mt-12">Part 4: Pad per-run files to 4 rows</h2>
        <p>
          AFNI&rsquo;s multi-run format wants every per-run file to have 4 rows too, with{' '}
          <code className="code-inline">*</code> on the three runs the file doesn&rsquo;t cover. So
          <code className="code-inline"> NonPM_Mean60_fdkm_run2.1D</code> has to look like:
        </p>

        <pre className="bg-[var(--color-bg-deep)] border border-[var(--color-border-dim)] rounded p-3 text-xs my-3">{`*
9.868:3 47.133:3 ...
*
*`}</pre>

        <InsertCode language="bash" description="Part 4 — pad to 4 rows">
{`    for f in *_run[1-4].1D; do
        [ -f "\$f" ] || continue
        run="\${f##*_run}"; run="\${run%.1D}"     # filename → "2"
        line=\$(tr -d '\\n' < "\$f")
        [ -z "\$line" ] && line="*"
        case "\$run" in
            1) printf "%s\\n*\\n*\\n*\\n" "\$line" > "\$f" ;;
            2) printf "*\\n%s\\n*\\n*\\n" "\$line" > "\$f" ;;
            3) printf "*\\n*\\n%s\\n*\\n" "\$line" > "\$f" ;;
            4) printf "*\\n*\\n*\\n%s\\n" "\$line" > "\$f" ;;
        esac
    done
done
`}
        </InsertCode>

        <h3>The bash patterns you need to know</h3>
        <div className="my-4 space-y-3 text-sm">
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">*_run[1-4].1D</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Shell glob. Bash expands it to every matching filename before the command runs, so the
              for-loop iterates over all per-run files in the current directory.
            </p>
          </div>
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{'run="${f##*_run}"; run="${run%.1D}"'}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Strips the prefix up through <code className="code-inline">_run</code>, then strips{' '}
              <code className="code-inline">.1D</code> from the end. What&rsquo;s left is the run digit
              &mdash; e.g. <code className="code-inline">2</code>.
            </p>
          </div>
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{"tr -d '\\n' < \"$f\""}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              <code className="code-inline">tr -d 'X'</code> deletes all X characters from its input.{' '}
              <code className="code-inline">{"< FILE"}</code> feeds FILE in as stdin. Net result: the file&rsquo;s
              contents as one flat line, newlines removed.
            </p>
          </div>
          <div className="rounded border border-[var(--color-border-dim)] bg-[var(--color-bg-secondary)] p-4">
            <code className="text-[var(--color-accent-bright)]">{"case \"$run\" in 1) ... ;; esac"}</code>
            <p className="mt-1 text-[var(--color-text-secondary)]">
              Bash&rsquo;s switch statement. Each arm matches a pattern, runs its commands, ends with{' '}
              <code className="code-inline">;;</code>. <code className="code-inline">esac</code> closes the block
              (yes, <code className="code-inline">case</code> spelled backwards). <code className="code-inline">printf</code>{' '}
              uses <code className="code-inline">\\n</code> literally for newlines, so you place{' '}
              <code className="code-inline">%s</code> on the correct row and <code className="code-inline">*</code> on the others.
            </p>
          </div>
        </div>

        <Callout variant="exercise" title="Run it">
          Save the script as <code className="code-inline">my_timing.sh</code>, then from your
          terminal: <code className="code-inline">bash my_timing.sh</code>. Next module walks through
          verification &mdash; file counts, row counts, spot-checks against the source events.tsv.
        </Callout>
      </div>
    </div>
  )
}
