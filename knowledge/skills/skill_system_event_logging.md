---
name: Implement System Event Logging
description: Build a structured event log separate from conversation. Answers 'what did the system do?' vs 'what did we say?'.
category: Agentic Loop
trigger: When you need to debug agent behavior after the fact, or audit system operations.
type: skill
agnostic: true
---

# Implement System Event Logging

Build a structured event log separate from conversation. Answers 'what did the system do?' vs 'what did we say?'.

## When to Use

When you need to debug agent behavior after the fact, or audit system operations.

## Steps

1. Define HistoryEvent(title, detail) as immutable record.
2. Create HistoryLog with append-only events list.
3. Log at key points: context loading, registry init, routing decisions, execution, permission denials, session persistence.
4. Add as_markdown() for human-readable rendering.
5. Keep separate from conversation transcript.
6. Optionally add event categories (enum) for filtering.

## Verification

- [ ] System events captured for all key operations.
- [ ] Event log survives session persistence.
- [ ] Can reconstruct system behavior from log alone.

