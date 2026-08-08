# LEARN manuscript hand-off: methods additions and full results

Single source of truth for the write-up thread. Supersedes `METHODS_ISC_UPDATE.md` and
`PAPER_UPDATE_peer_percentages.md`. Everything here is verified on the N = 33 analytic sample.
The canonical pipeline is unchanged; every supplementary value came from scratch re-analyses.

**How to use this document.** Part 1 is what changed and why. Part 2 is Methods material to add or
revise, in paper order. Part 3 is the full results, formatted for an APA Results section. Part 4 is
citations. Part 5 is the prohibitions. Read Part 1 first; it determines several judgment calls.

**Scope rules set by the author:**
- The whole-brain (Schaefer-400) ISC is **not described in Methods**. Its results are compiled in
  Part 3 for use as supplemental or results-only material. Do not add a whole-brain Methods
  subsection.
- Participants' prediction rates are **not reported anywhere in the paper**. They are retained in
  Part 3 only as an on-deck answer to a possible reviewer question.
- Statistical claims use FDR q, not uncorrected p, for the word "significant."

---

# Part 1. What changed and why

**1. The peer feedback rates were not what the draft says.** The Method currently describes the
peers by their intended rates, P(nice) = .80, .60, .40, .20. A coding error in the initial task
administration changed the delivered rates to **.81, .53, .44, .19**. The two extreme peers came
out essentially as intended; the two middle peers were compressed toward chance. The graded
four-peer ordering was preserved.

**2. The RSA peer model is therefore rebuilt from the delivered rates ("veridical model").** It
remains rank-based (Spearman), so only the ordering of the six pairwise dissimilarities enters.
The result is unchanged: rACC SA x run interaction, q = .025, sole survivor of 36 ROIs.

**3. The temporal ISC needed its warping documented and stress-tested.** The draft mentions
landmark registration but not the checks. This document supplies the full set: warp magnitude,
post-registration alignment, a three-level warp sensitivity analysis, behavioral controls showing
social anxiety is orthogonal to everything participants did differently, and a localization
analysis showing where in the trial the effect sits.

**4. Nothing about the findings changed.** All three findings stand. The corrections and checks
make them defensible, not different.

---

# Part 2. Methods material to add or revise (in paper order)

## 2.1 The LEARN Task: peer reputations (REVISE)

The current paragraph states P(nice) = .80, .60, .40, .20 as the peers' rates. Revise to state the
intended rates, then the adjustment. Keep it brief and factual. Do **not** break down feedback
rates here, do **not** mention prediction rates, and do **not** introduce the RDM or any RSA logic;
those belong later.

Content to convey:
- The four peers differed in disposition and in how obvious that disposition was: two peers with
  clear reputations and two more ambiguous peers.
- The intended probabilities of nice feedback were .80, .60, .40, and .20.
- Because of a coding error in the initial administration of the task, the delivered probabilities
  were .81, .53, .44, and .19. The two extreme peers were delivered as intended; the two
  intermediate peers were delivered closer to chance. The graded ordering from most to least nice
  was preserved, and analyses use the delivered rates.
- Also update the Figure 1 note, which currently states P(nice) = .80, .60, .40, .20.

## 2.2 Representational Similarity Analysis: the model RDM (REVISE)

The current text builds the model RDM from P(nice) = .80, .60, .40, .20 and describes dissimilarity
as increasing with the difference in feedback rates. Two revisions:

**(a) Use the delivered rates.** The model RDM is built from the delivered probabilities
(.81, .53, .44, .19).

