# Verification Report — repo-rescue

**Date:** 2026-04-13
**Auditor:** skill-forge VERIFY step (Step 5)
**Package shape:** Production (SKILL.md + README + metadata + templates + examples + references + scripts + evals)
**Quality gate:** `knowledge/meta-skills/skill-forge/references/quality-gate.md`
**Pass threshold:** 16/16 MUST · 80% applicable SHOULD · all applicable CHECK evaluated

---

## Summary

| Category | MUST | SHOULD | CHECK | Verdict |
|----------|------|--------|-------|---------|
| 1. Structural Integrity | 13/13 | — | 6/6 evaluated | PASS |
| 2. Content Quality | — | 14/14 | — | PASS |
| 3. Progressive Disclosure | — | 9/9 | 1/1 evaluated | PASS |
| 4. Compatibility | 3/3 | 6/6 | 3/3 evaluated | PASS |
| 5. Marketplace Readiness | — | 7/7 | 6/6 evaluated | PASS |
| **Total** | **16/16** | **36/36** | **16/16 evaluated** | **PASS** |

**Result: PACKAGE-READY. No MUST failures. No SHOULD failures. All CHECK items evaluated.**

---

## MUST Failures

**None.** All 16 MUST items pass.

---

## Category 1: Structural Integrity

| # | Severity | Check | Result | Evidence |
|---|----------|-------|--------|----------|
| 1.1 | MUST | SKILL.md exists at package root | PASS | File confirmed present |
| 1.2 | MUST | Valid YAML frontmatter | PASS | `---` delimiters at lines 1 and 15 |
| 1.3 | MUST | `name` field present | PASS | `name: repo-rescue` |
| 1.4 | MUST | `description` field present | PASS | Multi-line block scalar, ~750 chars |
| 1.5 | MUST | `author` field present | PASS | `author: Robin Westerlund` |
| 1.6 | MUST | `version` matches SemVer | PASS | `version: 1.0.0` |
| 1.7 | MUST | `name` is lowercase-kebab-case | PASS | `repo-rescue` matches `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` |
| 1.8 | MUST | `description` >= 50 characters | PASS | ~750 chars |
| 1.9 | MUST | SKILL.md body < 500 lines | PASS | 248 body lines (263 total − 15 frontmatter) |
| 1.10 | MUST | Every referenced file exists in package | PASS | All 10 skill-package cross-references verified. `package.json` and `RESCUE_REPORT.md` are target-repo files mentioned by name, not package cross-references — correctly excluded from check. |
| 1.11 | MUST | No hardcoded absolute paths | PASS | grep for `/Users/`, `C:\`, `/home/` → 0 matches |
| 1.12 | MUST | No API keys or secrets | PASS | grep for `sk-`, `Bearer `, `password=` → 0 matches |
| 1.13 | MUST | Directory structure matches shape | PASS | Production shape confirmed: SKILL.md + README + metadata.json + templates/ (2 files) + examples/ (1 file) + references/ (3 files) + scripts/ (4 files) + evals/evals.json |
| 1.14 | CHECK | metadata.json is valid JSON | PASS | Parses cleanly; no syntax errors |
| 1.15 | CHECK | metadata.json `name` matches SKILL.md `name` | EVALUATED — DOCUMENTED SKIP | `"name": "Repo Rescue"` (display) vs `name: repo-rescue` (identifier). Design conflict between 1.15 (string-match) and 5.10 (human-readable). The template in skill-forge step 4.3 uses `"Display Name"` not `"display-name"`, establishing display-name intent. Accepted gap; 5.10 satisfied. |
| 1.16 | CHECK | templates/ has at least one .md file | PASS | `audit-report.md`, `action-plan.md` |
| 1.17 | CHECK | examples/ has at least one complete example | PASS | `repobrain-rescue.md` — full five-phase walkthrough |
| 1.18 | CHECK | scripts/ are executable with usage comment | PASS | All 4 scripts begin with `#!/usr/bin/env bash` + `# Usage:` block |
| 1.19 | CHECK | evals.json is valid JSON with >= 3 test cases | PASS | 4 test cases: rr-01 through rr-04 |

---

## Category 2: Content Quality

