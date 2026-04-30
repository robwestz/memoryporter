---
name: kb-context
description: |
  Prepare knowledge base content for optimal agent retrieval through chunking
  and indexing. Use when user says "prepare context", "index for RAG",
  "make retrievable", or after scraping to optimize for agent use. Also use
  when changing chunk strategies or re-indexing existing KBs for better
  retrieval quality.
author: KB-Forge Team
version: 1.0.0
---

# KB-Context Skill

> Transform scraped content into agent-optimized format through semantic chunking and vector indexing.

## Purpose

Raw scraped content is often too large or poorly structured for effective agent
retrieval. This skill transforms content into optimal chunks and builds vector
indices for semantic search. Without proper chunking, agents miss relevant
context or drown in noise.

## Audience

- Primary: AI agents optimizing KBs for RAG applications
- Secondary: Developers building knowledge retrieval systems

## When to Use

- After scraping: "prepare this for retrieval"
- Optimizing existing KB: "re-index with better chunks"
- Setting up RAG: "make this retrievable"
- Changing chunk strategy: "use semantic chunking instead"

## When Not to Use

| If the situation is... | Use instead | Why |
|------------------------|-------------|-----|
| KB does not exist yet | `kb-scrape` | Need content before chunking |
| Already optimally chunked | Direct query | Re-indexing wastes compute |
| Need real-time processing | Stream processing | Indexing is batch-oriented |

## Required Context

Gather or confirm:

- Existing KB name to process
- Chunk strategy preference (semantic vs fixed)
- Embedding model (if not default)
- Target use case (affects chunk size recommendations)

## Process

### Step 1: Analyze KB Structure

**Action:** Read KB metadata and assess current chunking state.
**Inputs:** KB name/path
**Outputs:** KB structure analysis with recommendations

| Current state | Recommended action | Because... |
|---------------|-------------------|------------|
| Raw, unchunked | Full processing needed | No existing chunks |
| Poorly chunked | Re-chunk and re-index | Current chunks break context |
| Well-chunked | Incremental index update | Preserve existing work |

**Do NOT:** Re-chunk without analyzing existing structure — may destroy good work.

### Step 2: Select Chunk Strategy

**Action:** Choose chunking approach based on content type.
**Inputs:** Content analysis, use case
**Outputs:** Selected strategy with parameters

| Strategy | Best for | Chunk boundary |
|----------|----------|----------------|
| `semantic` (default) | Documentation with headings | Markdown headings, paragraphs |
| `fixed` | Long continuous text | Word count with overlap |

**Do NOT:** Use fixed chunks for structured docs — breaks at arbitrary points.

### Step 3: Execute Chunking

**Action:** Split content into chunks according to strategy.
**Inputs:** Content files, strategy parameters
**Outputs:** Chunked content with metadata

```bash
# Semantic chunking (default)
kb-forge context prepare --kb=devin-docs

# Fixed-size chunks
kb-forge context prepare --kb=devin-docs --chunk-strategy=fixed --chunk-size=300
```

| Parameter | Semantic | Fixed |
|-----------|----------|-------|
| Size control | Heading-aware | Word count |
| Overlap | Paragraph boundary | Configurable overlap |
| Best for | API docs, guides | Essays, articles |

**Do NOT:** Chunk too small — chunks must be semantically complete for retrieval.

### Step 4: Build Vector Index

**Action:** Generate embeddings and build searchable index.
**Inputs:** Chunked content, embedding model
**Outputs:** Vector index at `~/.kb-forge/kb/<name>/index/`

Default embedding: `all-MiniLM-L6-v2` (fast, good quality)
Alternative models available for specific domains.

**Do NOT:** Skip indexing — without vectors, only keyword search works.

### Step 5: Verify and Report

**Action:** Test retrieval and report to user.
**Inputs:** Built index
**Outputs:** Verification results with stats

Report: chunk count, average chunk size, index size, sample query result.

## Output

Default output:

- KB re-indexed with optimal chunking
- Vector index for semantic search
- Chunk metadata (boundaries, sources)
- Performance stats (chunks, index size)

## Example

User: "Prepare the Devin KB for my agent to use"

**Decision:** Semantic chunking (documentation with clear structure)

```bash
kb-forge context prepare --kb=devin-docs
```

**Result:** 47 semantic chunks created, indexed with all-MiniLM-L6-v2.

User: "Re-index with smaller chunks — the responses are too verbose"

**Decision:** Fixed-size chunks with 300 word limit

```bash
kb-forge context prepare --kb=devin-docs --chunk-strategy=fixed --chunk-size=300
```

**Result:** 128 smaller chunks, more precise retrieval.

## Works Well With

- `kb-scrape` — Provides raw content to chunk
- `kb-query` — Uses the index this skill builds

## Notes

- Indexing has compute cost — avoid unnecessary re-indexing
- Chunks should be semantically complete (usually 200-800 words)
- Overlap matters for fixed chunks — typically 50-100 words
- Embedding model choice affects retrieval quality vs speed
