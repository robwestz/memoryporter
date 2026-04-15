#!/usr/bin/env bash
# Install repo-strategy-orchestrator to ~/.claude/skills/
#
# Copies the skill package into the global Claude Code skills directory
# so the skill can be triggered from any project. Skips portable-kit-
# specific files (examples/, agents/ — which hold rebuild prompts and
# ChatGPT-only config).
#
# Idempotent — safe to re-run to update an existing install.

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SKILL_NAME="repo-strategy-orchestrator"
TARGET_BASE="${HOME}/.claude/skills"
TARGET="${TARGET_BASE}/${SKILL_NAME}"

echo "=== Installing ${SKILL_NAME} ==="
echo "  source: ${SCRIPT_DIR}"
echo "  target: ${TARGET}"
echo

mkdir -p "${TARGET_BASE}"

if [ -d "${TARGET}" ]; then
  echo "Existing install found — replacing."
  rm -rf "${TARGET}"
fi

mkdir -p "${TARGET}"

# Copy the tight scope — canonical capability files.
# Excluded: examples/ (portable-kit-specific), agents/ (ChatGPT-only),
# install.sh + verify.sh (you don't need to re-install from inside).
cp "${SCRIPT_DIR}/SKILL.md"           "${TARGET}/"
cp "${SCRIPT_DIR}/CAPABILITIES.md"    "${TARGET}/"
cp "${SCRIPT_DIR}/README.md"          "${TARGET}/"
cp "${SCRIPT_DIR}/metadata.json"      "${TARGET}/"
cp "${SCRIPT_DIR}/USAGE-PATTERNS.md"  "${TARGET}/"

cp -r "${SCRIPT_DIR}/references"      "${TARGET}/"
cp -r "${SCRIPT_DIR}/templates"       "${TARGET}/"
cp -r "${SCRIPT_DIR}/scripts"         "${TARGET}/"

chmod +x "${TARGET}/scripts/"*.py 2>/dev/null || true

echo "Files installed:"
find "${TARGET}" -type f | sed "s|${TARGET}/|  |" | sort

echo
echo "=== Install complete ==="
echo "  Skill now triggers on: repo analysis, audit, constraints, options,"
echo "  post-mortem, tech-debt triage, architecture migration, and related."
echo
echo "  Next: run verify.sh to confirm the scripts work end-to-end."
echo "    bash ${SCRIPT_DIR}/verify.sh"
