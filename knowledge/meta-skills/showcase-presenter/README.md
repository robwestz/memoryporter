# showcase-presenter

Generates professional showcase documents from build artifacts, reports, or skill packages.
Two modes: Report Showcase (what happened and what was built) and Demo Showcase (what it can
do and how to use it). Documentation audit runs in both modes — broken items are surfaced
with badges, never hidden.

---

## What It Does

**Mode 1 — Report Showcase:** Reads build logs, morning reports, and ADRs. Extracts real
metrics, builds a timeline with inflection points, converts decisions to Y-Statement format,
registers gaps and broken items, and produces a stakeholder-ready document with a
documentation audit summary and a `SHOWCASE-READY / SHOWCASE-WITH-GAPS / DRAFT-ONLY` verdict.

**Mode 2 — Demo Showcase:** Reads SKILL.md files and tool directories. Builds a capability
inventory with status badges (`[READY]`, `[UNTESTED]`, `[INCOMPLETE]`, `[BROKEN]`), writes
per-capability demo cards with real invocations and edge cases, and assembles a user-facing
showcase with a `DEMO-READY / DEMO-WITH-CAVEATS / INVENTORY-ONLY` verdict.

**Documentation audit:** Runs in both modes. Checks file existence, README presence,
frontmatter validity, invocability, output format correctness, and dead references.
`[BROKEN]` and `[INCOMPLETE]` badges are features — they make the showcase honest.

---

## Supported Clients

| Client | Notes |
|--------|-------|
| Claude Code | Primary — direct file access for artifact ingestion |
| Cursor | Via `.cursor/rules/` or skill-engine resolver |
| Any skill-engine-compatible agent | Requires access to the project file system |

---

## Prerequisites

- Access to the project file system (read artifacts, check file existence)
- For Mode 1: report files in markdown format (build logs, morning reports, ADRs)
- For Mode 2: skill packages with SKILL.md files at declared paths
- For Marp export (optional): `npx @marp-team/marp-cli` — see below

---

## Installation

Copy this directory into your project's skill location:

```bash
cp -r showcase-presenter/ knowledge/meta-skills/showcase-presenter/
```

No additional dependencies required for core functionality.

### Optional: Marp slide export

If you want to convert the showcase output to slides:

```bash
npx @marp-team/marp-cli report-showcase.md --html -o report-showcase.html
```

The report-showcase.md template is Marp-compatible when the following frontmatter
is added at the top:

```yaml
---
marp: true
theme: gaia
paginate: true
backgroundColor: #0f172a
color: #e2e8f0
---
```

---

## Trigger Conditions

Use showcase-presenter when the user says any of:

- "showcase this project"
- "make a presentation from these reports"
- "demo showcase" or "report showcase"
- "generate a showcase"
- "present what was built"
- "document audit"
- "capability demo"
- "turn this into a presentation"
- "what did we actually build"

---

## Expected Outcome

**Mode 1 output:**
- `report-showcase.md` — stakeholder narrative with metrics, timeline, decisions, gaps
- Embedded `metrics-dashboard.md` content (real numbers or `[NO DATA]`)
- Embedded `audit-checklist.md` content (all items audited)
- Verdict: `SHOWCASE-READY`, `SHOWCASE-WITH-GAPS`, or `DRAFT-ONLY`

**Mode 2 output:**
- `demo-showcase.md` — capability inventory + per-capability cards + integration demos
- N × capability card sections (one per `[READY]` capability)
- Embedded `audit-checklist.md` content
- Verdict: `DEMO-READY`, `DEMO-WITH-CAVEATS`, or `INVENTORY-ONLY`

---

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Main skill — procedure, mode selection, audit layer, verdict logic |
| `README.md` | This file — installation and usage guide |
| `metadata.json` | Machine-readable package metadata |
| `templates/report-showcase.md` | Mode 1 output template with Fixed/Variable zones |
| `templates/demo-showcase.md` | Mode 2 output template with Fixed/Variable zones |
| `templates/capability-card.md` | Per-capability demo section template |
| `templates/metrics-dashboard.md` | Key metrics table + ASCII chart template |
| `templates/audit-checklist.md` | Documentation health check template |
| `references/presentation-patterns.md` | Professional signals checklist + YC arc |
| `references/mermaid-cheatsheet.md` | Mermaid syntax quick reference |
| `references/quality-standard.md` | Two-layer gate (structural + narrative) |
| `references/anti-patterns.md` | Ten credibility killers with concrete fixes |

---

## Troubleshooting

**"I don't know which mode to use."**
— If your input is report files/logs → Mode 1. If your input is SKILL.md files/tool
directories → Mode 2. If both → ask the user which question they want answered.

**"The audit has too many `[BROKEN]` items — should I hide them?"**
— No. `[BROKEN]` badges are a feature. A showcase with visible broken items is more
trustworthy than one that hides them. The verdict will reflect the broken count
(`DRAFT-ONLY` or `INVENTORY-ONLY`), which is the correct signal for the consumer.

**"The metrics dashboard is mostly `[NO DATA]`."**
— Ship it as `DRAFT-ONLY`. The verdict communicates thin data coverage. Do not
invent numbers to fill fields. Recommend adding structured logging to future reports.

**"The Marp export doesn't look right."**
— Report and demo showcases are designed for markdown viewing first, slides second.
Check that the frontmatter block is at the very top of the file and that the theme
is set to `gaia`. For custom styling, see the Marp docs for CSS theme overrides.
