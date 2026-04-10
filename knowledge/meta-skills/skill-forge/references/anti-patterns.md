# Anti-Patterns — Skill Authoring Mistakes

> **When to read this:** During AUTHOR and VERIFY, to catch common mistakes before they ship.

---

## How to Use This Catalogue

Each anti-pattern follows the same structure:

- **Name** — a memorable label
- **What goes wrong** — the concrete failure mode
- **Bad example** — what the mistake looks like
- **Good example** — what to do instead
- **Detection** — how to spot it during VERIFY

Read through all patterns before starting AUTHOR. During VERIFY, use the Detection
hints as a scan checklist.

---

## Anti-Pattern 1: Prose Where Tables Belong

**What goes wrong:** Information with parallel structure is buried in paragraphs.
Agents scan tables in milliseconds. Prose with the same content takes 10x longer
to parse and is easy to misread.

**Bad example:**
```markdown
## Output Formats

JSON is the best choice when the output will be consumed by machines or APIs.
It has strict syntax and supports nesting. YAML is better for human-editable
configuration files because it is more readable, but it can be tricky with
indentation. TOML works well for flat configuration and has clearer type
semantics than YAML. Use Markdown when the output is a document meant to be
read directly by humans.
```

**Good example:**
```markdown
## Output Formats

| Format | Best for | Avoid when | Gotchas |
|--------|----------|------------|---------|
| JSON | Machine consumption, APIs | Humans edit frequently | Trailing commas break parsing |
| YAML | Human-editable config | Deep nesting (> 4 levels) | Indentation errors are silent |
| TOML | Flat config, clear types | Complex nested hierarchies | Limited tooling support |
| Markdown | Human-readable documents | Machine parsing is primary | No schema enforcement |
```

**Detection:** Search for paragraphs that list 3+ items with shared attributes.
If you can draw a table from the paragraph, it should be a table.

---

## Anti-Pattern 2: "Be Smart" Rules

**What goes wrong:** Rules like "think carefully" or "use good judgment" are
untestable. An agent cannot verify whether it "thought carefully." These rules
add word count without adding value.

**Bad example:**
```markdown
## Rules

- Think carefully about the structure before writing
- Be smart about choosing the right format
- Try to make the output as good as possible
- Use your best judgment for edge cases
```

**Good example:**
```markdown
## Rules

- Produce a 3-step outline before writing the first section
- Choose the output format using the decision table in Step 2
- Verify the output against the checklist in Step 5 before declaring done
- For edge cases not covered by the decision table, default to JSON and document the reason
```

**Detection:** Search for: "think carefully", "be smart", "use judgment", "try to",
"as good as possible", "consider", "keep in mind". Replace each with a testable
imperative.

---

## Anti-Pattern 3: Missing Anti-Patterns Section

**What goes wrong:** The skill tells agents what to do but never what NOT to do.
Agents make the same mistakes repeatedly because the failure modes are undocumented.
Anti-patterns are as important as the happy path.

**Bad example:**
```markdown
## Writing the Summary

Write a summary that captures the key points of the document. Include the main
argument, supporting evidence, and conclusion.
```

**Good example:**
```markdown
## Writing the Summary

Write a summary that captures the key points: main argument, supporting evidence,
and conclusion. Keep to 3-5 sentences.

| Do NOT | Instead |
|--------|---------|
| Copy sentences verbatim from the source | Paraphrase in your own words |
| Include examples or anecdotes | Stick to claims and evidence |
| Add your own opinion or analysis | Report what the source says |
| Exceed 5 sentences | Compress further; cut the weakest point |
```

