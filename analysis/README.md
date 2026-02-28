# analysis/

Participant-level data for the LEARN RSA project. Two CSV files provide clinical/demographic measures and trial-level behavioral data.

## Files

### learn_clinical.csv

Subject-level clinical, demographic, and usability data (59 subjects x 92 columns).

| Column group | Examples | Description |
|---|---|---|
| Subject ID | `s` | Numeric subject ID |
| Usability flags | `Usable_Decieved`, `Usable_fMRI`, `Usable_Behavioral` | Inclusion/exclusion flags |
| Technical notes | `Technical_Issues`, `Motion_Issues`, `Notes_Usablity` | Data quality notes |
| Demographics | `gender`, `age`, `race`, `income` | Basic demographics |
| Caregiver education | `cg1_ed`, `cg2_ed` | Caregiver 1 and 2 education level |
| ADIS diagnoses (CSR) | `sa_dx_csr`, `gad_dx_csr`, `sep_dx_csr`, `sp_dx_csr`, `school_dx_csr`, `pan_dx_csr`, `ptsd_dx_csr` | Clinical severity ratings |
| Anxiety flags | `anyanx_symp_yn`, `anyanx_dx_yn` | Any-anxiety symptom/diagnosis |
| Other diagnoses | `mdd_dx_csr`, `adhd_dx_csr` | Comorbid diagnoses |
| Debrief | `debrief_feel_bullied_rating`, `debrief_deception_rating` | Post-task debrief ratings |
| CBCL (parent) | `cbcl_poc_synd_anxdep_tscore`, `cbcl_poc_synd_social_tscore`, etc. | Child Behavior Checklist T-scores |
| SSIS | `ssis_soc_std`, `ssis_soc_behav_level`, `ssis_prob_as` | Social Skills Improvement System |
| SCARED (parent) | `pr_scared_anxiety`, `pr_scared_social`, `pr_scared_gad`, etc. | Parent-reported SCARED subscales |
| IUS (parent) | `pr_on_c_ius_pros_anx`, `pr_on_c_ius_inhib_anx`, `pr_on_c_ius_total` | Intolerance of Uncertainty (parent) |
| SCQ | `scq_soc`, `scq_com`, `scq_rrb`, `scq_total_score` | Social Communication Questionnaire |
| ARI (parent) | `ari_poc_total` | Affective Reactivity Index (parent) |
| CDI-2 (parent) | `cdi2_poc_total`, `cdi2_poc_emoprob`, `cdi2_poc_funcprob` | Children's Depression Inventory (parent) |
| SRS | `srs_totaltscore`, `srs_socialawaretscore`, etc. | Social Responsiveness Scale T-scores |
| IUS (child) | `ch_sur_iusc_factor_1`, `ch_sur_iusc_factor_2`, `ch_sur_iusc_total` | Intolerance of Uncertainty (child) |
| ARI (child) | `ari_ch_total` | Affective Reactivity Index (child) |
| PVQ (child) | `pvq_ch_verbal_victim`, `pvq_ch_total_victim`, `pvq_ch_total_bully`, etc. | Peer Victimization Questionnaire |
| SCARED (child) | `scared_ch_total`, `scared_ch_social`, `scared_ch_panic`, etc. | Child-reported SCARED subscales |
| BFNE-II (child) | `bfneii_ch_socanx` | Brief Fear of Negative Evaluation |
| PDS | `pds_male_pdsscore`, `pds_female_pdsscore` | Pubertal Development Scale |
| CDI (child) | `ch_sur_cdi_neg_mood`, `ch_sur_cdi_anhedonia`, etc. | Children's Depression Inventory (child) |
| Pleasure Scale | `c_self_pleasurescale_physcial`, `c_self_pleasurescale_social`, `c_self_pleasurescale_other` | Self-report pleasure scale |

### learn_behavioral.csv

Trial-level behavioral data from the LEARN task (6649 trials x 9 columns, 52 subjects).

| Column | Description |
|---|---|
| `s` | Subject ID (with `sub-` prefix) |
| `r` | Run number (1-4) |
| `Reputation` | Peer reputation condition (e.g., Mean60, Nice80) |
| `Prediction` | Participant's prediction (0/1) |
| `fdk_val` | Feedback value (0 = nonmatch, 1 = match) |
| `Response` | Participant's response |
| `value` | Trial value |
| `trial` | Trial number within run |
| `fdk_val_1b` | Feedback value (1-back coded) |

## Date

Converted to CSV: 2026-02-28
