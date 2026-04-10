---
name: skill-forge
description: |
  Production line for creating marketplace-ready agent skill packages from any
  codebase or domain. Use when creating a new skill from scratch, converting a
  workflow into a distributable skill, or packaging an existing prototype for
  distribution. Trigger on: "forge a skill", "create a skill package", "build
  a skill from this codebase", "turn this into a marketplace skill", "skill-forge",
  or any request to produce a structured, distributable skill from knowledge or code.
  Also use when a skill exists but needs to be restructured to commercial standard.
author: Robin Westerlund
version: 1.0.0
---

# Skill Forge

## Purpose

Skill Forge is the production line that turns raw knowledge, codebases, or workflows
into complete, marketplace-ready skill packages. Every package that exits the forge
is structurally sound, consistently formatted, and ready for distribution.

**skill-forge** authors the package (structure, content, templates, metadata).
**skill-creator** tests and iterates the package (evals, benchmarks, A/B comparison).
They are sequential: forge first, then optionally hand off to skill-creator.

---

## Step 0: Read Before Forging

**MANDATORY.** Before forging any skill:

1. Read this entire SKILL.md
2. Read the template matching the file you are about to write (in `templates/`)
3. If uncertain about package shape, read `references/package-shapes.md`

**Never** start from scratch. The templates are your literal starting points.
Copy the template, fill the Variable zones, preserve the Fixed zones exactly.

---

## Step 1: ANALYZE

**Action:** Explore the target source to understand what the skill should do.

**Inputs:** User's description + one of: codebase path, domain references, existing workflow, or raw knowledge.

**Outputs:** Internal analysis (not saved) covering:

| Extract | How |
|---------|-----|
| Core workflow | What does the user actually do, step by step? |
| Decision points | Where do choices diverge? (These become tables) |
| Patterns | What repeats? (These become templates or examples) |
| Trigger phrases | What would a user say to invoke this skill? |
| Output format | What does the skill produce? (files, text, config, code) |
| Dependencies | What tools, APIs, or resources does the skill need? |
| What varies vs. what is fixed | This maps directly to Fixed/Variable zones later |

### If the source is a codebase

```
1. Read directory structure — identify key files
2. Read entry points and main modules
3. Extract the workflow: input → processing → output
4. Identify reusable patterns (these become templates)
5. Note dependencies and configuration
```

### If the source is a domain / raw knowledge

```
1. Interview the user: what is the procedure?
2. Identify the steps, decisions, and verification points
3. Ask for examples of good and bad output
4. Note what an expert knows that a beginner doesn't (this is the skill's value)
```

### If the source is an existing prototype skill

```
1. Read the existing skill fully
2. Identify structural gaps (missing frontmatter, no anti-patterns, prose where tables belong)
3. Note what works and should be preserved
4. Map current structure to the target package shape
```

---

## Step 2: CLASSIFY

**Action:** Determine the package shape. This decides what files to create.

```
Is the skill...
|
+-- A single procedure with no generated output?
|   --> MINIMAL: SKILL.md only
|       Signal: well-understood domain, narrow scope, no templates needed
|       Examples: brand-guidelines, code-review-checklist
|
+-- Something others will install and need to understand?
|   --> STANDARD: SKILL.md + README.md + metadata.json
|       Signal: shared across projects, needs installation guide
|       Examples: deal-memo-drafting, panning-for-gold
|
+-- A skill that generates structured output from templates?
|   --> FULL: + templates/ + examples/ + references/
|       Signal: output has predictable structure, multiple variants exist
|       Examples: kb-document-factory, chart-visualization
|
+-- A skill with automation, visual output, or testable pipelines?
    --> PRODUCTION: + scripts/ + assets/ + evals/
        Signal: deterministic steps that code handles better than prose
        Examples: data-pipeline-builder, frontend-component-generator
```

### If two shapes seem right

| Situation | Resolution |
|-----------|-----------|
| Minimal vs Standard | If anyone besides you will use it --> Standard |
| Standard vs Full | If the skill's output has repeating structure --> Full |
| Full vs Production | If any step is purely mechanical --> Production (add scripts/) |

