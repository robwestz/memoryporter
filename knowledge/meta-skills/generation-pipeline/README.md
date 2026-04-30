# Generation Pipeline

> Orchestrates the full multi-pass generation sequence — sources, compiled prompt, outline, draft, quality check — and streams the result to the user via SSE.

## What It Does

The generation pipeline is the `/api/generate` route implementation for a skill-based writing tool. It fans out source-grounding and prompt compilation in parallel, injects verified sources into the compiled prompt, generates a structural outline (non-streamed), then generates the full draft (streamed word-by-word to the client), runs quality assertion, and saves the result. Every skill runs through the same pipeline — only the `SkillTemplate` and `Brief` change. Upstream: `skill-template-engine` and `source-grounding`. Downstream: the saved `Document` record and streamed SSE events.

## Supported Clients

- Claude Code
- Codex
- Cursor

## Prerequisites

- `ANTHROPIC_API_KEY` in environment (Claude API access)
- `SEARCH_API_KEY` and `SEARCH_PROVIDER` in environment (for source-grounding in Step 1)
- `skill-template-engine` skill available in the runtime
- `source-grounding` skill available in the runtime
- A Supabase (or equivalent) database with `documents` and `sources` tables
- An SSE-capable HTTP runtime (Next.js Edge Functions or Node.js with `res.write`)

## Installation

1. Copy [`SKILL.md`](./SKILL.md) into the reusable-instructions location for your AI client.
2. Confirm `skill-template-engine` and `source-grounding` are also installed.
3. Set all required environment variables.
4. Test with a prompt like: `"Run the generation pipeline for the reaction-piece skill with topic: X"`

For Claude Code, a common install path is:

```bash
mkdir -p ~/.claude/skills/generation-pipeline
cp SKILL.md ~/.claude/skills/generation-pipeline/SKILL.md
```

## Trigger Conditions

- "Generate a document with the [skill-name] skill"
- "Run the generation pipeline for this brief"
- "Start generation: [skill], topic: [topic]"
- "generation-pipeline"
- Any request that starts from a validated Brief and must produce a streamed document

## Expected Outcome

When installed and invoked correctly, the skill should produce:

- A stream of SSE events: `outline_complete` → `chunk` (×N) → `draft_complete` → `quality_result` → `complete`
- A saved `Document` record with `content`, `word_count`, `status` (`complete` or `needs_review`), and linked `Source` records
- `quality_result.passed: true` for well-formed Briefs with sufficient sources — first-generation pass rate should exceed 90% for validated skills

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Core skill definition — the instructions the AI client reads |
| `README.md` | This file — installation, usage, and troubleshooting |
| `metadata.json` | Machine-readable metadata for indexing and discovery |

## Troubleshooting

**Issue: First token latency consistently exceeds 5s**
Solution: Check whether Step 1's parallel fan-out is actually running concurrently. If `source-grounding` is being awaited before compilation starts, the fan-out is broken. Confirm `Promise.all` (not sequential `await`) is used in Step 1. Also check search API latency — if it exceeds 3s on average, consider running source-grounding pre-flight (before the user submits the Brief) using topic auto-detection.

**Issue: Draft completes but quality assertion reports "No citations found" even though sources were fetched**
Solution: Confirm the `{{sources}}` placeholder exists in the SkillTemplate's `user_template`. If the source injection in Step 2 had nowhere to inject (placeholder absent), sources were silently skipped. The model cannot cite sources that were not in its context. Add `{{sources}}` to the skill definition.

**Issue: SSE stream closes before the document appears in the database**
Solution: The SSE `complete` event is being emitted before the database `upsert` resolves. Ensure the save operation in Step 6 is awaited before closing the stream. In Next.js Edge Functions, confirm the `waitUntil` pattern is used if the response needs to close while a background save completes.

**Issue: Retrying a failed generation re-fetches sources and exceeds the search API quota**
Solution: Cache the `SourceContext` on the `Document` record (as a JSON column) when it is first fetched. On retry, load it from the database and skip Step 1's source-grounding call. Pass `{ skipSourceFetch: true, cachedSources }` to the pipeline.

## Notes for Other Clients

The core sequence (fan-out → inject → outline → draft → assert → save) is the stable behavior. The streaming transport (SSE events) and the persistence layer (Supabase) can both be swapped — what must be preserved is the parallel fan-out in Step 1, the two-pass generation (outline first, then draft), and the quality assertion before save. In non-streaming environments, return the complete draft as a single response after Step 5 rather than streaming chunks.
