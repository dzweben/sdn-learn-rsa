#!/usr/bin/env bash
set -euo pipefail

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA-learn Stage 5: Voxel-Wise Pattern Extraction
#
# PURPOSE:
#   Extracts the FULL voxel-wise beta pattern within each
#   ROI mask for every subject and condition.  This is the
#   multi-voxel data required for RSA.
#
# WHY THIS EXISTS (Stage 4 vs Stage 5):
#   Stage 4 extracted ROI MEANS — one scalar per condition
#   per ROI per subject (using 3dROIstats -nzmean).
#
#   Stage 5 extracts VOXEL PATTERNS — one vector per
#   condition per ROI per subject (using 3dmaskdump).
#
#   RSA computes dissimilarity as 1 − Pearson r between
#   condition vectors. Pearson r requires vectors, not
#   scalars. Without the full voxel pattern, RSA cannot
#   be computed.
#
# WHAT IT PRODUCES:
#   Per subject, per ROI: a .1D text matrix where
#     rows    = 53 conditions (32 feedback + 16 per-run prediction + 4 response + 1 anticipation)
#     columns = N voxels     (varies by ROI)
#
#   Missing conditions (fallback subjects with 2-3 runs)
#   are filled with rows of "nan".
#
# CROSS-VALIDATION:
#   For every extracted pattern, the script computes its
#   non-zero mean and compares against the known-good
#   NZmean value from the Stage 4/4b CSVs. Any discrepancy
#   beyond tolerance is flagged.  This catches:
#     - wrong sub-brick index mapping
#     - mask alignment / grid mismatch
#     - voxel counting errors
#     - data corruption
#
# AFNI TOOLS USED:
#   3dmaskdump   dumps voxel values within a mask
#   3dresample   resamples masks to the GLM grid
#   3dUndump     creates sphere masks (dmPFC)
#   3dinfo       reads dataset grid dimensions
#   1dtranspose  transposes .1D matrices
#
# OUTPUT LAYOUT:
#   derivatives/afni/ROI_patterns/
#     <ROI>/
#       sub-<id>_<ROI>_patterns.1D   (53 x N_voxels)
#     masks_resampled/
#       <ROI>_glmgrid+tlrc.HEAD/BRIK
#     condition_labels.txt
#     voxel_counts.csv
#     cross_validation.csv
#
# DOWNSTREAM USAGE (Python):
#   import numpy as np
#   P = np.genfromtxt('sub-958_vmPFC_patterns.1D', comments='#')
#   # P.shape = (53, n_voxels)
#   # Within-subject RDM:
#   RDM = 1 - np.corrcoef(P)
#
# USAGE:
#   bash scripts/5_extract_patterns.sh
#   DRY_RUN=1 bash scripts/5_extract_patterns.sh
#
# ENVIRONMENT OVERRIDES:
#   RESULTS_DIR=...       GLM results location
#   MASKS_DIR=...         mask location
#   ANATOMICAL_ROIS=...   shared mask archive root
#   OUT_DIR=...           output directory
#   STAGE4_DIR=...        Stage 4/4b CSV location
#   CROSS_VALIDATE=0      disable cross-validation
#   XVAL_TOL=0.001        cross-validation tolerance
#   DRY_RUN=1             verify setup without extracting
#
# Author: RSA-learn pipeline
# Date: 2026-03-13

############################################################################################
# CONFIGURATION
############################################################################################

TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
RSA_DIR="$TOPDIR/RSA-learn"
RESULTS_DIR="${RESULTS_DIR:-$RSA_DIR/derivatives/afni/IndvlLvlAnalyses}"
MASKS_DIR="${MASKS_DIR:-$TOPDIR/Masks}"
OUT_DIR="${OUT_DIR:-$RSA_DIR/derivatives/afni/ROI_patterns}"
STAGE4_DIR="${STAGE4_DIR:-$RSA_DIR/derivatives/afni/ROI_extractions}"
LOG_DIR="$RSA_DIR/logs"
GLM="LEARN_RSA_runwise_AFNI"
DRY_RUN="${DRY_RUN:-0}"
CROSS_VALIDATE="${CROSS_VALIDATE:-1}"
XVAL_TOL="${XVAL_TOL:-0.001}"

