#!/usr/bin/env python3
"""
Build the new-v2 visualization data for the AL18 36-ROI HYBRID analysis.
Renders the actual masks used in the cluster analysis:
  - 30 cortical ROIs: 10 mm spheres at AL18 coords (on the LEARN-equivalent 2 mm MNI grid)
  - 6 subcortical ROIs: Harvard-Oxford 25% max-prob structural masks

Output: roi_slices.js, roi_meta.js, stats.js, affine.js  (overwrites existing).
Source data: data/al18_hybrid_*.json
"""
import base64, io, json, os, time, warnings
import numpy as np
import nibabel as nib
from pathlib import Path
from nilearn import image as nl_image, datasets

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
warnings.filterwarnings("ignore")

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
MNI_TEMPLATE = "/Users/dannyzweben/fsl/data/standard/MNI152_T1_2mm.nii.gz"

# Render parameters
PAD = 6
SCROLL_PAD = 3
ZOOM_PAD = 12
FIG_SIZE = 2.2
FIG_DPI = 100
PX = int(FIG_SIZE * FIG_DPI)
SPHERE_RADIUS_MM = 10

# 36 ROIs, in display order
AL18_ROIS = [
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
    ("HC_R",    "R hippocampus",             (25, -19, -15), "ho"),
    ("HC_L",    "L hippocampus",             (-24, -18, -17),"ho"),
    ("AM_R",    "R amygdala",                (23, -3, -18),  "ho"),
    ("AM_L",    "L amygdala",                (-21, -4, -18), "ho"),
    ("NAC_R",   "R nucleus accumbens",       (11, 10, -7),   "ho"),
    ("NAC_L",   "L nucleus accumbens",       (-13, 11, -8),  "ho"),
]
ROI_ORDER = [r[0] for r in AL18_ROIS]

HO_LABELS = {"HC_L":9, "HC_R":19, "AM_L":10, "AM_R":20, "NAC_L":11, "NAC_R":21}

# ── Load atlases ───────────────────────────────────────────────────────
print("Loading MNI template + atlases...")
mni_nii = nib.load(MNI_TEMPLATE)
mni_data = mni_nii.get_fdata()
affine_2mm = mni_nii.affine
affine_inv = np.linalg.inv(affine_2mm)
NX0, NY0, NZ0 = mni_data.shape
voxel_sizes = np.sqrt(np.sum(affine_2mm[:3, :3]**2, axis=0))

# Harvard-Oxford subcortical
ho = datasets.fetch_atlas_harvard_oxford("sub-maxprob-thr25-2mm")
ho_img = ho.maps if hasattr(ho.maps, "get_fdata") else nib.load(ho.maps)
ho_resampled = nl_image.resample_to_img(ho_img, mni_nii, interpolation="nearest")
ho_data = np.asanyarray(ho_resampled.dataobj).astype(int)
if ho_data.ndim == 4: ho_data = ho_data[..., 0]

# HO Cortical for sidebar labels
hc = datasets.fetch_atlas_harvard_oxford("cort-maxprob-thr25-2mm", symmetric_split=False)
hc_img = hc.maps if hasattr(hc.maps, "get_fdata") else nib.load(hc.maps)
hc_resampled = nl_image.resample_to_img(hc_img, mni_nii, interpolation="nearest")
hc_data = np.asanyarray(hc_resampled.dataobj).astype(int)
if hc_data.ndim == 4: hc_data = hc_data[..., 0]
hc_labels = [l.decode() if isinstance(l, bytes) else l for l in hc.labels]

NONSPECIFIC = {"Unclassified","Background","Left Cerebral White Matter",
               "Right Cerebral White Matter","Left Cerebral Cortex","Right Cerebral Cortex",""}
def hc_label_at(ijk):
    i,j,k = int(ijk[0]), int(ijk[1]), int(ijk[2])
    if 0<=i<hc_data.shape[0] and 0<=j<hc_data.shape[1] and 0<=k<hc_data.shape[2]:
        idx = int(hc_data[i,j,k])
        if 0 < idx < len(hc_labels):
            lbl = hc_labels[idx]
            if lbl not in NONSPECIFIC: return lbl
    return "Unclassified"

# Brain mask from MNI template
brain_2mm = (mni_data > 0)

