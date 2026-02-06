# Step 3 — Model‑RDM Suite (Learning) — Deep, Commented, LEARN‑Specific

This section gives **fully worked, commented code** that builds the exact model RDMs you need, in the exact structure implied by LEARN.

**Three required model families**
1. **Peer similarity** (4 peers only)
2. **Feedback similarity** (+ vs −)
3. **Peer × Feedback similarity** (idealized matrix for all 8 conditions)

---

## 0) Definitions and Conventions

**Peers** (canonical order):
- P1 = Nice, Predictable (Npred)
- P2 = Nice, Unpredictable (Nunpred)
- P3 = Mean, Predictable (Mpred)
- P4 = Mean, Unpredictable (Munpred)

**Feedback valence:**
- `pos` = nice feedback
- `neg` = mean feedback

**Peer × Feedback conditions** (8 total, fixed order):
```
P1_pos, P1_neg, P2_pos, P2_neg, P3_pos, P3_neg, P4_pos, P4_neg
```

---

## 1) Peer‑Level Model RDMs (4×4)

These models operate on **4 peer conditions only** (no feedback split).

### 1.1 Peer Disposition RDM (Nice vs Mean)
Peers cluster by **valence**.

```python
import numpy as np
from scipy.spatial.distance import pdist, squareform

# Nice=1, Mean=0
valence = np.array([1, 1, 0, 0]).reshape(-1, 1)

# Euclidean distance gives 0 if same valence, 1 if different
rdm_disp = squareform(pdist(valence, metric="euclidean"))
print(rdm_disp)
```

### 1.2 Peer Predictability RDM (Pred vs Unpred)
Peers cluster by **predictability**.

```python
# Pred=1, Unpred=0
pred = np.array([1, 0, 1, 0]).reshape(-1, 1)
rdm_pred = squareform(pdist(pred, metric="euclidean"))
print(rdm_pred)
```

### 1.3 Peer Combined RDM (Disposition + Predictability)
Captures both dimensions simultaneously.

```python
peer_features = np.array([
    [1,1],  # P1 Npred
    [1,0],  # P2 Nunpred
    [0,1],  # P3 Mpred
    [0,0],  # P4 Munpred
])

rdm_combo = squareform(pdist(peer_features, metric="euclidean"))
print(rdm_combo)
```

### 1.4 Negativity‑Weighted RDM
Explicitly encodes **negative‑bias**: mean peers more similar to each other than nice peers.

```python
# Hand‑built negativity‑weighted dissimilarity
rdm_neg = np.array([
    [0,   0.5, 1, 1],
    [0.5, 0,   1, 1],
    [1,   1,   0, 0],
    [1,   1,   0, 0],
])
print(rdm_neg)
```

---

## 2) Feedback‑Only Model RDM (8×8)

This model ignores peer identity and groups conditions only by **feedback valence**.

```python
import numpy as np

conditions = [
    "P1_pos", "P1_neg",
    "P2_pos", "P2_neg",
    "P3_pos", "P3_neg",
    "P4_pos", "P4_neg",
]

# 1=pos, 0=neg
valence = np.array([1,0, 1,0, 1,0, 1,0])

# 0 if same valence, 1 if different
rdm_feedback = np.abs(valence[:,None] - valence[None,:])

print(rdm_feedback)
```

---

## 3) Peer×Feedback Model RDM (8×8) — FULLY EXPLICIT

This is the complex model you asked for: **an idealized similarity matrix** where similarity depends on both
peer identity *and* feedback valence.

### 3.1 Building Blocks
We build the peer×feedback model as a **weighted sum of three components**:

1. **Peer similarity matrix** (same peer = 0, different peer = 1)
2. **Feedback similarity matrix** (same valence = 0, different = 1)
3. **Contextual similarity matrix** (valence × predictability × disposition relationships)

### 3.2 Step‑by‑Step Construction (commented)

```python
import numpy as np

# --- 1) Define condition labels and features ---
conditions = [
    "P1_pos", "P1_neg",
    "P2_pos", "P2_neg",
    "P3_pos", "P3_neg",
    "P4_pos", "P4_neg",
]

# Peer identity per condition
peer_id = np.array([1,1, 2,2, 3,3, 4,4])

# Feedback valence per condition
valence = np.array([1,0, 1,0, 1,0, 1,0])  # pos=1, neg=0

# Disposition and predictability per peer
# P1=Npred, P2=Nunpred, P3=Mpred, P4=Munpred
peer_disp = {1:1, 2:1, 3:0, 4:0}  # nice=1, mean=0
peer_pred = {1:1, 2:0, 3:1, 4:0}  # pred=1, unpred=0

# Expand to condition level
disp = np.array([peer_disp[i] for i in peer_id])
pred = np.array([peer_pred[i] for i in peer_id])

# --- 2) Build base matrices ---
# Peer similarity (0 same peer, 1 different peer)
rdm_peer = (peer_id[:,None] != peer_id[None,:]).astype(int)

# Feedback similarity (0 same valence, 1 different)
rdm_feedback = np.abs(valence[:,None] - valence[None,:])

# Disposition similarity (nice vs mean)
rdm_disp = np.abs(disp[:,None] - disp[None,:])

# Predictability similarity (pred vs unpred)
rdm_pred = np.abs(pred[:,None] - pred[None,:])

# --- 3) Combine into a full Peer×Feedback model ---
# Weighted sum (weights can be tuned or compared)
# Example weights: peer identity matters most; feedback matters second; context matters third
w_peer = 0.5
w_fb   = 0.3
w_ctx  = 0.2

rdm_peer_feedback = (w_peer * rdm_peer) + (w_fb * rdm_feedback) + (w_ctx * (rdm_disp + rdm_pred)/2)

print(rdm_peer_feedback)
```

### 3.3 Interpretation
- If **same peer**, dissimilarity is low (shared identity).
- If **same feedback valence**, dissimilarity is lower.
- If **same disposition/predictability**, dissimilarity is lower.
- The model can be tuned or compared in regression (RSA regression).

---

## 4) Vectorization (All Models)

Every RDM is vectorized using **lower triangle (k=-1)**.

```python
# 4×4 vectorization
tri4 = np.tril_indices(4, k=-1)
vec_disp = rdm_disp[tri4]
vec_pred = rdm_pred[tri4]
vec_combo = rdm_combo[tri4]
vec_neg = rdm_neg[tri4]

# 8×8 vectorization
tri8 = np.tril_indices(8, k=-1)
vec_feedback = rdm_feedback[tri8]
vec_peer_fb  = rdm_peer_feedback[tri8]
```

---

## 5) Model Regression (Comparing Multiple RDMs)

```python
from sklearn.linear_model import LinearRegression

# Example: regress neural RDM on multiple model RDMs
Y = neural_rdm[tri8]
X = np.vstack([
    rdm_feedback[tri8],
    rdm_peer[tri8],
    rdm_peer_feedback[tri8],
]).T

reg = LinearRegression().fit(X, Y)
print(reg.coef_)  # weights for each model
```

---

## 6) Summary Output of Step 3

- Fully specified **peer‑only models** (Disposition, Predictability, Combined, Negativity)
- Fully specified **feedback‑only model**
- Fully specified **peer×feedback model** with clear weighting logic
- Full vectorization + regression templates

Next: Step 4 builds the **Idiosyncrasy (IS‑RSA) suite** with validation and SA‑linked modeling.
