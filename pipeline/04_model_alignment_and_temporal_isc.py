#!/usr/bin/env python3
"""
04 · Model Alignment RSA  +  Temporal ISC   (FINDINGS #1 and #2)
================================================================
Reads the canonical feedback betas ($GLM_LABEL) over the 36 a priori social-brain
ROIs (Alcalá-López et al. 2018): 30 cortical 10 mm spheres + 6 Harvard-Oxford
subcortical (HC/AM/NAcc bilateral).

  FINDING #1 — Model Alignment RSA:
     per subject×run, 4-peer neural RDM vs the peer-identity model RDM (Fisher-z),
     OLS  z_rsa ~ run + SA + run×SA.  SA main effect = SA-only shuffle;
     SA × Run interaction = JOINT shuffle (run randomized in the null). BH-FDR / 36 ROIs.
     -> rACC SA×Run interaction is the settled headline.

  FINDING #2 — Temporal ISC:
     leave-one-out temporal ISC per subject×ROI; Spearman vs SA (idiosyncrasy).
     -> rACC / aMCC negative (drift from group rises with SA).

Produces exactly these two findings. The exploratory spatial pattern IS-RSA that
once shared this script now lives in archive/ and is not computed here.

  Paths & label come from pipeline/config.sh (env: GLMDIR, RESULTS, GROUP_MASK,
  CLINICAL, GLM_LABEL). Outputs: $RESULTS/al18_hybrid_{learning_rsa,temporal_isc}.json

Run (after sourcing config):  python3 pipeline/04_model_alignment_and_temporal_isc.py
"""
import os, sys, json, time, argparse, warnings
from datetime import datetime
import numpy as np
from scipy import stats as sp_stats
from scipy.interpolate import interp1d
import nibabel as nib
warnings.filterwarnings("ignore")

TOPDIR = "/data/projects/STUDIES/LEARN/fMRI"
RSA_DIR = f"{TOPDIR}/RSA-learn"
RESULTS_DIR = os.environ.get("GLMDIR",     f"{RSA_DIR}/derivatives/afni/IndvlLvlAnalyses")
MASK_PATH   = os.environ.get("GROUP_MASK", f"{TOPDIR}/Masks/LEARN_Grp90+tlrc.HEAD")
CLINICAL_CSV= os.environ.get("CLINICAL",   f"{RSA_DIR}/analysis/learn_clinical.csv")
OUT_DIR     = os.environ.get("RESULTS",    f"{RSA_DIR}/derivatives/afni/results")
TIMING_DIR  = os.environ.get("TIMING",     f"{RSA_DIR}/timing")
HO_PATH     = "/usr/local/fsl/data/atlases/HarvardOxford/HarvardOxford-sub-maxprob-thr25-2mm.nii.gz"

# canonical GLM label: run-wise, valence-split feedback betas on the corrected timing
GLM_LABEL = os.environ.get("GLM_LABEL", "feedback_runwise_glm")
MEASURE   = "scared_ch_social"
N_PERM    = 10_000
SEED      = 42
MIN_RUNS  = 3
MIN_VOXELS= 5
SPHERE_RADIUS_MM = 10
TR = 1.75
N_TRS = 217

PEERS  = ["Nice80", "Nice60", "Mean60", "Mean80"]
N_PEERS = 4
N_RUNS  = 4
P_NICE = {"Nice80": 0.80, "Nice60": 0.60, "Mean60": 0.40, "Mean80": 0.20}
MODEL_RDM = np.array([[abs(P_NICE[a]-P_NICE[b])/0.60 for b in PEERS] for a in PEERS])
MODEL_UTRI = MODEL_RDM[np.triu_indices(N_PEERS, k=1)]
MODEL_UTRI_RANKED = sp_stats.rankdata(MODEL_UTRI)

# Harvard-Oxford label IDs at the 25% threshold sub-maxprob atlas
HO_LABELS = {
    "HC_L":  9,   "HC_R":  19,
    "AM_L":  10,  "AM_R":  20,
    "NAC_L": 11,  "NAC_R": 21,
}

