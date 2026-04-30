---
name: 200k-pipeline
description: |
  Complete production line for creating marketplace-ready agent skill packages
  and product blueprints. Routes to sub-skills based on intent. Use when:
  "forge a skill", "create a skill package", "200k blueprint", "build a product",
  "new product", "turn this into a skill", "design the architecture for",
  "skill pipeline", "production line", or any request to produce a structured
  skill package or product blueprint from knowledge, code, or a concept.
  This is the master skill — it contains skill-forge, 200k-blueprint, and
  Archon workflow templates for autonomous execution.
author: Robin Westerlund
version: 1.0.0
---

# 200k Pipeline

> Production line for 200k-repo skill packages and product blueprints.
> One skill to rule them all.

## What This Is

This is the master skill that bundles the entire 200k production pipeline:

| Sub-skill | What it does | When to use |
|-----------|-------------|-------------|
| **skill-forge** | Creates marketplace-ready skill packages | "forge a skill", "create a skill for X", "package this as a skill" |
| **200k-blueprint** | Designs product blueprints (arch, stack, gates, skill map) | "build X", "new product", "what would it take to build" |
| **Archon workflows** | Autonomous execution of either pipeline | "run the forge workflow", "blueprint this autonomously" |

## Routing

Determine the user's intent and dispatch:

```
User request
│
├── Wants to CREATE A SKILL from code/domain/workflow?
│   └── Read skill-forge/SKILL.md → follow its 6-step process
│       ANALYZE → CLASSIFY → SCAFFOLD → AUTHOR → VERIFY → PACKAGE
│
├── Wants to DESIGN A PRODUCT from a concept?
│   └── Read 200k-blueprint/SKILL.md → follow its 7-step process
│       INTAKE → RESEARCH → ARCHITECT → QUALITY → MAP SKILLS → BLUEPRINT → VERIFY
│
├── Wants AUTONOMOUS execution via Archon?
│   └── Read workflows/ → pick the right YAML workflow
│       forge-skill.yaml          — generic skill forging
│       blueprint-product.yaml    — product blueprinting
│       create-youtube-skill.yaml — example of task-specific workflow
│
└── Unclear?
    └── Ask: "Do you want to create a skill (tool/capability) or design a product (architecture/blueprint)?"
```

## Quick Start

### Forge a skill (interactive)
```
Read skill-forge/SKILL.md, then execute the 6-step process on:
[user's request]
```

### Blueprint a product (interactive)
```
Read 200k-blueprint/SKILL.md, then execute the 7-step process on:
[user's concept]
```

### Autonomous via Archon
```bash
# From the Archon directory:
ANTHROPIC_API_KEY="" bun run cli workflow run forge-skill \
  --cwd "/path/to/your/project" --no-worktree \
  "Create a [skill-name] skill for [domain]"
```

## Anti-patterns — Do NOT

| Mistake | What happens | Instead |
|---------|-------------|---------|
| Run skill-forge without reading SKILL.md first | Agent improvises structure, skips templates, produces inconsistent output | Always Step 0: read the skill before executing |
| Skip the CLASSIFY step and jump to AUTHOR | Wrong package shape — too many files for a simple skill, or too few for a complex one | Let the decision tree determine the shape |
| Write templates without Fixed/Variable annotations | Next agent using the template has no idea what to keep vs what to replace | Mark every zone explicitly |
| Blueprint a product without the Five Questions | Architecture decisions based on assumptions, not requirements | INTAKE first, always |
| Run Archon workflows with `ANTHROPIC_API_KEY` set | Uses paid API credits instead of Max subscription auth | `ANTHROPIC_API_KEY="" bun run cli ...` |
| Forge skills for standard operations (git, testing) | Wasted effort — these already exist in the skill-engine | Check `skill-engine/explicit-skills.md` first |

## Package Contents

```
200k-pipeline/
├── SKILL.md                          ← You are here (master router)
├── install.sh                        ← Install globally: bash install.sh
│
├── skill-forge/                      ← Sub-skill: create skill packages
│   ├── SKILL.md                      ← 6-step forge process
│   ├── templates/                    ← Fixed/Variable zone templates
│   │   ├── skill-md.md
│   │   ├── readme-md.md
│   │   ├── metadata-json.md
│   │   └── reference-file.md
│   ├── references/                   ← Deep-dive guides
│   │   ├── package-shapes.md         ← Decision tree: Minimal→Production
│   │   ├── quality-gate.md           ← 60-item verification checklist
│   │   ├── skill-anatomy.md          ← Craftsmanship standards
│   │   └── anti-patterns.md          ← 13 common mistakes with fixes
│   └── examples/                     ← Worked examples at 3 levels
│       ├── minimal-example/
│       ├── standard-example/
│       └── full-example/
│
├── 200k-blueprint/                   ← Sub-skill: design product blueprints
│   ├── SKILL.md                      ← 7-step blueprint process
│   ├── templates/
│   │   └── blueprint.md              ← Blueprint output template
│   └── references/
│       └── domain-research.md        ← 30-min research guide
│
└── workflows/                        ← Archon workflow templates
    ├── forge-skill.yaml              ← Generic skill forging (4 nodes)
    ├── blueprint-product.yaml        ← Product blueprinting (6 nodes)
    └── create-youtube-skill.yaml     ← Example: task-specific (7 nodes)
```

## Quality Standard

Every output from this pipeline meets the **200k standard**:

| Criterion | What it means |
|-----------|--------------|
| **Actionable** | Every section helps someone DECIDE or DO something |
| **Executable** | An agent can follow instructions without clarification |
| **Drop-in** | Copy, configure, deploy — no hidden dependencies |
| **Measurable** | Pass/fail quality gate, not subjective "looks good" |
| **Consistent** | Same pipeline, same format, every time |

## Notes

- Default to **skill-forge** when creating capabilities
- Default to **200k-blueprint** when designing products
- When in doubt about package shape: choose Standard, promote later
- Archon workflows require Archon CLI installed separately
- All output is English (marketplace-ready); internal comments can be Swedish
