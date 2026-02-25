# Step 1 — Annotated Background + Literature Map (Deep Dive)

This section is the **foundational narrative** for the project. It translates the proposal, internal presentations, and notes into a coherent background with explicit links to repo sources. The goal is a **high‑signal literature map** that motivates the analyses.

---

## 1) Core Research Questions (Framing)

**Primary questions**
1. Do adolescents’ neural representations of peers become organized according to the true peer structure as learning unfolds?
2. Are those representations more idiosyncratic (less group‑aligned) in youth with higher social anxiety?

**Source anchors**
- `Project_Proposal.docx` (abstract, hypotheses, method, ROI targets)
- `Learn/Papers_Presentation/Learn.pptx` (LEARN task description)
- `Learn/Papers_Presentation/Clarkson_Defense_2.0.pptx` (SA measures, social learning framing)

---

## 2) Task Context: From Virtual School Task to LEARN

**Virtual School Task (VST):**
- Participants interact with multiple peers whose reputations are known (nice/mean/unpredictable). Feedback is consistent with reputation. VST emphasizes prediction and feedback, modeling social evaluation under valence and predictability. [Learn.pptx]

**LEARN Task (modified VST):**
- Four peers.
- Peer reputations are **not disclosed**; participants must infer them through repeated interactions.
- Each peer has latent structure: disposition (nice/mean) × predictability (predictable/unpredictable).
- 4 runs, 8 interactions per peer per run → 128 trials total.
- Trial sequence: prediction → feedback → response. [Learn.pptx, MS_figures_all_052325_jj[27].pptx]

**Why this matters:**
- LEARN explicitly builds an **internal social model** from experience, which is ideal for RSA‑based representational learning analyses. [Project_Proposal.docx]

---

## 3) Social Anxiety Context + Measures

**Clinical context:**
- Social anxiety increases in adolescence when peer evaluation becomes central. Symptoms shape how social information is interpreted and remembered, but representation of the broader social structure remains poorly mapped. [Project_Proposal.docx]

**Measures used in this project:**
- **ADIS‑5 Child/Parent** interview for categorical SAD diagnosis. [Project_Proposal.docx; Clarkson_Defense_2.0.pptx]
- **SCARED social anxiety subscale** as continuous symptom metric. [Clarkson_Defense_2.0.pptx; Project_Proposal.docx]

---

## 4) Learning Dynamics: Prior Findings + Relevance

**Why learning matters here:**

- Prior work suggests socially anxious youth can learn peer contingencies but may show altered learning dynamics (e.g., rapid correction after unexpected outcomes). [Clarkson_2024_manuscript…, Clarkson_Defense_2.0.pptx]



**Computational context (from internal materials):**

- Social learning modeled using parameters like associability and prediction error.

- SA associated with higher associability of unexpected negative feedback in predictably positive or unpredictable contexts (hypervigilant correction). [Clarkson_2024_manuscript…, MS_figures_all_052325_jj[27].pptx]



**Bridge to RSA:**

- If learning is intact but altered in dynamics, neural representational geometry may still align with the true peer structure but with **different slopes** or **temporal signatures**.



---

## 5) Papers Presentation Deep Dive (Grant + Task + Modeling + Neural Findings)

This is the **core internal evidence base** for the LEARN task, sample, modeling approach, and prior findings. The goal here is to extract **methods, scales, and results** that directly inform RSA design.

### 5.1 F31 Grant (Clarkson_F31_resub_080819.pdf)
- Defines **computational learning framework** for LEARN.
- Models M1–M3 emphasize prediction error, expected value, **peer value**, and **peer volatility** (predictability) as contextual parameters.
- Primary neural emphasis: reward + salience networks; **functional connectivity** analyses (PPI, dual regression) tied to learning rates.
- Task structure: 4 runs; each peer appears 8× per run; prediction → feedback → response; **feedback phase emphasized**.
- Sample: ~N=60, ages 10–15; ADIS + CASI‑5 diagnostics; CAADC + community recruitment.

