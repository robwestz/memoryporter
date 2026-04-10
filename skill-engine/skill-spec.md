# Short Skill Spec

Every short skill should follow this exact format.

```yaml
---
name: [string]
kind: [explicit | implicit]
triggers: [array of strings]
priority: [integer 1-10]
source_evidence: [array of strings]
---
Use when [single sentence].

Rules:
- [imperative rule 1]
- [imperative rule 2]
- [imperative rule 3]
```

## Authoring Rules

1. `name` must be stable and lowercase kebab-case.
2. `kind` is for provenance, not for ranking.
3. `triggers` should be short activation phrases, not explanations.
4. `priority` ranks selection pressure. It should not be used as a replacement for safety policy.
5. `source_evidence` should point to the surface that justifies the skill.
6. The `Use when...` sentence must fit in one line when possible.
7. Rules must be imperative and testable.

## Trigger Guidance

Good triggers:

- `plan`
- `review`
- `verify`
- `remote agent`
- `memory`

Bad triggers:

- `when the user maybe wants something complicated with several parts`
- `do the right thing`

## Rule Guidance

Good rules:

- Produce a short executable plan before code.
- Use the narrowest tool that solves the task.
- Summarize failed attempts before changing strategy.

Bad rules:

- Be smart.
- Think carefully.
- Try to help.

## Expansion Agent Contract

A later agent that expands a short skill into a full skill should preserve:

- `name`
- `kind`
- `triggers`
- `priority`
- `source_evidence`
- the intent of the `Use when...` sentence

The expansion agent may add:

- examples
- anti-patterns
- validation
- escalation rules
- file and tool references

