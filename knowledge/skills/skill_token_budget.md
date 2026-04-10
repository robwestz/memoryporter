---
name: Implement Pre-Turn Token Budget
description: Track token usage with pre-turn budget checking. Stop BEFORE overspending. Expose budget status to users.
category: Cost & Usage Tracking
trigger: When your agent makes API calls that cost money and needs cost controls.
type: skill
agnostic: true
---

# Implement Pre-Turn Token Budget

Track token usage with pre-turn budget checking. Stop BEFORE overspending. Expose budget status to users.

## When to Use

When your agent makes API calls that cost money and needs cost controls.

## Steps

1. Define QueryEngineConfig: max_turns, max_budget_tokens, compact_after_turns.
2. Track UsageSummary: input_tokens, output_tokens per message.
3. Before each turn: project cost → check against budget → stop if over.
4. Define stop_reason taxonomy: completed, max_budget_reached, max_turns_reached.
5. Implement auto-compact with simple list slicing (not complex retry).
6. Expose budget status in streaming events and session info.

## Verification

- [ ] Budget exceeded → graceful stop before API call.
- [ ] Auto-compact triggers at threshold and doesn't loop infinitely.
- [ ] Stop reason included in final streaming event.
- [ ] User can see remaining budget.