**Relevance:** This defines the **computational learning architecture** that LEARN RSA must complement (representational geometry layered on top of learning rates).

### 5.2 LEARN Task Slides (Learn.pptx)
- **Task definition:** 4 peers, 4 runs, reputations hidden; participants infer through repeated feedback.
- **Trial epochs:** prediction (4s), feedback (3s), response (4s).
- **Trial outcomes:** correct prediction vs prediction error (positive/negative), with reputational framing.
- **Sample info in slides:** 47 adolescents, ages 10–15; SCARED cutoff ≥7 corresponds to clinical SA; fMRI+modeling subsample = 33.
- **RSA idea in slides:** create peer‑level neural patterns (average across 32 trials per peer), build neural RDM, compare to **Disposition**, **Predictability**, and **Negativity** model RDMs; test SA differences.
- **Learning snapshot in slides:** best fit learning model emphasizes reinforcement/associability; SA shows faster adjustments after prediction errors with greater weight on negative PEs.

**Relevance:** Provides the **explicit RSA hypothesis set** and **peer‑level averaging logic** that is the immediate basis for your model‑RDM construction with current averaged betas.

#### 5.2a Trial Outcomes + Prediction Error Types (from LEARN slides)
- **Correct predictions (no PE):**
  - Predicted Nice → Got Nice (positive feedback)
  - Predicted Mean → Got Mean (negative feedback)
- **Incorrect predictions (PEs):**
  - Predicted Nice → Got Mean (**negative PE**)
  - Predicted Mean → Got Nice (**positive PE**)
- **Accuracy‑based PE**: about correctness (right vs wrong)
- **Reputation‑based PE**: about how feedback deviates from a **peer’s expected reputation**

#### 5.2b RSA Hypotheses from LEARN slides
- **Disposition RDM:** Nice peers cluster together; Mean peers cluster together.
- **Predictability RDM:** Predictable peers cluster together; Unpredictable peers cluster together.
- **Negativity RDM:** Mean peers cluster more strongly than Nice peers (negativity bias).
- **SA hypothesis (slide):** Lower SA → stronger alignment with Disposition RDM; Higher SA → altered alignment pattern (negativity‑weighted).

#### 5.2c Context Labels Used in Modeling
From the model validation slides, peer contexts are labeled:
- **Mpred** = Mean, Predictable
- **Munpred** = Mean, Unpredictable
- **Npred** = Nice, Predictable
- **Nunpred** = Nice, Unpredictable

These labels reappear in model‑validation figures and should be used when organizing RSA outputs by context.

### 5.3 Clarkson Defense (Clarkson_Defense_2.0.pptx)
#### 5.3a Model taxonomy (M1–M10)
- **M1–M5:** static learning‑rate models; context dependence varies by predictability, reputation valence, and feedback valence.
- **M6–M10:** dynamic models adjusting learning rate based on attention to unexpected outcomes (PE‑weighted).

#### 5.3b Parsimony + model comparison
- Weight of unexpected outcome vs reputation is context‑dependent.
- Decay of prediction error is feedback‑dependent (pos vs neg).
- Model‑based regressors generated via simulation for fMRI analyses.

#### 5.3c Neural analysis notes
- Group‑level analyses use 3dMVM; key effect is **reputation‑based PE** (not accuracy‑based PE).
- Clusters: bilateral vmPFC, anterior/posterior dACC, anterior insula, ventral striatum.

#### 5.3d ROI‑specific PE pattern (from LEARN slides)
- **Predictable peers:** SA associated with
  - decreased response to negative PEs from predictably **nice** peers
  - increased response to positive PEs from predictably **mean** peers
- **Unpredictable peers:** SA effects weaker; vmPFC shows decreased response to negative PEs from unpredictably **mean** peers
- **Unpredictably nice peers:** no reliable SA‑by‑PE effects reported

