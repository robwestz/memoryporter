//! Anthropic API client — real implementation of ApiClient trait.
//!
//! Calls the Anthropic Messages API with blocking HTTP.
//! Auth via ANTHROPIC_API_KEY environment variable.
//! Includes retry with exponential backoff.

use crate::session::{ContentBlock, Message, Role, TokenUsage};
use crate::traits::{ApiClient, ApiResponse, RuntimeError, StopReason, ToolDefinition};
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

// ── Client ──────────────────────────────────────────────────────────────────

pub struct AnthropicClient {
    http: Client,
    api_key: String,
    base_url: String,
    model: String,
    max_tokens: u32,
    max_retries: u32,
}

impl AnthropicClient {
    pub fn new(model: impl Into<String>) -> Result<Self, RuntimeError> {
        let api_key = std::env::var("ANTHROPIC_API_KEY")
            .map_err(|_| RuntimeError::Api("ANTHROPIC_API_KEY not set".into()))?;

        let base_url = std::env::var("ANTHROPIC_BASE_URL")
            .unwrap_or_else(|_| "https://api.anthropic.com".into());

        let http = Client::builder()
            .timeout(Duration::from_secs(300))
            .build()
            .map_err(|e| RuntimeError::Api(format!("HTTP client init failed: {}", e)))?;

        Ok(Self {
            http,
            api_key,
            base_url,
            model: model.into(),
            max_tokens: 16384,
            max_retries: 3,
        })
    }

    pub fn with_max_tokens(mut self, max_tokens: u32) -> Self {
        self.max_tokens = max_tokens;
        self
    }

    /// Build the Anthropic API request body.
    fn build_request(
        &self,
        system_prompt: &[String],
        messages: &[Message],
        tools: &[ToolDefinition],
    ) -> ApiRequestBody {
        let system_text = system_prompt.join("\n\n");

        let api_messages: Vec<ApiMessage> = messages
            .iter()
            .filter(|m| m.role != Role::System)
            .map(|m| self.convert_message(m))
            .collect();

        let api_tools: Vec<ApiTool> = tools
            .iter()
            .map(|t| ApiTool {
                name: t.name.clone(),
                description: t.description.clone(),
                input_schema: t.input_schema.clone(),
            })
            .collect();

        ApiRequestBody {
            model: self.model.clone(),
            max_tokens: self.max_tokens,
            system: if system_text.is_empty() {
                None
            } else {
                Some(system_text)
            },
            messages: api_messages,
            tools: if api_tools.is_empty() {
                None
            } else {
                Some(api_tools)
            },
        }
    }

    fn convert_message(&self, msg: &Message) -> ApiMessage {
        let role = match msg.role {
            Role::User | Role::Tool => "user",
            Role::Assistant => "assistant",
            Role::System => "user", // shouldn't happen, filtered above
        };

        let content: Vec<ApiContentBlock> = msg
            .blocks
            .iter()
            .map(|block| match block {
                ContentBlock::Text { text } => ApiContentBlock::Text {
                    text: text.clone(),
                },
                ContentBlock::ToolUse { id, name, input } => ApiContentBlock::ToolUse {
                    id: id.clone(),
                    name: name.clone(),
                    input: input.clone(),
                },
                ContentBlock::ToolResult {
                    tool_use_id,
                    output,
                    is_error,
                    ..
                } => ApiContentBlock::ToolResult {
                    tool_use_id: tool_use_id.clone(),
                    content: output.clone(),
                    is_error: Some(*is_error),
                },
            })
            .collect();

        ApiMessage {
            role: role.into(),
            content,
        }
    }

    fn parse_response(&self, body: &ApiResponseBody) -> Result<ApiResponse, RuntimeError> {
        let mut blocks = Vec::new();

        for block in &body.content {
            match block {
                ApiResponseContent::Text { text } => {
                    blocks.push(ContentBlock::Text { text: text.clone() });
                }
                ApiResponseContent::ToolUse { id, name, input } => {
                    blocks.push(ContentBlock::ToolUse {
                        id: id.clone(),
                        name: name.clone(),
                        input: input.clone(),
                    });
                }
            }
        }

        let usage = body.usage.as_ref().map(|u| TokenUsage {
            input_tokens: u.input_tokens,
            output_tokens: u.output_tokens,
            cache_creation_tokens: u.cache_creation_input_tokens.unwrap_or(0),
            cache_read_tokens: u.cache_read_input_tokens.unwrap_or(0),
        });

        let stop_reason = match body.stop_reason.as_deref() {
            Some("end_turn") => StopReason::EndTurn,
            Some("tool_use") => StopReason::ToolUse,
            Some("max_tokens") => StopReason::MaxTokens,
            Some("stop_sequence") => StopReason::StopSequence,
            _ => StopReason::EndTurn,
        };

        Ok(ApiResponse {
            message: Message::assistant(blocks, usage.clone()),
            usage,
            stop_reason,
        })
    }

