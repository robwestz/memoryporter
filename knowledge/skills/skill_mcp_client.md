---
name: Build MCP Client
description: Implement a Model Context Protocol client that discovers and executes tools from external servers via multiple transports.
category: MCP Protocol
trigger: When your agent needs to connect to external tool servers (local CLI, remote API, WebSocket).
type: skill
agnostic: true
---

# Build MCP Client

Implement a Model Context Protocol client that discovers and executes tools from external servers via multiple transports.

## When to Use

When your agent needs to connect to external tool servers (local CLI, remote API, WebSocket).

## Steps

1. Define McpClientTransport enum with variants for each transport type.
2. Implement JSON-RPC 2.0 request/response protocol.
3. Create McpServerManager that bootstraps servers from config.
4. Send initialize request → get server info + protocol version.
5. Call tools/list with pagination to discover available tools.
6. Normalize tool names: mcp__<server>__<tool>.
7. Implement call_tool() that routes to the correct server.
8. Handle server lifecycle (start, health check, restart, stop).

## Verification

- [ ] Stdio transport spawns child process and communicates via stdin/stdout.
- [ ] Tool discovery returns normalized tool names with schemas.
- [ ] Tool execution returns results or errors.
- [ ] Server restart works after crash.

