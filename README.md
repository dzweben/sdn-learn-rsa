# LEARN RSA

Year 1 PhD project: Representational Similarity Analysis of fMRI data from the LEARN social learning task.

## Repository Structure

```
Y1_project/
├── pipeline/                      Production AFNI GLM pipeline
│   ├── scripts/                   7 canonical scripts
│   │   ├── 1_fix_events.py             Stage 1: fix event labels
│   │   ├── 2_generate_timing.sh       Stage 2: build timing files
│   │   ├── 3_run_glm.sh               Stage 3: orchestrate GLM
│   │   ├── 3a_afni_proc_template.sh   Stage 3: AFNI proc template
│   │   ├── 3b_fallback_patch.py       Stage 3: fewer-run fallback
│   │   ├── sync_to_server.sh          Sync repo to server
│   │   └── audit_server.sh            Check server structure
│   └── docs/
│       ├── masterplan.md              Scientific plan
│       ├── pi-walkthrough.md          PI-facing walkthrough
│       ├── decisions.md               Decision log
│       └── run-status.md              Current completion status
│
├── guides/
│   ├── pi-walkthrough/            HTML site for PI walkthrough
│   └── undergrad/                 HTML tutorial for undergrad RAs
│
├── literature/
│   ├── papers/                    RSA and social learning papers
│   ├── presentations/             Lab presentations, manuscript, grant
│   ├── background/                Billy email chains, reference code
│   ├── rsa-coding/                Hypothesis generation code
│   ├── source-repos/              Third-party RSA toolboxes
│   ├── sa-review/                 Social anxiety review docs
│   └── roi-notes.docx             ROI candidate notes
│
├── analysis/                      Subject table (clinical + behavioral)
│
├── proposals/
│   ├── project-proposal.docx      Original project proposal
│   ├── rsa-coding-notes.docx      Early RSA coding notes
│   └── meetings/                  Meeting notes
│
├── fmri-data/                     Symlink to server data share
│
├── archive/                       Dead ends and legacy docs
│   ├── legacy-pipeline-docs/      Old step-by-step pipeline docs
│   └── exploratory/               Retired code
│
├── CLAUDE.md                      Agent instructions
├── LICENSE
└── THIRD_PARTY.md
```

## Quick Links

- **Run the pipeline:** [pipeline/README.md](pipeline/README.md)
- **Scientific plan:** [pipeline/docs/masterplan.md](pipeline/docs/masterplan.md)
- **PI walkthrough:** [pipeline/docs/pi-walkthrough.md](pipeline/docs/pi-walkthrough.md)
- **Subject data:** [analysis/subject_table.csv](analysis/subject_table.csv)

## License

Original materials are All Rights Reserved (Danny Zweben). Third-party materials retain their original licenses — see [THIRD_PARTY.md](THIRD_PARTY.md).
