# Generic Trait-Based Runtime

**Swap any component without touching the core**

**Leverage:** Universal Primitive

## What

ConversationRuntime<C: ApiClient, T: ToolExecutor> — the entire agentic loop is parameterized over traits. API provider, tool execution strategy, even the permission prompter are all pluggable.

## Why It Matters

You can swap Anthropic for OpenAI, mock everything for testing, compose different strategies, or run sub-agents with restricted tool sets — all without changing a single line in the core loop. This is the foundation that makes everything else possible.

## How To Use

Define your runtime as generic over ApiClient + ToolExecutor traits. Never hardcode a specific provider. Use trait objects for runtime polymorphism, generics for compile-time composition.

## Code Pattern

```rust
pub trait ApiClient {
    fn stream(&mut self, request: ApiRequest) -> Result<Vec<AssistantEvent>, RuntimeError>;
}

pub trait ToolExecutor {
    fn execute(&mut self, tool_name: &str, input: &str) -> Result<String, ToolError>;
}

pub struct ConversationRuntime<C: ApiClient, T: ToolExecutor> {
    session: Session,
    api_client: C,
    tool_executor: T,
    permission_policy: PermissionPolicy,
}
```
