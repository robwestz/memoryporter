# ob1-runtime

All 18 infrastructure primitives for a production agentic system, implemented in Rust.

Derived from the Claw Code architecture analysis + Nate's 12-primitive framework.

## Architecture

```
ConversationRuntime<A: ApiClient, T: ToolExecutor>
    ├── ToolRegistry          (#1)   — metadata-first tool definitions
    ├── PermissionPolicy      (#2)   — graduated trust with 3 handler types
    ├── Session               (#3)   — crash-survivable persistence
    ├── Workflow              (#4)   — idempotent multi-step execution
    ├── BudgetTracker         (#5)   — pre-turn token budget checking
    ├── StreamEventDispatcher (#6)   — typed event stream
    ├── EventLogger           (#7)   — system event log (not conversation)
    ├── VerificationSuite     (#8)   — invariant checks
    ├── ToolPool              (#9)   — 3-layer per-session filtering
    ├── Compaction            (#10)  — transcript summarization
    ├── AuditTrail            (#11)  — permission decision log
    ├── Doctor                (#12)  — health check system
    ├── BootSequence          (#13)  — 7-stage startup with trust gate
    ├── StopReason            (#14)  — taxonomy of conversation endings
    ├── ContextAssembler      (#15)  — provenance-aware context
    ├── AgentConstraints      (#16)  — 6 agent types with tool restrictions
    ├── MemoryStore           (#17)  — relevance scoring, aging, provenance
    └── SkillRegistry         (#18)  — trigger matching, promotion tracking
```

## Stats

- **18 modules**, 3970 lines of Rust
- **64 tests**, all passing
- **8/8 verification checks** green
- **Zero dependencies** beyond serde/serde_json

## Quick Start

```rust
use ob1_runtime::runtime::{ConversationRuntime, RuntimeConfig, ApiClient, ToolExecutor};
use ob1_runtime::registry::ToolRegistry;

// Implement your ApiClient and ToolExecutor
let config = RuntimeConfig::default();
let mut runtime = ConversationRuntime::new(config, my_api, my_tools, my_registry);

// Boot (runs 7-stage sequence)
runtime.boot();

// Run turns
let result = runtime.run_turn("hello");
println!("Stop: {:?}, Text: {}", result.stop_reason, result.assistant_text);
```

## Modules

### Day 1 — Non-Negotiables

| Module | Primitive | Lines |
|--------|-----------|-------|
| `registry.rs` | Tool Registry | 165 |
| `permissions.rs` | Permission System + Tool Pool | 301 |
| `session.rs` | Session Persistence | 241 |
| `workflow.rs` | Workflow State & Idempotency | 241 |
| `budget.rs` | Token Budget + Stop Reasons | 219 |
| `streaming.rs` | Structured Streaming Events | 142 |
| `events.rs` | System Event Logging | 144 |
| `verify.rs` | Verification Harness | 266 |

### Week 1 — Operational Maturity

| Module | Primitive | Lines |
|--------|-----------|-------|
| `compaction.rs` | Transcript Compaction | 196 |
| `audit.rs` | Permission Audit Trail | 172 |
| `doctor.rs` | Doctor Pattern | 228 |
| `boot.rs` | 7-Stage Staged Boot | 207 |
| `provenance.rs` | Provenance-Aware Context | 197 |

### Month 1 — Scale & Sophistication

| Module | Primitive | Lines |
|--------|-----------|-------|
| `agents.rs` | Agent Type System (6 types) | 186 |
| `memory.rs` | Memory with Provenance | 260 |
| `skills.rs` | Skills & Extensibility | 261 |

### Integration

| Module | Purpose | Lines |
|--------|---------|-------|
| `runtime.rs` | ConversationRuntime — the main loop | 485 |

## Key Design Decisions

- **Generic traits** — `ApiClient` and `ToolExecutor` are pluggable
- **Pre-turn budget** — check BEFORE the API call, not after
- **Idempotency keys** — retry of checkpoint'd step = no-op
- **Three handler types** — Interactive (prompt), Coordinator (deny), SwarmWorker (deny)
- **Trust-gated boot** — stage 5 only runs if trusted=true
- **Memory provenance** — every memory tracks origin, validation, contradiction
- **Skill promotion** — 3 uses = permanent (loader-blueprint rule)
- **Verification as primitive** — 8 invariant checks that run on every deploy

## Verification Suite

```
[PASS] Destructive tools require approval
[PASS] Denied tools never execute
[PASS] Budget exhaustion produces graceful stop
[PASS] Session save/load roundtrip preserves state
[PASS] Workflow idempotency prevents double-execution
[PASS] Event logger captures all categories
[PASS] Swarm worker cannot escalate permissions
[PASS] Tool registry is metadata-first
```
