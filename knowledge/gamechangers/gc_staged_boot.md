# 7-Stage Staged Boot Sequence

**Agent has situational awareness before the first prompt**

**Leverage:** Problem Eliminator

## What

Linear pipeline with trust gate: (1) prefetch (credentials, project scan), (2) environment guards, (3) CLI parser + trust gate, (4) parallel workspace + registry load, (5) trust-gated deferred init (plugins, skills, MCP, hooks), (6) mode routing, (7) query engine loop. Stage 5 only runs if trusted=True — untrusted sessions get limited capabilities.

## Why It Matters

Without staged boot, your agent is blind when the user's first prompt arrives. Pre-validate credentials, pre-scan workspace, parallelize what you can. The trust gate at stage 5 means untrusted contexts (CI, sandboxes) are safe by default.

## How To Use

Define BootstrapGraph with ordered stages. Gate privileged operations behind a trust flag. Run prefetch in parallel. Load registries before the first turn. Validate everything before accepting user input.

## Code Pattern

```rust
stages = (
    'top-level prefetch side effects',           # parallel: creds, project scan
    'warning handler and environment guards',     # safety checks
    'CLI parser and pre-action trust gate',       # trust decision
    'setup() + commands/agents parallel load',    # registries
    'deferred init after trust',                  # GATE: plugins, skills, MCP
    'mode routing',                               # local/remote/ssh/teleport
    'query engine submit loop',                   # main loop
)
```
