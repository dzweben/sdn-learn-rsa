# LEARN RSA Final Canonical Pipeline

## Goal

Run a single, stable RSA pipeline with:
- corrected event labels (`nopred_fdbk` relabel)
- run-wise timing files
- explicit anticipation modeling (`Anticipation_pred_fdk`)
- AFNI raw preprocessing + run-wise GLM (no blur)

## Canonical Scripts

1. `scripts/LEARN_fix_nopred_fdbk_by_template.py`
2. `scripts/LEARN_1D_AFNItiming_Full_RSA_runwise_Anticipation.sh`
3. `scripts/LEARN_ap_Full_RSA_runwise_AFNI_noblur_Anticipation.sh`
4. `scripts/LEARN_ap_fallback_patch_afni_raw.py` (2-3 run fallback only)
5. `scripts/LEARN_run_RSA_runwise_pipeline_afni_raw_Anticipation.sh`
6. `scripts/LEARN_run_RSA_FINAL.sh` (single entry point)

## Default Data Paths (Linux server)

- Raw BIDS: `/data/projects/STUDIES/LEARN/fMRI/bids`
- Fixed events: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/bids_fixed`
- Final timing: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/TimingFiles/Fixed2`
- Results: `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/derivatives/afni/IndvlLvlAnalyses`

## One-command Run

```bash
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

## Local (mounted drive) Run Example

```bash
TOPDIR=/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI \
bash /Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

## Toggle Examples

Only regenerate timing:
```bash
FIX_EVENTS=0 MAKE_TIMING=1 MAKE_PROC=0 CLEAN_OUT=0 RUN_GLM=0 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```

Only rerun GLM from existing proc scripts:
```bash
FIX_EVENTS=0 MAKE_TIMING=0 MAKE_PROC=0 CLEAN_OUT=1 RUN_GLM=1 MAX_JOBS=8 \
bash /data/projects/STUDIES/LEARN/fMRI/RSA-learn/scripts/LEARN_run_RSA_FINAL.sh
```
