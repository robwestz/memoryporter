<!-- ============================================================
     KB DOCUMENT FACTORY — COMPONENT SPEC TEMPLATE
     
     FIXED ZONES: Marked with [FIXED]. Do not modify structure.
     VARIABLE ZONES: Marked with [VARIABLE]. Replace with content.
     
     Content ratio target: 40% specs/tables, 30% code, 30% prose
     
     A component spec must enable DROP-IN usage. An agent reading
     this should be able to add the component to a project without
     asking clarifying questions.
     ============================================================ -->

<!-- [FIXED] Frontmatter -->
---
title: "[VARIABLE: Component Name]"
format: component-spec
layer: components
category: "[VARIABLE: modules|cms-models|ui-kits|infrastructure]"
status: draft
version: [VARIABLE: semver, e.g., 0.1.0]
compatible_with: [VARIABLE: CMS models or components this works with]
incompatible_with: [VARIABLE: known conflicts, or empty array]
tags: [VARIABLE]
quality_gate: "[VARIABLE: quality gate slug this component must pass]"
---

<!-- [FIXED] Title block -->
# [VARIABLE: Component Name]

> One-line: [VARIABLE: What this provides as a drop-in building block. Be specific about what the agent gets.]

<!-- [FIXED] Feature checklist -->
## What It Provides

- [x] [VARIABLE: Implemented feature]
- [x] [VARIABLE: Implemented feature]
- [ ] [VARIABLE: Planned feature (version X.Y)]

<!-- [FIXED] Installation -->
## Installation

```bash
# [VARIABLE: Exact commands to add this to a project]
```

<!-- [FIXED] Configuration with typed interface -->
## Configuration

```typescript
// [VARIABLE: Configuration interface with sensible defaults and comments]
interface [VARIABLE]Config {
  // [VARIABLE: each field with type, default, and purpose]
}
```

<!-- [FIXED] API table -->
## API

| Export | Type | Description |
|--------|------|-------------|
| [VARIABLE] | [VARIABLE] | [VARIABLE] |

<!-- [FIXED] Variants per CMS model -->
## Variants

| CMS Model | Implementation | Notes |
|-----------|---------------|-------|
| [VARIABLE] | [VARIABLE] | [VARIABLE] |

<!-- [VARIABLE] Usage example — must be copy-pasteable -->
## Usage Example

```typescript
// [VARIABLE: Minimal working example showing the most common usage]
```

<!-- [FIXED] Testing -->
## Testing

```bash
# [VARIABLE: How to verify this component works correctly]
```

<!-- [FIXED] Changelog -->
## Changelog

- [VARIABLE: vX.Y.Z: What changed]

<!-- [FIXED] Related section -->
## Related

- Compatible with: [[VARIABLE: cms-model]] — [VARIABLE]
- Quality gate: [[VARIABLE: gate-slug]] — [VARIABLE: What it verifies]
- Domain knowledge: [[VARIABLE: domain-slug]] — [VARIABLE: Underlying expertise]
