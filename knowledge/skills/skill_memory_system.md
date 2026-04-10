---
name: Build File-Based Memory with Provenance
description: Implement an 8-module memory system with relevance scoring, aging, team scoping, and provenance tracking. Memory without provenance is accumulated hallucination.
category: Session Management
trigger: When your agent needs to remember things across sessions with proper trust and freshness tracking.
type: skill
agnostic: true
---

# Build File-Based Memory with Provenance

Implement an 8-module memory system with relevance scoring, aging, team scoping, and provenance tracking. Memory without provenance is accumulated hallucination.

## When to Use

When your agent needs to remember things across sessions with proper trust and freshness tracking.

## Steps

1. Define memory types: personal, team, project scope.
2. Store each memory with: content, source, is_user_stated, last_validated, is_contradicted.
3. Implement relevance scoring for retrieval queries.
4. Add aging/TTL — stale memories score lower.
5. Implement team isolation via scoped paths.
6. Build prompt injection templates for memory augmentation.
7. Never inject unscored/unvalidated memories into system prompt.
8. Add directory scanning for memory discovery.

## Verification

- [ ] Memories persist across sessions.
- [ ] Stale memories age out of relevance results.
- [ ] Team-scoped memories isolated from personal.
- [ ] Provenance tracked for every memory entry.

