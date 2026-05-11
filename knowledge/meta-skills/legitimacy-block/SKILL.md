---
name: legitimacy-block
description: |
  Wraps any analytical, research, or decision-grade output with traceable
  epistemic structure: per-claim status (Verified/Supported/Unverified/Disputed),
  explicit dispute and gap reporting, and a self-grade YAML block (coverage,
  confidence, verdict). Composable — appends to the output of ANY upstream skill
  that produces claims, not just research. Use when a downstream consumer (human
  or agent) will act on the output and you want them to see WHERE the output is
  load-bearing vs WHERE it's a guess. Trigger on: "add legitimacy block",
  "grade this", "wrap with epistemic status", "make this traceable", "audit
  claims", "what's verified here", "status per claim", "honest about gaps".
  Also trigger automatically when composing with `systematic-research`,
  `200k-blueprint`, `code-review-checklist`, `market-intelligence-report`, or
  any skill whose output will be quoted/cited by a future decision.
  Do NOT use for: conversational replies, single-fact answers, creative writing,
  or outputs where the substance is the whole point and grading would be noise.
author: Robin Westerlund
version: 1.0.0
---

# Legitimacy Block

> Make any output epistemically honest. Per-claim status, dispute surfacing,
> gap reporting, and a self-grade. Same pattern every time. No hidden weakness.

---

## Purpose

Analytical output without epistemic structure looks authoritative whether or not
it deserves to. A reader can't tell which claims rest on three sources vs one
guess. They can't see what was *not* examined. They can't see whether the author
agrees with themselves at coverage 90% or 40%.

This skill is the pattern that several portable-kit primitives already implement
ad-hoc — `systematic-research`'s GRADE step, Bacowrs HC-1..HC-9, HarWestRs
SPEC_LOCK. Extracted here so it can be appended to *any* skill output, not
duplicated by copy-paste.

The output of this skill is a **block**, not a document. It wraps an existing
document. The upstream skill produces the substance; this skill produces the
epistemic envelope.

---

## When to Use

- Output will be quoted or cited downstream (by another agent, another session,
  or in a decision document)
- Output makes claims that a reader might disagree with
- Stakes are medium or higher — someone will act on this
- You're composing with `systematic-research`, `200k-blueprint`,
  `market-intelligence-report`, `code-review-checklist`, or any skill that
  produces evaluative or research output

## When Not to Use

| Situation | Use instead | Why |
|-----------|-------------|-----|
| Conversational reply | Direct conversation | Grading is noise |
| Single-fact lookup | Direct answer | One claim, one status = boilerplate |
| Creative writing | Skip | No claims to grade |
| Code that runs (and tests pass) | Tests are the legitimacy | Don't double-spend |

## What This Skill Produces

Exactly four blocks, in this order, appended to the upstream output:

1. **Claims table** — every substantive claim mapped to status + confidence + source
2. **Disputes** — disagreements surfaced, never silently resolved
3. **Gaps** — explicit list of what was NOT examined and why it might matter
4. **Grade block** — single YAML block with coverage / confidence / verdict / loop-back count

A 5th block (**Delta summary** — Assumptions / Risks / Did-not-verify) is
optional but recommended; it's already a portable-kit convention from the
`small-model-premium-protocol`.

---

## The Procedure

```
INVENTORY → CLASSIFY → DISPUTES → GAPS → GRADE → DELTA (optional)
```

Six steps. Five are mandatory. Each is short.

### Step 1: INVENTORY

**Action:** List every substantive claim in the upstream output.
**Output:** Internal numbered list `C1, C2, ...`.

A "substantive claim" is anything that:
- Could be wrong (factual claims, judgments, predictions)
- A reader could disagree with
- A downstream decision could rest on

Skip: section headers, restating the question, pure prose connectives.

If the upstream output is structured (tables, lists), each row/bullet is
typically one claim. If it's prose, extract one claim per assertion.

### Step 2: CLASSIFY

**Action:** Assign Status + Confidence + Sources to each claim.
**Output:** Claims table (see `templates/claims-table.md`).

