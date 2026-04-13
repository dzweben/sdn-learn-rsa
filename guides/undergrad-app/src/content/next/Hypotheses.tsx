/**
 * What's Next — Module 2: The Hypotheses
 * Preview of the RSA hypotheses from the project masterplan.
 */

import Callout from '@src/components/Callout'

export default function Hypotheses(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            What&rsquo;s Next
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 2 of 3</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          The Hypotheses
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          Three questions that drive the entire project &mdash; and why the pipeline you built is
          exactly what we need to answer them.
        </p>
      </div>

      <div className="prose-container">
        <h2>From Pipeline to Science</h2>
        <p>
          You have spent this guide learning the mechanics of the pipeline: fixing events,
          generating timing files, running GLMs, producing beta maps. But a pipeline is only as
          meaningful as the scientific questions it serves. So let us talk about the questions.
        </p>
        <p>
          The LEARN RSA project has three core hypotheses. Each one asks something different about
          how the teenage brain processes social feedback, and each one demands a specific type of
          analysis. Together, they form a coherent story about social learning, individual
          differences, and anxiety.
        </p>

        <h2>Hypothesis A: Learning Alignment</h2>
        <p>
          The first hypothesis is about <strong>learning</strong>. Over the course of the task,
          participants receive repeated feedback from four peers with hidden tendencies. Two peers
          are Nice (mostly positive feedback), two are Mean (mostly negative). Two are predictable
          (80% consistent), two are less so (60% consistent). The question is:
        </p>
        <p>
          <strong>Does the brain&rsquo;s representational structure come to reflect the true peer
          structure over time?</strong>
        </p>
        <p>
          At the start of the task &mdash; run 1 &mdash; participants know nothing about the peers.
          The neural patterns for all four peer types should be relatively undifferentiated. The
          brain has not yet learned who is who.
        </p>
        <p>
          But by run 4, participants have received enough feedback to have formed impressions. If
          learning has occurred, we would expect the brain&rsquo;s RDM to have shifted: neural
          patterns for peers with similar dispositions (both Nice, or both Mean) should have become
          more similar to each other, while patterns for peers with different dispositions should
          have become more distinct.
        </p>
        <p>
          In concrete terms: we build a &ldquo;true peer structure&rdquo; model RDM that encodes
          the actual relationships between peers (Nice-80% is most similar to Nice-60%, most
          different from Mean-80%, etc.). Then we compare this model to the brain&rsquo;s empirical
          RDM separately for each run. The prediction:
        </p>
        <pre className="code-block"><code>{`Run 1: Low correlation between brain RDM and true-structure model
  (brain hasn't learned the peer structure yet)

Run 2: Slightly higher correlation
  (partial learning)

Run 3: Higher still
  (clearer peer representations)

Run 4: Highest correlation
  (brain's geometry now mirrors the true peer structure)

This trajectory = evidence that social learning reshapes neural representations.`}</code></pre>

        <Callout variant="learn">
          This hypothesis is why we need <strong>run-wise</strong> beta estimation. If we collapsed
          across all runs into a single beta per condition, we would lose the ability to track how
          representations change from early to late in the task. Run-wise betas let us build
          separate RDMs for each run and trace the learning trajectory.
        </Callout>

        <h2>Hypothesis B: Idiosyncrasy and Social Anxiety</h2>
        <p>
          The second hypothesis is about <strong>individual differences</strong> &mdash;
          specifically, about what makes anxious teens different from their non-anxious peers. This
          is where the Finn et al. framework becomes central.
        </p>
        <p>
          The starting point is an observation from the literature: social anxiety is not
          associated with a single, consistent change in brain function. Instead, anxious
          individuals tend to show <em>more variable</em> neural responses &mdash; each anxious
          person&rsquo;s brain responds in its own idiosyncratic way.
        </p>
        <p>
          This is the <strong>Anna Karenina model</strong>, named after Tolstoy&rsquo;s opening
          line about happy families: non-anxious teens process social feedback similarly to each
          other (they are &ldquo;alike&rdquo;), while each anxious teen processes it differently
          in their own unique way (each is &ldquo;unhappy in their own way&rdquo;).
        </p>
        <p>
          Here is how we test it:
        </p>
        <ol>
          <li>
            For each subject, extract their neural pattern for a given condition in a given ROI.
          </li>
          <li>
            Compute the <strong>group-average pattern</strong> across all subjects.
          </li>
          <li>
            For each subject, compute an <strong>idiosyncrasy score</strong>: the distance between
            that subject&rsquo;s pattern and the group average. A high score means the subject&rsquo;s
            brain is &ldquo;doing its own thing&rdquo; &mdash; their neural response is unlike the
            typical response.
          </li>
          <li>
            Correlate these idiosyncrasy scores with <strong>SCARED social anxiety scores</strong>
            across all subjects.
          </li>
        </ol>
        <p>
          The prediction: <strong>higher anxiety leads to higher neural idiosyncrasy</strong>,
          particularly for negative feedback (from Mean peers) and unpredictable feedback (from 60%
          peers). The idea is that anxious teens struggle most with exactly the stimuli that are
          threatening or uncertain, and this struggle manifests as divergent, person-specific neural
          processing.
        </p>

        <Callout variant="learn">
          This hypothesis is why we need <strong>no spatial smoothing</strong> and
          <strong> standard-space alignment</strong>. Without smoothing, we preserve the
          fine-grained pattern information needed to detect idiosyncrasy. With standard-space
          alignment, we can meaningfully compare &ldquo;voxel 100 in Subject A&rdquo; to
          &ldquo;voxel 100 in Subject B&rdquo; and compute distances between their patterns.
        </Callout>

        <p>
          There is also a more sophisticated version of this test using the full IS-RSA framework.
          Instead of comparing each subject to the group average, we build the full subjects x
          subjects neural similarity matrix, then correlate it with a subjects x subjects behavioral
          similarity matrix (based on SCARED scores). This tests the same idea in a more powerful
          way: people with similar anxiety levels should show similar neural patterns &mdash; and
          highly anxious individuals should be the outliers.
        </p>

        <h2>Hypothesis C: Disposition vs. Predictability</h2>
        <p>
          The third hypothesis is about <strong>representational structure</strong>. When the brain
          builds a mental model of a social peer, what is the primary organizing dimension? We have
          two candidates:
        </p>
        <ul>
          <li>
            <strong>Disposition (valence):</strong> Is this person Nice or Mean? Do they give
            positive or negative feedback? This is the &ldquo;what kind of person are they?&rdquo;
            dimension.
          </li>
          <li>
            <strong>Predictability:</strong> Is this person consistent (80%) or inconsistent (60%)?
            Can I predict what they will do? This is the &ldquo;can I anticipate their
            behavior?&rdquo; dimension.
          </li>
        </ul>
        <p>
          Both dimensions are psychologically important, but they may be represented differently in
          different brain regions. The vmPFC, which is associated with social valuation, might
          primarily organize by disposition. The amygdala, which is sensitive to uncertainty, might
          primarily organize by predictability. The TPJ, which tracks mental states, might care
          about both.
        </p>
        <p>
          We test this by building two model RDMs:
        </p>
        <pre className="code-block"><code>{`Valence model:
  Predicts that Nice conditions cluster together,
  Mean conditions cluster together,
  and the two clusters are far apart.
  (Ignores predictability)

Predictability model:
  Predicts that 80% conditions cluster together,
  60% conditions cluster together,
  and the two clusters are far apart.
  (Ignores valence)`}</code></pre>
        <p>
          We then compare both models to the brain&rsquo;s empirical RDM in each ROI. The winning
          model &mdash; the one that better explains the brain&rsquo;s geometry &mdash; tells us
          what that region primarily &ldquo;cares about&rdquo; when representing peers.
        </p>

        <Callout variant="learn">
          This hypothesis is why we need <strong>clean condition separation</strong> in the pipeline.
          Our 8 feedback conditions (2 dispositions x 2 predictabilities x 2 feedback types) form a
          fully crossed design. This crossing is what lets us independently test valence and
          predictability models &mdash; they make different predictions because the conditions vary
          on both dimensions simultaneously.
        </Callout>

        <h2>How the Hypotheses Connect</h2>
        <p>
          These three hypotheses are not isolated questions. They form a coherent story:
        </p>
        <ul>
          <li>
            <strong>Hypothesis A</strong> asks whether learning happens at all &mdash; do neural
            representations track the true peer structure over time?
          </li>
          <li>
            <strong>Hypothesis C</strong> asks what is learned &mdash; does the brain primarily
            encode who is nice vs. mean, or who is predictable vs. unpredictable?
          </li>
          <li>
            <strong>Hypothesis B</strong> asks who learns differently &mdash; do anxious teens
            form more idiosyncratic representations, suggesting atypical social learning?
          </li>
        </ul>
        <p>
          Together, they paint a picture of social learning in the adolescent brain: the typical
          trajectory of learning (A), what dimensions the brain extracts from social experience (C),
          and how anxiety disrupts or distorts this process (B).
        </p>

        <h2>The Pipeline Connection</h2>
        <p>
          Every one of these hypotheses requires exactly the outputs our pipeline produces:
        </p>
        <ul>
          <li>
            <strong>Run-wise betas</strong> &mdash; needed for Hypothesis A (tracking learning
            across runs) and for computing reliable distance estimates in all hypotheses.
          </li>
          <li>
            <strong>No smoothing</strong> &mdash; needed for all RSA analyses, which depend on
            fine-grained spatial patterns.
          </li>
          <li>
            <strong>Standard space</strong> &mdash; needed for Hypothesis B (inter-subject
            comparison of neural patterns).
          </li>
          <li>
            <strong>Explicit anticipation modeling</strong> &mdash; needed for clean
            feedback-specific betas in all hypotheses.
          </li>
          <li>
            <strong>8 separated feedback conditions</strong> &mdash; needed for Hypothesis C
            (testing valence vs. predictability models) and for the full RDM construction in
            all hypotheses.
          </li>
        </ul>
        <p>
          The pipeline is not arbitrary. It was designed from the ground up to serve these
          specific scientific questions. Now you can see exactly why each design choice was made.
        </p>
      </div>
    </div>
  )
}
