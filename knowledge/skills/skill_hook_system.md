---
name: Implement Hook System
description: Build a pre/post tool hook system using shell commands. Hooks receive JSON payloads and control flow via exit codes.
category: Hook System
trigger: When agents need extensible behavior policies without code changes (audit, guardrails, transformation).
type: skill
agnostic: true
---

# Implement Hook System

Build a pre/post tool hook system using shell commands. Hooks receive JSON payloads and control flow via exit codes.

## When to Use

When agents need extensible behavior policies without code changes (audit, guardrails, transformation).

## Steps

1. Define HookConfig with pre_tool_use[] and post_tool_use[] shell commands.
2. Create JSON payload: hook_event_name, tool_name, tool_input, tool_output.
3. Spawn shell command, pipe JSON to stdin, set env vars.
4. Interpret exit codes: 0=allow, 1=warn, 2=deny.
5. Collect stdout as feedback, merge into tool result.
6. Run pre-hooks after permission check but before execution.
7. Run post-hooks after execution, can mark result as error.

## Verification

- [ ] Pre-hook with exit 2 prevents tool execution.
- [ ] Post-hook feedback appears in tool result.
- [ ] Hooks receive correct JSON payload on stdin.
- [ ] Hook timeout doesn't hang the agent.

