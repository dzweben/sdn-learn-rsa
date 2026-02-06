# Step 2 — LEARN Task Formalization + Data Schemas + Beta Requirements

This section formalizes the LEARN task into **exact condition schemas**, **data tables**, and **beta requirements**, so the RSA pipeline can be implemented without ambiguity.

---

## 1) Task Structure (Formal Definition)

**Entities**
- **Peers:** 4 (P1–P4)
- **Runs:** 4 (Run1–Run4)
- **Trials per peer per run:** 8
- **Total trials:** 4 peers × 4 runs × 8 = 128

**Peer structure**
- **Disposition:** Nice vs Mean
- **Predictability:** Predictable vs Unpredictable

**Trial epochs**
- **Prediction:** 4s (participant predicts nice vs mean)
- **Feedback:** 3s (peer provides feedback)
- **Response:** 4s (participant responds)

---

## 2) Condition Schema (Canonical Labels)

### 2.1 Peer labels and context
| Peer | Disposition | Predictability | Context label |
|---|---|---|---|
| P1 | Nice | Predictable | Npred |
| P2 | Nice | Unpredictable | Nunpred |
| P3 | Mean | Predictable | Mpred |
| P4 | Mean | Unpredictable | Munpred |

### 2.2 Trial outcome labels
| Prediction | Feedback | Accuracy | PE Type |
|---|---|---|---|
| Nice | Nice | Correct | No PE (positive feedback) |
| Mean | Mean | Correct | No PE (negative feedback) |
| Nice | Mean | Incorrect | Negative PE |
| Mean | Nice | Incorrect | Positive PE |

---

## 3) Data Schema (Long‑form Master Table)

This is the **canonical schema** for trial‑level data. It should be the backbone for all downstream RSA and modeling.

| subject | run | trial | peer | disp | pred | prediction | feedback | accuracy | pe_type | valence | rt | beta_path |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| S001 | 1 | 1 | P1 | Nice | Pred | Nice | Nice | 1 | none | pos | 1.2 | /path/... |

**Notes:**
- `valence` = actual feedback valence (pos/neg)
- `pe_type` = positive or negative PE if incorrect

---

## 4) Beta Requirements Matrix (Explicit)

| Analysis | Minimal Beta Level | Condition Count | Feasible with current betas? |
|---|---|---|---|
| Collapsed model‑RDM | Subject × ROI × Peer | 4 | Yes |
| Collapsed Peer×Feedback RDM | Subject × ROI × Peer×Valence | 8 | Yes |
| Run‑wise model‑RDM | Subject × ROI × Run × Peer | 16 (4 peers × 4 runs) | No |
| Run‑wise Peer×Feedback | Subject × ROI × Run × Peer×Valence | 32 | No |
| Trial‑wise RSA / PE models | Subject × ROI × Trial | 128 | No |

---

## 5) Data‑Ready Schemas (If only averaged betas)

### 5.1 Current betas: Peer × FeedbackValence
**One subject, one ROI:**

| condition | meaning |
|---|---|
| P1_pos | Peer1, positive feedback |
| P1_neg | Peer1, negative feedback |
| P2_pos | Peer2, positive feedback |
| P2_neg | Peer2, negative feedback |
| P3_pos | Peer3, positive feedback |
| P3_neg | Peer3, negative feedback |
| P4_pos | Peer4, positive feedback |
| P4_neg | Peer4, negative feedback |

### 5.2 Aggregation logic (for idiosyncrasy)
- Positive feedback representation = average of all positive feedback betas
- Negative feedback representation = average of all negative feedback betas

---

## 6) Beta Manifest Templates

### 6.1 Minimal (current data)
```csv
subject,roi,peer,valence,beta_path
S001,vmPFC,P1,pos,/path/S001_vmPFC_P1_pos.nii.gz
S001,vmPFC,P1,neg,/path/S001_vmPFC_P1_neg.nii.gz
...
```

### 6.2 Run‑wise (future data)
```csv
subject,roi,run,peer,beta_path
S001,vmPFC,1,P1,/path/S001_vmPFC_run1_P1.nii.gz
S001,vmPFC,1,P2,/path/S001_vmPFC_run1_P2.nii.gz
...
```

### 6.3 Trial‑wise (future beta series)
```csv
subject,roi,run,trial,peer,valence,pe_type,beta_path
S001,vmPFC,1,1,P1,pos,none,/path/S001_vmPFC_run1_trial1.nii.gz
...
```

---

## 7) Condition Maps → Model RDMs

### 7.1 Peer model (4 conditions)
```python
# P1..P4 peer model
peer_features = np.array([
    [1,1],  # Npred
    [1,0],  # Nunpred
    [0,1],  # Mpred
    [0,0],  # Munpred
])
```

### 7.2 Peer×Feedback model (8 conditions)
```python
conditions = ["P1_pos","P1_neg","P2_pos","P2_neg","P3_pos","P3_neg","P4_pos","P4_neg"]
valence = np.array([1,0,1,0,1,0,1,0])
peer_id = np.array([1,1,2,2,3,3,4,4])

rdm_feedback = np.abs(valence[:,None]-valence[None,:])
rdm_peer = (peer_id[:,None]!=peer_id[None,:]).astype(int)
```

---

## 8) Visual Diagrams (Conceptual)

### 8.1 Peer structure
```
Nice:     P1 (pred)   P2 (unpred)
Mean:     P3 (pred)   P4 (unpred)
```

### 8.2 Trial sequence
```
Prediction (4s) → Feedback (3s) → Response (4s)
```

---

## 9) Outputs of Step 2

- Task structure formalized into schemas
- Beta requirements explicitly mapped to analyses
- Ready‑to‑use CSV templates for manifests
- Condition labels locked for RSA model construction

Next: Step 3 builds model‑RDM suite and full vectorization logic.