# 36 AL18 ROIs: tag -> {name, mni, type}
AL18_ROIS = [
    # Cortical (30) — 10 mm spheres at AL18 peaks
    ("IFG_R",   "R inferior frontal gyrus",  (48, 24, 2),    "sphere"),
    ("IFG_L",   "L inferior frontal gyrus",  (-45, 27, -3),  "sphere"),
    ("rACC",    "Rostral ACC",               (-3, 41, 4),    "sphere"),
    ("vmPFC",   "vmPFC",                     (2, 45, -15),   "sphere"),
    ("MTG_R",   "R middle temporal gyrus",   (56, -10, -17), "sphere"),
    ("MTG_L",   "L middle temporal gyrus",   (-56, -14, -13),"sphere"),
    ("Prec",    "Precuneus",                 (-1, -59, 41),  "sphere"),
    ("TPJ_R",   "R TPJ",                     (54, -55, 20),  "sphere"),
    ("TPJ_L",   "L TPJ",                     (-49, -61, 27), "sphere"),
    ("TP_R",    "R temporal pole",           (53, 7, -26),   "sphere"),
    ("TP_L",    "L temporal pole",           (-48, 8, -36),  "sphere"),
    ("FP",      "Medial frontal pole",       (1, 58, 10),    "sphere"),
    ("PCC",     "PCC",                       (-1, -54, 23),  "sphere"),
    ("dmPFC",   "dmPFC",                     (-4, 53, 31),   "sphere"),
    ("MT_V5_R", "R MT/V5",                   (50, -66, 6),   "sphere"),
    ("MT_V5_L", "L MT/V5",                   (-50, -66, 5),  "sphere"),
    ("FG_R",    "R fusiform gyrus",          (43, -57, -19), "sphere"),
    ("FG_L",    "L fusiform gyrus",          (-42, -62, -16),"sphere"),
    ("pSTS_R",  "R pSTS",                    (54, -39, 0),   "sphere"),
    ("pSTS_L",  "L pSTS",                    (-56, -39, 2),  "sphere"),
    ("SMA_R",   "R SMA",                     (48, 6, 35),    "sphere"),
    ("SMA_L",   "L SMA",                     (-41, 6, 45),   "sphere"),
    ("AI_R",    "R anterior insula",         (38, 18, -3),   "sphere"),
    ("AI_L",    "L anterior insula",         (-34, 19, 0),   "sphere"),
    ("SMG_R",   "R supramarginal gyrus",     (54, -30, 38),  "sphere"),
    ("SMG_L",   "L supramarginal gyrus",     (-41, -41, 42), "sphere"),
    ("Cereb_R", "R cerebellum",              (28, -70, -30), "sphere"),
    ("Cereb_L", "L cerebellum",              (-21, -66, -35),"sphere"),
    ("aMCC",    "Anterior MCC",              (1, 25, 30),    "sphere"),
    ("pMCC",    "Posterior MCC",             (-3, -29, 32),  "sphere"),
    # Subcortical (6) — Harvard-Oxford 25% max-prob structural masks
    ("HC_R",    "R hippocampus",             (25, -19, -15), "ho"),
    ("HC_L",    "L hippocampus",             (-24, -18, -17),"ho"),
    ("AM_R",    "R amygdala",                (23, -3, -18),  "ho"),
    ("AM_L",    "L amygdala",                (-21, -4, -18), "ho"),
    ("NAC_R",   "R nucleus accumbens",       (11, 10, -7),   "ho"),
    ("NAC_L",   "L nucleus accumbens",       (-13, 11, -8),  "ho"),
]

# ──────────────────────────────────────────────────────────────────────
def parse_subbrick_labels(head_path):
    img = nib.load(head_path)
    labs = img.header.info.get("BRICK_LABS", "").split("~")
    return {l: i for i, l in enumerate(labs) if l}

def load_clinical(csv_path, subject_ids):
    import pandas as pd
    df = pd.read_csv(csv_path)
    df["s"] = df["s"].astype(str)
    df = df[df["Usable_fMRI"] == 1].copy()
    df = df[df["s"].isin([str(s) for s in subject_ids])].copy()
    df = df.sort_values("s", key=lambda x: x.astype(int)).reset_index(drop=True)
    sa = pd.to_numeric(df[MEASURE], errors="coerce").values.astype(np.float64)
    return df, sa

