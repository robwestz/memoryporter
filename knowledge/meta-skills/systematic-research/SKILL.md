---
name: systematic-research
description: |
  Locked 6-step research pipeline with hard gates that guarantees structured,
  cross-verified findings regardless of topic. Not ad-hoc browsing — a
  deterministic process: SCOPE → SOURCE → EXTRACT → CROSS-VERIFY → SYNTHESIZE
  → GRADE. Every step must pass before the next begins. Output is always
  tabular with citations, confidence scores, and explicit gap reporting. The
  skill exists because agents left to research freely skip sources, don't
  cross-verify, don't grade coverage, and produce prose instead of evidence.
  Use when the user needs reliable answers about technology choices, architecture
  patterns, competitive landscape, best practices, or any question where
  "I think I read somewhere" is not acceptable. Trigger on: "research",
  "investigate", "find out", "what's the best way to", "compare options for",
  "systematic research", "due diligence on", "what do experts say about",
  "state of the art for", "researcha", "undersök", "ta reda på".
  Do NOT use for: single-fact lookups (just search), code debugging (use debug
  skills), opinion questions with no verifiable answer, or tasks where the user
  already knows the answer and wants implementation.
author: Robin Westerlund
version: 1.0.0
---

# Systematic Research

> From vague question to graded, cross-verified findings with citations.
> Same pipeline every time. No shortcuts.

## Purpose

Ad-hoc research fails in predictable ways: agents search once, read the first
result, present it as fact, and move on. No cross-verification, no confidence
scoring, no gap reporting. The user gets prose that *sounds* authoritative but
has no evidence structure behind it.

This skill replaces that with a locked pipeline. Six steps, six hard gates.
If a gate fails, the step loops or the research fails explicitly — it never
silently degrades into guessing.

## When to Use

- User needs to make a technology/architecture decision and wants evidence
- User asks "what's the best way to X" for a non-trivial X
- User wants competitive analysis or landscape mapping
- User needs to verify claims from a single source
- User says "research", "investigate", "due diligence", "state of the art"
- Before any major build — to ground architecture decisions in evidence

## When Not to Use

| If the situation is… | Use instead | Why |
|----------------------|-------------|-----|
| Single fact lookup ("what port does Redis use?") | Direct search | Pipeline overhead not worth it |
| Code is broken, need to fix it | `debug` or `repo-rescue` | This skill finds knowledge, not bugs |
| User already decided, wants implementation | `200k-blueprint` or direct build | Research would delay, not help |
| Pure opinion question ("is Go better than Rust?") | Conversation | No verifiable answer exists |

## Required Context

Before starting, confirm:

- **The question** — what the user wants to know (will be refined in SCOPE)
- **The stakes** — is this a "nice to know" or a "we're building on this"?
  High stakes = stricter SOURCE minimums
- **Available tools** — which of WebSearch, WebFetch, Context7, Ahrefs,
  mempalace are accessible this session? (Pipeline adapts to available tools)

---

## The Pipeline

```
SCOPE → SOURCE → EXTRACT → CROSS-VERIFY → SYNTHESIZE → GRADE
                    ↑                          │
                    └──── loop-back if coverage < 70% ────┘
                              (max 2 loops)
```

Every step produces a concrete artifact. Every gate is pass/fail.

---

### Step 1: SCOPE

**Action:** Transform the user's question into a testable research spec.
**Inputs:** User's question + stakes.
**Outputs:** Research spec (saved internally, shown to user for confirmation).

Write a spec with exactly these fields:

```yaml
question: "<one-sentence testable question>"
success_criteria:
  - "<criterion 1 — what counts as 'answered'>"
  - "<criterion 2>"
  - "<criterion 3>"
anti_goals:
  - "<what we are NOT trying to find>"
  - "<scope boundary>"
stakes: "<low | medium | high>"
source_minimum: <5 for low/medium, 8 for high>
source_type_minimum: <2 for low, 3 for medium/high>
```

**Hard gate:** All fields must be populated. `success_criteria` ≥ 2.
`anti_goals` ≥ 1. Show the spec to the user and get confirmation before
proceeding. If the user changes the question, re-scope — don't patch.

**Do NOT:**
- Proceed without user confirmation of the spec
- Write vague criteria ("understand X well") — every criterion must be
  checkable as yes/no
- Skip anti-goals — they prevent scope creep mid-research

---

### Step 2: SOURCE

**Action:** Discover and catalog sources across multiple types.
**Inputs:** Confirmed research spec from Step 1.
**Outputs:** Source registry (table).

Search strategy:

