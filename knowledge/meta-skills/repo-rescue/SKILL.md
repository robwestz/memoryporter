---
name: repo-rescue
description: |
  Autonomously rescues stuck, broken, or abandoned repositories through a
  five-phase workflow: DISCOVER, DIAGNOSE, PLAN, FIX, REPORT. Use when a
  build is broken and root cause is unclear, a repo has been abandoned and
  needs reviving, CI is red with no obvious fix, or a codebase needs rapid
  triage before sprint planning. Trigger on: "rescue this repo", "unstick
  this project", "fix this broken codebase", "repo is stuck", "get this
  building again", "diagnose this codebase", "triage this project", "the
  build is broken", "I haven't touched this in months", "nothing works and
  I don't know where to start", "audit this repository".
author: Robin Westerlund
version: 1.1.0
---

# Repo Rescue

> Takes any stuck, broken, or abandoned repository from disorder to a clean build
> with a prioritized action plan and a morning-report-style audit document.

---

## Purpose

Without this skill, a broken repo becomes a paralysis trap: everything looks broken,
it is unclear what to fix first, and every attempted fix creates new errors. The skill
applies a proven five-phase workflow — DISCOVER, DIAGNOSE, PLAN, FIX, REPORT — that
converts disorder into a ranked, executable list where every item has a time estimate
and a verification step. A broken repo is not a code problem — it is a prioritization
problem.

---

## Audience

| Role | Use case |
|------|----------|
| Developer | Handed a broken, stale, or abandoned codebase with no context |
| Tech lead | Pre-sprint triage to surface blockers before the team starts |
| Onboarding engineer | Setup docs are wrong or missing; can't get the project running |

---

## When to Use

- Build is failing and root cause is unclear
- Repo has been untouched for months and needs revival
- CI is red with no obvious fix
- Onboarding a new developer and the setup docs are wrong or missing
- Pre-sprint triage to identify blockers before the team starts
- Handed a codebase with no context and no working environment

---

## When Not to Use

| If the situation is... | Use instead | Why |
|------------------------|-------------|-----|
| A single specific bug is already identified | Direct debugging | Rescue is for multi-issue triage, not targeted single-bug fixes |
| The repo is greenfield — no existing code | `project-scaffolding` | Nothing to rescue; scaffold from zero instead |
| Refactoring a working codebase for quality | `code-review-checklist` | No rescue needed when the build already passes |

---

## Required Context

Gather or confirm before starting:

- Repository root path (local clone; clone it first if only a URL was given)
- Target language/runtime if known (Rust, Node, Python, etc.) — derive from config files if not stated
- Permission to run build commands (`cargo build`, `npm install`, `pip install`, etc.)

---

## Process

### Step 1: DISCOVER

**Action:** Map the repository — understand what it is, what it intends to do, and how it is built.
**Inputs:** Repository root path
**Outputs:** Architecture brief (language, build system, entry points, CI config, approximate last-active date)

Read in this order: `README.md`, root-level config files (`package.json`, `Cargo.toml`,
`pyproject.toml`, `Makefile`), CI config (`.github/workflows/`, `.gitlab-ci.yml`), then
directory structure to two levels. Build a mental model: what was this project trying to do?

| If... | Then... | Because... |
|-------|---------|------------|
| No README exists | Note as a finding; create a skeleton after REPORT | A README-less repo is a discovery finding, not a blocker |
| Multiple language configs exist | Identify primary by entry point | Monolang repos often have tooling in a secondary language |
| Last commit is > 6 months ago | Flag as "potentially stale" and audit all lockfiles | Dependencies age fast; lockfile freshness predicts build success |
| CI config references missing secrets | Note as Day 1 finding | CI will fail on first run regardless of code correctness |
| Repo has auth, database connections, or API endpoints | Read 3–5 key source files before DIAGNOSE (see below) | Surface-level checks cannot detect `rejectUnauthorized: false` inside a function — these patterns only appear in source code |

**Build a security mental model before DIAGNOSE.** If the repo has any of: database
connections, authentication, API endpoints, or background workers — read 3–5 key
source files *now*, before running any automated checks. Typical targets:

1. **Database connection layer** — `db/index.ts`, `lib/db.py`, `src/database.rs` — look for SSL config, connection string handling, fallback values
2. **Auth / token handler** — `auth.ts`, `clone.ts`, `oauth.py` — look for how tokens are stored, passed, and whether they leak into URLs or logs
3. **App security config** — `next.config.ts`, `settings.py`, `SecurityConfig.java` — look for CSP headers, CORS policy, cookie settings
4. **Worker / job entry point** — `workers/index.ts`, `tasks.py` — look for error handling, retry logic, data validation at ingestion boundaries
5. **Main API entry or router** — `app/api/`, `routes/`, `views.py` — look for unauthenticated routes, missing rate limits, unbounded file serving

