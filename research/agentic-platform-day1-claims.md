# Research Claims — Day-1 Autonomous Agentic Platform

Scope: How to architect autonomous overnight agents that produce "wow" results day 1.
Extracted: 2026-04-16

## Claims Table

| ID | Statement | Source | Confidence | Evidence | Critical? |
|----|-----------|--------|------------|----------|-----------|
| C1 | Claude Code 2.0 has native scheduled tasks via `/loop` (recurring) and `/schedule` (one-time) commands | S1, Search | High | Authority | Yes |
| C2 | Routines are the official autonomous primitive — configured once, run on schedule/API/event, no approval prompts mid-run | S1, Search | High | Authority | Yes |
| C3 | Headless mode (`-p` flag) enables Claude Code in non-interactive automation contexts | S8, Search | High | Authority | Yes |
| C4 | Background subagents (Ctrl+B) run concurrently, auto-resume main agent on completion | S8 | High | Authority | No |
| C5 | Checkpoints are Anthropic's official rollback mechanism for autonomous work; restore "conversation, code, or both" | S1 | High | Authority | Yes |
| C6 | Hooks trigger actions at specific points (e.g., test suite after change, lint before commit) — primary automation mechanism | S1 | High | Authority | Yes |
| C7 | Agents "running their own tests" creates a "self-congratulation machine" — they verify their assumptions, not user intent | S3 | High | Empirical | Yes |
| C8 | External verification (separate LLM + browser automation) is the recommended pattern for overnight QA | S3 | High | Empirical | Yes |
| C9 | Spec-driven verification (acceptance criteria BEFORE execution) beats post-hoc review | S3 | Medium | Authority | Yes |
| C10 | Opslane/verify uses 4-stage pipeline: pre-flight → planning (Opus) → parallel execution (Sonnet via Playwright) → final judgment (Opus) | S3 | High | Empirical | No |
| C11 | Spec-driven verification cannot catch cases where the spec itself was wrong | S3 | High | Authority | Yes |
| C12 | 33,596 agent-authored PRs audited across Codex, Copilot, Devin, Cursor, Claude Code | S5 | High | Empirical | Yes |
| C13 | Over one-third of agent PRs receive no meaningful reviewer interaction (abandoned) | S5 | High | Empirical | Yes |
| C14 | Each failed CI check reduces merge probability by ~15% | S5 | High | Empirical | Yes |
| C15 | Agents fail due to social/organizational gaps (lack of repo context, scope creep), not just technical defects | S5 | High | Empirical | Yes |
| C16 | Merged PRs touch fewer files than rejected ones — restraint correlates with success | S5 | High | Empirical | Yes |
| C17 | Knowledge bases transform agents from reactive to proactive; prevent hallucinations; align with org standards | S2 | High | Consensus | Yes |
| C18 | LinkedIn's CAPT framework achieved 20% increase in AI coding adoption, 70% reduction in issue triage time | S2 | High | Empirical | Yes |
| C19 | Effective KBs use YAML configs + versioned markdown + structured catalog tables exposed via API | S2 | Medium | Consensus | No |
| C20 | "The knowledge base isn't there to help the agent be creative. It's there to keep it inside the lines." (Amazon expert) | S2 | High | Authority | No |
| C21 | MCP gateways enable agent-driven exploration beyond "prompt stuffing techniques like RAG" | S2 | Medium | Authority | No |
| C22 | Agent memory is a first-class architectural component in 2026 with its own benchmarks | S4, S6 | High | Consensus | Yes |
| C23 | MemPalace (43.5k stars) uses verbatim storage + palace metaphor (wings → halls → rooms) — no summarization | S4 | High | Empirical | Yes |
| C24 | MemPalace achieves 96.6% benchmark score in raw mode; compression layer regresses 12.4 points | S4 | High | Empirical | Yes |
| C25 | Tiered loading (L0/L1/L2) is a proven pattern (OpenViking, 21.8k stars) — fetch only what's needed | S4 | High | Empirical | Yes |
| C26 | Knowledge-graph memory for code (code-review-graph, 7.3k stars) achieves 49× token reduction on coding tasks | S4 | High | Empirical | No |
| C27 | Full-context memory approaches are "categorically unusable in real-time production settings" (72.9% accuracy but 9.87s latency, 26k tokens) | S6 | High | Empirical | Yes |
| C28 | Vector memory (Mem0): 66.9% accuracy, 0.71s latency, ~1.8k tokens/conversation — production viable | S6 | High | Empirical | Yes |
| C29 | Graph memory adds ~1.5 points accuracy but 50% latency — only worth it for "complex entity relationships" | S6 | High | Empirical | No |
| C30 | Multi-scope model: `user_id` memories persist across sessions; `session_id` memories are scoped | S6 | High | Authority | Yes |
| C31 | Actor-aware memories (tag source actor) prevent inference chains from contaminating ground truth in multi-agent systems | S6 | High | Authority | Yes |
| C32 | Cron timeout death spiral: 400s tasks with 300s limits fail silently — set `timeoutSeconds: 1200` minimum | S7 | High | Empirical | Yes |
| C33 | "Documentation trap" — agents generate plans instead of shipping; fix by framing tasks with external deliverables | S7 | High | Empirical | Yes |
| C34 | Static number fallacy — agents cache metrics for 72+ hours using stale data; add timestamps, reverify before use | S7 | High | Empirical | Yes |
| C35 | Implementation gap — agents identify bugs, document them, never fix them; require shipped verification | S7 | High | Empirical | Yes |
| C36 | Permission drift — safety constraints erode over time; separate "safe" vs "requires approval" categories; monthly review | S7 | High | Empirical | Yes |
| C37 | Overnight ops: file-based state (not in-memory), generous timeouts (3-4× expected), daily log reviews | S7 | High | Authority | Yes |
| C38 | Pre-fabricated/synthetic memory as day-1 bootstrap pattern — NOT documented in mainstream sources | S6 (gap) | Low | — | Yes |
| C39 | Mem0 procedural memory (v1.0.0) is a distinct pipeline for "learned workflows, custom tool-use patterns, and process knowledge" — closest thing to engineered-in knowledge | S6 | Medium | Authority | Yes |
| C40 | Agent framework orchestrator + specialist subagents (code review / test / deployment) with task delegation is the dominant pattern | Search, S1 | High | Consensus | No |

