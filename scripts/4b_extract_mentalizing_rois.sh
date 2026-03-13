#!/bin/bash
set -euo pipefail

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA-learn Stage 4b: Mentalizing ROI Extraction
#
# Adds two mentalizing-network ROIs not in the original
# Stage 4 extraction:
#
#   R-TPJ   Mars et al. (2012) right TPJ parcellation
#           Source: MNI_MarsTPJParcellation/TPJ_thr50_summaryimage_3mm_clustALL_R.nii.gz
#           Location: /data/AnatomicalROI_Masks/ROIs/MNI_MarsTPJParcellation/
#           All right-hemisphere clusters combined, thresholded at 50%
#           Center of mass: MNI (56, -44, 23)
#           438 voxels at 3mm resolution in MNI space
#
#   dmPFC   8mm sphere at Schurz et al. (2014) peak coordinates
#           Created with 3dUndump: center MNI (0, 54, 33), radius 8mm
#           Schurz, M., Radua, J., Aichhorn, M., Richlan, F., & Perner, J. (2014).
#           Fractionating theory of mind: A meta-analysis of functional brain
#           imaging studies. Neuroscience & Biobehavioral Reviews, 42, 9-34.
#           81 voxels on 3mm GLM grid
#
# These masks live outside the LEARN Masks/ directory.
# R-TPJ comes from the shared AnatomicalROI_Masks archive.
# dmPFC is created by this script using 3dUndump.
#
# WHAT IT EXTRACTS: same 41 conditions as Stage 4
#   - 32 run-wise feedback betas (8 conditions x 4 runs)
#   - 8 prediction/response betas
#   - 1 anticipation beta
#
# OUTPUT:
#   derivatives/afni/ROI_extractions/RTPJ_betas.csv
#   derivatives/afni/ROI_extractions/dmPFC_betas.csv
#
# REQUIRES:
#   - AFNI (3dROIstats, 3dresample, 3dUndump) in PATH
#   - Completed GLM results from Stage 3
#   - R-TPJ source mask accessible (see RTPJ_SOURCE below)
#
# USAGE:
#   bash scripts/4b_extract_mentalizing_rois.sh
#
# ENVIRONMENT OVERRIDES (optional):
#   RESULTS_DIR=...      override GLM results location
#   MASKS_DIR=...        override local mask copy location
#   ANATOMICAL_ROIS=...  override shared mask archive root
#   OUT_DIR=...          override output directory
#   DRY_RUN=1            verify setup without running extraction
#
# Author: RSA-learn pipeline
# Date: 2026-03-12

############################################################################################
# CONFIGURATION
############################################################################################

TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
RSA_DIR="$TOPDIR/RSA-learn"
RESULTS_DIR="${RESULTS_DIR:-$RSA_DIR/derivatives/afni/IndvlLvlAnalyses}"
MASKS_DIR="${MASKS_DIR:-$TOPDIR/Masks}"
OUT_DIR="${OUT_DIR:-$RSA_DIR/derivatives/afni/ROI_extractions}"
LOG_DIR="$RSA_DIR/logs"
GLM="LEARN_RSA_runwise_AFNI"
DRY_RUN="${DRY_RUN:-0}"

# --- R-TPJ source ---
# Mars et al. (2012) parcellation, shared lab archive
ANATOMICAL_ROIS="${ANATOMICAL_ROIS:-/data/AnatomicalROI_Masks/ROIs}"
RTPJ_SOURCE="$ANATOMICAL_ROIS/MNI_MarsTPJParcellation/TPJ_thr50_summaryimage_3mm_clustALL_R.nii.gz"

# --- dmPFC sphere parameters ---
# Schurz et al. (2014) mentalizing meta-analysis peak
DMPFC_MNI_X=0
DMPFC_MNI_Y=54
DMPFC_MNI_Z=33
DMPFC_RADIUS=8   # mm

mkdir -p "$OUT_DIR" "$LOG_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOGFILE="$LOG_DIR/4b_extract_mentalizing_${TIMESTAMP}.log"

# -------------------------------------------------------
# ROI DEFINITIONS
# -------------------------------------------------------
# These are the resampled/created copies on the GLM grid.
# -------------------------------------------------------

ROI_NAMES=( RTPJ dmPFC )
ROI_LOCAL=(
    "$MASKS_DIR/RTPJ_Mars_clustALL_R_resampled+tlrc"
    "$MASKS_DIR/dmPFC_Schurz2014_8mm+tlrc"
)

# -------------------------------------------------------
# CONDITIONS TO EXTRACT (same 41 as Stage 4)
# -------------------------------------------------------

ALL_CONDS=()

for run in 1 2 3 4; do
    for peer in Mean60 Mean80 Nice60 Nice80; do
        ALL_CONDS+=("FBM.${peer}.r${run}")
        ALL_CONDS+=("FBN.${peer}.r${run}")
    done
done

