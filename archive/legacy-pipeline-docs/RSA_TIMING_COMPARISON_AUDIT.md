# RSA Timing Comparison Audit

Purpose: Provide concrete, side‑by‑side examples of a **normal** subject/run timing file versus a **missing/blank** run timing file, using the existing AFNI `ap_PEV` stimuli outputs on the mounted drive. Blank lines correspond to runs with **zero events** for that condition.

All examples below are real files on the mounted drive:
`/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/derivatives/afni/ap_PEV/.../stimuli/*.1D`

---

## Normal Example (all runs populated)

**Subject:** sub‑1028  
**Condition file:** `Mean80_fdkn.1D`

Path:
```
/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/derivatives/afni/ap_PEV/1028/1028.results.LEARN_PM_PEV_AFNI.1mm/stimuli/Mean80_fdkn.1D
```
Line‑numbered preview (each line = run 1–4):
```
1  218.6*0.669:3 
2  33.019*0.636:3 357.7*0.724:3 
3  218.588*0.725:3 
4  120.062*0.745:3.001 
```
Result: **All 4 runs have events** (no blank lines).

---

## Broken Example 1 (run‑1 missing)

**Subject:** sub‑1215  
**Condition file:** `Mean80_fdkn.1D`

Path:
```
/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/derivatives/afni/ap_PEV/1215/1215.results.LEARN_PM_PEV_AFNI.1mm/stimuli/Mean80_fdkn.1D
```
Line‑numbered preview:
```
1
2  33.036*0.743:3 357.601*0.762:3 
3  218.501*0.737:3 
4  119.963*0.747:3 305.429*0.708:3 
```
Result: **Run‑1 is blank** → zero events for this condition in that run.

---

## Broken Example 2 (run‑3 missing)

**Subject:** sub‑1308  
**Condition file:** `Nice80_fdkm.1D`

Path:
```
/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/derivatives/afni/ap_PEV/1308/1308.results.LEARN_PM_PEV_AFNI.1mm/stimuli/Nice80_fdkm.1D
```
Line‑numbered preview:
```
1  299.641*-0.724:3 
2  114.168*-0.697:3 345.984*-0.716:3 
3
4  160.554*-0.781:3 346.069*-0.686:3 
```
Result: **Run‑3 is blank** → zero events for this condition in that run.

---

## Broken Example 3 (run‑3 missing)

**Subject:** sub‑1534  
**Condition file:** `Mean80_fdkn.1D`

Path:
```
/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/derivatives/afni/ap_PEV/1534/1534.results.LEARN_PM_PEV_AFNI.1mm/stimuli/Mean80_fdkn.1D
```
Line‑numbered preview:
```
1  217.868*0.669:3 
2  32.768*0.678:3 356.666*0.75:3 
3
4  125.299*0.787:3 310.365*0.723:3 
```
Result: **Run‑3 is blank** → zero events for this condition in that run.

---

## Interpretation

- A **blank line** in the `.1D` file means **no events for that condition in that run**.
- These blanks already exist in the older AFNI `ap_PEV` stimuli outputs, so this is **not** introduced by the new run‑wise pipeline.
- If the task truly delivered every feedback type every run, then the issue is upstream in the **events.tsv generation**, not in AFNI.

---

## (Optional) How to verify a file yourself

Open any file above and inspect lines 1–4. Each line corresponds to a run:
- **Line 1** → run‑1
- **Line 2** → run‑2
- **Line 3** → run‑3
- **Line 4** → run‑4

If a line is blank, that run has zero events for that condition.

