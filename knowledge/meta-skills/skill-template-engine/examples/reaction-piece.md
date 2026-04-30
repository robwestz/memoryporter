# Example: Compiling the reaction-piece Skill

> A complete walkthrough of all four engine steps for the `reaction-piece` skill.

---

## Inputs

**SkillTemplate slug:** `reaction-piece`

**Brief submitted by user:**
```json
{
  "topic": "OpenAI's o3 reasoning model — benchmark results released 2024-12",
  "angle": "skeptical — benchmark results do not predict real-world writing quality improvements",
  "target_outlet": "tech-critical newsletter (Platformer-style audience)",
  "word_count": 900
}
```

**sourceContext:** (injected by `source-grounding` before calling the engine)
```json
[
  {
    "url": "https://openai.com/blog/o3",
    "title": "Introducing o3",
    "excerpt": "o3 achieves 87.5% on ARC-AGI, surpassing human performance...",
    "verified": true
  },
  {
    "url": "https://arxiv.org/abs/2312.11805",
    "title": "ARC-AGI benchmark: limitations in measuring general reasoning",
    "excerpt": "ARC-AGI tests pattern matching under constrained conditions, not generalized cognition...",
    "verified": true
  }
]
```

---

## Step 1: Load and Validate SkillTemplate

Load `skills-catalog/reaction-piece.ts`. Check root-level keys:

| Key | Present? | Non-empty? |
|-----|----------|-----------|
| `brief_schema` | ✓ | ✓ |
| `prompt_architecture` | ✓ | ✓ |
| `quality_markers` | ✓ | ✓ |

Result: **Validation passed.** Proceed to Step 2.

---

## Step 2: Validate the Brief

Brief schema declares required fields: `topic`, `angle`, `target_outlet`.

| Field | Present? | Length | Result |
|-------|----------|--------|--------|
| `topic` | ✓ | 57 chars | ✓ valid |
| `angle` | ✓ | 79 chars | ✓ valid |
| `target_outlet` | ✓ | 46 chars | ✓ valid |
| `word_count` | ✓ (optional) | n/a | ✓ accepted |

`BriefValidationResult`:
```json
{ "valid": true, "errors": [], "warnings": [] }
```

Proceed to Step 3.

---

## Step 3: Compile the Prompt Architecture

### Layer 1 — Genre (→ `system`)

```
You are an expert tech commentator writing for sophisticated readers who follow
platform and AI industry coverage closely. This genre — the reaction piece — is
a rapid-response opinion format: take a specific event or announcement, establish
a clear stance immediately, and sustain that argument through the whole piece with
evidence. The reader already knows the basic facts; do not recap them at length.
Your value is the interpretation and the critique. Write at the level of Platformer,
Casey Newton, or Ben Thompson: direct, precise, willing to commit to a position.
```

### Layer 2 — Scaffolding (→ `system`, appended)

```
Structure this piece as follows:
- Hook: 1-2 sentences that establish your stance immediately (no throat-clearing)
- Core argument: 3 paragraphs developing the central claim
- Counter-consideration: 1 paragraph steelmanning the opposing view, then rebutting it
- Conclusion: 1 paragraph — where this leaves us, what to watch next
Total length: approximately 900 words. Medium-length piece.
```

### Layer 3 — Brief (→ `user`)

(user_template with placeholders substituted)

```
Write a 900-word reaction piece on the following topic.

Topic: OpenAI's o3 reasoning model — benchmark results released 2024-12
Angle: skeptical — benchmark results do not predict real-world writing quality improvements
Target outlet: tech-critical newsletter (Platformer-style audience)

[SOURCES block injected in Layer 5]

Follow the structure and constraints in the system prompt exactly.
```

### Layer 4 — Constraints (→ `system`, appended)

```
Hard rules:
- Do not open with "In [year]..." or any date-based opener
- Do not exceed 1000 words or fall below 800 words
- Cite every factual claim about model performance with a source from the provided list
- Do not use hedging language: "perhaps", "it seems", "it could be argued"
- The stance must be established in the first 2 sentences — no delayed thesis
```

### Layer 5 — Source (→ `user`, appended to user_template)

```
[SOURCES]
1. Introducing o3 — https://openai.com/blog/o3
   Excerpt: "o3 achieves 87.5% on ARC-AGI, surpassing human performance..."

2. ARC-AGI benchmark: limitations in measuring general reasoning — https://arxiv.org/abs/2312.11805
   Excerpt: "ARC-AGI tests pattern matching under constrained conditions, not generalized cognition..."
[/SOURCES]
```

### Layer 6 — Tone (→ `system`, appended)

```
Voice and register: confident, direct, informed-professional. Sentences vary — short punches
for claims, longer analytical sentences for context. Vocabulary is accessible but precise:
use technical terms (benchmark, reasoning, ARC-AGI) without defining them for the reader.
Avoid academic hedge phrases. Commit to every sentence.
```

---

## Final CompiledPrompt

```typescript
const compiled: CompiledPrompt = {
  system: "[Layer 1 genre] + [Layer 2 scaffolding] + [Layer 4 constraints] + [Layer 6 tone]",
  user: "[Layer 3 brief with substitutions] + [Layer 5 sources]",
  assistant: "",  // prefill set by generation pipeline
  qualityMarkers: {
    min_words: 800,
    max_words: 1000,
    required_sections: ["hook", "core-argument", "counter-consideration", "conclusion"],
    citation_required: true,
    custom_checks: ["Stance visible in first 2 sentences", "No hedging language"]
  },
  metadata: {
    skillSlug: "reaction-piece",
    briefHash: "sha256:a3f7...",
    compiledAt: "2026-04-14T09:00:00Z"
  }
};
```

---

## What Goes Wrong Without This Step

If you pass the Brief directly to Claude without compilation:

- No genre conventions → output structure varies per generation
- No constraints → hedge phrases appear, thesis buried in paragraph 3
- No scaffolding → section count and order are unpredictable
- No source injection format → Claude may hallucinate citations or ignore provided sources
- No quality markers → downstream assertion has no schema to check against
