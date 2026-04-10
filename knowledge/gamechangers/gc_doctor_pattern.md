# Doctor Pattern (Unified Health Check)

**Know what's broken before the user does**

**Leverage:** 10x Multiplier

## What

Distributed health check: PrefetchResult (keychain, MDM, project scan), ParityAuditResult (archive/file/command/tool coverage ratios), trust validation, system init message. /doctor validates API creds, connections, config integrity, tool availability, and resource health. Run at startup AND expose as admin command.

## Why It Matters

Without /doctor, debugging is guesswork. When an MCP server fails to connect, a credential expires, or a tool registry is corrupted, you need a single command that tells you exactly what's wrong.

## How To Use

Build a /doctor command that checks: API creds valid, external connections reachable, config files parseable, tool registry complete, MCP servers responsive. Return structured results with pass/fail per check.

## Code Pattern

```rust
@dataclass(frozen=True)
class HealthCheck:
    api_credentials: bool
    mcp_servers: dict[str, bool]
    tool_registry: tuple[int, int]  # loaded/expected
    config_valid: bool
    session_store: bool

def run_doctor() -> HealthCheck: ...
```
