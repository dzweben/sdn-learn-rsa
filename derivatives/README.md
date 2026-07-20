# derivatives/

Everything the pipeline computes from the raw data. Nothing in here is edited by hand.

| Path | What |
|------|------|
| `afni/IndvlLvlAnalyses/` | Per-subject GLM output, one directory per subject. |
| `afni/results/` | The three analysis result JSONs. |

Contents are produced by `pipeline/03_glm.sh` (per-subject GLM) and by
`pipeline/04_model_alignment_and_temporal_isc.py` + `pipeline/05_wholebrain_isc.py` (results).
This directory is not tracked in git. It exists on both clusters at the same path.
