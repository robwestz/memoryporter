# Anti-Patterns — Common Repo Problems

> **When to read this:** During Step 4 (FIX) when you need the exact detection
> command and fix procedure for a specific anti-pattern, or during Step 2 (DIAGNOSE)
> to run a systematic check beyond what the build log reports.

## Contents

- [Catalog](#catalog)
- [Windows-Specific Flakiness](#windows-specific-flakiness)
- [Process Anti-Patterns](#process-anti-patterns)
- [Security Anti-Patterns](#security-anti-patterns)
- [Dependency Anti-Patterns](#dependency-anti-patterns)
- [CI / Configuration Anti-Patterns](#ci--configuration-anti-patterns)

---

## Catalog

| # | Anti-pattern | Symptom | Detection Command | Fix | Tier |
|---|-------------|---------|-------------------|-----|------|
| 1 | Stale `.gitignore` | Generated files tracked in git; `git status` shows noise | `git ls-files --ignored --exclude-standard` | Add missing patterns to `.gitignore`, then `git rm --cached <file>` | Quick Win |
| 2 | Hardcoded secrets | API keys, passwords, tokens in source | `grep -rE "(api_key\|password\|token\|secret)\s*=\s*['\"][^'\"]{8}" --include="*.py" --include="*.js" --include="*.ts" --include="*.yaml"` | Move to env vars; rotate the key immediately if ever pushed | Quick Win (security override) |
| 3 | Missing CI | No `.github/workflows/` or equivalent | `ls .github/workflows/ 2>/dev/null \|\| echo "missing"` | Add minimal CI from template (see below) | Day 1 |
| 4 | Dead imports | Unused imports slow analysis tools and add cognitive load | Language linter: `ruff check --select F401 .` / `eslint --rule no-unused-vars` / `cargo check 2>&1 \| grep "unused import"` | Run linter with `--fix` flag; review before committing | Quick Win |
| 5 | Flaky Windows builds | Path errors, line-ending failures, case-sensitivity bugs on CI | Build on Windows CI runner; `file .gitattributes` | Add `.gitattributes` with `* text=auto`; normalize separators in scripts | Day 1 |
| 6 | Missing `.env.example` | New devs can't run the project; onboarding breaks | `ls .env.example 2>/dev/null \|\| echo "missing"` | Copy `.env` structure, blank all values, commit as `.env.example` | Quick Win |
| 7 | Broken lockfile | `npm ci` or `pip install` fails with hash mismatch | `npm ci 2>&1 \| head -20` or `pip install -r requirements.txt` | Delete lockfile (`package-lock.json` / `poetry.lock`), reinstall, recommit | Day 1 |
| 8 | Dev deps in production | Production bundle includes test tooling; build size inflated | `npm ls --prod --depth=0 2>/dev/null` | Move test/lint packages from `dependencies` to `devDependencies` in `package.json` | Day 1 |
| 9 | No health-check target | Can't verify repo works in CI without reading the whole build | `grep -E "(verify\|check\|health)" Makefile package.json 2>/dev/null` | Add a `verify` or `check` target/script that runs build + tests in one command | Day 1 |
| 10 | Outdated README | README describes setup steps that no longer work | Manual comparison: follow README steps and record where they fail | Update steps; add "Last verified: YYYY-MM-DD" to README header | Quick Win |
| 11 | Surface-only diagnosis | Rescue report shows clean bill of health but source-code security issues remain hidden | Check findings table: if all findings are from automated scripts with zero manual source reads, diagnosis is surface-only | Run Security Source Audit sub-step; grep for 7 anti-patterns; read 3–5 key source files | Process fix |

---

## Windows-Specific Flakiness

These patterns fail only on Windows (or only on Windows CI) and are frequently
overlooked because local dev is on macOS or Linux.

### Path Separator Errors

**Symptom:** `ENOENT: no such file or directory` on Windows CI despite file existing.

**Root cause:** Hardcoded forward-slash paths in Node.js or Python scripts; the OS
expects backslashes but `path.join` was not used.

**Detection:**
```bash
grep -rn "'/[a-z]" --include="*.js" --include="*.ts" --include="*.py" .
```

**Fix:** Replace string-concatenated paths with `path.join()` (Node) or
`os.path.join()` / `pathlib.Path` (Python).

---

### Line Ending Mismatch (CRLF vs LF)

**Symptom:** Shell scripts fail with `bad interpreter: /bin/bash^M`; diff shows
`^M` characters; tests pass locally but fail on Linux CI.

**Detection:**
```bash
file scripts/*.sh | grep CRLF
```

**Fix:**
1. Add `.gitattributes`:
   ```
   * text=auto
   *.sh text eol=lf
   ```
2. Re-checkout affected files: `git rm --cached -r . && git reset --hard`

---

### Case-Insensitive Filesystem Assumptions

**Symptom:** Import works on macOS (case-insensitive) but fails on Linux CI
(`Module not found: './Component'` vs `'./component'`).

**Detection:**
```bash
# Find imports that differ from actual filenames by case only
grep -rn "from '\./[A-Z]" --include="*.ts" --include="*.tsx" .
```

**Fix:** Enforce consistent casing in import statements. Use linter rules:
`import/no-unresolved` (ESLint) or `consistent-type-imports` (TypeScript).

---

## Security Anti-Patterns

### Pattern Signatures for Secret Scanning

Run `scripts/scan-secrets.sh` for automated detection. The patterns below
cover the most common credential leaks in order of frequency:

| Pattern | Example | Regex |
|---------|---------|-------|
| Generic assignment | `api_key = "sk-..."` | `(api_key\|api_secret\|password\|secret)\s*=\s*['"][^'"]{8,}` |
| AWS Access Key | `AKIAIOSFODNN7EXAMPLE` | `AKIA[0-9A-Z]{16}` |
| GitHub PAT | `ghp_xxxx` | `ghp_[0-9a-zA-Z]{36}` |
| Bearer token in source | `Authorization: Bearer eyJ...` | `Authorization:\s*Bearer\s+[A-Za-z0-9._-]+` |
| Private key block | `-----BEGIN RSA PRIVATE KEY-----` | `-----BEGIN [A-Z ]+PRIVATE KEY-----` |

**After flagging:** Do not just delete from the current file. If the secret was
ever committed, it exists in git history. Rotate the credential first, then
remove from source and optionally scrub history with `git filter-repo`.

---

## Dependency Anti-Patterns

### Broken Lockfile Recovery

**Node.js:**
```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "fix: regenerate lockfile"
```

**Python (Poetry):**
```bash
rm poetry.lock
poetry install
git add poetry.lock
git commit -m "fix: regenerate poetry.lock"
```

**Rust:** Cargo.lock is intentional for binaries; do not delete. If corrupt:
```bash
cargo update
```

---

### Version Conflict Resolution

**Symptom:** Two packages require incompatible versions of a shared dependency.

**Detection (Node):** `npm ls 2>&1 | grep "UNMET\|invalid"` 

**Fix decision:**
| Conflict type | Resolution |
|--------------|-----------|
| Transitive dep conflict | Pin the conflicting package to a compatible version in `overrides` / `resolutions` |
| Direct dep conflict | Upgrade the older of the two direct deps first |
| Peer dep warning | Suppress only after verifying the warning is benign (`npm install --legacy-peer-deps`) |

---

## Process Anti-Patterns

### Surface-Only Diagnosis

**Symptom:** Rescue report shows a clean bill of health — secrets removed, build
passing, npm audit clear — but production-blocking security issues remain hidden
in application source code (disabled SSL, token leakage, unsafe CSP, unauthenticated
endpoints).

**Root cause:** DIAGNOSE ran only automated scripts (`scan-secrets.sh`, `npm audit`,
`check-gitignore.sh`) without reading application source files. These scripts detect
secrets written in plaintext and known CVEs. They structurally **cannot** detect
`rejectUnauthorized: false` inside a database connection function, a token
interpolated into a clone URL, or `unsafe-eval` in a CSP header config.

**Detection:** Check the DIAGNOSE findings table. If every finding has an automated
source (script name or `npm audit`) and zero findings cite a specific source file
read manually, the diagnosis is surface-only.

**Fix:** Before leaving DIAGNOSE, run the Security Source Audit sub-step from
SKILL.md. Grep for the 7 common anti-patterns (SSL bypass, token-in-URL,
unsafe-eval, localhost fallbacks, console.log pollution, missing rate limits,
unauthenticated routes). Open 3–5 key source files identified during DISCOVER
and scan for anything the greps missed.

**Why this matters:** A surface-only diagnosis gives false confidence. The report
says "2 critical issues found" when there are 10. The developer ships, believing
security has been audited. The issues that automated tools miss are exactly the
issues that cause production incidents.

**Tier:** N/A — this is a process anti-pattern, not a code fix.

---

## CI / Configuration Anti-Patterns

### Minimal CI Template (GitHub Actions)

When CI is missing entirely, add this as `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up environment
        # [VARIABLE: Add language-specific setup step here]
        run: echo "Add setup here"
      - name: Build
        run: make build   # or: cargo build / npm run build / pip install
      - name: Test
        run: make test    # or: cargo test / npm test / pytest
```

Customize the setup and command steps for the target language. Commit as
Day 1 work; do not defer to Week 1 — CI is the safety net for all subsequent fixes.

---

## Related

- [SKILL.md](../SKILL.md) — Parent skill; anti-patterns feed into Step 2 (DIAGNOSE) and Step 4 (FIX)
- [diagnostic-checklist.md](diagnostic-checklist.md) — Per-category checklist for systematic scanning
- [build-vs-buy.md](build-vs-buy.md) — When fixing a dep gap requires a make-or-buy decision