- Group‑level analyses use 3dMVM; key effect is **reputation‑based PE** (not accuracy‑based PE).
- Clusters: bilateral vmPFC, anterior/posterior dACC, anterior insula, ventral striatum.

- **Measures:** ADIS + SCARED social anxiety subscale; cutoff ~7 aligns with ADIS in this sample.
- **Model structure:** 10 models (M1–M10) with static vs dynamic learning rates; contextual dependence on predictability, reputation valence, and feedback valence.
- **Parsimony results:** weight of unexpected outcomes is context‑dependent; decay of prediction error is feedback‑dependent.
- **Behavioral summary:** SA learns rapidly in predictably nice and unpredictable contexts; greater weight on unexpected negative feedback.
- **Neural summary:** reputation‑based prediction errors show SA‑dependent effects in vmPFC, dACC, insula, vStriatum; accuracy‑based PEs less informative.

**Relevance:** Establishes **which model‑based signals are meaningful** and **which ROIs show SA effects**, guiding RSA ROI prioritization and model‑RDM choice.

### 5.4 MS Figures (MS_figures_all_052325_jj[27].pptx)
- **Figure 1:** trial timing schema (prediction → feedback → response).
- **Figure 2–3:** model validation and parameter differences across contexts + SA (learning rate + associative value).
- **Figure 4–5:** reputation‑based prediction error effects by valence × predictability × SA (vmPFC, dACC, insula, vStriatum).

**Relevance:** These figures anchor the **specific contextual axes** (valence, predictability) that should be encoded into model‑RDMs.

### 5.5 Clarkson Manuscript (Clarkson_2024_manuscript…docx)
- **Sample:** ~47 youth, mean age ≈12.5 (from manuscript text extraction).
- **Methods:** computational modeling + fMRI during real‑time social interactions.
- **Finding:** higher associability of unexpected negative feedback in predictable or ambiguous contexts; altered neural engagement in value‑based regions.

**Relevance:** The manuscript establishes that **learning dynamics differ by SA**, motivating RSA to test whether **representational structure** also differs.

### 5.6 Takeaways for RSA Design
- **Model RDMs should encode valence × predictability** (primary axes from modeling results).
- **Peer‑level neural patterns** are a valid first step (avg across trials) given LEARN slides.
- **ROI focus:** vmPFC, dACC, insula, vStriatum are **core**; mentalizing network supports expanded hypotheses.

### 5.7 Papers Presentation Summary Table

### 5.8 Bridges to RSA Implementation
- **Reputation‑based PE effects** in vmPFC/dACC/insula/vStriatum imply these ROIs should be prioritized for RSA.
- **Context dependence** (predictability × valence) implies model‑RDMs must encode those axes explicitly.
- **Peer‑level averaging** used in slides validates the initial RSA approach with current averaged betas.
- **Learning rate asymmetry** (SA weighting negative PEs) motivates a **Negativity RDM** as a competing model.


| Source | Sample/Population | Methods/Models | Key Findings/Outputs | RSA Implication |
|---|---|---|---|---|
| Learn.pptx | 47 adolescents (10–15); SA cutoff ≥7 | LEARN task + RSA hypotheses | Disposition/Predictability/Negativity RDMs; peer‑level averaging | Directly defines model‑RDMs |
| Clarkson_Defense_2.0.pptx | Same cohort | M1–M10 learning models; PE‑based fMRI | SA: faster adjustments; reputation‑based PE effects in vmPFC/dACC/insula/vStr | ROI + model‑RDM selection |
| MS_figures_all_052325_jj[27].pptx | Same cohort | Model validation + PE decomposition | Learning rate + associative value differences by context + SA | Encode context axes in RDMs |
| Clarkson_2024 manuscript | ~47 youth | Computational modeling + fMRI | Higher associability for unexpected negative feedback | Supports SA‑linked learning dynamics |
| Clarkson_F31 grant | N≈60 (10–15) | Computational models + connectivity | Learning parameters + FC approach | Computational layer to compare with RSA |



