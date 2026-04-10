---
name: Build Tool Pool Assembly
description: Assemble per-session tool sets via 3-layer filtering: mode flags, feature flags, permission deny-lists. Fewer tools = better security + lower cost.
category: Tool System
trigger: When different contexts need different tool sets (sub-agents, read-only mode, untrusted environments).
type: skill
agnostic: true
---

# Build Tool Pool Assembly

Assemble per-session tool sets via 3-layer filtering: mode flags, feature flags, permission deny-lists. Fewer tools = better security + lower cost.

## When to Use

When different contexts need different tool sets (sub-agents, read-only mode, untrusted environments).

## Steps

1. Layer 1: Mode flags — simple_mode restricts to safe subset.
2. Layer 2: Feature flags — include_mcp toggles MCP tool visibility.
3. Layer 3: Permission context — deny_names (frozenset, O(1)) + deny_prefixes (tuple, prefix match).
4. Compose layers in order: mode → features → deny-list.
5. Return frozen ToolPool with assembled tools.
6. Use the assembled pool to generate the tools parameter for API calls.

## Verification

- [ ] Simple mode only exposes safe tools.
- [ ] Deny-list blocks exact names and prefixes.
- [ ] Sub-agents get appropriately restricted pools.