### Default: Standard

When in doubt, choose Standard. You can always promote later. Demoting is harder
because users may depend on files you remove.

---

## Step 3: SCAFFOLD

**Action:** Create the directory structure and empty files from templates.

### File manifest by shape

| Shape | Files to create |
|-------|----------------|
| **Minimal** | `SKILL.md` |
| **Standard** | `SKILL.md`, `README.md`, `metadata.json` |
| **Full** | Standard + `templates/`, `examples/`, `references/` |
| **Production** | Full + `scripts/`, `assets/`, `evals/evals.json` |

### For each file

1. Copy the matching template from this skill's `templates/` directory
2. The template has `<!-- [FIXED] -->` and `<!-- [VARIABLE] -->` annotations
3. Keep all FIXED zones exactly as they are
4. Replace all VARIABLE zones with content from your ANALYZE step

---

## Step 4: AUTHOR

**Action:** Write every file in the package using craftsmanship standards.

### 4.1 Writing SKILL.md

Use `templates/skill-md.md` as your starting point.

**Frontmatter rules:**
- `name`: lowercase-kebab-case, stable (never change after publication)
- `description`: >= 50 characters. Must include trigger phrases. Be "pushy" —
  tell agents WHEN to use this, not just what it does. Include phrases like
  "Use when...", "Trigger on...", "Also use when..."
- `author`: Full name
- `version`: SemVer (start at 1.0.0)

**Body rules:**

| Rule | Why |
|------|-----|
| Tables over prose | If information has 3+ parallel items with shared attributes, use a table |
| Anti-patterns stated | Every major section needs at least one "do NOT do this" |
| Imperative form | "Read the file" not "You should read the file" |
| Examples for ambiguity | If a rule could be interpreted two ways, add a concrete example |
| Decision tables | Use `If... \| Then... \| Because...` tables for choices |
| First section standalone | A reader of only 20% should learn something actionable |
| Under 500 lines | If approaching the limit, extract to `references/` with a clear pointer |

**Anti-patterns in SKILL.md authoring:**

| Do NOT | Instead |
|--------|---------|
| Write vague prose for lookups | Use a table: Concept \| What \| How \| Pitfalls |
| Use "be smart" or "think carefully" | Write testable rules: "Produce a plan before code" |
| Bury the key insight in paragraph 3 | Front-load: most important content first in every section |
| Describe without enabling action | Every section must help someone DECIDE or DO something |
| Skip anti-patterns | State what goes wrong, not just what to do right |
| Hardcode paths or API keys | Use placeholders: `[PROJECT_ROOT]`, `[API_ENDPOINT]` |

### 4.2 Writing README.md

Use `templates/readme-md.md`. Required sections:

1. Title + one-liner
2. What It Does (2-3 sentences)
3. Supported Clients (Claude Code, Codex, Cursor, etc.)
4. Prerequisites
5. Installation
6. Trigger Conditions (bullet list)
7. Expected Outcome (what the user gets)
8. Files (table: File | Purpose)
9. Troubleshooting (minimum 2 entries)

### 4.3 Writing metadata.json

Use `templates/metadata-json.md` for the schema. All fields required:

```json
{
  "name": "Display Name",
  "description": "2-3 sentence description",
  "category": "skills",
  "author": { "name": "Full Name", "github": "handle" },
  "version": "1.0.0",
  "requires": { "open_brain": false, "services": [], "tools": [] },
  "tags": ["lowercase", "kebab-case", "searchable"],
  "difficulty": "beginner|intermediate|advanced",
  "estimated_time": "N minutes",
  "created": "YYYY-MM-DD",
  "updated": "YYYY-MM-DD"
}
```

### 4.4 Writing templates/ (Full+ shapes)

Each template file uses Fixed/Variable zone annotations:

```markdown
<!-- [FIXED] This structure never changes -->
# [VARIABLE: Title]

> [VARIABLE: One-liner description]

<!-- [VARIABLE] Content sections below -->
...

<!-- [FIXED] Related section — minimum 2 refs -->
## Related
```

