---
name: showcase-presenter
description: |
  Generates professional project showcases from build artifacts, reports, or skill
  packages. Use when presenting what was built, creating a capability demo, auditing
  documentation health, or turning build reports into stakeholder-ready artifacts.
  Trigger on: "showcase this project", "make a presentation from these reports",
  "demo showcase", "report showcase", "generate a showcase", "present what was built",
  "document audit", "capability demo", "turn this into a presentation",
  "what did we actually build". Two modes: Report (narrative + evidence from logs/reports)
  and Demo (capability inventory + runnable examples from skill packages).
  Documentation audit runs in both modes — broken items are never hidden.
author: Robin Westerlund
version: 1.0.0
---

# Showcase Presenter

## Purpose

Showcase Presenter turns raw project artifacts into professional showcase documents.
Two modes serve two distinct audiences. The documentation audit layer runs in both
modes and is not optional.

**Output:** `report-showcase.md` (Mode 1) or `demo-showcase.md` (Mode 2),
plus supporting artifacts.

---

## Mode Selection

If the caller does not specify a mode, apply this decision table:

| If the input is... | And the question is... | Use |
|--------------------|------------------------|-----|
| Report files, build logs, ADRs, morning reports | "What happened? What was built?" | **Mode 1: Report Showcase** |
| Skill packages, SKILL.md files, tool directories | "What can it do? How do I use it?" | **Mode 2: Demo Showcase** |
| Both reports AND skill packages | Ask: "Stakeholder summary or capability demo?" | Caller chooses |
| Ambiguous (no clear artifact type) | — | Ask before proceeding |

**Anti-pattern:** Do not blend modes into one document. Each mode produces a distinct
artifact. Blended output serves neither audience well.

---

## Mode 1: Report Showcase

**Question answered:** "What happened and what was built?"
**Audience:** Stakeholders, architects, retrospective participants
**Output:** `report-showcase.md` + `metrics-dashboard.md` + `audit-checklist.md`

### Inputs

| Input | Required | Notes |
|-------|----------|-------|
| `project_path` | Yes | Directory to scan |
| `report_files` | Yes | Paths or glob (`docs/**/*.md`, `*.report.md`) |
| `project_name` | No | Inferred from README or directory name if absent |
| `time_range` | No | ISO date range; omit to include all reports |
| `audience` | No | `stakeholder` (default) \| `architect` \| `retrospective` |

### Step 1: Ingest Reports

For each report file, extract:
- Dates, file counts, tool names, error counts, commands run
- Decisions (look for "decided", "chose", "selected", "will use")
- Problems (look for "failed", "error", "broke", "issue")
- Outcomes (look for "works", "passing", "complete", "shipped")