```
1. WebSearch — 3-5 different query formulations of the question
2. WebSearch — "[topic] vs [alternative]" queries (force comparisons)
3. WebSearch — "[topic] problems" / "[topic] criticism" (force counterpoints)
4. Context7 — if topic involves a library/framework, pull official docs
5. WebFetch — read each promising result; extract the actual content
6. Catalog every source in the registry
```

Source registry format:

| # | Title | URL | Type | Quality | Key claims | Read? |
|---|-------|-----|------|---------|------------|-------|
| 1 | … | … | docs / article / paper / repo / discussion / talk | A/B/C | brief summary | yes/no |

**Source quality rating:**

| Rating | Criteria |
|--------|----------|
| A | Official docs, peer-reviewed, canonical repo, recognized expert |
| B | Well-sourced article, popular community discussion with evidence, conference talk |
| C | Blog post, opinion piece, single anecdote, undated content |

**Hard gate:**
- Total sources ≥ `source_minimum` from spec
- Unique source types ≥ `source_type_minimum` from spec
- At least 1 source rated A
- At least 1 source explicitly critical or contrarian
- All sources marked "Read? yes" (no unread sources in registry)

**If gate fails:** Widen search queries. Try different phrasings, different
languages, date-restrict to last 12 months, search specific platforms
(GitHub discussions, HN, Reddit, Stack Overflow). If still failing after
3 rounds of widening, proceed with what you have but flag the gap in GRADE.

**Do NOT:**
- Count multiple pages from the same domain as separate sources
- Skip the contrarian search — "didn't find criticism" is different from
  "searched for criticism and found none"
- Mark a source as "Read" if you only read the title/snippet

---

### Step 3: EXTRACT

**Action:** Extract structured claims from each source.
**Inputs:** Source registry (all read).
**Outputs:** Claims table.

For each source, extract every relevant claim as a row:

| Claim ID | Statement | Source # | Confidence | Evidence type | Critical? |
|----------|-----------|----------|------------|---------------|-----------|
| C1 | "X outperforms Y by 3x on benchmark Z" | S3 | high | empirical | yes |
| C2 | "Most teams prefer X for this use case" | S5 | medium | consensus | no |
| C3 | "X has a known memory leak in version <4" | S7 | high | empirical | yes |

**Confidence levels:**

| Level | When to assign |
|-------|---------------|
| High | Empirical data, reproducible benchmark, official documentation |
| Medium | Expert opinion with reasoning, multiple anecdotes, well-argued analysis |
| Low | Single anecdote, undated claim, opinion without evidence, marketing copy |

**Evidence types:**

| Type | What it means |
|------|---------------|
| Empirical | Measured data, benchmarks, experiments, production metrics |
| Authority | Official docs, recognized expert, canonical reference |
| Consensus | Multiple independent sources agree (even without data) |
| Anecdotal | Single person's experience, case study of 1 |

**Critical claim:** A claim is critical if any success criterion depends on
it being true or false.

**Hard gate:**
- Every claim is tabular (no prose-only extractions)
- Every claim has source #, confidence, and evidence type
- Critical claims are flagged
- At least 1 claim per success criterion (otherwise the research isn't
  covering the question)

**Do NOT:**
- Paraphrase claims so aggressively they lose their original meaning
- Assign "high confidence" to consensus without data
- Skip a claim because it contradicts an earlier one — that's a finding

---

### Step 4: CROSS-VERIFY

**Action:** Cross-reference claims across sources. Surface agreements,
disputes, and gaps.
**Inputs:** Claims table from Step 3.
**Outputs:** Verified claims table + disputes list.

For each unique claim (group similar claims):

| Claim | Status | Supporting sources | Dissenting sources |
|-------|--------|--------------------|--------------------|
| "X outperforms Y by 3x" | verified | S3, S5, S8 | — |
| "X has memory leak in v<4" | supported | S7, S9 | — |
| "Y is easier to maintain" | disputed | S2, S4 | S6, S8 |
| "X requires 16GB RAM minimum" | unverified | S3 | — |

**Status definitions:**

| Status | Rule |
|--------|------|
| Verified | ≥ 3 independent sources support, 0 dissent |
| Supported | 2 independent sources support, 0 dissent |
| Unverified | 1 source only |
| Disputed | Sources actively disagree |

**Hard gate:**
- Every critical claim (from Step 3) has a status
- Any critical claim that is "unverified" triggers a **SOURCE loop-back**:
  go back to Step 2, search specifically for verification of that claim.
  Max 1 loop-back per claim, max 2 total loop-backs per research.
- Disputes are explicitly surfaced — never silently resolved by picking
  the majority

**Do NOT:**
- Treat "I didn't find disagreement" as "verified" — absence of evidence
  is not evidence of absence. If only 1 source mentions it, it's unverified.
