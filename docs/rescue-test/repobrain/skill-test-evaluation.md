# Skill Test Evaluation: repo-rescue on RepoBrain

> **Date:** 2026-04-13
> **Skill version:** 1.0.0
> **Tester:** Automated (this session)
> **Verdict:** SKILL WORKS — follow-literally execution produced a complete, useful rescue

---

## What Was Tested

Ran the full 5-phase repo-rescue skill (`DISCOVER → DIAGNOSE → PLAN → FIX → REPORT`)
against the RepoBrain codebase at `C:/Users/robin/Pictures/repobrain/`, following the
SKILL.md instructions literally without prior knowledge of the codebase.

---

## Phase-by-Phase Assessment

### DISCOVER
**Result: Worked well.**

Reading in the prescribed order (README → config files → CI → directory structure) gave
an accurate mental model in one pass. The two-`package.json` structure (root orchestrator
+ `src/` app) was caught because the skill's instruction to read both root config files
and then the directory structure forced the discrepancy into view.

**One gap:** The skill says to read "root-level config files" but does not mention checking
the `repobrain.md` meta-doc at root. Low impact — it was just an onboarding prompt — but
the skill's discover checklist could note "read any `.md` files at root level."

---

### DIAGNOSE
**Result: Worked well. Diagnostics script caught real findings.**

`run-diagnostics.sh` fired and found:
- The production credentials in `src/.env` (Secret Scan)
- Missing `dist/` in `.gitignore` (Gitignore Audit)
- No Python dead imports (correctly skipped)

The manual checklist from `references/diagnostic-checklist.md` caught additional findings
the automated scripts missed:
- `npm audit` → 13 vulnerabilities
- CI path bug in `migration-check.yml`
- Hardcoded absolute path in `build-team.ts`
- `next lint` deprecation

**One gap:** `scan-secrets.sh` flagged the `.env` but also generated noise from
`redis.ts` "Example: redis://..." comment strings — false positives. The signal was still
clear because the `.env` match was obvious. The script could filter comment-only lines.

---

### PLAN
**Result: Tier assignment was forced and useful.**

The "do not assign everything to Day 1" rule shaped the output correctly:
- Credentials correctly overridden to Quick Win (security urgency rule)
- npm audit fix correctly placed as Day 1 (unblocks security posture)
- Test suite correctly deferred to Week 1 (architectural effort)

---

### FIX
**Result: Worked. Fix-verify loop caught one side effect.**

The `next lint → eslint .` migration caused a fix-reveal moment: `eslint .` without
ignore patterns linted `.next/` build artifacts, producing hundreds of false errors.
The skill's "rollback and document if a fix causes new failure" guidance applied — the fix
was extended (not rolled back) to add ignore patterns, then verified clean.

The fix-verify loop (apply → build → confirm → next fix) worked as designed. No fix
caused regressions.

---

### REPORT
**Result: Template produced a complete, readable document.**

The `audit-report.md` template structure (exec summary → findings → fixes with evidence
→ what remains) produced a report that is usable as a handoff document. The "What
Remains" section with rationale was the most valuable part — it explains *why* the
Drizzle SQL injection fix wasn't force-applied, not just that it was skipped.

---

## Findings Summary

| Metric | Value |
|--------|-------|
| Total findings | 11 |
| Critical | 2 |
| High | 2 |
| Medium | 2 |
| Low | 5 |
| Quick Wins applied | 6 of 6 (credentials is flag-only by skill design) |
| Day 1 items applied | 1 of 2 (lint migration done; 1 remaining requires force) |
| Week 1 items deferred | 3 |
| Build before | PASSING |
| Build after | PASSING |
| Vulns before | 13 (8 high, 5 moderate) |
| Vulns after | 5 (1 high, 4 moderate) |

---

## Skill Gaps Found During Execution

| Gap | Severity | Suggestion |
|-----|----------|------------|
| `scan-secrets.sh` generates false positives from error-message comment strings containing URL patterns | Low | Add a filter to skip lines that are inside string literals or comments |
| DISCOVER step doesn't mention reading non-README `.md` files at root | Low | Add note: "read any root `.md` files; they may contain setup context" |
| FIX phase doesn't address the case where a fix reveals new findings (as opposed to failures) | Low | Add note: "if applying a fix surfaces new lint/audit findings, add them to the DIAGNOSE table before continuing" |
| `run-diagnostics.sh` count in summary table shows `?` when no `[CRITICAL/WARN/FAIL]` tagged lines exist in output | Low | Bug in count logic — should show `0` not `?` when exit code 1 but no tagged lines |

---

## Overall Assessment

**The skill is production-ready.** Followed literally, it produces a complete rescue with:
- A useful morning-report-style audit document
- Applied fixes with build evidence
- A tiered action plan covering what was deferred and why

The skill is not over-specified — it leaves judgment calls (which tier, whether to
`--force`) to the executor, while providing enough structure (tier rules, override rules,
fix-verify loop) to prevent common mistakes.

**Recommended next step for skill improvement:** Add the 4 gap items above as minor
notes in SKILL.md or as a patch to `scan-secrets.sh`.
