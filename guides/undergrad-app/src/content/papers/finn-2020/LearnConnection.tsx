/**
 * Finn et al. (2020) — Section 6: Connection to LEARN
 *
 * The capstone section: how every concept in the paper maps
 * directly to our LEARN RSA project. This section makes the
 * bridge explicit and prepares for the pipeline walkthrough.
 */

import Callout from '@src/components/Callout'

export default function LearnConnection(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Finn et al. (2020)
          </span>
          <span className="text-[var(--color-text-dim)]">·</span>
          <span className="text-xs text-[var(--color-text-muted)]">Section 6 of 6</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Connection to LEARN
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          From Finn's framework to our hypotheses. Every concept in this paper has a
          concrete counterpart in the LEARN RSA project.
        </p>
      </div>

      <div className="prose-container">
        <h2>Our Naturalistic Stimulus: Social Learning</h2>
        <p>
          Finn et al. used movie-watching as their naturalistic stimulus. Our stimulus is a
          <strong> social learning task</strong> — more controlled, but with the same key
          property: it creates conditions where individuals can (and do) process the same
          events in meaningfully different ways.
        </p>
        <p>
          In the LEARN task, adolescents interact with four virtual peers across four fMRI
          runs. Each peer has hidden behavioral tendencies:
        </p>

        <div className="my-6 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              The Four Peers
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-px bg-[var(--color-border)]">
            {[
              {
                label: 'Nice + Predictable',
                code: 'PN',
                desc: 'Gives positive feedback ~80% of the time, consistently',
                color: 'text-[var(--color-success)]'
              },
              {
                label: 'Nice + Unpredictable',
                code: 'U_N',
                desc: 'Gives positive feedback ~60% of the time, less consistently',
                color: 'text-[var(--color-teal)]'
              },
              {
                label: 'Mean + Predictable',
                code: 'PM',
                desc: 'Gives negative feedback ~80% of the time, consistently',
                color: 'text-[var(--color-error)]'
              },
              {
                label: 'Mean + Unpredictable',
                code: 'U_M',
                desc: 'Gives negative feedback ~60% of the time, less consistently',
                color: 'text-[var(--color-amber)]'
              }
            ].map((peer) => (
              <div key={peer.code} className="bg-[var(--color-bg-surface)] p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold font-mono ${peer.color}`}>{peer.code}</span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {peer.label}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">{peer.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p>
          Each trial has four phases: <strong>prediction</strong> (see the peer and predict their
          feedback) → <strong>anticipation</strong> (an inter-stimulus interval while the
          participant waits) → <strong>feedback</strong> (the actual feedback is revealed) →{' '}
          <strong>response</strong> (rate the peer). This creates a rich stream of
          social-cognitive events — prediction, anticipation, prediction error, evaluation —
          that the brain processes on every trial.
        </p>
        <p>
          The 2×2 structure (Nice/Mean × Predictable/Unpredictable) crosses two fundamental
          dimensions of social learning: the <em>valence</em> of the person (are they nice
          or mean?) and the <em>predictability</em> of their behavior (can you learn to
          anticipate them?).
        </p>

        <h2>From Finn's Framework to Our Hypotheses</h2>

        <h3>Hypothesis A: Learning Alignment</h3>
        <p>
          The central question: <strong>does the brain&rsquo;s representational structure come
          to reflect the true peer structure over the course of the runs?</strong> At the start
          of the task (run 1), participants know nothing about the peers &mdash; neural patterns
          for all four peer types should be relatively undifferentiated. By run 4, after enough
          feedback, we expect the brain&rsquo;s RDM to have shifted: peers with similar
          dispositions (both Nice, or both Mean) should have more similar neural patterns, while
          peers with different dispositions should be more distinct.
        </p>
        <p>
          We test this by building a &ldquo;true peer structure&rdquo; model RDM and comparing
          it to the brain&rsquo;s empirical RDM <em>separately for each run</em>. The
          prediction: alignment should <strong>increase from run 1 to run 4</strong>, tracing
          the learning trajectory. This is why we need run-wise betas &mdash; collapsing across
          runs would destroy the ability to track learning over time.
        </p>

        <Callout variant="learn">
          <p>
            Three model RDMs compete:
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              <strong>Disposition model:</strong> Nice peers cluster together, Mean peers
              cluster together. Tests whether the brain organizes peers by valence.
            </li>
            <li>
              <strong>Predictability model:</strong> Predictable peers cluster together,
              Unpredictable peers cluster together. Tests whether the brain tracks
              reliability.
            </li>
            <li>
              <strong>Negativity model:</strong> Mean peers are more tightly clustered than
              Nice peers. Tests for a negativity bias — the brain may represent threatening
              peers with more precision.
            </li>
          </ul>
        </Callout>

        <h3>Hypothesis B: Idiosyncrasy (IS-RSA)</h3>
        <p>
          This is where Finn et al. directly inspires us. Using IS-RSA, we ask: do adolescents
          with similar social anxiety levels show similar representational geometries?
        </p>
        <p>
          For each participant, we have their 8-condition RDM (the representational geometry
          of how their brain distinguishes the 8 feedback types). For each pair of participants,
          we compute how similar their RDMs are. This gives us a 38 × 38 neural similarity
          matrix — exactly the kind of matrix Finn et al. work with.
        </p>
        <p>
          Then we build behavioral model matrices from SCARED social anxiety scores using all
          three formulations:
        </p>
        <ul>
          <li>
            <strong>|SA_i − SA_j|:</strong> Nearest Neighbors — does anxiety proximity
            predict neural similarity?
          </li>
          <li>
            <strong>mean(SA_i, SA_j):</strong> Does high average anxiety in a pair predict
            similarity?
          </li>
          <li>
            <strong>min(SA_i, SA_j):</strong> Anna Karenina — does having <em>either</em>
            person be highly anxious predict dissimilarity?
          </li>
        </ul>

        <h3>Hypothesis B Extension: The Idiosyncrasy Score</h3>
        <p>
          Beyond IS-RSA at the matrix level, we can compute a per-person{' '}
          <strong>idiosyncrasy score</strong>: for each subject, how different is their neural
          representation from the group average? This collapses the subject × subject matrix
          into a single number per person.
        </p>
        <pre><code>{`idiosyncrasy(i) = 1 − mean(neural_similarity(i, j)) for all j ≠ i`}</code></pre>
        <p>
          We then correlate idiosyncrasy scores with SCARED anxiety scores. If social anxiety
          drives neural idiosyncrasy, we expect a positive correlation: higher anxiety →
          higher idiosyncrasy → less shared neural representation of social feedback.
        </p>

        <h2>The Mapping: Paper → Pipeline</h2>

        <div className="my-6 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Finn Concept → LEARN Implementation
            </h3>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {[
              {
                finn: 'Naturalistic stimulus',
                learn: 'Social learning task with 4 peers × 4 runs'
              },
              {
                finn: 'Neural data (brain time courses)',
                learn: 'Run-wise beta maps from AFNI GLM (no smoothing)'
              },
              {
                finn: 'Behavioral scores',
                learn: 'SCARED social anxiety subscale'
              },
              {
                finn: 'Subjects × subjects brain similarity',
                learn: 'Correlation of per-subject RDMs (8 conditions)'
              },
              {
                finn: 'Behavioral model matrix',
                learn: '|SA_i − SA_j|, mean(SA), min(SA) formulations'
              },
              {
                finn: 'Anna Karenina test',
                learn: 'min(SA) model → does SA produce idiosyncrasy?'
              },
              {
                finn: 'Regional specificity',
                learn: 'ROI analysis: vmPFC, TPJ, insula, amygdala, striatum'
              },
              {
                finn: 'No spatial smoothing',
                learn: 'GLM pipeline omits blur block explicitly'
              },
              {
                finn: 'Permutation testing',
                learn: 'Mantel test with row/column permutation'
              }
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 px-5 py-3 text-sm">
                <div className="text-[var(--color-text-muted)]">{row.finn}</div>
                <div className="text-[var(--color-text-secondary)] font-medium">{row.learn}</div>
              </div>
            ))}
          </div>
        </div>

        <h2>The Full Analysis Arc</h2>
        <p>
          Everything you've read in this paper maps onto a concrete analysis pipeline that
          you'll learn to operate. Here's the full arc from raw data to tested hypotheses:
        </p>

        <div className="my-6 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              The Pipeline → Analysis → Inference Chain
            </h3>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {[
              {
                stage: 'Preprocessing & GLM',
                desc: 'Fix events → generate timing files → run AFNI GLM with no smoothing and run-wise estimation',
                output: 'Clean, unsmoothed beta maps: 8 conditions × 4 runs × 38 subjects'
              },
              {
                stage: 'Pattern Extraction',
                desc: 'For each subject and run, extract the multi-voxel pattern from each ROI (vmPFC, TPJ, insula, amygdala, striatum)',
                output: 'Voxel pattern vectors per condition per run per subject'
              },
              {
                stage: 'Learning Alignment RSA (Hypothesis A)',
                desc: 'Build a conditions × conditions RDM for each subject per run. Compare to a true-peer-structure model RDM and track how alignment increases from run 1 to run 4',
                output: 'Does the brain\'s representational geometry come to reflect the true peer structure over the course of learning?'
              },
              {
                stage: 'IS-RSA (Hypothesis B)',
                desc: 'Build a 38 × 38 inter-subject neural similarity matrix from per-subject RDMs. Build behavioral model matrices from SCARED scores using |i−j|, mean, and min formulations',
                output: 'Does social anxiety predict representational similarity structure?'
              },
              {
                stage: 'Idiosyncrasy Scores',
                desc: 'Compute each subject\'s deviation from the group average RDM. Correlate with SCARED anxiety scores',
                output: 'Are anxious teens more neurally idiosyncratic in social feedback processing?'
              }
            ].map((row, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-[var(--color-accent-bright)] font-mono">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {row.stage}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {row.desc}
                </p>
                <p className="text-xs text-[var(--color-teal)] mt-1 font-medium">
                  → {row.output}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p>
          The walkthrough tabs that follow cover stages 1–2 of this chain in deep detail:
          getting connected to the server, understanding the data, building timing files, and
          running the GLM. The "What's Next" tab previews stages 3–5, which will be your
          active research once the pipeline is running.
        </p>
        <p>
          The key insight: the preprocessing pipeline isn't separate from the science — every
          design choice (no smoothing, run-wise betas, duration modulation, explicit
          anticipation modeling) flows directly from the IS-RSA framework and the specific
          questions we're asking about social anxiety and peer feedback processing.
        </p>

        <Callout variant="tip">
          <p>
            <strong>You now understand the "why."</strong> The rest of this walkthrough is
            the "how." With Finn's framework in hand, every pipeline step will make sense:
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              <strong>Foundations</strong> → getting connected to the server where the data
              lives
            </li>
            <li>
              <strong>Your Data</strong> → understanding what BIDS data we have and what
              events.tsv contains
            </li>
            <li>
              <strong>Timing Files</strong> → extracting when each of the 8 conditions
              occurred
            </li>
            <li>
              <strong>The GLM</strong> → estimating the run-wise beta maps that IS-RSA needs
            </li>
            <li>
              <strong>What's Next</strong> → ROI extraction, RDM construction, IS-RSA testing,
              and idiosyncrasy analysis
            </li>
          </ul>
        </Callout>
      </div>
    </div>
  )
}
