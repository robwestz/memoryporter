# Session Launcher

> The conductor skill — takes a task intent and produces a complete startup prompt for a new Codex session.

## What It Does

Session Launcher front-loads session discovery into a structured prompt. Instead of a new session spending its first 10 messages figuring out which skills to load and which files to read, it starts with a launch configuration that makes it productive from message one.

The output is a copy-pasteable prompt block under 500 words containing:
- Skills to load (verified on disk)
- Files to read first (verified on disk)
- Archon workflows to queue (if applicable)
- Skills to forge first (if capability gaps found)
- Quality gates for "done"
- Memory/context to load

## Supported Clients

- Codex (primary)
- Claude Code
- Cursor
- Any AI client that supports skill loading

## Prerequisites

- At least one skill directory exists (`~/.codex/skills/` or `knowledge/meta-skills/`)
- A task intent (what the session should accomplish)

## Installation

Place the `session-launcher/` folder in your meta-skills directory:

```bash
# Already in portable-kit
ls knowledge/meta-skills/session-launcher/

# Or copy to another project
cp -r knowledge/meta-skills/session-launcher/ /path/to/project/knowledge/meta-skills/
```

## Trigger Conditions

- Starting a new Codex session for a specific task
- Preparing a handoff prompt for another agent or session
- Planning which skills a project needs before building
- Auditing skill coverage for a task category
- Any request involving "launch session", "startup prompt", "which skills do I need"

## Expected Outcome

Every startup prompt produced by Session Launcher:
- References only skills that exist on disk (verified)
- References only files that exist on disk (verified)
- Is under 500 words (enforced)
- Has at least one quality gate
- Documents capability gaps (even if zero)
- Uses imperative mood (not suggestions)

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Main skill — 6-step process (INTAKE through DELIVER) |
| `README.md` | This file — overview, install, troubleshooting |
| `metadata.json` | Package metadata for distribution |
| `templates/startup-prompt.md` | Output template with Fixed/Variable zones |
| `templates/gap-analysis.md` | Template for documenting missing capabilities |
| `templates/skill-audit.md` | Quick inventory format for skill scanning |
| `references/skill-catalog.md` | Complete listing of every known skill with triggers and categories |
| `scripts/scan-skills.sh` | Bash script that lists available skills with descriptions |

## Troubleshooting

**Issue:** Scan finds zero skills.
**Solution:** Check that `~/.codex/skills/` and/or `knowledge/meta-skills/` exist and contain skill directories with SKILL.md files.

**Issue:** Prompt exceeds 500 words.
**Solution:** Reduce skills to max 6. Cut file list to max 8. Remove all explanatory text — keep only imperatives.

**Issue:** Skill referenced in prompt doesn't exist.
**Solution:** Session Launcher verifies skills on disk in Step 6. If you see this, the verification step was skipped — rerun DELIVER with verification enabled.

**Issue:** Gap analysis shows too many External/Human gaps.
**Solution:** Break the task into sub-sessions. Each sub-session should be completable within the agent's capabilities.
