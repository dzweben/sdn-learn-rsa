# LEARN RSA Masterplan

Deep, code‑heavy blueprint for model‑RDM learning + idiosyncrasy analyses in the LEARN task (starting from **averaged** betas). This version is **pure Markdown** so it renders cleanly in VS Code preview.

---

## Quick Nav
1. Task Structure + Hypotheses
2. Data Reality + Beta Requirements
3. Model RDMs (Peer, Feedback, Peer×Feedback)
4. Analysis 1: Model‑RDM Alignment
5. Analysis 2: Idiosyncrasy (IS‑RSA)
6. Model Comparison + Improvement
7. Validation (Does It Work?)
8. Candidate ROIs
9. Reporting Tables
10. Repo Map + Next Steps

---

## 1) Task Structure + Hypotheses
- **LEARN task**: 4 peers, 4 runs, 128 trials total (4 peers × 8 interactions/run × 4 runs)
- **Peer structure**: Disposition (Nice/Mean) × Predictability (Pred/Unpred)

**Hypothesis H1 (Learning)**: Neural geometry aligns with true peer structure over time; social anxiety modulates slope.

**Hypothesis H2 (Idiosyncrasy)**: Higher social anxiety → more idiosyncratic feedback representations.

---

## 2) Data Reality + Beta Requirements
### You currently have
- **ROI betas averaged across 4 runs**
- **Per Peer × FeedbackValence**

### Feasibility matrix
| Analysis | Minimum Betas Needed | Feasible Now | Notes |
|---|---|---|---|
| Collapsed model‑RDM alignment | Subject × ROI × Peer | Yes | Across all runs combined |
| Idiosyncrasy (pos vs neg) | Subject × ROI × FeedbackValence | Yes | Use averaged feedback betas |
| Run‑wise learning slope | Subject × ROI × Run × Peer | No | Requires run‑wise betas |
| PE‑based/dynamic RSA | Trial‑level betas | No | Requires beta‑series |

---

## 3) Model RDMs (Peer, Feedback, Peer×Feedback)

### 3.1 Peer definitions
| Peer | Disposition | Predictability |
|---|---|---|
| P1 | Nice | Predictable |
| P2 | Nice | Unpredictable |
| P3 | Mean | Predictable |
| P4 | Mean | Unpredictable |

### 3.2 Conditions (Peer × FeedbackValence)
With your current data, conditions are **8 items**:
```
P1_pos, P1_neg, P2_pos, P2_neg, P3_pos, P3_neg, P4_pos, P4_neg
```

### 3.3 Model A — Feedback‑Type Similarity
All positive conditions are similar; all negative conditions are similar.

```python
import numpy as np

conditions = [
    "P1_pos", "P1_neg",
    "P2_pos", "P2_neg",
    "P3_pos", "P3_neg",
    "P4_pos", "P4_neg",
]

valence = np.array([1,0, 1,0, 1,0, 1,0])  # pos=1, neg=0
rdm_feedback = np.abs(valence[:, None] - valence[None, :])
```

**Readable matrix**
```python
import pandas as pd
pd.DataFrame(rdm_feedback, index=conditions, columns=conditions)
```

### 3.4 Model B — Peer‑Type Similarity
Same peer is similar regardless of feedback; different peers are dissimilar.

```python
peer_id = np.array([1,1, 2,2, 3,3, 4,4])
rdm_peer = (peer_id[:, None] != peer_id[None, :]).astype(int)
```

### 3.5 Model C — Peer×Feedback (Interaction / Identity)
Only identical peer+feedback pairs are maximally similar (strictest model).

```python
n = len(conditions)
rdm_peer_feedback = np.ones((n, n)) - np.eye(n)
```

### 3.6 Vectorization (Lower Triangle)
All RDMs are vectorized identically for RSA comparisons.

```python
tri = np.tril_indices(n, k=-1)
vec_feedback = rdm_feedback[tri]
vec_peer = rdm_peer[tri]
vec_peer_feedback = rdm_peer_feedback[tri]

print(len(vec_feedback))  # 28 unique comparisons for 8 conditions
```

### 3.7 Vectorization with Pair Labels (for interpretability)
```python
labels = []
for i in range(n):
    for j in range(i):
        labels.append((conditions[i], conditions[j]))

# Example: inspect the first 8 pairs
for pair, val in zip(labels[:8], vec_feedback[:8]):
    print(pair, val)
```

---

## 4) Analysis 1 — Model‑RDM Alignment (Learning)
### 4.1 Beta manifest (template)
```python
import pandas as pd

subjects = ["S001", "S002"]
rois = ["vmPFC", "dACC", "ant_ins", "post_ins", "vStriatum"]
peers = ["P1", "P2", "P3", "P4"]
valences = ["pos", "neg"]

rows = []
for s in subjects:
    for roi in rois:
        for peer in peers:
            for val in valences:
                rows.append({
                    "subject": s,
                    "roi": roi,
                    "peer": peer,
                    "valence": val,
                    "beta_path": f"/path/to/betas/{s}_{roi}_{peer}_{val}.nii.gz",
                })

beta_manifest = pd.DataFrame(rows)
```

