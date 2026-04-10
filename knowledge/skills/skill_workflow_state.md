---
name: Implement Workflow State & Idempotency
description: Build workflow state management with immutable state objects, idempotency keys, and crash-safe checkpoints. Resuming a conversation is NOT resuming a workflow.
category: Session Management
trigger: When your agent performs multi-step tasks with side effects that must not be duplicated on retry.
type: skill
agnostic: true
---

# Implement Workflow State & Idempotency

Build workflow state management with immutable state objects, idempotency keys, and crash-safe checkpoints. Resuming a conversation is NOT resuming a workflow.

## When to Use

When your agent performs multi-step tasks with side effects that must not be duplicated on retry.

## Steps

1. Model work as explicit states: planned, awaiting_approval, executing, waiting_on_external, completed, failed.
2. Use frozen/immutable dataclasses for state objects (transitions create new instances).
3. Persist workflow checkpoints after every side-effecting step.
4. Give mutating operations idempotency keys so retries don't double-fire.
5. Separate conversation state (what we said) from task state (what step we're on).
6. Implement replay() to reconstruct workflow from persisted checkpoints.

## Verification

- [ ] Agent crash mid-task → resume picks up at correct step.
- [ ] Retry of completed step is a no-op (idempotent).
- [ ] Workflow state persisted after every side effect.
- [ ] Conversation transcript and workflow state are independent.

