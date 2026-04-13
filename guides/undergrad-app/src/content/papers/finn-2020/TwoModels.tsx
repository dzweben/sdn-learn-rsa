/**
 * Finn et al. (2020) — Section 3: Two Models of Individuality
 *
 * The Anna Karenina model vs. the Nearest Neighbors model.
 * This is conceptually central — it defines the two competing
 * hypotheses about how traits relate to neural similarity.
 */

import Callout from '@src/components/Callout'
import FigureViewer from '@src/components/FigureViewer'
import fig2 from '@src/assets/papers/finn-2020/fig2_four_models.png'

export default function TwoModels(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Finn et al. (2020)
          </span>
          <span className="text-[var(--color-text-dim)]">·</span>
          <span className="text-xs text-[var(--color-text-muted)]">Section 3 of 6</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Two Models of Individuality
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          "All happy families are alike; each unhappy family is unhappy in its own way."
        </p>
        <p className="text-xs text-[var(--color-text-dim)] mt-1 italic">
          — Leo Tolstoy, Anna Karenina (1878)
        </p>
      </div>

      <div className="prose-container">
        <h2>The Central Distinction</h2>
        <p>
          When brain similarity and behavioral traits are related, <em>how</em> are they
          related? Finn et al. identify two fundamentally different patterns that could
          produce a brain-behavior correlation — and they have very different implications
          for what individual differences actually mean.
        </p>
        <p>
          Understanding the distinction between these two models isn't just an academic
          exercise. It directly shapes how we interpret our LEARN results. Does social anxiety
          shift your brain along a shared dimension, or does it fracture the shared
          representation entirely? These are qualitatively different claims about what anxiety
          <em>does</em> to social cognition.
        </p>

        <h2>Model 1: Nearest Neighbors</h2>
        <p>
          The <strong>Nearest Neighbors</strong> model is the intuitive one. It says: people
          who are similar on a behavioral trait will have similar brain responses, and people
          who are different on that trait will have different brain responses. Neural similarity
          scales with behavioral proximity.
        </p>
        <p>
          Formally: the predicted neural similarity between subjects i and j is a function of
          the <strong>absolute difference</strong> in their behavioral scores:
        </p>
        <pre><code>predicted_similarity(i, j) ∝ −|score_i − score_j|</code></pre>
        <p>
          In this model, everyone's brain occupies a position along a <em>shared dimension</em>.
          High-anxiety people are at one end, low-anxiety people at the other, and medium-anxiety
          people are in between. The brain "representation space" has a single axis that aligns
          with the behavioral trait.
        </p>

        <FigureViewer
          number={2}
          src={fig2}
          alt="Simulated similarity matrices and t-SNE embeddings for Nearest Neighbors and Anna Karenina models"
          caption="Simulated brain similarity structures showing how different models predict different patterns of inter-subject similarity."
          source="Finn et al. (2020), Figure 2"
          explanation={
            <>
              <p><strong>This figure shows four different ways brain similarity could relate to a behavioral score. Each row is a different model:</strong></p>
              <p>
                <strong>Row (a) — Nearest Neighbors [abs(i − j)]:</strong> On the left is a
                "similarity matrix" — think of it as a big table where both the rows and columns
                are people, sorted by their behavioral score (low at top-left, high at
                bottom-right). Each colored cell shows how similar two people's brains are.{' '}
                <em>Warm colors (red/orange) = very similar brains; cool colors (blue) = very
                different brains.</em> Notice the warm diagonal band — people with similar scores
                (close to the diagonal) have similar brains. On the right is a "scatter plot"
                where each dot is a person, positioned so similar people cluster together. The
                dots are colored by their behavioral score. In the Nearest Neighbors model, dots
                form a smooth gradient from blue (low) to red (high).
              </p>
              <p>
                <strong>Row (b) — Anna Karenina, mean(i, j):</strong> The similarity matrix looks
                different now. The warm (similar) cells are concentrated in the bottom-right
                corner — that's where BOTH people in the pair score high. Pairs involving a
                low-scorer are cool (dissimilar). In the scatter plot, high-scorers (red dots)
                cluster tightly together while low-scorers (blue dots) are scattered everywhere.
              </p>
              <p>
                <strong>Row (c) — Anna Karenina, min(i, j):</strong> Similar to (b) but with a
                sharper pattern. The red diagonal line shows where the minimum score in each pair
                falls. Below this line (where at least one person scores low), similarity drops.
                In the scatter, high-scorers form a tight cluster; low-scorers are spread out in
                all directions.
              </p>
              <p>
                <strong>Row (d) — Combined: abs(i − j) × mean(i, j):</strong> A hybrid model that
                captures both effects simultaneously.
              </p>
              <p>
                <strong>The key takeaway:</strong> In Nearest Neighbors (a), everyone is equally
                predictable — high-scorers are just as alike as low-scorers. In Anna Karenina
                (b, c), there's an asymmetry — one end of the scale converges while the other
                scatters. This asymmetry is what makes Anna Karenina such a powerful concept
                for understanding conditions like anxiety.
              </p>
            </>
          }
        />

        <p>
          <strong>Key property:</strong> In the Nearest Neighbors model, high-scoring subjects
          are just as predictable as low-scoring subjects. Two people with high anxiety are
          as neurally similar to each other as two people with low anxiety — what matters is
          only the <em>distance</em> between their scores, not the scores themselves.
        </p>

        <Callout variant="definition">
          <strong>Nearest Neighbors model:</strong> Neural similarity between two people is
          predicted by how close their behavioral scores are. The formulation uses absolute
          difference: −|score_i − score_j|. This assumes the trait maps linearly onto a
          shared neural dimension.
        </Callout>

        <h2>Model 2: Anna Karenina</h2>
        <p>
          The <strong>Anna Karenina</strong> model is named after Tolstoy's famous opening
          line. It says: people who score high on the "good" end of a trait all look alike
          neurally — they converge on a shared representation. But people who score low (or
          high on a "bad" trait) are each different <em>in their own way</em>. They don't
          converge on an alternative representation — they <strong>scatter</strong>.
        </p>
        <p>
          Formally: the predicted neural similarity between subjects i and j is a function of
          the <strong>minimum</strong> of their behavioral scores:
        </p>
        <pre><code>predicted_similarity(i, j) ∝ min(score_i, score_j)</code></pre>
        <p>
          Why the minimum? Because in this model, it only takes <strong>one</strong> member
          of the pair to be atypical to make the pair dissimilar. If subject i has low anxiety
          and subject j has high anxiety, their neural similarity is low — driven by j's
          atypicality. But if <em>both</em> have low anxiety, their similarity is high, because
          they both converge on the "typical" representation.
        </p>

        {/* Figure 2 already shown above — no duplicate needed here */}

        <h2>The Difference in Practice</h2>
        <p>
          Here's a concrete example to make this tangible. Imagine we have three participants:
        </p>
        <ul>
          <li><strong>Alice</strong> — low social anxiety (score: 2)</li>
          <li><strong>Bob</strong> — low social anxiety (score: 3)</li>
          <li><strong>Carol</strong> — high social anxiety (score: 9)</li>
        </ul>

        <p>Under <strong>Nearest Neighbors</strong>:</p>
        <ul>
          <li>Alice-Bob similarity: HIGH (|2-3| = 1, small difference)</li>
          <li>Alice-Carol similarity: LOW (|2-9| = 7, large difference)</li>
          <li>Bob-Carol similarity: LOW (|3-9| = 6, large difference)</li>
        </ul>
        <p>
          The key prediction: Alice and Bob are similar <em>because they're close in score</em>.
          If we added David (score: 8), then Carol-David would be HIGH (|9-8| = 1). High-anxiety
          people would be just as similar to each other as low-anxiety people.
        </p>

        <p>Under <strong>Anna Karenina</strong>:</p>
        <ul>
          <li>Alice-Bob similarity: HIGH (min(2,3) = 2... wait — here we need to flip it)</li>
        </ul>

        <p>
          Actually, let's think about this more carefully with the social anxiety framing. In
          the Anna Karenina model as applied to anxiety:
        </p>
        <ul>
          <li>
            <strong>Low-anxiety teens converge:</strong> Their brains process social feedback
            in similar, "normative" ways. They've all converged on a shared way of
            interpreting peer interactions.
          </li>
          <li>
            <strong>High-anxiety teens diverge:</strong> Each anxious teen's brain processes
            feedback idiosyncratically. One might hyper-focus on rejection cues, another might
            dissociate, another might ruminate — each has their own atypical pattern.
          </li>
        </ul>
        <p>
          The model predicts that pairs of low-anxiety teens will have <em>high</em> neural
          similarity, and any pair involving a high-anxiety teen will have <em>low</em>
          similarity — not because anxious brains converge on an "anxious pattern," but
          because they each go their own way.
        </p>

        <Callout variant="learn">
          <p>
            This is exactly our <strong>Hypothesis B</strong> in the LEARN RSA project. We
            compute an idiosyncrasy score for each participant — how much their neural
            representation of feedback deviates from the group average — and correlate it with
            SCARED social anxiety scores.
          </p>
          <p className="mt-2">
            The Anna Karenina prediction: non-anxious adolescents will show low idiosyncrasy
            (they all look alike), while anxious adolescents will show high idiosyncrasy
            (each unique in their own way). This is a <em>qualitatively different</em>
            prediction from the Nearest Neighbors model, which would predict that anxious
            teens converge on a shared "anxious representation."
          </p>
        </Callout>

        <h2>How Finn et al. Distinguish the Models</h2>
        <p>
          The beauty of the IS-RSA framework is that you can test both models simultaneously.
          You build two behavioral model matrices — one using absolute difference (Nearest
          Neighbors), one using minimum (Anna Karenina) — and see which one better predicts
          the neural similarity matrix.
        </p>
        <p>
          Finn et al. also describe a third formulation using <strong>mean(i, j)</strong>,
          which captures whether high-scorers are neurally similar regardless of their distance.
          The mean formulation is closely related to the Anna Karenina model but has slightly
          different statistical properties.
        </p>

        <div className="my-6 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              The Three Formulations at a Glance
            </h3>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {[
              {
                name: '|i − j|',
                label: 'Nearest Neighbors',
                meaning: 'Similarity scales with score proximity',
                predicts: 'High-scorers are as alike as low-scorers'
              },
              {
                name: 'mean(i, j)',
                label: 'Average Model',
                meaning: 'Higher average score → higher similarity',
                predicts: 'Both scoring high → neural convergence'
              },
              {
                name: 'min(i, j)',
                label: 'Anna Karenina',
                meaning: 'One atypical member → pair is dissimilar',
                predicts: 'High-scorers alike; low-scorers each unique'
              }
            ].map((row) => (
              <div key={row.name} className="grid grid-cols-[80px_1fr_1fr] gap-4 px-5 py-3 text-sm">
                <code className="text-[var(--color-accent-bright)] font-mono text-xs self-center">
                  {row.name}
                </code>
                <div>
                  <div className="font-medium text-[var(--color-text-primary)] text-xs">{row.label}</div>
                  <div className="text-[var(--color-text-muted)] text-xs mt-0.5">{row.meaning}</div>
                </div>
                <div className="text-[var(--color-text-secondary)] text-xs self-center">
                  {row.predicts}
                </div>
              </div>
            ))}
          </div>
        </div>

        <h2>Why This Matters Deeply</h2>
        <p>
          The Nearest Neighbors model and the Anna Karenina model make fundamentally different
          claims about the <em>nature</em> of individual differences:
        </p>
        <ul>
          <li>
            <strong>Nearest Neighbors</strong> implies that individual differences are
            <em>parametric</em> — like turning a dial. Anxiety doesn't change the kind of
            processing, just how much of it you do. All brains are doing the same thing, just
            to different degrees.
          </li>
          <li>
            <strong>Anna Karenina</strong> implies that individual differences are
            <em>qualitative</em> at the extremes. Typical people converge on a shared
            processing strategy. Atypical people don't just do less of it — they do
            <em>something else entirely</em>, and that "something else" is different for each
            person.
          </li>
        </ul>
        <p>
          For social anxiety research, this distinction matters enormously. If anxiety is
          parametric (Nearest Neighbors), then all anxious teens are anxious in the same way,
          and interventions can target a shared mechanism. If anxiety produces idiosyncrasy
          (Anna Karenina), then each anxious teen may need a different understanding — there
          isn't one "anxious brain pattern" to target.
        </p>

        <Callout variant="tip">
          Finn et al. found that for <strong>working memory</strong>, the Anna Karenina model
          provided a better fit — high-performing subjects converged neurally, while
          low-performing subjects diverged. For <strong>personality traits</strong>, the
          picture was more complex and varied by brain region. The "right" model depends on
          the trait and the brain system. Our job is to find out which model fits social
          anxiety during social learning.
        </Callout>
      </div>
    </div>
  )
}
