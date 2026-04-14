# Why this template beats a naive prompt

The template is not random structure — each section removes a specific
failure mode observed in practice. Delete a section, re-introduce the
failure mode.

## The five failure modes the template prevents

| Failure mode | What happens without the template | The section that prevents it |
|--------------|-------------------------------------|------------------------------|
| **Discovery fumble** | Agent spends N turns grepping to find relevant files, burning context before real work starts | `CONTEXT TO LOAD` front-loads the minimum viable file set |
| **Routing guess** | Agent picks an adjacent-but-wrong skill (triggers on a keyword match), produces structurally valid but miscast output | `SKILLS TO ACTIVATE` names exact skills; `Avoid` blocks miscasts |
| **Silent under-specification** | Agent interprets "build X" liberally, ships output that technically matches words but misses intent | `INTENT` splits Goal / Anti-goals / Success so ambiguity is forced to the surface before work starts |
| **Ship-without-verify** | Agent declares done based on "code compiles" rather than "feature works" | `QUALITY GATES` mandates adversarial pass + showcase audit + delta — three independent checks |
| **One-shot exhaust** | Output is consumed once and thrown away; next session rediscovers everything | `COMPOUNDING` requires one reusable artifact per run |

## The parallelism asymmetry

Sequential agents and parallel agents produce different *kinds* of output,
not just different speeds.

| Sequential (1 agent, linear) | Parallel (N agents, fan-out) |
|-------------------------------|-------------------------------|
| Perspective accumulates — each step inherits the last one's framing | Perspectives stay independent — you get N fresh reads on the problem |
| Errors compound — a mistake in step 1 poisons step 5 | Errors isolate — a wrong branch doesn't corrupt the others |
| Output converges — one narrative | Output synthesizes — tensions between branches surface real tradeoffs |

The template's `WORKFLOW SHAPE.Parallel branches` field exists to force the
question *is this task genuinely fan-outable?* If yes, the parallel asymmetry
is free upside. If no, the template says `linear` and you don't pay the
coordination cost.

## Why the adversarial pass matters more than extra content

LLMs produce more confidently than they produce correctly. A prompt that
ends with "deliver the output" gets confident-but-unchecked output. A
prompt that ends with "state the most likely failure mode and prove the
output survives it" gets output that has already been stress-tested by
the producer.

Cost: ~10% more tokens on the producer side.
Benefit: the 5–30% of outputs that would have shipped broken are caught.

## Why showcase-presenter is the default audit

Any agent can claim to have built something. An honest audit needs a
separate pass that checks disk state against the claim. `showcase-presenter`
is built for exactly this — capability cards, A1-A7 checks, `[BROKEN]`
badges when things don't work. Using it as the default QUALITY GATE means
the prompt never rewards "looks done."

## Why exactly one Compounding artifact

Temptation: "produce a skill AND a blueprint AND update INDEX AND write
a workflow — more artifacts = more value." Reality: dividing attention
across N artifacts makes all N worse than one done well. The rubric
enforces one artifact with a specific consumer reason, which forces the
prompter to pick the artifact whose future consumption is most concrete.

If multiple artifacts genuinely matter, compile multiple prompts — one
per artifact — and run them sequentially with each taking the prior as
input. That's the compounding pattern, not the scatter-gun pattern.

## Anti-pattern: "just tell Claude what you want"

A common objection: "Claude is smart, I shouldn't need a template."

The template isn't for Claude — it's for the prompter. The sections force
the prompter to know:

- What done looks like (Success)
- What wrong looks like (Anti-goals)
- What they're betting on (Compounding)
- What they'll check (Quality gates)

A prompter who can't fill the template can't judge the output either.
The template is a thinking tool disguised as an instruction format.
