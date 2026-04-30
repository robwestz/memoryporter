# Diagnostic Checklist

> **When to read this:** During Step 2 (DIAGNOSE) after the first build attempt, to
> ensure the findings table is complete. The build log catches compile errors; this
> checklist catches everything the build log misses.

## Contents

- [Category Overview](#category-overview)
- [Build Failures](#build-failures)
- [Security](#security)
- [Source Code Security](#source-code-security)
- [Configuration](#configuration)
- [Dependencies](#dependencies)
- [Dead Code](#dead-code)
- [Hygiene](#hygiene)
- [Documentation](#documentation)

---

## Category Overview

Run checks in this order: Security first (urgent, cheap), Build second (must pass
to assess anything else), then the rest in any order.

| Category | Priority | Run script? | Manual check? |
|----------|----------|-------------|---------------|
| Security | 1 — always | `scan-secrets.sh` | Check `.env` committed by accident |
| Source code security | 1b — if production app | Grep commands below | DB layer, auth handler, app config, workers |
| Build failures | 2 — always | Run build command | Read full error, not just first line |
| Configuration | 3 | Partial | Check CI config, `.env.example`, paths |
| Dependencies | 4 | Partial | Lockfile, version conflicts |
| Hygiene | 5 | `check-gitignore.sh` | Dev deps, `verify` target |
| Dead code | 6 | `find-dead-imports.sh` | Unreachable modules |
| Documentation | 7 — last | None | README accuracy |

---

## Build Failures

Run the primary build command for the detected language. Read the **complete** output.

| Check | Command | Pass signal | Fail signal |
|-------|---------|-------------|-------------|
| Primary build | `cargo build` / `npm run build` / `pip install -r requirements.txt && python -c "import [main]"` | Exit 0 | Any non-zero exit |
| Test suite | `cargo test` / `npm test` / `pytest` | All tests pass | Failures or compile errors |
| Dependency install | `cargo build` / `npm ci` / `pip install` | Clean install | Missing packages, hash mismatch |
| Lint | `cargo clippy` / `npm run lint` / `ruff check .` | No errors | Warnings that block CI |

**Critical signal:** If the build fails with "could not find package X" or "module not
found", that is a Day 1 fix, not a Week 1 — the build cannot be assessed without it.

---

## Security

| Check | Command | Pass signal | Fail signal |
|-------|---------|-------------|-------------|
| Hardcoded secrets | `bash scripts/scan-secrets.sh .` | "[PASS]" output | Any "[CRITICAL]" finding |
| `.env` committed | `git ls-files \| grep "^\.env$"` | No output | `.env` appears in output |
| Sensitive file in history | `git log --all --full-history -- ".env" "*.pem" "*.key"` | No output | Any commit listed |
| Dependency vulnerabilities | `npm audit` / `pip-audit` / `cargo audit` | 0 high/critical | High or critical CVEs |

**Severity:** All security findings are Critical by default. Secret findings become
Quick Wins (urgency overrides effort estimate).

---

## Source Code Security

Run these for any repo that has auth, database connections, or API endpoints.
`scan-secrets.sh` finds secrets written in plaintext. These checks find security
anti-patterns baked into application logic — they survive a passing build and clean lint,
and are **invisible to automated surface scans**.

### Node / TypeScript

| Check | Command | Pass signal | Fail signal |
|-------|---------|-------------|-------------|
| SSL validation disabled | `grep -rn "rejectUnauthorized.*false" --include="*.ts" --include="*.js" src/` | No output | Any match in production code |
| Token embedded in URLs | `grep -rn "https://[^\"']*\${.*\(token\|password\|secret\|key\)" --include="*.ts" --include="*.js" src/` | No output | Token/secret interpolated into URL string |
| unsafe-eval in CSP | `grep -rn "unsafe-eval" --include="*.ts" --include="*.js" .` | No output | Any match in config files |
| unsafe-inline in script-src | Manual: read CSP header config; `unsafe-inline` in `script-src` is exploitable | Only in `style-src` | In `script-src` |
| console.\* in production modules | `grep -rn "console\.\(log\|warn\|error\|debug\)" src/modules src/lib src/workers --include="*.ts" 2>/dev/null` | No output | Matches in modules/ or lib/ (not in scripts/ or tests/) |
| Hardcoded service fallbacks | `grep -rn "\|\| [\"']\(postgresql://\|redis://\|mongodb://\|mysql://\)" --include="*.ts" .` | No output | Localhost fallback silently used when env var is unset |
| Unauthenticated API routes | Manual: open 3 route files at random; check for session/auth call before any DB read | Auth present in all checked routes | Any route reads data without auth check |
| Missing rate limiting | Manual: check API routes that call DB, LLM, or external services; look for rate-limit middleware | Rate limiter present on expensive endpoints | No rate-limit middleware; or rate limiter silently bypasses when Redis/store is unavailable |
| Unbounded file serving | Manual: check file-serving or upload endpoints for size limits | `maxSize` or equivalent check present | No size limit on file reads or uploads |

### Python

| Check | Command | Pass signal | Fail signal |
|-------|---------|-------------|-------------|
| SQL string formatting | `grep -rn "f[\"'].*SELECT\|%[sd].*SELECT\|format.*SELECT" --include="*.py" .` | No output | SQL built with string interpolation |
| subprocess shell=True | `grep -rn "shell=True" --include="*.py" .` | No output | Any match (command injection risk) |
| verify=False in requests | `grep -rn "verify=False" --include="*.py" .` | No output | Any match (SSL bypass) |

### Rust

| Check | Command | Pass signal | Fail signal |
|-------|---------|-------------|-------------|
| unsafe blocks outside tests | `grep -rn "unsafe {" --include="*.rs" src/` | No output | unsafe in non-test production path |
| unwrap() on external data | `grep -rn "\.unwrap()" --include="*.rs" src/` | Minimal; only on infallible paths | Used on I/O, parsing, or network results |

**Severity:** All source code security findings are Critical. They will not appear in
`scan-secrets.sh` output and will not show up as build errors. They require reading code.

---

## Configuration

| Check | Command | Pass signal | Fail signal |
|-------|---------|-------------|-------------|
| CI exists | `ls .github/workflows/*.yml 2>/dev/null \|\| ls .gitlab-ci.yml 2>/dev/null` | At least one file | No output |
| CI references valid secrets | Manual: read workflow, cross-check with repo secrets | All `${{ secrets.X }}` are configured | Undefined secret names |
| `.env.example` exists | `ls .env.example` | File present | `ls: cannot access` |
| Paths are relative, not absolute | `grep -rn "^/home\|^/Users\|^C:\\\\" --include="*.json" --include="*.yaml"` | No output | Any hardcoded absolute paths |
| Config references env vars properly | Manual: check `.env.example` covers all vars used in source | All vars documented | Missing vars |

---

## Dependencies

| Check | Command | Pass signal | Fail signal |
|-------|---------|-------------|-------------|
| Lockfile exists | `ls package-lock.json \|\| ls yarn.lock \|\| ls poetry.lock \|\| ls Cargo.lock` | File present | Missing lockfile |
| Lockfile in sync | `npm ci` (dry run) / `poetry check` | No errors | "Missing X in lockfile" |
| No version conflicts | `npm ls 2>&1 \| grep "UNMET\|invalid"` | No output | Conflict messages |
| Dev deps in prod | `npm ls --prod --depth=0 2>/dev/null \| grep -E "(jest\|mocha\|eslint\|prettier)"` | No output | Test/lint tools in prod deps |
| Outdated major versions | `npm outdated` / `cargo outdated` | No majors flagged | Red entries in output |

---

## Dead Code

Run `scripts/find-dead-imports.sh .` first. Supplement with:

| Check | Language | Command |
|-------|----------|---------|
| Unused imports | Python | `ruff check --select F401 .` |
| Unused imports | JS/TS | `eslint --rule '{"no-unused-vars":"warn"}' --ext .js,.ts .` |
| Unused imports | Rust | `cargo check 2>&1 \| grep "unused import\|unused variable"` |
| Unused imports | Go | `go build ./... 2>&1` (compiler rejects unused imports) |
| Unreachable functions | Any | Language LSP or `grep -rn "TODO: remove\|dead code\|unreachable"` |
| Unused files | Node | `ts-prune` (TypeScript) / check for files not imported anywhere |
| Unused packages | Go | `go mod tidy && git diff go.mod go.sum` |

**Severity:** Dead code is Medium. It does not break the build but creates cognitive
load and slows static analysis. It is always a Quick Win if the linter can auto-fix it.

---

## Hygiene

| Check | Command | Pass signal | Fail signal |
|-------|---------|-------------|-------------|
| Stale `.gitignore` | `bash scripts/check-gitignore.sh .` | "[PASS]" | "[WARN]" entries |
| `verify` target exists | `grep -E "verify\|check\|health" Makefile package.json 2>/dev/null` | Match found | No match |
| Consistent line endings | `file scripts/*.sh \| grep CRLF` | No CRLF found | Any CRLF file |
| No debug artifacts committed | `git ls-files \| grep -E "\.log$\|\.tmp$\|debug\."` | No output | Artifact files listed |

---

## Documentation

Manual checks — no commands available.

| Check | How to verify | Pass | Fail |
|-------|--------------|------|------|
| README setup steps work | Follow them exactly, step by step | All steps succeed | Any step fails or is missing |
| README reflects current build command | Compare README vs actual build command | Match | Mismatch |
| CHANGELOG exists and is not empty | `ls CHANGELOG.md \|\| ls CHANGELOG` | File with content | Missing or empty |
| API docs match exported functions | Spot-check 3 documented functions against source | All match | Any discrepancy |

**Severity:** Documentation issues are Low — they do not break the build but make
onboarding harder and erode trust in the codebase.

---

## Related

- [SKILL.md](../SKILL.md) — Parent skill; this checklist is used in Step 2 (DIAGNOSE)
- [anti-patterns.md](anti-patterns.md) — Fix procedures for each detected issue
- [build-vs-buy.md](build-vs-buy.md) — When a dependency gap requires a make-or-buy decision