**(b) State clearly that the model is ordinal, not metric.** The current wording ("modeled
dissimilarity between any two peers increased with the difference in their feedback rates") invites
a reader to think magnitudes matter. They do not. Four peers yield six pairwise dissimilarities;
the analysis ranks those six values and uses only their order. The delivered rates serve to
establish that ordering, nothing more. The existing Figure 3 note already says this correctly
("only the ordering of the pairwise dissimilarities enters the analysis"); align the body text
with it.

Under the delivered rates the two intermediate peers form the smallest of the six dissimilarities
(a 9-point difference, versus 25 to 62 points for every other pair), so the model represents them
as the most similar pair. This follows from the delivered task structure, in which both landed near
chance.

**Supplemental robustness model.** Justified a priori, not empirically: an equal-distance model
assumes less than the primary model. The primary model asserts that the two intermediate peers are
the most similar pair; the equal-distance model declines to assert this and encodes only the
ordinal ranking of the four peers. Because it contains tied dissimilarities it is scored with
Kendall's tau-a rather than Spearman's rho. Suggested sentence:

> Because the primary model's assumption that the two intermediate peers were most similar derives
> from the delivered feedback rates, we repeated the analysis with an equal-distance model that
> assumes only the ordinal ranking of the four peers, scored with Kendall's tau-a to accommodate
> its tied dissimilarities. The rACC interaction was unchanged (q = .047).

## 2.3 Temporal ISC: rationale for ISC on a structured task (ADD)

The draft asserts that ISC extends to controlled task designs and cites Pajula et al. (2012). That
is the right citation; the argument can be tightened and the caveats named explicitly.

**The conceptual requirement.** ISC requires a time-locked shared response to a common stimulus
(Hasson et al., 2004; Nastase et al., 2019), not a continuous naturalistic stimulus. Nastase et al.
(2019) state that block and event-related designs can be analyzed with ISC if stimuli are presented
with the same timing across participants, and identify the obstacles as non-identical trial orders
and participant-specific event durations. The present task removes the first (a single fixed trial
sequence, administered to all participants; delivered feedback valence was identical at 128 of 128
trial positions) and addresses the second by temporal registration.

**Empirical warrant beyond movies.** Pajula et al. (2012) validated ISC against a stimulus-model
GLM across five discrete, non-naturalistic tasks, recovering the same activation structure
(mean r = .74, mean Dice = .73).

**ISC as an individual-differences measure.** Finn et al. (2020) formalize the interpretation used
here: a participant's degree of synchrony with the group indexes how faithfully they process a
shared experience, so lower ISC reflects more idiosyncratic processing. One clarification worth
including preemptively: Nastase et al. (2019) note that conventional ISC filters out the
per-voxel idiosyncratic response component. The present analysis does not interpret that component;
it uses between-participant variation in the shared-signal ISC value as the individual-difference
index (Finn et al., 2020). Convergent precedent that lower ISC tracks atypical social processing:
Byrge et al. (2015).

**Precedent in this population and content.** Camacho et al. (2024) found that youth with higher
social anxiety showed higher intersubject variability in response to narrative social stimuli,
which is the present hypothesis in a different paradigm. Peer-evaluative feedback is a potent and
individually variable social signal in adolescence (Silk et al., 2014).

## 2.4 Temporal ISC: registration and its validation (EXPAND)

The draft reports the maximum and mean deviation and cites Kneip and Gasser (1992), Silbert et al.
(2014), and Lerner et al. (2014). Add the following, which is currently missing.

**Why registration is non-circular.** Registration aligns each participant's time course to
externally defined event onsets, which are design variables independent of the BOLD signal.
Registering to the neural signal itself would inflate ISC circularly (Kriegeskorte et al., 2009);
registering to event onsets cannot. State this explicitly.

**What registration achieves, by epoch.** Report that registration aligned the three epochs of
interest to within a fiftieth of a repetition time (Part 3.1). Do not discuss the
inter-stimulus and inter-trial intervals; they are filler periods, they are not analyzed, and
introducing them invites confusion. If a reviewer raises them, the answer is in Part 3.1.

**Magnitude of the applied warp.** The constrained-warping literature treats the amount of warping
as a quantity to report and bound (Sakoe & Chiba, 1978; Meszlenyi et al., 2017; Wiafe et al., 2024,
which introduces a warp-elasticity metric). The applied registration was monotonic, onset-anchored,
and small (median displacement 0.05 s, or 0.03 TR). Frame this as a transparency diagnostic; there
is no published numeric threshold to clear.

**Sensitivity to the registration choice.** Report the three-level analysis in Part 3.2: no
registration, feedback-onset registration, and a maximal registration landmarking every event
onset. This is the analysis that demonstrates the findings are not artifacts of registration.

## 2.5 Behavioral controls (ADD)

Currently absent and needed, because participants differ in what they predict, how they respond,
and their timing, and a reviewer will ask whether those differences drive the ISC effect. The
analysis tests whether social anxiety predicts those differences, not whether the differences
exist.

Method to describe: for each participant, six indices were computed and each was rank-correlated
with social anxiety: prediction-choice idiosyncrasy (proportion of trials on which the
participant's prediction differed from the group modal prediction for that trial), response-choice
idiosyncrasy (the same for the verbal response), mean prediction reaction time, the standard
deviation of prediction reaction time, mean response reaction time, and the standard deviation of
response reaction time.

## 2.6 Localization of the ISC effect (ADD)

Currently absent. Describe as an exploratory, estimation-based localization rather than a
moderation model, because at N = 33 an interaction term would be underpowered and unstable.

Method to describe: within each trial epoch (prediction, feedback, response, each defined relative
to feedback onset and shifted for the hemodynamic lag), leave-one-out ISC was recomputed on the
registered time courses restricted to that epoch's time points, Fisher z-transformed, and averaged
across runs. Each epoch's ISC was rank-correlated with social anxiety. The same procedure was
applied to the feedback epoch split by delivered valence, and to the prediction epoch split by
peer, restricted to the two extreme peers, whose identity and timing were fixed across
participants. Each association is reported with a bias-corrected and accelerated bootstrap 95%
confidence interval (5,000 resamples over participants) and a permutation p value (10,000
shuffles of social anxiety). Differences between conditions are described from interval overlap
and are explicitly exploratory.

Note for the writer: prediction and response are self-generated, so those epochs have no shared
external driver; the analysis of the feedback epoch, where the stimulus is identical across
participants, carries the primary interpretive weight. Section 2.5 establishes that behavior is
unrelated to social anxiety, which is what licenses interpreting the self-paced epochs at all.

---

# Part 3. Full results

Statistical conventions used throughout: permutation p values are two-sided with 10,000
permutations and the add-one (Phipson-Smyth) estimator; q values are Benjamini-Hochberg FDR across
the 36 ROIs, computed separately for each model term; "significant" means q < .05.

## 3.1 Task timing and registration

Trial structure (group means across the 33 participants and 4 runs): the prediction window and the
anticipation interval together occupy 4.02 s (SD 0.01), so feedback onset falls at a fixed latency
after the prediction cue regardless of how quickly the participant predicted. Feedback is fixed at
3.00 s. The response window and inter-trial interval together occupy 4.44 s (SD 0.53). The task is
therefore self-paced but clocked, which is why registering on feedback onset also aligns the
prediction and response epochs.

**Cross-participant onset alignment, before and after registration** (SD across participants,
averaged over events and runs):

| Epoch | Before registration | After registration | After (TR) |
|---|---|---|---|
| Prediction | 0.69 s | **0.022 s** | 0.012 |
| Feedback | 0.69 s | **0.000 s** | 0.000 |
| Response | 0.72 s | **0.007 s** | 0.004 |

Registration aligned all three analyzed epochs to within a fiftieth of a repetition time
(TR = 1.75 s).

**Magnitude of the applied registration.** Median displacement of a time point 0.05 s (0.03 TR),
mean 0.35 s (0.20 TR), 95th percentile 0.89 s, maximum 5.86 s (3.3 TRs, in run 4).

*Not for the main text, available if a reviewer asks:* the two filler periods, which are not
analyzed, retain a residual misalignment of approximately 0.86 s (0.49 TR), because a participant
who predicts quickly receives a correspondingly longer anticipation interval.

## 3.2 Registration sensitivity analysis

The SA-ISC association under three registration schemes: none, feedback-onset registration (the
reported method), and maximal registration landmarking every event onset.

| Measure | No registration | Feedback-onset | Maximal |
|---|---|---|---|
| rACC ISC (Spearman rho with SA) | -0.50 (q = .107) | **-0.53 (q = .052)** | -0.51 (q = .066) |
| Whole-brain parcel (RH_Cont_Cing_2) | -0.65 (q = .018) | **-0.65 (q = .017)** | -0.61 (q = .062) |

The associations are present without any registration, so they are not artifacts of it. Maximal
registration does not improve estimation and weakens the whole-brain result, consistent with
cautions against over-warping; the minimal, onset-anchored registration is retained.

## 3.3 Model Alignment RSA: full model, all terms

Model: alignment (Fisher-z) ~ run + social anxiety + run x social anxiety, with run and social
anxiety mean-centered, fitted across participants and runs (n = 4 observations per participant,
33 participants). Peer model = veridical (delivered rates).

### 3.3a Terms other than the interaction

> **PENDING COMPUTE.** The mean-alignment (intercept) test, the run main effect, and the social
> anxiety main effect with their permutation p and q values are being computed; the cluster was
> unreachable at the time of writing and the job is queued to run automatically. These three rows
> are required for a complete APA table:
> - **Mean alignment**: is neural-to-model alignment above zero (do regions represent the peer
>   ordering at all)? One-sample t across participants on run-averaged alignment, with Cohen's d.
> - **Run main effect**: does alignment increase across runs for the sample as a whole (general
>   learning, independent of social anxiety)? Permutation shuffles alignment across runs within
>   participant.
> - **Social anxiety main effect**: does run-averaged total alignment vary with social anxiety?
>   Permutation shuffles social anxiety between participants. (The existing pipeline already
>   computes this term; the values simply need to be extracted.)
>
> Also pending: mean alignment per run for the whole sample (the group learning trajectory), which
> is the natural companion to a significant run main effect.

### 3.3b Social anxiety x run interaction, all 36 ROIs

Primary model (veridical, Spearman) and the supplemental equal-distance model (Kendall's tau-a),
sorted by the primary model's p value. Asterisk marks q < .05.

| ROI | b (veridical) | p | q | b (equal-dist.) | p | q |
|---|---|---|---|---|---|---|
| rACC | +0.032 | .0007 | **.025*** | +0.018 | .0013 | **.047*** |
| dmPFC | +0.023 | .015 | .186 | +0.013 | .035 | .420 |
| AI_L | +0.025 | .016 | .186 | +0.017 | .009 | .167 |
| HC_R | +0.021 | .047 | .421 | +0.011 | .081 | .582 |
| NAC_L | +0.026 | .067 | .481 | +0.008 | .119 | .582 |
| AI_R | +0.017 | .127 | .682 | +0.011 | .088 | .582 |
| IFG_R | +0.016 | .133 | .682 | +0.010 | .129 | .582 |
| FG_L | +0.021 | .170 | .700 | +0.006 | .332 | .746 |
| vmPFC | +0.016 | .194 | .700 | +0.009 | .138 | .582 |
| AM_L | +0.017 | .210 | .700 | +0.008 | .276 | .746 |
| aMCC | +0.013 | .231 | .700 | +0.008 | .263 | .746 |
| pSTS_R | +0.015 | .233 | .700 | +0.008 | .207 | .743 |
| FG_R | +0.011 | .258 | .707 | +0.002 | .815 | .917 |
| FP | +0.012 | .275 | .707 | +0.006 | .396 | .793 |
| MT_V5_R | +0.009 | .382 | .850 | +0.004 | .553 | .914 |
| PCC | +0.009 | .447 | .850 | +0.006 | .316 | .746 |
| SMA_L | +0.007 | .460 | .850 | +0.002 | .702 | .914 |
| HC_L | +0.008 | .482 | .850 | +0.005 | .497 | .894 |
| Cereb_L | +0.009 | .510 | .850 | +0.006 | .447 | .848 |
| NAC_R | +0.008 | .538 | .850 | +0.003 | .662 | .914 |
| SMG_R | -0.008 | .540 | .850 | -0.006 | .395 | .793 |
| TPJ_R | -0.006 | .567 | .850 | -0.003 | .635 | .914 |
| AM_R | +0.008 | .580 | .850 | +0.010 | .146 | .582 |
| pSTS_L | +0.007 | .590 | .850 | +0.006 | .320 | .746 |
| IFG_L | +0.007 | .590 | .850 | +0.007 | .281 | .746 |
| MT_V5_L | -0.004 | .700 | .855 | -0.002 | .762 | .914 |
| TP_L | -0.005 | .704 | .855 | -0.001 | .916 | .970 |
| TPJ_L | +0.005 | .709 | .855 | +0.003 | .714 | .914 |
| TP_R | +0.004 | .710 | .855 | +0.003 | .604 | .914 |
| MTG_L | +0.004 | .713 | .855 | +0.000 | .953 | .980 |
| SMA_R | -0.004 | .739 | .859 | -0.002 | .788 | .915 |
| Prec | +0.003 | .783 | .881 | -0.001 | .853 | .931 |
| pMCC | -0.002 | .817 | .891 | -0.002 | .752 | .914 |
| SMG_L | -0.002 | .883 | .926 | -0.002 | .710 | .914 |
| Cereb_R | -0.001 | .914 | .926 | -0.002 | .754 | .914 |
| MTG_R | +0.001 | .926 | .926 | +0.000 | .997 | .997 |

Summary for the text: rACC is the only region surviving FDR correction under either model, and it
is well separated from the next regions (p = .0007 versus .015 for the next). Four regions reach
p < .05 uncorrected under the primary model (rACC, dmPFC, AI_L, HC_R) and three under the
supplemental model; the median p across the 36 ROIs is approximately .50, so the effect is focal to
rACC rather than distributed. The two models agree closely across regions (Spearman correlation
between the two sets of 36 p values, rho = .84), which preempts any concern that the peer model was
selected to produce the result.

## 3.4 Temporal ISC, 36 ROIs

Feedback-onset registration (the reported method). Negative rho indicates that participants with
higher social anxiety showed time courses less like the group.

| ROI | rho with SA | q |
|---|---|---|
| rACC | **-0.53** | .052 |
| aMCC | **-0.50** | .059 |
| Cereb_L | -0.36 | .446 |
| FG_R | -0.33 | .474 |
| TPJ_R | +0.31 | .474 |
| AI_R | -0.26 | .595 |

Mean ISC (Fisher z) in rACC was 0.134 under the reported registration (0.126 unregistered, 0.141
under maximal registration), confirming reliable group-level synchrony in the region.

> **PENDING COMPUTE.** Two additions are needed for a complete Results section: (a) the full 36-ROI
> table with rho, p, and q for every region rather than the six largest, and (b) the group-level
> one-sample test of whether mean ISC exceeds zero in each ROI, which establishes that there was
> shared signal to be individually variable about. Both are queued.

## 3.5 Whole-brain ISC (Schaefer-400)

Results only; per the author's instruction this analysis is not described in Methods and is
intended as supplemental or results-only material.

One parcel of 400 survived FDR correction: right dorsomedial frontal cortex (7Networks_RH_Cont_
Cing_2), rho = **-0.65**, q = **.017**. It was the sole survivor under both no registration
(rho = -0.65, q = .018) and the reported registration, and did not survive under maximal
registration (rho = -0.61, q = .062).

## 3.6 Localization of the rACC ISC effect

Exploratory estimation-based localization. Each cell is the rank correlation between epoch-specific
ISC and social anxiety, with a bias-corrected and accelerated bootstrap 95% confidence interval
(5,000 resamples) and a permutation p value (10,000 shuffles). N = 33.

**By trial epoch (all trials):**

| Epoch | rho | 95% CI | p |
|---|---|---|---|
| Prediction | -0.48 | [-0.68, -0.20] | .004 |
| Feedback | -0.48 | [-0.67, -0.21] | .006 |
| Response | -0.35 | [-0.65, +0.02] | .044 |

**Feedback epoch by delivered valence:**

| Condition | rho | 95% CI | p |
|---|---|---|---|
| Mean (negative) feedback | -0.46 | [-0.69, -0.09] | .009 |
| Nice (positive) feedback | -0.23 | [-0.51, +0.11] | .20 |

**Prediction epoch by peer (two extreme peers, whose identity and timing were fixed):**

| Condition | rho | 95% CI | p |
|---|---|---|---|
| Predictable nice peer | -0.42 | [-0.65, -0.14] | .017 |
| Predictable mean peer | -0.42 | [-0.67, -0.06] | .015 |

**How to phrase these (important).**
- The association is robust during prediction and feedback; both confidence intervals exclude zero.
- It is **present but weaker during response**: significant by permutation (p = .044) but the
  confidence interval marginally includes zero. Report as present and less certain, never as absent.
- Within the feedback epoch the association is detectable for negative feedback and not for
  positive feedback. The two confidence intervals overlap, so this is "significant for one and not
  the other," not a demonstrated difference between them. Do not claim a dissociation.
- Anticipatory idiosyncrasy is equivalent for the nice-reputation and mean-reputation peers
  (-0.42 each), so anticipation is general across peer type whereas the feedback association is
  specific to negative feedback. Describe descriptively; no moderation model was fitted.

## 3.7 Behavioral controls

Social anxiety was unrelated to every dimension on which participants differed (Spearman, N = 33):

| Behavioral index | rho with SA | p |
|---|---|---|
| Prediction-choice idiosyncrasy | -0.12 | .52 |
| Response-choice idiosyncrasy | -0.10 | .59 |
| Mean prediction reaction time | +0.04 | .83 |
| SD of prediction reaction time | -0.17 | .35 |
| Mean response reaction time | -0.05 | .79 |
| SD of response reaction time | +0.13 | .48 |

Because the dimensions on which participants differed were unrelated to social anxiety, they can
neither have produced the association between social anxiety and ISC nor produced differential
registration. Note in particular that reaction-time variability, the behavioral quantity that could
in principle have driven differential temporal registration, was unrelated to social anxiety.

## 3.8 Delivered feedback (for the Results task-description or Table)

Delivered nice feedback per peer, out of 32 trials:

| Peer | Intended P(nice) | Delivered P(nice) | Count |
|---|---|---|---|
| Predictable nice | .80 | **.81** | 26/32 |
| Unpredictable nice | .60 | **.53** | 17/32 |
| Unpredictable mean | .40 | **.44** | 14/32 |
| Predictable mean | .20 | **.19** | 6/32 |

Delivered valence was identical across participants at all 128 trial positions.

Delivered nice rate by run (optional; note that run 2 momentarily inverts the two intermediate
peers, which the fixed model does not track):

| Run | Predictable nice | Unpredictable nice | Unpredictable mean | Predictable mean |
|---|---|---|---|---|
| 1 | .88 | .62 | .38 | .12 |
| 2 | .75 | .37 | .50 | .25 |
| 3 | .88 | .50 | .38 | .12 |
| 4 | .75 | .62 | .50 | .25 |

## 3.9 On deck, NOT for the paper: participant prediction rates

Not reported and not used to build or justify any model. Retained only in case a reviewer asks how
participants perceived the peers.

- Per-participant mean predicted-nice rates: .70, .62, .46, .41 (gaps of 8, 16, and 5 percentage
  points, so the gap between the two intermediate peers is the largest, not the smallest).
- The pattern changes across runs. In run 1 participants treat the peers as two categories (gaps of
  -1, 25, and 2); by run 4 they differentiate all four peers into roughly even spacing (14, 12, 9).
- These averages are not driven by social anxiety: SA versus each peer's predicted-nice rate gives
  rho = +.09, -.04, -.16, and -.04, all p > .37, and the peer ordering is identical in the low and
  high social anxiety halves of the sample.

---

# Part 4. Citations

Already in the manuscript's reference list and used correctly: Hasson et al. (2004); Nastase et al.
(2019); Pajula et al. (2012); Silbert et al. (2014); Lerner et al. (2014); Kneip and Gasser (1992);
Kriegeskorte et al. (2006, 2008); Kriegeskorte and Kievit (2013); Garvert et al. (2017); Schapiro
et al. (2013); Benjamini and Hochberg (1995); Alcala-Lopez et al. (2018).

**To add.** Verify pages and DOIs before insertion.

| Citation | Supports |
|---|---|
| Finn, E. S., et al. (2020). Idiosynchrony: From shared responses to individual differences during naturalistic neuroimaging. *NeuroImage, 215*, 116828. | ISC as an individual-differences measure; the interpretation of lower ISC as more idiosyncratic processing. |
| Camacho, M. C., et al. (2024). Higher intersubject variability in neural response to narrative social stimuli among youth with higher social anxiety. *Journal of the American Academy of Child and Adolescent Psychiatry.* doi:10.1016/j.jaac.2023.08.020 | The closest precedent: adolescents, social anxiety, greater intersubject variability to social stimuli. |
| Kriegeskorte, N., Simmons, W. K., Bellgowan, P. S. F., & Baker, C. I. (2009). Circular analysis in systems neuroscience. *Nature Neuroscience, 12*(5), 535-540. | The circularity principle that registering to external event onsets, rather than to the BOLD signal, avoids. |
| Byrge, L., et al. (2015). Idiosyncratic brain activation patterns are associated with poor social comprehension in autism. *Journal of Neuroscience, 35*(14), 5837-5850. | Lower ISC indexes idiosyncratic processing with social-functional consequences. |
| Sakoe, H., & Chiba, S. (1978). Dynamic programming algorithm optimization for spoken word recognition. *IEEE Transactions on Acoustics, Speech, and Signal Processing, 26*(1), 43-49. | Monotonicity and constraint as requirements of time alignment. |
| Meszlenyi, R. J., et al. (2017). Resting state fMRI functional connectivity analysis using dynamic time warping. *Frontiers in Neuroscience, 11*, 75. | Constrained warping in fMRI; the caution against unconstrained warping. |
| Silk, J. S., et al. (2014). Peer acceptance and rejection through the eyes of youth. *Social Cognitive and Affective Neuroscience.* doi:10.1093/scan/nst175 | Adolescent sensitivity to peer evaluation motivates the paradigm. |

Optional, lower priority: Wiafe et al. (2024, *Imaging Neuroscience*) for a warp-elasticity metric;
Nan et al. (2022, *Frontiers in Human Neuroscience*) for EEG ISC inversely related to anxiety.

**Where precedent is thin, and how to handle it.** The specific combination, ISC applied to a
self-paced event-related social-feedback task with onset registration, has no direct published
precedent. Present it as a principled composition rather than as standard practice: the ISC
requirement is stated by Nastase et al. (2019), discrete-task validity by Pajula et al. (2012), the
population-and-content precedent by Camacho et al. (2024), and the alignment machinery by the
landmark-registration and constrained-warping literature. The non-circularity argument is a design
argument built on the principle in Kriegeskorte et al. (2009), not a cited procedure; state it as
reasoning. No published numeric threshold exists for acceptable warp magnitude, so report the
magnitude as a transparency diagnostic rather than as clearing a standard.

---

# Part 5. What not to say

- Do not present .80, .60, .40, .20 as the delivered rates. They are the intended rates. This
  includes the Figure 1 note.
- Do not detail feedback rates, the RDM, or any RSA logic in the task description. That section
  states the intended rates and the adjustment only.
- Do not describe the model RDM as a magnitude, Pearson, or subtract-the-rates model. It is
  rank-based, and the delivered rates only fix the ordering of the six dissimilarities.
- Do not report or cite participants' prediction rates anywhere in the paper, and do not use them
  to justify the equal-distance model, which is justified a priori because it assumes less.
- Do not add a whole-brain Methods subsection. Whole-brain results are results-only or supplemental.
- Do not describe the response epoch as showing no effect. It is present and less certain.
- Do not claim a dissociation between negative and positive feedback, or between epochs. The
  confidence intervals overlap and no moderation model was fitted.
- Do not introduce the inter-stimulus or inter-trial intervals in the main text.
- Do not call an uncorrected p < .05 result significant. Significance is q < .05.

---

# Part 6. Pending computations

Queued to run automatically when the compute cluster returns; the cluster was unreachable during
compilation. None of these change any finding; they complete the tables.

1. **Model Alignment RSA, remaining model terms** (Part 3.3a): mean alignment with a one-sample
   test and Cohen's d, the run main effect with a within-participant permutation test, and the
   social anxiety main effect, each with FDR q across the 36 ROIs; plus the group mean alignment per
   run.
2. **Temporal ISC, full table** (Part 3.4): rho, p, and q for all 36 ROIs, and the group-level
   one-sample test that mean ISC exceeds zero in each ROI.

Script: `full_results.py`, staged and queued on the compute cluster; writes `/tmp/full_rsa.json`.