This is not a full code review. You are scanning for security-critical patterns that
automated scripts (scan-secrets.sh, npm audit) structurally cannot detect. Record
anything suspicious as a DIAGNOSE finding — you will verify it in the next step.

**Do NOT:** Attempt to build before completing DISCOVER. Blind build attempts
produce noise before you understand the signal.

---

### Step 2: DIAGNOSE

**Action:** Run the build, collect all errors, and categorize every blocker.
**Inputs:** Architecture brief from Step 1
**Outputs:** Findings table (category | finding | severity | file | automated-fix?)

Run the build command. Read the **full** error output — do not stop at the first error.
Then run `scripts/run-diagnostics.sh [REPO_ROOT]` to catch issues the build log misses.
Categorize every finding:

| Category | Examples | Severity |
|----------|----------|---------|
| Build failures | Missing deps, compile errors, wrong runtime version | Critical |
| Security | Hardcoded secrets, exposed API keys | Critical |
| Source code security | Disabled SSL validation, token-in-URL, unsafe CSP directives, logging gaps, hardcoded DB fallbacks, unprotected API endpoints | Critical |
| Configuration | Broken CI, missing `.env.example`, wrong paths | High |
| Dependencies | Stale lockfile, dev deps in production, version conflicts | High |
| Dead code | Unused imports, unreachable functions, dead modules | Medium |
| Hygiene | Stale `.gitignore`, missing `verify` target, outdated README | Low |

#### Security Source Audit (after automated scripts, before moving to PLAN)

Automated scripts (`scan-secrets.sh`, `npm audit`) catch secrets in plaintext and
known CVEs. They **cannot** detect security anti-patterns baked into application logic.
Run these grep checks on production applications (Node.js/TypeScript shown; see
`references/diagnostic-checklist.md` for Python and Rust equivalents):

```bash
# 1. Disabled SSL validation
grep -rn "rejectUnauthorized.*false" --include="*.ts" --include="*.js" src/

# 2. Token/password concatenated into URLs
grep -rn 'https://[^"'\'']*\${.*\(token\|password\|secret\|key\)' --include="*.ts" --include="*.js" src/

# 3. unsafe-eval or unsafe-inline in CSP headers
grep -rn "unsafe-eval\|unsafe-inline" --include="*.ts" --include="*.js" --include="*.mjs" .

# 4. Hardcoded localhost fallbacks for production services
grep -rn '|| ["'\'']\(postgresql://\|redis://\|mongodb://\|mysql://\)' --include="*.ts" .

# 5. console.log instead of structured logger (in production modules)
grep -rn "console\.\(log\|warn\|error\|debug\)" src/modules src/lib src/workers --include="*.ts" 2>/dev/null

# 6. Missing rate limiting — check expensive endpoints manually
# Open 2–3 API route files; look for rate-limit middleware before DB/LLM calls

# 7. Unauthenticated API routes
# Open 3 route files at random; verify session/auth check before any data read
```

Every match is a Critical finding. Add each to the findings table with the exact
file and line number. These issues survive a passing build, clean lint, and green
`scan-secrets.sh` — they are the most dangerous class of miss.

See [`references/diagnostic-checklist.md`](references/diagnostic-checklist.md) for the
full per-category checklist with checks for every supported language.

**Do NOT:** Fix anything during DIAGNOSE. Record everything first. Fixing during
diagnosis causes related issues with the same root cause to be missed.

---

### Step 3: PLAN

**Action:** Assign every finding to a tier and produce the prioritized action plan.
**Inputs:** Findings table from Step 2
**Outputs:** Tiered action plan (fill `templates/action-plan.md`)

Apply this tier rule to every finding:

| Tier | Criteria | Examples |
|------|----------|---------|
| **Quick Win** | < 30 min, no architectural judgment required | Stale `.gitignore`, dead import, broken CI flag, missing `.env.example` |
| **Day 1** | Unblocks the build or CI; may require judgment | Missing dep, broken lockfile, wrong runtime version, secret extraction |
| **Week 1** | Architectural or sustained effort required | Missing test suite, CI pipeline setup, dead code cleanup, security audit |

**Override rule:** Hardcoded secrets are always Quick Win regardless of effort estimate.
Security urgency overrides tier logic.

Fix order within each tier: resolve upstream dependencies before downstream consumers.
A broken `package.json` must be addressed before any import errors can be resolved.

See [`references/build-vs-buy.md`](references/build-vs-buy.md) when a dependency gap
requires a build-vs-buy-vs-hybrid decision.

**Do NOT:** Assign everything to Day 1. Honest tier assignment is the skill's core value.
A plan where every item is "urgent" is not a plan.

---

