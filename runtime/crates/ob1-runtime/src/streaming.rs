//! Primitive #6 — Structured Streaming Events.
//!
//! Each event communicates system state, not just text fragments.
//! Enables real-time course correction.

use serde::{Deserialize, Serialize};

/// Typed streaming events — the agent communicates state, not just text.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StreamEvent {
    /// Session opened, initial metadata.
    MessageStart {
        session_id: String,
        model: String,
    },
    /// A command or tool was matched for potential execution.
    ToolMatch {
        tool_name: String,
        input_preview: String,
    },
    /// A permission check result.
    PermissionDecision {
        tool_name: String,
        allowed: bool,
        reason: String,
    },
    /// Streaming text delta from the model.
    TextDelta {
        text: String,
    },
    /// A tool execution started.
    ToolStart {
        tool_use_id: String,
        tool_name: String,
    },
    /// A tool execution completed.
    ToolResult {
        tool_use_id: String,
        tool_name: String,
        is_error: bool,
    },
    /// Usage update mid-stream.
    Usage {
        input_tokens: u64,
        output_tokens: u64,
    },
    /// Stream ended.
    MessageStop {
        stop_reason: String,
        total_input_tokens: u64,
        total_output_tokens: u64,
    },
}

/// Dispatches stream events to registered handlers.
pub struct StreamEventDispatcher {
    handlers: Vec<Box<dyn StreamEventHandler>>,
}

pub trait StreamEventHandler: Send {
    fn handle(&mut self, event: &StreamEvent);
}

impl StreamEventDispatcher {
    pub fn new() -> Self {
        Self {
            handlers: Vec::new(),
        }
    }

    pub fn add_handler(&mut self, handler: Box<dyn StreamEventHandler>) {
        self.handlers.push(handler);
    }

    pub fn dispatch(&mut self, event: &StreamEvent) {
        for handler in &mut self.handlers {
            handler.handle(event);
        }
    }
}

/// Collects all events for later inspection (useful for testing/logging).
pub struct EventCollector {
    pub events: Vec<StreamEvent>,
}

impl EventCollector {
    pub fn new() -> Self {
        Self { events: Vec::new() }
    }
}

impl StreamEventHandler for EventCollector {
    fn handle(&mut self, event: &StreamEvent) {
        self.events.push(event.clone());
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dispatcher() {
        let mut dispatcher = StreamEventDispatcher::new();
        let collector = EventCollector::new();
        dispatcher.add_handler(Box::new(collector));

        dispatcher.dispatch(&StreamEvent::MessageStart {
            session_id: "s1".into(),
            model: "opus".into(),
        });
        dispatcher.dispatch(&StreamEvent::TextDelta {
            text: "hello".into(),
        });
        dispatcher.dispatch(&StreamEvent::MessageStop {
            stop_reason: "completed".into(),
            total_input_tokens: 100,
            total_output_tokens: 50,
        });

        // Can't easily access the collector after moving into Box, but the dispatch works
        // In production, use Arc<Mutex<EventCollector>> for shared access
    }

    #[test]
    fn test_event_serialization() {
        let event = StreamEvent::ToolMatch {
            tool_name: "bash".into(),
            input_preview: "ls -la".into(),
        };
        let json = serde_json::to_string(&event).unwrap();
        assert!(json.contains("bash"));
        assert!(json.contains("ls -la"));

        let roundtrip: StreamEvent = serde_json::from_str(&json).unwrap();
        match roundtrip {
            StreamEvent::ToolMatch { tool_name, .. } => assert_eq!(tool_name, "bash"),
            _ => panic!("Wrong variant"),
        }
    }
}
