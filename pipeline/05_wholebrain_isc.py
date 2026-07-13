#!/usr/bin/env python3
"""
05 · Whole-brain Temporal ISC (Schaefer-400)   (FINDING #3)
==========================================================
Whole-brain extension of FINDING #2's temporal ISC: the SAME warped-timeseries
leave-one-out ISC, applied to every Schaefer-400 cortical parcel, FDR across the
whole cortex.

Faithful port of the original producer (analysis/wholebrain_temporal_isc.py):
  per subject, per run:
    - parcel-mean of the FULL pb04 timeseries (all 217 TRs)
    - temporal-warp to group-median feedback-event onsets (piecewise linear)
    - z-score the warped run
  per parcel: leave-one-out ISC (Fisher-z) **within each run**, then AVERAGE the
  per-run ISC across runs; Spearman(mean ISC, SA); BH-FDR across parcels.

  -> RH_Cont_Cing_2 (dorsal medial-frontal, near aMCC/rACC) is the FDR survivor
     (rho=-0.649, q=0.017), converging with FINDING #1 (rACC) and #2 (rACC/aMCC).

IMPORTANT: ISC is per-run-then-averaged (NOT concatenated), matching the reported
result. Atlas is Schaefer-400 2mm (nilearn); resampled to the data grid with the
original affine_transform (nearest) step.

Paths & label come from pipeline/config.sh (env: GLMDIR, TIMING, GROUP_MASK,
CLINICAL, RESULTS, GLM_LABEL, MEASURE).
Output: $RESULTS/wholebrain_400_temporal_isc_results.json

Run (after sourcing config):  python3 pipeline/05_wholebrain_isc.py
"""

import os, sys, json, time, glob
import numpy as np
from scipy import stats as sp_stats
from scipy.interpolate import interp1d
from scipy.ndimage import affine_transform
import nibabel as nib

# ── config.sh env (defaults so it also runs standalone) ──────────────────
TOPDIR  = "/data/projects/STUDIES/LEARN/fMRI"
RSA_DIR = "{}/RSA-learn".format(TOPDIR)
RESULTS_DIR = os.environ.get("GLMDIR",     "{}/derivatives/afni/IndvlLvlAnalyses".format(RSA_DIR))
TIMING_DIR  = os.environ.get("TIMING",     "{}/timing".format(RSA_DIR))
MASK_PATH   = os.environ.get("GROUP_MASK", "{}/Masks/LEARN_Grp90+tlrc.HEAD".format(TOPDIR))
CLINICAL_CSV= os.environ.get("CLINICAL",   "{}/analysis/learn_clinical.csv".format(RSA_DIR))
OUT_DIR     = os.environ.get("RESULTS",    "{}/derivatives/afni/results".format(RSA_DIR))
GLM_LABEL   = os.environ.get("GLM_LABEL",  "feedback_runwise_glm")
MEASURE     = os.environ.get("MEASURE",    "scared_ch_social")

TR = 1.75
N_TRS = 217
N_RUNS = 4
N_PARCELS = 400
MIN_VOXELS = 5


# ── helpers (identical to the original producer) ─────────────────────────
def fdr_bh(pvals):
    pvals = np.array(pvals, dtype=float)
    n = len(pvals)
    if n == 0: return np.array([])
    order = np.argsort(pvals)
    ranks = np.empty(n, dtype=int); ranks[order] = np.arange(1, n + 1)
    adjusted = np.minimum(1.0, pvals * n / ranks)
    o = np.argsort(pvals)[::-1]
    adjusted_sorted = adjusted[o].copy()
    for i in range(1, len(adjusted_sorted)):
        adjusted_sorted[i] = min(adjusted_sorted[i], adjusted_sorted[i - 1])
    result = np.empty(n); result[o] = adjusted_sorted
    return result


