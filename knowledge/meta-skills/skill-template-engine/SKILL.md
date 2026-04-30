---
name: skill-template-engine
description: |
  Compiles a SkillTemplate definition and a user Brief into a fully-structured
  prompt architecture ready for Claude. Bakes in genre conventions, structural
  scaffolding, tone calibration, and constraint layers so the generation model
  receives an expert-level prompt without requiring the user to know how to prompt.
  Use when: building the prompt for any skill-based generation, compiling a new
  skill definition, or validating that a Brief satisfies a skill's required fields.
  Trigger on: "compile skill template", "build prompt architecture", "run template
  engine", "skill-template-engine", or any request that starts with a SkillTemplate
  + Brief and must produce a generation-ready prompt.
author: Robin Westerlund
version: 1.0.0
---

# Skill Template Engine

> Turns a SkillTemplate definition and a user Brief into an expert-level prompt architecture that Claude can execute directly, with no prompting skill required from the user.

## Purpose

Without a compilation layer, every generation starts from a blank prompt. Writers who don't understand prompt architecture get shallow outputs — generic structure, no genre conventions, no constraint enforcement. The skill-template-engine is the translator between "what the user wants" (the Brief) and "how to ask Claude to produce it" (the prompt architecture). It is the core of the entire product: every other pipeline component depends on what this step produces.

## Audience

- Primary: AI agents implementing the generation pipeline for a writing tool
- Secondary: Developers adding new SkillTemplates to the catalog

## When to Use

- A user has submitted a Brief for a skill and generation is about to start
- A new SkillTemplate definition needs to be validated before being added to the catalog
- The generation pipeline needs a structured prompt object for its Claude API call
- A Brief needs to be checked for completeness before paying for generation

## When Not to Use

| If the situation is... | Use instead | Why |
|------------------------|-------------|-----|
| You need to fetch or verify sources for the prompt | `source-grounding` | Source lookup is a separate concern; compile the prompt first, inject sources after |
| You need to orchestrate the full generation sequence | `generation-pipeline` | The engine produces inputs; the pipeline orchestrates the sequence |
| You are authoring a new SkillTemplate from scratch | `skill-forge` | Template authoring is a design task, not a compilation task |

## Required Context

Gather or confirm:

- A valid `SkillTemplate` object (loaded from `skills-catalog/`) with non-empty `brief_schema`, `prompt_architecture`, and `quality_markers`
- A `Brief` object submitted by the user that covers all required fields in `brief_schema`
- The target word count or length tier (drives constraint injection; falls back to skill default if not supplied)

## Process

### Step 1: Load and Validate the SkillTemplate

**Action:** Load the SkillTemplate by slug and verify structural integrity.
**Inputs:** Skill slug (e.g., `"reaction-piece"`), path to `skills-catalog/`
**Outputs:** Validated `SkillTemplate` object or a `ValidationError` listing missing fields

Read the skill file from `skills-catalog/[slug].ts`. Confirm all three required keys exist and are non-empty: `brief_schema`, `prompt_architecture`, `quality_markers`. If any are missing, throw a `ValidationError` immediately — never proceed with a partial template.

| If... | Then... | Because... |
|-------|---------|------------|
| `brief_schema` is missing | Throw `ValidationError: missing brief_schema` | Brief validation in Step 2 is impossible |
| `prompt_architecture` is empty | Throw `ValidationError: empty prompt_architecture` | Nothing to compile |
| `quality_markers` is absent | Log a warning, continue | Quality markers are used downstream; generation can proceed without them |

**Do NOT:** Silently substitute defaults for missing template fields. Fail loudly — a corrupt template produces subtly bad output that is hard to diagnose.

### Step 2: Validate the Brief

**Action:** Check the Brief against the skill's `brief_schema`, flag missing or thin fields.
**Inputs:** User-submitted `Brief` (JSON), `brief_schema` from the validated SkillTemplate
**Outputs:** `BriefValidationResult` — `valid: boolean`, `errors: string[]`, `warnings: string[]`

Iterate over every field declared in `brief_schema`. For each required field, confirm it exists in the Brief and is non-empty. For text fields, check minimum length (use schema-declared minimum or default to 10 characters). Produce warnings (not errors) for fields that are present but suspiciously short (< 20 characters for topic fields).

| If... | Then... | Because... |
|-------|---------|------------|
| Required field missing | Add to `errors` array | Generation will produce off-target output |
| Field present but < 10 chars | Add to `errors` array | Unusable as context |
| Field present but thin (10–20 chars) | Add to `warnings` array | May produce generic output; warn but allow |
| All required fields valid | Return `{ valid: true, errors: [], warnings: [...] }` | Proceed to Step 3 |

