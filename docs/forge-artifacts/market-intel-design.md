# Skill Design: market-intelligence-report
## Blueprint for skill-forge authoring

**Date:** 2026-04-13
**Shape:** Full (SKILL.md + README.md + metadata.json + templates/ + references/)
**Status:** Design — ready for skill-forge to author

---

## What This Skill Does

Takes a **market niche** (not a company) and produces a consulting-grade competitive
intelligence report via seven structured phases, validated against a two-layer quality model.

The output is a complete Markdown report — structured like a McKinsey/BCG deliverable —
that a founder, investor, or product leader can use to make positioning and investment decisions.

**Honest scope:** This skill runs entirely on secondary research (web search, public data,
product pages, pricing pages, review platforms). That positions the output at the
50,000–80,000 SEK tier of consulting value — not the 300,000+ SEK tier that requires
primary research (expert interviews, mystery shopping, win/loss calls). The skill's job
is to be the best possible secondary-research instrument, not to pretend it has capabilities
it does not have.

---

## Package Manifest

```
knowledge/meta-skills/market-intelligence-report/
├── SKILL.md                          ← Authoritative process spec
├── README.md                         ← Installation + trigger conditions
├── metadata.json                     ← Marketplace metadata
├── templates/
│   ├── report-template.md            ← Full report output template (Fixed/Variable zones)
│   ├── competitor-profile.md         ← One-page profile template per competitor
│   └── competitor-matrix.md          ← Comparison matrix template (features × competitors)
└── references/
    ├── analytical-frameworks.md      ← Porter, Blue Ocean, SWOT, PESTEL — how to apply, not define
    ├── sizing-methodology.md         ← Top-down + bottom-up TAM/SAM/SOM with worked example
    ├── source-quality-guide.md       ← Tier 1/2/3 sources, what each is good for, how to cite
    └── quality-layers.md             ← Full rubric for L1 structural checks + L2 strategic ratings
```

---

## Frontmatter (for SKILL.md)

```yaml
name: market-intelligence-report
description: |
  Produces a consulting-grade competitive intelligence report for a market niche.
  Seven-phase process: Scope → Discover → Map → Size → Analyze → Position → Deliver.
  Two-layer quality model: structural completeness + strategic defensibility. Use when
  a founder needs a competitive landscape, an investor needs market sizing, a product
  team needs positioning whitespace, or a strategist needs to understand competitive
  dynamics before entering a market. Trigger on: "competitive analysis for [niche]",
  "market intelligence report", "who are the competitors in [space]", "is there room
  in [market]", "competitive landscape for [niche]", "market sizing for [segment]".
  Also use when the user wants to understand if a market is attractive before investing.
author: Robin Westerlund
version: 1.0.0
```

---

## Inputs Specification

| Input | Required | Type | Notes |
|-------|----------|------|-------|
| `market_niche` | Yes | string | Specific, bounded niche — e.g., "AI-powered email outreach tools for B2B SaaS" not "email software" |
| `geography` | No | string | Defaults to global. Narrows TAM/SAM/SOM and competitor set. |
| `audience` | No | string | Who will read this: founder, investor, product team, board. Shapes recommendation framing. |
| `depth` | No | "quick" / "full" | Quick = phases 1–4 only (landscape + sizing). Full = all 7 phases. Defaults to "full". |
| `known_competitors` | No | string[] | Seed list. Skill will verify and expand — not replace with this list. |
| `client_context` | No | string | If the user has an existing product/position, describe it. Enables relative positioning in Phase 6. |

**Anti-pattern:** Do not accept "SaaS tools" or "marketing software" as `market_niche` —
too broad to produce defensible sizing or useful competitor profiles. Narrow to the point
where a specific buyer persona and purchase trigger are implied.

**If niche is too broad:** Pause before Phase 1 and ask the user to narrow it. Offer
3 example wordings that would work.

---

## Output

