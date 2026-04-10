# Skill Forge

> Production line for creating marketplace-ready agent skill packages from any codebase or domain.

## What It Does

Skill Forge takes raw knowledge, codebases, or workflows and produces complete skill packages at a consistent commercial standard. It determines the right package shape (Minimal through Production), scaffolds the directory structure, authors all files using annotated templates, and verifies the result against a quality gate before packaging.

## Supported Clients

- Claude Code (primary)
- Codex CLI
- Cursor
- Any AI client that can read skill files and write markdown

## Prerequisites

- A target domain, codebase, or workflow to forge into a skill
- Write access to the output directory

## Installation

Place the `skill-forge/` folder in your skills directory:

```bash
# Claude Code
cp -r skill-forge/ ~/.claude/skills/skill-forge/
```

Or reference it from your project's `knowledge/meta-skills/` directory.

## Trigger Conditions

- Creating a new skill from a codebase or domain
- Converting an existing workflow into a distributable skill
- Restructuring a prototype skill to commercial standard
- Packaging a skill for marketplace distribution
- Any request involving "forge", "create skill package", or "turn this into a skill"

## Expected Outcome

Every skill package produced by the forge:
- Has complete YAML frontmatter with trigger-optimized description
- Follows the correct package shape (Minimal / Standard / Full / Production)
- Uses tables over prose for all lookup content
- States anti-patterns explicitly
- Passes the quality gate in `references/quality-gate.md`
- Is compatible with skill-engine pipeline and skill-creator eval loop

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Main skill — 6-step forge process (ANALYZE through PACKAGE) |
| `README.md` | This file — overview, install, troubleshooting |
| `metadata.json` | Package metadata for distribution |
| `templates/skill-md.md` | SKILL.md template with Fixed/Variable annotations |
| `templates/readme-md.md` | README.md template |
| `templates/metadata-json.md` | metadata.json template with field docs |
| `templates/reference-file.md` | Template for reference files |
| `references/package-shapes.md` | Decision tree for shape selection |
| `references/quality-gate.md` | Full verification checklist (5 categories, ~60 items) |
| `references/skill-anatomy.md` | Craftsmanship guide — what makes a good skill |
| `references/anti-patterns.md` | Common skill authoring mistakes with before/after |
| `examples/minimal-example/` | Brand-guidelines level skill (SKILL.md only) |
| `examples/standard-example/` | Deal-memo level skill (3 files) |
| `examples/full-example/` | Chart-visualization level skill (5+ files) |

## Troubleshooting

**Issue:** Agent creates a monolithic SKILL.md over 500 lines.
**Solution:** Extract specialized content to `references/` files. SKILL.md should be self-contained for common cases; reference files handle depth.

**Issue:** Uncertain which package shape to choose.
**Solution:** Read `references/package-shapes.md` for the detailed decision tree. Default to Standard when in doubt — you can promote later.

**Issue:** Quality gate fails on structural items.
**Solution:** Re-read the templates. Most structural failures come from skipping templates and authoring from scratch.
