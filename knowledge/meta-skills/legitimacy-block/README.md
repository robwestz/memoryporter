# legitimacy-block

> Append epistemic structure to any analytical output: per-claim status,
> dispute surfacing, gap reporting, self-grade.

## TL;DR

This is the pattern behind `systematic-research`'s GRADE step, extracted as a
standalone composable skill. Use it to wrap the output of any skill that
produces claims a reader will act on.

## What it does

Adds four blocks to the end of an upstream skill's output:

1. **Claims table** — every claim → Status (Verified/Supported/Unverified/Disputed) + Confidence + Sources
2. **Disputes** — disagreements surfaced, never silently resolved
3. **Gaps** — specific list of what was NOT examined
4. **Grade block** — `coverage`, `confidence`, `verdict`, `loop_backs_used` as YAML

Optional 5th block: **Delta summary** (Assumptions / Risks / Did-not-verify).

## When to use

- Compose with `systematic-research`, `200k-blueprint`, `market-intelligence-report`, `code-review-checklist`
- Any output that will be quoted by a future decision or another agent
- Medium-or-higher stakes — someone will act on this

## When NOT to use

- Conversational replies, single-fact answers, creative writing
- Outputs with ≤ 3 substantive claims (overhead > signal)
- Code where tests are the legitimacy primitive

## See

- `SKILL.md` — full procedure (6 steps, mandatory rules)
- `templates/claims-table.md` — copy-pasteable Claims-table skeleton
- `templates/grade-block.yaml` — copy-pasteable YAML skeleton
- `references/status-definitions.md` — rules with worked examples
- `examples/wrapped-research-output.md` — concrete composition with systematic-research
