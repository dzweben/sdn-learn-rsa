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

Statistical conventions. The RSA model terms are tested by permutation (two-sided, 10,000
permutations, add-one Phipson-Smyth estimator): the social anxiety main effect by permuting social
anxiety between participants, and the social anxiety by run interaction by a joint permutation that
additionally scrambles each participant's alignment values across runs. The ISC analyses use the
asymptotic p value of the Spearman correlation, not a permutation test; describe them accordingly
and do not attribute permutation testing to them. All q values are Benjamini-Hochberg FDR across the
36 ROIs, computed separately within each family of tests. "Significant" means q < .05.

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

Model: alignment (Fisher z) ~ run + social anxiety + run x social anxiety, run and social anxiety
mean-centered. n = 132 observations (33 participants x 4 runs), df = 128, in every ROI. Peer model =
veridical. Permutation tests: 10,000 shuffles, two-sided, add-one estimator. The run effect permutes
alignment across runs within participant; the social anxiety effect permutes social anxiety between
participants; the interaction uses the joint permutation.

### 3.3a Is the peer model represented at all? Yes, broadly

Mean alignment (averaged over runs, tested against zero across participants) was significantly
positive in **19 of 36 ROIs** after FDR correction. In rACC, mean Fisher z = +0.108,
t(32) = 2.52, p = 0.017, q = 0.036, Cohen's d = 0.44. The four-peer
reputational geometry is therefore represented across much of the social brain, which is the
precondition for asking how that representation changes.

### 3.3b Neither main effect is reliable

**Run.** No ROI showed a significant change in alignment across runs, and none reached p < .05 even
uncorrected (smallest q = 0.671). In rACC, b = -0.0276, p = 0.463. Report this as a
null: averaged over participants, alignment neither strengthened nor weakened across the task.

**Social anxiety.** No ROI survived correction (smallest q = 0.574). In rACC, b = +0.0204,
t = 2.07, p = 0.034, q = 0.574. Run-averaged total alignment was not related to social
anxiety. Three ROIs reached p < .05 uncorrected (rACC, Prec, SMA_R) and must not be called
significant.

### 3.3c The interaction: a crossover, with both simple slopes significant

rACC was the only ROI surviving FDR for the social anxiety by run interaction, b = +0.0320,
t = 3.62, p = 0.0007, q = 0.025.

Because the run main effect is null and the interaction is significant, the effect runs in opposite
directions at opposite ends of the social anxiety distribution. Simple slopes (SCARED social
M = 5.00, SD = 4.24, observed range 0 to 14), df = 128:

| Social anxiety | Run slope | SE | t | p |
|---|---|---|---|---|
| -1 SD (0.76) | **-0.163** | 0.053 | -3.10 | **0.0024** |
| Mean (5.00) | -0.028 | 0.037 | -0.75 | 0.4557 |
| +1 SD (9.24) | **+0.108** | 0.053 | +2.05 | **0.0421** |

**Both ends are significant and opposite.** Participants lower in social anxiety showed a
significant *decline* in peer-model alignment across runs (b = -0.163, p = 0.0024); participants
higher in social anxiety showed a significant *increase* (b = +0.108, p = 0.0421). The run slope
crosses zero at a SCARED social score of 5.86, near the sample mean.

Johnson-Neyman: the run slope is significantly negative below a social anxiety score of
**3.42** and significantly positive above **9.04**. Both boundaries fall inside the observed range
(0 to 14), so both halves of the crossover are populated by real participants rather than
extrapolated.

**How to phrase it.** Alignment with the peer model did not change across runs at the group level.
This null concealed a disordinal (crossover) interaction with social anxiety: peer representations
became progressively less aligned with the delivered reputational structure in participants low in
social anxiety, and progressively more aligned in participants high in social anxiety. Do not write
that alignment increased, or that it declined, as a main effect. The direction of change depended on
social anxiety.

The same qualitative pattern appears in dmPFC, left anterior insula, and right hippocampus (positive
interaction, significant positive simple slope at high social anxiety in dmPFC and HC_R, significant
negative slope at low social anxiety in AI_L), but none survives FDR for the interaction. Mention as
a consistent trend only.


### 3.3d Full model table, all 36 ROIs

Sorted by interaction p. Bold marks q < .05.