## 6) RSA Papers Map (Methods + Findings + Relevance)

This section extracts **methodology + findings** from the RSA paper folder and links each paper to the LEARN RSA aims.

### 6.1 Greco et al., 2024 — Predictive learning shapes representational geometry  
**File:** `Predictive learning shapes the representational geometry of the human brain _ Nature Communications.pdf`  
**Methodology (from abstract):** MEG during listening to acoustic sequences with different regularities.  
**Key finding:** Representational geometry **aligns to the statistical structure** of the environment; clustering of predictable stimuli; alignment magnitude correlates with prediction‑error encoding.  
**Relevance to LEARN:** Direct precedent for **model‑RDM alignment** logic—learning reorganizes geometry to match true structure.

### 6.2 Finn et al., 2020 — Idiosynchrony / IS‑RSA  
**File:** `nihms-1585696.pdf`  
**Methodology (from abstract):** Review + framework paper introducing **inter‑subject representational similarity analysis (IS‑RSA)**, demonstrated using naturalistic movie data (HCP).  
**Key finding:** IS‑RSA recovers brain‑behavior relationships by quantifying **idiosyncratic** vs shared neural responses.  
**Relevance to LEARN:** Methodological foundation for **idiosyncrasy analysis** (Anna Karenina approach).

### 6.3 Baek et al., 2023 — Lonely individuals process the world in idiosyncratic ways  
**File:** `Lonely individuals process the world in idiosynractic ways.pdf`  
**Methodology (from abstract/methods):** fMRI of first‑year students; naturalistic stimuli; measure alignment of neural responses across individuals.  
**Key finding:** Lonelier individuals show **less shared neural responses**, especially in default‑mode regions; effect persists controlling demographics and social ties.  
**Relevance to LEARN:** Supports the idea that **social disconnection ↔ idiosyncrasy**, grounding the SA idiosyncrasy hypothesis.

### 6.4 Shen et al., 2025 — Neural similarity predicts who becomes friends  
**File:** `neuralsimpredictswhobecomesfriends.pdf`  
**Methodology (from methods snippet):** fMRI responses to stimuli; social network mapped over time (Time 1 → Time 2/3).  
**Key finding:** **Pre‑existing neural similarity** predicts later friendship proximity and trajectories.  
**Relevance to LEARN:** Establishes functional significance of shared neural geometry for **real‑world social bonding**.

### 6.5 Camacho et al., 2024 — Higher inter‑subject variability in youth with higher SA  
**File:** `nihms-2066703.pdf`  
**Methodology (from abstract):** Healthy Brain Network (N≈740; ages 5–15), naturalistic movies; tested mean activity and inter‑subject variability vs SCARED.  
**Key finding:** No mean differences, but **higher inter‑subject variability** in high‑SA youth (posterior cingulate, supramarginal, IFG).  
**Relevance to LEARN:** Direct evidence that **SA relates to neural variability**, supporting idiosyncrasy predictions.

### 6.6 Lamba et al., 2020 — Anxiety impedes adaptive social learning under uncertainty  
**File:** `lamba-et-al-2020-anxiety-impedes-adaptive-social-learning-under-uncertainty.pdf`  
**Methodology (from abstract):** Dynamic trust game + matched nonsocial task; computational modeling of learning under uncertainty.  
**Key finding:** Anxious participants over‑invest in exploitative partners; modeling suggests reduced learning from negative social events and failure to scale learning with uncertainty.  
**Relevance to LEARN:** Anchors the **uncertainty‑learning** angle; motivates testing learning dynamics in SA with a controlled social feedback task.


---




### 6.7 RSA Papers — Methods/Findings Matrix

