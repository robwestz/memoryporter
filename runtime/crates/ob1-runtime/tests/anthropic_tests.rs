//! Tests for anthropic.rs — message conversion, response parsing, model resolution.

use ob1_runtime::anthropic::resolve_model;
use ob1_runtime::runtime::{ApiResponse, ToolUse};
use ob1_runtime::session::{ContentBlock, Message, Role, TokenUsage};

#[test]
fn test_resolve_model_aliases() {
    assert_eq!(resolve_model("opus"), "claude-opus-4-6");
    assert_eq!(resolve_model("sonnet"), "claude-sonnet-4-6");
    assert_eq!(resolve_model("haiku"), "claude-haiku-4-5-20251001");
}

#[test]
fn test_resolve_model_passthrough() {
    assert_eq!(resolve_model("claude-opus-4-6"), "claude-opus-4-6");
    assert_eq!(resolve_model("custom-model-v1"), "custom-model-v1");
}

#[test]
fn test_parse_text_response() {
    let body = serde_json::json!({
        "content": [{ "type": "text", "text": "Hello world" }],
        "usage": { "input_tokens": 100, "output_tokens": 25, "cache_creation_input_tokens": 0, "cache_read_input_tokens": 0 },
        "stop_reason": "end_turn"
    });
    let resp = parse_response_helper(&body).unwrap();
    assert_eq!(resp.text, "Hello world");
    assert!(resp.tool_uses.is_empty());
    assert_eq!(resp.usage.input_tokens, 100);
    assert_eq!(resp.usage.output_tokens, 25);
    assert_eq!(resp.stop_reason, "end_turn");
}

#[test]
fn test_parse_tool_use_response() {
    let body = serde_json::json!({
        "content": [
            { "type": "text", "text": "I'll read that file." },
            { "type": "tool_use", "id": "tu_abc123", "name": "read_file", "input": { "file_path": "/tmp/test.rs" } }
        ],
        "usage": { "input_tokens": 200, "output_tokens": 50 },
        "stop_reason": "tool_use"
    });
    let resp = parse_response_helper(&body).unwrap();
    assert_eq!(resp.text, "I'll read that file.");
    assert_eq!(resp.tool_uses.len(), 1);
    assert_eq!(resp.tool_uses[0].id, "tu_abc123");
    assert_eq!(resp.tool_uses[0].name, "read_file");
    assert!(resp.tool_uses[0].input.contains("test.rs"));
    assert_eq!(resp.stop_reason, "tool_use");
}

#[test]
fn test_parse_multiple_tool_uses() {
    let body = serde_json::json!({
        "content": [
            { "type": "text", "text": "" },
            { "type": "tool_use", "id": "t1", "name": "bash", "input": { "command": "ls" } },
            { "type": "tool_use", "id": "t2", "name": "read_file", "input": { "path": "a.rs" } }
        ],
        "usage": { "input_tokens": 10, "output_tokens": 5 },
        "stop_reason": "tool_use"
    });
    let resp = parse_response_helper(&body).unwrap();
    assert_eq!(resp.tool_uses.len(), 2);
    assert_eq!(resp.tool_uses[0].name, "bash");
    assert_eq!(resp.tool_uses[1].name, "read_file");
}

#[test]
fn test_parse_response_missing_usage() {
    let body = serde_json::json!({
        "content": [{ "type": "text", "text": "ok" }],
        "stop_reason": "end_turn"
    });
    let resp = parse_response_helper(&body).unwrap();
    assert_eq!(resp.text, "ok");
    assert_eq!(resp.usage.input_tokens, 0);
}

#[test]
fn test_parse_response_with_cache_tokens() {
    let body = serde_json::json!({
        "content": [{ "type": "text", "text": "cached" }],
        "usage": { "input_tokens": 50, "output_tokens": 10, "cache_creation_input_tokens": 1000, "cache_read_input_tokens": 500 },
        "stop_reason": "end_turn"
    });
    let resp = parse_response_helper(&body).unwrap();
    assert_eq!(resp.usage.cache_write_tokens, 1000);
    assert_eq!(resp.usage.cache_read_tokens, 500);
}

#[test]
fn test_parse_empty_content() {
    let body = serde_json::json!({
        "content": [],
        "usage": { "input_tokens": 5, "output_tokens": 0 },
        "stop_reason": "end_turn"
    });
    let resp = parse_response_helper(&body).unwrap();
    assert_eq!(resp.text, "");
    assert!(resp.tool_uses.is_empty());
}

