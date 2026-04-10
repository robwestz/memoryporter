# Snowball Agent

Knowledge extraction system for Rust codebases. Reads source code, identifies architectural patterns, and generates skills, agent blueprints, and gamechanger documents.

## What it does

```
Source Code (.rs files)
    |
    v
[Extractor] --- traits, structs, enums, impl blocks, async flows, design patterns
    |
    v
[Knowledge Base] --- 176 categorized facts with impact scoring and cross-references
    |
    v
[Generators] --- skills (15), agent blueprints (5), gamechangers (17)
    |
    v
[Output] --- markdown files, JSON knowledge base, MCP gateway
```

## Build

```bash
cd rust/crates/snowball-agent
cargo build --release
```

Produces two binaries:
- `snowball` — runs extraction
- `snowball-mcp` — MCP gateway server

## Usage

### Extract knowledge from a codebase

```bash
snowball <source_dir> <output_dir>
```

Example:
```bash
snowball ../claw-code-main/rust/crates ./extraction
```

Output:
```
extraction/
  SUMMARY.md           # Statistics and overview
  INDEX.md             # Links to all generated files
  SKILLS.md            # Skills report
  AGENTS.md            # Agent blueprints report
  knowledge_base.json  # Raw knowledge base (all facts)
  skills/              # Individual skill files (Buildr vault format)
  agents/              # Individual agent blueprint files
  gamechangers/        # Individual gamechanger docs + GAMECHANGERS.md
```

### MCP Gateway

Expose the knowledge base to Claude Code (or any MCP client) via stdio:

```bash
snowball-mcp <extraction_dir> [--source-root <path>]
```

The `--source-root` flag enables the `reextract` tool for live refresh.

### Connect to Claude Code

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "snowball-knowledge": {
      "command": "/path/to/snowball-mcp",
      "args": [
        "/path/to/extraction",
        "--source-root",
        "/path/to/source/crates"
      ]
    }
  }
}
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `search_knowledge` | Search facts by keyword, category, or impact level |
| `get_gamechangers` | List all transformative patterns with code examples |
| `get_skills` | List generated skills with steps and verification |
| `get_agents` | List agent blueprints with tools and prompts |
| `get_fact` | Get a specific fact by ID |
| `get_summary` | Get extraction statistics |
| `reextract` | Re-run extraction and reload (requires `--source-root`) |

## MCP Resources

| URI | Content |
|-----|---------|
| `extraction://summary` | SUMMARY.md |
| `extraction://index` | INDEX.md |
| `extraction://gamechangers` | GAMECHANGERS.md |
| `extraction://knowledge_base` | knowledge_base.json |

## Architecture

```
src/
  lib.rs           # Module exports and re-exports
  agent.rs         # SnowballAgent orchestrator (iterate → generate → write)
  extractor.rs     # Rust source code pattern analyzer
  knowledge.rs     # KnowledgeBase with categories, scoring, relations
  gamechanger.rs   # Transformative pattern detector (10 known + detected)
  skill_gen.rs     # Buildr-compatible vault skill generator
  agent_gen.rs     # Agent blueprint generator
  output.rs        # Output formatters and file writer
  mcp_server.rs    # MCP JSON-RPC 2.0 gateway
  main.rs          # CLI binary (snowball)
  mcp_gateway.rs   # MCP binary (snowball-mcp)
```

## Pattern Categories

| Category | What it covers |
|----------|---------------|
| Agentic Loop | Conversation runtime, turn execution, API integration |
| Tool System | Tool specs, execution, slash commands, file ops |
| MCP Protocol | Multi-transport client, JSON-RPC, tool discovery |
| Permission Model | Modes, policies, escalation, authorization |
| Session Management | Persistence, compaction, messages, resume |
| Configuration Hierarchy | Scoped config, merging, feature flags |
| Hook System | Pre/post tool hooks, shell-based extension |
| Sub-Agent | Spawning, tool restriction, manifest tracking |
| Streaming & SSE | SSE parsing, markdown rendering, terminal output |
| Error Handling | Error types, retry, backoff |
| Cost & Usage Tracking | Token counting, pricing, cost estimation |
| Trait-Based Extensibility | Core traits and their implementations |
| Design Pattern | Higher-level architectural patterns |
