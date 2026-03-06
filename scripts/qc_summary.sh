#!/bin/bash
set -euo pipefail

#######################################################
# SCRIPT SUMMARY
#######################################################
# RSA-learn QC Summary Generator
#
# Pulls per-subject QC metrics from AFNI's out.ss_review
# files and produces a single markdown report with:
#   - A sortable summary table (one row per subject)
#   - Flagged subjects that exceed common thresholds
#   - Per-run censoring breakdown
#   - Group-level summary statistics
#
# QC METRICS EXTRACTED:
#   - Number of runs
#   - TRs censored / censor fraction
#   - Average motion per TR
#   - Max motion displacement (raw and censored)
#   - Average outlier fraction
#   - TSNR average
#   - Global correlation (GCOR)
#   - Anat/EPI mask Dice coefficient
#   - Degrees of freedom remaining
#   - Per-run censor fractions
#
# FLAG THRESHOLDS (common conventions):
#   - Censor fraction > 30%  →  heavy motion, consider excluding
#   - Censor fraction > 15%  →  moderate motion, note in methods
#   - Max displacement > 3mm →  large single-TR movement
#   - TSNR < 40              →  low signal quality
#   - Dice coef < 0.90       →  poor alignment
#   - Any run > 40% censored →  that run may be unusable
#
# OUTPUT:
#   docs/qc-summary.md (or path specified by OUT_FILE)
#
# USAGE:
#   bash scripts/qc_summary.sh
#
# ENVIRONMENT OVERRIDES:
#   RESULTS_DIR=...  override GLM results path
#   OUT_FILE=...     override output markdown path
#
# REQUIRES:
#   Access to GLM results (server mount or run on server)
#   No AFNI dependency — parses plain text files only.
#
# Author: RSA-learn pipeline
# Date: 2026-03-05

############################################################################################
# CONFIGURATION
############################################################################################

TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
RSA_DIR="$TOPDIR/RSA-learn"
RESULTS_DIR="${RESULTS_DIR:-$RSA_DIR/derivatives/afni/IndvlLvlAnalyses}"
OUT_FILE="${OUT_FILE:-$RSA_DIR/docs/qc-summary.md}"
GLM="LEARN_RSA_runwise_AFNI"

# --- Flag thresholds ---
CENSOR_WARN=0.15    # >= 15% censored: moderate flag
CENSOR_FAIL=0.30    # >= 30% censored: heavy flag
MAX_DISP_WARN=3.0   # >= 3mm max displacement
TSNR_WARN=40        # < 40 TSNR: low signal
DICE_WARN=0.90      # < 0.90 Dice: poor alignment
RUN_CENSOR_WARN=0.40  # >= 40% of a single run censored

############################################################################################
# FUNCTIONS
############################################################################################

# Pull a single value from ss_review by key prefix.
# Args: $1 = file, $2 = key prefix (grep pattern)
# Returns: the value after the colon, trimmed.
pull() {
    local file="$1" key="$2"
    grep "^${key}" "$file" 2>/dev/null | head -1 | sed 's/^[^:]*: *//' | tr -s ' '
}

# Compare two floats: returns 0 (true) if $1 >= $2
ge() { awk "BEGIN { exit !($1 >= $2) }"; }

# Compare two floats: returns 0 (true) if $1 < $2
lt() { awk "BEGIN { exit !($1 < $2) }"; }

############################################################################################
# MAIN
############################################################################################

# Allow running from local mount or server
if [[ ! -d "$RESULTS_DIR" ]]; then
    # Try local mount
    LOCAL_MOUNT="/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses"
    if [[ -d "$LOCAL_MOUNT" ]]; then
        RESULTS_DIR="$LOCAL_MOUNT"
        # Adjust output to local repo if running locally
        OUT_FILE="${OUT_FILE:-docs/qc-summary.md}"
    else
        echo "ERROR: Cannot find results at $RESULTS_DIR or $LOCAL_MOUNT"
        exit 1
    fi
