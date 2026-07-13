#!/usr/bin/env bash
set -euo pipefail

# Audit canonical server RSA-learn layout and flag drift.

SERVER_RSA="${SERVER_RSA:-/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/RSA-learn}"

die=0

must_exist=(
  "$SERVER_RSA/README.md"
  "$SERVER_RSA/scripts/1_fix_events.py"
  "$SERVER_RSA/scripts/2_generate_timing.sh"
  "$SERVER_RSA/scripts/3a_afni_proc_template.sh"
  "$SERVER_RSA/scripts/3b_fallback_patch.py"
  "$SERVER_RSA/scripts/3_run_glm.sh"
  "$SERVER_RSA/scripts/4_extract_rois.sh"
  "$SERVER_RSA/scripts/4b_extract_mentalizing_rois.sh"
  "$SERVER_RSA/scripts/5_extract_patterns.sh"
  "$SERVER_RSA/scripts/qc_summary.sh"
  "$SERVER_RSA/scripts/audit_server.sh"
  "$SERVER_RSA/scripts/README.md"
  "$SERVER_RSA/docs/masterplan.md"
  "$SERVER_RSA/docs/pi-walkthrough.md"
  "$SERVER_RSA/docs/decisions.md"
  "$SERVER_RSA/docs/run-status.md"
  "$SERVER_RSA/docs/qc-summary.md"
  "$SERVER_RSA/bids_fixed"
  "$SERVER_RSA/TimingFiles/Fixed2"
  "$SERVER_RSA/derivatives"
  "$SERVER_RSA/stage_1_fixed_events"
  "$SERVER_RSA/stage_2_timing"
  "$SERVER_RSA/stage_3_glm_results"
  "$SERVER_RSA/stage_4_roi_extractions"
  "$SERVER_RSA/derivatives/afni/ROI_extractions"
  "$SERVER_RSA/derivatives/afni/ROI_patterns"
)

must_absent=(
  "$SERVER_RSA/bids_fixed2"
  "$SERVER_RSA/TimingFiles/Fixed2_Anticipation"
  "$SERVER_RSA/TimingFiles/Fixed2_ISI"
  "$SERVER_RSA/TimingFiles/Full"
  "$SERVER_RSA/scripts/archive"
)

echo "== Required paths =="
for p in "${must_exist[@]}"; do
  if [[ -e "$p" ]] || [[ -L "$p" ]]; then
    echo "OK   $p"
  else
    echo "MISS $p"
    die=1
  fi
done

echo
echo "== Forbidden legacy paths =="
for p in "${must_absent[@]}"; do
  if [[ -e "$p" ]]; then
    echo "BAD  $p"
    die=1
  else
    echo "OK   $p"
  fi
done

echo
echo "== Canonical timing check =="
sample="$SERVER_RSA/TimingFiles/Fixed2/sub-958/Anticipation_pred_fdk.1D"
if [[ -f "$sample" ]]; then
  echo "OK   $sample"
else
  echo "MISS $sample"
  die=1
fi

echo
echo "== ROI extraction spot check =="
roi_dir="$SERVER_RSA/derivatives/afni/ROI_extractions"
expected_csvs=(vmPFC dACC1 dACC2 AntInsula VS Amygdala RTPJ dmPFC)
for roi in "${expected_csvs[@]}"; do
  csv="$roi_dir/${roi}_betas.csv"
  if [[ -f "$csv" ]]; then
    lines=$(wc -l < "$csv" | tr -d ' ')
    cols=$(head -1 "$csv" | tr ',' '\n' | wc -l | tr -d ' ')
    if [[ "$lines" -eq 39 && "$cols" -eq 42 ]]; then
      echo "OK   ${roi}_betas.csv (${lines} lines, ${cols} cols)"
    else
      echo "WARN ${roi}_betas.csv (${lines} lines, ${cols} cols — expected 39 lines, 42 cols)"
    fi
  else
    echo "MISS ${roi}_betas.csv"
    die=1
  fi
done

echo
echo "== Voxel pattern spot check =="
pattern_dir="$SERVER_RSA/derivatives/afni/ROI_patterns"
expected_rois=(vmPFC dACC1 dACC2 AntInsula VS Amygdala RTPJ dmPFC)
for roi in "${expected_rois[@]}"; do
  roi_subdir="$pattern_dir/$roi"
  if [[ -d "$roi_subdir" ]]; then
    n_files=$(find "$roi_subdir" -name "sub-*_${roi}_patterns.1D" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [[ "$n_files" -eq 38 ]]; then
      echo "OK   $roi/ ($n_files .1D files)"
    else
      echo "WARN $roi/ ($n_files .1D files — expected 38)"
    fi
  else
    echo "MISS $roi/"
    die=1
  fi
done
# Check cross-validation
xval="$pattern_dir/cross_validation.csv"
if [[ -f "$xval" ]]; then
  n_ok=$(grep -c "^OK" "$xval" 2>/dev/null || echo 0)
  n_fail=$(grep -c "^FAIL" "$xval" 2>/dev/null || echo 0)
  if [[ "$n_fail" -eq 0 && "$n_ok" -gt 0 ]]; then
    echo "OK   cross_validation.csv ($n_ok OK, $n_fail FAIL)"
  else
    echo "WARN cross_validation.csv ($n_ok OK, $n_fail FAIL)"
  fi
else
  echo "MISS cross_validation.csv"
fi

echo
echo "== Apple sidecar check (._*) =="
sidecar_list=$(
  {
    find "$SERVER_RSA" -maxdepth 1 -type f -name '._*' 2>/dev/null
    find "$SERVER_RSA/scripts" -maxdepth 2 -type f -name '._*' 2>/dev/null
    find "$SERVER_RSA/docs" -maxdepth 2 -type f -name '._*' 2>/dev/null
    find "$SERVER_RSA/logs" -maxdepth 2 -type f -name '._*' 2>/dev/null
  } | sed '/^$/d'
)
sidecars=$(printf "%s\n" "$sidecar_list" | sed '/^$/d' | wc -l | tr -d ' ')
if [[ "$sidecars" == "0" ]]; then
  echo "OK   none found"
else
  echo "WARN $sidecars sidecar files present"
  printf "%s\n" "$sidecar_list" | sed -n '1,20p'
fi

echo
if [[ "$die" == "1" ]]; then
  echo "AUDIT FAILED"
  exit 1
fi
echo "AUDIT PASSED"
