---
name: kb-scrape
description: |
  Scrape documentation from URLs and save to structured knowledge base.
  Use when user says "scrape docs", "get documentation", "crawl site", or
  needs to capture web content for later retrieval. Also use when building
  a knowledge base from web sources, capturing API documentation, or
  archiving reference material. Integrates with Firecrawl/Tavily MCP.
author: KB-Forge Team
version: 1.0.0
---

# KB-Scrape Skill

> Scrape documentation from URLs and save to a structured, searchable knowledge base.

## Purpose

Without structured scraping, documentation is scattered across bookmarks, browser tabs,
and ephemeral web sessions. This skill captures web content into a permanent,
indexed knowledge base that agents can query later. It solves the "I saw it somewhere"
problem by making web content retrievable.

## Audience

- Primary: AI agents capturing documentation for projects
- Secondary: Knowledge workers building reference libraries

## When to Use

- User says: "scrape docs", "get documentation", "crawl site"
- Building a knowledge base from web sources
- Capturing API documentation for a project
- Archiving reference material before it changes

## When Not to Use

| If the situation is... | Use instead | Why |
|------------------------|-------------|-----|
| Content is already local (files, repos) | `kb-index` | Local content doesn't need scraping |
| Only need temporary caching | Firecrawl/Tavily MCP directly | No need to persist to KB |
| URL requires authentication | Manual capture | Auth-protected sites need manual handling |

## Required Context

Gather or confirm:

- Target URL(s) to scrape
- Desired storage format (markdown, obsidian, hybrid)
- Scope: single page, section, or full site
- Whether this is temporary or permanent
- Custom KB name (optional, auto-generated otherwise)

## Process

### Step 1: Validate URL and Scope

**Action:** Verify the URL is reachable and determine scraping depth.
**Inputs:** User-provided URL, depth preference
**Outputs:** Validated URL with confirmed scope

Use the appropriate MCP tool to check URL accessibility.

| If depth is... | Scrape... | Because... |
|----------------|-----------|------------|
| `single` | Just the target page | Quick reference, minimal bandwidth |
| `section` | Target + linked pages in same section | API docs, guide chapters |
| `full` | Entire site from root | Complete documentation archive |

**Do NOT:** Scrape full sites when single page suffices — wastes bandwidth and storage.

### Step 2: Execute Scraping

**Action:** Invoke Firecrawl or Tavily MCP to extract content.
**Inputs:** Validated URL, depth, format preferences
**Outputs:** Raw scraped content in markdown format

```bash
# Example with kb-forge CLI
kb-forge scrape https://docs.devin.ai/work-with-devin/devin-session-tools
```

**Do NOT:** Mix multiple unrelated URLs in one KB — reduces retrieval precision.

### Step 3: Structure and Store

**Action:** Convert scraped content to KB structure with metadata.
**Inputs:** Raw markdown content, storage format choice
**Outputs:** KB created at `~/.kb-forge/kb/<name>/`

| Storage format | Best for | Output structure |
|--------------|----------|------------------|
| `markdown` | General purpose | Raw/ + index files |
| `obsidian` | Obsidian vault users | Wiki-linked markdown |
| `hybrid` | RAG applications | Raw + vector index |

**Do NOT:** Use temporary storage (`temp`) for reference KBs — auto-expires after 7 days.

### Step 4: Verify and Report

**Action:** Confirm KB creation and report to user.
**Inputs:** Created KB path
**Outputs:** Confirmation message with KB path and stats

Report: KB name, location, page count, and next steps (e.g., "Ready to query").

## Output

Default output:

- KB created at `~/.kb-forge/kb/<name>/`
- Raw content in `raw/` directory
- Indexed content for retrieval (if hybrid storage)
- Confirmation message with KB path

## Example

User: "Scrape the Devin session tools docs"

**Decision:** Single page scrape, temp storage (task-specific)

```bash
kb-forge scrape https://docs.devin.ai/work-with-devin/devin-session-tools --mode=temp
```

**Result:** KB created at `~/.kb-forge/kb/temp-20260430-abc123/` with single page.

User: "Build me a permanent KB of the Devin docs in Obsidian format"

**Decision:** Full site scrape, permanent, Obsidian storage

```bash
kb-forge scrape https://docs.devin.ai --mode=permanent --storage=obsidian --depth=full --name=devin-official
```

**Result:** KB created at `~/.kb-forge/kb/devin-official/` with wiki-linked files.

## Works Well With

- `kb-context` — After scraping, prepare chunks for optimal retrieval
- `kb-query` — Once scraped, query the KB for information

## Notes

- Temporary KBs auto-expire after 7 days
- Some sites block scrapers; respect robots.txt
- Rate limiting applies; large sites may take several minutes
- Does NOT handle JavaScript-rendered content requiring interaction
