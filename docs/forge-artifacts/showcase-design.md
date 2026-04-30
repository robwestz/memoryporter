# Showcase Presenter — Skill Design Document

*Design artifact for skill-forge. This document is implementation-ready:
hand it to skill-forge to produce the full SKILL.md + package.*

---

## Skill Identity

| Field | Value |
|-------|-------|
| **name** | `showcase-presenter` |
| **version** | `1.0.0` |
| **package shape** | Full (SKILL.md + README + metadata + templates/ + references/) |
| **category** | presentation / documentation |
| **difficulty** | intermediate |
| **estimated_time** | 15–45 minutes depending on artifact volume |

**Trigger phrases (for frontmatter description):**
- "showcase this project"
- "make a presentation from these reports"
- "demo showcase"
- "report showcase"
- "generate a showcase"
- "present what was built"
- "document audit"
- "capability demo"
- "turn this into a presentation"
- "what did we actually build"

---

## Mode Architecture

The skill has two modes. The caller specifies which mode. If ambiguous, ask.

| Dimension | Mode 1: Report Showcase | Mode 2: Demo Showcase |
|-----------|------------------------|----------------------|
| **Question answered** | "What happened and what was built?" | "What can it do and how do I use it?" |
| **Primary audience** | Stakeholders, architects, retrospective | Users, developers, evaluators |
| **Input source** | Report files, build logs, ADRs, morning reports | Skill packages, tool directories, SKILL.md files |
| **Output tone** | Narrative + evidence | Instructional + runnable |
| **Central artifact** | `report-showcase.md` | `demo-showcase.md` |
| **Key template** | `metrics-dashboard.md` | `capability-card.md` |
| **Shared layer** | Documentation audit (always runs) | Documentation audit (always runs) |

**Both modes always run the documentation audit.** A showcase that hides broken items is worse than useless — it creates false confidence. The audit forces honesty by flagging `[BROKEN]` and `[INCOMPLETE]` inline.

---

## Mode 1: Report Showcase — Procedure

### Inputs

| Input | Required | Source |
|-------|----------|--------|
| `project_path` | Yes | Directory to scan |
| `report_files` | Yes | Paths or glob (`docs/**/*.md`, `*.report.md`) |
| `project_name` | No | Inferred from README or directory name |
| `time_range` | No | ISO date range for timeline filtering |
| `audience` | No | `stakeholder` (default) \| `architect` \| `retrospective` |

### Step 1: Ingest Reports

```
For each report file:
  - Extract: dates, file counts, tool names, error counts, commands run
  - Extract: decisions made (look for "decided", "chose", "selected", "will use")
  - Extract: problems encountered (look for "failed", "error", "broke", "issue")
  - Extract: outcomes (look for "works", "passing", "complete", "shipped")
  - Run documentation audit on every item mentioned
```

**Anti-pattern:** Do not summarize tone ("progress was made"). Extract facts.

### Step 2: Build the Metrics Dashboard

Fill `templates/metrics-dashboard.md` with real numbers. If a number is absent from the artifacts, leave the field blank with a `[NO DATA]` tag — never estimate or invent.

Required metrics to find:
- Files created / modified / deleted
- Tests: written, passing, failing
- Issues found / issues fixed
- Commands that succeeded / failed
- Decisions made (count)
- Time span covered by the reports

### Step 3: Build the Timeline

For each event with a date/timestamp:
- Create a timeline entry: `[DATE] [WHAT HAPPENED] — [OUTCOME]`
- Sort chronologically
- Group into phases if natural groupings exist (e.g., Wave 1, Phase A, Session 3)
- Mark inflection points: first working version, first failure, first success after failure

**Timeline format (Mermaid gantt or markdown table — both supported):**

```markdown
| Date | Event | Outcome |
|------|-------|---------|
| 2026-04-10 | Phase A started — scaffold | 12 files created |
| 2026-04-11 | Bundler broken — import collisions | Fixed in 3 iterations |
| 2026-04-12 | Phase D complete — sidecar pattern | 5 skills packaged |
```

### Step 4: Extract Architecture Decisions

For each decision found:
- Convert to Y-Statement format:
  ```
  In the context of [situation],
  facing [concern],
  we decided [option],
  to achieve [quality],
  accepting [downside].
  ```
- If evidence exists (benchmark, before/after, error fixed), attach it
- If the decision failed or was reversed, note it — these are the most valuable

