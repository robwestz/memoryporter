<!-- ============================================================
     SKILL FORGE — SKILL.MD TEMPLATE

     FIXED ZONES: Marked with [FIXED]. Do not modify structure.
     VARIABLE ZONES: Marked with [VARIABLE]. Replace with content.

     Content ratio target: 40% process steps, 30% tables/decision
     trees, 20% examples, 10% notes

     This is the core file of every skill package. It defines what
     the skill does, when to use it, how to execute it, and what
     to avoid. An agent reading only this file should be able to
     perform the skill without asking clarifying questions.
     ============================================================ -->

<!-- [FIXED] Frontmatter — every field is required.
     name: lowercase-kebab-case, stable after publication
     description: >= 50 chars, must include trigger phrases ("Use when...", "Trigger on...")
     author: full name
     version: SemVer, start at 1.0.0 -->
---
name: [VARIABLE: lowercase-kebab-case-name]
description: |
  [VARIABLE: 2-5 sentence description. Must include:
  1. What the skill does (core capability)
  2. When to use it (trigger phrases: "Use when...", "Trigger on...")
  3. What input it expects
  Be pushy — tell agents exactly when to activate this skill.
  Minimum 50 characters.]
author: [VARIABLE: Full Name]
version: [VARIABLE: 1.0.0]
---

<!-- [FIXED] Title block — skill name as H1, followed by one-liner -->
# [VARIABLE: Skill Name]

> [VARIABLE: One sentence. What this skill produces or achieves. Describe the outcome, not the process.]

<!-- [VARIABLE] Purpose section — WHY this skill exists.
     Focus on what goes wrong WITHOUT this skill.
     2-4 sentences maximum. -->
## Purpose

[VARIABLE: What problem does this skill solve? What happens when someone attempts
this task without the skill? Focus on consequences and value, not features.]

<!-- [FIXED] Audience section -->
## Audience

- Primary: [VARIABLE: Who uses this skill most]
- Secondary: [VARIABLE: Who else benefits]

<!-- [FIXED] When to Use — bullet list of trigger conditions -->
## When to Use

- [VARIABLE: Concrete situation 1]
- [VARIABLE: Concrete situation 2]
- [VARIABLE: Concrete situation 3]

<!-- [FIXED] When Not to Use — table format with alternatives -->
## When Not to Use

| If the situation is... | Use instead | Why |
|------------------------|-------------|-----|
| [VARIABLE: Situation where this skill is wrong] | `[VARIABLE: alternative-skill]` | [VARIABLE: Reason] |
| [VARIABLE: Situation where this skill is wrong] | `[VARIABLE: alternative-skill]` | [VARIABLE: Reason] |

<!-- [FIXED] Required Context — what must be gathered before starting -->
## Required Context

Gather or confirm:

- [VARIABLE: Input, artifact, or decision that must exist before Step 1]
- [VARIABLE: Input, artifact, or decision that must exist before Step 1]
- [VARIABLE: Input, artifact, or decision that must exist before Step 1]

<!-- [VARIABLE] Process section — the core of the skill.
     This is where 40% of the content lives.

     RULES:
     - Number steps sequentially
     - Each step MUST have: Action (imperative), Inputs, Outputs
     - Include decision tables INSIDE steps where choices happen
     - Use If.../Then.../Because... tables for branching logic
     - State at least one anti-pattern per major step
     - Keep imperative form: "Read the file" not "You should read the file"
     - If a step exceeds 30 lines, extract detail to references/

     Add or remove steps as needed. 3-7 steps is typical.
     Every step must produce something the next step consumes. -->

## Process

### Step 1: [VARIABLE: Action Name]

**Action:** [VARIABLE: What to do — imperative, specific, testable]
**Inputs:** [VARIABLE: What you need to start this step]
**Outputs:** [VARIABLE: What this step produces — must be concrete]

[VARIABLE: 2-4 sentences of guidance. What matters most. What to watch for.]

<!-- [VARIABLE] Include a decision table if this step involves choices -->

| If... | Then... | Because... |
|-------|---------|------------|
| [VARIABLE] | [VARIABLE] | [VARIABLE] |

**Do NOT:** [VARIABLE: Anti-pattern for this step — what goes wrong and why]

### Step 2: [VARIABLE: Action Name]

**Action:** [VARIABLE]
**Inputs:** [VARIABLE: Usually outputs from Step 1]
**Outputs:** [VARIABLE]

[VARIABLE: Guidance for this step.]

**Do NOT:** [VARIABLE: Anti-pattern]

### Step 3: [VARIABLE: Action Name]

**Action:** [VARIABLE]
**Inputs:** [VARIABLE]
**Outputs:** [VARIABLE]

[VARIABLE: Guidance for this step.]

**Do NOT:** [VARIABLE: Anti-pattern]

<!-- [VARIABLE] Add more steps as needed. Remove Step 3 if 2 steps suffice. -->

<!-- [FIXED] Output section — what the skill produces -->
## Output

Default output:

- [VARIABLE: Primary deliverable]
- [VARIABLE: Secondary deliverable or artifact]
- [VARIABLE: Optional output (mark as optional if so)]

<!-- [VARIABLE] Examples section — concrete, realistic walkthroughs.
     At least one example for Full+ shapes.
     Show inputs, decisions, and outputs.
     Use code blocks or quoted text for sample content. -->

## Example

[VARIABLE: A concrete, realistic walkthrough showing this skill applied to a
real scenario. Include the inputs that were provided, the decisions made at each
step, and the outputs produced. This is the proof that the skill works.

If the example would exceed 40 lines, place it in examples/ and link:
"See [examples/example-name.md](examples/example-name.md) for a full walkthrough."]

<!-- [VARIABLE] Works Well With — other skills that complement this one -->
## Works Well With

- `[VARIABLE: skill-name]` — [VARIABLE: What it provides to this skill]
- `[VARIABLE: skill-name]` — [VARIABLE: What it provides to this skill]

<!-- [FIXED] Notes section — operational notes, caveats, version history -->
## Notes

- [VARIABLE: Operational caveat or important context]
- [VARIABLE: What this skill does NOT do (scope boundary)]
- [VARIABLE: Version history note or migration guidance, if applicable]
