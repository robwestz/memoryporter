# Quality Standard — Two-Layer Quality Gate

> **When to read this:** During Phase 7 (DELIVER) — full rubric for Layer 1 structural
> checks and Layer 2 strategic quality dimensions with scoring guidance, worked examples,
> and the verdict computation table.

---

## Overview

Quality has two independent layers. Pass both before delivery.

| Layer | Type | What it checks | Failure mode |
|-------|------|---------------|-------------|
| **Layer 1** | Structural — Pass/Fail | Is the report complete? Are all required elements present? | Missing section, unsourced claim, too few competitors |
| **Layer 2** | Strategic — judgment-based | Is the analysis credible and actionable? | Technically present but shallow, generic, or untraceable |

**Anti-pattern:** Do not treat Layer 1 pass as delivery-ready. It is the floor. A report
that checks all 11 boxes but has shallow analysis still fails Layer 2 and must be improved.

---

## Layer 1 — Structural Checks (Pass / Fail)

Run all 11 before writing the verdict. Never stop at first failure — document all.

| # | Check | Threshold | How to verify |
|---|-------|-----------|--------------|
| **S1** | Market scope defined with explicit IN/OUT boundaries | Present | Read the Scope & Methodology section — can you list what's in scope and what's out? |
| **S2** | ≥ 4 named Tier 1 competitors with complete profiles | ≥ 4 Tier 1 | Count the competitor cards — are all required fields populated? |
| **S3** | Every market share or size claim has a cited source | 0 unsourced | Scan every number in the Market Sizing section — does each have a source + date? |
| **S4** | TAM/SAM/SOM with BOTH top-down and bottom-up shown | Both present | Both calculation chains must be visible, not just a conclusion |
| **S5** | Porter's Five Forces with all 5 forces assessed + evidence | 5/5 with evidence | Each force has a score AND a named rationale — not just a score |
| **S6** | Competitor matrix present (≥ name, pricing, target customer, differentiator) | All 4 attributes | Check the Feature Comparison Matrix — these 4 minimum columns must be populated |
| **S7** | Positioning map with 2 defined axes and ≥ 4 competitors plotted | Axes named + ≥ 4 | The axes must be stated explicitly — not implied |
| **S8** | Every pricing claim either has a source or is labeled "not disclosed" | 0 unsourced prices | Scan the Pricing Analysis section — is every price point traced to a source? |
| **S9** | Recommendations section with ≥ 3 specific actions | ≥ 3 | Actions must be specific enough to assign — not "differentiate on quality" |
| **S10** | Decision framework with if/then logic | Present | Must be a table or explicit conditional logic — not a bullet list |
| **S11** | Sources section with ≥ 5 citations | ≥ 5 | Count the citations — include source name, URL/reference, and date |

### Layer 1 Recording Format

After running all checks, record:

```
L1 Results:
S1: PASS / FAIL — [note if fail]
S2: PASS / FAIL — [note if fail]
...
S11: PASS / FAIL — [note if fail]
Total: __/11
```

If any FAIL: fix before proceeding to Layer 2.

---

## Layer 2 — Strategic Quality Dimensions

**Rating scale:** Strong (3) | Adequate (2) | Weak (1) | Failing (0)

### Q1 — Market Definition Precision

| Rating | What it looks like |
|--------|-------------------|
| Strong (3) | Scope brief is unambiguous — could hand to a researcher who has never heard of this niche and they would know exactly what to research |
| Adequate (2) | Scope is defined but has one or two terms that could be interpreted in multiple ways |
| Weak (1) | Scope is present but uses vague language ("broad B2B market", "general enterprise tools") |
| Failing (0) | No scope brief, or scope is so broad that competitor inclusion is arbitrary |

**Specific deficiency example (Weak):** "Market scope: AI tools for business" — this could
mean 500 different niches. Fix: restate as "AI-powered [specific use case] tools for
[specific buyer segment] in [specific geography or market tier]."

### Q2 — Competitor Identification Completeness

| Rating | What it looks like |
|--------|-------------------|
| Strong (3) | Tier 1/2/3 classification present with stated rationale for each. Search process documented in Methodology section. |
| Adequate (2) | Tier 1 competitors well-identified, Tier 2/3 present but without rationale |
| Weak (1) | Only a list of competitors with no tier classification |
| Failing (0) | Fewer than 4 Tier 1 competitors without explanation of why the market has so few |

### Q3 — Market Sizing Credibility

| Rating | What it looks like |
|--------|-------------------|
| Strong (3) | Both methods shown with full filter chains, divergence explained, three scenarios stated with named assumptions |
| Adequate (2) | Both methods shown, but divergence not addressed, or scenarios missing |
| Weak (1) | One method only, or both present but no cross-validation |
| Failing (0) | Single cited figure with no calculation |

