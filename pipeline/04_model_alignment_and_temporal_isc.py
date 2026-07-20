#!/usr/bin/env python3
"""
04 · Model Alignment RSA  +  Temporal ISC   (FINDINGS #1 and #2)
================================================================
Reads the canonical feedback betas ($GLM_LABEL) over the 36 a priori social-brain
ROIs (Alcalá-López et al. 2018): 30 cortical 10 mm spheres + 6 Harvard-Oxford
subcortical (HC/AM/NAcc bilateral).

  FINDING #1 - Model Alignment RSA:
     per subject×run, 4-peer neural RDM vs the peer-identity model RDM (Fisher-z),
     OLS  z_rsa ~ run + SA + run×SA.  SA main effect = SA-only shuffle;
     SA × Run interaction = JOINT shuffle (run randomized in the null). BH-FDR / 36 ROIs.
     -> rACC SA×Run interaction is the settled headline.

  FINDING #2 - Temporal ISC:
     leave-one-out temporal ISC per subject×ROI; Spearman vs SA (idiosyncrasy).
     -> rACC / aMCC negative (drift from group rises with SA).

Produces exactly these two findings. The exploratory spatial pattern IS-RSA that
once shared this script now lives in archive/ and is not computed here.

  Paths & label come from pipeline/config.sh (env: GLMDIR, RESULTS, GROUP_MASK,
  CLINICAL, GLM_LABEL). Outputs: $RESULTS/al18_hybrid_{learning_rsa,temporal_isc}.json

Run (after sourcing config):  python3 pipeline/04_model_alignment_and_temporal_isc.py
"""
# ── Standard library + scientific stack imports ────────────────────────
import os, sys, json, time, argparse, warnings
from datetime import datetime
import numpy as np
from scipy import stats as sp_stats            # Pearson/Spearman, rankdata, t-tests, permutations
from scipy.interpolate import interp1d         # piecewise-linear maps for the temporal warp
import nibabel as nib                          # reads AFNI +tlrc HEAD/BRIK and NIfTI volumes
warnings.filterwarnings("ignore")              # silence NaN-slice / RuntimeWarning noise from corrcoef, etc.

# ── Filesystem roots (server layout); every path is overridable via env by config.sh ──
TOPDIR = "/data/projects/STUDIES/LEARN/fMRI"
RSA_DIR = f"{TOPDIR}/RSA-learn"
# GLM stats live here: one subdir per subject id, each holding stats.<id>+tlrc
RESULTS_DIR = os.environ.get("GLMDIR",     f"{RSA_DIR}/derivatives/afni/IndvlLvlAnalyses")
# Group EPI brain mask (defines valid voxels + the analysis grid/affine)
MASK_PATH   = os.environ.get("GROUP_MASK", f"{TOPDIR}/Masks/LEARN_Grp90+tlrc.HEAD")
# Clinical CSV holding the social-anxiety measure and the Usable_fMRI flag
CLINICAL_CSV= os.environ.get("CLINICAL",   f"{RSA_DIR}/analysis/learn_clinical.csv")
# Where the two findings JSONs are written
OUT_DIR     = os.environ.get("RESULTS",    f"{RSA_DIR}/derivatives/afni/results")
# Corrected per-subject timing files (.1D) - source of feedback onsets for the warp
TIMING_DIR  = os.environ.get("TIMING",     f"{RSA_DIR}/timing")
# FSL Harvard-Oxford subcortical maxprob atlas (2 mm), source of the 6 subcortical masks
HO_PATH     = "/usr/local/fsl/data/atlases/HarvardOxford/HarvardOxford-sub-maxprob-thr25-2mm.nii.gz"

# canonical GLM label: run-wise, valence-split feedback betas on the corrected timing
GLM_LABEL = os.environ.get("GLM_LABEL", "feedback_runwise_glm")
MEASURE   = "scared_ch_social"     # column in the clinical CSV = social-anxiety (SA) score
N_PERM    = 10_000                 # permutations per ROI per test
SEED      = 42                     # base RNG seed (offset per-ROI for independence)
MIN_RUNS  = 3                      # a subject needs at least this many usable runs to enter RSA
MIN_VOXELS= 5                      # skip ROIs whose in-brain intersection is too small to pattern-correlate
SPHERE_RADIUS_MM = 10             # cortical sphere radius (physical mm, AL18 convention)
TR = 1.75                          # repetition time in seconds (used to convert TR index <-> seconds)
N_TRS = 217                        # number of TRs kept per run

# The 4 peer identities, ordered from most-nice to most-mean (drives the model RDM order)
PEERS  = ["Nice80", "Nice60", "Mean60", "Mean80"]
N_PEERS = 4
N_RUNS  = 4
# P(nice) = the true probability each peer gives nice feedback - the latent dimension the model encodes
P_NICE = {"Nice80": 0.80, "Nice60": 0.60, "Mean60": 0.40, "Mean80": 0.20}
# MODEL RDM: dissimilarity between peers i,j = |P(nice)_i − P(nice)_j| / 0.60.
#   The /0.60 normalizes to the max pairwise gap (0.80−0.20=0.60) so entries span [0,1].
MODEL_RDM = np.array([[abs(P_NICE[a]-P_NICE[b])/0.60 for b in PEERS] for a in PEERS])
# Take only the strictly-upper triangle (k=1): the 6 unique off-diagonal pairs for 4 peers
MODEL_UTRI = MODEL_RDM[np.triu_indices(N_PEERS, k=1)]
# Pre-rank the model's 6 dissimilarities once - Spearman is Pearson on ranks, so cache the ranks
MODEL_UTRI_RANKED = sp_stats.rankdata(MODEL_UTRI)

