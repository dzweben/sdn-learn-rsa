# LEARN RSA: Comprehensive Research Synthesis & Presentation Planning

**Purpose:** This is not a slide plan. This is a deep working document that synthesizes the full literature, interprets every finding, maps theory to data, and explores multiple narrative framings for presenting this work. It's meant to be studied, argued with, and revised.

**Date:** 2026-03-24

---

## PART I: WHAT THE LITERATURE TELLS US

### 1.1 The State of SAD + Social Feedback Research

The field has established several things beyond reasonable doubt:

**Socially anxious adolescents show altered neural reactivity to social feedback.** Jarcho et al. (2015, 2016) demonstrated that in the Virtual School Task (the predecessor to LEARN), anxious adolescents showed heightened striatal and insula responses to unexpected positive feedback from peers — but then failed to update their predictions accordingly. They *noticed* when things went better than expected, but couldn't incorporate that into their model of the social world. This is the "failed positive learning" finding and it's been replicated and cited extensively.

**The cognitive bias model of SAD is well-established but incomplete.** Attentional biases toward threat (Amir et al. 2009, Morrison & Heimberg 2013), negative interpretation of ambiguity (Heimberg et al. 2014, Burton et al. 2012), distorted expectations, negativity bias in feedback integration (Müller-Pinzler et al. 2019, Koban et al. 2017) — all robustly documented. But these are all *trial-level* findings. They tell us how anxious people react to *individual social events*. They don't tell us how anxious people *organize their understanding* of the social world.

**Anxiety alters social learning dynamics, not just endpoints.** Lamba et al. (2020) showed anxious individuals failed to update in uncertain social environments — they overweighted negative outcomes and couldn't adapt when partners became cooperative. Clarkson et al. (2025, the lab's own work) found anxious adolescents in the LEARN task learn at similar or faster rates but through altered *dynamics* — they get to the right answer by a different path. This is crucial: it means the *content* of what they learn may be similar, but the *process and representation* differ.

**What's genuinely missing.** Almost all fMRI work on SAD and social feedback asks a univariate question: does region X activate more/less in anxious vs. non-anxious individuals? This tells us about *magnitude*. It doesn't tell us about *pattern* — about how the brain *organizes* its representation of social feedback. And it doesn't tell us about *idiosyncrasy* — whether anxious individuals differ from each other in their neural representations, or whether they all show the same altered pattern. This is the gap.

### 1.2 The Idiosyncrasy Literature

This is a relatively new but rapidly growing area. Three papers anchor it:

**Baek et al. (2023, Psychological Science): "Lonely Individuals Process the World in Idiosyncratic Ways."**
- N=66 first-year university students; naturalistic movie-watching fMRI
- Nonlonely individuals were very similar to each other in neural responses; lonely individuals were dissimilar from each other *and* from nonlonely peers
- Effect concentrated in default-mode network — regions associated with shared perspectives and subjective understanding
- Idiosyncrasy correlated with *feeling misunderstood* — suggesting a direct link between neural divergence and the phenomenology of social disconnection
- **Key for your study:** Loneliness and social anxiety are distinct but overlapping constructs. If lonely people show neural idiosyncrasy that predicts feeling misunderstood, do socially anxious people show a parallel pattern? And does it emerge specifically for threatening social stimuli?

**Camacho et al. (2024, JAACAP): "Higher Intersubject Variability in Neural Response to Narrative Social Stimuli Among Youth With Higher Social Anxiety."**
- N=740 youth (ages 5-15), split into Discovery and Replication samples — massive sample
- Higher social anxiety → greater person-to-person variability in fMRI during movie-watching
- Effects in posterior cingulate, supramarginal gyrus, IFG — regions supporting attention, mentalizing, emotion processing
- Enhanced for scenes with greater sensory intensity/saliency
- **Key for your study:** This is the closest precedent to what you're doing, but it uses naturalistic paradigms (movies), not controlled task-based designs. Your LEARN task provides *experimental control* over the social feedback — manipulated peer characteristics, known feedback valence — that movies don't. This is a major methodological advance. Also, Camacho measured ISC (time-course similarity), while you measure IS-RSA (pattern similarity across conditions). Different question.

**Finn et al. (2020, NeuroImage): "Idiosynchrony."**
- Theoretical/methodological paper that launched the IS-RSA framework
- Key insight: Instead of treating individual differences as noise to be averaged out, IS-RSA treats them as the signal
- Proposed framework: compute inter-subject similarity matrices (ISM) from neural data, then test whether ISM structure relates to behavioral/clinical dimensions
- Demonstrated empirically with HCP movie-watching data
- **Key for your study:** This is your methodological foundation. Finn coined "idiosynchrony" and developed the statistical framework you're using. Citing this paper is essential.

