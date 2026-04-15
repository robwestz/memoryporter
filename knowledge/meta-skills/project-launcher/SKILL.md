---
name: project-launcher
description: |
  Composes an autonomous-build workspace for a new project outside the
  portable-kit repo. Takes a project concept (or 200k-blueprint output),
  selects relevant skill packages, copies them plus protocols into a
  target directory, and generates a phased execution plan. The resulting
  workspace is self-contained: an agent can walk in, read AGENT.md, and
  build the project end-to-end without needing portable-kit on disk.
  Use when: starting a new autonomous project; bootstrapping a build from
  a blueprint; producing a workspace another LLM or Claude Code session
  will execute; or when an existing project needs to be wrapped in an
  agent-executable harness.
  Trigger on: "launch project", "new project", "bootstrap build", "compose
  workspace", "project-launcher", "start autonomous build", "wrap project
  in harness", "make project agent-executable", "build workspace from
  blueprint", "starta projekt", "nytt projekt", "projektmapp".
author: Robin Westerlund
version: 1.0.0
---

# Project Launcher

> Compose a complete agent-executable workspace for a new project.
> Takes a blueprint; produces a folder any agent can build from.

## What it produces

A target directory outside portable-kit containing:

```
<target>/
├── AGENT.md               — operational manual for the executing agent
├── PROJECT.md             — what to build, goals, anti-goals, success
├── ARCHITECTURE.md        — from 200k-blueprint (stack, structure, gates)
├── README.md              — human entry point
├── phases/
│   ├── phase-01-<name>.md
│   ├── phase-02-<name>.md
│   └── ...
├── skills/                — copied relevant skill packages
├── protocols/             — copies of small-model-premium + agent-orchestration
├── verify/                — per-phase verification scripts
├── docs/showcases/        — where showcase-presenter writes
└── .archon/workflows/     — optional autonomous run configs
```

## Six-step process

```
INTAKE → BLUEPRINT → SKILL SELECT → COMPOSE → PHASE PLAN → HANDOFF
```

| Step | Input | Output | Reference |
|------|-------|--------|-----------|
| 1. INTAKE | Project name + concept + target path | `.tmp/intake.yaml` with goals/anti-goals | `references/anti-patterns.md` |
| 2. BLUEPRINT | Concept | `ARCHITECTURE.md` in target | Invoke `/200k-blueprint` if no blueprint provided |
| 3. SKILL SELECT | Project type + architecture | List of skills to copy | `references/skill-selection-rubric.md` |
| 4. COMPOSE | Skill list + target path | Populated target directory | `scripts/compose-workspace.sh` |
| 5. PHASE PLAN | Architecture + skills | `phases/phase-NN-*.md` files with plans | `references/phasing-patterns.md` |
| 6. HANDOFF | Workspace | Startup prompt + README instructions | `templates/AGENT.md.tmpl` |

## Step 1 — INTAKE

Capture the project in structured form before deciding anything:

| Field | Required | Example |
|-------|----------|---------|
| `name` | yes | `writer-tool` |
| `target_path` | yes | `C:/Users/robin/projects/writer-tool` |
| `concept` | yes | one-paragraph description |
| `project_type` | yes | one of the rubric categories |
| `stack_hint` | no | "Next.js + Postgres" or similar |
| `blueprint_source` | no | path to existing blueprint.md, or "forge new" |
| `autonomous_level` | yes | `assisted` / `supervised` / `autonomous` |
| `time_budget` | no | "8 hours" / "1 week" |

Ask AT MOST three questions to get these. If the user's message already has enough, skip the questions.

**Anti-pattern:** asking 10 questions before starting. Three is the ceiling.

## Step 2 — BLUEPRINT

| Condition | Action |
|-----------|--------|
| User provided existing blueprint file | Copy to `<target>/ARCHITECTURE.md` |
| No blueprint | Invoke `/200k-blueprint` with the concept, save output to `<target>/ARCHITECTURE.md` |

The blueprint determines Step 3. Skip only if user explicitly provides a finished architecture doc.

## Step 3 — SKILL SELECT

Map project type to skill set. See `references/skill-selection-rubric.md` for the full rubric. Produce a list in `.tmp/selected-skills.txt`.

Before compose, show the user the list and get approval — wrong skill list = wasted workspace.

## Step 4 — COMPOSE

Run `scripts/compose-workspace.sh`:

```bash
bash scripts/compose-workspace.sh \
  --target "$TARGET_PATH" \
  --name "$PROJECT_NAME" \
  --skills "skill1,skill2,skill3" \
  --kit "C:/Users/robin/Downloads/portable-kit"
```

