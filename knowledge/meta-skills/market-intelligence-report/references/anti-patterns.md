# Anti-Patterns in Competitive Analysis

> **When to read this:** When you suspect something is wrong with the current report —
> or when a section feels weak but you can't articulate why. Each entry names the mistake,
> the symptom, the root cause, and the specific fix.

---

## Phase 1 — Scope Mistakes

### AP-01: Accepting a too-broad niche

**Symptom:** The niche is a product category ("CRM software", "marketing tools") rather
than a bounded segment with a specific buyer and trigger.

**Root cause:** User asked a broad question and the skill proceeded without narrowing.

**Fix:** Pause before Phase 1. Offer 3 specific narrowed alternatives:
> "The niche 'marketing tools' is too broad to produce defensible sizing or useful
> competitor profiles. Would one of these work better?
> (a) AI-powered email outreach tools for B2B SaaS founders
> (b) Social media scheduling tools for solo creators
> (c) Marketing analytics dashboards for DTC e-commerce brands"

**Test:** A good niche implies a specific buyer persona and purchase trigger in one sentence.

---

### AP-02: Starting research without a scope brief

**Symptom:** Phase 2 discovery produces a sprawling competitor list that includes
everything from SMB tools to enterprise platforms.

**Root cause:** Competitor inclusion criteria were not defined before discovery began.

**Fix:** Complete Phase 1 scope brief first. Define competitor inclusion criteria explicitly:
"A Tier 1 competitor must serve [specific customer type] with [specific use case] at
[specific price tier]. Anything else is Tier 2 or out of scope."

---

## Phase 2 — Discovery Mistakes

### AP-03: Publishing discovery notes as the report

**Symptom:** The report contains raw search results, unverified claims, and fragments
presented as findings.

**Root cause:** Treating the discovery phase as output rather than input.

**Fix:** Discovery notes are internal only. Every fact that appears in the report must be:
- Attributed to a specific source
- Verified (the page was read, not just the snippet)
- Contextualized (what it means for this niche, not just what it says)

---

### AP-04: Using only one search type for competitor discovery

**Symptom:** The competitor list only contains well-known brands and misses niche players,
recent entrants, or adjacent competitors.

**Root cause:** Searching only for "[niche] top tools" or "[niche] best software."

**Fix:** Run all 7 searches in the Phase 2 sequence. G2/Capterra category pages and
"[niche] alternatives" searches surface players that don't rank for top-of-funnel queries.
Funding searches surface recent entrants not yet prominent in SEO.

---

## Phase 3 — Competitor Mapping Mistakes

### AP-05: Listing pricing without a source

**Symptom:** Competitor pricing table has numbers with no indication of where they came from.

**Root cause:** Price remembered from a previous visit, inferred, or guessed.

**Fix:** Every price point in the report must either:
- Cite the exact URL and date accessed
- Be labeled "not disclosed — contact sales"
- Be labeled "estimated from [source]: [review mention / job posting / analyst report]"

No in-between. "Pricing: ~$49/month" with no source fails Layer 1 check S8.

---

### AP-06: Forcing 4 Tier 1 competitors when they don't exist

**Symptom:** Competitors are classified as Tier 1 that are clearly Tier 2 (different
customer or different use case) just to meet the minimum.

**Root cause:** Treating the minimum as a target rather than a threshold.

**Fix:** If fewer than 4 genuine Tier 1 competitors exist, state it explicitly:
> "This niche has 2 direct Tier 1 competitors and 4 Tier 2 adjacents. This indicates
> [early-stage market with limited incumbency / high fragmentation / niche still forming].
> Competitive analysis covers both tiers given limited Tier 1 coverage."

This finding is itself strategically valuable — do not hide it.

---

## Phase 4 — Market Sizing Mistakes

### AP-07: Single-source TAM

**Symptom:** Market Sizing section contains one number: "According to [analyst firm],
the market is worth $X billion."

**Root cause:** Treating citation as methodology.

**Fix:** One source is a data point. Show the full calculation chain — top-down filter
sequence AND bottom-up ICP × ACV. See `references/market-sizing.md` for worked examples.

---

### AP-08: Filters without rationale

**Symptom:** Top-down calculation applies percentages like "Nordic = 3%" with no source.

**Root cause:** Using round numbers that make the math work rather than defensible filters.

**Fix:** Every filter percentage must state either:
- A named source: "Nordic = 2.1% of global software spend (Eurostat 2024)"
- A reasoned assumption: "B2B SaaS segment = ~60% of this market (estimated from G2
  category breakdown, conservative assumption — could be 50–70%)"

If you cannot justify the filter, remove it and note the limitation.

---

### AP-09: Averaging top-down and bottom-up when they diverge by > 20%

**Symptom:** Report shows both calculations then states the average as the estimate
without explaining why they differ.

**Root cause:** Wanting a single clean number.

**Fix:** Divergence > 20% is a signal, not a problem to hide. Explain what assumption
drives the gap. Often the top-down is a broader category than the bottom-up ICP.
Present as a range with the most defensible figure identified and explained.

---

## Phase 5 — Analysis Mistakes

### AP-10: Scoring Porter forces without evidence

**Symptom:** Porter's table has scores like "Threat of new entrants: 3" with one
generic sentence that could apply to any market.

**Root cause:** Treating Porter's as a labeling exercise rather than an analytical one.

