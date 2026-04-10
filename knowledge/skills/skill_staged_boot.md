---
name: Build Staged Boot Sequence
description: Implement a 7-stage boot pipeline with trust gating. Agent has situational awareness before the user's first prompt.
category: Configuration Hierarchy
trigger: When your agent needs to validate credentials, scan workspace, and load registries before accepting input.
type: skill
agnostic: true
---

# Build Staged Boot Sequence

Implement a 7-stage boot pipeline with trust gating. Agent has situational awareness before the user's first prompt.

## When to Use

When your agent needs to validate credentials, scan workspace, and load registries before accepting input.

## Steps

1. Define BootstrapGraph with ordered stages.
2. Stage 1: Parallel prefetch (credentials, project scan, MDM).
3. Stage 2: Environment guards and warnings.
4. Stage 3: CLI parsing + trust decision.
5. Stage 4: Parallel load — workspace context + command/tool registries.
6. Stage 5: Trust-gated deferred init — plugins, skills, MCP, hooks ONLY if trusted.
7. Stage 6: Mode routing (local/remote/ssh/teleport).
8. Stage 7: Main loop (query engine).
9. Gate each stage on the previous. Fail fast on critical errors.

## Verification

- [ ] All stages execute in order.
- [ ] Untrusted mode skips stage 5 (plugins, skills, MCP).
- [ ] Prefetch runs in parallel.
- [ ] Agent ready to answer before first user prompt.

