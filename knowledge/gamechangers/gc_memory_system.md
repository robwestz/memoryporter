# 8-Module File-Based Memory with Provenance

**Memory without provenance is accumulated hallucination**

**Leverage:** New Capability

## What

8 modules: findRelevantMemories (relevance scoring), memdir (core API), memoryAge (TTL), memoryScan (indexing), memoryTypes (schemas), paths (file management), teamMemPaths (team isolation), teamMemPrompts (injection templates). Memories typed: personal, team, project scope. Each memory tracks: source, whether user-stated or model-inferred, last validated, whether contradicted.

## Why It Matters

Without provenance, retrieved memories become another prompt-injection surface. Instruction-like text in retrieved context silently becomes a new system prompt. The aging system prevents stale memories from poisoning decisions.

## How To Use

Store: content, source, is_user_stated, last_validated, is_contradicted. Score relevance. Age out stale entries. Scope by personal/team/project. Never inject unscored memories into system prompt.

## Code Pattern

```rust

```
