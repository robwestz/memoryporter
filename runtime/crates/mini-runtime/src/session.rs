//! Session — conversation state with embedded usage tracking.
//!
//! Gamechanger #7: Session Snapshot with Embedded Usage.
//! One file = complete conversation state + cost history.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

// ── Token usage ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TokenUsage {
    pub input_tokens: u32,
    pub output_tokens: u32,
    pub cache_creation_tokens: u32,
    pub cache_read_tokens: u32,
}

impl TokenUsage {
    pub fn total(&self) -> u32 {
        self.input_tokens + self.output_tokens
    }

    pub fn add(&self, other: &TokenUsage) -> TokenUsage {
        TokenUsage {
            input_tokens: self.input_tokens + other.input_tokens,
            output_tokens: self.output_tokens + other.output_tokens,
            cache_creation_tokens: self.cache_creation_tokens + other.cache_creation_tokens,
            cache_read_tokens: self.cache_read_tokens + other.cache_read_tokens,
        }
    }
}

// ── Message types ───────────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Role {
    System,
    User,
    Assistant,
    Tool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ContentBlock {
    Text {
        text: String,
    },
    ToolUse {
        id: String,
        name: String,
        input: serde_json::Value,
    },
    ToolResult {
        tool_use_id: String,
        tool_name: String,
        output: String,
        is_error: bool,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: Role,
    pub blocks: Vec<ContentBlock>,
    pub usage: Option<TokenUsage>,
}

impl Message {
    pub fn user(text: impl Into<String>) -> Self {
        Self {
            role: Role::User,
            blocks: vec![ContentBlock::Text { text: text.into() }],
            usage: None,
        }
    }

    pub fn assistant(blocks: Vec<ContentBlock>, usage: Option<TokenUsage>) -> Self {
        Self {
            role: Role::Assistant,
            blocks,
            usage,
        }
    }

    pub fn assistant_text(text: impl Into<String>) -> Self {
        Self {
            role: Role::Assistant,
            blocks: vec![ContentBlock::Text { text: text.into() }],
            usage: None,
        }
    }

    pub fn tool_result(
        tool_use_id: impl Into<String>,
        tool_name: impl Into<String>,
        output: impl Into<String>,
        is_error: bool,
    ) -> Self {
        Self {
            role: Role::Tool,
            blocks: vec![ContentBlock::ToolResult {
                tool_use_id: tool_use_id.into(),
                tool_name: tool_name.into(),
                output: output.into(),
                is_error,
            }],
            usage: None,
        }
    }

    pub fn system(text: impl Into<String>) -> Self {
        Self {
            role: Role::System,
            blocks: vec![ContentBlock::Text { text: text.into() }],
            usage: None,
        }
    }

    /// Extract text content from the message.
    pub fn text(&self) -> String {
        self.blocks
            .iter()
            .filter_map(|b| match b {
                ContentBlock::Text { text } => Some(text.as_str()),
                _ => None,
            })
            .collect::<Vec<_>>()
            .join("")
    }

    /// Check if message contains any tool use blocks.
    pub fn has_tool_use(&self) -> bool {
        self.blocks
            .iter()
            .any(|b| matches!(b, ContentBlock::ToolUse { .. }))
    }
}

// ── Session ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub version: u32,
    pub messages: Vec<Message>,
}

impl Session {
    pub fn new() -> Self {
        Self {
            version: 1,
            messages: Vec::new(),
        }
    }

    pub fn add(&mut self, message: Message) {
        self.messages.push(message);
    }

    pub fn len(&self) -> usize {
        self.messages.len()
    }

    pub fn is_empty(&self) -> bool {
        self.messages.is_empty()
    }

    /// Save session to a JSON file.
    pub fn save(&self, path: &Path) -> Result<(), String> {
        let json = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize session: {}", e))?;
        fs::write(path, json).map_err(|e| format!("Failed to write session: {}", e))
    }

    /// Load session from a JSON file.
    pub fn load(path: &Path) -> Result<Self, String> {
        let json =
            fs::read_to_string(path).map_err(|e| format!("Failed to read session: {}", e))?;
        serde_json::from_str(&json).map_err(|e| format!("Failed to parse session: {}", e))
    }

    /// Reconstruct total token usage from embedded per-message usage.
    pub fn total_usage(&self) -> TokenUsage {
        self.messages
            .iter()
            .filter_map(|m| m.usage.as_ref())
            .fold(TokenUsage::default(), |acc, u| acc.add(u))
    }
}

impl Default for Session {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_session_save_load() {
        let mut session = Session::new();
        session.add(Message::user("hello"));
        session.add(Message::assistant_text("hi there"));

        let dir = tempdir().unwrap();
        let path = dir.path().join("session.json");
        session.save(&path).unwrap();

        let loaded = Session::load(&path).unwrap();
        assert_eq!(loaded.messages.len(), 2);
        assert_eq!(loaded.messages[0].text(), "hello");
        assert_eq!(loaded.messages[1].text(), "hi there");
    }

    #[test]
    fn test_total_usage() {
        let mut session = Session::new();
        session.add(Message {
            role: Role::Assistant,
            blocks: vec![ContentBlock::Text {
                text: "hi".into(),
            }],
            usage: Some(TokenUsage {
                input_tokens: 100,
                output_tokens: 50,
                ..Default::default()
            }),
        });
        session.add(Message {
            role: Role::Assistant,
            blocks: vec![ContentBlock::Text {
                text: "bye".into(),
            }],
            usage: Some(TokenUsage {
                input_tokens: 200,
                output_tokens: 75,
                ..Default::default()
            }),
        });

        let total = session.total_usage();
        assert_eq!(total.input_tokens, 300);
        assert_eq!(total.output_tokens, 125);
    }
}
