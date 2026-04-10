---
name: kb-document-factory
description: |
  Use when creating, updating, or compiling any document in the knowledge base.
  This skill governs article structure, format selection, quality enforcement,
  and cross-referencing for all three KB layers (domain, methods, components).
  Trigger on: "write a KB article", "add to the knowledge base", "compile this
  into the KB", "create a cheat sheet for X", "document this method", or any
  time raw knowledge needs to be structured into the KB.
author: Robin Westerlund
version: 1.0.0
---

# KB Document Factory

## Purpose

Every document in the knowledge base must feel like it was written by the same
senior expert — **meticulously structured**, **immediately actionable**, and
**consistently formatted** regardless of which agent produced it or when.

This skill is the production line. It takes raw knowledge and produces articles
that are simultaneously:

- **Scannable by humans** in Obsidian (dense, visual, table-driven)
- **Parseable by LLMs** for context injection (structured frontmatter, clear sections, predictable patterns)
- **Cross-referenced** into the broader KB graph (no orphans, no dead links)
- **Quality-verified** against the format template (no improvised structure)

**CRITICAL:** This skill must be consulted before writing ANY `.md` file in the
`knowledge-base/` directory. There are no exceptions. An article written without
this skill's guidance will be flagged by kb-linter and sent back for rewrite.

---

## Step 0: Read Before Writing

**MANDATORY.** Before writing any KB document:

