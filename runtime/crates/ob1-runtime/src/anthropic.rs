//! Anthropic API client for ob1-runtime.
//!
//! Implements runtime::ApiClient trait with real HTTP calls.
//! Auth via ANTHROPIC_API_KEY. Retry with exponential backoff.

use crate::runtime::{ApiClient, ApiResponse, ToolUse};
use crate::session::{ContentBlock, Message, Role, TokenUsage};
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

pub struct AnthropicApiClient {
    http: Client,
    api_key: String,
    base_url: String,
    model: String,
    max_tokens: u32,
    max_retries: u32,
}

impl AnthropicApiClient {
    pub fn from_env(model: &str) -> Result<Self, String> {
        let api_key = std::env::var("ANTHROPIC_API_KEY")
            .map_err(|_| "ANTHROPIC_API_KEY not set".to_string())?;
        let base_url = std::env::var("ANTHROPIC_BASE_URL")
            .unwrap_or_else(|_| "https://api.anthropic.com".into());
        let http = Client::builder()
            .timeout(Duration::from_secs(300))
            .build()
            .map_err(|e| format!("HTTP client error: {}", e))?;

        Ok(Self {
            http,
            api_key,
            base_url,
            model: resolve_model(model),
            max_tokens: 16384,
            max_retries: 3,
        })
    }

    pub fn with_max_tokens(mut self, max: u32) -> Self {
        self.max_tokens = max;
        self
    }

    fn build_body(
        &self,
        messages: &[Message],
        system: &[String],
        tools: &[serde_json::Value],
    ) -> serde_json::Value {
        let api_messages: Vec<serde_json::Value> = messages
            .iter()
            .filter(|m| m.role != Role::System)
            .map(|m| self.convert_message(m))
            .collect();

        let mut body = serde_json::json!({
            "model": self.model,
            "max_tokens": self.max_tokens,
            "messages": api_messages,
        });

        let system_text = system.join("\n\n");
        if !system_text.is_empty() {
            body["system"] = serde_json::json!(system_text);
        }
        if !tools.is_empty() {
            body["tools"] = serde_json::json!(tools);
        }

        body
    }

    fn convert_message(&self, msg: &Message) -> serde_json::Value {
        let role = match msg.role {
            Role::User | Role::Tool => "user",
            Role::Assistant => "assistant",
            Role::System => "user",
        };

        let content: Vec<serde_json::Value> = msg
            .content
            .iter()
            .map(|block| match block {
                ContentBlock::Text { text } => serde_json::json!({
                    "type": "text",
                    "text": text,
                }),
                ContentBlock::ToolUse { id, name, input } => serde_json::json!({
                    "type": "tool_use",
                    "id": id,
                    "name": name,
                    "input": serde_json::from_str::<serde_json::Value>(input).unwrap_or(serde_json::json!({})),
                }),
                ContentBlock::ToolResult {
                    tool_use_id,
                    output,
                    is_error,
                } => serde_json::json!({
                    "type": "tool_result",
                    "tool_use_id": tool_use_id,
                    "content": output,
                    "is_error": is_error,
                }),
            })
            .collect();

        serde_json::json!({ "role": role, "content": content })
    }

    fn parse_response(&self, body: &serde_json::Value) -> Result<ApiResponse, String> {
        let mut text = String::new();
        let mut tool_uses = Vec::new();

        if let Some(content) = body.get("content").and_then(|c| c.as_array()) {
            for block in content {
                match block.get("type").and_then(|t| t.as_str()) {
                    Some("text") => {
                        if let Some(t) = block.get("text").and_then(|t| t.as_str()) {
                            text.push_str(t);
                        }
                    }
                    Some("tool_use") => {
                        let id = block.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
                        let name = block.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
                        let input = block
                            .get("input")
                            .map(|v| v.to_string())
                            .unwrap_or_else(|| "{}".into());
                        tool_uses.push(ToolUse { id, name, input });
                    }
                    _ => {}
                }
            }
        }

        let usage = if let Some(u) = body.get("usage") {
            TokenUsage {
                input_tokens: u.get("input_tokens").and_then(|v| v.as_u64()).unwrap_or(0),
                output_tokens: u.get("output_tokens").and_then(|v| v.as_u64()).unwrap_or(0),
                cache_write_tokens: u
                    .get("cache_creation_input_tokens")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(0),
                cache_read_tokens: u
                    .get("cache_read_input_tokens")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(0),
            }
        } else {
            TokenUsage::default()
        };

        let stop_reason = body
            .get("stop_reason")
            .and_then(|v| v.as_str())
            .unwrap_or("end_turn")
            .to_string();

        Ok(ApiResponse {
            text,
            tool_uses,
            usage,
            stop_reason,
        })
    }

    fn is_retryable(status: u16) -> bool {
        matches!(status, 408 | 429 | 500 | 502 | 503 | 504)
    }
}

impl ApiClient for AnthropicApiClient {
    fn send(
        &mut self,
        messages: &[Message],
        system: &[String],
        tools: &[serde_json::Value],
    ) -> Result<ApiResponse, String> {
        let body = self.build_body(messages, system, tools);
        let url = format!("{}/v1/messages", self.base_url);
        let mut last_err = String::new();

        for attempt in 0..=self.max_retries {
            if attempt > 0 {
                let ms = 200u64 * (1u64 << (attempt - 1).min(4));
                std::thread::sleep(Duration::from_millis(ms));
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
                Ok(resp) => {
                    let status = resp.status().as_u16();
                    if status == 200 {
                        let json: serde_json::Value = resp
                            .json()
                            .map_err(|e| format!("Parse error: {}", e))?;
                        return self.parse_response(&json);
                    }
                    let err_body = resp.text().unwrap_or_default();
                    if Self::is_retryable(status) {
                        last_err = format!("HTTP {} (attempt {}): {}", status, attempt + 1, &err_body[..err_body.len().min(200)]);
                        continue;
                    }
                    return Err(format!("HTTP {}: {}", status, &err_body[..err_body.len().min(500)]));
                }
                Err(e) => {
                    if e.is_connect() || e.is_timeout() {
                        last_err = format!("Connection error (attempt {}): {}", attempt + 1, e);
                        continue;
                    }
                    return Err(format!("Request failed: {}", e));
                }
            }
        }
        Err(last_err)
    }
}

pub fn resolve_model(alias: &str) -> String {
    match alias {
        "opus" => "claude-opus-4-6".into(),
        "sonnet" => "claude-sonnet-4-6".into(),
        "haiku" => "claude-haiku-4-5-20251001".into(),
        other => other.into(),
    }
}