def resample_atlas_to_data(atlas_img, data_img):
    atlas_data = np.asanyarray(atlas_img.dataobj).astype(np.int32)
    if atlas_data.ndim == 4: atlas_data = atlas_data[:, :, :, 0]
    data_shape = data_img.shape[:3]
    atlas_inv = np.linalg.inv(atlas_img.affine)
    combined = atlas_inv.dot(data_img.affine)
    resampled = affine_transform(
        atlas_data.astype(np.float64),
        combined[:3, :3], offset=combined[:3, 3],
        output_shape=data_shape, order=0, mode='constant', cval=0
    ).astype(np.int32)
    return resampled


def compute_leave_one_out_isc(all_ts):
    n_subj, n_tp = all_ts.shape
    isc = np.full(n_subj, np.nan)
    all_sum = np.sum(all_ts, axis=0)
    for i in range(n_subj):
        others_mean = (all_sum - all_ts[i]) / (n_subj - 1)
        if np.std(all_ts[i]) == 0 or np.std(others_mean) == 0:
            continue
        r = np.corrcoef(all_ts[i], others_mean)[0, 1]
        r = np.clip(r, -0.999, 0.999)
        isc[i] = np.arctanh(r)
    return isc


def load_all_feedback_onsets(subj_id, run):
    subj_timing = os.path.join(TIMING_DIR, "sub-{}".format(subj_id))
    if not os.path.isdir(subj_timing): return []
    onsets = []
    for f in glob.glob(os.path.join(subj_timing, "NonPM_*_fdk*_run{}.1D".format(run))):
        with open(f) as fh:
            lines = fh.readlines()
            line = lines[run - 1].strip() if run <= len(lines) else ""
            if line and line != '*':
                for entry in line.split():
                    onsets.append(float(entry.split(':')[0]))
    return sorted(onsets)


def temporal_warp(ts, subj_onsets, ref_onsets, n_trs, tr):
    subj_times = [0.0] + list(subj_onsets) + [n_trs * tr]
    ref_times  = [0.0] + list(ref_onsets)  + [n_trs * tr]
    ref_to_subj = interp1d(ref_times, subj_times, kind='linear', bounds_error=False,
                           fill_value=(subj_times[0], subj_times[-1]))
    subj_tr_times = np.arange(n_trs) * tr
    mapped = ref_to_subj(np.arange(n_trs) * tr)
    ts_interp = interp1d(subj_tr_times, ts, kind='linear', bounds_error=False,
                         fill_value=(ts[0], ts[-1]))
    return ts_interp(mapped)


def load_schaefer_atlas(target_img):
    """Schaefer-400 2mm from nilearn, resampled to the data grid via affine_transform.
    Returns (resampled_int_atlas_on_target_grid, {parcel_id -> name})."""
    from nilearn import datasets
    atlas = datasets.fetch_atlas_schaefer_2018(n_rois=N_PARCELS, resolution_mm=2)
    atlas_img = atlas.maps if hasattr(atlas.maps, "get_fdata") else nib.load(atlas.maps)
    resampled = resample_atlas_to_data(atlas_img, target_img)
    labels = [l.decode() if isinstance(l, bytes) else str(l) for l in atlas.labels]
    names = {i + 1: labels[i] for i in range(len(labels))}  # nilearn labels are 1-indexed parcels
    return resampled, names


