---
name: Implement Tool Permission System
description: Build a graduated permission model where each tool declares its minimum required access level and a policy enforces authorization before execution.
category: Permission Model
trigger: When building an agent that needs to restrict tool access based on context (sub-agents, read-only mode, etc.).
type: skill
agnostic: true
---

# Implement Tool Permission System

Build a graduated permission model where each tool declares its minimum required access level and a policy enforces authorization before execution.

## When to Use

When building an agent that needs to restrict tool access based on context (sub-agents, read-only mode, etc.).

## Steps

1. Define PermissionMode as an ordered enum (ReadOnly < WorkspaceWrite < DangerFullAccess).
2. Attach required_permission to each ToolSpec.
3. Create PermissionPolicy with active_mode + per-tool requirements map.
4. Implement authorize(): check active_mode >= required, or escalate via prompter.
5. Integrate into agentic loop: check BEFORE hook execution and tool execution.
6. For sub-agents: create restricted policies with appropriate mode.

## Code Template

```rust
#[derive(PartialEq, Eq, PartialOrd, Ord)]
pub enum PermissionMode { ReadOnly, WorkspaceWrite, DangerFullAccess }

pub struct ToolSpec {
    pub name: &'static str,
    pub required_permission: PermissionMode,
    pub input_schema: Value,
}

pub struct PermissionPolicy {
    active_mode: PermissionMode,
    tool_requirements: BTreeMap<String, PermissionMode>,
}

impl PermissionPolicy {
    pub fn authorize(&self, tool: &str) -> PermissionOutcome {
        let required = self.tool_requirements.get(tool)
            .unwrap_or(&PermissionMode::ReadOnly);
        if self.active_mode >= *required { Allow } else { Deny }
    }
}
```

## Verification

- [ ] ReadOnly mode blocks bash and write operations.
- [ ] WorkspaceWrite allows file edits but blocks bash.
- [ ] Per-tool override works (e.g., allow specific bash for sub-agent).
- [ ] Denial produces clean error message in tool result.

