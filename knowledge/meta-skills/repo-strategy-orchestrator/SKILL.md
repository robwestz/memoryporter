---
name: repo-strategy-orchestrator
description: systematic repo intake, constraint mapping, option generation, and branch planning for any software repository. use when an agent must understand an unfamiliar repo, preserve non-obvious constraints, present multiple next-step paths, and continue through a chosen path with the same mandatory workflow. also applies to non-repo domains with the same systematics (product strategy, architecture migration, incident post-mortem, documentation rescue, tech-debt triage — see USAGE-PATTERNS.md). trigger for repo audits, upgrade planning, subsystem extraction, architecture alternatives, specialization planning, precursor-system design, or when a user wants a reusable process instead of ad hoc repo advice. NOT for: single-bug patches (use repo-rescue), creating a new skill from scratch (use skill-forge), SEO/content work (use seo-article-audit), or one-shot blueprinting without an existing system to understand (use 200k-blueprint).
---

# Repo Strategy Orchestrator

Apply the same mandatory system to every repo before proposing change. Build the core understanding first, stop and present several valid paths, then continue through the chosen path with the same evidence and audit discipline.

## The systematics (never changes)

```
STAGE 1: CORE                       STAGE 2: BRANCH
─────────────────────               ──────────────────────────────
01-request-brief                    01-branch-charter
02-repo-map                         02-evidence-plan
03-constraint-map          ┌──────▶ 03-validation-plan
04-purpose-chain           │        04-subskill-opportunities
05-failure-mode-atlas      │
06-options-matrix ─── STOP ┘  (user chooses)

STATE MACHINE
  core-in-progress ──[strict audit passes]──▶ awaiting-user-choice
                                                    │
                                                    ▼
                                              branch-active

EVIDENCE CLASSES (tag every bullet)
  [OBSERVED]   [DERIVED]   [ASSUMED]   [OPEN-RISK]
```

Six core artifacts + four branch artifacts = ten structured files. The
state machine prevents skipping the stop-for-options rule. Evidence tags
prevent mixing fact with guess. This is the contract — everything else
is content.

## Where to run it

- **Installed globally (`~/.claude/skills/repo-strategy-orchestrator/`)**:
  the skill files live there; case workspaces live in your project.
  Use `--workspace /path/to/your/project/workspace` (any dir you own) —
  NOT inside `~/.claude/skills/`.
- **Used in-repo (portable-kit)**: scripts resolve their own paths via
  `Path(__file__)`, so running them from anywhere works. Workspace
  defaults to `./workspace` relative to current directory.

## Mandatory rules

1. Initialize a case workspace before analysis. Run `scripts/bootstrap_case.py <case-slug> "<goal>" --workspace <path>`. The case starts at `stage: core-in-progress` and writes an entry to `<workspace>/cases.jsonl`.
2. Fill the core artifacts in this order and do not skip any of them:
   - `core/01-request-brief.md`
   - `core/02-repo-map.md`
   - `core/03-constraint-map.md`
   - `core/04-purpose-chain.md`
   - `core/05-failure-mode-atlas.md`
   - `core/06-options-matrix.md` (must include Anti-simplification review)
3. Tag every claim, constraint, and open question with an evidence class: `[OBSERVED]`, `[DERIVED]`, `[ASSUMED]`, or `[OPEN-RISK]`. Hard constraints must not be `[ASSUMED]`.
4. Run `scripts/mechanical_audit.py <case-dir> --strict` before claiming the core stage is ready. On pass, the audit advances the case to `stage: awaiting-user-choice` automatically; `scaffold_branch.py` refuses to run before that.
5. Present multiple paths after the core stage. Always include at least three options, a user-defined slot, and an Anti-simplification review with all four questions answered per option.
6. Stop after the options matrix and wait for the user to choose a path.
7. After the user chooses a path, scaffold branch work with `scripts/scaffold_branch.py <case-dir> <branch-key> --name <branch-name>`. This flips the case to `stage: branch-active`.
8. Run `scripts/mechanical_audit.py <case-dir> --strict` again after branch scaffolding or after major edits.
9. When the branch is ready for stakeholder review, run `scripts/present_case.py <case-dir>` to generate a showcase-presenter brief at `<case-dir>/presentation-brief.md`.
10. Do not optimize a local improvement if it degrades the global purpose chain.
11. If the work reveals a repeatable specialization, capture it with the subskill pattern in `references/subskill-patterns.md`.