| Paper | Paradigm | Sample | Analysis Type | Key Finding | Direct Link to LEARN |
|---|---|---|---|---|---|
| Greco 2024 | MEG, auditory sequences | Human adults | RSA on representational geometry | Geometry aligns to statistical structure; linked to PE encoding | Supports model‑RDM alignment across learning |
| Finn 2020 | Naturalistic fMRI (movies) | HCP | IS‑RSA framework | Idiosynchrony captures brain‑behavior relations | Method backbone for idiosyncrasy |
| Baek 2023 | Naturalistic fMRI | 66 first‑year students | Inter‑subject similarity | Lonelier people show less shared neural responses | Social disconnection ↔ idiosyncrasy |
| Shen 2025 | fMRI + social network | Cohort over time | Neural similarity vs friendship distance | Pre‑existing similarity predicts later friendship | Shared geometry predicts social bonding |
| Camacho 2024 | Naturalistic movies | N≈740 youth | Mean activation vs variability | SA ↔ higher inter‑subject variability | SA‑linked idiosyncrasy in youth |
| Lamba 2020 | Trust game + nonsocial | n≈400 | Computational learning under uncertainty | Anxiety reduces learning from negative social events | Motivates uncertainty‑learning axis |

### 6.8 Methodological Takeaways for LEARN RSA
- **Inter‑subject similarity is meaningful** even when mean activation differences are absent (Camacho).
- **Neural similarity predicts real‑world social outcomes** (Shen), so representational alignment is behaviorally relevant.
- **Idiosynchrony captures individual differences** in social cognition (Finn, Baek).
- **Representational geometry shifts with learning** (Greco), supporting run‑wise RSA once betas exist.
- **Anxiety impairs learning under uncertainty** (Lamba), motivating predictability/volatility axes in model‑RDMs.



## 6.9 RSA Papers Micro‑Summaries (Methods → Findings → LEARN Link)

These are **tight, method‑level summaries** of the RSA papers with explicit bridges to LEARN RSA.

### Greco 2024 — Predictive learning shapes representational geometry
- **Paradigm:** MEG; auditory tone sequences with manipulated statistical regularity.
- **Analysis:** RSA to test whether neural geometry clusters predictable stimuli.
- **Finding:** Geometry shifts toward environmental structure; magnitude correlates with PE encoding.
- **LEARN link:** Model‑RDM alignment across runs is the direct analog; representational geometry should converge on peer structure as learning occurs.

### Finn 2020 — Idiosynchrony (IS‑RSA framework)
- **Paradigm:** Naturalistic fMRI (movie watching); HCP demonstration.
- **Analysis:** IS‑RSA; quantify inter‑subject similarity as a function of behavior.
- **Finding:** Individual differences emerge as structured deviations from group similarity.
- **LEARN link:** Methodological backbone for idiosyncrasy metrics; gives theoretical basis for Anna Karenina model in feedback representations.

### Baek 2023 — Lonely individuals process the world in idiosyncratic ways
- **Paradigm:** Naturalistic fMRI; students in residential communities.
- **Analysis:** Inter‑subject similarity; loneliness predicts deviation from shared responses.
- **Finding:** Lonelier individuals show reduced neural alignment, esp. default‑mode regions.
- **LEARN link:** Justifies hypothesis that social disconnection (SA) relates to lower representational alignment.

### Shen 2025 — Neural similarity predicts friendship
- **Paradigm:** fMRI response similarity measured before friendships; social networks tracked longitudinally.
- **Analysis:** Neural similarity vs later social distance.
- **Finding:** Pre‑existing neural similarity predicts later friendship proximity.
- **LEARN link:** Shared representational geometry has real social consequences; aligns with SA‑linked idiosyncrasy implications.

### Camacho 2024 — SA and inter‑subject variability
- **Paradigm:** Naturalistic movies; Healthy Brain Network (N≈740, ages 5–15).
- **Analysis:** Mean activation vs inter‑subject variability; SA measured by SCARED.
- **Finding:** No mean effects; **higher variability** with higher SA (PCC, supramarginal, IFG).
- **LEARN link:** Direct evidence that SA → more idiosyncratic neural responses in youth.

