# KB-Forge Implementation Plan (with DoD)

> **Execution Mode:** Team-based subagent development with checkpoint evaluation
> **Team Structure:** 2 Implementers (Architect + Craftsman) + 2 Evaluators (Strict Inspector + Consensus Facilitator)
> **DoD Policy:** NO task completes until ALL DoD items are verified

---

## Team Structure

### Implementers (Dispatch one per task, alternate)

| Agent | Personality | Specialty | Best For |
|-------|-------------|-----------|----------|
| **Architect** | Systematic, interface-obsessed | Architecture, APIs, module design | Core modules, interfaces |
| **Craftsman** | Detail-obsessed, TDD-focused | Implementation, tests, quality | Tests, CLI, skills |

### Evaluators (Dispatch at EVERY checkpoint)

| Agent | Personality | Specialty | Checkpoint Role |
|-------|-------------|-----------|-----------------|
| **Strict Inspector** | Ruthless, detail-obsessed | Finding bugs, gaps, edge cases | Review implementation |
| **Consensus Facilitator** | Diplomatic, systematic | Synthesizing, decision-making | Resolve conflicts, decide go/no-go |

---

## Checkpoint Protocol

Every task has 3 checkpoints:

```
CHECKPOINT 1: Interface/Design Complete
├── Architect/Craftsman implements skeleton
├── Strict Inspector evaluates
├── Consensus Facilitator decides: GO / FIX / REDO
└── (NO task proceeds until checkpoint passed)

CHECKPOINT 2: Core Implementation Complete
├── Implementer builds core logic
├── Strict Inspector evaluates
├── Consensus Facilitator decides: GO / FIX / REDO
└── (NO task proceeds until checkpoint passed)

CHECKPOINT 3: Tests & Final Review
├── Tests written, all passing
├── Strict Inspector evaluates
├── Consensus Facilitator gives final GO/NO-GO
└── (Task NOT marked complete until final GO)
```

**Rule:** If evaluator finds issues → implementer fixes → evaluator re-reviews → consensus decides. **No proceeding to next checkpoint with open issues.**

---

## Phase 1: Project Setup

### Task 1: Initialize Python Project

**DoD (Definition of Done):**
- [ ] `pyproject.toml` valid and parseable
- [ ] All 6 directories created with `__init__.py` where needed
- [ ] `pip install -e .` succeeds without errors
- [ ] `kb-forge --help` runs and shows help
- [ ] Git commit with clear message exists
- [ ] No placeholder content in any file

**Files:**
- Create: `kb-forge/pyproject.toml`
- Create: `kb-forge/README.md`
- Create: `kb-forge/src/kb_forge/__init__.py`

**Checkpoints:**
- CP1: pyproject.toml written, directory structure designed
- CP2: All directories created, `__init__.py` files in place
- CP3: Installation verified, CLI runs

---

## Phase 2: Core Components

### Task 2: Scraper Module

**DoD:**
- [ ] `Scraper` class with `scrape()` and `scrape_batch()` methods
- [ ] `ScrapeScope` enum with SINGLE, SECTION, FULL
- [ ] MCP integration placeholder (ready for Firecrawl/Tavily)
- [ ] Tests: initialization, single scrape (mocked), batch scrape
- [ ] All tests pass with `pytest`
- [ ] Docstrings for all public methods
- [ ] Error handling for invalid URLs
- [ ] Committed with message "feat: add scraper module"

**Files:**
- Create: `kb-forge/src/kb_forge/scraper.py`
- Create: `kb-forge/tests/test_scraper.py`

**Checkpoints:**
- CP1: Interface defined (Scraper class, methods, signatures)
- CP2: Implementation complete with MCP placeholder
- CP3: Tests passing, edge cases handled

---

### Task 3: Storage Backend Base + Markdown Backend

