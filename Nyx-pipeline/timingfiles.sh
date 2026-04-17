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

    # Shorthand for this subject's output folder so the rest of the script
    # can just say "$out" instead of typing the full path every time.
    out="${New_file_location}/sub-${subject}"

    mkdir -p "$out"                                    # make folder if missing
    rm -f "$out"/*.1D "$out"/*_events.tsv              # clear any stale files


    # ── 1. COPY THE 4 ENRICHED EVENTS.TSV INTO "$out" ─────────────────────────
    #
    # One concrete cp (run 01):
    #     cp "${Bid_location}/sub-${subject}/func/sub-${subject}_task-learn_run-01_events.tsv" "$out/"
    #
    # Bash bits:
    #   cp SRC DEST/        — DEST ending in "/" = "put it inside that folder"
    #   "${RUNS[@]}"        — expands to each element of RUNS as a separate word
    #                         (here: "01" "02" "03" "04"; quotes keep them whole)
    #   trailing  \         — "command continues on next line"
    #
    # ✍️ TODO: replace the hard-coded "01" with ${run} and wrap in:
    #     for run in "${RUNS[@]}"; do  ...  done


    cd "$out"     # cd in so later filenames can skip the $out/ prefix


    # ── 2. BUILD "tag:label" PAIRS (25 TOTAL) ─────────────────────────────────
    #
    # Each regressor needs a label to filter on (Mean_60_fdkm) and an output
    # name (NonPM_Mean60_fdkm). We build them as "tag:label" strings; Part 3
    # splits them back apart.
    #
    # One peer, just feedback:
    #     pairs=()
    #     peer="Mean_60"
    #     short=${peer/_60/60}                              # → "Mean60"
    #     for sfx in "${SFX_FB[@]}"; do
    #         pairs+=("NonPM_${short}_${sfx}:${peer}_${sfx}")
    #     done
    #
    # Bash bits:
    #   ${peer/_60/60}  — replace first "_60" with "60" (Mean_60→Mean60,
    #                     Nice_60→Nice60; Mean80/Nice80 unchanged, no match)
    #   pairs+=("X")    — append "X" to the pairs array
    #
    # ✍️ TODO: wrap the example in `for peer in "${PEERS[@]}"; do ... done`
    # and add 3 more inner loops for SFX_PRED, SFX_RSP, SFX_NP (same pattern,
    # drop the NonPM_ prefix — that's feedback-only). Then outside the peer
    # loop add the anticipation one:
    #     for a in "${ANTIC[@]}"; do pairs+=("Anticipation_${a}:${a}"); done
    # Final count: 4 peers × 6 suffixes + 1 anticipation = 25.
    pairs=()
    # ... your loops here ...


    # ── 3. EXTRACT ONSETS PER RUN & MERGE INTO 4-ROW FILES ────────────────────
    #
    # For each pair: (a) awk on each events.tsv → one per-run .1D;
    #                (b) stitch the 4 per-run files into one 4-row .1D.
    #
    # One pair, both halves:
    #     pair="NonPM_Mean60_fdkm:Mean_60_fdkm"
    #     tag="${pair%%:*}"; label="${pair##*:}"
    #     for run in "${RUNS[@]}"; do
    #         cat "sub-${subject}_task-learn_run-${run}_events.tsv" \
    #             | awk -v L="$label" '{ if ($3==L) { printf "%s:%s ", $1, $2 } }' \
    #             > "${tag}_run${run#0}.1D"
    #     done
    #     rm -f "${tag}.1D"
    #     for r in 1 2 3 4; do
    #         line=$(cat "${tag}_run${r}.1D")
    #         [ -z "$line" ] && line="*"
    #         echo "$line" >> "${tag}.1D"
    #     done
    #
    # Bash bits:
    #   ${pair%%:*}  — strip longest match of ":*" from the END → keeps the tag
    #   ${pair##*:}  — strip longest match of "*:" from the START → keeps label
    #   awk -v L=X   — hand a bash variable into awk (awk can't see $label otherwise)
    #   $3           — column 3 of the events.tsv = the event name
    #   printf no \n — all matches for a run concatenate onto one line
    #   > vs >>      — overwrite vs append
    #   [ -z "$x" ]  — true when $x is empty (empty run → write "*")
    #
    # ✍️ TODO: wrap the whole example in  for pair in "${pairs[@]}"; do ... done
    # so it runs once per entry (25 times).


    # ── 4. PAD EACH PER-RUN FILE TO 4 ROWS WITH "*" ───────────────────────────
    #
    # Per-run .1D currently has 1 line. AFNI wants 4 — "*" on the other runs.
    # Example target for ..._run2.1D:
    #     *
    #     9.868:3 47.133:3 ...
    #     *
    #     *
    #
    # This step is GIVEN (read through — don't rewrite). It uses:
    #   *_run[1-4].1D   — glob, expands to every per-run file
    #   ${f##*_run}     — strip prefix up through "_run" → "2.1D"
    #   ${var%.1D}      — strip ".1D" suffix → "2"
    #   tr -d '\n' < F  — read F, delete newlines → flat string
    #   case $run in … — switch on the run digit; printf with \n puts the
    #                    onsets on the right row and "*" on the other three.
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
