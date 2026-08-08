# Paper update: peer percentages (intended vs actual) and the peer RDM

Hand-off for the write-up thread. The drafted manuscript describes the four peers by their
**intended** nice-feedback rates (80 / 60 / 40 / 20% nice). A coding error in the initial task
administration changed the **delivered** rates. This document gives the correct numbers and the
narrative to update the task description and the RSA model, throughout the paper. All values are
verified (N = 33 analytic sample unless noted; feedback schedule identical across participants,
128/128 trial positions).

---

## The correction in one line

Intended nice-feedback rates were 80 / 60 / 40 / 20% (two nice peers, two mean peers). Due to a
coding error in the initial administration, the **delivered** rates were **81 / 53 / 44 / 19%**.
The two *extreme* peers came out essentially as intended; the two *middle* peers were compressed
toward chance (~50%). The graded, two-nice / two-mean structure was preserved both in the
delivered feedback and in participants' own predictions.

## Numbers to use

Internal label -> intended nice -> delivered nice (count out of 32):

| Peer (paper label) | intended nice | delivered nice | delivered count |
|---|---|---|---|
| 80% peer (Nice80) | 80% | **81%** | 26/32 |
| 60% peer (Nice60) | 60% | **53%** | 17/32 |
| 40% peer (Mean60) | 40% | **44%** | 14/32 |
| 20% peer (Mean80) | 20% | **19%** | 6/32 |

Participants' predictions (perceived niceness = proportion of trials the participant predicted
the peer would be nice; pooled across the sample):

| Peer | predicted nice |
|---|---|
| 80% peer | 69% |
| 60% peer | 64% |
| 40% peer | 52% |
| 20% peer | 45% |

The prediction rates cluster into a nicer pair (69, 64) and a meaner pair (52, 45): participants
registered the two-nice / two-mean structure even though the delivered middle peers were near
chance.

Optional (reviewer discretion) -- delivered nice rate by run, showing the schedule was not fully
stationary (e.g., run 2 momentarily crosses the two middle peers):

| Run | 80% peer | 60% peer | 40% peer | 20% peer |
|---|---|---|---|---|
| 1 | 88 | 62 | 38 | 12 |
| 2 | 75 | 37 | 50 | 25 |
| 3 | 88 | 50 | 38 | 12 |
| 4 | 75 | 62 | 50 | 25 |

## How to update the paper (narrative arc)

1. **Introducing the peers.** Peers differed in their dispositions and in the *obviousness* of
   those dispositions (two clearly-valenced peers, two more ambiguous). The writer already knows
   the general framing; keep it professional.
2. **Introducing the learning task.** State the **intended** rates (80 / 60 / 40 / 20% nice).
3. **What happened.** A coding error in the initial administration of the task led to the
   delivered rates above (81 / 53 / 44 / 19%).
4. **Structure check** (still in the four-peer description). Frame: "for the sake of our analysis
   we asked whether we still had a basic structure of two nice and two mean peers." Then present
   (a) the delivered rates (81 / 53 / 44 / 19%), and (b) participants' average prediction rates
   (69 / 64 vs 52 / 45), which group the peers into nicer and meaner. Conclusion: although the
   exact intended 80 / 60 / 40 / 20 spacing was not delivered, a **graded ordering of four peers,
   increasingly less nice, is present both in the delivered environment and in how participants
   perceived it** -- i.e., this is the environment participants learned and processed.
5. **RSA section.** The peer model RDM is rank / ordinal (compared to the neural RDM by Spearman
   rank correlation). It is NOT a magnitude / Pearson model and NOT a "subtract nice-feedback
   rates" model (only the ORDER of the six pairwise peer dissimilarities enters). The exact
   inter-peer spacing is specified in the "RSA peer model" section below (a small set of candidate
   structures, all reported).

## RSA peer model (RDM): rank-based; two candidate spacings (both reported)

The peer model RDM is rank-based (Spearman). Pearson / magnitude models are explicitly NOT used
(a metric model is less justified and underpowered at four conditions; only the ordinal structure
is claimed). Both candidate models preserve the graded order 80% > 60% > 40% > 20% peer and differ
only in the spacing of the two ambiguous middle peers. The finding is reported under both (a
declared robustness set, not a post-hoc pick):

1. **Equidistant** (ranks 1-2-3-4): four evenly spaced peers; the three adjacent-pair
   dissimilarities tie. Simplest ordinal model, the reference.
2. **Veridical / delivered, middle two closest**: the two middle peers were both delivered near
   chance (53% and 44% nice), so they are objectively the most similar pair, and their
   dissimilarity is the smallest of the six. Built from the delivered rates (81/53/44/19).
   Justified purely by the objective task structure. This is the model of interest.

Both keep 60% > 40%, so both are compatible with the effect's earlier robustness (it requires the
two middle peers ordered and dies only under collapse or reversal). The RDM is NOT based on
participant prediction rates; those are used only to describe the task (participants registered
the graded structure), not to build the model.

### Results (banked): rACC SA x Run interaction under each RDM

| Peer RDM | statistic | b | p | q (FDR) |
|---|---|---|---|---|
| Veridical / middle-two-closest | Spearman | +0.032 | .0007 | **.025** (sole survivor) |
| True-equidistant, genuine ties | Kendall tau-a | +0.018 | .0013 | **.047** (sole survivor) |

Both survive FDR with rACC as the only surviving region. The veridical spacing (justified by the
delivered structure, where the two near-chance middle peers are the closest pair) gives the
stronger effect; the maximally-agnostic equidistant model (ties handled by Kendall tau-a, the
correct statistic for a tied model) is weaker but still survives. The finding is robust to the
middle-peer spacing. Note: the canonical nominal (80/60/40/20) model, scored with Spearman,
collapses numerically onto the veridical result, because its tied gaps break toward the same
middle-closest ordering; the two rows above are the two genuinely distinct models to report.

### Supporting check (banked): the prediction rates cited in the task description are not SA-driven

The task description notes that participants' average predictions grouped the peers into nicer and
meaner. That group average is representative of the whole sample, not driven by social anxiety
(N = 33):
- SA vs each peer's predicted-nice rate is non-significant: 80% peer rho = +.09; 60% rho = -.04;
  40% rho = -.16; 20% rho = -.04; all p > .37.
- The peer ordering is identical across the SA median split: low-SA 67 > 61 > 46 > 39; high-SA
  72 > 63 > 46 > 43.

So the "participants registered the structure" claim reflects the whole sample.

## What NOT to say

- Do not present 80 / 60 / 40 / 20 as the *delivered* rates (those are the intended rates).
- Do not describe the RDM as a magnitude / subtraction model; it is rank-based (Spearman).
- Do not commit to exact inter-peer spacing pending the RDM discussion (see FLAG above).
