# Project Launcher

Composes an autonomous-build workspace for a new project outside portable-kit. Takes a project concept, selects relevant skills, copies them plus protocols into a target directory, and generates a phased execution plan.

## When to use

| Situation | Use this skill |
|-----------|---------------|
| Starting a new autonomous project | yes |
| Bootstrapping a build from a blueprint | yes |
| Producing a workspace another LLM or Claude Code session will execute | yes |
| Adapting portable-kit for a project that lives in its own folder | yes |
| Rescuing an existing stuck project | no — use `buildr-rescue` |
| Creating a new skill package | no — use `skill-forge` / `200k-pipeline` |
| Launching a product (marketing) | no — use `launch-package` |
| Starting a new Claude Code session | no — use `session-launcher` |

## Siblings

| Skill | Launches | Output |
|-------|----------|--------|
| `session-launcher` | a session | a startup prompt for Claude Code |
| `project-launcher` | a project | a full workspace directory |
| `launch-package` | a product | marketing materials |
| `200k-pipeline` | a skill package | a new skill in the catalog |

## Process (6 steps)

1. **INTAKE** — capture name, target path, concept, type, autonomy level
2. **BLUEPRINT** — copy existing or invoke `/200k-blueprint`
3. **SKILL SELECT** — rubric-driven, user-approved
4. **COMPOSE** — run `scripts/compose-workspace.sh`
5. **PHASE PLAN** — generate `phases/phase-NN-*.md` files
6. **HANDOFF** — deliver startup prompt + entry point

## Output

```
<target>/
├── AGENT.md              — operational manual
├── PROJECT.md            — goals, anti-goals, success
├── ARCHITECTURE.md       — from blueprint
├── README.md             — human entry
├── phases/               — phase-NN-*.md
├── skills/               — copied skill packages
├── protocols/            — small-model-premium, agent-orchestration
├── verify/               — per-phase verify scripts
├── docs/                 — showcases, sessions, discoveries
└── .archon/              — (optional) autonomous run configs
```

## Example invocation

User: *"Launch a new project called 'writer-tool' at C:/Users/robin/projects/writer-tool using the blueprint from docs/night-projects/a/blueprint-writer-tool.md. It's an AI writing tool for content pros. Supervised autonomy, about 2 weeks budget."*

Claude Code:
1. Reads blueprint
2. Identifies project type (full-stack web app)
3. Proposes skill set from rubric
4. Gets user approval
5. Runs compose-workspace.sh
6. Generates 4 phase files
7. Hands off with startup prompt pointing at AGENT.md

User then opens a new session in the target folder and pastes the startup prompt.

## Files

| File | Role |
|------|------|
| `SKILL.md` | Authoritative spec |
| `templates/` | AGENT.md, PROJECT.md, ARCHITECTURE.md, phase, verify, RUN.md |
| `references/skill-selection-rubric.md` | Project type → skill set |
| `references/phasing-patterns.md` | How to structure phases |
| `references/anti-patterns.md` | Failure modes |
| `scripts/compose-workspace.sh` | Populates target directory |
