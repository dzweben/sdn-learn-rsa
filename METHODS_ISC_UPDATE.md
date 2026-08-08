# Methods: temporal ISC — warping, validation, and idiosyncrasy localization

Analysis specification for the LEARN social-feedback temporal ISC, prepared for the methods
and results write-up. All numbers are from the N = 33 analytic sample (SCARED child social
subscale as the social-anxiety, "SA", measure). Nothing here modifies the canonical pipeline;
every reported value came from scratch re-analyses.

Higher SA tracking *lower* ISC is interpreted as idiosyncrasy: the more socially anxious a
participant, the more their time course departs from the group's shared response.

**Scope.** This document covers only the *new additions* to the ISC analysis: (1) the temporal
warp and its validation, (2) the behavioral controls, and (3) the idiosyncrasy localization. The
primary temporal-ISC method and its two findings (Finding 2, rACC rho = -.53, q = .052; Finding
3, whole-brain dorsomedial-frontal parcel rho = -.65, q = .017) are already documented in the
pipeline README and methods walkthrough. Integrate these additions with that existing description
rather than restating the primary pipeline. ISC itself was computed as warped leave-one-out per
run, Fisher z-transformed, averaged across runs, then related to SA by Spearman correlation with
BH-FDR across regions -- the additions below concern only the warp, its checks, and localization.

---

## Framing for the writer

Two facts about this task drive the analysis, and both should be stated to the reader:

1. **The feedback schedule is identical across participants** (same peer, same delivered
   comeback, same trial order; verified: 128/128 trial positions have identical delivered
   valence across all participants). So the feedback participants receive is a genuinely
   shared, common stimulus, which is what ISC requires.
2. **The task is self-paced but clocked.** Participants generate their own predictions and
   responses (variable durations), yet the trial is timed so that feedback occurs at a fixed
   latency after the prediction cue and the response follows feedback at a fixed latency.
   Event onsets therefore drift only slightly across participants, and we align them before
   computing ISC.

The overall logic to convey: ISC assumes a shared, time-locked neural response (Hasson et al.,
2004; Nastase et al., 2019); a self-paced design requires temporal alignment; and the ways
participants differ must be shown to be unrelated to SA so they cannot confound the effect.

---

## Analysis 1 — Temporal alignment (warping) and its validation

**Purpose.** Align event onsets across participants so ISC reflects shared processing rather
than timing drift. Alignment is to *measured external event onsets*, never to the BOLD signal,
so it is non-circular and cannot inflate ISC (Nastase et al., 2019; Silbert et al., 2014).

**Method.** For each participant and run, the ROI-mean BOLD time course was resampled onto a
common temporal grid by piecewise-linear time-warping to the group-median event onsets. Because
the trial is clocked to feedback, anchoring the warp on feedback onset aligns the prediction,
feedback, and response epochs together.

**Warp magnitude (how much the data moved).** The warp displaced time points by a median of
**0.05 s (0.03 TR; TR = 1.75 s)**, 95th percentile 0.89 s — a small fraction of a single TR.

**Post-warp alignment (how well aligned).** Across participants, event onsets aligned to within
0.02 s:

| Epoch | cross-subject onset SD, before warp | after warp | after warp (TR) |
|---|---|---|---|
| prediction | 0.69 s | **0.022 s** | 0.012 |
| feedback | 0.69 s | **0.000 s** | 0.000 |
| response | 0.72 s | **0.007 s** | 0.004 |

i.e., prediction, feedback, and response became **completely aligned** across participants
(< 1/50th of a TR). *Report only these three epochs; do not introduce the inter-stimulus or
inter-trial intervals in the main text.*

**Robustness (sensitivity analysis).** The SA–ISC effect was materially unchanged under no
warp, the feedback-onset warp, and a maximal warp landmarking every event onset:

| | no warp | feedback-onset warp | maximal warp |
|---|---|---|---|
| rACC (Spearman rho, SA vs ISC) | -0.50 | -0.53 | -0.51 |
| dorsomedial frontal parcel | -0.65 | -0.65 | -0.61 |

The effect is therefore not an artifact of the warp, and minimal warping suffices. (The maximal
warp did not improve estimates; consistent with cautions against over-warping, Meszlenyi et al.,
2017, we use the feedback-onset warp.)

**What to tell the reader.** (a) ISC requires time-locked shared responses, so a self-paced task
must be temporally aligned; (b) alignment was to external event onsets, hence non-circular;
(c) the warp was small (median 0.03 TR) and afterward the epochs of interest were essentially
perfectly aligned; (d) a sensitivity analysis across no/feedback/maximal warp shows the effect
does not depend on the warp.
Citations: Nastase et al. (2019, *SCAN* 14:667-685); Hasson et al. (2004, *Science* 303:1634-1640);
Silbert et al. (2014, *PNAS* 111:E4687-E4696); Meszlenyi et al. (2017, *Front. Neurosci.* 11:75).

---

## Analysis 2 — Behavioral controls: SA is unrelated to what differs across participants

**Purpose.** Participants differ in what they predict, what they respond, and their timing. ISC
tolerates such variability, but we must confirm those differences are unrelated to SA, or they
could confound the effect two ways: by creating *different neural experiences* (a substantive
confound) or by producing *different degrees of temporal warping* (an alignment confound). This
is not a test of whether behavior was idiosyncratic in general; it is a test of whether SA
predicts the behavioral differences.

**Method.** For each participant we computed six behavioral indices and correlated each with SA
(Spearman): prediction-choice idiosyncrasy (proportion of trials the participant's prediction
differed from the group modal prediction), response-choice idiosyncrasy (same for the verbal
response), prediction speed (mean prediction RT), prediction-RT variability (SD), response speed
(mean response RT), and response-RT variability (SD).