**Primary deliverable:** Completed `templates/report-template.md` — a full Markdown report
with all sections populated.

**Structure of the report output:**
1. Executive Summary (findings + recommendations + cost of inaction)
2. Scope & Methodology (research questions, sources used, limitations)
3. Market Definition & Sizing (TAM/SAM/SOM with dual methodology)
4. Competitive Landscape (market structure, Tier 1/2/3 classification, positioning map)
5. Competitor Profiles (4–8 profiles using `templates/competitor-profile.md`)
6. Competitive Dynamics (Porter's Five Forces — scored with evidence)
7. Pricing Analysis (pricing model matrix + price-value positioning)
8. Strategic Implications (whitespace, threats, differentiation opportunities)
9. Recommendations & Decision Framework (3–5 actions with if/then logic)
10. Sources

---

## The Seven Phases

### Phase 1: SCOPE

**Input:** `market_niche` + `geography` + `audience`
**Action:**
- Define the exact market boundaries: what is IN scope, what is OUT
- State the 3–5 research questions this report will answer
- Identify the buyer persona (who purchases in this market, what is their trigger)
- Define the competitor inclusion criteria (what makes something a direct vs. adjacent competitor)
- Name the 2 axes that will be used for the positioning map (chosen based on what
  differentiates in this specific niche, not generic "price vs. quality")

**Output:** Internal scope brief (not published) — 1 page max. Used to constrain all subsequent phases.

**Anti-pattern:** Do not begin DISCOVER before the scope brief is complete. Undefined scope
produces a report that covers everything and proves nothing.

---

### Phase 2: DISCOVER

**Input:** Scope brief from Phase 1
**Action (web search sequence):**

```
Search 1: "[niche] competitors" + "[niche] alternatives" → seed competitor list
Search 2: "[niche] market size" + "[niche] market report" → TAM anchor data
Search 3: Top 3 competitor names + "pricing" → pricing data
Search 4: "[niche] trends 2024 2025" → PESTEL signals
Search 5: G2/Capterra/Trustpilot for niche → customer voice, review themes
Search 6: "[niche] funding" OR "[niche] investment" → market momentum signals
Search 7: "[niche] job postings" → strategic direction signals
```

**Output:** Raw discovery notes (not published) — competitor list with confidence tier,
market data fragments with sources, pricing fragments, trend signals.

**Anti-pattern:** Do not publish discovery notes as the report. Discovery is input, not output.
Every fragment must be verified before it appears in the report.

---

### Phase 3: MAP

**Input:** Discovery notes
**Action:**
- Classify all discovered competitors: Tier 1 (direct, same customer + use case),
  Tier 2 (adjacent, same customer or use case but not both), Tier 3 (potential entrants)
- For each Tier 1 and significant Tier 2 competitor, collect:
  - Business model and revenue structure
  - Pricing model and price points (with source)
  - Target customer and stated differentiator
  - Key product capabilities
  - Market signals (funding, growth, direction)
- Complete `templates/competitor-matrix.md` — one column per competitor, rows = attributes
- Plot the positioning map using the 2 axes chosen in Phase 1

**Minimum:** 4 Tier 1 competitors with complete profiles. If fewer than 4 exist,
say so and explain what it means for market structure.

**Anti-pattern:** Do not list pricing without a source. If pricing is not publicly available,
state "pricing not disclosed — contact sales" and note what signals exist (e.g., "$X/mo"
from user reviews, or "enterprise-only").

---

### Phase 4: SIZE

**Input:** Discovery data + competitor profiles
**Action (mandatory dual methodology):**

**Top-down:**
1. Find a published industry market size (cite source + date)
2. Apply segmentation filters in sequence: geography → customer type → use case → tier
3. Show each filter as a percentage with rationale
4. Result: TAM → SAM

**Bottom-up:**
1. Define the ideal customer profile from Phase 1 scope
2. Count the addressable companies/users using available proxies (industry registries,
   LinkedIn, SimilarWeb category data, app store category rankings)
3. Estimate average annual contract value from pricing analysis
4. TAM = count × ACV; SOM = realistic 3-year capture %

**Cross-validation:**
- If top-down and bottom-up are within 20% → state the estimate with confidence
- If divergence > 20% → state both, explain the divergence, present as range
- Always show bear/base/bull scenarios with the key assumption that drives each

**Output:** Market Sizing section with full calculation chain visible.

**Anti-pattern:** Do not cite a single source and call it TAM. One cited figure is
a data point, not a methodology. The dual approach is what makes the sizing defensible.

---

### Phase 5: ANALYZE

**Input:** Competitor profiles + market data
**Action:**

**Porter's Five Forces (score each 1–5 with evidence):**
- Threat of new entrants: What are the barriers? (capital, regulation, switching costs, brand)
- Threat of substitutes: What else does the buyer reach for? (not competitors — substitutes)
- Supplier power: Who controls critical inputs? (data, infrastructure, talent, platform APIs)
- Buyer power: How concentrated is demand? What is switching cost? What are alternatives?
- Rivalry intensity: How many competitors? How differentiated? How often do they compete on price?

**Overall industry attractiveness verdict:** Attractive / Moderate / Unattractive — with rationale.

**SWOT (for the niche entrant, not a named competitor):**
Cross-referenced, not listed:
- Strengths × Opportunities → top leverage plays (name them)
- Weaknesses × Threats → existential risks (name them)
- Strengths × Threats → defense plays
- Weaknesses × Opportunities → build/buy/partner options

**Anti-pattern:** Do not score Porter's forces without evidence. "Threat of new entrants: 3"
with no supporting argument is not analysis — it is decoration.

---

### Phase 6: POSITION

**Input:** Phase 5 analysis + Phase 3 competitor map + `client_context` if provided
**Action:**

**Blue Ocean / Whitespace identification:**
List the 6–10 key competitive factors in this niche (from competitor research).
For each, note which competitors invest heavily vs. lightly. Where is there a combination
of factors that no current competitor covers? That is the whitespace.

**Differentiation recommendations (3–5 specific options):**
For each option:
- What is the differentiator?
- Which competitors are vulnerable to it (and why)?
- What capability does it require to execute?
- What is the signal that this matters to buyers? (cite evidence from review data, job postings, etc.)

**If `client_context` provided:** Map the client's existing position onto the competitor matrix
and identify their 2–3 most defensible positioning moves specifically.

**Anti-pattern:** Do not recommend "focus on quality" or "build a better product."
Every recommendation must be specific enough that a product team could write a sprint ticket for it.

---

### Phase 7: DELIVER

**Input:** All previous phase outputs
**Action:**
1. Write the Executive Summary last — lead with the most important finding, not the methodology
2. Populate `templates/report-template.md` in section order
3. Run Layer 1 structural checks (11 items) — fix any failures before finalizing
4. Run Layer 2 strategic quality ratings (8 dimensions) — note any Weak/Failing and improve
5. Compute verdict (DELIVERY-READY / STRENGTHEN / RESEARCH-REQUIRED)
6. Write 3 priority actions — ranked by impact, specific enough to assign to a person

**Anti-pattern:** Do not write the Executive Summary first. It is only credible if written
after all analysis is complete. Writing it first produces wishful framing, not honest synthesis.

---

## Two-Layer Quality Model

### Layer 1 — Structural Checks (Pass/Fail)

Run all 11 before writing the quality verdict. Never stop at first failure.

| # | Check | Threshold |
|---|-------|-----------|
| S1 | Market scope defined with explicit IN/OUT boundaries | Present |
| S2 | ≥ 4 named Tier 1 competitors with complete profiles | ≥ 4 |
| S3 | Every market share or size claim has a cited source | 0 sourceless claims |
| S4 | TAM/SAM/SOM section with BOTH top-down and bottom-up shown | Both present |
| S5 | Porter's Five Forces with all 5 forces assessed + evidence | 5/5 with evidence |
| S6 | Competitor matrix present (≥ name, pricing, target customer, differentiator) | Present |
| S7 | Positioning map with 2 defined axes and ≥ 4 competitors plotted | Present |
| S8 | Every pricing claim either has a source or is labeled "not disclosed" | 0 unsourced prices |
| S9 | Recommendations section with ≥ 3 specific actions | ≥ 3 |
| S10 | Decision framework with if/then logic (not just a bullet list) | Present |
| S11 | Sources section with ≥ 5 citations | ≥ 5 |

**Anti-pattern:** Do not treat Layer 1 pass as quality approval. It is the floor, not the ceiling.

---

### Layer 2 — Strategic Quality (Judgment-Based)

**Rating scale:** Strong (3) | Adequate (2) | Weak (1) | Failing (0)

| # | Dimension | Key question | What "Strong" looks like |
|---|-----------|-------------|--------------------------|
| Q1 | Market definition precision | Is the niche genuinely distinct with defensible boundaries? | Scope brief could be handed to a researcher — no ambiguity |
| Q2 | Competitor identification completeness | Were direct, adjacent, and potential entrants all considered? | Tier 1/2/3 classification is present and rationale stated |
| Q3 | Market sizing credibility | Are assumptions named? Are numbers triangulated? | Both methods shown, divergence explained, scenarios stated |
| Q4 | Competitive dynamics depth | Does Porter's analysis reveal real power dynamics? | Each force backed by named evidence, not generic assertions |
| Q5 | Differentiation sharpness | Are whitespace opportunities specific and data-grounded? | Each opportunity cites a specific gap from competitor research |
| Q6 | Recommendation actionability | Can a decision-maker act on this? | Each recommendation names who does what and by when |
| Q7 | Data sourcing quality | Multiple source types, or one source type repeated? | Mix of: market reports, product pages, review platforms, job data |
| Q8 | Strategic coherence | Does the analysis lead logically to the recommendations? | Recommendations are traceable back to specific findings |

For any dimension rated Weak or Failing: quote the specific deficiency + write a specific fix instruction.
Vague feedback ("the positioning could be stronger") is not permitted — same rule as seo-article-audit.

---

### Verdict Logic

| Verdict | Condition |
|---------|-----------|
| **DELIVERY-READY** | L1: 11/11 AND L2: 0 Failing, ≤ 2 Weak |
| **STRENGTHEN-THEN-DELIVER** | L1: 11/11 AND L2: 1 Failing OR 3–4 Weak |
| **RESEARCH-REQUIRED** | L1: any FAIL OR L2: 2+ Failing |

---

## Templates to Author

### templates/report-template.md

Sections (in order with Fixed/Variable zones):

```
[FIXED] # Competitive Intelligence Report: [VARIABLE: market niche]
[FIXED] **Date:** | **Prepared for:** | **Scope:** | **Depth:**

[FIXED] ## Executive Summary
[VARIABLE: 3–5 key findings as bolded sentences, then recommended actions, then cost of inaction]

[FIXED] ## Scope & Methodology
[VARIABLE: research questions answered, sources used, limitations, competitor inclusion criteria]

[FIXED] ## Market Definition & Sizing
[VARIABLE: TAM/SAM/SOM section — top-down + bottom-up + cross-validation + scenarios]

[FIXED] ## Competitive Landscape
[VARIABLE: market structure type, Tier 1/2/3 competitor list, positioning map description]

[FIXED] ## Competitor Profiles
[VARIABLE: 4–8 completed competitor-profile.md instances]

[FIXED] ## Competitive Dynamics — Porter's Five Forces
[VARIABLE: 5 forces with score + evidence + overall attractiveness verdict]

[FIXED] ## Pricing Analysis
[VARIABLE: pricing model matrix + price-value map + strategy inferences]

[FIXED] ## Strategic Implications
[VARIABLE: whitespace opportunities + threats + differentiation options]

[FIXED] ## Recommendations & Decision Framework
[VARIABLE: 3–5 actions with if/then logic + resource requirements + success metrics]

[FIXED] ## Sources
[VARIABLE: numbered citation list, minimum 5]

[FIXED] ---
[FIXED] *Quality gate: Layer 1 __/11 | Layer 2 avg __ | Verdict: __*
```

### templates/competitor-profile.md

One-page template per competitor:

```
[FIXED] ### [VARIABLE: Competitor Name]
[FIXED] **Tier:** [VARIABLE: 1 / 2 / 3]

[FIXED] | Attribute | Detail |
[FIXED] |-----------|--------|
[FIXED] | Business model | [VARIABLE] |
[FIXED] | Revenue / funding | [VARIABLE] |
[FIXED] | Pricing | [VARIABLE + source] |
[FIXED] | Target customer | [VARIABLE] |
[FIXED] | Key differentiator | [VARIABLE] |
[FIXED] | Geographic presence | [VARIABLE] |
[FIXED] | Recent strategic signals | [VARIABLE] |
[FIXED] | Identified vulnerability | [VARIABLE] |
```

### templates/competitor-matrix.md

Comparison grid — rows = attributes, columns = competitors:

```
[FIXED] | Attribute | [VAR: Comp A] | [VAR: Comp B] | [VAR: Comp C] | [VAR: Comp D] |
[FIXED] |-----------|--------------|--------------|--------------|--------------|
[FIXED] | Pricing model | | | | |
[FIXED] | Entry price | | | | |
[FIXED] | Target customer | | | | |
[FIXED] | Core differentiator | | | | |
[FIXED] | Strengths | | | | |
[FIXED] | Vulnerabilities | | | | |
[FIXED] | Market signal | | | | |
```

---

## References to Author

### references/analytical-frameworks.md

> **When to read:** Before Phase 5 (ANALYZE) if unfamiliar with how to apply Porter's Five Forces
> or Blue Ocean in practice — not for definitions, but for application patterns.

Content: How to apply each framework to this skill's output format. Porter's scoring rubric.
Blue Ocean "eliminate-reduce-raise-create" grid. SWOT cross-referencing method.
What evidence makes a Porter score defensible vs. arbitrary.

### references/sizing-methodology.md

> **When to read:** Before Phase 4 (SIZE) — full worked example of dual-method TAM/SAM/SOM
> for a B2B SaaS niche, with all assumptions made explicit.

Content: Top-down walkthrough with filter chain. Bottom-up walkthrough with ICP definition
and ACV estimation. Cross-validation standard. Bear/base/bull scenario construction.
Common sizing mistakes and how to avoid them.

### references/source-quality-guide.md

> **When to read:** During Phase 2 (DISCOVER) and Phase 7 (DELIVER) when deciding which
> sources to cite and how to handle conflicting data.

Content:
| Source tier | Examples | Use for | Limitations |
|-------------|----------|---------|-------------|
| Tier 1 — primary market data | Gartner, Forrester, IDC, government statistics | TAM anchor, CAGR | Often 12–24 months old, paywalled |
| Tier 2 — product/company data | Pricing pages, investor decks, press releases | Competitor profiles, pricing | Self-reported, marketing-biased |
| Tier 3 — social proof | G2, Capterra, Glassdoor, LinkedIn | Customer voice, culture signals | Selection bias, small n |
| Tier 4 — inference | Job postings, patent filings, hiring velocity | Strategic direction | Requires interpretation |

### references/quality-layers.md

> **When to read:** During Phase 7 (DELIVER) — full rubric for Layer 1 structural checks
> and Layer 2 strategic quality dimensions with scoring guidance and worked examples.

Content: Full Layer 1 checklist with pass/fail criteria. Full Layer 2 rubric with
"Strong" and "Failing" examples for each dimension. Verdict computation table.

---

## Anti-Patterns (Master List for SKILL.md)

| Do NOT | Instead |
|--------|---------|
| Accept a too-broad niche | Pause and offer 3 narrowed alternatives before proceeding |
| Begin Phase 2 without a scope brief | Complete Phase 1 scope brief first — it constrains everything |
| Cite a single source as TAM | Show dual methodology; one source is a data point, not a methodology |
| Score Porter's forces without evidence | Every score needs a named, specific rationale |
| List pricing without a source | Cite source or label "not disclosed" |
| Write Executive Summary first | Write it last after analysis is complete |
| Produce generic recommendations ("differentiate on quality") | Name the specific capability, the competitor it counters, and the evidence it matters |
| Mark Layer 1 pass as ready to deliver | Always run Layer 2 — structural completeness ≠ strategic quality |
| Produce more than 5 recommendations | Rank and cut — a long recommendation list signals unclear thinking |
| Describe market dynamics without sourced evidence | Quote source, date, and method for every market claim |

---

## Metadata (for metadata.json)

```json
{
  "name": "Market Intelligence Report",
  "description": "Seven-phase process that produces a consulting-grade competitive intelligence report for a market niche. Covers competitor profiling, TAM/SAM/SOM sizing (dual methodology), Porter's Five Forces, pricing analysis, and differentiation recommendations. Two-layer quality model: structural completeness + strategic defensibility.",
  "category": "skills",
  "author": { "name": "Robin Westerlund", "github": "robinwesterlund" },
  "version": "1.0.0",
  "requires": {
    "open_brain": false,
    "services": ["web_search"],
    "tools": ["WebSearch", "WebFetch"]
  },
  "tags": [
    "competitive-intelligence",
    "market-analysis",
    "market-sizing",
    "tam-sam-som",
    "porter-five-forces",
    "business-strategy",
    "consulting",
    "market-research"
  ],
  "difficulty": "advanced",
  "estimated_time": "60-120 minutes",
  "created": "2026-04-13",
  "updated": "2026-04-13"
}
```

---

## Scope Decisions Made

**1. Secondary research only — no pretense of primary research**
The skill runs on web search. It does not simulate expert interviews or mystery shopping.
This is honest. The skill's value proposition: the best possible secondary-research
competitive analysis, structured and quality-gated, in 60–120 minutes instead of 3 weeks.

**2. Seven phases, not fewer**
Each phase has a defined gate. You cannot deliver a credible positioning recommendation
(Phase 6) without having built the competitor map (Phase 3) and run the structural analysis
(Phase 5). The sequential dependency is intentional.

**3. Niche input, not company input**
Market analysis of a company answers "how is this company performing?"
Market analysis of a niche answers "should I enter / how do I win?"
The second question is 10x more strategically valuable. The skill is designed for that question.

**4. Positioning map axes are chosen per niche**
Generic skills use "price vs. quality" as positioning axes. That is lazy and often
wrong. The axes that matter in enterprise security software are different from the axes
that matter in consumer fitness apps. Phase 1 forces the axis selection to be deliberate.

**5. Dual-method market sizing is mandatory, not optional**
Single-source market sizing is not sizing — it is citation. The dual methodology is
the line between a blog post that says "the market is $4B (Gartner)" and a deliverable
that shows how $4B was derived and cross-validated from first principles. This is
non-negotiable in the quality layer.

---

## Integration Notes

- **skill-creator:** After forging, run the eval loop on this skill against 3 test niches:
  (a) a clearly defined B2B SaaS niche, (b) a geographic niche, (c) a niche the user has
  client_context for. The third tests the relative positioning functionality.
- **skill-engine:** This skill registers as `priority: 8` — high enough to resolve directly
  for "competitive analysis" triggers, but not so high that it fires on general "analyze this" requests.
- **explicit-skills.md entry:** `market-intelligence-report | Produce consulting-grade competitive analysis for a market niche | market, competitors, sizing, positioning, strategy`
