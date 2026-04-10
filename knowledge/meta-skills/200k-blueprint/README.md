# 200k Blueprint

> Turn any product concept into a complete technical blueprint — the first step of every 200k-repo.

## What It Does

Takes a fuzzy product idea ("build a SaaS for X") and produces a concrete, actionable blueprint: architecture, stack, directory structure, quality gates, skill map, build order, risk register, and effort estimate. Downstream tools (skill-forge, scaffolds, agents) read the blueprint and know exactly what to build.

## Supported Clients

- Claude Code (primary)
- Any AI client with web search and file writing capability

## Prerequisites

- A product concept (even a vague one — the intake process refines it)
- Access to web search (for domain research, optional)

## Installation

```bash
cp -r 200k-blueprint/ ~/.claude/skills/200k-blueprint/
```

## Trigger Conditions

- "Build X" or "I want to create..."
- "New product" or "200k blueprint"
- "What would it take to build..."
- Any product concept that needs a plan before code
- Evaluating whether a product idea is worth building

## Expected Outcome

A `docs/blueprint-[product-name].md` file containing:
- Concept summary (what, who, one thing, competition, 30-day target)
- Architecture decisions (stack, pattern, directory, data model)
- Quality gates (200k baseline + product-specific)
- Skill map (what exists, what to forge)
- Build order (phased, with dependencies and estimates)
- Risk register (at least 3 risks with mitigations)

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Main skill — 7-step blueprint process |
| `README.md` | This file |
| `metadata.json` | Package metadata |
| `templates/blueprint.md` | Blueprint output template with Fixed/Variable zones |
| `references/domain-research.md` | 30-minute domain research guide |
| `examples/review-copilot-blueprint.md` | Complete worked example of a finished blueprint |

## Troubleshooting

**Issue:** User can't answer "What is the ONE thing?"
**Solution:** This is the most important question. Help them by listing what the product could do, then force-ranking. If they can't choose, the product isn't ready to blueprint.

**Issue:** Blueprint feels too complex for a small project.
**Solution:** Delete sections that don't apply. A CLI tool doesn't need a frontend stack row. A static site doesn't need auth. The template is a maximum, not a minimum.
