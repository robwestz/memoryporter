# Implicit Skills

```yaml
---
name: plan-mode
kind: implicit
triggers: ["plan", "design", "architecture", "multi-step"]
priority: 9
source_evidence: ["tools/EnterPlanModeTool/*", "commands/plan/*"]
---
Use when a task needs multi-step reasoning before implementation.

Rules:
- Clarify the goal and constraints first.
- Produce a sequential, verifiable plan.
- Do not start implementation until the plan is coherent.
```

```yaml
---
name: exit-plan-mode
kind: implicit
triggers: ["start coding", "plan is done", "execute"]
priority: 8
source_evidence: ["tools/ExitPlanModeTool/*", "commands/plan/*"]
---
Use when transitioning from planning to execution.

Rules:
- Confirm each step is actionable.
- Carry the finalized plan into implementation.
- Avoid major structural changes mid-execution.
```

```yaml
---
name: review-mode
kind: implicit
triggers: ["review", "audit", "check code", "pr"]
priority: 9
source_evidence: ["commands/review*", "commands/security-review.ts"]
---
Use when assessing quality, regression risk, or correctness.

Rules:
- Prioritize risks and test gaps first.
- Do not add features while reviewing.
- Keep findings actionable and specific.
```

```yaml
---
name: security-review
kind: implicit
triggers: ["security", "vulnerability", "safe to run"]
priority: 10
source_evidence: ["commands/security-review.ts", "hooks/toolPermission/*"]
---
Use when code or commands may have safety implications.

Rules:
- Treat security findings as blocking issues.
- Look for secrets, injection paths, and unsafe inputs.
- Stop unsafe execution paths immediately.
```

```yaml
---
name: agent-spawn
kind: implicit
triggers: ["delegate", "subtask", "new agent"]
priority: 7
source_evidence: ["tools/AgentTool/*", "tools/shared/spawnMultiAgent.ts"]
---
Use when a bounded subtask deserves a separate context.

Rules:
- Give the sub-agent a narrow scope.
- Define success output clearly.
- Pass only relevant context, not everything.
```

```yaml
---
name: explore-agent
kind: implicit
triggers: ["find out how", "investigate", "read code"]
priority: 8
source_evidence: ["tools/AgentTool/built-in/exploreAgent.ts"]
---
Use when read-only exploration is needed.

Rules:
- Restrict the work to discovery and synthesis.
- Return summaries, not raw dumps.
- Keep the main thread focused on integration.
```

```yaml
---
name: plan-agent
kind: implicit
triggers: ["draft a plan", "figure out steps"]
priority: 8
source_evidence: ["tools/AgentTool/built-in/planAgent.ts"]
---
Use when delegating plan construction to a specialized agent.

Rules:
- Ask for steps, not implementation.
- Surface blockers and dependencies early.
- Return the plan to the main thread for execution.
```

```yaml
---
name: verification-agent
kind: implicit
triggers: ["test this", "verify my work", "run checks"]
priority: 9
source_evidence: ["tools/AgentTool/built-in/verificationAgent.ts"]
---
Use when validation should be separated from implementation.

Rules:
- Assume the implementation may be wrong.
- Run explicit checks or tests.
- Return pass or fail with evidence.
```

```yaml
---
name: multi-agent
kind: implicit
triggers: ["parallel", "do both", "concurrent"]
priority: 6
source_evidence: ["tools/shared/spawnMultiAgent.ts", "tools/AgentTool/*"]
---
Use when independent tasks can run in parallel.

Rules:
- Avoid shared mutable state across agents.
- Aggregate results before acting on them.
- Contain partial failures instead of collapsing the whole batch.
```

```yaml
---
name: memory-routing
kind: implicit
triggers: ["where is", "load context", "project rules"]
priority: 9
source_evidence: ["commands/memory/*", "memdir/findRelevantMemories.ts", "prompt.rs"]
---
Use when choosing the right memory scope.

Rules:
- Distinguish session, project, and persistent memory.
- Load project instructions automatically when relevant.
- Keep transient detail out of project memory.
```

