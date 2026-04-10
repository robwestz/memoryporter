//! ConversationRuntime — composes all 18 primitives into one agentic loop.
//!
//! This is the main entry point. One struct, one `run_turn()` method.

use crate::audit::AuditTrail;
use crate::boot::{self, BootConfig};
use crate::budget::{BudgetCheck, BudgetConfig, BudgetTracker, StopReason};
use crate::compaction::{self, CompactionConfig};
use crate::events::{EventCategory, EventLogger};
use crate::permissions::{AuthzResult, PermissionMode, PermissionPolicy};
use crate::registry::ToolRegistry;
use crate::session::{Message, Session, SessionFile, TokenUsage};
use crate::streaming::{StreamEvent, StreamEventDispatcher};

/// Configuration for the runtime.
#[derive(Debug, Clone)]
pub struct RuntimeConfig {
    pub model: String,
    pub boot: BootConfig,
    pub budget: BudgetConfig,
    pub compaction: CompactionConfig,
    pub permission_policy: PermissionPolicy,
    pub system_prompt: Vec<String>,
    pub max_iterations: usize,
}

impl Default for RuntimeConfig {
    fn default() -> Self {
        Self {
            model: "claude-opus-4-6".into(),
            boot: BootConfig::default(),
            budget: BudgetConfig::default(),
            compaction: CompactionConfig::default(),
            permission_policy: PermissionPolicy::new("default", PermissionMode::DangerFullAccess),
            system_prompt: Vec::new(),
            max_iterations: 32,
        }
    }
}

/// Result of a single turn.
#[derive(Debug, Clone)]
pub struct TurnResult {
    pub iteration: usize,
    pub stop_reason: StopReason,
    pub assistant_text: String,
    pub tool_calls: Vec<ToolCallRecord>,
    pub usage: TokenUsage,
    pub denials: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct ToolCallRecord {
    pub tool_name: String,
    pub input_preview: String,
    pub output_preview: String,
    pub is_error: bool,
}

/// The ConversationRuntime — trait-generic agentic loop.
///
/// `A` = API client (sends prompts, streams responses)
/// `T` = Tool executor (runs tools)
pub struct ConversationRuntime<A: ApiClient, T: ToolExecutor> {
    pub session: Session,
    pub config: RuntimeConfig,
    pub budget: BudgetTracker,
    pub events: EventLogger,
    pub audit: AuditTrail,
    pub registry: ToolRegistry,
    api_client: A,
    tool_executor: T,
    dispatcher: StreamEventDispatcher,
    booted: bool,
    /// Optional auto-save file for session persistence.
    pub session_file: Option<SessionFile>,
}

/// Trait for API clients — pluggable LLM provider.
pub trait ApiClient {
    /// Send a request and receive response events.
    fn send(&mut self, messages: &[Message], system: &[String], tools: &[serde_json::Value])
        -> Result<ApiResponse, String>;
}

/// Response from the API.
#[derive(Debug, Clone)]
pub struct ApiResponse {
    pub text: String,
    pub tool_uses: Vec<ToolUse>,
    pub usage: TokenUsage,
    pub stop_reason: String,
}

#[derive(Debug, Clone)]
pub struct ToolUse {
    pub id: String,
    pub name: String,
    pub input: String,
}

/// Trait for tool execution — pluggable tool strategy.
pub trait ToolExecutor {
    fn execute(&mut self, tool_name: &str, input: &str) -> Result<String, String>;
}

impl<A: ApiClient, T: ToolExecutor> ConversationRuntime<A, T> {
    pub fn new(
        config: RuntimeConfig,
        api_client: A,
        tool_executor: T,
        registry: ToolRegistry,
    ) -> Self {
        let budget = BudgetTracker::new(config.budget.clone());
        let session = Session::new(&format!("session-{}", std::process::id()));
        Self {
            session,
            config,
            budget,
            events: EventLogger::new(),
            audit: AuditTrail::new(),
            registry,
            api_client,
            tool_executor,
            dispatcher: StreamEventDispatcher::new(),
            booted: false,
            session_file: None,
        }
    }

