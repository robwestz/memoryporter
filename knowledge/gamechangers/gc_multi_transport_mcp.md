# Multi-Transport MCP Client

**Connect to ANY tool server with one interface**

**Leverage:** New Capability

## What

Single McpServerManager handles 6 transport types: Stdio (local processes), HTTP/SSE (remote with polling), WebSocket (bidirectional), SDK (built-in), Claude.ai Proxy (OAuth-protected). Tool naming normalized via mcp__server__toolname.

## Why It Matters

Your agent can connect to local CLI tools, remote APIs, WebSocket services, and cloud-hosted tool servers — all through the same interface. Adding a new tool source is just a config entry, not code.

## How To Use

Implement McpClientTransport enum with variants for each transport. Bootstrap servers from config, normalize tool names with prefixes. Use JSON-RPC 2.0 for all communication.

## Code Pattern

```rust
pub enum McpClientTransport {
    Stdio(command, args, env),
    Sse(url, headers),
    Http(url, headers),
    WebSocket(url, headers),
    Sdk(name),
    ClaudeAiProxy(url, id),
}

// All tools discovered via tools/list, prefixed:
// mcp__github__list_issues, mcp__slack__send_message
```
