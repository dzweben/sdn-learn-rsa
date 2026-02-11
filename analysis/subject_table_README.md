# Subject Table Provenance

## Output
- subject table: /Users/dannyzweben/Desktop/SDN/Y1_project/analysis/subject_table.csv
- QC summary: /Users/dannyzweben/Desktop/SDN/Y1_project/analysis/subject_table_qc.txt

## Source files (Linux)
- Demographics (age/sex/group): /data/projects/STUDIES/LEARN/fMRI/bids/participants.tsv
- ADIS + SCARED (child + parent): /data/projects/STUDIES/LEARN/RedCap/LEARN_DATA_2022-01-28_1219.csv
- Any-anxiety dx flag: /data/projects/STUDIES/LEARN/fMRI/Analyses_LEARN/Anx_3dmvm.xlsx
- LEARN task behavioral events: /data/projects/STUDIES/LEARN/fMRI/code/afni/BehavData/sub-*/sub-*_task-learn_run-*_events.tsv

## Subject inclusion logic (to avoid RedCap test records)
- Start with the union of subject IDs from:
  - participants.tsv (demographics)
  - BehavData event files
  - Anx_3dmvm.xlsx
  - AFNI derivatives/afni/IndvlLvlAnalyses
- Then merge RedCap fields (ADIS + SCARED) onto that set.

## Column definitions (high-level)
- subject_id: numeric subject ID (e.g., 1055)
- age, sex, group: from BIDS participants.tsv
- ADIS (Social Phobia only): CSR/GIR extracted from ADIS dx slots (dx1–dx10) when dx code = 3 (Social Phobia). Separate columns for visit 1 and visit 2.
  - adis_pr_social_phobia_*_v1/v2
  - adis_cr_social_phobia_*_v1/v2
- SCARED child: scared_ch_social, scared_ch_total (visit_3_arm_1)
- SCARED parent: pr_scared_social, pr_scared_anxiety, pr_scared_gad, pr_scared_sep, pr_scared_pd, pr_scared_avoid (visit_4_arm_1)
- anyanx_dx_yn: from Anx_3dmvm.xlsx
- Behavioral summary (from LEARN task events):
  - behav_pred_nice_rate: proportion of prediction trials with Prediction == Nice
  - behav_fdk_nice_rate: proportion of feedback trials with fdk_val == nice
  - behav_response_right_rate: proportion of rows where Response == "You're Right"
  - behav_pred_trials / behav_fdk_trials / behav_response_trials: counts
  - behav_events_paths: semicolon-separated list of event files used per subject
  - behav_runs: count of event files found per subject
- imaging_in_afni: 1 if subject_id appears in /data/projects/STUDIES/LEARN/fMRI/derivatives/afni/IndvlLvlAnalyses
- source_* columns: constant Linux source paths for quick auditing

## Event mapping (RedCap)
- ADIS: visit_1_arm_1 and visit_2_arm_1 (v1/v2)
- SCARED child: visit_3_arm_1
- SCARED parent: visit_4_arm_1

## Generated
- Date: 2026-02-11