# Harvard-Oxford label IDs at the 25% threshold sub-maxprob atlas
# (integer voxel value in HO_PATH corresponding to each subcortical structure/hemisphere)
HO_LABELS = {
    "HC_L":  9,   "HC_R":  19,
    "AM_L":  10,  "AM_R":  20,
    "NAC_L": 11,  "NAC_R": 21,
}

# 36 AL18 ROIs: tag -> {name, mni, type}
# Each tuple = (short tag, human-readable name, MNI peak coord in mm, mask construction type).
# "sphere" ROIs are grown around the MNI peak; "ho" ROIs are pulled from the HO atlas by label id.
AL18_ROIS = [
    # Cortical (30) - 10 mm spheres at AL18 peaks
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
    # Subcortical (6) - Harvard-Oxford 25% max-prob structural masks
    ("HC_R",    "R hippocampus",             (25, -19, -15), "ho"),
    ("HC_L",    "L hippocampus",             (-24, -18, -17),"ho"),
    ("AM_R",    "R amygdala",                (23, -3, -18),  "ho"),
    ("AM_L",    "L amygdala",                (-21, -4, -18), "ho"),
    ("NAC_R",   "R nucleus accumbens",       (11, 10, -7),   "ho"),
    ("NAC_L",   "L nucleus accumbens",       (-13, 11, -8),  "ho"),
]

# ──────────────────────────────────────────────────────────────────────
def parse_subbrick_labels(head_path):
    # Read the AFNI HEAD and pull the BRICK_LABS attribute - the tilde-delimited
    # list of sub-brick labels - so we can find sub-bricks by name instead of index.
    img = nib.load(head_path)
    labs = img.header.info.get("BRICK_LABS", "").split("~")
    # Map each non-empty label -> its integer sub-brick index (4th-dim position).
    return {l: i for i, l in enumerate(labs) if l}

def load_clinical(csv_path, subject_ids):
    import pandas as pd
    df = pd.read_csv(csv_path)
    df["s"] = df["s"].astype(str)                                  # subject id as string for matching
    df = df[df["Usable_fMRI"] == 1].copy()                         # keep only usable-fMRI subjects
    df = df[df["s"].isin([str(s) for s in subject_ids])].copy()    # keep only ids that loaded GLM data
    # Deterministic ordering by numeric id so SA vectors line up across the pipeline.
    df = df.sort_values("s", key=lambda x: x.astype(int)).reset_index(drop=True)
    # SA scores as float64; coerce non-numeric to NaN rather than erroring.
    sa = pd.to_numeric(df[MEASURE], errors="coerce").values.astype(np.float64)
    return df, sa

def fisher_z(r):
    # Fisher r-to-z transform (arctanh) so correlations become ~normal and additive;
    # clip near ±1 to avoid infinities at perfect correlation.
    return np.arctanh(np.clip(r, -0.9999, 0.9999))

def fdr_bh(pvals):
    # Benjamini-Hochberg FDR: convert p-values to q-values (adjusted p) via step-up.
    pvals = np.array(pvals, dtype=float); n = len(pvals)
    if n == 0: return np.array([])
    order = np.argsort(pvals); q = np.zeros(n)          # ascending p order; rank i (0-based)
    # Raw BH adjustment: q_i = p_i * n / rank  (rank = i+1 in 1-based terms).
    for i, ix in enumerate(order): q[ix] = pvals[ix] * n / (i+1)
    # Enforce monotonicity from the largest p downward: q_i = min(q_i, q_{i+1}).
    for i in range(n-2, -1, -1):
        ix = order[i]; ix_n = order[i+1]; q[ix] = min(q[ix], q[ix_n])
    return np.minimum(q, 1.0)                            # cap q-values at 1.0

