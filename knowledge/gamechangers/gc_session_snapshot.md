# Session Snapshot with Embedded Usage

**One file = complete conversation state + cost history**

**Leverage:** 10x Multiplier

## What

Session serialized as JSON with version, messages array, and per-message token usage. UsageTracker reconstructed from embedded fields on resume. Supports save/load/resume lifecycle.

## Why It Matters

Session files are self-contained: resume anywhere, debug any turn, audit costs, replay conversations. No external logging or database needed. One JSON file captures everything.

## How To Use

Embed TokenUsage in each ConversationMessage. On save: serialize entire Session. On load: reconstruct UsageTracker by scanning embedded usage. Use version field for future schema migration.

## Code Pattern

```rust
pub struct Session {
    version: u32,
    messages: Vec<ConversationMessage>,
}

pub struct ConversationMessage {
    role: MessageRole,
    blocks: Vec<ContentBlock>,
    usage: Option<TokenUsage>,  // Embedded per-message
}

// Resume: reconstruct tracker from history
let tracker = UsageTracker::from_session(&session);
```
