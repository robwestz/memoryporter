# Branch charter - rescue-triage

## Branch objective
Three-phase rescue of SIE-X, informed by Wave 1 audit findings and
Robin's scope-clarification (2026-04-15): Bacowr is not a consumer,
4 non-SEO transformers were never wanted, preservation-bias applies —
"no home right now" does not mean "dead weight." Phase 1 removes only
uncontroversial dead weight. Phase 2 restructures surviving files into
clear homes and isolates the "no-home-yet" pool. Phase 3 runs
elevation challenges: pool files get paired under strict constraints
(≥2 files run together, produce something genuinely new, must be
commercially defensible) — file earns a permanent home or is formally
archived.

## Why this branch
- Wave 1 overturned the doc-first-audit branch's assumption that SIE-X is platform-ready for Bacowr consumption. SKILL.md authoring (Wave 2) must wait until SIE-X has an honest scope.
- Robin's clarification specifically directed this shape: remove obsolete Bacowr-bridge files + unwanted speculative transformers, keep infrastructure + edge, invite elevation of homeless files rather than culling them.
- Preservation of "accidental brilliance" (xai.py etc.) requires generativity, not just cleanup — the elevation-challenge mechanic turns preservation into compounding value.
- Produces three compounding artifacts: removal-log (what left and why), restructure-map (what lives where), and elevation-challenge-registry (what got elevated, what's pending).

## Inputs reused from core
- From Wave 1 `capability-map-wave1.md`: 21 status-tagged capability cards classifying files as [PRODUCTION] / [WORKING-ISOLATED] / [SCAFFOLD] / [UNVERIFIED].
- From Wave 1 `transformer-verification.md`: 4 of 5 transformers are [SCAFFOLD] / [RUNTIME-FAIL]; only SEO is [PASS] and per Robin now obsolete anyway.
- From Wave 1 `drift-report.md`: Bacowr is a FORK, not a consumer. 0 direct imports; 3 name-matched files all at FORK classification.
- From Wave 1 `gap-hunt.md`: 7/8 known issues still open; hybrid-loader crashes on first call; multilingual + enterprise-auth wired to nothing; top gap is `transformers/base.py`.
- From `02-repo-map.md` (case): full directory inventory + edge-asset list.
- From `03-constraint-map.md` (case): hard constraints (preserve edge, no rewrite, LLM-readable output, don't break Bacowr) — Bacowr constraint is now near-trivial given the FORK finding.
- From Robin's 2026-04-15 clarification: preservation-bias, unwanted speculative transformers, elevation-challenge framework with honest-commercial-gate.

## Non-goals
- NOT removing files that may have future homes as hero-file components. "No obvious use right now" is NOT grounds for removal.
- NOT building new transformers (future project: skill-package for authoring new transformers).
- NOT fixing infrastructure-level gaps (no real DB, no config mgmt, no tests, no deploy) — those stay for a later case.
- NOT re-integrating Bacowr (explicitly decoupled; Bacowr is its own codebase now).
- NOT writing SKILL.md (that's Wave 2 of doc-first-audit, runs AFTER this branch).
- NOT running fresh-LLM-probe (also Wave 2).

## Exit criteria
- Phase 1 (removal-execution):
  - All 5 transformer files moved to `.archive/2026-04-15-removed/` (not deleted; reversible).
  - `bacowr_adapter.py`, `writer_prompt.md`, `systems/*.md`, `D:/sie_x/sie_x/` mirror tree moved to archive.
  - `training/active_learning.py` undefined-logger bug fixed in place.
  - `removal-log.md` produced listing what was moved + per-file justification + cross-reference check.
- Phase 2 (restructuring + pool identification):
  - 3 "competing X" decisions made with rationale (minimal_server vs server, core/multilang vs multilingual/engine, api/auth vs auth/enterprise).
  - Every remaining file either has a clear natural home in the (possibly renamed) repo structure OR is placed in the elevation pool.
  - `restructure-map.md` produced showing new layout + elevation pool membership.
- Phase 3 (elevation challenges, iterative):
  - First challenge executed: `xai.py` + `multilingual/engine.py` → Cross-Lingual Attribution Engine.
  - Challenge constraints verified: (a) both files run together end-to-end, (b) output is novel for SIE-X, (c) I can honestly defend its commercial viability to a buyer.
  - If challenge passes: the paired capability earns a permanent module home + registered in `elevation-registry.md` with commercial pitch.
  - If challenge fails: the attempt is documented with failure mode + files return to pool for future attempts OR move to archive.
  - Subsequent challenges queued for remaining pool files; executed in future sessions.
- Bacowr's article-output rate verified unchanged at branch close (trivial since Bacowr is a fork — but confirmed as ZERO impact).
