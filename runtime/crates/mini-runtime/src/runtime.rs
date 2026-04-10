//! ConversationRuntime — the agentic loop.
//!
//! This is where all 4 gamechangers come together:
//! - Generic traits (ApiClient + ToolExecutor)
//! - Permission escalation (check before every tool)
//! - Hook lifecycle (pre/post every tool)
//! - Auto-compaction (when tokens exceed threshold)

use crate::compaction::{self, CompactionConfig, UsageTracker};
use crate::hooks::HookRunner;
use crate::permissions::{PermissionOutcome, PermissionPolicy};
use crate::session::{Message, Session};
use crate::traits::{
    extract_tool_uses, ApiClient, AutoAllowPrompter, PermissionPrompter, RuntimeError,
    StopReason, ToolExecutor,
};

// ── Turn summary ────────────────────────────────────────────────────────────

#[derive(Debug)]
pub struct TurnSummary {
    pub iterations: usize,
    pub tool_calls: usize,
    pub usage: UsageTracker,
    pub compacted: bool,
    pub final_text: String,
}

// ── ConversationRuntime ─────────────────────────────────────────────────────

pub struct ConversationRuntime<C: ApiClient, T: ToolExecutor> {
    pub session: Session,
    api_client: C,
    tool_executor: T,
    permission_policy: PermissionPolicy,
    system_prompt: Vec<String>,
    max_iterations: usize,
    usage_tracker: UsageTracker,
    hook_runner: HookRunner,
    compaction_config: CompactionConfig,
}

impl<C: ApiClient, T: ToolExecutor> ConversationRuntime<C, T> {
    pub fn new(
        api_client: C,
        tool_executor: T,
        permission_policy: PermissionPolicy,
        system_prompt: Vec<String>,
    ) -> Self {
        Self {
            session: Session::new(),
            api_client,
            tool_executor,
            permission_policy,
            system_prompt,
            max_iterations: 32,
            usage_tracker: UsageTracker::new(),
            hook_runner: HookRunner::empty(),
            compaction_config: CompactionConfig::default(),
        }
    }

    // ── Builder methods ─────────────────────────────────────────────────

    pub fn with_session(mut self, session: Session) -> Self {
        self.usage_tracker = UsageTracker::from_session(&session);
        self.session = session;
        self
    }

    pub fn with_max_iterations(mut self, max: usize) -> Self {
        self.max_iterations = max;
        self
    }

    pub fn with_hooks(mut self, hook_runner: HookRunner) -> Self {
        self.hook_runner = hook_runner;
        self
    }

    pub fn with_compaction(mut self, config: CompactionConfig) -> Self {
        self.compaction_config = config;
        self
    }

    // ── The main loop ───────────────────────────────────────────────────

    /// Run one conversation turn: send user input, execute tools, repeat
    /// until the model stops using tools or max iterations reached.
    pub fn run_turn(&mut self, user_input: impl Into<String>) -> Result<TurnSummary, RuntimeError> {
        self.run_turn_with_prompter(user_input, &mut AutoAllowPrompter)
    }

