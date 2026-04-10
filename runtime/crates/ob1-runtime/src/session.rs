//! Primitive #3 — Session Persistence that survives crashes.
//!
//! Session = conversation + usage + permissions + config. All recoverable.

use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

/// A message in the conversation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: Role,
    pub content: Vec<ContentBlock>,
    pub usage: Option<TokenUsage>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Role {
    System,
    User,
    Assistant,
    Tool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ContentBlock {
    Text { text: String },
    ToolUse { id: String, name: String, input: String },
    ToolResult { tool_use_id: String, output: String, is_error: bool },
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TokenUsage {
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub cache_write_tokens: u64,
    pub cache_read_tokens: u64,
}

impl TokenUsage {
    pub fn total(&self) -> u64 {
        self.input_tokens + self.output_tokens
    }

    pub fn add(&self, other: &TokenUsage) -> TokenUsage {
        TokenUsage {
            input_tokens: self.input_tokens + other.input_tokens,
            output_tokens: self.output_tokens + other.output_tokens,
            cache_write_tokens: self.cache_write_tokens + other.cache_write_tokens,
            cache_read_tokens: self.cache_read_tokens + other.cache_read_tokens,
        }
    }
}

/// Complete session state — everything needed to resume.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub version: u32,
    pub session_id: String,
    pub status: SessionStatus,
    pub messages: Vec<Message>,
    pub cumulative_usage: TokenUsage,
    pub turn_count: u32,
    pub compaction_count: u32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SessionStatus {
    Active,
    Suspended,
    Completed,
    Crashed,
}

impl Session {
    pub fn new(session_id: &str) -> Self {
        let now = now_iso8601();
        Self {
            version: 1,
            session_id: session_id.into(),
            status: SessionStatus::Active,
            messages: Vec::new(),
            cumulative_usage: TokenUsage::default(),
            turn_count: 0,
            compaction_count: 0,
            created_at: now.clone(),
            updated_at: now,
        }
    }

    /// Add a user message.
    pub fn add_user_message(&mut self, text: &str) {
        self.messages.push(Message {
            role: Role::User,
            content: vec![ContentBlock::Text { text: text.into() }],
            usage: None,
        });
        self.updated_at = now_iso8601();
    }

    /// Add an assistant message with usage.
    pub fn add_assistant_message(&mut self, text: &str, usage: TokenUsage) {
        self.cumulative_usage = self.cumulative_usage.add(&usage);
        self.turn_count += 1;
        self.messages.push(Message {
            role: Role::Assistant,
            content: vec![ContentBlock::Text { text: text.into() }],
            usage: Some(usage),
        });
        self.updated_at = now_iso8601();
    }

    /// Add a tool result.
    pub fn add_tool_result(&mut self, tool_use_id: &str, output: &str, is_error: bool) {
        self.messages.push(Message {
            role: Role::Tool,
            content: vec![ContentBlock::ToolResult {
                tool_use_id: tool_use_id.into(),
                output: output.into(),
                is_error,
            }],
            usage: None,
        });
        self.updated_at = now_iso8601();
    }

    /// Compact old messages, preserving the last `keep` messages.
    pub fn compact(&mut self, keep: usize) {
        if self.messages.len() > keep {
            let removed = self.messages.len() - keep;
            self.messages = self.messages.split_off(removed);
            self.compaction_count += 1;
            self.updated_at = now_iso8601();
        }
    }

    /// Save session to disk as JSON.
    pub fn save(&self, path: &Path) -> Result<(), Box<dyn std::error::Error>> {
        let json = serde_json::to_string_pretty(self)?;
        std::fs::write(path, json)?;
        Ok(())
    }

    /// Load session from disk.
    pub fn load(path: &Path) -> Result<Self, Box<dyn std::error::Error>> {
        let json = std::fs::read_to_string(path)?;
        let session: Session = serde_json::from_str(&json)?;
        Ok(session)
    }

    /// Reconstruct cumulative usage from embedded message usage (for resume).
    pub fn reconstruct_usage(&mut self) {
        self.cumulative_usage = TokenUsage::default();
        self.turn_count = 0;
        for msg in &self.messages {
            if let Some(usage) = &msg.usage {
                self.cumulative_usage = self.cumulative_usage.add(usage);
                self.turn_count += 1;
            }
        }
    }
}

/// Persistent session file with atomic writes.
///
/// Saves session state to disk after each turn. Uses write-to-tmp + rename
/// to avoid corruption if the process crashes mid-write.
#[derive(Debug, Clone)]
pub struct SessionFile {
    path: PathBuf,
}

impl SessionFile {
    pub fn new(path: impl Into<PathBuf>) -> Self {
        Self { path: path.into() }
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    /// Atomic save: write to .tmp then rename.
    pub fn save(&self, session: &Session) -> Result<(), Box<dyn std::error::Error>> {
        let json = serde_json::to_string_pretty(session)?;
        let tmp_path = self.path.with_extension("json.tmp");
        std::fs::write(&tmp_path, &json)?;
        std::fs::rename(&tmp_path, &self.path)?;
        Ok(())
    }

    /// Load session from the file.
    pub fn load(&self) -> Result<Session, Box<dyn std::error::Error>> {
        let json = std::fs::read_to_string(&self.path)?;
        let session: Session = serde_json::from_str(&json)?;
        Ok(session)
    }

    /// Check if the session file exists.
    pub fn exists(&self) -> bool {
        self.path.exists()
    }
}

fn now_iso8601() -> String {
    // Simple timestamp — in production use chrono or similar
    format!("{}", std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_session_lifecycle() {
        let mut session = Session::new("test-001");
        assert_eq!(session.status, SessionStatus::Active);
        assert_eq!(session.turn_count, 0);

        session.add_user_message("hello");
        session.add_assistant_message("hi there", TokenUsage {
            input_tokens: 10,
            output_tokens: 5,
            ..Default::default()
        });

        assert_eq!(session.turn_count, 1);
        assert_eq!(session.cumulative_usage.input_tokens, 10);
        assert_eq!(session.messages.len(), 2);
    }

    #[test]
    fn test_compact() {
        let mut session = Session::new("test-002");
        for i in 0..20 {
            session.add_user_message(&format!("msg {}", i));
        }
        assert_eq!(session.messages.len(), 20);
        session.compact(5);
        assert_eq!(session.messages.len(), 5);
        assert_eq!(session.compaction_count, 1);
    }

    #[test]
    fn test_save_load_roundtrip() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("session.json");

        let mut session = Session::new("test-003");
        session.add_user_message("save me");
        session.add_assistant_message("saved", TokenUsage {
            input_tokens: 100,
            output_tokens: 50,
            ..Default::default()
        });
        session.save(&path).unwrap();

        let loaded = Session::load(&path).unwrap();
        assert_eq!(loaded.session_id, "test-003");
        assert_eq!(loaded.messages.len(), 2);
        assert_eq!(loaded.cumulative_usage.input_tokens, 100);
    }

    #[test]
    fn test_session_file_save_load_roundtrip() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("session.json");
        let sf = SessionFile::new(&path);

        let mut session = Session::new("sf-001");
        session.add_user_message("hello");
        session.add_assistant_message("hi", TokenUsage {
            input_tokens: 50, output_tokens: 25, ..Default::default()
        });

        sf.save(&session).unwrap();
        assert!(sf.exists());

        let loaded = sf.load().unwrap();
        assert_eq!(loaded.session_id, "sf-001");
        assert_eq!(loaded.messages.len(), 2);
        assert_eq!(loaded.cumulative_usage.input_tokens, 50);
    }

    #[test]
    fn test_session_file_atomic_no_tmp_lingers() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("sess.json");
        let sf = SessionFile::new(&path);

        sf.save(&Session::new("sf-002")).unwrap();
        // The .tmp file should not exist after successful save
        assert!(!dir.path().join("sess.json.tmp").exists());
        assert!(path.exists());
    }

    #[test]
    fn test_session_file_load_nonexistent() {
        let sf = SessionFile::new("/nonexistent/path/session.json");
        assert!(sf.load().is_err());
        assert!(!sf.exists());
    }

    #[test]
    fn test_session_file_load_corrupt() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("corrupt.json");
        std::fs::write(&path, "not valid json{{{").unwrap();

        let sf = SessionFile::new(&path);
        assert!(sf.load().is_err());
    }

    #[test]
    fn test_session_file_multiple_overwrites() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("multi.json");
        let sf = SessionFile::new(&path);

        for i in 0..5 {
            let mut s = Session::new(&format!("sf-{}", i));
            s.add_user_message(&format!("msg {}", i));
            sf.save(&s).unwrap();
        }

        let loaded = sf.load().unwrap();
        assert_eq!(loaded.session_id, "sf-4");
        assert_eq!(loaded.messages.len(), 1);
    }

    #[test]
    fn test_session_file_preserves_all_fields() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("fields.json");
        let sf = SessionFile::new(&path);

        let mut session = Session::new("sf-fields");
        session.add_user_message("hello");
        session.add_assistant_message("hi", TokenUsage {
            input_tokens: 10, output_tokens: 5,
            cache_write_tokens: 2, cache_read_tokens: 3,
        });
        session.add_tool_result("tu1", "output", false);
        session.compact(2);

        sf.save(&session).unwrap();
        let loaded = sf.load().unwrap();

        assert_eq!(loaded.version, 1);
        assert_eq!(loaded.session_id, "sf-fields");
        assert_eq!(loaded.compaction_count, 1);
        assert_eq!(loaded.cumulative_usage.cache_write_tokens, 2);
        assert_eq!(loaded.cumulative_usage.cache_read_tokens, 3);
    }

    #[test]
    fn test_session_file_resume_with_reconstruct() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("resume.json");
        let sf = SessionFile::new(&path);

        let mut session = Session::new("sf-resume");
        session.add_user_message("q1");
        session.add_assistant_message("a1", TokenUsage {
            input_tokens: 100, output_tokens: 50, ..Default::default()
        });
        session.add_user_message("q2");
        session.add_assistant_message("a2", TokenUsage {
            input_tokens: 200, output_tokens: 100, ..Default::default()
        });
        sf.save(&session).unwrap();

        // Load and reconstruct (simulates resume)
        let mut loaded = sf.load().unwrap();
        loaded.cumulative_usage = TokenUsage::default();
        loaded.turn_count = 0;
        loaded.reconstruct_usage();

        assert_eq!(loaded.turn_count, 2);
        assert_eq!(loaded.cumulative_usage.input_tokens, 300);
        assert_eq!(loaded.cumulative_usage.output_tokens, 150);
        assert_eq!(loaded.messages.len(), 4);
    }

    #[test]
    fn test_reconstruct_usage() {
        let mut session = Session::new("test-004");
        session.add_assistant_message("a", TokenUsage { input_tokens: 10, output_tokens: 5, ..Default::default() });
        session.add_assistant_message("b", TokenUsage { input_tokens: 20, output_tokens: 10, ..Default::default() });

        // Zero out and reconstruct
        session.cumulative_usage = TokenUsage::default();
        session.turn_count = 0;
        session.reconstruct_usage();
        assert_eq!(session.cumulative_usage.input_tokens, 30);
        assert_eq!(session.cumulative_usage.output_tokens, 15);
        assert_eq!(session.turn_count, 2);
    }
}