**Detection:** Check every major section (## heading). If it has steps or rules
but no anti-patterns, it is incomplete.

---

## Anti-Pattern 4: Buried Key Insight

**What goes wrong:** The most important information is in paragraph 3, after
setup, context, and history. Agents reading the first 20% of a section learn
nothing actionable.

**Bad example:**
```markdown
## Choosing the Package Shape

Package shapes evolved from early skill distribution formats. Originally, skills
were single files without structure. As the ecosystem grew, we found that some
skills needed templates, others needed examples, and a few needed automation
scripts. The community discussed several approaches before settling on the
current four-shape system.

The key decision factor is whether the skill generates structured output. If it
does, use Full shape. If it does not, use Standard.
```

**Good example:**
```markdown
## Choosing the Package Shape

Use Full shape if the skill generates structured output. Use Standard if it does
not. Default to Standard when uncertain.

For the complete decision tree with signals and examples, see
`references/package-shapes.md`.
```

**Detection:** Read only the first 3 sentences of each section. If you cannot
act on them, the key insight is buried.

---

## Anti-Pattern 5: Hardcoded Paths and Dependencies

**What goes wrong:** The skill references specific file paths, API endpoints,
or tool versions that are valid only on the author's machine or in one specific
project. The skill breaks everywhere else.

**Bad example:**
```markdown
## Setup

1. Open `/Users/robin/projects/my-app/config.yaml`
2. Set the API endpoint to `https://api.internal.company.com/v2`
3. Run `python3.11 /opt/scripts/validate.py`
```

**Good example:**
```markdown
## Setup

1. Open `[PROJECT_ROOT]/config.yaml`
2. Set the API endpoint to `[API_ENDPOINT]` (your target service URL)
3. Run `python3 [SCRIPT_DIR]/validate.py`

### Required Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `[PROJECT_ROOT]` | Root directory of the target project | `/home/user/my-app` |
| `[API_ENDPOINT]` | Base URL for the target API | `https://api.example.com/v2` |
| `[SCRIPT_DIR]` | Directory containing skill scripts | `./scripts` |
```

**Detection:** Search for: `/Users/`, `/home/`, `C:\`, `localhost:`, specific
domain names, specific Python/Node/Rust versions. Each match is a hardcoded
dependency.

---

## Anti-Pattern 6: Description Without Trigger Phrases

**What goes wrong:** The description says what the skill is but never when to
use it. The skill-engine resolver cannot match the skill to tasks because
there are no activation signals.

**Bad example:**
```yaml
description: |
  A comprehensive skill for creating data pipelines. It covers ETL processes,
  data validation, and output formatting. Built for enterprise use cases.
```

**Good example:**
```yaml
description: |
  Builds data transformation pipelines from source to destination with validation
  at each stage. Use when ingesting data from external sources, migrating between
  databases, or setting up recurring ETL jobs. Trigger on: "build a pipeline",
  "transform this data", "ETL job", "data migration". Also use when an existing
  pipeline needs new validation stages or format converters.
```

**Detection:** Search the description for "Use when", "Trigger on", or "Also use
when". If none are present, trigger phrases are missing.

---

## Anti-Pattern 7: Prose Quality Gates

**What goes wrong:** Verification steps are described in paragraph form instead
of a checklist. Agents skip items because there is no clear list to iterate
through. Prose gates are also impossible to automate.

**Bad example:**
```markdown
## Verification

Make sure the output looks correct. Check that the formatting is consistent and
that all sections are present. The content should be accurate and the tone
should match the target audience. Also verify that no placeholder text remains
and that all links work.
```

**Good example:**
```markdown
## Verification

- [ ] All sections from the template are present
- [ ] No placeholder text remains (`[TODO]`, `[INSERT]`, `[EXAMPLE]`)
- [ ] Formatting is consistent (heading levels, list styles, table alignment)
- [ ] All internal links resolve to existing files
- [ ] Tone matches target audience (formal for enterprise, casual for developer)
- [ ] Content accuracy: claims are sourced or marked as assumptions
```

**Detection:** Search for verification/quality/check sections. If they contain
paragraphs instead of checklists (`- [ ]` items), convert them.

---

## Anti-Pattern 8: Monolithic SKILL.md

**What goes wrong:** Everything is crammed into SKILL.md. The file exceeds 500
lines, or it stays under 500 by being superficial. Specialized sub-topics get
just a sentence when they need a page.

**Bad example:**
```
skill-name/
└── SKILL.md    (680 lines — domain theory, workflow, templates, examples, all inline)
```

**Good example:**
```
skill-name/
├── SKILL.md           (340 lines — core workflow with pointers to depth)
├── README.md
├── metadata.json
├── templates/
│   └── output.md      (structured output template)
├── examples/
│   └── worked-example/ (complete real example)
└── references/
    ├── domain-guide.md (deep-dive on domain concepts)
    └── edge-cases.md   (uncommon but documented scenarios)
```

**Detection:** Count SKILL.md lines. If > 400, identify sections that can be
extracted. If any section exceeds 40 lines of specialized content, it belongs
in references/.

---

## Anti-Pattern 9: Templates Without Fixed/Variable Annotations

**What goes wrong:** Templates look like finished documents instead of
fill-in-the-blank structures. Agents do not know which parts to keep and which
to replace. They either change everything (losing structure) or change nothing
(producing the template verbatim).

**Bad example:**
```markdown
# Project Report

## Executive Summary

This report covers the quarterly results for the engineering team. Key
highlights include the successful launch of the new API and the migration
to cloud infrastructure.

## Metrics

| Metric | Value |
|--------|-------|
| Uptime | 99.9% |
| Response time | 45ms |
```

**Good example:**
```markdown
<!-- [FIXED] Structure and section order -->
# [VARIABLE: Report Title]

## Executive Summary

<!-- [VARIABLE] 2-4 sentences covering: scope, time period, key highlights -->

## Metrics

<!-- [FIXED] Table structure — columns are fixed, rows are variable -->
| Metric | Value | Trend | Notes |
|--------|-------|-------|-------|
| [VARIABLE: metric name] | [VARIABLE: current value] | [VARIABLE: up/down/flat] | [VARIABLE: context if notable] |
```

**Detection:** Open each template file. Search for `[FIXED]` and `[VARIABLE]`
annotations. If neither is present, the template is unannotated. Check if any
content is clearly example-specific (names, dates, specific numbers) without
being marked as VARIABLE.

---

## Anti-Pattern 10: Placeholder Examples Instead of Worked Examples

**What goes wrong:** Examples use `[insert here]` stubs instead of real content.
They show the structure but not the substance. Agents cannot learn what "good
output" looks like from a skeleton.

**Bad example:**
```markdown
## Example Output

# [Title]

## Summary
[Write summary here]

## Key Findings
- [Finding 1]
- [Finding 2]
- [Finding 3]
```

**Good example:**
```markdown
## Example Output: Q4 Engineering Retrospective

# Q4 2025 Engineering Retrospective

## Summary
The team shipped 3 major features (auth overhaul, real-time sync, and billing
v2) while reducing incident response time by 40%. Technical debt decreased
from 23% to 18% of sprint capacity. The auth overhaul took 2 weeks longer
than estimated due to an undocumented OAuth provider limitation.

## Key Findings
- Auth overhaul delay was caused by undocumented rate limits on the OAuth
  provider's token refresh endpoint. Mitigation: added provider capability
  probing to the onboarding checklist.
- Real-time sync achieved 50ms P99 latency (target was 100ms) by using
  delta compression instead of full-state transfer.
- Billing v2 migration had zero data loss across 12,000 customer records
  due to the dry-run verification step added in sprint 3.
```

**Detection:** Search examples for `[insert]`, `[TODO]`, `[your text here]`,
or similar placeholder markers. Also check: if you removed the brackets, would
the content be meaningful? If not, it is a placeholder.

---

## Anti-Pattern 11: Inconsistent Terminology

**What goes wrong:** The same concept is called different things in different
parts of the skill. "Package shape" in Step 2 becomes "skill format" in Step 4
and "bundle type" in the README. Agents treat them as three different concepts.

**Bad example:**
```markdown
## Step 2: Choose the package shape
...determine which shape fits...

## Step 4: Author the skill format
...based on the format you selected...

## README
...configure the bundle type in metadata.json...
```

**Good example:**
```markdown
## Step 2: Choose the package shape
...determine which shape fits...

## Step 4: Author the package
...based on the shape you selected in Step 2...

## README
...the package shape is declared in metadata.json...
```

**Detection:** List every key concept in the skill. Search for synonyms. If the
same concept has two or more names, pick one and use it everywhere.

---

## Anti-Pattern 12: No Verification Steps

**What goes wrong:** The skill describes how to produce output but never how to
check whether the output is correct. Without verification, agents declare "done"
without evidence.

**Bad example:**
```markdown
## Steps
1. Read the input document
2. Extract key themes
3. Write the summary
4. Done!
```

**Good example:**
```markdown
## Steps
1. Read the input document
2. Extract key themes (minimum 3, maximum 7)
3. Write the summary (3-5 sentences, one per theme)
4. Verify:
   - [ ] Summary contains 3-5 sentences
   - [ ] Each sentence maps to an extracted theme
   - [ ] No information appears that is not in the source document
   - [ ] Summary is understandable without reading the source
```

**Detection:** Search for a verification/check/validate section. If the skill
has Steps but no verification, it is incomplete.

---

## Anti-Pattern 13: Wall of Bullets

**What goes wrong:** A section has 15+ bullet points with no grouping or
hierarchy. The agent processes them linearly but cannot prioritize. Important
items drown alongside trivial ones.

**Bad example:**
```markdown
## Guidelines
- Use clear language
- Keep files small
- Test before shipping
- Use imperative form
- Include examples
- Add anti-patterns
- Follow naming conventions
- Keep under 500 lines
- Use tables for parallel items
- Front-load key insights
- Declare dependencies
- Add trigger phrases
- Write verification steps
- Use Fixed/Variable annotations
- Include a README for Standard+ shapes
```

**Good example:**
```markdown
## Guidelines

### Structure (must-pass)
| Rule | Verification |
|------|-------------|
| Keep SKILL.md under 500 lines | Line count |
| Follow naming conventions (lowercase-kebab-case) | Regex check |
| Declare all dependencies in metadata.json | Cross-reference |
| Include README for Standard+ shapes | File presence |

### Content (should-pass)
| Rule | Verification |
|------|-------------|
| Use imperative form throughout | Scan for passive voice |
| Use tables for 3+ parallel items | Visual scan |
| Include anti-patterns per major section | Section audit |
| Front-load key insights (first 3 sentences) | Read first paragraph |
| Include worked examples for ambiguous rules | Spot check |

### Marketplace (check-if-applicable)
| Rule | Verification |
|------|-------------|
| Add trigger phrases to description | String search |
| Write verification steps with pass/fail criteria | Checklist format check |
| Use Fixed/Variable annotations in templates | Marker search |
```

**Detection:** Count consecutive bullet points. If > 8 without a sub-heading or
grouping, break them into categorized tables or sub-sections.

---

## Quick Reference: All Anti-Patterns

| # | Name | Core failure | Detection keyword |
|---|------|-------------|-------------------|
| 1 | Prose Where Tables Belong | Structure hidden in paragraphs | 3+ items, shared attributes, in prose |
| 2 | "Be Smart" Rules | Untestable directives | "think carefully", "be smart", "try to" |
| 3 | Missing Anti-Patterns | No failure mode documentation | Major section without "do NOT" |
| 4 | Buried Key Insight | Actionable info after paragraph 3 | First 3 sentences not actionable |
| 5 | Hardcoded Paths | Machine-specific references | `/Users/`, `C:\`, `localhost:` |
| 6 | Description Without Triggers | Resolver cannot match the skill | No "Use when", "Trigger on" |
| 7 | Prose Quality Gates | Verification as paragraphs | Check section without `- [ ]` items |
| 8 | Monolithic SKILL.md | Everything in one file | SKILL.md > 400 lines or > 40-line sections |
| 9 | Unannotated Templates | No Fixed/Variable markers | Template without `[FIXED]`/`[VARIABLE]` |
| 10 | Placeholder Examples | Stubs instead of real content | `[insert]`, `[TODO]`, `[your text here]` |
| 11 | Inconsistent Terminology | Same concept, different names | Key concept has 2+ labels |
| 12 | No Verification Steps | No way to check output quality | Steps without verify/check section |
| 13 | Wall of Bullets | 15+ unstructured bullet points | > 8 consecutive bullets, no grouping |