**Shen et al. (2025, Nature Human Behaviour): "Neural Similarity Predicts Whether Strangers Become Friends."**
- Pre-existing neural similarity (measured during movie-watching *before* participants met) predicted friendship formation 8 months later
- Left orbitofrontal cortex showed strongest friendship prediction
- Controlled for demographic similarity
- **Key for your study:** This establishes the *consequential significance* of neural similarity. If similar brain patterns predict social bonding, then idiosyncratic brain patterns in anxious individuals may predict difficulty forming connections — not because of behavioral deficits, but because of invisible neural divergence.

**Additional relevant work:**
- Parkinson et al. (2018, Nature Communications): Neural responses predict social network distance — people who respond similarly to stimuli are closer in their social network
- The schizophrenia literature (2025 bioRxiv preprint) shows higher within-group variance in functional connectivity among patients — another Anna Karenina application
- Negative affect homogenizes and positive affect diversifies social memory consolidation (PMC 2023) — intriguing because it predicts your Nice/Mean asymmetry

### 1.3 The Anna Karenina Framework

"All happy families are alike; each unhappy family is unhappy in its own way."

In neuroscience, this translates to: individuals at the "healthy" end of a dimension share similar neural patterns, while individuals at the "unhealthy" end each diverge in their own unique way. It's a specific prediction about the *shape* of the relationship between a clinical dimension and neural similarity.

