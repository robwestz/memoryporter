#!/usr/bin/env bash
# Usage: check-gitignore.sh [REPO_ROOT]
# Finds files that are tracked by git but should be ignored.
# Also checks that common patterns are present in .gitignore.
# Outputs: list of issues with remediation commands
# Exit code: 0 = clean, 1 = issues found, 2 = not a git repo

set -euo pipefail

REPO_ROOT="${1:-.}"

echo "=== Gitignore Audit: $REPO_ROOT ==="
echo ""

cd "$REPO_ROOT" || { echo "[ERROR] Cannot access: $REPO_ROOT"; exit 2; }

if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "[ERROR] Not a git repository: $REPO_ROOT"
    exit 2
fi

found=0

# ---- Check 1: Files tracked that match .gitignore patterns ----
echo "--- Tracked files matching .gitignore patterns ---"
ignored_tracked=$(git ls-files --ignored --exclude-standard 2>/dev/null || true)

if [[ -n "$ignored_tracked" ]]; then
    echo "[WARN] These files are tracked but match .gitignore patterns:"
    echo "$ignored_tracked"
    echo ""
    echo "Fix: git rm --cached <file>  (then commit)"
    echo ""
    found=1
else
    echo "[PASS] No tracked files violating .gitignore."
    echo ""
fi

# ---- Check 2: .env committed directly ----
echo "--- Sensitive files in git index ---"
sensitive_tracked=$(git ls-files | grep -E "^\.env$|^\.env\.[^e]|\.pem$|\.key$|_rsa$" || true)

if [[ -n "$sensitive_tracked" ]]; then
    echo "[CRITICAL] Sensitive files are tracked:"
    echo "$sensitive_tracked"
    echo ""
    echo "Fix: git rm --cached <file> && echo '<file>' >> .gitignore"
    echo "     Rotate any credentials in these files if they were ever pushed."
    echo ""
    found=1
else
    echo "[PASS] No sensitive files (.env, .pem, .key) tracked."
    echo ""
fi

# ---- Check 3: Common patterns that should be in .gitignore ----
echo "--- Common missing .gitignore patterns ---"

declare -A COMMON_PATTERNS
COMMON_PATTERNS=(
    ["node_modules/"]="node_modules"
    [".env"]="\.env"
    ["__pycache__/"]="__pycache__"
    ["*.pyc"]="\.pyc"
    ["target/"]="^target/"
    ["dist/"]="^dist/"
    [".DS_Store"]=".DS_Store"
    ["*.log"]="\.log"
    [".venv/"]="\.venv"
    ["coverage/"]="coverage"
)

missing=0
for pattern in "${!COMMON_PATTERNS[@]}"; do
    file_check="${COMMON_PATTERNS[$pattern]}"
    # Check if pattern is in .gitignore
    if [[ -f ".gitignore" ]] && grep -qE "$file_check" .gitignore 2>/dev/null; then
        continue
    fi
    # Pattern not in .gitignore — check if the thing actually exists
    bare="${pattern%/}"
    bare="${bare#\*\.}"
    if find . -maxdepth 3 -name "$bare" -not -path "./.git/*" 2>/dev/null | grep -q .; then
        echo "[WARN] '$pattern' exists in repo but not covered by .gitignore"
        missing=1
        found=1
    fi
done

if [[ $missing -eq 0 ]]; then
    echo "[PASS] Common patterns are covered by .gitignore."
fi

echo ""

# ---- Summary ----
if [[ $found -eq 0 ]]; then
    echo "[PASS] Gitignore audit clean."
    exit 0
else
    echo "[FAIL] Gitignore issues found. See findings above."
    exit 1
fi
