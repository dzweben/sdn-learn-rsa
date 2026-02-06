# Step 5 — End‑to‑End Pipeline (Ultra‑Deep Version)

This file provides a **complete, expandable pipeline** with QA, validation, plotting, run‑wise and trial‑wise hooks, and reporting. It is designed to be swapped to real paths later with minimal changes.

---

## 0) Global Config

```python
# =============================
# CONFIG
# =============================
DATA_DIR = "/path/to/betas"      # update later
ROI_DIR  = "/path/to/rois"       # update later
OUT_DIR  = "/path/to/output"     # update later

SUBJECTS = ["S001", "S002"]
ROIS     = ["vmPFC", "dACC", "ant_ins", "post_ins", "vStriatum"]
PEERS    = ["P1", "P2", "P3", "P4"]
VALENCE  = ["pos", "neg"]
RUNS     = [1,2,3,4]

BETA_FMT = "{subj}_{roi}_{peer}_{val}.nii.gz"          # averaged
RUN_FMT  = "{subj}_{roi}_run{run}_{peer}.nii.gz"       # run-wise
TRIAL_FMT= "{subj}_{roi}_run{run}_trial{trial}.nii.gz" # trial-wise
ROI_FMT  = "{roi}.nii.gz"
```

---

## 1) Manifest + QA

```python
import os, pandas as pd

def build_manifest_avg():
    rows=[]
    for subj in SUBJECTS:
        for roi in ROIS:
            for peer in PEERS:
                for val in VALENCE:
                    path = f"{DATA_DIR}/" + BETA_FMT.format(subj=subj, roi=roi, peer=peer, val=val)
                    rows.append({"subject":subj,"roi":roi,"peer":peer,"valence":val,"beta_path":path,"exists":os.path.exists(path)})
    return pd.DataFrame(rows)

manifest = build_manifest_avg()
missing = manifest[manifest["exists"]==False]
if len(missing)>0:
    print("Missing files:")
    print(missing.head())
```

---

## 2) ROI Extraction + QA

```python
import nibabel as nib
import numpy as np
from nilearn.masking import apply_mask

def extract_roi_vector(beta_path, roi_path):
    beta_img = nib.load(beta_path)
    roi_img = nib.load(roi_path)
    vec = apply_mask(beta_img, roi_img)
    vec[vec==0] = np.nan
    return vec

def roi_voxel_count(roi_path):
    data = nib.load(roi_path).get_fdata()
    return int((data>0).sum())

for roi in ROIS:
    print(roi, roi_voxel_count(f"{ROI_DIR}/"+ROI_FMT.format(roi=roi)))
```

---

## 3) Pattern Matrices

### 3.1 Peer‑level patterns (4×voxels)
```python

def build_peer_matrix(subj, roi):
    roi_path = f"{ROI_DIR}/" + ROI_FMT.format(roi=roi)
    patterns=[]
    for peer in PEERS:
        vecs=[]
        for val in VALENCE:
            beta_path = f"{DATA_DIR}/" + BETA_FMT.format(subj=subj, roi=roi, peer=peer, val=val)
            vecs.append(extract_roi_vector(beta_path, roi_path))
        patterns.append(np.nanmean(np.vstack(vecs), axis=0))
    return np.vstack(patterns)
```

### 3.2 Peer×Feedback patterns (8×voxels)
```python

def build_peer_feedback_matrix(subj, roi):
    roi_path = f"{ROI_DIR}/" + ROI_FMT.format(roi=roi)
    patterns=[]
    for peer in PEERS:
        for val in VALENCE:
            beta_path = f"{DATA_DIR}/" + BETA_FMT.format(subj=subj, roi=roi, peer=peer, val=val)
            patterns.append(extract_roi_vector(beta_path, roi_path))
    return np.vstack(patterns)
```

### 3.3 Run‑wise peer patterns (future)
```python
# run-wise peer patterns: 4 peers x voxels for each run

def build_peer_matrix_run(subj, roi, run):
    roi_path = f"{ROI_DIR}/" + ROI_FMT.format(roi=roi)
    patterns=[]
    for peer in PEERS:
        beta_path = f"{DATA_DIR}/" + RUN_FMT.format(subj=subj, roi=roi, run=run, peer=peer)
        patterns.append(extract_roi_vector(beta_path, roi_path))
    return np.vstack(patterns)
```

### 3.4 Trial‑wise patterns (future)
```python
# trial-wise beta series: trial x voxels

def build_trial_matrix(subj, roi, run, n_trials):
    roi_path = f"{ROI_DIR}/" + ROI_FMT.format(roi=roi)
    patterns=[]
    for t in range(1, n_trials+1):
        beta_path = f"{DATA_DIR}/" + TRIAL_FMT.format(subj=subj, roi=roi, run=run, trial=t)
        patterns.append(extract_roi_vector(beta_path, roi_path))
    return np.vstack(patterns)
```

