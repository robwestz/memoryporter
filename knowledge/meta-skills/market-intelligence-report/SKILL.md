---
name: market-intelligence-report
description: |
  Produces a consulting-grade competitive intelligence report for a market niche.
  Seven-phase process: Scope → Discover → Map → Size → Analyze → Position → Deliver.
  Two-layer quality model: structural completeness (11 checks) + strategic defensibility
  (8 dimensions). Use when a founder needs a competitive landscape, an investor needs
  market sizing, a product team needs positioning whitespace, or a strategist needs to
  understand competitive dynamics before entering a market. Trigger on: "competitive
  analysis for [niche]", "market intelligence report", "who are the competitors in
  [space]", "is there room in [market]", "competitive landscape for [niche]", "market
  sizing for [segment]". Also use when the user wants to understand if a market is
  attractive before investing or launching a product.
author: Robin Westerlund
version: 1.0.0
---

# Market Intelligence Report

## Purpose

Produce a consulting-grade competitive intelligence report for any bounded market niche.
The output is a complete Markdown report — structured like a McKinsey/BCG deliverable —
ready for a founder, investor, or product leader to act on.

**Honest scope:** This skill runs on secondary research (web search, public data, product
pages, pricing pages, review platforms). That positions output at the 50,000–80,000 SEK
tier of consulting value. Not the 300,000+ SEK tier that requires expert interviews and
mystery shopping. Deliver the best possible secondary-research instrument. Do not pretend
to capabilities you do not have.

---

## Required Input

| Input | Required | Notes |
|-------|----------|-------|
| `market_niche` | Yes | Specific, bounded — e.g., "AI-powered email outreach tools for B2B SaaS", not "email software" |
| `geography` | No | Defaults to global. Narrows TAM/SAM and competitor set. |
| `audience` | No | Founder / investor / product team / board. Shapes recommendation framing. |
| `depth` | No | `quick` = phases 1–4 only. `full` = all 7 phases. Defaults to `full`. |
| `known_competitors` | No | Seed list — skill verifies and expands, does not replace with this list. |
| `client_context` | No | If user has an existing product/position. Enables relative positioning in Phase 6. |

**If niche is too broad:** Pause before Phase 1. Ask the user to narrow it. Offer 3 example
wordings that would work. A niche is narrow enough when a specific buyer persona and purchase
trigger are implied.

**Anti-pattern:** Never accept "SaaS tools" or "marketing software" as `market_niche`.

---

## Phase 1 — SCOPE

**Input:** `market_niche` + `geography` + `audience`

Produce an internal scope brief (not published) before touching any research.

| Scope element | How to define it |
|---------------|-----------------|
| Market boundaries | List 3–5 things explicitly IN scope and 2–3 explicitly OUT |
| Research questions | State 3–5 specific questions this report will answer |
| Buyer persona | Who purchases in this niche, what is their trigger, what is their switching cost |
| Competitor inclusion criteria | What makes something Tier 1 vs. Tier 2 vs. Tier 3 |
| Positioning map axes | Choose 2 axes that actually differentiate in this niche — not generic "price vs. quality" |

**Anti-pattern:** Do not begin Phase 2 before the scope brief is complete. Undefined scope
produces a report that covers everything and proves nothing.

---

## Phase 2 — DISCOVER

**Input:** Scope brief from Phase 1

Run this search sequence in order:

| Search | Query pattern | Extracts |
|--------|--------------|----------|
| 1 | `[niche] competitors` + `[niche] alternatives` | Seed competitor list |
| 2 | `[niche] market size` + `[niche] market report` | TAM anchor data |
| 3 | Top 3 competitor names + `pricing` | Pricing fragments |
| 4 | `[niche] trends 2024 2025` | PESTEL signals |
| 5 | G2 / Capterra / Trustpilot for niche | Customer voice, review themes |
| 6 | `[niche] funding` OR `[niche] investment` | Market momentum signals |
| 7 | `[niche] job postings` | Strategic direction signals |

**Output:** Internal discovery notes — competitor list with confidence tier, market data
fragments with sources, pricing fragments, trend signals.

**Anti-pattern:** Do not publish discovery notes as the report. Discovery is input, not
output. Verify every fragment before it appears in the report.

---

## Phase 3 — MAP

**Input:** Discovery notes

Classify every discovered competitor:

| Tier | Definition |
|------|-----------|
| Tier 1 | Direct: same target customer AND same use case |
| Tier 2 | Adjacent: same target customer OR same use case, not both |
| Tier 3 | Potential entrants: different market today, credible path to this niche |

For each Tier 1 and significant Tier 2 competitor, collect:
- Business model and revenue structure
- Pricing model and price points (with source — if unavailable, label "not disclosed")
- Target customer and stated differentiator
- Key product capabilities
- Market signals (funding, growth, strategic direction)

