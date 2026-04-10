# Three-Layer Tool Pool Assembly

**Right tools, right context, right permissions**

**Leverage:** 10x Multiplier

## What

Per-session tool filtering via 3 layers: (1) Mode Flags — simple_mode restricts to safe subset, (2) Feature Flags — include_mcp excludes by name/prefix, (3) Permission Context — ToolPermissionContext with frozenset deny_names (O(1)) + deny_prefixes tuple. Fewer tools = smaller system prompts, faster model responses, better security, lower token cost.

## Why It Matters

Giving an agent all tools in every context is like giving every employee the master key. Tool pool assembly means a read-only exploration agent literally cannot see write tools, and an untrusted context cannot discover bash.

## How To Use

Build an assemble_tool_pool(mode, features, permissions) function. Apply layers in order: mode → features → deny-list. Use frozenset for O(1) exact matching.

## Code Pattern

```rust
def assemble_tool_pool(simple_mode, include_mcp, permission_context):
    tools = all_tools()
    if simple_mode:
        tools = [t for t in tools if t.name in SAFE_SUBSET]
    if not include_mcp:
        tools = [t for t in tools if 'mcp' not in t.name.lower()]
    return filter_by_permission_context(tools, permission_context)
```