# ── Build masks at 2mm MNI grid ────────────────────────────────────────
print("\nBuilding 36 hybrid ROI masks (10mm spheres + HO subcortical) at 2mm MNI...")
roi_raw_masks = {}
for tag, name, mni, mtype in AL18_ROIS:
    if mtype == "sphere":
        coord = np.array([mni[0], mni[1], mni[2], 1.0])
        ci, cj, ck = np.round(affine_inv @ coord).astype(int)[:3]
        ii, jj, kk = np.ogrid[:NX0, :NY0, :NZ0]
        dist_sq = ((ii-ci)*voxel_sizes[0])**2 + ((jj-cj)*voxel_sizes[1])**2 + ((kk-ck)*voxel_sizes[2])**2
        sphere = dist_sq <= SPHERE_RADIUS_MM**2
        m = sphere & brain_2mm
    else:  # "ho"
        m = (ho_data == HO_LABELS[tag]) & brain_2mm
    roi_raw_masks[tag] = m
    print(f"  {tag:8s} {name:30s} type={mtype:6s} n_vox(2mm)={int(m.sum()):4d}")

# ── Pad arrays ─────────────────────────────────────────────────────────
mni_p = np.pad(mni_data, PAD, mode='constant', constant_values=0)
NX, NY, NZ = mni_p.shape
mni_norm = mni_p.copy()
p98 = np.percentile(mni_norm[mni_norm > 0], 98)
mni_norm = np.clip(mni_norm/(p98+1e-10), 0, 1)
brain_mask = mni_p > 0.01
roi_masks_p = {tag: np.pad(m, PAD, mode='constant', constant_values=False)
               for tag, m in roi_raw_masks.items()}

# ── Slice rendering ────────────────────────────────────────────────────
def render_slice(view, idx, overlay_mask_p):
    if view == 'axial':    bg = np.rot90(mni_norm[:, :, idx]); ov = np.rot90(overlay_mask_p[:, :, idx])
    elif view == 'sagittal': bg = np.rot90(mni_norm[idx, :, :]); ov = np.rot90(overlay_mask_p[idx, :, :])
    else:                  bg = np.rot90(mni_norm[:, idx, :]); ov = np.rot90(overlay_mask_p[:, idx, :])
    fig = plt.figure(figsize=(FIG_SIZE,FIG_SIZE), facecolor='black', dpi=FIG_DPI)
    ax = fig.add_axes([0,0,1,1]); ax.set_facecolor('black')
    ax.imshow(bg, cmap='gray', vmin=0, vmax=1, aspect='equal', interpolation='bilinear')
    if ov.any():
        rgba = np.zeros(ov.shape + (4,))
        rgba[ov,0] = 0.96; rgba[ov,1] = 0.35; rgba[ov,2] = 0.25; rgba[ov,3] = 0.65
        ax.imshow(rgba, aspect='equal', interpolation='nearest')
    if view in ('axial','coronal'):
        ax.text(0.02, 0.97, 'L', transform=ax.transAxes, color='white', fontsize=10, fontweight='bold', va='top')
        ax.text(0.98, 0.97, 'R', transform=ax.transAxes, color='white', fontsize=10, fontweight='bold', va='top', ha='right')
    ax.axis('off')
    buf = io.BytesIO()
    fig.savefig(buf, format='jpeg', facecolor='black', dpi=FIG_DPI, pil_kwargs={'quality':72})
    plt.close(fig)
    return base64.b64encode(buf.getvalue()).decode('ascii')

def scroll_range_for_mask(mask_p):
    ijk = np.array(np.where(mask_p))
    bounds = {}
    for axis, name in enumerate(['x','y','z']):
        c_lo = int(ijk[axis].min()) - SCROLL_PAD
        c_hi = int(ijk[axis].max()) + SCROLL_PAD
        proj = brain_mask.any(axis=tuple(a for a in range(3) if a != axis))
        b_indices = np.where(proj)[0]
        b_lo, b_hi = int(b_indices[0]), int(b_indices[-1])
        bounds[f'{name}_lo'] = max(c_lo, b_lo); bounds[f'{name}_hi'] = min(c_hi, b_hi)
    return bounds