## Read these references

- For the mandatory end-to-end method, read `references/core-systematics.md`.
- For the standard path types and custom-path adaptation, read `references/branch-catalog.md`.
- For evidence rules, constraint handling, and anti-simplification checks, read `references/evidence-standard.md`.
- For future specialization and subskill creation, read `references/subskill-patterns.md`.
- For the ready-to-run portable-kit build prompt that recreates this package, read `examples/portable-kit-rebuild.md`.

## Core workflow

1. Initialize the workspace with `scripts/bootstrap_case.py`.
2. Fill `templates/request-brief.md` into `core/01-request-brief.md`.
3. Fill `templates/repo-map.md` into `core/02-repo-map.md`.
4. Fill `templates/constraint-map.md` into `core/03-constraint-map.md`.
5. Fill `templates/purpose-chain.md` into `core/04-purpose-chain.md`.
6. Fill `templates/failure-mode-atlas.md` into `core/05-failure-mode-atlas.md`.
7. Fill `templates/options-matrix.md` into `core/06-options-matrix.md`.
8. Run `scripts/mechanical_audit.py <case-dir>`.
9. Present the options matrix and wait for a user decision.

## Branch decision tree

After the core workflow, map the chosen path to one of these standard branches:

- **Upgrade existing system**: improve the current repo without breaking the validated purpose chain.
- **Extract reusable subsystem**: isolate a capability from the repo for reuse elsewhere.
- **Build adjacent or precursor system**: create a planning, orchestration, or upstream layer that feeds the repo.
- **Specialize an existing capability**: deepen one capability while reusing the repo foundation.
- **Research spike**: investigate a path without committing to implementation.
- **Custom path**: let the user define a new path, then map it to the closest standard pattern while keeping the user wording.

Scaffold the chosen path with `scripts/scaffold_branch.py`, then fill these branch artifacts:

- `01-branch-charter.md`
- `02-evidence-plan.md`
- `03-validation-plan.md`
- `04-subskill-opportunities.md`

## Output contract

The case is not ready for a recommendation until all of these are true:

- The six core artifacts exist.
- The options matrix compares at least three paths and includes a user-defined slot.
- The audit passes in structural mode.
- Assumptions, risks, and unverified items are explicit.

A branch is not ready for implementation or execution until all of these are true:

- The branch charter reuses inputs from the core artifacts.
- The evidence plan states what must be verified.
- The validation plan names success tests and failure triggers.
- The subskill opportunities file states whether repeatable work should become a new subskill.

## Use the templates

Use these templates directly:

- `templates/request-brief.md`
- `templates/repo-map.md`
- `templates/constraint-map.md`
- `templates/purpose-chain.md`
- `templates/failure-mode-atlas.md`
- `templates/options-matrix.md`
- `templates/branch-charter.md`
- `templates/evidence-plan.md`
- `templates/validation-plan.md`
- `templates/subskill-opportunities.md`

## Scripts

- `scripts/bootstrap_case.py` creates a case workspace. Writes `case.json` with `schema_version`, `stage: core-in-progress`, and appends a bootstrap entry to `<workspace>/cases.jsonl`.
- `scripts/scaffold_branch.py` creates a branch workspace for the chosen path. Refuses to run unless `case.json` stage is `awaiting-user-choice` or `branch-active` (override with `--force`). Flips stage to `branch-active` and updates `cases.jsonl`.
- `scripts/mechanical_audit.py` validates structure. `--strict` additionally enforces: (a) each required section has filled content (>=10 chars in a bullet or a populated table row), (b) evidence tags `[OBSERVED]` and `[ASSUMED]` appear across the core artifacts, (c) the Anti-simplification review in the options matrix is filled (>=4 sub-answers). On strict pass, the audit advances `stage: core-in-progress -> awaiting-user-choice`.
- `scripts/present_case.py` generates a showcase-presenter brief at `<case-dir>/presentation-brief.md`, listing every artifact with line counts and `[OK]`/`[BROKEN]` badges, followed by the ready-to-paste showcase-presenter prompt.

## Anti-patterns

- Do not jump straight from repo intake to "the answer".
- Do not collapse the options stage into a single recommendation.
- Do not treat constraints as comments or side notes.
- Do not hard-code one repo or one product into the general method.
- Do not create a subskill until the repeatable pattern is explicit.
