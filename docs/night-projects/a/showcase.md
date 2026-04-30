# Project A Showcase — AI Writing Tool (writer-tool)

> Night project session · 2026-04-14 · Both showcase modes applied

---

# MODE 1: Report Showcase

**Verdict: `SHOWCASE-WITH-GAPS`**
P1 deliverables complete with real artifacts; P2 skills and all implementation code pending.

---

## Executive Summary

Three P1 agent skills — `skill-template-engine`, `source-grounding`, and `generation-pipeline` — were forged to production standard across Full and Standard shapes, covering the complete prompt compilation and generation orchestration layer for the writer-tool MVP. Every skill passed the must-pass quality gate: valid frontmatter, trigger phrases, imperative form throughout, anti-patterns per step, no hardcoded values, and all internal references resolved. Next: implement `lib/skill-engine/compiler.ts` using `skill-template-engine` as the specification.

---

## Metrics Dashboard

| Metric | Count |
|--------|-------|
| Skills forged | 3 |
| P1 skill-map items completed | 3 / 3 |
| P2 skill-map items completed | 0 / 2 |
| Files created (total) | 12 |
| SKILL.md files | 3 |
| README.md files | 3 |
| metadata.json files | 3 |
| Reference files | 1 (`references/prompt-architecture.md`) |
| Template files | 1 (`templates/skill-template-definition.md`) |
| Example files | 1 (`examples/reaction-piece.md`) |
| Blueprint phases defined | 5 |
| Risk register entries | 6 |
| Architecture decisions extracted | 4 |
| Tests written | [NO DATA] |
| Code implemented | [NO DATA] |
| Deployment status | [NO DATA] |

---

## Timeline

```
2026-04-14  Blueprint authored (blueprint-writer-tool.md)
            — Stack: Next.js + Supabase + Vercel + Claude API

2026-04-14  Skill map extracted from blueprint § 5
            — 3 P1 skills, 2 P2 skills, 4 existing skills identified for reuse

2026-04-14  skill-template-engine forged (Full shape)
            — 6 files: SKILL.md + README + metadata + templates/ + references/ + examples/
            — Defines 4-step compilation: load → validate → compile layers → attach markers

2026-04-14  source-grounding forged (Standard shape)
            — 3 files: SKILL.md + README + metadata
            — 4-step pipeline: build query → search → verify URLs → return SourceContext

2026-04-14  generation-pipeline forged (Standard shape)
            — 3 files: SKILL.md + README + metadata
            — 6-step orchestration: fan-out → inject → outline → streaming draft → assert → save

2026-04-14  skill-map.md updated — all 3 P1 entries marked FORGED
```

**Inflection points:**
- `skill-template-engine` was the foundational decision — `source-grounding` and `generation-pipeline` both import its interfaces (`CompiledPrompt`, `SourceContext`) as contracts
- The parallel fan-out pattern in `generation-pipeline` Step 1 is the key latency decision: without it, source-grounding blocks compilation sequentially

---

## Architecture Decisions

**Decision 1 — Full shape for skill-template-engine**

```
In the context of choosing a package shape for the template compilation layer,
facing the need for reuse across multiple skills and a worked example to validate the layer model,
we decided Full shape (SKILL.md + README + metadata + templates + references + examples),
to achieve a self-contained specification that implementation engineers can build from directly,
accepting the additional time to produce templates, references, and a worked example.
```

**Decision 2 — Standard shape for source-grounding and generation-pipeline**

```
In the context of shaping the source verification and orchestration skills,
facing the choice between Standard (documentation + multi-step workflow) and Full (+ templates and examples),
we decided Standard shape — documentation sufficient for a multi-step workflow without repeating structure,
to achieve faster forging and appropriate scope for these procedural skills,
accepting that examples are illustrative (marked in code) rather than full worked walkthroughs.
```

**Decision 3 — Parallel fan-out in generation-pipeline Step 1**

```
In the context of orchestrating source-grounding and prompt compilation,
facing a sequential approach that would add 3–8s latency to every generation,
we decided to run Promise.all (parallel fan-out) for source-grounding and compilation,
to achieve first-token latency < 5s (required UX gate),
accepting that error handling in Step 1 must resolve both promises before aborting.
```

**Decision 4 — Two-pass generation (outline → draft)**

```
In the context of producing structurally consistent long-form drafts,
facing variance in section count and order across single-pass generations,
we decided to generate a non-streamed outline first (max_tokens: 500), then pass it to the streaming draft,
to achieve structural consistency and reduced regeneration rate,
accepting one additional Claude API call per generation (adds ~2s, within the 90s budget).
```

---

## Risk and Gap Register

