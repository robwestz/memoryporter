---
name: kb-query
description: |
  Query a knowledge base using natural language and retrieve relevant chunks
  with source attribution. Use when user says "ask KB", "query knowledge base",
  "search docs", or needs to retrieve information from a previously built KB.
  Also use for cross-referencing multiple sources or fact-checking against
  documentation.
author: KB-Forge Team
version: 1.0.0
---

# KB-Query Skill

> Query a knowledge base using natural language and retrieve relevant chunks with source attribution.

## Purpose

Knowledge bases are useless if content cannot be retrieved. This skill provides
natural language querying over indexed KBs, returning relevant chunks ranked by
semantic similarity. It bridges the gap between stored knowledge and actionable
answers.

## Audience

- Primary: AI agents retrieving information during tasks
- Secondary: Users searching their personal knowledge bases

## When to Use

- User asks: "ask KB about...", "query knowledge base"
- Need information from previously scraped docs
- Cross-referencing multiple sources
- Fact-checking against documentation

## When Not to Use

| If the situation is... | Use instead | Why |
|------------------------|-------------|-----|
| KB doesn't exist yet | `kb-scrape` | Need to capture content first |
| General web search | Firecrawl/Tavily MCP | KB only covers previously scraped content |
| Real-time data needed | Live API/web search | KB content may be stale |

## Required Context

Gather or confirm:

- Target KB name to query
- Natural language question
- Number of results needed (top_k)
- Whether source attribution is required

## Process

### Step 1: Validate KB and Question

**Action:** Confirm KB exists and question is answerable.
**Inputs:** KB name, user question
**Outputs:** Validated KB path, processed query

| Question type | Approach | Because... |
|---------------|----------|------------|
| Specific fact | Direct semantic search | Precise retrieval |
| Broad topic | Expand to multiple queries | Cover different aspects |
| Comparison | Query each source separately | Fair comparison |

**Do NOT:** Query without checking KB exists — fails with confusing errors.

### Step 2: Execute Semantic Search

**Action:** Retrieve top-k relevant chunks using vector similarity.
**Inputs:** Processed query, top_k parameter
**Outputs:** Ranked list of chunks with scores

```bash
# Simple query
kb-forge query "How do I use session tools?" --kb=devin-docs

# More results
kb-forge query "deployment options" --kb=devin-docs --top-k=10
```

| Parameter | Default | When to adjust |
|-----------|---------|----------------|
| `top_k` | 5 | Increase for broad questions, decrease for specific facts |

**Do NOT:** Return all chunks — noise degrades answer quality.

### Step 3: Format Results

**Action:** Present chunks with source attribution.
**Inputs:** Retrieved chunks
**Outputs:** Formatted answer with citations

Each result includes:
- `chunk_id`: Unique identifier
- `text`: Relevant content
- `score`: Relevance score (0-1)
- `metadata`: Source URL, heading, etc.

**Do NOT:** Omit source URLs — attribution is essential for trust.

### Step 4: Synthesize (Optional)

**Action:** If multiple chunks, synthesize coherent answer.
**Inputs:** Retrieved chunks
**Outputs:** Synthesized response with citations

| If results... | Then... | Because... |
|---------------|---------|------------|
| All from same source | Quote directly | Consistent voice |
| From multiple sources | Synthesize and compare | Balanced view |
| Conflict | Present both with caveats | Honest uncertainty |

**Do NOT:** Trust results with score < 0.7 — may be irrelevant.

## Output

Default output:

- List of relevant chunks with text and scores
- Source attribution (URL, heading, timestamp)
- Synthesized answer (if requested)
- Confidence indicator based on scores

## Example

User: "Ask the Devin KB about session tools"

**Decision:** Semantic search on devin-docs KB, top 5 results

```bash
kb-forge query "How do I use session tools?" --kb=devin-docs
```

**Result:**
```
Top results:
1. [0.92] "Session tools allow you to..." (source: docs.devin.ai/work-with-devin/...)
2. [0.87] "To start a session, use..." (source: docs.devin.ai/work-with-devin/...)
...
```

User: "Search my API docs for authentication examples"

**Decision:** Higher top_k for code examples

```bash
kb-forge query "authentication examples" --kb=api-docs --top-k=10
```

## Works Well With

- `kb-scrape` — Creates the KB this skill queries
- `kb-context` — Optimizes chunks for better retrieval

## Notes

- Check crawl dates for time-sensitive information
- Scores below 0.7 indicate weak relevance
- Always cite source URLs for credibility
- KB content may be stale vs live documentation
