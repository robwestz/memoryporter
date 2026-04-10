# Sub-Agent Spawning with Tool Restriction

**Parallel agents with exactly the tools they need**

**Leverage:** New Capability

## What

Sub-agents spawned as threads with per-type tool allowlists. Each agent type (Explore, Plan, Verification, general-purpose) gets a specific set of tools. Manifest-tracked lifecycle: running → completed/failed. Isolated permission policies.

## Why It Matters

You can safely parallelize work: an Explore agent can only read, a Plan agent can read + write todos, a Verification agent can run tests. If a sub-agent goes wrong, it can't escape its sandbox.

## How To Use

Define SubagentToolExecutor that filters by allowed set. Map agent types to tool allowlists. Spawn in threads with manifest tracking. Each sub-agent gets its own ConversationRuntime with restricted tools.

## Code Pattern

```rust
fn allowed_tools_for_subagent(agent_type: &str) -> BTreeSet<String> {
    match agent_type {
        "Explore" => set!["read_file", "glob_search", "grep_search"],
        "Plan"    => set!["read_file", "glob_search", "grep_search", "TodoWrite"],
        "general" => all_tools(),
        _ => set!["read_file"],
    }
}

struct SubagentToolExecutor { allowed_tools: BTreeSet<String> }

impl ToolExecutor for SubagentToolExecutor {
    fn execute(&mut self, name: &str, input: &str) -> Result<String, ToolError> {
        if !self.allowed_tools.contains(name) {
            return Err(ToolError::new(format!("{name} not enabled")));
        }
        execute_tool(name, input)
    }
}
```