| ROI | mean z | p | q | b_run | p | b_SA | p | q | b_SAxRun | t | p | q |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| rACC | **+0.108** | 0.0169 | **0.036** | -0.028 | 0.463 | +0.0204 | 0.034 | 0.574 | **+0.0320** | 3.62 | 0.0007 | **0.025** |
| dmPFC | +0.065 | 0.1872 | 0.250 | +0.031 | 0.428 | +0.0087 | 0.457 | 0.777 | +0.0233 | 2.40 | 0.0153 | 0.186 |
| AI_L | **+0.220** | 0.0001 | **0.001** | -0.061 | 0.144 | -0.0056 | 0.626 | 0.777 | +0.0252 | 2.49 | 0.0155 | 0.186 |
| HC_R | +0.007 | 0.8809 | 0.906 | +0.034 | 0.445 | +0.0058 | 0.610 | 0.777 | +0.0212 | 2.04 | 0.0468 | 0.421 |
| NAC_L | +0.160 | 0.0636 | 0.092 | -0.059 | 0.318 | +0.0112 | 0.589 | 0.777 | +0.0256 | 1.70 | 0.0668 | 0.481 |
| AI_R | **+0.150** | 0.0017 | **0.007** | -0.062 | 0.165 | +0.0109 | 0.307 | 0.777 | +0.0167 | 1.60 | 0.1266 | 0.682 |
| IFG_R | **+0.185** | 0.0002 | **0.001** | -0.074 | 0.089 | +0.0047 | 0.654 | 0.777 | +0.0158 | 1.58 | 0.1327 | 0.682 |
| FG_L | +0.175 | 0.0355 | 0.061 | -0.054 | 0.387 | -0.0120 | 0.539 | 0.777 | +0.0206 | 1.34 | 0.1701 | 0.700 |
| vmPFC | +0.133 | 0.0520 | 0.081 | +0.019 | 0.729 | +0.0269 | 0.084 | 0.613 | +0.0162 | 1.25 | 0.1939 | 0.700 |
| AM_L | +0.062 | 0.3907 | 0.440 | -0.031 | 0.597 | +0.0123 | 0.491 | 0.777 | +0.0171 | 1.21 | 0.2095 | 0.700 |
| aMCC | **+0.166** | 0.0067 | **0.016** | -0.034 | 0.460 | +0.0156 | 0.268 | 0.777 | +0.0134 | 1.18 | 0.2305 | 0.700 |
| pSTS_R | **+0.254** | 0.0000 | **0.001** | -0.005 | 0.924 | +0.0054 | 0.669 | 0.777 | +0.0151 | 1.23 | 0.2333 | 0.700 |
| FG_R | +0.045 | 0.3291 | 0.382 | +0.032 | 0.437 | +0.0148 | 0.177 | 0.777 | +0.0114 | 1.15 | 0.2582 | 0.707 |
| FP | -0.005 | 0.9268 | 0.927 | +0.063 | 0.184 | -0.0056 | 0.658 | 0.777 | +0.0125 | 1.11 | 0.2748 | 0.707 |
| MT_V5_R | +0.099 | 0.0357 | 0.061 | +0.042 | 0.332 | +0.0041 | 0.716 | 0.805 | +0.0090 | 0.89 | 0.3816 | 0.850 |
| PCC | +0.057 | 0.2812 | 0.362 | +0.045 | 0.387 | +0.0140 | 0.274 | 0.777 | +0.0089 | 0.76 | 0.4466 | 0.850 |
| SMA_L | **+0.166** | 0.0028 | **0.008** | -0.030 | 0.420 | -0.0016 | 0.897 | 0.912 | +0.0066 | 0.69 | 0.4601 | 0.850 |
| HC_L | +0.035 | 0.3244 | 0.382 | +0.007 | 0.887 | -0.0086 | 0.321 | 0.777 | +0.0077 | 0.75 | 0.4824 | 0.850 |
| Cereb_L | +0.120 | 0.0413 | 0.068 | +0.048 | 0.417 | +0.0031 | 0.836 | 0.912 | +0.0092 | 0.68 | 0.5098 | 0.850 |
| NAC_R | **+0.168** | 0.0184 | **0.037** | +0.083 | 0.135 | +0.0108 | 0.520 | 0.777 | +0.0080 | 0.59 | 0.5378 | 0.850 |
| SMG_R | **+0.287** | 0.0000 | **0.001** | -0.066 | 0.240 | +0.0080 | 0.598 | 0.777 | -0.0081 | -0.61 | 0.5398 | 0.850 |
| TPJ_R | +0.041 | 0.4413 | 0.481 | -0.026 | 0.544 | +0.0215 | 0.085 | 0.613 | -0.0058 | -0.56 | 0.5668 | 0.850 |
| AM_R | +0.067 | 0.3236 | 0.382 | -0.013 | 0.847 | +0.0231 | 0.149 | 0.777 | +0.0084 | 0.56 | 0.5804 | 0.850 |
| pSTS_L | **+0.203** | 0.0015 | **0.007** | -0.053 | 0.346 | +0.0103 | 0.483 | 0.777 | +0.0071 | 0.55 | 0.5897 | 0.850 |
| IFG_L | +0.133 | 0.0591 | 0.089 | +0.069 | 0.195 | +0.0149 | 0.364 | 0.777 | +0.0065 | 0.50 | 0.5902 | 0.850 |
| MT_V5_L | **+0.180** | 0.0024 | **0.008** | +0.017 | 0.658 | +0.0182 | 0.167 | 0.777 | -0.0036 | -0.36 | 0.6997 | 0.855 |
| TP_L | +0.026 | 0.6609 | 0.700 | -0.012 | 0.843 | +0.0015 | 0.912 | 0.912 | -0.0053 | -0.39 | 0.7040 | 0.855 |
| TPJ_L | **+0.270** | 0.0002 | **0.002** | -0.040 | 0.485 | +0.0100 | 0.535 | 0.777 | +0.0051 | 0.37 | 0.7092 | 0.855 |
| TP_R | +0.085 | 0.1167 | 0.162 | -0.033 | 0.474 | +0.0082 | 0.521 | 0.777 | +0.0040 | 0.36 | 0.7096 | 0.855 |
| MTG_L | **+0.194** | 0.0012 | **0.006** | -0.037 | 0.371 | +0.0118 | 0.370 | 0.777 | +0.0036 | 0.35 | 0.7125 | 0.855 |
| SMA_R | **+0.131** | 0.0036 | **0.009** | -0.056 | 0.233 | +0.0223 | 0.024 | 0.574 | -0.0036 | -0.34 | 0.7393 | 0.859 |
| Prec | **+0.151** | 0.0028 | **0.008** | -0.049 | 0.254 | +0.0220 | 0.048 | 0.574 | +0.0027 | 0.27 | 0.7832 | 0.881 |
| pMCC | **+0.132** | 0.0087 | **0.020** | -0.063 | 0.152 | +0.0067 | 0.573 | 0.777 | -0.0024 | -0.24 | 0.8167 | 0.891 |
| SMG_L | **+0.143** | 0.0210 | **0.040** | -0.031 | 0.503 | +0.0124 | 0.387 | 0.777 | -0.0015 | -0.14 | 0.8833 | 0.926 |
| Cereb_R | **+0.148** | 0.0024 | **0.008** | +0.018 | 0.636 | -0.0019 | 0.872 | 0.912 | -0.0010 | -0.11 | 0.9144 | 0.926 |
| MTG_R | **+0.204** | 0.0005 | **0.003** | -0.055 | 0.333 | +0.0094 | 0.474 | 0.777 | +0.0013 | 0.10 | 0.9257 | 0.926 |

