#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# NYX — TIMING FILE BUILDER  (ANSWER KEY)
# The complete loop-based version. Don't peek unless you're stuck.
# Input:  enriched events.tsv   Output: 25 merged .1D files per subject (4 rows each)
# ─────────────────────────────────────────────────────────────────────────────

Name_list="${SUBJ_LIST_OVERRIDE:-/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt}"
TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
Bid_location="${TOPDIR}/RSA-learn/events_enriched"
New_file_location="${TOPDIR}/RSA-learn/Nyx/Timing_files"

# ── Regressor space as arrays ──
# PEERS has the underscore in "_60" because that matches the EVENT LABEL in
# events.tsv (Mean_60_fdkm, Nice_60_pred_nice, etc). Mean80/Nice80 just don't
# have an underscore there — historical quirk of the original task code. We'll
# strip the _60 later so output FILENAMES are uniform (Mean60, Mean80, Nice60,
# Nice80 — all "peer+number" with no underscore between).
PEERS=(Mean_60 Mean80 Nice_60 Nice80)
SFX_FB=(fdkm fdkn)                # feedback: <peer>_fdkm / <peer>_fdkn  (8)
SFX_PRED=(pred_nice pred_mean)    # prediction × choice                  (8)
SFX_RSP=(rsp)                     # response: <peer>_rsp                 (4)
SFX_NP=(no_pred)                  # nuisance: <peer>_no_pred             (4)
ANTIC=(isi)                       # anticipation (single label)          (1)
RUNS=(01 02 03 04)


for subject in $(cat ${Name_list}); do
    echo "Processing subject: $subject"
    out="${New_file_location}/sub-${subject}"
    mkdir -p "$out"
    rm -f "$out"/*.1D "$out"/*_events.tsv


    # ── 1. COPY THE 4 ENRICHED EVENTS.TSV INTO THE SUBJECT FOLDER ──
    for run in "${RUNS[@]}"; do
        cp "${Bid_location}/sub-${subject}/func/sub-${subject}_task-learn_run-${run}_events.tsv" \
           "$out/"
    done
    cd "$out"


    # ── 2. BUILD (tag, label) PAIRS  ──
    # Each entry is "outputName:eventLabel". We split them apart later with
    # parameter expansion. Writing out all 25 combos once and looping is
    # cleaner than copy-pasting 25 cat|awk lines.
    pairs=()
    for peer in "${PEERS[@]}"; do
        # Strip the "_60" between peer name and number so filenames look uniform.
        # Mean_60 → Mean60, Nice_60 → Nice60, Mean80/Nice80 unchanged.
        short=${peer/_60/60}
        for sfx in "${SFX_FB[@]}";   do pairs+=("NonPM_${short}_${sfx}:${peer}_${sfx}"); done
        for sfx in "${SFX_PRED[@]}"; do pairs+=("${short}_${sfx}:${peer}_${sfx}"); done
        for sfx in "${SFX_RSP[@]}";  do pairs+=("${short}_${sfx}:${peer}_${sfx}"); done
        for sfx in "${SFX_NP[@]}";   do pairs+=("${short}_${sfx}:${peer}_${sfx}"); done
    done
    for a in "${ANTIC[@]}"; do pairs+=("Anticipation_${a}:${a}"); done


    # ── 3. EXTRACT ONSETS PER RUN & MERGE INTO 4-ROW FILES ──
    for pair in "${pairs[@]}"; do
        tag="${pair%%:*}"      # before ":"  = output basename
        label="${pair##*:}"    # after  ":"  = event label in events.tsv
        for run in "${RUNS[@]}"; do
            cat "sub-${subject}_task-learn_run-${run}_events.tsv" \
                | awk -v L="$label" '{ if ($3==L) { printf "%s:%s ", $1, $2 } }' \
                > "${tag}_run${run#0}.1D"
        done
        rm -f "${tag}.1D"
        for r in 1 2 3 4; do
            line=$(cat "${tag}_run${r}.1D")
            [ -z "$line" ] && line="*"
            echo "$line" >> "${tag}.1D"
        done
    done


    # ── 4. PAD EACH PER-RUN FILE TO 4 ROWS WITH "*" ──
    for f in *_run[1-4].1D; do
        [ -f "$f" ] || continue
        run="${f##*_run}"; run="${run%.1D}"
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