# ── ROI mask construction ──────────────────────────────────────────────
def build_roi_masks(mask_img, ho_img):
    """Returns dict tag -> bool 3D mask on the LEARN grid."""
    affine = mask_img.affine                            # 4x4 voxel-index -> MNI-world mm mapping
    mask_3d = np.asanyarray(mask_img.dataobj)           # group brain mask as an array
    if mask_3d.ndim == 4: mask_3d = mask_3d[..., 0]     # drop any singleton 4th dim
    brain = (mask_3d > 0)                               # boolean in-brain mask (analysis domain)
    nx, ny, nz = brain.shape                            # grid dimensions

    # Voxel sizes
    # Physical mm per unit voxel step along each axis = column norms of the affine's 3x3 block
    # (sqrt of sum of squares down each column). Handles anisotropy/rotation correctly.
    voxel_sizes = np.sqrt(np.sum(affine[:3, :3]**2, axis=0))

    # HO data resampled to LEARN grid (nearest-neighbor)
    # Nearest-neighbor keeps HO label IDs as exact integers (no interpolation between labels)
    # while reslicing the 2 mm atlas onto the LEARN grid/affine.
    from nilearn import image as nl_image
    ho_resampled = nl_image.resample_to_img(ho_img, mask_img, interpolation="nearest")
    ho_data = np.asanyarray(ho_resampled.dataobj).astype(int)   # integer label volume on LEARN grid
    if ho_data.ndim == 4: ho_data = ho_data[..., 0]             # drop singleton 4th dim if present

    # Inverse affine: MNI-world mm -> continuous voxel index (used to place sphere centers).
    affine_inv = np.linalg.inv(affine)

    masks = {}
    print("\nBuilding 36 AL18 hybrid ROI masks...")
    for tag, name, mni, mtype in AL18_ROIS:
        if mtype == "sphere":
            # Homogeneous MNI coordinate (append 1.0) so the 4x4 affine can act on it.
            coord = np.array([mni[0], mni[1], mni[2], 1.0])
            # World mm -> voxel index via inverse affine, rounded to the nearest voxel = sphere center.
            ci, cj, ck = np.round(affine_inv @ coord).astype(int)[:3]
            # Open grids of voxel indices along each axis (broadcast to full 3D without materializing).
            ii, jj, kk = np.ogrid[:nx, :ny, :nz]
            # Squared PHYSICAL distance from center: (index offset × mm-per-voxel)^2 summed over axes.
            # Working in voxel-index space but scaling by voxel_sizes gives true mm distances.
            dist_sq = ((ii-ci)*voxel_sizes[0])**2 + ((jj-cj)*voxel_sizes[1])**2 + ((kk-ck)*voxel_sizes[2])**2
            # Inside-sphere test: squared distance ≤ squared radius (avoids a sqrt).
            sphere = dist_sq <= SPHERE_RADIUS_MM**2
            # Restrict the sphere to in-brain voxels only.
            m = sphere & brain
        else:  # "ho"
            # Subcortical: select the atlas label id for this structure, intersect with brain.
            label_id = HO_LABELS[tag]
            m = (ho_data == label_id) & brain
        n = int(m.sum())                                # voxel count in the final ROI
        masks[tag] = {"name": name, "mni": list(mni), "type": mtype, "mask": m, "n_voxels": n}
        marker = " (HO)" if mtype == "ho" else ""       # annotate HO ROIs in the printout
        print(f"  {tag:8s}  {name:30s}  type={mtype:6s}  n_vox={n:4d}{marker}")
    return masks

# ── Subject-level data loading ─────────────────────────────────────────
def get_runwise_glt_indices(label_map):
    # Build a lookup (peer, run) -> sub-brick index for the run-wise feedback beta GLTs.
    # AFNI label pattern: "<peer>.r<run>_GLT#0_Coef".  .get returns None if absent.
    out = {}
    for peer in PEERS:
        for run in range(1, N_RUNS+1):
            out[(peer, run)] = label_map.get(f"{peer}.r{run}_GLT#0_Coef")
    return out

def get_per_condition_indices(label_map):
    # Lookup (feedback-valence, peer, run) -> sub-brick index for the per-condition betas.
    # Label pattern: "<FBM|FBN>.<peer>.r<run>#0_Coef". FBM=mean feedback, FBN=nice feedback.
    out = {}
    for fb in ("FBM","FBN"):
        for peer in PEERS:
            for run in range(1, N_RUNS+1):
                out[(fb, peer, run)] = label_map.get(f"{fb}.{peer}.r{run}#0_Coef")
    return out

def load_subject_runwise(sid):
    # Locate the subject's AFNI stats HEAD file; bail if it's missing.
    head = os.path.join(RESULTS_DIR, str(sid), f"{sid}.results.{GLM_LABEL}", f"stats.{sid}+tlrc.HEAD")
    if not os.path.isfile(head): return None, []
    label_map = parse_subbrick_labels(head)
    glt = get_runwise_glt_indices(label_map)
    # A run is "usable" only if ALL 4 peer betas exist for that run.
    usable = [r for r in range(1, N_RUNS+1) if all(glt[(p, r)] is not None for p in PEERS)]
    if len(usable) < MIN_RUNS: return None, []          # need >= MIN_RUNS usable runs
    # Load the full 4D stats volume (all sub-bricks) once, as float32.
    full = np.asanyarray(nib.load(head).dataobj, dtype=np.float32)
    nx, ny, nz = full.shape[:3]
    data = {}
    for run in range(1, N_RUNS+1):
        if run not in usable: data[run] = None; continue   # non-usable runs stored as None
        # Stack the 4 peer beta maps for this run into a (4, X, Y, Z) array; init NaN.
        peer_vols = np.full((N_PEERS, nx, ny, nz), np.nan, dtype=np.float32)
        for pi, peer in enumerate(PEERS):
            peer_vols[pi] = full[:, :, :, glt[(peer, run)]]  # pull that peer's sub-brick
        data[run] = peer_vols
    return data, usable