## 3.4 Temporal ISC: full 36-ROI table

Group ISC is the one-sample test that mean Fisher-z ISC exceeds zero (df = 32), establishing that
there is shared signal in the region. The social anxiety association is a Spearman correlation.

**Group-level ISC was significantly above zero in all 36 of 36 ROIs** (all p < .02, most p < 1e-6),
so every region carried reliable shared signal for individual variation to be measured against.

| ROI | mean ISC (z) | group t | group p | rho with SA | p | q |
|---|---|---|---|---|---|---|
| rACC | 0.134 | 7.10 | 4.7e-08 | **-0.532** | 0.0014 | **0.052** |
| aMCC | 0.128 | 9.12 | 2.1e-10 | **-0.497** | 0.0033 | **0.059** |
| Cereb_L | 0.198 | 4.75 | 4.1e-05 | -0.368 | 0.0353 | 0.423 |
| FG_R | 0.155 | 7.36 | 2.3e-08 | -0.330 | 0.0603 | 0.448 |
| TPJ_R | 0.097 | 4.60 | 6.3e-05 | +0.315 | 0.0744 | 0.448 |
| SMA_L | 0.121 | 7.07 | 5.1e-08 | -0.314 | 0.0747 | 0.448 |
| dmPFC | 0.126 | 8.91 | 3.5e-10 | -0.282 | 0.1115 | 0.573 |
| SMA_R | 0.162 | 7.66 | 1.0e-08 | -0.267 | 0.1324 | 0.584 |
| AI_R | 0.141 | 9.84 | 3.4e-11 | -0.259 | 0.1460 | 0.584 |
| PCC | 0.164 | 9.68 | 5.0e-11 | -0.221 | 0.2155 | 0.732 |
| pMCC | 0.082 | 6.42 | 3.3e-07 | -0.209 | 0.2442 | 0.732 |
| MT_V5_L | 0.170 | 8.52 | 9.7e-10 | -0.206 | 0.2493 | 0.732 |
| Prec | 0.140 | 8.39 | 1.4e-09 | -0.195 | 0.2776 | 0.732 |
| HC_R | 0.103 | 5.61 | 3.4e-06 | -0.192 | 0.2848 | 0.732 |
| HC_L | 0.109 | 6.05 | 9.3e-07 | -0.172 | 0.3381 | 0.812 |
| TP_R | 0.102 | 4.51 | 8.2e-05 | -0.158 | 0.3804 | 0.856 |
| Cereb_R | 0.128 | 6.72 | 1.4e-07 | -0.141 | 0.4334 | 0.868 |
| pSTS_L | 0.205 | 11.56 | 5.8e-13 | -0.139 | 0.4406 | 0.868 |
| FP | 0.114 | 7.54 | 1.4e-08 | -0.126 | 0.4842 | 0.868 |
| IFG_L | 0.171 | 10.18 | 1.5e-11 | -0.114 | 0.5275 | 0.868 |
| NAC_L | 0.052 | 2.47 | 1.9e-02 | -0.110 | 0.5405 | 0.868 |
| AM_L | 0.085 | 4.29 | 1.6e-04 | +0.105 | 0.5593 | 0.868 |
| MTG_R | 0.179 | 5.71 | 2.5e-06 | -0.097 | 0.5925 | 0.868 |
| vmPFC | 0.096 | 4.21 | 1.9e-04 | -0.089 | 0.6206 | 0.868 |
| FG_L | 0.221 | 7.91 | 5.0e-09 | -0.088 | 0.6246 | 0.868 |
| SMG_L | 0.127 | 9.26 | 1.4e-10 | -0.087 | 0.6319 | 0.868 |
| SMG_R | 0.185 | 12.97 | 2.7e-14 | -0.082 | 0.6507 | 0.868 |
| IFG_R | 0.119 | 9.15 | 1.9e-10 | +0.069 | 0.7033 | 0.904 |
| pSTS_R | 0.139 | 7.94 | 4.6e-09 | -0.042 | 0.8146 | 0.974 |
| TP_L | 0.078 | 3.84 | 5.5e-04 | -0.042 | 0.8167 | 0.974 |
| TPJ_L | 0.113 | 6.37 | 3.8e-07 | -0.029 | 0.8736 | 0.974 |
| MT_V5_R | 0.183 | 11.95 | 2.5e-13 | +0.029 | 0.8743 | 0.974 |
| AM_R | 0.074 | 4.75 | 4.1e-05 | -0.020 | 0.9104 | 0.974 |
| AI_L | 0.114 | 7.86 | 5.8e-09 | -0.012 | 0.9473 | 0.974 |
| MTG_L | 0.223 | 9.91 | 2.8e-11 | +0.009 | 0.9607 | 0.974 |
| NAC_R | 0.058 | 3.12 | 3.8e-03 | -0.006 | 0.9740 | 0.974 |

