---
name: seo-article-audit
description: |
  Audits a backlink SEO article in two layers: mechanical QA (11 deterministic
  checks) and editorial quality (8 judgment-based dimensions). Use when reviewing
  a finished article before publishing, diagnosing why an article feels "off",
  grading a batch of articles against the BACOWR quality standard, or training
  a writer on what separates premium from mediocre SEO content. Trigger on:
  "audit this article", "check this backlink article", "is this article ready
  to publish", "QA this SEO article", "review article quality".
author: Robin Westerlund
version: 1.0.0
---

# SEO Article Audit

## Quick Start

**Minimum inputs:** article text + anchor_text + target_url + publisher_domain

**Invocation example:**
```
Audit this article.
Anchor: "240 mattor i olika material"
Target: https://www.rusta.com/se/mattor
Publisher: heminredning.se
Entities: matta, textiltrend, Formex, Pantone, rumsavdelare
```

**Output:** Completed `templates/audit-report.md` — Layer 1 table (11 checks) + Layer 2 findings (8 dimensions) + verdict + 3 priority actions.

---

## Inputs

| Input | Required | Type | Notes |
|-------|----------|------|-------|
| article_text | Yes | markdown string | Full article including title |
| anchor_text | Yes | string | Exact anchor text from job spec — do not modify |
| target_url | Yes | string | Full URL of anchor destination |
| publisher_domain | Yes | string | Domain of publisher site (no www) |
| serp_entities | No | string[] | Entity list from SERP probes. Check 10 skipped if omitted |
| expected_language | No | "sv" / "en" | Defaults to "sv" |

---

## The Two-Layer Model

| Layer | Type | What it catches | Output |
|-------|------|-----------------|--------|
| **Layer 1** | Deterministic | Structural/mechanical violations — any one fails the article | Pass/fail table, 11 rows |
| **Layer 2** | Judgment | Editorial quality — spectrum from Failing to Strong | Ratings + quoted evidence + fixes |

**Both layers always run**, even if Layer 1 fails. A Layer 1 rejection does not skip editorial feedback — the writer needs both.

**A Layer 1 pass does not mean the article is good.** That is what Layer 2 is for.

---

## Layer 1 — Mechanical Checks

Run `scripts/mechanical-audit.py` if Python 3.9+ is available. Otherwise perform each check manually using `references/quality-standard.md` Part 1.

**Never stop at the first failure.** Record all 11 results before writing the report.

| # | Check | Threshold |
|---|-------|-----------|
| 1 | Word count | 750–900 words (markdown stripped) |
| 2 | Anchor present | ≥ 1 exact match `[anchor](url)` |
| 3 | Anchor count | Exactly 1 |
| 4 | Anchor position | Word 250–550 in stripped text |
| 5 | Trust links | 1–2 valid links, all before anchor |
| 6 | No bullets | 0 list markers (`-`, `*`, `•`, `1.`) |
| 7 | Headings | ≤ 1 total (title = the 1 allowed) |
| 8 | Forbidden phrases | 0 matches (see `references/forbidden-phrases.md`) |
| 9 | Language | Matches expected (sv/en) |
| 10 | SERP entities | ≥ 4 unique entities (SKIP if none provided) |
| 11 | Paragraphs | ≥ 4 non-empty blocks |

**Anti-pattern:** Do not mark Check 10 as FAIL when no entities were provided — mark it SKIP.

---

## Layer 2 — Editorial Audit

Read the full article before scoring any dimension. Score E1–E8 using `references/quality-standard.md` Part 2.

**Rating scale:** Strong (3) | Adequate (2) | Weak (1) | Failing (0)

| Dimension | What it assesses | Key question |
|-----------|-----------------|--------------|
| **E1 Hook Quality** | Does the opening compel reading on? | Could this opening work for any article on this topic? |
| **E2 Thesis Clarity** | Does the article argue something specific? | Can the auditor write the argument in one sentence? |
| **E3 Entity Integration** | Are SERP entities natural vocabulary? | Do entities drive precision, or get announced? |
| **E4 Trustlink Integration** | Are trustlinks evidence in the argument? | Does each link introduce a specific fact/number? |
| **E5 Anchor Naturalness** | Does the anchor feel like the argument's destination? | Does the anchor sentence work without the link? |
| **E6 Red Thread** | Does each paragraph continue the argument? | Can you trace P1 → P2 → P3 as logical sequence? |
| **E7 Closing Quality** | Does the close end on a new idea? | Would anything be lost if the last paragraph were cut? |
| **E8 AI Smell** | Are any of the 10 mediocrity patterns present? | See `references/forbidden-phrases.md` Part 2 |