    /// Run a turn with a custom permission prompter.
    pub fn run_turn_with_prompter(
        &mut self,
        user_input: impl Into<String>,
        prompter: &mut dyn PermissionPrompter,
    ) -> Result<TurnSummary, RuntimeError> {
        // Add user message
        self.session.add(Message::user(user_input));

        let mut total_tool_calls = 0;
        let tools = self.tool_executor.tool_definitions();

        for iteration in 0..self.max_iterations {
            // Call the API
            let response = self.api_client.send(
                &self.system_prompt,
                &self.session.messages,
                &tools,
            )?;

            // Record usage and embed in message for session persistence
            if let Some(usage) = &response.usage {
                self.usage_tracker.record(usage);
            }

            // Add assistant message to session (with embedded usage for persistence)
            let mut msg = response.message.clone();
            if msg.usage.is_none() {
                msg.usage = response.usage.clone();
            }
            self.session.add(msg);

            // Extract tool use blocks
            let tool_uses = extract_tool_uses(&response.message);

            if tool_uses.is_empty() || response.stop_reason == StopReason::EndTurn {
                // No tools requested — turn is complete
                let compacted = self.maybe_compact();
                return Ok(TurnSummary {
                    iterations: iteration + 1,
                    tool_calls: total_tool_calls,
                    usage: self.usage_tracker.clone(),
                    compacted,
                    final_text: response.message.text(),
                });
            }

            // Execute each tool
            for (tool_use_id, tool_name, tool_input) in &tool_uses {
                total_tool_calls += 1;

                // 1. Check permissions
                let auth = self.permission_policy.authorize(tool_name, prompter);
                if let PermissionOutcome::Deny { reason } = auth {
                    self.session.add(Message::tool_result(
                        tool_use_id,
                        tool_name,
                        format!("Permission denied: {}", reason),
                        true,
                    ));
                    continue;
                }

                // 2. Run pre-tool hooks
                let pre_hook = self.hook_runner.run_pre_tool_use(tool_name, tool_input);
                if !pre_hook.allowed {
                    self.session.add(Message::tool_result(
                        tool_use_id,
                        tool_name,
                        format!(
                            "Blocked by hook: {}",
                            pre_hook.feedback.unwrap_or_default()
                        ),
                        true,
                    ));
                    continue;
                }

                // 3. Execute the tool
                let (output, is_error) = match self.tool_executor.execute(tool_name, tool_input) {
                    Ok(output) => (output, false),
                    Err(err) => (err.message, true),
                };

                // 4. Run post-tool hooks
                let post_hook =
                    self.hook_runner
                        .run_post_tool_use(tool_name, tool_input, &output, is_error);

                // Merge hook feedback into output
                let final_output = if let Some(feedback) = post_hook.feedback {
                    format!("{}\n\n[Hook feedback: {}]", output, feedback)
                } else {
                    output
                };

                let final_is_error = is_error || !post_hook.allowed;

                // 5. Add tool result to session
                self.session.add(Message::tool_result(
                    tool_use_id,
                    tool_name,
                    final_output,
                    final_is_error,
                ));
            }
        }

        Err(RuntimeError::MaxIterations(self.max_iterations))
    }

    // ── Compaction ──────────────────────────────────────────────────────

    fn maybe_compact(&mut self) -> bool {
        if compaction::should_compact(&self.session, &self.compaction_config) {
            self.session = compaction::compact(&self.session, &self.compaction_config);
            true
        } else {
            false
        }
    }

    // ── Accessors ───────────────────────────────────────────────────────

    pub fn usage(&self) -> &UsageTracker {
        &self.usage_tracker
    }

    pub fn session(&self) -> &Session {
        &self.session
    }
}

