# Permission Escalation Hierarchy

**Graduated trust with per-tool granularity**

**Leverage:** Problem Eliminator

## What

Ordered permission modes: ReadOnly < WorkspaceWrite < DangerFullAccess. Each tool declares its minimum required mode. Policy enforces: active_mode >= required_mode. Escalation triggers user prompt only when needed.

## Why It Matters

Sub-agents get exactly the permissions they need — an Explore agent gets ReadOnly, a code writer gets WorkspaceWrite, only the main agent gets DangerFullAccess. This is defense in depth for AI systems.

## How To Use

Define PermissionMode as an ordered enum. Attach required permission to each ToolSpec. Build PermissionPolicy with per-tool requirements map. Check policy before every tool execution.

## Code Pattern

```rust
pub enum PermissionMode {
    ReadOnly,           // glob, grep, read, web
    WorkspaceWrite,     // write, edit, todo, notebook
    DangerFullAccess,   // bash, agent, REPL
}

pub struct PermissionPolicy {
    active_mode: PermissionMode,
    tool_requirements: BTreeMap<String, PermissionMode>,
}

// In loop: authorize before execute
let outcome = policy.authorize(tool_name, &prompter);
match outcome {
    Allow => execute_tool(...),
    Deny { reason } => tool_result_error(reason),
}
```
