# KB-Forge

**Knowledge Base Forge** — Autonomous multi-agent system for building knowledge bases from documentation.

## Features

- **Autonomous KB Building** — GAN-style harness with Planner-Generator-Evaluator loop
- **Multiple Scraping Scopes** — Single page, section, or full site
- **Smart Context Engineering** — Semantic chunking for optimal agent consumption
- **Multiple Storage Backends** — Markdown, Obsidian Vault, ChromaDB, or Hybrid
- **CLI + MCP Server** — Use standalone or integrate with Claude/Codex/Cursor
- **Skill Packages** — Installable agent skills for each workflow

## Quick Start

```bash
# Install
pip install -e ".[dev]"

# Quick scrape
kb-forge scrape https://docs.devin.ai --name devin-docs

# Build autonomously (GAN-harness)
kb-forge build "Devin docs from https://docs.devin.ai"

# Query
kb-forge query "How do I start a Devin session?" --kb devin-docs

# List all KBs
kb-forge list-kbs
```

## Installation

### Python (CLI)

```bash
cd kb-forge
pip install -e ".[dev]"
```

### Claude Desktop (MCP)

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kb-forge": {
      "command": "python",
      "args": ["-m", "kb_forge.mcp_server"]
    }
  }
}
```

### Cursor (Plugin)

Copy `skills/` directory to your Cursor workspace `.cursor/skills/kb-forge/`:

```bash
mkdir -p ~/.cursor/skills
ln -s $(pwd)/skills ~/.cursor/skills/kb-forge
```

### Codex (CLI)

```bash
# Add to PATH
export PATH="$PATH:$(pwd)/src"

# Use in Codex
kb-forge scrape https://docs.example.com
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    KB-Forge System                          │
├─────────────────────────────────────────────────────────────┤
│  CLI          │  MCP Server    │  Agent Skills              │
│  ─────────────┼────────────────┼────────────────────────  │
│  scrape       │  kb_scrape     │  skill-kb-scrape         │
│  build        │  kb_build      │  skill-kb-context        │
│  list-kbs     │  kb_list       │  skill-kb-query          │
│  query        │  kb_query      │                            │
├─────────────────────────────────────────────────────────────┤
│  Core Components                                              │
│  ─────────────────────────────────────────────────────────    │
│  Scraper → ContextEngine → StorageManager → KBIndex           │
├─────────────────────────────────────────────────────────────┤
│  Storage Backends                                             │
│  ─────────────────────────────────────────────────────────    │
│  Markdown (flat files) │ Obsidian (vault with wiki-links)    │
│  ChromaDB (vectors)    │ Hybrid (SQLite + files + vectors)   │
├─────────────────────────────────────────────────────────────┤
│  GAN-Style Agent Harness (kb_builder_harness)               │
│  ─────────────────────────────────────────────────────────    │
│  Planner → Generator → Evaluator → (loop until pass)        │
└─────────────────────────────────────────────────────────────┘
```

## Commands

### Manual Workflow

```bash
# Scrape single page
kb-forge scrape https://docs.example.com/page --depth single

# Scrape full documentation site
kb-forge scrape https://docs.example.com --depth full --storage hybrid

# Scrape section
kb-forge scrape https://docs.example.com/api --depth section --mode permanent
```

### Autonomous Workflow (GAN-Harness)

```bash
# Let the agent build it for you
kb-forge build "Build me a KB of the Devin documentation from https://docs.devin.ai"

# With options
kb-forge build "Devin docs" --max-iter 15 --threshold 8.0
```

## Development

```bash
# Run tests
pytest -v

# Run specific test file
pytest tests/test_advanced_backends.py -v

# Format
black src/ tests/
ruff check src/ tests/
```

## Project Structure

```
kb-forge/
├── src/kb_forge/           # Core library
│   ├── scraper.py          # Content extraction
│   ├── context_engine.py     # Chunking & embedding prep
│   ├── storage.py          # Backend management
│   ├── kb_index.py         # Vector indexing
│   ├── cli.py              # Typer CLI
│   ├── mcp_server.py       # FastMCP server
│   └── agents/             # GAN harness
│       └── kb_builder_harness/
│           ├── harness.py
│           ├── planner_agent.md
│           ├── generator_agent.md
│           └── evaluator_agent.md
├── skills/                 # Agent skill packages
│   ├── skill-kb-scrape/
│   ├── skill-kb-context/
│   └── skill-kb-query/
├── tests/                  # Pytest suite
└── pyproject.toml
```

## License

MIT
