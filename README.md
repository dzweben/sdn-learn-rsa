# LEARN RSA

Year 1 PhD project: Representational Similarity Analysis of fMRI data from the LEARN social learning task.

38 subjects. Run-wise beta maps via AFNI GLM. No spatial smoothing. Explicit anticipation modeling between prediction and feedback.

---

## How This Repo Works

This repo **is** the pipeline. The folder structure here matches the server at `/data/projects/STUDIES/LEARN/fMRI/RSA-learn/` exactly. Scripts and docs live in the repo and are tracked by git. Data folders (`bids_fixed/`, `TimingFiles/`, `derivatives/`) are gitignored — they only exist on the server.

To update the server: copy changed files via the mount (`/Volumes/Jarcho_DataShare/...`) or `scp` over SSH.

---

## The Pipeline (4 Stages)

```
Raw BIDS events ──> 1_fix_events.py ──> bids_fixed/
                                              |
                                              v
                    2_generate_timing.sh ──> TimingFiles/Fixed2/
                                              |
                                              v
                    3_run_glm.sh ──────────> derivatives/afni/IndvlLvlAnalyses/
                    (calls 3a + 3b)           |
                                              v
                                         stats.<id>+tlrc.HEAD
                                              |
                                              v
                    4_extract_rois.sh ─────> derivatives/afni/ROI_extractions/
                                              |
                                              v
                                         <ROI>_betas.csv  (the final product)
```

| Stage | Script | Input | Output | README |
|-------|--------|-------|--------|--------|
| 1 | [scripts/1_fix_events.py](scripts/1_fix_events.py) | Raw BIDS events.tsv | Corrected events.tsv | [bids_fixed/README.md](bids_fixed/README.md) |
| 2 | [scripts/2_generate_timing.sh](scripts/2_generate_timing.sh) | Corrected events | .1D timing files | [TimingFiles/Fixed2/README.md](TimingFiles/Fixed2/README.md) |
| 3 | [scripts/3_run_glm.sh](scripts/3_run_glm.sh) | Timing files + BOLD | Per-subject GLM results | [derivatives/README.md](derivatives/README.md) |
| 4 | [scripts/4_extract_rois.sh](scripts/4_extract_rois.sh) | Stats files + masks | ROI beta CSVs | [derivatives/README.md](derivatives/README.md) |

Stage 3 also uses:
- [scripts/3a_afni_proc_template.sh](scripts/3a_afni_proc_template.sh) — the AFNI proc generator (4-run template, 41 regressors, 45 GLTs)
- [scripts/3b_fallback_patch.py](scripts/3b_fallback_patch.py) — rewrites the template for subjects with 2-3 runs

Every script is documented inline with full walkthrough in [scripts/README.md](scripts/README.md).

---

## Quick Navigation

### Symlinks at root (clickable shortcuts to data)

| Symlink | Points to | What's there |
|---------|-----------|--------------|
| `stage_1_fixed_events/` | `bids_fixed/` | Corrected BIDS events.tsv files |
| `stage_2_timing/` | `TimingFiles/Fixed2/` | Run-wise .1D timing files |
| `stage_3_glm_results/` | `derivatives/afni/IndvlLvlAnalyses/` | Per-subject GLM outputs |
| `stage_4_roi_extractions/` | `derivatives/afni/ROI_extractions/` | Per-ROI beta CSVs (the final product) |

---

## Full Directory Map

