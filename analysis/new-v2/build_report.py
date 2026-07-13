#!/usr/bin/env python3
"""
Build the LEARN ISC / IS-RSA social brain report.

Output: analysis/new-v2/ roi_slices.js, roi_meta.js, stats.js, affine.js
Source data: analysis/new-v2/data/*.json
ROI masks:   analysis/masks/alcala_lopez_2018/Social_Connectome_2017/seed_*_vox200.nii.gz

Region-grown 200-voxel seeds from Alcalá-López et al. (2018, Cerebral Cortex) —
starting from a single voxel at the consensus meta-analytic coordinate, new
voxels are added at the current seed's border until 200 gray-matter voxels
are reached, with ties broken by the ICBM GM probability map.
"""
import base64, io, json, os, sys, csv, time, warnings
import numpy as np
import nibabel as nib
from pathlib import Path
from nilearn import image, datasets

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

warnings.filterwarnings("ignore")

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
OUTPUT_DIR = ROOT
MASK_DIR = ROOT.parent / "masks" / "alcala_lopez_2018" / "Social_Connectome_2017"
MNI_TEMPLATE = "/Users/dannyzweben/fsl/data/standard/MNI152_T1_2mm.nii.gz"

PAD = 6
SCROLL_PAD = 3
ZOOM_PAD = 12
FIG_SIZE = 2.2
FIG_DPI = 100
PX = int(FIG_SIZE * FIG_DPI)

# ── 36 Alcalá-López social-brain ROIs (region-grown, 200 GM voxels each) ──
# tag -> (filename, name, consensus_MNI)
SOCIAL_BRAIN_ROIS = [
    ("IFG_R",   "seed_rIFG_vox200.nii.gz",          "R inferior frontal gyrus", (48, 24, 2)),
    ("IFG_L",   "seed_lIFG_vox200.nii.gz",          "L inferior frontal gyrus", (-45, 27, -3)),
    ("HC_R",    "seed_rHC_vox200.nii.gz",           "R hippocampus",            (25, -19, -15)),
    ("HC_L",    "seed_lHC_vox200.nii.gz",           "L hippocampus",            (-24, -18, -17)),
    ("rACC",    "seed_rACC_vox200.nii.gz",          "Rostral ACC",              (-3, 41, 4)),
    ("vmPFC",   "seed_vmPFC_vox200.nii.gz",         "vmPFC",                    (2, 45, -15)),
    ("AM_R",    "seed_ramygdala_vox200.nii.gz",     "R amygdala",               (23, -3, -18)),
    ("AM_L",    "seed_lamygdala_vox200.nii.gz",     "L amygdala",               (-21, -4, -18)),
    ("NAC_R",   "seed_rNAcc_vox200.nii.gz",         "R nucleus accumbens",      (11, 10, -7)),
    ("NAC_L",   "seed_lNAcc_vox200.nii.gz",         "L nucleus accumbens",      (-13, 11, -8)),
    ("MTG_R",   "seed_rMTG_vox200.nii.gz",          "R middle temporal gyrus",  (56, -10, -17)),
    ("MTG_L",   "seed_lMTG_vox200.nii.gz",          "L middle temporal gyrus",  (-56, -14, -13)),
    ("Prec",    "seed_PCu_vox200.nii.gz",           "Precuneus",                (-1, -59, 41)),
    ("TPJ_R",   "seed_rTPJ_vox200.nii.gz",          "R TPJ",                    (54, -55, 20)),
    ("TPJ_L",   "seed_lTPJ_vox200.nii.gz",          "L TPJ",                    (-49, -61, 27)),
    ("TP_R",    "seed_rtemporalpole_vox200.nii.gz", "R temporal pole",          (53, 7, -26)),
    ("TP_L",    "seed_ltemporalpole_vox200.nii.gz", "L temporal pole",          (-48, 8, -36)),
    ("FP",      "seed_frontalpole_vox200.nii.gz",   "Medial frontal pole",      (1, 58, 10)),
    ("PCC",     "seed_PCC_vox200.nii.gz",           "PCC",                      (-1, -54, 23)),
    ("dmPFC",   "seed_dmPFC_vox200.nii.gz",         "dmPFC",                    (-4, 53, 31)),
    ("MT_V5_R", "seed_rMTV5_vox200.nii.gz",         "R MT/V5",                  (50, -66, 6)),
    ("MT_V5_L", "seed_lMTV5_vox200.nii.gz",         "L MT/V5",                  (-50, -66, 5)),
    ("FG_R",    "seed_rFFA_vox200.nii.gz",          "R fusiform gyrus",         (43, -57, -19)),
    ("FG_L",    "seed_lFFA_vox200.nii.gz",          "L fusiform gyrus",         (-42, -62, -16)),
    ("pSTS_R",  "seed_rpSTS_vox200.nii.gz",         "R pSTS",                   (54, -39, 0)),
    ("pSTS_L",  "seed_lpSTS_vox200.nii.gz",         "L pSTS",                   (-56, -39, 2)),
    ("SMA_R",   "seed_rSMA_vox200.nii.gz",          "R SMA",                    (48, 6, 35)),
    ("SMA_L",   "seed_lSMA_vox200.nii.gz",          "L SMA",                    (-41, 6, 45)),
    ("AI_R",    "seed_rAI_vox200.nii.gz",           "R anterior insula",        (38, 18, -3)),
    ("AI_L",    "seed_lAI_vox200.nii.gz",           "L anterior insula",        (-34, 19, 0)),
    ("SMG_R",   "seed_rIPL_vox200.nii.gz",          "R supramarginal gyrus",    (54, -30, 38)),
    ("SMG_L",   "seed_lIPL_vox200.nii.gz",          "L supramarginal gyrus",    (-41, -41, 42)),
    ("Cereb_R", "seed_rCb_vox200.nii.gz",           "R cerebellum",             (28, -70, -30)),
    ("Cereb_L", "seed_lCb_vox200.nii.gz",           "L cerebellum",             (-21, -66, -35)),
    ("aMCC",    "seed_aMCC_vox200.nii.gz",          "Anterior MCC",             (1, 25, 30)),
    ("pMCC",    "seed_pMCC_vox200.nii.gz",          "Posterior MCC",            (-3, -29, 32)),
]
ROI_ORDER = [r[0] for r in SOCIAL_BRAIN_ROIS]
ROI_META = {tag: {"file": fn, "name": name, "mni": mni}
            for tag, fn, name, mni in SOCIAL_BRAIN_ROIS}

