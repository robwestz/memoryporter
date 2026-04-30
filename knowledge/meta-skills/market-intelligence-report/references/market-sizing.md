# Market Sizing — TAM / SAM / SOM

> **When to read this:** Before Phase 4 (SIZE) — full dual-method walkthrough with a
> worked example and all assumptions made explicit. Read when you need the calculation
> chain, not just the definitions.

---

## The Standard: Dual Methodology Is Mandatory

One cited figure is a data point. Two cross-validated calculation chains are a methodology.

| Approach | What it does | Failure mode |
|---------|-------------|-------------|
| Top-down only | Applies % filters to a published total | Filters are assumptions — easy to make the number whatever you want |
| Bottom-up only | Counts buyers × ACV | ICP count is hard to verify, ACV estimate is often optimistic |
| Both cross-validated | Triangulates from two directions | Divergence > 20% flags a broken assumption — forces you to resolve it |

---

## Definitions

| Term | Definition | What it answers |
|------|-----------|----------------|
| **TAM** — Total Addressable Market | The total revenue opportunity if you captured 100% of the market | "How big is the prize if everything goes right?" |
| **SAM** — Serviceable Addressable Market | The portion of TAM your business model and geography can actually reach | "How big is the prize realistically given our model?" |
| **SOM** — Serviceable Obtainable Market | The portion of SAM you can realistically capture in 3 years | "How big should our target be for business planning?" |

---

## Top-Down Method

### Process

1. Start with a published total market figure
   - Preferred sources: Gartner, Forrester, IDC, government statistics, trade associations
   - Always cite: source name + publication date + page/URL
