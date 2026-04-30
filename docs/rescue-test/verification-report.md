# Skill Verification Report: repo-rescue

> **Date:** 2026-04-13
> **Skill version tested:** 1.0.0
> **Skill version after improvements:** 1.1.0
> **Overall verdict:** PARTIAL → patched

---

## Test Summary

Ran the full repo-rescue skill (v1.0.0) against RepoBrain (`C:/Users/robin/Pictures/repobrain/`)
following SKILL.md literally. Compared output against two manual audits of the same codebase.

| Document | Date | Purpose |
|----------|------|---------|
| `docs/morning-report-2026-04-10.md` | Apr 10 | Strategic triage — "is this worth continuing?" |
| `docs/architecture-audit.md` | Apr 13 | Production-readiness audit — "is this safe to ship?" |

Fairest comparison: `architecture-audit.md` (same codebase state, same date as skill run).

---

## Scores (v1.0.0)

| Dimension | Score | Gap |
|-----------|-------|-----|
| DISCOVERY | 7/10 | Stopped at config layer; didn't read key source files |
| DIAGNOSIS | 4/10 | Missed 8 of 10 critical issues — all required reading source code |
| PLAN | 7/10 | Correct tier discipline within its scope; incomplete because DIAGNOSE was incomplete |
| REPORT | 6/10 | Accurate and well-structured for what it found; created false completeness |

---

## Root Cause of Gap

The skill's DISCOVER step instructs reading README, config files, CI, and directory
structure. For a production application, this is insufficient. The architecture audit
found 8 critical issues exclusively by reading source files:

| Issue missed | Location |
|--------------|----------|
| `rejectUnauthorized: false` (DB SSL bypass) | `src/lib/db/index.ts:20`, `migrate.ts:11` |
| OAuth token embedded in clone URL | `src/modules/github/clone.ts:33` |
| `unsafe-eval` in CSP headers | `src/next.config.ts:21` |
| Hardcoded localhost DB fallbacks | `src/drizzle.config.ts:8`, `migrate.ts:7` |
| 37 `console.*` calls (logger installed but unused) | `src/modules/ingestion/`, `workers/` |
| Worker empty-string chunk IDs (data corruption) | `src/modules/ingestion/index.ts:540` |
| Rate limiter bypass when Redis down | `src/lib/rate-limit.ts:49` |
| Unauthenticated LLM providers endpoint | `src/app/api/llm/providers/route.ts` |

None of these appear in `scan-secrets.sh`, `check-gitignore.sh`, `find-dead-imports.sh`,
or `npm audit` output. They require reading code.

The skill also had an accurate finding the manual audits missed: the `migration-check.yml`
CI path bug (`src/src/` double prefix) and 13 npm CVEs — demonstrating the surface scan
is genuinely valuable; it just needs to be paired with source code security checks.

---

## Changes Made (v1.0.0 → v1.1.0)

### SKILL.md — DISCOVER step

Added a conditional rule to the if/then table:

> If the repo has auth, database connections, or API endpoints → Read 3–5 key source
> files before DIAGNOSE: database connection layer, auth/token handler, app security
> config, worker/job entry point.

**Why:** Surface-level checks cannot detect `rejectUnauthorized: false` inside a function.
These patterns only appear in source code. Reading the DB layer, auth handler, and app
config before DIAGNOSE builds the security mental model needed for a complete diagnosis.

### SKILL.md — DIAGNOSE step

- Added **Source Code Security** as a distinct findings category (Critical severity)
- Added a note: "For production applications: run Source Code Security checks from
  diagnostic-checklist.md before calling run-diagnostics.sh"
- Updated Quick Reference to reflect new DISCOVER and DIAGNOSE sequences

### diagnostic-checklist.md

Added full **Source Code Security** section (priority 1b, between Security and
Configuration) with grep commands for:

**Node/TypeScript** (7 checks):
- SSL validation disabled (`rejectUnauthorized: false`)
- Token/secret interpolated into URL strings
- `unsafe-eval` in CSP config
- `unsafe-inline` in `script-src` (manual check)
- `console.*` in production modules
- Hardcoded service URL fallbacks
- Unauthenticated API routes (manual spot-check)

**Python** (3 checks): SQL string formatting, `shell=True`, `verify=False`

**Rust** (2 checks): unsafe blocks outside tests, `unwrap()` on external data

---

## What Was NOT Changed

- The five-phase structure (DISCOVER → DIAGNOSE → PLAN → FIX → REPORT) — sound as-is
- The tier model (Quick Win / Day 1 / Week 1) — worked correctly
- The fix-verify loop — worked correctly; caught a side effect during `next lint` migration
- The audit-report.md template — produced a clean, usable handoff document
- The `run-diagnostics.sh` orchestration — scripts performed as designed

---

## Minor Issues Found (not blocking, not fixed)

| Issue | Location | Recommendation |
|-------|----------|----------------|
| `run-diagnostics.sh` summary shows `?` instead of `0` when exit code 1 but no tagged `[CRITICAL/WARN/FAIL]` lines exist | `scripts/run-diagnostics.sh:55` | Change grep fallback from `echo "?"` to `echo "0"` |
| `scan-secrets.sh` generates false positives on `"Example: redis://..."` error message strings | `scripts/scan-secrets.sh` | Add filter to skip lines that are string literals / comments |
| SKILL.md DISCOVER doesn't mention reading root `.md` files beyond README | `SKILL.md:84` | Add note: "read any root-level `.md` files — they may contain setup context or planning docs" |

---

## Projected Scores After v1.1.0 Improvements

If the same rescue were run today with v1.1.0:

| Dimension | v1.0.0 | v1.1.0 (projected) | Why |
|-----------|--------|---------------------|-----|
| DISCOVERY | 7/10 | 9/10 | Source file reads prescribed for production apps |
| DIAGNOSIS | 4/10 | 8/10 | Source Code Security section adds 8 missed checks |
| PLAN | 7/10 | 8/10 | Plan inherits a more complete diagnosis |
| REPORT | 6/10 | 8/10 | Report reflects complete findings |

The remaining gap (8→9 on DISCOVERY, 8→10 on DIAGNOSIS) is irreducible — some issues
(worker error handling patterns, rate limiter failure modes) require deep code reading that
can't be fully specified in a checklist. The checklist raises the floor; judgment raises
the ceiling.

---

## Files Produced by This Test Run

| File | Description |
|------|-------------|
| `docs/rescue-test/repobrain/RESCUE_REPORT.md` | Primary rescue output (copy; original at repo root) |
| `docs/rescue-test/repobrain/action-plan.md` | Tiered action plan from PLAN phase |
| `docs/rescue-test/repobrain/skill-test-evaluation.md` | Post-execution skill assessment |
| `docs/rescue-test/comparison.md` | Manual vs skill comparison with scoring |
| `docs/rescue-test/verification-report.md` | This file |
| `knowledge/meta-skills/repo-rescue/SKILL.md` | Updated to v1.1.0 |
| `knowledge/meta-skills/repo-rescue/references/diagnostic-checklist.md` | Added Source Code Security section |
