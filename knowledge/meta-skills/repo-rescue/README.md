# Repo Rescue

> Autonomously triage, fix, and document any stuck, broken, or abandoned repository
> in one session — build passes or you know exactly why it doesn't.

## What It Does

Repo Rescue runs a five-phase workflow (DISCOVER → DIAGNOSE → PLAN → FIX → REPORT)
on any repository the agent can access. It scans for the full set of issues
(broken builds, hardcoded secrets, stale configs, missing CI, dead imports), applies
Quick Win and Day 1 fixes with build verification after each one, and delivers a
morning-report-style `RESCUE_REPORT.md` with findings, fixes, and a tiered action plan
for everything that remains. It replaces the paralysis of "everything is broken and I
don't know where to start" with a ranked, time-estimated, executable list.

## Supported Clients

- Claude Code
- Cursor
- Codex

## Prerequisites

- Git installed and repository cloned locally
- Build toolchain installed for the target language (cargo, npm, pip, make, etc.)
- Bash shell (for diagnostic scripts in `scripts/`)
- Write permission to the target repository (for applying fixes)

## Installation

1. Copy the full `repo-rescue/` directory into your skills location.
2. Ensure the scripts are executable:

```bash
chmod +x repo-rescue/scripts/*.sh
```

3. Add `SKILL.md` to your AI client's instruction context.
4. Test with a prompt like: `"rescue the repo at [path]"` or `"the build is broken, triage it"`

For Claude Code, a common install path is:

```bash
mkdir -p ~/.claude/skills/repo-rescue
cp -r . ~/.claude/skills/repo-rescue/
```

## Trigger Conditions

- "rescue this repo"
- "unstick this project"
- "the build is broken"
- "I haven't touched this in months"
- "nothing works and I don't know where to start"
- "diagnose this codebase"
- "triage this project before sprint planning"
- "audit this repository"

## Expected Outcome

When installed and invoked correctly, the skill should produce:

- `RESCUE_REPORT.md` in the repository root — morning-report format with executive summary, findings table, evidence-backed fixes, and tiered action plan
- Applied fixes for all Quick Wins and Day 1 items, each verified with a build run
- A passing build, or documented explanation of why it still fails and what the next step is

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Core skill definition — five-phase workflow, decision tables, anti-patterns |
| `README.md` | This file — installation, usage, and troubleshooting |
| `metadata.json` | Machine-readable metadata for indexing and discovery |
| `templates/audit-report.md` | Morning-report template for `RESCUE_REPORT.md` |
| `templates/action-plan.md` | Three-tier (Quick Win / Day 1 / Week 1) action plan template |
| `references/anti-patterns.md` | Full catalog of common repo problems with detection commands and fixes |
| `references/diagnostic-checklist.md` | Per-category checklist for DIAGNOSE phase |
| `references/build-vs-buy.md` | Decision table for dependency gaps |
| `examples/repobrain-rescue.md` | Complete worked example from a real rescue session |
| `scripts/scan-secrets.sh` | Grep for hardcoded credentials and API keys |
| `scripts/check-gitignore.sh` | Find tracked files that should be ignored |
| `scripts/find-dead-imports.sh` | Run language linter in check mode for unused imports |
| `scripts/run-diagnostics.sh` | Orchestrator: runs all checks, outputs summary table |
| `evals/evals.json` | Test cases for skill validation via skill-creator |

## Troubleshooting

**Issue: The skill starts fixing things before finishing the diagnostic scan.**
Solution: Remind the agent of Step 2 ("Do NOT fix anything during DIAGNOSE"). If using
Claude Code, prepend your prompt with "Run DIAGNOSE only, do not apply any fixes yet."

**Issue: Scripts fail with `permission denied` when run.**
Solution: Run `chmod +x scripts/*.sh` from the `repo-rescue/` directory. On Windows with
Git Bash, ensure line endings are LF: `dos2unix scripts/*.sh`.

**Issue: `run-diagnostics.sh` reports "no supported language detected" for a valid repo.**
Solution: The script detects language by file extension. If the repo uses a non-standard
layout, pass the sub-directory containing source files: `scripts/run-diagnostics.sh ./src`.

**Issue: The audit report omits findings that were obvious from the build log.**
Solution: Ensure DIAGNOSE ran the full `run-diagnostics.sh` sweep, not just the build.
The build log catches compile errors; the scripts catch secrets, gitignore issues, and
dead imports that the build system does not report.

## Client Compatibility Notes

The five-phase sequence and the fix-verify loop (one fix → one build → pass or rollback)
are the invariant behaviors across all clients. Everything else adapts:

| Capability | With bash execution | Without bash execution |
|-----------|--------------------|-----------------------|
| Diagnostic scripts | Run `scripts/run-diagnostics.sh` | Follow `references/diagnostic-checklist.md` manually |
| Fix application | Apply changes directly | Output proposed diffs for human review |
| Build verification | Run build command after each fix | Document expected verification command |

Clients without file-write access should treat Step 4 as a "proposed fixes" output
rather than applied changes.
