# Agent Onboarding — Read This First

You have access to an **Agentic Starter Kit** — a curated knowledge base for building AI agents. This file tells you exactly what's here and how to use it in 2 minutes.

## What This Kit Contains

**43 files. Zero runnable code. Pure knowledge.**

| Category | Count | Location | Format |
|----------|-------|----------|--------|
| Gamechangers | 15 | `knowledge/gamechangers/` | Markdown: What, Why, How, Code Pattern |
| Skills | 15 | `knowledge/skills/` | Markdown: Steps, Code Template, Verification |
| Agent Blueprints | 5 | `knowledge/agents/` | Markdown: Role, Tools, System Prompt, Constraints |
| Scaffolds | 3 | `scaffolds/` | Markdown: Rust, TypeScript, Python project templates |
| Protocols | 2 | `protocols/` | Markdown: Quality protocol, orchestration patterns |
| Meta | 4 | Root | CLAUDE.md, INDEX.md, GAPS.md, this file |

## How to Navigate

```
Need to understand WHY → read a gamechanger
Need to know HOW      → read the matching skill
Need to BUILD         → read a scaffold
Need a SPECIALIST     → spawn an agent blueprint
Need QUALITY          → apply a protocol
Need to EXTEND        → read GAPS.md
```

## The 5 Most Important Files

1. **`INDEX.md`** — catalog of everything with one-liners
2. **`knowledge/gamechangers/gc_generic_runtime.md`** — the foundational pattern (trait-generic runtime)
3. **`knowledge/skills/skill_build_agentic_loop.md`** — step-by-step to build a working agent
4. **`scaffolds/rust-agent.md`** (or typescript/python) — full project layout ready to implement
5. **`GAPS.md`** — what's missing and the build order to fill it

## Quick Start: Build an Agent in 30 Minutes

1. Read the scaffold for your language (`scaffolds/{lang}-agent.md`)
2. Create the project structure it describes
3. Implement the core traits/interfaces (ApiClient, ToolExecutor)
4. Build the agentic loop following `skill_build_agentic_loop.md`
5. Add permission checking following `skill_tool_permission_system.md`
6. Add session persistence following `skill_session_management.md`
7. Test with a mock API client that returns canned responses

## Quick Start: Analyze a Codebase

1. Spawn a **Deep Code Analyst** using `knowledge/agents/agent_deep_analyst.md`
2. Give it ReadOnly access to the target codebase
3. It produces structured knowledge facts (JSON)
4. Feed facts to a **Skill Synthesizer** (`agent_skill_synthesizer.md`)
5. Result: reusable skills extracted from any codebase

## Pattern Lookup Table

| "I need..." | Read this gamechanger | Then this skill |
|-------------|----------------------|-----------------|
| A multi-turn agent | `gc_generic_runtime` | `skill_build_agentic_loop` |
| To save conversations | `gc_session_snapshot` | `skill_session_management` |
| Access control | `gc_permission_escalation` | `skill_tool_permission_system` |
| Cost control | `gc_pre_turn_budget` | `skill_token_budget` |
| Plugin system | `gc_shell_hooks` | `skill_hook_system` |
| Health monitoring | `gc_doctor_pattern` | `skill_doctor_pattern` |
| Long conversations | `gc_auto_compaction` | (embedded in agentic loop) |
| External tools | `gc_multi_transport_mcp` | `skill_mcp_client` |
| Parallel agents | `gc_subagent_spawning` | `skill_sub_agent_spawning` |
| Persistent memory | `gc_memory_system` | `skill_memory_system` |

## Code Templates Are Rust — But Patterns Are Universal

Every code template uses Rust syntax. To adapt to another language:
- `trait` → TypeScript `interface` / Python `ABC`
- `struct` → TypeScript `class` / Python `@dataclass`
- `impl` → method bodies on the class
- `Result<T, E>` → try/catch / exceptions
- `Vec<T>` → array / list
- `Option<T>` → `T | undefined` / `T | None`

The patterns (trait-generic runtime, permission escalation, session snapshots) are identical regardless of language.

## What's NOT Here (See GAPS.md)

- No runnable code (knowledge only — you build the code)
- No evaluation framework (can't measure agent quality yet)
- No MCP server implementations (protocol described, not implemented)
- No prompt template library (architecture covered, prompts not)
- No streaming UI (headless only)
- No multi-model adapters (Anthropic assumed)
- No observability (no tracing, no metrics)
- No safety layer implementation (pattern described, not built)

Each gap has a "how to extend" section in `GAPS.md` with the recommended build order.
