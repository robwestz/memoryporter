# Skill Bundle — Skill Resolution Engine

A 5-file system that guarantees every task gets a properly evaluated, adapted skill before execution begins.

## The Pipeline

```
INTAKE ──▸ RESOLVE ──▸ EVAL ──▸ ADAPT ──▸ VERIFY
```

No execution without evaluation. No evaluation without intent. No intent without understanding.

## System Files (the engine)

| # | File | Stage | Purpose |
|---|------|-------|---------|
| 1 | `PROTOCOL.md` | — | Spine: state machine, gates, integration points |
| 2 | `intake.md` | Intake | Raw task → Intent Document (goal, anti-goals, success criteria) |
| 3 | `resolver.md` | Resolve | Intent → Candidate Skill (search, score, decide: use/modify/create) |
| 4 | `eval-engine.md` | Eval | Bidirectional: forward coverage + backward ideal profile → improvement map |
| 5 | `adapter.md` | Adapt + Verify | Copy skill to project, apply improvements, verify output against intent |

## Data Files (the corpus)

| File | What |
|------|------|
| `skill-spec.md` | Format specification for short skills |
| `explicit-skills.md` | 19 capability-derived short skills |
| `implicit-skills.md` | 19 architecture-derived short skills |

## How It Works

1. **Intake** captures what the task IS and ISN'T — producing a testable contract
2. **Resolver** searches 38 short skills + 15 knowledge skills, scores them, picks the best candidate (or creates a new one)
3. **Eval** runs bidirectional analysis: "will this skill work?" AND "what would the perfect skill look like?" — producing an improvement map
4. **Adapter** copies the skill to the project, applies improvements, injects project context
5. **Verify** checks execution output against the original success criteria

The eval loop-back is the key mechanism: if a skill fails eval, the improvement map tells the resolver exactly what to fix, not just "try again."

## Integration

This system is one module in a larger agentic platform:

- **Upstream:** Receives tasks from orchestrators, agents, or users
- **Downstream:** Produces project-local skills that agents execute
- **Corpus feeds:** `explicit-skills.md`, `implicit-skills.md`, `../knowledge/skills/`
- **Skill creation:** Uses `../skill-creator/` for CREATE_NEW decisions
- **Knowledge reference:** Uses `../knowledge/gamechangers/` for deep patterns

## Quick Start

Read `PROTOCOL.md` first. It tells you what to do next.
