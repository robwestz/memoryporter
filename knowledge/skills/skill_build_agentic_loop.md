---
name: Build Agentic Loop
description: Construct a trait-generic agentic loop that handles multi-turn conversation with tool execution, permission checking, and automatic compaction.
category: Agentic Loop
trigger: When building an AI agent that needs to execute tools across multiple turns.
type: skill
agnostic: true
---

# Build Agentic Loop

Construct a trait-generic agentic loop that handles multi-turn conversation with tool execution, permission checking, and automatic compaction.

## When to Use

When building an AI agent that needs to execute tools across multiple turns.

## Steps

1. Define ApiClient trait with stream() method returning typed events.
2. Define ToolExecutor trait with execute(name, input) → Result<String>.
3. Create ConversationRuntime<C: ApiClient, T: ToolExecutor> struct.
4. Implement run_turn(): loop { call API → parse events → execute tools → check compaction }.
5. Add iteration limit safety (max_iterations field).
6. Add hook runner for pre/post tool lifecycle.
7. Add auto-compaction when input_tokens > threshold.
8. Return TurnSummary with usage, iterations, and messages.

## Code Template

```rust
pub struct ConversationRuntime<C: ApiClient, T: ToolExecutor> {
    session: Session,
    api_client: C,
    tool_executor: T,
    permission_policy: PermissionPolicy,
    system_prompt: Vec<String>,
    max_iterations: usize,
    usage_tracker: UsageTracker,
    hook_runner: HookRunner,
    auto_compaction_threshold: u32,
}

impl<C: ApiClient, T: ToolExecutor> ConversationRuntime<C, T> {
    pub fn run_turn(&mut self, input: String) -> Result<TurnSummary, RuntimeError> {
        self.session.add_user_message(input);
        for _ in 0..self.max_iterations {
            let events = self.api_client.stream(self.build_request())?;
            let msg = self.aggregate_events(events);
            self.session.add(msg.clone());
            let tool_uses = msg.tool_use_blocks();
            if tool_uses.is_empty() { break; }
            for tool_use in tool_uses {
                self.execute_with_hooks(&tool_use)?;
            }
        }
        self.maybe_compact();
        Ok(self.build_summary())
    }
}
```

## Verification

- [ ] Runtime compiles with mock ApiClient and ToolExecutor.
- [ ] Tool execution loop terminates when no tool_use blocks returned.
- [ ] Permission denial produces error result without executing tool.
- [ ] Auto-compaction triggers at threshold and preserves recent messages.