def load_subject_condition_means(sid):
    # Loads per-condition betas only to CONFIRM the subject belongs to the analytic sample.
    head = os.path.join(RESULTS_DIR, str(sid), f"{sid}.results.{GLM_LABEL}", f"stats.{sid}+tlrc.HEAD")
    if not os.path.isfile(head): return None, None
    label_map = parse_subbrick_labels(head)
    cond = get_per_condition_indices(label_map)
    full = np.asanyarray(nib.load(head).dataobj, dtype=np.float32)
    nice_stack, mean_stack = [], []                     # collect FBN and FBM sub-bricks separately
    for fb, peer, run in cond:
        idx = cond[(fb, peer, run)]
        if idx is None: continue                        # skip conditions with no sub-brick
        if fb == "FBN": nice_stack.append(full[:, :, :, idx])   # nice-feedback beta
        elif fb == "FBM": mean_stack.append(full[:, :, :, idx]) # mean-feedback beta
    if not nice_stack or not mean_stack: return None, None      # must have both valences
    # Return voxelwise mean nice-beta and mean mean-beta (only used as a sample-inclusion gate).
    return np.mean(np.stack(nice_stack), axis=0), np.mean(np.stack(mean_stack), axis=0)

def load_subject_run_pb04(sid, run):
    # pb04 = preprocessed, scaled EPI timeseries for one run (post-warp, no blur), the ISC input.
    head = os.path.join(RESULTS_DIR, str(sid), f"{sid}.results.{GLM_LABEL}", f"pb04.{sid}.r{run:02d}.scale+tlrc.HEAD")
    if not os.path.isfile(head): return None
    data = np.asanyarray(nib.load(head).dataobj, dtype=np.float32)
    # Require a 4D volume with at least N_TRS time points; truncate to exactly N_TRS.
    if data.ndim == 4 and data.shape[3] >= N_TRS:
        return data[:, :, :, :N_TRS]
    return None

def load_feedback_onsets(sid, run):
    import glob as _glob
    # Corrected per-subject timing files live under sub-<id>/ in TIMING_DIR.
    subj_timing = os.path.join(TIMING_DIR, f"sub-{sid}")
    if not os.path.isdir(subj_timing): return []
    onsets = []
    # Feedback-event timing files are named NonPM_*_fdk*_run<run>.1D (one row per run).
    for f in _glob.glob(os.path.join(subj_timing, f"NonPM_*_fdk*_run{run}.1D")):
        with open(f) as fh: lines = fh.readlines()
        if run <= len(lines):
            line = lines[run-1].strip()                 # AFNI .1D: row r holds run r's onsets
            if line and line != '*':                    # '*' marks an empty run in AFNI timing
                for entry in line.split():
                    # Each entry may be "onset" or "onset:duration"; keep the onset (before ':').
                    try: onsets.append(float(entry.split(':')[0]))
                    except ValueError: pass
    return sorted(onsets)                               # onsets sorted ascending in seconds

def temporal_warp(ts, subj_ons, ref_ons, n_trs, tr):
    # Build anchor knots: run start (0), each event onset, run end (n_trs*tr) - for both timelines.
    subj_times = [0.0] + list(subj_ons) + [n_trs * tr]  # this subject's real event times
    ref_times  = [0.0] + list(ref_ons)  + [n_trs * tr]  # group-median reference event times
    # Piecewise-linear map REFERENCE time -> this SUBJECT's time (knots align event-to-event).
    # Outside the run bounds, clamp to the endpoint values (no extrapolation).
    ref_to_subj = interp1d(ref_times, subj_times, kind='linear', bounds_error=False,
                           fill_value=(subj_times[0], subj_times[-1]))
    subj_tr = np.arange(n_trs) * tr                     # sampling grid of the raw subject BOLD (seconds)
    ref_tr  = np.arange(n_trs) * tr                     # regular reference-time grid we want output on
    mapped = ref_to_subj(ref_tr)                        # for each ref-grid time, the subject time to sample
    # Linear interpolator of the subject's BOLD over its own time grid (clamp outside).
    ts_int = interp1d(subj_tr, ts, kind='linear', bounds_error=False, fill_value=(ts[0], ts[-1]))
    # Resample subject BOLD at the mapped times => events now land on the common reference grid.
    return ts_int(mapped)

# ── Stats helpers ──────────────────────────────────────────────────────
def neural_rdm_rho(peer_patterns):
    # peer_patterns: (4 peers × voxels). Pearson correlation across the 4 beta patterns.
    r = np.corrcoef(peer_patterns)
    if np.any(np.isnan(r)): return np.nan               # bail if any pattern was constant/degenerate
    # Neural RDM = 1 − r (dissimilarity); take the 6 unique upper-triangle pairs.
    utri = (1.0 - r)[np.triu_indices(N_PEERS, k=1)]
    # Spearman(neural, model) computed manually: rank the neural distances, mean-center.
    nr = sp_stats.rankdata(utri); ns = nr - nr.mean()
    ms = MODEL_UTRI_RANKED - MODEL_UTRI_RANKED.mean()   # model ranks (precomputed) mean-centered
    # Pearson-on-ranks denominator = sqrt(SS_neural * SS_model).
    denom = np.sqrt(np.sum(ns**2) * np.sum(ms**2))
    if denom == 0: return np.nan                        # zero variance in ranks -> undefined
    return float(np.sum(ns * ms) / denom)               # Spearman rho of neural vs model RDM