**Anti-pattern:** Do not invent decisions. If no explicit decisions are found, write: "No explicit decision rationale found in reports. Consider adding ADR notes to future build logs."

### Step 5: Build Risk/Gap Register

For every item that:
- Was started but not completed
- Failed and was not fixed
- Is referenced but not present in the file system
- Is marked TODO or WIP

Create a register entry:

```markdown
| Item | Status | Risk | Effort to close |
|------|--------|------|----------------|
| [item] | [INCOMPLETE/BROKEN/MISSING] | [impact if left] | [S/M/L/XL] |
```

Honest gap registers are a professional signal. Side projects hide gaps; production systems surface them.

### Step 6: Write Executive Summary

Three sentences, strictly:
1. What was built (noun + verb + outcome)
2. What worked (strongest metric or achievement)
3. What is next (one concrete action, not a category)

**Anti-pattern:** Do not write "good progress was made" or "the system is now more capable." These are meaningless. Name the specific thing.

**Good example:**
> The portable-kit project-wiki skill was packaged to Full shape with bundler, sidecar pattern, and 48 tasks completed across 4 phases. The bundler now handles namespace collisions and icon inlining, verified by the verify script passing all checks. Next: the showcase-presenter skill must be forged and added to the meta-skills catalog.

### Step 7: Write Next Steps

Exactly 3–5 next steps. Each must have:
- Action verb (Deploy, Fix, Write, Run, Test)
- Specific deliverable
- Effort estimate: `[S]` <30min, `[M]` 1–4h, `[L]` 1–2 days, `[XL]` week+

No "consider doing X" or "it might be worth exploring Y." Only concrete actions.

### Step 8: Assemble Output

Fill `templates/report-showcase.md`. Run the documentation audit. Apply badges.

---

## Mode 2: Demo Showcase — Procedure

### Inputs

| Input | Required | Source |
|-------|----------|--------|
| `project_path` | Yes | Directory to scan |
| `skill_paths` | Yes | Paths to skills / tools to demonstrate |
| `audience` | No | `user` (default) \| `developer` \| `evaluator` |
| `include_chains` | No | Boolean — whether to demonstrate capability chaining |

### Step 1: Build Capability Inventory

For each skill/tool path provided:
- Read SKILL.md or README.md
- Extract: name, one-line description, trigger phrases, inputs, outputs
- Run documentation audit (see below)
- Assign status badge: `[READY]` `[INCOMPLETE]` `[BROKEN]` `[UNTESTED]`

Output as inventory table:

```markdown
| Capability | Description | Status | Invoke With |
|------------|-------------|--------|-------------|
| skill-forge | Packages raw knowledge into skills | [READY] | "forge a skill from..." |
| project-wiki | Bundles project docs into single HTML | [READY] | "build the wiki" |
| showcase-presenter | Generates showcase from artifacts | [INCOMPLETE] | "showcase this project" |
```

### Step 2: Write Per-Capability Demo Sections

For each `[READY]` capability, fill `templates/capability-card.md`.

The card has five required elements:

**1. What It Is (1 sentence)**
- Active voice, present tense, specific outcome
- "Packages a codebase knowledge base into a single-file HTML wiki with full-text search"
- NOT: "A tool that can be used to create documentation"

**2. How to Invoke It (exact trigger)**
```
Prompt: "Build the project wiki for [project]"
Or: bash build.sh --mode wiki --project [path]
```
Must be copy-pasteable. Must work as written.

**3. Example Input → Output**

Show a REAL artifact. If the capability has been run, use actual output.
If not, construct a representative example that is honest about being illustrative.
Mark illustrative examples with `<!-- ILLUSTRATIVE: replace with real output -->`.

```markdown
**Input:**
knowledge/meta-skills/skill-forge/SKILL.md (47KB, 5 files)

**Command:**
[exact invocation]

**Output:**
skill-forge-v1.0.0.html (127KB, self-contained)
- 14 sections
- Full-text search indexed
- Mermaid diagrams rendered

**Time:** 8.2s
```

**4. Edge Case**

One edge case that shows the capability handles failure gracefully.

```markdown
**Edge case:** What if SKILL.md is missing?

Output: "ERROR: SKILL.md not found at [path]. Cannot build wiki without root skill file.
Searched: [path]/SKILL.md, [path]/README.md. Stopping."

The error names the exact paths searched — no silent failure.
```