**DoD:**
- [ ] `StorageManager` class with backend registry
- [ ] `MarkdownBackend` with create_kb(), save_document(), get_document()
- [ ] Backend abstraction allowing other backends
- [ ] Tests: manager initialization, backend retrieval, KB creation
- [ ] Placeholder backends for Obsidian, Chroma, Hybrid (exist, stubbed)
- [ ] All tests pass
- [ ] Docstrings complete
- [ ] Error handling for unknown backends
- [ ] Committed

**Files:**
- Create: `kb-forge/src/kb_forge/storage.py`
- Create: `kb-forge/src/kb_forge/backends/__init__.py`
- Create: `kb-forge/src/kb_forge/backends/markdown.py`
- Create: `kb-forge/src/kb_forge/backends/obsidian.py` (stub)
- Create: `kb-forge/src/kb_forge/backends/chroma.py` (stub)
- Create: `kb-forge/src/kb_forge/backends/hybrid.py` (stub)
- Create: `kb-forge/tests/test_storage.py`

**Checkpoints:**
- CP1: StorageManager interface, backend abstraction designed
- CP2: MarkdownBackend implemented, stubs created
- CP3: Tests passing, all backends importable

---

### Task 4: Context Engine

**DoD:**
- [ ] `ContextEngine` class with `chunk()` method
- [ ] `ChunkStrategy` enum: SEMANTIC, FIXED
- [ ] Semantic chunking by headings/paragraphs
- [ ] Fixed-size chunking with overlap
- [ ] `prepare_for_embedding()` method
- [ ] Tests: both strategies, chunk sizes, overlap
- [ ] All tests pass
- [ ] Docstrings complete
- [ ] Edge cases: empty content, very long content
- [ ] Committed

**Files:**
- Create: `kb-forge/src/kb_forge/context_engine.py`
- Create: `kb-forge/tests/test_context_engine.py`

**Checkpoints:**
- CP1: Chunking strategies defined, interfaces set
- CP2: Both chunking implementations complete
- CP3: Tests cover edge cases, all passing

---

### Task 5: KB Index (Vector Store)

**DoD:**
- [ ] `KBIndex` class with ChromaDB integration
- [ ] `initialize()`, `add_document()`, `query()` methods
- [ ] Manifest management (YAML)
- [ ] Embedding computation with sentence-transformers
- [ ] Tests: initialization, add document, query (with embed=False for mock)
- [ ] All tests pass
- [ ] Docstrings complete
- [ ] Error handling: missing KB, query errors
- [ ] Committed

**Files:**
- Create: `kb-forge/src/kb_forge/kb_index.py`
- Create: `kb-forge/tests/test_kb_index.py`

**Checkpoints:**
- CP1: ChromaDB integration designed, manifest format defined
- CP2: Core methods implemented
- CP3: Tests passing, embeddings work

---

## Phase 3: CLI Interface

### Task 6: CLI Commands

**DoD:**
- [ ] `cli.py` with Typer app
- [ ] `scrape` command: URL, mode, storage, depth, name options
- [ ] `list` command: lifecycle filter
- [ ] `query` command: question, KB name, top-k
- [ ] All commands use core modules (not standalone logic)
- [ ] Help text for all commands
- [ ] Tests: CLI runs without error (integration test)
- [ ] `kb-forge --help` shows all commands
- [ ] Committed

**Files:**
- Create: `kb-forge/src/kb_forge/cli.py`
- Modify: `kb-forge/src/kb_forge/__init__.py` (add main export)
- Create: `kb-forge/tests/test_cli.py`

**Checkpoints:**
- CP1: Command structure defined, Typer app skeleton
- CP2: All three commands implemented
- CP3: CLI tested, help works, commands runnable

---

## Phase 4: Skills (skill-forge Pattern)

### Task 7: skill-kb-scrape Package