# ── Render ─────────────────────────────────────────────────────────────
print(f"\nRendering slices for {len(ROI_ORDER)} ROIs...")
roi_slices, roi_bounds, roi_voxel_info, roi_peak, roi_cluster_voxels = {}, {}, {}, {}, {}
t0 = time.time()
for tag in ROI_ORDER:
    mask_p = roi_masks_p[tag]
    if mask_p.sum() == 0:
        print(f"  [SKIP] {tag}: empty mask"); continue
    bounds = scroll_range_for_mask(mask_p)
    ijk = np.array(np.where(mask_p))
    bounds['zoom_x0'] = int(max(0, ijk[0].min()-ZOOM_PAD)); bounds['zoom_x1'] = int(min(NX-1, ijk[0].max()+ZOOM_PAD))
    bounds['zoom_y0'] = int(max(0, ijk[1].min()-ZOOM_PAD)); bounds['zoom_y1'] = int(min(NY-1, ijk[1].max()+ZOOM_PAD))
    bounds['zoom_z0'] = int(max(0, ijk[2].min()-ZOOM_PAD)); bounds['zoom_z1'] = int(min(NZ-1, ijk[2].max()+ZOOM_PAD))
    roi_bounds[tag] = bounds

    # Peak = AL18 coord (sphere center) or HO mask centroid (subcortical)
    info = next(r for r in AL18_ROIS if r[0]==tag)
    mtype = info[3]
    if mtype == "sphere":
        mni = info[2]
        center_vox = affine_inv @ np.array([mni[0], mni[1], mni[2], 1.0])
        peak_p = [int(round(center_vox[0]))+PAD, int(round(center_vox[1]))+PAD, int(round(center_vox[2]))+PAD]
    else:
        coords_unpad = np.argwhere(roi_raw_masks[tag])
        c_vox = coords_unpad.mean(axis=0)
        peak_p = [int(round(c_vox[0]))+PAD, int(round(c_vox[1]))+PAD, int(round(c_vox[2]))+PAD]
    roi_peak[tag] = peak_p

    sl = {'axial':{}, 'sagittal':{}, 'coronal':{}}
    for z in range(bounds['z_lo'], bounds['z_hi']+1):
        sl['axial'][z] = render_slice('axial', z, mask_p)
    for x in range(bounds['x_lo'], bounds['x_hi']+1):
        sl['sagittal'][x] = render_slice('sagittal', x, mask_p)
    for y in range(bounds['y_lo'], bounds['y_hi']+1):
        sl['coronal'][y] = render_slice('coronal', y, mask_p)
    roi_slices[tag] = sl

    vi = {}
    for v in np.argwhere(mask_p):
        i,j,k = int(v[0]), int(v[1]), int(v[2])
        orig = (i-PAD, j-PAD, k-PAD)
        vi[f"{i},{j},{k}"] = {"r": hc_label_at(orig)}
    roi_voxel_info[tag] = vi

    cl_voxels = np.array(np.where(mask_p)).T
    roi_cluster_voxels[tag] = [f"{int(v[0])},{int(v[1])},{int(v[2])}" for v in cl_voxels]
    elapsed = time.time() - t0
    print(f"  {tag:8s}  bounds done; cumul {elapsed:.0f}s")

print(f"\nAll renders done in {(time.time()-t0)/60:.1f} min")

# ── Load analysis JSONs ────────────────────────────────────────────────
print("\nLoading hybrid analysis results...")
def load_or_empty(p):
    if not p.exists(): print(f"  [missing] {p}"); return {"results":[]}
    return json.load(open(p))

ma = load_or_empty(DATA_DIR / "al18_hybrid_learning_rsa.json")
ti = load_or_empty(DATA_DIR / "al18_hybrid_temporal_isc.json")
sp = load_or_empty(DATA_DIR / "al18_hybrid_spatial_isc.json")
lr = load_or_empty(DATA_DIR / "al18_hybrid_learning_rate.json")

# Temporal ISC has tag-or-roi_key
def _tag(r): return r.get('tag') or r.get('roi_key')
ma_by = {r['tag']: r for r in ma.get('results',[])}
ti_by = {_tag(r): r for r in ti.get('results',[])}
sp_by = {r['tag']: r for r in sp.get('results',[])}
lr_by = {r['tag']: r for r in lr.get('results',[])}

# Whole-brain Schaefer 400 (untouched)
wb_temporal = json.load(open(DATA_DIR / "wholebrain_400_temporal_isc_results.json"))
wb_spatial  = json.load(open(DATA_DIR / "wholebrain_400_loo_isc_results.json"))

