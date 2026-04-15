#!/usr/bin/env bash
# Phase [VARIABLE: NN] verification — [VARIABLE: PHASE_NAME]
# Exits 0 if phase is complete, non-zero otherwise.
set -euo pipefail

PHASE="[VARIABLE: NN]"
cd "$(dirname "$0")/.."

echo "=== Verifying Phase $PHASE ==="

# --- Required files ---
required_files=(
  # [VARIABLE: LIST paths that must exist]
  # "src/example/file.ts"
  # "tests/example.test.ts"
)

for f in "${required_files[@]}"; do
  if [ ! -f "$f" ]; then
    echo "FAIL: required file missing: $f"
    exit 1
  fi
done

# --- Required commands pass ---
# [VARIABLE: LIST commands that must exit 0]
# npm test || { echo "FAIL: tests"; exit 1; }
# npm run build || { echo "FAIL: build"; exit 1; }
# npm run lint || { echo "FAIL: lint"; exit 1; }

# --- Phase-specific checks ---
# [VARIABLE: ADD specific checks]
# Example: API endpoint returns expected shape
# curl -sf http://localhost:3000/api/health | grep -q '"status":"ok"' \
#   || { echo "FAIL: health check"; exit 1; }

# --- No [VARIABLE] placeholders in committed files ---
if grep -r "\[VARIABLE:" --include="*.md" --exclude-dir=skills --exclude-dir=node_modules . 2>/dev/null; then
  echo "FAIL: unfilled [VARIABLE] placeholders in documentation"
  exit 1
fi

echo "=== Phase $PHASE verification PASSED ==="
