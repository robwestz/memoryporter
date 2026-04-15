# Purpose chain - siex-platform-audit

## User outcome
Robin can describe SIE-X to a fresh LLM in 30 minutes using the audit
output and have the LLM capable of making non-trivial extensions —
new transformer, new adapter, new consumer — without Robin having to
reconstruct the system's implicit contracts each session.

## Intermediate effects
- SIE-X's actual capabilities are named, located, and badge-tagged (working / partial / scaffold / unknown)
- The "five probe" gap Robin referenced is located by file path and the missing key parts are enumerated
- The "several versions" problem is resolved: one canonical version, others archived with reason
- The fragment-import between SIE-X master and Bacowr is mapped; drift is measured
- A minimum platform core is named — the subset of SIE-X that a new consumer (writer-tool) must depend on to work, without needing fragment-import
- The 8 known issues are triaged: (a) must-fix before any new consumer attaches, (b) can-live-with, (c) retire the feature instead of fixing
- A skill-package is authored so any future LLM session can onboard on SIE-X in minutes, not hours
- Robin has a concrete list of "gamechanger" missing cores — files he doesn't yet have but would unlock compound capabilities

## Step-to-step dependencies
- Repo-map accuracy bounds constraint-map trust — if repo-map mis-categorizes a scaffold as production, downstream work breaks on false foundations
- Canonical-version selection bounds all consolidation — picking the wrong master means other work is wasted
- Bacowr-drift measurement bounds the consolidation plan — if Bacowr is far from master, consolidation must preserve Bacowr's current behavior as an invariant
- The skill-package output depends on both the repo-map (what exists) and the purpose-chain (how pieces serve user outcomes) — authoring it before those are solid produces a lying document
- Writer-tool-commit (paused case) resumes only after this audit's options-matrix is chosen — its branch charter must reference a specific audit branch output

## Global success conditions
- A new LLM session can pick up D:/sie_x/, read the skill-package + arch-doc, and propose a working new adapter within 1 hour — this is the operational definition of "LLM-readable platform"
- Bacowr continues to generate revenue throughout the audit — no regression
- After the audit's chosen branch completes, adding a second consumer (writer-tool) requires zero fragment-imports; the public surface carries the contract
- Robin himself can describe, in plain language, what each [KEY] file does and where his "gamechanger" gaps are — measured by his own comprehension, not arch-doc completeness
- The audit output itself is committable in portable-kit/workspace/ and referenceable from future cases — compounding artifact

## Local optimizations to avoid
- Rewriting any [KEY] file under the banner of "cleanup" — rewrite loses accidental brilliance (Robin built xai.py, multilingual engine, etc., without fully understanding them; rewriting them without deep understanding destroys what's there)
- Deleting pipeline code that is "unused but preflight-loaded" without first confirming it is not used by the less-obvious paths (Bacowr's fragment-import may reach into these)
- "Modernizing" the stack (Pydantic v2, FastAPI new patterns, etc.) during the audit — stack migrations are their own case, not part of mapping
- Adding new transformers to "complete the set" before the core and existing transformers are documented — adds surface without adding understanding
- Producing a tidy architecture diagram that ignores the "several versions" problem — pretty artifact, lying artifact
- Optimizing the skill-package for brevity at the expense of groundedness — if an LLM session reads it and still needs to re-read 20 code files, the skill-package failed