#[test]
fn test_convert_user_message() {
    let msg = Message {
        role: Role::User,
        content: vec![ContentBlock::Text { text: "hello".into() }],
        usage: None,
    };
    let json = convert_message_helper(&msg);
    assert_eq!(json["role"], "user");
    assert_eq!(json["content"][0]["type"], "text");
    assert_eq!(json["content"][0]["text"], "hello");
}

#[test]
fn test_convert_assistant_message() {
    let msg = Message {
        role: Role::Assistant,
        content: vec![ContentBlock::Text { text: "hi".into() }],
        usage: Some(TokenUsage { input_tokens: 10, output_tokens: 5, ..Default::default() }),
    };
    let json = convert_message_helper(&msg);
    assert_eq!(json["role"], "assistant");
}

#[test]
fn test_convert_tool_result_message() {
    let msg = Message {
        role: Role::Tool,
        content: vec![ContentBlock::ToolResult {
            tool_use_id: "tu_123".into(),
            output: "file contents here".into(),
            is_error: false,
        }],
        usage: None,
    };
    let json = convert_message_helper(&msg);
    assert_eq!(json["role"], "user");
    assert_eq!(json["content"][0]["type"], "tool_result");
    assert_eq!(json["content"][0]["tool_use_id"], "tu_123");
}

#[test]
fn test_convert_tool_use_invalid_json_input() {
    let msg = Message {
        role: Role::Assistant,
        content: vec![ContentBlock::ToolUse {
            id: "tu_789".into(),
            name: "bash".into(),
            input: "not valid json".into(),
        }],
        usage: None,
    };
    let json = convert_message_helper(&msg);
    assert_eq!(json["content"][0]["input"], serde_json::json!({}));
}

#[test]
fn test_is_retryable() {
    for code in [408, 429, 500, 502, 503, 504] {
        assert!(is_retryable_helper(code), "{} should be retryable", code);
    }
    for code in [400, 401, 403, 404, 422] {
        assert!(!is_retryable_helper(code), "{} should not be retryable", code);
    }
}

// ── Helpers mirroring internal logic (can't call private methods) ──

fn parse_response_helper(body: &serde_json::Value) -> Result<ApiResponse, String> {
    let mut text = String::new();
    let mut tool_uses = Vec::new();
    if let Some(content) = body.get("content").and_then(|c| c.as_array()) {
        for block in content {
            match block.get("type").and_then(|t| t.as_str()) {
                Some("text") => { if let Some(t) = block.get("text").and_then(|t| t.as_str()) { text.push_str(t); } }
                Some("tool_use") => {
                    tool_uses.push(ToolUse {
                        id: block.get("id").and_then(|v| v.as_str()).unwrap_or("").into(),
                        name: block.get("name").and_then(|v| v.as_str()).unwrap_or("").into(),
                        input: block.get("input").map(|v| v.to_string()).unwrap_or_else(|| "{}".into()),
                    });
                }
                _ => {}
            }
        }
    }
    let usage = if let Some(u) = body.get("usage") {
        TokenUsage {
            input_tokens: u.get("input_tokens").and_then(|v| v.as_u64()).unwrap_or(0),
            output_tokens: u.get("output_tokens").and_then(|v| v.as_u64()).unwrap_or(0),
            cache_write_tokens: u.get("cache_creation_input_tokens").and_then(|v| v.as_u64()).unwrap_or(0),
            cache_read_tokens: u.get("cache_read_input_tokens").and_then(|v| v.as_u64()).unwrap_or(0),
        }
    } else { TokenUsage::default() };
    let stop_reason = body.get("stop_reason").and_then(|v| v.as_str()).unwrap_or("end_turn").to_string();
    Ok(ApiResponse { text, tool_uses, usage, stop_reason })
}

fn convert_message_helper(msg: &Message) -> serde_json::Value {
    let role = match msg.role { Role::User | Role::Tool => "user", Role::Assistant => "assistant", Role::System => "user" };
    let content: Vec<serde_json::Value> = msg.content.iter().map(|block| match block {
        ContentBlock::Text { text } => serde_json::json!({"type": "text", "text": text}),
        ContentBlock::ToolUse { id, name, input } => serde_json::json!({
            "type": "tool_use", "id": id, "name": name,
            "input": serde_json::from_str::<serde_json::Value>(input).unwrap_or(serde_json::json!({})),
        }),
        ContentBlock::ToolResult { tool_use_id, output, is_error } => serde_json::json!({
            "type": "tool_result", "tool_use_id": tool_use_id, "content": output, "is_error": is_error,
        }),
    }).collect();
    serde_json::json!({"role": role, "content": content})
}

fn is_retryable_helper(status: u16) -> bool {
    matches!(status, 408 | 429 | 500 | 502 | 503 | 504)
}