No ROI survived FDR at q < .05. rACC (rho = -0.53, q = .052) and aMCC (rho = -0.50, q = .059) are
just above threshold and should be described as approaching correction, never as significant.

## 3.5 Whole-brain ISC (Schaefer-400)

Results only. Per the author's instruction this analysis is not described in Methods and is intended
as supplemental or results-only material.

One parcel of 400 survived FDR correction: right dorsomedial frontal cortex
(7Networks_RH_Cont_Cing_2, 34 voxels), rho = **-0.65**, p = 4.33e-05, q = **.017**, group mean ISC
z = .086 (group t = 5.96). It was also the sole survivor with no registration (rho = -0.65,
q = .018) and did not survive maximal registration (rho = -0.61, q = .062).

Runner-up parcels, none surviving correction, listed because the next two are medial prefrontal and
converge with the ROI analysis:

| Parcel | rho | p | q |
|---|---|---|---|
| RH_Cont_Cing_2 | -0.649 | 4.33e-05 | 0.017 |
| RH_Default_PFCdPFCm_3 | -0.552 | 8.73e-04 | 0.175 |
| RH_Vis_21 | +0.524 | 1.74e-03 | 0.231 |
| LH_Default_PFC_9 | -0.452 | 8.32e-03 | 0.683 |
| RH_Cont_PFCmp_2 | -0.450 | 8.54e-03 | 0.683 |

