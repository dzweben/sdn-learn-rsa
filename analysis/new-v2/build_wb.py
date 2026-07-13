#!/usr/bin/env python3
"""Emit full Schaefer 400 whole-brain tables with network labels → wb_full.js."""
import json
from pathlib import Path

HERE = Path(__file__).parent
DATA = HERE / "data"
OUT = HERE / "wb_full.js"

with open(DATA / "wholebrain_400_temporal_isc_results.json") as f:
    wb_t = json.load(f)
with open(DATA / "wholebrain_400_loo_isc_results.json") as f:
    wb_s = json.load(f)

# Schaefer 7Networks parcel name → { hemi, network, sub, idx }
# e.g. "7Networks_RH_Cont_Cing_2" → hemi=RH, network=Cont, sub=Cing, idx=2
def parse_name(n):
    parts = n.split("_")
    if len(parts) < 4:
        return {"hemi": "", "network": "", "sub": "", "idx": ""}
    hemi = parts[1]
    network = parts[2]
    # Sub-region is parts[3:-1], idx is parts[-1]
    idx = parts[-1]
    sub = "_".join(parts[3:-1]) if len(parts) > 4 else ""
    return {"hemi": hemi, "network": network, "sub": sub, "idx": idx}


def rowify(r):
    n = r.get("name", "")
    meta = parse_name(n)
    # Shorten display name: strip 7Networks_ prefix
    disp = n.replace("7Networks_", "") if n.startswith("7Networks_") else n
    rho = r.get("rho")
    return {
        "parcel_id": r.get("parcel_id"),
        "name": disp,
        "hemi": meta["hemi"],
        "network": meta["network"],
        "sub": meta["sub"],
        "n_voxels": r.get("n_voxels", 0),
        "mean_isc_z": round(float(r.get("mean_isc_z", r.get("mean_sim_z", 0)) or 0), 4),
        "group_t": (round(float(r.get("group_t", 0) or 0), 3) if r.get("group_t") is not None else None),
        "rho": round(float(rho), 4) if rho is not None else None,
        "p": round(float(r.get("p", 1) or 1), 5),
        "q_fdr": round(float(r.get("q_fdr", 1) or 1), 4),
    }


temporal = [rowify(r) for r in wb_t["results"]]
spatial_nice = [rowify(r) for r in wb_s["Nice"]]
spatial_mean = [rowify(r) for r in wb_s["Mean"]]

# Network aggregation: per network, count parcels at p<.05, q<.05, min p, best parcel
def aggregate_by_network(rows, n_total=400):
    nets = {}
    for r in rows:
        net = r["network"] or "unknown"
        if net not in nets:
            nets[net] = {"network": net, "n_parcels": 0, "n_p05": 0, "n_q05": 0,
                         "min_p": 1.0, "best_name": "", "best_rho": None, "best_q": 1.0}
        nets[net]["n_parcels"] += 1
        if r["p"] is not None and r["p"] < 0.05:
            nets[net]["n_p05"] += 1
        if r["q_fdr"] is not None and r["q_fdr"] < 0.05:
            nets[net]["n_q05"] += 1
        if r["p"] is not None and r["p"] < nets[net]["min_p"]:
            nets[net]["min_p"] = r["p"]
            nets[net]["best_name"] = r["name"]
            nets[net]["best_rho"] = r["rho"]
            nets[net]["best_q"] = r["q_fdr"]
    # as list, sorted by min_p
    out = sorted(nets.values(), key=lambda d: d["min_p"])
    return out


WB = {
    "temporal": temporal,
    "spatial_nice": spatial_nice,
    "spatial_mean": spatial_mean,
    "agg_temporal": aggregate_by_network(temporal),
    "agg_spatial_nice": aggregate_by_network(spatial_nice),
    "agg_spatial_mean": aggregate_by_network(spatial_mean),
    "n_subjects": 33,
}

OUT.write_text(f"const WB_FULL={json.dumps(WB, separators=(',',':'))};\n")
print(f"wrote {OUT.name}  ({OUT.stat().st_size/1024:.1f} KB)")
print(f"  temporal: {len(temporal)} parcels")
print(f"  spatial_nice: {len(spatial_nice)} parcels")
print(f"  spatial_mean: {len(spatial_mean)} parcels")

# Quick summary print
for label, rows in [("TEMPORAL", temporal), ("SPATIAL NICE", spatial_nice), ("SPATIAL MEAN", spatial_mean)]:
    p05 = sum(1 for r in rows if r["p"] is not None and r["p"] < 0.05)
    q05 = sum(1 for r in rows if r["q_fdr"] is not None and r["q_fdr"] < 0.05)
    q10 = sum(1 for r in rows if r["q_fdr"] is not None and r["q_fdr"] < 0.10)
    print(f"  {label}: p<.05 = {p05}, q<.05 = {q05}, q<.10 = {q10}")