### Lamba 2020 — Anxiety impedes adaptive social learning
- **Paradigm:** Dynamic trust game + matched nonsocial task.
- **Analysis:** Computational modeling of learning under uncertainty.
- **Finding:** Anxiety reduces learning from negative social outcomes; fails to scale learning with uncertainty.
- **LEARN link:** Supports explicit modeling of predictability/volatility and negative PE weighting.

---

## 6.10 RSA‑to‑LEARN Bridges (Explicit)

**Bridge 1: Geometry alignment**
- Greco shows geometry aligns with environmental structure; LEARN tests whether geometry aligns to peer structure.

**Bridge 2: Idiosyncrasy**
- Finn + Baek + Camacho show inter‑subject variability is informative and linked to social outcomes; LEARN tests whether SA predicts idiosyncrasy in feedback representations.

**Bridge 3: Social consequence**
- Shen shows neural similarity predicts friendship; LEARN’s idiosyncrasy results speak to why SA youth may struggle with social connection.

**Bridge 4: Uncertainty learning**
- Lamba demonstrates anxiety‑linked deficits under uncertainty; LEARN explicitly manipulates predictability and valence to test this in a controlled social context.

---

## 7) Social Learning Papers (Theory + Method Context)

These papers in `Learn/Social Learning` provide theoretical framing for how people learn about others, update impressions, and use conceptual structure to simplify social learning.

### 7.1 Hackel et al. — Simplifying Social Learning (Opinion)
**Files:** `Learn/Social Learning/Learning Model.pdf`, `Learn/Social Learning/Simplifying.pdf`
- Argues that social learning is complex but often feels effortless because people use **conceptual knowledge** to simplify learning.
- Suggests social learning is a prototype case where **model complexity is reduced by prior knowledge**.
- Relevance to LEARN: supports the idea that participants build **structured peer models** rather than raw trial‑by‑trial rules.

### 7.2 Mende‑Siedlecki — Dynamic Impression Updating
**File:** `Learn/Social Learning/LearningStyle.pdf`
- Reviews neural systems that support **updating trait representations** when new behavioral evidence arrives.
- Highlights distributed networks for impression updating and the influence of motivation/experience on updating.
- Relevance to LEARN: direct conceptual alignment with **run‑wise changes in peer representation**.

### 7.3 He et al. 2025 — mPFC Linking Mentalizing + Attachment Schemas
**File:** `Learn/Social Learning/Nim_Tot.pdf`
- Proposes mPFC as a site where **mentalizing content** and attachment‑based schemas are represented and accessed.
- Relevance to LEARN: justifies mPFC as a **core representational region** for peer structure and social meaning.

### 7.4 Methodological Takeaways for LEARN
- Social learning is **structured**, not just associative → model‑RDMs should reflect structure (valence, predictability, peer identity).
- Impression updating implies **geometry should change over time** → run‑wise RSA is the ideal test once run‑wise betas exist.
- mPFC / mentalizing networks should be treated as **primary ROIs** in addition to reward/salience circuits.

---
## 8) Proposal vs. Papers: Where This Project Sits



**Project_Proposal.docx** proposes:

- RSA‑based measurement of **learning‑aligned geometry** and **idiosyncrasy** in adolescent SA.

- A controlled social learning task (LEARN) with peer structure hidden.



**How papers map onto it:**

- **Clarkson materials** provide the *task*, *population*, and *learning dynamics* context.

- **Greco 2024** provides empirical precedent for geometry aligning to structure.

- **Finn 2020 / Baek 2023 / Shen 2025 / Camacho 2024** provide the idiosyncrasy and social similarity rationale.

- **Lamba 2020** anchors the uncertainty‑learning angle in anxiety.



**Net: the proposal sits at the intersection** of social learning computation and representational geometry, extending those ideas into a clinically relevant adolescent population using RSA.



---

## 9) RSA Rationale: Why Representation (Not Just Activation)

