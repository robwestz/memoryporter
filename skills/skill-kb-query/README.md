# KB-Query Skill

> Query a knowledge base using natural language and retrieve relevant chunks with source attribution.

## What It Does

Retrieves relevant information from a knowledge base using semantic search.
Returns ranked chunks with relevance scores and source URLs, enabling
fact-checking and attribution.

## Supported Clients

- Claude Code
- Codex
- Cursor

## Prerequisites

- kb-forge CLI installed
- Existing indexed KB (run `kb-scrape` and `kb-context` first)

## Installation

1. Copy [`SKILL.md`](./SKILL.md) into the reusable-instructions location for your AI client.
2. Restart or reload the client so it picks up the skill.
3. Test with a prompt like: "Ask my devin-docs KB about session tools"

For Claude Code, a common install path is:

```bash
mkdir -p ~/.claude/skills/kb-query
cp SKILL.md ~/.claude/skills/kb-query/SKILL.md
```

## Trigger Conditions

- "ask KB..."
- "query knowledge base"
- "search docs"
- "what does the KB say about..."

## Expected Outcome

When installed and invoked correctly, the skill should produce:

- Relevant chunks from KB with relevance scores
- Source attribution (URL, heading, timestamp)
- Synthesized answer with citations

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Core skill definition — the instructions the AI client reads |
| `README.md` | This file — installation, usage, and troubleshooting |
| `metadata.json` | Machine-readable metadata for indexing and discovery |

## Troubleshooting

**Issue: "KB not found or not indexed"**
Solution: Ensure the KB exists and has been processed with `kb-context`.
Run `kb-forge list` to see available KBs and their status.

**Issue: Results are irrelevant or low scores**
Solution: The KB may need re-indexing with better chunking. Try:
1. Re-run `kb-context` with different chunk strategy
2. Check that the KB actually contains content about your query
3. Verify the query is clear and specific

## Notes for Other Clients

The core behavior (semantic search + attribution) is client-agnostic.
Tool names may vary: use your client's vector store search or embedding
capabilities to achieve the same outcome.
