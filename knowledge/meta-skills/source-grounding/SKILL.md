---
name: source-grounding
description: |
  Fetches real web sources for a given topic via search API, verifies each URL
  resolves with relevant content, and injects verified source excerpts into the
  generation context. Eliminates hallucinated citations by grounding every
  factual claim in confirmed-live sources before generation starts.
  Use when: any generation requires cited sources, a skill's quality_markers
  require citation_required: true, or a Brief includes a sourced topic that
  could produce hallucinated references. Trigger on: "ground sources", "fetch
  sources for topic", "source-grounding", "verify citations", "find real sources",
  or any generation task that must cite external evidence.
author: Robin Westerlund
version: 1.0.0
---

# Source Grounding

> Queries a search API, verifies each URL resolves with relevant content, and returns a `SourceContext` ready for injection into any generation prompt — zero hallucinated citations.

## Purpose

Language models hallucinate citations. They produce plausible-sounding URLs, author names, and publication dates that do not exist. For a writing tool where trust is the product, one hallucinated citation destroys credibility. Source grounding solves this by fetching real sources before generation starts, verifying each URL is live and relevant, and injecting only confirmed excerpts into the prompt. The model can then cite real sources because they are literally in its context.

## Audience

- Primary: AI agents implementing the generation pipeline for a writing or research tool
- Secondary: Developers building any pipeline that must cite external evidence

## When to Use

- A generation skill has `quality_markers.citation_required: true`
- The topic involves recent events, statistics, or claims that require verification
- The Brief includes a specific source URL the user wants cited (verify it resolves before trusting it)
- Any generation where a hallucinated citation would be a quality-gate failure

## When Not to Use

| If the situation is... | Use instead | Why |
|------------------------|-------------|-----|
| Generation does not require citations | Skip this step | Adds latency for no benefit; source context bloats the prompt |
| Sources are provided by the user as static text (not URLs) | Inject directly into the prompt | No verification needed if content is already in hand |
| Topic is internal or proprietary (no public sources exist) | Flag to user and generate without sources | Public search APIs will not find internal knowledge |

## Required Context

Gather or confirm:

- The topic string to search for — extracted from the Brief's `topic` field
- The search API credentials (`SEARCH_API_KEY` in environment — Brave Search or Serper)
- The skill's `source_requirements` if present (e.g., minimum source count, required domain types)

## Process

### Step 1: Build the Search Query

**Action:** Derive a targeted search query from the Brief's topic and angle.
**Inputs:** `brief.topic`, `brief.angle` (optional), skill's `source_query_template` (optional)
**Outputs:** A search query string optimized for finding relevant, authoritative sources

Construct the query from the topic. If an `angle` is present, add a narrowing qualifier that steers toward evidence that supports or contextualizes the angle — do not add angle bias to the query itself, only topical relevance. Use the skill's `source_query_template` if one is defined; otherwise fall back to `"{topic} research evidence analysis"`.

| If... | Then... | Because... |
|-------|---------|------------|
| Topic is a named product/company/event | Add the year or version number to the query | Avoids returning outdated sources |
| Brief includes `target_outlet` with a niche | Add the niche as a qualifier | Increases relevance of returned sources |
| `source_query_template` is defined in the skill | Use it verbatim with `{{topic}}` substituted | Skill authors know their niche's best search patterns |

**Do NOT:** Include the `angle` as a bias in the search query (e.g., do not search for "o3 failures"). Fetch neutral, high-quality sources — the generation prompt's angle layer handles framing.

### Step 2: Execute the Search

**Action:** Call the configured search API with the query string, retrieve the top results.
**Inputs:** Query string from Step 1, `SEARCH_API_KEY`, `SEARCH_PROVIDER` env var
**Outputs:** Raw search results array — up to 10 results with URL, title, and snippet

Call the search API. Request 10 results. On failure:

| If... | Then... | Because... |
|-------|---------|------------|
| API returns 200 with results | Continue to Step 3 | Nominal path |
| API returns 5xx or network timeout | Retry once with 2s delay | Transient failures are common |
| Retry also fails | Return `SourceContext` with `verified: []`, `fallback: true` | Never block generation; let the pipeline decide |
| API returns 200 but 0 results | Return `SourceContext` with `verified: []`, `no_results: true` | Rare; happens with highly niche topics |

**Do NOT:** Silently continue with an empty source list. Always populate the `fallback` or `no_results` flag so the generation pipeline can decide whether to warn the user.

