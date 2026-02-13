# LEARN RSA Masterplan — Full Build (Embedded)

This is the full, **embedded** master document. All steps are included inline for a single‑file presentation.

---

# PART I — BACKGROUND + LITERATURE FOUNDATION

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


---

# PART II — TASK FORMALIZATION + SCHEMAS

# Step 2 — LEARN Task Formalization + Data Schemas + Beta Requirements

This section formalizes the LEARN task into **exact condition schemas**, **data tables**, and **beta requirements**, so the RSA pipeline can be implemented without ambiguity.

---

## 1) Task Structure (Formal Definition)

**Entities**
- **Peers:** 4 (P1–P4)
- **Runs:** 4 (Run1–Run4)
- **Trials per peer per run:** 8
- **Total trials:** 4 peers × 4 runs × 8 = 128

**Peer structure**
- **Disposition:** Nice vs Mean
- **Predictability:** Predictable vs Unpredictable

**Trial epochs**
- **Prediction:** 4s (participant predicts nice vs mean)
- **Feedback:** 3s (peer provides feedback)
- **Response:** 4s (participant responds)

---

## 2) Condition Schema (Canonical Labels)

### 2.1 Peer labels and context
| Peer | Disposition | Predictability | Context label |
|---|---|---|---|
| P1 | Nice | Predictable | Npred |
| P2 | Nice | Unpredictable | Nunpred |
| P3 | Mean | Predictable | Mpred |
| P4 | Mean | Unpredictable | Munpred |

### 2.2 Trial outcome labels
| Prediction | Feedback | Accuracy | PE Type |
|---|---|---|---|
| Nice | Nice | Correct | No PE (positive feedback) |
| Mean | Mean | Correct | No PE (negative feedback) |
| Nice | Mean | Incorrect | Negative PE |
| Mean | Nice | Incorrect | Positive PE |

---

## 3) Data Schema (Long‑form Master Table)

This is the **canonical schema** for trial‑level data. It should be the backbone for all downstream RSA and modeling.

| subject | run | trial | peer | disp | pred | prediction | feedback | accuracy | pe_type | valence | rt | beta_path |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| S001 | 1 | 1 | P1 | Nice | Pred | Nice | Nice | 1 | none | pos | 1.2 | /path/... |

**Notes:**
- `valence` = actual feedback valence (pos/neg)
- `pe_type` = positive or negative PE if incorrect

---

## 3.1 Data Sources + Subject‑Level Merge (Behavioral / Survey / Demographics)

**Linux source paths (auditing key):**
- Demographics (age/sex/group): `/data/projects/STUDIES/LEARN/fMRI/bids/participants.tsv`
- ADIS + SCARED (child/parent): `/data/projects/STUDIES/LEARN/RedCap/LEARN_DATA_2022-01-28_1219.csv`
- Any‑anxiety dx flag: `/data/projects/STUDIES/LEARN/fMRI/Analyses_LEARN/Anx_3dmvm.xlsx`
- LEARN task behavioral events (prediction/feedback): `/data/projects/STUDIES/LEARN/fMRI/code/afni/BehavData/sub-*/sub-*_task-learn_run-*_events.tsv`

**Subject‑level merged table (local repo artifact):**
- `/Users/dannyzweben/Desktop/SDN/Y1_project/analysis/subject_table.csv`
- Includes one row per participant, with demographics, ADIS (v1/v2 Social Phobia CSR/GIR), SCARED child/parent summary scores, any‑anxiety dx flag, and behavioral LEARN summary metrics.
- Includes per‑subject `behav_events_paths` and constant `source_*` columns to preserve file‑path indexing.

---

## 4) Beta Requirements Matrix (Explicit)

| Analysis | Minimal Beta Level | Condition Count | Feasible with current betas? |
|---|---|---|---|
| Collapsed model‑RDM | Subject × ROI × Peer | 4 | Yes |
| Collapsed Peer×Feedback RDM | Subject × ROI × Peer×Valence | 8 | Yes |
| Run‑wise model‑RDM | Subject × ROI × Run × Peer | 16 (4 peers × 4 runs) | No |
| Run‑wise Peer×Feedback | Subject × ROI × Run × Peer×Valence | 32 | No |
| Trial‑wise RSA / PE models | Subject × ROI × Trial | 128 | No |

---

## 5) Data‑Ready Schemas (If only averaged betas)

### 5.1 Current betas: Peer × FeedbackValence
**One subject, one ROI:**

| condition | meaning |
|---|---|
| P1_pos | Peer1, positive feedback |
| P1_neg | Peer1, negative feedback |
| P2_pos | Peer2, positive feedback |
| P2_neg | Peer2, negative feedback |
| P3_pos | Peer3, positive feedback |
| P3_neg | Peer3, negative feedback |
| P4_pos | Peer4, positive feedback |
| P4_neg | Peer4, negative feedback |

### 5.2 Aggregation logic (for idiosyncrasy)
- Positive feedback representation = average of all positive feedback betas
- Negative feedback representation = average of all negative feedback betas

---

## 6) Beta Manifest Templates

### 6.1 Minimal (current data)
```csv
subject,roi,peer,valence,beta_path
S001,vmPFC,P1,pos,/path/S001_vmPFC_P1_pos.nii.gz
S001,vmPFC,P1,neg,/path/S001_vmPFC_P1_neg.nii.gz
...
```

### 6.2 Run‑wise (future data)
```csv
subject,roi,run,peer,beta_path
S001,vmPFC,1,P1,/path/S001_vmPFC_run1_P1.nii.gz
S001,vmPFC,1,P2,/path/S001_vmPFC_run1_P2.nii.gz
...
```

### 6.3 Trial‑wise (future beta series)
```csv
subject,roi,run,trial,peer,valence,pe_type,beta_path
S001,vmPFC,1,1,P1,pos,none,/path/S001_vmPFC_run1_trial1.nii.gz
...
```

---

## 7) Condition Maps → Model RDMs

