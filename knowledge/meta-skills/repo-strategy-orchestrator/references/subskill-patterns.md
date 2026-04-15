# Subskill Patterns

Create a subskill only when a repeatable specialization is explicit.

Good reasons to create a subskill:

- the same branch pattern appears across multiple repos
- the work needs dedicated references, scripts, or templates
- the specialization has stable quality gates of its own

Weak reasons to create a subskill:

- one temporary preference
- a single repo quirk that does not generalize
- a branch that is still mostly exploratory

## Minimal subskill brief

When a branch suggests a subskill, capture these points in `04-subskill-opportunities.md`:

- repeatable pattern
- owning trigger
- required inputs
- expected outputs
- dedicated evidence checks
- reusable assets or templates

## Suggested naming pattern

Use a name that states the specialization and avoids repo-specific names unless the subskill is intentionally repo-bound.

Examples:

- `repo-constraint-auditor`
- `repo-precursor-planner`
- `repo-subsystem-extractor`

## Relationship to the parent skill

The parent skill remains the intake and branching layer. Subskills should plug into one branch, not replace the core systematics.