# R-TPJ source (Mars et al. 2012 parcellation)
ANATOMICAL_ROIS="${ANATOMICAL_ROIS:-/data/AnatomicalROI_Masks/ROIs}"
RTPJ_SOURCE="$ANATOMICAL_ROIS/MNI_MarsTPJParcellation/TPJ_thr50_summaryimage_3mm_clustALL_R.nii.gz"

# dmPFC sphere parameters (Schurz et al. 2014)
DMPFC_MNI_X=0
DMPFC_MNI_Y=54
DMPFC_MNI_Z=33
DMPFC_RADIUS=8   # mm

mkdir -p "$OUT_DIR" "$LOG_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOGFILE="$LOG_DIR/5_extract_patterns_${TIMESTAMP}.log"

# Resampled masks stored here (on GLM grid)
MASK_RESAMP_DIR="$OUT_DIR/masks_resampled"
mkdir -p "$MASK_RESAMP_DIR"

# -------------------------------------------------------
# ROI DEFINITIONS — all 8 ROIs (core 6 + mentalizing 2)
# -------------------------------------------------------
# Source masks: original files at original resolution.
# RTPJ and dmPFC are handled specially (resample / create).
# -------------------------------------------------------

ROI_NAMES=( vmPFC dACC1 dACC2 AntInsula VS Amygdala RTPJ dmPFC )

ROI_SOURCES=(
    "$MASKS_DIR/VMPFC-mask-final.nii.gz"
    "$MASKS_DIR/dACC1-6mm-bilat.nii.gz"
    "$MASKS_DIR/dACC2-6mm-bilat.nii.gz"
    "$MASKS_DIR/AntInsula-thr10-3mm-bilat.nii.gz"
    "$MASKS_DIR/striatum-structural-3mm-VS-bilat.nii.gz"
    "$MASKS_DIR/Amyg_LR_resample+tlrc"
    "__RTPJ__"
    "__DMPFC__"
)

# Resampled mask paths (built on GLM grid)
ROI_MASKS=()
for roi in "${ROI_NAMES[@]}"; do
    ROI_MASKS+=("$MASK_RESAMP_DIR/${roi}_glmgrid+tlrc")
done

# -------------------------------------------------------
# CONDITIONS TO EXTRACT  (matches new GLM with 53 regressors)
# -------------------------------------------------------
# 32 run-wise feedback  (FBM/FBN x 4 peers x 4 runs)
# 16 run-wise prediction (Pred x 4 peers x 4 runs)  ← NEW (was 4 collapsed)
#  4 response            (Resp x 4 peers, collapsed)
#  1 anticipation
# = 53 total
# -------------------------------------------------------

ALL_CONDS=()

for run in 1 2 3 4; do
    for peer in Mean60 Mean80 Nice60 Nice80; do
        ALL_CONDS+=("FBM.${peer}.r${run}")
        ALL_CONDS+=("FBN.${peer}.r${run}")
    done
done

# Per-peer per-run prediction betas (NEW — was 4 collapsed Pred.{peer})
for run in 1 2 3 4; do
    for peer in Mean60 Mean80 Nice60 Nice80; do
        ALL_CONDS+=("Pred.${peer}.r${run}")
    done
done

# Response betas stay collapsed across runs (1 per peer)
for peer in Mean60 Mean80 Nice60 Nice80; do
    ALL_CONDS+=("Resp.${peer}")
done

ALL_CONDS+=("Anticipation.PredFdk")