def fit_ols(z, run_v, sa_v):
    # Mean-center run and SA so the interaction term is orthogonalized against the main effects
    # (main-effect betas then interpretable at the mean of the other predictor).
    run_c = run_v - run_v.mean(); sa_c = sa_v - sa_v.mean()
    # Design matrix: intercept, run, SA, run×SA (the moderation term).
    X = np.column_stack([np.ones(len(z)), run_c, sa_c, run_c*sa_c])
    n, p = X.shape
    if n <= p: return None                              # need more observations than parameters
    # Normal-equations OLS: (X'X)^-1 ; guard against singular design.
    try: XtX_inv = np.linalg.inv(X.T @ X)
    except np.linalg.LinAlgError: return None
    b = XtX_inv @ X.T @ z; res = z - X @ b               # coefficients and residuals
    mse = float(np.sum(res**2)/(n-p))                    # residual mean square (unbiased error variance)
    if mse <= 0: return None                            # perfect fit / degenerate -> no valid SEs
    se = np.sqrt(np.diag(XtX_inv) * mse); se[se==0] = np.nan   # coefficient standard errors
    t = b / se                                          # t = beta / SE for each coefficient
    return {"b_run":float(b[1]),"b_SA":float(b[2]),"b_interaction":float(b[3]),
            "t_run":float(t[1]),"t_SA":float(t[2]),"t_interaction":float(t[3])}

def perm_test(z, run_v, sa_v, subj_v, n_perm, seed, coef_index):
    """SA-only permutation: shuffle SA between subjects. Used for the SA MAIN EFFECT.
    Valid because the SA main effect is a between-subject contrast - it depends only on
    the SA-to-subject mapping, not on within-subject run structure.
    """
    # Same OLS setup as fit_ols to get the observed t for the target coefficient.
    run_c = run_v - run_v.mean(); sa_c = sa_v - sa_v.mean()
    X = np.column_stack([np.ones(len(z)), run_c, sa_c, run_c*sa_c])
    n, p = X.shape
    try: XtX_inv = np.linalg.inv(X.T @ X)
    except np.linalg.LinAlgError: return np.nan
    b = XtX_inv @ X.T @ z; res = z - X @ b; mse = np.sum(res**2)/(n-p)
    if mse <= 0: return np.nan
    se = np.sqrt(np.diag(XtX_inv) * mse)
    if se[coef_index] == 0: return np.nan
    t_obs = b[coef_index] / se[coef_index]              # observed t for the coefficient of interest
    # One SA value per subject (subjects repeat across runs; take the first occurrence).
    unique = np.unique(subj_v); subj_sa = {s: sa_v[subj_v==s][0] for s in unique}
    sa_arr = np.array([subj_sa[s] for s in unique])     # SA vector in subject order
    rng = np.random.RandomState(seed); n_extreme = 0    # seeded RNG for reproducibility
    for _ in range(n_perm):
        # Permute SA labels ACROSS SUBJECTS (keeps each subject's runs intact / same SA within subject).
        perm_sa = sa_arr[rng.permutation(len(sa_arr))]
        pmap = {s: perm_sa[i] for i, s in enumerate(unique)}    # subject -> shuffled SA
        sa_p = np.array([pmap[s] for s in subj_v]); sa_p_c = sa_p - sa_p.mean()  # expand back to rows
        # Rebuild design with permuted SA (and its interaction) and refit.
        Xp = np.column_stack([np.ones(n), run_c, sa_p_c, run_c*sa_p_c])
        try: Xpi = np.linalg.inv(Xp.T @ Xp)
        except np.linalg.LinAlgError: continue
        bp = Xpi @ Xp.T @ z; rp = z - Xp @ bp; msp = np.sum(rp**2)/(n-p)
        if msp <= 0: continue
        sep = np.sqrt(np.diag(Xpi) * msp)
        if sep[coef_index] == 0: continue
        t_perm = bp[coef_index] / sep[coef_index]       # null t under this SA permutation
        if abs(t_perm) >= abs(t_obs): n_extreme += 1    # two-sided count of |t| >= observed
    return (n_extreme + 1) / (n_perm + 1)               # add-one (Phipson-Smyth) permutation p-value