1. Read this entire skill document
2. Read the matching template in `templates/` (this skill's directory)
3. If uncertain about format, consult the decision tree in Step 1

**Never** start writing an article from scratch. The template is your **literal
starting point** — copy it, then fill the variable sections. The fixed sections
(frontmatter structure, section headers, cross-reference block) stay untouched.

---

## Step 1: Classify the Knowledge

Determine what you're writing BEFORE choosing a format.

### Decision Tree

```
Is the knowledge...
│
├── A set of operations/patterns to look up quickly?
│   └── FORMAT: cheat-sheet
│       Use when: The reader (human or LLM) needs to find a specific
│       technique, command, or pattern without reading paragraphs.
│       Structure: 70%+ tables. Concept | What | How | Pitfalls columns.
│
├── A concept requiring explanation, context, and mental models?
│   └── FORMAT: reference-article
│       Use when: The knowledge needs WHY, not just WHAT.
│       Structure: Core concept → principles → patterns → decision framework.
│
├── The same task done differently across tools/stacks?
│   └── FORMAT: comparison-table
│       Use when: An agent (or human) must choose between approaches.
│       Structure: Operation rows × Tool columns. "When to choose" section.
│
├── A step-by-step procedure from start to finish?
│   └── FORMAT: method-guide
│       Use when: An agent must execute a workflow without clarification.
│       Structure: Purpose → steps (with inputs/outputs/decisions) → quality checks.
│
├── Pass/fail criteria for quality verification?
│   └── FORMAT: quality-gate
│       Use when: Defining what "done" or "good enough" means — measurably.
│       Structure: Categorized checklists with thresholds, not prose.
│
├── A reusable building block (code, config, module)?
│   └── FORMAT: component-spec
│       Use when: Documenting a drop-in component for project assembly.
│       Structure: What it provides → API → variants → compatibility.
│
├── Analytical findings, audit results, or research output?
│   └── FORMAT: report
│       Use when: Presenting findings with scoring, prioritization, action plan.
│       Structure: Executive summary → scores → findings → action plan → methodology.
│
└── An auto-maintained overview of a category?
    └── FORMAT: index
        Use when: Navigating a directory of articles. NEVER written manually.
        Structure: Coverage table → article list → thin areas → cross-layer refs.
```

### If Two Formats Seem Right

| Situation | Resolution |
|-----------|-----------|
| Cheat-sheet vs reference-article | If >60% of the content works as table rows → cheat-sheet. If you need paragraphs to explain WHY → reference-article. |
| Method-guide vs quality-gate | Method = how to DO the work. Gate = how to VERIFY the work. If it has steps with inputs/outputs → method. If it's a checklist of pass/fail → gate. |
| Reference-article vs comparison-table | If the core value is cross-stack comparison → comparison-table. If one approach dominates and alternatives are minor → reference-article with a comparison section. |
| Component-spec vs method-guide | Component = a THING you drop in. Method = a PROCESS you follow. If it has an API and version number → component. If it has steps → method. |

---

## Step 2: Establish the Document Philosophy

Before writing content, answer these three questions **in your head** (do not
include this in the article):

1. **Who will read this and when?**
   - LLM agent during a build → needs scannable tables, code examples, copy-paste patterns
   - LLM agent during planning → needs decision frameworks, trade-offs, prerequisites
   - Human reviewing in Obsidian → needs visual structure, clear hierarchy, quick scan
   - LLM during night shift → needs actionable next steps, not background theory

2. **What decision does this article enable?**
   - Every article must help someone DECIDE or DO something
   - If it doesn't enable a decision → it's background noise, not knowledge
   - The decision should be clear from the article title

3. **What is the MINIMUM the reader needs to extract value?**
   - First table or section should deliver value standalone
   - A reader who only reads the first 20% should still learn something actionable
   - This is not academic writing — it's operational reference material

---

## Step 3: Write Using the Template

### Fixed Zones (NEVER modify these)

Every article, regardless of format, has these fixed structural elements:

**Fixed: Frontmatter block**
```yaml
---
title: "[exact descriptive title]"
format: [format-name]
layer: [domain|methods|components]
category: "[directory path]"
status: [draft|review|confirmed|production|outdated|deprecated]
confidence: [low|medium|high]
last_verified: [YYYY-MM-DD]
tags: [searchable terms]
cross_refs: [related article slugs]
---
```

**CRITICAL:** Every frontmatter field must be filled. No empty fields. No
placeholder values. If `confidence` is unknown, it is `low`. If `last_verified`
is today, write today's date. If there are no cross-references yet, write the
slugs of articles that SHOULD exist and note them in `_system/evolution-queue.md`.

**Fixed: Title block**
```markdown
# [Title]

> One-line: [Single sentence describing what this article covers and when to use it]
```

The one-liner under the title is **mandatory**. It serves as the article's
elevator pitch — an LLM scanning index files uses this to decide whether to
read the full article.

**Fixed: Related section (at bottom)**
```markdown
## Related

- [[related-article-1]] — [Why it's related in ≤10 words]
- [[related-article-2]] — [Why it's related]
- Component: [[component-name]] — [What it provides]
- Quality gate: [[gate-name]] — [What it verifies]
```

Minimum two cross-references. No orphan articles.

### Variable Zones (format-specific)

The sections between the title block and the Related section are **variable** —
they follow the format template. See `templates/` in this skill directory for
the exact section structure per format.

---

## Step 4: Apply Craftsmanship Standards

These standards apply to EVERY article regardless of format. Read them. Apply
them. They are not suggestions.

### Tables Are First-Class

- **Cheat sheets:** 70%+ of content should be tables
- **Method guides:** Decision points as tables, not prose
- **All formats:** If information has 3+ parallel items with shared attributes → table

Table columns should follow this priority:

| For... | Use columns... |
|--------|---------------|
| Techniques/patterns | Concept \| What It Does \| How to Use \| Common Mistakes |
| Decisions | If you need... \| Use... \| Because... |
| Steps | Step \| Action \| Inputs \| Outputs \| Decision Point |
| Comparisons | Operation \| Tool A \| Tool B \| Tool C |
| Quality checks | Criterion \| Threshold \| How to Measure \| How to Fix |

### Anti-Patterns — NEVER Do These

**❌ NEVER write vague prose when a table works:**
```
There are several approaches to authentication. You could use JWT tokens,
which are stateless and scalable but have some drawbacks. Alternatively,
session-based auth stores state on the server...
```

**✅ INSTEAD write a comparison table:**
```
| Approach | Mechanism | Scalability | Tradeoff |
|----------|-----------|-------------|----------|
| JWT | Stateless token in cookie/header | High (no server state) | Can't revoke individual tokens |
| Session | Server-side state + session ID | Medium (needs session store) | Easy revocation, stateful |
| OAuth 2.0 | Delegated auth via provider | High | Dependency on provider uptime |
```

**❌ NEVER write articles that only describe without enabling action:**
```
Core Web Vitals are a set of metrics defined by Google that measure
user experience. They include LCP, FID, and CLS. These metrics are
important for SEO rankings.
```

**✅ INSTEAD write actionable reference:**
```
| Metric | What It Measures | Target | How to Fix When Failing |
|--------|-----------------|--------|------------------------|
| LCP | Largest visible element load time | < 2.5s | Preload hero image, use CDN, optimize server response |
| INP | Input delay responsiveness | < 200ms | Code-split JS, defer non-critical scripts, use web workers |
| CLS | Visual stability during load | < 0.1 | Set explicit image dimensions, avoid dynamic content injection above fold |
```

**❌ NEVER create orphan articles** (no cross-references)

**❌ NEVER skip frontmatter fields**

**❌ NEVER mark confidence as `high` without production evidence**

**❌ NEVER use prose for quality gates** — they are checklists with measurable thresholds

**❌ NEVER write method steps without inputs and outputs**

### Craftsmanship Markers

A well-crafted KB article has these properties. Check every article against
this list before marking it complete:

- [ ] **The one-liner under the title is specific enough to decide relevance without reading further**
- [ ] **The first section delivers standalone value** (a reader of only 20% still learns something)
- [ ] **Tables dominate over prose** for lookups, comparisons, and structured data
- [ ] **Every table has consistent columns** (no mixed formats within one table)
- [ ] **Code examples are copy-pasteable** (no pseudo-code unless explicitly labeled)
- [ ] **Cross-references link to real articles** (or are noted as forward-references in evolution-queue)
- [ ] **Anti-patterns are stated** — what NOT to do, not just what to do
- [ ] **Confidence level is honest** — `low` is not shameful, `high` without evidence is
- [ ] **Status is accurate** — new articles are `draft`, not `confirmed`
- [ ] **The article enables a decision or action** — if it doesn't, it's not ready

### Quality Is Stated, Not Implied

Just like the algorithmic-art skill repeats "meticulously crafted" and
"master-level implementation," every KB article should **make its quality
commitment explicit** in the craftsmanship of its structure. The structure
IS the quality signal:

- Dense tables → signals "this is scannable, not fluffy"
- Measurable thresholds → signals "this is verifiable, not subjective"
- Cross-references → signals "this is connected, not isolated"
- Anti-patterns → signals "we've learned from mistakes, not just theory"
- Status + confidence → signals "we're honest about what we know"

---

## Step 5: Verify and Integrate

After writing the article:

### Verification Checklist

- [ ] Frontmatter is complete (all fields filled, no placeholders)
- [ ] Format matches knowledge type (re-check decision tree)
- [ ] Template structure followed (fixed zones untouched)
- [ ] At least 2 cross-references to other KB articles
- [ ] All cross-referenced articles exist (or forward-references logged)
- [ ] Tables used where possible (70%+ for cheat-sheets)
- [ ] Anti-patterns stated (at least one "don't do this")
- [ ] Code examples are copy-pasteable
- [ ] One-liner summary is specific and useful
- [ ] First section delivers standalone value

### Integration Steps

1. Save the article in the correct `knowledge-base/[layer]/[category]/` directory
2. Update the category `_index.md` (add the new article to the article table)
3. Update the layer `_index.md` (increment counts)
4. Update `knowledge-base/INDEX.md` if aggregate counts changed
5. Update `knowledge-base/_system/compilation-log.md`
6. Check if `_system/coverage-map.md` needs updating (new category? thin area filled?)
7. If cross-referenced articles don't exist yet, add them to `_system/evolution-queue.md`

---

## Format Quick Reference

For agents that already know the process and need a reminder:

| Format | Layer | Content Ratio | Key Sections | Template |
|--------|-------|--------------|--------------|----------|
| cheat-sheet | domain | 70% tables, 20% quick-ref, 10% prose | Sections by concept area → tables → quick reference → related | `templates/cheat-sheet.md` |
| reference-article | domain | 40% prose, 40% tables, 20% examples | Core concept → principles → patterns → decision framework → open questions | `templates/reference-article.md` |
| comparison-table | domain | 80% tables, 20% guidance | Operation tables per category → "when to choose" → migration notes | `templates/comparison-table.md` |
| method-guide | methods | 50% steps, 30% tables, 20% checks | Purpose → when to use → steps (action/inputs/outputs) → quality checks → failures | `templates/method-guide.md` |
| quality-gate | methods | 90% checklists, 10% criteria | Categorized checklists → pass criteria → verification method → exceptions | `templates/quality-gate.md` |
| component-spec | components | 40% specs, 30% code, 30% tables | What it provides → install → config → API → variants → testing → changelog | `templates/component-spec.md` |
| report | varies | 30% tables, 30% findings, 20% actions, 20% summary | Executive summary → scores → findings → action plan → methodology | `templates/report.md` |
| index | all | 80% tables, 20% notes | Coverage → articles → recent changes → thin areas → cross-layer refs | `templates/index.md` |

---

## LLM Efficiency Patterns

These patterns make KB documents maximally useful when injected into an agent's
context window:

### Pattern 1: Front-loaded value

The most important information comes first in every section. An LLM that reads
only the first 3 lines of each section should still extract the core knowledge.
This means:
- Tables before explanations
- Recommendations before analysis
- Actions before rationale

### Pattern 2: Predictable structure

All articles of the same format have identical section ordering. An LLM that
has read one cheat-sheet knows exactly where to find the quick reference section
in any other cheat-sheet. This means:
- Never reorder template sections
- Never rename template headers
- Never add sections between fixed zones

### Pattern 3: Explicit over implicit

Never assume the reading LLM has context from other articles. Each article must:
- Define terms on first use (or link to the definition)
- State prerequisites explicitly
- Include enough context to be useful standalone

### Pattern 4: Scannable markers

Use consistent formatting to mark different types of content:
- `**CRITICAL:**` for non-negotiable requirements
- `**NOTE:**` for contextual information
- `⚠️` for warnings about common mistakes
- `✅` / `❌` for correct/incorrect patterns
- `→` for "leads to" or "results in" relationships

### Pattern 5: Semantic density

Every sentence should either:
1. State a fact
2. Enable a decision
3. Provide an example
4. Warn about a mistake

If a sentence does none of these, delete it. KB articles are not essays.

---

## Notes

- This skill should be loaded into every agent session that writes to `knowledge-base/`
- The templates in this skill's `templates/` directory are the authoritative versions — if they differ from `knowledge-base/_templates/`, this skill's versions take precedence
- When in doubt about format: default to **cheat-sheet** for domain knowledge, **method-guide** for methods, **component-spec** for components
- Articles can be promoted to higher confidence levels only by Robin or by production evidence documented in the article itself