fi

# Discover subjects with ss_review files
declare -a SUBJECTS=()
for subj_dir in "$RESULTS_DIR"/*/; do
    subj=$(basename "$subj_dir")
    [[ ! "$subj" =~ ^[0-9]+$ ]] && continue
    review="$subj_dir/$subj.results.$GLM/out.ss_review.$subj.txt"
    [[ -f "$review" ]] && SUBJECTS+=("$subj")
done
IFS=$'\n' SUBJECTS=($(sort -n <<< "${SUBJECTS[*]}")); unset IFS

N_SUBJ=${#SUBJECTS[@]}
echo "Found $N_SUBJ subjects with QC data"

# -------------------------------------------------------
# Collect metrics into arrays
# -------------------------------------------------------
declare -a A_RUNS A_TRS_TOTAL A_TRS_CENSORED A_CENS_FRAC
declare -a A_AVG_MOT A_MAX_DISP A_MAX_DISP_CENS
declare -a A_AVG_OUTLIER A_TSNR A_GCOR A_DICE A_DF_LEFT A_DF_FRAC
declare -a A_RUN_CENS_FRACS A_FLAGS

for subj in "${SUBJECTS[@]}"; do
    review="$RESULTS_DIR/$subj/$subj.results.$GLM/out.ss_review.$subj.txt"

    n_runs=$(pull "$review" "num runs found")
    trs_total=$(pull "$review" "TRs total " | head -1)  # first match = uncensored total
    trs_cens=$(pull "$review" "TRs censored ")
    cens_frac=$(pull "$review" "censor fraction")
    avg_mot=$(pull "$review" "average motion (per TR)")
    max_disp=$(pull "$review" "max motion displacement")
    max_disp_c=$(pull "$review" "max censored displacement")
    avg_outlier=$(pull "$review" "average outlier frac")
    tsnr=$(pull "$review" "TSNR average")
    gcor=$(pull "$review" "global correlation")
    dice=$(pull "$review" "anat/EPI mask Dice")
    df_left=$(pull "$review" "degrees of freedom left")
    df_frac=$(pull "$review" "final DF fraction")
    run_cens=$(pull "$review" "fraction censored per run")

    A_RUNS+=("$n_runs")
    A_TRS_TOTAL+=("$trs_total")
    A_TRS_CENSORED+=("$trs_cens")
    A_CENS_FRAC+=("$cens_frac")
    A_AVG_MOT+=("$avg_mot")
    A_MAX_DISP+=("$max_disp")
    A_MAX_DISP_CENS+=("$max_disp_c")
    A_AVG_OUTLIER+=("$avg_outlier")
    A_TSNR+=("$tsnr")
    A_GCOR+=("$gcor")
    A_DICE+=("$dice")
    A_DF_LEFT+=("$df_left")
    A_DF_FRAC+=("$df_frac")
    A_RUN_CENS_FRACS+=("$run_cens")

    # Build flags
    flags=""
    if ge "$cens_frac" "$CENSOR_FAIL" 2>/dev/null; then
        flags+="CENSOR>30% "
    elif ge "$cens_frac" "$CENSOR_WARN" 2>/dev/null; then
        flags+="censor>15% "
    fi
    if ge "$max_disp" "$MAX_DISP_WARN" 2>/dev/null; then
        flags+="maxDisp>${MAX_DISP_WARN}mm "
    fi
    if lt "$tsnr" "$TSNR_WARN" 2>/dev/null; then
        flags+="lowTSNR "
    fi
    if lt "$dice" "$DICE_WARN" 2>/dev/null; then
        flags+="poorAlign "
    fi
    # Check per-run censoring
    for rc in $run_cens; do
        if ge "$rc" "$RUN_CENSOR_WARN" 2>/dev/null; then
            flags+="run>40% "
            break
        fi
    done

    [[ -z "$flags" ]] && flags="-"
    A_FLAGS+=("$flags")
done

# -------------------------------------------------------
# Compute group summary stats
# -------------------------------------------------------
compute_stats() {
    # Args: array of values passed as args
    # Returns: min mean max (space-separated)
    local vals=("$@")
    awk -v n="${#vals[@]}" 'BEGIN {
        min=999999; max=-999999; sum=0; count=0
    } {
        val=$1+0
        if (val < min) min=val
        if (val > max) max=val
        sum += val
        count++
    } END {
        if (count>0) printf "%.3f %.3f %.3f", min, sum/count, max
        else printf "NA NA NA"
    }' <<< "$(printf '%s\n' "${vals[@]}")"
}

CENS_STATS=$(compute_stats "${A_CENS_FRAC[@]}")
MOT_STATS=$(compute_stats "${A_AVG_MOT[@]}")
TSNR_STATS=$(compute_stats "${A_TSNR[@]}")
GCOR_STATS=$(compute_stats "${A_GCOR[@]}")
DICE_STATS=$(compute_stats "${A_DICE[@]}")
DISP_STATS=$(compute_stats "${A_MAX_DISP[@]}")

# Count flagged subjects
N_FLAGGED=0
N_CENS_WARN=0
N_CENS_FAIL=0
for i in "${!SUBJECTS[@]}"; do
    [[ "${A_FLAGS[$i]}" != "-" ]] && ((N_FLAGGED++)) || true
    if ge "${A_CENS_FRAC[$i]}" "$CENSOR_FAIL" 2>/dev/null; then ((N_CENS_FAIL++)) || true; fi
    if ge "${A_CENS_FRAC[$i]}" "$CENSOR_WARN" 2>/dev/null; then ((N_CENS_WARN++)) || true; fi
done

# -------------------------------------------------------
# Write markdown
# -------------------------------------------------------
{
    echo "# GLM Quality Control Summary"
    echo ""
    echo "Generated: $(date '+%Y-%m-%d %H:%M')"
    echo ""
    echo "GLM: \`$GLM\`"
    echo ""
    echo "Subjects: **$N_SUBJ**"
    echo ""
    echo "---"
    echo ""

    # --- Group summary ---
    echo "## Group Summary"
    echo ""
    echo "| Metric | Min | Mean | Max |"
    echo "|--------|-----|------|-----|"
    read -r cmin cmean cmax <<< "$CENS_STATS"
    printf "| Censor fraction | %.3f | %.3f | %.3f |\n" "$cmin" "$cmean" "$cmax"
    read -r mmin mmean mmax <<< "$MOT_STATS"
    printf "| Avg motion (mm/TR) | %.3f | %.3f | %.3f |\n" "$mmin" "$mmean" "$mmax"
    read -r dmin dmean dmax <<< "$DISP_STATS"
    printf "| Max displacement (mm) | %.1f | %.1f | %.1f |\n" "$dmin" "$dmean" "$dmax"
    read -r tmin tmean tmax <<< "$TSNR_STATS"
    printf "| TSNR | %.1f | %.1f | %.1f |\n" "$tmin" "$tmean" "$tmax"
    read -r gmin gmean gmax <<< "$GCOR_STATS"
    printf "| GCOR | %.4f | %.4f | %.4f |\n" "$gmin" "$gmean" "$gmax"
    read -r amin amean amax <<< "$DICE_STATS"
    printf "| Anat/EPI Dice | %.3f | %.3f | %.3f |\n" "$amin" "$amean" "$amax"
    echo ""
    echo "**Flagged subjects: $N_FLAGGED / $N_SUBJ** (censor >15%: $N_CENS_WARN, censor >30%: $N_CENS_FAIL)"
    echo ""
    echo "---"
    echo ""

    # --- Flagged subjects detail ---
    echo "## Flagged Subjects"
    echo ""
    echo "Thresholds: censor fraction >15% (warn) / >30% (exclude?), max displacement >3mm, TSNR <40, Dice <0.90, any run >40% censored."
    echo ""

    any_flagged=0
    for i in "${!SUBJECTS[@]}"; do
        [[ "${A_FLAGS[$i]}" == "-" ]] && continue
        any_flagged=1
        echo "### sub-${SUBJECTS[$i]}"
        echo ""
        echo "- **Flags:** ${A_FLAGS[$i]}"
        echo "- Runs: ${A_RUNS[$i]} | Censor fraction: ${A_CENS_FRAC[$i]} | TRs censored: ${A_TRS_CENSORED[$i]}"
        echo "- Avg motion: ${A_AVG_MOT[$i]} mm/TR | Max displacement: ${A_MAX_DISP[$i]} mm"
        echo "- TSNR: ${A_TSNR[$i]} | GCOR: ${A_GCOR[$i]} | Dice: ${A_DICE[$i]}"
        echo "- Per-run censor fractions: ${A_RUN_CENS_FRACS[$i]}"
        echo "- DF remaining: ${A_DF_LEFT[$i]} (${A_DF_FRAC[$i]} of total)"
        echo ""
    done
    if [[ $any_flagged -eq 0 ]]; then
        echo "*No subjects flagged.*"
        echo ""
    fi

    echo "---"
    echo ""

    # --- Full table ---
    echo "## Full Subject Table"
    echo ""
    echo "| Subject | Runs | TRs Cens | Cens% | AvgMot | MaxDisp | TSNR | GCOR | Dice | DF left | Per-Run Cens% | Flags |"
    echo "|---------|------|----------|-------|--------|---------|------|------|------|---------|---------------|-------|"
    for i in "${!SUBJECTS[@]}"; do
        # Format censor fraction as percentage
        cens_pct=$(awk "BEGIN { printf \"%.1f\", ${A_CENS_FRAC[$i]}*100 }")
        # Format per-run as percentages
        run_pcts=""
        for rc in ${A_RUN_CENS_FRACS[$i]}; do
            pct=$(awk "BEGIN { printf \"%.0f\", $rc*100 }")
            run_pcts+="${pct}% "
        done
        run_pcts=$(echo "$run_pcts" | sed 's/ $//')

        printf "| %s | %s | %s | %s%% | %.3f | %.1f | %.1f | %.4f | %.3f | %s | %s | %s |\n" \
            "${SUBJECTS[$i]}" \
            "${A_RUNS[$i]}" \
            "${A_TRS_CENSORED[$i]}" \
            "$cens_pct" \
            "${A_AVG_MOT[$i]}" \
            "${A_MAX_DISP[$i]}" \
            "${A_TSNR[$i]}" \
            "${A_GCOR[$i]}" \
            "${A_DICE[$i]}" \
            "${A_DF_LEFT[$i]}" \
            "$run_pcts" \
            "${A_FLAGS[$i]}"
    done
    echo ""

    echo "---"
    echo ""

    # --- Metric definitions ---
    echo "## Metric Definitions"
    echo ""
    echo "| Metric | What it means |"
    echo "|--------|---------------|"
    echo "| **Cens%** | Fraction of TRs censored for motion/outliers. Higher = more data lost. |"
    echo "| **AvgMot** | Average framewise displacement (mm) across all TRs. |"
    echo "| **MaxDisp** | Largest single-TR displacement (mm). Can indicate a head jerk. |"
    echo "| **TSNR** | Temporal signal-to-noise ratio. Higher = cleaner signal. |"
    echo "| **GCOR** | Global correlation. Lower = less global signal artifact. |"
    echo "| **Dice** | Overlap between EPI and anatomy masks. Should be >0.90. |"
    echo "| **DF left** | Degrees of freedom remaining after censoring + regressors. |"
    echo "| **Per-Run Cens%** | Censoring fraction for each individual run. |"

} > "$OUT_FILE"

echo ""
echo "QC summary written to: $OUT_FILE"
echo "  $N_SUBJ subjects, $N_FLAGGED flagged"
