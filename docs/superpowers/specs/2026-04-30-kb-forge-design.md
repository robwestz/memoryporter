# KB-Forge Design Specification

> Knowledge Base Forge — Multi-agent system for scraping, structuring, and making knowledge usable for AI agents.

**Date:** 2026-04-30  
**Status:** Approved for implementation  
**Scope:** CLI tool + MCP server + Skills + GAN-style autonomous agent

---

## 1. Purpose

Build a system that:
1. Scrapes documentation/knowledge from URLs (entire site, section, or specific pages)
2. Stores it systematically with context-engineering optimizations
3. Makes it retrievable for AI agents without reading massive amounts of text
4. Can be used manually (skills) OR autonomously (GAN-harness agent)

---

## 2. Architecture Overview

```
kb-forge/
├── core/                      # Shared Python library
│   ├── scraper.py            # Web scraping via Firecrawl/Tavily MCP
│   ├── storage.py            # Storage backend abstraction
│   ├── context_engine.py     # Chunking, embeddings, retrieval
│   ├── kb_index.py           # Vector index + metadata management
│   └── backends/             # Storage backend implementations
│       ├── markdown_backend.py
│       ├── obsidian_backend.py
│       ├── chroma_backend.py
│       └── hybrid_backend.py
│
├── cli/                       # Command-line interface
│   └── kb-forge              # Main entry point
│
├── mcp-server/                # MCP server for Claude/Codex
│   └── server.py             # Tools: scrape, index, query, build
│
├── skills/                    # Standalone skills (manual use)
│   ├── skill-kb-scrape/      # Skill 1: Content scraping
│   ├── skill-kb-context/     # Skill 2: Context engineering
│   └── skill-kb-query/       # Skill 3: KB querying
│
└── agents/                    # GAN-style autonomous agents
    └── kb-builder-harness/   # Autonomous KB builder
        ├── planner_agent.md   # Defines KB scope
        ├── generator_agent.md # Scrapes, structures, indexes
        ├── evaluator_agent.md # Quality control
        ├── harness.py         # Orchestrator
        └── config.yaml        # Iterations, thresholds, criteria
```

---

## 3. Core Components

### 3.1 Scraper (`scraper.py`)

**Responsibility:** Fetch content from URLs via MCP tools

**Input:** URL + scope mode:
- `full` — entire site crawl
- `section` — all pages under URL path
- `single` — specific URL only

**Output:** Raw markdown files

**Dependencies:** Firecrawl MCP or Tavily MCP

### 3.2 Storage (`storage.py` + backends/)

**Responsibility:** Abstract storage interface with multiple backends

**Backends:**

| Backend | Use Case | Structure |
|---------|----------|-----------|
| `markdown` | Quick, portable, git-friendly | `~/kb/<name>/docs/**/*.md` |
| `obsidian` | Visualization, graph view needed | `~/ObsidianVault/<name>/` |
| `chroma` | Vector-only RAG | `~/.kb-forge/indices/<name>.chroma/` |
| `hybrid` | Full-featured long-term KB | `~/.kb-forge/kb/<name>/{docs/, index.db, vectors/}` |

**Agent Selection Logic:**
```
Purpose → Backend suggestion (user can override)
- Quick project reference → markdown
- Exploration/visualization → obsidian
- RAG-only search → chroma
- Long-term knowledge base → hybrid
```

### 3.3 Context Engine (`context_engine.py`)

**Responsibility:** Transform scraped content into agent-optimized format

**Functions:**
- **Chunking:** Semantic boundaries (headings, paragraphs) vs fixed-size
- **Embeddings:** sentence-transformers (local, no API cost)
- **Metadata:** Source URL, crawl date, section hierarchy
- **Retrieval:** Hybrid search (vector + keyword)

### 3.4 KB Index (`kb_index.py`)

**Responsibility:** Manage the vector index and metadata

**Features:**
- ChromaDB persistence
- Incremental updates (only changed content)
- Version snapshots
- Manifest with tags, relations, source URLs

---

## 4. Storage Strategies

