# Skill Template Engine

> Compiles a SkillTemplate definition + user Brief into a generation-ready prompt architecture — the core of any skill-based AI writing pipeline.

## What It Does

The skill-template-engine takes a `SkillTemplate` (loaded from the skills catalog) and a `Brief` (user-provided inputs) and compiles them into a structured `CompiledPrompt` object that Claude can execute. It validates the Brief against the skill's schema, injects genre conventions, structural scaffolding, source context, and constraints, and attaches quality markers for downstream assertion. This is the first step of every generation — nothing downstream runs without a compiled prompt.

## Supported Clients

- Claude Code
- Codex
- Cursor

## Prerequisites

- A TypeScript project using the Next.js App Router (or any TypeScript runtime)
- At least one `SkillTemplate` defined in `skills-catalog/`
- `SKILL.md` loaded into the AI client's context

## Installation

1. Copy [`SKILL.md`](./SKILL.md) into the reusable-instructions location for your AI client.
2. Restart or reload the client so it picks up the skill.
3. Test with a prompt like: `"Compile the reaction-piece skill template with this brief: topic=X, angle=Y"`

For Claude Code, a common install path is:

```bash
mkdir -p ~/.claude/skills/skill-template-engine
cp SKILL.md ~/.claude/skills/skill-template-engine/SKILL.md
```

## Trigger Conditions

- "Compile the skill template for [skill-name]"
- "Run the template engine with this brief"
- "Build the prompt architecture for [skill]"
- "Validate this brief against the [skill] schema"
- "skill-template-engine"

## Expected Outcome

When installed and invoked correctly, the skill should produce:

- A `CompiledPrompt` object with `system`, `user`, and `assistant` prompt layers, each filled with the skill's genre conventions and the user's Brief values
- A `BriefValidationResult` reporting any missing or thin fields — always returned so the caller can decide whether to abort or warn the user
- `qualityMarkers` attached to the compiled prompt, ready for `skill-quality-assertion` to consume after generation

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Core skill definition — the instructions the AI client reads |
| `README.md` | This file — installation, usage, and troubleshooting |
| `metadata.json` | Machine-readable metadata for indexing and discovery |
| `templates/skill-template-definition.md` | Template for authoring new SkillTemplate TypeScript definitions |
| `references/prompt-architecture.md` | Layer model and placeholder syntax for prompt compilation |
| `examples/reaction-piece.md` | Full worked example: compiling the reaction-piece skill |

## Troubleshooting

**Issue: `ValidationError: missing brief_schema` thrown on a skill that has a schema defined**
Solution: Confirm the SkillTemplate export in `skills-catalog/[slug].ts` includes the `brief_schema` key at the root level (not nested inside `prompt_architecture`). The loader checks root-level keys only.

**Issue: Brief validation passes but the compiled prompt contains `[FIELD_MISSING: field_name]` in the output**
Solution: The `brief_schema` declares that field as optional — so validation passes — but the `prompt_architecture` references it. Either mark the field as required in the schema, or remove the placeholder from the architecture. The `[FIELD_MISSING]` marker is intentional: it surfaces mismatches between schema and architecture.

**Issue: Source context is available but sources do not appear in the compiled user prompt**
Solution: Confirm the `prompt_architecture.user` template contains the `{{sources}}` injection point. If that placeholder is absent, the source layer in Step 3 has nowhere to inject — it silently skips.

## Notes for Other Clients

The core behavior to preserve is the four-step sequence: load template → validate brief → compile layers → attach markers. The TypeScript types (`SkillTemplate`, `Brief`, `CompiledPrompt`) are the stable interface — adapt the file loading and module system to your runtime, but preserve the type contracts. In non-TypeScript environments, treat the types as plain JSON schemas.
