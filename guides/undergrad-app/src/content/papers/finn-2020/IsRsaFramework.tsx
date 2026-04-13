/**
 * Finn et al. (2020) — Section 2: The IS-RSA Framework
 */

import Callout from '@src/components/Callout'

export default function IsRsaFramework(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            Finn et al. (2020)
          </span>
          <span className="text-[var(--color-text-dim)]">·</span>
          <span className="text-xs text-[var(--color-text-muted)]">Section 2 of 6</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          The IS-RSA Framework
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          How to build a bridge between brains and behavior, one similarity matrix at a time.
        </p>
      </div>

      <div className="prose-container">
        <h2>Two Matrices, One Question</h2>
        <p>
          The core of IS-RSA is elegantly simple. You build two matrices — both are subjects ×
          subjects — and then you ask whether they're related:
        </p>
        <ol>
          <li>
            <strong>Brain similarity matrix:</strong> For each pair of subjects (i, j), how
            similar are their neural responses? This could be computed from ISC (time-course
            correlation), from pattern similarity (spatial correlation of activation maps), or
            from representational geometry (comparing each subject's RDM).
          </li>
          <li>
            <strong>Behavioral similarity matrix:</strong> For each pair of subjects (i, j),
            how similar are they on some behavioral measure? For a simple continuous score like
            anxiety, this might be the negative absolute difference: −|score_i − score_j|. The
            closer two people's scores, the higher their behavioral similarity.
          </li>
        </ol>
        <p>
          Then you correlate these two matrices (using Mantel test, distance correlation, or
          similar methods). A significant correlation means: <strong>subjects who are
          behaviorally similar also tend to be neurally similar</strong>.
        </p>

        {/* Visual summary of the two-matrix logic */}
        <div className="my-6 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
            <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              The Two Matrices — Step by Step
            </h3>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0">🧠</span>
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">Brain Similarity Matrix</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  A table where each row and column is a person. Cell (i, j) = how similar
                  person i's brain response is to person j's. Imagine a 38×38 grid for our
                  38 subjects — that's 703 unique pairs to compare.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0">📊</span>
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">Behavioral Similarity Matrix</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Same structure — 38×38 grid. But now cell (i, j) = how similar person i's
                  anxiety score is to person j's. Close scores → high similarity. Far-apart
                  scores → low similarity.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0">🔗</span>
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">Compare the Two Matrices</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Do pairs that are similar in the brain matrix tend to also be similar in the
                  behavioral matrix? A statistical test (Mantel test) answers this while accounting
                  for the fact that pairs share subjects.
                </p>
              </div>
            </div>
          </div>
        </div>

        <h2>Step by Step</h2>

        <h3>Step 1: Extract neural representations</h3>
        <p>
          For each subject, you need a neural "fingerprint" — something that captures how their
          brain responded to the stimulus. In Finn et al.'s applications with movie-watching
          data, this might be the full time course from an ROI. In our project, it's the pattern
          of beta weights across voxels in an ROI for each condition.
        </p>

        <h3>Step 2: Compute pairwise brain similarity</h3>
        <p>
          For every possible pair of subjects, compute how similar their neural representations
          are. With N subjects, this gives you an N × N symmetric matrix with 1s on the diagonal
          and similarity values in every cell.
        </p>
        <p>
          The similarity metric matters. Pearson correlation captures the <em>shape</em> of the
          pattern (ignoring magnitude). Euclidean distance captures both shape and magnitude.
          The choice depends on your question.
        </p>

        <h3>Step 3: Build the behavioral model matrix</h3>
        <p>
          This is where IS-RSA gets creative. You don't just have one way to turn behavioral
          scores into a similarity matrix — you have several, and each one embodies a different
          <em>hypothesis</em> about how brain and behavior relate.
        </p>

        <Callout variant="definition">
          <strong>Model matrix:</strong> A subjects × subjects matrix where each cell represents
          the predicted neural similarity between two subjects, based on a specific behavioral
          hypothesis. Different formulations of the model matrix test different theories.
        </Callout>

        <p>Finn et al. describe three key formulations:</p>
        <ul>
          <li>
            <strong>|i − j| (absolute difference):</strong> Similarity decreases as behavioral
            scores diverge. This is the simplest "nearest neighbors" model.
          </li>
          <li>
            <strong>mean(i, j) (average score):</strong> The average of both subjects' scores
            predicts their similarity. This captures whether high-scorers are similar to each
            other (regardless of distance between scores).
          </li>
          <li>
            <strong>min(i, j) (minimum score):</strong> The lower of the two scores predicts
            similarity. This captures the Anna Karenina effect — if <em>either</em> subject
            scores low, the pair is dissimilar.
          </li>
        </ul>

        <Callout variant="learn">
          <p>
            In our LEARN analysis, we'll build behavioral model matrices using{' '}
            <strong>SCARED social anxiety subscale scores</strong>. The absolute-difference
            formulation asks: do adolescents with similar anxiety levels show similar neural
            patterns? The min formulation asks: does having <em>any</em> anxiety in a pair
            predict neural dissimilarity?
          </p>
        </Callout>

        <h3>Step 4: Test the relationship</h3>
        <p>
          With both matrices in hand, you test whether the brain matrix correlates with the
          model matrix. Because the matrices have non-independent entries (each subject appears
          in multiple cells), you can't use a simple correlation test. Instead, you use
          permutation testing: shuffle the rows and columns of one matrix thousands of times
          and recompute the correlation each time. The p-value is the proportion of permuted
          correlations that exceed the real one.
        </p>

        <h2>What Makes This "Representational"?</h2>
        <p>
          Classical RSA (Kriegeskorte et al., 2008) compares conditions: you build a
          conditions × conditions dissimilarity matrix from each brain region and compare it
          to a model. IS-RSA adds a twist: you compare <em>subjects</em>. Each subject's
          full representational geometry (their condition × condition matrix) becomes a single
          data point, and you ask whether the pattern of inter-subject similarity in these
          geometries tracks behavioral similarity.
        </p>
        <p>
          This is a second-order comparison: RSA compares conditions within a subject; IS-RSA
          compares <em>those comparisons</em> across subjects.
        </p>

        <Callout variant="tip">
          Think of it this way: classical RSA asks <em>"does this brain region distinguish
          between conditions?"</em> IS-RSA asks <em>"do people who are similar psychologically
          also distinguish between conditions in similar ways?"</em>
        </Callout>

        <h2>Why Not Just Group-Compare?</h2>
        <p>
          You might wonder: why not just split subjects into high-anxiety and low-anxiety groups
          and compare their brain maps? This approach (the median-split) has three problems:
        </p>
        <ol>
          <li>
            <strong>Power loss:</strong> Dichotomizing a continuous variable throws away
            information and reduces statistical power.
          </li>
          <li>
            <strong>Arbitrariness:</strong> Where do you draw the line? The choice of cutpoint
            changes the results.
          </li>
          <li>
            <strong>Model blindness:</strong> A group comparison can detect "these groups
            differ" but can't distinguish <em>how</em> they differ. IS-RSA can test specific
            models (nearest-neighbors vs. Anna Karenina) that make different predictions about
            the <em>structure</em> of the brain-behavior relationship.
          </li>
        </ol>
        <p>
          IS-RSA preserves the full continuous structure of both the neural and behavioral data.
          It's not just "more powerful" — it asks a richer question.
        </p>
      </div>
    </div>
  )
}