### 7.1 Peer model (4 conditions)
```python
# P1..P4 peer model
peer_features = np.array([
    [1,1],  # Npred
    [1,0],  # Nunpred
    [0,1],  # Mpred
    [0,0],  # Munpred
])
```

### 7.2 Peer×Feedback model (8 conditions)
```python
conditions = ["P1_pos","P1_neg","P2_pos","P2_neg","P3_pos","P3_neg","P4_pos","P4_neg"]
valence = np.array([1,0,1,0,1,0,1,0])
peer_id = np.array([1,1,2,2,3,3,4,4])

rdm_feedback = np.abs(valence[:,None]-valence[None,:])
rdm_peer = (peer_id[:,None]!=peer_id[None,:]).astype(int)
```

---

## 8) Visual Diagrams (Conceptual)

### 8.1 Peer structure
```
Nice:     P1 (pred)   P2 (unpred)
Mean:     P3 (pred)   P4 (unpred)
```

### 8.2 Trial sequence
```
Prediction (4s) → Feedback (3s) → Response (4s)
```

---

## 9) Outputs of Step 2

- Task structure formalized into schemas
- Beta requirements explicitly mapped to analyses
- Ready‑to‑use CSV templates for manifests
- Condition labels locked for RSA model construction

Next: Step 3 builds model‑RDM suite and full vectorization logic.


---

# PART III — MODEL‑RDM SUITE

# Step 3 — Model‑RDM Suite (Learning) — Deep, Commented, LEARN‑Specific

This section gives **fully worked, commented code** that builds the exact model RDMs you need, in the exact structure implied by LEARN.

**Three required model families**
1. **Peer similarity** (4 peers only)
2. **Feedback similarity** (+ vs −)
3. **Peer × Feedback similarity** (idealized matrix for all 8 conditions)

---

## 0) Definitions and Conventions

**Peers** (canonical order):
- P1 = Nice, Predictable (Npred)
- P2 = Nice, Unpredictable (Nunpred)
- P3 = Mean, Predictable (Mpred)
- P4 = Mean, Unpredictable (Munpred)

**Feedback valence:**
- `pos` = nice feedback
- `neg` = mean feedback

**Peer × Feedback conditions** (8 total, fixed order):
```
P1_pos, P1_neg, P2_pos, P2_neg, P3_pos, P3_neg, P4_pos, P4_neg
```

---

## 1) Peer‑Level Model RDMs (4×4)

These models operate on **4 peer conditions only** (no feedback split).

### 1.1 Peer Disposition RDM (Nice vs Mean)
Peers cluster by **valence**.

```python
import numpy as np
from scipy.spatial.distance import pdist, squareform

# Nice=1, Mean=0
valence = np.array([1, 1, 0, 0]).reshape(-1, 1)

# Euclidean distance gives 0 if same valence, 1 if different
rdm_disp = squareform(pdist(valence, metric="euclidean"))
print(rdm_disp)
```

### 1.2 Peer Predictability RDM (Pred vs Unpred)
Peers cluster by **predictability**.

```python
# Pred=1, Unpred=0
pred = np.array([1, 0, 1, 0]).reshape(-1, 1)
rdm_pred = squareform(pdist(pred, metric="euclidean"))
print(rdm_pred)
```

### 1.3 Peer Combined RDM (Disposition + Predictability)
Captures both dimensions simultaneously.

```python
peer_features = np.array([
    [1,1],  # P1 Npred
    [1,0],  # P2 Nunpred
    [0,1],  # P3 Mpred
    [0,0],  # P4 Munpred
])

rdm_combo = squareform(pdist(peer_features, metric="euclidean"))
print(rdm_combo)
```

### 1.4 Negativity‑Weighted RDM
Explicitly encodes **negative‑bias**: mean peers more similar to each other than nice peers.

```python
# Hand‑built negativity‑weighted dissimilarity
rdm_neg = np.array([
    [0,   0.5, 1, 1],
    [0.5, 0,   1, 1],
    [1,   1,   0, 0],
    [1,   1,   0, 0],
])
print(rdm_neg)
```

---

## 2) Feedback‑Only Model RDM (8×8)

This model ignores peer identity and groups conditions only by **feedback valence**.

```python
import numpy as np

conditions = [
    "P1_pos", "P1_neg",
    "P2_pos", "P2_neg",
    "P3_pos", "P3_neg",
    "P4_pos", "P4_neg",
]

# 1=pos, 0=neg
valence = np.array([1,0, 1,0, 1,0, 1,0])

# 0 if same valence, 1 if different
rdm_feedback = np.abs(valence[:,None] - valence[None,:])

print(rdm_feedback)
```

---

## 3) Peer×Feedback Model RDM (8×8) — FULLY EXPLICIT

This is the complex model you asked for: **an idealized similarity matrix** where similarity depends on both
peer identity *and* feedback valence.

### 3.1 Building Blocks
We build the peer×feedback model as a **weighted sum of three components**:

1. **Peer similarity matrix** (same peer = 0, different peer = 1)
2. **Feedback similarity matrix** (same valence = 0, different = 1)
3. **Contextual similarity matrix** (valence × predictability × disposition relationships)

### 3.2 Step‑by‑Step Construction (commented)