---

## Cross-Verified Status Table

| Claim | Status | Supporting | Dissenting |
|-------|--------|------------|------------|
| Claude Code scheduled tasks exist natively (C1, C2) | Verified | S1, search (multiple), S8 | — |
| External/separate verification > self-verification (C7, C8) | Supported | S3, S7 (implementation gap) | — |
| Spec-driven verification works but can't catch bad specs (C9, C11) | Supported | S3, S5 (specs not mentioned but scope drift is documented) | — |
| Agents abandoned by reviewers at high rates (C13) | Unverified (single source) — but S5 is a rigorous audit | S5 | — |
| KBs reduce agent improvisation (C17) | Verified | S2 (multiple cases), S4, S6 | — |
| LinkedIn 20%/70% metrics (C18) | Unverified (single source) | S2 | — |
| Full-context memory unusable in production (C27) | Supported | S6, S4 (verbatim approaches use selective retrieval) | — |
| Vector memory viable with tradeoffs (C28) | Verified | S6, S4 (multiple production systems) | — |
| Tiered memory loading (L0/L1/L2) | Supported | S4 (OpenViking), MemPalace docs (from kit memory) | — |
| Cron timeout silent failures (C32) | Supported | S7, S5 (mentions silent failures) | — |
| Agents ship docs instead of code (C33) | Verified | S7, S5 (CI failures suggest incomplete shipping), S3 (agents verifying assumptions) | — |
| Pre-fabricated synthetic memory for day-1 bootstrap (C38) | **Unverified — critical gap** | — | — |
| Orchestrator + specialist subagents pattern (C40) | Verified | S1, S2 (R Systems multi-agent), S3 (Opus + Sonnet specialization), Search (multiple) | — |

---

## Disagreements

**None direct.** Sources converge on the same principles but at different abstraction levels. The critical *absence* is: none of the surveyed sources explicitly endorse or reject synthetic/pre-fabricated memory as a day-1 bootstrap strategy. That's a **gap**, not a disagreement.

---

## Critical Unverified Claims

- **C38 — Pre-fabricated synthetic memory for day-1 bootstrap** — This is directly tied to a success criterion. None of the surveyed sources document this as a recognized pattern. Need a targeted loop-back search.
