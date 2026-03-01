#!/bin/bash
set -euo pipefail

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA-learn Stage 4: ROI Extraction
#
# Extracts mean beta coefficients from anatomical ROI masks
# for each subject's run-wise GLM stats file using AFNI's
# 3dROIstats.
#
# This is the step AFTER the GLM completes. It pulls the
# run-wise betas out of each subject's stats file within
# predefined anatomical ROI masks, producing one CSV per
# ROI. These CSVs are the input for RSA and behavioral
# correlation analyses.
#
# WHAT IT EXTRACTS (41 conditions per subject):
#   - 32 run-wise feedback betas (8 conditions x 4 runs)
#       FBM.Mean60.r1, FBN.Mean60.r1, ... FBN.Nice80.r4
#   - 8 prediction/response betas
#       Pred.Mean60, Resp.Mean60, ... Resp.Nice80
#   - 1 anticipation beta
#       Anticipation.PredFdk
#
# FALLBACK SUBJECTS (2-3 runs):
#   Subjects with fewer than 4 runs have fewer feedback
#   regressors. The script detects which conditions exist
#   in each subject's stats file (by parsing the HEAD file)
#   and fills "NA" for missing conditions. All CSVs have
#   the same column structure regardless of run count.
#
# ROI MASKS (from $TOPDIR/Masks/):
#   vmPFC       VMPFC-mask-final.nii.gz
#   dACC1       dACC1-6mm-bilat.nii.gz
#   dACC2       dACC2-6mm-bilat.nii.gz
#   AntInsula   AntInsula-thr10-3mm-bilat.nii.gz
#   VS          striatum-structural-3mm-VS-bilat.nii.gz
#   Amygdala    Amyg_LR_resample+tlrc
#
# OUTPUT:
#   One CSV per ROI in: derivatives/afni/ROI_extractions/
#   Format: Subject,FBM.Mean60.r1,FBN.Mean60.r1,...,Anticipation.PredFdk
#   Each value is the NZmean (non-zero mean beta) within the ROI.
#
# REQUIRES:
#   - AFNI (3dROIstats) in PATH  -- runs on the server
#   - Completed GLM results from Stage 3
#   - ROI masks at $TOPDIR/Masks/
#
# USAGE:
#   bash scripts/4_extract_rois.sh
#
# ENVIRONMENT OVERRIDES (optional):
#   RESULTS_DIR=...  override GLM results location
#   MASKS_DIR=...    override mask location
#   OUT_DIR=...      override output directory
#   DRY_RUN=1        verify setup without running extraction
#
# Author: RSA-learn pipeline
# Date: 2026-02-28

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

mkdir -p "$OUT_DIR" "$LOG_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOGFILE="$LOG_DIR/4_extract_rois_${TIMESTAMP}.log"

# -------------------------------------------------------
# ROI MASK DEFINITIONS
# -------------------------------------------------------
# Parallel arrays: ROI_NAMES[i] corresponds to ROI_FILES[i].
# To add a new ROI, append to both arrays.
# -------------------------------------------------------

ROI_NAMES=( vmPFC dACC1 dACC2 AntInsula VS Amygdala )
ROI_FILES=(
    "$MASKS_DIR/VMPFC-mask-final.nii.gz"
    "$MASKS_DIR/dACC1-6mm-bilat.nii.gz"
    "$MASKS_DIR/dACC2-6mm-bilat.nii.gz"
    "$MASKS_DIR/AntInsula-thr10-3mm-bilat.nii.gz"
    "$MASKS_DIR/striatum-structural-3mm-VS-bilat.nii.gz"
    "$MASKS_DIR/Amyg_LR_resample+tlrc"
)

# -------------------------------------------------------
# CONDITIONS TO EXTRACT
# -------------------------------------------------------
# These are regressor labels from the GLM. In the stats
# file, each has a Coef sub-brick with suffix "#0_Coef".
#
# For example, label "FBM.Mean60.r1" has sub-brick
# "FBM.Mean60.r1#0_Coef" in the stats HEAD file.
#
# Build the list programmatically to avoid typos:
#   32 feedback (8 conditions x 4 runs)
#    8 prediction/response
#    1 anticipation
#   -- = 41 total
# -------------------------------------------------------

ALL_CONDS=()