# ── Load MNI template ──────────────────────────────────────────────────────
print("Loading MNI template...")
mni_nii = nib.load(MNI_TEMPLATE)
mni_data = mni_nii.get_fdata()
affine_2mm = mni_nii.affine
affine_inv = np.linalg.inv(affine_2mm)

# ── Load atlases for Where-Am-I sidebar ───────────────────────────────────
print("Loading atlases...")

def load_atlas(fetch_fn, kwargs, name):
    atlas = fetch_fn(**kwargs)
    atlas_img = atlas.maps if hasattr(atlas.maps, 'get_fdata') else nib.load(atlas.maps)
    resampled = image.resample_to_img(atlas_img, mni_nii, interpolation='nearest')
    labels = [l.decode() if isinstance(l, bytes) else l for l in atlas.labels]
    print(f"  {name}: {len(labels)} labels")
    return resampled.get_fdata().astype(int), labels

ho_cort_data, ho_cort_labels = load_atlas(
    datasets.fetch_atlas_harvard_oxford,
    {"atlas_name": "cort-maxprob-thr25-2mm", "symmetric_split": False},
    "Harvard-Oxford Cortical")
ho_sub_data, ho_sub_labels = load_atlas(
    datasets.fetch_atlas_harvard_oxford,
    {"atlas_name": "sub-maxprob-thr25-2mm"},
    "Harvard-Oxford Subcortical")