| Field | Values | Rule |
|-------|--------|------|
| Status | Verified / Supported / Unverified / Disputed | See definitions below |
| Confidence | High / Medium / Low | See definitions below |
| Sources | S1, S2, ... or "internal-reasoning" / "direct-measurement" | What backs the claim |
| Critical? | yes / no | Does any conclusion depend on this claim? |

**Status definitions:**

| Status | Rule |
|--------|------|
| **Verified** | ≥ 3 independent sources support, 0 dissent — OR — direct measurement / canonical authority |
| **Supported** | 2 independent sources, 0 dissent — OR — strong inference from one A-rated authority |
| **Unverified** | 1 source only — OR — pure reasoning without external check |
| **Disputed** | Sources actively disagree, regardless of count |

**Confidence definitions:**

| Level | Assign when |
|-------|-------------|
| **High** | Empirical data, reproducible measurement, official docs from the owning party |
| **Medium** | Expert opinion with reasoning, multiple anecdotes, well-argued analysis |
| **Low** | Single anecdote, undated content, marketing copy, opinion without evidence |

**Critical?** flag: a claim is critical if any conclusion, recommendation, or
next-step in the upstream output depends on it being true. Critical claims must
be tracked separately in the Grade block (`critical_unverified` field).

**Do NOT:**
- Upgrade Status because the source is A-rated. Quality goes in Confidence,
  count goes in Status.
- Mark Status without naming sources. If you can't name a source, the claim is
  Unverified at best.
- Hide a claim that contradicts another — that's a Dispute, see Step 3.

### Step 3: DISPUTES

**Action:** Surface disagreements between sources or between claims.
**Output:** Disputes section.

| Topic | Position A | Position B | Verdict |
|-------|-----------|-----------|---------|
| ... | "X claim A" (S2, S5) | "X claim B" (S7) | Both true at different scales / Disputed — Robin's call / etc. |

**Rules:**
- Never resolve a dispute by counting sources. 3 vs 1 ≠ correct vs wrong.
- "Both true at different scales" is a valid verdict — say it explicitly.
- "Robin's call" / "Reader's call" is valid for opinion-shaped questions.
- "Disputed — unresolved" is valid. Honesty beats false synthesis.

If no disputes found: write "None identified" + one sentence on what was looked
for. Never silently omit the section.

### Step 4: GAPS

**Action:** List what was NOT examined and why it might matter.
**Output:** Gaps section.

For each gap:
- What you didn't verify
- Why it could matter (does any critical claim depend on it?)
- What would close the gap (which source / measurement / next pass)

**Anti-pattern:** "More research could be useful" is not a gap. A gap is
specific: *"Did not verify graphify's actual capability surface — inferred from
name. Closes by reading the repo's `__init__.py` and CLI entry-point."*

### Step 5: GRADE

**Action:** Compute the grade YAML block.
**Output:** Exactly one YAML block (see `templates/grade-block.yaml`).

```yaml
grade:
  coverage: <0-100>            # % of success criteria / questions answered with ≥ Supported status
  confidence: <0.0-1.0>        # weighted avg across critical claims: high=1.0, medium=0.6, low=0.3
  critical_unverified: <int>   # count of critical claims with Status=Unverified
  loop_backs_used: <int>       # how many times the upstream skill looped back to gather more (0 if N/A)
  source_diversity: "<n> / <required>"  # types-of-sources used / required
  gaps:
    - "<gap 1>"
    - "<gap 2>"
  verdict: <sufficient | needs-more-research | inconclusive>
```

**Verdict rules:**

| Verdict | When |
|---------|------|
| `sufficient` | coverage ≥ 80 AND confidence ≥ 0.7 AND critical_unverified = 0 |
| `needs-more-research` | coverage 50–79 OR confidence 0.5–0.69 OR critical_unverified > 0 |
| `inconclusive` | coverage < 50 OR confidence < 0.5 |

**Rounding:** if in doubt, round DOWN. False confidence is worse than honest
inconclusiveness.

### Step 6: DELTA (optional but recommended)

**Action:** Add a Delta summary in portable-kit's standard form.
**Output:** Three bullets.

