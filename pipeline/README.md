# LEARN RSA Pipeline

Run-wise GLM (no smoothing, with anticipation) for 38 LEARN subjects. All 38/38 complete.

## The pipeline

```
BIDS events ──→ [1_fix_events.py] ──→ bids_fixed/
bids_fixed/  ──→ [2_generate_timing.sh] ──→ TimingFiles/Fixed2/
Fixed2/      ──→ [3_run_glm.sh] ──→ derivatives/.../IndvlLvlAnalyses/
                     ├── calls 3a_afni_proc_template.sh (builds proc scripts)
                     └── calls 3b_fallback_patch.py (if subject has <4 runs)
```

## Running it

**Stage 1** — fix event labels:
```bash
python3 scripts/1_fix_events.py \
  --bids-dir /data/projects/STUDIES/LEARN/fMRI/bids \
  --out-dir /data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed \
  --report /data/projects/STUDIES/LEARN/fMRI/RSA-learn/reports/nopred_fdbk_fix_template.tsv \
  --mode majority
```

**Stage 2** — generate timing:
```bash
bash scripts/2_generate_timing.sh
```

**Stage 3** — run GLM:
```bash
bash scripts/3_run_glm.sh
```

## Where things live

**Inputs:**
- Raw BIDS: `/data/projects/STUDIES/LEARN/fMRI/bids`
- Subject list: `/data/projects/STUDIES/LEARN/fMRI/code/afni/subjList_LEARN.txt`
- SSW anatomy: `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/ssw/sub-<id>/`
- Confounds: `/data/projects/STUDIES/LEARN/fMRI/derivatives/afni/confounds/sub-<id>/`

**Outputs:**
- Stage 1 → `bids_fixed/` (or follow `stage_1_fixed_events` symlink)
- Stage 2 → `TimingFiles/Fixed2/` (or follow `stage_2_timing` symlink)
- Stage 3 → `derivatives/afni/IndvlLvlAnalyses/` (or follow `stage_3_glm_results` symlink)

Final product: `stats.<id>+tlrc.HEAD` inside each subject's results folder.

## Quick checks

Missing stats?
```bash
RESULTS=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses
TIMING=/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2
for d in $TIMING/sub-*; do
  id=${d##*sub-}
  [ ! -f "$RESULTS/$id/${id}.results.LEARN_RSA_runwise_AFNI/stats.${id}+tlrc.HEAD" ] && echo "$id"
done | sort -n
```

Errors?
```bash
egrep -R "ERROR|FATAL|FAILED|ABORT" \
  derivatives/afni/IndvlLvlAnalyses/*/output.proc.*LEARN_RSA_runwise_AFNI
```