def perm_test_joint(z, run_v, sa_v, subj_v, n_perm, seed, coef_index):
    """Joint permutation: shuffle SA between subjects AND scramble each subject's z
    values across their 4 runs. Used for the SA × RUN INTERACTION.
    The interaction t depends on structure in BOTH dimensions (subjects' SA labels
    AND within-subject run trajectories). A complete null requires randomizing both.
    """
    # Observed t for the interaction coefficient (identical OLS setup as above).
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
    subj_sa = {s: sa_v[subj_v==s][0] for s in unique}   # one SA per subject
    sa_arr = np.array([subj_sa[s] for s in unique])
    # Precompute per-subject row indices for fast within-subject shuffling
    subj_idx = {s: np.where(subj_v == s)[0] for s in unique}
    rng = np.random.RandomState(seed); n_extreme = 0
    for _ in range(n_perm):
        # Step 1: shuffle SA labels between subjects
        # (breaks the subject<->SA association - the between-subject half of the null).
        perm_sa = sa_arr[rng.permutation(len(sa_arr))]
        pmap = {s: perm_sa[i] for i, s in enumerate(unique)}
        sa_p = np.array([pmap[s] for s in subj_v]); sa_p_c = sa_p - sa_p.mean()
        # Step 2: within each subject, scramble z values across runs
        # (destroys any run trajectory - the within-subject half. An interaction is
        #  "does the run slope differ by SA?", so the run dimension MUST be randomized
        #  or the null would retain the run structure that drives the effect.)
        z_perm = z.copy()
        for s in unique:
            idx = subj_idx[s]
            z_perm[idx] = z_perm[idx][rng.permutation(len(idx))]  # permute this subject's run values
        # Refit against permuted SA and permuted z; recompute the interaction t.
        Xp = np.column_stack([np.ones(n), run_c, sa_p_c, run_c*sa_p_c])
        try: Xpi = np.linalg.inv(Xp.T @ Xp)
        except np.linalg.LinAlgError: continue
        bp = Xpi @ Xp.T @ z_perm; rp = z_perm - Xp @ bp; msp = np.sum(rp**2)/(n-p)
        if msp <= 0: continue
        sep = np.sqrt(np.diag(Xpi) * msp)
        if sep[coef_index] == 0: continue
        t_perm = bp[coef_index] / sep[coef_index]
        if abs(t_perm) >= abs(t_obs): n_extreme += 1    # two-sided extremity count
    return (n_extreme + 1) / (n_perm + 1)               # add-one permutation p-value

# ── Three analyses ─────────────────────────────────────────────────────
def run_model_alignment(masks, runwise, usable_runs, sa_by, n_perm, seed):
    subjects = sorted(runwise.keys(), key=int)          # subjects in numeric-id order
    results = []
    # Enumerate ROIs; ri seeds the RNG per-ROI so each ROI gets an independent permutation stream.
    for ri, (tag, info, _, _) in enumerate(AL18_ROIS):
        m = masks[tag]
        if m["n_voxels"] < MIN_VOXELS: continue         # skip too-small ROIs
        coords = np.argwhere(m["mask"])                 # (n_vox, 3) voxel indices inside the ROI
        z_vals=[]; run_vals=[]; sa_vals=[]; subj_vals=[]        # long-format regression rows
        rho_run = {r: [] for r in range(1, N_RUNS+1)}   # per-run raw rho for reporting trajectories
        for sid in subjects:
            for run in usable_runs[sid]:
                rd = runwise[sid].get(run)
                if rd is None: continue
                # Extract the 4-peer × n_vox pattern matrix for this ROI/run.
                pat = rd[:, coords[:,0], coords[:,1], coords[:,2]]
                if np.any(np.isnan(pat)): continue      # skip if any voxel is NaN (mask/data mismatch)
                rho = neural_rdm_rho(pat)               # Spearman(neural RDM, model RDM)
                if np.isnan(rho): continue
                # One regression observation: Fisher-z(rho) with its run, SA, subject labels.
                z_vals.append(fisher_z(rho)); run_vals.append(run)
                sa_vals.append(sa_by[sid]); subj_vals.append(sid)
                rho_run[run].append(rho)                # also store raw rho by run
        if len(z_vals) < 20: continue                   # need enough observations for a stable OLS
        z = np.array(z_vals); rv = np.array(run_vals,dtype=float)
        sv = np.array(sa_vals,dtype=float); subj_arr = np.array(subj_vals)
        fit = fit_ols(z, rv, sv)                        # OLS: z ~ run + SA + run×SA
        if fit is None: continue
        # SA × Run interaction: joint shuffle (SA between subjects + runs within subjects)
        p_int = perm_test_joint(z, rv, sv, subj_arr, n_perm, seed+ri, 3)      # coef 3 = interaction
        # SA main effect: SA-only shuffle (between-subject only - within-subject run order doesn't enter)
        p_sa  = perm_test(z, rv, sv, subj_arr, n_perm, seed+ri+5000, 2)       # coef 2 = SA main effect
        results.append({
            "tag": tag, "name": info, "mni": list(masks[tag]["mni"]) if "mni" in masks[tag] else None,
            "roi_type": masks[tag]["type"], "n_voxels": int(m["n_voxels"]), "n_obs": len(z_vals),
            "b_run": fit["b_run"], "b_SA": fit["b_SA"], "b_interaction": fit["b_interaction"],
            "t_SA": fit["t_SA"], "t_interaction": fit["t_interaction"],
            "p_SA_perm": float(p_sa) if not np.isnan(p_sa) else None,
            "p_interaction_perm": float(p_int) if not np.isnan(p_int) else None,
            # Mean raw rho per run - the RSA trajectory across runs (None if run had no data).
            "rho_run1": float(np.mean(rho_run[1])) if rho_run[1] else None,
            "rho_run2": float(np.mean(rho_run[2])) if rho_run[2] else None,
            "rho_run3": float(np.mean(rho_run[3])) if rho_run[3] else None,
            "rho_run4": float(np.mean(rho_run[4])) if rho_run[4] else None,
        })
    # BH-FDR across the surviving ROIs, separately for interaction and SA main effect.
    p_int = np.array([r.get("p_interaction_perm") or 1.0 for r in results])
    p_sa  = np.array([r.get("p_SA_perm")          or 1.0 for r in results])
    q_int = fdr_bh(p_int); q_sa = fdr_bh(p_sa)
    for i, r in enumerate(results):
        r["q_interaction_fdr"] = float(q_int[i]); r["q_SA_fdr"] = float(q_sa[i])
    return results

