# KB-Forge

**Knowledge Base Forge** — A multi-agent system for scraping, structuring, and indexing documentation into vector stores.

## Overview

KB-Forge transforms unstructured documentation into searchable, structured knowledge bases. It provides:

- **Intelligent scraping** with retry logic and rate limiting
- **Multi-format support** (HTML, Markdown, PDF, structured data)
- **Vector storage** via ChromaDB with semantic embeddings
- **MCP integration** for agent tool compatibility
- **Fast CLI** powered by Typer

## Installation

```bash
pip install -e ".[dev]"
```

## Quick Start

```bash
# Show help
kb-forge --help

# Scrape a documentation site
kb-forge scrape https://docs.example.com --output ./knowledge-base

# Query the knowledge base
kb-forge query "How do I configure authentication?"
```

## Architecture

KB-Forge follows a modular architecture:

- **Scraper**: Content extraction with pluggable backends
- **StorageManager**: Persistent vector storage and indexing
- **ContextEngine**: Query processing and result ranking
- **KBIndex**: Unified interface for knowledge operations

## Development

```bash
# Run tests
pytest

# Format code
black src/ tests/
ruff check src/ tests/
```

## License

MIT