```python
import numpy as np

# --- 1) Define condition labels and features ---
conditions = [
    "P1_pos", "P1_neg",
    "P2_pos", "P2_neg",
    "P3_pos", "P3_neg",
    "P4_pos", "P4_neg",
]

# Peer identity per condition
peer_id = np.array([1,1, 2,2, 3,3, 4,4])

# Feedback valence per condition
valence = np.array([1,0, 1,0, 1,0, 1,0])  # pos=1, neg=0

# Disposition and predictability per peer
# P1=Npred, P2=Nunpred, P3=Mpred, P4=Munpred
peer_disp = {1:1, 2:1, 3:0, 4:0}  # nice=1, mean=0
peer_pred = {1:1, 2:0, 3:1, 4:0}  # pred=1, unpred=0

# Expand to condition level
disp = np.array([peer_disp[i] for i in peer_id])
pred = np.array([peer_pred[i] for i in peer_id])

# --- 2) Build base matrices ---
# Peer similarity (0 same peer, 1 different peer)
rdm_peer = (peer_id[:,None] != peer_id[None,:]).astype(int)

# Feedback similarity (0 same valence, 1 different)
rdm_feedback = np.abs(valence[:,None] - valence[None,:])

# Disposition similarity (nice vs mean)
rdm_disp = np.abs(disp[:,None] - disp[None,:])

# Predictability similarity (pred vs unpred)
rdm_pred = np.abs(pred[:,None] - pred[None,:])

# --- 3) Combine into a full Peer×Feedback model ---
# Weighted sum (weights can be tuned or compared)
# Example weights: peer identity matters most; feedback matters second; context matters third
w_peer = 0.5
w_fb   = 0.3
w_ctx  = 0.2

rdm_peer_feedback = (w_peer * rdm_peer) + (w_fb * rdm_feedback) + (w_ctx * (rdm_disp + rdm_pred)/2)

print(rdm_peer_feedback)
```

### 3.3 Interpretation
- If **same peer**, dissimilarity is low (shared identity).
- If **same feedback valence**, dissimilarity is lower.
- If **same disposition/predictability**, dissimilarity is lower.
- The model can be tuned or compared in regression (RSA regression).

---

## 4) Vectorization (All Models)

Every RDM is vectorized using **lower triangle (k=-1)**.

```python
# 4×4 vectorization
tri4 = np.tril_indices(4, k=-1)
vec_disp = rdm_disp[tri4]
vec_pred = rdm_pred[tri4]
vec_combo = rdm_combo[tri4]
vec_neg = rdm_neg[tri4]

# 8×8 vectorization
tri8 = np.tril_indices(8, k=-1)
vec_feedback = rdm_feedback[tri8]
vec_peer_fb  = rdm_peer_feedback[tri8]
```

---

## 5) Model Regression (Comparing Multiple RDMs)

```python
from sklearn.linear_model import LinearRegression

# Example: regress neural RDM on multiple model RDMs
Y = neural_rdm[tri8]
X = np.vstack([
    rdm_feedback[tri8],
    rdm_peer[tri8],
    rdm_peer_feedback[tri8],
]).T

reg = LinearRegression().fit(X, Y)
print(reg.coef_)  # weights for each model
```

---

## 6) Summary Output of Step 3

- Fully specified **peer‑only models** (Disposition, Predictability, Combined, Negativity)
- Fully specified **feedback‑only model**
- Fully specified **peer×feedback model** with clear weighting logic
- Full vectorization + regression templates

Next: Step 4 builds the **Idiosyncrasy (IS‑RSA) suite** with validation and SA‑linked modeling.


---

# PART IV — IDIOSYNCRASY SUITE

# Step 4 — Idiosyncrasy (IS‑RSA) Suite — Deep, Commented, LEARN‑Specific

This section defines the **idiosyncrasy analysis** in detail, with full code templates that work with your current averaged betas and scale to run‑wise or trial‑wise data later.

---

## 1) Concept: What Idiosyncrasy Means Here

- **Idiosyncrasy** = how much a participant’s neural patterns deviate from the group average.
- We use **inter‑subject similarity** (IS‑RSA): lower similarity → higher idiosyncrasy.
- Primary hypothesis: **higher SA → higher idiosyncrasy**, especially for negative feedback.

---

## 2) Input Data Structures (Current vs Future)

### 2.1 Current betas (averaged)
- Per subject, per ROI, per **FeedbackValence** (pos vs neg)
- Allows **idiosyncrasy by valence**

### 2.2 Future betas (run‑wise)
- Per subject, per ROI, per run, per valence
- Allows **idiosyncrasy over learning time**

---

## 3) Build Subject Pattern Matrices

### 3.1 Current data (averaged betas)
```python
import numpy as np

# patterns_pos: subjects x voxels
# patterns_neg: subjects x voxels

# Example placeholder shapes
# patterns_pos = np.random.randn(n_subjects, n_voxels)
# patterns_neg = np.random.randn(n_subjects, n_voxels)
```

### 3.2 Run‑wise extension
```python
# patterns_pos[run]: subjects x voxels
# patterns_neg[run]: subjects x voxels
```

---

## 4) Inter‑Subject Similarity and Idiosyncrasy

```python
from scipy.spatial.distance import pdist, squareform

# Similarity matrix across subjects
# correlation distance → similarity

def similarity_matrix(patterns):
    d = pdist(patterns, metric="correlation")
    sim = 1 - squareform(d)
    return sim

# Idiosyncrasy score per subject
# lower similarity to others = higher idiosyncrasy

def idiosyncrasy_score(patterns):
    sim = similarity_matrix(patterns)
    return 1 - sim.mean(axis=1)

idio_pos = idiosyncrasy_score(patterns_pos)
idio_neg = idiosyncrasy_score(patterns_neg)
```

---

## 5) Valence × SA Statistical Model

### 5.1 Long‑form data assembly
```python
import pandas as pd

# Example: build a long-form dataframe
subjects = ["S001","S002"]

rows = []
for i, s in enumerate(subjects):
    rows.append({"subject": s, "valence": "pos", "idio": idio_pos[i]})
    rows.append({"subject": s, "valence": "neg", "idio": idio_neg[i]})

df = pd.DataFrame(rows)
```

### 5.2 Mixed effects model (Python)
```python
import statsmodels.formula.api as smf

# df columns: subject, valence, idio, SA
# model = smf.mixedlm("idio ~ valence * SA", df, groups=df["subject"]).fit()
# print(model.summary())
```

### 5.3 Mixed effects model (R)
```r
# lmer(idio ~ valence * SA + (1|subject), data=df)
```

---

## 6) Validation and Control Analyses

### 6.1 Split‑half reliability
```python
# Split trials into odd/even
# patterns_pos_split1, patterns_pos_split2
# reliability = spearmanr(sim1[tri], sim2[tri])[0]
```

