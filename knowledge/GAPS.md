# What's Missing — Gaps & Extension Roadmap

This document maps what the starter kit does NOT have and how an agent could build it.

---

## Gap 1: No Runnable Code

**What's missing:** The kit is knowledge-only. No executable runtime, no `cargo build`, no `npm start`.

**Why it's a gap:** An agent reading this kit can understand patterns but must implement everything from scratch.

**How to extend:**
1. Pick a scaffold (`scaffolds/rust-agent.md`, `typescript-agent.md`, or `python-agent.md`).
2. Follow the scaffold step-by-step to generate a working crate/package.
3. Implement skills one at a time — start with `skill_build_agentic_loop.md`, then add features.
4. The reference Rust implementation exists in the parent repo (`../rust/crates/`) with 189 tests.

**Priority:** High. An agent's first task should be scaffolding a runtime.

---

## Gap 2: No Evaluation Framework

**What's missing:** No way to measure agent quality. No test harness for "did the agent produce correct output?" or "did it respect permissions?"

**Why it's a gap:** Without evaluation, you can't tell if a change improved or regressed the agent.

**How to extend:**
1. Create `evaluation/` directory with test scenarios.
2. Each scenario = input prompt + expected behavior (files created, tools used, permissions respected).
3. Build a harness that runs the agent against scenarios and scores results.
4. Track metrics: task completion rate, tool call accuracy, permission violations, token efficiency.

**Relevant patterns:**
- Gamechanger: Doctor Pattern (health validation)
- Skill: System Event Logging (audit trail for evaluation)

**Priority:** High. This is the difference between "it seems to work" and "it measurably works."

---

## Gap 3: No Real MCP Server Implementations

**What's missing:** The kit describes the MCP protocol but doesn't include ready-to-use MCP servers.

**Why it's a gap:** Agents need tool servers to be useful. Without MCP servers, tools must be built inline.

**How to extend:**
1. Build a `filesystem-mcp` server (read, write, edit, glob, grep) — the most universal toolset.
2. Build a `git-mcp` server (status, diff, commit, log, branch).
3. Build a `web-mcp` server (fetch, search).
4. Each server: stdio transport, JSON-RPC 2.0, `tools/list` + `tools/call`.

**Relevant patterns:**
- Gamechanger: Multi-Transport MCP
- Skill: Build MCP Client

**Priority:** Medium. You can start with inline tools and add MCP later.

---

## Gap 4: No Prompt Engineering Library

**What's missing:** No collection of system prompts, few-shot examples, or prompt templates for common agent tasks.

**Why it's a gap:** The quality of an agent is 50% architecture, 50% prompting. The kit covers architecture but not prompts.

**How to extend:**
1. Create `prompts/` directory.
2. Add system prompt templates for: coding agent, review agent, research agent, planning agent.
3. Include few-shot examples for tool use (how to call bash, read files, etc.).
4. Add anti-prompts (what NOT to say — reduces hallucination).
5. Template variables: `{{project_context}}`, `{{tool_list}}`, `{{permission_mode}}`.

**Priority:** Medium. Agents can function without templates but produce better results with them.

---

## Gap 5: No Streaming / UI Layer

**What's missing:** No terminal renderer, no web UI, no way to display agent output to humans.

**Why it's a gap:** A headless agent is useful for automation but not for interactive use.

**How to extend:**
1. Terminal: Use the Markdown Streaming gamechanger to build a renderer (Rust: `crossterm`, TS: `ink`, Python: `rich`).
2. Web: Build a simple WebSocket → React/Svelte UI that shows conversation + tool calls.
3. API: Wrap the runtime in an HTTP server (the claw-gateway pattern) for remote access.

**Relevant patterns:**
- Gamechanger: Markdown Streaming
- Gamechanger: SSE Incremental Parser
- Skill: Build Streaming Renderer

**Priority:** Low for automation, High for interactive use.

---

## Gap 6: No Multi-Model Support

**What's missing:** Code templates assume Anthropic API. No adapters for OpenAI, Ollama, or local models.

**Why it's a gap:** Different tasks benefit from different models. You want Claude for complex reasoning, GPT-4o for fast responses, local models for privacy.

**How to extend:**
1. Implement the ApiClient trait/interface for each provider.
2. Add a model selector in config: `{ "default": "claude-sonnet-4-20250514", "fallback": "gpt-4o" }`.
3. Use the Scoped Config gamechanger to let users override per-project.

**Relevant patterns:**
- Gamechanger: Generic Trait-Based Runtime (swap without touching core)
- Skill: Config Hierarchy

**Priority:** Medium. Start with one provider, add others when needed.

---

## Gap 7: No Observability / Telemetry

**What's missing:** No structured logging beyond the event system. No tracing, no metrics, no dashboards.

**Why it's a gap:** In production, you need to know: how long did each turn take? Which tools failed? What's the token cost trend?

**How to extend:**
1. Add OpenTelemetry spans around: API calls, tool executions, compaction.
2. Emit metrics: tokens_used, turn_duration_ms, tool_call_count, error_rate.
3. Export to stdout (JSON lines) or an OTLP collector.

**Relevant patterns:**
- Skill: System Event Logging
- Gamechanger: Doctor Pattern

**Priority:** Low initially, High for production.

---

## Gap 8: No Guard Rails / Safety Layer

**What's missing:** Permission system exists as a pattern but no concrete implementation of: command injection prevention, path traversal blocking, secret detection, output filtering.

**How to extend:**
1. Tool input validation: sanitize shell commands, validate file paths against allowed directories.
2. Output filtering: detect and mask API keys, passwords in agent responses.
3. Rate limiting: max tool calls per turn, max file writes per session.
4. Audit log: every tool call with input/output for post-hoc review.

**Relevant patterns:**
- Gamechanger: Permission Escalation
- Skill: Tool Permission System

**Priority:** High for any agent that runs shell commands.

---

## Summary: Build Order for an Agent

If an agent were to extend this kit from zero to production, this is the recommended order:

```
1. Scaffold runtime (Gap 1)          ← Day 1
2. Add guard rails (Gap 8)           ← Day 1 (before any tool use)
3. Build evaluation harness (Gap 2)  ← Day 2
4. Add prompt templates (Gap 4)      ← Day 3
5. Build MCP servers (Gap 3)         ← Week 1
6. Add streaming UI (Gap 5)          ← Week 2
7. Multi-model support (Gap 6)       ← When needed
8. Observability (Gap 7)             ← Before production
```