### 4.1 Lifecycle Modes

**Temporärt (`--mode=temp`):**
```
~/.kb-forge/temp/<session-id>-<name>/
├── raw/              # Unprocessed markdown
├── chunks.json       # Simple chunking, no embeddings
└── expires: 30 days  # Auto-cleanup
```
- Fast scraping, minimal processing
- No vector index
- Perfect for: one-time project needs

**Permanent (`--mode=permanent`):**
```
~/.kb-forge/kb/<name>/
├── docs/             # Structured markdown (hierarchical)
├── index/
│   ├── chroma/       # Vector embeddings
│   ├── metadata.json # KB metadata, version
│   └── manifest.yaml # Structure, tags, relations
└── snapshots/        # Version history
```
- Full vector indexing
- Hierarchical organization
- Manual or scheduled updates

### 4.2 Backend-Specific Details

**Markdown Backend:**
- Flat file structure
- Git-trackable
- No special tooling needed
- Chunking stored as separate files: `doc.md` → `doc_chunk_001.md`

**Obsidian Backend:**
- Compatible with Obsidian vault structure
- Generates `[[wiki-links]]` between related docs
- Includes `.obsidian/` config for graph view
- Frontmatter metadata in each note

**Chroma Backend:**
- Vector-only (no raw files)
- Optimized for retrieval
- Minimal disk usage
- Requires ChromaDB client to query

**Hybrid Backend:**
- SQLite database for metadata and relations
- Raw markdown files for content
- Chroma vector index for retrieval
- Most complete but highest overhead

---

## 5. Data Flow

### 5.1 Manual Flow (via Skills)

```
User: "scrape https://docs.devin.ai --mode=permanent --storage=obsidian"
    ↓
Skill: skill-kb-scrape
    ↓
Core: scraper.fetch(url) → raw/ folder
    ↓
Core: context_engine.chunk() → structured docs/
    ↓
Core: storage.save(backend=obsidian) → ~/ObsidianVault/devin-docs/
    ↓
Core: kb_index.build() → vector index + metadata
    ↓
Output: KB ready for querying
```

### 5.2 Autonomous Flow (via GAN-harness)

```
User: "build KB for https://docs.devin.ai"
    ↓
Planner Agent: Define scope (full site? section? specific pages?)
    ↓
Generator Agent: Scrape → Structure → Index
    ↓
Evaluator Agent: Test retrievability, coverage, structure quality
    ↓
Feedback → Generator (iterate until threshold met)
    ↓
Final KB delivered with quality score
```

---

## 6. Skill Structure (skill-forge Pattern)

Each skill follows the portable-kit skill-forge format:

```
skill-kb-<name>/
├── SKILL.md              # Main skill definition
├── README.md             # Installation and usage
├── metadata.json         # Package metadata
├── templates/            # Output templates (if applicable)
├── references/           # Documentation references
└── examples/             # Worked examples
```

### 6.1 Skill 1: kb-scrape

**Triggers:** "scrape docs", "get documentation", "crawl site"

**Parameters:**
- `url` — target URL
- `mode` — `full` | `section` | `single`
- `storage` — `markdown` | `obsidian` | `chroma` | `hybrid`
- `lifecycle` — `temp` | `permanent`

### 6.2 Skill 2: kb-context

**Triggers:** "prepare context", "index for RAG", "make retrievable"

**Parameters:**
- `kb_name` — which KB to process
- `chunk_strategy` — `semantic` | `fixed`
- `embedding_model` — default: `all-MiniLM-L6-v2`

### 6.3 Skill 3: kb-query

**Triggers:** "ask KB", "query knowledge base", "search docs"

**Parameters:**
- `kb_name` — which KB to query
- `question` — natural language query
- `top_k` — number of results (default: 5)

---

## 7. GAN-Harness for KB Building

### 7.1 Three Agents

| Agent | Role | Output |
|-------|------|--------|
| **Planner** | Define KB scope | Scope spec: URLs, depth, structure |
| **Generator** | Build the KB | Scraped + indexed content |
| **Evaluator** | Quality control | Scorecard + feedback |

