# Protocol: Agent Orchestration

How to coordinate multiple agents working on the same project.

## Core Principle

Agents should be **isolated by default, coordinated by contract**. Each agent has its own permission scope, tool access, and output format. The orchestrator decides what runs in parallel vs. sequentially.

## Patterns

### 1. Fan-Out / Fan-In

**When:** Multiple independent analyses or implementations.

```
Orchestrator
├── Agent A (ReadOnly)  → analysis.json
├── Agent B (ReadOnly)  → analysis.json
└── Agent C (ReadOnly)  → analysis.json
         ↓
   Orchestrator merges results
         ↓
   Agent D (WorkspaceWrite) → implementation
```

**Rules:**
- Fan-out agents get ReadOnly permission
- They NEVER write to shared files
- Orchestrator synthesizes before fan-in

### 2. Pipeline

**When:** Each step depends on the previous step's output.

```
Agent A (analysis) → output.json
    ↓
Agent B (planning) → plan.md
    ↓
Agent C (execution) → code changes
    ↓
Agent D (verification) → test results
```

**Rules:**
- Each agent reads the previous agent's output file
- Agents don't share memory or context
- Pipeline stops if any agent fails verification

### 3. Supervisor + Workers

**When:** Long-running task with checkpoints.

```
Supervisor (manages state)
├── Worker 1 (task A) → reports back
├── Worker 2 (task B) → reports back
└── Worker 3 (task C) → reports back
         ↓
   Supervisor checks results
         ↓
   Next batch of workers
```

**Rules:**
- Supervisor holds the plan and state
- Workers get scoped instructions + minimal context
- Workers report structured results, not free-form text

## Permission Scoping

| Role | Permission | Rationale |
|------|-----------|-----------|
| Analyst / Scout | ReadOnly | Can't accidentally break things |
| Implementer | WorkspaceWrite | Writes to project files only |
| Orchestrator | WorkspaceWrite | Manages plans and state |
| Full-access | DangerFullAccess | Shell commands, network, git |

**Default to minimum permission.** Escalate only when the task requires it.

## Communication Contract

Agents communicate via files, not messages. Each agent:
1. Reads its input file(s)
2. Writes its output file
3. Returns a structured summary (not the full output)

```json
{
  "agent": "deep-analyst",
  "status": "completed",
  "output_file": ".tmp/analysis-result.json",
  "summary": "Found 3 gamechangers, 7 skills",
  "errors": []
}
```

## Anti-Patterns

- **Shared mutable state:** Two agents writing to the same file. Use separate output files + merge step.
- **Unbounded fan-out:** Spawning 10+ agents. Keep it to 3-5 parallel, more sequential.
- **Context forwarding:** Passing one agent's full context to another. Send only the structured output.
- **No verification gate:** Running implementation after analysis without checking the analysis.
- **Permission escalation by proxy:** A ReadOnly agent asking a WriteAccess agent to make changes it shouldn't.

## Orchestration State

Track orchestration in a YAML file:

```yaml
plan: "Extract knowledge from new codebase"
started: 2025-01-15T10:00:00Z
waves:
  - name: "Analysis"
    status: completed
    agents:
      - { name: "analyst-1", status: completed, output: ".tmp/analysis-1.json" }
      - { name: "analyst-2", status: completed, output: ".tmp/analysis-2.json" }
  - name: "Synthesis"
    status: in_progress
    agents:
      - { name: "synthesizer", status: running }
  - name: "Verification"
    status: pending
```