```markdown
**Delta:**
- **Assumptions:** ...
- **Risks / edge cases:** ...
- **What I did NOT verify:** ...
```

This matches `small-model-premium-protocol` Phase 4 and feels native in any
portable-kit output.

---

## Composition Patterns

This skill is **always** invoked after another skill, never standalone.

### Pattern 1: Wrap a research output

```
systematic-research → produces research report → legitimacy-block wraps
```

The Grade block from `systematic-research` IS a partial legitimacy-block; this
skill upgrades it to the full four (or five) sections.

### Pattern 2: Wrap a blueprint

```
200k-blueprint → produces technical blueprint → legitimacy-block wraps
```

Especially useful — blueprints make many architectural claims; readers need to
see which are load-bearing.

### Pattern 3: Wrap a code review

```
code-review-checklist → produces review → legitimacy-block wraps
```

Each finding becomes a claim with Status. Distinguishes "definitely a bug" from
"might be a smell".

### Pattern 4: Wrap a market/competitive report

```
market-intelligence-report → produces analysis → legitimacy-block wraps
```

Industry analysis is mostly Unverified or Supported unless you do primary
research. Forcing the Status surface stops sliding into authoritative-sounding
prose.

### Anti-pattern: standalone wrap of nothing

If the upstream skill produced ≤ 3 substantive claims, the legitimacy-block
adds more bulk than signal. Skip it. The skill is wasted overhead on
small outputs.

---

## Output Format

The legitimacy-block appends to the upstream document — it does not replace
content. Standard layout:

```markdown
[upstream skill's full output]

---

## Legitimacy Block

### Claims

| ID | Claim | Status | Confidence | Sources | Critical? |
|----|-------|--------|------------|---------|-----------|
| C1 | ... | Verified | High | S1, S2, S3 | yes |
| C2 | ... | Unverified | Low | internal-reasoning | no |

### Disputes

| Topic | Position A | Position B | Verdict |
|-------|-----------|-----------|---------|
| ... | ... | ... | ... |

### Gaps

- Did not verify <X>. Could matter because <Y>. Closes by <Z>.

### Grade

```yaml
grade:
  coverage: 95
  confidence: 0.82
  critical_unverified: 0
  loop_backs_used: 0
  source_diversity: "5 / 3"
  gaps: [...]
  verdict: sufficient
```

**Delta:**
- Assumptions: ...
- Risks / edge cases: ...
- What I did NOT verify: ...
```

---

## Verification Checklist

Before declaring the legitimacy-block complete:

- [ ] Every substantive claim in the upstream output appears in the Claims table
- [ ] Every critical claim has Status ≥ Supported, OR is flagged in `critical_unverified`
- [ ] Disputes section is populated OR explicitly says "None identified — searched for X, Y"
- [ ] Gaps are specific (not "more research could help")
- [ ] Grade block computes — coverage and confidence are numbers, not vibes
- [ ] Verdict matches the verdict-rules table; rounded down on ambiguity
- [ ] If Delta is included, it has all three bullets (Assumptions / Risks / Did-not-verify)

---

## Notes

- This skill is **deliberately mechanical**. It is the structure, not the
  thinking. The thinking happens in the upstream skill.
- English output by default. Swedish if the upstream document is Swedish.
- The pattern matches `systematic-research`'s GRADE step but generalizes — that
  skill builds research from scratch, this skill *audits* output from any
  source.
- Version 1.0.0. Will likely iterate as it gets composed with more skills.

## Related

- `systematic-research` — first instance of this pattern, embedded in the pipeline
- `small-model-premium-protocol` — source of the Delta-summary convention
- `200k-blueprint` — natural composition target (blueprints have many claims)
- `code-review-checklist` — claims = findings; status disambiguates "bug" from "smell"
- `templates/claims-table.md` — copy-pasteable table skeleton
- `templates/grade-block.yaml` — copy-pasteable YAML skeleton
- `references/status-definitions.md` — full rules with worked examples
- `examples/wrapped-research-output.md` — concrete composition with systematic-research