### 4.2 ROI extraction (template)
```python
import nibabel as nib
from nilearn.masking import apply_mask

beta_img = nib.load("/path/to/beta.nii.gz")
roi_mask = nib.load("/path/to/roi_mask.nii.gz")
voxels = apply_mask(beta_img, roi_mask)
voxels[voxels == 0] = np.nan
```

### 4.3 Neural RDM
```python
# betas: peers x voxels (4 x n_vox)
# betas = np.array([...])

corr = np.corrcoef(betas)
neural_rdm = 1 - corr
```

### 4.4 Model fit (Spearman)
```python
from scipy.stats import spearmanr

tri = np.tril_indices(4, -1)
model_fit, _ = spearmanr(neural_rdm[tri], model_rdm[tri])
model_fit_z = np.arctanh(model_fit)
```

### 4.5 Mixed‑effects (future run‑wise)
```python
import statsmodels.formula.api as smf

# df: subject, run, roi, model_fit_z, SA, age, sex, motion
# m = smf.mixedlm("model_fit_z ~ run * SA", df, groups=df["subject"]).fit()
# print(m.summary())
```

```r
# lme4
# lmer(model_fit_z ~ run * SA + (1|subject), data=df)
```

---

## 5) Analysis 2 — Idiosyncrasy (IS‑RSA)
### 5.1 Build subject pattern matrices
```python
# patterns_pos: subjects x voxels
# patterns_neg: subjects x voxels
# Example shape:
# patterns_pos = np.random.randn(n_subjects, n_voxels)
# patterns_neg = np.random.randn(n_subjects, n_voxels)
```

### 5.2 Inter‑subject similarity + idiosyncrasy
```python
from scipy.spatial.distance import pdist, squareform

def idiosyncrasy(patterns):
    d = pdist(patterns, metric="correlation")
    sim = 1 - squareform(d)
    return 1 - sim.mean(axis=1)

idio_pos = idiosyncrasy(patterns_pos)
idio_neg = idiosyncrasy(patterns_neg)
```

### 5.3 Valence × SA model
```r
# df: subject, roi, valence, idio, SA
# lmer(idio ~ valence * SA + (1|subject), data=df)
```

---

## 6) Model Comparison + Improvement
### 6.1 Multiple model regression
```python
from sklearn.linear_model import LinearRegression

tri = np.tril_indices(4, -1)
Y = neural_rdm[tri]
X = np.vstack([
    rdm_disp[tri],
    rdm_pred[tri],
    model_rdm[tri],
]).T

reg = LinearRegression().fit(X, Y)
print(reg.coef_)
```

### 6.2 Partial correlation
```python
# from pingouin import partial_corr
# partial_corr(data=df, x="neural", y="combined", covar=["disp", "pred"])
```

---

## 7) Validation (Does It Work?)
### 7.1 RDM heatmaps
```python
import seaborn as sns
import matplotlib.pyplot as plt

sns.heatmap(neural_rdm, square=True, cmap="mako")
plt.title("Neural RDM")
plt.show()
```

### 7.2 Split‑half reliability
```python
# split1_rdm, split2_rdm
# reliability = spearmanr(split1_rdm[tri], split2_rdm[tri])[0]
```

### 7.3 Permutation test
```python
from scipy.stats import spearmanr

def perm_test(neural_rdm, model_rdm, n=1000):
    tri = np.tril_indices_from(neural_rdm, k=-1)
    obs = spearmanr(neural_rdm[tri], model_rdm[tri])[0]
    null = []
    for _ in range(n):
        perm = np.random.permutation(neural_rdm.shape[0])
        perm_rdm = neural_rdm[np.ix_(perm, perm)]
        null.append(spearmanr(perm_rdm[tri], model_rdm[tri])[0])
    p = (np.sum(np.array(null) >= obs) + 1) / (n + 1)
    return obs, p
```

---

## 8) Candidate ROIs
| Core (proposal) | Extended (social cognition) |
|---|---|
| vmPFC | mPFC |
| dACC | TPJ |
| Anterior Insula | Temporal Pole |
| Posterior Insula | Precuneus / PCC |
| Ventral Striatum | Amygdala (optional) |

---

## 9) Reporting Tables (Templates)
### Model‑RDM alignment
| ROI | Run | SA | Run × SA | Interpretation |
|---|---|---|---|---|
| vmPFC | + | ? | ? | Learning slope |

### Idiosyncrasy
| ROI | Valence | SA | Valence × SA | Interpretation |
|---|---|---|---|---|
| vmPFC | Pos/Neg | ? | ? | Idiosyncrasy effect |

---

## 10) Repo Map + Next Steps
### Repo sources used for logic
- `Project_Proposal.docx` → hypotheses, task description
- `Learn.pptx` → LEARN task structure
- `MS_figures_all_052325_jj[27].pptx` → trial timing
- `Clarkson_Defense_2.0.pptx` → measures, modeling context
- `ROI's Learn.docx` → candidate ROIs
- `Repo-Guidline.docx` → internal RSA roadmap
- `RSA_Dataframe_Construction_Example.Rmd` → R‑style RSA pipeline

### Next build pass
- When beta/ROI paths exist, replace template strings with real paths
- Generate a working manifest and run the pipeline end‑to‑end

