/**
 * What's Next — Module 3: Key Papers
 * Reading list connecting foundational literature to the LEARN RSA project.
 */

import Callout from '@src/components/Callout'

export default function ReadingList(): React.JSX.Element {
  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-[var(--color-accent-bright)] uppercase tracking-[0.08em]">
            What&rsquo;s Next
          </span>
          <span className="text-[var(--color-text-dim)]">&middot;</span>
          <span className="text-xs text-[var(--color-text-muted)]">Module 3 of 3</span>
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-heading)] tracking-tight text-[var(--color-text-primary)]">
          Key Papers
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-3 text-lg leading-relaxed">
          The papers that shaped this project &mdash; from foundational methods to the specific
          questions we are asking.
        </p>
      </div>

      <div className="prose-container">
        <h2>Your Reading List</h2>
        <p>
          Understanding the LEARN RSA project means understanding the papers behind it. The
          following six papers represent the intellectual foundation of this work. They span RSA
          methods, inter-subject analysis frameworks, social learning, anxiety, and the neuroscience
          of individual differences. Read them in any order, but reading all of them will give you
          a complete picture of why this project exists and how it works.
        </p>

        <h2>The Methodological Foundation</h2>

        <div className="space-y-4 my-6">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-strong)] transition-all">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              Representational similarity analysis &mdash; connecting the branches of systems
              neuroscience
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Kriegeskorte, Mur, &amp; Bandettini &middot; 2008 &middot; Frontiers in Systems
              Neuroscience
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-3 leading-relaxed">
              The paper that started it all for RSA. Kriegeskorte and colleagues introduced the
              representational dissimilarity matrix as a way to compare neural representations
              across brain regions, species, and computational models. Before RSA, comparing a
              monkey&rsquo;s inferior temporal cortex to a deep neural network&rsquo;s hidden layer
              required shared assumptions about voxel-level correspondence. RDMs solved this by
              abstracting to the level of representational geometry &mdash; you only need to know
              the <em>relationships</em> between conditions, not the raw activation values. This is
              the technical reference for every RSA analysis we will run.
            </p>
          </div>

          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-strong)] transition-all">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              Idiosynchrony: From shared responses to individual differences during naturalistic
              neuroimaging
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Finn, Glerean, Khojandi, Nielson, Molfese, Handwerker, &amp; Bandettini &middot;
              2020 &middot; NeuroImage
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-3 leading-relaxed">
              The methodological backbone of our project. Finn et al. developed the IS-RSA
              (inter-subject RSA) framework and introduced the Anna Karenina model of neural
              individual differences. Their key insight: instead of averaging across subjects to
              find a &ldquo;typical&rdquo; brain response, you can analyze the <em>variation</em>
              across subjects as meaningful signal. They showed that people who are more similar on
              psychological traits also show more similar neural responses during movie watching
              &mdash; and that clinically relevant traits (like loneliness and social anxiety) are
              associated with more idiosyncratic brain responses. This paper is already covered in
              depth in the Papers tab of this guide.
            </p>
          </div>
        </div>

        <h2>Social Learning and Predictive Mechanisms</h2>

        <div className="space-y-4 my-6">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-strong)] transition-all">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              Predictive learning as a framework for understanding social cognitive development
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Greco, Kube, Teepe, &amp; Quattrocki Knight &middot; 2024 &middot; Developmental
              Cognitive Neuroscience
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-3 leading-relaxed">
              This review argues that predictive learning &mdash; the brain&rsquo;s ability to
              generate predictions about upcoming events and update those predictions based on
              error signals &mdash; is a unifying framework for understanding social cognitive
              development. The LEARN task is, at its core, a predictive learning paradigm:
              participants predict how each peer will respond, receive feedback that confirms or
              violates their prediction, and gradually build a model of each peer&rsquo;s
              disposition. Greco et al. provide the theoretical scaffolding for understanding
              why prediction errors and predictability matter for how teens learn about their
              social world.
            </p>
          </div>

          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-strong)] transition-all">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              Anxiety impairs adaptive social learning under uncertainty
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Lamba, Frank, &amp; FeldmanHall &middot; 2020 &middot; Psychological Science
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-3 leading-relaxed">
              Lamba and colleagues demonstrated that trait anxiety disrupts the ability to learn
              adaptively from social feedback, particularly under conditions of uncertainty. In
              their trust game paradigm, anxious individuals were slower to update their beliefs
              about partners whose behavior was unpredictable. This paper directly motivates our
              Hypothesis B (anxiety and idiosyncrasy) and the interaction between anxiety and
              predictability that we expect to see. It suggests that the 60% (less predictable)
              peers in the LEARN task should be especially challenging for anxious participants,
              leading to more divergent neural processing patterns.
            </p>
          </div>
        </div>

        <h2>Individual Differences and Neural Similarity</h2>

        <div className="space-y-4 my-6">
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-strong)] transition-all">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              Lonely individuals process the world in idiosyncratic ways
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Baek, Hyon, L&oacute;pez, Finn, Porter, &amp; Parkinson &middot; 2023 &middot;
              Psychological Science
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-3 leading-relaxed">
              Baek et al. applied the IS-RSA approach to study loneliness and found that lonelier
              people show more idiosyncratic neural responses during naturalistic movie viewing.
              Critically, the effect was strongest in default-mode network regions associated with
              meaning-making and social cognition. This validates the core approach we are using:
              if loneliness produces neural idiosyncrasy during passive movie watching, then social
              anxiety &mdash; a closely related construct &mdash; should produce similar
              idiosyncrasy during active social learning, where the stakes are even higher.
            </p>
          </div>

          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-strong)] transition-all">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
              Pre-existing neural similarity predicts friendship formation
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Shen, Welborn, &amp; Bhatt &middot; 2025 &middot; NeuroImage
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-3 leading-relaxed">
              Shen et al. showed that people whose brains respond similarly to the same stimuli
              are more likely to become friends &mdash; even before they have met. This is the
              flip side of idiosyncrasy: if shared neural geometry predicts social connection,
              then divergent neural geometry might predict social difficulty. For our project,
              this paper reinforces why neural similarity matters: it is not just a methodological
              curiosity but a real phenomenon with tangible social consequences. Teens whose brains
              diverge from the group during social learning may face real challenges in forming
              peer relationships.
            </p>
          </div>
        </div>

        <h2>How to Read These Papers</h2>
        <p>
          If you are new to neuroimaging literature, these papers can feel dense. Here are some
          suggestions for approaching them:
        </p>
        <ul>
          <li>
            <strong>Start with Finn et al.</strong> &mdash; If you have already worked through the
            Finn deep-dive in the Papers tab of this guide, you have a solid foundation. If not,
            start there.
          </li>
          <li>
            <strong>Read the abstracts and discussions first.</strong> The methods sections of
            neuroimaging papers can be opaque. The abstract tells you what was found; the
            discussion tells you what it means. Come back to the methods later.
          </li>
          <li>
            <strong>Focus on the figures.</strong> Most RSA papers include RDM visualizations and
            brain maps. These are often more informative than the text for understanding the
            results.
          </li>
          <li>
            <strong>Read Kriegeskorte (2008) for methods vocabulary.</strong> If terms like
            &ldquo;representational geometry,&rdquo; &ldquo;second-order isomorphism,&rdquo; or
            &ldquo;Mantel test&rdquo; come up in other papers, this is where they are defined.
          </li>
          <li>
            <strong>Read Lamba (2020) and Greco (2024) for psychological context.</strong> These
            papers explain <em>why</em> anxiety and social learning are connected, which helps
            you understand the motivation behind our hypotheses.
          </li>
        </ul>

        <Callout variant="learn">
          These six papers collectively define the intellectual space of the LEARN RSA project.
          Kriegeskorte gave us RSA. Finn gave us IS-RSA and the Anna Karenina model. Greco frames
          the task as predictive learning. Lamba shows that anxiety disrupts social learning under
          uncertainty. Baek and Shen validate the idiosyncrasy approach for social traits. Together,
          they tell us <em>what to measure</em> (representational geometry), <em>how to measure
          it</em> (inter-subject RSA), and <em>why it matters</em> (anxiety, social learning, and
          the formation of peer representations in the developing brain).
        </Callout>

        <h2>Beyond the List</h2>
        <p>
          These six papers are the essentials, but they are not the whole story. As you dig deeper
          into the project, you may want to explore:
        </p>
        <ul>
          <li>
            <strong>Camacho et al. (2024)</strong> &mdash; Found the Anna Karenina pattern in
            youth with social anxiety, validating the idiosyncrasy approach in our specific
            population.
          </li>
          <li>
            <strong>Nili et al. (2014)</strong> &mdash; A toolbox for RSA that formalizes
            statistical testing of model comparisons, including noise ceiling estimation.
          </li>
          <li>
            <strong>Walther et al. (2016)</strong> &mdash; Reliability and information content of
            RDMs, important for understanding the statistical properties of our main data object.
          </li>
        </ul>
        <p>
          The full literature folder on the server (<code className="code-inline">literature/</code>)
          contains PDFs, annotated references, and background emails that trace the intellectual
          development of this project. It is there whenever you want to go deeper.
        </p>
      </div>
    </div>
  )
}