// ── Tests with mock implementations ─────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::hooks::HookConfig;
    use crate::permissions::{self, PermissionMode, PermissionPolicy};
    use crate::session::ContentBlock;
    use crate::session::TokenUsage;
    use crate::traits::{ApiResponse, ToolDefinition, ToolError};

    // Mock API client that returns predefined responses
    struct MockApiClient {
        responses: Vec<ApiResponse>,
        call_count: usize,
    }

    impl MockApiClient {
        fn text_response(text: &str) -> Self {
            Self {
                responses: vec![ApiResponse {
                    message: Message::assistant_text(text),
                    usage: Some(TokenUsage {
                        input_tokens: 100,
                        output_tokens: 50,
                        ..Default::default()
                    }),
                    stop_reason: StopReason::EndTurn,
                }],
                call_count: 0,
            }
        }

        fn tool_then_text(tool_name: &str, tool_input: serde_json::Value, final_text: &str) -> Self {
            Self {
                responses: vec![
                    // First call: request tool use
                    ApiResponse {
                        message: Message::assistant(
                            vec![ContentBlock::ToolUse {
                                id: "call_1".into(),
                                name: tool_name.into(),
                                input: tool_input,
                            }],
                            Some(TokenUsage {
                                input_tokens: 100,
                                output_tokens: 30,
                                ..Default::default()
                            }),
                        ),
                        usage: Some(TokenUsage {
                            input_tokens: 100,
                            output_tokens: 30,
                            ..Default::default()
                        }),
                        stop_reason: StopReason::ToolUse,
                    },
                    // Second call: final text
                    ApiResponse {
                        message: Message::assistant_text(final_text),
                        usage: Some(TokenUsage {
                            input_tokens: 200,
                            output_tokens: 60,
                            ..Default::default()
                        }),
                        stop_reason: StopReason::EndTurn,
                    },
                ],
                call_count: 0,
            }
        }
    }

    impl ApiClient for MockApiClient {
        fn send(
            &mut self,
            _system: &[String],
            _messages: &[Message],
            _tools: &[ToolDefinition],
        ) -> Result<ApiResponse, RuntimeError> {
            if self.call_count >= self.responses.len() {
                return Err(RuntimeError::Api("No more mock responses".into()));
            }
            let response = self.responses[self.call_count].clone();
            self.call_count += 1;
            Ok(response)
        }
    }

    // Mock tool executor
    struct MockToolExecutor {
        result: String,
    }

    impl ToolExecutor for MockToolExecutor {
        fn execute(
            &mut self,
            _tool_name: &str,
            _input: &serde_json::Value,
        ) -> Result<String, ToolError> {
            Ok(self.result.clone())
        }

        fn tool_definitions(&self) -> Vec<ToolDefinition> {
            vec![ToolDefinition {
                name: "read_file".into(),
                description: "Read a file".into(),
                input_schema: serde_json::json!({"type": "object"}),
            }]
        }
    }

    #[test]
    fn test_simple_text_response() {
        let api = MockApiClient::text_response("Hello, world!");
        let tools = MockToolExecutor {
            result: String::new(),
        };
        let policy = permissions::full_access_policy();

        let mut runtime =
            ConversationRuntime::new(api, tools, policy, vec!["You are helpful.".into()]);

        let summary = runtime.run_turn("Hi").unwrap();
        assert_eq!(summary.iterations, 1);
        assert_eq!(summary.tool_calls, 0);
        assert_eq!(summary.final_text, "Hello, world!");
        assert_eq!(runtime.session().messages.len(), 2); // user + assistant
    }

    #[test]
    fn test_tool_use_then_response() {
        let api = MockApiClient::tool_then_text(
            "read_file",
            serde_json::json!({"path": "main.rs"}),
            "I read the file.",
        );
        let tools = MockToolExecutor {
            result: "fn main() {}".into(),
        };
        let policy = permissions::full_access_policy();

        let mut runtime =
            ConversationRuntime::new(api, tools, policy, vec!["You are helpful.".into()]);

        let summary = runtime.run_turn("Read main.rs").unwrap();
        assert_eq!(summary.iterations, 2);
        assert_eq!(summary.tool_calls, 1);
        assert_eq!(summary.final_text, "I read the file.");
        // user + assistant(tool_use) + tool_result + assistant(text) = 4
        assert_eq!(runtime.session().messages.len(), 4);
    }

    #[test]
    fn test_permission_denied() {
        let api = MockApiClient::tool_then_text(
            "bash",
            serde_json::json!({"command": "rm -rf /"}),
            "Done.",
        );
        let tools = MockToolExecutor {
            result: String::new(),
        };
        // Read-only policy: bash requires DangerFullAccess
        let policy = PermissionPolicy::new(PermissionMode::ReadOnly)
            .with_tool("bash", PermissionMode::DangerFullAccess);

        let mut runtime =
            ConversationRuntime::new(api, tools, policy, vec!["You are helpful.".into()]);

        // Use AutoDenyPrompter so escalation is refused
        let mut prompter = crate::traits::AutoDenyPrompter;
        let _summary = runtime
            .run_turn_with_prompter("Delete everything", &mut prompter)
            .unwrap();
        // Tool was denied, so tool_result should be an error
        let tool_result = &runtime.session().messages[2]; // tool result
        match &tool_result.blocks[0] {
            ContentBlock::ToolResult { is_error, output, .. } => {
                assert!(*is_error);
                assert!(output.contains("denied"));
            }
            _ => panic!("Expected tool result"),
        }
    }

    #[test]
    fn test_hook_blocks_tool() {
        let api = MockApiClient::tool_then_text(
            "bash",
            serde_json::json!({"command": "ls"}),
            "Done.",
        );
        let tools = MockToolExecutor {
            result: String::new(),
        };
        let policy = permissions::full_access_policy();

        let deny_cmd = if cfg!(windows) {
            "exit /b 2".to_string()
        } else {
            "exit 2".to_string()
        };

        let hook_runner = HookRunner::new(HookConfig {
            pre_tool_use: vec![deny_cmd],
            post_tool_use: vec![],
        });

        let mut runtime =
            ConversationRuntime::new(api, tools, policy, vec!["You are helpful.".into()])
                .with_hooks(hook_runner);

        let _summary = runtime.run_turn("Run ls").unwrap();
        // Tool was blocked by hook
        let tool_result = &runtime.session().messages[2];
        match &tool_result.blocks[0] {
            ContentBlock::ToolResult { is_error, output, .. } => {
                assert!(is_error);
                assert!(output.contains("Blocked by hook"));
            }
            _ => panic!("Expected tool result"),
        }
    }

    #[test]
    fn test_max_iterations() {
        // API that always requests tools (infinite loop)
        let api = MockApiClient {
            responses: (0..100)
                .map(|i| ApiResponse {
                    message: Message::assistant(
                        vec![ContentBlock::ToolUse {
                            id: format!("call_{}", i),
                            name: "read_file".into(),
                            input: serde_json::json!({}),
                        }],
                        None,
                    ),
                    usage: None,
                    stop_reason: StopReason::ToolUse,
                })
                .collect(),
            call_count: 0,
        };
        let tools = MockToolExecutor {
            result: "ok".into(),
        };
        let policy = permissions::full_access_policy();

        let mut runtime =
            ConversationRuntime::new(api, tools, policy, vec![])
                .with_max_iterations(3);

        match runtime.run_turn("Go") {
            Err(RuntimeError::MaxIterations(3)) => {} // expected
            other => panic!("Expected MaxIterations, got: {:?}", other),
        }
    }

    #[test]
    fn test_usage_tracking() {
        let api = MockApiClient::text_response("Hi");
        let tools = MockToolExecutor {
            result: String::new(),
        };
        let policy = permissions::full_access_policy();

        let mut runtime = ConversationRuntime::new(api, tools, policy, vec![]);
        let summary = runtime.run_turn("Hello").unwrap();

        assert_eq!(summary.usage.turns, 1);
        assert_eq!(summary.usage.cumulative.input_tokens, 100);
        assert_eq!(summary.usage.cumulative.output_tokens, 50);
    }

    #[test]
    fn test_session_persistence() {
        let api = MockApiClient::text_response("Hi");
        let tools = MockToolExecutor {
            result: String::new(),
        };
        let policy = permissions::full_access_policy();

        let mut runtime = ConversationRuntime::new(api, tools, policy, vec![]);
        runtime.run_turn("Hello").unwrap();

        // Save and reload session
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("session.json");
        runtime.session().save(&path).unwrap();

        let loaded = Session::load(&path).unwrap();
        assert_eq!(loaded.messages.len(), 2);
        assert_eq!(loaded.total_usage().input_tokens, 100);
    }
}
