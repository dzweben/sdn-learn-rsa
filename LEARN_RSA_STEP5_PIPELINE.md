# Step 5 — End‑to‑End Pipeline (Ultra‑Deep Version)

This file provides a **complete, expandable pipeline** with QA, validation, plotting, run‑wise and trial‑wise hooks, and reporting. It is designed to be swapped to real paths later with minimal changes.

---


## 0A) RSA‑learn Beta Generation (Run‑wise + Collapsed)

**Goal**: regenerate first‑level betas in a new output root, with **per‑run** peer×feedback betas plus **peer‑only** and **feedback‑only** betas, and then **collapsed‑across‑runs** versions of those same contrasts.

**RSA‑learn output root (new):**
`/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/RSA-learn`

**Current beta provenance (existing pipeline):**
1. Timing generator: `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/code/afni/LEARN_1D_AFNItiming_Full.sh`
2. GLM spec: `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/code/afni/LEARN_ap_Full_all.sh`
3. Per‑subject execution script: `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/derivatives/afni/IndvlLvlAnalyses/<SUBJ>/proc.<SUBJ>.LEARN_070422`
4. Output bucket: `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/derivatives/afni/IndvlLvlAnalyses/<SUBJ>/<SUBJ>.results.LEARN_070422/stats.<SUBJ>+tlrc.*`

**Inputs already present for GLM reruns (per subject):**
1. Preprocessed data per run: `pb02.<SUBJ>.r01.scale+tlrc` … `pb02.<SUBJ>.r04.scale+tlrc` in each `*.results.LEARN_070422` folder
2. Motion regressors: `motion_demean.1D`, `motion_deriv.1D`, `sub-<SUBJ>_task-learn_allruns_motion.1D`
3. Event files (BIDS): `sub-<SUBJ>_task-learn_run-0X_events.tsv` in `code/afni/TimingFiles/Full/sub-<SUBJ>/`
4. Existing parametric timing files (for reference): `Mean60_fdkm.1D`, `Mean60_fdkm_run1.txt`, etc.

**Run‑wise redesign: what changes**
1. Create **NonPM run‑wise timing files** (one file per run and condition) from `events.tsv`.
2. Expand 3dDeconvolve to include **run‑specific regressors** (one per condition per run).
3. Add GLTs for **peer‑only** and **feedback‑only** per run and across runs.
4. Save outputs to `RSA-learn/derivatives/afni/IndvlLvlAnalyses/` to keep pipelines separate.

**Example: NonPM run‑wise timing generation (Python)**
```python
import pandas as pd
from pathlib import Path

subj = "1055"
base = Path("/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/code/afni/TimingFiles/Full")
run = 1
cond = "Mean_60_fdkm"  # peer×feedback condition

events = base / f"sub-{subj}" / f"sub-{subj}_task-learn_run-0{run}_events.tsv"
df = pd.read_csv(events, sep="	")
rows = df[df["event"] == cond]
line = " ".join(f"{o:.3f}:{d:.3f}" for o, d in zip(rows["onset"], rows["duration"]))

out = base / f"sub-{subj}" / f"NonPM_{cond}_run{run}.1D"
out.write_text(line + "
")
```

**Example: run‑wise regressors in AFNI (concept)**
```tcsh
# FBM Mean60, run 1–4 (NonPM)
-stim_times_AM1 1 stimuli/offset_NonPM_Mean60_fdkm_run1.1D 'dmBLOCK(0)'
-stim_times_AM1 2 stimuli/offset_NonPM_Mean60_fdkm_run2.1D 'dmBLOCK(0)'
-stim_times_AM1 3 stimuli/offset_NonPM_Mean60_fdkm_run3.1D 'dmBLOCK(0)'
-stim_times_AM1 4 stimuli/offset_NonPM_Mean60_fdkm_run4.1D 'dmBLOCK(0)'
-stim_label 1 FBM.Mean60.r1
-stim_label 2 FBM.Mean60.r2
-stim_label 3 FBM.Mean60.r3
-stim_label 4 FBM.Mean60.r4
```

**Example: peer‑only GLT per run**
```tcsh
-gltsym 'SYM: +FBM.Mean60.r1 +FBM.Mean80.r1 +FBM.Nice60.r1 +FBM.Nice80.r1'
-glt_label 1 FBM.r1
```

**Example: feedback‑only GLT per run**
```tcsh
-gltsym 'SYM: +FBM.Nice60.r2 +FBN.Nice60.r2 +FBM.Nice80.r2 +FBN.Nice80.r2'
-glt_label 2 NICE.r2
```

**Deliverables to verify**
1. Per‑run betas: 8 peer×feedback × 4 runs
2. Per‑run peer‑only: 4 peers × 4 runs
3. Per‑run feedback‑only: 2 feedback types × 4 runs
4. Collapsed‑across‑runs: 8 peer×feedback + 4 peer‑only + 2 feedback‑only


**RSA‑learn scripts now created (paths on share):**

**Execution checklist (pilot subject + verification)**
1. **Generate RSA‑learn timing files** (run‑wise NonPM):
   - Script: `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/RSA-learn/scripts/LEARN_1D_AFNItiming_Full_RSA_runwise.sh`
   - Expect: `RSA-learn/TimingFiles/Full/sub-<ID>/NonPM_*_runX.1D`
2. **Generate afni_proc scripts** (no execution yet):
   - Script: `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/RSA-learn/scripts/LEARN_ap_Full_RSA_runwise.sh`
   - Expect: `RSA-learn/derivatives/afni/IndvlLvlAnalyses/<ID>/proc.<ID>.LEARN_RSA_runwise`
3. **Pilot run 1 subject** (server):
   - Wrapper: `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/RSA-learn/scripts/LEARN_RunAFNIProc_RSA_runwise.sh`
   - Edit subject list to a single ID for timing + execution.
4. **Verify outputs** (after pilot finishes):
   - Check stats bucket exists:
     - `stats.<ID>+tlrc.HEAD` and `stats.<ID>+tlrc.BRIK.gz`
   - Check run‑wise labels:
     - `3dinfo -label stats.<ID>+tlrc.HEAD | tr '~' '
' | grep -E 'FBM.Mean60.r1|FBN.Mean60.r1|FBM.Nice80.r4'`
   - Check GLT labels:
     - `3dinfo -label stats.<ID>+tlrc.HEAD | tr '~' '
' | grep -E 'Mean60.r1|FBM.r1|FBM.Mean60.all|FBM.all'`


- `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/RSA-learn/scripts/LEARN_1D_AFNItiming_Full_RSA_runwise.sh`
- `/Users/dannyzweben/Desktop/SDN/Y1_project/fmri-data/LEARN_share/RSA-learn/scripts/LEARN_ap_Full_RSA_runwise.sh`

These match the existing LEARN pipeline style and are built to be run on the Linux server (not locally).

**Recommended directory layout**
```text
RSA-learn/
  scripts/
  derivatives/afni/IndvlLvlAnalyses/
  logs/
  notes/
```

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
