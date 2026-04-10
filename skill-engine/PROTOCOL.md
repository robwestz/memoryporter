# Skill Resolution Protocol

This is the spine of the skill-bundle system. It defines a 5-stage pipeline that guarantees every task gets a properly evaluated, adapted skill before execution begins.

**No execution without evaluation. No evaluation without intent. No intent without understanding.**

## The Pipeline

```
INTAKE ──▸ RESOLVE ──▸ EVAL ──▸ ADAPT ──▸ VERIFY
  │           ▲          │                   │
  │           │          │ fail              │
  │           └──────────┘                   │
  │                                          │
  └────────────── post-verify ───────────────┘
```

## Stage Overview

| Stage | File | Input | Output | Gate |
|-------|------|-------|--------|------|
| 1. Intake | `intake.md` | Raw task + project context | Intent Document (YAML) | Intent must have goal, anti-goals, success criteria |
| 2. Resolve | `resolver.md` | Intent Document | Candidate Skill + Resolution Decision | Candidate must exist (found, modified, or created) |
| 3. Eval | `eval-engine.md` | Candidate + Intent | Eval Verdict + Improvement Map | Coverage score >= 70 to proceed |
| 4. Adapt | `adapter.md` | Evaluated Skill + Improvement Map | Project-local skill in `.skills/` | Adapted skill passes structural validation |
| 5. Verify | (built into adapter.md) | Execution output | Pass/fail against success criteria | Output satisfies Intent Document criteria |

## Execution Rules

### Sequential gates
Each stage MUST complete and pass its gate before the next begins. There are no shortcuts.

### Eval loop
If eval returns coverage < 70, the pipeline loops back to RESOLVE with the improvement map as additional input. The resolver uses the improvement map to either:
- Select a different candidate
- Modify the current candidate with specific fixes
- Create a new skill informed by the failure analysis

Maximum 2 eval loops. If coverage still < 70 after 2 iterations, stop and report: what was attempted, why it failed, what the agent believes would work.

### Adaptation is always local
Original skills are never modified. The adapter copies the skill to `{project}/.skills/{name}.md` and modifies the copy. This preserves the corpus while allowing project-specific tuning.

### Post-verification feedback
After execution, verify output against the Intent Document's success criteria. If verification fails, the failure is logged as a discovery for the next run — it does NOT trigger automatic re-execution.

## How to Start

1. Read this file (you're doing it now)
2. Read `intake.md`
3. Follow the pipeline stage by stage

## Integration Points

This system uses but does not replace:

| Asset | Location | How it's used |
|-------|----------|--------------|
| Short skills corpus | `explicit-skills.md`, `implicit-skills.md` | Searched by resolver |
| Skill spec format | `skill-spec.md` | Format for new short skills |
| Loader ranking model | Absorbed into `resolver.md` | Scoring algorithm |
| Skill creator | `../skill-creator/` | Referenced for full skill authoring |
| Knowledge skills | `../knowledge/skills/` | Deep implementation patterns |
| Gamechangers | `../knowledge/gamechangers/` | Architectural reference |

## When NOT to Use This Pipeline

- **Trivial tasks** that match a short skill exactly (priority >= 9, exact trigger match) — use the skill directly
- **Pure exploration** with no deliverable — use explore-agent instead
- **Emergency debugging** — use the `stuck` or `debug` skill directly

The pipeline is for tasks where the right approach isn't obvious and getting it wrong costs more than spending 2 minutes on resolution.