N_CONDS=${#ALL_CONDS[@]}

############################################################################################
# FUNCTIONS
############################################################################################

log() {
    echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOGFILE"
}

get_stats_prefix() {
    # Returns the stats file prefix (no .HEAD/.BRIK suffix).
    # Args: $1 = subject ID (e.g. "958")
    local subj="$1"
    echo "$RESULTS_DIR/$subj/$subj.results.$GLM/stats.$subj+tlrc"
}

parse_label_map() {
    # Parse BRICK_LABS from an AFNI HEAD file into LABEL_IDX.
    # Identical to Stage 4 — pure bash, no AFNI dependency.
    #
    # Args: $1 = path to stats HEAD file
    # Side effect: populates global associative array LABEL_IDX
    #   LABEL_IDX["FBM.Mean60.r1#0_Coef"] = 1
    #   LABEL_IDX["FBM.Mean60.r1#0_Tstat"] = 2
    #   ...

    local head_file="$1"
    local labels_raw
    labels_raw=$(grep -A 2 "^name = BRICK_LABS" "$head_file" | tail -1 | tr -d "'")

    LABEL_IDX=()

    local idx=0
    local IFS='~'
    for label in $labels_raw; do
        if [[ -n "$label" ]]; then
            LABEL_IDX["$label"]=$idx
            ((idx++)) || true
        fi
    done
}

resample_one_mask() {
    # Resample a single mask to the GLM grid using 3dresample -rmode NN.
    # Args:
    #   $1 = source mask path (NIfTI or AFNI)
    #   $2 = output prefix (AFNI +tlrc, WITHOUT .HEAD)
    #   $3 = master grid dataset (the first subject's stats file)

    local src="$1" dst="$2" master="$3"

    3dresample \
        -master "${master}.HEAD" \
        -rmode NN \
        -prefix "$dst" \
        -overwrite \
        -input "$src" 2>/dev/null
}

create_dmpfc_sphere() {
    # Create dmPFC 8mm sphere at Schurz et al. (2014) coordinates.
    # Identical to Stage 4b logic, including MNI→LPI conversion.
    # Args:
    #   $1 = output prefix (AFNI +tlrc, WITHOUT .HEAD)
    #   $2 = master grid dataset

    local dst="$1" master="$2"
    local tmpcoord
    tmpcoord=$(mktemp /tmp/dmpfc_coord.XXXXXX)

    # MNI (RAS) to LPI: negate ALL three axes
    awk -v x="$DMPFC_MNI_X" -v y="$DMPFC_MNI_Y" -v z="$DMPFC_MNI_Z" \
        'BEGIN { printf "%g %g %g\n", -x, -y, -z }' > "$tmpcoord"

    3dUndump \
        -prefix "$dst" \
        -srad "$DMPFC_RADIUS" \
        -orient LPI \
        -master "${master}.HEAD" \
        -overwrite \
        -xyz "$tmpcoord" 2>/dev/null

    rm -f "$tmpcoord"
}

############################################################################################
# MAIN
############################################################################################

log "============================================================"
log " RSA-learn Stage 5: Voxel-Wise Pattern Extraction"
log "============================================================"
log ""
log "  Stage 4 extracted ROI MEANS  (one number per condition)."
log "  Stage 5 extracts VOXEL PATTERNS (one vector per condition)."
log "  RSA requires patterns, not means."
log ""
log "Results dir:      $RESULTS_DIR"
log "Masks dir:        $MASKS_DIR"
log "Output dir:       $OUT_DIR"
log "Stage 4 CSVs:     $STAGE4_DIR"
log "GLM label:        $GLM"
log "Conditions:       $N_CONDS"
log "Cross-validate:   $CROSS_VALIDATE (tol=$XVAL_TOL)"
log "Dry run:          $DRY_RUN"
log ""

# =======================================================
# 1. VERIFY AFNI TOOLS
# =======================================================

if [[ "$DRY_RUN" -eq 0 ]]; then
    afni_ok=1
    for cmd in 3dmaskdump 3dresample 3dUndump 3dinfo 1dtranspose; do
        if ! command -v "$cmd" &>/dev/null; then
            log "ERROR: $cmd not found in PATH."
            afni_ok=0
        fi
    done
    if [[ "$afni_ok" -eq 0 ]]; then
        log "This script requires AFNI. Run on the server."
        exit 1
    fi
    log "AFNI check: 3dmaskdump, 3dresample, 3dUndump, 3dinfo, 1dtranspose — all found"
    log ""
fi

# =======================================================
# 2. DISCOVER SUBJECTS
# =======================================================

SUBJECTS=()
for subj_dir in "$RESULTS_DIR"/*/; do
    subj=$(basename "$subj_dir")
    [[ ! "$subj" =~ ^[0-9]+$ ]] && continue
    stats_prefix=$(get_stats_prefix "$subj")
    if [[ -f "${stats_prefix}.HEAD" ]]; then
        SUBJECTS+=("$subj")
    fi
done

IFS=$'\n' SUBJECTS=($(sort -n <<< "${SUBJECTS[*]}")); unset IFS

log "Found ${#SUBJECTS[@]} subjects with completed GLM results"
log "Subjects: ${SUBJECTS[*]}"
log ""

if [[ ${#SUBJECTS[@]} -eq 0 ]]; then
    log "ERROR: No subjects found. Check RESULTS_DIR."
    exit 1
fi

# =======================================================
# 3. RESAMPLE ALL MASKS TO GLM GRID
# =======================================================
# Stage 4 used 3dROIstats, which auto-resamples the mask
# on the fly.  3dmaskdump does NOT auto-resample — it
# requires the mask and data to be on the same grid.
# So we must explicitly resample every mask first.
#
# We use the first subject's stats file as the master grid.
# Step 5 below verifies all subjects share this grid.
# =======================================================

first_subj="${SUBJECTS[0]}"
master_grid="$(get_stats_prefix "$first_subj")"

log "=== Resampling all masks to GLM grid ==="
log "    Master grid: stats.${first_subj}+tlrc"
log ""

for roi_idx in "${!ROI_NAMES[@]}"; do
    roi="${ROI_NAMES[$roi_idx]}"
    source="${ROI_SOURCES[$roi_idx]}"
    target="${ROI_MASKS[$roi_idx]}"

    if [[ "$roi" == "RTPJ" ]]; then
        # R-TPJ: resample from Mars et al. (2012) parcellation
        if [[ ! -f "$RTPJ_SOURCE" ]]; then
            log "  MISS  RTPJ source: $RTPJ_SOURCE"
            continue
        fi
        if [[ "$DRY_RUN" -eq 0 ]]; then
            resample_one_mask "$RTPJ_SOURCE" "$target" "$master_grid"
        fi
        log "  OK    RTPJ <- Mars et al. (2012) R-TPJ parcellation"

    elif [[ "$roi" == "dmPFC" ]]; then
        # dmPFC: create 8mm sphere at Schurz (2014) coordinates
        if [[ "$DRY_RUN" -eq 0 ]]; then
            create_dmpfc_sphere "$target" "$master_grid"
        fi
        log "  OK    dmPFC <- 8mm sphere at MNI (0, 54, 33) [Schurz 2014]"

    else
        # Standard masks: resample from source
        if [[ "$source" == *"+tlrc" ]]; then
            src_check="${source}.HEAD"
        else
            src_check="$source"
        fi
        if [[ ! -f "$src_check" ]]; then
            log "  MISS  $roi source: $src_check"
            continue
        fi
        if [[ "$DRY_RUN" -eq 0 ]]; then
            resample_one_mask "$source" "$target" "$master_grid"
        fi
        log "  OK    $roi <- $(basename "$source")"
    fi
done
log ""

# =======================================================
# 4. VERIFY RESAMPLED MASKS AND COUNT VOXELS
# =======================================================

log "=== Verifying resampled masks ==="

declare -A VOXEL_COUNTS
mask_ok=0

for roi_idx in "${!ROI_NAMES[@]}"; do
    roi="${ROI_NAMES[$roi_idx]}"
    mask="${ROI_MASKS[$roi_idx]}"

    if [[ "$DRY_RUN" -eq 1 ]]; then
        log "  DRY   $roi (would verify)"
        VOXEL_COUNTS["$roi"]="?"
        ((mask_ok++)) || true
        continue
    fi

    if [[ ! -f "${mask}.HEAD" ]]; then
        log "  MISS  $roi — ${mask}.HEAD not found"
        VOXEL_COUNTS["$roi"]=0
        continue
    fi

    # Count non-zero voxels in the resampled mask.
    # 3dmaskdump -mask X X gives one line per non-zero voxel.
    n_vox=$(3dmaskdump -mask "$mask" -noijk "$mask" 2>/dev/null | wc -l | tr -d ' ')
    VOXEL_COUNTS["$roi"]=$n_vox

    if [[ "$n_vox" -eq 0 ]]; then
        log "  FAIL  $roi — 0 non-zero voxels after resampling!"
    else
        log "  OK    $roi — $n_vox voxels on GLM grid"
        ((mask_ok++)) || true
    fi
done

log ""
log "  Verified: $mask_ok / ${#ROI_NAMES[@]}"
log ""

if [[ "$mask_ok" -eq 0 ]]; then
    log "ERROR: No valid masks. Cannot proceed."
    exit 1
fi

# =======================================================
# 5. VERIFY ALL SUBJECTS ON SAME GRID
# =======================================================
# We resampled masks to the first subject's grid.
# If any other subject has a different grid, the
# extraction would silently use wrong voxels.
# This check catches that.
# =======================================================

if [[ "$DRY_RUN" -eq 0 ]]; then
    log "=== Grid consistency check ==="

    ref_dims=$(3dinfo -n4 "${master_grid}.HEAD" 2>/dev/null | tr -s ' ')
    grid_fail=0

    for subj in "${SUBJECTS[@]}"; do
        sp=$(get_stats_prefix "$subj")
        subj_dims=$(3dinfo -n4 "${sp}.HEAD" 2>/dev/null | tr -s ' ')
        if [[ "$subj_dims" != "$ref_dims" ]]; then
            log "  MISMATCH: sub-$subj ($subj_dims) vs reference ($ref_dims)"
            ((grid_fail++)) || true
        fi
    done

    if [[ "$grid_fail" -gt 0 ]]; then
        log "ERROR: $grid_fail subject(s) have mismatched grids."
        log "       Cannot use a single resampled mask for all."
        exit 1
    fi

    log "  OK    All ${#SUBJECTS[@]} subjects on same grid: $ref_dims"
    log ""
fi

# =======================================================
# 6. DRY RUN: verify and exit
# =======================================================

if [[ "$DRY_RUN" -eq 1 ]]; then
    log "=== DRY RUN: verifying sub-brick labels ==="
    log ""

    for subj in "${SUBJECTS[@]}"; do
        stats_prefix=$(get_stats_prefix "$subj")
        declare -A LABEL_IDX=()
        parse_label_map "${stats_prefix}.HEAD"

        n_found=0
        for cond in "${ALL_CONDS[@]}"; do
            [[ -n "${LABEL_IDX[${cond}#0_Coef]:-}" ]] && { ((n_found++)) || true; }
        done
        log "  sub-$subj: $n_found / $N_CONDS conditions"
        unset LABEL_IDX
    done

    log ""
    log "=== DRY RUN complete. Set DRY_RUN=0 to extract. ==="
    exit 0
fi

# =======================================================
# 7. WRITE CONDITION LABELS FILE
# =======================================================

labels_file="$OUT_DIR/condition_labels.txt"
printf '%s\n' "${ALL_CONDS[@]}" > "$labels_file"
log "Condition labels: $labels_file"
log ""

# =======================================================
# 8. MAIN EXTRACTION LOOP
# =======================================================

log "============================================================"
log " Beginning voxel-wise pattern extraction"
log "============================================================"
log ""

# Cross-validation tracking
xval_pass=0
xval_fail=0
xval_skip=0
xval_file="$OUT_DIR/cross_validation.csv"
echo "Subject,ROI,Condition,PatternNZMean,Stage4NZMean,AbsDiff,Status" > "$xval_file"

total_files=0

for roi_idx in "${!ROI_NAMES[@]}"; do
    roi="${ROI_NAMES[$roi_idx]}"
    mask="${ROI_MASKS[$roi_idx]}"
    roi_dir="$OUT_DIR/$roi"
    mkdir -p "$roi_dir"

    # Skip if mask is missing or empty
    if [[ ! -f "${mask}.HEAD" ]]; then
        log "SKIP $roi (mask not found)"
        continue
    fi
    n_voxels="${VOXEL_COUNTS[$roi]}"
    if [[ "$n_voxels" -eq 0 ]]; then
        log "SKIP $roi (0 voxels)"
        continue
    fi

    # Load Stage 4 CSV for cross-validation
    stage4_csv="$STAGE4_DIR/${roi}_betas.csv"
    if [[ "$CROSS_VALIDATE" -eq 1 && -f "$stage4_csv" ]]; then
        do_xval=1
    else
        do_xval=0
        if [[ "$CROSS_VALIDATE" -eq 1 ]]; then
            log "  NOTE: No Stage 4 CSV for $roi — skipping cross-validation"
        fi
    fi

    log "--- ROI: $roi ($n_voxels voxels) ---"
    log "    Mask:   $mask"
    log "    Output: $roi_dir/"

    n_done=0
    n_fallback=0
    roi_xval_fail=0

    for subj in "${SUBJECTS[@]}"; do
        stats_prefix=$(get_stats_prefix "$subj")
        head_file="${stats_prefix}.HEAD"
        output_file="$roi_dir/sub-${subj}_${roi}_patterns.1D"

        # --- Parse label map ---
        declare -A LABEL_IDX=()
        parse_label_map "$head_file"

        # --- Build sub-brick selector ---
        avail_indices=()
        has_data=()

        for cond in "${ALL_CONDS[@]}"; do
            local_idx="${LABEL_IDX[${cond}#0_Coef]:-}"
            if [[ -n "$local_idx" ]]; then
                avail_indices+=("$local_idx")
                has_data+=("1")
            else
                has_data+=("0")
            fi
        done

        n_avail=${#avail_indices[@]}

        if [[ $n_avail -eq 0 ]]; then
            log "    WARN: sub-$subj has 0 conditions, skipping"
            unset LABEL_IDX
            continue
        fi

        if [[ $n_avail -lt $N_CONDS ]]; then
            ((n_fallback++)) || true
        fi

        # --- Extract with 3dmaskdump ---
        selector=$(IFS=,; echo "${avail_indices[*]}")

        tmpdir=$(mktemp -d /tmp/rsa_s5.XXXXXX)
        trap "rm -rf '$tmpdir'" EXIT

        # Dump: output is [n_voxels rows × n_avail columns]
        3dmaskdump -mask "$mask" -noijk \
            "${stats_prefix}[${selector}]" \
            > "$tmpdir/raw.1D" 2>/dev/null

        # Verify voxel count
        actual_vox=$(wc -l < "$tmpdir/raw.1D" | tr -d ' ')
        if [[ "$actual_vox" -ne "$n_voxels" ]]; then
            log "    WARN: sub-$subj expected $n_voxels voxels, got $actual_vox"
        fi

        # Transpose: [n_avail rows × n_voxels columns]
        1dtranspose "$tmpdir/raw.1D" > "$tmpdir/transposed.1D" 2>/dev/null

        # Verify transposition dimensions
        trans_rows=$(wc -l < "$tmpdir/transposed.1D" | tr -d ' ')
        if [[ "$trans_rows" -ne "$n_avail" ]]; then
            log "    ERROR: sub-$subj transpose produced $trans_rows rows, expected $n_avail"
            unset LABEL_IDX
            rm -rf "$tmpdir"
            continue
        fi

        # --- Build final output file ---
        # Header comments
        {
            echo "# Subject: $subj"
            echo "# ROI: $roi"
            echo "# Dimensions: $N_CONDS conditions x $actual_vox voxels"
            echo "# Rows: conditions (see condition_labels.txt)"
            echo "# Cols: voxels within ROI mask"
            echo "# Generated: $(date '+%Y-%m-%d %H:%M:%S')"
            if [[ $n_avail -lt $N_CONDS ]]; then
                missing=""
                for ci in "${!ALL_CONDS[@]}"; do
                    [[ "${has_data[$ci]}" == "0" ]] && missing+=" ${ALL_CONDS[$ci]}"
                done
                echo "# Missing conditions ($((N_CONDS - n_avail))):$missing"
            fi
        } > "$output_file"

        if [[ $n_avail -eq $N_CONDS ]]; then
            # Fast path: all 53 conditions present
            cat "$tmpdir/transposed.1D" >> "$output_file"
        else
            # Fallback: insert NaN rows for missing conditions
            has_data_str=$(IFS=,; echo "${has_data[*]}")

            awk -v has_str="$has_data_str" -v nv="$actual_vox" '
            BEGIN {
                n_total = split(has_str, hd, ",")
            }
            {
                avail[++n_avail] = $0
            }
            END {
                # Build a NaN row string
                nan_row = ""
                for (j = 1; j <= nv; j++) {
                    if (j > 1) nan_row = nan_row " "
                    nan_row = nan_row "nan"
                }
                # Output 41 rows: real data or NaN
                ptr = 1
                for (i = 1; i <= n_total; i++) {
                    if (hd[i] == "1") {
                        print avail[ptr]
                        ptr++
                    } else {
                        print nan_row
                    }
                }
            }' "$tmpdir/transposed.1D" >> "$output_file"
        fi

        # Verify final file row count (excluding comment lines)
        final_rows=$(grep -cv '^#' "$output_file" || true)
        if [[ "$final_rows" -ne "$N_CONDS" ]]; then
            log "    ERROR: sub-$subj final file has $final_rows data rows, expected $N_CONDS"
        fi

        # --- Cross-validation against Stage 4 CSVs ---
        if [[ "$do_xval" -eq 1 ]]; then
            # Compute NZmean for every row in the transposed file
            # (one value per available condition)
            mapfile -t pattern_means < <(awk '{
                sum = 0; n = 0
                for (i = 1; i <= NF; i++) {
                    if ($i + 0 != 0) { sum += $i; n++ }
                }
                if (n > 0) printf "%.6f\n", sum / n
                else print "nan"
            }' "$tmpdir/transposed.1D")

            # Extract subject row from Stage 4 CSV
            mapfile -t s4_vals < <(awk -F, -v subj="$subj" '
                NR > 1 && $1 == subj {
                    for (i = 2; i <= NF; i++) print $i
                }
            ' "$stage4_csv")

            # Compare each available condition
            avail_ptr=0
            for ci in "${!ALL_CONDS[@]}"; do
                cond="${ALL_CONDS[$ci]}"
                if [[ "${has_data[$ci]}" == "1" ]]; then
                    pat_mean="${pattern_means[$avail_ptr]:-nan}"
                    s4_val="${s4_vals[$ci]:-}"

                    if [[ -z "$s4_val" || "$s4_val" == "NA" || "$pat_mean" == "nan" ]]; then
                        echo "$subj,$roi,$cond,$pat_mean,$s4_val,,SKIP" >> "$xval_file"
                        ((xval_skip++)) || true
                    else
                        abs_diff=$(awk -v a="$pat_mean" -v b="$s4_val" \
                            'BEGIN { d = a - b; if (d < 0) d = -d; printf "%.10f", d }')
                        status=$(awk -v d="$abs_diff" -v t="$XVAL_TOL" \
                            'BEGIN { print (d + 0 <= t + 0) ? "OK" : "FAIL" }')

                        echo "$subj,$roi,$cond,$pat_mean,$s4_val,$abs_diff,$status" >> "$xval_file"

                        if [[ "$status" == "OK" ]]; then
                            ((xval_pass++)) || true
                        else
                            ((xval_fail++)) || true
                            ((roi_xval_fail++)) || true
                            log "    XVAL FAIL: sub-$subj $cond  pattern=$pat_mean  stage4=$s4_val  diff=$abs_diff"
                        fi
                    fi
                    ((avail_ptr++)) || true
                fi
            done
        fi

        rm -rf "$tmpdir"
        unset LABEL_IDX
        ((n_done++)) || true
        ((total_files++)) || true

        # Progress every 10 subjects
        if (( n_done % 10 == 0 && n_done > 0 )); then
            log "    Progress: $n_done / ${#SUBJECTS[@]}"
        fi
    done

    log "    Complete: $n_done subjects ($n_fallback fallback)"
    if [[ "$do_xval" -eq 1 && "$roi_xval_fail" -gt 0 ]]; then
        log "    XVAL: $roi_xval_fail FAILURES in this ROI"
    fi
    log ""
done

# =======================================================
# 9. WRITE VOXEL COUNTS
# =======================================================

voxel_file="$OUT_DIR/voxel_counts.csv"
{
    echo "ROI,Voxels"
    for roi in "${ROI_NAMES[@]}"; do
        echo "$roi,${VOXEL_COUNTS[$roi]:-0}"
    done
} > "$voxel_file"
log "Voxel counts: $voxel_file"

# =======================================================
# 10. CROSS-VALIDATION SUMMARY
# =======================================================

if [[ "$CROSS_VALIDATE" -eq 1 ]]; then
    xval_total=$((xval_pass + xval_fail + xval_skip))

    log ""
    log "=== Cross-validation against Stage 4 NZmean CSVs ==="
    log "  Total checks:   $xval_total"
    log "  Passed:         $xval_pass"
    log "  Failed:         $xval_fail"
    log "  Skipped (NA):   $xval_skip"
    log "  Tolerance:      $XVAL_TOL"
    log "  Full report:    $xval_file"

    if [[ "$xval_fail" -gt 0 ]]; then
        log ""
        log "  *** CROSS-VALIDATION FAILURES DETECTED ***"
        log "  Review $xval_file for details."
        log "  Extraction continued but results should be investigated."
    else
        log ""
        log "  STATUS: ALL CHECKS PASSED"
    fi
    log ""
fi

# =======================================================
# 11. SUMMARY
# =======================================================

log "============================================================"
log " Pattern extraction complete"
log "============================================================"
log ""
log "Output: $OUT_DIR"
log ""
log "Files per ROI:"
for roi in "${ROI_NAMES[@]}"; do
    roi_dir="$OUT_DIR/$roi"
    if [[ -d "$roi_dir" ]]; then
        n_files=$(find "$roi_dir" -name "sub-*_patterns.1D" 2>/dev/null | wc -l | tr -d ' ')
        log "  $roi:  $n_files files  (${VOXEL_COUNTS[$roi]:-?} voxels/file)"
    fi
done
log ""
log "Total .1D files written: $total_files"
log ""
log "Manifest files:"
log "  $labels_file"
log "  $voxel_file"
[[ "$CROSS_VALIDATE" -eq 1 ]] && log "  $xval_file"
log ""
log "Log: $LOGFILE"
log ""
log "These pattern files are the input for RSA analysis."
log "  Within-subject RSA: correlate condition vectors (rows)"
log "  Inter-subject RSA:  correlate subject vectors per condition"
log ""
log "Python loading example:"
log "  import numpy as np"
log "  P = np.genfromtxt('sub-958_vmPFC_patterns.1D', comments='#')"
log "  # P.shape = (53, n_voxels)"
log "  # Neural RDM = 1 - np.corrcoef(P)"