NONSPECIFIC = {"Unclassified", "Background", "Left Cerebral White Matter",
               "Right Cerebral White Matter", "Left Cerebral Cortex", "Right Cerebral Cortex", ""}

def atlas_label(ijk):
    i, j, k = int(ijk[0]), int(ijk[1]), int(ijk[2])
    for data, labels in [(ho_cort_data, ho_cort_labels), (ho_sub_data, ho_sub_labels)]:
        if 0 <= i < data.shape[0] and 0 <= j < data.shape[1] and 0 <= k < data.shape[2]:
            idx = int(data[i,j,k])
            if 0 < idx < len(labels):
                lbl = labels[idx]
                if lbl not in NONSPECIFIC:
                    return lbl
    return "Unclassified"

def nearby_regions(ijk, max_dist_vox=4, max_results=3):
    found = {}
    shape = ho_cort_data.shape
    for d in range(1, max_dist_vox + 1):
        for di in range(-d, d+1):
            for dj in range(-d, d+1):
                for dk in range(-d, d+1):
                    if abs(di) != d and abs(dj) != d and abs(dk) != d:
                        continue
                    ni, nj, nk = ijk[0]+di, ijk[1]+dj, ijk[2]+dk
                    if not (0 <= ni < shape[0] and 0 <= nj < shape[1] and 0 <= nk < shape[2]):
                        continue
                    dist_mm = round(np.sqrt((di*2)**2 + (dj*2)**2 + (dk*2)**2), 1)
                    lbl = atlas_label((ni,nj,nk))
                    if lbl not in NONSPECIFIC and lbl != "Unclassified":
                        if lbl not in found:
                            found[lbl] = dist_mm
        if len(found) >= max_results:
            break
    return sorted(found.items(), key=lambda x: x[1])[:max_results]

# ── Load region-grown masks and resample to 2mm MNI ───────────────────────
print("\nLoading 36 Alcalá-López region-grown masks (1mm) and resampling to 2mm...")
NX0, NY0, NZ0 = mni_data.shape

def resample_any_overlap(src_img, target_affine, target_shape):
    """Binary any-source-voxel-hits resample — preserves every labeled
    source voxel's volume when downsampling 1mm -> 2mm."""
    src_data = np.asanyarray(src_img.dataobj)
    while src_data.ndim > 3:
        src_data = src_data[..., 0]
    src_affine = src_img.affine
    tgt_inv = np.linalg.inv(target_affine)
    src_idx = np.argwhere(src_data > 0)
    if len(src_idx) == 0:
        return np.zeros(target_shape, dtype=bool)
    src_hom = np.column_stack([src_idx, np.ones(len(src_idx))])
    mni = (src_affine @ src_hom.T).T[:, :3]
    mni_hom = np.column_stack([mni, np.ones(len(mni))])
    tgt_vox = (tgt_inv @ mni_hom.T).T[:, :3]
    tgt_vox = np.round(tgt_vox).astype(int)
    nx, ny, nz = target_shape
    out = np.zeros(target_shape, dtype=bool)
    valid = ((tgt_vox[:, 0] >= 0) & (tgt_vox[:, 0] < nx) &
             (tgt_vox[:, 1] >= 0) & (tgt_vox[:, 1] < ny) &
             (tgt_vox[:, 2] >= 0) & (tgt_vox[:, 2] < nz))
    tv = tgt_vox[valid]
    out[tv[:, 0], tv[:, 1], tv[:, 2]] = True
    return out

roi_raw_masks = {}  # tag -> bool array shape (91,109,91)
for tag, fn, name, mni in SOCIAL_BRAIN_ROIS:
    src_path = MASK_DIR / fn
    if not src_path.exists():
        print(f"  [MISSING] {tag}: {fn}")
        continue
    src_img = nib.load(str(src_path))
    mask = resample_any_overlap(src_img, affine_2mm, (NX0, NY0, NZ0))
    roi_raw_masks[tag] = mask
    print(f"  {tag:10s} {name:30s} MNI {mni} -> {int(mask.sum())} voxels (2mm MNI)")

