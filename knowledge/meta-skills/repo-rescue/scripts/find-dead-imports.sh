#!/usr/bin/env bash
# Usage: find-dead-imports.sh [REPO_ROOT]
# Detects unused imports using language-specific linters in check (no-fix) mode.
# Supported: Python (ruff or pylint), JavaScript/TypeScript (eslint), Rust (cargo check)
# Outputs: linter findings for unused imports per language detected
# Exit code: 0 = clean, 1 = findings detected, 2 = no supported language detected

set -euo pipefail

REPO_ROOT="${1:-.}"

echo "=== Dead Import Scan: $REPO_ROOT ==="
echo ""

found_lang=0
has_issues=0

# ---- Python ----
if find "$REPO_ROOT" -name "*.py" -not -path "*/.git/*" -not -path "*/__pycache__/*" \
       -not -path "*/.venv/*" 2>/dev/null | grep -q .; then
    found_lang=1
    echo "--- Python ---"

    if command -v ruff &>/dev/null; then
        results=$(ruff check --select F401 "$REPO_ROOT" 2>/dev/null || true)
        if [[ -n "$results" ]]; then
            echo "$results"
            has_issues=1
            echo ""
            echo "Fix: ruff check --select F401 --fix $REPO_ROOT"
        else
            echo "[PASS] No unused imports detected (ruff F401)"
        fi
    elif command -v pylint &>/dev/null; then
        results=$(pylint --disable=all --enable=W0611 \
            --output-format=text "$REPO_ROOT" 2>/dev/null | grep "W0611" || true)
        if [[ -n "$results" ]]; then
            echo "$results"
            has_issues=1
        else
            echo "[PASS] No unused imports detected (pylint W0611)"
        fi
    else
        echo "[SKIP] No Python linter found."
        echo "       Install ruff: pip install ruff"
    fi
    echo ""
fi

# ---- JavaScript / TypeScript ----
if find "$REPO_ROOT" \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) \
       -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | grep -q .; then
    found_lang=1
    echo "--- JavaScript / TypeScript ---"

    if command -v eslint &>/dev/null; then
        # Use project config if available; fall back to minimal inline rule
        if [[ -f "$REPO_ROOT/.eslintrc.js" ]] || \
           [[ -f "$REPO_ROOT/.eslintrc.json" ]] || \
           [[ -f "$REPO_ROOT/.eslintrc.yaml" ]] || \
           grep -q '"eslintConfig"' "$REPO_ROOT/package.json" 2>/dev/null; then
            results=$(eslint --ext .js,.ts,.jsx,.tsx \
                --rule '{"no-unused-vars": "warn"}' \
                "$REPO_ROOT" 2>/dev/null | grep "no-unused-vars" || true)
        else
            results=$(eslint --no-eslintrc \
                --rule '{"no-unused-vars": "warn"}' \
                --parser-options="ecmaVersion:2020" \
                --ext .js,.ts,.jsx,.tsx \
                "$REPO_ROOT" 2>/dev/null | grep "no-unused-vars" || true)
        fi

        if [[ -n "$results" ]]; then
            echo "$results"
            has_issues=1
        else
            echo "[PASS] No unused vars detected (eslint no-unused-vars)"
        fi
    else
        echo "[SKIP] eslint not found."
        echo "       Install: npm install -g eslint"
    fi
    echo ""
fi

# ---- Rust ----
if [[ -f "$REPO_ROOT/Cargo.toml" ]]; then
    found_lang=1
    echo "--- Rust ---"

    if command -v cargo &>/dev/null; then
        results=$(cd "$REPO_ROOT" && cargo check 2>&1 | \
            grep -E "unused import|unused variable|dead_code|#\[allow\(unused" || true)
        if [[ -n "$results" ]]; then
            echo "$results"
            has_issues=1
            echo ""
            echo "Fix: cargo fix --allow-dirty (for autofixable warnings)"
        else
            echo "[PASS] No unused imports or dead code warnings (cargo check)"
        fi
    else
        echo "[SKIP] cargo not found."
    fi
    echo ""
fi

# ---- Summary ----
if [[ $found_lang -eq 0 ]]; then
    echo "[SKIP] No supported language detected (Python / JavaScript / TypeScript / Rust)"
    echo "       Supported detection: .py files, .js/.ts files, Cargo.toml"
    exit 2
fi

if [[ $has_issues -eq 1 ]]; then
    exit 1
else
    exit 0
fi