This creates the directory, copies skills, copies protocols, and fills in templates. See the script for the exact behavior.

## Step 5 — PHASE PLAN

Use `references/phasing-patterns.md` to shape phases. Defaults by `autonomous_level`:

| Level | Phases | Gate style |
|-------|--------|-----------|
| `assisted` | 3-5 fine-grained | Human approval between phases |
| `supervised` | 3-5 fine-grained | Agent runs phases, reports at each join |
| `autonomous` | 2-3 wide phases | Agent runs end-to-end, verify at end |

Each phase gets a file in `<target>/phases/phase-NN-<name>.md` using `templates/phase-template.md`. Fill all `[VARIABLE]` slots with concrete values from the architecture.

## Step 6 — HANDOFF

Deliver to the user:

1. A one-paragraph summary of what was composed
2. The exact command to start the agent session (startup prompt)
3. The path to `AGENT.md` as the entry point
4. Any follow-up decisions they must make before running

## Decision tables

### Skill copy vs reference

| Situation | Choice | Why |
|-----------|--------|-----|
| Skill might be updated while project runs | Copy (snapshot) | Project stays reproducible |
| Skill changes frequently, project is short | Reference (symlink if possible) | Stay current |
| Cross-platform delivery expected | Copy | Symlinks break on Windows/Git |

**Default: copy.** Only reference when user explicitly opts in.

### Protocol handling

| Protocol | Always copy | Reason |
|----------|------------|--------|
| `small-model-premium.md` | yes | Quality gate every agent uses |
| `agent-orchestration.md` | yes | Required for parallel/multi-agent phases |
| `architecture-audit.md` | if project is production-facing | Skip for internal tools |

### When to add Archon

| Criterion | Add `.archon/` |
|-----------|---------------|
| `autonomous_level` = `autonomous` | yes |
| Project has ≥3 long-running parallel tasks | yes |
| One-shot build, single agent | no |

## Anti-patterns

See `references/anti-patterns.md` for the full list. Highlights:

| Don't | Why |
|-------|-----|
| Skip Step 3 approval and dump 20 skills into the target | Bloats workspace, dilutes agent focus |
| Invoke `/200k-blueprint` when the user already provided one | Wastes tokens, risks divergent architecture |
| Create more than 5 phases for an `autonomous` project | Agent loses thread between phases |
| Forget to include `showcase-presenter` in selected skills | No honest audit at end |
| Include skills whose triggers overlap (e.g., seo-article-audit + market-intelligence for a pure build) | False activation on keywords |

## Integration

| Skill | Role |
|-------|------|
| `200k-blueprint` | Invoked in Step 2 when no architecture exists |
| `session-launcher` | Sibling — session-launcher compiles a session startup prompt, project-launcher composes an entire workspace |
| `showcase-presenter` | Included in almost every selected skill set; used for end-phase audit |
| `skill-forge` | If project needs NEW skills, this skill is added so the executing agent can forge them in-flight |
| `portable-kit-prompt-compiler` | Can be used by external LLMs to brief Claude Code on running the workspace |

## Files

| File | Role |
|------|------|
| `SKILL.md` | This file |
| `README.md` | Human-facing intro |
| `metadata.json` | Package manifest |
| `templates/AGENT.md.tmpl` | Agent operational manual |
| `templates/PROJECT.md.tmpl` | Project spec |
| `templates/ARCHITECTURE.md.tmpl` | Fallback when blueprint skipped |
| `templates/phase-template.md` | Per-phase plan |
| `templates/verify-template.sh` | Verification stub |
| `templates/RUN.md.tmpl` | Autonomous run entry |
| `references/skill-selection-rubric.md` | Project type → skill set |
| `references/phasing-patterns.md` | How to structure phases |
| `references/anti-patterns.md` | Failure modes |
| `scripts/compose-workspace.sh` | Populates the target directory |

## Verification

Before handoff, check:

- [ ] `<target>/AGENT.md` exists and has no `[VARIABLE]` left
- [ ] `<target>/PROJECT.md` has filled goals/anti-goals/success
- [ ] `<target>/ARCHITECTURE.md` exists (either copied or from blueprint)
- [ ] `<target>/skills/` contains each selected skill as a directory
- [ ] `<target>/protocols/small-model-premium.md` exists
- [ ] `<target>/phases/` has at least one phase file
- [ ] `<target>/README.md` points a human to `AGENT.md` as entry
- [ ] Startup prompt delivered to user works as copy-paste
