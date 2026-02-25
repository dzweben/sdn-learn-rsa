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
  "$SERVER_RSA/scripts/sync_to_server.sh"
  "$SERVER_RSA/scripts/audit_server.sh"
  "$SERVER_RSA/scripts/README.md"
  "$SERVER_RSA/docs/masterplan.md"
  "$SERVER_RSA/docs/pi-walkthrough.md"
  "$SERVER_RSA/docs/decisions.md"
  "$SERVER_RSA/docs/run-status.md"
  "$SERVER_RSA/bids_fixed"
  "$SERVER_RSA/TimingFiles/Fixed2"
  "$SERVER_RSA/derivatives"
  "$SERVER_RSA/stage_1_fixed_events"
  "$SERVER_RSA/stage_2_timing"
  "$SERVER_RSA/stage_3_glm_results"
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
