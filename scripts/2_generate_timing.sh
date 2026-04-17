#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# RSA-learn: run-wise AFNI timing files (loop-based, short version)
# Input:  events_enriched/sub-*/func/*_events.tsv   (25 clean labels)
# Output: 25 .1D files per subject, 4 rows each (one per run)
# ─────────────────────────────────────────────────────────────────────────────
set -eo pipefail

SUBJ_LIST="${SUBJ_LIST_OVERRIDE:-/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt}"
TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
BIDS_DIR="${BIDS_DIR_OVERRIDE:-$TOPDIR/RSA-learn/events_enriched}"
TIMING_ROOT="${TIMING_ROOT_OVERRIDE:-$TOPDIR/RSA-learn/TimingFiles/Enriched}"

PEERS=(Mean_60 Mean80 Nice_60 Nice80)
FEEDBACK=(fdkm fdkn)             # suffixes → <peer>_fdkm, <peer>_fdkn
PRED_CHOICE=(pred_nice pred_mean) # suffixes → <peer>_pred_nice, <peer>_pred_mean
RSP=(rsp)                         # <peer>_rsp
NOPRED=(no_pred)                  # <peer>_no_pred
ANTIC=(isi)                       # single label (not peer-split)
RUNS=(01 02 03 04)

# Helper: output filename has no underscore between peer prefix and number
# (Mean_60 → Mean60) so files sort cleanly.
tidy() { echo "$1" | sed 's/_60/60/; s/_80/80/'; }

for subj in $(cat "$SUBJ_LIST"); do
    echo "[timing] sub-${subj}"
    outdir="${TIMING_ROOT}/sub-${subj}"
    mkdir -p "$outdir"
    rm -f "$outdir"/*.1D "$outdir"/*_events.tsv

    # Copy enriched events into subject timing folder so awk paths are short
    for run in "${RUNS[@]}"; do
        src="${BIDS_DIR}/sub-${subj}/func/sub-${subj}_task-learn_run-${run}_events.tsv"
        [ -f "$src" ] && cp "$src" "$outdir/"
    done
    cd "$outdir"

    # Build (tag, label) pairs covering all 25 regressors
    pairs=()
    for peer in "${PEERS[@]}"; do
        peer_tidy=$(tidy "$peer")
        for sfx in "${FEEDBACK[@]}";    do pairs+=("NonPM_${peer_tidy}_${sfx}:${peer}_${sfx}"); done
        for sfx in "${PRED_CHOICE[@]}"; do pairs+=("${peer_tidy}_${sfx}:${peer}_${sfx}"); done
        for sfx in "${RSP[@]}";         do pairs+=("${peer_tidy}_${sfx}:${peer}_${sfx}"); done
        for sfx in "${NOPRED[@]}";      do pairs+=("${peer_tidy}_${sfx}:${peer}_${sfx}"); done
    done
    for a in "${ANTIC[@]}"; do pairs+=("Anticipation_${a}:${a}"); done

    # Extract per-run + merge into 4-row files
    for pair in "${pairs[@]}"; do
        tag="${pair%%:*}"
        label="${pair##*:}"
        for run in "${RUNS[@]}"; do
            ev="sub-${subj}_task-learn_run-${run}_events.tsv"
            if [ -f "$ev" ]; then
                # Auto-detect event column (3 in both schemas)
                awk -F'\t' -v L="$label" 'NR>1 && $3==L {printf "%s:%s ", $1, $2}' \
                    "$ev" > "${tag}_run${run#0}.1D"
            else
                : > "${tag}_run${run#0}.1D"   # missing run → empty file
            fi
        done
        # Merge 4 runs into one 4-row file
        : > "${tag}.1D"
        for run in 1 2 3 4; do
            line=$(cat "${tag}_run${run}.1D")
            [ -z "$line" ] && line="*"
            echo "$line" >> "${tag}.1D"
        done
    done

    # Pad each per-run .1D to 4 rows with "*" on other runs (AFNI multi-run)
    for f in *_run[1-4].1D; do
        [ -f "$f" ] || continue
        run=${f##*_run}; run=${run%.1D}
        line=$(tr -d '\n' < "$f")
        [ -z "$line" ] && line="*"
        case "$run" in
            1) printf "%s\n*\n*\n*\n" "$line" > "$f" ;;
            2) printf "*\n%s\n*\n*\n" "$line" > "$f" ;;
            3) printf "*\n*\n%s\n*\n" "$line" > "$f" ;;
            4) printf "*\n*\n*\n%s\n" "$line" > "$f" ;;
        esac
    done
done

echo "[timing] Done. Wrote to: $TIMING_ROOT"