| # | Severity | Check | Result | Evidence |
|---|----------|-------|--------|----------|
| 2.1 | SHOULD | First section delivers standalone value | PASS | Purpose (lines 17–32) states the problem, the solution, and the phases; actionable without reading further |
| 2.2 | SHOULD | Tables used where 3+ parallel items share attributes | PASS | 10 tables across SKILL.md: When Not to Use, Required Context, DISCOVER decision, DIAGNOSE findings categories, PLAN tier rules, PLAN fix-order decision, FIX loop decision, Quick Reference anti-pattern, Audience |
| 2.3 | SHOULD | At least one anti-pattern per major process section | PASS | Every step ends with a "**Do NOT:**" block: DISCOVER (1), DIAGNOSE (1), PLAN (1), FIX (1), REPORT (1) |
| 2.4 | SHOULD | Every decision point has a decision table | PASS | DISCOVER: If/Then/Because for staleness and missing README · FIX: If/Then/Because for fix failures, effort overrun, partial pass, secret rotation |
| 2.5 | SHOULD | Imperative form throughout | PASS | grep for "you should", "one might", "consider", "perhaps", "it is a good idea" → 0 matches |
| 2.6 | SHOULD | Examples for ambiguous rules | PASS | Quick Reference section shows concrete DISCOVER → REPORT one-liner per phase. Full worked example in `examples/repobrain-rescue.md`. |
| 2.7 | SHOULD | No "be smart" or vague directives | PASS | grep for "be smart", "think carefully", "use judgment", "be careful" → 0 matches |
| 2.8 | SHOULD | Key insight first in each section | PASS | Each step opens with **Action / Inputs / Outputs** table before procedural detail |
| 2.9 | SHOULD | Verification steps are testable | PASS | FIX loop has explicit pass/fail branch: "If build passes → continue; if build fails → rollback" — no subjective criteria |
| 2.10 | SHOULD | Code examples are syntactically valid | PASS | Fix-verify pseudocode is well-formed; bash commands in references are syntactically correct |
| 2.11 | SHOULD | Templates have Fixed/Variable zone annotations | PASS | Both `templates/audit-report.md` and `templates/action-plan.md` use `<!-- [FIXED] -->` and `<!-- [VARIABLE] -->` throughout |
| 2.12 | SHOULD | Worked examples are real, not placeholder stubs | PASS | `examples/repobrain-rescue.md` shows actual build output, real finding table, real fix diffs, real audit report |
| 2.13 | SHOULD | No orphan references | PASS | All cross-references resolve: `references/diagnostic-checklist.md`, `references/build-vs-buy.md`, `references/anti-patterns.md`, `templates/action-plan.md`, `templates/audit-report.md` all exist |
| 2.14 | SHOULD | Consistent terminology | PASS | DISCOVER/DIAGNOSE/PLAN/FIX/REPORT capitalized and consistent throughout; "Quick Win / Day 1 / Week 1" tier names consistent across SKILL.md, templates, examples, evals |

---

## Category 3: Progressive Disclosure

| # | Severity | Check | Result | Evidence |
|---|----------|-------|--------|----------|
| 3.1 | SHOULD | `description` is ~50–150 words | PASS | 98 words (measured via `wc`) |
| 3.2 | SHOULD | SKILL.md body is self-contained for core workflow | PASS | All five phases, decision rules, tier assignments, and fix-verify loop present; references provide depth, not required reading |
| 3.3 | SHOULD | References used for depth, not required execution | PASS | SKILL.md provides complete decision guidance inline; references are consulted for per-anti-pattern commands and build-vs-buy sub-decisions only |
| 3.4 | SHOULD | Every reference file starts with "When to read this:" | PASS | `anti-patterns.md` ✓ · `build-vs-buy.md` ✓ · `diagnostic-checklist.md` ✓ |
| 3.5 | SHOULD | Templates usable without reading SKILL.md | PASS | `audit-report.md` and `action-plan.md` are self-contained forms with VARIABLE annotations that specify what to fill in |
| 3.6 | SHOULD | README readable without reading SKILL.md | PASS | README has independent installation, trigger, and outcome sections; never requires SKILL.md for setup |
| 3.7 | CHECK | If 4+ reference files: SKILL.md has reference index | N/A | 3 reference files — threshold not reached |
| 3.8 | SHOULD | Sections ordered by frequency of use | PASS | Purpose → When to Use → Required Context → Process (core) → Output → Works Well With → Notes → Quick Reference (lookup) |
| 3.9 | SHOULD | Long sections have sub-headings | PASS | Process section (~100 lines) has ### Step 1–5 sub-headings; each step has bold **Action / Inputs / Outputs** markers |
| 3.10 | SHOULD | No information duplication between SKILL.md and references/ | PASS | SKILL.md states the tier rule once; `references/anti-patterns.md` provides commands without repeating the tier definition |

---

## Category 4: Compatibility

