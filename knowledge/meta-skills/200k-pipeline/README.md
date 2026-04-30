# 200k-pipeline

Master router for the complete production line that creates marketplace-ready agent skill packages and product blueprints.

## What It Does

Routes any skill-creation or product-design request to the correct sub-skill. Contains three capabilities: **skill-forge** (6-step process: ANALYZE, CLASSIFY, SCAFFOLD, AUTHOR, VERIFY, PACKAGE) for turning raw knowledge or codebases into distributable skill packages, **200k-blueprint** (7-step process: INTAKE, RESEARCH, ARCHITECT, QUALITY, MAP SKILLS, BLUEPRINT, VERIFY) for designing product architectures, and **Archon workflows** for autonomous execution of either pipeline. One skill dispatches to all three based on intent.

## Supported Clients

- Claude Code (primary)
- Any Claude agent with file-read and file-write access
- Archon workflows require Archon CLI installed separately

## Prerequisites

- No third-party packages required for interactive use
- Archon CLI + `bun` runtime for autonomous workflow execution (optional)
- `ANTHROPIC_API_KEY` must be empty when running Archon workflows on Max subscription

## Installation

Run the installer to copy the master skill + sub-skills globally:

```bash
bash knowledge/meta-skills/200k-pipeline/install.sh
```

This installs to `~/.claude/skills/200k-pipeline/` so the skill is available in every Claude Code session.

Alternatively, copy manually:

```
cp -r 200k-pipeline/ /your-project/.skills/
```

## Trigger Conditions

- "forge a skill"
- "create a skill package"
- "build a skill from this codebase"
- "turn this into a skill"
- "200k blueprint"
- "build a product"
- "new product"
- "design the architecture for"
- "skill pipeline"
- "production line"
- Any request to produce a structured skill package or product blueprint

## Expected Outcome

Depending on the route taken:

- **skill-forge route:** A complete skill package directory (Minimal/Standard/Full/Production shape) with SKILL.md, README.md, metadata.json, templates, references, examples, and/or scripts as appropriate.
- **200k-blueprint route:** A structured product blueprint with architecture, stack decisions, quality gates, skill map, build order, and risk register.
- **Archon route:** Autonomous execution of either pipeline via YAML workflow definitions.

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Master router — reads intent, dispatches to sub-skill |
| `README.md` | This file — installation and usage |
| `metadata.json` | Package metadata |
| `install.sh` | One-command global installer |
| `skill-forge/` | Sub-skill: 6-step skill package creation (19 files) |
| `200k-blueprint/` | Sub-skill: 7-step product blueprint design (6 files) |
| `workflows/` | Archon YAML workflow templates for autonomous execution |

## Troubleshooting

**Archon workflows use paid API credits instead of Max subscription.**
Set `ANTHROPIC_API_KEY=""` (empty string) before running Archon CLI. The Archon CLI with an empty key will use Max subscription auth instead of API credits.

**skill-forge produces inconsistent output structure.**
Always read `skill-forge/SKILL.md` before executing. The most common cause of inconsistent output is skipping Step 0 (Read Before Forging) and improvising structure instead of following the templates.

**The router cannot determine whether the user wants a skill or a blueprint.**
When intent is ambiguous, the router asks: "Do you want to create a skill (tool/capability) or design a product (architecture/blueprint)?" Do not guess — disambiguation is built into the routing logic.