def fisher_z(r): return np.arctanh(np.clip(r, -0.9999, 0.9999))

def fdr_bh(pvals):
    pvals = np.array(pvals, dtype=float); n = len(pvals)
    if n == 0: return np.array([])
    order = np.argsort(pvals); q = np.zeros(n)
    for i, ix in enumerate(order): q[ix] = pvals[ix] * n / (i+1)
    for i in range(n-2, -1, -1):
        ix = order[i]; ix_n = order[i+1]; q[ix] = min(q[ix], q[ix_n])
    return np.minimum(q, 1.0)

# ── ROI mask construction ──────────────────────────────────────────────
def build_roi_masks(mask_img, ho_img):
    """Returns dict tag → bool 3D mask on the LEARN grid."""
    affine = mask_img.affine
    mask_3d = np.asanyarray(mask_img.dataobj)
    if mask_3d.ndim == 4: mask_3d = mask_3d[..., 0]
    brain = (mask_3d > 0)
    nx, ny, nz = brain.shape

    # Voxel sizes
    voxel_sizes = np.sqrt(np.sum(affine[:3, :3]**2, axis=0))

    # HO data resampled to LEARN grid (nearest-neighbor)
    from nilearn import image as nl_image
    ho_resampled = nl_image.resample_to_img(ho_img, mask_img, interpolation="nearest")
    ho_data = np.asanyarray(ho_resampled.dataobj).astype(int)
    if ho_data.ndim == 4: ho_data = ho_data[..., 0]

    affine_inv = np.linalg.inv(affine)

    masks = {}
    print("\nBuilding 36 AL18 hybrid ROI masks...")
    for tag, name, mni, mtype in AL18_ROIS:
        if mtype == "sphere":
            coord = np.array([mni[0], mni[1], mni[2], 1.0])
            ci, cj, ck = np.round(affine_inv @ coord).astype(int)[:3]
            ii, jj, kk = np.ogrid[:nx, :ny, :nz]
            dist_sq = ((ii-ci)*voxel_sizes[0])**2 + ((jj-cj)*voxel_sizes[1])**2 + ((kk-ck)*voxel_sizes[2])**2
            sphere = dist_sq <= SPHERE_RADIUS_MM**2
            m = sphere & brain
        else:  # "ho"
            label_id = HO_LABELS[tag]
            m = (ho_data == label_id) & brain
        n = int(m.sum())
        masks[tag] = {"name": name, "mni": list(mni), "type": mtype, "mask": m, "n_voxels": n}
        marker = " (HO)" if mtype == "ho" else ""
        print(f"  {tag:8s}  {name:30s}  type={mtype:6s}  n_vox={n:4d}{marker}")
    return masks

# ── Subject-level data loading ─────────────────────────────────────────
def get_runwise_glt_indices(label_map):
    out = {}
    for peer in PEERS:
        for run in range(1, N_RUNS+1):
            out[(peer, run)] = label_map.get(f"{peer}.r{run}_GLT#0_Coef")
    return out

def get_per_condition_indices(label_map):
    out = {}
    for fb in ("FBM","FBN"):
        for peer in PEERS:
            for run in range(1, N_RUNS+1):
                out[(fb, peer, run)] = label_map.get(f"{fb}.{peer}.r{run}#0_Coef")
    return out

def load_subject_runwise(sid):
    head = os.path.join(RESULTS_DIR, str(sid), f"{sid}.results.{GLM_LABEL}", f"stats.{sid}+tlrc.HEAD")
    if not os.path.isfile(head): return None, []
    label_map = parse_subbrick_labels(head)
    glt = get_runwise_glt_indices(label_map)
    usable = [r for r in range(1, N_RUNS+1) if all(glt[(p, r)] is not None for p in PEERS)]
    if len(usable) < MIN_RUNS: return None, []
    full = np.asanyarray(nib.load(head).dataobj, dtype=np.float32)
    nx, ny, nz = full.shape[:3]
    data = {}
    for run in range(1, N_RUNS+1):
        if run not in usable: data[run] = None; continue
        peer_vols = np.full((N_PEERS, nx, ny, nz), np.nan, dtype=np.float32)
        for pi, peer in enumerate(PEERS):
            peer_vols[pi] = full[:, :, :, glt[(peer, run)]]
        data[run] = peer_vols
    return data, usable