# ── main (faithful port of analysis/wholebrain_temporal_isc.py) ──────────
def main():
    import pandas as pd
    t0 = time.time()
    print("=" * 72)
    print("05 · WHOLE-BRAIN TEMPORALLY-WARPED ISC × SA — Schaefer 400 (per-run avg)")
    print("=" * 72)

    # group mask
    mask_img = nib.load(MASK_PATH)
    mask_data = mask_img.get_fdata()
    if mask_data.ndim == 4: mask_data = mask_data[:, :, :, 0]
    mask_3d = (mask_data > 0).astype(int)
    print("Mask: {} voxels".format(int(np.sum(mask_3d))))

    # atlas -> parcel voxel coords within mask
    print("Loading + resampling Schaefer-{} atlas...".format(N_PARCELS))
    atlas_resampled, parcel_names = load_schaefer_atlas(mask_img)
    atlas_resampled = atlas_resampled * mask_3d
    unique_labels = np.unique(atlas_resampled); unique_labels = unique_labels[unique_labels > 0]
    parcel_voxels = {}
    for lab in unique_labels:
        coords = np.argwhere(atlas_resampled == lab)
        if len(coords) >= MIN_VOXELS:
            parcel_voxels[int(lab)] = coords
    parcel_ids = sorted(parcel_voxels.keys())
    n_parcels = len(parcel_ids)
    print("{} parcels with >= {} voxels".format(n_parcels, MIN_VOXELS))

    # subjects
    all_subjects = sorted([d for d in os.listdir(RESULTS_DIR)
                           if d.isdigit() and os.path.isdir(os.path.join(RESULTS_DIR, d))], key=int)
    df = pd.read_csv(CLINICAL_CSV)
    df["s"] = df["s"].astype(str)
    df = df[df["Usable_fMRI"] == 1].copy()
    clinical_subjects = set(df["s"].values)
    keep_subjects = [s for s in all_subjects if str(s) in clinical_subjects]

    # load full pb04 parcel-mean timeseries + onsets
    print("\nLoading timeseries + timing...")
    parcel_ts = {}; all_onsets = {}; loaded_subjects = []
    for si, subj_id in enumerate(keep_subjects):
        subj_dir = os.path.join(RESULTS_DIR, subj_id, "{}.results.{}/".format(subj_id, GLM_LABEL))
        subj_runs = {}; subj_onsets = {}; runs_loaded = 0
        for run in range(1, N_RUNS + 1):
            pb04 = os.path.join(subj_dir, "pb04.{}.r{:02d}.scale+tlrc.HEAD".format(subj_id, run))
            if not os.path.exists(pb04): continue
            onsets = load_all_feedback_onsets(subj_id, run)
            if not onsets: continue
            data = np.asanyarray(nib.load(pb04).dataobj, dtype=np.float32)
            if data.ndim != 4 or data.shape[3] < N_TRS: continue
            data = data[:, :, :, :N_TRS]
            rp = np.full((n_parcels, N_TRS), np.nan, dtype=np.float32)
            for pi, lab in enumerate(parcel_ids):
                c = parcel_voxels[lab]
                rp[pi] = np.nanmean(data[c[:, 0], c[:, 1], c[:, 2], :], axis=0)
            subj_runs[run] = rp; subj_onsets[run] = onsets; runs_loaded += 1
        if runs_loaded >= 2:
            parcel_ts[subj_id] = subj_runs; all_onsets[subj_id] = subj_onsets
            loaded_subjects.append(subj_id)
        if (si + 1) % 5 == 0:
            print("  loaded {}/{} ({:.0f}s)".format(si + 1, len(keep_subjects), time.time() - t0))
    n_subjects = len(loaded_subjects)
    print("Loaded {} subjects".format(n_subjects))

    # SA scores (subject order = loaded_subjects)
    df = df[df["s"].isin(loaded_subjects)].copy()
    df["s_int"] = df["s"].astype(int); df = df.sort_values("s_int")
    sa_map = dict(zip(df["s"].values, pd.to_numeric(df[MEASURE], errors="coerce").values))
    sa_scores = np.array([sa_map.get(s, np.nan) for s in loaded_subjects])

    # common runs
    common_runs = None
    for s in loaded_subjects:
        r = set(parcel_ts[s].keys()); common_runs = r if common_runs is None else common_runs & r
    common_runs = sorted(common_runs)
    print("Common runs: {}".format(common_runs))

    # reference onsets per run (median across subjects, truncated to min event count)
    ref_onsets_per_run = {}
    for run in common_runs:
        min_events = min(len(all_onsets[s][run]) for s in loaded_subjects)
        onset_matrix = np.array([all_onsets[s][run][:min_events] for s in loaded_subjects])
        ref_onsets_per_run[run] = np.median(onset_matrix, axis=0).tolist()

    # per parcel: per-run warp+zscore+LOO ISC, average across runs
    print("Warping + per-run LOO ISC across {} parcels...".format(n_parcels))
    results = []
    for pi, lab in enumerate(parcel_ids):
        run_isc_vals = []
        for run in common_runs:
            ref_onsets = ref_onsets_per_run[run]; min_events = len(ref_onsets)
            run_data = []; valid = True
            for s in loaded_subjects:
                ts = parcel_ts[s][run][pi]
                if np.any(np.isnan(ts)): valid = False; break
                subj_ons = all_onsets[s][run][:min_events]
                warped = temporal_warp(ts, subj_ons, ref_onsets, N_TRS, TR)
                if np.std(warped) > 0:
                    warped = (warped - np.mean(warped)) / np.std(warped)
                run_data.append(warped)
            if not valid or len(run_data) < n_subjects: continue
            run_isc_vals.append(compute_leave_one_out_isc(np.stack(run_data, axis=0)))
        if len(run_isc_vals) < 2: continue
        isc_mean = np.nanmean(np.stack(run_isc_vals, axis=0), axis=0)
        valid_mask = ~np.isnan(isc_mean)
        if valid_mask.sum() < 10: continue
        t_stat, _ = sp_stats.ttest_1samp(isc_mean[valid_mask], 0)
        valid_both = valid_mask & ~np.isnan(sa_scores)
        if valid_both.sum() < 10: continue
        rho, p = sp_stats.spearmanr(isc_mean[valid_both], sa_scores[valid_both])
        results.append({
            "parcel_id": lab,
            "name": parcel_names.get(lab, "Parcel_{}".format(lab)),
            "n_voxels": len(parcel_voxels[lab]),
            "mean_isc_z": float(np.mean(isc_mean[valid_mask])),
            "group_t": float(t_stat),
            "rho": float(rho), "p": float(p),
        })

    ps = np.array([r["p"] for r in results]); qs = fdr_bh(ps)
    for i, r in enumerate(results): r["q_fdr"] = float(qs[i])
    sorted_r = sorted(results, key=lambda x: x["p"])

    n_unc = sum(1 for r in results if r["p"] < 0.05)
    n_fdr = sum(1 for r in results if r["q_fdr"] < 0.05)
    print("\n  n={}, {} parcels tested: {} unc p<.05, {} FDR q<.05".format(
        n_subjects, len(results), n_unc, n_fdr))
    for r in sorted_r[:8]:
        flag = "***" if r["q_fdr"] < 0.05 else ("*" if r["p"] < 0.05 else "")
        print("    {:36s} rho={:+.3f} p={:.5f} q={:.3f} {}".format(
            r["name"].replace("7Networks_", "")[:36], r["rho"], r["p"], r["q_fdr"], flag))

    out = {
        "analysis": "whole-brain temporally-warped ISC vs SA",
        "method": "warped_temporal_ISC",
        "condition": "full_task_warped",
        "parcellation": "Schaefer {} (Yeo 7 networks)".format(N_PARCELS),
        "isc_method": "leave-one-out per run, averaged across runs (Nastase et al., 2019)",
        "measure": MEASURE,
        "n_subjects": n_subjects,
        "n_parcels": len(results),
        "n_trs": N_TRS,
        "n_uncorrected": n_unc,
        "n_fdr": n_fdr,
        "results": sorted_r,
    }
    path = os.path.join(OUT_DIR, "wholebrain_400_temporal_isc_results.json")
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(path, "w") as f: json.dump(out, f)
    print("\n  wrote {}".format(path))
    print("  total {:.1f} min".format((time.time() - t0) / 60))


if __name__ == "__main__":
    main()
