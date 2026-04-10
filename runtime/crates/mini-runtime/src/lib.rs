//! # mini-runtime — Minimal Agentic Runtime
//!
//! Four gamechangers from the Claw Code architecture, distilled into a
//! working, testable, immediately usable Rust crate.
//!
//! ## Gamechangers Implemented
//!
//! 1. **Generic Trait-Based Runtime** — `ConversationRuntime<C: ApiClient, T: ToolExecutor>`
//! 2. **Auto-Compaction** — Infinite conversations via threshold-triggered summarization
//! 3. **Permission Escalation** — `ReadOnly < WorkspaceWrite < DangerFullAccess`
//! 4. **Shell-Based Hooks** — Pre/post tool hooks as shell commands, JSON stdin, exit codes
//!
//! ## Quick Start
//!
//! ```rust,no_run
//! use mini_runtime::*;
//!
//! // 1. Implement ApiClient for your LLM provider
//! // 2. Implement ToolExecutor for your tools
//! // 3. Choose a permission policy
//! // 4. Run!
//!
//! // let mut runtime = ConversationRuntime::new(
//! //     my_api_client,
//! //     my_tool_executor,
//! //     full_access_policy(),
//! //     vec!["You are a helpful assistant.".into()],
//! // );
//! // let summary = runtime.run_turn("Hello!")?;
//! ```

pub mod anthropic;
pub mod compaction;
pub mod hooks;
pub mod permissions;
pub mod runtime;
pub mod session;
pub mod tools;
pub mod traits;

// Re-export the most important types at crate root
pub use compaction::{CompactionConfig, UsageTracker};
pub use hooks::{HookConfig, HookRunner};
pub use permissions::{
    full_access_policy, read_only_policy, workspace_write_policy, PermissionMode, PermissionPolicy,
};
pub use runtime::{ConversationRuntime, TurnSummary};
pub use session::{ContentBlock, Message, Role, Session, TokenUsage};
pub use traits::{
    ApiClient, ApiResponse, AutoAllowPrompter, AutoDenyPrompter, PermissionPrompter,
    RuntimeError, StopReason, ToolDefinition, ToolError, ToolExecutor,
};