def load_subject_condition_means(sid):
    head = os.path.join(RESULTS_DIR, str(sid), f"{sid}.results.{GLM_LABEL}", f"stats.{sid}+tlrc.HEAD")
    if not os.path.isfile(head): return None, None
    label_map = parse_subbrick_labels(head)
    cond = get_per_condition_indices(label_map)
    full = np.asanyarray(nib.load(head).dataobj, dtype=np.float32)
    nice_stack, mean_stack = [], []
    for fb, peer, run in cond:
        idx = cond[(fb, peer, run)]
        if idx is None: continue
        if fb == "FBN": nice_stack.append(full[:, :, :, idx])
        elif fb == "FBM": mean_stack.append(full[:, :, :, idx])
    if not nice_stack or not mean_stack: return None, None
    return np.mean(np.stack(nice_stack), axis=0), np.mean(np.stack(mean_stack), axis=0)

def load_subject_run_pb04(sid, run):
    head = os.path.join(RESULTS_DIR, str(sid), f"{sid}.results.{GLM_LABEL}", f"pb04.{sid}.r{run:02d}.scale+tlrc.HEAD")
    if not os.path.isfile(head): return None
    data = np.asanyarray(nib.load(head).dataobj, dtype=np.float32)
    if data.ndim == 4 and data.shape[3] >= N_TRS:
        return data[:, :, :, :N_TRS]
    return None

def load_feedback_onsets(sid, run):
    import glob as _glob
    subj_timing = os.path.join(TIMING_DIR, f"sub-{sid}")
    if not os.path.isdir(subj_timing): return []
    onsets = []
    for f in _glob.glob(os.path.join(subj_timing, f"NonPM_*_fdk*_run{run}.1D")):
        with open(f) as fh: lines = fh.readlines()
        if run <= len(lines):
            line = lines[run-1].strip()
            if line and line != '*':
                for entry in line.split():
                    try: onsets.append(float(entry.split(':')[0]))
                    except ValueError: pass
    return sorted(onsets)

def temporal_warp(ts, subj_ons, ref_ons, n_trs, tr):
    subj_times = [0.0] + list(subj_ons) + [n_trs * tr]
    ref_times  = [0.0] + list(ref_ons)  + [n_trs * tr]
    ref_to_subj = interp1d(ref_times, subj_times, kind='linear', bounds_error=False,
                           fill_value=(subj_times[0], subj_times[-1]))
    subj_tr = np.arange(n_trs) * tr
    ref_tr  = np.arange(n_trs) * tr
    mapped = ref_to_subj(ref_tr)
    ts_int = interp1d(subj_tr, ts, kind='linear', bounds_error=False, fill_value=(ts[0], ts[-1]))
    return ts_int(mapped)

# ── Stats helpers ──────────────────────────────────────────────────────
def neural_rdm_rho(peer_patterns):
    r = np.corrcoef(peer_patterns)
    if np.any(np.isnan(r)): return np.nan
    utri = (1.0 - r)[np.triu_indices(N_PEERS, k=1)]
    nr = sp_stats.rankdata(utri); ns = nr - nr.mean()
    ms = MODEL_UTRI_RANKED - MODEL_UTRI_RANKED.mean()
    denom = np.sqrt(np.sum(ns**2) * np.sum(ms**2))
    if denom == 0: return np.nan
    return float(np.sum(ns * ms) / denom)

def fit_ols(z, run_v, sa_v):
    run_c = run_v - run_v.mean(); sa_c = sa_v - sa_v.mean()
    X = np.column_stack([np.ones(len(z)), run_c, sa_c, run_c*sa_c])
    n, p = X.shape
    if n <= p: return None
    try: XtX_inv = np.linalg.inv(X.T @ X)
    except np.linalg.LinAlgError: return None
    b = XtX_inv @ X.T @ z; res = z - X @ b
    mse = float(np.sum(res**2)/(n-p))
    if mse <= 0: return None
    se = np.sqrt(np.diag(XtX_inv) * mse); se[se==0] = np.nan
    t = b / se
    return {"b_run":float(b[1]),"b_SA":float(b[2]),"b_interaction":float(b[3]),
            "t_run":float(t[1]),"t_SA":float(t[2]),"t_interaction":float(t[3])}