**5. Try It Yourself**

One copy-pasteable prompt the reader can use immediately:

```markdown
> **Try it:**
> "Build a demo showcase for the skill-forge and seo-article-audit skills.
> Include capability cards with real invoke examples."
```

### Step 3: Integration Demos

If `include_chains` is true (or if natural capability chains exist):
- Identify 2–3 capabilities that compose naturally
- Write a pipeline demo showing them chained
- Show the handoff artifact between each step

```markdown
### Chain: Report → Showcase → Wiki

1. **Morning report generated** by buildr-executor
   Output: `docs/day-report-2026-04-13.md`

2. **Showcase created** from report by showcase-presenter
   Input: the day report above
   Output: `docs/forge-artifacts/2026-04-13-showcase.md`

3. **Wiki built** by project-wiki, ingesting the showcase
   Input: showcase + all SKILL.md files
   Output: `dist/wiki.html` (with showcase as a section)

**Total time:** ~4 minutes for a full project documentation run
```

### Step 4: Assemble Output

Fill `templates/demo-showcase.md`. Apply capability status badges from the inventory.

---

## Documentation Audit Layer (Both Modes)

This layer runs on every item showcased in either mode. It is not optional.

### Audit Checks

For each capability, file, skill, or tool referenced:

| # | Check | Pass Condition | Fail Badge |
|---|-------|----------------|------------|
| A1 | File exists | `[path]` is present on disk | `[BROKEN]` |
| A2 | README or SKILL.md present | Root readme file found | `[INCOMPLETE]` |
| A3 | Frontmatter valid | name, description, version parseable | `[INCOMPLETE]` |
| A4 | Invocation works | Command/trigger produces non-error output | `[UNTESTED]` if not verified |
| A5 | Output format correct | Output matches documented expected format | `[UNTESTED]` if not verified |
| A6 | No dead references | All `references/`, `templates/`, linked files exist | `[BROKEN]` |
| A7 | Examples are real | Examples use actual output, not placeholders | `[ILLUSTRATIVE]` if not real |

### Audit Verdict per Item

| Result | Badge | Meaning |
|--------|-------|---------|
| A1–A6 all pass | `[READY]` | Can be showcased as working |
| A1–A3 pass, A4–A5 not verified | `[UNTESTED]` | Structure exists but runtime not confirmed |
| A1 fails | `[BROKEN]` | File missing — cannot showcase |
| A2 or A3 fails | `[INCOMPLETE]` | Exists but documentation insufficient |
| A6 fails | `[BROKEN]` | Dead references — do not showcase |

**A `[BROKEN]` or `[INCOMPLETE]` item is NEVER removed from the showcase.**
It stays in the inventory with its badge. Hiding broken items is worse than showing them.

### Audit Report Format

At the end of every showcase document, include an Audit Summary section:

```markdown
## Documentation Audit Summary

| Capability | A1 | A2 | A3 | A4 | A5 | A6 | Status |
|------------|----|----|----|----|----|----|--------|
| skill-forge | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [READY] |
| project-wiki | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | [READY] |
| showcase-presenter | ✓ | ✓ | ✓ | – | – | ✓ | [UNTESTED] |

**Ready:** 2 / 3  
**Untested:** 1 / 3  
**Broken:** 0 / 3  
**Incomplete:** 0 / 3
```

---

## Template Designs

Five templates required. Each uses `<!-- [FIXED] -->` and `<!-- [VARIABLE] -->` annotations per skill-forge conventions.

---

### Template 1: `report-showcase.md`

