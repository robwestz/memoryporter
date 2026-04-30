#!/usr/bin/env bash
# Usage: run-diagnostics.sh [REPO_ROOT]
# Orchestrates all repo-rescue diagnostic checks and produces a summary table.
# Runs: scan-secrets, check-gitignore, find-dead-imports
# Outputs: per-check findings + final summary table
# Exit code: 0 = all checks clean, 1 = issues found, 2 = error in one or more checks

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${1:-.}"

# Resolve to absolute path
REPO_ROOT="$(cd "$REPO_ROOT" && pwd)"

TIMESTAMP="$(date '+%Y-%m-%d %H:%M')"

echo "======================================================"
echo " Repo Rescue — Diagnostic Suite"
echo " Target : $REPO_ROOT"
echo " Started: $TIMESTAMP"
echo "======================================================"
echo ""

# ---- State tracking ----
declare -a SUMMARY_LABELS
declare -a SUMMARY_STATUSES
declare -a SUMMARY_DETAILS
total_issues=0
check_errors=0

# ---- Run a single check ----
run_check() {
    local label="$1"
    local script="$2"
    local tmpfile
    tmpfile=$(mktemp /tmp/rr_check_XXXXXX)

    echo "------------------------------------------------------"
    echo " CHECK: $label"
    echo "------------------------------------------------------"

    local exit_code=0
    bash "$SCRIPT_DIR/$script" "$REPO_ROOT" 2>&1 | tee "$tmpfile" || exit_code=$?

    echo ""

    local status detail
    case $exit_code in
        0)
            status="PASS"
            detail="—"
            ;;
        1)
            issue_count=$(grep -cE "^\[(CRITICAL|WARN|FAIL)\]" "$tmpfile" 2>/dev/null || echo "?")
            status="FAIL"
            detail="$issue_count finding(s)"
            total_issues=$((total_issues + 1))
            ;;
        2)
            status="SKIP"
            detail="Not applicable"
            ;;
        *)
            status="ERROR"
            detail="Exit $exit_code"
            check_errors=$((check_errors + 1))
            ;;
    esac

    SUMMARY_LABELS+=("$label")
    SUMMARY_STATUSES+=("$status")
    SUMMARY_DETAILS+=("$detail")

    rm -f "$tmpfile"
}

# ---- Run all checks ----
run_check "Secret Scan"      "scan-secrets.sh"
run_check "Gitignore Audit"  "check-gitignore.sh"
run_check "Dead Imports"     "find-dead-imports.sh"

# ---- Print summary table ----
echo "======================================================"
echo " Summary"
echo "======================================================"
echo ""
printf "%-6s | %-22s | %s\n" "Status" "Check" "Detail"
printf "%-6s-+-%-22s-+-%s\n" "------" "----------------------" "--------------------"

for i in "${!SUMMARY_LABELS[@]}"; do
    printf "%-6s | %-22s | %s\n" \
        "${SUMMARY_STATUSES[$i]}" \
        "${SUMMARY_LABELS[$i]}" \
        "${SUMMARY_DETAILS[$i]}"
done

echo ""

# ---- Final verdict ----
if [[ $check_errors -gt 0 ]]; then
    echo "[ERROR] $check_errors check(s) failed to run. Review output above."
    exit 2
elif [[ $total_issues -gt 0 ]]; then
    echo "[FAIL] $total_issues check(s) found issues. Review findings above."
    echo ""
    echo "Next step: Enter findings into DIAGNOSE table, then run Step 3 (PLAN)."
    exit 1
else
    echo "[PASS] All checks clean. No automated diagnostic findings."
    echo ""
    echo "Note: Automated checks cover secrets, gitignore, and dead imports."
    echo "      Manual checks (build failures, CI config, documentation) are"
    echo "      still required — see references/diagnostic-checklist.md."
    exit 0
fi