def perm_test(z, run_v, sa_v, subj_v, n_perm, seed, coef_index):
    """SA-only permutation: shuffle SA between subjects. Used for the SA MAIN EFFECT.
    Valid because the SA main effect is a between-subject contrast — it depends only on
    the SA-to-subject mapping, not on within-subject run structure.
    """
    run_c = run_v - run_v.mean(); sa_c = sa_v - sa_v.mean()
    X = np.column_stack([np.ones(len(z)), run_c, sa_c, run_c*sa_c])
    n, p = X.shape
    try: XtX_inv = np.linalg.inv(X.T @ X)
    except np.linalg.LinAlgError: return np.nan
    b = XtX_inv @ X.T @ z; res = z - X @ b; mse = np.sum(res**2)/(n-p)
    if mse <= 0: return np.nan
    se = np.sqrt(np.diag(XtX_inv) * mse)
    if se[coef_index] == 0: return np.nan
    t_obs = b[coef_index] / se[coef_index]
    unique = np.unique(subj_v); subj_sa = {s: sa_v[subj_v==s][0] for s in unique}
    sa_arr = np.array([subj_sa[s] for s in unique])
    rng = np.random.RandomState(seed); n_extreme = 0
    for _ in range(n_perm):
        perm_sa = sa_arr[rng.permutation(len(sa_arr))]
        pmap = {s: perm_sa[i] for i, s in enumerate(unique)}
        sa_p = np.array([pmap[s] for s in subj_v]); sa_p_c = sa_p - sa_p.mean()
        Xp = np.column_stack([np.ones(n), run_c, sa_p_c, run_c*sa_p_c])
        try: Xpi = np.linalg.inv(Xp.T @ Xp)
        except np.linalg.LinAlgError: continue
        bp = Xpi @ Xp.T @ z; rp = z - Xp @ bp; msp = np.sum(rp**2)/(n-p)
        if msp <= 0: continue
        sep = np.sqrt(np.diag(Xpi) * msp)
        if sep[coef_index] == 0: continue
        t_perm = bp[coef_index] / sep[coef_index]
        if abs(t_perm) >= abs(t_obs): n_extreme += 1
    return (n_extreme + 1) / (n_perm + 1)

def perm_test_joint(z, run_v, sa_v, subj_v, n_perm, seed, coef_index):
    """Joint permutation: shuffle SA between subjects AND scramble each subject's z
    values across their 4 runs. Used for the SA × RUN INTERACTION.
    The interaction t depends on structure in BOTH dimensions (subjects' SA labels
    AND within-subject run trajectories). A complete null requires randomizing both.
    """
    run_c = run_v - run_v.mean(); sa_c = sa_v - sa_v.mean()
    X = np.column_stack([np.ones(len(z)), run_c, sa_c, run_c*sa_c])
    n, p = X.shape
    try: XtX_inv = np.linalg.inv(X.T @ X)
    except np.linalg.LinAlgError: return np.nan
    b = XtX_inv @ X.T @ z; res = z - X @ b; mse = np.sum(res**2)/(n-p)
    if mse <= 0: return np.nan
    se = np.sqrt(np.diag(XtX_inv) * mse)
    if se[coef_index] == 0: return np.nan
    t_obs = b[coef_index] / se[coef_index]
    unique = np.unique(subj_v)
    subj_sa = {s: sa_v[subj_v==s][0] for s in unique}
    sa_arr = np.array([subj_sa[s] for s in unique])
    # Precompute per-subject row indices for fast within-subject shuffling
    subj_idx = {s: np.where(subj_v == s)[0] for s in unique}
    rng = np.random.RandomState(seed); n_extreme = 0
    for _ in range(n_perm):
        # Step 1: shuffle SA labels between subjects
        perm_sa = sa_arr[rng.permutation(len(sa_arr))]
        pmap = {s: perm_sa[i] for i, s in enumerate(unique)}
        sa_p = np.array([pmap[s] for s in subj_v]); sa_p_c = sa_p - sa_p.mean()
        # Step 2: within each subject, scramble z values across runs
        z_perm = z.copy()
        for s in unique:
            idx = subj_idx[s]
            z_perm[idx] = z_perm[idx][rng.permutation(len(idx))]
        Xp = np.column_stack([np.ones(n), run_c, sa_p_c, run_c*sa_p_c])
        try: Xpi = np.linalg.inv(Xp.T @ Xp)
        except np.linalg.LinAlgError: continue
        bp = Xpi @ Xp.T @ z_perm; rp = z_perm - Xp @ bp; msp = np.sum(rp**2)/(n-p)
        if msp <= 0: continue
        sep = np.sqrt(np.diag(Xpi) * msp)
        if sep[coef_index] == 0: continue
        t_perm = bp[coef_index] / sep[coef_index]
        if abs(t_perm) >= abs(t_obs): n_extreme += 1
    return (n_extreme + 1) / (n_perm + 1)