Populate `templates/competitor-card.md` for each named competitor.
Complete the feature comparison matrix in `templates/competitive-report.md`.
Plot the positioning map using the axes chosen in Phase 1.

**Minimum:** 4 Tier 1 competitors with complete profiles. If fewer exist, state that
explicitly and explain what it signals about market structure.

**Anti-pattern:** Never list pricing without a source. If not publicly available,
state "not disclosed" and note any signals (user reviews, analyst estimates).

---

## Phase 4 — SIZE

**Input:** Discovery data + competitor profiles

Dual methodology is mandatory. Single-source sizing is not sizing — it is citation.

**Top-down:**
1. Find a published industry market size (cite source + date)
2. Apply segmentation filters: geography → customer type → use case → addressable tier
3. Show each filter as a percentage with rationale
4. Derive TAM → SAM from the filter chain

**Bottom-up:**
1. Define the ICP from the Phase 1 scope brief
2. Count addressable companies/users using proxies (industry registries, LinkedIn, app
   store rankings, SimilarWeb category data)
3. Estimate ACV from pricing analysis
4. TAM = count × ACV; SOM = realistic 3-year capture %

**Cross-validation:**

| Divergence | Action |
|-----------|--------|
| ≤ 20% | State estimate with stated confidence |
| > 20% | Show both, explain divergence, present as a range |
| Any | Show bear / base / bull scenarios with the key assumption driving each |

For full worked example, see `references/market-sizing.md`.

**Anti-pattern:** Do not cite a single source and call it TAM. Show both calculation
chains with every assumption visible.

---

## Phase 5 — ANALYZE

**Input:** Competitor profiles + market data

**Porter's Five Forces** — score each force 1–5 with named evidence:

| Force | What to assess | Evidence types |
|-------|---------------|----------------|
| New entrants | Capital requirements, regulation, switching costs, brand moats | Funding rounds in niche, time-to-launch estimates |
| Substitutes | What else the buyer reaches for (not competitors — substitutes) | Adjacent product categories, DIY alternatives |
| Supplier power | Who controls critical inputs: data, infrastructure, APIs, talent | Platform dependency, API pricing changes |
| Buyer power | Demand concentration, switching cost, alternatives count | Contract lengths, churn signals, negotiation leverage |
| Rivalry intensity | Competitor count, differentiation depth, price war signals | Pricing similarity, marketing messaging overlap |

Conclude with an overall industry attractiveness verdict: Attractive / Moderate / Unattractive.

**SWOT cross-reference** (for the niche entrant, not a named competitor):

| Cross-cell | Output |
|-----------|--------|
| Strengths × Opportunities | Top leverage plays — name them |
| Weaknesses × Threats | Existential risks — name them |
| Strengths × Threats | Defense plays |
| Weaknesses × Opportunities | Build / buy / partner options |

For full framework application guide, see `references/frameworks.md`.

**Anti-pattern:** Never score a Porter force without evidence. "Threat of new entrants: 3"
with no supporting argument is decoration, not analysis.

---

## Phase 6 — POSITION

**Input:** Phase 5 analysis + Phase 3 competitor map + `client_context` if provided

**Whitespace identification:**
List the 6–10 key competitive factors in this niche from competitor research.
For each factor, note which competitors invest heavily vs. lightly.
Whitespace = factor combinations no current competitor covers. See `templates/positioning-canvas.md`.

**Differentiation options** — produce 3–5, each with:

| Element | Required content |
|---------|-----------------|
| The differentiator | Specific capability, feature set, or go-to-market approach |
| Vulnerable competitor | Which competitor this counters and why they are vulnerable |
| Capability required | What the entrant must build, buy, or partner for |
| Buyer signal | Evidence this matters — cite review data, job posting, market gap |

If `client_context` is provided: map the client's position onto the competitor matrix
and identify their 2–3 most defensible specific moves.

**Anti-pattern:** Never recommend "focus on quality" or "build a better product." Every
recommendation must be specific enough that a product team could write a sprint ticket for it.

---

## Phase 7 — DELIVER

**Input:** All previous phase outputs

1. Populate `templates/competitive-report.md` in section order
2. Write the Executive Summary **last** — lead with the single most important finding
3. Run Layer 1 structural checks (11 items) — fix all failures before proceeding
4. Run Layer 2 strategic quality ratings (8 dimensions) — improve any Weak or Failing
5. Compute verdict and record it in the report footer
6. Produce 3 priority actions — ranked by impact, specific enough to assign to a named person

**Layer 1 — Structural (Pass/Fail):**

