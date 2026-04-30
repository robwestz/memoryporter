# KB-Context Skill

> Prepare knowledge base content for optimal agent retrieval through chunking and indexing.

## What It Does

Transforms scraped content into agent-optimized format through semantic chunking
and vector indexing. This makes content retrievable for RAG applications by
building searchable indices from raw documentation.

## Supported Clients

- Claude Code
- Codex
- Cursor

## Prerequisites

- kb-forge CLI installed
- Existing KB with scraped content
- sentence-transformers (for embeddings)

## Installation

1. Copy [`SKILL.md`](./SKILL.md) into the reusable-instructions location for your AI client.
2. Restart or reload the client so it picks up the skill.
3. Test with a prompt like: "Prepare my devin-docs KB for retrieval"

For Claude Code, a common install path is:

```bash
mkdir -p ~/.claude/skills/kb-context
cp SKILL.md ~/.claude/skills/kb-context/SKILL.md
```

## Trigger Conditions

- "prepare context"
- "index for RAG"
- "make retrievable"
- "chunk this KB"

## Expected Outcome

When installed and invoked correctly, the skill should produce:

- KB re-indexed with optimal chunking for agent retrieval
- Vector index for semantic search
- Performance stats (chunk count, average size)

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Core skill definition — the instructions the AI client reads |
| `README.md` | This file — installation, usage, and troubleshooting |
| `metadata.json` | Machine-readable metadata for indexing and discovery |

## Troubleshooting

**Issue: "KB not found" error**
Solution: Ensure the KB exists with `kb-forge list`. The KB must be scraped
before chunking. If needed, run `kb-scrape` first.

**Issue: Indexing takes too long or fails**
Solution: Large KBs may need more memory. Try reducing chunk size or processing
in batches. Check that sentence-transformers is installed.

## Notes for Other Clients

The core behavior (chunking + indexing) is client-agnostic. Tool names may vary:
use your client's file processing and vector store capabilities to achieve the
same outcome.
