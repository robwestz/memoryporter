# Skill Map — AI Writing Tool (writer-tool)

> Skills to forge before the MVP ships. Extracted from `blueprint-writer-tool.md § 5`.
> P3 skills (skill-authoring, ai-detection-evasion-audit) are post-MVP — not listed here.

---

## MVP Skills to Forge

### P1 — Blocks MVP (forge first, in this order)

| # | Name | What it does | Shape | Status |
|---|------|-------------|-------|--------|
| 1 | `skill-template-engine` | Compiles a `SkillTemplate` definition + user `Brief` into a fully-structured prompt architecture ready for Claude — genre conventions, scaffolding, constraints, and tone all baked in | Full | **FORGED** |
| 2 | `source-grounding` | Fetches real web sources for a given topic via search API, verifies each URL resolves with relevant content, and injects verified source excerpts into the generation context | Standard | **FORGED** |
| 3 | `generation-pipeline` | Orchestrates the multi-pass generation sequence (sources → outline → draft → quality check), wiring `skill-template-engine` and `source-grounding` together with streaming output | Standard | **FORGED** |

**Why this order:** `skill-template-engine` is the foundation — nothing else compiles without it. `source-grounding` must exist before `generation-pipeline` can call it. `generation-pipeline` is the last P1 because it assembles the other two.

---

### P2 — Enhances MVP (forge after Phase 1 is working)

| # | Name | What it does | Shape |
|---|------|-------------|-------|
| 4 | `brief-form-builder` | Renders a dynamic HTML form driven entirely by a skill's `brief_schema` JSON — no per-skill hardcoding in the UI | Minimal |
| 5 | `skill-quality-assertion` | Runs post-generation checks against a skill's `quality_markers` schema: validates structure, word count (±20%), required sections, and citation presence | Minimal |

**Why P2 and not P1:** A brief form can be hardcoded for the first skill to prove the pipeline works. Quality assertions are important before launch but don't block the first working generation.

---

## Existing Skills to Reuse (no forging needed)

| Skill | File | Used for |
|-------|------|---------|
| Token Budget | `knowledge/skills/skill_token_budget.md` | Per-generation cost control inside `generation-pipeline` |
| Streaming Renderer | `knowledge/skills/skill_streaming_renderer.md` | SSE chunk handling in `generation-pipeline` output |
| Session Management | `knowledge/skills/skill_session_management.md` | Document state persistence, resume interrupted generation |
| Build Agentic Loop | `knowledge/skills/skill_build_agentic_loop.md` | Multi-pass loop architecture pattern for `generation-pipeline` |

---

## Forge Order

```
Phase 1 build order:
  1. skill-template-engine   ← P1, Full
  2. source-grounding        ← P1, Standard
  3. generation-pipeline     ← P1, Standard (depends on 1 + 2)

Phase 2 build order:
  4. brief-form-builder      ← P2, Minimal
  5. skill-quality-assertion ← P2, Minimal
```

---

## Shape Reference

| Shape | Files | When |
|-------|-------|------|
| Minimal | SKILL.md + metadata.json | Single-purpose, < 60 lines, no templates needed |
| Standard | SKILL.md + metadata.json + 1–2 references | Multi-step workflow or domain knowledge required |
| Full | SKILL.md + metadata.json + templates/ + references/ + examples/ | Core capability, reused across multiple products, needs worked examples |
