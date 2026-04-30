# 200k Prompt Engineering

> The engineering skill behind every 200k-class output. Three layers: prompt, context, workflow.

## What It Does

Teaches agents how to write prompts, design context windows, and build agentic workflows at production quality. This is the third pillar of the 200k system — after blueprint (what to build) and pipeline (how to create skills), this covers HOW to engineer the instructions that control agents.

## Supported Clients

- Claude Code (primary)
- Any AI client that produces agent instructions, SKILL.md files, or workflows

## Prerequisites

- Familiarity with the 200k-pipeline (skill-forge + 200k-blueprint)
- For Layer 3: Archon installed (optional, for workflow execution)

## Installation

```bash
# As part of 200k-pipeline (recommended)
bash knowledge/meta-skills/200k-pipeline/install.sh

# Standalone
cp -r 200k-prompt-engineering/ ~/.claude/skills/200k-prompt-engineering/
```

## Trigger Conditions

- Writing a system prompt, SKILL.md, CLAUDE.md, or AGENTS.md
- Designing an agent's context window or boot sequence
- Creating an Archon workflow or multi-step agent process
- Reviewing/improving any agent instruction for quality
- Optimizing trigger descriptions for skills
- Debugging why an agent produces inconsistent output

## Expected Outcome

Every prompt, context design, and workflow produced through this skill:
- Uses imperative form, tables over prose, front-loaded value
- Has anti-patterns stated for every major section
- Follows the L0-L3 memory tier model for context loading
- Uses the right node type for each workflow step
- Passes the prompt quality gate (7 checks)

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Main skill — 3 layers + decision tree + integration map |
| `README.md` | This file |
| `metadata.json` | Package metadata |
| `templates/system-prompt.md` | Template for CLAUDE.md / system prompts |
| `templates/context-design.md` | Template for context window architecture |
| `templates/workflow-design.md` | Template for Archon-style DAG workflows |
| `references/prompt-anti-patterns.md` | 22 anti-patterns across all 3 layers |

## Troubleshooting

**Issue:** Agent output is correct but inconsistent across runs.
**Solution:** Apply Layer 1 rules — add Fixed/Variable zones, decision tables, and output templates. Consistency comes from structure, not intelligence.

**Issue:** Agent forgets context mid-session.
**Solution:** Apply Layer 2 — design a staged boot sequence. Check if critical facts are in L0-L1 (always loaded) vs L3 (might be lost after compaction).

**Issue:** Multi-step task fails halfway through.
**Solution:** Apply Layer 3 — split into DAG nodes with `fresh_context: true`. Add verification nodes between build steps.
