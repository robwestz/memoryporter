---
name: Build Doctor Health Check
description: Unified /doctor command that validates API creds, connections, config, tools, and MCP servers. Run at startup and expose as admin command.
category: Configuration Hierarchy
trigger: When your agent needs self-diagnosis capability, or when debugging environment issues.
type: skill
agnostic: true
---

# Build Doctor Health Check

Unified /doctor command that validates API creds, connections, config, tools, and MCP servers. Run at startup and expose as admin command.

## When to Use

When your agent needs self-diagnosis capability, or when debugging environment issues.

## Steps

1. Define HealthCheck result struct with per-component pass/fail.
2. Check: API credentials valid and not expired.
3. Check: External connections reachable (MCP servers, databases).
4. Check: Config files parseable and consistent.
5. Check: Tool registry complete (loaded vs expected).
6. Check: Session store writable.
7. Return structured results. Render as human-readable report.
8. Run at startup automatically. Expose as /doctor slash command.

## Verification

- [ ] Missing API key detected and reported.
- [ ] Unreachable MCP server reported with error.
- [ ] Corrupt config detected before first turn.