**DoD:**
- [ ] `SKILL.md` with frontmatter, triggers, parameters, examples
- [ ] `README.md` with installation, usage, troubleshooting
- [ ] `metadata.json` valid JSON with all required fields
- [ ] Follows skill-forge pattern from portable-kit
- [ ] No TODOs or placeholders
- [ ] All files committed

**Files:**
- Create: `kb-forge/skills/skill-kb-scrape/SKILL.md`
- Create: `kb-forge/skills/skill-kb-scrape/README.md`
- Create: `kb-forge/skills/skill-kb-scrape/metadata.json`

**Checkpoints:**
- CP1: SKILL.md structure defined
- CP2: All three files written
- CP3: Reviewed against skill-forge quality gate

---

### Task 8: skill-kb-context Package

**DoD:**
- [ ] `SKILL.md` complete
- [ ] `README.md` complete
- [ ] `metadata.json` valid
- [ ] Follows skill-forge pattern
- [ ] No TODOs
- [ ] Committed

**Files:**
- Create: `kb-forge/skills/skill-kb-context/SKILL.md`
- Create: `kb-forge/skills/skill-kb-context/README.md`
- Create: `kb-forge/skills/skill-kb-context/metadata.json`

**Checkpoints:** Same as Task 7

---

### Task 9: skill-kb-query Package

**DoD:**
- [ ] `SKILL.md` complete
- [ ] `README.md` complete
- [ ] `metadata.json` valid
- [ ] Follows skill-forge pattern
- [ ] No TODOs
- [ ] Committed

**Files:**
- Create: `kb-forge/skills/skill-kb-query/SKILL.md`
- Create: `kb-forge/skills/skill-kb-query/README.md`
- Create: `kb-forge/skills/skill-kb-query/metadata.json`

**Checkpoints:** Same as Task 7

---

## Phase 5: MCP Server

### Task 10: MCP Server Implementation

**DoD:**
- [ ] `mcp_server.py` with FastMCP
- [ ] 5 tools: kb_scrape, kb_list, kb_query, kb_build, kb_update
- [ ] Each tool has proper type hints and docstrings
- [ ] Tools delegate to core modules (no duplication)
- [ ] Server runs with `python -m kb_forge.mcp_server`
- [ ] MCP inspector or similar can connect
- [ ] Committed

**Files:**
- Create: `kb-forge/src/kb_forge/mcp_server.py`

**Checkpoints:**
- CP1: Tool interfaces defined, FastMCP app skeleton
- CP2: All 5 tools implemented
- CP3: Server runs, tools callable

---

## Phase 6: Advanced Backends

### Task 11: Complete Obsidian Backend

**DoD:**
- [ ] Full `ObsidianBackend` implementation
- [ ] Creates `.obsidian/` config
- [ ] Generates wiki-links between documents
- [ ] Frontmatter metadata in each note
- [ ] Tests: create KB, save doc, get doc, links generated
- [ ] All tests pass
- [ ] Committed

**Files:**
- Modify: `kb-forge/src/kb_forge/backends/obsidian.py`
- Create: `kb-forge/tests/test_obsidian_backend.py`

**Checkpoints:**
- CP1: Obsidian vault structure designed
- CP2: Backend implemented with wiki-links
- CP3: Tests passing

---

### Task 12: Complete Hybrid Backend

**DoD:**
- [ ] Full `HybridBackend` implementation
- [ ] SQLite for metadata
- [ ] Raw files for content
- [ ] Chroma vectors for retrieval
- [ ] All three layers stay in sync
- [ ] Tests: CRUD operations, sync verification
- [ ] All tests pass
- [ ] Committed

**Files:**
- Modify: `kb-forge/src/kb_forge/backends/hybrid.py`
- Create: `kb-forge/tests/test_hybrid_backend.py`

**Checkpoints:**
- CP1: Three-layer architecture designed
- CP2: Backend implemented with sync logic
- CP3: Tests verify all layers stay synced

---

## Phase 7: GAN-Harness (Autonomous Agent)

