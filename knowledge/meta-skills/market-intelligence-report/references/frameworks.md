# Analytical Frameworks

> **When to read this:** Before Phase 5 (ANALYZE) if you need application patterns
> for Porter's Five Forces, SWOT cross-referencing, or Blue Ocean — not definitions,
> but how to apply each to produce output that is defensible under scrutiny.

---

## Porter's Five Forces — Application Guide

Porter's answers: *Why is this industry more or less profitable? Where is power concentrated?*

### Scoring Standard

Score each force 1–5. The score is meaningless without named evidence.

| Score | Meaning | Example evidence |
|-------|---------|-----------------|
| 1 | Very low force — favorable for profitability | High capital requirements: $2M+ to build to market parity |
| 2 | Low force | Moderate switching costs — integrations take 2–4 weeks |
| 3 | Moderate force | Mixed signals — some barriers exist but several funded entrants in past 12 months |
| 4 | High force | Buyers can switch in < 1 day, 3+ direct alternatives |
| 5 | Very high force — unfavorable for profitability | Commodity market, price is the only differentiator |

### What Counts as Evidence Per Force

**Threat of new entrants:**
- Minimum capital to build competitive product (cite funding rounds as proxy)
- Regulatory requirements (name the regulation)
- Network effects or data moats that take time to build
- Brand premium in purchase decisions (cite review data or analyst mention)

**Threat of substitutes:**
Substitutes are not competitors — they are alternatives a buyer reaches for instead of the
whole category. A spreadsheet is a substitute for lightweight project management software.
- What does the buyer do if they don't buy from this category at all?
- What percentage of the market is still unaddressed by the category? (sizing data)
- Are substitute categories growing faster than this one? (CAGR comparison)

**Supplier bargaining power:**
- Name the 3 most critical inputs: cloud infrastructure, proprietary data, specialized talent, platform APIs
- For each: is there 1 supplier or many? What are switching costs?
- Recent pricing changes in critical inputs (cite source + date)
- Dependency on a platform that could become a competitor (e.g., Microsoft, Google, Salesforce)

**Buyer bargaining power:**
- Customer concentration: does the top 10% of customers represent > 50% of revenue?
- Switching cost: what does a buyer have to do to leave? (integrations, data migration, retraining)
- Contract length norms (cite from pricing pages or review mentions)
- Information asymmetry: do buyers have enough information to compare effectively?

**Rivalry intensity:**
- Count of direct competitors (Tier 1)
- Differentiation depth: are products genuinely distinct or competing on price alone?
- Pricing pressure signals: free tiers, aggressive discounting, price war language in press releases
- Market growth rate: fast growth reduces rivalry (share for everyone); slow growth intensifies it

### Industry Attractiveness Verdict

After scoring all 5 forces:

| Sum of scores | Verdict | Typical interpretation |
|--------------|---------|----------------------|
| 5–10 | Attractive | Low structural forces — profitable if executed well |
| 11–17 | Moderate | Mixed signals — profitability depends on positioning and execution |
| 18–25 | Unattractive | High structural forces — margins will be competed away |

State the verdict with a 2–3 sentence rationale connecting the dominant forces to the conclusion.

---

## SWOT Cross-Reference Method

Standard SWOT lists are not premium output. Cross-referenced SWOT generates strategic options.

### How to Cross-Reference

1. List Strengths (2–4 items with evidence)
2. List Weaknesses (2–4 items with evidence)
3. List Opportunities (from market data, trend signals, whitespace analysis)
4. List Threats (from Porter's analysis, competitor signals, PESTEL)

Then cross-reference each cell:

| Cross-cell | Question to answer | Output |
|-----------|--------------------|--------|
| S × O | How can this strength be used to capture this opportunity? | Named leverage play with specific action |
| S × T | How can this strength be used to defend against this threat? | Named defense move with timing |
| W × O | What must be built, bought, or partnered to capture this opportunity despite the weakness? | Build/buy/partner decision with criteria |
| W × T | If this weakness meets this threat, what is the worst case? How likely? How to prevent? | Named existential risk with mitigation |

**Anti-pattern:** Do not list "Strong brand" as a strength without evidence. What
specifically demonstrates brand strength in this niche? Customer reviews? NPS benchmark?
Unaided awareness data? Name the evidence.

---

## Blue Ocean / Strategy Canvas — Application Guide

Blue Ocean answers: *Where is competitive whitespace? Where is everyone fighting unnecessarily?*

### Application Steps

1. List all key competitive factors in this niche (typically 6–10)
   - Source from: competitor marketing, review platform "what do you like most" responses,
     job postings, analyst reports
2. Score each competitor's investment per factor: High / Medium / Low / None
3. Identify the pattern — where is everyone High? (table stakes — no advantage here)
4. Identify gaps — what factors are all Low or None? (potential whitespace if buyers care)
5. Apply the ERRC grid to design a new value curve

### ERRC Grid

| Action | Definition | Typical application |
|--------|-----------|---------------------|
| **Eliminate** | Remove factors the industry takes for granted but buyers don't value | Complexity delivered to buyers who wanted simplicity |
| **Reduce** | Invest below industry standard | Premium pricing for features most buyers don't use |
| **Raise** | Invest above industry standard | Speed, reliability, or support where competitors underdeliver |
| **Create** | Add factors the industry has never offered | New capability that addresses unmet demand |

**Anti-pattern:** Do not "create" a factor unless you have evidence buyers want it.
Job postings asking for a feature, review complaints about its absence, or a competitor
who recently added it and saw strong uptake — these are valid signals. Guessing is not.

### Whitespace Test

A genuine whitespace must pass three checks:
1. No current competitor covers this factor combination well
2. There is evidence buyers care about it (not just that it would be nice)
3. It requires a capability trade-off — if everyone could do it, it is not whitespace

---

## PESTEL — Signal-Not-Description Standard

PESTEL is only valuable when populated with *specific, sourced signals* linked to
*named competitive implications*. Generic observations ("AI is changing everything")
are not premium output.

| Dimension | What premium looks like | What to avoid |
|-----------|------------------------|---------------|
| Political | "EU AI Act Article 6 classification requirement takes effect 2025 — adds compliance cost of €X for operators in [niche]" | "Regulation may affect the market" |
| Economic | "Swedish Riksbank rate at 3.25% increases enterprise software budget scrutiny — 3 competitors lowered entry price in Q1 2025" | "Economic conditions affect spending" |
| Technological | "OpenAI API cost per token fell 80% in 18 months — lowers barrier for AI-native competitors" | "AI is advancing rapidly" |

Only include PESTEL dimensions where you have specific, sourced evidence. Omit dimensions
where you only have generic observations.