# ── Three analyses ─────────────────────────────────────────────────────
def run_model_alignment(masks, runwise, usable_runs, sa_by, n_perm, seed):
    subjects = sorted(runwise.keys(), key=int)
    results = []
    for ri, (tag, info, _, _) in enumerate(AL18_ROIS):
        m = masks[tag]
        if m["n_voxels"] < MIN_VOXELS: continue
        coords = np.argwhere(m["mask"])
        z_vals=[]; run_vals=[]; sa_vals=[]; subj_vals=[]
        rho_run = {r: [] for r in range(1, N_RUNS+1)}
        for sid in subjects:
            for run in usable_runs[sid]:
                rd = runwise[sid].get(run)
                if rd is None: continue
                pat = rd[:, coords[:,0], coords[:,1], coords[:,2]]
                if np.any(np.isnan(pat)): continue
                rho = neural_rdm_rho(pat)
                if np.isnan(rho): continue
                z_vals.append(fisher_z(rho)); run_vals.append(run)
                sa_vals.append(sa_by[sid]); subj_vals.append(sid)
                rho_run[run].append(rho)
        if len(z_vals) < 20: continue
        z = np.array(z_vals); rv = np.array(run_vals,dtype=float)
        sv = np.array(sa_vals,dtype=float); subj_arr = np.array(subj_vals)
        fit = fit_ols(z, rv, sv)
        if fit is None: continue
        # SA × Run interaction: joint shuffle (SA between subjects + runs within subjects)
        p_int = perm_test_joint(z, rv, sv, subj_arr, n_perm, seed+ri, 3)
        # SA main effect: SA-only shuffle (between-subject only — within-subject run order doesn't enter)
        p_sa  = perm_test(z, rv, sv, subj_arr, n_perm, seed+ri+5000, 2)
        results.append({
            "tag": tag, "name": info, "mni": list(masks[tag]["mni"]) if "mni" in masks[tag] else None,
            "roi_type": masks[tag]["type"], "n_voxels": int(m["n_voxels"]), "n_obs": len(z_vals),
            "b_run": fit["b_run"], "b_SA": fit["b_SA"], "b_interaction": fit["b_interaction"],
            "t_SA": fit["t_SA"], "t_interaction": fit["t_interaction"],
            "p_SA_perm": float(p_sa) if not np.isnan(p_sa) else None,
            "p_interaction_perm": float(p_int) if not np.isnan(p_int) else None,
            "rho_run1": float(np.mean(rho_run[1])) if rho_run[1] else None,
            "rho_run2": float(np.mean(rho_run[2])) if rho_run[2] else None,
            "rho_run3": float(np.mean(rho_run[3])) if rho_run[3] else None,
            "rho_run4": float(np.mean(rho_run[4])) if rho_run[4] else None,
        })
    p_int = np.array([r.get("p_interaction_perm") or 1.0 for r in results])
    p_sa  = np.array([r.get("p_SA_perm")          or 1.0 for r in results])
    q_int = fdr_bh(p_int); q_sa = fdr_bh(p_sa)
    for i, r in enumerate(results):
        r["q_interaction_fdr"] = float(q_int[i]); r["q_SA_fdr"] = float(q_sa[i])
    return results