**The standard Anna Karenina prediction:** Higher symptom severity → more idiosyncratic neural patterns. Operationalized as a negative correlation between the AnnaK Gradient behavioral model (mean of two subjects' anxiety scores) and their neural similarity (Pearson r between brain patterns).

**The reverse Anna Karenina effect — this is novel and important for your study.** Your anterior insula results show the opposite: *higher* anxiety → more *convergent* patterns, and *lower* anxiety → more *diverse* patterns. This is less commonly reported in the literature. The persuasion study (HSE University) found that *unpersuaded* individuals responded similarly (convergence) while *persuaded* individuals were idiosyncratic. The memory consolidation study found positive affect diversifies while negative affect homogenizes. Your reverse AnnaK in the anterior insula for both Nice and Mean feedback is a genuine novel finding that deserves attention.

**Possible interpretation of reverse AnnaK:** In regions where processing is *stereotyped* or *overlearned* (e.g., anterior insula salience detection), high-anxiety individuals may converge because they're all locked into the same hypersensitive, alarm-like response. Low-anxiety individuals, freed from that hypervigilance, can afford more variable, context-dependent processing. In other words: anxiety *constrains* processing in some circuits while *fragmenting* it in others.

### 1.4 RSA as a Methodological Framework

**The core idea is simple.** Instead of asking "does region X activate more for condition A than B?" (univariate), RSA asks "how is the *pattern* of activity across voxels organized? Do conditions that are similar in one domain (behavior, theory) have similar neural patterns?"

**IS-RSA extends this across people.** Instead of asking "do two conditions evoke similar patterns within one person?" it asks "do two people show similar patterns for the same condition?" This is the key methodological innovation. It turns the question from "how does one brain organize information?" to "do different brains organize information the same way?"

**Why this matters for SAD.** The dominant neuroimaging approach to SAD has been: show threatening stimuli, measure BOLD response magnitude, compare groups. This tells you that anxious brains *react more* (or differently in magnitude). IS-RSA tells you something fundamentally different: that anxious brains don't just react more — they react in ways that are *uniquely their own*. The "fingerprint" metaphor captures this: everyone sees the same peer being mean, but each anxious adolescent's brain encodes it differently.

**Popal et al. (2019, SCAN) — Guide to RSA for Social Neuroscience** makes the case that RSA is particularly well-suited for social neuroscience because social cognition involves multidimensional, continuous stimulus spaces (people, relationships, reputations) that don't reduce well to discrete categories.

---

## PART II: INTERPRETING YOUR FINDINGS

### 2.1 The dACC1 Finding (The Anchor)

**The result:** dACC1 × Mean Feedback × AnnaK Gradient: ρ = -0.166, p_perm = 0.0045, p_FDR = 0.036. This is the only result that survives FDR correction across 32 tests.

**What dACC1 does.** The dorsal anterior cingulate cortex is one of the most functionally versatile and theoretically loaded regions in the social brain. In the context of social feedback processing:

- **Conflict monitoring** (Botvinick et al. 2001, 2004): Detects when ongoing processing involves conflict between competing representations. When a peer who's supposed to be mean gives nice feedback, or vice versa — that's conflict.
- **Social prediction error** (Jarcho et al. 2015; Apps et al. 2016): Signals mismatches between expected and received social outcomes. Closely related to conflict monitoring but specifically social — the dACC lights up when the social world doesn't match your model of it.
- **Expectancy violation in social exclusion** (Somerville et al. 2006; Eisenberger 2012): dACC activation during Cyberball and similar paradigms is thought to reflect the detection of social norm violations.
- **Salience/conflict in evaluative contexts** (Menon & Uddin 2010): Part of the broader salience network, dACC helps determine what's motivationally relevant.

**Why idiosyncrasy HERE makes sense.** The dACC is where the brain detects that social feedback doesn't match expectations. If you're socially anxious and you receive mean feedback, the question is: does it violate your expectations? For some anxious adolescents, yes — they expected the peer to be nice (and are shocked). For others, no — they expected mean feedback all along (confirmatory). For still others, the experience triggers a cascade of self-referential processing ("they're mean because of me"). The point is that *different anxious individuals respond to the same prediction error in fundamentally different ways*. Low-anxiety individuals, by contrast, may process this mismatch more uniformly — "oh, that peer was meaner than I expected, I'll update."

**The dual-model pattern.** The NN model (parametric similarity) for dACC1 × Mean is ρ = +0.100, p = 0.030 (not FDR-significant, but trending). This tells a complementary story: subjects with *similar* anxiety levels have *similar* dACC1 patterns (NN convergence), AND the Anna Karenina gradient shows that this similarity breaks down at higher anxiety levels (AnnaK idiosyncrasy). Together, these trace out the full Anna Karenina shape: shared representations at the low end, fragmenting representations at the high end.

**dACC1 specifically (not dACC2).** Your two dACC masks differ in location: dACC1 is near the anterior commissure (CM: 0, 1.5, 37.5), while dACC2 is more posterior (CM: 1.5, -22.5, 40.5). The anterior region (dACC1) is more closely associated with evaluative conflict and social prediction error; the posterior region is more associated with motor planning and response selection. The specificity of the effect to dACC1 supports a social-evaluative interpretation rather than a generic conflict-monitoring one.

### 2.2 The Anterior Insula: Reverse Anna Karenina

**The result:** AntInsula × Mean × AnnaK: ρ = +0.188, p = 0.039 (uncorrected). AntInsula × Nice × AnnaK: ρ = +0.216, p = 0.024 (uncorrected). Neither survives FDR, but the consistency across both feedback types is notable — it's the ONLY ROI showing convergence for BOTH conditions.

**What the anterior insula does.** The anterior insular cortex (AIC) is the hub of interoceptive awareness — it integrates bodily signals (heart rate, gut feelings, skin conductance) into conscious emotional experience. In social anxiety specifically:

- Anterior insula activation mediates the relationship between bodily sensibility and social anxiety (Terasawa et al. 2013)
- Right anterior insula activation correlates positively with individual social anxiety levels
- The anterior insula is part of the salience network (with dACC) — it detects motivationally relevant events and triggers orienting

**Why CONVERGENCE here makes sense (reverse AnnaK).** If high-anxiety adolescents all share a heightened, stereotyped visceral alarm response to peer feedback — regardless of valence — their anterior insula patterns would converge. They're all doing the same thing: "ALERT! Social evaluation happening!" Meanwhile, low-anxiety adolescents can afford more nuanced, context-dependent interoceptive processing — some might feel slight discomfort, others curiosity, others indifference — leading to more variable patterns. The anterior insula convergence in high-SA adolescents may reflect the *rigidity* and *inflexibility* of anxious interoceptive processing — a locked-in alarm state that produces similar patterns regardless of whether feedback is nice or mean.

**This is a novel finding.** Most Anna Karenina literature documents idiosyncrasy (divergence) with psychopathology. Reverse Anna Karenina (convergence with psychopathology) is less reported. The closest analogy is from memory consolidation research: negative affect homogenizes memory, while positive affect diversifies it. Your anterior insula convergence extends this to real-time social processing.

### 2.3 The Searchlight: Mean Feedback Idiosyncrasy

The searchlight tells a richer and more complex story than the ROI analysis alone. None of the clusters survived cluster-level FWE correction, but the *pattern* is interpretable and worth taking seriously as hypothesis-generating.

**Mean feedback drives idiosyncrasy (508 voxels, 71% of significant voxels are negative rho).**

The largest and most theoretically interesting idiosyncrasy clusters for Mean feedback:

**A. Brainstem (k=80 voxels, ρ=-0.205) — The Largest Cluster**

This is surprising and potentially important. The brainstem mediates autonomic threat responses — the fight-or-flight cascade that's activated during social threat. In fMRI of anxiety:
- Brainstem activation during anticipatory anxiety correlates with autonomic arousal (Mobbs et al. 2009)
- Anxious individuals show increased top-down prefrontal→brainstem coupling (Bijsterbosch et al. 2015)
- Brainstem autonomic responses to social threat show high individual variability — people literally have different physiological signatures of threat

Why brainstem idiosyncrasy makes sense: Mean feedback from peers is a social threat. The autonomic response to that threat is mediated partly through brainstem circuits. If different anxious adolescents have different *physiological signatures* of threat (some freeze, some fight, some go numb), their brainstem representations would be idiosyncratic. Low-anxiety adolescents might have a more uniform, mild autonomic response to mean feedback, producing convergent patterns.

Caveat: Brainstem fMRI is notoriously noisy (physiological noise, pulsatility artifacts). The 97.5% "unlabeled white matter" overlap for this cluster is concerning. This finding needs replication with cardiac/respiratory correction.

**B. Left Supramarginal Gyrus, Anterior Division (k=47, ρ=-0.337) — Dorsal Attention Network**

This is the *strongest* idiosyncrasy effect (highest absolute rho) across all searchlight clusters. The supramarginal gyrus has a specific and well-documented role in social cognition:

- The right SMG is crucial for overcoming *emotional egocentricity bias* — the tendency to project your own emotional state onto others (Silani et al. 2013, Journal of Neuroscience)
- SMG disruption makes it harder to distinguish between self and other's emotional states
- The SMG is part of the "self-other distinction" network, alongside the TPJ
- In social anxiety, difficulties with self-other distinction are clinically relevant — anxious individuals may struggle to separate their own heightened emotional state from their model of how others perceive them

Why SMG idiosyncrasy for Mean feedback: When receiving mean feedback, the question "how does this peer see me?" is entangled with "how do I feel right now?" The SMG helps disentangle these. If anxious adolescents vary in their ability to perform this self-other distinction — some projecting more, some less — their SMG patterns would be idiosyncratic. The Dorsal Attention network assignment suggests this is also about *where* attention is directed during threat — inward (self-focused) vs. outward (other-focused).

**C. Left Insular Cortex (k=33, ρ=-0.317)**

This is notable because it's labeled as "white matter" in the cluster table, but at MNI (-34, -14, -2) it's in or very near the posterior insula. This creates an intriguing double dissociation with the ROI-level anterior insula finding:

- *Anterior* insula: CONVERGENCE (high-SA adolescents share similar patterns)
- *Posterior* insula: IDIOSYNCRASY (high-SA adolescents diverge)

The anterior-posterior insular gradient is well-established: posterior insula receives raw somatosensory/interoceptive input (pain, temperature, visceral afferents), while anterior insula integrates this into emotional awareness and decision-making. The dissociation suggests that anxious adolescents *share* the same high-level salience/alarm response (anterior convergence) but *differ* in how they physically experience the threat at a bodily level (posterior idiosyncrasy). In other words: they all know it's threatening, but they feel it differently.

**D. Planum Temporale (k=37, ρ=-0.248) — Somatomotor Network**

The planum temporale is primarily an auditory association area, but in the context of social feedback it may be processing the *how* of feedback delivery — prosody, vocal tone, or even subvocalized responses. Idiosyncrasy here could reflect different "inner voices" — different internal narrations of the feedback experience. Alternatively, this may reflect somatomotor heterogeneity (preparation for different behavioral responses to threat).

**E. Temporal Fusiform Cortex (k=34, ρ=-0.163) — Limbic Network**

The fusiform gyrus houses the fusiform face area (FFA), critical for face perception. In SAD:
- Fusiform shows hyper-reactivity to fearful faces, with enhanced amygdala-fusiform connectivity (Frick et al. 2013)
- Social anxiety severity correlates with fusiform reactivity to emotional faces
- Fusiform connectivity patterns differ in SAD

Idiosyncrasy in temporal fusiform for Mean feedback: Different anxious adolescents may process the *face* of the peer giving mean feedback differently — some hyperattending to the peer's expression, others avoiding it, others distorting it. The fusiform heterogeneity could reflect different visual processing strategies during social threat.

**F. Frontal Pole (k=24, ρ=-0.219) — Frontoparietal Control Network**

Frontal pole involvement in idiosyncrasy for Mean feedback suggests different cognitive control/regulation strategies. Some anxious adolescents may attempt top-down regulation (suppression, reappraisal), while others don't engage regulatory mechanisms at all. The Frontoparietal Control network assignment supports a regulatory interpretation.

### 2.4 The Searchlight: Mean Feedback Convergence

**Convergence clusters (201 voxels, 29% of significant) tell a complementary story.**

**A. Intracalcarine Cortex / Primary Visual (k=27, ρ=+0.356)**

This is the *strongest* convergence effect. V1 convergence for mean feedback suggests that the basic *perceptual encoding* of mean feedback is shared across anxiety levels — everyone sees the same thing. The divergence happens downstream, in how that visual input is evaluated, experienced, and responded to.

**B. Left Insular Cortex — Salience/Ventral Attention (k=22, ρ=+0.326)**

This is the *anterior* insula cluster (distinct from the posterior insula idiosyncrasy cluster). Consistent with the ROI-level finding: anxious adolescents converge in salience detection. They share the alarm.

**C. Posterior Cingulate (k=15, ρ=+0.325) — Default Mode**

The PCC is a core DMN hub involved in self-referential processing and internal mentation. Convergence here for Mean feedback suggests that the self-referential component of processing mean feedback ("this is about me") is *shared* across anxiety levels. Everyone engages in self-referential processing when someone's mean to them — the question is what happens next.

**D. Angular Gyrus (k=16, ρ=+0.207) — Default Mode**

Part of the TPJ complex, involved in mentalizing and perspective-taking. Convergence here suggests shared Theory of Mind processing — everyone tries to figure out *why* the peer was mean. The idiosyncrasy happens in the *appraisal* of what that means for the self.

### 2.5 The Searchlight: Nice Feedback

The Nice feedback pattern is qualitatively different from Mean:

**Convergence dominates (294 voxels convergence vs. 225 idiosyncrasy).**

The biggest Nice convergence clusters are in:
- **Frontal Pole / OFC** (k=30, ρ=+0.253): Reward valuation. Anxious adolescents converge on how they value positive feedback — they all find it rewarding/salient.
- **Temporal Pole** (k=29, ρ=+0.227): Social-semantic processing. Shared representation of the *meaning* of nice feedback.
- **Cerebellum** (bilateral, k=16 each): Motor/predictive processing. Shared anticipatory responses.
- **Default Mode regions** (angular gyrus, superior frontal): Shared self-referential processing of positive social input.

**Nice feedback idiosyncrasy is primarily visual (LOC clusters, occipital pole).** This is likely stimulus-processing noise rather than a meaningful social-cognitive effect — different people encode the visual appearance of the feedback differently, but the *social meaning* is processed uniformly.

**The anterior cingulate shows idiosyncrasy for Nice too** (k=14, ρ=-0.246). The effect size is virtually identical to Mean feedback (ρ=-0.166 for Mean in the ROI analysis, ρ=-0.246 for Nice in the searchlight). This suggests the dACC idiosyncrasy may be a *general property* of how anxious individuals process social feedback, not specific to threat. Worth investigating further.

### 2.6 The Asymmetry: Mean vs. Nice

The most striking pattern across all analyses:

**Mean feedback = Idiosyncrasy-dominant (especially in appraisal circuits)**
- 508 idiosyncrasy voxels vs. 201 convergence
- Idiosyncrasy in brainstem, SMG, posterior insula, fusiform, frontal pole
- Convergence limited to primary visual, anterior insula, PCC, angular gyrus

**Nice feedback = Convergence-dominant (especially in reward/social-semantic circuits)**
- 294 convergence voxels vs. 225 idiosyncrasy
- Convergence in OFC, temporal pole, cerebellum, DMN regions
- Idiosyncrasy primarily in visual cortex (likely noise)

**Interpretation:** Positive social feedback produces *shared* neural processing across anxiety levels — everyone values and processes nice feedback similarly. Negative social feedback fragments into *idiosyncratic* processing in anxious individuals — each anxious adolescent experiences mean feedback in their own unique way.

This maps beautifully onto the phenomenology of SAD:
- Anxious adolescents can often enjoy positive social interactions (shared processing)
- But their experience of social threat is fundamentally *private* and *incommunicable* ("no one understands what it's like for me")
- This asymmetry may explain the clinical observation that anxious youth often report feeling misunderstood specifically around negative experiences, not positive ones

### 2.7 What the Null Results Mean

Several ROIs showed no Anna Karenina effect:

- **vmPFC**: Neither convergence nor idiosyncrasy. The vmPFC integrates social value (Hare et al. 2009; Rangel & Hare 2010). The null suggests that the *value* assigned to social feedback is shared — everyone rates mean feedback as negative and nice feedback as positive. The idiosyncrasy is in how that value is *processed*, not what it is.

- **Ventral Striatum**: Only NN convergence for Nice (ρ=+0.098, p=0.028 — subjects with similar anxiety show similar VS patterns for nice feedback). The reward system processes nice feedback uniformly. This aligns with Jarcho et al. (2015) — anxious adolescents *notice* positive feedback (VS activates), they just can't update from it.

- **R-TPJ and dmPFC**: Zero signal. These are the mentalizing regions. The absence of any Anna Karenina effect means that how adolescents represent others' mental states during feedback is not related to anxiety in an idiosyncratic way. This is interpretable: Theory of Mind may be a more "hardwired" capacity that doesn't vary as much with anxiety. Or it may mean that the mentalizing demands of the LEARN task are relatively low (you don't need much perspective-taking to receive binary nice/mean feedback).

- **dACC2**: Nothing. The posterior dACC region associated with motor planning and response selection is not showing anxiety-related pattern variation. This supports the specificity of the dACC1 (evaluative) finding.

- **Amygdala**: Trends toward idiosyncrasy for Mean (ρ=-0.110, p=0.048 uncorrected) but doesn't survive FDR. Given the amygdala's well-established role in social threat processing and anxiety, this is worth noting as a trend. The small ROI size (98 voxels) may limit power.

---

## PART III: THE EMERGING STORY (MULTIPLE FRAMINGS)

### Framing A: "Neural Loneliness" — The Misunderstood Mind

**Central claim:** Socially anxious adolescents don't just *feel* misunderstood — they literally *process* threatening social feedback in ways that diverge from their peers. This neural idiosyncrasy may be both a consequence and a maintaining factor of social disconnection.

**Narrative arc:**
1. SAD is the most common anxiety disorder in adolescence
2. We know about biases (attention, interpretation, memory), but these are all trial-level reactions
3. Neural similarity between people predicts social bonding (Shen 2025, Parkinson 2018)
4. Lonely/anxious people process the social world idiosyncratically (Baek 2023, Camacho 2024)
5. We tested this in a controlled social feedback task: do anxious adolescents represent peer feedback idiosyncratically?
6. dACC1 — the brain's conflict/prediction error detector — shows the Anna Karenina effect specifically for mean feedback
7. Whole-brain analysis reveals an asymmetry: mean feedback fragments (idiosyncrasy), nice feedback converges
8. Implication: the experience of social threat is fundamentally *private* for anxious adolescents — and this may perpetuate their sense of isolation

**Strengths:** Emotionally resonant, clinically intuitive, bridges neuroscience and phenomenology.
**Risks:** May overstate a single FDR-corrected finding; "neural loneliness" is catchy but potentially misleading (loneliness and anxiety are distinct constructs).

### Framing B: "Two Directions of Anna Karenina" — The Circuit-Specific Story

**Central claim:** The Anna Karenina principle operates in *both* directions depending on the brain circuit: anxiety produces idiosyncrasy in appraisal circuits (dACC, posterior insula, SMG, fusiform) and convergence in detection/salience circuits (anterior insula, PCC, angular gyrus). Anxious brains share the alarm but fragment the appraisal.

**Narrative arc:**
1. The Anna Karenina principle predicts that psychopathology produces idiosyncrasy
2. But this is too simple — it depends on *what the brain region does*
3. We found classic idiosyncrasy in regions that *appraise* social feedback (dACC1, SMG, posterior insula, fusiform)
4. We found reverse AnnaK (convergence) in regions that *detect* social salience (anterior insula, PCC)
5. The insular dissociation is particularly striking: anterior (detection) converges, posterior (experience) diverges
6. This suggests anxious adolescents all *detect* the same threat, but each *processes and experiences* it uniquely
7. Implication: interventions targeting flexible appraisal (not just threat detection) may be more effective

**Strengths:** More nuanced, respects the complexity of the data, offers a novel theoretical contribution (bidirectional AnnaK), generates testable predictions.
**Risks:** More complex to communicate, especially in 2 minutes; requires audience to hold two patterns in mind simultaneously; relies heavily on uncorrected searchlight data.

### Framing C: "The Fingerprint of Social Threat" — Methodological Innovation

**Central claim:** Traditional fMRI asks "how much?" IS-RSA asks "in what way?" and reveals a fundamentally different picture of SAD. The idiosyncrasy we found in dACC1 for mean feedback would have been *invisible* to a standard analysis.

**Narrative arc:**
1. Decades of fMRI research on SAD has asked: do anxious brains activate more?
2. This approach misses something important: *how* brains organize social feedback
3. IS-RSA compares brain "fingerprints" across people — not magnitude, but pattern
4. Applied to the LEARN task: 33 adolescents, controlled social feedback, 8 ROIs
5. The method reveals what univariate analysis couldn't: anxiety doesn't change how much the dACC activates, it changes *what pattern* the dACC produces
6. Each anxious adolescent's dACC pattern is like a unique fingerprint — no two are the same
7. Implication: we've been looking at the wrong thing; representational geometry matters

**Strengths:** Sells the method, positions the work as a genuine advance, appeals to methods-oriented audiences.
**Risks:** Undersells the clinical and theoretical implications; may seem more like a methods paper than a findings paper.

### Framing D: "The Social Feedback Asymmetry" — Nice vs. Mean

**Central claim:** Positive and negative social feedback are processed by fundamentally different neural principles. Nice feedback produces shared representations; mean feedback fragments into idiosyncratic patterns in socially anxious adolescents.

**Narrative arc:**
1. Social feedback comes in two valences: nice and mean
2. Prior work treats them symmetrically (both are "social evaluation")
3. Our IS-RSA searchlight reveals they're processed by different rules:
   - Nice: convergent patterns across anxiety levels (shared reward processing)
   - Mean: idiosyncratic patterns scaling with anxiety (fragmented threat processing)
4. The dACC1 finding confirms: idiosyncrasy is specific to mean feedback
5. Clinical implication: the experience of social *threat*, not social *reward*, is where anxious adolescents diverge from peers
6. This may explain why positive social experiences sometimes fail to reduce anxiety — the shared reward processing works fine, but the private experience of threat persists

**Strengths:** Clean narrative, strong symmetry, clinically actionable, easily understood.
**Risks:** Slightly overstates the Nice searchlight results (the idiosyncrasy there is also present, just weaker); the dACC1 ROI result is actually similar across Nice and Mean (ρ=-0.166 both), which complicates the "specificity to Mean" claim.

### Framing E: "Beyond the Group Average" — A Developmental Precision Approach

**Central claim:** By showing that anxious adolescents don't just differ from non-anxious peers *as a group*, but differ from *each other*, this work argues for a precision approach to understanding adolescent social anxiety.

**Narrative arc:**
1. Most research compares "anxious" vs. "non-anxious" groups
2. This treats the anxious group as homogeneous — they all process social feedback the same way, just more intensely
3. IS-RSA shows this is wrong: anxious adolescents are actually MORE heterogeneous than non-anxious peers
4. Each anxious adolescent's brain responds to social threat in a unique way
5. This has direct implications for treatment: a one-size-fits-all CBT protocol may miss the individual neural architecture of social threat processing
6. The Anna Karenina effect means that "social anxiety" may be more like a syndrome than a single disorder at the neural level

**Strengths:** Aligns with precision psychiatry zeitgeist, clinically forward-looking, philosophically interesting.
**Risks:** Overgeneralizes from a small, uncorrected finding; precision medicine framing may be too ambitious for a Y1 project.

---

## PART IV: WHAT TO PRESENT — THINGS TO THINK HARD ABOUT

### 4.1 The dACC1 Nice Feedback Problem

The dACC1 AnnaK effect sizes are virtually identical for Nice (ρ=-0.166, p=0.055) and Mean (ρ=-0.166, p=0.004) feedback. The p-value difference comes from permutation distribution, not effect size. This is important because it complicates the "mean feedback specific" narrative. In the searchlight, Nice feedback also shows anterior cingulate idiosyncrasy (k=14, ρ=-0.246). There might be something general about dACC idiosyncrasy that isn't specific to threat.

**Options:**
- Acknowledge this openly and frame dACC1 idiosyncrasy as *general* social feedback idiosyncrasy (weaker but more honest)
- Note that the p-value difference is driven by more variability in the Nice permutation null, and the Mean finding is more robust statistically even if effect sizes are similar
- Frame dACC1 as "most pronounced for mean feedback" (statistically true) while noting the trend for nice
- Present the asymmetry as a searchlight-level finding (where the Mean vs. Nice pattern is clearer and involves different regions) rather than a ROI-level finding

### 4.2 The Correction Problem

1 of 32 ROI tests survives FDR. 0 searchlight clusters survive FWE. This is the statistical reality.

**How to handle this:**
- Lead with the dACC1 finding as the anchoring, FDR-corrected result
- Present the searchlight as "exploratory" and "hypothesis-generating" — this is standard and honest
- Emphasize the *pattern* across searchlight clusters (the circuit-specific bidirectional story) rather than individual p-values
- Note that with N=33, IS-RSA is power-limited for searchlight correction — this is a limitation, not a failure
- Frame the uncorrected searchlight as motivation for future work with larger samples

### 4.3 The Reverse AnnaK Question

The anterior insula reverse AnnaK is novel and interesting, but it's uncorrected. Do you present it as a finding or a curiosity?

**Arguments for featuring it:**
- It's the only ROI with convergence for BOTH feedback types (consistency)
- It creates the beautiful insular dissociation (anterior converges, posterior diverges)
- It generates a testable prediction (insular parcellation analysis)
- It connects to the interoception/alarm literature

**Arguments for downplaying it:**
- Neither p-value survives FDR
- Reverse AnnaK is less well-documented in the literature
- It could be an artifact of the AnnaK gradient model's sensitivity to the distribution tails

### 4.4 The Brainstem Cluster

The largest searchlight cluster (k=80) is in the brainstem. This is eye-catching but potentially problematic:
- 97.5% falls in "unlabeled white matter" — it may not be gray matter at all
- Brainstem fMRI is susceptible to physiological noise
- But the brainstem is genuinely involved in autonomic threat responses
- Without cardiac/respiratory correction, this finding is ambiguous

**Recommendation:** Mention it but with appropriate caveats about brainstem fMRI reliability.

### 4.5 What RSA Explanation Does This Audience Need?

For an RSA-naive department audience, the explanation needs to be:
- Visual (a diagram, not words)
- Intuitive (fingerprints/maps, not matrices)
- Quickly communicated (~15-20 seconds of speech)
- Honest (doesn't oversimplify to the point of being wrong)

The core contrast to communicate: "We're not measuring HOW MUCH the brain activates. We're measuring WHETHER DIFFERENT PEOPLE'S BRAINS ACTIVATE IN THE SAME WAY."

### 4.6 Sample Size & Power

N=33 is reasonable for IS-RSA (528 unique pairs). But it's important to note:
- Baek et al. 2023 used N=66 (2,145 pairs)
- Camacho et al. 2024 used N=740
- Parkinson et al. 2018 used N=42
- The searchlight's failure to survive cluster correction may be partly a power issue
- The dimensional approach (continuous SCARED) is more powerful than categorical (high/low SA groups)

---

## PART V: KEY UNKNOWNS & FUTURE DIRECTIONS

### Things we don't know yet that would strengthen the story:

1. **Does the dACC1 idiosyncrasy predict real-world social functioning?** If higher idiosyncrasy → fewer friendships or more loneliness, that would close the loop on the "neural loneliness" narrative.

2. **Is the insular dissociation real?** Formal insular parcellation analysis would test whether anterior and posterior insula truly show opposite effects.

3. **Does the pattern replicate with larger N?** The searchlight cluster correction failure may be purely power-related.

4. **Is this specific to social anxiety or general to negative affect?** SCARED total, depression (CDI-2), and other anxiety subscales should be tested as alternative behavioral models.

5. **Does the asymmetry hold for specific peers?** Mean feedback from a *predictable* mean peer (expected) vs. from a *nice* peer (unexpected) may show different idiosyncrasy patterns.

6. **How does this relate to Clarkson's learning dynamics findings?** If anxious adolescents learn through different dynamics (Clarkson 2025), does idiosyncrasy track with the specific learning strategy each individual uses?

---

## PART VI: CRITICAL REFERENCES MAP

| Paper | What it establishes | How it maps to your findings |
|-------|--------------------|------------------------------|
| Baek et al. 2023 | Lonely people show idiosyncratic neural processing in DMN; correlates with feeling misunderstood | Your dACC1 finding extends this from loneliness to clinical anxiety; different brain region but same principle |
| Camacho et al. 2024 | SA youth show higher ISC variability to narrative stimuli (N=740, replicated) | Direct precedent; your study adds experimental control (task > movies) and condition specificity (Mean > Nice) |
| Finn et al. 2020 | IS-RSA framework; idiosynchrony concept; methodological blueprint | Your methodological foundation |
| Shen et al. 2025 | Neural similarity predicts friendship formation | Establishes the *consequential significance* of your finding: if idiosyncrasy → less neural similarity → fewer friendships |
| Lamba et al. 2020 | Anxiety impairs social learning under uncertainty | Supports the idea that anxiety disrupts social information processing; your RSA approach reveals *how* (idiosyncratic patterns, not just slower learning) |
| Jarcho et al. 2015, 2016 | Anxious adolescents show heightened PE signals but fail to update | Your dACC1 finding reframes this: the PE signal isn't just "heightened" — it's *idiosyncratic* |
| Clarkson et al. 2025 | Anxious adolescents learn through different dynamics but reach similar endpoints | Sets up the question your RSA answers: *how* are the representations organized, given that the endpoints are similar? |
| Silani et al. 2013 | Right SMG mediates self-other distinction in empathy | Your SMG idiosyncrasy for Mean feedback may reflect individual differences in self-other distinction during social threat |
| Terasawa et al. 2013 | Anterior insula mediates bodily sensibility and social anxiety | Your anterior insula convergence: anxious adolescents share heightened interoceptive alarm |
| Popal et al. 2019 | Guide to RSA for social neuroscience | Methodological citation; establishes RSA as suitable for social cognition |
| Greco et al. 2024 | Predictive learning shapes representational geometry | Validates RSA as measure of learning-induced representational change |
| Parkinson et al. 2018 | Neural similarity predicts social network distance | Supports broader claim that neural pattern similarity tracks real-world social relationships |
| Negative affect + memory (PMC 2023) | Negative affect homogenizes, positive affect diversifies memory | Reverse of your pattern (Mean idiosyncrasy, Nice convergence) — worth discussing as contrast |

---

## PART VII: OPEN QUESTIONS FOR YOU (DANNY)

Things I think you need to decide or think about before the presentation takes shape:

1. **Which framing resonates with you?** The "neural loneliness" story (A) is the most accessible. The "bidirectional AnnaK" story (B) is the most nuanced. The methodological story (C) sells the approach. The asymmetry story (D) is the cleanest.

2. **How much do you want to lean into the searchlight?** You said it's a huge part — and it is, interpretively. But statistically, none of it survives correction. How comfortable are you presenting uncorrected whole-brain results in a department talk?

3. **Is the reverse AnnaK in the anterior insula something you want to feature or just mention?** It's novel and interesting but uncorrected.

4. **How do you want to handle the dACC1 Nice/Mean similarity?** The effect sizes are the same — do you frame this as mean-specific (based on p-values) or general (based on effect sizes)?

5. **What is the one thing you want the audience to walk away remembering?** In a 2-minute talk, this is the single most important decision.

6. **Where does this presentation sit in your broader trajectory?** Is this the first time the lab/department has seen these results? Is it a progress report, a "look what I found" talk, or a polished story?
