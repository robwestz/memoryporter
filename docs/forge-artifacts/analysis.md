# Step 1: ANALYZE — repo-rescue

> Source type: **Domain / raw knowledge** (workflow proven on RepoBrain, 2026-04-13)
> Target skill: Autonomous rescue of stuck, broken, or abandoned repositories

---

## Core Workflow

The procedure, in fixed order:

```
1. DISCOVER  — Scan directory structure, read docs, map architecture and build system
2. DIAGNOSE  — Run build, identify all blockers by category and severity
3. PLAN      — Produce tiered action plan (quick wins / Day 1 / Week 1)
4. FIX       — Apply quick wins + Day 1 fixes; verify each with build after applying
5. REPORT    — Write morning-report-style document (found / fixed / remains)
```

The loop within FIX: **fix one item → run build/test → pass → next item**. If a fix
causes a new failure, rollback or document as partial and move on.

---

## Decision Points

| Decision | Options | Criteria |
|----------|---------|----------|
| Fix vs. document vs. skip | Fix / Document / Skip | Fix if < 30 min and unblocks build; document if Week 1 scope; skip if out of scope |
| Tier assignment | Quick win / Day 1 / Week 1 | < 30 min + no judgment needed → quick; build-blocking → Day 1; architectural → Week 1 |
| Automated vs. manual fix | Script it / Apply by hand | Mechanical + deterministic → script; requires judgment → manual with documented rationale |
| Fix order | Upstream first | Always fix dependency failures before downstream consumers |
| Build-vs-buy-vs-hybrid | Build / Buy / Hybrid | Project-specific tight coupling → build; standard coverage → buy; standard tool + custom config → hybrid |
| Confidence gate | Continue / Rollback | Build passes → continue; build fails → rollback fix or document as partial |
| Security urgency | Fix now / Flag | Hardcoded secrets, exposed keys → always Quick Win regardless of effort |

---

## Patterns (repeating structures → become templates or references)

| Pattern | Becomes |
|---------|---------|
| Morning report structure (found / fixed / remains) | Template: `audit-report.md` |
| Three-tier action plan with effort estimates | Template: `action-plan.md` |
| Diagnostic checklist per category (build / security / config / deps / CI) | Reference: `diagnostic-checklist.md` |
| Anti-pattern signatures with symptoms and fixes | Reference: `anti-patterns.md` |
| Build-vs-buy-vs-hybrid decision table | Section in `SKILL.md` + Reference: `build-vs-buy.md` |
| Fix-verify loop (apply → build → pass/fail → next) | Fixed workflow step in `SKILL.md` |
| Windows-specific flakiness patterns | Section in `anti-patterns.md` |

---

## Trigger Phrases

- "rescue this repo"
- "unstick this project"
- "fix this broken codebase"
- "repo is stuck"
- "get this building again"
- "repo-rescue"
- "this repo is abandoned"
- "diagnose this codebase"
- "what's wrong with this repo"
- "audit this repository"
- "triage this project"
- "the build is broken"
- "I haven't touched this in months"
- "nothing works and I don't know where to start"

---

## Output Format

**Primary output — Audit Report** (markdown, morning-report style):

```
1. Executive Summary     — 1 paragraph, severity count, blockers found, fixes applied
2. What Was Found        — categorized findings table (category | finding | severity | file)
3. What Was Fixed        — before/after evidence per fix (command output or diff)
4. What Remains          — tiered action plan (quick / Day 1 / Week 1) with owners + effort
5. Build Status          — final build output confirming state of repo after rescue
```

**Secondary outputs:**
- Modified/fixed files (the actual applied changes)
- Automated check scripts (run once or wired into CI)

**Output is not ephemeral** — the audit report is a deliverable the user keeps.

---

## Dependencies

| Dependency | Type | Required? | Notes |
|------------|------|-----------|-------|
| Bash / shell | Tool | Yes | Script execution |
| Glob + Grep | Tool | Yes | Codebase scanning |
| Read + Edit | Tool | Yes | Applying fixes |
| Bash tool (build runner) | Tool | Yes | `cargo build`, `npm install`, `pip install`, etc. |
| Git | Tool | Yes | History, blame, stale files |
| Language build tool | External | Project-specific | cargo / npm / pip / make / gradle |
| CI system knowledge | Domain | Nice-to-have | GitHub Actions / GitLab CI / Jenkins |

No external APIs. No paid services. Works offline after cloning.

---

## What Varies vs. What Is Fixed

| Fixed (structure) | Variable (per-repo) |
|-------------------|---------------------|
| 5-phase workflow order (DISCOVER → DIAGNOSE → PLAN → FIX → REPORT) | Language and build system |
| Tier definitions (quick wins < 30min / Day 1 / Week 1) | Specific blockers found |
| Report structure (found / fixed / remains / build status) | Which anti-patterns are present |
| Confidence gate: verify after every fix | CI system (GitHub Actions / GitLab / none / broken) |
| Anti-pattern catalog (the list of known patterns) | Which anti-patterns are triggered |
| Build-vs-buy decision table | Resolution chosen for each dependency gap |
| Fix-order rule (upstream before downstream) | Actual dependency chain in this repo |
| Security items always become Quick Wins | Severity of each finding |