def _loo_isc(all_ts):
    """Leave-one-out ISC (Fisher-z) per subject, matching the original producer."""
    n_subj = all_ts.shape[0]                            # all_ts: (n_subj, n_timepoints)
    isc = np.full(n_subj, np.nan)
    all_sum = np.sum(all_ts, axis=0)                    # sum across subjects (for fast leave-one-out)
    for i in range(n_subj):
        # Mean of all OTHER subjects' timeseries = (total − self) / (n−1).
        others = (all_sum - all_ts[i]) / (n_subj - 1)
        if np.std(all_ts[i]) == 0 or np.std(others) == 0:
            continue                                    # undefined correlation if either is constant
        # Correlate this subject vs the others' mean; clip before Fisher-z.
        r = np.clip(np.corrcoef(all_ts[i], others)[0, 1], -0.999, 0.999)
        isc[i] = np.arctanh(r)                          # Fisher-z ISC for this subject
    return isc

def run_temporal_isc(masks, sa_by):
    # Faithful port of analysis/isc_warped_36_hybrid.py:
    #   per run: warp each subject's full ROI timeseries to group-median onsets,
    #   z-score, LOO ISC -> per-run ISC; then AVERAGE the per-run ISC across runs.
    #   (NOT concatenated.)  Spearman(mean ISC, SA); BH-FDR across ROIs.
    subjects = sorted(sa_by.keys(), key=int)
    # ROIs large enough to yield a stable ROI-mean timeseries.
    roi_tags = [tag for tag, _, _, _ in AL18_ROIS if masks[tag]["n_voxels"] >= MIN_VOXELS]
    print(f"  Step 1/3: per-run ROI-mean timeseries + onsets for {len(subjects)} subjects...")
    all_ts = {tag: {} for tag in roi_tags}      # tag -> sid -> run -> mean_ts
    all_onsets = {}                              # sid -> run -> onsets
    loaded_subjects = []
    for si, sid in enumerate(subjects):
        runs_loaded = 0; subj_ons = {}
        for run in range(1, N_RUNS + 1):
            ts4d = load_subject_run_pb04(sid, run)      # (X,Y,Z,T) preprocessed timeseries
            if ts4d is None: continue                   # skip runs with no usable pb04
            onsets = load_feedback_onsets(sid, run)     # feedback onsets (seconds) for the warp
            if not onsets: continue                     # can't warp without event anchors
            for tag in roi_tags:
                coords = np.argwhere(masks[tag]["mask"])                 # ROI voxel indices
                v = ts4d[coords[:, 0], coords[:, 1], coords[:, 2], :]    # (n_vox, T) ROI timeseries
                # ROI-mean timeseries (NaN-safe): one representative signal per ROI/run.
                all_ts[tag].setdefault(sid, {})[run] = np.nanmean(v, axis=0)
            subj_ons[run] = onsets; runs_loaded += 1
        if runs_loaded >= 2:                            # subject must contribute >= 2 runs
            loaded_subjects.append(sid); all_onsets[sid] = subj_ons
        if (si + 1) % 5 == 0: print(f"    Loaded {si+1}/{len(subjects)}")
    print(f"    Final N = {len(loaded_subjects)}")

    print("  Step 2/3: common runs + median reference onsets per run...")
    # Intersect run sets across subjects: ISC only uses runs everyone has.
    common_runs = None
    for sid in loaded_subjects:
        r = set(all_onsets[sid].keys())
        common_runs = r if common_runs is None else common_runs & r
    common_runs = sorted(common_runs)
    ref_onsets_per_run = {}
    for run in common_runs:
        # Trim every subject to the same number of events (the minimum across subjects).
        min_events = min(len(all_onsets[s][run]) for s in loaded_subjects)
        onset_matrix = np.array([all_onsets[s][run][:min_events] for s in loaded_subjects])
        # Group reference onsets = element-wise median across subjects (the common grid to warp onto).
        ref_onsets_per_run[run] = list(np.median(onset_matrix, axis=0))
        print(f"    run{run}: {min_events} events from {len(loaded_subjects)} subjects")

    # SA vector aligned to loaded_subjects order.
    sa_scores = np.array([sa_by[s] for s in loaded_subjects], dtype=float)

    print("  Step 3/3: per-run warp + z-score + LOO ISC, averaged across runs...")
    results = []
    for tag, info, _, _ in AL18_ROIS:
        if tag not in roi_tags: continue
        run_isc_vals = []                               # per-run LOO-ISC vectors for this ROI
        for run in common_runs:
            ref_onsets = ref_onsets_per_run[run]; min_events = len(ref_onsets)
            run_data = []
            for sid in loaded_subjects:
                ts = all_ts[tag][sid][run]              # this subject's ROI-mean timeseries
                subj_ons = all_onsets[sid][run][:min_events]     # matching subset of onsets
                # Warp onto the group reference grid so events align across subjects in time.
                warped = temporal_warp(ts, subj_ons, ref_onsets, N_TRS, TR)
                if np.std(warped) > 0:
                    # Z-score each subject's warped timeseries (correlation is scale/shift invariant).
                    warped = (warped - np.mean(warped)) / np.std(warped)
                run_data.append(warped)
            # LOO ISC computed WITHIN this run only (subject vs mean of others).
            run_isc_vals.append(_loo_isc(np.stack(run_data, axis=0)))
        # Average per-run ISC across runs (NOT concatenating runs): each run is z-scored and
        # warped independently, so per-run-then-average avoids cross-run scaling artifacts.
        isc_mean = np.nanmean(np.stack(run_isc_vals, axis=0), axis=0)
        valid = ~np.isnan(isc_mean)                     # subjects with a defined mean ISC
        if valid.sum() < 10: continue                   # need enough subjects for the group test
        # One-sample t-test: is mean ISC significantly above 0 (i.e., synchrony present)?
        t_stat, _ = sp_stats.ttest_1samp(isc_mean[valid], 0)
        valid_both = valid & ~np.isnan(sa_scores)       # subjects with both ISC and SA
        # Spearman(ISC, SA): negative rho => higher SA drifts away from the group (idiosyncrasy).
        rho, p = sp_stats.spearmanr(isc_mean[valid_both], sa_scores[valid_both])
        results.append({
            "tag": tag, "name": info, "roi_type": masks[tag]["type"], "n_voxels": int(masks[tag]["n_voxels"]),
            "mean_isc_z": float(np.mean(isc_mean[valid])),
            "group_t": float(t_stat),
            "rho": float(rho), "p": float(p),
        })
    ps = np.array([r["p"] for r in results])
    qs = fdr_bh(ps)                                     # BH-FDR across ROIs for the SA correlation
    for i, r in enumerate(results): r["q_fdr"] = float(qs[i])
    return results

