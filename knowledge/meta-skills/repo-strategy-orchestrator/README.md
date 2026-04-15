# Repo Strategy Orchestrator

Repo-agnostic skill package for systematic repo intake, option generation, and branch planning.

## What it does

The package forces a fixed sequence before any recommendation:

1. Capture the request and repo target
2. Map the repo structure
3. Map hard and soft constraints
4. Map the purpose chain across steps
5. Identify failure modes and safeguards
6. Present multiple paths and wait for the user to choose

After the choice, the same discipline continues through branch scaffolding, evidence planning, and validation planning.

## Included files

- `SKILL.md` — operating instructions for the agent
- `USAGE-PATTERNS.md` — 10 domain remaps that reuse the same systematics
- `references/` — core method, branch catalog, evidence rules, subskill patterns
- `templates/` — reusable markdown templates for core and branch artifacts
- `scripts/` — deterministic workspace scaffolding, audit, and presentation
- `metadata.json` — package manifest (schema_version 2)

## Quick start

```bash
# Stage 1 — core
python scripts/bootstrap_case.py demo-case "understand the repo and present options" \
  --repo /path/or/url --workspace ./workspace
# ... fill the six core artifacts, tag bullets with [OBSERVED]/[DERIVED]/[ASSUMED]/[OPEN-RISK] ...
python scripts/mechanical_audit.py ./workspace/demo-case --strict
# On pass, stage advances to awaiting-user-choice.

# Stage 2 — branch (only after user picks an option)
python scripts/scaffold_branch.py ./workspace/demo-case upgrade-existing --name upgrade-path
python scripts/mechanical_audit.py ./workspace/demo-case --strict

# Stage 3 — hand off to showcase-presenter
python scripts/present_case.py ./workspace/demo-case
```

## Stages

| Stage | Set by | Gate before next |
|-------|--------|------------------|
| `core-in-progress` | `bootstrap_case.py` | strict audit must pass |
| `awaiting-user-choice` | `mechanical_audit.py --strict` on pass | user picks a branch; `scaffold_branch.py` runs |
| `branch-active` | `scaffold_branch.py` | — |

## Why it exists

The package is designed for cases where a repo (or any complex system) is
non-trivial enough that ad hoc advice is not trustworthy. It keeps the
analysis reusable, auditable, and branchable — the audit *enforces*
completeness instead of merely checking file structure.
