#!/usr/bin/env python3
from pathlib import Path
import sys

# Usage: LEARN_ap_fallback_patch_afni_raw.py <ap_tmp> <subj> <runs...>

if len(sys.argv) < 4:
    raise SystemExit("Usage: LEARN_ap_fallback_patch_afni_raw.py <ap_tmp> <subj> <runs...>")

ap = Path(sys.argv[1])
subj = sys.argv[2]
runs = [int(r) for r in sys.argv[3:] if r.strip().isdigit()]
if not runs:
    raise SystemExit("No runs provided")

stimdir = "$stimdir"
subj_dir = "$subj_dir"

stim_defs = [
    ("NonPM_Mean60_fdkm", "FBM.Mean60"),
    ("NonPM_Mean60_fdkn", "FBN.Mean60"),
    ("NonPM_Mean80_fdkm", "FBM.Mean80"),
    ("NonPM_Mean80_fdkn", "FBN.Mean80"),
    ("NonPM_Nice60_fdkm", "FBM.Nice60"),
    ("NonPM_Nice60_fdkn", "FBN.Nice60"),
    ("NonPM_Nice80_fdkm", "FBM.Nice80"),
    ("NonPM_Nice80_fdkn", "FBN.Nice80"),
]

pred_resp = [
    ("Mean60_pred", "Pred.Mean60"),
    ("Mean60_rsp", "Resp.Mean60"),
    ("Mean80_pred", "Pred.Mean80"),
    ("Mean80_rsp", "Resp.Mean80"),
    ("Nice60_pred", "Pred.Nice60"),
    ("Nice60_rsp", "Resp.Nice60"),
    ("Nice80_pred", "Pred.Nice80"),
    ("Nice80_rsp", "Resp.Nice80"),
]

text = ap.read_text()
lines = text.splitlines()


def replace_block(start_key, end_key, new_lines):
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if start_key in line:
            out.append(line)
            i += 1
            while i < len(lines) and end_key not in lines[i]:
                i += 1
            out.extend(new_lines)
            continue
        if end_key in line:
            out.append(line)
            i += 1
            continue
        out.append(line)
        i += 1
    return out


def replace_stim_times(lines_in, stim_times_lines):
    out = []
    i = 0
    while i < len(lines_in):
        line = lines_in[i]
        ls = line.lstrip()
        if ls.startswith("-regress_stim_times"):
            out.append(line)
            i += 1
            while i < len(lines_in) and "-regress_stim_labels" not in lines_in[i]:
                i += 1
            out.extend(stim_times_lines)
            continue
        out.append(line)
        i += 1
    return out


