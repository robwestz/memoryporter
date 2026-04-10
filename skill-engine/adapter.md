# Stage 4-5: Adapt & Verify — Project-Local Skill + Execution Verification

**Input:** Evaluated Skill + Improvement Map + Intent Document
**Output:** Project-local skill file + Post-execution verification result
**Gate:** Adapted skill passes structural validation; execution output satisfies success criteria

## Purpose

The adapter takes an evaluated skill and makes it work for THIS project. It copies, modifies, injects project context, and after execution, verifies the output against the original intent. Originals are never modified — the project gets its own copy.

## Part 1: Adaptation

### Step 1: Create project skill directory

```
{project_root}/.skills/
└── {skill-name}.md
```

If `.skills/` doesn't exist, create it. Each resolved task gets its own skill file here.

### Step 2: Copy the candidate

- **Short skill:** Copy the YAML block + rules into a new markdown file
- **Knowledge skill:** Copy the full `.md` file
- **Newly created skill:** Already in short-skill format from resolver

### Step 3: Apply improvement map

For each item in the improvement map (from eval-engine):

**Critical items** — MUST be applied:
- Add missing rules/steps as specified in the `fix` field
- Place them in logical order relative to existing steps
- Mark the addition with a comment: `# [adapted: {gap description}]`

**Recommended items** — SHOULD be applied:
- Add unless they conflict with an existing rule
- If conflict: keep the existing rule, note the recommendation as a comment

**Optional items** — apply only if they don't increase complexity:
- Add as verification steps at the end
- Skip if the skill is already at 8+ steps

### Step 4: Inject project context

Replace generic patterns with project-specific details from the Intent Document:

| Generic | Project-specific |
|---------|-----------------|
| "Run tests" | `cargo test --workspace` (from project_context.stack) |
| "Read existing code" | "Read `src/lib.rs` lines 1-50 to understand router" (from existing_assets) |
| "Follow naming conventions" | "Use snake_case, one module per file" (from conventions) |
| Language-agnostic code template | Adapt to project language |

### Step 5: Add success criteria as verification block

Append the Intent Document's success criteria as a verification checklist at the end of the skill:

```markdown
## Verification (from intent)

- [ ] cargo test --workspace passes with 0 failures
- [ ] GET /ws returns WebSocket upgrade
- [ ] Sending {"message":"ping"} returns JSON with session_id
- [ ] No ?key= when api_key is set returns 401
- [ ] At least 2 new tests in gateway_tests.rs
```

This makes the skill self-verifying — the agent executing it knows exactly what to check.

### Step 6: Structural validation

Before the adapted skill is used, verify:

- [ ] Has a name (YAML frontmatter or heading)
- [ ] Has at least 3 rules/steps
- [ ] Has a verification section with testable items
- [ ] No references to non-existent files (check existing_assets against actual filesystem)
- [ ] Rules are imperative (start with a verb)
- [ ] No conflict between rules and anti-goals

If validation fails, fix inline — don't loop back to resolver for structural issues.

## Example: Adapted Skill

**Original short skill (from resolver):**
```yaml
---
name: websocket-gateway-endpoint
kind: explicit
triggers: ["websocket", "ws endpoint", "realtime"]
priority: 7
source_evidence: ["intent-document"]
---
Use when adding WebSocket support to an HTTP gateway.

Rules:
- Implement upgrade handler with authentication before connection.
- Use JSON message protocol with typed message enums.
- Clean up connection state on disconnect.
- Add integration tests for connect, auth-fail, and message exchange.
```