### Step 3: Verify Each URL

**Action:** Fetch each URL, confirm it resolves, extract a relevant excerpt.
**Inputs:** Raw search results from Step 2
**Outputs:** Array of `VerifiedSource` objects, each with `url`, `title`, `excerpt`, `verified: true`

For each URL in the results (up to 10, process in parallel with a 5s timeout per request):

1. Send a HEAD request to confirm the URL resolves (status 200 or 301/302 redirect that resolves to 200).
2. If resolved, send a GET request and extract the page's main text content.
3. Score relevance: check if the topic's key terms appear in the extracted text. Minimum: 2 key terms must appear within the first 500 words.
4. Extract a 150–200 word excerpt from the most relevant passage.

| If... | Then... | Because... |
|-------|---------|------------|
| URL returns 200 and is relevant | Add to `verified` array | Nominal path |
| URL 404s or DNS fails | Skip; log URL as unresolvable | Dead link — cannot cite |
| URL resolves but topic terms absent | Mark `relevance: low`; keep if < 3 verified so far | Low-relevance sources beat no sources |
| URL is a paywalled page (403 or empty content) | Skip | Cannot verify content; do not cite what you cannot read |
| 5s timeout | Skip | Latency budget must not block generation |

After processing all URLs, collect the top 3–5 verified sources ranked by relevance score.

**Do NOT:** Include unverified URLs in the `SourceContext.verified` array — even if the search snippet looks relevant. If the live page did not confirm relevance, the source is not verified.

### Step 4: Format and Return SourceContext

**Action:** Package verified sources into a `SourceContext` object for injection by the template engine.
**Inputs:** `VerifiedSource[]` array from Step 3
**Outputs:** `SourceContext` object

```typescript
interface SourceContext {
  verified: VerifiedSource[];
  fallback: boolean;        // true if search API failed
  no_results: boolean;      // true if search returned 0 results
  query_used: string;       // the query that was executed (for debugging)
  fetched_at: string;       // ISO timestamp
}
```

Return this object to the caller (the generation pipeline). The pipeline passes it to the template engine's Step 3 for injection.

**Do NOT:** Cache `SourceContext` across different Briefs or users. Source freshness matters; a 24h topic cache is acceptable for identical query strings, but never share source context across distinct generations.

## Output

Default output:

- `SourceContext` with 3–5 verified sources, each with `url`, `title`, `excerpt`, `verified: true`
- `fallback: true` and empty `verified` array if the search API failed (generation proceeds sourceless with a warning)
- `query_used` for debug logging and cache keying

## Example

```typescript
// Brief input
const topic = "OpenAI o3 reasoning model benchmark results";
const angle = "skeptical — benchmarks don't predict real-world quality";

// Step 1: query
const query = "OpenAI o3 reasoning model ARC-AGI benchmark 2024";

// Step 2: search returns 8 results
// Step 3: verification
//   - openai.com/blog/o3 → resolves, relevant → verified
//   - arxiv.org/abs/2312.11805 → resolves, relevant → verified
//   - medium.com/some-post → resolves, topic terms absent → skipped
//   - reddit.com/r/machinelearning → resolves, low relevance → kept (fallback)

// Step 4: SourceContext returned
const context: SourceContext = {
  verified: [
    { url: "https://openai.com/blog/o3", title: "Introducing o3",
      excerpt: "o3 achieves 87.5% on ARC-AGI...", verified: true },
    { url: "https://arxiv.org/abs/2312.11805",
      title: "ARC-AGI benchmark: limitations...",
      excerpt: "ARC-AGI tests pattern matching under constrained conditions...",
      verified: true }
  ],
  fallback: false,
  no_results: false,
  query_used: "OpenAI o3 reasoning model ARC-AGI benchmark 2024",
  fetched_at: "2026-04-14T09:00:00Z"
};
```

## Works Well With

- `skill-template-engine` — consumes the `SourceContext` in Layer 5 (source injection)
- `generation-pipeline` — calls `source-grounding` in parallel with outline compilation to minimize latency

## Notes

- Source verification adds 3–8s to generation latency; run in parallel with outline generation where possible
- The `SEARCH_PROVIDER` env var controls which API is called: `"brave"` (default) or `"serper"`
- Brave Search API has a free tier (2000 queries/month); Serper is paid — set the provider based on volume
- Do not use this skill to verify user-provided source text (as opposed to URLs) — that is a different trust model
