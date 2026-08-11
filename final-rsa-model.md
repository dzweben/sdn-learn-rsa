# Final RSA peer model

The model to use for the Model Alignment RSA (Finding 1), and how to describe it. Plain version;
the full battery lives in `MANUSCRIPT_HANDOFF.md`.

## The model in one paragraph

The four peers are ordered by how often they actually delivered nice feedback: 81, 53, 44, and 19
percent (26, 17, 14, and 6 of 32 trials). From these we build a model of how similar each pair of
peers is: two peers are more similar the closer their feedback rates. The analysis is ordinal, so
only the ordering of the six pairwise similarities matters, not the exact sizes. We compare this
model to each brain region's neural similarity structure with a rank correlation.

## Why this exact form

Four peers give six pairwise distances. In units of trials out of 32 they are:

| Peer pair | distance |
|---|---|
| Nice60 vs Mean60 (the two middle peers) | 3 |
| Mean60 vs Mean80 | 8 |
| Nice80 vs Nice60 | 9 |
| Nice60 vs Mean80 | 11 |
| Nice80 vs Mean60 | 12 |
| Nice80 vs Mean80 (the two extremes) | 20 |

Two of these pairs differ by a single trial (8 vs 9, and 11 vs 12). A one-trial difference is
noise, not structure, so the model should not treat those as real rank differences. We therefore
tie them. The model keeps the distinctions that are real, the two middle peers are the closest pair
and the two extreme peers are the farthest apart, and stays agnostic about the one-trial pairs.

Because the model now contains tied values, it is scored with **Kendall's tau-a** (the rank
statistic appropriate for a model with ties), not Spearman's rho.

## What NOT to say

- Do not call this a magnitude or Pearson model. It is ordinal; the percentages only set the
  ordering of the six distances.
- Do not present 80 / 60 / 40 / 20 as the delivered rates. Those were the intended rates; a coding
  error in the initial administration produced the delivered rates above.

## The result

Higher social anxiety moderates how rACC peer representations change across runs. rACC was the only
region of 36 to survive FDR correction.

- SA by run interaction: b = +0.022, t = 3.77, p = .0003, q = .011.
- There is no group-level change across runs and no social-anxiety main effect; the effect is the
  interaction.
- Simple slopes: alignment declines across runs at low social anxiety and increases at high social
  anxiety (a crossover). Exact slopes are in `MANUSCRIPT_HANDOFF.md` Part 3.

## Robustness (report briefly, full tables in the main hand-off)

The finding does not depend on how the middle spacing is handled. rACC is the sole FDR survivor
under all three ways of building the model:

| Model | statistic | q |
|---|---|---|
| This model: tie the one-trial pairs | Kendall tau-a | .011 |
| Every distance kept distinct | Spearman | .025 |
| All four peers equally spaced | Kendall tau-a | .047 |

The effect lives in the ordinal peer structure that is actually resolvable, not in accidental
one-trial spacing.
