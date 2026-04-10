<!-- ============================================================
     KB DOCUMENT FACTORY — METHOD GUIDE TEMPLATE
     
     FIXED ZONES: Marked with [FIXED]. Do not modify structure.
     VARIABLE ZONES: Marked with [VARIABLE]. Replace with content.
     
     Content ratio target: 50% steps, 30% tables, 20% checks
     ============================================================ -->

<!-- [FIXED] Frontmatter — fill every field -->
---
title: "[VARIABLE: Method Name]"
format: method-guide
layer: methods
category: "[VARIABLE: category path]"
status: draft
confidence: low
last_verified: [VARIABLE: YYYY-MM-DD]
tags: [VARIABLE]
prerequisites: [VARIABLE: other method slugs that must be completed first, or empty array]
outputs: [VARIABLE: what this method produces]
quality_gate: "[VARIABLE: quality gate slug, or empty string]"
---

<!-- [FIXED] Title block -->
# [VARIABLE: Method Name]

> One-line: [VARIABLE: What this method achieves. Must describe outcome, not process.]

<!-- [FIXED] Purpose section — WHY this method exists -->
## Purpose

[VARIABLE: 2-3 sentences. What goes wrong without this method. What this prevents.
Focus on consequences of NOT having the method, not features of having it.]

<!-- [FIXED] When to Use / When NOT to Use -->
## When to Use

- [VARIABLE: Situation 1]
- [VARIABLE: Situation 2]
- [VARIABLE: Situation 3]

## When NOT to Use

| If the situation is... | Use instead... | Why |
|----------------------|----------------|-----|
| [VARIABLE] | [[VARIABLE: other-method]] | [VARIABLE] |

<!-- [FIXED] Prerequisites -->
## Prerequisites

[VARIABLE: What must be true or available. Be specific — file names, tools, decisions.
If no prerequisites, write "None — this method can start cold."]

<!-- [VARIABLE] Process — the core of the method guide.
     Each step MUST have: Action, Inputs, Outputs, Decision point.
     Steps must be numbered sequentially.
     Decision tables go INSIDE steps where choices happen. -->

## Process

### Step 1: [VARIABLE: Action Name]

**Action:** [VARIABLE: What to do — imperative, specific]
**Inputs:** [VARIABLE: What you need to start this step]
**Outputs:** [VARIABLE: What this step produces]
**Decision point:** [VARIABLE: What determines the next step]

<!-- [VARIABLE] Include decision tables inside steps where classification happens -->

| If... | Then... | Rationale |
|-------|---------|-----------|
| [VARIABLE] | [VARIABLE] | [VARIABLE] |

### Step 2: [VARIABLE: Action Name]

**Action:** [VARIABLE]
**Inputs:** [VARIABLE: Usually outputs from Step 1]
**Outputs:** [VARIABLE]
**Decision point:** [VARIABLE]

### Step 3: [VARIABLE: Action Name]

**Action:** [VARIABLE]
**Inputs:** [VARIABLE]
**Outputs:** [VARIABLE]

<!-- [FIXED] Quality Checks — checklist format -->
## Quality Checks

- [ ] [VARIABLE: Verifiable criterion]
- [ ] [VARIABLE: Verifiable criterion]
- [ ] [VARIABLE: Verifiable criterion]

<!-- [FIXED] Common Failures — table format -->
## Common Failures

| Failure | Symptom | Prevention |
|---------|---------|-----------|
| [VARIABLE] | [VARIABLE] | [VARIABLE] |
| [VARIABLE] | [VARIABLE] | [VARIABLE] |

<!-- [VARIABLE] Example — concrete walkthrough. Optional but strongly recommended. -->
## Example

[VARIABLE: A real or realistic walkthrough of this method applied to a concrete scenario.
Show the inputs, the decisions made at each step, and the outputs. This is the "proof"
that the method works.]

<!-- [FIXED] Related section -->
## Related

- Quality gate: [[VARIABLE: gate-slug]] — [VARIABLE: What it verifies]
- Domain knowledge: [[VARIABLE: domain-slug]] — [VARIABLE: Context it provides]
- Component: [[VARIABLE: component-slug]] — [VARIABLE: What it provides]
