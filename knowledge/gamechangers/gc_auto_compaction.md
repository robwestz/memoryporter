# Auto-Compaction with Context Preservation

**Infinite conversations without losing context**

**Leverage:** Problem Eliminator

## What

Automatically detects when input tokens exceed threshold (200K default), summarizes old messages into a compact brief, and preserves the most recent messages verbatim. The summary captures pending work, key files, and current activity.

## Why It Matters

Agents can run indefinitely without hitting context limits. Long-running tasks, multi-hour debugging sessions, and complex multi-step builds all work seamlessly. No manual intervention needed.

## How To Use

Set auto_compaction_input_tokens_threshold on your runtime. When triggered: generate a summary using XML tags, preserve last 4 messages, prepend a continuation prompt explaining the context cutoff.

## Code Pattern

```rust
// In the agentic loop, after each turn:
if usage_tracker.cumulative.input_tokens > auto_compaction_threshold {
    let summary = generate_summary(&session.messages[..messages.len() - 4]);
    let preserved = session.messages[messages.len() - 4..].to_vec();
    session.messages = vec![system_message(summary)];
    session.messages.extend(preserved);
}
```
