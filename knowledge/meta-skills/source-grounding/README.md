# Source Grounding

> Fetches real web sources for a topic, verifies each URL resolves with relevant content, and returns a `SourceContext` for injection into any generation prompt — eliminating hallucinated citations.

## What It Does

Source grounding executes a search query derived from the user's Brief, verifies each result URL is live and contains relevant content, extracts 150–200 word excerpts from confirmed sources, and packages them into a `SourceContext` object ready for the skill-template-engine to inject. If the search API fails or returns no results, it returns a `SourceContext` with `fallback: true` so the generation pipeline can warn the user rather than silently hallucinating citations. This skill runs in parallel with prompt compilation to minimize end-to-end latency.

## Supported Clients

- Claude Code
- Codex
- Cursor

## Prerequisites

- `SEARCH_API_KEY` environment variable set (Brave Search or Serper API key)
- `SEARCH_PROVIDER` environment variable: `"brave"` (default) or `"serper"`
- Web-fetch capability available in the runtime (for URL verification in Step 3)

## Installation

1. Copy [`SKILL.md`](./SKILL.md) into the reusable-instructions location for your AI client.
2. Set `SEARCH_API_KEY` and `SEARCH_PROVIDER` in your `.env.local`.
3. Restart or reload the client so it picks up the skill.
4. Test with a prompt like: `"Ground sources for the topic: OpenAI o3 model launch"`

For Claude Code, a common install path is:

```bash
mkdir -p ~/.claude/skills/source-grounding
cp SKILL.md ~/.claude/skills/source-grounding/SKILL.md
```

## Trigger Conditions

- "Ground sources for [topic]"
- "Fetch verified sources before generating"
- "source-grounding"
- "Find real sources I can cite for [topic]"
- "Verify citations for this topic"

## Expected Outcome

When installed and invoked correctly, the skill should produce:

- A `SourceContext` object with 3–5 verified sources, each with a confirmed URL, title, and 150–200 word excerpt
- `fallback: true` (not a crash) if the search API is unavailable — generation can proceed with a user-visible warning
- `query_used` field exposing the search query that was executed, for audit and cache keying

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Core skill definition — the instructions the AI client reads |
| `README.md` | This file — installation, usage, and troubleshooting |
| `metadata.json` | Machine-readable metadata for indexing and discovery |

## Troubleshooting

**Issue: All sources return `verified: false` even for well-known URLs**
Solution: Check if the runtime's web-fetch capability can reach external URLs. If running in a sandboxed environment (e.g., Claude Code with restricted tool permissions), the HEAD/GET requests in Step 3 may be blocked. Either grant web-fetch access or pre-populate sources manually.

**Issue: Search API returns 0 results for a valid topic**
Solution: The query constructed in Step 1 may be too narrow. Check `query_used` in the returned `SourceContext`. Try a broader query manually to confirm results exist, then add a `source_query_template` to the SkillTemplate that uses a broader pattern for this niche.

**Issue: Generation produces hallucinated citations even when `SourceContext` was provided**
Solution: Confirm the `{{sources}}` placeholder exists in the SkillTemplate's `user_template` field. If the placeholder is absent, the template engine's Layer 5 injection silently skips the sources — they never appear in the prompt. Add the placeholder to the skill definition.

## Notes for Other Clients

The core behavior to preserve is: search → verify (HEAD + content relevance check) → return structured context. The `SourceContext` interface (`verified[]`, `fallback`, `query_used`) is the stable contract — the search provider, HTTP client, and relevance scoring algorithm can all be swapped without breaking downstream consumers. In environments without web-fetch, skip Step 3 verification and return sources as `verified: false` with a flag — never fabricate verification results.
