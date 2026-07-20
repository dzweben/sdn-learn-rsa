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

# ── Imports ──────────────────────────────────────────────────────────────
# os/sys/json/time/glob: filesystem + I/O + timing + wildcard file matching.
import os, sys, json, time, glob
# numpy: all array math (parcel means, correlations, medians).
import numpy as np
# scipy.stats: Spearman correlation, one-sample t-test.
from scipy import stats as sp_stats
# interp1d: builds the piecewise-linear maps used by the temporal warp.
from scipy.interpolate import interp1d
# affine_transform: resamples the Schaefer atlas volume onto the LEARN data grid
# by applying a voxel->voxel affine (nearest-neighbour for integer parcel labels).
from scipy.ndimage import affine_transform
# nibabel: read/write NIfTI + AFNI +tlrc volumes (headers carry the world affine).
import nibabel as nib

# ── config.sh env (defaults so it also runs standalone) ──────────────────
# Study root on the HPC cluster. All other paths are derived from it unless the
# corresponding config.sh env var overrides them.
TOPDIR  = "/data/projects/STUDIES/LEARN/fMRI"
# The RSA-learn working directory (fixed events, timing, derivatives) lives here.
RSA_DIR = "{}/RSA-learn".format(TOPDIR)
# Per-subject AFNI GLM output roots - one numeric-named dir per subject.
RESULTS_DIR = os.environ.get("GLMDIR",     "{}/derivatives/afni/IndvlLvlAnalyses".format(RSA_DIR))
# Timing dir holding the run-wise .1D onset files (feedback events per run).
TIMING_DIR  = os.environ.get("TIMING",     "{}/timing".format(RSA_DIR))
# Group EPI brain mask (AFNI +tlrc) - defines which voxels are "in brain".
MASK_PATH   = os.environ.get("GROUP_MASK", "{}/Masks/LEARN_Grp90+tlrc.HEAD".format(TOPDIR))
# Clinical CSV holding the SA measure + the Usable_fMRI inclusion flag.
CLINICAL_CSV= os.environ.get("CLINICAL",   "{}/analysis/learn_clinical.csv".format(RSA_DIR))
# Where the results JSON is written.
OUT_DIR     = os.environ.get("RESULTS",    "{}/derivatives/afni/results".format(RSA_DIR))
# GLM label suffix that names the per-subject "...results.<label>" folder.
GLM_LABEL   = os.environ.get("GLM_LABEL",  "feedback_runwise_glm")
# Which clinical column is the "SA" (social anxiety) score to correlate ISC against.
MEASURE     = os.environ.get("MEASURE",    "scared_ch_social")

# ── Acquisition / design constants ───────────────────────────────────────
TR = 1.75          # repetition time in seconds (one BOLD volume every 1.75 s).
N_TRS = 217        # number of usable volumes per run (timeseries length).
N_RUNS = 4         # task runs per subject.
N_PARCELS = 400    # Schaefer atlas parcel count (nominal max label id).
MIN_VOXELS = 5     # a parcel must have >= this many in-mask voxels to be tested.


# ── helpers (identical to the original producer) ─────────────────────────
def fdr_bh(pvals):
    # Benjamini-Hochberg FDR step-up procedure. Returns per-parcel adjusted
    # q-values (same order as the input p-values).
    pvals = np.array(pvals, dtype=float)          # coerce to float array.
    n = len(pvals)                                # number of tests.
    if n == 0: return np.array([])                # nothing to correct.
    order = np.argsort(pvals)                     # indices that sort p ascending.
    # ranks[k] = rank (1..n) of the k-th test's p-value in ascending order.
    ranks = np.empty(n, dtype=int); ranks[order] = np.arange(1, n + 1)
    # Raw BH adjustment: p * n / rank, capped at 1.0 (the classic p*(n/i)).
    adjusted = np.minimum(1.0, pvals * n / ranks)
    # Enforce monotonicity: walk from LARGEST p to smallest and take a running
    # minimum so adjusted q never increases as p decreases (BH step-up).
    o = np.argsort(pvals)[::-1]                    # indices sorted p DESCENDING.
    adjusted_sorted = adjusted[o].copy()           # adjusted values in that order.
    for i in range(1, len(adjusted_sorted)):
        # each entry ≤ the previous (larger-p) entry -> cumulative minimum.
        adjusted_sorted[i] = min(adjusted_sorted[i], adjusted_sorted[i - 1])
    # Scatter the monotone values back to original parcel positions.
    result = np.empty(n); result[o] = adjusted_sorted
    return result


