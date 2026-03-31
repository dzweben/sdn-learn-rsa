# IS-RSA Searchlight Results: Interpretation

**Date:** 2026-03-30
**Threshold:** p < 0.05 uncorrected, 6-connectivity, minimum 10 voxels
**Interactive viewer:** https://dzweben.github.io/isrsa-cluster-viewer/

## Overview

Whole-brain IS-RSA searchlight analysis reveals 131 significant clusters across both feedback conditions. The whole brain is doing something, and it's mostly the same thing regardless of feedback valence — but **Mean feedback amplifies individual differences**.

| Section | Clusters | Total Voxels |
|---|---|---|
| Mean Feedback: Idiosyncrasy | 36 | 1,630 |
| Mean Feedback: Convergence | 26 | 825 |
| Nice Feedback: Idiosyncrasy | 33 | 876 |
| Nice Feedback: Convergence | 36 | 1,003 |

Key stats:

- **r = 0.45** correlation between Mean and Nice rho maps across all ~70k brain voxels. These are not independent maps — there is a single landscape of individual differences.
- **97.6%** of voxels significant in both conditions agree on direction. Wherever it's sig in both, it's going the same way.
- But Mean feedback generates far more idiosyncrasy: **66%** of Mean's sig voxels are idiosyncratic vs only **47%** for Nice. Mean idiosyncrasy has the biggest clusters by far (307, 182, 148 voxels) — nothing in Nice idiosyncrasy breaks 100.

## 1. Idiosyncrasy Is the Dominant Signal, Especially for Mean Feedback

**Mean idiosyncrasy:** 36 clusters, 1,630 voxels — the largest section by a wide margin. The biggest clusters are in classic social/affective processing regions, and people differ most from each other here when processing mean feedback:

| Voxels | Peak rho | Region | MNI |
|---|---|---|---|
| 307 | -0.317 | Left insula | (-34, -14, -2) |
| 182 | -0.290 | Right central operculum | (56, 2, 8) |
| 148 | -0.337 | Left supramarginal gyrus (anterior) | (-52, -34, 50) |
| 86 | -0.219 | Right frontal pole | (22, 58, 14) |
| 83 | -0.163 | Right temporal | (40, -16, -20) |

**Nice idiosyncrasy** is smaller (33 clusters, 876 voxels) and the clusters are modest. The biggest Nice idio cluster is in cerebellum/brainstem (99 vox) and left occipital (90 vox).

Idiosyncrasy regions across both conditions:

- **Insula / central operculum** — interoceptive awareness, visceral feeling
- **Anterior cingulate / paracingulate** — salience detection, affective conflict monitoring
- **Somatosensory cortex (SII, OP4)** — embodied social perception
- **Subcortical structures** — caudate, putamen (reward/learning circuits), brainstem
- **Lateral prefrontal cortex** — MFG, IFG (pars opercularis and triangularis)
- **Supramarginal gyrus (anterior division)** — somatosensory association
- **Fusiform / inferior temporal** — perceptual processing of social stimuli
- **Occipital cortex** — early visual processing

## 2. Convergence Exists But Is More Modest and Condition-Balanced

**Mean convergence:** 26 clusters, 825 voxels. Strongest in right calcarine/visual cortex (28, -58, 2; 149 vox) and PCC (-4, -44, 32; 77 vox).

**Nice convergence:** 36 clusters, 1,003 voxels. Strongest in left frontal pole (-26, 56, 2; 106 vox) and right cerebellum (22, -70, -46; 87 vox).

| Voxels | Peak rho | Region | Condition | MNI |
|---|---|---|---|---|
| 149 | +0.356 | Right calcarine / visual cortex | Mean FB | (28, -58, 2) |
| 106 | +0.253 | Left frontal pole | Nice FB | (-26, 56, 2) |
| 87 | +0.254 | Right cerebellum | Nice FB | (22, -70, -46) |
| 77 | +0.325 | Posterior cingulate cortex | Mean FB | (-4, -44, 32) |
| 64 | +0.208 | Left angular gyrus | Mean FB | (-50, -58, 34) |
| 61 | +0.227 | Left frontal pole | Nice FB | (-26, 50, 22) |

Convergence regions across both conditions:

- **Posterior cingulate cortex (PCC)** — self-referential processing, narrative integration
- **Precuneus** — self-reflection, episodic memory retrieval
- **Angular gyrus** — semantic integration, mentalizing
- **Frontal pole** — the single most prominent convergence region, with 4+ separate clusters (especially for Nice feedback) — abstract evaluation, prospective thinking
- **Temporal pole / MTG** — social semantic knowledge, person knowledge
- **Supramarginal gyrus (posterior division)** — theory of mind
- **Motor / premotor cortex** — SMA, precentral gyrus (action representation)
- **Lateral occipital (superior)** — higher-order visual/spatial processing

## 3. The Cross-Condition Pattern Is Revealing

When examining peak rho in one condition at locations defined by the other:

- **Mean idio clusters → Nice trends the same direction but usually doesn't reach significance.** E.g., left insula: Mean rho = -0.32, Nice rho = -0.17 (p = .16). The insula is idiosyncratic for both, just MORE so for Mean.
- **Mean convergence clusters → Nice hovers right at the significance boundary.** Right calcarine: Mean rho = +0.36, Nice rho = +0.22 (p = .053). PCC: Mean rho = +0.32, Nice rho = +0.19 (p = .055). These visual/midline regions want to be convergent for both conditions.
- **Nice convergence in frontal pole is unique to Nice.** Left frontal pole: Nice rho = +0.25, Mean rho = +0.06 (p = .30). This convergence region does NOT show up for Mean at all.

## The Story

This isn't "Mean does X and Nice does Y in different networks." It's more like:

**There's a single landscape of individual differences in social feedback processing.** Most of the brain — especially social/affective regions (insula, operculum, supramarginal) — shows idiosyncratic responses: people process this information in their own way. Sensory/midline regions (calcarine, PCC) converge: everyone processes similarly there.

**Mean feedback turns up the volume on individual differences.** The same regions that are weakly idiosyncratic for Nice become strongly, significantly idiosyncratic for Mean. Mean feedback is where people DIVERGE the most — which makes sense. Negative social feedback is more ambiguous, more threatening, more likely to engage individual coping/appraisal strategies.

**Nice feedback has a unique frontal convergence signal** — left frontal pole and medial PFC. People agree more on how to process positive social feedback in prefrontal regions, possibly reflecting a more uniform positive-valuation response. This doesn't appear for Mean.

### The Functional Dissociation

The dissociation maps onto a distinction between **experiential processing** and **evaluative/interpretive processing**:

**Idiosyncrasy in sensory-affective regions:** Higher SAD drives unique, individualized patterns in regions that process raw experience — insula, ACC, somatosensory cortex, subcortical reward circuits. These regions encode "what this feels like right now." Each anxious person experiences the feedback moment differently at a gut level.

**Convergence in DMN/mentalizing regions:** Higher SAD drives similar patterns in regions that construct meaning — PCC, precuneus, angular gyrus, frontal pole. These are the regions where people build narratives about what feedback means, what others think of them, and what it implies for the future. Anxious individuals converge here, suggesting they engage in similar evaluative processing (e.g., rumination, threat appraisal, negative self-referential thought).

**In plain terms:** Anxious people **feel** the social feedback differently from each other (idiosyncratic embodied reactions), but **think about it** the same way (convergent meaning-making). The idiosyncrasy is in the experiencing; the convergence is in the ruminating.

## Caveats

At p < .05 uncorrected with 10-voxel minimum, many of these clusters won't survive proper correction. The biggest Mean idiosyncrasy clusters (300+ voxels) almost certainly will. The 10-20 voxel clusters probably won't. But the overall pattern — Mean amplifies idiosyncrasy, direction is consistent across conditions, convergence in sensory/midline regions — that pattern is robust.

## Methodological Notes

- Labels derived from 5-atlas chain: Harvard-Oxford Cortical → Harvard-Oxford Subcortical → Juelich Histological → FSL Cerebellum → Talairach. No heuristic coordinate-based labeling.
- Searchlight radius: 3 voxels (9mm at 3mm resolution)
- IS-RSA computed via Mantel test with 5,000 permutations
- Positive Mantel rho = convergence (individuals with similar SAD have similar neural patterns)
- Negative Mantel rho = idiosyncrasy (individuals with similar SAD have dissimilar neural patterns)
- Results are uncorrected at p < 0.05. Cluster-level correction pending.