Run the documentation audit on every item mentioned. See [Documentation Audit](#documentation-audit-layer).

**Anti-pattern:** Do not summarize tone ("progress was made"). Extract facts only.

### Step 2: Build the Metrics Dashboard

Fill `templates/metrics-dashboard.md` with real numbers from the artifacts.

If a number is absent: write `[NO DATA]`. Never estimate. Never leave blank without
the tag. Invented metrics are an explicit credibility killer — see
`references/anti-patterns.md`.

Required metrics to find: files created/modified/deleted, tests written/passing/failing,
issues found/fixed, commands succeeded/failed, decisions made, time span covered.

### Step 3: Build the Timeline

For each event with a date or timestamp, create an entry: `[DATE] [WHAT] — [OUTCOME]`.
Sort chronologically. Group into phases if natural groupings exist.
Mark inflection points: first working version, first failure, first success after failure.

Format: Mermaid gantt (preferred for multi-phase) or markdown table (simpler).
See `references/mermaid-cheatsheet.md` for gantt syntax.

### Step 4: Extract Architecture Decisions

For each decision found, convert to Y-Statement format:

```
In the context of [situation],
facing [concern],
we decided [option],
to achieve [quality],
accepting [downside].
```

If evidence exists (benchmark, before/after, error resolved), attach it directly.
If a decision was reversed, include it — reversed decisions are the most instructive.

**Anti-pattern:** Do not invent decisions. If none are found, write: "No explicit
decision rationale captured in reports. Add ADR notes to future build logs."

### Step 5: Build the Risk/Gap Register

For every item that was started but not completed, failed without a fix, is referenced
but missing from disk, or is marked TODO/WIP — create a register entry using the
`templates/audit-checklist.md` gap table format.

**Honest gap registers are a professional signal.** See `references/presentation-patterns.md`.

### Step 6: Write the Executive Summary

Exactly 3 sentences:
1. What was built (noun + verb + outcome)
2. What worked (strongest metric or achievement)
3. What is next (one concrete action, not a category)

**Anti-pattern:** "Good progress was made" and "the system is now more capable"
are both invalid. Name the specific thing.

**Valid example:**
> The portable-kit project-wiki skill was packaged to Full shape with bundler,
> sidecar pattern, and 48 tasks completed across 4 phases. The bundler handles
> namespace collisions and icon inlining, verified by the verify script passing
> all checks. Next: forge the showcase-presenter skill and add it to the meta-skills catalog.

### Step 7: Write Next Steps

Exactly 3–5 items. Each must have an action verb, specific deliverable, and effort tag:
`[S]` <30 min · `[M]` 1–4 h · `[L]` 1–2 days · `[XL]` week+

No "consider doing X" or "it might be worth exploring Y." Concrete actions only.

### Step 8: Assemble Output

Fill `templates/report-showcase.md`. Apply verdict logic (see [Verdict Logic](#verdict-logic)).
Append audit summary from `templates/audit-checklist.md`.

---

## Mode 2: Demo Showcase

**Question answered:** "What can it do and how do I use it?"
**Audience:** Users, developers, evaluators
**Output:** `demo-showcase.md` + N × `capability-card.md` + `audit-checklist.md`

### Inputs

| Input | Required | Notes |
|-------|----------|-------|
| `project_path` | Yes | Directory to scan |
| `skill_paths` | Yes | Paths to skills or tools to demonstrate |
| `audience` | No | `user` (default) \| `developer` \| `evaluator` |
| `include_chains` | No | Boolean — demonstrate capability chaining |

### Step 1: Build Capability Inventory

For each skill/tool path:
1. Read SKILL.md or README.md
2. Extract: name, one-line description, trigger phrases, inputs, outputs
3. Run documentation audit — assign status badge

Status badge assignment:

| Badge | Condition |
|-------|-----------|
| `[READY]` | Audit checks A1–A6 all pass |
| `[UNTESTED]` | A1–A3 pass, A4–A5 not verified in this session |
| `[INCOMPLETE]` | A2 or A3 fails — exists but documentation insufficient |
| `[BROKEN]` | A1 fails (missing) or A6 fails (dead references) |

Output the inventory as a table. See `templates/demo-showcase.md` for format.

### Step 2: Write Per-Capability Demo Sections

For each `[READY]` or `[UNTESTED]` capability, fill one `templates/capability-card.md`.

The card has five required elements — all five must be present:

| Element | Rule |
|---------|------|
| What It Is | 1 sentence. Active voice, present tense, specific outcome. No hedging. |
| How to Invoke | Exact prompt or command. Copy-pasteable. Must work as written. |
| Example Input → Output | Real artifact if available. Mark `<!-- ILLUSTRATIVE -->` if not. |
| Edge Case | One failure mode shown. Show actual output, not "handles gracefully". |
| Try It | One copy-pasteable prompt the reader can use immediately. |

**Anti-pattern:** Do not write capability cards for `[BROKEN]` items. Include them
in the inventory table with their badge, then skip the card.

### Step 3: Integration Demos (conditional)

If `include_chains = true` OR if natural capability chains exist:
- Identify 2–3 capabilities that compose naturally
- Write a pipeline demo showing them chained
- Show the handoff artifact between each step with file name and size

**Anti-pattern:** Do not fabricate chains. Only show chains that have been demonstrated
or that follow from documented interfaces.

### Step 4: Assemble Output

Fill `templates/demo-showcase.md`. Order capabilities: READY first, UNTESTED second,
INCOMPLETE third, BROKEN last. Apply verdict logic. Append audit summary.

---

## Documentation Audit Layer

**Runs in both modes. Not optional.**

For each capability, file, skill, or tool referenced:

| # | Check | Pass Condition | Fail Badge |
|---|-------|----------------|------------|
| A1 | File exists | Path is present on disk | `[BROKEN]` |
| A2 | README or SKILL.md present | Root readme found at path | `[INCOMPLETE]` |
| A3 | Frontmatter valid | name, description, version parseable | `[INCOMPLETE]` |
| A4 | Invocation works | Command produces non-error output | `[UNTESTED]` if not verified |
| A5 | Output format correct | Output matches documented format | `[UNTESTED]` if not verified |
| A6 | No dead references | All linked files exist | `[BROKEN]` |
| A7 | Examples are real | Mark `[ILLUSTRATIVE]` if not actual output | — |

**A `[BROKEN]` or `[INCOMPLETE]` item is NEVER removed from the showcase.**
It stays in the inventory with its badge. A showcase that hides broken items is
worse than useless — it creates false confidence.

Fill `templates/audit-checklist.md` for every item. Place the completed checklist
at the end of every output document.

---

## Verdict Logic

### Report Showcase

| Verdict | Condition |
|---------|-----------|
| `SHOWCASE-READY` | ≥ 1 real metric, timeline present, 0 `[BROKEN]` items |
| `SHOWCASE-WITH-GAPS` | Timeline or metrics present, 1+ `[INCOMPLETE]` items |
| `DRAFT-ONLY` | No real metrics found, or >50% of items are `[BROKEN]` |

### Demo Showcase

| Verdict | Condition |
|---------|-----------|
| `DEMO-READY` | ≥ 50% capabilities `[READY]`, 0 `[BROKEN]` |
| `DEMO-WITH-CAVEATS` | 1–2 `[BROKEN]` items, remainder `[READY]` or `[UNTESTED]` |
| `DEMO-STRUCTURED` | 0 `[BROKEN]`, 0 `[READY]`, majority `[UNTESTED]` — structure sound, invocation unverified |
| `INVENTORY-ONLY` | >50% capabilities `[BROKEN]` or `[INCOMPLETE]` |

The verdict appears in the document header and in the audit summary. It is never softened.
`DRAFT-ONLY` means draft only — do not relabel it "early-stage showcase."

---

## Anti-Patterns

| Do NOT | Instead |
|--------|---------|
| Invent metrics when data is absent | Write `[NO DATA]` — explicit empty is better than a guess |
| Remove `[BROKEN]` items from showcase | Keep them with their badge — honest audit is the product |
| Write vague executive summaries | Extract facts: what was built, which metric, what is next |
| Use `foo`, `bar`, `example.com` in examples | Use real artifacts or mark `<!-- ILLUSTRATIVE -->` |
| Produce the showcase without running the audit | Audit is mandatory — runs in both modes, always |
| Mark `[READY]` without verifying invocation | Mark `[UNTESTED]` if invocation was not confirmed |
| Write more than 5 next steps | Rank by impact and cut — more than 5 is a backlog |
| Let the showcase feel like meeting notes | Apply the professional signals checklist in `references/presentation-patterns.md` |
| Skip Y-Statement for decisions | The format is mandatory — it forces the tradeoff to be named |
| Put architecture diagrams before the problem statement | Problem first. Nobody cares about boxes until they understand the pain. |

---

## Quick Reference

```
MODE 1 (Report):  reports → ingest → metrics → timeline → decisions →
                  gaps → executive summary → next steps → audit → assemble

MODE 2 (Demo):    skills → inventory → capability cards → chains →
                  audit → assemble

ALWAYS:           Run documentation audit. Apply badges. Never hide BROKEN items.
                  Verdict in header + audit summary. Professional signals checklist.

NEVER:            Invent metrics. Remove broken items. Write vague summaries.
                  Skip Y-Statement for decisions. Mark READY without verifying.

OUTPUT:           report-showcase.md  OR  demo-showcase.md
                  + metrics-dashboard.md (Mode 1 only)
                  + N × capability-card.md sections (Mode 2 only)
                  + audit-checklist.md (always)
```

---

## Integration Points

| Component | How showcase-presenter connects |
|-----------|--------------------------------|
| **skill-forge** | Forges this skill package from the design document |
| **project-wiki** | Showcase documents can be ingested as wiki sections |
| **buildr-executor** | Morning reports and wave summaries are primary Mode 1 inputs |
| **skill-creator** | After packaging, runs eval loop against real report artifacts |
| **seo-article-audit** | Structural pattern: two-layer model (deterministic audit + judgment) |

---

## References

| File | When to read |
|------|-------------|
| `references/presentation-patterns.md` | Before reviewing output quality — professional signals checklist |
| `references/mermaid-cheatsheet.md` | When building timeline (gantt) or architecture diagrams |
| `references/quality-standard.md` | Before marking output complete — two-layer gate |
| `references/anti-patterns.md` | When output feels thin or untrustworthy |
