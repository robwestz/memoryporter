# Quality Standard

> **When to read this:** Before marking any showcase output complete.
> This is the two-layer gate — structural first, narrative second.
> Output that passes structural but fails narrative is rewritten, not shipped.

---

## Two-Layer Gate

Every showcase document must pass both layers before being marked complete.

```
Layer 1: Structural gate  — pass/fail, no exceptions
Layer 2: Narrative gate   — checklist, judgment required
```

Pass Layer 1 first. Then run Layer 2. Failing Layer 1 makes Layer 2 irrelevant.

---

## Layer 1: Structural Gate (Must-Pass)

Failure on any item = rewrite. These are binary checks.

### SKILL.md Package

- [ ] SKILL.md has valid YAML frontmatter: `name`, `description`, `author`, `version`
- [ ] `name` is `showcase-presenter` (lowercase-kebab-case)
- [ ] `description` ≥ 50 chars and includes all trigger phrases from frontmatter
- [ ] SKILL.md body < 500 lines
- [ ] All 5 templates exist in `templates/`
- [ ] All template files have `<!-- [FIXED] -->` and `<!-- [VARIABLE] -->` annotations
- [ ] No hardcoded paths, API keys, or machine-specific values in any file

### Output Documents (report-showcase.md or demo-showcase.md)

- [ ] Frontmatter present and all fields populated (no `[VARIABLE]` placeholders remaining)
- [ ] Verdict is set and appears in both the header and the audit summary
- [ ] Executive summary is exactly 3 sentences (Mode 1) or one-sentence value proposition (Mode 2)
- [ ] Metrics dashboard is present with real values or explicit `[NO DATA]` tags (Mode 1)
- [ ] Audit checklist table is present at the end of the document (both modes)
- [ ] Audit summary counts (Ready / Untested / Incomplete / Broken) match the table rows
- [ ] No `<!-- [VARIABLE] -->` or `<!-- [FIXED] -->` comments remaining in output

---

## Layer 2: Narrative Gate (Checklist — Judgment Required)

These require judgment. An item that "technically passes" but feels like a checkbox
does not pass.

### Accuracy

| Check | Pass condition |
|-------|---------------|
| Metrics are from artifacts | Every number traces to a named source file |
| Decisions are real | Each Y-Statement describes a choice that actually happened |
| Examples are real or marked | Real output used, or `<!-- ILLUSTRATIVE -->` marker present |
| Gaps are complete | Every incomplete or broken item from the artifacts appears in the register |

### Language Quality

| Check | Pass condition |
|-------|---------------|
| Active voice | Less than 10% of sentences use passive voice |
| Present/past tense correct | Present for what exists now; past for what happened |
| No hedging | Zero occurrences of "might", "should work", "likely", "probably" |
| No placeholder language | Zero occurrences of "TBD", "TODO", "coming soon", "WIP" |

### Structure

| Check | Pass condition |
|-------|---------------|
| Sections in correct order | Metrics before narrative, audit last |
| Next steps are concrete | Each has action verb + deliverable + effort tag |
| Next steps count | 3–5 items, not more |
| Timeline has inflection points | First success, first failure, first recovery marked |
| Architecture section has diagrams | At least one Mermaid diagram if architecture is discussed |

### Honesty Signals

| Check | Pass condition |
|-------|---------------|
| Failures in timeline | At least one failure event if any occurred in the artifacts |
| `[NO DATA]` visible | Any missing metric is explicitly tagged |
| `[BROKEN]` items present | Broken capabilities appear in inventory and audit, not hidden |
| Verdict not softened | `DRAFT-ONLY` is not called "early-stage" |

---

## Verdict Derivation Checklist

Run this to determine the correct verdict before writing it into the document.

### Mode 1 — Report Showcase Verdict

```
1. Count real metrics (fields NOT tagged [NO DATA]):
   - If 0 real metrics → DRAFT-ONLY (stop here)

2. Check for timeline:
   - If no timeline → DRAFT-ONLY (stop here)

3. Count [BROKEN] items in audit:
   - If 0 BROKEN → check for INCOMPLETE

4. Count [INCOMPLETE] items:
   - If 0 BROKEN + 0 INCOMPLETE → SHOWCASE-READY
   - If 0 BROKEN + ≥1 INCOMPLETE → SHOWCASE-WITH-GAPS
   - If ≥1 BROKEN → SHOWCASE-WITH-GAPS (or DRAFT-ONLY if >50% broken)
```

### Mode 2 — Demo Showcase Verdict

```
1. Count total capabilities and READY capabilities:
   - ready_ratio = READY / total
   - If ready_ratio < 0.5 → INVENTORY-ONLY (stop here)

2. Count [BROKEN] items:
   - If 0 BROKEN → DEMO-READY
   - If 1–2 BROKEN and ready_ratio ≥ 0.5 → DEMO-WITH-CAVEATS
   - If >2 BROKEN → INVENTORY-ONLY
```

---

## When to Reject and Rewrite vs. When to Ship with Caveats

| Situation | Action |
|-----------|--------|
| Layer 1 structural failure | Rewrite — do not ship |
| Layer 2 fails on accuracy | Rewrite the specific section — do not ship the whole document |
| Layer 2 fails on language quality (isolated) | Fix in place — ship after fix |
| Verdict is `DRAFT-ONLY` | Ship as draft, label clearly — do not relabel |
| Verdict is `INVENTORY-ONLY` | Ship — the inventory IS the value; do not hide it |
| All checks pass but output feels thin | Review `references/anti-patterns.md` — do not ship feeling |