**Adapted version (`.skills/websocket-gateway-endpoint.md`):**
```markdown
# websocket-gateway-endpoint

Adapted for: claw-gateway (axum 0.7, Rust)
Intent: Add /ws endpoint with auth and JSON relay

## Steps

1. Read `rust/crates/claw-gateway/src/lib.rs` to understand the router
   registration pattern and existing handler signatures.

2. Add `ws` feature to axum in `Cargo.toml`:
   `axum = { version = "0.7", features = ["ws"] }`

3. Implement `ws_handler` function:
   - Extract `?key=` query parameter
   - Verify key against `state.api_key` — return 401 if mismatch
   - Upgrade connection to WebSocket
   - On each message: parse JSON, create/use session, respond with
     JSON including `session_id`
   # [adapted: JSON responses must include session_id]

4. Register route: `.route("/ws", get(ws_handler))`

5. Implement disconnect cleanup — remove connection from active tracking.
   # [adapted: explicit cleanup on disconnect]

6. Write test: successful WebSocket connection and message exchange
   using the existing `isolated_state()` pattern from gateway_tests.rs.

7. Write test: connection without `?key=` returns 401 when api_key is set.

8. Run `cargo test --workspace` — all existing + new tests must pass.

9. Run `cargo clippy --workspace --all-targets -- -D warnings` — no warnings.
   # [adapted: added clippy verification]

## Constraints (from intent anti-goals)

- Do NOT modify existing REST endpoint handlers
- Do NOT add dependencies beyond the axum ws feature
- Do NOT persist WebSocket state to disk

## Verification (from intent)

- [ ] `cargo test --workspace` passes with 0 failures
- [ ] Connecting to ws://localhost:18789/ws returns WebSocket upgrade
- [ ] Sending {"message":"ping"} returns JSON with session_id
- [ ] Connecting without ?key= when api_key is set returns 401
- [ ] At least 2 new tests in gateway_tests.rs covering WebSocket
```

## Part 2: Post-Execution Verification

After the skill has been executed (the actual task is done), verify the output.

### Process

1. Read the success criteria from the adapted skill's verification section
2. For each criterion, execute the verification:
   - **Command-based:** Run the command, check exit code and output
   - **File-based:** Check file exists, read content, verify properties
   - **Assertion-based:** Evaluate the condition programmatically
3. Score: `verified = passed / total`

### Verification Output

```yaml
post_verify:
  score: "4/5"
  results:
    - criterion: "cargo test passes with 0 failures"
      status: PASS
      evidence: "test result: 191 passed; 0 failed"
    - criterion: "GET /ws returns WebSocket upgrade"
      status: PASS
      evidence: "HTTP 101 Switching Protocols"
    - criterion: "JSON response includes session_id"
      status: PASS
      evidence: "response contains \"session_id\":\"sess-...\""
    - criterion: "No ?key= returns 401"
      status: PASS
      evidence: "HTTP 401 Unauthorized"
    - criterion: "At least 2 new tests"
      status: FAIL
      evidence: "Found 1 new test (expected >= 2)"
  overall: "MOSTLY_PASSED"
  action: "Log failure for criterion 5 as improvement note"
```

### What happens on failure

Post-verification failure does NOT trigger automatic re-execution. Instead:

1. **Log the failure** — what criterion failed, what was the actual output
2. **Flag to user** — "4/5 criteria passed. Criterion 5 (at least 2 new tests) failed: found 1 test."
3. **Suggest fix** — "Add a test for WebSocket message exchange to complete the criterion."
4. **Optionally log discovery** — if the failure reveals a pattern (e.g., "skills consistently undercount required tests"), log it for future intake stages.

The pipeline ends here. The user decides whether to fix the remaining criterion manually, ask the agent to fix it, or accept the result.

## Skill Promotion

If the adapted skill is used successfully (post-verify score >= 80%):
- **1st use:** keep in `.skills/` as working skill
- **2nd use:** refine wording and triggers
- **3rd use:** promote to permanent skill in the corpus

Promotion means:
1. Strip project-specific details
2. Generalize steps back to language-agnostic form
3. Add to `explicit-skills.md` as a new short skill
4. Optionally expand into a full knowledge skill in `knowledge/skills/`

This closes the loop: tasks create skills, skills serve future tasks.
