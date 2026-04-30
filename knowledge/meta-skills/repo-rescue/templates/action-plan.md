<!-- [FIXED] Action plan structure — tier order is fixed: Quick Wins, Day 1, Week 1.
     This template is filled during PLAN (Step 3) and included in the audit report. -->

# Action Plan: [VARIABLE: Repository Name]

> **Generated:** [VARIABLE: YYYY-MM-DD]
> **Source:** Repo Rescue — DIAGNOSE phase output

---

<!-- [FIXED] Quick wins table — items that take < 30 min and require no architectural judgment -->
## Quick Wins (< 30 minutes each)

Apply in the order listed — upstream dependencies first.

| # | Action | File / Location | Effort | Verification |
|---|--------|-----------------|--------|--------------|
<!-- [VARIABLE] One row per quick win.
     Action: imperative ("Remove hardcoded API key from config.py")
     Verification: how to confirm it worked ("grep finds no matches", "build passes") -->
| 1 | [VARIABLE: Action] | [VARIABLE: File or path] | [VARIABLE: e.g., 5 min] | [VARIABLE: How to verify] |

---

<!-- [FIXED] Day 1 table — items that unblock the build or CI -->
## Day 1 Sprint

Do not start Week 1 items until all Day 1 items are resolved or explicitly deferred.

| # | Action | File / Location | Effort | Blocked by | Verification |
|---|--------|-----------------|--------|------------|--------------|
<!-- [VARIABLE] One row per Day 1 item.
     Blocked by: item number that must be done first, or "—" if none -->
| 1 | [VARIABLE: Action] | [VARIABLE: File or path] | [VARIABLE: e.g., 1h] | [VARIABLE: — or #N] | [VARIABLE: How to verify] |

---

<!-- [FIXED] Week 1 table — architectural, sustained-effort, or nice-to-have items -->
## Week 1 Roadmap

These items improve stability, security posture, or developer experience.
Each requires planning; do not start without a clear owner.

| # | Action | Category | Effort | Owner | Notes |
|---|--------|----------|--------|-------|-------|
<!-- [VARIABLE] One row per Week 1 item.
     Category: Security / CI / Testing / Documentation / Architecture / Hygiene -->
| 1 | [VARIABLE: Action] | [VARIABLE: Category] | [VARIABLE: e.g., 4h] | [VARIABLE: Name or Team] | [VARIABLE: Any caveats] |

---

<!-- [FIXED] Summary totals — machine-scannable -->
## Totals

| Tier | Count | Est. Total Effort |
|------|-------|-------------------|
| Quick Wins | [VARIABLE: N] | [VARIABLE: e.g., 45 min] |
| Day 1 | [VARIABLE: N] | [VARIABLE: e.g., 4h] |
| Week 1 | [VARIABLE: N] | [VARIABLE: e.g., 2–3 days] |
| **All tiers** | **[VARIABLE: N]** | **[VARIABLE: total]** |
