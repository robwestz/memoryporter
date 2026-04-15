# Branch charter - doc-first-audit

## Branch objective
Produce a grounded skill-package for D:/sie_x/ — SKILL.md + capability
map + gap list + drift report — such that a fresh LLM session armed
with the artifact and read-access to the code can propose one working
new adapter within 60 minutes. No code changes to SIE-X master in
this branch. No running consolidation beyond baseline `test_core.py`.

## Why this branch
- Directly addresses Robin's self-declared #1 blocker: "svårt att få en LLM så insatt i systemet."
- Preserves all accidental brilliance (xai.py, multilingual, streaming, federated, AutoML) — no rewrite risk.
- Cannot break Bacowr — the only operation on SIE-X is reading.
- Produces a compounding artifact: every future case (writer-tool-commit paused, future verticals, consolidation branches B/C, adapter branches D) consumes the output.
- Exit is testable mechanically (fresh-LLM probe), not vibes.

## Inputs reused from core
- From `02-repo-map.md`: the per-module inventory (Level 0 core, Level 1 transformers, Level 2 product surfaces, Level 3 extensions, edge/research) — this is the starting structure of the capability map.
- From `03-constraint-map.md` (hard): do not break Bacowr; produce an LLM-readable artifact; preserve the "toppar" (edge assets); no rewrite; multi-consumer surface mindset.
- From `04-purpose-chain.md`: 30-minute onboarding target; a new LLM can propose a working adapter within 1 hour; the skill-package output is the primary compounding artifact.
- From `05-failure-mode-atlas.md` (explicit traps to refuse): pretty-lie doc, rewrite-via-cleanup, scope explosion from edge files, skipping canonical-version resolution, unmeasurable LLM-readability claims.

## Non-goals
- Rewriting any [KEY] file — explicitly refused; the audit reads code, never edits it.
- Resolving the "several versions" problem — that is Option C; this branch only DOCUMENTS that the problem exists.
- Extracting a minimum viable core — that is Option B; this branch scopes the INFORMATION needed before such extraction is honest.
- Writing a new adapter — that is Option D; this branch does not ship a second consumer.
- Fixing the 8 known architectural issues — this branch names which ones block what, not fixes them.
- Producing a beautiful UML diagram — architecture diagrams are allowed only if they come from evidence, not paraphrase.
- Updating `FULL_SYSTEM_ARCHITECTURE.txt` from v2.1.0 to v2.2.0 — the arch doc is INPUT, the skill-package is OUTPUT; avoid re-authoring the same artifact in another voice.

## Exit criteria
- `docs/siex-audit/SKILL.md` exists, <500 lines, Layer 1 rules from `200k-prompt-engineering` applied (imperative form, tables, front-loaded value, anti-patterns named, decision tables, testable rules).
- `docs/siex-audit/capability-map.md` has one card per [KEY] file plus one per edge asset (xai.py, multilingual/engine.py, federated/, automl/, testing/, training/). Each card: file path, what it does, in/out shape, dependencies, status tag ([PRODUCTION] / [WORKING-ISOLATED] / [SCAFFOLD] / [UNVERIFIED]).
- `docs/siex-audit/gap-list.md` names ≥3 concrete missing core/engine/pipeline files, each with: expected capability, where it would live, what it would unlock.
- `docs/siex-audit/drift-report.md` quantifies: % of SIE-X files Bacowr has copied, % of those that have diverged, list of diverged files with diff summaries.
- `docs/siex-audit/fresh-llm-probe-result.md` records the test outcome — fresh LLM session, 60-minute timebox, pass/fail with artifact evidence.
- `docs/siex-audit/five-probe-report.md` — the "5 probe" subsystem Robin named is located in the codebase by file path and the missing key parts are enumerated, or the missing parts are declared unresolvable from code inspection alone (honest failure preserved).
- Bacowr's output rate verified unchanged over the branch duration (at least one content run produced successfully during the audit period).
