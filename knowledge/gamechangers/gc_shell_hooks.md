# Shell-Based Hook Lifecycle

**Extend agent behavior in any language, without recompiling**

**Leverage:** Universal Primitive

## What

Pre/post tool hooks configured as shell commands. JSON payload piped to stdin with tool_name, tool_input, tool_output. Exit codes: 0=allow, 1=warn, 2=deny. Hooks run after permission check but before/after tool execution.

## Why It Matters

Organizations can enforce policies, audit tool usage, add guardrails, transform inputs/outputs — all without touching the agent codebase. A Python script, a bash one-liner, or a Go binary all work as hooks.

## How To Use

Configure hooks in settings.json under hooks.PreToolUse[] and hooks.PostToolUse[]. Each entry is a shell command. Return exit 2 to deny, exit 0 + stdout for feedback.

## Code Pattern

```rust
// Hook receives JSON on stdin:
{
  "hook_event_name": "PreToolUse",
  "tool_name": "bash",
  "tool_input": {"command": "rm -rf /"},
  "tool_input_json": "{...}"
}

// Hook script (any language):
#!/bin/bash
INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r .tool_name)
if [[ "$TOOL" == "bash" ]]; then
  CMD=$(echo "$INPUT" | jq -r .tool_input.command)
  if [[ "$CMD" == *"rm -rf"* ]]; then
    echo "Blocked dangerous command" >&2
    exit 2  # DENY
  fi
fi
exit 0  # ALLOW
```