| Item | Status | Gap |
|------|--------|-----|
| P2 skill: `brief-form-builder` | NOT STARTED | Unblocks dynamic form rendering; can be hardcoded for first skill |
| P2 skill: `skill-quality-assertion` | NOT STARTED | Quality assertion in generation-pipeline Step 5 runs inline logic; full skill needed for richer checks |
| Implementation code: `lib/skill-engine/compiler.ts` | NOT STARTED | skill-template-engine is the spec; TypeScript implementation not yet written |
| Implementation code: `lib/sources/search.ts` + `verify.ts` | NOT STARTED | source-grounding is the spec; Brave/Serper client not yet written |
| Implementation code: `app/api/generate/route.ts` | NOT STARTED | generation-pipeline is the spec; Edge Function not yet written |
| SkillTemplate definitions (`skills-catalog/*.ts`) | NOT STARTED | No skill templates authored yet — reaction-piece, long-form-essay, product-announcement all pending |
| Database schema | NOT STARTED | Supabase migrations not written |
| Tests | NOT STARTED | `compiler.test.ts`, `loader.test.ts`, e2e generation test all pending |
| AI detection gate | NOT STARTED | Quality gate: < 20% AI score on Originality.ai — no outputs yet to test |
| Human quality review | NOT STARTED | Required before any skill goes live |

---

## Next Steps

1. **Implement `lib/skill-engine/compiler.ts`** using `skill-template-engine/SKILL.md` as the specification — 4 functions: `loadSkillTemplate`, `validateBrief`, `compile`, `injectSources` `[L]`
2. **Implement `lib/sources/search.ts` + `verify.ts`** using `source-grounding/SKILL.md` — Brave Search client, HEAD verification, relevance scoring `[M]`
3. **Author the `reaction-piece` SkillTemplate** in `skills-catalog/reaction-piece.ts` using `templates/skill-template-definition.md` as the starting point `[S]`
4. **Wire `app/api/generate/route.ts`** using `generation-pipeline/SKILL.md` — Edge Function, SSE streaming, 6-step sequence `[M]`
5. **Write Supabase migrations** for `documents`, `sources`, `subscriptions` tables from the data model in blueprint § 3 `[S]`

---

---

# MODE 2: Demo Showcase

**Verdict: `DEMO-STRUCTURED`**
All three P1 skills are structurally sound with valid documentation, trigger phrases, and internal references. Invocation is unverified (no implementation code exists yet) — these are agent-instruction specifications, not executable binaries.

---

## Capability Inventory

| # | Skill | Shape | Status | One-liner |
|---|-------|-------|--------|-----------|
| 1 | `skill-template-engine` | Full | `[UNTESTED]` | Compiles a SkillTemplate + Brief into a layered `CompiledPrompt` ready for Claude |
| 2 | `source-grounding` | Standard | `[UNTESTED]` | Fetches and verifies real web sources, returns a `SourceContext` for prompt injection |
| 3 | `generation-pipeline` | Standard | `[UNTESTED]` | Orchestrates sources → outline → streaming draft → quality check → save |

`[UNTESTED]` = A1–A3 pass (files present, frontmatter valid, references resolved). A4–A5 (invocation, output format) not verified — no implementation code exists yet.

---

## Capability Cards

---

### Capability 1: Skill Template Engine

**Status:** `[UNTESTED]`
**Location:** `knowledge/meta-skills/skill-template-engine/`

**What It Is**
Validates a user Brief against a SkillTemplate's `brief_schema`, then compiles genre conventions, scaffolding, constraints, source excerpts, and tone directives into a structured `CompiledPrompt` object with `system`, `user`, and `assistant` layers.

**How to Invoke**
```
"Compile the skill template for reaction-piece with this brief:
  topic: OpenAI o3 benchmark results
  angle: skeptical — benchmarks don't predict real-world quality
  target_outlet: tech-critical newsletter
  word_count: 900"
```

**Example Input → Output** <!-- ILLUSTRATIVE — no implementation yet -->

Input:
```json
{
  "skillSlug": "reaction-piece",
  "brief": {
    "topic": "OpenAI o3 benchmark results",
    "angle": "skeptical — benchmarks don't predict real-world quality",
    "target_outlet": "tech-critical newsletter",
    "word_count": 900
  }
}
```

Output:
```typescript
{
  system: "[Genre layer: expert tech commentator conventions]\n[Scaffolding layer: hook + argument + counter + conclusion]\n[Constraint layer: 800–1000 words, no hedging, citations required]\n[Tone layer: confident, direct, Platformer-register]",
  user: "[Brief substituted into user_template]\n[Sources: injected at {{sources}} placeholder]",
  assistant: "",
  qualityMarkers: { min_words: 800, max_words: 1000, required_sections: [...], citation_required: true },
  metadata: { skillSlug: "reaction-piece", briefHash: "sha256:...", compiledAt: "..." }
}
```

