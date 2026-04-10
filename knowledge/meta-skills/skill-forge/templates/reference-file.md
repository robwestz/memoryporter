<!-- ============================================================
     SKILL FORGE — REFERENCE FILE TEMPLATE

     FIXED ZONES: Marked with [FIXED]. Do not modify structure.
     VARIABLE ZONES: Marked with [VARIABLE]. Replace with content.

     Reference files hold specialized knowledge that supports a
     skill but would bloat SKILL.md if included inline. They are
     read on-demand, not at skill load time.

     Rules:
     - One reference file per sub-topic
     - Only create a reference file when the content exceeds 30
       lines of specialized detail
     - SKILL.md must contain a pointer to every reference file
       (readers should never discover a reference file by accident)
     - If the file exceeds 100 lines, include a table of contents
     ============================================================ -->

<!-- [FIXED] Title — descriptive, matches the filename slug -->
# [VARIABLE: Reference Title]

<!-- [FIXED] "When to read this" block — always present, always specific.
     Do NOT write "when you need more detail". State the exact condition. -->
> **When to read this:** [VARIABLE: Specific condition that makes this file relevant.
> Example: "When the skill's Step 3 decision table points you to shape classification
> and you need the full criteria." Must be concrete enough that an agent can decide
> in one sentence whether to read further.]

<!-- [FIXED] Table of contents — REQUIRED if file exceeds 100 lines.
     If file is under 100 lines, delete this section entirely.
     Use markdown anchor links. Keep flat (no nested lists). -->
## Contents

- [VARIABLE: Section Name](#variable-section-anchor)
- [VARIABLE: Section Name](#variable-section-anchor)
- [VARIABLE: Section Name](#variable-section-anchor)

---

<!-- [VARIABLE] Content sections — the specialized knowledge.

     GUIDELINES:
     - Use the same formatting conventions as SKILL.md:
       tables over prose, imperative form, anti-patterns stated
     - Each section should be self-contained enough to be useful
       if an agent jumps directly to it via anchor link
     - Include concrete examples for anything non-obvious
     - If a section references external resources, use inline links

     SECTION PATTERNS (choose what fits the content):

     For criteria/classification:
       ## Section Name
       | Criterion | Threshold | Example | Rationale |

     For procedures:
       ## Section Name
       ### Step N: Action
       **Action:** ...
       **Inputs:** ...
       **Outputs:** ...

     For lookup tables:
       ## Section Name
       | Key | Value | Notes |

     For decision trees:
       ## Section Name
       | If... | Then... | Because... |

     For examples:
       ## Section Name
       ### Example: [Scenario Name]
       **Context:** ...
       **Input:** ...
       **Decision:** ...
       **Output:** ...
-->

## [VARIABLE: First Content Section]

[VARIABLE: Specialized content. Follow the formatting conventions above.
Use tables for structured information, prose only for context and reasoning
that cannot be expressed in tabular form.]

## [VARIABLE: Second Content Section]

[VARIABLE: Additional specialized content. Add or remove sections as needed.
Every section must justify its existence — if a section could be a single
row in a table in another section, merge it.]

<!-- [VARIABLE] Examples subsection — include if the reference material
     benefits from worked examples. -->

### Example: [VARIABLE: Scenario Name]

**Context:** [VARIABLE: What situation this example illustrates]
**Input:** [VARIABLE: What the agent starts with]
**Decision:** [VARIABLE: What choice was made and why]
**Output:** [VARIABLE: What was produced]

---

<!-- [FIXED] Related section — minimum 2 cross-references.
     Always link back to the parent SKILL.md.
     Link to other reference files in the same package if they exist.
     Link to external skills or knowledge base articles if relevant. -->
## Related

- [SKILL.md](../SKILL.md) — Parent skill that references this file
- [VARIABLE: Link to related reference file or skill] — [VARIABLE: Why related in <= 10 words]
- [VARIABLE: Link to related reference file or skill] — [VARIABLE: Why related in <= 10 words]