2. Apply segmentation filters in sequence — each filter must have a named rationale
3. Show each intermediate value
4. Stop at TAM (geography + customer type + use case)
5. Apply one more filter for SAM (serviceable segment — your model's reach)

### Filter Rationale Standard

Each filter must state:
- The percentage applied
- The source or reasoning for that percentage
- Any assumption being made

| Filter | Weak | Strong |
|--------|------|--------|
| Geography | "Nordic = 2%" | "Nordic = 2.1% of global software spend (Eurostat 2024, Table 12)" |
| Customer type | "Enterprise = 40%" | "Enterprise (>250 employees) = 38% of CRM spend (IDC 2024, market share breakdown)" |
| Use case | "Our use case = 15%" | "Outbound-focused CRM features = ~15% of CRM deployments (G2 category data, Nov 2024)" |

### Worked Example — Top-Down

**Niche:** AI-powered email outreach tools for B2B SaaS in the Nordic region

| Step | Value | Source | Filter |
|------|-------|--------|--------|
| Global sales engagement software market | $9.6B | Gartner, Market Databook 2024 | Starting point |
| AI-native tools only | $2.9B | 30% AI-native share (Forrester, Nov 2024) | Category filter |
| Nordic geography | $61M | 2.1% of global (Eurostat ICT spend 2024) | Geography filter |
| B2B SaaS companies only | $37M | 60% of Nordic tech spending is SaaS-to-SaaS (estimate, Nordic SaaS Report 2024) | Customer type filter |
| **TAM (top-down)** | **~$37M** | | |
| Companies with >10 sales reps (serviceable) | $22M | ~60% of B2B SaaS companies have >10 sales reps (LinkedIn data proxy) | SAM filter |
| **SAM (top-down)** | **~$22M** | | |

---

## Bottom-Up Method

### Process

1. Define the ICP precisely — specific company size, industry, geography, use case trigger
2. Count addressable entities using named proxies
3. Estimate ACV from pricing analysis (use sourced figures, not assumptions)
4. TAM = total count × ACV
5. SOM = SAM × realistic capture rate over 3 years (with stated rationale)

### ICP Count Sources

| Proxy | What it counts | Accuracy |
|-------|---------------|----------|
| LinkedIn Sales Navigator | Companies by size, industry, geography | High — regularly updated |
| National business registries | Companies by industry code | High — official, but less granular |
| SimilarWeb category | Web traffic by category | Medium — covers active web presence |
| App store category rankings | Top apps in a vertical | Low — only top-ranked, skewed |
| Industry association membership | Named members in a niche | High for niche — but not exhaustive |

### ACV Estimation Sources

| Source | What it gives you | Limitation |
|--------|------------------|-----------|
| Public pricing page, annual plan | Direct ACV for self-serve tiers | Only captures published tiers, not negotiated enterprise |
| User review price mentions | "We pay $X/mo" comments | Small sample, selection bias |
| Job posting ACV targets | Sales rep OTE and quota signals | Inferred, not stated |
| Analyst report | Category ACV benchmarks | Often 12–24 months old, broad category |
| Mystery shopping / sales inquiry | Actual quote | Most accurate — but requires effort |

### Worked Example — Bottom-Up

**Niche:** AI-powered email outreach tools for B2B SaaS in the Nordic region

| Element | Value | Source |
|---------|-------|--------|
| B2B SaaS companies in Nordics, 10–500 employees | ~4,200 | LinkedIn Sales Navigator filter (April 2026) |
| % with dedicated outbound sales motion | ~40% | Industry benchmark, Winning by Design 2024 |
| Addressable companies | ~1,680 | 4,200 × 40% |
| Estimated seats per company (median) | 8 | Pricing page analysis across 6 competitors |
| Estimated price per seat per month | $65 | Median of publicly listed per-seat plans (April 2026) |
| ACV per company | ~$6,240 | 8 seats × $65 × 12 months |
| **TAM (bottom-up)** | **~$10.5M** | 1,680 × $6,240 |
| **SAM** | **~$10.5M** | Full addressable set in reach |
| Realistic 3-year capture (SOM) | 3–5% | Early-stage assumption — revisit at $1M ARR |
| **SOM range** | **$315K–$525K** | |

---

## Cross-Validation

### Procedure

1. Compare TAM top-down vs. TAM bottom-up
2. Calculate divergence: `|top-down − bottom-up| / max(top-down, bottom-up)`
3. Apply the standard:

| Divergence | Action |
|-----------|--------|
| ≤ 20% | Credible — report the midpoint or range with stated confidence |
| 21–40% | Investigate — identify the assumption causing divergence and resolve |
| > 40% | Do not average — show both, explain fully, present as range |

### In the Worked Example

- Top-down TAM: ~$37M
- Bottom-up TAM: ~$10.5M
- Divergence: 72% — too high to average

**Explanation of divergence:** The top-down method starts from a broad "sales engagement
software" category that includes many use cases beyond email outreach. The bottom-up
reflects only companies with an active outbound motion using AI tools specifically. The
bottom-up figure is likely more accurate for this niche — the top-down figure is useful
as a ceiling for a future expansion thesis.

**Report approach:** Present both, note the bottom-up is the operative planning figure,
explain the top-down as the theoretical ceiling.

---

## Scenario Construction

Every sizing section must include bear / base / bull scenarios.

| Scenario | What changes | Typical driver |
|---------|-------------|----------------|
| **Bear** | ACV −20% or addressable count −30% | Slower AI adoption, more price competition, smaller deal sizes |
| **Base** | Assumptions as stated | Current trend continues |
| **Bull** | ACV +15% or addressable count +40% | Market expands faster, premium tier adoption increases |

Show the key assumption for each scenario. The scenario is only useful if the reader
understands what would have to be true for each to materialize.

---

## Common Sizing Mistakes

| Mistake | Why it fails | Fix |
|---------|------------|-----|
| Citing one Gartner number as TAM | One number is a citation, not analysis | Apply filter chain AND show bottom-up |
| Using % filters without rationale | Filters become whatever makes the number look good | Every filter needs a named source or stated assumption |
| Confusing TAM with SAM | Implies 100% market capture is achievable | Always apply serviceable segment filter |
| Optimistic ACV without evidence | Inflates bottom-up beyond reality | Use median of publicly known data points |
| Missing sensitivity analysis | One number creates false precision | Show what changes if the key assumption shifts ±20% |
| Top-down and bottom-up averaged when diverging > 20% | Produces a meaningless midpoint | Explain divergence, present as range, identify root cause |
