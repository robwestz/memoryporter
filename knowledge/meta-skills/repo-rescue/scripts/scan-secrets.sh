#!/usr/bin/env bash
# Usage: scan-secrets.sh [REPO_ROOT]
# Scans source files for hardcoded credentials, API keys, and secrets.
# Outputs: findings with file:line locations
# Exit code: 0 = clean, 1 = findings detected

set -euo pipefail

REPO_ROOT="${1:-.}"

EXCLUDE_DIRS=("node_modules" ".git" "target" "__pycache__" ".venv" "dist" "build" ".next" "vendor")

EXTENSIONS=(
    "*.py" "*.js" "*.ts" "*.jsx" "*.tsx"
    "*.yaml" "*.yml" "*.toml" "*.json"
    "*.rb" "*.go" "*.rs" "*.sh" "*.env"
    "*.conf" "*.config" "*.cfg" "*.ini"
)

# Patterns: format is "label:regex"
PATTERNS=(
    "generic-api-key:(api_key|api_secret|apikey|apisecret)\s*=\s*['\"][^'\"]{8,}"
    "generic-password:password\s*=\s*['\"][^'\"]{4,}[^{]"
    "generic-secret:(secret|token)\s*=\s*['\"][^'\"]{8,}"
    "aws-access-key:AKIA[0-9A-Z]{16}"
    "aws-secret-key:aws_secret_access_key\s*=\s*['\"]?[A-Za-z0-9/+]{40}"
    "github-pat:ghp_[0-9a-zA-Z]{36}"
    "github-oauth:gho_[0-9a-zA-Z]{36}"
    "stripe-key:sk_(live|test)_[0-9a-zA-Z]{24,}"
    "private-key-block:-----BEGIN [A-Z ]*(PRIVATE|RSA) KEY-----"
    "bearer-token:Authorization:\s*[\"']?Bearer\s+[A-Za-z0-9._\-]{20,}"
    "connection-string:(mongodb|postgres|mysql|redis):\/\/[^:]+:[^@]+@"
)

build_exclude_args() {
    local args=()
    for dir in "${EXCLUDE_DIRS[@]}"; do
        args+=("--exclude-dir=$dir")
    done
    printf '%s\n' "${args[@]}"
}

build_include_args() {
    local args=()
    for ext in "${EXTENSIONS[@]}"; do
        args+=("--include=$ext")
    done
    printf '%s\n' "${args[@]}"
}

echo "=== Secret Scan: $REPO_ROOT ==="
echo ""

found=0

mapfile -t exclude_args < <(build_exclude_args)
mapfile -t include_args < <(build_include_args)

for entry in "${PATTERNS[@]}"; do
    label="${entry%%:*}"
    pattern="${entry#*:}"

    results=$(grep -rnE "$pattern" "${exclude_args[@]}" "${include_args[@]}" \
        "$REPO_ROOT" 2>/dev/null || true)

    if [[ -n "$results" ]]; then
        echo "[CRITICAL] $label"
        echo "$results" | head -5
        if [[ $(echo "$results" | wc -l) -gt 5 ]]; then
            echo "  ... ($(echo "$results" | wc -l) total matches)"
        fi
        echo ""
        found=1
    fi
done

if [[ $found -eq 0 ]]; then
    echo "[PASS] No hardcoded secrets detected."
    exit 0
else
    echo "---"
    echo "[FAIL] Hardcoded secrets found."
    echo "Action required:"
    echo "  1. Move secrets to environment variables"
    echo "  2. Add variables to .env.example (without values)"
    echo "  3. Rotate any keys that were ever pushed to a remote"
    echo "  4. If secret is in git history: use git filter-repo to scrub"
    exit 1
fi
