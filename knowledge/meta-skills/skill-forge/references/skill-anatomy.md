# Skill Anatomy — What Makes a Good Skill

> **When to read this:** During AUTHOR, when you need guidance on craftsmanship standards.

---

## The 200k Standard

Every skill must meet this bar: if dropped into a 200,000-token context window
alongside dozens of other skills, it must still be **actionable**, **executable**,
**drop-in**, and **measurable**.

| Criterion | What it means | Test |
|-----------|---------------|------|
| **Actionable** | The agent knows exactly what to do | Read the skill: can you list the concrete steps? |
| **Executable** | The agent can do it without asking clarifying questions | Follow the steps: do you get stuck? |
| **Drop-in** | No setup beyond reading the skill and its declared dependencies | Check: are there undeclared prerequisites? |
| **Measurable** | The agent knows when it is done and whether it succeeded | Check: are there verification steps with pass/fail criteria? |

A skill that is interesting but not actionable is an article.
A skill that is actionable but not executable is a wish list.
A skill that is executable but not drop-in is a locked feature.
A skill that is drop-in but not measurable is a guess.

---

## Progressive Disclosure — Three Levels

Good skills reveal information at three depths. An agent reads deeper only
when it needs more detail.

### Level 1: Metadata (~50-150 words)

The frontmatter `description` field. This is what the skill-engine resolver
reads when deciding whether to select this skill.

**What belongs here:**
- What the skill does (one sentence)
- When to use it (trigger conditions)
- What it produces (output type)

**What does NOT belong here:**
- How the skill works
- Implementation details
- Prerequisites or setup

```yaml
# Good — tells the resolver WHEN and WHAT
description: |
  Drafts structured deal memos from term sheets and negotiation notes.
  Use when closing a deal, preparing board materials, or documenting
  agreed terms. Trigger on: "draft deal memo", "summarize terms",
  "create term summary". Produces a markdown document with standard
  sections: parties, terms, conditions, timeline, signatures.

# Bad — tells the resolver nothing useful
description: |
  A skill for deal memos. It helps with deals and memos. Very useful
  for business contexts where memos are needed.
```

### Level 2: SKILL.md Body (100-500 lines)

The core workflow. An agent reading only SKILL.md must be able to execute
the skill from start to finish for the common case.

**What belongs here:**
- Step-by-step workflow
- Decision tables for common branches
- Key anti-patterns
- Inline examples for ambiguous rules
- Verification checklist

**What does NOT belong here:**
- Deep-dive theory (move to references/)
- Exhaustive edge cases (move to references/)
- Complete worked examples (move to examples/)
- Reusable output structures (move to templates/)

### Level 3: Reference Files (unbounded)

Deep-dive documents that an agent reads on demand when it hits a specific
sub-problem.

**What belongs here:**
- Specialized topics that exceed 30 lines
- Domain-specific knowledge that not every execution needs
- Disambiguation guides for complex choices
- Historical context or rationale

**Gate:** Every reference file starts with `> **When to read this:** [specific condition]`.
If you cannot write a specific condition, the content belongs in SKILL.md, not in
a reference file.

---

## Description Writing and Trigger Optimization

The `description` field is the single most important piece of text in a skill.
It determines whether the skill-engine resolver selects this skill for a task.

### Be "Pushy"

A pushy description actively tells agents when to activate. A passive description
waits to be found.

| Passive (bad) | Pushy (good) |
|---------------|-------------|
| "Helps with code reviews" | "Use when reviewing pull requests, auditing code quality, or preparing merge feedback. Trigger on: 'review this PR', 'code review', 'is this ready to merge'." |
| "A tool for data analysis" | "Analyzes datasets to find patterns, anomalies, and summary statistics. Use when exploring unfamiliar data, validating data quality, or preparing analysis reports. Trigger on: 'analyze this data', 'what patterns are in this', 'data quality check'." |
| "Manages project tasks" | "Creates, tracks, and prioritizes project tasks with dependency resolution. Use when starting a project, breaking down a milestone, or rebalancing workload. Trigger on: 'plan tasks', 'what should I work on next', 'break this down'." |

### Trigger Phrase Rules

| Rule | Example |
|------|---------|
| Use the user's words, not technical jargon | "review this PR" not "execute code-review subroutine" |
| Include 3-5 trigger phrases | Enough variety to catch different phrasings |
| Include at least one verb phrase | "draft deal memo", "analyze data", "review code" |
| Include at least one noun phrase | "deal memo", "code review", "data pipeline" |
| Cover the "also use when" case | Edge triggers that are less obvious but valid |

---

## Imperative Form

Skills are instructions, not essays. Use imperative form throughout.

| Passive/advisory (bad) | Imperative (good) |
|------------------------|-------------------|
| "You should read the input file first" | "Read the input file" |
| "It's a good idea to validate the schema" | "Validate the schema before processing" |
| "The agent might want to check permissions" | "Check permissions. If insufficient, escalate" |
| "One approach is to split the file" | "Split the file into sections of 100 lines or fewer" |
| "Consider using a table format" | "Format as a table with columns: Name, Type, Required" |

**Exception:** Use conditional form for genuine choices: "If the dataset exceeds
1000 rows, sample first. Otherwise, process in full."

