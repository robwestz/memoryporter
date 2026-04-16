# Evidence plan - rescue-triage

Tag each claim/source/assumption with an evidence class:
`[OBSERVED]`, `[DERIVED]`, `[ASSUMED]`, `[OPEN-RISK]`.

## Claims to verify
- [OBSERVED] Before Phase 1 removals: each to-be-archived file has no non-removed-set consumer. Verified via grep for imports of the file across the entire `D:/sie_x/` tree (excluding the mirror tree `D:/sie_x/sie_x/` which is itself being archived).
- [ASSUMED] `D:/sie_x/sie_x/` mirror tree is a byproduct of an earlier build/packaging step, not intentionally divergent. Verify by diffing a sample of mirrored files against their top-level counterparts. If divergent, treat as separate fork problem.
- [ASSUMED] The 3 "competing X" pairs can each be resolved by picking one canonical, with clear rationale. If the two competitors serve different purposes (e.g., 11-lang detector vs 100+ lang embedder), the answer is RENAME, not PICK.
- [ASSUMED] `automl/`, `audit/`, `testing/`, `plugins/`, `monitoring/`, `agents/` files have enough depth to be preserved as pool candidates. Needs Phase 1 spot-check (R3 agent).
- [OPEN-RISK] Some cross-references may exist that Robin's clarified scope doesn't anticipate — a file "he thinks is dead" may be imported by something valuable. Phase 1 must halt on any such finding.
- [OPEN-RISK] Elevation Challenge A (xai + multilingual) requires multilingual/engine.py to be depth-verified. Wave 1 flagged it as [SCAFFOLD] with a "# Add 96 more..." comment. Challenge scope may need to include "build out the multilingual scaffold" as a precondition.

## Evidence sources
- [OBSERVED] Wave 1 artifacts in `workspace/siex-platform-audit/branches/doc-first-audit/artifacts/`: capability-map-wave1.md, transformer-verification.md, drift-report.md, gap-hunt.md.
- [OBSERVED] `D:/sie_x/` directory — direct code read for cross-reference checks.
- [OBSERVED] `D:/sie_x/FULL_SYSTEM_ARCHITECTURE.txt` — map of claimed structure.
- [OBSERVED] Robin's 2026-04-15 clarification on scope (preservation-bias, elevation-challenge constraints).
- [OBSERVED] `core/test_core.py` — baseline to re-run before and after Phase 1 removals.

## Gaps and assumptions
- [ASSUMED] Archive destination `D:/sie_x/.archive/2026-04-15-removed/` is creatable and writable. Assumed Windows filesystem permits `.archive` directory.
- [ASSUMED] Robin's git status on D:/sie_x/ is unknown — cannot rely on git for rollback. Archive-before-delete is the safety net.
- [OPEN-RISK] Some "speculative transformer" code may have been copy-pasted elsewhere; removing the transformer doesn't remove the duplicate. Cross-reference check mitigates but is not absolute.
- [ASSUMED] Phase 3 elevation challenges are sequential (one at a time). Parallel elevation attempts could share or fight over filesystem state.

## Required checks
- **Pre-Phase-1:** run `core/test_core.py` baseline, record pass/fail.
- **Pre-removal per file:** `grep -rn "<file-basename>" D:/sie_x/` excluding self + mirror tree. Zero external hits = safe to archive. Non-zero hits = flag for manual review, do not remove.
- **Mirror-tree diff check:** sample 5 files from `D:/sie_x/sie_x/` vs their top-level counterparts. If <5% divergence across samples, safe to archive mirror tree whole. Else flag as separate fork.
- **Competing-X depth check:** for each of 3 pairs, quantify LOC + feature coverage + last-modified time + number of importers in each file. Recommendation must include these numbers.
- **Post-Phase-1:** re-run `core/test_core.py`; output must match baseline. If regression, restore from `.archive/`.
- **Pool membership check (Phase 2):** every file not-removed and not-in-natural-home gets registered in pool with proposed elevation constraints.
- **Phase 3 Challenge A runnability:** write a minimal orchestrator script that imports both xai and multilingual, runs a cross-lingual extraction with attribution. Must execute end-to-end and produce non-placeholder output. If scaffolds block execution, the challenge declares "needs multilingual-build precondition" and does not claim success.
- **Phase 3 Challenge A commercial-honesty check:** I (Opus orchestrator) must produce a 150-word pitch for the resulting capability + name a specific buyer persona + name a competing tool that doesn't offer this. If I can't do all three honestly, challenge fails.
