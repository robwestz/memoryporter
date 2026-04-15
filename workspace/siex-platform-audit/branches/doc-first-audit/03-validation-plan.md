# Validation plan - doc-first-audit

## Success tests
- **Primary (mechanical):** Fresh Claude Code session with only `docs/siex-audit/SKILL.md` + `capability-map.md` + `gap-list.md` + read-access to `D:/sie_x/` + 60-minute timer. Task: propose one working new adapter. Passes if the proposed adapter (a) imports the right core/transformer files, (b) defines a concrete `smart_constraints`-style contract, (c) pairs with a prompt file, (d) either runs or fails with a diagnostic message pointing at a named gap (a useful failure is a pass — the gap list predicted it).
- **Secondary:** Robin reads the capability map and can correctly state, for each of the 5 domain transformers, whether it is [PRODUCTION] / [WORKING-ISOLATED] / [SCAFFOLD] / [UNVERIFIED]. Self-scored; passes if Robin's read matches the map.
- **Tertiary:** Gap list contains ≥3 missing core/engine/pipeline files with specific expected capability and file path. Robin confirms at least one of them is a "yes, I've been missing that" recognition.
- **Continuity:** Bacowr produces at least one successful content run during the branch window. Cannot be failed by the audit itself — this is the circuit-breaker that says "audit is not starving the revenue stream."

## Failure triggers
- **Probe timeout without working adapter:** 60 minutes pass and the fresh LLM produces nothing runnable AND no gap-list-predicted diagnostic. Skill-package is insufficient → iterate SKILL.md, re-run probe. Cap at 2 iterations.
- **Baseline `test_core.py` broken:** scope pivots — "audit Bacowr's merged copy as de-facto master" becomes the actual work. New branch needed; this branch pauses and feeds into option B.
- **Drift > 40%:** Bacowr is a fork, not a consumer. Skill-package cannot pretend to describe "SIE-X as platform" — it must describe "SIE-X and its Bacowr fork" as two separate artifacts. Re-open options matrix.
- **Scope explosion:** if any single file (xai.py, multilingual/engine.py, federated/*) pulls more than 4 hours of depth work, cap it at a summary card + [UNVERIFIED] status. The audit describes what exists; it does not DOCUMENT what exists in full depth.
- **Bacowr content run drops below baseline rate during audit:** audit is pulling attention from revenue. Pause the branch, return to Bacowr feature work, resume audit in the next planned block.
- **Robin cannot self-onboard from the skill-package:** if Robin reads the output and still says "I don't know what this file does" for more than 30% of [KEY] files, the artifact failed its primary purpose. Iterate or retire.

## Rollback or containment
- All outputs live in `docs/siex-audit/` (inside portable-kit, not inside D:/sie_x/). Rollback = `rm -rf docs/siex-audit/`. Zero effect on SIE-X, Bacowr, or any consumer.
- If the audit triggers a code change (it must not, per charter, but if an emergency arises) — any such change lives on a feature branch of SIE-X, not on master. SIE-X master stays untouched.
- If the fresh-LLM-probe test itself accidentally runs a destructive command against D:/sie_x/, the probe session's permissions must be read-only. Enforce via the spawning command's working directory + restricted permissions, not vibes.

## Demo artifacts
- `docs/siex-audit/SKILL.md` — the skill-package LLM-consumable. <500 lines. Frontmatter with trigger phrases + negative triggers.
- `docs/siex-audit/capability-map.md` — one card per [KEY] file + edge assets. Card template fixed across all cards (path, purpose, I/O, deps, status, example usage).
- `docs/siex-audit/gap-list.md` — ≥3 missing core/engine/pipeline files. Per gap: name, expected capability, where it would live, what it would unlock, whether it's a [GAMECHANGER] or [QUALITY-OF-LIFE].
- `docs/siex-audit/drift-report.md` — table of SIE-X files that Bacowr has copied, with drift classification (identical / minor / major / diverged).
- `docs/siex-audit/five-probe-report.md` — the "5 probe" subsystem located or declared unresolvable.
- `docs/siex-audit/fresh-llm-probe-result.md` — the 60-minute test recording. Includes: starting prompt given to fresh LLM, what it produced, timing, pass/fail, evidence artifacts.
- `docs/siex-audit/bacowr-continuity-log.md` — content runs completed during audit window, before/after rates, any issues observed.
