# IS-RSA Searchlight Results: Interpretation

**Date:** 2026-03-30
**Threshold:** p < 0.05 uncorrected, 6-connectivity, minimum 10 voxels
**Interactive viewer:** https://dzweben.github.io/isrsa-cluster-viewer/

## Overview

Whole-brain IS-RSA searchlight analysis reveals 131 significant clusters across both feedback conditions. The key finding is a **functional dissociation** between where social anxiety (SAD) drives idiosyncratic versus convergent neural representations of social feedback.

| Section | Clusters | Total Voxels |
|---|---|---|
| Mean Feedback: Idiosyncrasy | 36 | 1,630 |
| Mean Feedback: Convergence | 26 | 825 |
| Nice Feedback: Idiosyncrasy | 33 | 876 |
| Nice Feedback: Convergence | 36 | 1,003 |

Where a region is significant in one feedback condition, the other condition operates in the **same direction** (97.6% of voxels significant in both conditions agree on sign). The dissociation is not between feedback types — it is between idiosyncrasy and convergence.

## The Functional Split

### Idiosyncrasy Regions (negative rho: higher SAD → more unique patterns)

Idiosyncrasy is concentrated in regions that process **raw sensory, affective, and interoceptive experience**:

- **Insula / central operculum** — interoceptive awareness, visceral feeling
- **Anterior cingulate / paracingulate** — salience detection, affective conflict monitoring
- **Somatosensory cortex (SII, OP4)** — embodied social perception
- **Subcortical structures** — caudate, putamen (reward/learning circuits), brainstem
- **Lateral prefrontal cortex** — MFG, IFG (pars opercularis and triangularis)
- **Supramarginal gyrus (anterior division)** — somatosensory association
- **Fusiform / inferior temporal** — perceptual processing of social stimuli
- **Occipital cortex** — early visual processing

**Largest idiosyncrasy clusters:**

| Voxels | Peak rho | Region | Condition |
|---|---|---|---|
| 307 | -0.317 | Insula / white matter (L) | Mean FB |
| 182 | -0.290 | Central Opercular Cortex (R) | Mean FB |
| 148 | -0.337 | Supramarginal Gyrus, anterior (L) | Mean FB |
| 99 | -0.176 | Brainstem | Nice FB |
| 90 | -0.284 | Lateral Occipital Cortex, inferior (L) | Nice FB |

### Convergence Regions (positive rho: higher SAD → more similar patterns)

Convergence is concentrated in regions associated with **abstract meaning-making, mentalizing, and self-referential processing** — i.e., the default mode network (DMN):

- **Posterior cingulate cortex (PCC)** — self-referential processing, narrative integration
- **Precuneus** — self-reflection, episodic memory retrieval
- **Angular gyrus** — semantic integration, mentalizing
- **Frontal pole** — the single most prominent convergence region, with 4+ separate clusters across conditions — abstract evaluation, prospective thinking
- **Temporal pole / MTG** — social semantic knowledge, person knowledge
- **Supramarginal gyrus (posterior division)** — theory of mind
- **Motor / premotor cortex** — SMA, precentral gyrus (action representation)
- **Lateral occipital (superior)** — higher-order visual/spatial processing

**Largest convergence clusters:**

| Voxels | Peak rho | Region | Condition |
|---|---|---|---|
| 149 | +0.356 | Lateral occipital / white matter (R) | Mean FB |
| 106 | +0.253 | Frontal Pole (L) | Nice FB |
| 87 | +0.254 | Cerebellum (R) | Nice FB |
| 77 | +0.325 | Posterior Cingulate Cortex | Mean FB |
| 64 | +0.208 | Angular Gyrus (L) | Mean FB |

## Interpretation

The dissociation maps onto a distinction between **experiential processing** and **evaluative/interpretive processing** of social feedback:

**Idiosyncrasy in sensory-affective regions:** High-SAD individuals each have their own unique visceral, embodied reaction to social feedback. The insula, ACC, somatosensory cortex, and subcortical structures — regions that encode "what this feels like right now" — show divergent patterns. Each anxious person experiences the feedback moment differently at a gut level.

**Convergence in DMN/mentalizing regions:** High-SAD individuals arrive at similar abstract representations in regions that construct meaning — PCC, precuneus, angular gyrus, frontal pole. These are the regions where people build narratives about what feedback means, what others think of them, and what it implies for the future. Anxious individuals converge here, suggesting they engage in similar evaluative processing (e.g., rumination, threat appraisal, negative self-referential thought).

**In plain terms:** Anxious people **feel** the social feedback differently from each other (idiosyncratic embodied reactions), but **think about it** the same way (convergent meaning-making). The idiosyncrasy is in the experiencing; the convergence is in the ruminating.

## Methodological Notes

- Labels derived from 5-atlas chain: Harvard-Oxford Cortical → Harvard-Oxford Subcortical → Juelich Histological → FSL Cerebellum → Talairach. No heuristic coordinate-based labeling.
- Searchlight radius: 3 voxels (9mm at 3mm resolution)
- IS-RSA computed via Mantel test with 5,000 permutations
- Positive Mantel rho = convergence (individuals with similar SAD have similar neural patterns)
- Negative Mantel rho = idiosyncrasy (individuals with similar SAD have dissimilar neural patterns)
- Results are uncorrected at p < 0.05. Cluster-level correction pending.