| # | Check | Threshold |
|---|-------|-----------|
| S1 | Market scope with explicit IN/OUT boundaries | Present |
| S2 | ≥ 4 named Tier 1 competitors with complete profiles | ≥ 4 |
| S3 | Every market size/share claim has a cited source | 0 unsourced |
| S4 | TAM/SAM/SOM with both top-down and bottom-up shown | Both present |
| S5 | Porter's Five Forces — all 5 assessed with evidence | 5/5 |
| S6 | Competitor matrix with name, pricing, customer, differentiator | Present |
| S7 | Positioning map with 2 defined axes and ≥ 4 competitors plotted | Present |
| S8 | Every pricing claim sourced or labeled "not disclosed" | 0 unsourced |
| S9 | Recommendations with ≥ 3 specific actions | ≥ 3 |
| S10 | Decision framework with if/then logic (not a bullet list) | Present |
| S11 | Sources section with ≥ 5 citations | ≥ 5 |

**Layer 2 — Strategic Quality (Strong 3 / Adequate 2 / Weak 1 / Failing 0):**

| # | Dimension | What "Strong" looks like |
|---|-----------|--------------------------|
| Q1 | Market definition precision | Scope brief is unambiguous — could hand to a researcher |
| Q2 | Competitor identification completeness | Tier 1/2/3 classified with rationale stated |
| Q3 | Market sizing credibility | Both methods shown, divergence explained, scenarios stated |
| Q4 | Competitive dynamics depth | Each Porter force backed by named evidence |
| Q5 | Differentiation sharpness | Each opportunity cites a specific gap from competitor research |
| Q6 | Recommendation actionability | Each recommendation names who does what and by when |
| Q7 | Data sourcing quality | Mix of: market reports, product pages, review platforms, job data |
| Q8 | Strategic coherence | Recommendations are traceable back to specific findings |

For Weak or Failing dimensions: quote the specific deficiency and write a specific fix
instruction. Vague feedback ("positioning could be stronger") is not permitted.

**Verdict logic:**

| Verdict | Condition |
|---------|-----------|
| DELIVERY-READY | L1: 11/11 AND L2: 0 Failing, ≤ 2 Weak |
| STRENGTHEN-THEN-DELIVER | L1: 11/11 AND L2: 1 Failing OR 3–4 Weak |
| RESEARCH-REQUIRED | L1: any Fail OR L2: 2+ Failing |

For full quality rubric with worked examples, see `references/quality-standard.md`.

**Anti-pattern:** Do not write the Executive Summary first. It is only credible written
after all analysis is complete. First-written summaries produce wishful framing.

---

## Anti-Patterns (Master List)

| Do NOT | Instead |
|--------|---------|
| Accept a too-broad niche | Pause — offer 3 narrowed alternatives before proceeding |
| Begin Phase 2 without a scope brief | Complete Phase 1 first — it constrains everything |
| Cite one source as TAM | Show dual methodology — one source is a data point |
| Score Porter forces without evidence | Name specific rationale for every score |
| List pricing without a source | Cite source or label "not disclosed" |
| Write Executive Summary first | Write it last after all analysis is complete |
| Produce generic recommendations | Name the capability, the competitor it counters, the evidence |
| Mark Layer 1 pass as ready to deliver | Always run Layer 2 — floor ≠ ceiling |
| Produce more than 5 recommendations | Rank and cut — long lists signal unclear thinking |
| Treat discovery notes as the report | Verify every fragment before it appears in output |

---

## Quick Reference

```
Phase 1 — SCOPE     Define market boundaries, research questions, axes, criteria
Phase 2 — DISCOVER  7-search sequence → raw discovery notes
Phase 3 — MAP       Tier classify → competitor cards → matrix → positioning map
Phase 4 — SIZE      Top-down + bottom-up → cross-validate → bear/base/bull
Phase 5 — ANALYZE   Porter's Five Forces (scored) + SWOT cross-reference
Phase 6 — POSITION  Whitespace + 3–5 specific differentiation options
Phase 7 — DELIVER   Populate template → Layer 1 → Layer 2 → verdict → priority actions
```

---

## Integration Points

| Component | How this skill connects |
|-----------|------------------------|
| `templates/competitive-report.md` | Primary output template — populate in Phase 7 |
| `templates/competitor-card.md` | One instance per Tier 1 competitor — populate in Phase 3 |
| `templates/positioning-canvas.md` | Blue Ocean whitespace mapping — use in Phase 6 |
| `references/frameworks.md` | Porter's, SWOT, Blue Ocean application guide |
| `references/market-sizing.md` | Full dual-method worked example for Phase 4 |
| `references/quality-standard.md` | Full L1/L2 rubric with worked examples for Phase 7 |
| `references/anti-patterns.md` | Extended mistake catalog for all phases |
| **skill-creator** | After forging, run eval loop on 3 test niches |