def resample_atlas_to_data(atlas_img, data_img):
    # Resample the atlas volume (its own 2mm grid) onto the LEARN data grid by
    # composing the two world affines into a single voxel->voxel transform.
    atlas_data = np.asanyarray(atlas_img.dataobj).astype(np.int32)   # integer parcel labels.
    if atlas_data.ndim == 4: atlas_data = atlas_data[:, :, :, 0]      # drop trailing singleton if 4D.
    data_shape = data_img.shape[:3]                                  # target (output) grid shape.
    # Inverse of the atlas world affine: world-mm -> atlas voxel index.
    atlas_inv = np.linalg.inv(atlas_img.affine)
    # combined = (world->atlas_vox) ∘ (data_vox->world) = data_vox -> atlas_vox.
    # So for each OUTPUT (data) voxel we know which atlas voxel to sample.
    combined = atlas_inv.dot(data_img.affine)
    resampled = affine_transform(
        atlas_data.astype(np.float64),   # affine_transform wants float input.
        combined[:3, :3],                # 3x3 rotation/scale (matrix part).
        offset=combined[:3, 3],          # translation part (voxel offset).
        output_shape=data_shape,         # produce a volume on the data grid.
        order=0,                         # NEAREST-neighbour: never blend label ids.
        mode='constant', cval=0          # out-of-atlas locations -> label 0 (background).
    ).astype(np.int32)                   # back to integer parcel labels.
    return resampled


def compute_leave_one_out_isc(all_ts):
    # Leave-one-out ISC: correlate each subject's timeseries against the mean of
    # all OTHER subjects, then Fisher-z transform. Input rows = subjects.
    n_subj, n_tp = all_ts.shape                    # subjects × timepoints.
    isc = np.full(n_subj, np.nan)                  # output vector (one z per subject).
    all_sum = np.sum(all_ts, axis=0)               # sum over subjects (reused per i).
    for i in range(n_subj):
        # Mean of the OTHERS: subtract subject i, divide by remaining count.
        others_mean = (all_sum - all_ts[i]) / (n_subj - 1)
        # Skip degenerate cases where a correlation is undefined (flat series).
        if np.std(all_ts[i]) == 0 or np.std(others_mean) == 0:
            continue
        # Pearson r between this subject and the leave-one-out group mean.
        r = np.corrcoef(all_ts[i], others_mean)[0, 1]
        # Clip away from ±1 so arctanh stays finite.
        r = np.clip(r, -0.999, 0.999)
        # Fisher z-transform so ISC values can be averaged/tested normally.
        isc[i] = np.arctanh(r)
    return isc


def load_all_feedback_onsets(subj_id, run):
    # Read this subject's feedback-event onset times (seconds) for one run from
    # the AFNI-style .1D timing files.
    subj_timing = os.path.join(TIMING_DIR, "sub-{}".format(subj_id))
    if not os.path.isdir(subj_timing): return []   # no timing -> no onsets.
    onsets = []
    # All non-parametrically-modulated feedback timing files for this run.
    for f in glob.glob(os.path.join(subj_timing, "NonPM_*_fdk*_run{}.1D".format(run))):
        with open(f) as fh:
            lines = fh.readlines()
            # AFNI .1D layout is one row per run; row (run-1) holds this run's onsets.
            line = lines[run - 1].strip() if run <= len(lines) else ""
            # '*' is AFNI's "no events this run" placeholder -> skip.
            if line and line != '*':
                for entry in line.split():
                    # Each token is "onset:duration"; keep only the onset (seconds).
                    onsets.append(float(entry.split(':')[0]))
    return sorted(onsets)                           # ascending onset times.


