#!/usr/bin/env bash
set -euo pipefail

# Sync canonical repo scripts/docs/walkthroughs to server RSA-learn.

REPO_ROOT="${REPO_ROOT:-/Users/dannyzweben/Desktop/SDN/Y1_project}"
REPO_RSA="$REPO_ROOT/pipeline"
SERVER_RSA="${SERVER_RSA:-/Volumes/Jarcho_DataShare/projects/STUDIES/LEARN/fMRI/RSA-learn}"

if [[ ! -d "$REPO_RSA" ]]; then
  echo "ERROR: repo pipeline not found: $REPO_RSA" >&2
  exit 1
fi
if [[ ! -d "$SERVER_RSA" ]]; then
  echo "ERROR: server RSA-learn not found: $SERVER_RSA" >&2
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

copy_file "$REPO_RSA/scripts/fix_nopred_fdbk.py" "$SERVER_RSA/scripts/"
copy_file "$REPO_RSA/scripts/generate_timing.sh" "$SERVER_RSA/scripts/"
copy_file "$REPO_RSA/scripts/afni_proc_template.sh" "$SERVER_RSA/scripts/"
copy_file "$REPO_RSA/scripts/fallback_patch.py" "$SERVER_RSA/scripts/"
copy_file "$REPO_RSA/scripts/run_glm.sh" "$SERVER_RSA/scripts/"
copy_file "$REPO_RSA/scripts/sync_to_server.sh" "$SERVER_RSA/scripts/"
copy_file "$REPO_RSA/scripts/audit_server.sh" "$SERVER_RSA/scripts/"

copy_file "$REPO_RSA/docs/masterplan.md" "$SERVER_RSA/docs/"
copy_file "$REPO_RSA/docs/pi-walkthrough.md" "$SERVER_RSA/docs/"
copy_file "$REPO_RSA/docs/decisions.md" "$SERVER_RSA/docs/"
copy_file "$REPO_RSA/docs/run-status.md" "$SERVER_RSA/docs/"
copy_file "$REPO_ROOT/guides/pi-walkthrough/index.html" "$SERVER_RSA/docs/pi-walkthrough.html"

chmod +x "$SERVER_RSA/scripts/generate_timing.sh"
chmod +x "$SERVER_RSA/scripts/run_glm.sh"
chmod +x "$SERVER_RSA/scripts/sync_to_server.sh"
chmod +x "$SERVER_RSA/scripts/audit_server.sh"

mkdir -p "$SERVER_RSA/logs"

# Best-effort cleanup of Apple sidecar files in active, human-facing paths.
for d in "$SERVER_RSA" "$SERVER_RSA/scripts" "$SERVER_RSA/docs" "$SERVER_RSA/logs"; do
  [[ -d "$d" ]] || continue
  find "$d" -maxdepth 2 -type f -name '._*' -delete 2>/dev/null || true
done

echo "Synced canonical repo files to server:"
echo "  $SERVER_RSA"