### Q4 — Competitive Dynamics Depth

| Rating | What it looks like |
|--------|-------------------|
| Strong (3) | Each Porter force has a numeric score AND named, specific evidence. Overall verdict stated with rationale. |
| Adequate (2) | All 5 forces present with evidence, but evidence is generic (not named/sourced) |
| Weak (1) | Some forces present, or all present but without any supporting evidence |
| Failing (0) | Porter forces listed but not assessed, or key forces missing entirely |

**Specific deficiency example (Weak):** "Threat of new entrants: 3. There are moderate
barriers to entry in this market." Fix: "Threat of new entrants: 3. Capital requirements
are moderate — five funded entrants in past 18 months (Crunchbase, Nov 2024), but
integrations with CRM platforms create 3–6 month switching costs that partially offset."

### Q5 — Differentiation Sharpness

| Rating | What it looks like |
|--------|-------------------|
| Strong (3) | Each whitespace opportunity cites specific evidence of buyer demand. Each recommendation names the competitor it counters and the vulnerability it exploits. |
| Adequate (2) | Differentiation options are specific to this niche but not all are evidence-backed |
| Weak (1) | Differentiation options exist but are generic ("focus on UX", "build enterprise features") |
| Failing (0) | No differentiation options, or options that could apply to any product in any market |

### Q6 — Recommendation Actionability

| Rating | What it looks like |
|--------|-------------------|
| Strong (3) | Each recommendation names what to do, who does it, by when, and how to measure success |
| Adequate (2) | Actions are specific but missing ownership or timeline |
| Weak (1) | Actions are directional but not specific enough to assign to a person |
| Failing (0) | Recommendations are generic advice that could apply to any company |

**Specific deficiency example (Failing):** "Recommendation: differentiate on product quality
and customer service." Fix: "Recommendation: Implement a <2-hour SLA for Tier 1 support
tickets (competitive benchmark: market leader has 24h SLA — cited in 23 G2 reviews).
Owner: Head of Customer Success. By: Q3 2026. Success metric: G2 rating ≥ 4.7 within
6 months of launch."

### Q7 — Data Sourcing Quality

| Rating | What it looks like |
|--------|-------------------|
| Strong (3) | Multiple source types: market reports, product pages, review platforms, job data, and at least one direct product interaction |
| Adequate (2) | 3+ source types with clear citations |
| Weak (1) | 1–2 source types only (e.g., only pricing pages and one market report) |
| Failing (0) | Sources are unnamed, or all from a single source type |

### Q8 — Strategic Coherence

| Rating | What it looks like |
|--------|-------------------|
| Strong (3) | Each recommendation can be traced back to a specific finding. Executive Summary findings match the analysis. No recommendation appears without analytical basis. |
| Adequate (2) | Most recommendations traceable, but 1–2 appear without clear analytical basis |
| Weak (1) | Recommendations feel like additions rather than conclusions — not clearly traceable |
| Failing (0) | Recommendations contradict findings, or Executive Summary and body are inconsistent |

---

## Layer 2 Recording Format

```
L2 Ratings:
Q1 Market definition precision:   Strong(3) / Adequate(2) / Weak(1) / Failing(0) — [note]
Q2 Competitor completeness:        __
Q3 Market sizing credibility:      __
Q4 Competitive dynamics depth:     __
Q5 Differentiation sharpness:      __
Q6 Recommendation actionability:   __
Q7 Data sourcing quality:          __
Q8 Strategic coherence:            __

Total: __/24
Average: __ (divide total by 8)
Failing count: __ | Weak count: __
```

For any Weak or Failing dimension: write the specific deficiency and a specific fix
instruction. Vague feedback is not permitted.

---

## Verdict Computation

| Verdict | Condition |
|---------|-----------|
| **DELIVERY-READY** | L1: 11/11 PASS AND L2: 0 Failing, ≤ 2 Weak |
| **STRENGTHEN-THEN-DELIVER** | L1: 11/11 PASS AND L2: 1 Failing OR 3–4 Weak |
| **RESEARCH-REQUIRED** | L1: any FAIL OR L2: 2+ Failing |

### Verdict Footer Format

Record in the report footer:

```
Quality gate: L1 11/11 | L2 avg 2.4/3 | Verdict: DELIVERY-READY
```

Or with issues:

```
Quality gate: L1 9/11 (S4 FAIL — bottom-up missing; S8 FAIL — 2 unsourced prices)
L2 avg 1.6/3 (Q5 Weak — no evidence cited; Q6 Failing — recommendations not actionable)
Verdict: RESEARCH-REQUIRED
Fix required: [list specific fixes before delivery]
```
