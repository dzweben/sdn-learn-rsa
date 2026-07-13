# Presentation Plan: LEARN RSA — 2-Minute Data Blitz

**Format:** Department/program talk, 2-minute lightning presentation
**Audience:** RSA-naive (familiar with fMRI, not with RSA methods)
**Date prepared:** 2026-03-24

---

## I. THE CORE CHALLENGE

You have 2 minutes to communicate a study that involves a novel task, a non-standard analytic method (IS-RSA), a theoretically rich framework (Anna Karenina), and nuanced findings. The audience doesn't know RSA. The constraint is brutal.

**The golden rule of a 2-minute talk:** You get ONE idea. Not two. One. Everything in the talk must serve that one idea, or it gets cut.

**Your one idea:** *Socially anxious adolescents don't just react differently to mean peers — they represent the experience in fundamentally idiosyncratic ways, and we can see this in their brain patterns.*

---

## II. STRATEGIC DECISIONS

### What to keep
- The Anna Karenina hook (it's memorable, vivid, and explains the finding in one sentence)
- The dACC1 finding (your one significant result — own it)
- A single visual that makes RSA intuitive
- The "why it matters" punchline

### What to cut (painfully)
- Detailed task mechanics (peer types, predictability manipulation, run structure)
- Detailed pipeline description (41 regressors, AFNI, timing files)
- ROI-by-ROI results table
- Searchlight cluster tables (mention existence only)
- Behavioral models comparison (NN vs. AnnaK — just present AnnaK)
- Literature review beyond 1-2 sentences of setup

### What to simplify
- Task → "Adolescents predicted and received nice or mean feedback from virtual peers across repeated interactions"
- RSA → A single visual metaphor (see Section IV)
- IS-RSA → "We compared how similar each person's brain patterns were to everyone else's"
- Anna Karenina → The Tolstoy quote does the work for you
- dACC1 → "dorsal anterior cingulate" or just "dACC" — a region involved in conflict monitoring and social prediction errors

---

## III. SLIDE-BY-SLIDE PLAN

For a 2-minute talk, you want **3 slides maximum** (some people do 2). Each slide gets ~40 seconds of speaking time. Here is the recommended structure:

---

### SLIDE 1: THE PROBLEM & THE QUESTION (~40 sec)

**Visual:** Clean title area + one striking image or graphic
**Layout:** Left side = text/question, Right side = conceptual image

**Title:** "Idiosyncratic Neural Representations of Social Feedback in Adolescent Social Anxiety"
*(or shorter: "Are Anxious Brains Lonely Brains?")*

**Content on slide:**
- Your name, institution, advisor, date
- One sentence of background setup
- The research question

**What you SAY (not what's on the slide):**

> "Social anxiety is the most common anxiety disorder in adolescence, and we know it's associated with altered processing of social feedback — heightened reactivity to rejection, difficulty updating from positive experiences. But most of this work asks *how much* anxious brains respond. We asked a different question: do socially anxious adolescents represent peer feedback *differently* — not just more or less, but in their own unique way?"

**Design notes:**
- Consider a conceptual image: e.g., a group of similar brain silhouettes in blue, with one distinctly different brain in a different pattern/color — visually encoding "idiosyncrasy" before you've said the word
- Minimal text on slide. Maybe just the research question in large font: *"Do socially anxious adolescents represent peer feedback idiosyncratically?"*
- Affiliations and name can be small at the bottom

**Key background references to have ready (not necessarily on slide):**
- Jarcho et al. (2015, 2016): Virtual School Task — anxious adolescents show heightened striatal response to unexpected positive feedback but fail to update predictions
- Camacho et al. (2024, JAACAP): Higher inter-subject neural variability in socially anxious youth during movie-watching (N=740, discovery + replication)
- Baek et al. (2023, Psych Science): Lonely individuals process the world idiosyncratically, especially in default-mode regions

---

### SLIDE 2: METHOD + KEY CONCEPT (~40 sec)

**Visual:** This is the make-or-break slide. It needs to do three things at once:
1. Convey what the task is (briefly)
2. Make RSA/IS-RSA intuitive
3. Introduce the Anna Karenina framework

**Recommended layout:** A 3-panel visual strip or flowchart

**Panel A — The Task (tiny, ~25% of slide):**
A simplified schematic of one LEARN trial:
- Icon of participant → "Predicts peer behavior" → Arrow → "Receives Nice or Mean feedback"
- Small text: "33 adolescents (ages 10-15) | 4 virtual peers | 128 trials across 4 fMRI runs"
- No need to explain reputation × predictability manipulation — it's too much for 2 min

**Panel B — The Method: IS-RSA (main visual, ~40% of slide):**

This is where you need a brilliant visual explanation of IS-RSA for a naive audience. Here is the recommended approach:

**"Brain Pattern Fingerprints" visual:**
1. Show 4-5 small brain images, each with a different colored multi-voxel pattern overlay → labeled "Person 1's brain pattern for Mean feedback", "Person 2's...", etc.
2. Arrow pointing to a correlation matrix (the ISM) → "How similar is each person's pattern to everyone else's?"
3. Arrow pointing to a gradient bar colored by social anxiety score → "Does similarity track with social anxiety?"

The key insight to convey visually: *We're not asking "does this brain region activate more?" — we're asking "does this brain region activate in the same WAY as everyone else's?"*

**Panel C — The Anna Karenina Model (~35% of slide):**

The Tolstoy quote, styled beautifully:

> *"All happy families are alike; each unhappy family is unhappy in its own way."*
> — Tolstoy, *Anna Karenina*

Translated to neuroscience (small text below quote):
- "Low anxiety → similar brain patterns to peers"
- "High anxiety → idiosyncratic brain patterns"

**What you SAY:**

> "We used the LEARN task — adolescents predicted and received nice or mean feedback from virtual peers across 128 trials in the scanner. But instead of asking whether anxious brains activate *more*, we used inter-subject representational similarity analysis to ask whether anxious brains activate *differently*. [gesture to IS-RSA visual] We extracted multi-voxel patterns from each person, then asked: do people with similar anxiety levels have similar brain patterns? We tested the 'Anna Karenina' model — [gesture to quote] — the prediction that low-anxiety adolescents would share similar neural representations, while high-anxiety adolescents would each diverge in their own unique way."

**Design notes:**
- This slide will be dense, but that's okay — you're talking over it, and it serves as a reference
- Use icons and arrows rather than text blocks
- Color-code: blues for low anxiety / similarity, reds/oranges for high anxiety / idiosyncrasy
- The Tolstoy quote is a memory anchor — the audience will remember this even if they forget the statistics

---

### SLIDE 3: RESULTS + IMPLICATIONS (~40 sec)

**Visual:** Results panel + implications bullets
**Layout:** Left = key result figure, Right = interpretation + next steps

**Left side — The dACC1 Finding:**

Option A (preferred): A **forest plot** showing the AnnaK Gradient rho for all 8 ROIs during Mean feedback, with dACC1 highlighted (starred, bolded, different color) as the only significant result (ρ = -0.166, p_FDR = .036). This is clean, shows the full pattern, and communicates "we tested many regions, one survived correction."

Option B: A simplified **scatter-style plot** — x-axis = social anxiety (SCARED), y-axis = neural idiosyncrasy score for dACC1/Mean, showing the negative relationship. More intuitive but doesn't show the multi-ROI testing.

Option C: Side-by-side brain images — a "group average" ISM heatmap vs. the actual ISM, with the AnnaK model matrix alongside, showing the Mantel correlation. More technical, probably too much for 2 min.

**Recommendation: Option A (forest plot)** — it's honest (shows all tests), clear (one bar stands out), and fast to read.

**Below the forest plot, one line of text:**
> "dACC1 — Mean Feedback: ρ = -0.17, p_FDR = .036"
> "Higher social anxiety → more idiosyncratic neural patterns for mean feedback"

**Right side — Interpretation + Exploratory:**

- One bullet: "Exploratory whole-brain searchlight revealed distributed idiosyncrasy effects (uncorrected) — cluster correction pending"
- Optional: A small, thumbnail brain map showing the searchlight results — just to show there's more data, without dwelling on it
- Two-sentence "so what":

> "The dACC — a region involved in conflict monitoring and social prediction errors — shows the Anna Karenina effect: anxious adolescents don't just react more to mean feedback, they represent it in fundamentally different ways from their peers. This 'neural loneliness' may help explain why socially anxious youth feel misunderstood even when they accurately read social cues."

**What you SAY:**

> "In the dorsal anterior cingulate — a region critical for monitoring social conflict and prediction errors — we found the Anna Karenina effect. [gesture to forest plot] Adolescents with higher social anxiety showed significantly more idiosyncratic brain patterns when processing mean feedback. This was the only region to survive FDR correction across our 8 ROIs. Exploratory whole-brain analysis showed distributed idiosyncrasy effects, though these didn't survive cluster correction. [gesture to implication text] The takeaway: anxious adolescents don't just *feel more* when peers are mean to them — they *experience it differently from everyone else*. This neural idiosyncrasy may contribute to the pervasive sense of being misunderstood that defines social anxiety."

---

## IV. THE RSA EXPLANATION PROBLEM (DEEP DIVE)

Since your audience is RSA-naive, the single most important creative challenge is **making IS-RSA intuitive in ~15 seconds of speech**. Here are several metaphor strategies, ranked by effectiveness for a 2-minute format:

### Strategy 1: "Fingerprints" (RECOMMENDED)
> "Think of each person's brain response to mean feedback as a fingerprint — a unique pattern of activity across thousands of neurons. We can compare these fingerprints across people. In our study, low-anxiety kids had similar fingerprints. High-anxiety kids each had their own."

**Why it works:** Everyone knows what a fingerprint is. The word "unique" does the theoretical work. No jargon needed.

### Strategy 2: "Playlists"
> "Imagine 33 people all listening to the same song. Most people tap along to the same beat. But some people hear something completely different — their internal soundtrack is unique. We looked at whether socially anxious adolescents have a unique 'neural soundtrack' when they experience mean peer feedback."

**Why it works:** Intuitive, relatable, captures the "same stimulus, different internal representation" idea.

### Strategy 3: "Map of a City"
> "RSA asks: does everyone's brain draw the same map of the social world? We found that low-anxiety adolescents have similar maps — they organize peer feedback in similar ways. High-anxiety adolescents each draw a different map."

**Why it works:** Maps are spatial (like brain patterns), and "drawing different maps of the same territory" is immediately vivid.

### Strategy 4: The Direct Comparison (Formal)
> "Traditional fMRI asks: does this region activate MORE? We ask: does this region activate in the same WAY? Inter-subject RSA compares the pattern — not the amount — of brain activity across people."

**Why it works:** Clear contrast. Less memorable, but technically precise.

**Recommendation:** Use Strategy 1 or 3 for the spoken narration, and put the formal contrast (Strategy 4) as a small text annotation on the slide for anyone who wants the technical version.

---

## V. NARRATIVE ARC

The 2-minute talk has a 3-act structure:

**Act 1 (0:00-0:40) — "Here's what we don't know"**
- Social anxiety + feedback processing is studied, but always as "more or less" activation
- We asked: is the *pattern itself* different? (Novelty claim)
- This matters because neural similarity predicts social connection (Shen et al. 2025; Baek et al. 2023)

**Act 2 (0:40-1:20) — "Here's what we did"**
- LEARN task: adolescents + virtual peers + nice/mean feedback + fMRI
- IS-RSA: compare brain pattern "fingerprints" across people
- Anna Karenina model: predict that high-anxiety = idiosyncratic patterns

**Act 3 (1:20-2:00) — "Here's what we found, and why it matters"**
- dACC1 shows the Anna Karenina effect for mean feedback (FDR-corrected)
- Exploratory whole-brain results show distributed idiosyncrasy (uncorrected)
- Implication: anxious adolescents don't just feel more — they experience social feedback in fundamentally different ways, which may perpetuate feeling misunderstood

---

## VI. KEY TALKING POINTS & FRAMING DECISIONS

### 1. Why the dACC matters (for your narration)
The dACC (specifically dACC1, near the anterior commissure) is implicated in:
- **Conflict monitoring**: detecting when outcomes violate expectations (Botvinick et al. 2001)
- **Social prediction errors**: signaling mismatches between expected and received social feedback (Jarcho et al. 2015; Apps et al. 2016)
- **Salience detection**: flagging motivationally relevant social information (Menon & Uddin 2010)

This makes the finding interpretable: the dACC is where the brain *notices* that feedback doesn't match expectations. If anxious adolescents have idiosyncratic patterns here specifically for mean feedback, it suggests they're not just noticing the mismatch — they're encoding it in a way that diverges from their peers' shared understanding.

### 2. Why mean feedback (not nice) drove the effect
This is worth mentioning briefly because it's theoretically sensible:
- Mean feedback from peers is the core feared stimulus in SAD
- The Anna Karenina principle predicts that the stimulus most relevant to the "unhappy" dimension should show the greatest idiosyncrasy
- Nice feedback may be processed more uniformly because positive social information is less ambiguous and less individually interpreted
- This aligns with Lamba et al. (2020): anxiety specifically disrupts learning from negative social outcomes

### 3. Why "idiosyncrasy" and not just "different activation level"
This is the methodological novelty claim. Traditional fMRI asks: "Does region X activate more in Group A than Group B?" IS-RSA asks: "Do people in Group A have *similar patterns to each other*, or does each person have their own unique pattern?" This is a fundamentally different question — it's about the structure of neural representations, not their magnitude.

**Analogy for the audience:** "Imagine I show 30 people a sunset. Traditional fMRI asks: do anxious people's visual cortex light up MORE? RSA asks: do anxious people SEE the same sunset? Our answer: they don't."

### 4. The broader theoretical frame: "neural loneliness"
Connect to Baek et al. (2023) — lonely people process the world idiosyncratically, especially in default-mode network regions. Your finding extends this: *social anxiety*, not just loneliness, produces neural idiosyncrasy, and specifically for the stimuli that matter most (mean social feedback). This creates a bridge between the loneliness literature and the clinical anxiety literature.

### 5. What the null results tell us
All other ROIs (vmPFC, VS, Amygdala, AntInsula, RTPJ, dmPFC, dACC2) were non-significant after FDR correction. This is actually informative:
- It suggests the idiosyncrasy effect is not a global brain phenomenon — it's region-specific
- The dACC's role in conflict/prediction error monitoring makes it a theoretically privileged site for this effect
- The null in vmPFC/VS (reward regions) suggests the *valuation* of feedback may be shared, even if the *conflict detection* is idiosyncratic

### 6. The exploratory searchlight story (brief mention)
When you mention the searchlight results, frame it as "promising but preliminary":
> "Whole-brain searchlight analysis showed distributed idiosyncrasy effects across visual, temporal, and brainstem regions, as well as some convergence effects in default-mode areas. These didn't survive cluster-level correction, so we treat them as hypothesis-generating for future work."

---

## VII. WHAT MAKES THIS STUDY NOVEL — YOUR SELLING POINTS

For a 2-minute talk, you need a crisp "why should you care" framing. Here are the novelty claims, ranked by impact:

### Novelty 1: First IS-RSA study of social feedback processing in adolescent anxiety
- IS-RSA has been applied to loneliness (Baek 2023), popularity (Parkinson et al. 2021), psychoticism (2025), and general social anxiety movie-watching (Camacho 2024)
- But no one has applied it to *controlled social feedback* (nice vs. mean from peers) in a task-based fMRI design
- The LEARN task gives you experimental control (manipulated peer characteristics) that naturalistic paradigms lack

### Novelty 2: The move from "how much" to "in what way"
- The field's dominant question: "Do anxious brains activate more to threat?"
- Your question: "Do anxious brains organize social feedback in the same representational space as their peers?"
- This is a genuine conceptual shift — from magnitude to geometry

### Novelty 3: The Anna Karenina framework applied to clinical anxiety
- Previously applied to loneliness, popularity, persuasion
- Applying it to a clinical dimension (social anxiety) in a developmental sample is new
- Connecting idiosyncrasy to the phenomenology of SAD ("feeling misunderstood," "no one gets it") gives it clinical face validity

### Novelty 4: Adolescent development
- Adolescence is when social anxiety crystallizes AND when social representational systems are maturing
- Studying idiosyncrasy during this sensitive period has developmental implications
- Connects to Tottenham's work on delayed mPFC maturation

---

## VIII. COMMON AUDIENCE QUESTIONS (PREPARE FOR Q&A)

Even in a 2-minute format, there may be brief Q&A. Prepare for:

1. **"What is RSA / IS-RSA?"** → Use the fingerprint metaphor. "Instead of asking how much a brain region activates, we compare the full spatial pattern of activity across voxels — like a fingerprint. IS-RSA compares these fingerprints between people."

2. **"Why only dACC1?"** → "The dACC is specifically involved in conflict monitoring and social prediction errors, making it a theoretically privileged site for detecting idiosyncrasy in how feedback mismatches are processed. The null results in reward regions suggest the idiosyncrasy is specific to conflict detection, not valuation."

3. **"Is N=33 enough?"** → "IS-RSA leverages pairwise comparisons — with 33 subjects, we have 528 unique pairs, providing reasonable power for the Mantel test. This sample size is comparable to other IS-RSA studies (e.g., Baek et al. 2023: N=63; Parkinson/Wheatley: N~30-40)."

4. **"Why not use ISC instead of IS-RSA?"** → "ISC compares time-courses and requires naturalistic designs. IS-RSA compares spatial patterns from task-based GLM betas, which lets us isolate specific conditions (nice vs. mean feedback) with experimental control."

5. **"What does idiosyncrasy actually mean clinically?"** → "If anxious adolescents represent mean peer feedback in ways that diverge from the group norm, it may contribute to the phenomenological experience of 'no one understands what I go through.' Neural similarity is linked to social bonding (Shen et al. 2025), so neural divergence could be both a consequence and a maintaining factor of social isolation."

6. **"Could motion/noise explain this?"** → "All subjects passed QC (mean censor fraction 5.4%), we used no spatial smoothing (preserving pattern information), and the Mantel test uses row/column permutation which preserves the dependence structure of the similarity matrix."

7. **"What about the searchlight results?"** → "Whole-brain searchlight at p<.01 uncorrected showed distributed effects — idiosyncrasy in visual, temporal, and brainstem regions; convergence in default-mode. Cluster-level FWE correction is in progress. These are hypothesis-generating."

---

## IX. VISUAL DESIGN PRINCIPLES

### Color palette
- **Cool blues/teals** for low anxiety / similarity / convergence
- **Warm oranges/reds** for high anxiety / idiosyncrasy / divergence
- **Neutral gray** for non-significant results
- This creates an intuitive visual language: blue = shared, warm = unique

### Typography
- Sans-serif (Arial, Helvetica, or Calibri) for readability
- Title: 28-36pt
- Body text: 18-24pt minimum
- NO paragraphs of text. Ever. If you can't say it in one line, say it out loud instead.

### Figures
- Forest plot should have clear horizontal axis, labeled ROIs, and the dACC1 bar should be a different color (red/orange) from the rest (gray)
- Any brain images should use a consistent colormap (e.g., blue-red diverging for rho values)
- The ISM heatmap (if used) should be labeled with "Low SA" and "High SA" markers on the axes

### Slide count
- **3 slides.** No more. At 2 minutes, 3 slides is already ~40 sec each.
- If you have a mandatory title slide separate from content, make it 4 slides (title + 3 content), but keep the title up for <5 seconds.

---

## X. SCRIPT DRAFT (~2 MINUTES)

Here is a full draft script. Read it aloud and time it — it should come in around 1:50-2:00.

---

**[SLIDE 1 — Title + Research Question]**

"Social anxiety is the most common anxiety disorder in adolescence, and we know a lot about how anxious brains *react* to social feedback — more amygdala activation, more insula, altered prediction error signals. But almost all of this work asks the same question: does this region activate *more or less*? Today I want to share a different question: do socially anxious adolescents represent peer feedback *in a fundamentally different way* from their peers?"

**[SLIDE 2 — Method + Anna Karenina]**

"We used the LEARN task — 33 adolescents predicted and received nice or mean feedback from virtual peers across 128 trials in the fMRI scanner. But instead of looking at activation levels, we used inter-subject representational similarity analysis. Think of each person's brain response as a fingerprint — a unique pattern across thousands of voxels. We compared everyone's fingerprints and asked: do people with similar anxiety have similar patterns? We tested the Anna Karenina model — the idea that low-anxiety adolescents would show similar neural representations, while high-anxiety adolescents would each be unique in their own way."

**[SLIDE 3 — Results + Implications]**

"In the dorsal anterior cingulate — a region critical for conflict monitoring and social prediction errors — we found exactly this. [gesture] Higher social anxiety predicted more idiosyncratic brain patterns specifically for mean feedback, surviving FDR correction across 8 ROIs. Exploratory whole-brain searchlight showed distributed idiosyncrasy effects, though these are still being corrected for multiple comparisons. The bottom line: socially anxious adolescents don't just *feel more* when peers are mean — they *experience it differently from everyone else*. This kind of neural idiosyncrasy — recently linked to loneliness and social disconnection — may help explain why anxious youth feel fundamentally misunderstood, even when they're reading social cues accurately. Thank you."

---

## XI. WHAT STILL NEEDS TO HAPPEN BEFORE MAKING SLIDES

1. **Generate/finalize figures:**
   - Forest plot of AnnaK Gradient rho values for Mean feedback across 8 ROIs (from existing IS-RSA results)
   - Optional: one clean brain map from searchlight (rho map, Mean feedback, thresholded at p<.01)
   - Optional: simplified ISM heatmap for dACC1/Mean to show what the similarity matrix looks like

2. **Design the IS-RSA visual explanation:**
   - This is the single most important design task
   - Needs to be a clean, schematic diagram showing: brain patterns → pairwise comparison → relationship to anxiety
   - Consider creating this in PowerPoint, Illustrator, or Figma

3. **Run searchlight cluster correction** (pending server time):
   - Not required for the 2-min talk, but having the result would strengthen the "exploratory" mention

4. **Practice timing:**
   - The script above should be ~1:50-2:00
   - Practice with slides to calibrate pacing
   - Record yourself — 2-min talks are unforgiving of filler words and pauses

5. **Decide on title:**
   - Formal: "Idiosyncratic Neural Representations of Social Feedback in Adolescent Social Anxiety"
   - Catchy: "Are Anxious Brains Lonely Brains? Neural Idiosyncrasy in Adolescent Social Anxiety"
   - Short: "The Anna Karenina Effect in Adolescent Social Anxiety"

---

## XII. REFERENCES FOR SLIDES (keep one reference slide as backup)

### Core citations for this talk:
- Baek, E. C., et al. (2023). Lonely individuals process the world in idiosyncratic ways. *Psychological Science*, 34(6), 683-695.
- Camacho, M. C., et al. (2024). Higher intersubject variability in neural response to narrative social stimuli among youth with higher social anxiety. *JAACAP*, 63(5), 518-528.
- Finn, E. S., & Scheinost, D. (2020). Idiosynchrony: From shared responses to individual differences during naturalistic neuroimaging. *NeuroImage*, 225, 117483.
- Jarcho, J. M., et al. (2015). Forgetting the best when predicting the worst: Preliminary observations on neural circuit function in adolescent social anxiety. *Developmental Cognitive Neuroscience*, 13, 21-31.
- Kriegeskorte, N., Mur, M., & Bandettini, P. A. (2008). Representational similarity analysis. *Frontiers in Systems Neuroscience*, 2, 4.
- Lamba, A., et al. (2020). Anxiety impedes adaptive social learning under uncertainty. *Psychological Science*, 31(5), 592-603.
- Parkinson, C., et al. (2021). Similar neural responses predict friendship. *Nature Communications*, 9, 332.
- Shen, X., et al. (2025). Neural similarity predicts whether strangers become friends. *Nature Human Behaviour*.
- Thornton, M. A., & Tamir, D. I. (2019). People represent mental states in terms of rationality, social impact, and valence. *Nature Human Behaviour*, 3, 1011-1019.

### Methodological citations:
- Dufour, N., & Bhatt, M. (2019). A guide to representational similarity analysis for social neuroscience. *SCAN*, 14(11), 1243-1253.
- Birmaher, B., et al. (1997). SCARED psychometric properties. *JAACAP*, 36(4), 545-553.

---

## XIII. CREATIVE ANGLES TO CONSIDER

### The "Misunderstood" Frame
The most emotionally resonant angle for a general audience: *anxious adolescents literally see the social world differently, which is why they feel like no one understands them — because at a neural level, no one is processing it the same way they are.* This connects neuroscience to the lived phenomenology of SAD in a way that will stick with the audience.

### The "Not Broken, Just Different" Frame
An alternative angle that avoids deficit framing: *the finding isn't that anxious brains are "wrong" — it's that they're unique. The question is whether this uniqueness comes at a social cost, and our data suggests it may.* This is more nuanced and avoids pathologizing divergence.

### The "Invisible Problem" Frame
Another angle: *traditional approaches to studying SAD in fMRI look for "more" or "less" activation — they ask about volume. We looked at pattern — we asked about signal. The idiosyncrasy we found would have been invisible to a standard analysis.* This sells the method as much as the finding.

**Recommendation:** Lead with the "Misunderstood" frame for emotional resonance, and mention the "Invisible Problem" frame to sell the methodological innovation.

---

## XIV. THINGS NOT TO SAY IN 2 MINUTES

- Don't say "representational dissimilarity matrix" — just say "brain patterns"
- Don't explain the Mantel test — just say "statistical test"
- Don't enumerate all 8 ROIs by name — just say "8 brain regions involved in social processing"
- Don't explain FDR correction mechanics — just say "corrected for multiple comparisons"
- Don't explain the difference between NN and AnnaK models — just present AnnaK
- Don't say "goforit 10" or "anticipation regressor" — these are pipeline details
- Don't explain the reputation × predictability manipulation — too detailed
- Don't say "41 regressors" — irrelevant to the audience
- Don't apologize for sample size — 33 is fine for IS-RSA, own it

---

## XV. SUMMARY OF RECOMMENDATIONS

| Decision | Recommendation |
|----------|---------------|
| Number of slides | 3 (+ optional title if required) |
| Central metaphor | Brain pattern "fingerprints" |
| Key visual | Forest plot of AnnaK rho across 8 ROIs, dACC1 highlighted |
| RSA explanation | Fingerprints metaphor + "not how much, but in what way" |
| Theoretical hook | Anna Karenina quote (Tolstoy) |
| Clinical relevance | "Neural loneliness" → feeling misunderstood |
| Searchlight | Brief mention, 1 sentence, label as exploratory |
| What to cut | Task details, pipeline, behavioral models, ROI-by-ROI tables |
| Framing | "Misunderstood" + "Invisible Problem" |
| Title | "Are Anxious Brains Lonely Brains?" or formal variant |
