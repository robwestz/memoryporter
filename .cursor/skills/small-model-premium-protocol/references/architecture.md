# Skill architecture — `small-model-premium-protocol`

## Purpose

Behavioral overlay: no runtime code. The agent runs a **phase machine** before replying.

## Flow

```text
User request
  → Phase 0: goal + constraints
  → Phase 1: verifiable steps
  → Phase 2: main artifact
  → Phase 3: adversarial review → revise 2
  → User sees: Phase 2 + Phase 4 Delta summary
```

## Dependencies

- Optional human doc: `templates/small-model-premium-protocol.md`

## Pairing

Use with **`project-agent-baseline`** so verify commands come from `AGENTS.md`.