    fn is_retryable_status(status: u16) -> bool {
        matches!(status, 408 | 429 | 500 | 502 | 503 | 504)
    }
}

impl ApiClient for AnthropicClient {
    fn send(
        &mut self,
        system_prompt: &[String],
        messages: &[Message],
        tools: &[ToolDefinition],
    ) -> Result<ApiResponse, RuntimeError> {
        let body = self.build_request(system_prompt, messages, tools);
        let url = format!("{}/v1/messages", self.base_url);

        let mut last_error = None;

        for attempt in 0..=self.max_retries {
            if attempt > 0 {
                // Exponential backoff: 200ms, 400ms, 800ms, ...
                let backoff_ms = 200u64 * (1u64 << (attempt - 1).min(4));
                std::thread::sleep(Duration::from_millis(backoff_ms));
            }

            let result = self
                .http
                .post(&url)
                .header("x-api-key", &self.api_key)
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .json(&body)
                .send();

            match result {
                Ok(response) => {
                    let status = response.status().as_u16();

                    if status == 200 {
                        let response_body: ApiResponseBody = response.json().map_err(|e| {
                            RuntimeError::Api(format!("Failed to parse response: {}", e))
                        })?;
                        return self.parse_response(&response_body);
                    }

                    let error_body = response.text().unwrap_or_default();

                    if Self::is_retryable_status(status) {
                        last_error = Some(RuntimeError::Api(format!(
                            "HTTP {} (attempt {}/{}): {}",
                            status,
                            attempt + 1,
                            self.max_retries + 1,
                            truncate_str(&error_body, 200),
                        )));
                        continue; // Retry
                    }

                    // Non-retryable error
                    return Err(RuntimeError::Api(format!(
                        "HTTP {}: {}",
                        status,
                        truncate_str(&error_body, 500),
                    )));
                }
                Err(e) => {
                    if e.is_connect() || e.is_timeout() {
                        last_error = Some(RuntimeError::Api(format!(
                            "Connection error (attempt {}/{}): {}",
                            attempt + 1,
                            self.max_retries + 1,
                            e,
                        )));
                        continue; // Retry
                    }
                    return Err(RuntimeError::Api(format!("Request failed: {}", e)));
                }
            }
        }

        Err(last_error.unwrap_or_else(|| RuntimeError::Api("All retries exhausted".into())))
    }
}

fn truncate_str(s: &str, max: usize) -> String {
    if s.len() <= max {
        s.to_string()
    } else {
        format!("{}...", &s[..max])
    }
}

// ── Anthropic API types ─────────────────────────────────────────────────────

#[derive(Serialize)]
struct ApiRequestBody {
    model: String,
    max_tokens: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    system: Option<String>,
    messages: Vec<ApiMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    tools: Option<Vec<ApiTool>>,
}

#[derive(Serialize)]
struct ApiMessage {
    role: String,
    content: Vec<ApiContentBlock>,
}

#[derive(Serialize)]
#[serde(tag = "type")]
enum ApiContentBlock {
    #[serde(rename = "text")]
    Text { text: String },
    #[serde(rename = "tool_use")]
    ToolUse {
        id: String,
        name: String,
        input: serde_json::Value,
    },
    #[serde(rename = "tool_result")]
    ToolResult {
        tool_use_id: String,
        content: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        is_error: Option<bool>,
    },
}

#[derive(Serialize)]
struct ApiTool {
    name: String,
    description: String,
    input_schema: serde_json::Value,
}

#[derive(Deserialize)]
struct ApiResponseBody {
    content: Vec<ApiResponseContent>,
    stop_reason: Option<String>,
    usage: Option<ApiUsage>,
}

#[derive(Deserialize)]
#[serde(tag = "type")]
enum ApiResponseContent {
    #[serde(rename = "text")]
    Text { text: String },
    #[serde(rename = "tool_use")]
    ToolUse {
        id: String,
        name: String,
        input: serde_json::Value,
    },
}

#[derive(Deserialize)]
struct ApiUsage {
    input_tokens: u32,
    output_tokens: u32,
    cache_creation_input_tokens: Option<u32>,
    cache_read_input_tokens: Option<u32>,
}

// ── Model aliases ───────────────────────────────────────────────────────────

pub fn resolve_model(alias: &str) -> String {
    match alias {
        "opus" => "claude-opus-4-6".into(),
        "sonnet" => "claude-sonnet-4-6".into(),
        "haiku" => "claude-haiku-4-5-20251001".into(),
        other => other.into(),
    }
}
