---
name: api-contract-review
description: |
  Review API contracts (OpenAPI/Swagger specs, GraphQL schemas, or REST endpoint
  docs) for completeness, consistency, and breaking-change risk. Use when reviewing
  a new API spec, auditing an existing API before release, comparing two spec
  versions for breaking changes, or when someone asks "is this API ready to ship".
  Trigger on: "review this API", "check the spec", "breaking changes", "API audit".
author: Example Author
version: 1.0.0
---

# API Contract Review

## Purpose

Catch API design problems before they ship — missing fields, inconsistent naming,
undocumented errors, and breaking changes that will burn downstream consumers.

## When to Use

- Before releasing a new API version
- When reviewing a PR that changes API contracts
- Comparing v1 vs v2 for migration risk
- Auditing a third-party API before integration

## When NOT to Use

- Reviewing internal function signatures (this is for external contracts)
- Performance testing (this is structural review, not load testing)

## Process

### Step 1: Load the Spec

Read the API specification. Identify the format:

| Format | File pattern | Key sections |
|--------|-------------|-------------|
| OpenAPI 3.x | `openapi.yaml` / `.json` | paths, components/schemas, security |
| Swagger 2.0 | `swagger.json` | paths, definitions, securityDefinitions |
| GraphQL | `schema.graphql` | types, queries, mutations, subscriptions |
| REST docs | `*.md` / wiki | endpoints, request/response, auth |

### Step 2: Structural Audit

Check every endpoint/operation against:

| Check | Pass criteria | Common failure |
|-------|--------------|----------------|
| Naming consistency | All endpoints use same convention (kebab-case, camelCase) | Mixed: `/user-profile` and `/getUserData` |
| HTTP methods | GET=read, POST=create, PUT=replace, PATCH=update, DELETE=remove | POST used for everything |
| Status codes | 200/201/204 for success, 400/401/403/404/422/500 for errors | Only 200 and 500 |
| Error schema | Consistent error object across all endpoints | Different error shapes per endpoint |
| Pagination | Collections use cursor or offset pagination | Unbounded list responses |
| Versioning | Version in URL path or header | No versioning strategy |
| Auth | Security scheme declared and applied | Endpoints missing auth requirement |

**Anti-pattern:** Do not assume undocumented behavior is a bug. Flag it as
"undocumented" — the author may have intentional reasons.

### Step 3: Breaking Change Detection

If comparing two versions, check:

| Change type | Breaking? | Action |
|-------------|-----------|--------|
| Field removed from response | YES | Flag as critical |
| Field added to response | No | Note for changelog |
| Required field added to request | YES | Flag as critical |
| Optional field added to request | No | Note for changelog |
| Endpoint removed | YES | Flag as critical |
| Status code changed | Maybe | Check if consumers handle both |
| Enum value removed | YES | Flag as critical |
| Enum value added | No | Note for changelog |

### Step 4: Produce the Review

Output format:

```
## API Contract Review: [API Name] [Version]

### Critical Issues (must fix before release)
| # | Endpoint | Issue | Impact |

### Warnings (should fix)
| # | Endpoint | Issue | Recommendation |

### Breaking Changes (if comparing versions)
| # | Change | Affected consumers | Migration path |

### Passed Checks
[List of checks that passed — confirm what's good, not just what's bad]
```

## Notes

- This skill reviews the contract, not the implementation
- Always list passed checks — builds confidence that the review was thorough
- When in doubt about whether a change is breaking: flag it as breaking