**Do NOT:** Auto-fill missing required fields with placeholders. Return the validation result to the caller — the decision to abort or continue belongs upstream.

### Step 3: Compile the Prompt Architecture

**Action:** Merge the validated Brief into the SkillTemplate's `prompt_architecture` to produce the final structured prompt.
**Inputs:** Validated `SkillTemplate`, validated `Brief`, optional `sourceContext` (from `source-grounding`)
**Outputs:** `CompiledPrompt` — a structured object with `system`, `user`, and `assistant` prompt layers

The `prompt_architecture` is a layered structure (see `references/prompt-architecture.md` for the full layer model). Walk each layer in order:

1. **Genre layer** — inject the skill's genre conventions as the system prompt foundation. These are fixed per skill; do not modify them based on the Brief.
2. **Scaffolding layer** — inject the required structural sections. Replace `{{word_count}}` and `{{length_tier}}` with values from the Brief or skill defaults.
3. **Brief layer** — substitute every `{{field_name}}` placeholder in the architecture with the corresponding value from the Brief.
4. **Constraint layer** — append the skill's constraint list. Merge with any user-supplied constraints from the Brief (deduplicate; skill constraints take precedence on conflict).
5. **Source layer** — if `sourceContext` is provided, inject formatted source excerpts into the designated injection point in the user prompt. If no `sourceContext`, inject a generation-without-sources notice.
6. **Tone layer** — apply the skill's tone directives. If the Brief includes a `tone_override`, validate it against the skill's `allowed_tone_overrides` list before applying.

| If... | Then... | Because... |
|-------|---------|------------|
| `sourceContext` is null | Inject `[SOURCES: none — generate without citations]` | Generation must proceed; the pipeline decides whether this is acceptable |
| `tone_override` not in `allowed_tone_overrides` | Discard the override, log a warning | Unapproved tones can break genre conventions |
| `{{field_name}}` placeholder found but field absent in Brief | Replace with `[FIELD_MISSING: field_name]` | Makes the gap visible in the output rather than silently producing wrong content |

**Do NOT:** Flatten all layers into a single string at this step. Return the structured `CompiledPrompt` object — the generation pipeline assembles the final API call.

### Step 4: Attach Quality Markers

**Action:** Attach the skill's `quality_markers` to the `CompiledPrompt` for downstream assertion.
**Inputs:** `CompiledPrompt` from Step 3, `quality_markers` from the SkillTemplate
**Outputs:** `CompiledPrompt` with `qualityMarkers` field populated

Copy `quality_markers` directly into the `CompiledPrompt.qualityMarkers` field. Do not modify them. The `skill-quality-assertion` skill consumes this field after generation — this step just ensures the markers travel with the compiled prompt.

**Do NOT:** Run quality checks here. Asserting quality before generation happens is meaningless. Compile first, assert after.

## Output

Default output:

- `CompiledPrompt` object with `system`, `user`, `assistant` prompt layers, `qualityMarkers`, and `metadata` (skill slug, brief hash, timestamp)
- `BriefValidationResult` (always returned alongside the prompt; the caller decides whether warnings require user action)
- `ValidationError` (thrown instead of a `CompiledPrompt` when Step 1 or Step 2 produce blocking errors)

## Example

See [examples/reaction-piece.md](examples/reaction-piece.md) for a full walkthrough compiling a `reaction-piece` skill with a real Brief.

**Quick illustration (condensed):**

```typescript
// Input
const template = loadSkillTemplate("reaction-piece");
const brief = {
  topic: "OpenAI's o3 reasoning model announcement",
  angle: "skeptical — the benchmarks don't reflect real-world use",
  target_outlet: "tech-critical newsletter",
  word_count: 900
};

// Step 1: validate template ✓
// Step 2: validate brief ✓ (all required fields present)
// Step 3: compile
const compiled = compile(template, brief, sourceContext);
// compiled.system → genre conventions + scaffolding + constraints
// compiled.user   → brief values injected + source excerpts
// compiled.assistant → (empty, set by generation pipeline)

// Step 4: attach quality markers
compiled.qualityMarkers = template.quality_markers;
// → { min_words: 800, max_words: 1000, required_sections: [...], ... }
```

## Works Well With

- `source-grounding` — provides the `sourceContext` injected in Step 3's source layer
- `generation-pipeline` — consumes the `CompiledPrompt` and drives the Claude API calls
- `skill-quality-assertion` — reads `qualityMarkers` from the `CompiledPrompt` after generation

## Notes

- The engine is stateless — the same template + brief always produces the same compiled prompt (deterministic)
- Brief field values are injected verbatim; sanitize user input before passing to this function
- The full layer model and placeholder syntax are documented in `references/prompt-architecture.md`
- Skill constraints always win on conflict with user overrides — this is by design; the skill's genre integrity is non-negotiable
