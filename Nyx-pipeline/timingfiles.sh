#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# NYX — TIMING FILE BUILDER  (BUILDING VERSION)
#
# Each section below is HALF-DONE. You finish it. The ✍️ TODO tells you what
# to add; a worked example is always right above so you have a pattern.
#
# If you get stuck: timingfiles-key.sh has the full solution.
# Input:  enriched events.tsv   Output: 25 merged .1D files per subject (4 rows each)
# ─────────────────────────────────────────────────────────────────────────────

Name_list="${SUBJ_LIST_OVERRIDE:-/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt}"
TOPDIR="/data/projects/STUDIES/LEARN/fMRI"
Bid_location="${TOPDIR}/RSA-learn/events_enriched"
New_file_location="${TOPDIR}/RSA-learn/Nyx/Timing_files"

# ── Regressor space as arrays ──
# PEERS keeps the "_60" because that matches the EVENT LABEL in events.tsv
# (Mean_60_fdkm, Nice_60_pred_nice, ...). Mean80 and Nice80 just don't have
# that underscore — historical quirk of the original task code. Later we'll
# strip the _60 so output FILENAMES are uniform: Mean60, Mean80, Nice60,
# Nice80 (all "peer+number" with no underscore between).
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


    # ── 1. COPY THE 4 ENRICHED EVENTS.TSV INTO THE SUBJECT FOLDER ─────────────
    #
    # `cp SRC DEST` copies a file. DEST ending in "/" = "put the file inside
    # that folder, keep its name". Here's ONE run as a concrete example:
    #
    #     cp "${Bid_location}/sub-${subject}/func/sub-${subject}_task-learn_run-01_events.tsv" \
    #        "$out/"
    #
    # You need this for all 4 runs. Writing 4 copies works, but a for-loop
    # over the RUNS array is cleaner. Shape:
    #
    #     for run in "${RUNS[@]}"; do
    #         cp "<SRC with ${run} in it>" "<DEST>"
    #     done
    #
    # ✍️ TODO: write the for-loop.


    cd "$out"


    # ── 2. BUILD A LIST OF (tag, label) PAIRS ─────────────────────────────────
    #
    # Every regressor we want is two things:
    #   - a label to filter events on   (e.g. Mean_60_fdkm)
    #   - an output filename base       (e.g. NonPM_Mean60_fdkm)
    #
    # We'll build an array of "tag:label" strings, then Part 3 splits them apart.
    #
    # Bash parameter expansion: ${peer/_60/60} replaces the first "_60" with
    # "60". So "Mean_60" → "Mean60"; "Mean80" is unchanged (no match).
    # That's how we unify the filenames across peers.
    #
    # Example: one peer (Mean_60), just the feedback suffixes:
    #
    #     pairs=()
    #     peer="Mean_60"
    #     short=${peer/_60/60}                           # → "Mean60"
    #     for sfx in "${SFX_FB[@]}"; do
    #         pairs+=("NonPM_${short}_${sfx}:${peer}_${sfx}")
    #     done
    #     # pairs now has: "NonPM_Mean60_fdkm:Mean_60_fdkm" "NonPM_Mean60_fdkn:Mean_60_fdkn"
    #
    # ✍️ TODO: wrap the inner block in a for-loop over "${PEERS[@]}", and add
    # similar inner loops for SFX_PRED, SFX_RSP, and SFX_NP (same pattern,
    # just no "NonPM_" prefix — that's only for feedback).
    # Then outside the peer loop, add the ANTIC one:
    #     for a in "${ANTIC[@]}"; do pairs+=("Anticipation_${a}:${a}"); done
    #
    # You should end up with 25 entries in `pairs`.
    pairs=()
    # ... your loops here ...


    # ── 3. EXTRACT ONSETS PER RUN & MERGE INTO 4-ROW FILES ────────────────────
    #
    # For each pair: (a) run awk on each events.tsv to extract onset:duration
    # pairs, one per-run file; (b) stitch the 4 per-run files into a 4-row
    # merged file.
    #
    # Splitting a "tag:label" string:
    #     tag="${pair%%:*}"       # before ":"  → output basename
    #     label="${pair##*:}"     # after  ":"  → event label
    #
    # Awk can't see bash variables — pass them in with -v:
    #     awk -v L="$label" '{ if ($3==L) { printf "%s:%s ", $1, $2 } }'
    # $3 is column 3 (the event name). printf uses no newline so matches
    # concat onto one line — AFNI's stim_times format.
    #
    # Example — one pair, just the extraction part:
    #
    #     pair="NonPM_Mean60_fdkm:Mean_60_fdkm"
    #     tag="${pair%%:*}"; label="${pair##*:}"
    #     for run in "${RUNS[@]}"; do
    #         cat "sub-${subject}_task-learn_run-${run}_events.tsv" \
    #             | awk -v L="$label" '{ if ($3==L) { printf "%s:%s ", $1, $2 } }' \
    #             > "${tag}_run${run#0}.1D"
    #     done
    #     # Per-run files now exist; merge them into one 4-row file:
    #     rm -f "${tag}.1D"
    #     for r in 1 2 3 4; do
    #         line=$(cat "${tag}_run${r}.1D")
    #         [ -z "$line" ] && line="*"             # empty run → "*"
    #         echo "$line" >> "${tag}.1D"
    #     done
    #
    # ✍️ TODO: wrap that whole example in  for pair in "${pairs[@]}"; do … done
    # so it runs once for every entry in the pairs array.


    # ── 4. PAD EACH PER-RUN FILE TO 4 ROWS WITH "*" ───────────────────────────
    #
    # After Part 3, each per-run file has ONE line of onsets. AFNI wants them
    # to have 4 lines, with "*" on the runs the file doesn't cover. E.g.
    # NonPM_Mean60_fdkm_run2.1D should end up as:
    #     *
    #     9.868:3 47.133:3 ...
    #     *
    #     *
    #
    # This whole step is given — it's tricky parameter-expansion + case logic,
    # and you already understand the goal. Read through it so you get what
    # each line does; don't rewrite it unless you want the practice.
    for f in *_run[1-4].1D; do
        [ -f "$f" ] || continue
        run="${f##*_run}"; run="${run%.1D}"        # filename → "2"
        line=$(tr -d '\n' < "$f")                   # file content, newlines gone
        [ -z "$line" ] && line="*"
        case "$run" in
            1) printf "%s\n*\n*\n*\n" "$line" > "$f" ;;
            2) printf "*\n%s\n*\n*\n" "$line" > "$f" ;;
            3) printf "*\n*\n%s\n*\n" "$line" > "$f" ;;
            4) printf "*\n*\n*\n%s\n" "$line" > "$f" ;;
        esac
    done
done