**Edge Case**
If `brief.angle` is absent (required field):
```json
{ "valid": false, "errors": ["Required field 'angle' missing"], "warnings": [] }
```
The `ValidationError` is thrown. The pipeline receives it and aborts generation — the user sees a form validation error, not a bad generation.

**Try It**
```
"Run skill-template-engine on this brief: topic='Claude 4.6 context window increase', 
angle='bullish — 200k context changes agent architecture patterns', 
target_outlet='AI developer newsletter', word_count=750"
```

---

### Capability 2: Source Grounding

**Status:** `[UNTESTED]`
**Location:** `knowledge/meta-skills/source-grounding/`

**What It Is**
Builds a targeted search query from the Brief's topic, calls the Brave or Serper search API, verifies each returned URL is live and contains relevant content (HEAD → GET → key-term scoring), extracts 150–200 word excerpts, and returns a `SourceContext` with 3–5 verified sources.

**How to Invoke**
```
"Ground sources for the topic: 'OpenAI o3 reasoning model benchmark results'
 angle: skeptical — use Brave search"
```

**Example Input → Output** <!-- ILLUSTRATIVE — no implementation yet -->

Input:
```
topic: "OpenAI o3 reasoning model benchmark results"
angle: "skeptical — benchmarks don't predict real-world quality"
```

Output:
```typescript
{
  verified: [
    { url: "https://openai.com/blog/o3", title: "Introducing o3",
      excerpt: "o3 achieves 87.5% on ARC-AGI...", verified: true },
    { url: "https://arxiv.org/abs/2312.11805",
      title: "ARC-AGI benchmark: limitations in measuring general reasoning",
      excerpt: "ARC-AGI tests pattern matching under constrained conditions...",
      verified: true }
  ],
  fallback: false,
  no_results: false,
  query_used: "OpenAI o3 reasoning model ARC-AGI benchmark 2024",
  fetched_at: "2026-04-14T09:00:00Z"
}
```

**Edge Case**
If the Brave Search API is unreachable:
```typescript
{ verified: [], fallback: true, no_results: false, query_used: "...", fetched_at: "..." }
```
Generation continues with `fallback: true`. The pipeline emits a user-visible warning: "Sources unverified — generating without citations." No hallucinated URLs are returned.

**Try It**
```
"Use source-grounding to fetch verified sources for: 
 topic='Supabase vs Neon for Next.js SaaS', no angle specified"
```

---

### Capability 3: Generation Pipeline

**Status:** `[UNTESTED]`
**Location:** `knowledge/meta-skills/generation-pipeline/`

**What It Is**
Orchestrates the full 6-step generation sequence: parallel fan-out of prompt compilation and source-fetching, source injection, outline generation (non-streamed), streaming draft generation via SSE, quality assertion against the skill's `quality_markers`, and document persistence.

**How to Invoke**
```
"Run the generation pipeline for skill 'reaction-piece' with:
 brief: { topic: 'OpenAI o3 results', angle: 'skeptical', target_outlet: 'tech newsletter', word_count: 900 }
 document_id: 'doc_abc123'"
```

**Example Input → Output** <!-- ILLUSTRATIVE — no implementation yet -->

SSE event stream (client receives):
```
[T+0.0s]  POST /api/generate → pipeline starts
[T+3.4s]  { event: "outline_complete", status: "generating_draft" }
[T+5.4s]  { event: "chunk", content: "OpenAI's o3 model posts..." }
           ... (streaming for ~40s)
[T+45s]   { event: "draft_complete" }
[T+45s]   { event: "quality_result", passed: true, issues: [] }
[T+45.2s] { event: "complete", document_id: "doc_abc123", status: "complete" }
```

Saved `Document` record:
```
content:    "<full draft text, ~920 words>"
word_count: 920
status:     "complete"
sources:    [{ url, title, excerpt, verified: true }, ...]
```

**Edge Case**
If `quality_result.passed: false` (e.g., word count 650, below `min_words: 800`):
```
{ event: "quality_result", passed: false, issues: ["Word count 650 outside range [800–1000]"] }
{ event: "complete", document_id: "doc_abc123", status: "needs_review" }
```
Document is saved with `status: "needs_review"`. Generation does not retry automatically — the UI shows the issues and offers a regenerate option.

**Try It**
```
"Generate a document using the generation pipeline:
 skill=reaction-piece, topic='Anthropic Constitutional AI paper', 
 angle='favorable — underappreciated alignment technique', 
 target_outlet='AI safety newsletter', word_count=800"
```

---

## Integration Chain: Brief → Document

The three P1 skills compose into a single pipeline. Here is the full chain with handoff artifacts:

```
[User Brief]
    │
    ├──── skill-template-engine (Step 1–2)
    │         Validates Brief against brief_schema
    │         ↓ BriefValidationResult (if errors → abort)
    │
    ├──(parallel)─────────────────────────────────────────┐
    │                                                      │
    ├── skill-template-engine (Step 3–4)          source-grounding
    │   Compiles 6-layer prompt architecture      Searches, verifies, extracts
    │   ↓ CompiledPrompt (system, user layers)    ↓ SourceContext (verified[])
    │                                                      │
    └──────────────────── generation-pipeline ────────────┘
                          Step 2: injectSources(compiled, sources)
                          ↓ Final CompiledPrompt with sources injected
                          Step 3: outline (max_tokens: 500, non-streamed)
                          ↓ Outline text (internal)
                          Step 4: draft (streaming SSE, max_tokens: 3000)
                          ↓ → → → chunks to client → → →
                          Step 5: quality assertion against qualityMarkers
                          ↓ QualityResult { passed, issues }
                          Step 6: save to database
                          ↓ Document { content, status, sources }
```

**Handoff artifacts:**

| Handoff | From → To | Artifact |
|---------|-----------|---------|
| 1 | skill-template-engine → generation-pipeline | `CompiledPrompt` (JSON object, ~2–5 KB) |
| 2 | source-grounding → generation-pipeline | `SourceContext` (JSON object, ~1–3 KB) |
| 3 | generation-pipeline Step 3 → Step 4 | Outline text (~300–500 tokens, held in memory) |
| 4 | generation-pipeline Step 4 → Step 5 | Full draft text (~900–3000 words, held in memory) |
| 5 | generation-pipeline Step 6 → database | `Document` record + `Source` rows |

---

## Documentation Audit

### Audit Results

| Skill | A1 (exists) | A2 (README) | A3 (frontmatter) | A4 (invocation) | A5 (output format) | A6 (refs) | A7 (examples) | Badge |
|-------|-------------|-------------|------------------|-----------------|-------------------|-----------|---------------|-------|
| `skill-template-engine` | ✓ | ✓ | ✓ | — | — | ✓ | ILLUSTRATIVE | `[UNTESTED]` |
| `source-grounding` | ✓ | ✓ | ✓ | — | — | ✓ | ILLUSTRATIVE | `[UNTESTED]` |
| `generation-pipeline` | ✓ | ✓ | ✓ | — | — | ✓ | ILLUSTRATIVE | `[UNTESTED]` |

**A4/A5 not verified:** No TypeScript implementation exists yet. Skills are agent-instruction specifications — invocation is valid in the context of an AI client reading SKILL.md, but has not been tested end-to-end against real inputs.

**A7 — Example status:**
- `skill-template-engine/examples/reaction-piece.md` — illustrative (walks through the algorithm step by step with realistic inputs; output is synthetic, not from a running compiler)
- `source-grounding` SKILL.md example — illustrative (realistic inputs, synthetic output)
- `generation-pipeline` SKILL.md example — illustrative (timing and event sequence derived from latency targets in blueprint, not measured)

### Reference Check (A6)

| Skill | Referenced file | Exists? |
|-------|----------------|---------|
| `skill-template-engine` | `examples/reaction-piece.md` | ✓ |
| `skill-template-engine` | `references/prompt-architecture.md` | ✓ |
| `skill-template-engine` | `templates/skill-template-definition.md` | ✓ |
| `source-grounding` | (no internal references) | N/A |
| `generation-pipeline` | (no internal references) | N/A |

No dead references found.

### Gaps Requiring Attention

| Gap | Impact | Action |
|-----|--------|--------|
| A4/A5 unverified — no implementation code | `[UNTESTED]` badge on all three skills | Implement `compiler.ts`, `search.ts`, `verify.ts`, `route.ts` (see Mode 1 next steps) |
| Examples are illustrative, not actual output | A7 ILLUSTRATIVE on all examples | Run a real generation and replace the example output in `examples/reaction-piece.md` |
| `metadata.json` `author.github` field uses placeholder handle | Minor — not tied to real GitHub account | Update after account is confirmed |

---

## Showcase Verdict Summary

| Mode | Verdict | Reason |
|------|---------|--------|
| **Mode 1 (Report)** | `SHOWCASE-WITH-GAPS` | 3 real deliverables, timeline present, architecture decisions captured; P2 skills + all implementation code pending |
| **Mode 2 (Demo)** | `DEMO-STRUCTURED` | 0 `[BROKEN]` items, 0 `[READY]` items, 3 `[UNTESTED]` — structure sound, invocation unverified by design (spec-first workflow) |

---

*Generated by showcase-presenter v1.0.0 · 2026-04-14*