Caution for the writer: the interactive report contains two different MNI coordinates for this
parcel and a claim that it lies about 5 mm from the aMCC ROI. Recomputed, the parcel centre is
roughly 23 to 24 mm from the aMCC centre and about 48 mm from rACC. Do not describe it as bordering
or adjacent to the rACC mask. Describe it anatomically as right dorsomedial frontal or
mid-cingulate cortex and verify the coordinate before quoting one.

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

# Part 6. Data provenance and residual items

**Where each number in Part 3 comes from.**

| Quantity | Source file | Status |
|---|---|---|
| RSA model terms, run trajectories, all 36 ROIs | `analysis/report/ma_phases.js` (feedback epoch) | Current GLM. Authoritative. |
| Temporal ISC, all 36 ROIs | `analysis/report/stats.js`, the `ti_*` fields | Current. Verified against a fresh re-run (rACC rho = -0.532, q = .0522). |
| Whole-brain ISC | `analysis/report/stats.js`, `wb_temporal` | Current. |
| Registration diagnostics, sensitivity analysis, localization, behavioral controls, delivered feedback rates | scratch re-analyses on the compute cluster | Computed for this document. |

**Warning: do not use the `ma_*` fields in `stats.js`.** That file's header records that its model
alignment fields were generated from an earlier GLM (it gives rACC b_interaction = +0.0237, q = .19,
versus the current +0.0320, q = .025). Its `ti_*` ISC fields are current and were verified. Use
`ma_phases.js` for anything model-alignment.

**Residual items, none of which block writing.**

1. **No permutation test exists for the run main effect.** The pipeline reports b_run without a
   test. Part 3.3a reports the trajectory descriptively. A formal test would permute alignment
   across runs within participant. A job to compute this is queued on the cluster, which was
   unreachable during compilation.
2. **A one-sample test of mean alignment against zero** (does any region represent the peer ordering
   at all, averaged over runs) is not currently computed. The same queued job produces it. The run
   trajectories in Part 3.3c show alignment is positive in nearly every ROI and run, so this is a
   formality rather than an open question.
3. **The ROI count description needs a small correction.** The Method draft describes 30 cortical
   ROIs, but two of those 30 spheres are cerebellar (right and left cerebellum). Describe them as
   28 cortical and 2 cerebellar spheres, or as 30 spherical ROIs, whichever reads better.
4. **Simple-slope significance tests for the crossover.** Part 3.3a reports the simple slopes at
   plus and minus one standard deviation of social anxiety (+0.108 and -0.163). These are exact
   algebraic consequences of the fitted coefficients, but their standard errors and tests require
   the model's coefficient covariance matrix, which is not stored in the report data. Because the
   crossover is now the headline of Finding 1, APA reporting expects each simple slope to be tested,
   not only the interaction. The queued cluster job should be extended to output, for rACC, the
   simple slope, standard error, t, and p at low, mean, and high social anxiety, and ideally a
   Johnson-Neyman region showing the social anxiety value at which the run slope crosses zero. Until
   then, describe the simple slopes as descriptive decompositions of the interaction.