```
Y1_project/
│
├── scripts/                          Pipeline scripts (the things that run)
│   ├── 1_fix_events.py                  Stage 1: fix mislabeled events
│   ├── 2_generate_timing.sh             Stage 2: build .1D timing files
│   ├── 3_run_glm.sh                    Stage 3: orchestrate GLM
│   ├── 3a_afni_proc_template.sh         Stage 3: AFNI proc template
│   ├── 3b_fallback_patch.py             Stage 3: fewer-run fallback
│   ├── 4_extract_rois.sh               Stage 4: ROI beta extraction
│   ├── qc_summary.sh                   QC: per-subject quality control report
│   ├── audit_server.sh                  Check server structure
│   └── README.md                        Full inline walkthrough of every script
│
├── docs/                             Pipeline documentation
│   ├── masterplan.md                    Scientific plan + canonical paths
│   ├── pi-walkthrough.md               PI-facing narrative walkthrough
│   ├── decisions.md                     Decision log
│   ├── run-status.md                    Current completion status
│   └── qc-summary.md                   Per-subject QC metrics and flags
│
├── bids_fixed/                       Stage 1 output (gitignored, server only)
│   └── README.md                        What's in here + how it was made
│
├── TimingFiles/Fixed2/               Stage 2 output (gitignored, server only)
│   └── README.md                        Condition table + .1D format docs
│
├── derivatives/                      Stage 3 output (gitignored, server only)
│   └── README.md                        GLM details: 41 regressors, 45 GLTs
│
├── stage_1_fixed_events -> bids_fixed
├── stage_2_timing -> TimingFiles/Fixed2
├── stage_3_glm_results -> derivatives/afni/IndvlLvlAnalyses
├── stage_4_roi_extractions -> derivatives/afni/ROI_extractions
│
├── guides/
│   ├── pi-walkthrough/               HTML site (built from docs/pi-walkthrough.md)
│   │   ├── index.html
│   │   ├── build.py
│   │   └── assets/
│   └── undergrad/                    HTML tutorial for undergrad RAs
│       ├── index.html
│       └── steps/
│
├── literature/
│   ├── papers/                       RSA + social learning papers
│   ├── presentations/                Lab presentations, manuscript
│   ├── background/                   Billy email chains, reference code
│   ├── rsa-coding/                   Hypothesis generation code
│   ├── source-repos/                 Third-party RSA toolboxes
│   ├── sa-review/                    Social anxiety review docs
│   ├── roi-notes.docx               ROI candidate notes
│   └── Extracting_ROIs_Slab.pdf     Lab ROI extraction protocol
│
├── analysis/
│   ├── learn_clinical.csv            Clinical + demographic data (59 subjects x 92 cols)
│   ├── learn_behavioral.csv          Trial-level LEARN task data (6649 trials x 9 cols)
│   └── README.md                     Column definitions and data dictionary
│
├── proposals/
│   ├── project-proposal.docx         Original project proposal
│   ├── rsa-coding-notes.docx         Early RSA coding notes
│   └── meetings/                     Meeting notes
│
├── fmri-data/                        Symlink to server data share
│
├── archive/                          Dead ends and legacy docs
│   ├── legacy-pipeline-docs/         Old step-by-step pipeline docs
│   └── exploratory/                  Retired code
│
├── CLAUDE.md                         Agent instructions
├── LICENSE
└── THIRD_PARTY.md
```

---

## Key Documents

| Document | What it covers |
|----------|---------------|
| [scripts/README.md](scripts/README.md) | Full inline walkthrough of every script with code |
| [docs/masterplan.md](docs/masterplan.md) | Canonical paths, script chain, verification commands |
| [docs/pi-walkthrough.md](docs/pi-walkthrough.md) | PI-facing narrative of the entire pipeline journey |
| [docs/decisions.md](docs/decisions.md) | Why we made each major decision |
| [docs/run-status.md](docs/run-status.md) | Which subjects are done, what's left |
| [docs/qc-summary.md](docs/qc-summary.md) | Per-subject QC metrics: censoring, motion, TSNR, alignment |
| [bids_fixed/README.md](bids_fixed/README.md) | Stage 1 output: what was fixed and why |
| [TimingFiles/Fixed2/README.md](TimingFiles/Fixed2/README.md) | Stage 2 output: conditions, naming, .1D format |
| [derivatives/README.md](derivatives/README.md) | Stage 3 output: all 41 regressors and 45 GLTs |

---

## License

Original materials are All Rights Reserved (Danny Zweben). Third-party materials retain their original licenses — see [THIRD_PARTY.md](THIRD_PARTY.md).
