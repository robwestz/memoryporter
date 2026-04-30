# Prompt Architecture Layer Model

> **When to read this:** Before implementing `compiler.ts` or when a `prompt_architecture` field in a SkillTemplate does not produce the expected compiled prompt.

---

## Overview

A `CompiledPrompt` is a three-layer object that maps directly to the Claude API's message format:

```typescript
interface CompiledPrompt {
  system: string;        // Genre conventions + scaffolding + constraints
  user: string;          // Brief values + source excerpts
  assistant: string;     // Empty at compile time; prefill set by generation pipeline
  qualityMarkers: QualityMarkers;
  metadata: {
    skillSlug: string;
    briefHash: string;   // SHA-256 of the serialized Brief — for cache keying
    compiledAt: string;  // ISO timestamp
  };
}
```

The compilation pipeline fills these layers in a fixed order.

---

## Layer Execution Order

| # | Layer | Written to | What it adds |
|---|-------|-----------|--------------|
| 1 | Genre | `system` | Fixed genre conventions — voice, register, structural norms for this content type |
| 2 | Scaffolding | `system` (appended) | Required sections and their order; word count guidance |
| 3 | Brief | `user` | User-supplied values substituted into `{{placeholder}}` positions |
| 4 | Constraint | `system` (appended) | Hard rules — what the output must never do |
| 5 | Source | `user` (appended) | Verified source excerpts, or a no-sources notice |
| 6 | Tone | `system` (appended) | Voice and register modifiers |

**Rule:** Layers are executed in this order without exception. Never merge layers 1-4 into a single template string — the structure enables per-layer testing and overrides.

---

## Placeholder Syntax

Use double-brace syntax throughout `prompt_architecture` templates:

```
{{field_name}}         → replaced with Brief[field_name]
{{word_count}}         → replaced with Brief.word_count or skill default
{{sources}}            → replaced with formatted source excerpts
{{length_tier}}        → replaced with derived tier (short/medium/long)
```

**Escaping:** If a literal `{{` or `}}` is needed in output, write `\{{` and `\}}`.

**Missing placeholder behavior:**
- Required field missing from Brief → replaced with `[FIELD_MISSING: field_name]` (never silently empty)
- Optional field missing → replaced with empty string

---

## SkillTemplate `prompt_architecture` Schema

```typescript
interface PromptArchitecture {
  genre: string;         // Layer 1: genre conventions block (verbatim system text)
  scaffolding: string;   // Layer 2: structural scaffolding with {{placeholders}}
  constraints: string[]; // Layer 4: array of constraint strings, each injected as a bullet
  tone: string;          // Layer 6: tone directives, may include {{tone_override}} placeholder
  user_template: string; // Layer 3+5: user message template with {{field_name}} and {{sources}}
  allowed_tone_overrides?: string[]; // Whitelist of permitted user tone overrides
}
```

---

## Length Tier Derivation

The `{{length_tier}}` placeholder is derived from `brief.word_count`:

| `word_count` range | `length_tier` |
|--------------------|---------------|
| < 500 | `short` |
| 500–1500 | `medium` |
| > 1500 | `long` |

If `word_count` is absent from the Brief, use the skill's `default_word_count` from `brief_schema`, or fall back to `medium`.

---

## Source Injection Format

When `sourceContext` is provided, format it as:

```
[SOURCES]
1. {{source.title}} — {{source.url}}
   Excerpt: "{{source.excerpt}}"

2. {{source.title}} — {{source.url}}
   Excerpt: "{{source.excerpt}}"
[/SOURCES]
```

Inject this block at the `{{sources}}` placeholder in `user_template`. The genre layer should already instruct the model on how to use these sources (inline citations vs. reference list) — do not duplicate citation instructions in the source block itself.

---

## Common Architecture Mistakes

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Merging genre + brief into a single layer | Impossible to override tone without recompiling everything | Keep layers separate; assemble in Step 3 |
| Hardcoding word counts in the genre layer | Recompiling breaks other Brief configurations | Use `{{word_count}}` placeholder |
| Putting source instructions in the source layer | Duplicates instructions already in genre conventions | Source layer = data only; instructions belong in genre |
| Empty `constraints` array | Generation has no hard rules; output drifts | Minimum 3 constraints per skill: one for length, one for structure, one for tone |
