"""
Build the LEARN social-brain ROI atlas.

This rebuilds the exact 36 regions used in the LEARN RSA and ISC analyses and
writes them out as an atlas anyone can download, load, and view.

The 36 regions:
  30 cortical spheres, 10 mm radius, centered on the peak coordinates from the
     social-brain meta-analysis of Alcala-Lopez et al. (2018).
  6  subcortical structures (hippocampus, amygdala, nucleus accumbens, each
     hemisphere) taken from the Harvard-Oxford subcortical atlas at the 25
     percent probability threshold.

Every region is intersected with the LEARN group brain mask, so the atlas sits
on the same grid and in the same space (MNI152 2009, tlrc) as the betas the
analyses used. That means these files are the regions that were analyzed, not
an approximation.

Inputs (both already exist on the analysis machine):
  GROUP_MASK : the LEARN group brain mask that defines the grid and affine
  HO_PATH    : the Harvard-Oxford subcortical atlas from FSL

Outputs (written next to this script):
  LEARN_social_brain_ROIs.nii.gz   one labeled volume, values 1..36
  LEARN_social_brain_ROIs.tsv      the label table (index, name, coordinates)
  LEARN_social_brain_ROIs.json     the same table, machine readable
  masks/NN-TAG.nii.gz              one binary mask per region
  preview.png                      a quick montage of the whole atlas

Run:
  python make_atlas.py
"""

import json
import os

import numpy as np
import nibabel as nib
from nilearn import image as nl_image

# --- inputs -----------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
GROUP_MASK = os.environ.get(
    "GROUP_MASK",
    "/data/projects/STUDIES/LEARN/fMRI/Masks/LEARN_Grp90+tlrc.HEAD")
HO_PATH = os.environ.get(
    "HO_PATH",
    "/usr/local/fsl/data/atlases/HarvardOxford/HarvardOxford-sub-maxprob-thr25-2mm.nii.gz")
OUT = HERE

SPHERE_RADIUS_MM = 10

# Harvard-Oxford subcortical label ids at the 25 percent threshold.
HO_LABELS = {
    "HC_L": 9,  "HC_R": 19,
    "AM_L": 10, "AM_R": 20,
    "NAC_L": 11, "NAC_R": 21,
}

# (tag, full name, MNI peak in mm, type). Order sets the atlas label 1..36.
ROIS = [
    ("IFG_R",   "R inferior frontal gyrus",  (48, 24, 2),     "sphere"),
    ("IFG_L",   "L inferior frontal gyrus",  (-45, 27, -3),   "sphere"),
    ("rACC",    "Rostral ACC",               (-3, 41, 4),     "sphere"),
    ("vmPFC",   "vmPFC",                     (2, 45, -15),    "sphere"),
    ("MTG_R",   "R middle temporal gyrus",   (56, -10, -17),  "sphere"),
    ("MTG_L",   "L middle temporal gyrus",   (-56, -14, -13), "sphere"),
    ("Prec",    "Precuneus",                 (-1, -59, 41),   "sphere"),
    ("TPJ_R",   "R temporoparietal junction",(54, -55, 20),   "sphere"),
    ("TPJ_L",   "L temporoparietal junction",(-49, -61, 27),  "sphere"),
    ("TP_R",    "R temporal pole",           (53, 7, -26),    "sphere"),
    ("TP_L",    "L temporal pole",           (-48, 8, -36),   "sphere"),
    ("FP",      "Medial frontal pole",       (1, 58, 10),     "sphere"),
    ("PCC",     "Posterior cingulate cortex",(-1, -54, 23),   "sphere"),
    ("dmPFC",   "dmPFC",                     (-4, 53, 31),    "sphere"),
    ("MT_V5_R", "R MT/V5",                   (50, -66, 6),    "sphere"),
    ("MT_V5_L", "L MT/V5",                   (-50, -66, 5),   "sphere"),
    ("FG_R",    "R fusiform gyrus",          (43, -57, -19),  "sphere"),
    ("FG_L",    "L fusiform gyrus",          (-42, -62, -16), "sphere"),
    ("pSTS_R",  "R posterior STS",           (54, -39, 0),    "sphere"),
    ("pSTS_L",  "L posterior STS",           (-56, -39, 2),   "sphere"),
    ("SMA_R",   "R supplementary motor area",(48, 6, 35),     "sphere"),
    ("SMA_L",   "L supplementary motor area",(-41, 6, 45),    "sphere"),
    ("AI_R",    "R anterior insula",         (38, 18, -3),    "sphere"),
    ("AI_L",    "L anterior insula",         (-34, 19, 0),    "sphere"),
    ("SMG_R",   "R supramarginal gyrus",     (54, -30, 38),   "sphere"),
    ("SMG_L",   "L supramarginal gyrus",     (-41, -41, 42),  "sphere"),
    ("Cereb_R", "R cerebellum",              (28, -70, -30),  "sphere"),
    ("Cereb_L", "L cerebellum",              (-21, -66, -35), "sphere"),
    ("aMCC",    "Anterior mid-cingulate",    (1, 25, 30),     "sphere"),
    ("pMCC",    "Posterior mid-cingulate",   (-3, -29, 32),   "sphere"),
    ("HC_R",    "R hippocampus",             (25, -19, -15),  "ho"),
    ("HC_L",    "L hippocampus",             (-24, -18, -17), "ho"),
    ("AM_R",    "R amygdala",                (23, -3, -18),   "ho"),
    ("AM_L",    "L amygdala",                (-21, -4, -18),  "ho"),
    ("NAC_R",   "R nucleus accumbens",       (11, 10, -7),    "ho"),
    ("NAC_L",   "L nucleus accumbens",       (-13, 11, -8),   "ho"),
]