---

## Tables Over Prose

If information has 3 or more parallel items with shared attributes, use a table.
Tables are scannable. Prose buries structure.

### Before (prose)

```markdown
When choosing a format, consider the following. JSON is good for machine
consumption and works well with APIs. YAML is more human-readable and is
preferred for configuration files. TOML is similar to YAML but has clearer
semantics for nested structures. Markdown is the best choice when the output
will be read by humans directly.
```

### After (table)

```markdown
| Format | Best for | Avoid when |
|--------|----------|------------|
| JSON | Machine consumption, API payloads | Humans need to edit it frequently |
| YAML | Configuration files, human-editable data | Deep nesting (> 4 levels) |
| TOML | Flat or shallow config with clear types | Complex nested hierarchies |
| Markdown | Human-readable documents, reports | Machine parsing is the primary use |
```

### When to use tables

| Situation | Use |
|-----------|-----|
| 3+ items with shared attributes | Table |
| Decision with 3+ branches | Decision table (If / Then / Because) |
| Step-by-step with parallel metadata | Table (Step / Action / Output / Verify) |
| 2 items with narrative explanation | Prose (table overhead not worth it) |
| Single item with many attributes | Definition list or nested bullets |

---

## Front-Loaded Value

Every section in a skill must deliver its most important content first. An agent
that reads only the first 20% of a section should learn something actionable.

### Structure: Answer first, then explain

```markdown
## Choosing the Output Format

Use JSON for API payloads, YAML for config files, Markdown for human-readable
documents.

| Format | Best for | ...
```

Not:

```markdown
## Choosing the Output Format

Output format selection is an important consideration in any skill that produces
files. There are several factors to weigh, including the target audience, the
downstream consumption pattern, and the editing workflow. Let's examine each
format in turn and discuss its strengths and weaknesses.

JSON was originally designed for...
```

### The 3-sentence rule

The first 3 sentences of any section must contain:
1. The answer or action (what to do)
2. The most common case (the default path)
3. A pointer to exceptions (where to find edge cases)

---

## Cross-References and Forward-References

Skills live in an ecosystem. Good skills connect to related skills, reference
files, and templates without creating circular dependencies.

### Cross-reference format

```markdown
For the full verification checklist, see `references/quality-gate.md`.
```

Always use relative paths from the skill root. Never use absolute paths.

### Forward-reference format

```markdown
After completing this step, the skill can be handed off to
**skill-creator** for eval/iterate testing (see `skill-creator/SKILL.md`).
```

### Rules

| Rule | Reason |
|------|--------|
| Reference files by relative path from skill root | Portable across installations |
| Name the file, not just the concept | "See `references/quality-gate.md`" not "see the quality gate" |
| Cross-reference, do not duplicate | If two files explain the same thing, one references the other |
| Forward-references are optional, not blocking | The current step must be completable without following the forward-reference |
| Never create circular required-references | A -> B -> A means neither is self-contained |

---

## Worked Examples vs. Placeholder Examples

Worked examples are complete, real, and usable. Placeholder examples are stubs
that gesture at what the output might look like.

### Placeholder (bad)

```markdown
## Example

Here is an example of a deal memo:

# Deal Memo
[Insert deal details here]
## Terms
[Insert terms here]
```

### Worked Example (good)

```markdown
## Example: SaaS License Agreement — Acme Corp

# Deal Memo — Acme Corp SaaS License

**Parties:** Acme Corp (Buyer) / CloudTools Inc (Seller)
**Date:** 2025-03-15
**Status:** Draft — pending legal review

## Terms
| Term | Value | Notes |
|------|-------|-------|
| License type | Enterprise SaaS | Annual renewal |
| Seat count | 250 | With 10% overage buffer |
| Annual fee | $125,000 | Paid quarterly |
| Term | 3 years | Auto-renews unless 90-day notice |

## Conditions
1. SOC 2 Type II certification required before go-live
2. Data residency: EU only (Frankfurt region)
3. SLA: 99.9% uptime, 4-hour response for P1 incidents
...
```

### The test: Is the example usable?

Ask: "Could someone use this example as a starting point for a real task?"
If the answer is no, it is a placeholder. Rewrite it.

---

## Section Ordering

Order sections by frequency of use, not by logical sequence.

| Position | Content |
|----------|---------|
| First | The step the agent will do most often (the core workflow) |
| Second | The decision points that vary between executions |
| Third | Verification and quality checks |
| Fourth | Edge cases and advanced options |
| Last | Integration points and related skills |

**Exception:** If a prerequisite step must always come first (e.g., "Read this
file before proceeding"), place it before the core workflow with a clear MANDATORY
label.

---

## Line Count Discipline

| File | Target | Hard limit |
|------|--------|------------|
| SKILL.md body | 200-400 lines | 500 lines |
| README.md | 80-150 lines | 200 lines |
| Reference files | 100-300 lines | No hard limit (but split if > 400) |
| Template files | 30-100 lines | 200 lines |

When approaching the SKILL.md limit:
1. Identify the longest section
2. Extract it to `references/[topic].md`
3. Replace the section body with a 2-3 line summary and a pointer: "For the full guide, see `references/[topic].md`"
4. The remaining summary must still be actionable on its own
