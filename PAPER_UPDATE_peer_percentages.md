# Paper update: peer percentages, the veridical peer model, and where each piece goes

Hand-off for the write-up thread. The drafted manuscript describes the four peers by their
**intended** nice-feedback rates (80 / 60 / 40 / 20% nice). A coding error in the initial task
administration changed the delivered rates. This document gives the correct numbers, the model we
use, and **where each piece belongs in the paper**. All values verified on the N = 33 analytic
sample; the feedback schedule was identical across participants (128/128 trial positions).

**The model we use: the veridical ranking model.** Peers are ordered by delivered niceness, with
the two ambiguous middle peers as the closest pair. Rank-based (Spearman). Details in the RSA
section below.

---

## Placement: what goes where (follow this order)

The single most important instruction: **do not front-load the delivered feedback rates in the
task description.** They distract from the veridical structure and belong later.

**1. Introducing LEARN and the peers (Methods, task description).**
Peers differed in their dispositions and in the *obviousness* of those dispositions (two
clearly-valenced peers, two more ambiguous). State the intended rates (80 / 60 / 40 / 20% nice),
then state the adjustment: a coding error in the initial administration of the task shifted the
delivered rates, so the peers are characterized by their delivered values (81 / 53 / 44 / 19%
nice), which preserve the graded ordering with the two middle peers compressed toward chance.
Keep it brief and factual. Do **not** break down the feedback rates here, do **not** bring in
prediction rates, and do **not** introduce the RDM or any RSA logic. That comes later.

**2. Introducing the RSA (Methods, RSA section).**
This is where the veridical model is explained (see "The veridical peer model" below): the model
RDM encodes the delivered peer structure, and the comparison to the neural RDM is by Spearman
rank correlation, so only the ORDER of the six pairwise dissimilarities enters.

**3. Results.**
This is where delivered feedback rates are reported in full, in the normal way (per-peer rates,
and the run-wise breakdown if wanted), along with the robustness set (veridical vs agnostic
model) and the findings.

---

## Numbers

Delivered nice feedback per peer (out of 32 trials):

| Peer (paper label) | intended nice | delivered nice | count |
|---|---|---|---|
| 80% peer | 80% | **81%** | 26/32 |
| 60% peer | 60% | **53%** | 17/32 |
| 40% peer | 40% | **44%** | 14/32 |
| 20% peer | 20% | **19%** | 6/32 |

The two extreme peers came out essentially as intended; the two middle peers were compressed
toward chance. The graded four-peer ordering was preserved.

Delivered nice rate by run (Results, optional; note run 2 momentarily crosses the two middle
peers):

| Run | 80% peer | 60% peer | 40% peer | 20% peer |
|---|---|---|---|---|
| 1 | 88 | 62 | 38 | 12 |
| 2 | 75 | 37 | 50 | 25 |
| 3 | 88 | 50 | 38 | 12 |
| 4 | 75 | 62 | 50 | 25 |

Participants' predicted-nice rates (Results / task-validation only, NOT used to build the model;
per-subject means): 80% peer 70%, 60% peer 62%, 40% peer 46%, 20% peer 41%. These group into a
nicer pair and a meaner pair, showing participants registered the graded structure.

---

## The veridical peer model (RSA Methods)

The model RDM is built from the delivered rates (81 / 53 / 44 / 19) and compared to the neural
RDM by **Spearman rank correlation**. What this means concretely:

- Four peers yield **six pairwise dissimilarities**. Spearman ranks those six gaps 1 to 6 and uses
  only the ranks; the raw percentage differences do not enter the statistic.
- Under the delivered rates the **two middle peers form the smallest of the six gaps** (9 points,
  vs 25 to 62 for every other pair), so the model asserts that the two ambiguous peers are the
  most similar pair. This is the "veridical" structure: it reflects the objective delivered task,
  in which both middle peers landed near chance.
- The percentages therefore serve only to establish the ordering of the six dissimilarities.

Explicitly NOT used: a Pearson / magnitude model (a metric relationship is not estimable or
claimable with four conditions), and any model built from participants' prediction rates.

**Robustness: the equal-distance model (Supplemental).** Motivation to state in Results: the
veridical model asserts the two middle peers are the most similar pair, but participants did not
necessarily encode them that way. Their predicted-nice rates (70 / 62 / 46 / 41) separate the two
middle peers rather than collapsing them, i.e. participants maintained a clear distinction between
the ambiguous peers, closer to the originally intended graded structure than to the compressed
delivered one. We therefore also ran an **equal-distance ranking** in which the middle-peer gap is
tied rather than smallest, scored with **Kendall tau-a** (the appropriate statistic when the model
has tied dissimilarities). **The same rankings held** (rACC remained the sole FDR survivor,
q = .047). Report in Supplemental. Both models were declared in advance; this is not a post-hoc
selection.

Precision note for the writer: do NOT write that participants perceived the peers as *equally*
spaced. The perceived gaps are 8 / 16 / 5, so the middle gap is the LARGEST, not equal. The
accurate claim is that participants did not treat the two middle peers as the most similar pair,
which is what motivates testing an equal-distance alternative.

---

## Findings to know (for writing Methods and Results accurately)

**Finding 1, Model Alignment RSA (this is the RDM-dependent one).** Higher social anxiety tracks
rACC peer representations that sharpen across runs; SA x Run interaction.

| Peer model | statistic | b | p | q (FDR) |
|---|---|---|---|---|
| **Veridical (primary)** | Spearman | +0.032 | .0007 | **.025**, sole survivor of 36 ROIs |
| Equal-distance, tied middle gap (Supplemental) | Kendall tau-a | +0.018 | .0013 | **.047**, sole survivor |

The two models agree across all 36 ROIs (Spearman of the 36 p-values, rho = .84), so the finding
does not depend on the spacing choice. In both, rACC is far ahead of the next regions (dmPFC and
left anterior insula, p ~ .01 to .04, q ~ .17 to .19, i.e. suggestive and not FDR-surviving); the
effect is focal to rACC rather than a distributed social-brain effect.

**Finding 2, Temporal ISC (36 ROIs).** Higher social anxiety tracks a time course that departs
from the group: rACC rho = -0.53, q = .052; aMCC rho = -0.50, q = .059. See
`METHODS_ISC_UPDATE.md` for the warping, behavioral controls, and localization.

**Finding 3, Whole-brain ISC (Schaefer-400).** One parcel survives, right dorsomedial frontal
(RH_Cont_Cing_2), rho = -0.65, q = .017.

Findings 2 and 3 do not depend on the peer RDM; only Finding 1 does.

---

## What NOT to say

- Do not present 80 / 60 / 40 / 20 as the delivered rates; those are the intended rates.
- Do not detail feedback rates, prediction rates, or the RDM in the task description; keep that
  section to the intended rates plus the adjustment.
- Do not describe the RDM as a magnitude, Pearson, or "subtract the nice rates" model; it is
  rank-based, and the percentages only fix the ordering of the six dissimilarities.
- Do not build or describe the model from participants' prediction rates.
- Do not claim participants perceived the peers as equally spaced; the perceived middle gap is
  the largest (8 / 16 / 5). The claim is that they did not treat the middle peers as most similar.