```markdown
<!-- [FIXED] Report showcase output format — do not modify structure -->
---
generated: [VARIABLE: ISO date]
mode: report-showcase
project: [VARIABLE: project name]
reports: [VARIABLE: comma-separated report file names]
audience: [VARIABLE: stakeholder | architect | retrospective]
---

# [VARIABLE: Project Name] — Report Showcase

> [VARIABLE: Executive summary sentence 1 — what was built]
> [VARIABLE: Executive summary sentence 2 — what worked, strongest metric]
> [VARIABLE: Executive summary sentence 3 — one concrete next action]

<!-- [FIXED] Metrics dashboard always appears before narrative -->
## Key Metrics

[VARIABLE: metrics-dashboard.md content — filled with real numbers]

<!-- [FIXED] Timeline section -->
## Timeline

[VARIABLE: chronological event table or mermaid gantt]

<!-- [FIXED] Architecture decisions section -->
## Architecture Decisions

[VARIABLE: Y-Statement blocks, one per decision found in reports]
<!-- If no decisions found: "No explicit decision rationale captured in reports." -->

<!-- [FIXED] Before/after section — only present if before state is documented -->
## Before / After

[VARIABLE: comparison table or side-by-side blocks — omit section if not applicable]

<!-- [FIXED] Risk and gap register -->
## Risk & Gap Register

[VARIABLE: gap table — every incomplete, broken, or missing item]
<!-- This section is NEVER empty. If no gaps found, write:
     "No gaps or broken items identified in the scanned artifacts." -->

<!-- [FIXED] Next steps — exactly 3-5 items with effort estimates -->
## Next Steps

[VARIABLE: numbered list, each with effort tag [S/M/L/XL]]

<!-- [FIXED] Documentation audit summary — always last -->
## Documentation Audit

[VARIABLE: audit-checklist.md content for all items showcased]
```

---

### Template 2: `demo-showcase.md`

```markdown
<!-- [FIXED] Demo showcase output format -->
---
generated: [VARIABLE: ISO date]
mode: demo-showcase
project: [VARIABLE: project name]
capabilities: [VARIABLE: count]
ready: [VARIABLE: count]
audience: [VARIABLE: user | developer | evaluator]
---

# [VARIABLE: Project Name] — Capability Demo

> [VARIABLE: One sentence: what this project enables a user to do]

<!-- [FIXED] Capability inventory always first -->
## Capability Inventory

[VARIABLE: inventory table with status badges]

<!-- [FIXED] Per-capability demo sections — one capability-card.md per item -->
## Capabilities

[VARIABLE: N × capability-card.md — ordered by status (READY first, BROKEN last)]

<!-- [FIXED] Integration demos — present only if include_chains = true or natural chains exist -->
## Integration Demos

[VARIABLE: pipeline demo sections — omit section entirely if no chains]

<!-- [FIXED] Audit summary always last -->
## Documentation Audit

[VARIABLE: audit-checklist.md content]
```

---

### Template 3: `capability-card.md`

```markdown
<!-- [FIXED] Capability card — one per capability in demo-showcase -->
### [VARIABLE: Capability Name] [VARIABLE: status badge]

<!-- [FIXED] One-sentence description — no hedging, active voice -->
[VARIABLE: What it does in one sentence.]

<!-- [FIXED] Invocation block — must be copy-pasteable -->
**How to invoke:**
```
[VARIABLE: exact prompt or command]
```

<!-- [FIXED] Example I/O block -->
**Example:**

Input: [VARIABLE: real input description or artifact reference]

```[VARIABLE: language]
[VARIABLE: real example output — mark ILLUSTRATIVE if not actual output]
```

<!-- [FIXED] Edge case — one failure mode shown -->
**Edge case:** [VARIABLE: describe the edge scenario]
> [VARIABLE: show what the system outputs on failure — never "it handles this gracefully"]

<!-- [FIXED] Try it prompt — copy-pasteable -->
> **Try it:** [VARIABLE: exact prompt the reader can paste to invoke this capability]

---
```

---

### Template 4: `metrics-dashboard.md`

```markdown
<!-- [FIXED] Metrics dashboard — used in report-showcase -->
| Metric | Value | Source |
|--------|-------|--------|
| Files created | [VARIABLE: N or NO DATA] | [VARIABLE: report file] |
| Files modified | [VARIABLE: N or NO DATA] | [VARIABLE: report file] |
| Tests written | [VARIABLE: N or NO DATA] | [VARIABLE: report file] |
| Tests passing | [VARIABLE: N or NO DATA] | [VARIABLE: report file] |
| Tests failing | [VARIABLE: N or NO DATA] | [VARIABLE: report file] |
| Issues found | [VARIABLE: N or NO DATA] | [VARIABLE: report file] |
| Issues fixed | [VARIABLE: N or NO DATA] | [VARIABLE: report file] |
| Decisions made | [VARIABLE: N or NO DATA] | [VARIABLE: report file] |
| Commands succeeded | [VARIABLE: N or NO DATA] | [VARIABLE: report file] |
| Commands failed | [VARIABLE: N or NO DATA] | [VARIABLE: report file] |
| Time span covered | [VARIABLE: DATE to DATE or NO DATA] | [VARIABLE: report files] |

<!-- [FIXED] NO DATA is explicit — never estimate or leave blank -->
```

