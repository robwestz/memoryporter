---
name: Spawn Permission-Scoped Sub-Agents
description: Spawn background sub-agents with restricted tool access, manifest tracking, and isolated conversation contexts.
category: Sub-Agent Architecture
trigger: When a task can be parallelized or delegated to a specialized agent with limited permissions.
type: skill
agnostic: true
---

# Spawn Permission-Scoped Sub-Agents

Spawn background sub-agents with restricted tool access, manifest tracking, and isolated conversation contexts.

## When to Use

When a task can be parallelized or delegated to a specialized agent with limited permissions.

## Steps

1. Define agent types with tool allowlists (Explore, Plan, Verification, etc.).
2. Create SubagentToolExecutor that filters by allowed set.
3. Build AgentOutput manifest: id, name, status, timestamps, output file.
4. Spawn agent in thread with its own ConversationRuntime.
5. Track lifecycle: running → completed/failed.
6. Persist manifest as JSON + output as markdown.
7. Set max_iterations on sub-agent runtime for safety.

## Verification

- [ ] Sub-agent cannot execute tools outside its allowlist.
- [ ] Manifest correctly tracks lifecycle transitions.
- [ ] Sub-agent panic is caught and recorded as failure.
- [ ] Max iterations prevent infinite loops.

