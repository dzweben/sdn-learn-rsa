# LEARN RSA PI Walkthrough (Final Canonical)

This walkthrough is final-production only. It does not include forked alternatives.

**Step 0 - Environment and Paths**

Canonical root:

`/data/projects/STUDIES/LEARN/fMRI/RSA-learn`

Critical paths:

- raw BIDS: `/data/projects/STUDIES/LEARN/fMRI/bids`
- fixed events: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed`
- timing root: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2`
- outputs: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses`

**Step 1 - Fix `nopred_fdbk` Labels**

Purpose:

When prediction is missed, feedback can appear as `nopred_fdbk`. This step relabels those rows to canonical feedback labels so timing generation is valid.

Command:

```bash
python3 /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_fix_nopred_fdbk_by_template.py \
  --bids-dir /data/projects/STUDIES/LEARN/fMRI/bids \
  --out-dir /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed \
  --report /data/projects/STUDIES/LEARN/fMRI/RSA-learn/reports/nopred_fdbk_fix_template.tsv \
  --mode majority
```

**Step 2 - Generate Run-wise Timing Files**

Purpose:

Create one timing set per subject with run-wise feedback, prediction/response, and anticipation (`isi`) regressors.

Command:

```bash
SUBJ_LIST_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt \
BIDS_DIR_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed \
TIMING_ROOT_OVERRIDE=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_1D_AFNItiming_Full_RSA_runwise_Anticipation.sh
```

Quick proof that anticipation files exist:

```bash
ls /data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2/sub-958/Anticipation_pred_fdk*.1D
```

**Step 3 - Generate AFNI Proc Scripts and Run GLM**

Purpose:

Create per-subject AFNI proc scripts and run preprocessing + GLM using raw BIDS and no blur.

One-command canonical run:

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

Or stage-controlled run (GLM only):

```bash
FIX_EVENTS=0 MAKE_TIMING=0 MAKE_PROC=0 CLEAN_OUT=1 RUN_GLM=1 MAX_JOBS=8 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

**Step 4 - Audit Completion**

Missing stats check:

```bash
RESULTS=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses
TIMING=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2
for d in $TIMING/sub-*; do
  id=${d##*sub-}
  stats="$RESULTS/$id/${id}.results.LEARN_RSA_runwise_AFNI/stats.${id}+tlrc.HEAD"
  [ ! -f "$stats" ] && echo "$id"
done | sort -n
```

Error scan:

```bash
egrep -R "ERROR|FATAL|FAILED|ABORT" \
/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses/*/output.proc.*LEARN_RSA_runwise_AFNI
```

**Step 5 - Subject-level Exception Handling (Example Pattern)**

If a subject fails with 3dDeconvolve collinearity threshold, use a subject-scoped rerun decision and document it in:

`/data/projects/STUDIES/LEARN/fMRI/RSA-learn/docs/DECISION_LOG.md`

No global model changes are allowed for single-subject exceptions without explicit decision logging.

**Step 6 - Maintenance Rules**

1. Keep only one production path set.
2. Keep non-canonical artifacts under `sandbox/` only.
3. Update masterplan + PI walkthrough + README + decision log together.
4. Do not leave temporary attempt scripts in production folders.
