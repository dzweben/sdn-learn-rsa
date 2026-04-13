/**
 * Finn et al. (2020) — Section 5: Implications
 */

import Callout from '@src/components/Callout'

export default function Implications(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Finn et al. (2020)
          </span>
          <span className="text-[var(--color-text-dim)]">·</span>
          <span className="text-xs text-[var(--color-text-muted)]">Section 5 of 6</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Implications
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          What "idiosynchrony" means for how we study the brain — and for clinical neuroscience.
        </p>
      </div>

      <div className="prose-container">
        <h2>Naturalistic Stimuli Reveal What Tasks Cannot</h2>
        <p>
          One of Finn et al.'s most important arguments is that <strong>naturalistic
          stimuli</strong> — movies, stories, real-world interactions — are uniquely powerful
          for studying individual differences. Here's why:
        </p>
        <p>
          Traditional task-based fMRI uses simple, controlled stimuli: press a button when
          you see a face, remember a sequence of letters, decide if a statement is true or
          false. These tasks are excellent for isolating specific cognitive processes, but they
          leave little room for individuals to <em>differ</em>. The "correct" neural response
          is largely dictated by the task design.
        </p>
        <p>
          Naturalistic stimuli are different. A movie scene where a character is rejected by
          a friend can be processed in many ways. You might focus on the character's facial
          expression, or their body language, or the social dynamics, or the narrative context,
          or your own emotional response to rejection. These different processing strategies
          — which are influenced by your personality, experiences, and clinical status — become
          visible in the brain data.
        </p>
        <p>
          In Finn's words, naturalistic stimuli create the conditions where the
          <strong>idiosyncratic component id(t)</strong> is large enough to detect and
          psychologically meaningful.
        </p>

        <Callout variant="learn">
          <p>
            The LEARN task sits in a perfect sweet spot. It's <em>more controlled</em> than
            a passive movie (we know exactly what feedback each participant saw and when) but
            <em>more naturalistic</em> than a simple cognitive task (participants are actively
            learning about and forming impressions of peers). The social learning context —
            predicting and receiving feedback from peers with hidden tendencies — creates rich
            opportunities for individual processing differences to emerge.
          </p>
        </Callout>

        <h2>Beyond Group Averages in Clinical Research</h2>
        <p>
          For clinical neuroscience, the IS-RSA framework opens an important door. Traditional
          case-control studies compare the <em>average</em> brain response of a clinical group
          to a control group. But many clinical conditions — particularly those involving social
          and emotional processing — may not produce a single, consistent neural difference.
        </p>
        <p>
          Consider social anxiety. It's not one thing. Some people with social anxiety fear
          negative evaluation; others fear positive attention; others have specific social
          phobias. If each anxious person's brain adapts to their <em>specific</em> variant
          of anxiety in a <em>different</em> way, then the average "anxious brain" will look
          like noise — not because the effect isn't there, but because the effects cancel each
          other out.
        </p>
        <p>
          IS-RSA provides a way to detect this: instead of asking "is the anxious brain
          different from the non-anxious brain?", you ask "are anxious brains more
          <em>different from each other</em> than non-anxious brains?" This is the
          idiosyncrasy hypothesis — and it can detect effects that group-average comparisons
          would completely miss.
        </p>

        <Callout variant="tip">
          Recent work has validated this idea. Camacho et al. (2024) found no
          differences in average brain activation between high-SA and low-SA youth, but
          found <em>higher inter-subject variability</em> in the high-SA group — exactly
          the Anna Karenina pattern. The signal wasn't in the average; it was in the scatter.
        </Callout>

        <h2>Idiosyncrasy as a Biomarker</h2>
        <p>
          Finn et al. suggest that <strong>idiosyncrasy itself</strong> — not any specific
          atypical pattern — might serve as a biomarker for certain conditions. If you can
          compute how much a person's brain deviates from the group norm, that single number
          captures something meaningful about their cognitive style.
        </p>
        <p>
          This has been supported by subsequent work:
        </p>
        <ul>
          <li>
            <strong>Baek et al. (2023)</strong> found that lonelier individuals process
            narrative stimuli more idiosyncratically — their brains diverge more from the
            group average, especially in default-mode regions.
          </li>
          <li>
            <strong>Shen et al. (2025)</strong> found that pre-existing neural similarity
            predicts who becomes friends — shared neural geometry has real social consequences.
          </li>
          <li>
            <strong>Camacho et al. (2024)</strong> showed that social anxiety in youth is
            linked to higher inter-subject variability in brain responses, particularly in
            posterior cingulate, supramarginal gyrus, and inferior frontal gyrus.
          </li>
        </ul>

        <h2>Methodological Implications</h2>
        <p>
          The paper also has practical methodological takeaways that directly inform our
          analysis pipeline:
        </p>

        <h3>No spatial smoothing</h3>
        <p>
          IS-RSA (like classical RSA) works best with fine-grained spatial patterns. Spatial
          smoothing — which blurs neighboring voxels together — destroys the very information
          that RSA needs. This is why our GLM pipeline explicitly omits the smoothing step that
          most fMRI analyses include.
        </p>

        <h3>Run-wise estimation</h3>
        <p>
          To compute stable similarity estimates, you want multiple "samples" of each
          condition's neural pattern. Run-wise beta estimation — getting one pattern per
          condition per run, rather than one pattern per condition collapsed across all
          runs — gives us this. It's more estimation work, but it produces richer data for
          RSA.
        </p>

        <h3>ROI-based analysis</h3>
        <p>
          While whole-brain searchlight approaches are possible, Finn et al.'s results suggest
          that targeted ROI analyses are more sensitive. Effects are regionally specific, and
          testing everywhere adds a massive multiple-comparisons burden. Starting with
          theory-driven ROIs (as we'll do) is the right approach.
        </p>

        <Callout variant="learn">
          <p>
            Every design choice in our pipeline traces back to these principles. No smoothing
            → preserves patterns for RSA. Run-wise betas → multiple samples per condition.
            Theory-driven ROIs → maximize sensitivity in the right places. Duration modulation
            → accurate modeling of variable-length events. It's all connected.
          </p>
        </Callout>

        <h2>The Bigger Picture</h2>
        <p>
          Perhaps the deepest implication of this work is philosophical. For decades,
          neuroimaging has been primarily about mapping <em>shared</em> brain function — what
          the brain does, on average, in response to a stimulus. Finn et al. argue that what
          makes the brain <em>interesting</em> might be precisely what makes it
          <em>different</em> across people.
        </p>
        <p>
          The shift from "what does the brain do?" to "how does the brain differ?" isn't just a
          methodological tweak. It's a change in what we're trying to explain. And it connects
          neuroimaging to the oldest questions in psychology: why do we each experience the
          world in our own way?
        </p>
      </div>
    </div>
  )
}
