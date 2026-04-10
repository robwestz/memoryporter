//! Primitive #7 — System Event Logging.
//!
//! Separate from conversation. Answers "what did the system do?"
//! Every decision, every initialization, every error — structured and queryable.

use serde::{Deserialize, Serialize};

/// Event categories for filtering.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum EventCategory {
    Bootstrap,
    Registry,
    Routing,
    ToolExecution,
    Permission,
    Session,
    Budget,
    Compaction,
    Error,
    Custom(String),
}

/// A single system event — immutable record.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemEvent {
    pub category: EventCategory,
    pub title: String,
    pub detail: String,
    pub timestamp: String,
}

/// Append-only system event log.
#[derive(Debug, Clone, Default)]
pub struct EventLogger {
    events: Vec<SystemEvent>,
}

impl EventLogger {
    pub fn new() -> Self {
        Self { events: Vec::new() }
    }

    /// Log a system event.
    pub fn log(&mut self, category: EventCategory, title: &str, detail: &str) {
        self.events.push(SystemEvent {
            category,
            title: title.into(),
            detail: detail.into(),
            timestamp: now_ts(),
        });
    }

    /// Convenience: log a bootstrap event.
    pub fn bootstrap(&mut self, title: &str, detail: &str) {
        self.log(EventCategory::Bootstrap, title, detail);
    }

    /// Convenience: log a permission event.
    pub fn permission(&mut self, title: &str, detail: &str) {
        self.log(EventCategory::Permission, title, detail);
    }

    /// Convenience: log an error.
    pub fn error(&mut self, title: &str, detail: &str) {
        self.log(EventCategory::Error, title, detail);
    }

    /// Get all events.
    pub fn all(&self) -> &[SystemEvent] {
        &self.events
    }

    /// Filter by category.
    pub fn by_category(&self, category: &EventCategory) -> Vec<&SystemEvent> {
        self.events.iter().filter(|e| &e.category == category).collect()
    }

    /// Total event count.
    pub fn count(&self) -> usize {
        self.events.len()
    }

    /// Render as markdown (for /status or debugging).
    pub fn as_markdown(&self) -> String {
        let mut out = String::from("# System Event Log\n\n");
        for event in &self.events {
            out.push_str(&format!(
                "- **[{:?}]** {} — {}\n",
                event.category, event.title, event.detail
            ));
        }
        out
    }

    /// Serialize all events to JSON.
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(&self.events)
    }
}

fn now_ts() -> String {
    format!(
        "{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_event_logging() {
        let mut logger = EventLogger::new();
        logger.bootstrap("init", "loaded 42 tools");
        logger.permission("bash", "allowed by policy");
        logger.error("mcp_fail", "connection refused to github server");

        assert_eq!(logger.count(), 3);
        assert_eq!(logger.by_category(&EventCategory::Bootstrap).len(), 1);
        assert_eq!(logger.by_category(&EventCategory::Error).len(), 1);
    }

    #[test]
    fn test_markdown_rendering() {
        let mut logger = EventLogger::new();
        logger.bootstrap("startup", "7 stages completed");
        let md = logger.as_markdown();
        assert!(md.contains("# System Event Log"));
        assert!(md.contains("startup"));
    }

    #[test]
    fn test_json_serialization() {
        let mut logger = EventLogger::new();
        logger.log(EventCategory::Routing, "match", "3 tools matched");
        let json = logger.to_json().unwrap();
        assert!(json.contains("Routing"));
        assert!(json.contains("3 tools matched"));
    }
}