For every dimension rated Weak or Failing: produce quoted evidence + specific rewrite instruction. Vague feedback ("the hook could be stronger") is not permitted.

Use `templates/feedback-card.md` for standalone per-dimension cards when delivering feedback to a writer separately from the full report.

---

## Output Format

Use `templates/audit-report.md` as the output structure.

1. Copy the template
2. Fill all `[VARIABLE]` zones with Layer 1 and Layer 2 results
3. Keep all `[FIXED]` zones exactly as written
4. Compute verdict using the threshold table in the template
5. Write 3 priority actions ordered by impact — cap at 3 to force ranking

**Anti-patterns:**
- Do not produce a narrative blob — always use the structured template
- Do not merge multiple Layer 2 issues into one finding — each dimension is separate
- Do not re-write the article in the audit — diagnose and prescribe, stop
- Do not invent SERP entity failures if no entities were provided — mark Check 10 SKIP

---

## Verdict Logic

| Verdict | Condition |
|---------|-----------|
| **PUBLISH-READY** | Layer 1: 11/11 AND Layer 2: 0 Failing, ≤ 2 Weak |
| **REVISE-THEN-PUBLISH** | Layer 1: 11/11 AND Layer 2: 1 Failing OR 3+ Weak |
| **REWRITE-REQUIRED** | Layer 1: any FAIL OR Layer 2: 2+ Failing |

---

## Anti-Patterns (Auditor)

| Do NOT | Instead |
|--------|---------|
| Stop Layer 1 at first failure | Record all 11, then write the table |
| Treat L1 pass as quality approval | Always run Layer 2 |
| Produce vague feedback ("feels weak") | Quote the specific text, name the specific fix |
| Skip Check 10 silently when entities missing | Mark it SKIP explicitly |
| Write more than 3 priority actions | Rank and cut — more than 3 overwhelms the writer |
| Re-write any part of the article | Diagnose and prescribe only |
| Double-count E4/E5/E7 issues in E8 | Surface in E8 as "also detected" with a cross-reference |

---

## Quick Reference

| # | Check / Dimension | Type | Threshold / Rating |
|---|-------------------|------|--------------------|
| L1-1 | Word count | Mechanical | 750–900 |
| L1-2 | Anchor present | Mechanical | ≥ 1 exact match |
| L1-3 | Anchor count | Mechanical | exactly 1 |
| L1-4 | Anchor position | Mechanical | word 250–550 |
| L1-5 | Trust links | Mechanical | 1–2 valid, before anchor |
| L1-6 | No bullets | Mechanical | 0 |
| L1-7 | Headings | Mechanical | ≤ 1 |
| L1-8 | Forbidden phrases | Mechanical | 0 (23 phrases) |
| L1-9 | Language | Mechanical | matches expected |
| L1-10 | SERP entities | Mechanical | ≥ 4 (or SKIP) |
| L1-11 | Paragraphs | Mechanical | ≥ 4 |
| E1 | Hook Quality | Editorial | Strong–Failing |
| E2 | Thesis Clarity | Editorial | Strong–Failing |
| E3 | Entity Integration | Editorial | Strong–Failing |
| E4 | Trustlink Integration | Editorial | Strong–Failing |
| E5 | Anchor Naturalness | Editorial | Strong–Failing |
| E6 | Red Thread | Editorial | Strong–Failing |
| E7 | Closing Quality | Editorial | Strong–Failing |
| E8 | AI Smell | Editorial | Strong–Failing |

---

## References

| File | When to read |
|------|-------------|
| `references/quality-standard.md` | Layer 1 manual check procedures + Layer 2 full rubric + structural rules |
| `references/forbidden-phrases.md` | Check 8 phrase list + E8 anti-pattern table |
| `templates/audit-report.md` | Output template — copy and fill for every audit |
| `templates/feedback-card.md` | Per-dimension feedback format for writer delivery |
| `scripts/mechanical-audit.py` | CLI for automated Layer 1 |
