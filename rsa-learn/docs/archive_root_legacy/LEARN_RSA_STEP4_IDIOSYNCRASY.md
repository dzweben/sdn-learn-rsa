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
