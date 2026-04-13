/**
 * BIDS Data — Module 3: The 8 Feedback Conditions
 */

import Callout from '@src/components/Callout'

export default function EightConditions(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Your Data
          </span>
          <span className="text-[var(--color-text-dim)]">·</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 3 of 6</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          The 8 Feedback Conditions
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          How we categorize every feedback event into one of eight bins — and why each bin
          matters for RSA.
        </p>
      </div>

      <div className="prose-container">
        <h2>From Peers to Conditions</h2>
        <p>
          In the last module, you learned about the four peers and the 2x2 design
          (Valence x Predictability). Now we need to go one level deeper. When we analyze brain
          activity, we do not just ask "what happened when the participant interacted with
          peer PN?" We ask something more specific: <strong>what happened when the participant
          received feedback that matched (or did not match) what we would expect from that
          peer?</strong>
        </p>
        <p>
          This introduces a third dimension: <strong>feedback type</strong>. Was the feedback mean or nice — and did it match
          the peer's known tendency, or was it a surprise?
        </p>

        <Callout variant="definition">
          <strong>Condition (in fMRI):</strong> A specific experimental circumstance that we
          expect to produce a distinct pattern of brain activity. Each condition groups together
          similar events so we can estimate the average brain response. In our study, each
          condition is defined by three factors: the peer's valence, their predictability, and
          the type of feedback (mean or nice).
        </Callout>

        <h2>The Three Factors</h2>
        <p>
          Every feedback event in the LEARN task can be classified along three dimensions:
        </p>
        <ul>
          <li>
            <strong>Valence:</strong> Nice or Mean — the peer's overall tendency. A "Nice" peer
            (PN or U_N) leans toward positive feedback; a "Mean" peer (PM or U_M) leans toward
            negative feedback.
          </li>
          <li>
            <strong>Predictability:</strong> 80 or 60 — the peer's consistency. 80% peers
            (PN, PM) follow their tendency reliably; 60% peers (U_N, U_M) are more variable.
          </li>
          <li>
            <strong>Feedback type:</strong> fdkm or fdkn — was the feedback mean or nice?
          </li>
        </ul>

        <Callout variant="tip">
          <p>
            The abbreviations <code className="code-inline">fdkm</code> and{' '}
            <code className="code-inline">fdkn</code> stand for:
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              <strong>fdkm</strong> = <strong>f</strong>ee<strong>d</strong>bac<strong>k</strong>{' '}
              <strong>m</strong>ean — The feedback given was <em>mean</em> (negative).
            </li>
            <li>
              <strong>fdkn</strong> = <strong>f</strong>ee<strong>d</strong>bac<strong>k</strong>{' '}
              <strong>n</strong>ice — The feedback given was <em>nice</em> (positive).
            </li>
          </ul>
          <p className="mt-2">
            Whether that feedback is <em>expected</em> or <em>surprising</em> depends on the
            peer: mean feedback from a Mean peer is expected, but mean feedback from a Nice peer
            is a surprise.
          </p>
        </Callout>

        <h2>The Complete 2x2x2</h2>
        <p>
          Combining all three factors gives us <strong>2 x 2 x 2 = 8 conditions</strong>.
          Here they are, with a description of what each represents:
        </p>

        {/* Conditions table */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 px-3 text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold">
                  #
                </th>
                <th className="text-left py-3 px-3 text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold">
                  Condition
                </th>
                <th className="text-left py-3 px-3 text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold">
                  Valence
                </th>
                <th className="text-left py-3 px-3 text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold">
                  Predictability
                </th>
                <th className="text-left py-3 px-3 text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold">
                  Match
                </th>
                <th className="text-left py-3 px-3 text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold">
                  What Happened
                </th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              <tr className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] transition-colors">
                <td className="py-3 px-3 font-mono text-xs text-[var(--color-text-muted)]">1</td>
                <td className="py-3 px-3">
                  <code className="code-inline">Mean60_fdkm</code>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-medium">Mean</span>
                </td>
                <td className="py-3 px-3 text-xs">60%</td>
                <td className="py-3 px-3 text-xs">fdkm</td>
                <td className="py-3 px-3 text-xs">Mean-unpredictable peer gave mean feedback (expected)</td>
              </tr>
              <tr className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] transition-colors">
                <td className="py-3 px-3 font-mono text-xs text-[var(--color-text-muted)]">2</td>
                <td className="py-3 px-3">
                  <code className="code-inline">Mean60_fdkn</code>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-medium">Mean</span>
                </td>
                <td className="py-3 px-3 text-xs">60%</td>
                <td className="py-3 px-3 text-xs">fdkn</td>
                <td className="py-3 px-3 text-xs">Mean-unpredictable peer gave nice feedback (surprise!)</td>
              </tr>
              <tr className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] transition-colors">
                <td className="py-3 px-3 font-mono text-xs text-[var(--color-text-muted)]">3</td>
                <td className="py-3 px-3">
                  <code className="code-inline">Mean80_fdkm</code>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-medium">Mean</span>
                </td>
                <td className="py-3 px-3 text-xs">80%</td>
                <td className="py-3 px-3 text-xs">fdkm</td>
                <td className="py-3 px-3 text-xs">Mean-predictable peer gave mean feedback (expected)</td>
              </tr>
              <tr className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] transition-colors">
                <td className="py-3 px-3 font-mono text-xs text-[var(--color-text-muted)]">4</td>
                <td className="py-3 px-3">
                  <code className="code-inline">Mean80_fdkn</code>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-medium">Mean</span>
                </td>
                <td className="py-3 px-3 text-xs">80%</td>
                <td className="py-3 px-3 text-xs">fdkn</td>
                <td className="py-3 px-3 text-xs">Mean-predictable peer gave nice feedback (surprise!)</td>
              </tr>
              <tr className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] transition-colors">
                <td className="py-3 px-3 font-mono text-xs text-[var(--color-text-muted)]">5</td>
                <td className="py-3 px-3">
                  <code className="code-inline">Nice60_fdkm</code>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">Nice</span>
                </td>
                <td className="py-3 px-3 text-xs">60%</td>
                <td className="py-3 px-3 text-xs">fdkm</td>
                <td className="py-3 px-3 text-xs">Nice-unpredictable peer gave mean feedback (surprise!)</td>
              </tr>
              <tr className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] transition-colors">
                <td className="py-3 px-3 font-mono text-xs text-[var(--color-text-muted)]">6</td>
                <td className="py-3 px-3">
                  <code className="code-inline">Nice60_fdkn</code>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">Nice</span>
                </td>
                <td className="py-3 px-3 text-xs">60%</td>
                <td className="py-3 px-3 text-xs">fdkn</td>
                <td className="py-3 px-3 text-xs">Nice-unpredictable peer gave nice feedback (expected)</td>
              </tr>
              <tr className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] transition-colors">
                <td className="py-3 px-3 font-mono text-xs text-[var(--color-text-muted)]">7</td>
                <td className="py-3 px-3">
                  <code className="code-inline">Nice80_fdkm</code>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">Nice</span>
                </td>
                <td className="py-3 px-3 text-xs">80%</td>
                <td className="py-3 px-3 text-xs">fdkm</td>
                <td className="py-3 px-3 text-xs">Nice-predictable peer gave mean feedback (surprise!)</td>
              </tr>
              <tr className="hover:bg-[var(--color-bg-elevated)] transition-colors">
                <td className="py-3 px-3 font-mono text-xs text-[var(--color-text-muted)]">8</td>
                <td className="py-3 px-3">
                  <code className="code-inline">Nice80_fdkn</code>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">Nice</span>
                </td>
                <td className="py-3 px-3 text-xs">80%</td>
                <td className="py-3 px-3 text-xs">fdkn</td>
                <td className="py-3 px-3 text-xs">Nice-predictable peer gave nice feedback (expected)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Reading the Condition Names</h2>
        <p>
          Every condition name follows the same pattern:{' '}
          <code className="code-inline">{'{Valence}{Predictability}_{MatchType}'}</code>. Let's
          decode one:
        </p>
        <pre className="code-block"><code>{`Nice80_fdkn
  │   │    │
  │   │    └─ fdkn = feedback nice
  │   └─ 80 = 80% predictable peer
  └─ Nice = nice-tendency peer

Translation: A predictable nice peer gave NICE feedback.
This is expected because this peer is usually nice.`}</code></pre>
        <p>
          Once you internalize this naming convention, you can instantly decode any condition
          name you encounter in the timing files, GLM output, or analysis scripts.
        </p>

        <h2>Why the Feedback Type Matters</h2>
        <p>
          The feedback type dimension (fdkm vs. fdkn) tells you <em>what</em> feedback was given.
          Whether that feedback is expected or surprising depends on the peer:
        </p>
        <ul>
          <li>
            <strong>fdkm (feedback mean):</strong> The peer gave mean feedback. For a Mean peer,
            this is <em>expected</em> — confirmation. For a Nice peer, this is a{' '}
            <em>surprise</em> — a prediction error.
          </li>
          <li>
            <strong>fdkn (feedback nice):</strong> The peer gave nice feedback. For a Nice peer,
            this is <em>expected</em>. For a Mean peer, this is a <em>surprise</em>.
          </li>
        </ul>
        <p>
          Consider the contrast between <code className="code-inline">Nice80_fdkm</code> and{' '}
          <code className="code-inline">Nice60_fdkm</code>. Both involve a nice peer giving
          mean feedback (a surprise). But the <strong>80%</strong> peer's surprise is much more
          shocking — this peer is almost always nice! The <strong>60%</strong> peer's surprise is
          less jarring — you were already uncertain about them. The brain should encode these
          prediction errors differently, and RSA can test that.
        </p>

        <h2>How the 8 Conditions Map to RSA</h2>
        <Callout variant="learn">
          <p>
            These 8 conditions are the foundation of our RSA analysis. Here is why:
          </p>
          <p className="mt-2">
            For each condition, the GLM will estimate a <strong>beta map</strong> — a whole-brain
            image showing how strongly each voxel responded during that condition. With 8
            conditions, we get 8 beta maps per run. RSA then computes the{' '}
            <strong>similarity</strong> between every pair of beta maps, producing an 8x8{' '}
            <strong>representational dissimilarity matrix (RDM)</strong>.
          </p>
          <p className="mt-2">
            The RDM reveals the brain's representational geometry: which conditions does a brain
            region treat as similar? Which does it treat as different? A region that cares about
            valence will cluster Nice conditions together and Mean conditions together. A region
            that cares about prediction errors will separate fdkm from fdkn. The structure of the
            RDM tells us what information the brain is encoding.
          </p>
        </Callout>

        <h2>Frequency of Each Condition</h2>
        <p>
          Not all conditions have equal numbers of events. Because predictable peers follow
          their tendency 80% of the time and unpredictable peers follow theirs 60% of the time:
        </p>
        <ul>
          <li>
            <strong>fdkm events are more common than fdkn events</strong> — by definition,
            the feedback-mean outcome happens more often for Mean peers and the feedback-nice
            outcome happens more often for Nice peers.
          </li>
          <li>
            <strong>80% peers produce more fdkm events</strong> than 60% peers do (because
            they match their tendency more often).
          </li>
        </ul>
        <p>
          This imbalance is handled by the GLM — it estimates the brain response per condition
          regardless of how many events contributed. But it is good to be aware that some
          conditions have more statistical power than others.
        </p>

        <h2>Key Takeaways</h2>
        <ul>
          <li>
            Every feedback event falls into one of 8 conditions based on Valence x
            Predictability x Match Type.
          </li>
          <li>
            <code className="code-inline">fdkm</code> = feedback mean;{' '}
            <code className="code-inline">fdkn</code> = feedback nice.
          </li>
          <li>
            Condition names follow the pattern{' '}
            <code className="code-inline">{'{Valence}{Pred}_{Match}'}</code> — once you learn
            it, you can decode any condition instantly.
          </li>
          <li>
            These 8 conditions produce the beta maps that RSA compares, making them the
            building blocks of our entire analysis.
          </li>
        </ul>
      </div>
    </div>
  )
}