def hemisphere(tag):
    if tag.endswith("_R"):
        return "right"
    if tag.endswith("_L"):
        return "left"
    return "midline"


def main():
    print("group mask:", GROUP_MASK)
    print("HO atlas  :", HO_PATH)

    mask_img = nib.load(GROUP_MASK)
    affine = mask_img.affine
    brain = np.asanyarray(mask_img.dataobj)
    if brain.ndim == 4:
        brain = brain[..., 0]
    brain = brain > 0
    shape = brain.shape
    voxel_sizes = np.sqrt(np.sum(affine[:3, :3] ** 2, axis=0))
    affine_inv = np.linalg.inv(affine)

    # Harvard-Oxford atlas resliced onto the LEARN grid, nearest neighbor so the
    # integer label ids stay exact.
    ho_img = nib.load(HO_PATH)
    ho_res = nl_image.resample_to_img(ho_img, mask_img, interpolation="nearest")
    ho_data = np.asanyarray(ho_res.dataobj).astype(int)
    if ho_data.ndim == 4:
        ho_data = ho_data[..., 0]

    os.makedirs(os.path.join(OUT, "masks"), exist_ok=True)

    label_vol = np.zeros(shape, np.int16)   # the combined atlas
    best_dist = np.full(shape, np.inf)      # for resolving sphere overlaps by nearest center
    rows = []

    ii, jj, kk = np.ogrid[:shape[0], :shape[1], :shape[2]]

    for idx, (tag, name, mni, mtype) in enumerate(ROIS, start=1):
        center = np.round(affine_inv @ np.array([mni[0], mni[1], mni[2], 1.0])).astype(int)[:3]
        if mtype == "sphere":
            dist_sq = (((ii - center[0]) * voxel_sizes[0]) ** 2
                       + ((jj - center[1]) * voxel_sizes[1]) ** 2
                       + ((kk - center[2]) * voxel_sizes[2]) ** 2)
            m = (dist_sq <= SPHERE_RADIUS_MM ** 2) & brain
        else:
            m = (ho_data == HO_LABELS[tag]) & brain

        n_vox = int(m.sum())

        # write the individual binary mask
        fname = "%02d-%s.nii.gz" % (idx, tag)
        nib.save(nib.Nifti1Image(m.astype(np.uint8), affine),
                 os.path.join(OUT, "masks", fname))

        # paint into the combined atlas, giving overlapping voxels to the region
        # whose center is nearest
        coords = np.argwhere(m)
        d = np.sqrt((((coords - center) * voxel_sizes) ** 2).sum(axis=1))
        for (vi, vj, vk), dd in zip(coords, d):
            if dd < best_dist[vi, vj, vk]:
                best_dist[vi, vj, vk] = dd
                label_vol[vi, vj, vk] = idx

        source = ("Alcala-Lopez et al. 2018, 10 mm sphere"
                  if mtype == "sphere"
                  else "Harvard-Oxford subcortical, 25% threshold")
        rows.append({
            "index": idx, "tag": tag, "name": name,
            "hemisphere": hemisphere(tag),
            "category": "sphere" if mtype == "sphere" else "subcortical",
            "mni_x": mni[0], "mni_y": mni[1], "mni_z": mni[2],
            "n_voxels": n_vox, "source": source,
        })
        print("  %2d  %-8s %-28s n_vox=%4d" % (idx, tag, name, n_vox))

    # write the combined labeled atlas
    nib.save(nib.Nifti1Image(label_vol, affine),
             os.path.join(OUT, "LEARN_social_brain_ROIs.nii.gz"))

    # write the label table (tsv)
    cols = ["index", "tag", "name", "hemisphere", "category",
            "mni_x", "mni_y", "mni_z", "n_voxels", "source"]
    with open(os.path.join(OUT, "LEARN_social_brain_ROIs.tsv"), "w") as f:
        f.write("\t".join(cols) + "\n")
        for r in rows:
            f.write("\t".join(str(r[c]) for c in cols) + "\n")

    # write the label table (json) with a small header block
    hdr = {
        "name": "LEARN social-brain ROIs",
        "n_regions": len(rows),
        "space": "MNI152 2009 (AFNI tlrc), LEARN group-mask grid",
        "grid_shape": list(shape),
        "voxel_size_mm": [round(float(v), 3) for v in voxel_sizes],
        "sphere_radius_mm": SPHERE_RADIUS_MM,
        "cortical_source": "Alcala-Lopez et al. 2018",
        "subcortical_source": "Harvard-Oxford subcortical atlas, 25% threshold",
        "regions": rows,
    }
    with open(os.path.join(OUT, "LEARN_social_brain_ROIs.json"), "w") as f:
        json.dump(hdr, f, indent=2)

    # quick preview montage
    try:
        import matplotlib
        matplotlib.use("Agg")
        from nilearn import plotting
        atlas_img = nib.load(os.path.join(OUT, "LEARN_social_brain_ROIs.nii.gz"))
        disp = plotting.plot_roi(atlas_img, display_mode="mosaic",
                                 cmap="gist_ncar", title="LEARN social-brain ROIs (36)",
                                 annotate=False, colorbar=False)
        disp.savefig(os.path.join(OUT, "preview.png"), dpi=140)
        disp.close()
        print("preview.png written")
    except Exception as e:
        print("preview skipped:", e)

    print("\ngrid:", shape, " voxel size mm:", [round(float(v), 2) for v in voxel_sizes])
    print("total labeled voxels:", int((label_vol > 0).sum()))
    print("done. wrote atlas, tsv, json, 36 masks.")


if __name__ == "__main__":
    main()
