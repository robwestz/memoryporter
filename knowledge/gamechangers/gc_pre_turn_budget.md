# Pre-Turn Token Budget Checking

**Stop BEFORE you overspend, not after**

**Leverage:** Problem Eliminator

## What

Budget checked before the API call: projected_usage = total_usage.add_turn(prompt, output). If projected > max_budget_tokens → stop_reason = 'max_budget_reached' BEFORE processing. CostTracker accumulates events. The 3-line auto-compact fix (mutable_messages[:] = mutable_messages[-N:]) replaced complex retry logic that caused 3,272 consecutive failures in production.

## Why It Matters

Without pre-turn budget checking, you discover limits after spending the money. A runaway loop or verbose prompt injection drains budget silently. Anthropic's own product had a bug where compaction failed 3,272 times in a row — fixed by 3 lines.

## How To Use

Track running total of input+output tokens per session. Before each turn: project cost, check against budget, switch to 'wrap up' mode if approaching limit. Expose budget status to user.

## Code Pattern

```rust
projected = self.total_usage.add_turn(prompt, output)
if projected.total() > self.config.max_budget_tokens:
    stop_reason = 'max_budget_reached'  # STOP BEFORE API CALL
    break
```
