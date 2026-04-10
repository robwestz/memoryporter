# Scaffold: Rust Agentic CLI

Create a trait-generic agentic runtime in Rust with this structure.

## Cargo Workspace

```toml
# Cargo.toml (workspace root)
[workspace]
members = ["crates/runtime", "crates/tools", "crates/cli"]
resolver = "2"
```

## Crate: runtime

Core agentic loop, session management, permission system.

```
crates/runtime/
├── src/
│   ├── lib.rs          # Re-exports
│   ├── traits.rs       # ApiClient, ToolExecutor traits
│   ├── runtime.rs      # ConversationRuntime<C, T>
│   ├── session.rs      # Session, Message, SessionFile
│   ├── permission.rs   # PermissionPolicy, PermissionMode
│   ├── budget.rs       # UsageTracker, pre-turn budget check
│   ├── compaction.rs   # Auto-compaction logic
│   ├── events.rs       # Structured event logging
│   └── doctor.rs       # Health check subsystem
└── Cargo.toml
```

### Key traits

```rust
pub trait ApiClient: Send {
    fn stream(&mut self, request: ApiRequest) -> Result<Vec<AssistantEvent>, RuntimeError>;
}

pub trait ToolExecutor: Send {
    fn execute(&mut self, name: &str, input: &str) -> Result<String, ToolError>;
    fn list_tools(&self) -> Vec<ToolDefinition>;
}
```

### Minimum viable runtime

```rust
pub struct ConversationRuntime<C: ApiClient, T: ToolExecutor> {
    pub session: Session,
    pub api_client: C,
    pub tool_executor: T,
    pub permission_policy: PermissionPolicy,
    pub max_iterations: usize,
    pub usage_tracker: UsageTracker,
    pub auto_compaction_threshold: u32,
    pub session_file: Option<SessionFile>,
}

impl<C: ApiClient, T: ToolExecutor> ConversationRuntime<C, T> {
    pub fn run_turn(&mut self, input: &str) -> Result<TurnSummary, RuntimeError> {
        // 1. Budget check (pre-turn)
        self.usage_tracker.check_budget()?;

        // 2. Add user message
        self.session.add_user_message(input.to_string());

        // 3. Agentic loop
        for _ in 0..self.max_iterations {
            let events = self.api_client.stream(self.build_request())?;
            let msg = self.aggregate_events(events);
            self.session.add(msg.clone());

            let tool_uses = msg.tool_use_blocks();
            if tool_uses.is_empty() { break; }

            for tu in tool_uses {
                self.permission_policy.check(&tu.name)?;
                let result = self.tool_executor.execute(&tu.name, &tu.input)?;
                self.session.add_tool_result(tu.id, result);
            }
        }

        // 4. Auto-compaction
        if self.usage_tracker.should_compact(self.auto_compaction_threshold) {
            self.compact_session();
        }

        // 5. Session persistence
        if let Some(sf) = &self.session_file {
            sf.save(&self.session)?;
        }

        Ok(self.build_summary())
    }
}
```

### Dependencies

```toml
[dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.12", features = ["json", "stream"] }
clap = { version = "4", features = ["derive"] }
```

## Crate: tools

Built-in tool implementations + MCP client.

```
crates/tools/
├── src/
│   ├── lib.rs          # ToolRegistry
│   ├── builtin/
│   │   ├── bash.rs     # Shell execution
│   │   ├── read.rs     # File reading
│   │   ├── write.rs    # File writing
│   │   ├── edit.rs     # String replacement
│   │   ├── glob.rs     # File search
│   │   └── grep.rs     # Content search
│   └── mcp/
│       ├── client.rs   # MCP stdio client
│       └── types.rs    # JSON-RPC types
└── Cargo.toml
```

## Crate: cli

Binary entry point with clap.

```
crates/cli/
├── src/
│   └── main.rs         # CLI: --session, --resume, --budget, --permission-mode
└── Cargo.toml
```

### CLI flags

```rust
#[derive(Parser)]
struct Cli {
    /// Initial prompt (or interactive mode if omitted)
    prompt: Option<String>,

    /// Permission mode: readonly, write, danger
    #[arg(short, long, default_value = "write")]
    permission: String,

    /// Max budget in USD
    #[arg(long)]
    budget: Option<f64>,

    /// Save session to file after each turn
    #[arg(long)]
    session: Option<PathBuf>,

    /// Resume from saved session file
    #[arg(long)]
    resume: Option<PathBuf>,

    /// Run /doctor health check and exit
    #[arg(long)]
    doctor: bool,
}
```

## Testing Strategy

- Mock `ApiClient` that returns canned responses
- Mock `ToolExecutor` that records calls
- Test loop termination, permission denial, budget exhaustion, compaction
- Integration test with real API (behind feature flag)

## Build & Run

```bash
cargo build --release
./target/release/agent "What files are in this directory?"
./target/release/agent --doctor
./target/release/agent --session state.json --budget 1.00
```

## Applies These Patterns

- Gamechanger: Generic Trait-Based Runtime
- Gamechanger: Auto-Compaction
- Gamechanger: Permission Escalation
- Gamechanger: Pre-Turn Budget
- Gamechanger: Session Snapshot
- Skill: Build Agentic Loop
- Skill: Tool Permission System
- Skill: Token Budget
- Skill: Session Persistence
