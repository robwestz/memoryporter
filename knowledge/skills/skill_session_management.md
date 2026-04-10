---
name: Build Session Persistence
description: Implement session serialization with embedded usage tracking, supporting save/load/resume with full conversation history and cost reconstruction.
category: Session Management
trigger: When your agent needs to persist conversations across restarts or enable resume functionality.
type: skill
agnostic: true
---

# Build Session Persistence

Implement session serialization with embedded usage tracking, supporting save/load/resume with full conversation history and cost reconstruction.

## When to Use

When your agent needs to persist conversations across restarts or enable resume functionality.

## Steps

1. Define Session struct with version + messages array.
2. Embed TokenUsage in each ConversationMessage.
3. Implement save_to_path() with JSON serialization.
4. Implement load_from_path() with deserialization.
5. Add UsageTracker::from_session() to reconstruct cost data.
6. Add version field for future schema migration.
7. Support auto-compaction with summary preservation.

## Verification

- [ ] Save → Load round-trip preserves all messages.
- [ ] Usage tracker accurately reconstructed from loaded session.
- [ ] Version field present for migration support.

