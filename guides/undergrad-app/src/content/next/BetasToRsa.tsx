/**
 * What's Next — Module 1: From Betas to RSA
 * Connecting the pipeline output to the RSA analysis framework.
 */

import Callout from '@src/components/Callout'

export default function BetasToRsa(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            What&rsquo;s Next
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 1 of 3</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          From Betas to RSA
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          You built the pipeline. Now here is how those beta maps become the raw material for
          Representational Similarity Analysis.
        </p>
      </div>

      <div className="prose-container">
        <h2>What You Have Built So Far</h2>
        <p>
          Take a moment to appreciate what the pipeline has produced. For each of the 38 subjects
          in the study, you now have <strong>run-wise beta maps</strong> &mdash; one 3D brain image
          per condition per run. Each voxel in each beta map contains a single number: how strongly
          that tiny brain location responded to that specific condition during that specific run.
        </p>
        <p>
          These are not smoothed. They are in standard MNI space. They have clean condition
          separation thanks to our explicit anticipation modeling. In short, they are exactly what
          RSA needs.
        </p>
        <p>
          The question now is: <strong>what do we do with them?</strong>
        </p>

        <h2>The Core Idea: Patterns as Representations</h2>
        <p>
          Here is the central insight behind RSA. When your brain processes a social stimulus &mdash;
          say, seeing feedback from a Mean-60% peer &mdash; the response is not a single number in a
          single brain region. It is a <em>pattern</em> of activity spread across many voxels in a
          region. Some voxels fire more, some less, some not at all. The specific configuration of
          these activations IS the brain&rsquo;s representation of that stimulus.
        </p>
        <p>
          Think of it like a fingerprint. The &ldquo;Mean-60% feedback&rdquo; fingerprint in the
          ventromedial prefrontal cortex looks different from the &ldquo;Nice-80% feedback&rdquo;
          fingerprint in the same region. And the <em>degree</em> of difference between fingerprints
          tells us something meaningful about how the brain organizes its knowledge.
        </p>
        <p>
          If two conditions have very similar neural fingerprints, the brain is treating them as
          similar. If the fingerprints are very different, the brain is treating them as distinct.
          RSA is the tool that measures these pattern-level relationships.
        </p>

        <h2>Step 1: Extract Patterns from ROIs</h2>
        <p>
          The first concrete step is to select brain regions of interest and extract the voxel-wise
          patterns from each one. Here is how that works.
        </p>
        <p>
          An <strong>ROI (Region of Interest)</strong> is a defined set of voxels corresponding to a
          specific brain structure or functional area. For our study, the key ROIs include regions
          implicated in social cognition and learning:
        </p>
        <ul>
          <li>
            <strong>Ventromedial prefrontal cortex (vmPFC)</strong> &mdash; valuation, social
            judgment, learning about others&rsquo; traits
          </li>
          <li>
            <strong>Temporoparietal junction (TPJ)</strong> &mdash; mentalizing, perspective-taking,
            theory of mind
          </li>
          <li>
            <strong>Amygdala</strong> &mdash; threat detection, emotional salience, uncertainty
            processing
          </li>
          <li>
            <strong>Anterior insula</strong> &mdash; interoception, prediction error, affective
            processing
          </li>
          <li>
            <strong>Posterior cingulate cortex (PCC)</strong> &mdash; self-referential processing,
            default-mode network hub
          </li>
        </ul>
        <p>
          For each ROI, we take the beta map for a given condition and run, and we extract the beta
          values for every voxel inside that ROI. The result is a <strong>vector</strong> &mdash; a
          list of numbers, one per voxel. If the vmPFC ROI contains 200 voxels, you get a vector of
          200 numbers.
        </p>
        <p>
          This vector IS the neural representation of that condition in that region. It is the
          fingerprint we mentioned above.
        </p>

        <Callout variant="tip">
          ROI selection should always be theory-driven. We do not pick brain regions at random
          or search everywhere in the brain hoping to find something. Each ROI is chosen because
          prior research gives us a specific reason to believe that region is involved in social
          learning, feedback processing, or the formation of person representations. This keeps
          the analysis focused and the results interpretable.
        </Callout>

        <h2>Step 2: Compute Pairwise Distances</h2>
        <p>
          Now we have, for each subject and each ROI, a set of vectors &mdash; one vector per
          condition. The next step is to ask: how similar or different are these vectors from each
          other?
        </p>
        <p>
          We compare every pair of condition vectors using a distance metric, typically{' '}
          <strong>1 minus the Pearson correlation</strong>. A correlation of 1.0 means the patterns
          are identical (distance = 0). A correlation of 0 means the patterns are unrelated
          (distance = 1). A negative correlation means the patterns are inverted.
        </p>
        <p>
          With 8 feedback conditions in the LEARN task, we compute distances for every pair:
        </p>
        <pre className="code-block"><code>{`Condition pairs (8 conditions):
  Mean-60% fdkm  vs  Mean-60% fdkn
  Mean-60% fdkm  vs  Mean-80% fdkm
  Mean-60% fdkm  vs  Mean-80% fdkn
  Mean-60% fdkm  vs  Nice-60% fdkm
  ...and so on for all pairs

Total unique pairs = 8 choose 2 = 28`}</code></pre>
        <p>
          These 28 distance values are arranged into an 8 x 8 matrix where each cell
          (row <em>i</em>, column <em>j</em>) contains the distance between condition{' '}
          <em>i</em> and condition <em>j</em>. The diagonal is always zero (a condition&rsquo;s
          distance from itself is zero). The matrix is symmetric: the distance from A to B equals
          the distance from B to A. So the 28 unique values live in the upper triangle.
        </p>
        <p>
          This matrix is called the <strong>Representational Dissimilarity Matrix</strong>, or RDM.
        </p>

        <Callout variant="definition">
          <strong>Representational Dissimilarity Matrix (RDM):</strong> A symmetric matrix where each
          cell encodes the dissimilarity (distance) between the neural patterns for two experimental
          conditions. The RDM captures the <em>geometry</em> of a brain region&rsquo;s representational
          space &mdash; which conditions it treats as similar and which it treats as different. The
          RDM is the fundamental data object in RSA.
        </Callout>

        <h2>What Does an RDM Tell You?</h2>
        <p>
          An RDM is a window into how a brain region organizes information. Consider a few
          possibilities for the vmPFC:
        </p>
        <ul>
          <li>
            If <strong>Nice conditions are all similar to each other</strong> and Mean conditions are
            all similar to each other, but Nice conditions are far from Mean conditions &mdash; the
            vmPFC is organized primarily by <em>valence</em> (nice vs. mean).
          </li>
          <li>
            If <strong>80% conditions cluster together</strong> and 60% conditions cluster
            together, regardless of niceness &mdash; the vmPFC is organized by <em>predictability</em>.
          </li>
          <li>
            If <strong>feedback-mean and feedback-nice conditions</strong> are the main divider
            &mdash; the vmPFC is organized by <em>feedback type</em>, tracking whether the peer
            gave mean or nice feedback.
          </li>
          <li>
            If the RDM has no clear structure &mdash; the vmPFC may not represent these conditions
            in a systematic way, or our method may not be sensitive enough to detect it.
          </li>
        </ul>
        <p>
          The beauty of RSA is that you do not have to guess. You can <em>test</em> each of these
          organizational schemes by building model RDMs and comparing them to the brain&rsquo;s
          empirical RDM.
        </p>

        <h2>Step 3: Compare to Model RDMs</h2>
        <p>
          A <strong>model RDM</strong> is a theoretical prediction about what the brain&rsquo;s RDM
          should look like if a specific hypothesis is true. You build it by hand based on your
          hypothesis, then ask: does the brain&rsquo;s actual RDM look like this?
        </p>
        <p>
          For example, the <strong>valence model RDM</strong> would look like this:
        </p>
        <pre className="code-block"><code>{`Valence model RDM:
                Mean-60m  Mean-60n  Mean-80m  Mean-80n  Nice-60m  Nice-60n  Nice-80m  Nice-80n
Mean-60m          0         0         0         0         1         1         1         1
Mean-60n          0         0         0         0         1         1         1         1
Mean-80m          0         0         0         0         1         1         1         1
Mean-80n          0         0         0         0         1         1         1         1
Nice-60m          1         1         1         1         0         0         0         0
Nice-60n          1         1         1         1         0         0         0         0
Nice-80m          1         1         1         1         0         0         0         0
Nice-80n          1         1         1         1         0         0         0         0

0 = same category (predicted similar), 1 = different category (predicted dissimilar)`}</code></pre>
        <p>
          This model says: all Mean conditions should have similar neural patterns, all Nice
          conditions should have similar neural patterns, and Mean vs. Nice should be different.
          If the brain&rsquo;s empirical RDM correlates highly with this model, it supports the
          hypothesis that the brain organizes social feedback primarily by valence.
        </p>
        <p>
          You can build model RDMs for any hypothesis you want to test: predictability, feedback
          accuracy, true peer structure, learning trajectory, and more. The comparison between
          model RDMs and brain RDMs is the core statistical test in RSA.
        </p>

        <h2>Step 4: Inter-Subject RSA</h2>
        <p>
          Everything so far has been <em>within</em> a single subject &mdash; extracting that
          subject&rsquo;s neural patterns, building their RDM, comparing to model RDMs. But our
          project has a second, equally important dimension: <strong>comparing across
          subjects</strong>.
        </p>
        <p>
          This is where the Finn et al. framework becomes essential. Inter-subject RSA (IS-RSA)
          flips the question. Instead of asking &ldquo;does this brain region&rsquo;s geometry
          match a model?&rdquo;, it asks: <strong>&ldquo;do people with similar traits show
          similar neural geometries?&rdquo;</strong>
        </p>
        <p>
          Here is how it works:
        </p>
        <ol>
          <li>
            For each subject, compute their neural pattern for a given condition in a given ROI.
          </li>
          <li>
            Build a <strong>subjects x subjects similarity matrix</strong>: for each pair of
            subjects, compute the similarity between their neural patterns. This gives you a
            matrix where each cell says &ldquo;how similar is Subject A&rsquo;s brain response to
            Subject B&rsquo;s brain response?&rdquo;
          </li>
          <li>
            Build a <strong>behavioral similarity matrix</strong>: for each pair of subjects,
            compute the similarity of their clinical scores (e.g., absolute difference in SCARED
            social anxiety scores). This gives you a matrix where each cell says &ldquo;how
            similar are Subject A and Subject B in terms of their anxiety?&rdquo;
          </li>
          <li>
            <strong>Correlate</strong> the two matrices using a Mantel test or permutation test.
            If the correlation is significant, it means people with more similar anxiety levels
            also have more similar neural patterns &mdash; a direct brain-behavior link.
          </li>
        </ol>

        <Callout variant="learn">
          This is exactly the IS-RSA framework from Finn et al. (2020). Their key innovation was
          showing that you can use inter-subject similarity in neural patterns as a window into
          individual differences. Instead of collapsing across subjects to find a group average,
          you preserve and analyze the <em>variation</em> across subjects. Our pipeline was built
          from the ground up to support this analysis: run-wise betas without smoothing, in
          standard space, ready for cross-subject comparison.
        </Callout>

        <h2>The Full RSA Workflow</h2>
        <p>
          Putting it all together, here is the complete path from pipeline output to RSA results:
        </p>
        <pre className="code-block"><code>{`Pipeline output: run-wise beta maps (per subject, per condition, per run)
                          |
                          v
Step 1: Define ROIs and extract voxel-wise beta vectors
                          |
                          v
Step 2: Compute pairwise distances --> build empirical RDMs
                          |
                   +------+------+
                   |             |
                   v             v
Step 3a:     Within-subject     Step 3b:   Inter-subject
             RSA                           RSA (IS-RSA)
             |                             |
             v                             v
Compare brain RDM        Compare subjects x subjects
to model RDMs            neural similarity matrix
(valence, predictability,  to behavioral similarity
 learning, etc.)          matrix (anxiety, etc.)
             |                             |
             v                             v
"Does this region's      "Do people with similar
geometry match this       anxiety show similar
hypothesis?"              neural patterns?"`}</code></pre>
        <p>
          Both branches of the analysis start from the same pipeline output. Both require the same
          careful preprocessing choices we have made &mdash; no smoothing, run-wise estimation,
          standard space alignment. The pipeline you learned to build in this guide is the
          foundation for everything that follows.
        </p>

        <h2>Why Our Pipeline Choices Matter for RSA</h2>
        <p>
          Let us close by connecting the pipeline design decisions you have already learned about
          back to the RSA analysis:
        </p>
        <ul>
          <li>
            <strong>No spatial smoothing</strong> &mdash; Smoothing blurs neighboring voxels
            together, destroying fine-grained spatial patterns. RSA depends on those patterns.
            If we smoothed, we would wash out the very differences between conditions that we
            are trying to measure.
          </li>
          <li>
            <strong>Run-wise beta estimation</strong> &mdash; Instead of one beta per condition
            collapsed across all runs, we get one beta per condition per run. This gives us
            multiple &ldquo;samples&rdquo; of each condition&rsquo;s neural pattern, enabling
            more reliable distance estimates and cross-validated RSA.
          </li>
          <li>
            <strong>Explicit anticipation modeling</strong> &mdash; By giving anticipation its
            own regressor, we ensure that the feedback betas reflect only feedback processing,
            not a mix of anticipation and feedback. This gives us cleaner condition-specific
            patterns.
          </li>
          <li>
            <strong>Standard space (MNI) alignment</strong> &mdash; For inter-subject RSA, we
            need to compare patterns at the same brain locations across subjects. Standard space
            alignment makes this possible. Without it, &ldquo;voxel 100 in Subject A&rdquo;
            might correspond to a completely different brain region than &ldquo;voxel 100 in
            Subject B.&rdquo;
          </li>
          <li>
            <strong>Clean condition separation</strong> &mdash; Our 8-condition feedback design,
            with feedback-mean and feedback-nice separated, gives us 28 unique pairwise
            distances &mdash; enough to distinguish between multiple hypotheses about
            representational structure.
          </li>
        </ul>
        <p>
          Every choice in the pipeline was made with RSA in mind. You are not just running scripts;
          you have been building the scaffolding for a sophisticated analysis of how the teenage
          brain represents social peers during learning.
        </p>
      </div>
    </div>
  )
}
