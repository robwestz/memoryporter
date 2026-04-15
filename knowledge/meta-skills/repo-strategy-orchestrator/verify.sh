#!/usr/bin/env bash
# End-to-end verification for repo-strategy-orchestrator.
#
# Bootstraps a throwaway case, fills the core artifacts with minimal
# content that satisfies the strict audit, advances the stage,
# scaffolds a branch, runs present_case.py, then cleans up.
#
# Exit 0 = the installed skill is functional. Exit 1 = something broke
# (broken scripts, missing Python, path issues, etc.).

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE="$(mktemp -d)"
CASE_SLUG="verify-smoke-$(date +%s)"
CASE_DIR="${WORKSPACE}/${CASE_SLUG}"

PYTHON="${PYTHON:-python}"

cleanup() {
  rm -rf "${WORKSPACE}"
}
trap cleanup EXIT

step() {
  echo
  echo ">>> $1"
}

fail() {
  echo
  echo "VERIFY FAILED: $1"
  exit 1
}

step "1/6  bootstrap_case.py"
"${PYTHON}" "${SCRIPT_DIR}/scripts/bootstrap_case.py" \
  "${CASE_SLUG}" "verify that the installed skill works end-to-end" \
  --repo "verify-host" \
  --workspace "${WORKSPACE}" > /dev/null || fail "bootstrap_case.py did not exit 0"

[ -f "${CASE_DIR}/case.json" ] || fail "case.json not created"
[ -f "${CASE_DIR}/core/01-request-brief.md" ] || fail "core artifacts not created"
echo "  OK"

step "2/6  populate core artifacts with minimal content"
"${PYTHON}" - "${CASE_DIR}" <<'PY'
import sys
from pathlib import Path

case_dir = Path(sys.argv[1])
content = {
    "core/01-request-brief.md": """# Request brief - verify
## Objective
Verify the installed skill end-to-end.
## Repo target
- Repo hint: verify-host
## Known facts
- [OBSERVED] verify.sh dogfoods the whole pipeline.
## Open questions
- [ASSUMED] minimal content passes strict audit on install.
## Done criteria
- Scripts exit 0 in order.
""",
    "core/02-repo-map.md": """# Repo map - verify
## Entry points
- bootstrap_case.py launches the pipeline.
## Key modules
- scripts/ directory contains the four scripts under test.
## Interfaces and dependencies
- Pure Python stdlib, no external packages required.
## Build and runtime cues
- Python 3.10+ required for modern union syntax.
## Unknowns
- [OPEN-RISK] none at verification time.
""",
    "core/03-constraint-map.md": """# Constraint map - verify
## Hard constraints
- [OBSERVED] scripts must be idempotent and side-effect scoped to workspace.
## Soft constraints
- [OBSERVED] verify.sh must finish within a few seconds.
## Epistemic constraints
- [DERIVED] this verify run is not a substitute for real content.
## Process constraints
- [OBSERVED] cleanup on exit preserves user's disk.
## Constraint rationale
- A broken install must be loud, not silent.
## What must not be simplified
- The end-to-end round trip — skipping steps hides real breakage.
""",
    "core/04-purpose-chain.md": """# Purpose chain - verify
## User outcome
The user can trust that the installed scripts run without manual fixup.
## Intermediate effects
- Bootstrap writes workspace; audit passes; scaffold runs; present runs.
## Step-to-step dependencies
- Each step gates the next; state machine enforces order.
## Global success conditions
- All four scripts return exit 0 against the synthetic content.
## Local optimizations to avoid
- Loosening strict audit to get past this test — defeats the purpose.
""",
    "core/05-failure-mode-atlas.md": """# Failure mode atlas - verify
## Likely failure modes
- [OBSERVED] Python version mismatch or path issues.
## Existing safeguards
- [OBSERVED] set -euo pipefail stops on first failure.
## Missing safeguards
- [OPEN-RISK] no timeout on long-running scripts.
## Verification ideas
- Run this script after every install and before every release.
## False positive improvements to watch for
- [ASSUMED] passing verify does not prove production readiness.
""",
    "core/06-options-matrix.md": """# Options matrix - verify
## Standard options
- Option A: ship the verify script as-is.
- Option B: add Windows-specific path handling.
- Option C: defer and build CI instead.
## Comparison matrix
| Option | Preserves | Changes | Evidence needed | Main risk |
|---|---|---|---|---|
| A | simplicity | none | manual runs | platform gaps |
| B | Unix paths | adds branching | test matrix | complexity |
| C | stability | nothing | CI config | slower iteration |
## Recommendation posture
- Preferred option and why: A — works on the primary target today.
- Why the other options still remain valid: B is next iteration if gaps surface; C is safety net.
## User-defined option slot
- Custom option label:
- Closest standard pattern:
- What stays standard:
- What becomes custom:
## Anti-simplification review
1. What existing safeguard would disappear if this option succeeded locally?
   - A: none — safeguards preserved.
   - B: the simplicity of the test harness.
   - C: active verification presence during development.
2. Which output looks better in isolation but weakens the global purpose chain?
   - A: verify passes on primary platform but hides edge-case failures.
   - B: test matrix green but slower to iterate.
   - C: CI green but fewer humans running it locally.
3. Which assumption is being smuggled in as if it were proven?
   - A: that the primary platform covers most install targets.
   - B: that the added complexity is worth the platform coverage.
   - C: that CI failure visibility equals developer awareness.
4. What would a false-positive "improvement" look like here?
   - A: verify passes but strict audit was quietly relaxed.
   - B: matrix green because tests are weak, not because code is strong.
   - C: CI green because nobody reads the logs.
""",
}
for rel, body in content.items():
    (case_dir / rel).write_text(body, encoding="utf-8")