for peer in Mean60 Mean80 Nice60 Nice80; do
    ALL_CONDS+=("Pred.${peer}")
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
    local subj="$1"
    echo "$RESULTS_DIR/$subj/$subj.results.$GLM/stats.$subj+tlrc"
}

parse_label_map() {
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

extract_one_subject() {
    local subj="$1"
    local mask="$2"
    local stats_prefix
    stats_prefix=$(get_stats_prefix "$subj")

    local -a avail_indices=()
    local -a has_data=()

    for cond in "${ALL_CONDS[@]}"; do
        local coef_label="${cond}#0_Coef"
        local idx="${LABEL_IDX[$coef_label]:-}"
        if [[ -n "$idx" ]]; then
            avail_indices+=("$idx")
            has_data+=("1")
        else
            has_data+=("0")
        fi
    done

    local -a values=()

    if [[ ${#avail_indices[@]} -gt 0 ]]; then
        local selector
        selector=$(IFS=,; echo "${avail_indices[*]}")

        local raw
        raw=$(3dROIstats -nzmean -quiet \
            -mask "$mask" \
            "${stats_prefix}[${selector}]" 2>/dev/null) || true

        # 3dROIstats -nzmean outputs TWO columns per line:
        #   Mean  NZMean
        # We want the LAST column (NZMean).
        while IFS= read -r line; do
            local val
            val=$(echo "$line" | awk '{print $NF}')
            [[ -n "$val" ]] && values+=("$val")
        done <<< "$raw"
    fi

    local row="$subj"
    local val_ptr=0

    for i in "${!ALL_CONDS[@]}"; do
        if [[ "${has_data[$i]}" == "1" ]]; then
            if [[ $val_ptr -lt ${#values[@]} ]]; then
                row+=",${values[$val_ptr]}"
            else
                row+=",NA"
            fi
            ((val_ptr++)) || true
        else
            row+=",NA"
        fi
    done

    echo "$row"
}

############################################################################################
# MAIN
############################################################################################

log "============================================================"
log " RSA-learn Stage 4b: Mentalizing ROI Extraction"
log "============================================================"
log ""
log "Results dir:      $RESULTS_DIR"
log "Masks dir:        $MASKS_DIR"
log "Anatomical ROIs:  $ANATOMICAL_ROIS"
log "Output dir:       $OUT_DIR"
log "GLM label:        $GLM"
log "Conditions:       $N_CONDS"
log "Dry run:          $DRY_RUN"
log ""

# -------------------------------------------------------
# 1. VERIFY AFNI
# -------------------------------------------------------

if [[ "$DRY_RUN" -eq 0 ]]; then
    for cmd in 3dROIstats 3dresample 3dUndump; do
        if ! command -v "$cmd" &>/dev/null; then
            log "ERROR: $cmd not found in PATH."
            exit 1
        fi
    done
    log "AFNI check: 3dROIstats, 3dresample, 3dUndump found"
    log ""
fi

# -------------------------------------------------------
# 2. DISCOVER SUBJECTS
# -------------------------------------------------------

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
log ""

if [[ ${#SUBJECTS[@]} -eq 0 ]]; then
    log "ERROR: No subjects found."
    exit 1
fi

# -------------------------------------------------------
# 3. PREPARE MASKS ON GLM GRID
# -------------------------------------------------------
# Use the first subject's stats file as the master grid.
# -------------------------------------------------------

first_subj="${SUBJECTS[0]}"
master_grid="$(get_stats_prefix "$first_subj")"

log "=== Preparing masks on GLM grid ==="
log "    Master grid: $master_grid"
log ""

# --- R-TPJ: resample from Mars et al. parcellation ---
log "  R-TPJ source: $RTPJ_SOURCE"
if [[ -f "$RTPJ_SOURCE" ]]; then
    if [[ "$DRY_RUN" -eq 0 ]]; then
        3dresample \
            -master "${master_grid}.HEAD" \
            -rmode NN \
            -prefix "${ROI_LOCAL[0]}" \
            -overwrite \
            -input "$RTPJ_SOURCE" 2>/dev/null
        log "  OK   Resampled -> ${ROI_LOCAL[0]}"
    else
        log "  DRY  Would resample -> ${ROI_LOCAL[0]}"
    fi
else
    log "  MISS $RTPJ_SOURCE"
    log "  HINT: Set ANATOMICAL_ROIS=<path> if the archive is elsewhere"
fi

# --- dmPFC: create 8mm sphere at Schurz et al. (2014) coordinates ---
log "  dmPFC: creating 8mm sphere at MNI ($DMPFC_MNI_X, $DMPFC_MNI_Y, $DMPFC_MNI_Z)"
if [[ "$DRY_RUN" -eq 0 ]]; then
    tmpcoord=$(mktemp /tmp/dmpfc_coord.XXXXXX)
    # Convert MNI (RAS) to LPI: negate ALL three axes
    # +X=Right -> -X=Left, +Y=Anterior -> -Y=Posterior, +Z=Superior -> -Z=Inferior
    awk -v x="$DMPFC_MNI_X" -v y="$DMPFC_MNI_Y" -v z="$DMPFC_MNI_Z" \
        'BEGIN { printf "%g %g %g\n", -x, -y, -z }' > "$tmpcoord"
    3dUndump -prefix "${ROI_LOCAL[1]}" \
        -srad "$DMPFC_RADIUS" \
        -orient LPI \
        -master "${master_grid}.HEAD" \
        -overwrite \
        -xyz "$tmpcoord" 2>/dev/null
    rm -f "$tmpcoord"
    log "  OK   Created -> ${ROI_LOCAL[1]}"
    log "  Cite: Schurz et al. (2014) Neurosci Biobehav Rev, 42, 9-34"
else
    log "  DRY  Would create sphere -> ${ROI_LOCAL[1]}"
fi
log ""

# -------------------------------------------------------
# 4. VERIFY MASKS
# -------------------------------------------------------

log "Checking masks on GLM grid..."
mask_ok=0
mask_miss=0

for i in "${!ROI_NAMES[@]}"; do
    roi_name="${ROI_NAMES[$i]}"
    mask_file="${ROI_LOCAL[$i]}"

    if [[ -f "${mask_file}.HEAD" ]]; then
        log "  OK   $roi_name -> $mask_file"
        ((mask_ok++)) || true
    else
        log "  MISS $roi_name -> $mask_file"
        ((mask_miss++)) || true
    fi
done

log "  Masks found: $mask_ok / ${#ROI_NAMES[@]}"
log ""

if [[ $mask_ok -eq 0 ]]; then
    log "ERROR: No masks found. Check source paths."
    exit 1
fi

# -------------------------------------------------------
# 5. DRY RUN CHECK
# -------------------------------------------------------

if [[ "$DRY_RUN" -eq 1 ]]; then
    log "=== DRY RUN: verifying sub-brick labels ==="
    log ""

    for subj in "${SUBJECTS[@]}"; do
        stats_prefix=$(get_stats_prefix "$subj")
        head_file="${stats_prefix}.HEAD"

        declare -A LABEL_IDX=()
        parse_label_map "$head_file"

        n_found=0
        for cond in "${ALL_CONDS[@]}"; do
            coef_label="${cond}#0_Coef"
            [[ -n "${LABEL_IDX[$coef_label]:-}" ]] && { ((n_found++)) || true; }
        done

        log "  $subj: $n_found / $N_CONDS conditions found"
        unset LABEL_IDX
    done

    log ""
    log "=== DRY RUN complete. Set DRY_RUN=0 to extract. ==="
    exit 0
fi

# -------------------------------------------------------
# 6. BUILD CSV HEADER
# -------------------------------------------------------

HEADER="Subject"
for cond in "${ALL_CONDS[@]}"; do
    HEADER+=",${cond}"
done

# -------------------------------------------------------
# 7. EXTRACT
# -------------------------------------------------------

log "=== Beginning extraction ==="
log ""

for roi_idx in "${!ROI_NAMES[@]}"; do
    roi_name="${ROI_NAMES[$roi_idx]}"
    mask_file="${ROI_LOCAL[$roi_idx]}"
    csv_file="$OUT_DIR/${roi_name}_betas.csv"

    [[ ! -f "${mask_file}.HEAD" ]] && { log "SKIP $roi_name (mask not found)"; continue; }

    log "--- ROI: $roi_name ---"
    log "    Mask:   $mask_file"
    log "    Output: $csv_file"

    echo "$HEADER" > "$csv_file"

    n_done=0
    n_fail=0

    for subj in "${SUBJECTS[@]}"; do
        stats_prefix=$(get_stats_prefix "$subj")
        head_file="${stats_prefix}.HEAD"

        declare -A LABEL_IDX=()
        parse_label_map "$head_file"

        row=$(extract_one_subject "$subj" "$mask_file")
        if [[ -n "$row" ]]; then
            echo "$row" >> "$csv_file"
            ((n_done++)) || true
        else
            log "    WARN: empty output for $subj"
            ((n_fail++)) || true
        fi

        unset LABEL_IDX

        if (( n_done % 10 == 0 && n_done > 0 )); then
            log "    Progress: $n_done / ${#SUBJECTS[@]}"
        fi
    done

    log "    Complete: $n_done extracted, $n_fail failed"
    log ""
done

# -------------------------------------------------------
# 8. SUMMARY
# -------------------------------------------------------

log "============================================================"
log " Mentalizing ROI extraction complete"
log "============================================================"
log ""
log "Output CSVs:"
for roi_name in "${ROI_NAMES[@]}"; do
    csv_file="$OUT_DIR/${roi_name}_betas.csv"
    if [[ -f "$csv_file" ]]; then
        n_rows=$(( $(wc -l < "$csv_file") - 1 ))
        n_cols=$(head -1 "$csv_file" | tr ',' '\n' | wc -l)
        log "  $csv_file  ($n_rows subjects x $n_cols columns)"
    fi
done
log ""
log "Log file: $LOGFILE"
