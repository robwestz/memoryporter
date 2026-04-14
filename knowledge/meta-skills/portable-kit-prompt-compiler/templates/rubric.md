# Fill-in Rubric

> Rules for turning `[VARIABLE]` placeholders into concrete values. The
> external LLM applies these rules field-by-field. A field that fails
> rubric check must be rewritten before the prompt is delivered.

## Per-field rules

### INTENT.Goal

| Rule | Example (good) | Example (fails) |
|------|----------------|-----------------|
| Starts with an imperative verb | "Produce a launch package for RepoBrain" | "Work on RepoBrain stuff" |
| Contains a measurable completion criterion | "…with landing page, pitch deck, and email sequence" | "…that's great" |
| One sentence | (one sentence) | (a paragraph) |

### INTENT.Anti-goals

| Rule | Example (good) | Example (fails) |
|------|----------------|-----------------|
| Each item is concrete and testable | "Do not generate lorem ipsum copy" | "Don't do bad work" |
| Specific to THIS task, not generic | "Do not add a pricing section — product is pre-launch" | "Avoid mistakes" |
| 2–3 items, no more | (2–3 lines) | (10 items) |

### INTENT.Success looks like

Every bullet must be one of:

| Type | Shape |
|------|-------|
| Artifact on disk | "File exists at `docs/blueprints/repobrain.md`" |
| Command returns 0 | "`bash verify.sh` exits 0" |
| Demonstrable behavior | "Opening `docs/showcases/repobrain-demo.md` renders with 0 [BROKEN] badges" |

Fails: "the user is happy", "it looks professional", "quality is high".

### CONTEXT TO LOAD

| Rule | Why |
|------|-----|
| Use full paths, not shortcuts | Agent's cwd varies |
| Max 5 files total (including the mandatory CLAUDE.md + AGENTS.md) | More = boot tax |
| Only include files that are MORE specific than `knowledge/INDEX.md` | INDEX points to the rest on demand |
| If task continues prior work, include its showcase or report | Avoids re-discovering known state |

### SKILLS TO ACTIVATE

| Rule | Example (good) | Example (fails) |
|------|----------------|-----------------|
| Name must exist in `knowledge/meta-skills/` or `skill-engine/explicit-skills.md` | `/showcase-presenter` | `/magic-doer` |
| Primary = exactly 1 skill | `/200k-pipeline` | `/200k-pipeline and /skill-forge and...` |
| Support = 0–3 skills, only if they reduce work | `/showcase-presenter` (for audit) | Every skill "just in case" |
| Avoid = 1–2 skills whose presence would mislead the agent | `Avoid: /seo-article-audit — task is not SEO, could trigger on "content"` | (empty when skills might collide) |

### WORKFLOW SHAPE

Apply the decision table from `SKILL.md`. Then verify:

| Shape | Must have | Fails if |
|-------|-----------|----------|
| `linear` | No parallel branches section | Branches listed anyway |
| `parallel fan-out` | Branches share no mutable state; join synthesizes | Branches modify same files |
| `Archon DAG` | Named workflow yaml is part of Compounding | No workflow artifact produced |
| `self-looping` | Explicit `max_iterations` and exit condition | Infinite loop possible |

### QUALITY GATES

Non-negotiable — all three gates present in every compiled prompt, even
short ones (except the short-form variant, which collapses to Delta only).

| Gate | Must include |
|------|--------------|
| Adversarial pass | A specific failure mode NAME, not "edge cases" |
| showcase-presenter audit | Only if task produces artifacts the showcase skill can audit (skills, builds, reports). Otherwise substitute a deterministic verify script. |
| Delta summary | Three bullets: assumptions, risks, not verified |

### COMPOUNDING

Exactly one artifact category, named specifically. Anti-pattern: "and also
maybe update INDEX and add a memory and write a workflow." Pick one.

| Artifact | Pick when |
|----------|-----------|
| New skill | Pattern will repeat ≥3 times; worth the package overhead |
| Blueprint | Product-level architectural decision future builds depend on |
| INDEX entry | A knowledge piece others should discover via `knowledge/INDEX.md` |
| MemPalace drawer | A durable insight tied to a person/project/concept |
| Archon workflow | Autonomous re-run value; worth naming |

### CONSTRAINTS.Time budget

State in wall-clock units (minutes or hours). Not "as long as it takes."
The budget forces scope cuts the prompt must honor.

### CONSTRAINTS.Anti-patterns

Specific to THIS task. Draw from the codebase's known traps:

| Source | Example anti-pattern |
|--------|-----------------------|
| CLAUDE.md guardrails | "Do not modify original skills in `knowledge/` — copy to `.skills/` first" |
| Recent discoveries | "Previous run compiled but failed at install — test bundle output before claiming done" |
| Task-specific | "Copy must come from README.md, not generated SaaS boilerplate" |

## Validation — before delivering the prompt

Check every box. If any fail, rewrite that field.

- [ ] Goal starts with an imperative verb
- [ ] Anti-goals are concrete and task-specific (≥ 2, ≤ 3)
- [ ] Success criteria are all artifacts/commands/behaviors (≥ 3)
- [ ] Context file count ≤ 5, all with full paths
- [ ] Primary skill exists in the portable-kit catalog
- [ ] Workflow shape matches task characteristic from decision table
- [ ] All three quality gates present and named
- [ ] Exactly one Compounding artifact with a consumer reason
- [ ] Time budget is a wall-clock number
- [ ] Anti-patterns reference THIS task, not generic advice
- [ ] Zero `[VARIABLE]` placeholders remain

If the task is so trivial that filling every field is noise, fall back to
the short-form variant in the template file. Do not ship a half-filled
full template.