    /// Run the staged boot sequence (call once before first turn).
    pub fn boot(&mut self) -> bool {
        let results = boot::run_boot_sequence(&self.config.boot, &mut self.events);
        self.booted = boot::boot_healthy(&results);
        self.events.log(
            EventCategory::Bootstrap,
            "boot_complete",
            &format!("healthy={}, stages={}", self.booted, results.len()),
        );
        self.booted
    }

    /// Run a single conversational turn.
    ///
    /// The main agentic loop:
    /// 1. Check budget (pre-turn)
    /// 2. Add user message
    /// 3. Loop: call API → execute tools → repeat until no tools
    /// 4. Check compaction threshold
    /// 5. Return result
    pub fn run_turn(&mut self, user_input: &str) -> TurnResult {
        // Pre-turn budget check
        if let BudgetCheck::Exceeded { stop_reason } = self.budget.pre_turn_check() {
            self.events.log(EventCategory::Budget, "budget_exceeded", &format!("{:?}", stop_reason));
            return TurnResult {
                iteration: 0,
                stop_reason,
                assistant_text: "Budget exceeded. Session ending.".into(),
                tool_calls: Vec::new(),
                usage: TokenUsage::default(),
                denials: Vec::new(),
            };
        }

        // Add user message
        self.session.add_user_message(user_input);
        self.dispatcher.dispatch(&StreamEvent::MessageStart {
            session_id: self.session.session_id.clone(),
            model: self.config.model.clone(),
        });

        let mut total_usage = TokenUsage::default();
        let mut all_tool_calls = Vec::new();
        let mut all_denials = Vec::new();
        let mut final_text = String::new();
        let mut stop_reason = StopReason::Completed;

        // Agentic loop
        for iteration in 0..self.config.max_iterations {
            // Budget check each iteration
            if let BudgetCheck::Exceeded { stop_reason: sr } = self.budget.pre_turn_check() {
                stop_reason = sr;
                break;
            }

            // Call API
            let api_tools = self.registry.to_api_tools();
            let response = match self.api_client.send(
                &self.session.messages,
                &self.config.system_prompt,
                &api_tools,
            ) {
                Ok(resp) => resp,
                Err(e) => {
                    self.events.error("api_error", &e);
                    stop_reason = StopReason::Error { message: e };
                    break;
                }
            };

            // Record usage
            total_usage = total_usage.add(&response.usage);
            self.budget.record_turn(
                &format!("turn_{}", iteration),
                response.usage.input_tokens,
                response.usage.output_tokens,
                0.0,
            );

            // Add assistant message
            self.session.add_assistant_message(&response.text, response.usage.clone());
            self.dispatcher.dispatch(&StreamEvent::TextDelta {
                text: response.text.clone(),
            });
            final_text = response.text;

            // No tool calls → done
            if response.tool_uses.is_empty() {
                stop_reason = StopReason::Completed;
                break;
            }

            // Execute tools
            for tool_use in &response.tool_uses {
                self.dispatcher.dispatch(&StreamEvent::ToolStart {
                    tool_use_id: tool_use.id.clone(),
                    tool_name: tool_use.name.clone(),
                });

                // Permission check
                let authz = self.config.permission_policy.authorize(&tool_use.name);
                self.audit.record(
                    &self.session.session_id,
                    self.session.turn_count,
                    &tool_use.name,
                    &authz,
                    &self.config.permission_policy,
                );

                match authz {
                    AuthzResult::Allow => {
                        // Execute
                        self.events.log(
                            EventCategory::ToolExecution,
                            &tool_use.name,
                            &format!("executing with {} bytes input", tool_use.input.len()),
                        );

                        let (output, is_error) = match self.tool_executor.execute(&tool_use.name, &tool_use.input) {
                            Ok(out) => (out, false),
                            Err(e) => (e, true),
                        };

                        let preview = output.chars().take(200).collect::<String>();
                        all_tool_calls.push(ToolCallRecord {
                            tool_name: tool_use.name.clone(),
                            input_preview: tool_use.input.chars().take(100).collect(),
                            output_preview: preview,
                            is_error,
                        });

                        self.session.add_tool_result(&tool_use.id, &output, is_error);
                        self.dispatcher.dispatch(&StreamEvent::ToolResult {
                            tool_use_id: tool_use.id.clone(),
                            tool_name: tool_use.name.clone(),
                            is_error,
                        });
                    }
                    AuthzResult::Deny { reason } => {
                        self.events.permission(&tool_use.name, &reason);
                        all_denials.push(format!("{}: {}", tool_use.name, reason));
                        self.session.add_tool_result(&tool_use.id, &format!("Permission denied: {}", reason), true);
                    }
                    AuthzResult::Prompt { tool, required } => {
                        let msg = format!("{} requires {:?} escalation", tool, required);
                        self.events.permission(&tool_use.name, &msg);
                        all_denials.push(msg.clone());
                        self.session.add_tool_result(&tool_use.id, &format!("Escalation required: {}", msg), true);
                    }
                }
            }
        }

        // Post-turn: check compaction
        if self.budget.needs_compaction() {
            compaction::apply_compaction(&mut self.session.messages, &self.config.compaction);
            self.events.log(EventCategory::Compaction, "auto_compact", "triggered by turn count");
        }

        // Auto-save session if configured
        if let Some(sf) = &self.session_file {
            if let Err(e) = sf.save(&self.session) {
                self.events.error("session_save_failed", &format!("{}", e));
            }
        }

        // Dispatch stop event
        self.dispatcher.dispatch(&StreamEvent::MessageStop {
            stop_reason: format!("{:?}", stop_reason),
            total_input_tokens: total_usage.input_tokens,
            total_output_tokens: total_usage.output_tokens,
        });

        TurnResult {
            iteration: self.config.max_iterations,
            stop_reason,
            assistant_text: final_text,
            tool_calls: all_tool_calls,
            usage: total_usage,
            denials: all_denials,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::registry::{ToolSpec, SourceType, SideEffectProfile};

    // Mock API client that returns a fixed response
    struct MockApi {
        responses: Vec<ApiResponse>,
        call_count: usize,
    }

    impl MockApi {
        fn with_text(text: &str) -> Self {
            Self {
                responses: vec![ApiResponse {
                    text: text.into(),
                    tool_uses: vec![],
                    usage: TokenUsage { input_tokens: 100, output_tokens: 50, ..Default::default() },
                    stop_reason: "end_turn".into(),
                }],
                call_count: 0,
            }
        }

        fn with_tool_call(tool_name: &str, tool_input: &str, then_text: &str) -> Self {
            Self {
                responses: vec![
                    ApiResponse {
                        text: String::new(),
                        tool_uses: vec![ToolUse {
                            id: "tu_1".into(),
                            name: tool_name.into(),
                            input: tool_input.into(),
                        }],
                        usage: TokenUsage { input_tokens: 50, output_tokens: 20, ..Default::default() },
                        stop_reason: "tool_use".into(),
                    },
                    ApiResponse {
                        text: then_text.into(),
                        tool_uses: vec![],
                        usage: TokenUsage { input_tokens: 80, output_tokens: 40, ..Default::default() },
                        stop_reason: "end_turn".into(),
                    },
                ],
                call_count: 0,
            }
        }
    }

    impl ApiClient for MockApi {
        fn send(&mut self, _messages: &[Message], _system: &[String], _tools: &[serde_json::Value])
            -> Result<ApiResponse, String>
        {
            if self.call_count < self.responses.len() {
                let resp = self.responses[self.call_count].clone();
                self.call_count += 1;
                Ok(resp)
            } else {
                Ok(ApiResponse {
                    text: "done".into(),
                    tool_uses: vec![],
                    usage: TokenUsage::default(),
                    stop_reason: "end_turn".into(),
                })
            }
        }
    }

    // Mock tool executor
    struct MockTools;
    impl ToolExecutor for MockTools {
        fn execute(&mut self, name: &str, _input: &str) -> Result<String, String> {
            Ok(format!("Executed {}", name))
        }
    }

    fn default_registry() -> ToolRegistry {
        let mut reg = ToolRegistry::new();
        reg.register(ToolSpec {
            name: "read_file".into(),
            description: "Read a file".into(),
            source_type: SourceType::BuiltIn,
            required_permission: PermissionMode::ReadOnly,
            input_schema: serde_json::json!({}),
            side_effects: SideEffectProfile::default(),
            enabled: true,
            aliases: vec![],
        });
        reg
    }

    #[test]
    fn test_simple_turn() {
        let api = MockApi::with_text("Hello! How can I help?");
        let tools = MockTools;
        let mut runtime = ConversationRuntime::new(
            RuntimeConfig::default(),
            api,
            tools,
            default_registry(),
        );
        runtime.boot();

        let result = runtime.run_turn("hi");
        assert_eq!(result.stop_reason, StopReason::Completed);
        assert!(result.assistant_text.contains("Hello"));
        assert!(result.tool_calls.is_empty());
    }

    #[test]
    fn test_turn_with_tool_call() {
        let api = MockApi::with_tool_call("read_file", "{\"path\": \"test.rs\"}", "I read the file.");
        let tools = MockTools;
        let mut runtime = ConversationRuntime::new(
            RuntimeConfig::default(),
            api,
            tools,
            default_registry(),
        );
        runtime.boot();

        let result = runtime.run_turn("read test.rs");
        assert_eq!(result.stop_reason, StopReason::Completed);
        assert_eq!(result.tool_calls.len(), 1);
        assert_eq!(result.tool_calls[0].tool_name, "read_file");
    }

    #[test]
    fn test_budget_stops_turn() {
        let api = MockApi::with_text("response");
        let tools = MockTools;
        let config = RuntimeConfig {
            budget: BudgetConfig { max_budget_tokens: 10, ..Default::default() },
            ..Default::default()
        };
        let mut runtime = ConversationRuntime::new(config, api, tools, default_registry());
        runtime.boot();

        // First turn uses 150 tokens → exceeds budget of 10
        let _r1 = runtime.run_turn("first");
        // Budget exceeded on next turn
        let r2 = runtime.run_turn("second");
        assert_eq!(r2.stop_reason, StopReason::MaxBudgetReached);
    }

    #[test]
    fn test_permission_denial() {
        let api = MockApi::with_tool_call("bash", "rm -rf /", "done");
        let tools = MockTools;
        let config = RuntimeConfig {
            permission_policy: PermissionPolicy::new("readonly", PermissionMode::ReadOnly)
                .with_tool_override("bash", PermissionMode::DangerFullAccess),
            ..Default::default()
        };
        let mut runtime = ConversationRuntime::new(config, api, tools, default_registry());
        runtime.boot();

        let result = runtime.run_turn("delete everything");
        assert!(!result.denials.is_empty());
        assert!(result.denials[0].contains("bash"));
    }

    #[test]
    fn test_event_logging() {
        let api = MockApi::with_text("hi");
        let tools = MockTools;
        let mut runtime = ConversationRuntime::new(
            RuntimeConfig::default(),
            api,
            tools,
            default_registry(),
        );
        runtime.boot();
        runtime.run_turn("hello");

        // Should have bootstrap events + turn events
        assert!(runtime.events.count() > 0);
        assert!(!runtime.events.by_category(&EventCategory::Bootstrap).is_empty());
    }
}
