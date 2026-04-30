<!-- [FIXED] Audit report structure — section order never changes.
     Save output as RESCUE_REPORT.md in the target repository root. -->

# Rescue Audit: [VARIABLE: Repository Name]

> **Date:** [VARIABLE: YYYY-MM-DD]
> **Rescuer:** [VARIABLE: Name or "Automated (repo-rescue skill)"]
> **Build status before:** [VARIABLE: PASSING / FAILING / UNKNOWN]
> **Build status after:** [VARIABLE: PASSING / FAILING / PARTIAL]

---

<!-- [FIXED] Executive summary — always first, always a single paragraph -->
## Executive Summary

[VARIABLE: 2-4 sentences. State: total findings, how many were fixed, current build
status, and one-line characterization of the repo's health. Example: "Found 8 issues
across 4 categories. Fixed 5 (all Quick Wins and 2 of 3 Day 1 items). Build now
passes. The 3 remaining items are documented in What Remains with effort estimates."]

---

<!-- [FIXED] Findings table — categorized, severity-sorted -->
## What Was Found

| # | Category | Finding | Severity | File / Location | Automated fix? |
|---|----------|---------|----------|-----------------|----------------|
<!-- [VARIABLE] One row per finding. Sort: Critical first, Low last.
     Severity: Critical / High / Medium / Low
     Automated fix: Yes / No / Partial -->
| 1 | [VARIABLE: Category] | [VARIABLE: Description] | [VARIABLE: Severity] | [VARIABLE: Path] | [VARIABLE: Yes/No] |

**Total:** [VARIABLE: N] findings &nbsp;|&nbsp;
**Critical:** [VARIABLE: N] &nbsp;|&nbsp;
**High:** [VARIABLE: N] &nbsp;|&nbsp;
**Medium:** [VARIABLE: N] &nbsp;|&nbsp;
**Low:** [VARIABLE: N]

---

<!-- [FIXED] Fixes section — one entry per applied fix, evidence required -->
## What Was Fixed

<!-- [VARIABLE] One subsection per applied fix.
     Include: before state, action taken, after state (build output or diff).
     Only include fixes that were applied and verified. -->

### Fix 1: [VARIABLE: Finding Name]

**Before:** [VARIABLE: The error message, warning, or problem state]

**Action:** [VARIABLE: What was changed — file path, what was removed/added/edited]

**After:**
```
[VARIABLE: Paste build output or relevant diff confirming the fix]
```

<!-- [VARIABLE] Repeat for each additional fix -->

---

<!-- [FIXED] What remains — tiered, rationale required for each item -->
## What Remains

<!-- [VARIABLE] Table of unfixed findings grouped by tier.
     Rationale column must explain why this was not fixed in this session. -->

| Tier | # | Finding | Effort | Rationale |
|------|---|---------|--------|-----------|
| Day 1 | [VARIABLE] | [VARIABLE] | [VARIABLE: e.g., 2h] | [VARIABLE: e.g., Requires DB credentials not available in this session] |
| Week 1 | [VARIABLE] | [VARIABLE] | [VARIABLE] | [VARIABLE: e.g., Architectural change — needs team decision before implementation] |

---

<!-- [FIXED] Build status — final verified state with actual command output -->
## Build Status

**Command:** `[VARIABLE: Exact command run, e.g., cargo build --release]`

```
[VARIABLE: Paste actual terminal output here — last 20-40 lines if long]
```

**Verdict:** [VARIABLE: PASSING / FAILING / PARTIAL] — [VARIABLE: One sentence explanation]

---

<!-- [VARIABLE] Notes — optional section for caveats, context, and next recommended action -->
## Notes

- [VARIABLE: Any caveats about the rescue, e.g., "Secrets were flagged but rotation is a manual step"]
- [VARIABLE: Recommended immediate next action]
- [VARIABLE: Link to action plan if created separately]
