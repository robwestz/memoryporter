# Market Intelligence Report

Produces a consulting-grade competitive intelligence report for any bounded market niche
via a seven-phase structured process with a two-layer quality gate.

---

## What It Does

Takes a market niche as input and produces a complete Markdown report — structured like a
McKinsey/BCG deliverable — covering competitor profiles, dual-method market sizing
(TAM/SAM/SOM), Porter's Five Forces, pricing analysis, and specific differentiation
recommendations. All output runs on secondary research (web search, public data, review
platforms). Honest about scope: this is the 50,000–80,000 SEK consulting tier, not
the 300,000+ SEK tier that requires primary research.

---

## Supported Clients

Claude Code, Cursor, Codex, any agent with WebSearch and WebFetch tools.

---

## Prerequisites

- `WebSearch` tool available
- `WebFetch` tool available (for pricing pages, review platforms)
- A specific, bounded market niche (not a company, not a vague category)

---

## Installation

Copy the skill directory to your project's `.skills/` folder:

```
.skills/
└── market-intelligence-report/
    ├── SKILL.md
    ├── README.md
    ├── metadata.json
    ├── templates/
    └── references/
```

Or reference from `knowledge/meta-skills/market-intelligence-report/` if working inside
the portable-kit.

---

## Trigger Conditions

- "Competitive analysis for [niche]"
- "Market intelligence report on [space]"
- "Who are the competitors in [market]"
- "Is there room in [niche]"
- "Competitive landscape for [segment]"
- "Market sizing for [segment]"
- "Should I enter [market]"
- "What does the competitive landscape look like for [product idea]"
- User wants to understand market attractiveness before investing or launching

---

## Expected Outcome

A complete Markdown report with:

1. Executive Summary (key findings + recommended actions + cost of inaction)
2. Scope & Methodology (research questions, sources, limitations)
3. Market Definition & Sizing (TAM/SAM/SOM — dual method with scenarios)
4. Competitive Landscape (Tier 1/2/3 classification, positioning map)
5. Competitor Profiles (4–8 profiles)
6. Competitive Dynamics — Porter's Five Forces (scored with evidence)
7. Pricing Analysis (model matrix + price-value positioning)
8. Strategic Implications (whitespace, threats, differentiation options)
9. Recommendations & Decision Framework (3–5 actions with if/then logic)
10. Sources (≥ 5 citations)
11. Quality gate footer (L1 score / L2 avg / Verdict)

---

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Authoritative process spec — 7 phases + quality model |
| `README.md` | This file |
| `metadata.json` | Marketplace metadata |
| `templates/competitive-report.md` | Full report output template with Fixed/Variable zones |
| `templates/competitor-card.md` | Per-competitor profile template |
| `templates/positioning-canvas.md` | Blue Ocean / differentiation whitespace template |
| `references/frameworks.md` | Porter's, SWOT, Blue Ocean application quick-reference |
| `references/market-sizing.md` | TAM/SAM/SOM dual-method with worked example |
| `references/quality-standard.md` | Full L1/L2 quality rubric with scoring guidance |
| `references/anti-patterns.md` | Extended mistake catalog for all phases |
| `examples/swedish-dev-tools-market.md` | Worked example: AI-powered codebase documentation tools in Sweden |

---

## Troubleshooting

**The market niche is too broad and Phase 1 stalls.**
The niche must imply a specific buyer persona and purchase trigger. Narrow it: instead of
"project management software", try "Kanban tools for remote engineering teams at 10–100
person SaaS companies." Run the test: can you name who buys this and why, in one sentence?

**Fewer than 4 Tier 1 competitors found.**
Do not fabricate competitors. State the finding explicitly in the Competitive Landscape
section: "This market has fewer than 4 direct competitors, indicating [early-stage market /
high fragmentation / niche still forming]." Analyze what you have and note the implication
for entry strategy.

**Top-down and bottom-up TAM diverge by more than 20%.**
Show both calculations. State the divergence. Identify the assumption causing it (usually
ACV estimate or addressable segment size). Present three scenarios rather than forcing a
single estimate. This is more credible than picking a number.

**No public pricing data available for a competitor.**
Label it "pricing not disclosed — contact sales." Note any signals: user review mentions
of price range, job posting ACV targets, analyst estimate references. Do not omit the
competitor; incomplete data is better than a gap in coverage.
