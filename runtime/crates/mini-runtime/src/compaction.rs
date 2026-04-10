//! Auto-Compaction with Context Preservation.
//!
//! Gamechanger #2: Infinite conversations without losing context.
//! Detects token overflow, summarizes old messages, preserves recent ones.

use crate::session::{ContentBlock, Message, Role, Session, TokenUsage};

// ── Compaction config ───────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct CompactionConfig {
    /// Trigger compaction when cumulative input tokens exceed this.
    pub input_token_threshold: u32,
    /// Number of recent messages to preserve verbatim.
    pub preserve_recent: usize,
}

impl Default for CompactionConfig {
    fn default() -> Self {
        Self {
            input_token_threshold: 200_000,
            preserve_recent: 4,
        }
    }
}

// ── Compaction logic ────────────────────────────────────────────────────────

/// Check if compaction should be triggered.
pub fn should_compact(session: &Session, config: &CompactionConfig) -> bool {
    let total = session.total_usage();
    total.input_tokens > config.input_token_threshold
}

/// Compact a session: summarize old messages, preserve recent ones.
///
/// Returns a new session with:
/// 1. A system message containing the summary
/// 2. The most recent `preserve_recent` messages verbatim
pub fn compact(session: &Session, config: &CompactionConfig) -> Session {
    let messages = &session.messages;

    if messages.len() <= config.preserve_recent {
        return session.clone(); // Nothing to compact
    }

    let split_point = messages.len().saturating_sub(config.preserve_recent);
    let old_messages = &messages[..split_point];
    let recent_messages = &messages[split_point..];

    // Generate summary from old messages
    let summary = generate_summary(old_messages);

    let mut new_session = Session::new();

    // Add summary as system message
    new_session.add(Message::system(format!(
        "<context_summary>\n{}\n</context_summary>\n\n\
         Note: Earlier conversation was compacted. The summary above captures key context. \
         The {} most recent messages follow verbatim.",
        summary,
        config.preserve_recent
    )));

    // Preserve recent messages
    for msg in recent_messages {
        new_session.add(msg.clone());
    }

    new_session
}

/// Generate a text summary from messages.
fn generate_summary(messages: &[Message]) -> String {
    let mut summary_parts = Vec::new();
    let mut tool_uses = Vec::new();
    let mut key_decisions = Vec::new();

    for msg in messages {
        match msg.role {
            Role::User => {
                let text = msg.text();
                if !text.is_empty() {
                    summary_parts.push(format!("User asked: {}", truncate(&text, 200)));
                }
            }
            Role::Assistant => {
                let text = msg.text();
                if !text.is_empty() {
                    // Extract key points (lines starting with - or *)
                    for line in text.lines() {
                        let trimmed = line.trim();
                        if trimmed.starts_with("- ") || trimmed.starts_with("* ") {
                            key_decisions.push(trimmed.to_string());
                        }
                    }
                    summary_parts.push(format!("Assistant: {}", truncate(&text, 200)));
                }
                // Track tool usage
                for block in &msg.blocks {
                    if let ContentBlock::ToolUse { name, .. } = block {
                        tool_uses.push(name.clone());
                    }
                }
            }
            Role::Tool => {
                for block in &msg.blocks {
                    if let ContentBlock::ToolResult {
                        tool_name,
                        is_error,
                        ..
                    } = block
                    {
                        if *is_error {
                            summary_parts
                                .push(format!("Tool `{}` returned an error.", tool_name));
                        }
                    }
                }
            }
            Role::System => {
                summary_parts.push(format!("System context was set."));
            }
        }
    }

    let mut output = String::new();

    output.push_str("## Conversation Summary\n\n");

    if !summary_parts.is_empty() {
        output.push_str("### Flow\n");
        for part in summary_parts.iter().take(20) {
            output.push_str(&format!("- {}\n", part));
        }
        output.push('\n');
    }

    if !tool_uses.is_empty() {
        // Deduplicate and count
        let mut tool_counts: Vec<(String, usize)> = Vec::new();
        for tool in &tool_uses {
            if let Some(entry) = tool_counts.iter_mut().find(|(n, _)| n == tool) {
                entry.1 += 1;
            } else {
                tool_counts.push((tool.clone(), 1));
            }
        }
        output.push_str("### Tools Used\n");
        for (name, count) in &tool_counts {
            output.push_str(&format!("- `{}` ({}x)\n", name, count));
        }
        output.push('\n');
    }

    if !key_decisions.is_empty() {
        output.push_str("### Key Points\n");
        for decision in key_decisions.iter().take(10) {
            output.push_str(&format!("{}\n", decision));
        }
        output.push('\n');
    }

    output
}