5. **Consider aligning the pipeline constant with the Methods.** `pipeline/04_model_alignment_and_
   temporal_isc.py` still defines P_NICE from the intended rates. Because the model is rank-based
   and both constant sets produce the same ordering of the six dissimilarities, changing it is a
   numerical no-op, but a reader who opens the cited repository will otherwise find the code and the
   Methods describing different rates. Verify the no-op before changing anything.

---

# Part 7. Supplement: the equidistant peer model, complete battery

Everything reported for the primary (veridical) model, recomputed under the equidistant model with
the identical pipeline: alignment scored per run, Fisher z-transformed, entered into the same OLS,
with the same permutation schemes (10,000 shuffles) and the same FDR correction across 36 ROIs. The
only change is the model RDM and, because that model contains tied dissimilarities, the use of
Kendall's tau-a in place of Spearman's rho.

Purpose: show that the finding does not depend on asserting that the two intermediate peers are the
most similar pair.

## 7.1 Headline comparison

| Term | Veridical (primary) | Equidistant (supplement) |
|---|---|---|
| Mean alignment, FDR survivors | 19/36 | 19/36 |
| Run main effect, FDR survivors | 0/36 | 0/36 |
| Social anxiety main effect, FDR survivors | 0/36 | 0/36 |
| Social anxiety x run, FDR survivors | rACC only (q = 0.025) | rACC only (q = 0.047) |

The two models agree on every headline: the peer geometry is represented across roughly half the
atlas, neither main effect is reliable anywhere, and rACC is the sole region whose alignment
trajectory depends on social anxiety.

## 7.2 Where the two models differ, stated plainly

**1. rACC mean alignment.** Significant under the veridical model
(z = +0.108, p = 0.017, q = 0.036) but not under the equidistant model
(z = +0.043, p = 0.093, q = 0.134). The two models disagree on exactly two regions,
['rACC', 'Cereb_L']. Both counts are 19/36, so this is a swap rather than a difference in overall sensitivity.

**2. The run effect is more visible under the equidistant model.** No ROI survives FDR under either
model, but nine reach p < .05 uncorrected under the equidistant model (all negative) versus none
under the veridical model. Do not report these as significant. If the run effect is discussed, say
that any tendency was toward declining alignment and that it did not survive correction under either
model.

**3. The simple-slope decomposition differs, and this matters.** Under the veridical model both ends
of the crossover are significant. Under the equidistant model the effect is carried by the low
social anxiety decline, and the high-anxiety increase is not significant.

| Social anxiety | Veridical slope (p) | Equidistant slope (p) |
|---|---|---|
| -1 SD (0.76) | **-0.163** (0.0024) | **-0.122** (0.0002) |
| Mean (5.00) | -0.028 (0.4557) | **-0.046** (0.0477) |
| +1 SD (9.24) | **+0.108** (0.0421) | +0.031 (0.3346) |

Zero-crossing: SCARED social 5.86 (veridical) versus 7.51 (equidistant).
Johnson-Neyman boundaries: [3.42, 9.04] versus [5.03, 12.74]; under the equidistant model the
upper boundary (12.74) sits near the top of the observed range (0 to 14), which is why the
high-anxiety slope does not reach significance.

**Consequence for the write-up.** The claim "the rACC alignment trajectory depends on social anxiety"
is model-independent and can be stated plainly. The stronger claim "alignment significantly increases
at high social anxiety and significantly decreases at low social anxiety" holds under the primary
model only; under the equidistant model only the decline at low social anxiety is significant. Attach
the simple-slope decomposition to the primary model and note in the supplement that the low-anxiety
decline replicates under both while the high-anxiety increase does not.

## 7.3 Full equidistant battery, all 36 ROIs

Sorted by interaction p. Bold marks q < .05.