def main():
    # CLI: choose which analyses to run and how many permutations.
    ap = argparse.ArgumentParser()
    ap.add_argument("--analysis", choices=["all","ma","isc"], default="all")  # ma=model align, isc=temporal ISC
    ap.add_argument("--n-perm", type=int, default=N_PERM)
    args = ap.parse_args()

    os.makedirs(OUT_DIR, exist_ok=True)
    print("="*60); print(f"AL18 36-ROI hybrid pipeline - analysis={args.analysis}"); print("="*60)
    t0 = time.time()

    print("\nLoading LEARN brain mask + Harvard-Oxford subcortical...")
    mask_img = nib.load(MASK_PATH)                      # group brain mask (defines grid + affine)
    ho_img = nib.load(HO_PATH)                          # HO subcortical atlas
    masks = build_roi_masks(mask_img, ho_img)           # build all 36 ROI masks once

    print("\nLoading subject GLM data...")
    # Condition means are loaded only to pin the analytic sample: a subject must have
    # both run-wise betas AND per-condition betas to enter (defines the 33-subject set).
    runwise = {}; usable_runs = {}
    # Every numeric subdir under RESULTS_DIR is a candidate subject.
    all_dirs = sorted([d for d in os.listdir(RESULTS_DIR)
                       if d.isdigit() and os.path.isdir(os.path.join(RESULTS_DIR, d))], key=int)
    for sid in all_dirs:
        rd, ur = load_subject_runwise(sid)              # run-wise peer betas + usable runs
        if rd is None: continue                         # fails MIN_RUNS or missing stats -> excluded
        nv, mv = load_subject_condition_means(sid)      # inclusion gate: must also have per-condition betas
        if nv is None: continue
        runwise[sid] = rd; usable_runs[sid] = ur
    n = len(runwise); print(f"  Loaded {n} subjects with full data")

    # Load SA scores (Usable_fMRI==1) and align to the loaded subjects.
    df_clin, sa = load_clinical(CLINICAL_CSV, list(runwise.keys()))
    sa_by = {s: float(v) for s, v in zip(df_clin["s"].astype(str).values, sa)}  # subject -> SA
    # Final sample = loaded subjects that also have a clinical SA row.
    subjects = [s for s in sorted(runwise.keys(), key=int) if s in sa_by]
    print(f"  Final analytic N = {len(subjects)}, SA mean={np.mean([sa_by[s] for s in subjects]):.1f}")
    # Restrict the neural dicts to the final analytic sample.
    runwise = {s: runwise[s] for s in subjects}; usable_runs = {s: usable_runs[s] for s in subjects}

    if args.analysis in ("all", "ma"):
        # FINDING #1 - Model Alignment RSA.
        print(f"\n>>> Model alignment RSA (n_perm={args.n_perm})")
        ma = run_model_alignment(masks, runwise, usable_runs, sa_by, args.n_perm, SEED)
        out = {"n_subjects": len(subjects), "n_perm": args.n_perm,
               "atlas": "AL18 hybrid (cortical=10mm sphere, subcortical=Harvard-Oxford 25%)",
               "results": ma}
        with open(os.path.join(OUT_DIR, "al18_hybrid_learning_rsa.json"), "w") as f: json.dump(out, f)
        print(f"  Wrote {len(ma)} ROIs")

    if args.analysis in ("all", "isc"):
        # FINDING #2 - Temporal ISC × SA.
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