**Template authoring rules:**
- Mark every line as either FIXED or VARIABLE
- FIXED zones define the structure that makes output consistent
- VARIABLE zones are what changes per use case
- Include column patterns for tables (e.g., `Concept | What | How | Pitfalls`)

### 4.5 Writing references/ (Full+ shapes)

One file per sub-topic that exceeds 30 lines of specialized content.

Every reference file must start with:
```markdown
# [Title]

> **When to read this:** [Specific condition — not "when you need more detail"]
```

### 4.6 Writing examples/ (Full+ shapes)

Provide at least one complete worked example. The example must:
- Be a real, usable skill (not a "hello world" placeholder)
- Follow all craftsmanship standards
- Pass the quality gate in `references/quality-gate.md`

### 4.7 Writing scripts/ (Production shape)

Scripts must:
- Execute standalone (no SKILL.md context required)
- Have a usage comment at the top
- Accept inputs as arguments, not hardcoded values
- Print clear output or write to a declared path

---

## Step 5: VERIFY

**Action:** Run the quality gate. Read `references/quality-gate.md` for the full
checklist. Inline summary below for quick use.

### Must-Pass (structural — failure = rewrite)

- [ ] SKILL.md has valid YAML frontmatter with name, description, author, version
- [ ] `name` is lowercase-kebab-case
- [ ] `description` >= 50 chars with trigger phrases
- [ ] SKILL.md body < 500 lines
- [ ] Every file referenced from SKILL.md exists in the package
- [ ] No hardcoded paths, API keys, or machine-specific values

### Should-Pass (content — failure = improve)

- [ ] First section delivers standalone value
- [ ] Tables used where 3+ parallel items share attributes
- [ ] At least one anti-pattern per major process section
- [ ] Examples for non-obvious patterns
- [ ] Imperative form throughout
- [ ] README Files table matches actual directory contents
- [ ] metadata.json `name` matches SKILL.md frontmatter `name`

### Check-If-Applicable (marketplace)

- [ ] README.md present (Standard+ shapes)
- [ ] metadata.json present (Standard+ shapes)
- [ ] Tags are relevant and searchable
- [ ] At least one worked example (Full+ shapes)

---

## Step 6: PACKAGE

**Action:** Final validation and distribution readiness.

1. Re-run the VERIFY checklist one final time
2. Confirm all files are saved and directory structure matches the shape
3. If `skill-creator` is available, recommend the user run the eval loop next:
   "The skill package is structurally complete. To test it against real prompts
   and iterate on quality, use skill-creator."

**Do NOT mark a skill as complete without showing evidence that VERIFY passed.**

---

## Integration Points

| Component | How skill-forge connects |
|-----------|------------------------|
| **skill-creator** | After PACKAGE, hand off for eval/iterate testing |
| **skill-engine** | Produced skills are compatible with INTAKE -> RESOLVE -> EVAL -> ADAPT -> VERIFY |
| **kb-document-factory** | If the skill produces KB documents, reference its templates |
| **skill-spec.md** | For skills that also need a short-skill entry in the resolver index |
| **explicit-skills.md** | After 3 successful uses, promote to permanent corpus |

---

## Quick Reference

For agents that already know the process:

```
ANALYZE    → Explore source, extract patterns, identify what varies vs. fixed
CLASSIFY   → Minimal / Standard / Full / Production (default: Standard)
SCAFFOLD   → Copy templates, create directory structure
AUTHOR     → Fill Variable zones, tables > prose, anti-patterns, imperative form
VERIFY     → Quality gate: structural must-pass, content should-pass
PACKAGE    → Final check, hand off to skill-creator for testing
```

---

## Notes

- This skill's `templates/` directory contains the authoritative templates
- When in doubt about shape: choose Standard, promote later
- English output for marketplace distribution (internal comments can be Swedish)
- skill-forge itself is a Full-shaped skill — it eats its own dog food
- After producing a skill, recommend but do not force the skill-creator eval loop