fn truncate(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len])
    }
}

// ── Usage tracker ───────────────────────────────────────────────────────────

#[derive(Debug, Clone, Default)]
pub struct UsageTracker {
    pub latest_turn: TokenUsage,
    pub cumulative: TokenUsage,
    pub turns: u32,
}

impl UsageTracker {
    pub fn new() -> Self {
        Self::default()
    }

    /// Record usage from an API response.
    pub fn record(&mut self, usage: &TokenUsage) {
        self.latest_turn = usage.clone();
        self.cumulative = self.cumulative.add(usage);
        self.turns += 1;
    }

    /// Reconstruct tracker from a session's embedded usage.
    pub fn from_session(session: &Session) -> Self {
        let mut tracker = Self::new();
        for msg in &session.messages {
            if let Some(usage) = &msg.usage {
                tracker.record(usage);
            }
        }
        tracker
    }

    /// Estimate cost in USD (rough, Sonnet pricing).
    pub fn estimated_cost_usd(&self) -> f64 {
        let input_cost = self.cumulative.input_tokens as f64 * 3.0 / 1_000_000.0;
        let output_cost = self.cumulative.output_tokens as f64 * 15.0 / 1_000_000.0;
        input_cost + output_cost
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_should_compact() {
        let config = CompactionConfig {
            input_token_threshold: 100,
            preserve_recent: 2,
        };

        let mut session = Session::new();
        assert!(!should_compact(&session, &config));

        // Add messages with high token count
        session.add(Message {
            role: Role::Assistant,
            blocks: vec![ContentBlock::Text {
                text: "response".into(),
            }],
            usage: Some(TokenUsage {
                input_tokens: 150,
                output_tokens: 50,
                ..Default::default()
            }),
        });
        assert!(should_compact(&session, &config));
    }

    #[test]
    fn test_compact_preserves_recent() {
        let config = CompactionConfig {
            input_token_threshold: 0,
            preserve_recent: 2,
        };

        let mut session = Session::new();
        session.add(Message::user("old message 1"));
        session.add(Message::assistant_text("old response 1"));
        session.add(Message::user("recent question"));
        session.add(Message::assistant_text("recent answer"));

        let compacted = compact(&session, &config);

        // Should have: 1 summary + 2 preserved
        assert_eq!(compacted.messages.len(), 3);
        assert_eq!(compacted.messages[0].role, Role::System);
        assert!(compacted.messages[0].text().contains("context_summary"));
        assert_eq!(compacted.messages[1].text(), "recent question");
        assert_eq!(compacted.messages[2].text(), "recent answer");
    }

    #[test]
    fn test_usage_tracker() {
        let mut tracker = UsageTracker::new();
        tracker.record(&TokenUsage {
            input_tokens: 100,
            output_tokens: 50,
            ..Default::default()
        });
        tracker.record(&TokenUsage {
            input_tokens: 200,
            output_tokens: 75,
            ..Default::default()
        });

        assert_eq!(tracker.turns, 2);
        assert_eq!(tracker.cumulative.input_tokens, 300);
        assert_eq!(tracker.cumulative.output_tokens, 125);
        assert_eq!(tracker.latest_turn.input_tokens, 200);
    }
}