| # | Severity | Check | Result | Evidence |
|---|----------|-------|--------|----------|
| 4.1 | MUST | `name` is unique across skill corpus | PASS | grep across `knowledge/` and `skill-engine/` → single match |
| 4.2 | SHOULD | `description` includes "Use when…" / "Trigger on…" | PASS | Both phrases present in frontmatter description block |
| 4.3 | SHOULD | Trigger phrases are concrete and specific | PASS | "rescue this repo", "the build is broken", "I haven't touched this in months", "nothing works and I don't know where to start" — all direct user phrasings |
| 4.4 | MUST | No hardcoded tool paths | PASS | `[REPO_ROOT]` placeholder used throughout; language tools referenced by name only (`cargo`, `npm`, `ruff`) |
| 4.5 | MUST | No dependency on specific project structure | PASS | Skill derives project type from config files at runtime; no assumed paths |
| 4.6 | SHOULD | Dependencies declared in metadata.json `requires` | PASS | `"tools": ["bash", "file-read", "file-write", "glob", "grep"]`, `"services": []`, `"open_brain": false` |
| 4.7 | SHOULD | Compatible with INTAKE→RESOLVE→EVAL→ADAPT→VERIFY | PASS | Clear inputs (repo path), outputs (RESCUE_REPORT.md + diffs), verification (build pass/fail after each fix) |
| 4.8 | CHECK | If wraps external service: graceful failure | N/A | No external services |
| 4.9 | CHECK | If spawns sub-agents: permission level declared | N/A | No sub-agents |
| 4.10 | SHOULD | Loadable by loader-blueprint ranking model | PASS | Has explicit trigger phrases, clear intent, SemVer version; description suitable for resolver scoring |
| 4.11 | SHOULD | Version follows SemVer | PASS | `1.0.0` |
| 4.12 | CHECK | If modifies files: declares output directories | PASS | Output section states "RESCUE_REPORT.md in the repository root"; templates section states save path |

---

## Category 5: Marketplace Readiness

| # | Severity | Check | Result | Evidence |
|---|----------|-------|--------|----------|
| 5.1 | CHECK | README.md exists | PASS | Present, 117 lines |
| 5.2 | CHECK | README has all 9 required sections | PASS | Title+one-liner ✓ · What It Does ✓ · Supported Clients ✓ · Prerequisites ✓ · Installation ✓ · Trigger Conditions ✓ · Expected Outcome ✓ · Files ✓ · Troubleshooting ✓ |
| 5.3 | CHECK | metadata.json exists | PASS | Present, valid JSON |
| 5.4 | CHECK | metadata.json has all required fields | PASS | `name`, `description`, `category`, `author`, `version`, `requires`, `tags`, `difficulty`, `estimated_time`, `created`, `updated` — all present |
| 5.5 | SHOULD | Tags are lowercase, kebab-case, and searchable | PASS | `debugging`, `triage`, `build-fix`, `build-repair`, `codebase-audit`, `abandoned-repo`, `ci-repair`, `monorepo` — all valid |
| 5.6 | SHOULD | Tags include domain tag and function tag | PASS | Domain: `abandoned-repo`, `codebase-audit` · Function: `debugging`, `triage`, `build-fix` |
| 5.7 | SHOULD | Category is a recognized value | PASS | `"category": "meta-skills"` matches parent directory |
| 5.8 | CHECK | If Full+ shape: at least one worked example | PASS | `examples/repobrain-rescue.md` — complete end-to-end rescue session |
| 5.9 | SHOULD | README Files table matches actual directory contents | PASS | 14 entries in Files table, 14 files on disk — exact match |
| 5.10 | SHOULD | Display name is human-readable | PASS | `"name": "Repo Rescue"` — title-case, not kebab |
| 5.11 | CHECK | If skill has prerequisites: listed in README | PASS | Prerequisites section lists: git, build toolchain, bash, write permission |
| 5.12 | SHOULD | Troubleshooting has at least 2 entries | PASS | 4 entries: fix-before-diagnose, permission denied, language not detected, build log gap |
| 5.13 | SHOULD | Installation instructions are copy-pasteable | PASS | `chmod +x repo-rescue/scripts/*.sh` and `cp -r . ~/.claude/skills/repo-rescue/` are complete commands |

---

## Evaluated Items — Documented Decisions

| Item | Decision | Reason |
|------|----------|--------|
| 1.15 CHECK | Skip — documented | `"Repo Rescue"` (display name) vs `repo-rescue` (identifier). Conflict between 1.15 (string-match) and 5.10 (human-readable). Template in skill-forge step 4.3 shows `"Display Name"`, establishing that metadata.json `name` is the display name. 5.10 satisfied. |
| 3.7 CHECK | N/A | 3 reference files, below the 4-file threshold |
| 4.8 CHECK | N/A | Skill wraps no external services |
| 4.9 CHECK | N/A | Skill spawns no sub-agents |

---

## Recommendations

No blocking items. Optional improvements for future iterations:

| Priority | Item |
|----------|------|
| Low | Add `"id": "repo-rescue"` field to metadata.json to formally separate identifier from display name, resolving the 1.15/5.10 design conflict |
| Low | Add a 5th eval case covering monorepo (multiple package roots) to strengthen coverage of the Notes clause |
| Low | Extend `scripts/find-dead-imports.sh` to detect Go language (already in `references/diagnostic-checklist.md`, not yet in the script) |