```yaml
---
name: session-memory
kind: implicit
triggers: ["earlier you said", "restore session", "context limit"]
priority: 8
source_evidence: ["services/SessionMemory/*", "assistant/sessionHistory.ts"]
---
Use when preserving useful conversation state over time.

Rules:
- Summarize older turns densely.
- Retain exact paths, decisions, and corrections.
- Drop dead-end exploration branches.
```

```yaml
---
name: tool-selection
kind: implicit
triggers: ["use tool", "run command", "how to do this"]
priority: 8
source_evidence: ["tools/*", "hooks/toolPermission/*", "rust/crates/tools/src/lib.rs"]
---
Use when selecting a capability for an action.

Rules:
- Choose the narrowest tool that solves the task.
- Prefer existing tools over one-off scripts.
- Check permission implications before execution.
```

```yaml
---
name: tool-permissions
kind: implicit
triggers: ["permission denied", "ask user", "elevated access"]
priority: 10
source_evidence: ["hooks/toolPermission/*", "rust/crates/runtime/src/config.rs"]
---
Use when a task crosses a permission boundary.

Rules:
- Never bypass permission rules silently.
- Explain why elevated access is needed.
- Treat permission boundaries as design constraints.
```

```yaml
---
name: pre-tool-hook
kind: implicit
triggers: ["before running", "intercept", "validate execution"]
priority: 9
source_evidence: ["rust/crates/runtime/src/hooks.rs"]
---
Use when a tool call should be checked before execution.

Rules:
- Validate arguments against current policy.
- Add any required execution context before launch.
- Abort if the call violates project rules.
```

```yaml
---
name: post-tool-hook
kind: implicit
triggers: ["after running", "check output", "parse result"]
priority: 9
source_evidence: ["rust/crates/runtime/src/hooks.rs"]
---
Use when tool output should be filtered or verified before reuse.

Rules:
- Trim or summarize oversized outputs.
- Mask sensitive values before returning them.
- Trigger verification or escalation on failure.
```

```yaml
---
name: mcp-discovery
kind: implicit
triggers: ["find servers", "what mcp tools", "discover"]
priority: 7
source_evidence: ["commands/mcp/*", "skills/mcpSkillBuilders.ts"]
---
Use when searching for available external capabilities.

Rules:
- Query connected MCP surfaces before inventing local logic.
- Prefer reusable external capabilities when they fit.
- Cache discovery results during the session.
```

```yaml
---
name: mcp-resource-read
kind: implicit
triggers: ["read resource", "load mcp data", "external context"]
priority: 8
source_evidence: ["tools/ReadMcpResourceTool/*", "tools/ListMcpResourcesTool/*"]
---
Use when pulling context from connected MCP servers.

Rules:
- Treat resources as read-only context.
- Reformat them clearly for downstream use.
- Handle rate limits and disconnects gracefully.
```

```yaml
---
name: prompt-context-build
kind: implicit
triggers: ["system prompt", "gather context", "setup"]
priority: 10
source_evidence: ["rust/crates/runtime/src/prompt.rs", "src/context.py", "CLAUDE.md"]
---
Use when assembling the baseline instructions for an agent.

Rules:
- Merge user intent, project rules, and active skills carefully.
- Keep the prompt stable during a single run.
- Preserve instruction hierarchy consistently.
```

```yaml
---
name: bootstrap-routing
kind: implicit
triggers: ["init", "start", "setup environment"]
priority: 9
source_evidence: ["src/setup.py", "src/bootstrap_graph.py", "src/main.py"]
---
Use during initialization and startup routing.

Rules:
- Run environment checks before action.
- Initialize required capability surfaces early.
- Fail fast when the environment is not viable.
```

```yaml
---
name: compact-and-continue
kind: implicit
triggers: ["too long", "compress", "continue task"]
priority: 8
source_evidence: ["services/SessionMemory/*", "rust/crates/runtime/src/conversation.rs"]
---
Use when work must continue near a context limit.

Rules:
- Summarize completed work and next steps densely.
- Drop raw output and keep conclusions.
- Continue from the compressed state instead of restarting.
```

