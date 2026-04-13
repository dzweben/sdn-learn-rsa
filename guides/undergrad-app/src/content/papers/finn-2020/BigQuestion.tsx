/**
 * Finn et al. (2020) — Section 1: The Big Question
 */

import Callout from '@src/components/Callout'
import FigureViewer from '@src/components/FigureViewer'
import fig1 from '@src/assets/papers/finn-2020/fig1_isrsa_schematic.png'

export default function BigQuestion(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Finn et al. (2020)
          </span>
          <span className="text-[var(--color-text-dim)]">·</span>
          <span className="text-xs text-[var(--color-text-muted)]">Section 1 of 6</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          The Big Question
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Why do we need a new way to study individual differences in the brain?
        </p>
      </div>

      {/* Content */}
      <div className="prose-container">
        <h2>The Problem with Averaging</h2>
        <p>
          Traditional neuroimaging studies have a paradox at their heart. We scan dozens of
          people to understand how <strong>the brain</strong> works — but the first thing we do
          with all those brains is <em>average them together</em>. The assumption: everyone's
          brain responds to the same stimulus in roughly the same way, and averaging reveals the
          "true signal" hidden under noise.
        </p>
        <p>
          For many questions, this works brilliantly. It lets us map visual cortex, motor
          areas, language networks. But there's a category of questions where averaging is not
          just imprecise — it actively <strong>destroys the signal we care about</strong>.
        </p>
        <p>
          Those questions are about <strong>individual differences</strong>.
        </p>

        <h2>Inter-Subject Correlation (ISC)</h2>
        <p>
          When people watch a movie, listen to a story, or play a game inside an fMRI scanner,
          their brains show correlated activity. This is <strong>inter-subject correlation
          (ISC)</strong> — the degree to which one person's brain time course matches another's.
          High ISC means people are "on the same page"; their brains are processing the stimulus
          similarly.
        </p>
        <p>
          ISC has been a powerful tool for studying naturalistic cognition. But it has a
          fundamental limitation: <strong>it operates at the level of subject pairs</strong>,
          not individuals. You can say "subjects A and B are highly correlated" — but you can't
          easily derive a single score for subject A alone, or ask whether subject A's
          correlation pattern relates to their personality, abilities, or clinical status.
        </p>

        <FigureViewer
          number={1}
          src={fig1}
          alt="IS-RSA schematic showing brain time series, behavioral scores, and subject relationships"
          caption="The IS-RSA framework visualized as three layers: brain data, behavioral data, and the subjects who connect them."
          source="Finn et al. (2020), Figure 1"
          explanation={
            <>
              <p><strong>This diagram has three horizontal layers — read it from top to bottom:</strong></p>
              <p>
                <strong>Top layer — "Single-region timeseries":</strong> Each line represents one
                person's brain activity over time in a specific brain region. Notice how some lines
                go up and down together (those people's brains are responding similarly) while others
                diverge (those people are processing the stimulus differently). The points on each
                line represent brain signal measurements at different time points during the scan.
              </p>
              <p>
                <strong>Middle layer — "Behavioral scores":</strong> Each line represents the same
                people, but now plotted by a behavioral measure (like an anxiety score or memory test
                score). Some people have similar scores (their lines stay close together) and some
                don't. The key question IS-RSA asks: do the people whose brain lines look similar
                <em>also</em> have similar behavioral scores?
              </p>
              <p>
                <strong>Bottom layer — "Subjects":</strong> Each circle is one person in the study
                (S₁, S₂, S₃...). The spacing between circles represents how similar or different
                those people are. In IS-RSA, we measure every possible pair of people — S₁ vs S₂,
                S₁ vs S₃, S₂ vs S₃, and so on — building a complete map of who's similar to whom
                in both brain and behavior.
              </p>
              <p>
                <strong>The big idea:</strong> If the pattern of similarity in the top layer (brain)
                matches the pattern in the middle layer (behavior), that tells us that the behavioral
                trait is genuinely related to how the brain processes the stimulus — not at the group
                average level, but at the individual level.
              </p>
            </>
          }
        />

        <Callout variant="definition">
          <strong>ISC (Inter-Subject Correlation):</strong> A measure of how similarly two
          people's brains respond to the same stimulus over time. Computed by correlating the
          BOLD time series from the same brain region across subjects.
        </Callout>

        <h2>What ISC Misses</h2>
        <p>
          Here's the crux: ISC tells us about <em>shared</em> responses. But some of the most
          interesting neuroscience questions are about <em>differences</em>. Do anxious people
          process social feedback differently from non-anxious people? Do fast learners show
          different neural patterns than slow learners? These questions need a method that
          preserves — rather than eliminates — individual variation.
        </p>
        <p>
          Finn and colleagues frame this beautifully. They decompose any person's brain signal
          into three components:
        </p>
        <ul>
          <li>
            <strong>c(t)</strong> — the <em>common</em> response, shared across subjects
            (what traditional ISC captures)
          </li>
          <li>
            <strong>id(t)</strong> — the <em>idiosyncratic</em> response, unique to that
            individual but still stimulus-driven
          </li>
          <li>
            <strong>ε(t)</strong> — noise
          </li>
        </ul>
        <p>
          Traditional methods estimate c(t) and treat everything else as noise. But id(t) —
          the stimulus-evoked response that is <em>unique to you</em> — isn't noise. It's
          signal. And it may be the most psychologically meaningful signal of all.
        </p>

        <Callout variant="learn">
          <p>
            In our LEARN study, adolescents interact with four peers who give them social
            feedback. Some teens process this feedback similarly to their peers — and some
            don't. That "don't" isn't noise. It might be the neural signature of social anxiety.
          </p>
          <p className="mt-2">
            The entire second arm of our analysis — the <strong>idiosyncrasy
            hypothesis</strong> — asks: do socially anxious teens process peer feedback in
            more individually unique ways?
          </p>
        </Callout>

        <h2>Enter IS-RSA</h2>
        <p>
          Finn et al. propose a solution: <strong>Inter-Subject Representational Similarity
          Analysis (IS-RSA)</strong>. It's a framework that takes the subjects × subjects
          similarity matrix from ISC and asks: does the <em>pattern</em> of pairwise brain
          similarity relate to the <em>pattern</em> of pairwise behavioral similarity?
        </p>
        <p>
          In plain language: if two people are similar on some behavioral trait (say, both
          have low anxiety), are their brains also similar? And if two people differ on that
          trait (one high, one low anxiety), do their brains differ too?
        </p>
        <p>
          This is the leap from "does the brain respond to this stimulus?" to{' '}
          <strong>"does the brain respond <em>differently</em> based on who you are?"</strong>
        </p>

        <Callout variant="tip">
          IS-RSA is called <em>"inter-subject"</em> because the similarity matrix compares
          people to people (not conditions to conditions, like classical RSA). It's called{' '}
          <em>"representational similarity"</em> because it connects neural geometry to
          behavioral geometry.
        </Callout>

        <h2>Why This Paper Matters</h2>
        <p>
          Before Finn et al. (2020), the connection between ISC and individual traits was
          ad hoc — researchers would split subjects into groups (high vs. low on some measure)
          and compare their ISC values. This works, but it's blunt. It discards the continuous
          nature of most behavioral measures and can't detect nuanced patterns like the Anna
          Karenina effect (which we'll explore in Section 3).
        </p>
        <p>
          IS-RSA provides a principled, flexible framework that:
        </p>
        <ul>
          <li>Works with <strong>continuous behavioral measures</strong> (not just group splits)</li>
          <li>Can test <strong>specific models</strong> of how brain-behavior relationships might look</li>
          <li>Naturally handles <strong>naturalistic stimuli</strong> (movies, stories, games, social interactions)</li>
          <li>Connects to the broader RSA literature on <strong>representational geometry</strong></li>
        </ul>
        <p>
          This is why it's the methodological backbone of our project. Everything in the LEARN
          RSA pipeline — from timing files to GLMs to the final analysis — builds toward
          creating the data structures that IS-RSA needs to answer our questions.
        </p>
      </div>
    </div>
  )
}