def temporal_warp(ts, subj_onsets, ref_onsets, n_trs, tr):
    # Warp one subject's run so its feedback events land on the GROUP-MEDIAN
    # (reference) event times - makes ISC compare like-for-like moments.
    # Anchor both timelines at the run boundaries [0 .. n_trs*tr] so the warp is
    # bounded and monotone at the ends.
    subj_times = [0.0] + list(subj_onsets) + [n_trs * tr]   # this subject's event times + endpoints.
    ref_times  = [0.0] + list(ref_onsets)  + [n_trs * tr]   # reference event times + endpoints.
    # Piecewise-linear map: reference time -> this subject's time. Outside the
    # anchored range, clamp to the endpoint values (no extrapolation blow-up).
    ref_to_subj = interp1d(ref_times, subj_times, kind='linear', bounds_error=False,
                           fill_value=(subj_times[0], subj_times[-1]))
    subj_tr_times = np.arange(n_trs) * tr                    # real acquisition time of each subject TR.
    # For each reference-grid TR time, find the subject-time to sample from.
    mapped = ref_to_subj(np.arange(n_trs) * tr)
    # Interpolator over the subject's actual BOLD samples vs their TR times;
    # clamp beyond the ends to the first/last sample.
    ts_interp = interp1d(subj_tr_times, ts, kind='linear', bounds_error=False,
                         fill_value=(ts[0], ts[-1]))
    # Resample the BOLD at the mapped subject-times -> warped series on the ref grid.
    return ts_interp(mapped)


def load_schaefer_atlas(target_img):
    """Schaefer-400 2mm from nilearn, resampled to the data grid via affine_transform.
    Returns (resampled_int_atlas_on_target_grid, {parcel_id -> name})."""
    from nilearn import datasets                    # lazy import (network fetch on first use).
    # Download/cache the Schaefer 2018 400-parcel, 2mm atlas.
    atlas = datasets.fetch_atlas_schaefer_2018(n_rois=N_PARCELS, resolution_mm=2)
    # nilearn may hand back a loaded image or a path; normalise to a nibabel image.
    atlas_img = atlas.maps if hasattr(atlas.maps, "get_fdata") else nib.load(atlas.maps)
    # Move the atlas onto the LEARN grid so parcel ids line up with the data voxels.
    resampled = resample_atlas_to_data(atlas_img, target_img)
    # Decode label byte-strings to plain str (nilearn returns bytes in some versions).
    labels = [l.decode() if isinstance(l, bytes) else str(l) for l in atlas.labels]
    # VERSION GUARD. nilearn >= ~0.11 prepends a "Background" entry to atlas.labels
    # (401 entries for a 400-parcel atlas); older versions do not (400 entries).
    # Left unhandled this shifts every parcel name by one, so the same voxels get
    # reported under a neighbouring parcel's name on different machines. Drop the
    # Background entry so labels[0] always corresponds to parcel id 1.
    if labels and labels[0].strip().lower() == "background":
        labels = labels[1:]
    # Map integer parcel id (1..400) -> human-readable name. Labels list is 0-indexed,
    # atlas parcel ids are 1-indexed, hence i+1.
    names = {i + 1: labels[i] for i in range(len(labels))}
    return resampled, names


