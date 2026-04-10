//! Core traits — the pluggable interfaces that make everything swappable.
//!
//! Gamechanger #1: Generic Trait-Based Runtime.
//! The runtime never knows what API provider or tool executor it's using.

use crate::session::{ContentBlock, Message, TokenUsage};
use std::fmt;

// ── API Client trait ────────────────────────────────────────────────────────

/// Abstraction over any LLM API (Anthropic, OpenAI, local, mock).
///
/// The runtime calls `send()` with the full conversation and gets back
/// an assistant message with optional tool use blocks.
pub trait ApiClient {
    /// Send conversation to the model, return assistant response.
    fn send(
        &mut self,
        system_prompt: &[String],
        messages: &[Message],
        tools: &[ToolDefinition],
    ) -> Result<ApiResponse, RuntimeError>;
}

/// What the API returns after a call.
#[derive(Debug, Clone)]
pub struct ApiResponse {
    pub message: Message,
    pub usage: Option<TokenUsage>,
    pub stop_reason: StopReason,
}

#[derive(Debug, Clone, PartialEq)]
pub enum StopReason {
    EndTurn,
    ToolUse,
    MaxTokens,
    StopSequence,
}

/// Tool definition sent to the model so it knows what's available.
#[derive(Debug, Clone)]
pub struct ToolDefinition {
    pub name: String,
    pub description: String,
    pub input_schema: serde_json::Value,
}

// ── Tool Executor trait ─────────────────────────────────────────────────────

/// Abstraction over tool execution (real tools, mocked, restricted).
pub trait ToolExecutor {
    /// Execute a tool by name with JSON input, return string output.
    fn execute(
        &mut self,
        tool_name: &str,
        input: &serde_json::Value,
    ) -> Result<String, ToolError>;

    /// List available tool definitions.
    fn tool_definitions(&self) -> Vec<ToolDefinition>;
}

// ── Permission Prompter trait ───────────────────────────────────────────────

/// Called when the runtime needs user approval for a permission escalation.
pub trait PermissionPrompter {
    fn prompt(&mut self, request: &PermissionRequest) -> PermissionDecision;
}

#[derive(Debug, Clone)]
pub struct PermissionRequest {
    pub tool_name: String,
    pub required_mode: String,
    pub current_mode: String,
}

#[derive(Debug, Clone, PartialEq)]
pub enum PermissionDecision {
    Allow,
    Deny { reason: String },
}

/// Auto-allow prompter — says yes to everything (for sub-agents, testing).
pub struct AutoAllowPrompter;

impl PermissionPrompter for AutoAllowPrompter {
    fn prompt(&mut self, _request: &PermissionRequest) -> PermissionDecision {
        PermissionDecision::Allow
    }
}

/// Auto-deny prompter — blocks everything (for read-only contexts).
pub struct AutoDenyPrompter;

impl PermissionPrompter for AutoDenyPrompter {
    fn prompt(&mut self, request: &PermissionRequest) -> PermissionDecision {
        PermissionDecision::Deny {
            reason: format!("Permission denied for tool `{}`", request.tool_name),
        }
    }
}

// ── Errors ──────────────────────────────────────────────────────────────────

#[derive(Debug)]
pub enum RuntimeError {
    Api(String),
    MaxIterations(usize),
    PermissionDenied { tool: String, reason: String },
    Serialization(String),
    Other(String),
}

impl fmt::Display for RuntimeError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Api(msg) => write!(f, "API error: {}", msg),
            Self::MaxIterations(n) => write!(f, "Max iterations ({}) reached", n),
            Self::PermissionDenied { tool, reason } => {
                write!(f, "Permission denied for `{}`: {}", tool, reason)
            }
            Self::Serialization(msg) => write!(f, "Serialization error: {}", msg),
            Self::Other(msg) => write!(f, "{}", msg),
        }
    }
}

impl std::error::Error for RuntimeError {}

#[derive(Debug)]
pub struct ToolError {
    pub message: String,
}

impl ToolError {
    pub fn new(msg: impl Into<String>) -> Self {
        Self {
            message: msg.into(),
        }
    }
}

impl fmt::Display for ToolError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl std::error::Error for ToolError {}

// ── Helper: extract tool use blocks from a message ──────────────────────────

pub fn extract_tool_uses(message: &Message) -> Vec<(String, String, serde_json::Value)> {
    message
        .blocks
        .iter()
        .filter_map(|block| {
            if let ContentBlock::ToolUse { id, name, input } = block {
                Some((id.clone(), name.clone(), input.clone()))
            } else {
                None
            }
        })
        .collect()
}
