# Failure mode atlas - siex-platform-audit

Tag each bullet with an evidence class (`[OBSERVED]`, `[DERIVED]`,
`[ASSUMED]`, `[OPEN-RISK]`).

## Likely failure modes
- [OBSERVED] Audit becomes a rewrite — the "komplicerat att ändra minsta lilla utan att det går sönder" temptation flips to "rewrite it clean" — and the accidental brilliance (xai.py, multilingual, streaming) is lost because Robin cannot reconstruct what he built without understanding
- [OBSERVED] Bacowr breaks mid-audit — consolidation touches a file Bacowr's fragment-import depends on; Q1-style revenue is interrupted; Robin pulls back, audit stalls
- [OBSERVED] The skill-package becomes a pretty lie — it describes the system as it should be (per arch doc) rather than as it is (drift + dead pipeline + version fragmentation); a future LLM reads it, tries to build against it, fails, and nobody knows why
- [DERIVED] The "several versions" problem is skipped — Robin merges upward without resolving which is canonical, result is a seventh version
- [DERIVED] Scope explosion from edge files — xai.py deserves a deep dive, multilingual deserves one, federated deserves one, and the audit never completes because each "cool file" pulls depth
- [ASSUMED] LLM-readability target is not measurable — "a fresh LLM can onboard in 30 minutes" sounds concrete but nobody actually runs the test, so the skill-package can silently fail its primary purpose
- [OPEN-RISK] Robin's build-vs-ship pattern triggers mid-audit — the audit feels productive, produces no revenue, Bacowr stalls while Robin "finishes SIE-X"; this is the same trap the writer-tool case was built to prevent
- [OPEN-RISK] The audit's branch-of-choice turns out to depend on information only verifiable by running SIE-X end-to-end — and no working end-to-end runner exists outside Bacowr's merged copy

## Existing safeguards
- [OBSERVED] repo-strategy-orchestrator's state machine — cannot scaffold a branch until strict audit passes on the core stage
- [OBSERVED] The anti-simplification review template in options-matrix — forces Robin to name what disappears if each option "wins"
- [OBSERVED] Evidence tags — [OBSERVED] vs [ASSUMED] separation makes every claim inspect-able
- [OBSERVED] The parallel writer-tool-commit case is paused, not killed — if SIE-X audit turns out to be the wrong move, writer-tool is resumable with no rework
- [OBSERVED] Bacowr's independence — its fragment-import means Bacowr keeps running even if SIE-X master is under audit; the revenue stream is not load-bearing on audit success
- [OBSERVED] cases.jsonl index — every case is resumable and cross-referenceable; no audit work is lost if interrupted
- [OBSERVED] FULL_SYSTEM_ARCHITECTURE.txt — while 2 months old, it is a substantial starting artifact; audit is not starting from zero

## Missing safeguards
- [OPEN-RISK] No automated LLM-readability test — "can a fresh LLM onboard in 30 minutes" has no harness; needs explicit verification procedure in branch plan
- [OPEN-RISK] No Bacowr-integration regression test — no way to confirm "this change didn't break Bacowr" without Robin manually running Bacowr's pipeline
- [OPEN-RISK] No canonical-version registry — "several versions" exist without metadata about which is newest/best
- [OPEN-RISK] No drift measurement between SIE-X master and Bacowr's merged copy
- [OPEN-RISK] No explicit kill-criteria for the audit — at what point does Robin pause the audit and return to Bacowr feature work? Without a trigger, audit could run indefinitely
- [OPEN-RISK] No test suite beyond core/test_core.py (known-issue #10) — regressions invisible during consolidation

## Verification ideas
- Run SIE-X's `core/test_core.py` as baseline before any consolidation work; any branch that breaks it is rejected
- Diff Bacowr's merged SIE-X files against D:/sie_x/ master — produces drift map, first evidence of "how different" the copies are
- Spawn a fresh Claude Code session with ONLY the audit output + D:/sie_x/ access; ask it to propose one new transformer; time to first-working-proposal is the LLM-readability score
- Use the skill-package output itself as input to skill-forge — test whether a skill can be machine-built from it (proves it's structured enough)
- Track Bacowr's article-output rate weekly during audit — if it drops, audit is pulling attention from revenue work, trigger kill-criteria review

## False positive improvements to watch for
- [ASSUMED] "The arch doc is now up-to-date" — re-updating v2.1.0 to v2.2.0 without code verification just moves the lying-doc forward
- [ASSUMED] "We identified the missing core files" — naming them is not building them; the risk is treating the list as the deliverable
- [ASSUMED] "A nice architecture diagram" — diagrams without executable contracts convince nobody after first use
- [ASSUMED] "LLM can now describe the system" — the LLM describing is not the LLM extending; measure extension capacity, not description fluency
- [ASSUMED] "8 of 8 known issues addressed" — closing issue-tracker items without measuring whether they were actually the bottleneck
- [OBSERVED] "Robin feels better about SIE-X" — feelings are data but not evidence; if Bacowr output drops during an audit that "feels good", the feeling is a false positive
