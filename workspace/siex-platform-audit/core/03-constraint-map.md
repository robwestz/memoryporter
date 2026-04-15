# Constraint map - siex-platform-audit

Tag each constraint with one of `[OBSERVED]`, `[DERIVED]`, `[ASSUMED]`,
`[OPEN-RISK]`. Hard constraints must NOT be `[ASSUMED]`.

## Hard constraints
- [OBSERVED] **Do not break Bacowr.** It is the only proven consumer, generated 250k SEK in Q1 savings, and any consolidation that interrupts its pipeline has an immediate, countable cost.
- [OBSERVED] **The audit must produce an LLM-readable artifact.** Robin's self-declared #1 blocker is "svårt att få en LLM så insatt i systemet" — if the output cannot be handed to a fresh LLM session and read in under 30 minutes, the audit has failed its primary purpose regardless of code quality.
- [OBSERVED] **Cannot be simpler than the current edge.** xai.py (SHAP + LIME), federated learning, AutoML, multilingual 100+ language engine — these are the "toppar" Robin named. Consolidation that removes or dumbs down these cannot proceed. Vision statement: "vinna på att ha sina toppar och mångsidighet och samtidigt ingenting som är sämre än något motsvarande som betalas pengar för."
- [OBSERVED] **No rewrite-from-scratch.** 8500 LOC built over 6 months by a self-described "färsk" developer who now does not fully understand all of it. A rewrite will not recreate the accidental brilliance.
- [DERIVED] **Must support multiple consumers without fragment-import.** Current Bacowr pattern (copy files in) produces drift and does not scale to writer-tool + future verticals. Platform status requires a clean public surface.

## Soft constraints
- [OBSERVED] Prefer consolidation that Robin himself can work on with LLM assistance — not architecturally-pure if that purity exceeds his comprehension.
- [OBSERVED] Prefer Python-stdlib + existing stack choices; avoid introducing new frameworks mid-audit (Pydantic Settings, FastAPI Users, etc. can come later).
- [OBSERVED] Prefer keeping all domain transformers — future verticals (writer-tool, medical writing, legal briefing, financial analysis) depend on the shape being there.
- [DERIVED] Prefer documentation + skill-package output over pure code refactor — the skill-package makes the system self-describing to future LLM sessions.

## Epistemic constraints
- [DERIVED] **Cannot trust the arch doc at code-depth level.** It's v2.1.0 from 2026-02-07; code has moved. Any claim beyond "this directory exists" or "this file is this many lines" needs verification before it becomes an [OBSERVED] fact in a branch artifact.
- [DERIVED] **Cannot trust "Bacowr's copy of SIE-X X" matches "SIE-X X."** Drift assumption is safer than identity assumption.
- [DERIVED] **Cannot claim "production ready" for any module Robin has not personally used.** SEO transformer is production-used; 4 other transformers are unverified at production level.
- [OBSERVED] Robin's self-assessment ("jag förstod ingenting av vad jag hade") must be treated as a floor, not false modesty — plan must assume the author needs onboarding to his own code.

## Process constraints
- [OBSERVED] Any consolidation touching SIE-X master must run against a throwaway copy before touching the real one; Bacowr's current SEO pipeline depends on this code and a broken pipeline = lost customer value.
- [OBSERVED] The "several versions" problem must be resolved BEFORE consolidation starts — pick canonical, archive others explicitly, don't merge blindly.
- [DERIVED] Changes must be reviewable in small commits. "Komplicerat att ändra minsta lilla utan att det går sönder" means coverage gaps exist; small commits are the test-of-last-resort.

## Constraint rationale
- The "don't break Bacowr" rule is not a preference — it is the only verified source of commercial validation for SIE-X. Loss here = loss of the evidence that SIE-X is worth finishing.
- The LLM-readability rule comes from Robin's stated workflow: he codes with LLM assistance. An audit that makes the system illegible to LLMs makes Robin MORE stuck, not less.
- The "no rewrite" rule respects that SIE-X contains accidental brilliance (xai.py, multilingual engine, streaming pipeline, explainability) that Robin built without fully understanding. A rewrite loses the accidental parts.

## What must not be simplified
- The edge tooling (xai.py, federated, automl, multilingual 100+) — these are the "toppar" defining competitive moat.
- The transformer pattern (loader + per-domain transformer + prompt) — this IS the skill-template architecture writer-tool's blueprint described; do not collapse into hardcoded SEO path.
- The smart_constraints JSON contract (bacowr_adapter.py) — this is the working interface that proves the pattern.
- The 100+ language support — removing it to "simplify" loses cross-market optionality.
- The explainability layer — xai.py explains extraction decisions; this is regulatory-grade value in future B2B/enterprise sales.