**Results (all non-significant, N = 33).**

| Behavioral index | Spearman rho vs SA | p |
|---|---|---|
| prediction-choice idiosyncrasy | -0.12 | .52 |
| response-choice idiosyncrasy | -0.10 | .59 |
| prediction speed (RT) | +0.04 | .83 |
| prediction-RT variability | -0.17 | .35 |
| response speed (RT) | -0.05 | .79 |
| response-RT variability | +0.13 | .48 |

**Interpretation.** SA was unrelated to the content of predictions or responses, or to the speed
or variability of either. Because the dimensions on which participants differed were orthogonal
to SA, they can neither have produced the SA-linked reduction in ISC nor differential warping.

**What to tell the reader.** ISC operates on behavior that varies across people; this is expected
and common. Here the variability that exists (choices, timing) is uncorrelated with SA, so it
cannot confound the ISC–SA relationship, and it cannot have driven differential alignment.

---

## Analysis 3 — Localizing the idiosyncrasy (computed; for Results)

**Purpose.** Exploratory but formal localization of *where in the trial* and *for which
conditions* the SA-linked idiosyncrasy is present and strongest. We deliberately avoid a
moderated/interaction model: with N = 33 an interaction term is underpowered and unstable.
Instead we estimate the SA–ISC association *within* each condition with interval estimates, so
the reader sees magnitude and precision rather than a single p-value per cell.

**Comparable partitions (what can and cannot be split, given the design).**

- **Epoch (all trials, whole sample):** prediction, feedback, response. Each occurs at a fixed
  latency relative to feedback, so each aligns across participants and can be isolated.
- **Feedback by DELIVERED valence:** nice vs mean feedback. Delivered valence is fixed across
  participants, so a shared time window can be labeled by valence. Test whether idiosyncrasy is
  present for *both*.
- **Prediction by PEER, extreme peers only (Nice80 = 81% nice; Mean80 = 19% nice):** whether
  anticipation is idiosyncratic when predicting for a nice-reputation peer and for a
  mean-reputation peer. We split by *peer identity* (fixed across participants), **not** by the
  participant's own prediction, because self-generated predictions occur at different times for
  each participant and cannot be aligned for ISC. Only the two extreme peers are used, to give a
  clean nice-vs-mean contrast and avoid the ambiguous 60%-reputation peers.

**Statistic (standardized; not one p-value per cell).**
- Within each condition, compute per-participant leave-one-out ISC (Fisher z-transformed), then
  quantify the SA–ISC association as Spearman rho.
- Report each rho with (a) a 95% bias-corrected-and-accelerated (BCa) bootstrap CI over
  participants (>= 5,000 resamples) and (b) a permutation p from shuffling SA labels
  (>= 10,000 permutations).
- Present all conditions together in a forest-style plot/table (rho +/- 95% CI) so magnitude,
  precision, and significance are read side by side.

**Between-condition comparisons (exploratory only).** Report differences descriptively via CI
overlap and, where a direct contrast is wanted (mean vs nice feedback; Nice80 vs Mean80
prediction), a bootstrap 95% CI on the difference of the two dependent correlations. Framed
explicitly as exploratory, not confirmatory moderation.

**Reporting rules (important — avoid the mistake of collapsing to one number).**
- Report the estimate, CI, and p for EVERY condition.
- Where idiosyncrasy is present but weaker, say so (present-but-smaller), not absent.
- Do not describe the pattern as "only" one condition; give every cell its estimate.

**Standardized results (rACC; per-participant leave-one-out ISC to Spearman rho; BCa 95% CI over
participants, 5,000 resamples; permutation p, 10,000 SA-label shuffles; N = 33).**

By epoch (all trials):

| Epoch | rho | 95% CI | perm p |
|---|---|---|---|
| prediction | -0.48 | [-0.68, -0.20] | .004 |
| feedback | -0.48 | [-0.67, -0.21] | .006 |
| response | -0.35 | [-0.65, +0.02] | .044 |

Feedback by delivered valence:

| Condition | rho | 95% CI | perm p |
|---|---|---|---|
| nice feedback | -0.23 | [-0.51, +0.11] | .20 |
| mean feedback | -0.46 | [-0.69, -0.09] | .009 |

Prediction by extreme peer (fixed across participants):

| Condition | rho | 95% CI | perm p |
|---|---|---|---|
| Nice80 peer (81% nice) | -0.42 | [-0.65, -0.14] | .017 |
| Mean80 peer (19% nice) | -0.42 | [-0.67, -0.06] | .015 |

**How to phrase it (careful wording).**
- Idiosyncrasy is robust during **prediction and feedback** (both CIs exclude zero, p < .01).
- It is **present but weaker during response**: significant by permutation (p = .044) but the 95%
  CI just includes zero, so report it as present-but-less-certain, not absent.
- The feedback effect is carried by **mean (negative) feedback** (CI excludes zero, p = .009);
  for nice feedback it is not detectable (CI includes zero). Note the mean and nice CIs overlap,
  so this is "significant for mean, not for nice," not a formal mean > nice dissociation.
- Anticipatory idiosyncrasy is present for **both** nice-reputation (Nice80) and mean-reputation
  (Mean80) peers and is essentially equal (-0.42 each): anticipation is general across peer type,
  whereas the feedback effect is negative-specific. Frame this dissociation descriptively
  (overlapping CIs; no moderation model, given N = 33).

Citations for the ISC framework and idiosyncrasy interpretation: Nastase et al. (2019); Finn et
al. (2020, *NeuroImage* 215:116828); Hasson et al. (2004).