# ── Build unified per-ROI stats ─────────────────────────────────────────
print("\nBuilding stats.js...")
roi_stats = {}
for tag, name, mni, mtype in AL18_ROIS:
    m = ma_by.get(tag, {}); t = ti_by.get(tag, {}); s = sp_by.get(tag, {}); l = lr_by.get(tag, {})
    nice = (s.get('Nice') or {}); mean = (s.get('Mean') or {})
    roi_stats[tag] = {
        'tag': tag, 'name': name, 'mni': list(mni), 'roi_type': mtype,
        'n_voxels': t.get('n_voxels') or m.get('n_voxels') or s.get('n_voxels') or int(roi_raw_masks[tag].sum()),
        'ma_b_SA': m.get('b_SA'), 'ma_t_SA': m.get('t_SA'),
        'ma_p_SA_perm': m.get('p_SA_perm'), 'ma_q_SA': m.get('q_SA_fdr'),
        'ma_b_interaction': m.get('b_interaction'), 'ma_t_interaction': m.get('t_interaction'),
        'ma_p_interaction_perm': m.get('p_interaction_perm'), 'ma_q_interaction': m.get('q_interaction_fdr'),
        'ma_b_run': m.get('b_run'),
        'ma_rho_run1': m.get('rho_run1'), 'ma_rho_run2': m.get('rho_run2'),
        'ma_rho_run3': m.get('rho_run3'), 'ma_rho_run4': m.get('rho_run4'),
        'ti_mean_isc_z': t.get('mean_isc_z'), 'ti_group_t': t.get('group_t'),
        'ti_rho_SA': t.get('rho'), 'ti_p_SA': t.get('p'), 'ti_q_SA': t.get('q_fdr'),
        'sn_mean_isc_z': nice.get('mean_isc_z'), 'sn_group_t': nice.get('group_t'),
        'sn_rho': nice.get('rho'), 'sn_p': nice.get('p'), 'sn_q': nice.get('q_fdr'),
        'sm_mean_isc_z': mean.get('mean_isc_z'), 'sm_group_t': mean.get('group_t'),
        'sm_rho': mean.get('rho'), 'sm_p': mean.get('p'), 'sm_q': mean.get('q_fdr'),
        # Learning rate ("got there quicker") supplementary
        'lr_run1_rho': l.get('run1_z_rho'), 'lr_run1_p': l.get('run1_z_p'), 'lr_run1_q': l.get('run1_z_q_fdr'),
        'lr_run4_rho': l.get('run4_z_rho'), 'lr_run4_p': l.get('run4_z_p'), 'lr_run4_q': l.get('run4_z_q_fdr'),
        'lr_gain_rho': l.get('gain_rho'), 'lr_gain_p': l.get('gain_p'), 'lr_gain_q': l.get('gain_q_fdr'),
        'lr_midpoint_rho': l.get('midpoint_run_rho'), 'lr_midpoint_p': l.get('midpoint_run_p'), 'lr_midpoint_q': l.get('midpoint_run_q_fdr'),
        'lr_mean_run1_z': l.get('mean_run1_z'), 'lr_mean_run4_z': l.get('mean_run4_z'),
        'lr_mean_gain': l.get('mean_gain'), 'lr_mean_midpoint': l.get('mean_midpoint_run'),
    }

# ── Write JS files ─────────────────────────────────────────────────────
def write_js(path, name, obj):
    path.write_text(f"const {name}={json.dumps(obj, separators=(',',':'))};\n")
    mb = os.path.getsize(path)/(1024*1024)
    print(f"  {path.name}: {mb:.2f} MB")

print("\nWriting JS files...")
roi_slices_js = {}
for tag in ROI_ORDER:
    if tag not in roi_slices: continue
    sl = {}
    for view in ['axial','sagittal','coronal']:
        sl[view] = {str(k): f"data:image/jpeg;base64,{v}" for k,v in roi_slices[tag][view].items()}
    roi_slices_js[tag] = sl
write_js(ROOT / "roi_slices.js", "ROI_SLICES", roi_slices_js)

roi_meta_js = {}
for tag in ROI_ORDER:
    if tag not in roi_bounds: continue
    info = next(r for r in AL18_ROIS if r[0]==tag)
    roi_meta_js[tag] = {
        'name': info[1], 'mni': list(info[2]), 'roi_type': info[3],
        'peak_p': roi_peak[tag], 'bounds': roi_bounds[tag],
        'vi': roi_voxel_info[tag], 'cv': roi_cluster_voxels[tag],
    }
write_js(ROOT / "roi_meta.js", "ROI_META", roi_meta_js)

stats_obj = {
    'order': ROI_ORDER, 'stats': roi_stats,
    'n_subjects': ma.get('n_subjects', 33),
    'meta': {
        'atlas': 'AL18 hybrid: 30 cortical 10mm spheres + 6 subcortical Harvard-Oxford masks',
        'sa_measure': 'SCARED-C social anxiety subscale',
        'n_rois': len(ROI_ORDER),
    },
    'wb_temporal': wb_temporal,
    'wb_spatial': wb_spatial,
}
write_js(ROOT / "stats.js", "REPORT", stats_obj)

write_js(ROOT / "affine.js", "AFF_META",
         {'affine': affine_2mm.tolist(), 'pad': PAD, 'nx': NX, 'ny': NY, 'nz': NZ, 'px': PX})

print("\nDone.")