### 7.2 Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Coverage** | 0.3 | Did we get all the important content? |
| **Structure** | 0.25 | Is the organization logical and navigable? |
| **Retrievability** | 0.25 | Can the agent find relevant content quickly? |
| **Chunk Quality** | 0.2 | Are chunks semantically coherent? |

**Scoring:** 1-10 per criterion, weighted sum → pass if ≥ 7.0

### 7.3 Iteration Loop

```
Planner → Generator (iteration 1) → Evaluator
                              ↓
                        Score ≥ 7.0?
                        /          \
                    Yes             No
                    ↓                ↓
                Done          Feedback to Generator
                                    ↓
                              Generator (iteration N)
```

**Max iterations:** 10 (configurable)

---

## 8. CLI/API Interface

### 8.1 CLI Commands

```bash
# Scrape
kb-forge scrape <url> [--mode=temp|permanent] [--storage=markdown|obsidian|chroma|hybrid] [--depth=full|section|single]

# Index existing content
kb-forge index <path> [--kb-name=<name>] [--storage=hybrid]

# Query
kb-forge query <question> --kb=<name> [--top-k=5]

# Autonomous build (GAN-harness)
kb-forge build <url-or-spec> [--autonomous] [--max-iterations=10]

# List KBs
kb-forge list [--all | --temp | --permanent]

# Update
kb-forge update <kb-name>  # Re-scrape sources, re-index

# Export
kb-forge export <kb-name> --format=obsidian|markdown --out=<path>
```

### 8.2 MCP Tools

| Tool | Description |
|------|-------------|
| `kb_scrape` | Scrape URL to KB |
| `kb_index` | Index content for retrieval |
| `kb_query` | Query KB, return relevant chunks |
| `kb_list` | List available KBs |
| `kb_build` | Autonomous KB build (calls harness) |
| `kb_update` | Update existing KB from sources |

---

## 9. Implementation Phases

### Phase 1: Core (MVP)
- [ ] `scraper.py` with Firecrawl MCP integration
- [ ] `storage.py` with markdown backend
- [ ] `context_engine.py` with basic chunking
- [ ] CLI with `scrape`, `index`, `query` commands

### Phase 2: Skills
- [ ] `skill-kb-scrape` (minimal shape)
- [ ] `skill-kb-context` (minimal shape)
- [ ] `skill-kb-query` (minimal shape)

### Phase 3: MCP Server
- [ ] MCP server with 6 tools
- [ ] Integration testing with Claude/Codex

### Phase 4: Advanced Storage
- [ ] Obsidian backend
- [ ] Chroma backend
- [ ] Hybrid backend

### Phase 5: GAN-Harness
- [ ] Planner agent prompt
- [ ] Generator agent prompt
- [ ] Evaluator agent prompt
- [ ] Harness orchestrator

---

## 10. Anti-Patterns

1. **Don't store raw HTML** — Always convert to markdown for agent consumption
2. **Don't hardcode paths** — Use configurable KB root directory
3. **Don't ignore chunk boundaries** — Semantic chunks > fixed-size for retrieval quality
4. **Don't skip metadata** — Source URLs, dates essential for trust
5. **Don't over-chunk** — Each chunk should be semantically complete
6. **Don't forget cleanup** — Temp KBs should auto-expire

---

## 11. Success Criteria

- [ ] Can scrape devin.ai docs and build retrievable KB in < 5 min
- [ ] Can query KB and get relevant context for agent tasks
- [ ] Skills work standalone in Claude, Codex, Cursor
- [ ] GAN-harness can autonomously build quality KB (score ≥ 7.0)
- [ ] Multiple storage backends work (markdown, obsidian, hybrid)

---

## 12. References

- portable-kit `skill-forge/SKILL.md` — skill package structure
- portable-kit `agent-orchestration.md` — multi-agent patterns
- GAN-style harness from `everything-claude-code/skills/gan-style-harness/`
- Firecrawl MCP for web scraping
- Tavily MCP for research-enhanced scraping
