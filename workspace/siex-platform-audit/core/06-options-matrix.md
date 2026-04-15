# Options matrix - siex-platform-audit

## Standard options
- Option A: **Documentation-first audit** — produce a grounded SKILL.md + capability map + gap list + drift report for D:/sie_x/ without touching code. Output is a skill-package that any LLM session can onboard from. No consolidation, no rewrites. Deliverable: `portable-kit/workspace/siex-platform-audit/branches/doc-first/`.
- Option B: **Minimum-viable-core extraction** — identify the smallest subset of SIE-X files that multiple consumers need (engine, models, extractors, streaming, one transformer loader, auth bridge), package as a clean public surface, leave rest as-is. Writer-tool and future verticals depend on the minimum core without fragment-import. Master SIE-X still exists untouched.
- Option C: **Version consolidation first** — resolve the "several versions" problem before anything else. Identify canonical version, measure drift against Bacowr's merged copy, archive non-canonical versions with explicit reasons. No new features, no new adapters; just the cleanup that unblocks all later work.
- Option D: **Adapter-driven growth** — skip audit work, author one new adapter (a non-SEO consumer, e.g. `writer_adapter.py` targeting long-form essays) using existing master SIE-X. Use the building experience to surface what the audit would have found. Pragmatic, ship-oriented, uses real work as discovery.

## Comparison matrix
| Option | Preserves | Changes | Evidence needed | Main risk |
|---|---|---|---|---|
| A | All code untouched; Bacowr safe; edge files preserved | Documentation rigor; LLM-readable artifact exists | Test: fresh LLM session + artifact + D:/sie_x/ → propose working new adapter in <1h | Doc becomes aspirational if code paths not actually traced; pretty lie risk |
| B | Existing consumers; edge files; the "toppar" | Introduces a clean public surface; forces interface decisions | Successfully run Bacowr against the extracted core without the fragment-import it currently needs | Extraction exposes hidden coupling; minimum-viable expands; becomes de-facto rewrite |
| C | Everything; no new features | One version becomes master; others archived with rationale | Canonical version runs Bacowr's pipeline end-to-end without regression | Consolidation reveals that no single version is complete — each has pieces the others lack |
| D | Ship momentum; existing SIE-X intact | One new vertical proof; implicit audit via building | New adapter produces editor-quality output; Robin's fragment-import list for this adapter is shorter than Bacowr's was | Repeats Bacowr's debt pattern; second consumer does not force a clean platform, just more drift |

## Recommendation posture
- Preferred option and why: **A (Documentation-first audit)** — directly addresses Robin's self-declared #1 blocker ("svårt att få en LLM så insatt i systemet"), preserves all accidental brilliance, cannot break Bacowr, produces a compounding artifact (the skill-package) that every subsequent case and session benefits from. Cost: ~3-5 days focused work. Exit criterion is testable (the "fresh LLM onboarding under 1 hour" probe).
- Why the other options still remain valid: B is the natural second step after A — once the surface is documented, the minimum core is far easier to identify honestly. C is required if A's output reveals that version drift is worse than assumed. D is the fallback if A's output shows SIE-X is too fragile to document without running it, in which case "build to discover" becomes the only path.

## User-defined option slot
- Custom option label:
- Closest standard pattern:
- What stays standard:
- What becomes custom:

## Anti-simplification review

Answer each question before the options matrix is considered ready.
Leave no sub-item blank.

1. What existing safeguard would disappear if this option succeeded locally?
   - A: The "built through trial and error" authenticity — a clean doc can make Robin think he understands pieces he doesn't, encouraging overreach into code changes the doc cannot safely inform.
   - B: The preservation of "several versions" — picking a canonical forces the other versions to be explicitly archived, losing whatever accidental fixes were only in them.
   - C: The momentum of feature work — consolidation takes weeks with zero visible new capability; the pattern of "working on Bacowr customer value" breaks.
   - D: The audit discipline itself — by skipping to build, we lose the forcing function that would have surfaced fragment-import drift; debt compounds silently.
2. Which output looks better in isolation but weakens the global purpose chain?
   - A: "a beautiful SKILL.md" looks complete in isolation but if an LLM still can't extend SIE-X successfully after reading it, it failed the real test.
   - B: "a clean public surface" looks professional but if Bacowr can't consume it, it's theater.
   - C: "one canonical version" looks disciplined but if the canonical drops features the others had, total capability shrinks.
   - D: "a second working consumer" looks like validation but if it was built by repeating fragment-import, it proves the platform doesn't exist — only the pattern for coping with its absence does.
3. Which assumption is being smuggled in as if it were proven?
   - A: That the fresh-LLM-onboarding test is a valid proxy for Robin's own future self reading the doc in 3 months.
   - B: That "minimum viable core" can be identified without running the system — risky if implicit cross-module dependencies exist.
   - C: That resolving "several versions" is a bounded 3-5 day task and not a rabbit hole that reveals no version is close to complete.
   - D: That building one more adapter will be as productive as Bacowr's accidental success — Bacowr's success was multi-month work at peak attention; a quick second try may not reproduce that.
4. What would a false-positive "improvement" look like here?
   - A: A SKILL.md that reads well but has not been tested with an actual fresh LLM session; confidence without verification.
   - B: An extracted core that Bacowr is then refactored to use — but only Bacowr uses it, and no second consumer actually appears, making it a cosmetic change.
   - C: A tidy tree after version consolidation, but the discarded versions contained bug fixes or experimental capabilities that get rediscovered the hard way months later.
   - D: A shippable writer-adapter that works through the same fragment-import pattern Bacowr uses — the "second consumer" is a second fragment-importer, not a second clean consumer.
