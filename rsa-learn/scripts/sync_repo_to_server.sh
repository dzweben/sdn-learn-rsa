#!/usr/bin/env bash
set -euo pipefail

# Sync canonical repo scripts/docs/walkthroughs to server RSA-learn.

REPO_ROOT="${REPO_ROOT:-/Users/dannyzweben/Desktop/SDN/Y1_project}"
REPO_RSA="$REPO_ROOT/rsa-learn"
SERVER_RSA="${SERVER_RSA:-/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/RSA-learn}"

if [[ ! -d "$REPO_RSA" ]]; then
  echo "ERROR: repo rsa-learn not found: $REPO_RSA" >&2
  exit 1
fi
if [[ ! -d "$SERVER_RSA" ]]; then
  echo "ERROR: server rsa-learn not found: $SERVER_RSA" >&2
  exit 1
fi

# Prevent Apple sidecar files on mounted shares.
export COPYFILE_DISABLE=1

copy_file() {
  local src="$1"
  local dst="$2"
  if cp -f -X "$src" "$dst" 2>/dev/null; then
    return 0
  fi
  cp -f "$src" "$dst"
}

mkdir -p "$SERVER_RSA/scripts" "$SERVER_RSA/docs" "$SERVER_RSA/sandbox"

copy_file "$REPO_RSA/README.md" "$SERVER_RSA/README.md"

copy_file "$REPO_RSA/scripts/LEARN_fix_nopred_fdbk_by_template.py" "$SERVER_RSA/scripts/"
copy_file "$REPO_RSA/scripts/LEARN_1D_AFNItiming_Full_RSA_runwise_Anticipation.sh" "$SERVER_RSA/scripts/"
copy_file "$REPO_RSA/scripts/LEARN_ap_Full_RSA_runwise_AFNI_noblur_Anticipation.sh" "$SERVER_RSA/scripts/"
copy_file "$REPO_RSA/scripts/LEARN_ap_fallback_patch_afni_raw.py" "$SERVER_RSA/scripts/"
copy_file "$REPO_RSA/scripts/LEARN_run_RSA_runwise_pipeline_afni_raw_Anticipation.sh" "$SERVER_RSA/scripts/"
copy_file "$REPO_RSA/scripts/LEARN_run_RSA_FINAL.sh" "$SERVER_RSA/scripts/"
copy_file "$REPO_RSA/scripts/sync_repo_to_server.sh" "$SERVER_RSA/scripts/"
copy_file "$REPO_RSA/scripts/audit_server_layout.sh" "$SERVER_RSA/scripts/"
copy_file "$REPO_RSA/scripts/README.md" "$SERVER_RSA/scripts/README.md"

copy_file "$REPO_RSA/docs/PIPELINE_FINAL_CANONICAL.md" "$SERVER_RSA/docs/"
copy_file "$REPO_RSA/docs/RUN_STATUS_AND_DATA_REQUIREMENTS.md" "$SERVER_RSA/docs/"
copy_file "$REPO_RSA/docs/PROJECT_SOUL_GUIDELINES.md" "$SERVER_RSA/docs/"
copy_file "$REPO_RSA/docs/PROJECT_SOUL_INTERNAL.md" "$SERVER_RSA/docs/"
copy_file "$REPO_RSA/docs/DECISION_LOG.md" "$SERVER_RSA/docs/"
copy_file "$REPO_RSA/docs/HTML_MAINTENANCE_PROTOCOL.md" "$SERVER_RSA/docs/"
copy_file "$REPO_RSA/docs/NEXT_AGENT_SPEC_NEW_RA_WALKTHROUGH.md" "$SERVER_RSA/docs/"
copy_file "$REPO_RSA/docs/NEXT_AGENT_UNDERGRAD_PIPELINE_PREP.md" "$SERVER_RSA/docs/"
copy_file "$REPO_RSA/docs/REPO_SERVER_OPERATING_MODEL.md" "$SERVER_RSA/docs/"
copy_file "$REPO_RSA/docs/README.md" "$SERVER_RSA/docs/README.md"

copy_file "$REPO_ROOT/LEARN_RSA_MASTERPLAN_FINAL.md" "$SERVER_RSA/docs/LEARN_RSA_MASTERPLAN_FINAL.md"
copy_file "$REPO_ROOT/LEARN_RSA_MASTERPLAN_FINAL.html" "$SERVER_RSA/docs/LEARN_RSA_MASTERPLAN_FINAL.html"
copy_file "$REPO_ROOT/LEARN_RSA_PI_WALKTHROUGH.md" "$SERVER_RSA/docs/LEARN_RSA_PI_WALKTHROUGH.md"
copy_file "$REPO_ROOT/pi_walkthrough_site/index.html" "$SERVER_RSA/docs/LEARN_RSA_PI_WALKTHROUGH.html"

chmod +x "$SERVER_RSA/scripts/LEARN_run_RSA_FINAL.sh"
chmod +x "$SERVER_RSA/scripts/sync_repo_to_server.sh"
chmod +x "$SERVER_RSA/scripts/audit_server_layout.sh"

# Keep human-facing operational README stubs in runtime folders.
mkdir -p "$SERVER_RSA/logs" "$SERVER_RSA/notes"
cat > "$SERVER_RSA/logs/README.md" <<'EOF'
# logs/

This folder stores logs from current canonical runs.

Typical files:
- `ap.<subj>.log` from proc generation stage
- `output.proc.<subj>.LEARN_RSA_runwise_AFNI` from subject run stage

Legacy logs should be moved to `sandbox/`.
EOF

cat > "$SERVER_RSA/notes/README.md" <<'EOF'
# notes/

This folder is for short current notes only.

Do not keep historical attempts here.
Move old notes/audits to `sandbox/`.
EOF

# Best-effort cleanup of Apple sidecar files in active, human-facing paths.
# We intentionally avoid scanning heavy data trees (TimingFiles/derivatives/bids_fixed).
for d in "$SERVER_RSA" "$SERVER_RSA/scripts" "$SERVER_RSA/docs" "$SERVER_RSA/logs" "$SERVER_RSA/notes"; do
  [[ -d "$d" ]] || continue
  find "$d" -maxdepth 2 -type f -name '._*' -delete 2>/dev/null || true
done

echo "Synced canonical repo files to server:"
echo "  $SERVER_RSA"