---

## Anti-Patterns Catalog (known repo problems — feed directly into references/)

| Anti-pattern | Symptom | Automated Detection | Fix |
|--------------|---------|---------------------|-----|
| Stale `.gitignore` | Generated files tracked in git | `git ls-files --ignored --exclude-standard` | Add patterns, `git rm --cached` |
| Hardcoded secrets | API keys, passwords in source | `grep -rE "(api_key\|password\|secret)\s*=" --include="*.{py,js,ts,env}"` | Move to env vars, rotate key |
| Missing CI | No `.github/workflows/` or equivalent | `ls .github/workflows/` or `ls .gitlab-ci.yml` | Add minimal CI from template |
| Dead imports | Unused imports in source files | Language linter (`eslint`, `ruff`, `cargo check`) | Remove automatically with linter `--fix` |
| Flaky Windows builds | Path separator errors, line ending mismatch, case sensitivity | Build on Windows CI | `.gitattributes` + path normalization |
| Missing `.env.example` | Devs can't onboard without tribal knowledge | `ls .env.example` | Create from `.env` structure, never with values |
| Broken lockfile | `package-lock.json` out of sync with `package.json` | `npm ci` fails | Delete lockfile, `npm install`, re-commit |
| Dev deps in production | Production build includes test tooling | Dependency audit (`npm ls --prod`) | Move to `devDependencies` |
| No health check / doctor command | Can't verify repo works in CI | Absence of `verify`/`check` script in `package.json`/`Makefile` | Add `verify` target |
| Outdated README | README describes old setup that no longer works | Manual check vs. actual build steps | Update + add "Last verified: YYYY-MM-DD" |

---

## Expert Knowledge (what makes a rescue good vs. bad)

**What an expert rescuer knows that a beginner doesn't:**

- Start with the build output, not the code. A repo that won't build can't be reasoned about.
  The error stack is the diagnostic entry point.
- Fix in dependency order. Upstream failures cascade — fixing downstream first wastes time.
- Windows-specific flakiness is almost always path separators, line endings, or case-insensitive
  filesystem assumptions. Check for these explicitly if CI fails on Windows only.
- Hardcoded secrets are both urgent (security) and cheap to fix — always Quick Wins.
- Stale `.gitignore` causes invisible pollution. Check what's actually tracked vs. what should be.
- A repo without CI has no safety net. Adding CI is Day 1, not Week 1 — every subsequent fix
  runs without a net until CI exists.
- "Abandoned" repos often only need one committed person to unlock. The first visible win
  (a clean build, a passing test) restores momentum and confidence.
- Document what you don't fix. Future you (or the user) will encounter those issues without
  context. A "what remains" section with rationale is as valuable as the fixes.

---

## Package Shape Recommendation

This skill:
- Has a multi-phase workflow with meaningful diverging decisions → not MINIMAL
- Produces structured templated output (audit report, action plan) → Full
- Has automated check scripts that execute standalone → Production
- Will be shared across multiple projects → Standard+
- Has a reference catalog (anti-patterns, diagnostic checklist, build-vs-buy) → Full+

**Recommended shape: PRODUCTION**

### File manifest

```
knowledge/meta-skills/repo-rescue/
├── SKILL.md                        ← Core: workflow, decision tables, anti-patterns summary
├── README.md                       ← Installation, prerequisites, trigger conditions
├── metadata.json                   ← Marketplace metadata
├── templates/
│   ├── audit-report.md             ← Morning-report structure (Fixed/Variable annotated)
│   └── action-plan.md              ← Three-tier action plan table template
├── references/
│   ├── anti-patterns.md            ← Full anti-pattern catalog with detection + fix
│   ├── diagnostic-checklist.md     ← Per-category checklist (build/security/config/deps/CI)
│   └── build-vs-buy.md             ← Decision table + worked examples
├── examples/
│   └── repobrain-rescue.md         ← Worked example from today's RepoBrain session
└── scripts/
    ├── scan-secrets.sh             ← Grep for hardcoded credentials
    ├── check-gitignore.sh          ← Find tracked files that should be ignored
    ├── find-dead-imports.sh        ← Wrapper: run language linter in check mode
    └── run-diagnostics.sh          ← Orchestrator: runs all checks, outputs summary
```

---

## What the Skill's Value Prop Is

> A broken repo is not a code problem — it's a *prioritization* problem.
> The skill's value is in converting overwhelming disorder into a ranked,
> executable list where every item has a time estimate and a verification step.
> An expert can do this in their head. The skill makes it repeatable by anyone.

---

## Open Questions (to resolve in CLASSIFY / SCAFFOLD)

| Question | Default assumption | Needs confirmation? |
|----------|--------------------|---------------------|
| Is `evals/evals.json` needed now or after skill-creator handoff? | Add placeholder, fill via skill-creator | No |
| Should scripts be POSIX-sh or bash? | bash — wider availability in dev envs | No |
| Example: reference the RepoBrain session by name? | Yes — concrete example builds trust | No |
| Should the skill handle monorepos differently? | Note in references, not a separate workflow | No |