### Task 13: Create Agent Prompts

**DoD:**
- [ ] `planner_agent.md` with role, input, output format, questions
- [ ] `generator_agent.md` with role, tools, process, iteration protocol
- [ ] `evaluator_agent.md` with role, criteria (4 weighted), testing protocol
- [ ] All prompts follow GAN-style from reference skill
- [ ] Evaluator prompt engineered to be ruthlessly strict
- [ ] Committed

**Files:**
- Create: `kb-forge/agents/kb-builder-harness/planner_agent.md`
- Create: `kb-forge/agents/kb-builder-harness/generator_agent.md`
- Create: `kb-forge/agents/kb-builder-harness/evaluator_agent.md`

**Checkpoints:**
- CP1: Agent roles and interaction defined
- CP2: All three prompts written
- CP3: Reviewed against GAN-style skill

---

### Task 14: Create Harness Orchestrator

**DoD:**
- [ ] `harness.py` with `KBBuilderHarness` class
- [ ] `run()` method: planner → generate-eval loop
- [ ] `_run_planner()`, `_run_generator()`, `_run_evaluator()` methods
- [ ] `_write_feedback()` for iteration feedback
- [ ] `config.yaml` with iterations, thresholds, criteria weights
- [ ] Harness can be run from command line
- [ ] Committed

**Files:**
- Create: `kb-forge/agents/kb-builder-harness/harness.py`
- Create: `kb-forge/agents/kb-builder-harness/config.yaml`

**Checkpoints:**
- CP1: Harness loop designed, config format defined
- CP2: Harness implemented with all methods
- CP3: Runs without error (placeholders OK for LLM calls)

---

## Phase 8: Final Integration

### Task 15: End-to-End Test & Release

**DoD:**
- [ ] Full installation works: `pip install -e ".[dev]"`
- [ ] All tests pass: `pytest` shows 100% pass rate
- [ ] CLI works: `kb-forge --help`, `kb-forge list`
- [ ] Skills packages follow portable-kit skill-forge pattern
- [ ] MCP server runs
- [ ] No TODOs, FIXMEs, or placeholders in codebase
- [ ] Git history clean with meaningful commits
- [ ] README has quickstart example
- [ ] Final commit: "release: kb-forge v0.1.0"

**Files:**
- Modify: `kb-forge/README.md` (add quickstart)
- All previous files

**Checkpoints:**
- CP1: Integration plan defined
- CP2: All components installed and tested together
- CP3: Release ready, all DoD items verified

---

## Execution Commands

### Per Task Execution Flow

```bash
# 1. Read task spec
# 2. Dispatch Implementer (Architect or Craftsman)
#    - They stop at CP1, report status
# 3. Dispatch Evaluator (Strict Inspector)
#    - Review CP1 output
# 4. Dispatch Consensus Facilitator
#    - Decide: GO / FIX / REDO
#    - If FIX: implementer fixes, back to step 3
#    - If GO: proceed to next checkpoint
# 5. Repeat for CP2, CP3
# 6. Mark task complete ONLY after CP3 GO
# 7. Next task
```

### Team Prompts Location

Team prompts are in: `kb-forge/agents/team-prompts/`
- `implementer-architect.md`
- `implementer-craftsman.md`
- `evaluator-strict.md`
- `consensus-facilitator.md`

---

## Summary

| Phase | Tasks | DoD Policy |
|-------|-------|------------|
| 1 | 1 | Project structure |
| 2 | 4 | Core modules |
| 3 | 1 | CLI |
| 4 | 3 | Skills |
| 5 | 1 | MCP server |
| 6 | 2 | Advanced backends |
| 7 | 2 | GAN harness |
| 8 | 1 | Integration |

**Total: 15 tasks**
**Each task: 3 checkpoints with evaluation**
**Team: 2 implementers + 2 evaluators rotating**
**DoD: Mandatory checklist — NO exceptions**