---

## 4) Neural RDMs

```python
import numpy as np

def neural_rdm(patterns):
    corr = np.corrcoef(patterns)
    return 1 - corr
```

---

## 5) Model Fit

```python
from scipy.stats import spearmanr

def model_fit(neural_rdm, model_rdm):
    tri = np.tril_indices_from(neural_rdm, k=-1)
    r,_ = spearmanr(neural_rdm[tri], model_rdm[tri])
    return np.arctanh(r)
```

---

## 6) Batch Pipeline (Averaged Betas)

```python
results=[]
for subj in SUBJECTS:
    for roi in ROIS:
        peer_patterns = build_peer_matrix(subj, roi)
        rdm_peer = neural_rdm(peer_patterns)

        fit_disp = model_fit(rdm_peer, rdm_disp)
        fit_pred = model_fit(rdm_peer, rdm_pred)
        fit_combo = model_fit(rdm_peer, rdm_combo)

        pf_patterns = build_peer_feedback_matrix(subj, roi)
        rdm_pf = neural_rdm(pf_patterns)
        fit_fb = model_fit(rdm_pf, rdm_feedback)
        fit_peerfb = model_fit(rdm_pf, rdm_peer_feedback)

        results.append({
            "subject":subj,
            "roi":roi,
            "fit_disp":fit_disp,
            "fit_pred":fit_pred,
            "fit_combo":fit_combo,
            "fit_fb":fit_fb,
            "fit_peerfb":fit_peerfb,
        })

results_df = pd.DataFrame(results)
results_df.to_csv(f"{OUT_DIR}/rsa_model_fits.csv", index=False)
```

---

## 7) Run‑wise Pipeline (Future)

```python
run_results=[]
for subj in SUBJECTS:
    for roi in ROIS:
        for run in RUNS:
            peer_patterns = build_peer_matrix_run(subj, roi, run)
            rdm_peer = neural_rdm(peer_patterns)
            fit_combo = model_fit(rdm_peer, rdm_combo)
            run_results.append({"subject":subj,"roi":roi,"run":run,"fit_combo":fit_combo})

run_df = pd.DataFrame(run_results)
run_df.to_csv(f"{OUT_DIR}/rsa_model_fits_by_run.csv", index=False)
```

---

## 8) Trial‑wise Pipeline (Future)

```python
# Example: build trial-wise RDM and compare to PE-sign model
from scipy.stats import spearmanr

trial_results=[]
for subj in SUBJECTS:
    for roi in ROIS:
        for run in RUNS:
            trial_patterns = build_trial_matrix(subj, roi, run, n_trials=32)  # placeholder
            rdm_trial = neural_rdm(trial_patterns)
            # compare to trial-level model RDM (e.g., PE sign)
            # fit = model_fit(rdm_trial, model_pe_sign)
```

---

## 9) Validation + Diagnostics

### 9.1 Split‑half reliability
```python
# Example: odd/even trial splits
# r = spearmanr(rdm_odd[tri], rdm_even[tri])[0]
```

### 9.2 Permutation testing
```python
def perm_test(neural_rdm, model_rdm, n=1000):
    tri = np.tril_indices_from(neural_rdm, k=-1)
    obs = spearmanr(neural_rdm[tri], model_rdm[tri])[0]
    null=[]
    for _ in range(n):
        perm = np.random.permutation(neural_rdm.shape[0])
        perm_rdm = neural_rdm[np.ix_(perm, perm)]
        null.append(spearmanr(perm_rdm[tri], model_rdm[tri])[0])
    p = (np.sum(np.array(null) >= obs)+1)/(n+1)
    return obs, p
```

### 9.3 Noise ceiling
```python
# group_rdm = np.mean(subj_rdms, axis=0)
# ceiling = np.mean([spearmanr(rdm_s[tri], group_rdm[tri])[0] for rdm_s in subj_rdms])
```

---

## 10) Stats + Outputs

```python
import statsmodels.formula.api as smf
# df = results_df.merge(sa_table, on="subject")
# m = smf.mixedlm("fit_combo ~ SA", df, groups=df["subject"]).fit()
# print(m.summary())

summary = results_df.groupby("roi").mean()
summary.to_csv(f"{OUT_DIR}/rsa_summary_by_roi.csv")
```

---

## 11) Visualization (Optional)

```python
import seaborn as sns
import matplotlib.pyplot as plt

sns.heatmap(rdm_peer, square=True, cmap="mako")
plt.title("Peer RDM")
plt.show()
```

---

## 12) Output

- `rsa_model_fits.csv`
- `rsa_model_fits_by_run.csv` (future)
- validation logs
- ROI summaries

Next: Step 6 assembles everything into the final presentation.
