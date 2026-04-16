# Subskill opportunities - rescue-triage

## Repeatable pattern
**Elevation-challenge mechanic for preservation-bias rescue.** When a
codebase has accidentally-brilliant files without obvious homes, don't
cull them. Pair each with ≥1 other pool-file under constraints: must
run together end-to-end, must produce capability novel for the repo,
must be commercially defensible by the proposing agent. Files earn
permanent homes through successful challenges or are archived through
honest failures. This converts dead-weight anxiety into compounding
generativity.

Applies beyond SIE-X to any growing codebase where an author-with-LLM
has accumulated files past personal comprehension.

## Candidate subskills
- **`elevation-challenge-runner`** — takes (pool-file-list + codebase + constraint spec) and produces (integration attempt + novelty check + commercial-honesty review). Exit: file earns home OR is archived with reason. Pairs with `repo-strategy-orchestrator` as a Phase 3 engine.
- **`cross-reference-safe-remover`** — executes file removals with mandatory cross-reference audit + archive-before-delete. Used in any rescue/cleanup work, not just SIE-X.
- **`competing-modules-resolver`** — given 2+ files that seem to compete (same purpose, different implementations), produces a pick-or-rename decision with LOC/usage/recency numbers. Generalizes to "two auth systems / two servers / two adapters" patterns in any legacy codebase.
- **`commercial-honesty-gate`** — checklist a proposing agent must pass before claiming a new capability is shippable: 150-word pitch, named buyer persona, named competing tool that lacks this, stated willingness to stand behind it. Prevents AI-generated "interesting but useless" outputs from being treated as features.

## Shared assets
- **Elevation-challenge constraint template** (fixed-zone markdown): Challenge name · Files involved · Runnable test · Novelty criterion · Commercial pitch · Buyer persona · Competing-tool gap · Honesty-stand verdict.
- **Archive-before-delete protocol**: standard `.archive/YYYY-MM-DD-removed/` layout + removal-log format + cross-reference audit procedure.
- **Competing-modules decision matrix template**: rows = candidates, columns = LOC / active-importers / last-modified / feature-coverage / test-coverage. Recommendation row at bottom with rationale.
- **Pool-membership registry format**: per-file row with (path, size, current-status, proposed-constraint-for-elevation, priority). Updated as challenges run.

## Deferred opportunities
- **Elevation as standalone product** — if the pattern proves on SIE-X, it could become a standalone B2B offering ("AI code auditor that preserves value instead of just cleaning up"). Very different positioning from typical dead-code tools. Defer until at least 3 successful elevations on 1+ codebases.
- **Cross-codebase elevation** — allow pool-files from MULTIPLE codebases to be paired (e.g., SIE-X's xai.py + portable-kit's some-file). Much more ambitious; defer until basic in-codebase version is proven.
- **Gamification of elevation challenges** — tournament-style: multiple agents propose pairings, scoreboard for novelty + commercial defensibility. Interesting but premature.
- **Feed elevation successes back into `200k-blueprint`** — successful pairings become seed product ideas for blueprint. Natural integration; defer until enough successes exist.
- **Commercial-honesty-gate as cross-skill primitive** — the honesty check applies beyond elevation to any agent-proposed capability. Could become a universal skill-forge quality gate. Interesting idea; worth noting.
