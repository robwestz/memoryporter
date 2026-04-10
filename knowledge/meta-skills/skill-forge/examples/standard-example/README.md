# API Contract Review

> Review API specs for completeness, consistency, and breaking-change risk before shipping.

## What It Does

Systematically audits OpenAPI/Swagger specs, GraphQL schemas, or REST endpoint documentation. Catches naming inconsistencies, missing error schemas, undocumented auth, and breaking changes between versions. Produces a structured review with critical issues, warnings, and passed checks.

## Supported Clients

- Claude Code (primary)
- Codex CLI
- Any AI client with file reading capability

## Prerequisites

- An API specification file (OpenAPI, Swagger, GraphQL schema, or REST docs)
- For breaking-change detection: two versions of the spec

## Installation

```bash
cp -r api-contract-review/ ~/.claude/skills/api-contract-review/
```

## Trigger Conditions

- Reviewing a new or updated API specification
- Auditing an API before release
- Comparing spec versions for migration risk
- Any mention of "API review", "check the spec", or "breaking changes"

## Expected Outcome

A structured review document listing critical issues (must fix), warnings (should fix), breaking changes (with migration paths), and passed checks (confirmation of quality).

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Main skill — 4-step review process |
| `README.md` | This file |
| `metadata.json` | Package metadata |

## Troubleshooting

**Issue:** Spec format not recognized.
**Solution:** Check the format table in Step 1. If the format isn't listed, adapt the structural audit checks to the spec's structure.

**Issue:** Too many false positives on breaking changes.
**Solution:** Focus on the breaking-change table in Step 3. Only changes that remove or restrict existing behavior are breaking.
