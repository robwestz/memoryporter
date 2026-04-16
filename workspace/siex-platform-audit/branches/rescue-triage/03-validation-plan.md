# Validation plan - rescue-triage

## Success tests
- **Phase 1 pass:** `core/test_core.py` passes both before AND after removals. `removal-log.md` exists with per-file entry. Zero cross-reference regressions.
- **Phase 2 pass:** `restructure-map.md` exists showing every surviving file's new home (or pool membership) with rationale. 3 competing-X decisions documented with LOC + usage numbers.
- **Phase 3A pass (Cross-Lingual Attribution Engine):**
  1. Runnable: a minimal `orchestrator.py` imports xai + multilingual and executes end-to-end on sample input. Output is non-placeholder.
  2. Novel-for-repo: neither xai alone nor multilingual alone produces the combined output; the composition creates capability not present before.
  3. Commercially defensible: I (Opus) produce a written 150-word pitch + named buyer persona + named competing tool that lacks this. I must state "yes, I'd stand behind this for a buyer" without hedging.
- **Subskill-pattern pass:** the elevation-challenge mechanic is documented in 04-subskill-opportunities.md well enough that a different operator + different codebase could apply it.

## Failure triggers
- **Phase 1 — any cross-reference regression:** if `test_core.py` fails after removals or if a removed file had a live consumer we missed, restore from `.archive/` and re-scope Phase 1 more conservatively.
- **Phase 1 — mirror-tree is NOT a duplicate:** if sample diffs of `D:/sie_x/sie_x/` vs top-level show meaningful divergence, the mirror tree stays and Phase 1 scope shrinks to just transformer + adapter removal.
- **Phase 2 — competing-X has no clear winner:** if two files serve legitimately different purposes (the multilang case is already flagged as this), the decision becomes RENAME not PICK. Document the rename rationale.
- **Phase 2 — pool grows larger than ~10 files:** if every salvageable file ends up pool-bound, restructuring has failed to find homes. Back off, accept more files as "infrastructure without explicit home = infrastructure," reduce pool to genuinely orphaned files.
- **Phase 3A — multilingual scaffold blocks composition:** if multilingual/engine.py can't support the xai integration without first being built out, Challenge A either (a) expands to include the build-out work OR (b) pauses and Challenge B (xai + audit/*) runs first as easier proof-of-concept.
- **Phase 3A — commercial-honesty fail:** if I (Opus) cannot write the 150-word pitch honestly, Challenge A is marked FAILED. Files return to pool. A failed challenge is NOT a tragedy — it's the mechanism working correctly.
- **Wave 1 findings mismatch today's reality:** if opening the code shows the situation has changed since the audit started, refresh the capability-map before proceeding.

## Rollback or containment
- All Phase 1 removals are ARCHIVE moves to `D:/sie_x/.archive/2026-04-15-removed/` — nothing is truly deleted. Rollback = `mv` back to original path.
- Phase 2 restructuring is git-tracked if D:/sie_x/ has git, otherwise manually reversible since `.archive/` retains originals.
- Phase 3 challenge artifacts (the Cross-Lingual Attribution Engine integration code) live in a new isolated module — reverting is `rm -rf` that module; nothing else affected.
- If any phase destabilizes the system beyond what the checks catch: halt the branch, preserve state, open a new case for recovery.

## Demo artifacts
Phase 1:
- `workspace/siex-platform-audit/branches/rescue-triage/artifacts/removal-log.md`
- `workspace/siex-platform-audit/branches/rescue-triage/artifacts/phase1-test-core-before.txt`
- `workspace/siex-platform-audit/branches/rescue-triage/artifacts/phase1-test-core-after.txt`
- `workspace/siex-platform-audit/branches/rescue-triage/artifacts/depth-verification.md` (R3 output on unsampled modules)

Phase 2:
- `artifacts/restructure-map.md`
- `artifacts/competing-x-decisions.md`
- `artifacts/elevation-pool.md`

Phase 3A (first challenge):
- `artifacts/challenge-A-integration.py` (the orchestrator)
- `artifacts/challenge-A-example-output.md` (what running it produces)
- `artifacts/challenge-A-commercial-pitch.md` (my 150-word pitch + buyer persona + competitor gap)
- `artifacts/elevation-registry.md` (running log of which files have been elevated vs archived)
