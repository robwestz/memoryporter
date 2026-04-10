# Stage 3: Eval — Bidirectional Skill Evaluation

**Input:** Candidate Skill + Intent Document + Resolution Decision
**Output:** Eval Verdict (pass/improve/fail) + Improvement Map
**Gate:** Coverage score >= 70 to proceed to adaptation

## Purpose

This is the gamechanger. Before a skill is used, eval determines whether it CAN produce correct output. But unlike a simple pass/fail gate, it evaluates in TWO directions:

- **Forward:** "Given this skill, will it satisfy the intent's success criteria?"
- **Backward:** "What does the ideal skill look like for this intent, and where does the candidate fall short?"

The forward eval catches bad skills. The backward eval teaches the system what good looks like, enabling targeted improvement instead of blind retry.

## Why Bidirectional

Unidirectional eval (just forward) answers: "Does this work? Yes/No."

Bidirectional eval answers: "Does this work? If not, here's EXACTLY what the winning version would do differently." This means:
- Failed evals produce actionable improvement maps, not just rejections
- The resolver gets specific guidance for its next attempt, not "try again"
- Over time, the system accumulates knowledge about what makes skills effective for specific intent classes

## Forward Eval: Coverage Analysis

For each success criterion in the Intent Document, check whether the candidate skill's steps/rules would produce that outcome.

### Process

1. Read the candidate skill completely (short skill rules OR knowledge skill steps)
2. For each success criterion:
   - **COVERED**: The skill has a step/rule that directly produces this outcome
   - **PARTIAL**: The skill addresses the area but not the specific assertion
   - **MISSING**: The skill has no step/rule related to this criterion
3. Score: `coverage = (COVERED × 1.0 + PARTIAL × 0.5) / total_criteria × 100`

### Scoring Table

```
Success criterion: "cargo test passes with 0 failures"
├── Skill has "run tests after implementation" rule     → COVERED (1.0)
├── Skill mentions "verify" but not specific command     → PARTIAL (0.5)
└── Skill has no testing/verification step               → MISSING (0.0)
```

### Constraint Check