PY
echo "  OK"

step "3/6  mechanical_audit.py --strict (expect PASS + stage advance)"
"${PYTHON}" "${SCRIPT_DIR}/scripts/mechanical_audit.py" "${CASE_DIR}" --strict > /dev/null \
  || fail "strict audit did not pass on filled content"

STAGE=$("${PYTHON}" -c "import json,sys; print(json.load(open(sys.argv[1]))['stage'])" "${CASE_DIR}/case.json")
[ "${STAGE}" = "awaiting-user-choice" ] || fail "stage did not advance (got: ${STAGE})"
echo "  OK — stage now: ${STAGE}"

step "4/6  scaffold_branch.py"
"${PYTHON}" "${SCRIPT_DIR}/scripts/scaffold_branch.py" \
  "${CASE_DIR}" upgrade-existing --name verify-path > /dev/null \
  || fail "scaffold_branch.py did not exit 0"

[ -f "${CASE_DIR}/branches/verify-path/01-branch-charter.md" ] \
  || fail "branch artifacts not created"

STAGE=$("${PYTHON}" -c "import json,sys; print(json.load(open(sys.argv[1]))['stage'])" "${CASE_DIR}/case.json")
[ "${STAGE}" = "branch-active" ] || fail "stage did not flip to branch-active (got: ${STAGE})"
echo "  OK — stage now: ${STAGE}"

step "5/6  present_case.py"
"${PYTHON}" "${SCRIPT_DIR}/scripts/present_case.py" "${CASE_DIR}" --skip-audit > /dev/null \
  || fail "present_case.py did not exit 0"

[ -f "${CASE_DIR}/presentation-brief.md" ] || fail "presentation-brief.md not created"
grep -q "Showcase brief" "${CASE_DIR}/presentation-brief.md" \
  || fail "presentation-brief.md missing expected header"
echo "  OK"

step "6/6  cases.jsonl index"
INDEX="${WORKSPACE}/cases.jsonl"
[ -f "${INDEX}" ] || fail "cases.jsonl was not created"
EVENTS=$(wc -l < "${INDEX}")
[ "${EVENTS}" -ge 2 ] || fail "expected >=2 events in cases.jsonl, got ${EVENTS}"
echo "  OK — ${EVENTS} events recorded"

echo
echo "=== VERIFY PASSED ==="
echo "  All four scripts work end-to-end."
echo "  Installed skill is ready for real cases."
