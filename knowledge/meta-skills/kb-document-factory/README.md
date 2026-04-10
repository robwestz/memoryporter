# KB Document Factory

> Production line for knowledge base documents. Ensures every article is structured, scannable, cross-referenced, and crafted to the same standard.

## What It Does

KB Document Factory is the meta-skill that governs how all documents in the `knowledge-base/` directory are created. It enforces consistent structure via annotated templates (Fixed/Variable zones), applies craftsmanship standards drawn from production artifact skills, and ensures LLM-parseable output through predictable patterns.

## Supported Clients

- Claude Code (primary)
- Any AI client that can read skill files and write markdown

## Prerequisites

- Knowledge base directory structure (see `knowledge-base/ARCHITECTURE.md`)
- Familiarity with the three-layer KB model (domain, methods, components)

## Installation

1. Place the `kb-document-factory/` folder in your skills directory
2. For Claude Code: `~/.claude/skills/kb-document-factory/`
3. The skill references templates in its own `templates/` directory

## Trigger Conditions

- Writing any new article for the knowledge base
- Updating or restructuring an existing KB article
- Compiling raw material into structured KB content
- Reviewing KB articles for format compliance
- Unsure which format to use for a piece of knowledge

## Expected Outcome

Every article produced through this skill:
- Has complete frontmatter with all required fields
- Follows the exact template structure for its format type
- Uses tables over prose for lookups (70%+ for cheat-sheets)
- Has at least 2 cross-references to other KB articles
- Includes anti-patterns (what NOT to do)
- Has honest confidence and status levels
- Delivers value in the first 20% of content

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Main skill — process, decision tree, craftsmanship standards |
| `templates/cheat-sheet.md` | Template with Fixed/Variable annotations |
| `templates/reference-article.md` | Template with Fixed/Variable annotations |
| `templates/comparison-table.md` | Template with Fixed/Variable annotations |
| `templates/method-guide.md` | Template with Fixed/Variable annotations |
| `templates/quality-gate.md` | Template with Fixed/Variable annotations |
| `templates/component-spec.md` | Template with Fixed/Variable annotations |
| `templates/report.md` | Template with Fixed/Variable annotations |
| `examples/technical-seo-example.md` | Complete example of a production-quality cheat-sheet |

## Troubleshooting

**Issue:** Agent creates article without consulting this skill.
Solution: The article will be flagged by kb-linter. Load this skill into the agent's context before any KB work.

**Issue:** Uncertain which format to use.
Solution: Follow the decision tree in SKILL.md Step 1. Default: cheat-sheet for domain, method-guide for methods, component-spec for components.

**Issue:** Article doesn't fit any template exactly.
Solution: Use the closest template and note the deviation. If this happens repeatedly for the same type of content, propose a new template format.
