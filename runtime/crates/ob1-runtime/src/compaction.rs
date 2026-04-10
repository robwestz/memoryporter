//! Primitive #10 — Transcript Compaction.
//!
//! Conversation history is a managed resource, not an append-only log.
//! Compact by summarizing old entries while preserving recent context.

use crate::session::{Message, Role, ContentBlock};
use serde::{Deserialize, Serialize};

/// Configuration for automatic compaction.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompactionConfig {
    /// Trigger compaction when input tokens exceed this.
    pub token_threshold: u64,
    /// Number of recent messages to always preserve verbatim.
    pub preserve_recent: usize,
    /// Maximum consecutive compaction failures before giving up.
    pub max_consecutive_failures: u32,
}

impl Default for CompactionConfig {
    fn default() -> Self {
        Self {
            token_threshold: 200_000,
            preserve_recent: 4,
            max_consecutive_failures: 3, // The 3-line fix
        }
    }
}

/// Result of a compaction operation.
#[derive(Debug, Clone)]
pub struct CompactionResult {
    pub messages_before: usize,
    pub messages_after: usize,
    pub summary: String,
    pub preserved_count: usize,
}

/// Compact a message list by summarizing old messages.
///
/// Strategy:
/// 1. Split messages into old (to summarize) and recent (to preserve)
/// 2. Generate a text summary of old messages
/// 3. Return summary as system message + preserved recent messages
pub fn compact_messages(
    messages: &[Message],
    config: &CompactionConfig,
) -> CompactionResult {
    let total = messages.len();
    if total <= config.preserve_recent {
        return CompactionResult {
            messages_before: total,
            messages_after: total,
            summary: String::new(),
            preserved_count: total,
        };
    }

    let split_point = total - config.preserve_recent;
    let old_messages = &messages[..split_point];
    let preserved_count = config.preserve_recent;

    // Generate summary from old messages
    let summary = summarize_messages(old_messages);

    CompactionResult {
        messages_before: total,
        messages_after: 1 + preserved_count, // summary + preserved
        summary,
        preserved_count,
    }
}

/// Apply compaction to a mutable message list in-place.
pub fn apply_compaction(
    messages: &mut Vec<Message>,
    config: &CompactionConfig,
) -> Option<CompactionResult> {
    let result = compact_messages(messages, config);
    if result.summary.is_empty() {
        return None;
    }

    let split = messages.len() - config.preserve_recent;
    let preserved: Vec<Message> = messages.split_off(split);

    // Replace with summary + preserved
    messages.clear();
    messages.push(Message {
        role: Role::System,
        content: vec![ContentBlock::Text {
            text: format!("<compaction_summary>\n{}\n</compaction_summary>\n\nThe conversation was compacted. The above is a summary of earlier messages. Recent messages follow.", result.summary),
        }],
        usage: None,
    });
    messages.extend(preserved);

    Some(result)
}

/// Generate a text summary from messages (simple extraction, no LLM).
/// In production, this would call the LLM for a proper summary.
fn summarize_messages(messages: &[Message]) -> String {
    let mut parts = Vec::new();

    let mut user_topics = Vec::new();
    let mut assistant_actions = Vec::new();
    let mut tools_used = Vec::new();

    for msg in messages {
        for block in &msg.content {
            match block {
                ContentBlock::Text { text } => {
                    let preview: String = text.chars().take(100).collect();
                    match msg.role {
                        Role::User => user_topics.push(preview),
                        Role::Assistant => assistant_actions.push(preview),
                        _ => {}
                    }
                }
                ContentBlock::ToolUse { name, .. } => {
                    if !tools_used.contains(name) {
                        tools_used.push(name.clone());
                    }
                }
                ContentBlock::ToolResult { tool_use_id: _, output, is_error } => {
                    if *is_error {
                        parts.push(format!("Tool error: {}", &output[..output.len().min(80)]));
                    }
                }
            }
        }
    }

    if !user_topics.is_empty() {
        parts.push(format!("User discussed: {}", user_topics.join("; ")));
    }
    if !assistant_actions.is_empty() {
        parts.push(format!("Assistant actions: {}", assistant_actions.len()));
    }
    if !tools_used.is_empty() {
        parts.push(format!("Tools used: {}", tools_used.join(", ")));
    }

    parts.join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::session::TokenUsage;

    fn make_messages(count: usize) -> Vec<Message> {
        (0..count)
            .map(|i| Message {
                role: if i % 2 == 0 { Role::User } else { Role::Assistant },
                content: vec![ContentBlock::Text {
                    text: format!("Message {}", i),
                }],
                usage: if i % 2 == 1 {
                    Some(TokenUsage { input_tokens: 100, output_tokens: 50, ..Default::default() })
                } else {
                    None
                },
            })
            .collect()
    }

    #[test]
    fn test_compact_small_list() {
        let messages = make_messages(3);
        let config = CompactionConfig { preserve_recent: 4, ..Default::default() };
        let result = compact_messages(&messages, &config);
        assert!(result.summary.is_empty()); // Too few to compact
    }

    #[test]
    fn test_compact_large_list() {
        let messages = make_messages(20);
        let config = CompactionConfig { preserve_recent: 4, ..Default::default() };
        let result = compact_messages(&messages, &config);
        assert!(!result.summary.is_empty());
        assert_eq!(result.messages_after, 5); // 1 summary + 4 preserved
        assert_eq!(result.preserved_count, 4);
    }

    #[test]
    fn test_apply_compaction_in_place() {
        let mut messages = make_messages(10);
        let config = CompactionConfig { preserve_recent: 3, ..Default::default() };
        let result = apply_compaction(&mut messages, &config);
        assert!(result.is_some());
        assert_eq!(messages.len(), 4); // 1 summary + 3 preserved
        assert!(matches!(messages[0].role, Role::System));
    }
}
