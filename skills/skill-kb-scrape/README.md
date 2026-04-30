# KB-Scrape Skill

> Scrape documentation from URLs into a structured, searchable knowledge base.

## What It Does

This skill enables AI agents to capture web documentation and make it retrievable
for later tasks. It uses Firecrawl or Tavily MCP for scraping, then structures
and indexes the content into a knowledge base.

## Supported Clients

- Claude Code
- Codex
- Cursor

## Prerequisites

- kb-forge CLI installed: `pip install kb-forge`
- Firecrawl or Tavily MCP server configured

## Installation

1. Copy [`SKILL.md`](./SKILL.md) into the reusable-instructions location for your AI client.
2. Restart or reload the client so it picks up the skill.
3. Test with a prompt like: "Scrape the docs from https://docs.example.com"

For Claude Code, a common install path is:

```bash
mkdir -p ~/.claude/skills/kb-scrape
cp SKILL.md ~/.claude/skills/kb-scrape/SKILL.md
```

## Trigger Conditions

- "scrape [URL]"
- "get documentation from [URL]"
- "crawl [site]"
- "capture docs"

## Expected Outcome

When installed and invoked correctly, the skill should produce:

- Knowledge base created at `~/.kb-forge/kb/<name>/`
- Structured markdown content with preserved hierarchy
- Confirmation with KB path and page count

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Core skill definition — the instructions the AI client reads |
| `README.md` | This file — installation, usage, and troubleshooting |
| `metadata.json` | Machine-readable metadata for indexing and discovery |

## Troubleshooting

**Issue: "MCP server not found" error**
Solution: Ensure kb-forge is installed (`pip install kb-forge`) and the `kb_forge.mcp_server`
module is available. Verify MCP configuration points to the correct Python environment.

**Issue: "Scraping failed" or blocked content**
Solution: Check that Firecrawl or Tavily MCP is configured. Some sites block scrapers
or require JavaScript interaction. For protected sites, use manual capture instead.

## Notes for Other Clients

The core behavior (URL scraping via MCP, KB structuring) is client-agnostic.
Tool names may vary: use your client's web scraping MCP and file write
capabilities to achieve the same outcome.