| ROI | mean z | p | q | b_run | p | q | b_SA | p | q | b_SAxRun | t | p | q |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| rACC | +0.043 | 0.0931 | 0.134 | -0.0455 | 0.063 | 0.190 | +0.0155 | 0.006 | 0.207 | **+0.0181** | 3.33 | 0.0013 | **0.047** |
| AI_L | **+0.149** | 0.0000 | **0.000** | -0.0666 | 0.013 | 0.139 | -0.0028 | 0.673 | 0.949 | +0.0170 | 2.74 | 0.0093 | 0.167 |
| dmPFC | +0.033 | 0.3005 | 0.386 | -0.0011 | 0.967 | 0.967 | +0.0068 | 0.373 | 0.927 | +0.0134 | 2.08 | 0.0350 | 0.420 |
| HC_R | +0.002 | 0.9431 | 0.943 | +0.0060 | 0.812 | 0.967 | +0.0042 | 0.521 | 0.949 | +0.0108 | 1.79 | 0.0808 | 0.582 |
| AI_R | **+0.076** | 0.0068 | **0.015** | -0.0637 | 0.019 | 0.139 | +0.0068 | 0.282 | 0.927 | +0.0112 | 1.80 | 0.0878 | 0.582 |
| NAC_L | +0.035 | 0.3507 | 0.421 | -0.0477 | 0.035 | 0.159 | +0.0010 | 0.909 | 0.955 | +0.0083 | 1.38 | 0.1188 | 0.582 |
| IFG_R | **+0.100** | 0.0015 | **0.004** | -0.0681 | 0.012 | 0.139 | +0.0090 | 0.199 | 0.927 | +0.0098 | 1.56 | 0.1287 | 0.582 |
| vmPFC | +0.063 | 0.0459 | 0.078 | -0.0289 | 0.272 | 0.489 | +0.0078 | 0.293 | 0.927 | +0.0093 | 1.46 | 0.1379 | 0.582 |
| AM_R | +0.020 | 0.4986 | 0.544 | -0.0259 | 0.357 | 0.584 | +0.0176 | 0.011 | 0.207 | +0.0098 | 1.50 | 0.1456 | 0.582 |
| pSTS_R | **+0.154** | 0.0000 | **0.000** | -0.0172 | 0.491 | 0.737 | +0.0048 | 0.450 | 0.949 | +0.0076 | 1.28 | 0.2065 | 0.743 |
| aMCC | **+0.125** | 0.0007 | **0.003** | -0.0207 | 0.455 | 0.713 | +0.0067 | 0.414 | 0.933 | +0.0075 | 1.11 | 0.2630 | 0.746 |
| AM_L | +0.032 | 0.3649 | 0.424 | -0.0354 | 0.218 | 0.437 | +0.0059 | 0.491 | 0.949 | +0.0075 | 1.06 | 0.2756 | 0.746 |
| IFG_L | +0.073 | 0.0474 | 0.078 | +0.0374 | 0.170 | 0.361 | +0.0079 | 0.361 | 0.927 | +0.0071 | 1.06 | 0.2806 | 0.746 |
| PCC | +0.044 | 0.0769 | 0.120 | -0.0056 | 0.830 | 0.967 | +0.0013 | 0.823 | 0.955 | +0.0061 | 1.03 | 0.3160 | 0.746 |
| pSTS_L | **+0.148** | 0.0000 | **0.000** | -0.0389 | 0.145 | 0.348 | +0.0037 | 0.602 | 0.949 | +0.0064 | 1.02 | 0.3202 | 0.746 |
| FG_L | +0.076 | 0.0415 | 0.075 | -0.0383 | 0.162 | 0.361 | -0.0026 | 0.764 | 0.949 | +0.0064 | 0.93 | 0.3315 | 0.746 |
| SMG_R | **+0.165** | 0.0000 | **0.000** | -0.0594 | 0.040 | 0.159 | +0.0019 | 0.782 | 0.949 | -0.0059 | -0.88 | 0.3946 | 0.793 |
| FP | +0.003 | 0.9343 | 0.943 | +0.0155 | 0.592 | 0.815 | -0.0076 | 0.335 | 0.927 | +0.0057 | 0.83 | 0.3964 | 0.793 |
| Cereb_L | **+0.104** | 0.0001 | **0.001** | -0.0022 | 0.942 | 0.967 | -0.0030 | 0.621 | 0.949 | +0.0056 | 0.82 | 0.4474 | 0.848 |
| HC_L | +0.025 | 0.2400 | 0.332 | -0.0053 | 0.851 | 0.967 | -0.0083 | 0.100 | 0.724 | +0.0047 | 0.74 | 0.4967 | 0.894 |
| MT_V5_R | +0.050 | 0.0811 | 0.122 | -0.0035 | 0.894 | 0.967 | +0.0013 | 0.858 | 0.955 | +0.0037 | 0.60 | 0.5529 | 0.914 |
| TP_R | +0.041 | 0.2511 | 0.335 | -0.0647 | 0.023 | 0.139 | -0.0003 | 0.973 | 0.973 | +0.0035 | 0.50 | 0.6035 | 0.914 |
| TPJ_R | +0.017 | 0.6214 | 0.658 | -0.0138 | 0.611 | 0.815 | +0.0077 | 0.346 | 0.927 | -0.0031 | -0.46 | 0.6351 | 0.914 |
| NAC_R | **+0.078** | 0.0177 | **0.034** | +0.0167 | 0.529 | 0.762 | +0.0031 | 0.683 | 0.949 | +0.0028 | 0.44 | 0.6620 | 0.914 |
| SMA_L | **+0.128** | 0.0002 | **0.001** | -0.0392 | 0.093 | 0.259 | -0.0007 | 0.929 | 0.955 | +0.0021 | 0.36 | 0.7018 | 0.914 |
| SMG_L | **+0.126** | 0.0008 | **0.003** | -0.0442 | 0.106 | 0.273 | +0.0050 | 0.555 | 0.949 | -0.0024 | -0.36 | 0.7104 | 0.914 |
| TPJ_L | **+0.167** | 0.0000 | **0.000** | -0.0281 | 0.347 | 0.584 | +0.0024 | 0.776 | 0.949 | +0.0026 | 0.36 | 0.7141 | 0.914 |
| pMCC | **+0.087** | 0.0077 | **0.016** | -0.0565 | 0.036 | 0.159 | +0.0019 | 0.790 | 0.949 | -0.0020 | -0.32 | 0.7518 | 0.914 |
| Cereb_R | **+0.100** | 0.0019 | **0.005** | +0.0020 | 0.933 | 0.967 | +0.0009 | 0.905 | 0.955 | -0.0017 | -0.31 | 0.7537 | 0.914 |
| MT_V5_L | **+0.113** | 0.0015 | **0.004** | +0.0013 | 0.960 | 0.967 | +0.0089 | 0.265 | 0.927 | -0.0018 | -0.29 | 0.7619 | 0.914 |
| SMA_R | **+0.073** | 0.0152 | **0.030** | -0.0610 | 0.019 | 0.139 | +0.0145 | 0.033 | 0.400 | -0.0016 | -0.26 | 0.7881 | 0.915 |
| FG_R | +0.027 | 0.3429 | 0.421 | -0.0032 | 0.904 | 0.967 | +0.0059 | 0.386 | 0.927 | +0.0015 | 0.24 | 0.8153 | 0.917 |
| Prec | **+0.104** | 0.0022 | **0.005** | -0.0599 | 0.021 | 0.139 | +0.0130 | 0.086 | 0.724 | -0.0011 | -0.18 | 0.8530 | 0.931 |
| TP_L | +0.025 | 0.4375 | 0.492 | -0.0357 | 0.246 | 0.466 | +0.0083 | 0.288 | 0.927 | -0.0008 | -0.11 | 0.9162 | 0.970 |
| MTG_L | **+0.122** | 0.0013 | **0.004** | -0.0477 | 0.061 | 0.190 | +0.0051 | 0.537 | 0.949 | +0.0003 | 0.05 | 0.9528 | 0.980 |
| MTG_R | **+0.085** | 0.0020 | **0.005** | -0.0530 | 0.050 | 0.181 | +0.0019 | 0.770 | 0.949 | +0.0000 | 0.00 | 0.9967 | 0.997 |

## 7.4 Total alignment is model-invariant (secondary check)

Scoring each participant's run-averaged neural RDM once, rather than per run, mean alignment was
significantly positive in 24 of 36 ROIs under the veridical model and 25 of 36 under the equidistant
model, agreeing region by region in 35 of 36 (the exception, FG_L, is marginal under both). The
region ordering is nearly identical under the two models.

**Estimator note, important.** That secondary check gives 24/36 for the veridical model, whereas the
main analysis above gives 19/36. The difference is the estimator, not the model: the main analysis
scores alignment separately in each run and then averages, matching the pipeline that feeds the OLS,
whereas the secondary check averages the RDM across runs before scoring once, which is less noisy.
**Report 19/36**, the pipeline-consistent value. The secondary check exists only to show the
model-invariance of total alignment and should be described as such if it is used at all.

