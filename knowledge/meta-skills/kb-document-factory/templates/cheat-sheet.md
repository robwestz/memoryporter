<!-- ============================================================
     KB DOCUMENT FACTORY — CHEAT SHEET TEMPLATE
     
     FIXED ZONES: Marked with [FIXED]. Do not modify structure.
     VARIABLE ZONES: Marked with [VARIABLE]. Replace with content.
     
     Content ratio target: 70% tables, 20% quick-ref, 10% prose
     ============================================================ -->

<!-- [FIXED] Frontmatter — fill every field, no placeholders -->
---
title: "[VARIABLE: Descriptive title]"
format: cheat-sheet
layer: domain
category: "[VARIABLE: category path, e.g., seo, web-development/frontend]"
status: draft
confidence: low
last_verified: [VARIABLE: YYYY-MM-DD]
tags: [VARIABLE: searchable terms]
cross_refs: [VARIABLE: related article slugs]
---

<!-- [FIXED] Title block -->
# [VARIABLE: Title]

> One-line: [VARIABLE: What this covers and when to reference it. Must be specific enough to decide relevance without reading further.]

<!-- [VARIABLE] Section 1 — Primary concept area
     Name this after the main concept grouping.
     Use the 4-column table pattern: Concept | What | How | Pitfalls
     Aim for 5-15 rows per table. Split into multiple tables if > 15 rows. -->

## [VARIABLE: Concept Area Name]

| Concept | What It Does | Implementation | Common Mistakes |
|---------|-------------|----------------|-----------------|
| [VARIABLE] | [VARIABLE] | [VARIABLE] | [VARIABLE] |
| [VARIABLE] | [VARIABLE] | [VARIABLE] | [VARIABLE] |

<!-- [VARIABLE] Section 2+ — Additional concept areas
     Repeat the table pattern for each major grouping.
     Alternative column patterns:
     
     For operations:    Operation | Syntax/Pattern | When to Use | Pitfalls
     For metrics:       Metric | Target | How to Measure | How to Fix
     For configuration: Setting | Values | Default | Effect
     For debugging:     Symptom | Cause | Fix | Prevention
-->

## [VARIABLE: Second Concept Area]

| [VARIABLE: Column A] | [VARIABLE: Column B] | [VARIABLE: Column C] | [VARIABLE: Column D] |
|---|---|---|---|
| | | | |

<!-- [VARIABLE] Decision section — When the reader must choose between approaches -->

## When to Choose What

| If you need... | Use... | Because... |
|---------------|--------|------------|
| [VARIABLE] | [VARIABLE] | [VARIABLE] |

<!-- [VARIABLE] Quick Reference — The most-used patterns as one-liners.
     This section is for RAPID lookup. Think "grep-able".
     Format: `input → output` or `command — what it does` -->

## Quick Reference

```
[VARIABLE: shorthand → result patterns for the 5-10 most common lookups]
```

<!-- [VARIABLE] Anti-patterns — What NOT to do. At least 2 entries. -->

## Common Mistakes

| ❌ Don't | ✅ Instead | Why |
|----------|-----------|-----|
| [VARIABLE] | [VARIABLE] | [VARIABLE] |
| [VARIABLE] | [VARIABLE] | [VARIABLE] |

<!-- [FIXED] Related section — minimum 2 cross-references -->
## Related

- [[VARIABLE: related-article-slug]] — [VARIABLE: Why related in ≤10 words]
- [[VARIABLE: related-article-slug]] — [VARIABLE: Why related]
- Component: [[VARIABLE: component-slug]] — [VARIABLE: What it provides]
