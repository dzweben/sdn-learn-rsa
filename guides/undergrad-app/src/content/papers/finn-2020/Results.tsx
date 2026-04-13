/**
 * Finn et al. (2020) — Section 4: Results
 *
 * What Finn et al. found when they applied IS-RSA to HCP movie data.
 */

import Callout from '@src/components/Callout'
import FigureViewer from '@src/components/FigureViewer'
import fig3 from '@src/assets/papers/finn-2020/fig3_working_memory.png'
import fig4 from '@src/assets/papers/finn-2020/fig4_personality.png'
import fig5 from '@src/assets/papers/finn-2020/fig5_tuning_curves.png'

export default function Results(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Finn et al. (2020)
          </span>
          <span className="text-[var(--color-text-dim)]">·</span>
          <span className="text-xs text-[var(--color-text-muted)]">Section 4 of 6</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Results
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          What happens when you apply IS-RSA to real data? Working memory, personality, and
          the brain maps that emerge.
        </p>
      </div>

      <div className="prose-container">
        <h2>The Data</h2>
        <p>
          Finn et al. tested their framework on data from the <strong>Human Connectome Project
          (HCP)</strong>. Participants watched a series of short movie clips while being
          scanned — a "naturalistic" stimulus that engages a wide range of cognitive and
          emotional processes. The HCP also collected extensive behavioral data on each
          participant, including cognitive scores (like working memory performance) and
          personality measures.
        </p>
        <p>
          This is a ideal dataset for IS-RSA: a rich, complex stimulus that likely evokes
          both shared and idiosyncratic responses, combined with detailed behavioral
          characterization of each participant.
        </p>

        <h2>Working Memory: A Clear Anna Karenina</h2>
        <p>
          When Finn et al. built IS-RSA models using working memory scores and movie-watching
          brain data, they found a striking pattern. The <strong>Anna Karenina model
          (min formulation) provided the best fit</strong> in regions of the frontoparietal
          network — areas known to be involved in cognitive control and working memory.
        </p>
        <p>
          What this means concretely: participants who scored high on working memory tasks
          showed <em>highly similar</em> brain responses to the movies in frontoparietal
          regions. They were processing the movies in a shared, convergent way. Participants
          who scored low on working memory showed <em>divergent</em> brain responses — each
          low-performer was different in their own way.
        </p>

        <FigureViewer
          number={3}
          src={fig3}
          alt="Working memory IS-RSA results showing Nearest Neighbors and Anna Karenina models with brain maps"
          caption="IS-RSA results for working memory — the Anna Karenina model (bottom) shows stronger, more widespread effects than Nearest Neighbors (top)."
          source="Finn et al. (2020), Figure 3"
          explanation={
            <>
              <p><strong>This figure has two rows, each testing a different model of how working memory relates to brain similarity:</strong></p>
              <p>
                <strong>Top row — "NN" (Nearest Neighbors):</strong> The scatter plot on the left
                shows how well the Nearest Neighbors model fits the data. Each dot represents one
                brain region. The x-axis is the IS-RSA result in one group of subjects ("Cohort 1")
                and the y-axis is the result in a different group ("Cohort 2"). Dots falling along
                the diagonal line mean the effect <em>replicated</em> across groups — a good sign.
                To the right are brain images ("glass brains") where colored regions are those
                showing a significant relationship between brain similarity and working memory
                scores. Warmer colors = stronger effects.
              </p>
              <p>
                <strong>Bottom row — "AnnaK" (Anna Karenina):</strong> Same format, but testing the
                Anna Karenina model. Notice two things: (1) the scatter dots cluster more tightly
                along the diagonal (better replication), and (2) the brain maps show MORE colored
                regions and WARMER colors. This means the Anna Karenina model fits the data better
                than Nearest Neighbors — particularly in frontoparietal regions (the areas along
                the top and front of the brain).
              </p>
              <p>
                <strong>What this means in plain language:</strong> People with high working memory
                scores all process movies in a similar way (their brains "agree"). People with low
                working memory scores each process movies in their own unique way (their brains
                "disagree"). This is the classic Anna Karenina pattern — high performers converge,
                low performers each fail differently.
              </p>
            </>
          }
        />

        <Callout variant="tip">
          The Anna Karenina pattern for working memory aligns with a broader principle: good
          cognitive performance often means your brain is doing what it "should" be doing —
          the efficient, canonical response. Poor performance doesn't mean your brain does the
          opposite; it means it fails in unpredictable, individually specific ways.
        </Callout>

        <h2>Personality: A More Complex Picture</h2>
        <p>
          For personality traits (extraversion, neuroticism, agreeableness, openness,
          conscientiousness), the results were more nuanced. Different traits showed different
          patterns in different brain regions:
        </p>
        <ul>
          <li>
            Some trait-region combinations showed <strong>Nearest Neighbors</strong>
            patterns — the absolute-difference model was the best fit.
          </li>
          <li>
            Others showed <strong>Anna Karenina</strong> patterns — but the direction varied.
            For some traits, high-scorers converged; for others, low-scorers converged.
          </li>
          <li>
            The effects were generally <em>smaller</em> and <em>more distributed</em> than
            for working memory — consistent with personality being a subtler, more diffuse
            influence on brain processing.
          </li>
        </ul>
        <p>
          This heterogeneity is actually informative: it tells us that the relationship between
          traits and neural processing isn't one-size-fits-all. The "right" model depends on
          which trait you're looking at and where in the brain you're looking.
        </p>

        <FigureViewer
          number={4}
          src={fig4}
          alt="Personality IS-RSA results showing different models fitting different trait-region combinations"
          caption="IS-RSA results for personality traits — more complex and varied than working memory, with different models fitting different traits in different brain regions."
          source="Finn et al. (2020), Figure 4"
          explanation={
            <>
              <p><strong>This figure is larger and more complex than the working memory figure, because personality is itself more complex. It has two parts:</strong></p>
              <p>
                <strong>Part (a) — "Personality: Itemwise":</strong> Instead of using a single
                summary score for each personality trait, this analysis uses all the individual
                questionnaire responses. The scatter plot shows replication across cohorts (like
                Figure 3). The brain images show where personality-related brain similarity was
                significant. Notice the colored regions are in different places than the working
                memory results — personality affects social and default-mode brain regions rather
                than cognitive control regions.
              </p>
              <p>
                <strong>Part (b) — "Personality: Trait scores":</strong> This is a grid of 5
                columns (one for each Big Five trait: Agreeableness, Extraversion,
                Conscientiousness, Openness, Neuroticism) × 2 rows (top = Nearest Neighbors,
                bottom = Anna Karenina). Each small scatter plot tests one model for one trait.
                If dots cluster along the diagonal, that model fits well for that trait.
              </p>
              <p>
                <strong>Reading the (n.s.) labels:</strong> "(n.s.)" means "not significant" —
                that particular combination of model + trait didn't show a reliable effect. Notice
                that some traits show effects and others don't. This is the key finding:
                personality's relationship to brain similarity is <em>trait-specific</em> and
                <em>region-specific</em>.
              </p>
              <p>
                <strong>Why this matters for us:</strong> Social anxiety (what we measure) is
                related to personality traits like Neuroticism. The fact that personality effects
                are complex and regionally specific tells us to look carefully in the right brain
                regions — the answer won't be the same everywhere.
              </p>
            </>
          }
        />

        <h2>The Importance of Brain Region</h2>
        <p>
          A critical finding: the IS-RSA effects were <strong>regionally specific</strong>.
          Working memory effects appeared in frontoparietal networks, not in visual cortex.
          Personality effects appeared in default-mode and social brain regions, not in
          sensorimotor cortex.
        </p>
        <p>
          This makes perfect sense — the brain regions where individual differences manifest
          should be the regions that are actually processing the relevant information. But it
          has an important methodological implication: <strong>you need to look in the right
          place</strong>. A whole-brain average would wash out these effects.
        </p>

        <Callout variant="learn">
          <p>
            This regional specificity is directly relevant to our LEARN analysis. We're not
            looking everywhere in the brain — we're focusing on specific ROIs that theory
            predicts should be involved in social feedback processing:
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              <strong>Ventromedial prefrontal cortex (vmPFC)</strong> — value computation,
              learning about others
            </li>
            <li>
              <strong>Temporoparietal junction (TPJ)</strong> — mentalizing, theory of mind
            </li>
            <li>
              <strong>Anterior insula</strong> — interoception, social pain
            </li>
            <li>
              <strong>Amygdala</strong> — threat detection, social salience
            </li>
            <li>
              <strong>Striatum</strong> — prediction error, reward learning
            </li>
          </ul>
          <p className="mt-2">
            If social anxiety produces Anna Karenina-like idiosyncrasy in social learning, we'd
            expect to see it most strongly in these social-affective regions — not in primary
            visual or motor cortex.
          </p>
        </Callout>

        <h2>Validation and Robustness</h2>
        <p>
          Finn et al. took several steps to validate their approach:
        </p>
        <ul>
          <li>
            <strong>Split-half reliability:</strong> They split the movie data into two halves
            and showed that the IS-RSA effects replicated across halves.
          </li>
          <li>
            <strong>Permutation testing:</strong> All statistical tests used permutation
            methods to avoid the non-independence problem inherent in pairwise matrices.
          </li>
          <li>
            <strong>Multiple comparison correction:</strong> Brain-wide results were corrected
            for the number of regions tested.
          </li>
          <li>
            <strong>Effect size characterization:</strong> The paper carefully reports effect
            sizes, not just p-values, giving readers a sense of how large and practically
            meaningful the effects are.
          </li>
        </ul>
        <p>
          These validation steps are important because IS-RSA, like any method that computes
          pairwise similarities, can be sensitive to outliers and sample-specific noise. The
          robustness checks give confidence that the patterns are real.
        </p>

        <FigureViewer
          number={5}
          src={fig5}
          alt="Theoretical stimulus tuning curves showing the relationship between average synchrony and sensitivity to individual differences"
          caption="Theoretical tuning curves: stimuli that evoke moderate synchrony across people (middle of x-axis) may be the 'sweet spot' for detecting meaningful individual differences."
          source="Finn et al. (2020), Figure 5"
          explanation={
            <>
              <p><strong>This is a theoretical diagram about what kinds of stimuli are best for detecting individual differences:</strong></p>
              <p>
                <strong>The x-axis — "Average synchrony evoked":</strong> This represents how
                much a stimulus makes everyone's brain respond the same way. At 0 (far left),
                the stimulus evokes completely random responses — no one agrees. At 1 (far right),
                everyone's brain responds identically — perfect synchrony. Most stimuli fall
                somewhere in between.
              </p>
              <p>
                <strong>The y-axis — "Sensitivity to individual differences":</strong> This is how
                well you can detect that people differ from each other in a meaningful way. Higher
                = better at detecting individual differences.
              </p>
              <p>
                <strong>The curves:</strong> Each colored curve (red, orange, yellow) represents a
                different theoretical scenario. The key insight is that the curves peak in the
                MIDDLE of the x-axis, not at the extremes. A stimulus that evokes NO synchrony
                (far left) is just noise — you can't tell meaningful differences from random
                variation. A stimulus that evokes PERFECT synchrony (far right) leaves no room
                for individual differences to emerge. The "sweet spot" is moderate synchrony —
                enough shared structure that the signal is meaningful, but enough variability that
                individual differences can shine through.
              </p>
              <p>
                <strong>The arrows</strong> at the bottom point to different positions along the
                x-axis, representing different types of stimuli. The downward arrows suggest
                optimal stimulus choices for maximizing sensitivity.
              </p>
              <p>
                <strong>Why this matters:</strong> Our LEARN task hits this sweet spot. It's
                structured enough (controlled peer interactions with known feedback patterns) to
                produce shared neural responses, but complex enough (social learning with hidden
                tendencies) to let individual differences in social processing emerge.
              </p>
            </>
          }
        />

        <Callout variant="warning">
          One limitation acknowledged by Finn et al.: the HCP sample is relatively
          homogeneous (healthy young adults). The Anna Karenina effects might be stronger in
          more diverse or clinical samples where the range of individual differences is wider.
          Our LEARN sample — adolescents with varying levels of social anxiety — may actually
          be better positioned to detect these effects.
        </Callout>
      </div>
    </div>
  )
}