### Step 4: FIX

**Action:** Apply Quick Win fixes and Day 1 fixes in tier order, verifying the build after each one.
**Inputs:** Tiered action plan from Step 3
**Outputs:** Applied changes (diffs), updated build status after each fix

The fix-verify loop is mandatory:

```
for each fix in [Quick Wins first, then Day 1]:
  1. Apply the fix
  2. Run the build
  3. If build passes → continue to next fix
  4. If build fails → rollback or mark as partial, document why, continue
```

Never batch multiple fixes before verifying. A batch that fails cannot be attributed
to a specific change.

| If... | Then... | Because... |
|-------|---------|------------|
| A fix causes a new build failure | Rollback and document as partial | The fix has a side effect that needs investigation |
| A Quick Win turns out to need > 30 min | Promote to Day 1, move on | Effort estimates at plan time are approximate |
| Build passes but tests fail | Record "build passes / tests failing" | Partial progress is real progress; document the delta |
| Security fix involves a secret | Rotate the secret before or immediately after committing | Removing from code is not sufficient if it was ever pushed to remote |

See [`references/anti-patterns.md`](references/anti-patterns.md) for per-anti-pattern
fix procedures with exact commands.

**Do NOT:** Skip the verify step between fixes. Running all fixes then verifying once
is the most common cause of rescues that create new problems.

---

### Step 5: REPORT

**Action:** Write the audit report using `templates/audit-report.md`.
**Inputs:** DISCOVER brief, DIAGNOSE findings, PLAN tiers, FIX results
**Outputs:** `RESCUE_REPORT.md` saved to the repository root

The report is the deliverable the user keeps. It documents what was found, what was
fixed (with build evidence), and what remains (with rationale for each deferred item).
It is the handoff document for the next person who works on this repo.

Use the morning-report format: short executive summary first, then findings table,
then fix evidence, then what remains. A reader who reads only the executive summary
should understand the repo's current health status.

**Do NOT:** Omit "What Remains" to make the report look cleaner. Undocumented
remaining issues will be rediscovered by the next person without context.

---

## Output

Default output:

- `RESCUE_REPORT.md` in the repository root (primary deliverable, use `templates/audit-report.md`)
- Modified files (applied Quick Win and Day 1 fixes with diffs as evidence)
- Updated build status confirming repo state after rescue

---

## Example

See [`examples/repobrain-rescue.md`](examples/repobrain-rescue.md) for a complete
walkthrough of a rescue applied to the RepoBrain codebase (2026-04-13), including
the full DISCOVER brief, categorized findings, tiered plan, applied fixes with
build output, and final audit report.

---

## Works Well With

- `code-review-checklist` — After rescue stabilizes the build, run a review to validate applied fixes
- `skill-forge` — If the rescue reveals missing tooling, forge a skill to prevent recurrence
- `doctor-pattern` — Wire `scripts/run-diagnostics.sh` into a recurring health-check target

---

## Notes

- Monorepos: apply the skill to each package root sequentially; note workspace-level tooling gaps in the plan
- Week 1 items are documented, not executed, unless explicitly requested
- Scripts in `scripts/` are standalone bash — they do not require SKILL.md context to run
- The skill does not rotate secrets — it flags them and instructs; rotation is a manual step
- Proven on: RepoBrain (2026-04-13)

---

## Quick Reference

For agents who already know the process:

```
DISCOVER   → Map repo: README, config files, CI, directory structure, last-active date
             if production app (auth/db/API) → read 3–5 key source files to build security mental model
DIAGNOSE   → Build command → run-diagnostics.sh → Security Source Audit (grep 7 patterns)
             → findings table (category|severity|file|auto-fix?)
PLAN       → Assign every finding to Quick Win / Day 1 / Week 1; secrets always Quick Win
FIX        → for each fix: apply → build → pass? continue : rollback + document; never batch
REPORT     → Write RESCUE_REPORT.md: exec summary, findings table, fix evidence, what remains
```

| Phase | Do NOT |
|-------|--------|
| DISCOVER | Attempt to build before mapping the repo |
| DIAGNOSE | Fix anything — record everything first |
| PLAN | Assign everything to Day 1 — tier assignment is the skill's core value |
| FIX | Batch multiple fixes before verifying |
| REPORT | Omit "What Remains" to make the report look cleaner |

---

## Scope Boundary

This skill performs **configuration hygiene AND source-code security audit**. It covers:
build fixes, CI/CD repair, dependency triage, secret detection, and security anti-pattern
scanning in application source code.

For deep architectural analysis — module boundaries, data flow tracing, performance
profiling, domain model evaluation — follow with a dedicated `architecture-audit` or
`code-review-checklist` workflow. This skill gets the repo building and safe to ship;
those workflows assess whether the architecture is sound.
