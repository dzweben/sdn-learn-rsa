# LEARN · RSA of social-feedback learning

Year-1 PhD project. Representational Similarity Analysis + Inter-Subject Correlation on fMRI
from the **LEARN** social-feedback task, asking how **trait social anxiety (SCARED-C social)**
reshapes the neural representation of peer feedback across a learning session.

**N = 33** adolescents · 4 runs · AFNI GLM, **no spatial smoothing**, explicit
prediction→feedback anticipation modeling · run-wise, valence-split feedback betas.

---

## The three findings

| # | Analysis | Result | FDR |
|---|----------|--------|-----|
| **1** | **Model Alignment RSA** | Higher SA → rostral-ACC peer representations sharpen across runs. SA × Run interaction: **b = +.032, t = +3.62, p<sub>joint</sub> = .0007** | **q = .025 ✅** |
| **2** | **Temporal ISC** (36 social-brain ROIs) | Higher SA → BOLD time course drifts from the group (idiosyncrasy), strongest medially: rACC **ρ = −.53**, aMCC **ρ = −.50** | q ≈ .052–.059 (just outside) |
| **3** | **Whole-brain ISC** (Schaefer-400) | Same idiosyncrasy test across cortex; one survivor in dorsal medial-frontal cortex: **RH_Cont_Cing ρ = −.65** | **q = .017 ✅** |

All three converge on **rostral / mid-cingulate medial frontal cortex**. The interactive report
renders every ROI, brain viewer, and table: **[`analysis/new-v2/index.html`](analysis/new-v2/index.html)**.

---

## The pipeline — raw BIDS → the three findings

Everything is one numbered, idempotent, config-driven script set under **[`pipeline/`](pipeline/)**.
Change a path or the subject list in **`pipeline/config.sh`** and nowhere else.

```
config.sh ── single source of truth (paths · 33-subject list · GLM_LABEL · masks · clinical)
   │
   ▼
01_fix_events.py     bids/ ─────────────► events_fixed/        canonical peer×feedback labels
02_make_timing.sh    events_fixed/ ─────► timing/              run-wise .1D (FBM/FBN × peer × run, pred, resp, anticipation)
03_glm.sh            raw BIDS + timing/ ► …/<id>.results.feedback_runwise_glm/   AFNI no-blur proc → pb04 → 3dDeconvolve (41 reg)
   │
   ├─► 04_model_alignment_and_temporal_isc.py   betas ─► results/   FINDING #1 + #2
   └─► 05_wholebrain_isc.py                      pb04  ─► results/   FINDING #3
```

**Run it** (recommended run-box: CR2):

```bash
bash pipeline/run_all.sh              # everything, raw BIDS → results
bash pipeline/run_all.sh --analysis   # skip preprocessing, re-run just 04–05
bash pipeline/03_glm.sh 1055 958      # any single step, any subset of subjects
```

Every step skips finished work, so re-running is cheap. Quick reference: **[`pipeline/README.md`](pipeline/README.md)**.

> **Read this first: [`pipeline/walkthrough.html`](pipeline/walkthrough.html)** is the top-to-bottom guideline — every script, the exact command that runs it, what goes in and out, where the data live on the clusters, and links to every source (AFNI, nilearn, Schaefer, Nastase ISC, the social-brain atlas). Open it in a browser.

### Method notes that matter
- **No spatial smoothing** — RSA needs unsmoothed multivoxel patterns.
- **Corrected pre-enrichment timing** — an intermediate "enriched" event set attenuated the effect; `02` regenerates the correct timing (proven byte-identical to the timing that made the validated betas).
- **ISC = warped LOO per run, then averaged across runs** (each warped run z-scored) — *not* concatenated. Faithful ports of the original producers (archived under `archive/original-isc-producers/`).

---

## Repository layout

**Canonical (the project of record):**

| Path | What |
|------|------|
| [`pipeline/`](pipeline/) | The entire analysis: numbered `01`→`05`, `config.sh`, `lib/` engines, `run_all.sh` |
| [`analysis/new-v2/`](analysis/new-v2/) | The interactive results report (`index.html` + self-contained `data/`) |
| [`analysis/learn_clinical.csv`](analysis/learn_clinical.csv), `learn_behavioral.csv` | Clinical (SA) + trial-level behavioral data the pipeline reads |
| [`docs/`](docs/) | `decisions.md` (canonical decision log), `run-status.md` |
| [`presentations/Flux_2026/`](presentations/Flux_2026/) | FLUX 2026 abstract + `methods.md` walkthrough |
| [`guides/`](guides/) | PI walkthrough site + undergrad tutorial |
| `scripts/` | Legacy stage-based pipeline (superseded by `pipeline/`; kept for reference) |

**Archived (dead ends + exploratory — never deleted, never used for new work):** [`archive/`](archive/)

| Path | What |
|------|------|
| `archive/exploratory-scripts/` | 43 exploratory analysis scripts (LSS, Glasser, Anna-Karenina spatial IS-RSA, DK, network, parcel, searchlight, event-locked ISC, …) |
| `archive/exploratory-analyses/` | Their outputs + alternate report builds (`new-v2-s400`, `new-v3-glasser`, `lss_trial_consistency`, figures) |
| `archive/original-isc-producers/` | The **original** CR1 producers for findings #2/#3, ported faithfully into `pipeline/04`+`05` |
| `archive/legacy-pipeline-docs/` | Earlier masterplan / step docs |

**Data (gitignored — live on the server):** `bids_fixed/`, `TimingFiles/`, `derivatives/`.

---

## Servers

- **Repo of record:** CR1 (`cla19097` / `155.247.67.31`) — parent LEARN study.
- **Run-box:** CR2 (`155.247.66.164`) — more free cores. Paths are identical on both (in `config.sh`).
- Layout here mirrors the server `RSA-learn/`. The server is **not** a git repo — sync changed files via the mount (`/Volumes/Jarcho_DataShare/…`) or `scp`, then `bash scripts/audit_server.sh`.
