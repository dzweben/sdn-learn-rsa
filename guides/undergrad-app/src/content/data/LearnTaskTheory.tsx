/**
 * BIDS Data — Module 2: The LEARN Task — Theory
 */

import Callout from '@src/components/Callout'

export default function LearnTaskTheory(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Your Data
          </span>
          <span className="text-[var(--color-text-dim)]">·</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 2 of 6</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          The LEARN Task — Theory
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          What participants actually did inside the scanner — and why this task is perfect for
          studying social learning.
        </p>
      </div>

      <div className="prose-container">
        <h2>A Virtual School</h2>
        <p>
          Imagine you are a teenager lying inside an MRI scanner. On the screen in front of
          you, you see a virtual school. You are about to interact with four peers — they look
          like real people, but they are actually computer-generated characters whose behavior
          follows specific rules that you do not know yet.
        </p>
        <p>
          Over the course of the experiment, you will interact with each peer many times. With
          each interaction, you will try to figure out: <em>Is this person nice or mean? Can I
          predict what they will do?</em> This is the LEARN task — a carefully controlled social
          learning experiment designed to study how the brain represents and updates impressions
          of other people.
        </p>

        <h2>The Four Peers</h2>
        <p>
          Each peer has two hidden properties that define their behavior: <strong>valence</strong>{' '}
          (whether they tend to be nice or mean) and <strong>predictability</strong> (how
          consistently they follow that tendency). Here are the four peers:
        </p>

        {/* Interactive peer cards */}
        <div className="grid grid-cols-2 gap-4 my-6">
          {/* PN - Nice Predictable */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 transition-all hover:border-[var(--color-accent)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm font-bold">
                PN
              </span>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Nice &mdash; Predictable
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Gives <strong>nice</strong> feedback ~80% of the time. Easy to learn about — you
              quickly figure out this peer is friendly and reliable.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: '80%' }} />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">80% nice</span>
            </div>
          </div>

          {/* PM - Mean Predictable */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 transition-all hover:border-[var(--color-accent)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 text-sm font-bold">
                PM
              </span>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Mean &mdash; Predictable
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Gives <strong>mean</strong> feedback ~80% of the time. Also easy to learn about —
              you quickly figure out this peer is reliably unfriendly.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                <div className="h-full rounded-full bg-rose-400" style={{ width: '80%' }} />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">80% mean</span>
            </div>
          </div>

          {/* U_N - Nice Unpredictable */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 transition-all hover:border-[var(--color-accent)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm font-bold">
                U_N
              </span>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Nice &mdash; Unpredictable
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Gives <strong>nice</strong> feedback ~60% of the time. Harder to learn — you might
              think they are nice, but they surprise you with mean feedback often enough to keep
              you uncertain.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: '60%' }} />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">60% nice</span>
            </div>
          </div>

          {/* U_M - Mean Unpredictable */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 transition-all hover:border-[var(--color-accent)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 text-sm font-bold">
                U_M
              </span>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                Mean &mdash; Unpredictable
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Gives <strong>mean</strong> feedback ~60% of the time. Hard to learn — they lean
              mean, but give nice feedback just often enough to keep you guessing.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                <div className="h-full rounded-full bg-rose-400" style={{ width: '60%' }} />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">60% mean</span>
            </div>
          </div>
        </div>

        <h2>The 2x2 Design</h2>
        <p>
          Notice how the four peers form a clean <strong>2x2 design</strong>:
        </p>
        <ul>
          <li>
            <strong>Valence</strong> (Nice vs. Mean) — does the peer tend to give positive or
            negative feedback?
          </li>
          <li>
            <strong>Predictability</strong> (80% vs. 60%) — how consistently do they follow
            that tendency?
          </li>
        </ul>
        <p>
          This is not an accident. The 2x2 structure lets us separately examine the effects of{' '}
          <em>what kind of person</em> a peer is (valence) and <em>how easy they are to figure
          out</em> (predictability). In the brain, these two dimensions may be represented by
          different neural systems — and RSA is the perfect tool to test that.
        </p>

        <Callout variant="definition">
          <strong>Predictability (in the LEARN task):</strong> How consistently a peer follows
          their dominant tendency. An 80% peer gives their expected feedback type 4 out of 5
          times — participants can learn to anticipate their behavior. A 60% peer gives their
          expected type only 3 out of 5 times — not much better than a coin flip, making them
          hard to predict with confidence.
        </Callout>

        <h2>The Trial Structure</h2>
        <p>
          Every interaction with a peer follows the same four-phase sequence:
        </p>
        <ol>
          <li>
            <strong>Prediction</strong> — A peer appears on screen and the participant predicts
            what kind of feedback they will give (nice or mean). This is one combined phase
            &mdash; seeing the peer and making the prediction happen on the same screen. The
            prediction is the participant&rsquo;s best guess based on what they have learned so far.
          </li>
          <li>
            <strong>Anticipation</strong> — An inter-stimulus interval (ISI) where the
            participant waits to find out if their prediction was correct. This waiting period is
            neurally active &mdash; the brain is processing uncertainty and expectation &mdash;
            and varies in duration from trial to trial.
          </li>
          <li>
            <strong>Feedback</strong> — The actual feedback is revealed. It might match
            the participant&rsquo;s prediction, or it might be a surprise.
          </li>
          <li>
            <strong>Response</strong> — The participant rates how they feel about this
            peer on a scale.
          </li>
        </ol>
        <p>
          After the response, there is a brief interval before the next peer appears and the
          cycle begins again with a new trial.
        </p>

        <Callout variant="tip">
          The <strong>feedback moment</strong> (phase 3) is the most important event for our
          analysis. This is when the brain processes whether the outcome matched expectations —
          a fundamental computation in learning. Our GLM models brain activity at each feedback
          event, and our RSA compares the neural patterns across different types of feedback.
          The anticipation phase (phase 2) is also modeled as its own regressor to cleanly
          separate anticipation-related neural activity from feedback processing.
        </Callout>

        <h2>How the Experiment Unfolds</h2>
        <p>
          The full experiment spans <strong>4 functional runs</strong> (each about 8 minutes
          long). Across all 4 runs, participants complete <strong>32 interactions per
          peer</strong>, for a total of <strong>128 feedback events</strong> per participant.
        </p>
        <p>
          Within each run, interactions with the four peers are interleaved — you do not see all
          of one peer's interactions before moving to the next. This mixing is important because
          it means the brain must constantly switch between different social representations.
        </p>
        <p>
          Over the course of the experiment, something fascinating happens: participants get
          better at predicting <strong>predictable</strong> peers (PN and PM), but their accuracy
          for <strong>unpredictable</strong> peers (U_N and U_M) stays roughly flat. This
          behavioral learning curve is exactly what the task is designed to produce — and the
          neural signatures of this learning are what we are after.
        </p>

        <h2>Why This Task Is Special for RSA</h2>
        <Callout variant="learn">
          <p>
            The LEARN task has several features that make it ideal for RSA:
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              <strong>Multiple distinct conditions:</strong> With 4 peers and 2 feedback types per
              peer, we get 8 feedback conditions — enough to build a rich representational
              similarity matrix.
            </li>
            <li>
              <strong>Social learning:</strong> Participants form and update impressions in real
              time, meaning neural representations change over the course of the experiment.
            </li>
            <li>
              <strong>Individual differences:</strong> Some participants (especially those with
              higher social anxiety) may represent peers differently — this is exactly what
              inter-subject RSA can detect.
            </li>
            <li>
              <strong>2x2 structure:</strong> The valence-by-predictability design lets us test
              specific hypotheses about which dimensions the brain cares about.
            </li>
          </ul>
        </Callout>

        <h2>Key Takeaways</h2>
        <ul>
          <li>
            Participants interact with 4 computer-generated peers in a virtual school setting.
          </li>
          <li>
            Each peer has a tendency (nice or mean) and a predictability level (80% or 60%).
          </li>
          <li>
            Each trial follows a fixed sequence: prediction (see peer and predict), anticipation
            (ISI), feedback, response.
          </li>
          <li>
            128 total feedback events per participant across 4 runs.
          </li>
          <li>
            The 2x2 design (Valence x Predictability) enables precise dissection of social
            learning in the brain.
          </li>
        </ul>
      </div>
    </div>
  )
}