def build_dsets():
    out = []
    for r in runs:
        out.append(
            f\"\\t\\t\\t{subj_dir}/func/sub-{subj}_task-learn_run-{r:02d}_bold.nii.gz \\\\\")
    return out


stim_times = []
stim_labels = []
for r in runs:
    for s, lab in stim_defs:
        stim_times.append(f\"\\t\\t{stimdir}/{s}_run{r}.1D \\\\\")
        stim_labels.append(f\"\\t\\t{lab}.r{r} \\\\\")

for s, lab in pred_resp:
    stim_times.append(f\"\\t\\t{stimdir}/{s}.1D \\\\\")
    stim_labels.append(f\"\\t\\t{lab} \\\\\")

stim_count = len(stim_labels)
stim_types = [\"\\t\\tAM1 \\\\\"] * stim_count
basis_multi = [\"\\t\\t'dmBLOCK(0)' \\\\\"] * stim_count

lines = replace_block('-dsets', '-scr_overwrite', build_dsets())
lines = replace_stim_times(lines, stim_times)
lines = replace_block('-regress_stim_labels', '-regress_stim_types', stim_labels)
lines = replace_block('-regress_stim_types', '-regress_basis_multi', stim_types)
lines = replace_block('-regress_basis_multi', '-regress_make_ideal_sum', basis_multi)

# Ensure -regress_stim_times exists
if not any(l.lstrip().startswith("-regress_stim_times") for l in lines):
    for i, l in enumerate(lines):
        if "-test_stim_files" in l or "-regress_stim_times_offset" in l:
            lines.insert(i + 1, "\\t\\t-regress_stim_times \\\\")
            break


def fmt_w(x):
    if abs(x - 1.0) < 1e-8:
        return \"\"
    return f\"{x:.6f}*\"


def glt(sym, label, idx):
    return f\"\\t\\t-gltsym 'SYM: {sym}' -glt_label {idx} {label} \\\\\"


runs_sorted = runs
num_runs = len(runs_sorted)


def all_run_terms(peer=None, cond=None):
    terms = []
    for r in runs_sorted:
        if peer and cond:
            terms.append(f\"+{peer}.{cond}.r{r}\")
        elif peer:
            for c in [\"Mean60\",\"Mean80\",\"Nice60\",\"Nice80\"]:\n                terms.append(f\"+{peer}.{c}.r{r}\")\n        else:\n            for p in [\"FBM\",\"FBN\"]:\n                for c in [\"Mean60\",\"Mean80\",\"Nice60\",\"Nice80\"]:\n                    terms.append(f\"+{p}.{c}.r{r}\")\n    return terms\n+\n+\n+glt_lines = []\n+idx = 1\n+\n+task_terms = all_run_terms() + [\n+    \"+Pred.Mean60\", \"+Resp.Mean60\", \"+Pred.Mean80\", \"+Resp.Mean80\",\n+    \"+Pred.Nice60\", \"+Resp.Nice60\", \"+Pred.Nice80\", \"+Resp.Nice80\",\n+]\n+glt_lines.append(glt(\" \".join(task_terms), \"Task.V.BL\", idx)); idx += 1\n+\n+glt_lines.append(glt(\"+Pred.Mean60 +Pred.Mean80 +Pred.Nice60 +Pred.Nice80\", \"Prediction.V.BL\", idx)); idx += 1\n+\n+glt_lines.append(glt(\"+Pred.Mean60 +Pred.Mean80 -Pred.Nice60 -Pred.Nice80\", \"Prediction.Mean.V.Nice\", idx)); idx += 1\n+\n+glt_lines.append(glt(\" \".join(all_run_terms()), \"FB.V.BL\", idx)); idx += 1\n+\n+glt_lines.append(glt(\" \".join(all_run_terms(peer=\"FBM\")), \"FBM.V.BL\", idx)); idx += 1\n+\n+glt_lines.append(glt(\" \".join(all_run_terms(peer=\"FBN\")), \"FBN.V.BL\", idx)); idx += 1\n+\n+fbm_terms = all_run_terms(peer=\"FBM\")\n+fbn_terms = [t.replace(\"+\", \"-\") for t in all_run_terms(peer=\"FBN\")]\n+glt_lines.append(glt(\" \".join(fbm_terms + fbn_terms), \"FBM.V.FBN\", idx)); idx += 1\n+\n+for r in runs_sorted:\n+    glt_lines.append(glt(f\"+0.5*FBM.Mean60.r{r} +0.5*FBN.Mean60.r{r}\", f\"Mean60.r{r}\", idx)); idx += 1\n+    glt_lines.append(glt(f\"+0.5*FBM.Mean80.r{r} +0.5*FBN.Mean80.r{r}\", f\"Mean80.r{r}\", idx)); idx += 1\n+    glt_lines.append(glt(f\"+0.5*FBM.Nice60.r{r} +0.5*FBN.Nice60.r{r}\", f\"Nice60.r{r}\", idx)); idx += 1\n+    glt_lines.append(glt(f\"+0.5*FBM.Nice80.r{r} +0.5*FBN.Nice80.r{r}\", f\"Nice80.r{r}\", idx)); idx += 1\n+\n+for r in runs_sorted:\n+    glt_lines.append(glt(f\"+0.25*FBM.Mean60.r{r} +0.25*FBM.Mean80.r{r} +0.25*FBM.Nice60.r{r} +0.25*FBM.Nice80.r{r}\", f\"FBM.r{r}\", idx)); idx += 1\n+    glt_lines.append(glt(f\"+0.25*FBN.Mean60.r{r} +0.25*FBN.Mean80.r{r} +0.25*FBN.Nice60.r{r} +0.25*FBN.Nice80.r{r}\", f\"FBN.r{r}\", idx)); idx += 1\n+\n+wr = 1.0 / num_runs\n+for cond in [\"Mean60\",\"Mean80\",\"Nice60\",\"Nice80\"]:\n+    fbm = \" \".join([f\"+{fmt_w(wr)}FBM.{cond}.r{r}\" for r in runs_sorted])\n+    fbn = \" \".join([f\"+{fmt_w(wr)}FBN.{cond}.r{r}\" for r in runs_sorted])\n+    glt_lines.append(glt(fbm, f\"FBM.{cond}.all\", idx)); idx += 1\n+    glt_lines.append(glt(fbn, f\"FBN.{cond}.all\", idx)); idx += 1\n+\n+wpr = 1.0 / (2 * num_runs)\n+for cond in [\"Mean60\",\"Mean80\",\"Nice60\",\"Nice80\"]:\n+    terms = []\n+    for r in runs_sorted:\n+        terms.append(f\"+{fmt_w(wpr)}FBM.{cond}.r{r}\")\n+        terms.append(f\"+{fmt_w(wpr)}FBN.{cond}.r{r}\")\n+    glt_lines.append(glt(\" \".join(terms), f\"{cond}.all\", idx)); idx += 1\n+\n+wfb = 1.0 / (4 * num_runs)\n+fbm_terms = []\n+fbn_terms = []\n+for r in runs_sorted:\n+    for cond in [\"Mean60\",\"Mean80\",\"Nice60\",\"Nice80\"]:\n+        fbm_terms.append(f\"+{fmt_w(wfb)}FBM.{cond}.r{r}\")\n+        fbn_terms.append(f\"+{fmt_w(wfb)}FBN.{cond}.r{r}\")\n+\n+glt_lines.append(glt(\" \".join(fbm_terms), \"FBM.all\", idx)); idx += 1\n+glt_lines.append(glt(\" \".join(fbn_terms), \"FBN.all\", idx)); idx += 1\n+\n+filtered = []\n+inserted = False\n+for line in lines:\n+    if ' -num_glt ' in line or line.strip().startswith('-gltsym') or ' -glt_label ' in line:\n+        continue\n+    filtered.append(line)\n+    if (not inserted) and line.strip().startswith('-local_times'):\n+        filtered.append(f\"\\t\\t-num_glt {len(glt_lines)} \\\\\")\n+        filtered.extend(glt_lines)\n+        inserted = True\n+\n+ap.write_text(\"\\n\".join(filtered) + \"\\n\")\n*** End Patch"}}
