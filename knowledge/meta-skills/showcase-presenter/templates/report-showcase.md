<!-- [FIXED] Report showcase output format — do not modify structure or section order -->
---
generated: <!-- [VARIABLE: ISO timestamp, e.g. 2026-04-13T14:32:00Z] -->
mode: report-showcase
verdict: <!-- [VARIABLE: SHOWCASE-READY | SHOWCASE-WITH-GAPS | DRAFT-ONLY] -->
project: <!-- [VARIABLE: project name] -->
reports: <!-- [VARIABLE: comma-separated report file names] -->
audience: <!-- [VARIABLE: stakeholder | architect | retrospective] -->
---

# <!-- [VARIABLE: Project Name] --> — Report Showcase

<!-- [FIXED] Verdict badge — never soften the label -->
**Status:** `<!-- [VARIABLE: SHOWCASE-READY | SHOWCASE-WITH-GAPS | DRAFT-ONLY] -->`

<!-- [FIXED] Executive summary — exactly 3 sentences, no more -->
> <!-- [VARIABLE: Sentence 1 — what was built: noun + verb + outcome] -->
> <!-- [VARIABLE: Sentence 2 — what worked: strongest metric or achievement] -->
> <!-- [VARIABLE: Sentence 3 — what is next: one concrete action, not a category] -->

---

<!-- [FIXED] Key metrics always appear before narrative — fill from metrics-dashboard.md -->
## Key Metrics

<!-- [VARIABLE: Paste completed metrics-dashboard.md table here] -->

<!-- [FIXED] ASCII progress bar for completion ratio — compute from metrics above -->
```
Completion
██████████░░░░░░░░░░  <!-- [VARIABLE: filled blocks = tasks done / total * 20] --> <!-- [VARIABLE: N/M tasks] -->

Pass rate
████████████████░░░░  <!-- [VARIABLE: filled blocks = tests passing / total * 20] --> <!-- [VARIABLE: N/M tests] -->
```
<!-- If metrics are absent: replace bars with "[NO DATA] — bars require test counts from reports" -->

---

<!-- [FIXED] Timeline section — chronological, grouped into phases if natural -->
## Timeline

<!-- [VARIABLE: Choose mermaid gantt (multi-phase) or markdown table (simpler)] -->

<!-- OPTION A: Mermaid gantt (preferred when phases exist) -->
```mermaid
gantt
    title <!-- [VARIABLE: Project Name] --> Build Timeline
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section <!-- [VARIABLE: Phase or Wave name] -->
    <!-- [VARIABLE: Task description]  -->  : <!-- [VARIABLE: start date] -->, <!-- [VARIABLE: end date] -->

    section <!-- [VARIABLE: Phase or Wave name] -->
    <!-- [VARIABLE: Task description]  -->  : <!-- [VARIABLE: start date] -->, <!-- [VARIABLE: end date] -->
```

<!-- OPTION B: Markdown table (use when no phases or single session) -->
<!-- Delete whichever option you do not use -->
| Date | Event | Outcome |
|------|-------|---------|
| <!-- [VARIABLE: YYYY-MM-DD] --> | <!-- [VARIABLE: what happened] --> | <!-- [VARIABLE: concrete outcome] --> |
| <!-- [VARIABLE: YYYY-MM-DD] --> | <!-- [VARIABLE: failure event] --> | <!-- [VARIABLE: how it was resolved or left open] --> |

<!-- Inflection point markers — add inline where applicable: -->
<!-- 🟢 First working version  🔴 First failure  🔁 First success after failure -->

---

<!-- [FIXED] Architecture decisions — Y-Statement format per decision found -->
## Architecture Decisions

<!-- [VARIABLE: Repeat this block once per decision — do NOT invent decisions] -->

### Decision: <!-- [VARIABLE: Short name for the decision] -->

```
In the context of <!-- [VARIABLE: situation] -->,
facing <!-- [VARIABLE: concern or constraint] -->,
we decided <!-- [VARIABLE: chosen option] -->,
to achieve <!-- [VARIABLE: desired quality or outcome] -->,
accepting <!-- [VARIABLE: tradeoff or downside] -->.
```

**Evidence:** <!-- [VARIABLE: specific metric, before/after, or error resolved — not assertions] -->

<!-- [FIXED] If no decisions found: use this block and remove the Y-Statement block above -->
<!-- > **No explicit decision rationale captured in reports.** -->
<!-- > Add ADR notes to future build logs to capture decisions at the point of choice. -->

---

<!-- [FIXED] Before/after section — omit this entire section if no before state is documented -->
## Before / After

<!-- [VARIABLE: comparison showing what changed — table or side-by-side code blocks] -->

| Dimension | Before | After |
|-----------|--------|-------|
| <!-- [VARIABLE: aspect] --> | <!-- [VARIABLE: old state] --> | <!-- [VARIABLE: new state] --> |

---

<!-- [FIXED] Risk and gap register — NEVER empty, NEVER omit -->
## Risk & Gap Register

<!-- [VARIABLE: one row per incomplete, broken, or missing item found in reports] -->
| Item | Status | Risk if Left | Effort to Close |
|------|--------|-------------|-----------------|
| <!-- [VARIABLE: item name] --> | <!-- [VARIABLE: INCOMPLETE \| BROKEN \| MISSING] --> | <!-- [VARIABLE: concrete impact] --> | <!-- [VARIABLE: S \| M \| L \| XL] --> |

<!-- [FIXED] If genuinely no gaps: replace table with this line -->
<!-- No gaps or broken items identified in the scanned artifacts. -->

---

<!-- [FIXED] Next steps — exactly 3-5, each with effort tag -->
## Next Steps

<!-- [VARIABLE: numbered list, 3-5 items, each with action verb + deliverable + [effort tag]] -->
1. <!-- [VARIABLE: Action verb] --> <!-- [VARIABLE: specific deliverable] --> `[S]`
2. <!-- [VARIABLE: Action verb] --> <!-- [VARIABLE: specific deliverable] --> `[M]`
3. <!-- [VARIABLE: Action verb] --> <!-- [VARIABLE: specific deliverable] --> `[L]`

<!-- No "consider", "explore", "might be worth" — concrete actions only -->

---

<!-- [FIXED] Documentation audit — always last, never omitted -->
## Documentation Audit

<!-- [VARIABLE: Paste completed audit-checklist.md content here] -->

**Verdict:** `<!-- [VARIABLE: SHOWCASE-READY | SHOWCASE-WITH-GAPS | DRAFT-ONLY] -->`