### 6.2 Permutation test
```python
import numpy as np
from scipy.stats import spearmanr

def perm_test_idio(patterns, n=1000):
    sim = similarity_matrix(patterns)
    obs = sim.mean()
    null = []
    for _ in range(n):
        perm = np.random.permutation(patterns.shape[0])
        sim_perm = similarity_matrix(patterns[perm])
        null.append(sim_perm.mean())
    p = (np.sum(np.array(null) >= obs) + 1) / (n + 1)
    return obs, p
```

---

## 7) Interpretation Logic

- **High SA + higher idiosyncrasy** (especially in negative feedback) supports the hypothesis that socially anxious youth form **less shared neural representations** of feedback.
- **No mean activation effect, but variability effect** aligns with Camacho et al. (2024) and Baek et al. (2023).

---

## 8) Output of Step 4

- Full idiosyncrasy pipeline (pos/neg)
- Statistical models for valence × SA
- Validation + control logic

Next: Step 5 builds end‑to‑end pipeline from betas → ROI → RDMs → model fit → statistics.


---

# PART V — END‑TO‑END PIPELINE

# Step 5 — End‑to‑End Pipeline (Ultra‑Deep Version)

This file provides a **complete, expandable pipeline** with QA, validation, plotting, run‑wise and trial‑wise hooks, and reporting. It is designed to be swapped to real paths later with minimal changes.

---


## 0A) RSA‑learn Beta Generation (Run‑wise + Collapsed)

**Goal**: regenerate first‑level betas in a new output root, with **per‑run** peer×feedback betas plus **peer‑only** and **feedback‑only** betas, and then **collapsed‑across‑runs** versions of those same contrasts.

**RSA‑learn output root (new):**
`/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/RSA-learn`

**Current beta provenance (existing pipeline):**
1. Timing generator: `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/code/afni/LEARN_1D_AFNItiming_Full.sh`
2. GLM spec: `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/code/afni/LEARN_ap_Full_all.sh`
3. Per‑subject execution script: `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/derivatives/afni/IndvlLvlAnalyses/<SUBJ>/proc.<SUBJ>.LEARN_070422`
4. Output bucket: `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/derivatives/afni/IndvlLvlAnalyses/<SUBJ>/<SUBJ>.results.LEARN_070422/stats.<SUBJ>+tlrc.*`

**Inputs already present for GLM reruns (per subject):**
1. Preprocessed data per run: `pb02.<SUBJ>.r01.scale+tlrc` … `pb02.<SUBJ>.r04.scale+tlrc` in each `*.results.LEARN_070422` folder
2. Motion regressors: `motion_demean.1D`, `motion_deriv.1D`, `sub-<SUBJ>_task-learn_allruns_motion.1D`
3. Event files (BIDS): `sub-<SUBJ>_task-learn_run-0X_events.tsv` in `code/afni/TimingFiles/Full/sub-<SUBJ>/`
4. Existing parametric timing files (for reference): `Mean60_fdkm.1D`, `Mean60_fdkm_run1.txt`, etc.

**Run‑wise redesign: what changes**
1. Create **NonPM run‑wise timing files** (one file per run and condition) from `events.tsv`.
2. Expand 3dDeconvolve to include **run‑specific regressors** (one per condition per run).
3. Add GLTs for **peer‑only** and **feedback‑only** per run and across runs.
4. Save outputs to `RSA-learn/derivatives/afni/IndvlLvlAnalyses/` to keep pipelines separate.

**Example: NonPM run‑wise timing generation (Python)**
```python
import pandas as pd
from pathlib import Path

subj = "1055"
base = Path("/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/code/afni/TimingFiles/Full")
run = 1
cond = "Mean_60_fdkm"  # peer×feedback condition

events = base / f"sub-{subj}" / f"sub-{subj}_task-learn_run-0{run}_events.tsv"
df = pd.read_csv(events, sep="	")
rows = df[df["event"] == cond]
line = " ".join(f"{o:.3f}:{d:.3f}" for o, d in zip(rows["onset"], rows["duration"]))

out = base / f"sub-{subj}" / f"NonPM_{cond}_run{run}.1D"
out.write_text(line + "
")
```

**Example: run‑wise regressors in AFNI (concept)**
```tcsh
# FBM Mean60, run 1–4 (NonPM)
-stim_times_AM1 1 stimuli/offset_NonPM_Mean60_fdkm_run1.1D 'dmBLOCK(0)'
-stim_times_AM1 2 stimuli/offset_NonPM_Mean60_fdkm_run2.1D 'dmBLOCK(0)'
-stim_times_AM1 3 stimuli/offset_NonPM_Mean60_fdkm_run3.1D 'dmBLOCK(0)'
-stim_times_AM1 4 stimuli/offset_NonPM_Mean60_fdkm_run4.1D 'dmBLOCK(0)'
-stim_label 1 FBM.Mean60.r1
-stim_label 2 FBM.Mean60.r2
-stim_label 3 FBM.Mean60.r3
-stim_label 4 FBM.Mean60.r4
```

**Example: peer‑only GLT per run**
```tcsh
-gltsym 'SYM: +FBM.Mean60.r1 +FBM.Mean80.r1 +FBM.Nice60.r1 +FBM.Nice80.r1'
-glt_label 1 FBM.r1
```

**Example: feedback‑only GLT per run**
```tcsh
-gltsym 'SYM: +FBM.Nice60.r2 +FBN.Nice60.r2 +FBM.Nice80.r2 +FBN.Nice80.r2'
-glt_label 2 NICE.r2
```

**Deliverables to verify**
1. Per‑run betas: 8 peer×feedback × 4 runs
2. Per‑run peer‑only: 4 peers × 4 runs
3. Per‑run feedback‑only: 2 feedback types × 4 runs
4. Collapsed‑across‑runs: 8 peer×feedback + 4 peer‑only + 2 feedback‑only