def _loo_isc(all_ts):
    """Leave-one-out ISC (Fisher-z) per subject, matching the original producer."""
    n_subj = all_ts.shape[0]
    isc = np.full(n_subj, np.nan)
    all_sum = np.sum(all_ts, axis=0)
    for i in range(n_subj):
        others = (all_sum - all_ts[i]) / (n_subj - 1)
        if np.std(all_ts[i]) == 0 or np.std(others) == 0:
            continue
        r = np.clip(np.corrcoef(all_ts[i], others)[0, 1], -0.999, 0.999)
        isc[i] = np.arctanh(r)
    return isc

def run_temporal_isc(masks, sa_by):
    # Faithful port of analysis/isc_warped_36_hybrid.py:
    #   per run: warp each subject's full ROI timeseries to group-median onsets,
    #   z-score, LOO ISC -> per-run ISC; then AVERAGE the per-run ISC across runs.
    #   (NOT concatenated.)  Spearman(mean ISC, SA); BH-FDR across ROIs.
    subjects = sorted(sa_by.keys(), key=int)
    roi_tags = [tag for tag, _, _, _ in AL18_ROIS if masks[tag]["n_voxels"] >= MIN_VOXELS]
    print(f"  Step 1/3: per-run ROI-mean timeseries + onsets for {len(subjects)} subjects...")
    all_ts = {tag: {} for tag in roi_tags}      # tag -> sid -> run -> mean_ts
    all_onsets = {}                              # sid -> run -> onsets
    loaded_subjects = []
    for si, sid in enumerate(subjects):
        runs_loaded = 0; subj_ons = {}
        for run in range(1, N_RUNS + 1):
            ts4d = load_subject_run_pb04(sid, run)
            if ts4d is None: continue
            onsets = load_feedback_onsets(sid, run)
            if not onsets: continue
            for tag in roi_tags:
                coords = np.argwhere(masks[tag]["mask"])
                v = ts4d[coords[:, 0], coords[:, 1], coords[:, 2], :]
                all_ts[tag].setdefault(sid, {})[run] = np.nanmean(v, axis=0)
            subj_ons[run] = onsets; runs_loaded += 1
        if runs_loaded >= 2:
            loaded_subjects.append(sid); all_onsets[sid] = subj_ons
        if (si + 1) % 5 == 0: print(f"    Loaded {si+1}/{len(subjects)}")
    print(f"    Final N = {len(loaded_subjects)}")

    print("  Step 2/3: common runs + median reference onsets per run...")
    common_runs = None
    for sid in loaded_subjects:
        r = set(all_onsets[sid].keys())
        common_runs = r if common_runs is None else common_runs & r
    common_runs = sorted(common_runs)
    ref_onsets_per_run = {}
    for run in common_runs:
        min_events = min(len(all_onsets[s][run]) for s in loaded_subjects)
        onset_matrix = np.array([all_onsets[s][run][:min_events] for s in loaded_subjects])
        ref_onsets_per_run[run] = list(np.median(onset_matrix, axis=0))
        print(f"    run{run}: {min_events} events from {len(loaded_subjects)} subjects")

    sa_scores = np.array([sa_by[s] for s in loaded_subjects], dtype=float)

    print("  Step 3/3: per-run warp + z-score + LOO ISC, averaged across runs...")
    results = []
    for tag, info, _, _ in AL18_ROIS:
        if tag not in roi_tags: continue
        run_isc_vals = []
        for run in common_runs:
            ref_onsets = ref_onsets_per_run[run]; min_events = len(ref_onsets)
            run_data = []
            for sid in loaded_subjects:
                ts = all_ts[tag][sid][run]
                subj_ons = all_onsets[sid][run][:min_events]
                warped = temporal_warp(ts, subj_ons, ref_onsets, N_TRS, TR)
                if np.std(warped) > 0:
                    warped = (warped - np.mean(warped)) / np.std(warped)
                run_data.append(warped)
            run_isc_vals.append(_loo_isc(np.stack(run_data, axis=0)))
        isc_mean = np.nanmean(np.stack(run_isc_vals, axis=0), axis=0)
        valid = ~np.isnan(isc_mean)
        if valid.sum() < 10: continue
        t_stat, _ = sp_stats.ttest_1samp(isc_mean[valid], 0)
        valid_both = valid & ~np.isnan(sa_scores)
        rho, p = sp_stats.spearmanr(isc_mean[valid_both], sa_scores[valid_both])
        results.append({
            "tag": tag, "name": info, "roi_type": masks[tag]["type"], "n_voxels": int(masks[tag]["n_voxels"]),
            "mean_isc_z": float(np.mean(isc_mean[valid])),
            "group_t": float(t_stat),
            "rho": float(rho), "p": float(p),
        })
    ps = np.array([r["p"] for r in results])
    qs = fdr_bh(ps)
    for i, r in enumerate(results): r["q_fdr"] = float(qs[i])
    return results

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--analysis", choices=["all","ma","isc"], default="all")
    ap.add_argument("--n-perm", type=int, default=N_PERM)
    args = ap.parse_args()

    os.makedirs(OUT_DIR, exist_ok=True)
    print("="*60); print(f"AL18 36-ROI hybrid pipeline — analysis={args.analysis}"); print("="*60)
    t0 = time.time()

    print("\nLoading LEARN brain mask + Harvard-Oxford subcortical...")
    mask_img = nib.load(MASK_PATH)
    ho_img = nib.load(HO_PATH)
    masks = build_roi_masks(mask_img, ho_img)

    print("\nLoading subject GLM data...")
    # Condition means are loaded only to pin the analytic sample: a subject must have
    # both run-wise betas AND per-condition betas to enter (defines the 33-subject set).
    runwise = {}; usable_runs = {}
    all_dirs = sorted([d for d in os.listdir(RESULTS_DIR)
                       if d.isdigit() and os.path.isdir(os.path.join(RESULTS_DIR, d))], key=int)
    for sid in all_dirs:
        rd, ur = load_subject_runwise(sid)
        if rd is None: continue
        nv, mv = load_subject_condition_means(sid)
        if nv is None: continue
        runwise[sid] = rd; usable_runs[sid] = ur
    n = len(runwise); print(f"  Loaded {n} subjects with full data")

    df_clin, sa = load_clinical(CLINICAL_CSV, list(runwise.keys()))
    sa_by = {s: float(v) for s, v in zip(df_clin["s"].astype(str).values, sa)}
    subjects = [s for s in sorted(runwise.keys(), key=int) if s in sa_by]
    print(f"  Final analytic N = {len(subjects)}, SA mean={np.mean([sa_by[s] for s in subjects]):.1f}")
    runwise = {s: runwise[s] for s in subjects}; usable_runs = {s: usable_runs[s] for s in subjects}

    if args.analysis in ("all", "ma"):
        print(f"\n>>> Model alignment RSA (n_perm={args.n_perm})")
        ma = run_model_alignment(masks, runwise, usable_runs, sa_by, args.n_perm, SEED)
        out = {"n_subjects": len(subjects), "n_perm": args.n_perm,
               "atlas": "AL18 hybrid (cortical=10mm sphere, subcortical=Harvard-Oxford 25%)",
               "results": ma}
        with open(os.path.join(OUT_DIR, "al18_hybrid_learning_rsa.json"), "w") as f: json.dump(out, f)
        print(f"  Wrote {len(ma)} ROIs")

    if args.analysis in ("all", "isc"):
        print(f"\n>>> Temporal ISC × SA (warped pb04)")
        ti = run_temporal_isc(masks, sa_by)
        out = {"n_subjects": len(subjects),
               "atlas": "AL18 hybrid (cortical=10mm sphere, subcortical=Harvard-Oxford 25%)",
               "results": ti}
        with open(os.path.join(OUT_DIR, "al18_hybrid_temporal_isc.json"), "w") as f: json.dump(out, f)
        print(f"  Wrote {len(ti)} ROIs")

    print(f"\nTotal elapsed: {(time.time()-t0)/60:.1f} min")

if __name__ == "__main__":
    main()