---

### Template 5: `audit-checklist.md`

```markdown
<!-- [FIXED] Documentation audit — used in both modes -->
| Capability / Item | Exists | README | Frontmatter | Invokable | Output OK | No Dead Refs | Status |
|-------------------|--------|--------|-------------|-----------|-----------|--------------|--------|
[VARIABLE: one row per capability/item audited]

<!-- [FIXED] Summary line -->
**Ready:** [N] / [total] &nbsp; **Untested:** [N] / [total] &nbsp;
**Incomplete:** [N] / [total] &nbsp; **Broken:** [N] / [total]

<!-- [FIXED] Action items from audit -->
**Audit actions required:**
[VARIABLE: bulleted list of specific fixes for BROKEN and INCOMPLETE items]
<!-- If all items pass: "No audit actions required." -->
```

---

## Verdict Logic

### Report Showcase Verdict

| Verdict | Condition |
|---------|-----------|
| `SHOWCASE-READY` | ≥ 1 real metric, timeline present, 0 `[BROKEN]` items in audit |
| `SHOWCASE-WITH-GAPS` | Timeline or metrics present, 1+ `[INCOMPLETE]` items |
| `DRAFT-ONLY` | No real metrics found, or >50% of items are `[BROKEN]` |

### Demo Showcase Verdict

| Verdict | Condition |
|---------|-----------|
| `DEMO-READY` | ≥ 50% capabilities are `[READY]`, 0 `[BROKEN]` |
| `DEMO-WITH-CAVEATS` | 1–2 `[BROKEN]` items, remainder `[READY]` or `[UNTESTED]` |
| `INVENTORY-ONLY` | >50% capabilities are `[BROKEN]` or `[INCOMPLETE]` — demo not runnable |

The verdict appears in the document header and in the audit summary. It is never softened.

---

## Quality Gate

### Must-Pass (structural)

- [ ] SKILL.md has valid YAML frontmatter: name, description, author, version
- [ ] `name` = `showcase-presenter` (lowercase-kebab-case)
- [ ] `description` >= 50 chars, includes all 9 trigger phrases
- [ ] SKILL.md body < 500 lines
- [ ] All 5 templates exist in `templates/`
- [ ] All template files have `[FIXED]` and `[VARIABLE]` annotations
- [ ] No hardcoded paths, API keys, or machine-specific values

### Should-Pass (content)

- [ ] Both modes have complete step-by-step procedures
- [ ] Documentation audit layer is defined independently of modes
- [ ] Anti-patterns table present in every major section
- [ ] Verdict logic table present
- [ ] Quick reference section at bottom
- [ ] `[NO DATA]` behavior explicitly specified (never estimate)
- [ ] `[BROKEN]` badge behavior explicitly specified (never hide)

### Check-If-Applicable

- [ ] README.md installation section includes Marp CLI setup (optional converter)
- [ ] At least one complete worked example for each mode
- [ ] metadata.json `tags` include: `presentation`, `documentation`, `showcase`, `audit`, `report`

---

## Anti-Patterns

| Do NOT | Instead |
|--------|---------|
| Invent metrics when data is absent | Write `[NO DATA]` — leave the field explicitly empty |
| Remove `[BROKEN]` items from the showcase | Keep them with their badge — honest audit is the product |
| Write vague executive summaries ("good progress") | Extract specific facts: what was built, which metric, what is next |
| Use placeholder examples (`foo`, `bar`, `example.com`) | Use real artifacts from the project or mark `ILLUSTRATIVE` |
| Produce the showcase without running the documentation audit | Audit is mandatory — it runs in both modes, always |
| Mark capabilities `[READY]` without verifying invocation | Mark `[UNTESTED]` if invocation was not confirmed |
| Write more than 5 next steps | Rank by impact and cut — more than 5 is a backlog, not next steps |
| Let the showcase feel like meeting notes | It is a product artifact — apply professional signals checklist |
| Skip the Y-Statement format for decisions | The format is mandatory — it forces the tradeoff to be named |
| Put architecture diagrams before the problem statement | Problem first. Always. Nobody cares about boxes until they understand the pain. |

---

## Professional Signals Checklist