For each anti-goal in the Intent Document:
- **SAFE**: The skill explicitly avoids this (or its scope doesn't touch it)
- **RISK**: The skill's steps could violate this anti-goal
- **VIOLATION**: The skill's steps would definitely violate this anti-goal

Any VIOLATION = automatic fail regardless of coverage score.
Each RISK = -10 from coverage score.

### Forward Eval Output

```yaml
forward_eval:
  coverage_score: 75
  criteria_analysis:
    - criterion: "cargo test passes with 0 failures"
      status: COVERED
      evidence: "Rule 4: 'Add integration tests for connect, auth-fail, and message exchange'"
    - criterion: "GET /ws returns WebSocket upgrade"
      status: COVERED
      evidence: "Rule 1: 'Implement upgrade handler'"
    - criterion: "Sending JSON returns response with session_id"
      status: PARTIAL
      evidence: "Rule 2 mentions JSON protocol but not session_id specifically"
    - criterion: "No ?key= returns 401"
      status: COVERED
      evidence: "Rule 1: 'authentication before connection'"
    - criterion: "At least 2 new tests"
      status: COVERED
      evidence: "Rule 4 specifies 3 test scenarios"
  constraint_check:
    - anti_goal: "Must not change existing REST endpoints"
      status: SAFE
      evidence: "Skill scope is WebSocket only"
    - anti_goal: "Must not add new dependencies beyond axum ws"
      status: SAFE
      evidence: "No dependency additions in skill rules"
```

## Backward Eval: Ideal Skill Profile

This is where the learning happens. Independent of the candidate, construct what the perfect skill for this intent would look like.

### Process

1. Read the Intent Document's goal, success criteria, and project context
2. For each success criterion, define the MINIMUM skill step needed to produce it
3. Identify prerequisite knowledge (what must the agent understand before executing?)
4. Identify verification steps (how does the agent confirm each criterion is met?)
5. Identify risk mitigations (what could go wrong, and what prevents it?)

### Ideal Skill Profile

```yaml
ideal_skill_profile:
  minimum_steps:
    - "Read existing router to understand route registration pattern"
    - "Add axum ws feature to Cargo.toml"
    - "Implement ws_handler function with upgrade, auth, message loop, cleanup"
    - "Add route /ws to router"
    - "Implement JSON message protocol with session_id in responses"
    - "Write test: successful connection"
    - "Write test: auth failure returns 401"
    - "Write test: JSON message exchange"
    - "Run cargo test to verify"
  prerequisite_knowledge:
    - "axum 0.7 WebSocket API (extract::ws::WebSocket)"
    - "Existing test pattern (oneshot + isolated_state)"
    - "Current router structure in lib.rs"
  risk_mitigations:
    - risk: "WebSocket state leak on disconnect"
      mitigation: "Explicit cleanup in drop/disconnect handler"
    - risk: "Auth bypass via missing key check"
      mitigation: "Extract and verify key BEFORE upgrade"
  verification_steps:
    - "cargo test --workspace (all existing + new tests pass)"
    - "cargo clippy (no warnings)"
```

## Comparison: Candidate vs. Ideal

Now compare the candidate to the ideal profile:

```yaml
comparison:
  candidate_has_that_ideal_lacks: []  # rare but possible — indicates over-specification
  ideal_has_that_candidate_lacks:
    - gap: "No step to read existing router before implementing"
      severity: "medium"
      impact: "Agent might create incompatible route registration"
    - gap: "No mention of session_id in JSON responses"
      severity: "high"
      impact: "Success criterion 3 would fail"
    - gap: "No explicit cleanup on disconnect"
      severity: "medium"
      impact: "Potential resource leak in long-running gateway"
  alignment_score: 75  # percentage of ideal steps covered by candidate
```

## Improvement Map

The improvement map is the actionable output. It tells the resolver and adapter exactly what to fix.

```yaml
improvement_map:
  critical:  # Must fix — without these, success criteria fail
    - gap: "JSON responses must include session_id"
      fix: "Add rule: 'Include session_id in every JSON response message'"
      affects_criteria: ["Sending JSON returns response with session_id"]
  recommended:  # Should fix — improves reliability
    - gap: "No step to read existing code first"
      fix: "Add step: 'Read lib.rs router before implementing to match patterns'"
      rationale: "Prevents incompatible route registration"
    - gap: "No disconnect cleanup"
      fix: "Add rule: 'Remove connection from active set on disconnect'"
      rationale: "Prevents resource leak"
  optional:  # Nice to have
    - gap: "No mention of cargo clippy"
      fix: "Add verification: 'cargo clippy --workspace passes'"
```

## Verdict

```yaml
verdict:
  result: "pass | improve | fail"
  coverage_score: 75
  alignment_score: 75
  constraint_violations: 0
  critical_gaps: 1
  action: "PROCEED_WITH_IMPROVEMENTS | LOOP_BACK_TO_RESOLVER | STOP_AND_REPORT"
```

### Decision Matrix

| Coverage | Critical Gaps | Constraint Violations | Verdict |
|----------|--------------|----------------------|---------|
| >= 90 | 0 | 0 | **pass** — proceed to adapter without changes |
| 70-89 | 0-2 | 0 | **improve** — proceed to adapter WITH improvement map |
| < 70 | any | 0 | **fail** — loop back to resolver |
| any | any | >= 1 | **fail** — loop back to resolver (constraint violation is blocking) |

### On fail: loop-back payload

```yaml
eval_loopback:
  iteration: 1  # max 2
  previous_candidate: "websocket-gateway-endpoint"
  previous_coverage: 45
  improvement_map: { ... }  # full map from above
  resolver_hint: "The candidate lacked auth and session management depth. 
                  Search knowledge skills for session_management and permission patterns.
                  Consider composing two skills."
```

The resolver receives this and re-executes Step 2-4 with the improvement context weighted into scoring.

## What the Agent Learns

The backward eval produces knowledge that persists beyond this single resolution:

1. **What makes a skill work for this intent class** — the ideal profile
2. **Common gaps in the corpus** — if the same gap appears across multiple evals, the corpus needs a new skill
3. **Effective skill structure** — which rules/steps actually map to success criteria

This is NOT automatically saved — but it SHOULD be logged as a discovery if the gap is novel:

```bash
# If a novel gap pattern is found:
# "The existing corpus has no skill covering WebSocket + auth composition"
# This signals that a permanent skill should be created after the task completes.
```
