# Stage 1: Intake — Intent Capture & Specification

**Input:** Raw task description + project context
**Output:** Intent Document (structured YAML block)
**Gate:** Document must have all required fields filled with testable content

## Purpose

Before searching for or creating a skill, the agent must understand WHAT is being asked and WHY. This stage produces a structured Intent Document that becomes the contract for every subsequent stage. Without it, the resolver guesses, the eval has nothing to measure against, and the adapter has no constraints to enforce.

The Intent Document is the "specificerare" — it turns vague requests into testable contracts.

## Process

### Step 1: Extract the goal

Ask: "What is the single concrete outcome this task must produce?"

Not "build a dashboard" but "produce a Next.js page at /metrics that displays 3 charts from the Supabase analytics table, refreshing every 30s."

The goal must be:
- **Observable** — you can tell whether it happened
- **Bounded** — it has a clear end state
- **Singular** — one goal per Intent Document (decompose compound tasks)

### Step 2: Define anti-goals (constraints)

Ask: "What must this task NOT do, NOT change, NOT affect?"

Anti-goals are as important as goals. They prevent scope creep and make eval possible by defining the negative space. Examples:
- "Must not modify existing API routes"
- "Must not add new dependencies"
- "Must not change the database schema"
- "Must not introduce client-side state management"

Aim for 2-5 anti-goals. If you can't think of any, the goal isn't specific enough.

### Step 3: Define success criteria

Ask: "How would you verify this task is done correctly, without reading the implementation?"

Each criterion must be a testable assertion — something that can be checked by running a command, reading a file, or calling an endpoint. Format: `[verb] [target] [condition]`.

Examples:
- "Running `cargo test` produces 0 failures"
- "GET /api/metrics returns JSON with keys: cpu, memory, requests"
- "The file `src/metrics.tsx` exists and exports a default React component"
- "No files outside `src/dashboard/` are modified"

Minimum 3 success criteria. If the task is complex, aim for 5-8.

### Step 4: Capture project context

Gather what the resolver and adapter will need:
- **Language/stack** — what's this project built with?
- **Conventions** — naming, file structure, test patterns
- **Existing assets** — relevant files, modules, configs already in place
- **Permission scope** — ReadOnly / WorkspaceWrite / DangerFullAccess

### Step 5: Classify complexity

| Class | Description | Resolver behavior |
|-------|-------------|-------------------|
| `simple` | Single skill, clear implementation path | Match existing skill, skip creation |
| `compound` | Multiple skills needed in sequence | Resolve primary skill, note dependencies |
| `orchestration` | Multi-agent coordination required | Resolve orchestration skill + sub-skills |

## Output: Intent Document

```yaml
intent:
  goal: "One sentence describing the concrete outcome"
  anti_goals:
    - "What this must NOT do (constraint 1)"
    - "What this must NOT do (constraint 2)"
    - "What this must NOT do (constraint 3)"
  success_criteria:
    - "Testable assertion 1"
    - "Testable assertion 2"
    - "Testable assertion 3"
  project_context:
    language: "rust"
    stack: ["axum", "tokio", "serde"]
    conventions: "snake_case, one module per file, tests in tests/"
    existing_assets:
      - "src/lib.rs — main router"
      - "tests/integration.rs — test harness"
    permission_scope: "WorkspaceWrite"
  complexity: "simple | compound | orchestration"
  decomposition:  # only for compound/orchestration
    - sub_goal: "First sub-task"
      depends_on: []
    - sub_goal: "Second sub-task"
      depends_on: ["First sub-task"]
```

## Validation Checklist

Before passing to resolver, verify:

- [ ] Goal is a single sentence with an observable outcome
- [ ] At least 2 anti-goals defined
- [ ] At least 3 success criteria, all testable without reading implementation
- [ ] Project context includes language and permission scope
- [ ] Complexity class is assigned
- [ ] If compound/orchestration: decomposition has sub-goals with dependencies

## Common Failure Modes

| Symptom | Fix |
|---------|-----|
| Goal is vague ("make it better") | Ask: "Better how? What does the user see/get that they don't have now?" |
| No anti-goals | Ask: "What adjacent systems should this absolutely not touch?" |
| Success criteria are subjective ("looks good") | Rewrite as commands or file assertions |
| Complexity underestimated | If > 3 success criteria touch different subsystems → compound |

## Example

**Raw task:** "Add WebSocket support to the gateway"

**Intent Document:**
```yaml
intent:
  goal: "Add a /ws endpoint to claw-gateway that accepts WebSocket connections, authenticates via ?key= query parameter, and relays JSON messages to/from the runtime"
  anti_goals:
    - "Must not change existing REST endpoints"
    - "Must not add new crate dependencies beyond axum ws feature"
    - "Must not store WebSocket state on disk"
  success_criteria:
    - "cargo test --workspace passes with 0 failures"
    - "Connecting to ws://localhost:18789/ws returns a WebSocket upgrade response"
    - "Sending {\"message\":\"ping\"} over WebSocket returns a JSON response with session_id"
    - "Connecting without ?key= when api_key is set returns 401"
    - "At least 2 new tests in gateway_tests.rs covering WebSocket"
  project_context:
    language: "rust"
    stack: ["axum 0.7", "tokio", "serde_json"]
    conventions: "integration tests use oneshot pattern, isolated_state() for test state"
    existing_assets:
      - "rust/crates/claw-gateway/src/lib.rs — router + handlers"
      - "rust/crates/claw-gateway/tests/gateway_tests.rs — 25 existing tests"
    permission_scope: "WorkspaceWrite"
  complexity: "simple"
```

This document now drives every subsequent stage. The resolver searches for a skill that matches "WebSocket endpoint + auth + JSON relay". The eval checks whether the candidate skill can satisfy all 5 success criteria. The adapter tunes the skill for axum 0.7 with the existing test patterns.
