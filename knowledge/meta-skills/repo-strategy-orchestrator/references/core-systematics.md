# Core Systematics

This skill always follows the same two-stage pattern:

1. Core intake and option generation
2. Branch continuation after a user choice

The point is to keep the method stable even when the repo, domain, and end goal change.

## Stage 1 - Core intake

Complete these artifacts in order:

1. Request brief
2. Repo map
3. Constraint map
4. Purpose chain
5. Failure mode atlas
6. Options matrix

Do not merge or skip them. Their separation matters:

- Request brief fixes the problem statement.
- Repo map prevents blind recommendations.
- Constraint map surfaces what must not be violated.
- Purpose chain protects global intent from local optimization.
- Failure mode atlas makes safeguards explicit.
- Options matrix forces multiple valid next steps.

## Stop condition after stage 1

Stop after the options matrix and ask the user to choose a path. Do not pre-commit to one path, even if one seems best.

The user must always get:

- Several predefined options
- A slot for a custom option
- A short explanation of the tradeoff of each option

## Stage 2 - Branch continuation

After the user chooses a path, create a branch workspace and continue with:

1. Branch charter
2. Evidence plan
3. Validation plan
4. Subskill opportunities

These files keep downstream work tied to upstream understanding.

## Global invariants

Preserve these invariants in every repo and every branch:

- Evidence beats intuition.
- Constraints are explicit and named.
- Assumptions are listed, not implied.
- User choice happens after the options matrix.
- Repeatable specializations are candidates for subskills.

## Large repo handling

When the repo is large, stage context instead of dumping everything at once.

Start from:

- entry points
- architecture docs
- build scripts
- interfaces
- recently changed modules relevant to the request

Expand only after the core artifacts show a need for more detail.