# ── Pad arrays for viewer ─────────────────────────────────────────────────
mni_p = np.pad(mni_data, PAD, mode='constant', constant_values=0)
NX, NY, NZ = mni_p.shape

mni_norm = mni_p.copy()
p98 = np.percentile(mni_norm[mni_norm > 0], 98) if np.any(mni_norm > 0) else 1
mni_norm = np.clip(mni_norm / (p98 + 1e-10), 0, 1)
brain_mask = mni_p > 0.01

roi_masks_p = {tag: np.pad(m, PAD, mode='constant', constant_values=False)
               for tag, m in roi_raw_masks.items()}

# ── Slice rendering ────────────────────────────────────────────────────────
def render_slice(view, idx, overlay_mask_p):
    if view == 'axial':
        bg = np.rot90(mni_norm[:, :, idx])
        ov = np.rot90(overlay_mask_p[:, :, idx])
    elif view == 'sagittal':
        bg = np.rot90(mni_norm[idx, :, :])
        ov = np.rot90(overlay_mask_p[idx, :, :])
    else:
        bg = np.rot90(mni_norm[:, idx, :])
        ov = np.rot90(overlay_mask_p[:, idx, :])
    fig = plt.figure(figsize=(FIG_SIZE, FIG_SIZE), facecolor='black', dpi=FIG_DPI)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_facecolor('black')
    ax.imshow(bg, cmap='gray', vmin=0, vmax=1, aspect='equal', interpolation='bilinear')
    if ov.any():
        rgba = np.zeros(ov.shape + (4,))
        rgba[ov, 0] = 0.96
        rgba[ov, 1] = 0.35
        rgba[ov, 2] = 0.25
        rgba[ov, 3] = 0.65
        ax.imshow(rgba, aspect='equal', interpolation='nearest')
    if view in ('axial', 'coronal'):
        ax.text(0.02, 0.97, 'L', transform=ax.transAxes, color='white',
                fontsize=10, fontweight='bold', va='top')
        ax.text(0.98, 0.97, 'R', transform=ax.transAxes, color='white',
                fontsize=10, fontweight='bold', va='top', ha='right')
    ax.axis('off')
    buf = io.BytesIO()
    fig.savefig(buf, format='jpeg', facecolor='black', dpi=FIG_DPI, pil_kwargs={'quality': 72})
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
        bounds[f'{name}_lo'] = max(c_lo, b_lo)
        bounds[f'{name}_hi'] = min(c_hi, b_hi)
    return bounds

# ── Render slices for each ROI ────────────────────────────────────────────
print(f"\nRendering slices for {len(ROI_ORDER)} ROIs...")
roi_slices, roi_bounds, roi_voxel_info = {}, {}, {}
roi_peak, roi_cluster_voxels = {}, {}

