# Meta-Prompt Template — for Claude Code in portable-kit

> Copy this block. Fill every `[VARIABLE]`. Preserve every `[FIXED]` header
> and structure. Deliver the filled block to the user or paste into Claude Code.

```markdown
You are a Claude Code agent working in the portable-kit repo at
C:/Users/robin/Downloads/portable-kit. The repo contains a 200k-pipeline
(skill-forge, 200k-blueprint, showcase-presenter, session-launcher),
Archon (workflow runner), MemPalace (persistent memory), a Rust runtime,
and a catalog of domain skills. Follow the structure below exactly.

# INTENT
Goal:          [VARIABLE — one imperative sentence with a measurable verb]
Anti-goals:    [VARIABLE — 2-3 concrete things NOT to do on this task]
Success looks like:
  - [VARIABLE — an artifact that will exist at a specific path on disk]
  - [VARIABLE — a behavior that can be demonstrated or a command that returns 0]
  - [VARIABLE — a quality audit that passes]

# CONTEXT TO LOAD (staged boot, L0→L2)
Read in order — stop when you have enough to route:
  1. CLAUDE.md (repo rules) + AGENTS.md (verify commands)
  2. [VARIABLE — 1-3 files most relevant to this task, with full paths]
  3. knowledge/INDEX.md (only if the task touches unfamiliar domain)
  4. [VARIABLE — prior showcase or report, if this builds on earlier work]

# SKILLS TO ACTIVATE
Primary:    /[VARIABLE — the one skill that owns the primary output]
Support:    /[VARIABLE — supporting skills, comma-separated]
Avoid:      [VARIABLE — skills that would be miscast here, with 1-line reason]

# WORKFLOW SHAPE
Shape:      [VARIABLE — linear | parallel fan-out | Archon DAG | self-looping]
Parallel branches (only if Shape is fan-out or Archon):
  A. [VARIABLE — independent work item with its own success criterion]
  B. [VARIABLE — independent work item with its own success criterion]
  C. [VARIABLE — optional third branch]
Join:       [VARIABLE — how branches synthesize into the final output]
Human gate: [VARIABLE — the single irreversible action that needs approval, or "none"]

# QUALITY GATES (the 200k+ lever — all three required)
Before claiming done, pass all three:
  1. Adversarial pass — state the single most likely failure mode for this
     output, then demonstrate how the output survives it (not "handles it
     gracefully" — show the evidence).
  2. showcase-presenter audit — run /showcase-presenter on the artifacts
     produced. Every capability card must have a real file. Items that
     don't work get [BROKEN] or [INCOMPLETE] badges; hiding failure is not
     acceptable.
  3. Delta summary in the final response:
       - Assumptions made (not verified)
       - Risks / edge cases
       - What I did NOT verify

# COMPOUNDING (what makes this run reusable)
This run must also produce exactly ONE of:
  [VARIABLE — pick one and complete it]
  - New skill at .skills/[VARIABLE-NAME]/ or knowledge/meta-skills/[VARIABLE-NAME]/
  - Blueprint at docs/blueprints/[VARIABLE-NAME].md
  - Index entry added to knowledge/INDEX.md describing [VARIABLE]
  - MemPalace drawer capturing [VARIABLE — the durable insight]
  - Archon workflow at .archon/workflows/[VARIABLE-NAME].yaml
Reason:     [VARIABLE — one sentence on how future sessions consume this artifact]

# CONSTRAINTS
Time budget:    [VARIABLE — wall-clock ceiling, e.g., "1 hour"]
Context budget: stay under ~75% of window; the two-stage compaction hook
                will warn you. If you hit the soft warning, run /compact
                before continuing rather than letting hard trigger fire.
Anti-patterns to avoid on this specific task:
  - [VARIABLE — specific trap given the task]
  - [VARIABLE — specific trap given the task]

Begin by stating back the INTENT in your own words to confirm understanding,
then execute.
```

## Variant: short form (for trivial tasks)

When the task genuinely is one step and doesn't warrant the full shape,
collapse to:

```markdown
Goal:       [VARIABLE]
Success:    [VARIABLE — file on disk or command that returns 0]
Skill:      /[VARIABLE — exactly one]
Gate:       Delta summary in response

Do it.
```

Use the short form only when Shape would be `linear` AND no Compounding
artifact is warranted AND task fits in one skill invocation. If any of
those aren't true, use the full template.