Apply this checklist to the output before marking it complete. These are the signals
that separate a professional artifact from a side-project writeup.

**Specificity**
- [ ] Every metric has a number, a unit, and a source
- [ ] Every decision names the alternative that was rejected
- [ ] Every gap in the register has an effort estimate

**Honesty**
- [ ] Failures appear in the timeline, not just successes
- [ ] `[NO DATA]` is visible where data is absent
- [ ] `[BROKEN]` items are shown, not removed

**Language**
- [ ] Active voice throughout ("The bundler handles..." not "Namespace collisions are handled...")
- [ ] Present tense for what exists, past tense for what happened
- [ ] No hedging: "works" not "should work", "fixed" not "likely fixed"

**Structure**
- [ ] Executive summary is exactly 3 sentences
- [ ] Next steps are 3–5, each with an effort tag
- [ ] Audit summary table appears at the end of every document

---

## References Structure

| File | Content | When to read |
|------|---------|--------------|
| `references/professional-signals.md` | Full checklist from research — 20 credibility signals + anti-signals | Before reviewing output quality |
| `references/y-statement-guide.md` | Y-Statement format with examples from ADR research | When extracting decisions from reports |
| `references/marp-template.md` | Marp slide conversion template (optional export format) | If caller wants slides, not a document |
| `references/package-shapes.md` | Skill-forge package shape definitions | If uncertain about package structure |

---

## Integration Points

| Component | How showcase-presenter connects |
|-----------|--------------------------------|
| **skill-forge** | This design document is the input; skill-forge produces the package |
| **project-wiki** | Showcase documents can be ingested by project-wiki as wiki sections |
| **buildr-executor** | Morning reports and wave summaries from executor are primary Mode 1 inputs |
| **skill-creator** | After packaging, skill-creator runs eval loop against real report artifacts |
| **seo-article-audit** | Structural pattern borrowed: two-layer model (deterministic audit + judgment layer) |

---

## Quick Reference

For agents executing this skill:

```
MODE 1 (Report): reports → ingest → metrics → timeline → decisions →
                 gaps → executive summary → next steps → audit → assemble

MODE 2 (Demo):   skills → inventory → per-capability cards → chains →
                 audit → assemble

ALWAYS:          Run documentation audit. Apply badges. Never hide BROKEN items.

NEVER:           Invent metrics. Remove broken items. Write vague summaries.
                 Skip the Y-Statement format for decisions.
                 Mark READY without verifying invocation.

OUTPUT:          report-showcase.md OR demo-showcase.md
                 + metrics-dashboard.md (Mode 1)
                 + N × capability-card.md (Mode 2)
                 + audit-checklist.md (always)
```

---

## Decisions Made in This Design

### Why two modes instead of one

**Y-Statement:**
In the context of generating project showcases from heterogeneous inputs,
facing the need to serve both "what happened" and "how do I use it" audiences,
we decided to split into two modes (Report / Demo) over a single configurable mode,
to achieve clean separation between narrative and instructional output formats,
accepting that the caller must choose a mode rather than getting everything at once.

**Evidence:** The seo-article-audit skill's two-layer model (deterministic + judgment)
works because each layer has a single job. Blending them would produce output that
does both jobs poorly.

### Why the documentation audit is mandatory (not optional)

**Y-Statement:**
In the context of an AI system showcasing its own capabilities,
facing the risk of presenting broken or undocumented items as working,
we decided to make the audit mandatory in both modes over making it opt-in,
to achieve honest, trustworthy showcase output that surfaces real gaps,
accepting that some showcases will look worse (more BROKEN/INCOMPLETE badges) than
if gaps were hidden.

**Evidence:** Professional vs side-project signals research: "demo that 404s" and
"claims without evidence" are the top two signals that destroy credibility. A showcase
with visible [BROKEN] badges is more credible than one that hides them.

### Why [NO DATA] instead of estimated values

**Y-Statement:**
In the context of AI-generated metrics dashboards built from build logs,
facing the temptation to fill empty metric fields with plausible estimates,
we decided to require explicit [NO DATA] tags over filling with estimates,
to achieve a showcase that separates known facts from inference,
accepting that some dashboards will have sparse metrics if log coverage is thin.

**Evidence:** Research finding: "Claims without evidence: 'reduces errors by 90%'
with no citation or methodology" is an explicit side-project anti-signal.
Invented metrics are worse than no metrics.