- Silently drop claims that are hard to verify — flag them
- Resolve disputes by counting sources (3 vs 1 ≠ correct vs wrong)
- Upgrade a claim to Supported/Verified just because its source is A-rated.
  The rule is based on source *count*, not source quality. A claim from a
  single peer-reviewed paper is still Unverified if no independent source
  confirms it. Quality is captured in Confidence; count is captured in Status.

---

### Step 5: SYNTHESIZE

**Action:** Produce the final research output using the fixed template.
**Inputs:** Verified claims table + disputes + source registry.
**Outputs:** Research report (see `templates/research-output.md`).

The output template has 6 mandatory sections. See
`templates/research-output.md` for the full template. Summary:

1. **Executive answer** — 3 sentences max. Direct answer to the SCOPE
   question. If the answer is "it depends", state the conditions.

2. **Key findings** — Table: claim | status | confidence | key sources.
   Only verified/supported claims. Ordered by relevance to success criteria.

3. **Disagreements** — What experts/sources disagree on. Both sides
   presented with their evidence. No resolution — the user decides.

4. **Gaps** — What we couldn't verify. What remains unknown. What would
   require more research or experimentation to answer.

5. **Source quality summary** — Table: source # | title | type | quality
   rating | contribution. Brief note on each source's role.

6. **Research metadata** — Pipeline version, date, tools used, total
   sources found, loop-backs triggered, time elapsed.

**Hard gate:**
- All 6 sections populated (empty sections get "None identified" with
  explanation of why — never silently omitted)
- Executive answer is ≤ 3 sentences
- Key findings use the table format (not prose)
- Every claim in Key findings appears in the Cross-verify table
- Source quality summary includes all sources from the registry

**Do NOT:**
- Write a narrative essay — the template IS the output
- Add "recommendations" — this is research, not consulting. Present
  evidence; let the user decide.
- Hide gaps or low-confidence claims — transparency is the product

---

### Step 6: GRADE

**Action:** Self-assess the research quality. Score, gaps, and
recommendation for next steps.
**Inputs:** Completed research output from Step 5.
**Outputs:** Grade block appended to the report.

```yaml
grade:
  coverage: <percentage of success_criteria answered>
  confidence: <weighted average: high=1.0, medium=0.6, low=0.3>
  gaps:
    - "<what remains unknown>"
    - "<what would improve confidence>"
  source_diversity: "<number of source types used> / <required>"
  critical_unverified: <count of critical claims still unverified>
  loop_backs_used: <0-2>
  verdict: "<sufficient | needs-more-research | inconclusive>"
```

**Verdicts:**

| Verdict | When |
|---------|------|
| Sufficient | Coverage ≥ 80%, confidence ≥ 0.7, critical_unverified = 0 |
| Needs-more-research | Coverage 50-79% OR confidence 0.5-0.69 OR critical_unverified > 0 |
| Inconclusive | Coverage < 50% OR confidence < 0.5 |

**Hard gate:**
- If coverage < 70% AND loop_backs_used < 2: **loop back to Step 2**
  with the unfulfilled success criteria as new search targets
- If coverage < 70% AND loop_backs_used = 2: proceed but verdict =
  "inconclusive" with explicit gap list
- Grade is ALWAYS shown to the user — never hidden or summarized away

**Do NOT:**
- Grade your own work generously — if in doubt, round down
- Skip the grade ("the research looks comprehensive") — compute it
- Hide an inconclusive verdict — it's more useful than false confidence

---

## Output

Every research produces exactly one artifact:

- **Research report** — using `templates/research-output.md`, with all 6
  sections + grade block. Saved to `research/<topic-slug>.md` at the
  project root. If the `research/` directory doesn't exist, create it.
  Example: `research/agentic-platform-day1.md`.

- **Claims table** (optional, for debugging/iteration) — saved to
  `research/<topic-slug>-claims.md` as the EXTRACT step's raw output.
  Useful during a loop-back.

Optionally:
- **mempalace storage** — if mempalace is available, store key findings
  via `mempalace_kg_add` for future session recall

---

## Works Well With

- `200k-blueprint` — research grounds architecture decisions before building
- `buildr-scout` — scout extracts from single sources; this skill
  cross-verifies across many
- `last30days` — for recency-specific research (last 30 days only)
- `source-grounding` — for per-claim fact verification within a document

---

## Notes

- This skill is **deliberately slow**. 6 steps with gates take longer than
  a quick search. That's the point — reliability over speed.
- The pipeline is topic-agnostic. It works for tech architecture, competitive
  analysis, regulatory questions, or "what's the best coffee grinder".
- English output by default. Swedish if the user's question is in Swedish.
- If a research session is interrupted, the claims table and source registry
  are the recovery artifacts — resume from the last completed step.
- Version 1.0.0. Will iterate based on first real-world use cases.
