<!-- [FIXED] Workflow Design Template — Layer 3 output (Archon-compatible YAML) -->

# Workflow Design: [VARIABLE: Workflow Name]

## [FIXED] Overview

| Field | Value |
|-------|-------|
| **Name** | [VARIABLE: kebab-case] |
| **Description** | [VARIABLE: one paragraph] |
| **Provider** | [VARIABLE: claude / codex] |
| **Model** | [VARIABLE: sonnet / opus / haiku] |
| **Node count** | [VARIABLE: N] |
| **Estimated duration** | [VARIABLE: Xm per node] |

## [FIXED] Node Design

| Node ID | Type | Depends On | Purpose | fresh_context | max_iterations |
|---------|------|-----------|---------|---------------|---------------|
| [VARIABLE] | [VARIABLE: prompt/bash/loop/command] | [VARIABLE] | [VARIABLE] | [VARIABLE: true/false/N/A] | [VARIABLE: N/A or number] |

## [FIXED] YAML

```yaml
name: [VARIABLE]
description: |
  [VARIABLE]
provider: [VARIABLE]
model: [VARIABLE]

nodes:
  [VARIABLE: complete node definitions]
```

## [FIXED] Verification

| Check | Expected |
|-------|----------|
| All nodes have single responsibility | [VARIABLE: yes/no + evidence] |
| Independent nodes are parallel | [VARIABLE] |
| Loop nodes have max_iterations | [VARIABLE] |
| Bash nodes have timeout | [VARIABLE] |
| Human gate before irreversible actions | [VARIABLE] |

<!-- [FIXED] Anti-patterns -->
## Workflow Anti-patterns to Avoid

| Pattern | Risk | Fix |
|---------|------|-----|
| [VARIABLE: from SKILL.md Layer 3 anti-patterns] | [VARIABLE] | [VARIABLE] |