for tag in ROI_ORDER:
    if tag not in roi_masks_p:
        continue
    t0 = time.time()
    mask_p = roi_masks_p[tag]
    bounds = scroll_range_for_mask(mask_p)
    ijk = np.array(np.where(mask_p))
    bounds['zoom_x0'] = int(max(0, ijk[0].min() - ZOOM_PAD))
    bounds['zoom_x1'] = int(min(NX-1, ijk[0].max() + ZOOM_PAD))
    bounds['zoom_y0'] = int(max(0, ijk[1].min() - ZOOM_PAD))
    bounds['zoom_y1'] = int(min(NY-1, ijk[1].max() + ZOOM_PAD))
    bounds['zoom_z0'] = int(max(0, ijk[2].min() - ZOOM_PAD))
    bounds['zoom_z1'] = int(min(NZ-1, ijk[2].max() + ZOOM_PAD))
    roi_bounds[tag] = bounds

    # Peak = consensus MNI coord in padded voxel coords
    mni = ROI_META[tag]['mni']
    center_vox = affine_inv @ np.array([mni[0], mni[1], mni[2], 1])
    peak_p = [int(round(center_vox[0])) + PAD,
              int(round(center_vox[1])) + PAD,
              int(round(center_vox[2])) + PAD]
    roi_peak[tag] = peak_p

    sl = {'axial': {}, 'sagittal': {}, 'coronal': {}}
    for z in range(bounds['z_lo'], bounds['z_hi']+1):
        sl['axial'][z] = render_slice('axial', z, mask_p)
    for x in range(bounds['x_lo'], bounds['x_hi']+1):
        sl['sagittal'][x] = render_slice('sagittal', x, mask_p)
    for y in range(bounds['y_lo'], bounds['y_hi']+1):
        sl['coronal'][y] = render_slice('coronal', y, mask_p)
    roi_slices[tag] = sl

    vi = {}
    for i in range(bounds['x_lo'], bounds['x_hi']+1):
        for j in range(bounds['y_lo'], bounds['y_hi']+1):
            for k in range(bounds['z_lo'], bounds['z_hi']+1):
                key = f"{i},{j},{k}"
                orig = (i - PAD, j - PAD, k - PAD)
                lbl = atlas_label(orig)
                nears = nearby_regions(orig, max_dist_vox=3, max_results=3)
                entry = {"r": lbl}
                if nears:
                    entry["nb"] = [[n, d] for n, d in nears]
                vi[key] = entry
    roi_voxel_info[tag] = vi

    cl_voxels = np.array(np.where(mask_p)).T
    roi_cluster_voxels[tag] = [f"{int(v[0])},{int(v[1])},{int(v[2])}" for v in cl_voxels]
    elapsed = time.time() - t0
    n_slices = len(sl['axial']) + len(sl['sagittal']) + len(sl['coronal'])
    print(f"  {tag:10s} {n_slices} slices, {len(vi)} voxel labels [{elapsed:.1f}s]")

# ── Load Alcalá analysis results ─────────────────────────────────────────
print("\nLoading Alcalá-López analysis results...")

# 1. Model alignment
with open(DATA_DIR / "social_brain_learning_rsa_alcala_results.json") as f:
    ma_raw = json.load(f)
model_alignment = {r['roi_key']: r for r in ma_raw['results']}

# 2. Temporal warped ISC × SA
with open(DATA_DIR / "isc_social_brain_alcala_results.json") as f:
    ti_raw = json.load(f)
temporal_isc = {r['tag']: r for r in ti_raw['results']}

# 3. Spatial LOO pattern ISC × SA (Nice/Mean)
with open(DATA_DIR / "isrsa_spatial_alcala_results.json") as f:
    sp_raw = json.load(f)
spatial_mod = {
    'Nice': {r['tag']: r for r in sp_raw['conditions']['Nice']},
    'Mean': {r['tag']: r for r in sp_raw['conditions']['Mean']},
}

# 4. Whole-brain Schaefer 400 (unchanged; loaded for JSON completeness)
with open(DATA_DIR / "wholebrain_400_temporal_isc_results.json") as f:
    wb_temporal = json.load(f)
with open(DATA_DIR / "wholebrain_400_loo_isc_results.json") as f:
    wb_spatial = json.load(f)

print(f"  model_alignment: {len(model_alignment)} ROIs")
print(f"  temporal_isc: {len(temporal_isc)} ROIs")
print(f"  spatial_mod Nice: {len(spatial_mod['Nice'])} / Mean: {len(spatial_mod['Mean'])}")
print(f"  wb_temporal: {wb_temporal['n_parcels']} parcels")

