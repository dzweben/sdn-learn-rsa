# Scripts Index

## Canonical Active Chain

1. `LEARN_fix_nopred_fdbk_by_template.py`
2. `LEARN_1D_AFNItiming_Full_RSA_runwise_Anticipation.sh`
3. `LEARN_ap_Full_RSA_runwise_AFNI_noblur_Anticipation.sh`
4. `LEARN_ap_fallback_patch_afni_raw.py`
5. `LEARN_run_RSA_runwise_pipeline_afni_raw_Anticipation.sh`
6. `LEARN_run_RSA_FINAL.sh`
7. `sync_repo_to_server.sh`
8. `audit_server_layout.sh`

## Purpose

### Production run scripts

- `LEARN_run_RSA_FINAL.sh`
  - one-command canonical entry point
- `LEARN_fix_nopred_fdbk_by_template.py`
  - rewrites `nopred_fdbk` rows to canonical feedback labels in `bids_fixed`
- `LEARN_1D_AFNItiming_Full_RSA_runwise_Anticipation.sh`
  - builds canonical timing files in `TimingFiles/Fixed2` with anticipation regressors
- `LEARN_ap_Full_RSA_runwise_AFNI_noblur_Anticipation.sh`
  - AFNI proc generator template (raw BIDS, no blur)
- `LEARN_ap_fallback_patch_afni_raw.py`
  - adjusts proc generation for subjects with fewer available runs
- `LEARN_run_RSA_runwise_pipeline_afni_raw_Anticipation.sh`
  - orchestrates proc generation/clean/run over subject sets

### Maintenance scripts

- `sync_repo_to_server.sh`
  - pushes canonical repo scripts/docs/walkthroughs to server RSA-learn
- `audit_server_layout.sh`
  - checks for structural drift from canonical server organization
