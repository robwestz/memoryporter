<!-- ============================================================
     KB DOCUMENT FACTORY — QUALITY GATE TEMPLATE
     
     FIXED ZONES: Marked with [FIXED]. Do not modify structure.
     VARIABLE ZONES: Marked with [VARIABLE]. Replace with content.
     
     Content ratio target: 90% checklists, 10% criteria/exceptions
     
     **CRITICAL:** Quality gates are CHECKLISTS, not essays.
     Every criterion must have a measurable threshold.
     "Good code quality" is NOT a criterion. "Lighthouse score >= 90" IS.
     ============================================================ -->

<!-- [FIXED] Frontmatter -->
---
title: "[VARIABLE: Gate Name]"
format: quality-gate
layer: methods
category: quality-gates
status: draft
confidence: low
last_verified: [VARIABLE: YYYY-MM-DD]
tags: [VARIABLE]
applies_to: [VARIABLE: project types or output types this gate covers]
---

<!-- [FIXED] Title block -->
# [VARIABLE: Gate Name]

> One-line: [VARIABLE: What this gate verifies and what quality standard it enforces.]

<!-- [VARIABLE] Categorized checklists.
     Group related criteria under category headers.
     Every item: checkbox + specific, measurable criterion.
     
     ❌ WRONG: "Good performance"
     ✅ RIGHT: "Lighthouse Performance score >= 90"
     
     ❌ WRONG: "Proper error handling"
     ✅ RIGHT: "All async operations have loading states, error boundaries, and retry logic"
-->

## [VARIABLE: Category 1]

- [ ] [VARIABLE: Measurable criterion with threshold]
- [ ] [VARIABLE: Measurable criterion with threshold]
- [ ] [VARIABLE: Measurable criterion with threshold]

## [VARIABLE: Category 2]

- [ ] [VARIABLE: Measurable criterion]
- [ ] [VARIABLE: Measurable criterion]

## [VARIABLE: Category 3]

- [ ] [VARIABLE: Measurable criterion]
- [ ] [VARIABLE: Measurable criterion]

<!-- [FIXED] Pass Criteria -->
## Pass Criteria

| Result | Condition |
|--------|-----------|
| **Pass** | All items checked |
| **Conditional pass** | [VARIABLE: Which specific items can be deferred, and what documentation is required] |
| **Fail** | [VARIABLE: Which items are CRITICAL — any one unchecked = fail] |

<!-- [FIXED] Verification Method -->
## Verification Method

[VARIABLE: How to verify each criterion category. Include:
- Automated tools (Lighthouse, ESLint, axe, etc.)
- Manual checks (code review, visual inspection, etc.)
- Commands to run]

```bash
# [VARIABLE: verification commands]
```

<!-- [FIXED] Exceptions -->
## Exceptions

[VARIABLE: When and why this gate can be relaxed. Who approves exceptions.
If no exceptions are allowed, write "No exceptions. This gate is absolute."]

<!-- [FIXED] Related section -->
## Related

- Method: [[VARIABLE: method-slug]] — [VARIABLE: Process this gate verifies]
- Domain: [[VARIABLE: domain-slug]] — [VARIABLE: Knowledge this gate is based on]