**Fix:** Every score requires named, specific evidence. See `references/frameworks.md`
for the evidence standard per force. If you don't have evidence for a force, say so:
"Supplier power: confidence LOW — could not identify specific infrastructure dependencies.
Estimate: 2/5, pending verification."

---

### AP-11: Listing SWOT without cross-referencing

**Symptom:** SWOT section has four bullet lists. No analysis of what the combinations mean.

**Root cause:** Treating SWOT as an inventory exercise.

**Fix:** Cross-reference the four cells. S × O = leverage plays. W × T = existential
risks. The cross-referenced cells generate strategic options. A SWOT list generates nothing.
See `references/frameworks.md` for the cross-reference method.

---

## Phase 6 — Positioning Mistakes

### AP-12: Generic differentiation recommendations

**Symptom:** Recommendations include "focus on ease of use", "build better customer
support", "differentiate on quality."

**Root cause:** Analysis identified the dimension but not the specific opportunity within it.

**Fix:** Every differentiation recommendation must be specific enough for a sprint ticket:
- **Generic:** "Improve onboarding experience"
- **Specific:** "Implement interactive product tour for the first 3 use cases (median
  competitor: no in-app onboarding, 4/5 top G2 complaints mention setup complexity —
  G2, March 2026). Targets Comp A's largest vulnerability."

---

### AP-13: Claiming whitespace without evidence

**Symptom:** Report identifies a whitespace opportunity with no evidence that buyers
want it.

**Root cause:** Extrapolating from logical analysis without grounding in customer data.

**Fix:** Every whitespace claim needs at least one signal from customer data:
- Review complaint about absence of the feature
- Job posting asking for the capability
- Competitor who recently added it and saw uptake
- User research, survey data, or analyst report citing demand

Logical inference is not evidence. "No one does X, therefore X is an opportunity" fails
unless you can show someone wants X.

---

## Phase 7 — Delivery Mistakes

### AP-14: Writing the Executive Summary first

**Symptom:** The Executive Summary sounds confident but the analysis underneath doesn't
support the conclusions, or the conclusions are vague because the analysis wasn't done yet.

**Root cause:** Writing the summary at the start of drafting rather than the end.

**Fix:** Write the Executive Summary last. It is a synthesis, not an introduction.
The first paragraph must contain the single most important finding — which you cannot
know until all analysis is complete.

---

### AP-15: More than 5 recommendations

**Symptom:** Recommendations section has 8, 10, or 12 items.

**Root cause:** Not wanting to rank or cut. Treating completeness as quality.

**Fix:** A long recommendation list is a symptom of unclear thinking, not thorough analysis.
Rank by impact. Cut to 5 maximum. If it doesn't make the top 5, move it to an appendix
labeled "additional considerations." The decision-maker's attention is the scarce resource.

---

### AP-16: Vague Layer 2 feedback

**Symptom:** Layer 2 assessment says "Q5 Weak — the differentiation could be stronger."

**Root cause:** Not identifying the specific deficiency.

**Fix:** Layer 2 feedback must quote the specific deficiency and write a specific fix
instruction. "Q5 Weak — Section 'Differentiation Options' item 2 recommends 'better UX'
without naming which competitor has poor UX, citing which evidence, or specifying what
'better UX' means in this context. Fix: state that [Comp B] has 2.8/5 onboarding rating
(G2, 47 reviews), that the specific pain is [X], and that the recommended differentiator
is [specific capability]."

---

## Summary Table

| # | Phase | Mistake | Signal | Fix |
|---|-------|---------|--------|-----|
| AP-01 | Scope | Too-broad niche | Competitors span multiple segments | Offer 3 narrowed alternatives |
| AP-02 | Scope | No scope brief before research | Sprawling competitor list | Complete Phase 1 brief first |
| AP-03 | Discover | Publishing raw notes | Unverified fragments in report | Discovery = input only |
| AP-04 | Discover | Single search type | Missing niche/new entrants | Run all 7 Phase 2 searches |
| AP-05 | Map | Unsourced pricing | Numbers without attribution | Source or label "not disclosed" |
| AP-06 | Map | Forcing Tier 1 count | Wrong tier classifications | State market has <4 Tier 1 and explain |
| AP-07 | Size | Single-source TAM | One analyst figure as sizing | Dual methodology mandatory |
| AP-08 | Size | Filters without rationale | Round-number percentages | Every filter needs source or stated assumption |
| AP-09 | Size | Averaging divergent TAMs | Clean midpoint hides broken assumption | Explain divergence, present as range |
| AP-10 | Analyze | Scoreless Porter | Generic force descriptions | Named evidence for every score |
| AP-11 | Analyze | SWOT as list | Four bullet lists, no cross-refs | Cross-reference all four cells |
| AP-12 | Position | Generic recommendations | "Improve quality", "focus on UX" | Specific capability + target + evidence |
| AP-13 | Position | Evidenceless whitespace | "No one does X" with no demand signal | Cite customer signal for every whitespace |
| AP-14 | Deliver | Summary written first | Confident conclusions without analysis | Write summary last |
| AP-15 | Deliver | Too many recommendations | 8+ items | Rank and cut to 5 maximum |
| AP-16 | Deliver | Vague L2 feedback | "Could be stronger" | Quote deficiency + write specific fix |