# ── Build unified per-ROI stats ───────────────────────────────────────────
print("\nBuilding unified per-ROI stats...")
roi_stats = {}
for tag in ROI_ORDER:
    ma = model_alignment.get(tag, {})
    ti = temporal_isc.get(tag, {})
    sn = spatial_mod['Nice'].get(tag, {})
    sm = spatial_mod['Mean'].get(tag, {})
    roi_stats[tag] = {
        'tag': tag,
        'name': ROI_META[tag]['name'],
        'mni': list(ROI_META[tag]['mni']),
        'n_voxels': ti.get('n_voxels', ma.get('n_voxels', 0)),
        # Model alignment
        'ma_b_SA': ma.get('b_SA'),
        'ma_t_SA': ma.get('t_SA'),
        'ma_p_SA_perm': ma.get('p_SA_perm'),
        'ma_q_SA': ma.get('q_SA_fdr'),
        'ma_b_interaction': ma.get('b_interaction'),
        'ma_t_interaction': ma.get('t_interaction'),
        'ma_p_interaction_perm': ma.get('p_interaction_perm'),
        'ma_q_interaction': ma.get('q_interaction_fdr'),
        'ma_b_run': ma.get('b_run'),
        'ma_rho_run1': ma.get('rho_run1'),
        'ma_rho_run2': ma.get('rho_run2'),
        'ma_rho_run3': ma.get('rho_run3'),
        'ma_rho_run4': ma.get('rho_run4'),
        # Temporal ISC
        'ti_mean_isc_z': ti.get('mean_isc_z'),
        'ti_group_t': ti.get('group_t'),
        'ti_rho_SA': ti.get('rho'),
        'ti_p_SA': ti.get('p'),
        'ti_q_SA': ti.get('q_fdr'),
        # Spatial Nice
        'sn_mean_isc_z': sn.get('mean_isc_z'),
        'sn_group_t': sn.get('group_t'),
        'sn_rho': sn.get('rho'),
        'sn_p': sn.get('p'),
        'sn_q': sn.get('q_fdr'),
        # Spatial Mean
        'sm_mean_isc_z': sm.get('mean_isc_z'),
        'sm_group_t': sm.get('group_t'),
        'sm_rho': sm.get('rho'),
        'sm_p': sm.get('p'),
        'sm_q': sm.get('q_fdr'),
    }

# ── Write JS data files ──────────────────────────────────────────────────
print("\nWriting JS data files...")

def write_js(path, name, obj):
    path.write_text(f"const {name}={json.dumps(obj, separators=(',',':'))};\n")
    mb = os.path.getsize(path) / (1024*1024)
    print(f"  {path.name}: {mb:.2f} MB")

roi_slices_js = {}
for tag in ROI_ORDER:
    if tag not in roi_slices:
        continue
    sl = {}
    for view in ['axial', 'sagittal', 'coronal']:
        sl[view] = {str(k): f"data:image/jpeg;base64,{v}" for k, v in roi_slices[tag][view].items()}
    roi_slices_js[tag] = sl
write_js(OUTPUT_DIR / "roi_slices.js", "ROI_SLICES", roi_slices_js)

roi_meta_js = {}
for tag in ROI_ORDER:
    if tag not in roi_bounds:
        continue
    roi_meta_js[tag] = {
        'name': ROI_META[tag]['name'],
        'mni': list(ROI_META[tag]['mni']),
        'peak_p': roi_peak[tag],
        'bounds': roi_bounds[tag],
        'vi': roi_voxel_info[tag],
        'cv': roi_cluster_voxels[tag],
    }
write_js(OUTPUT_DIR / "roi_meta.js", "ROI_META", roi_meta_js)

stats_js_obj = {
    'order': ROI_ORDER,
    'stats': roi_stats,
    'n_subjects': 33,
    'meta': {
        'atlas': 'Alcalá-López et al. (2018) Cerebral Cortex — region-grown 200 GM voxels',
        'sa_measure': 'SCARED-C social anxiety subscale',
        'n_rois': len(ROI_ORDER),
    }
}
write_js(OUTPUT_DIR / "stats.js", "REPORT", stats_js_obj)

affine_js_obj = {
    'affine': affine_2mm.tolist(),
    'pad': PAD,
    'nx': NX, 'ny': NY, 'nz': NZ, 'px': PX,
}
write_js(OUTPUT_DIR / "affine.js", "AFF_META", affine_js_obj)

print("\nDone. roi_slices.js / roi_meta.js / stats.js / affine.js written.")
