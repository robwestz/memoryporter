# Constraint map - writer-tool-commit

Tag each constraint with one of `[OBSERVED]`, `[DERIVED]`, `[ASSUMED]`,
`[OPEN-RISK]`. Hard constraints must NOT be `[ASSUMED]` — promote to
observed/derived or move to "Open risks" in 05-failure-mode-atlas.md.

## Hard constraints
- [OBSERVED] Robin has finite attention; four parallel products has produced zero ships. This product must absorb or replace others, not add a fourth surface.
- [OBSERVED] First launch must happen within 8 weeks or the pattern repeats — writer-tool gets re-tabled as it did 2026-04-10.
- [OBSERVED] No hallucinated citations — source-grounding is binary; one fabricated link destroys trust (blueprint names this as primary market risk).
- [DERIVED] First niche must be one Robin himself can judge output quality for without a paid editor — Bacowr qualifies, medical-writing does not.

## Soft constraints
- [OBSERVED] Prefer Bacowr-compatible genre as first niche so the two products share genre infrastructure rather than fork.
- [OBSERVED] Prefer streaming UX — long waits feel broken in content-pro workflow.
- [ASSUMED] Output target 1500-3000 words per piece; shorter doesn't showcase structural-scaffolding advantage vs competitors.

## Epistemic constraints
- [DERIVED] Cannot claim "human-indistinguishable" without a double-blind editor test on real output — anecdotal reads do not count.
- [DERIVED] Must separate "prompt architecture is better" (claim under test) from "Claude 4.6 is better" (benefit any ChatGPT user also gets).

## Process constraints
- [OBSERVED] 8-week launch budget means no architectural rewrites mid-build; the stack chosen in blueprint is the stack.
- [OBSERVED] Launch-package assets from night-project C must be retargeted, not rebuilt.

## Constraint rationale
- The 8-week budget and "absorb don't add" rule come from Robin's documented build-vs-ship pattern — this case exists precisely because that pattern re-activated.
- The hallucination constraint comes from the blueprint itself identifying AI-detection and trust as primary market risk.

## What must not be simplified
- First-niche choice — collapsing to "generic tool for everyone" kills the structural-scaffolding advantage.
- Editor-blind-test quality bar — replacing with "looks good to Robin" reintroduces the variance problem the product claims to solve.
- Relationship with Bacowr — treating them as independent products doubles the shipping surface for no gain.