**RSA‑learn scripts now created (paths on share):**

**Quick links (HTML key)**
- [Execution checklist](#execution-checklist)
- [Single-subject trial](#single-subject-trial)
- [Standardized loop](#standardized-loop)
- [Exact commands used](#exact-commands)
- [Script excerpts](#script-excerpts)

<a id="execution-checklist"></a>
**Execution checklist (pilot subject + verification)**

**AFNI timing interpretation fix (run‑wise files):**
- Added `-local_times` to force 3dDeconvolve to treat `NonPM_*_runX.1D` files as **run‑local** timing.
- Added `-allzero_OK` to allow run‑wise regressors that are empty in some runs.
- This resolves warnings: `single column looks local from '*', but 3dDeconvolve would interpret as global`.
- Script updated: `/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_ap_Full_RSA_runwise.sh`

**Standardized run‑wise proc + GLM pipeline (new):**
Script: `/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_runwise_pipeline.sh`
Purpose: loops subjects to (1) generate proc scripts, (2) clean output dirs (skips running jobs), (3) run GLM from correct working dir.
Usage: `bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_runwise_pipeline.sh`
Discovery: auto‑detects subjects from `RSA-learn/TimingFiles/Full/sub-*` (fallback: `bids/sub-*`)
Parallel: `MAX_JOBS=4` (adjust concurrency)
Override root: `SUBJ_ROOT=/path/to/sub-*`
Toggles: `MAKE_PROC=0` or `CLEAN_OUT=0` or `RUN_GLM=0` to skip steps.
Git-tracked copies (repo): `/Users/dannyzweben/Desktop/SDN/Y1_project/rsa-learn/scripts/`

**Timing files note (separate step):**
Run-wise timing files are generated outside of this loop and already exist for all subjects.

<a id="single-subject-trial"></a>
**Example: single-subject trial (what we did for 1055)**
```bash
# Proc generation for one subject (make a one-off ap script)
AP_ORIG=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_ap_Full_RSA_runwise.sh
AP_TMP=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/tmp/LEARN_ap_Full_RSA_runwise_1055.sh
cp "$AP_ORIG" "$AP_TMP"
sed -i "s|^set subjects = .*|set subjects = ( 1055 )|" "$AP_TMP"
tcsh "$AP_TMP"

# Clean outputs that can trigger "already exists"
rm -rf /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/1055.results.LEARN_RSA_runwise
rm -rf /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/1055/1055.results.LEARN_RSA_runwise

# Run GLM from correct working directory
cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/1055
tcsh -xef proc.1055.LEARN_RSA_runwise |& tee output.proc.1055.LEARN_RSA_runwise
```

**Standardized loop (all subjects, timing already generated)**
```bash
# Auto-discover subjects from TimingFiles/Full/sub-*
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_runwise_pipeline.sh

# Parallelize (example)
MAX_JOBS=4 bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_runwise_pipeline.sh

# Override discovery root (if needed)
SUBJ_ROOT=/data/projects/STUDIES/LEARN/fMRI/bids \
  bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_runwise_pipeline.sh
```

<a id="exact-commands"></a>
**Exact commands used (trial + full run)**
```bash
# Hardware check (server)
nproc

# Timing for all subjects (already run once; uses default subjList_LEARN.txt inside script)
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_1D_AFNItiming_Full_RSA_runwise.sh

# Proc generation for 1055 only (trial)
AP_ORIG=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_ap_Full_RSA_runwise.sh
AP_TMP=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/tmp/LEARN_ap_Full_RSA_runwise_1055.sh
cp "$AP_ORIG" "$AP_TMP"
sed -i "s|^set subjects = .*|set subjects = ( 1055 )|" "$AP_TMP"
tcsh "$AP_TMP"

# Clean stale outputs that cause "already exists"
rm -rf /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/1055.results.LEARN_RSA_runwise
rm -rf /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/1055/1055.results.LEARN_RSA_runwise

# GLM run for 1055 (run from results dir to avoid relative output issues)
cd /data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/1055
tcsh -xef proc.1055.LEARN_RSA_runwise |& tee output.proc.1055.LEARN_RSA_runwise

# Full cohort run in tmux (proc+clean+GLM; timing already generated)
tmux new -s rsa_all
MAX_JOBS=16 LOAD_LIMIT=20 bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_runwise_pipeline.sh
```

**nproc context**
- `nproc` returned **48** on the server.
- We set `MAX_JOBS=16` and `LOAD_LIMIT=20` for a safe, aggressive parallel run.
- During a later attempt, loadavg was **~400**, which caused the load‑gate to wait.
- To force the run to start immediately, we used `MAX_JOBS=16 LOAD_LIMIT=999 bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_runwise_pipeline.sh`.

<a id="script-excerpts"></a>
**Script excerpts (key lines)**
```bash
# LEARN_1D_AFNItiming_Full_RSA_runwise.sh (timing for all subjects)
SUBJ_LIST="/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt"
TIMING_ROOT="/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Full"
for subj in `cat ${SUBJ_LIST}`; do
  mkdir -p "${TIMING_ROOT}/sub-${subj}"
  # ... NonPM_*_runX.1D creation ...
done

# LEARN_ap_Full_RSA_runwise.sh (timing interpretation fix)
-regress_opts_3dD \
    -local_times \
    -allzero_OK \

# LEARN_run_RSA_runwise_pipeline.sh (standardized loop + 2–3 run fallback)
SUBJ_ROOT="${SUBJ_ROOT:-$TIMING_ROOT}"
find "$SUBJ_ROOT" -maxdepth 1 -type d -name "sub-*"
AP_TMP="$TMP_DIR/LEARN_ap_Full_RSA_runwise_${subj}.sh"
sed -i "s|^set subjects = .*|set subjects = ( ${subj} )|" "$AP_TMP"
mapfile -t RUNS < <(find "$FMRIPREP_DIR/sub-${subj}/func" -maxdepth 1 -type f -name "sub-${subj}_task-learn_run-*_desc-preproc_bold.nii.gz" \
  | sed -E 's/.*run-([0-9]+).*/\\1/' | sort -n)
if [ "$run_count" -lt 2 ]; then
  echo "[RSA-learn] SKIP (runs <2): $subj"
fi
if [ "$run_count" -lt 4 ]; then
  # rewrite AP_TMP to available runs + recompute GLTs
fi
OUT_DIR="$RESULTS_DIR/$subj/${subj}.results.LEARN_RSA_runwise"
rm -rf "$OUT_DIR" "$SCRIPT_DIR/${subj}.results.LEARN_RSA_runwise"
cd "$RESULTS_DIR/$subj" && tcsh -xef "proc.${subj}.LEARN_RSA_runwise" |& tee "output.proc.${subj}.LEARN_RSA_runwise"
MAX_JOBS=4 bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_runwise_pipeline.sh
```

<a id="audit-report"></a>
**Audit (post‑run) — what we ran, what we learned, what was found**

**Audit command (run on server)**
```bash
# RSA‑learn full audit
BASE=/data/projects/STUDIES/LEARN/fMRI/RSA-learn
RESULTS="$BASE/derivatives/afni/IndvlLvlAnalyses"
TIMING="$BASE/TimingFiles/Full"
REPORT="/tmp/rsa_run_audit_$(date +%Y%m%d_%H%M).txt"

{
  echo "=== RSA RUN AUDIT ==="
  echo "Timestamp: $(date)"
  echo "RESULTS: $RESULTS"
  echo "TIMING:  $TIMING"
  echo

  echo "=== SUBJECT DISCOVERY ==="
  SUBJECTS=$(find "$TIMING" -maxdepth 1 -type d -name "sub-*" -printf "%f\n" 2>/dev/null | sed 's/^sub-//' | sort -u)
  echo "Subjects found in timing: $(echo "$SUBJECTS" | sed '/^$/d' | wc -l)"
  echo

  echo "=== OUTPUT COUNTS ==="
  STATS=$(find "$RESULTS" -name "stats.*+tlrc.HEAD" 2>/dev/null)
  echo "Stats HEAD files: $(echo "$STATS" | sed '/^$/d' | wc -l)"
  echo "Output.proc logs: $(find "$RESULTS" -name "output.proc.*" 2>/dev/null | wc -l)"
  echo

  echo "=== MISSING OUTPUTS (by subject) ==="
  for s in $SUBJECTS; do
    stats="$RESULTS/$s/${s}.results.LEARN_RSA_runwise/stats.${s}+tlrc.HEAD"
    log="$RESULTS/$s/output.proc.${s}.LEARN_RSA_runwise"
    if [ ! -f "$stats" ]; then echo "MISSING stats: $s"; fi
    if [ ! -f "$log" ]; then echo "MISSING log:   $s"; fi
  done
  echo

  echo "=== RUN COMPLETION CHECK ==="
  for s in $SUBJECTS; do
    log="$RESULTS/$s/output.proc.${s}.LEARN_RSA_runwise"
    if [ -f "$log" ]; then
      if ! grep -q "execution finished" "$log"; then
        echo "NO FINISH LINE: $s"
      fi
    fi
  done
  echo

  echo "=== HIGH-SEVERITY ERRORS ==="
  grep -H -n -E "\\*\\* (ERROR|FATAL)|ERROR|FATAL|FAILED|ABORT|Segmentation|Segfault|terminate" \
    $RESULTS/*/output.proc.* 2>/dev/null || true
  echo

  echo "=== FILE/PATH ERRORS ==="
  grep -H -n -E "No such file|not found|missing|cannot|cannot open|failed to open|Permission denied" \
    $RESULTS/*/output.proc.* 2>/dev/null || true
  echo

  echo "=== QC WARNINGS (non-fatal) ==="
  grep -H -n -E "failed to find volreg dset|failed to find motion enorm dset|failed to init basics" \
    $RESULTS/*/output.proc.* 2>/dev/null || true
  echo

  echo "=== TIMING FORMAT CHECKS ==="
  grep -H -n -E "local_times|allzero_OK|rows does not match" \
    $RESULTS/*/output.proc.* 2>/dev/null || true
  echo
} | tee "$REPORT"

echo "Report saved to $REPORT"
```

**How we learned it**
- The audit report was copied to the share and read at:  
  `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/logs/rsa_run_audit_20260212_1249.txt`

**Findings (from that audit)**
- Subjects discovered from timing: **38**
- Completed stats outputs: **25**
- Output.proc logs: **28**
- Missing stats: `1028, 1178, 1215, 1308, 1318, 1343, 1346, 1351, 1375, 1413, 1422, 1527, 1534`
- Missing logs: `1215, 1308, 1318, 1343, 1346, 1351, 1375, 1413, 1527, 1534`
- No finish line (started but failed): `1028, 1178, 1422`
- Root cause for failed subjects: missing confounds files  
  `.../derivatives/afni/confounds/sub-<ID>/sub-<ID>_task-learn_allruns_{aCompCor6,cosine,fd}.1D`

**Follow‑up audit (standard AFNI vs RSA runwise)**
- Standard AFNI stats present (non‑RSA): **33**
- RSA runwise stats present: **25**
- Missing RSA but present in standard AFNI (rerun targets):  
  `1215, 1292, 1308, 1318, 1346, 1351, 1413, 1527, 1534`
- Missing RSA and not present in standard AFNI (likely unusable unless re‑modeled):  
  `1028, 1178, 1343, 1375, 1422`
  - `1028, 1178, 1422` → missing confounds
  - `1343, 1375` → fMRIPrep has <4 runs (eligible for 2–3 run fallback with dynamic GLTs)
  - `1292` → standard AFNI exists but RSA timing folder missing

**Targeted rerun script (no subject list)**
Script: `/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_runwise_rerun_from_standard.sh`  
Behavior:
1. Finds subjects with **standard AFNI stats** but **missing RSA runwise stats**  
2. Skips subjects with missing timing/confounds or <2 fMRIPrep runs  
3. If a subject has 2–3 runs, rewrites afni_proc inputs to those runs and **recomputes GLTs over available runs**  
4. Runs proc + clean + GLM for the remaining set  
5. Logs skip reasons to `RSA-learn/logs/rerun_missing_YYYYMMDD_HHMM.log`

**Targeted rerun (tmux)**
```bash
tmux new -s rsa_rerun
MAX_JOBS=16 LOAD_LIMIT=20 \
  bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_runwise_rerun_from_standard.sh
```


1. **Generate RSA‑learn timing files** (run‑wise NonPM):
   - Script: `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/RSA-learn/scripts/LEARN_1D_AFNItiming_Full_RSA_runwise.sh`
   - Expect: `RSA-learn/TimingFiles/Full/sub-<ID>/NonPM_*_runX.1D`
2. **Generate afni_proc scripts** (no execution yet):
   - Script: `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/RSA-learn/scripts/LEARN_ap_Full_RSA_runwise.sh`
   - Expect: `RSA-learn/derivatives/afni/IndvlLvlAnalyses/<ID>/proc.<ID>.LEARN_RSA_runwise`
3. **Pilot run 1 subject** (server):
   - Wrapper: `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/RSA-learn/scripts/LEARN_RunAFNIProc_RSA_runwise.sh`
   - Edit subject list to a single ID for timing + execution.
4. **Verify outputs** (after pilot finishes):
   - Check stats bucket exists:
     - `stats.<ID>+tlrc.HEAD` and `stats.<ID>+tlrc.BRIK.gz`
   - Check run‑wise labels:
     - `3dinfo -label stats.<ID>+tlrc.HEAD | tr '~' '
' | grep -E 'FBM.Mean60.r1|FBN.Mean60.r1|FBM.Nice80.r4'`
   - Check GLT labels:
     - `3dinfo -label stats.<ID>+tlrc.HEAD | tr '~' '
' | grep -E 'Mean60.r1|FBM.r1|FBM.Mean60.all|FBM.all'`


- `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/RSA-learn/scripts/LEARN_1D_AFNItiming_Full_RSA_runwise.sh`
- `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/RSA-learn/scripts/LEARN_ap_Full_RSA_runwise.sh`

These match the existing LEARN pipeline style and are built to be run on the Linux server (not locally).

**Recommended directory layout**
```text
RSA-learn/
  scripts/
  derivatives/afni/IndvlLvlAnalyses/
  logs/
  notes/
```

## 0) Global Config

```python
# =============================
# CONFIG
# =============================
DATA_DIR = "/path/to/betas"      # update later
ROI_DIR  = "/path/to/rois"       # update later
OUT_DIR  = "/path/to/output"     # update later

SUBJECTS = ["S001", "S002"]
ROIS     = ["vmPFC", "dACC", "ant_ins", "post_ins", "vStriatum"]
PEERS    = ["P1", "P2", "P3", "P4"]
VALENCE  = ["pos", "neg"]
RUNS     = [1,2,3,4]

BETA_FMT = "{subj}_{roi}_{peer}_{val}.nii.gz"          # averaged
RUN_FMT  = "{subj}_{roi}_run{run}_{peer}.nii.gz"       # run-wise
TRIAL_FMT= "{subj}_{roi}_run{run}_trial{trial}.nii.gz" # trial-wise
ROI_FMT  = "{roi}.nii.gz"
```

---

## 1) Manifest + QA

```python
import os, pandas as pd

def build_manifest_avg():
    rows=[]
    for subj in SUBJECTS:
        for roi in ROIS:
            for peer in PEERS:
                for val in VALENCE:
                    path = f"{DATA_DIR}/" + BETA_FMT.format(subj=subj, roi=roi, peer=peer, val=val)
                    rows.append({"subject":subj,"roi":roi,"peer":peer,"valence":val,"beta_path":path,"exists":os.path.exists(path)})
    return pd.DataFrame(rows)

manifest = build_manifest_avg()
missing = manifest[manifest["exists"]==False]
if len(missing)>0:
    print("Missing files:")
    print(missing.head())
```

---

## 2) ROI Extraction + QA

```python
import nibabel as nib
import numpy as np
from nilearn.masking import apply_mask

def extract_roi_vector(beta_path, roi_path):
    beta_img = nib.load(beta_path)
    roi_img = nib.load(roi_path)
    vec = apply_mask(beta_img, roi_img)
    vec[vec==0] = np.nan
    return vec

def roi_voxel_count(roi_path):
    data = nib.load(roi_path).get_fdata()
    return int((data>0).sum())

for roi in ROIS:
    print(roi, roi_voxel_count(f"{ROI_DIR}/"+ROI_FMT.format(roi=roi)))
```

---

## 3) Pattern Matrices

### 3.1 Peer‑level patterns (4×voxels)
```python

def build_peer_matrix(subj, roi):
    roi_path = f"{ROI_DIR}/" + ROI_FMT.format(roi=roi)
    patterns=[]
    for peer in PEERS:
        vecs=[]
        for val in VALENCE:
            beta_path = f"{DATA_DIR}/" + BETA_FMT.format(subj=subj, roi=roi, peer=peer, val=val)
            vecs.append(extract_roi_vector(beta_path, roi_path))
        patterns.append(np.nanmean(np.vstack(vecs), axis=0))
    return np.vstack(patterns)
```

### 3.2 Peer×Feedback patterns (8×voxels)
```python

def build_peer_feedback_matrix(subj, roi):
    roi_path = f"{ROI_DIR}/" + ROI_FMT.format(roi=roi)
    patterns=[]
    for peer in PEERS:
        for val in VALENCE:
            beta_path = f"{DATA_DIR}/" + BETA_FMT.format(subj=subj, roi=roi, peer=peer, val=val)
            patterns.append(extract_roi_vector(beta_path, roi_path))
    return np.vstack(patterns)
```

### 3.3 Run‑wise peer patterns (future)
```python
# run-wise peer patterns: 4 peers x voxels for each run

def build_peer_matrix_run(subj, roi, run):
    roi_path = f"{ROI_DIR}/" + ROI_FMT.format(roi=roi)
    patterns=[]
    for peer in PEERS:
        beta_path = f"{DATA_DIR}/" + RUN_FMT.format(subj=subj, roi=roi, run=run, peer=peer)
        patterns.append(extract_roi_vector(beta_path, roi_path))
    return np.vstack(patterns)
```

### 3.4 Trial‑wise patterns (future)
```python
# trial-wise beta series: trial x voxels

def build_trial_matrix(subj, roi, run, n_trials):
    roi_path = f"{ROI_DIR}/" + ROI_FMT.format(roi=roi)
    patterns=[]
    for t in range(1, n_trials+1):
        beta_path = f"{DATA_DIR}/" + TRIAL_FMT.format(subj=subj, roi=roi, run=run, trial=t)
        patterns.append(extract_roi_vector(beta_path, roi_path))
    return np.vstack(patterns)
```

---

## 4) Neural RDMs

```python
import numpy as np

def neural_rdm(patterns):
    corr = np.corrcoef(patterns)
    return 1 - corr
```

---

## 5) Model Fit

```python
from scipy.stats import spearmanr

def model_fit(neural_rdm, model_rdm):
    tri = np.tril_indices_from(neural_rdm, k=-1)
    r,_ = spearmanr(neural_rdm[tri], model_rdm[tri])
    return np.arctanh(r)
```

---

## 6) Batch Pipeline (Averaged Betas)

```python
results=[]
for subj in SUBJECTS:
    for roi in ROIS:
        peer_patterns = build_peer_matrix(subj, roi)
        rdm_peer = neural_rdm(peer_patterns)

        fit_disp = model_fit(rdm_peer, rdm_disp)
        fit_pred = model_fit(rdm_peer, rdm_pred)
        fit_combo = model_fit(rdm_peer, rdm_combo)

        pf_patterns = build_peer_feedback_matrix(subj, roi)
        rdm_pf = neural_rdm(pf_patterns)
        fit_fb = model_fit(rdm_pf, rdm_feedback)
        fit_peerfb = model_fit(rdm_pf, rdm_peer_feedback)

        results.append({
            "subject":subj,
            "roi":roi,
            "fit_disp":fit_disp,
            "fit_pred":fit_pred,
            "fit_combo":fit_combo,
            "fit_fb":fit_fb,
            "fit_peerfb":fit_peerfb,
        })

results_df = pd.DataFrame(results)
results_df.to_csv(f"{OUT_DIR}/rsa_model_fits.csv", index=False)
```

---

## 7) Run‑wise Pipeline (Future)

```python
run_results=[]
for subj in SUBJECTS:
    for roi in ROIS:
        for run in RUNS:
            peer_patterns = build_peer_matrix_run(subj, roi, run)
            rdm_peer = neural_rdm(peer_patterns)
            fit_combo = model_fit(rdm_peer, rdm_combo)
            run_results.append({"subject":subj,"roi":roi,"run":run,"fit_combo":fit_combo})

run_df = pd.DataFrame(run_results)
run_df.to_csv(f"{OUT_DIR}/rsa_model_fits_by_run.csv", index=False)
```

---

## 8) Trial‑wise Pipeline (Future)

```python
# Example: build trial-wise RDM and compare to PE-sign model
from scipy.stats import spearmanr

trial_results=[]
for subj in SUBJECTS:
    for roi in ROIS:
        for run in RUNS:
            trial_patterns = build_trial_matrix(subj, roi, run, n_trials=32)  # placeholder
            rdm_trial = neural_rdm(trial_patterns)
            # compare to trial-level model RDM (e.g., PE sign)
            # fit = model_fit(rdm_trial, model_pe_sign)
```

---

## 9) Validation + Diagnostics

### 9.1 Split‑half reliability
```python
# Example: odd/even trial splits
# r = spearmanr(rdm_odd[tri], rdm_even[tri])[0]
```

### 9.2 Permutation testing
```python
def perm_test(neural_rdm, model_rdm, n=1000):
    tri = np.tril_indices_from(neural_rdm, k=-1)
    obs = spearmanr(neural_rdm[tri], model_rdm[tri])[0]
    null=[]
    for _ in range(n):
        perm = np.random.permutation(neural_rdm.shape[0])
        perm_rdm = neural_rdm[np.ix_(perm, perm)]
        null.append(spearmanr(perm_rdm[tri], model_rdm[tri])[0])
    p = (np.sum(np.array(null) >= obs)+1)/(n+1)
    return obs, p
```

### 9.3 Noise ceiling
```python
# group_rdm = np.mean(subj_rdms, axis=0)
# ceiling = np.mean([spearmanr(rdm_s[tri], group_rdm[tri])[0] for rdm_s in subj_rdms])
```

---

## 10) Stats + Outputs

```python
import statsmodels.formula.api as smf
# df = results_df.merge(sa_table, on="subject")
# m = smf.mixedlm("fit_combo ~ SA", df, groups=df["subject"]).fit()
# print(m.summary())

summary = results_df.groupby("roi").mean()
summary.to_csv(f"{OUT_DIR}/rsa_summary_by_roi.csv")
```

---

## 11) Visualization (Optional)

```python
import seaborn as sns
import matplotlib.pyplot as plt

sns.heatmap(rdm_peer, square=True, cmap="mako")
plt.title("Peer RDM")
plt.show()
```

---

## 12) Output

- `rsa_model_fits.csv`
- `rsa_model_fits_by_run.csv` (future)
- validation logs
- ROI summaries

Next: Step 6 assembles everything into the final presentation.


---

# PART VI — NEXT STEPS

1. Replace placeholder paths with real beta + ROI directories.
2. Add subject table (SA, age, sex, motion).
3. Run pipeline end‑to‑end.
4. Populate tables + figures for PI presentation.