# 32 run-wise feedback conditions
# Order: runs 1-4, within each run: Mean60, Mean80, Nice60, Nice80
# Within each condition: FBM (match) then FBN (no-match)
for run in 1 2 3 4; do
    for peer in Mean60 Mean80 Nice60 Nice80; do
        ALL_CONDS+=("FBM.${peer}.r${run}")
        ALL_CONDS+=("FBN.${peer}.r${run}")
    done
done

# 8 prediction and response conditions
for peer in Mean60 Mean80 Nice60 Nice80; do
    ALL_CONDS+=("Pred.${peer}")
    ALL_CONDS+=("Resp.${peer}")
done

# 1 anticipation condition
ALL_CONDS+=("Anticipation.PredFdk")

# Verify: should be 41
N_CONDS=${#ALL_CONDS[@]}

############################################################################################
# FUNCTIONS
############################################################################################

log() {
    # Log a message to both stdout and the log file
    echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOGFILE"
}

get_stats_prefix() {
    # Return the stats file prefix (without .HEAD/.BRIK suffix)
    # for a given subject.
    #
    # Args: $1 = subject ID (e.g., "958")
    # Returns: path to stats prefix via stdout
    local subj="$1"
    echo "$RESULTS_DIR/$subj/$subj.results.$GLM/stats.$subj+tlrc"
}

parse_label_map() {
    # Parse the BRICK_LABS attribute from an AFNI HEAD file
    # and build a label-to-index mapping.
    #
    # This is pure bash (no AFNI dependency). The HEAD file
    # is plain text with the format:
    #   name = BRICK_LABS
    #   count = <N>
    #   'label0~label1~label2~...~'
    #
    # Args: $1 = path to stats HEAD file
    # Side effect: populates the global associative array LABEL_IDX
    #
    # Example:
    #   LABEL_IDX["FBM.Mean60.r1#0_Coef"] = 1
    #   LABEL_IDX["FBM.Mean60.r1#0_Tstat"] = 2
    #   LABEL_IDX["FBM.Mean60.r1_Fstat"] = 3

    local head_file="$1"

    # Extract the label string from the HEAD file
    # grep -A 2 gets the 'name = BRICK_LABS' line plus the next 2 lines
    # The labels are on the 3rd line, enclosed in single quotes, '~'-separated
    local labels_raw
    labels_raw=$(grep -A 2 "^name = BRICK_LABS" "$head_file" | tail -1 | tr -d "'")

    # Clear the global map
    LABEL_IDX=()

    # Parse: split on '~', assign sequential indices
    local idx=0
    local IFS='~'
    for label in $labels_raw; do
        if [[ -n "$label" ]]; then
            LABEL_IDX["$label"]=$idx
            ((idx++))
        fi
    done
}

extract_one_subject() {
    # Extract NZmean values for one subject from one ROI mask.
    #
    # 1. Looks up the sub-brick index for each condition's Coef
    # 2. Runs 3dROIstats once with all available indices
    # 3. Returns a CSV row: subj,val1,val2,...,valN
    #    with "NA" for conditions not present in this subject
    #
    # Args:
    #   $1 = subject ID
    #   $2 = mask file path
    #
    # Requires: LABEL_IDX associative array already populated
    #           (call parse_label_map first)

    local subj="$1"
    local mask="$2"
    local stats_prefix
    stats_prefix=$(get_stats_prefix "$subj")

    # --- Step 1: Build list of available sub-brick indices ---
    # For each condition, check if its Coef label exists in LABEL_IDX.
    # Collect the indices of available conditions and track which
    # positions in ALL_CONDS have data vs. need "NA".

    local -a avail_indices=()   # sub-brick indices to extract
    local -a has_data=()        # 1 = has data, 0 = NA (one per condition)

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

    # --- Step 2: Run 3dROIstats ---
    # Extract all available sub-bricks in a single call.
    # Output: one NZmean value per line (for a binary mask).

    local -a values=()

    if [[ ${#avail_indices[@]} -gt 0 ]]; then
        # Build comma-separated sub-brick selector: "1,4,7,10,..."
        local selector
        selector=$(IFS=,; echo "${avail_indices[*]}")

        # Run extraction
        local raw
        raw=$(3dROIstats -nzmean -quiet \
            -mask "$mask" \
            "${stats_prefix}[${selector}]" 2>/dev/null) || true

        # Parse output: collapse whitespace, split into array
        # 3dROIstats -quiet outputs one value per line for each sub-brick
        while IFS= read -r line; do
            local val
            val=$(echo "$line" | tr -d '[:space:]')
            [[ -n "$val" ]] && values+=("$val")
        done <<< "$raw"
    fi

    # --- Step 3: Build CSV row ---
    # Walk through ALL_CONDS. For conditions with data, pull
    # the next value from the values array. For missing conditions,
    # output "NA".

    local row="$subj"
    local val_ptr=0

    for i in "${!ALL_CONDS[@]}"; do
        if [[ "${has_data[$i]}" == "1" ]]; then
            if [[ $val_ptr -lt ${#values[@]} ]]; then
                row+=",${values[$val_ptr]}"
            else
                # Safety: 3dROIstats returned fewer values than expected
                row+=",NA"
            fi
            ((val_ptr++))
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
log " RSA-learn Stage 4: ROI Extraction"
log "============================================================"
log ""
log "Results dir:  $RESULTS_DIR"
log "Masks dir:    $MASKS_DIR"
log "Output dir:   $OUT_DIR"
log "GLM label:    $GLM"
log "Conditions:   $N_CONDS"
log "Dry run:      $DRY_RUN"
log ""

# -------------------------------------------------------
# 1. DISCOVER SUBJECTS
# -------------------------------------------------------
# Find all subjects that have a completed stats HEAD file
# from the RSA-learn GLM.

SUBJECTS=()
for subj_dir in "$RESULTS_DIR"/*/; do
    subj=$(basename "$subj_dir")
    # Skip non-numeric directory names (e.g., "logs")
    [[ ! "$subj" =~ ^[0-9]+$ ]] && continue
    stats_prefix=$(get_stats_prefix "$subj")
    if [[ -f "${stats_prefix}.HEAD" ]]; then
        SUBJECTS+=("$subj")
    fi
done

# Sort numerically
IFS=$'\n' SUBJECTS=($(sort -n <<< "${SUBJECTS[*]}")); unset IFS

log "Found ${#SUBJECTS[@]} subjects with completed GLM results"
log "Subjects: ${SUBJECTS[*]}"
log ""

if [[ ${#SUBJECTS[@]} -eq 0 ]]; then
    log "ERROR: No subjects found. Check RESULTS_DIR path."
    exit 1
fi

# -------------------------------------------------------
# 2. VERIFY ROI MASKS EXIST
# -------------------------------------------------------

log "Checking ROI masks..."
mask_ok=0
mask_miss=0

for i in "${!ROI_NAMES[@]}"; do
    roi_name="${ROI_NAMES[$i]}"
    mask_file="${ROI_FILES[$i]}"

    # AFNI +tlrc datasets have .HEAD/.BRIK files
    if [[ "$mask_file" == *"+tlrc" ]]; then
        if [[ -f "${mask_file}.HEAD" ]]; then
            log "  OK   $roi_name -> $mask_file"
            ((mask_ok++))
        else
            log "  MISS $roi_name -> $mask_file"
            ((mask_miss++))
        fi
    else
        if [[ -f "$mask_file" ]]; then
            log "  OK   $roi_name -> $mask_file"
            ((mask_ok++))
        else
            log "  MISS $roi_name -> $mask_file"
            ((mask_miss++))
        fi
    fi
done

log "  Masks found: $mask_ok / ${#ROI_NAMES[@]}"
log ""

if [[ $mask_ok -eq 0 ]]; then
    log "ERROR: No ROI masks found. Check MASKS_DIR path."
    exit 1
fi

# -------------------------------------------------------
# 3. VERIFY AFNI IS AVAILABLE (unless dry run)
# -------------------------------------------------------

if [[ "$DRY_RUN" -eq 0 ]]; then
    if ! command -v 3dROIstats &>/dev/null; then
        log "ERROR: 3dROIstats not found in PATH."
        log "This script must be run on the server where AFNI is installed."
        exit 1
    fi
    log "AFNI check: 3dROIstats found"
    log ""
fi

# -------------------------------------------------------
# 4. BUILD CSV HEADER
# -------------------------------------------------------
# All CSVs share the same header: Subject + 41 condition columns.
# Missing conditions for 2-3 run subjects will be "NA" in the data.

HEADER="Subject"
for cond in "${ALL_CONDS[@]}"; do
    HEADER+=",${cond}"
done

# -------------------------------------------------------
# 5. DRY RUN: verify setup and exit
# -------------------------------------------------------

if [[ "$DRY_RUN" -eq 1 ]]; then
    log "=== DRY RUN: verifying sub-brick labels ==="
    log ""

    for subj in "${SUBJECTS[@]}"; do
        stats_prefix=$(get_stats_prefix "$subj")
        head_file="${stats_prefix}.HEAD"

        # Parse label map
        declare -A LABEL_IDX=()
        parse_label_map "$head_file"

        # Count how many of our desired conditions exist
        n_found=0
        for cond in "${ALL_CONDS[@]}"; do
            coef_label="${cond}#0_Coef"
            [[ -n "${LABEL_IDX[$coef_label]:-}" ]] && ((n_found++))
        done

        log "  $subj: $n_found / $N_CONDS conditions found"
        unset LABEL_IDX
    done

    log ""
    log "=== DRY RUN complete. Set DRY_RUN=0 to extract. ==="
    exit 0
fi

# -------------------------------------------------------
# 6. EXTRACT ROI BETAS
# -------------------------------------------------------
# For each ROI mask:
#   - Create the output CSV
#   - For each subject:
#       a. Parse their stats HEAD file for sub-brick labels
#       b. Run 3dROIstats to extract NZmean betas
#       c. Write one row to the CSV

log "=== Beginning extraction ==="
log ""

for roi_idx in "${!ROI_NAMES[@]}"; do
    roi_name="${ROI_NAMES[$roi_idx]}"
    mask_file="${ROI_FILES[$roi_idx]}"
    csv_file="$OUT_DIR/${roi_name}_betas.csv"

    # Skip missing masks
    if [[ "$mask_file" == *"+tlrc" ]]; then
        [[ ! -f "${mask_file}.HEAD" ]] && { log "SKIP $roi_name (mask not found)"; continue; }
    else
        [[ ! -f "$mask_file" ]] && { log "SKIP $roi_name (mask not found)"; continue; }
    fi

    log "--- ROI: $roi_name ---"
    log "    Mask:   $mask_file"
    log "    Output: $csv_file"

    # Write CSV header
    echo "$HEADER" > "$csv_file"

    # Extract for each subject
    n_done=0
    n_fail=0

    for subj in "${SUBJECTS[@]}"; do
        stats_prefix=$(get_stats_prefix "$subj")
        head_file="${stats_prefix}.HEAD"

        # Parse sub-brick labels for this subject
        declare -A LABEL_IDX=()
        parse_label_map "$head_file"

        # Extract and write CSV row
        row=$(extract_one_subject "$subj" "$mask_file")
        if [[ -n "$row" ]]; then
            echo "$row" >> "$csv_file"
            ((n_done++))
        else
            log "    WARN: empty output for $subj"
            ((n_fail++))
        fi

        unset LABEL_IDX

        # Progress every 10 subjects
        if (( n_done % 10 == 0 && n_done > 0 )); then
            log "    Progress: $n_done / ${#SUBJECTS[@]}"
        fi
    done

    log "    Complete: $n_done extracted, $n_fail failed"
    log ""
done

# -------------------------------------------------------
# 7. SUMMARY
# -------------------------------------------------------

log "============================================================"
log " Extraction complete"
log "============================================================"
log ""
log "Output CSVs:"
for roi_name in "${ROI_NAMES[@]}"; do
    csv_file="$OUT_DIR/${roi_name}_betas.csv"
    if [[ -f "$csv_file" ]]; then
        n_rows=$(( $(wc -l < "$csv_file") - 1 ))  # subtract header
        n_cols=$(head -1 "$csv_file" | tr ',' '\n' | wc -l)
        log "  $csv_file  ($n_rows subjects x $n_cols columns)"
    fi
done
log ""
log "Log file: $LOGFILE"
log ""
log "Next steps:"
log "  1. Verify CSVs in R/Python"
log "  2. Check for unexpected NAs (indicates missing runs)"
log "  3. Proceed to RSA computation"