**RSA captures relational geometry**, not just amplitude. It asks: *Which conditions look similar to each other in neural pattern space?* [Project_Proposal.docx; RSA_notes.docx]

**Representational learning premise:**
- As people learn structure, neural representations reorganize to reflect latent relationships among stimuli.
- RSA allows measuring **alignment between neural geometry and model structure**, which directly operationalizes “learning the social world.” [Project_Proposal.docx]

**Internal RSA notes emphasize:**
- Minimal smoothing for multivariate fidelity; second‑level smoothing can be justified. [RSA_notes.docx; Smoothing is okay]

---

## 10) Idiosyncrasy: Why Group Alignment Matters

**Concept:**
- If socially anxious youth process feedback in more heterogeneous ways, neural patterns should be **less group‑aligned** (idiosyncratic).
- This is conceptually consistent with “Anna Karenina” style idiosyncrasy metrics. [Project_Proposal.docx; RSA_notes.docx]

**Key implication:**
- Idiosyncrasy may explain difficulty in social connection even when learning is accurate—representations are not shared in the same way as peers.

---

## 11) Candidate Brain Systems (From Repo)

**Core ROIs specified in the proposal:**
- vmPFC, dACC, anterior insula, posterior insula, ventral striatum. [Project_Proposal.docx]

**Extended mentalizing network (ROI notes):**
- mPFC (impression formation, mental state inference)
- TPJ (belief representation)
- Temporal pole (social semantic scripts)
- Precuneus (integration + prediction of mental states)
[ROI's Learn.docx]

**Why this matters:**
- These ROIs collectively span valuation, salience, prediction, and mentalizing—exactly the mechanisms implicated in social learning and representational structure.

---

## 12) Internal Source Map (What Each Folder Contributes)

**Proposal + Core Theory**
- `Project_Proposal.docx`

**Task Structure + Timing**
- `Learn/Papers_Presentation/Learn.pptx`
- `Learn/Papers_Presentation/MS_figures_all_052325_jj[27].pptx`

**Social Learning Prior Findings / Context**
- `Learn/Papers_Presentation/Clarkson_Defense_2.0.pptx`
- `Learn/Papers_Presentation/Clarkson_2024_manuscript_BP_080125_cs_jj[39] (1).docx`

**RSA Method Notes**
- `Learn/Papers_Presentation/RSA/RSA_notes.docx`
- `Learn/Background/Billy email chain/emailchain2/Re_ RSA meeting /RSA_Dataframe_Construction_Example.Rmd`

**ROI Justifications**
- `Learn/ROI's Learn.docx`

**Smoothing Rationale**
- `Learn/Smoothing is okay/*`

**Source Code Repos**
- `Learn/Source-Githubs/rsatoolbox`
- `Learn/Source-Githubs/mne-rsa`
- `Learn/Source-Githubs/MIND18_RSA_tutorial`
- `Learn/Source-Githubs/DynamicPredictions`

---

## 13) Background Summary (Narrative Paragraph)

Adolescence is a sensitive period for social evaluation and learning. Socially anxious youth show altered expectations and responses to social feedback, yet how their brains represent the **structure** of their social world remains unclear. The LEARN task provides a controlled environment where peers vary along hidden dimensions of disposition and predictability, requiring participants to build internal models of peer behavior. RSA is uniquely suited to quantify whether neural representational geometry aligns with this true structure over time and whether those representations become more idiosyncratic in higher social anxiety. Core ROIs spanning valuation and salience (vmPFC, dACC, insula, striatum) and extended mentalizing regions (mPFC, TPJ, temporal pole, precuneus) offer a biologically grounded substrate for both learning and idiosyncrasy hypotheses.

---

## 14) Output of Step 1

This step produces:
- A **literature‑anchored narrative** aligned to repo sources.
- A **task‑accurate framing** of hypotheses and measures.
- A **clear ROI rationale** linked to internal ROI notes.

Next: Step 2 formalizes the task into exact data schemas and beta requirements.