# ── main (faithful port of analysis/wholebrain_temporal_isc.py) ──────────
def main():
    import pandas as pd                            # clinical CSV handling (local import).
    t0 = time.time()                               # wall-clock start for progress prints.
    print("=" * 72)
    print("05 · WHOLE-BRAIN TEMPORALLY-WARPED ISC × SA - Schaefer 400 (per-run avg)")
    print("=" * 72)

    # ── group mask: which voxels count as brain ──────────────────────────
    mask_img = nib.load(MASK_PATH)                 # load group EPI mask volume.
    mask_data = mask_img.get_fdata()               # as float array.
    if mask_data.ndim == 4: mask_data = mask_data[:, :, :, 0]   # drop singleton time dim if present.
    mask_3d = (mask_data > 0).astype(int)          # binary in-brain mask (1/0).
    print("Mask: {} voxels".format(int(np.sum(mask_3d))))

    # ── atlas -> parcel voxel coords within mask ─────────────────────────
    print("Loading + resampling Schaefer-{} atlas...".format(N_PARCELS))
    # Resample atlas onto the mask's grid (mask_img supplies the target affine/shape).
    atlas_resampled, parcel_names = load_schaefer_atlas(mask_img)
    # Zero out any parcel voxels that fall outside the brain mask (keep only in-brain).
    atlas_resampled = atlas_resampled * mask_3d
    # Distinct parcel ids actually present after masking, dropping background 0.
    unique_labels = np.unique(atlas_resampled); unique_labels = unique_labels[unique_labels > 0]
    parcel_voxels = {}                             # parcel id -> array of (i,j,k) voxel coords.
    for lab in unique_labels:
        coords = np.argwhere(atlas_resampled == lab)   # all voxel indices in this parcel.
        if len(coords) >= MIN_VOXELS:                  # drop tiny parcels (unstable means).
            parcel_voxels[int(lab)] = coords
    parcel_ids = sorted(parcel_voxels.keys())      # stable ordering of tested parcels.
    n_parcels = len(parcel_ids)                    # number of parcels that survive the size filter.
    print("{} parcels with >= {} voxels".format(n_parcels, MIN_VOXELS))

    # ── subjects: intersect GLM output dirs with the usable-fMRI clinical set ─
    # All numeric-named subject dirs that actually have a GLM output folder.
    all_subjects = sorted([d for d in os.listdir(RESULTS_DIR)
                           if d.isdigit() and os.path.isdir(os.path.join(RESULTS_DIR, d))], key=int)
    df = pd.read_csv(CLINICAL_CSV)                  # clinical table.
    df["s"] = df["s"].astype(str)                  # subject ids as strings to match dir names.
    df = df[df["Usable_fMRI"] == 1].copy()         # keep only the analytic (usable-fMRI) sample.
    clinical_subjects = set(df["s"].values)        # set of usable subject ids.
    # Final subject list: has GLM output AND is flagged usable.
    keep_subjects = [s for s in all_subjects if str(s) in clinical_subjects]

    # ── load full pb04 parcel-mean timeseries + onsets ───────────────────
    print("\nLoading timeseries + timing...")
    parcel_ts = {}; all_onsets = {}; loaded_subjects = []   # per-subject caches.
    for si, subj_id in enumerate(keep_subjects):
        # Path to this subject's AFNI results dir (pb04 = last preprocessing block, scaled).
        subj_dir = os.path.join(RESULTS_DIR, subj_id, "{}.results.{}/".format(subj_id, GLM_LABEL))
        subj_runs = {}; subj_onsets = {}; runs_loaded = 0    # per-run caches for this subject.
        for run in range(1, N_RUNS + 1):
            # Scaled preprocessed timeseries volume for this run.
            pb04 = os.path.join(subj_dir, "pb04.{}.r{:02d}.scale+tlrc.HEAD".format(subj_id, run))
            if not os.path.exists(pb04): continue           # skip missing runs.
            onsets = load_all_feedback_onsets(subj_id, run) # feedback onset times for the warp.
            if not onsets: continue                         # no events -> can't warp this run.
            data = np.asanyarray(nib.load(pb04).dataobj, dtype=np.float32)   # 4D BOLD (x,y,z,t).
            if data.ndim != 4 or data.shape[3] < N_TRS: continue   # need a full-length 4D run.
            data = data[:, :, :, :N_TRS]                    # trim/standardise to N_TRS volumes.
            # Parcel-mean timeseries matrix: rows = parcels, cols = TRs.
            rp = np.full((n_parcels, N_TRS), np.nan, dtype=np.float32)
            for pi, lab in enumerate(parcel_ids):
                c = parcel_voxels[lab]                      # (i,j,k) voxels in this parcel.
                # Average across the parcel's voxels at every timepoint (nan-safe).
                rp[pi] = np.nanmean(data[c[:, 0], c[:, 1], c[:, 2], :], axis=0)
            subj_runs[run] = rp; subj_onsets[run] = onsets; runs_loaded += 1
        if runs_loaded >= 2:                                # need >=2 runs to average ISC across runs.
            parcel_ts[subj_id] = subj_runs; all_onsets[subj_id] = subj_onsets
            loaded_subjects.append(subj_id)
        if (si + 1) % 5 == 0:                               # periodic progress print.
            print("  loaded {}/{} ({:.0f}s)".format(si + 1, len(keep_subjects), time.time() - t0))
    n_subjects = len(loaded_subjects)                       # final analysable N.
    print("Loaded {} subjects".format(n_subjects))

    # ── SA scores (subject order = loaded_subjects) ──────────────────────
    df = df[df["s"].isin(loaded_subjects)].copy()           # restrict clinical to loaded subjects.
    df["s_int"] = df["s"].astype(int); df = df.sort_values("s_int")   # numeric sort for consistency.
    # Map subject id -> SA score (coerce non-numeric to NaN).
    sa_map = dict(zip(df["s"].values, pd.to_numeric(df[MEASURE], errors="coerce").values))
    # SA vector aligned to loaded_subjects order (this is the ISC-per-subject order too).
    sa_scores = np.array([sa_map.get(s, np.nan) for s in loaded_subjects])

    # ── common runs: runs present for EVERY loaded subject ───────────────
    common_runs = None
    for s in loaded_subjects:
        r = set(parcel_ts[s].keys())                        # runs this subject has.
        common_runs = r if common_runs is None else common_runs & r   # intersect across subjects.
    common_runs = sorted(common_runs)
    print("Common runs: {}".format(common_runs))

    # ── reference onsets per run (median across subjects, truncated) ──────
    ref_onsets_per_run = {}
    for run in common_runs:
        # Everyone must contribute the same number of events; use the minimum count.
        min_events = min(len(all_onsets[s][run]) for s in loaded_subjects)
        # Stack the first min_events onsets from every subject: subjects × events.
        onset_matrix = np.array([all_onsets[s][run][:min_events] for s in loaded_subjects])
        # Group-median onset time per event slot -> the reference timeline to warp to.
        ref_onsets_per_run[run] = np.median(onset_matrix, axis=0).tolist()

    # ── per parcel: per-run warp+zscore+LOO ISC, average across runs ──────
    print("Warping + per-run LOO ISC across {} parcels...".format(n_parcels))
    results = []
    for pi, lab in enumerate(parcel_ids):
        run_isc_vals = []                                   # one LOO-ISC vector per run.
        for run in common_runs:
            ref_onsets = ref_onsets_per_run[run]; min_events = len(ref_onsets)   # this run's reference grid.
            run_data = []; valid = True                     # warped z-scored series for all subjects.
            for s in loaded_subjects:
                ts = parcel_ts[s][run][pi]                  # this subject/run/parcel timeseries.
                if np.any(np.isnan(ts)): valid = False; break   # bad parcel-mean -> drop this run.
                subj_ons = all_onsets[s][run][:min_events]  # match the reference event count.
                warped = temporal_warp(ts, subj_ons, ref_onsets, N_TRS, TR)   # align events to ref grid.
                if np.std(warped) > 0:
                    # z-score within run so ISC reflects timecourse shape, not scale/offset.
                    warped = (warped - np.mean(warped)) / np.std(warped)
                run_data.append(warped)
            # Require a clean, complete set of subjects for this run or skip it.
            if not valid or len(run_data) < n_subjects: continue
            # Leave-one-out ISC (Fisher-z) computed WITHIN this run only.
            run_isc_vals.append(compute_leave_one_out_isc(np.stack(run_data, axis=0)))
        # Need at least two runs to justify the per-run-then-average design.
        if len(run_isc_vals) < 2: continue
        # AVERAGE ISC across runs per subject (NOT concatenated timeseries) - this
        # is the key methodological choice that matches the reported result.
        isc_mean = np.nanmean(np.stack(run_isc_vals, axis=0), axis=0)
        valid_mask = ~np.isnan(isc_mean)                    # subjects with a defined mean ISC.
        if valid_mask.sum() < 10: continue                  # too few subjects -> skip parcel.
        # Group-level test that mean ISC differs from 0 (is there shared signal at all).
        t_stat, _ = sp_stats.ttest_1samp(isc_mean[valid_mask], 0)
        valid_both = valid_mask & ~np.isnan(sa_scores)      # subjects with BOTH ISC and SA.
        if valid_both.sum() < 10: continue                  # need enough pairs for a stable rho.
        # Spearman correlation: does inter-subject synchrony track social anxiety?
        rho, p = sp_stats.spearmanr(isc_mean[valid_both], sa_scores[valid_both])
        results.append({
            "parcel_id": lab,                               # atlas parcel id (1..400).
            "name": parcel_names.get(lab, "Parcel_{}".format(lab)),   # Schaefer/Yeo name.
            "n_voxels": len(parcel_voxels[lab]),            # in-mask voxel count.
            "mean_isc_z": float(np.mean(isc_mean[valid_mask])),   # avg Fisher-z ISC (synchrony level).
            "group_t": float(t_stat),                       # t vs 0 (shared-signal strength).
            "rho": float(rho), "p": float(p),               # ISC-vs-SA Spearman rho and its p.
        })

    # ── multiple comparisons across all tested parcels ───────────────────
    ps = np.array([r["p"] for r in results]); qs = fdr_bh(ps)   # BH-FDR over the parcel p-values.
    for i, r in enumerate(results): r["q_fdr"] = float(qs[i])   # attach q to each parcel record.
    sorted_r = sorted(results, key=lambda x: x["p"])            # rank parcels by ascending p.

    # ── console summary ──────────────────────────────────────────────────
    n_unc = sum(1 for r in results if r["p"] < 0.05)           # uncorrected hits.
    n_fdr = sum(1 for r in results if r["q_fdr"] < 0.05)       # FDR-surviving hits.
    print("\n  n={}, {} parcels tested: {} unc p<.05, {} FDR q<.05".format(
        n_subjects, len(results), n_unc, n_fdr))
    for r in sorted_r[:8]:                                      # print the 8 strongest parcels.
        # *** = FDR survivor, * = uncorrected-only, blank = neither.
        flag = "***" if r["q_fdr"] < 0.05 else ("*" if r["p"] < 0.05 else "")
        print("    {:36s} rho={:+.3f} p={:.5f} q={:.3f} {}".format(
            r["name"].replace("7Networks_", "")[:36], r["rho"], r["p"], r["q_fdr"], flag))

    # ── serialize full results to JSON ───────────────────────────────────
    out = {
        "analysis": "whole-brain temporally-warped ISC vs SA",
        "method": "warped_temporal_ISC",
        "condition": "full_task_warped",
        "parcellation": "Schaefer {} (Yeo 7 networks)".format(N_PARCELS),
        "isc_method": "leave-one-out per run, averaged across runs (Nastase et al., 2019)",
        "measure": MEASURE,                                    # SA column used.
        "n_subjects": n_subjects,                              # analysable N.
        "n_parcels": len(results),                             # parcels actually tested.
        "n_trs": N_TRS,
        "n_uncorrected": n_unc,
        "n_fdr": n_fdr,
        "results": sorted_r,                                   # per-parcel stats, p-sorted.
    }
    path = os.path.join(OUT_DIR, "wholebrain_400_temporal_isc_results.json")
    os.makedirs(OUT_DIR, exist_ok=True)                        # ensure output dir exists.
    with open(path, "w") as f: json.dump(out, f)              # write results JSON.
    print("\n  wrote {}".format(path))
    print("  total {:.1f} min".format((time.time() - t0) / 60))   # total runtime.


if __name__ == "__main__":
    main()
