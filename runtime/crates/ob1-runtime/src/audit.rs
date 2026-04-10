//! Primitive #11 — Permission Audit Trail.
//!
//! Every permission decision is first-class data, not just a boolean gate.
//! Record granted AND denied, with context for replay.

use crate::permissions::{AuthzResult, PermissionDecision, PermissionPolicy};
use serde::{Deserialize, Serialize};

/// A timestamped audit entry.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEntry {
    pub session_id: String,
    pub turn: u32,
    pub decision: PermissionDecision,
    pub timestamp: String,
}

/// Accumulates permission audit entries across a session.
#[derive(Debug, Clone, Default)]
pub struct AuditTrail {
    entries: Vec<AuditEntry>,
}

impl AuditTrail {
    pub fn new() -> Self {
        Self { entries: Vec::new() }
    }

    /// Record a permission decision.
    pub fn record(
        &mut self,
        session_id: &str,
        turn: u32,
        tool_name: &str,
        result: &AuthzResult,
        policy: &PermissionPolicy,
    ) {
        let decision = policy.record_decision(tool_name, result);
        self.entries.push(AuditEntry {
            session_id: session_id.into(),
            turn,
            decision,
            timestamp: now_ts(),
        });
    }

    /// Get all entries.
    pub fn entries(&self) -> &[AuditEntry] {
        &self.entries
    }

    /// Get entries for a specific session.
    pub fn by_session(&self, session_id: &str) -> Vec<&AuditEntry> {
        self.entries.iter().filter(|e| e.session_id == session_id).collect()
    }

    /// Get denials only.
    pub fn denials(&self) -> Vec<&AuditEntry> {
        self.entries.iter().filter(|e| e.decision.result == "deny").collect()
    }

    /// Get denials for a specific turn.
    pub fn denials_for_turn(&self, session_id: &str, turn: u32) -> Vec<&AuditEntry> {
        self.entries
            .iter()
            .filter(|e| e.session_id == session_id && e.turn == turn && e.decision.result == "deny")
            .collect()
    }

    /// Count total decisions.
    pub fn total(&self) -> usize {
        self.entries.len()
    }

    /// Render as markdown for inclusion in turn result.
    pub fn turn_summary_markdown(&self, session_id: &str, turn: u32) -> String {
        let turn_entries: Vec<_> = self.entries
            .iter()
            .filter(|e| e.session_id == session_id && e.turn == turn)
            .collect();

        if turn_entries.is_empty() {
            return String::new();
        }

        let mut out = String::from("### Permission Decisions\n\n");
        for entry in &turn_entries {
            let icon = if entry.decision.result == "allow" { "ALLOW" } else { "DENY" };
            out.push_str(&format!(
                "- [{}] `{}` (required: {}, active: {}){}\n",
                icon,
                entry.decision.tool_name,
                entry.decision.mode_required,
                entry.decision.mode_active,
                if entry.decision.reason.is_empty() {
                    String::new()
                } else {
                    format!(" — {}", entry.decision.reason)
                }
            ));
        }
        out
    }

    /// Serialize to JSON.
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(&self.entries)
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
    use crate::permissions::{PermissionMode, PermissionPolicy};

    #[test]
    fn test_audit_trail() {
        let policy = PermissionPolicy::new("test", PermissionMode::ReadOnly)
            .with_tool_override("bash", PermissionMode::DangerFullAccess);

        let mut trail = AuditTrail::new();

        // Record an allow
        let allow_result = AuthzResult::Allow;
        trail.record("s1", 1, "read_file", &allow_result, &policy);

        // Record a deny (escalation prompt in interactive mode)
        let prompt_result = policy.authorize("bash");
        trail.record("s1", 1, "bash", &prompt_result, &policy);

        assert_eq!(trail.total(), 2);
        assert_eq!(trail.by_session("s1").len(), 2);
    }

    #[test]
    fn test_denials_filter() {
        let policy = PermissionPolicy::new("test", PermissionMode::DangerFullAccess)
            .with_deny("dangerous");

        let mut trail = AuditTrail::new();
        trail.record("s1", 1, "read_file", &AuthzResult::Allow, &policy);
        trail.record("s1", 1, "dangerous", &policy.authorize("dangerous"), &policy);

        assert_eq!(trail.denials().len(), 1);
        assert_eq!(trail.denials()[0].decision.tool_name, "dangerous");
    }

    #[test]
    fn test_turn_summary() {
        let policy = PermissionPolicy::new("test", PermissionMode::DangerFullAccess)
            .with_deny("bad_tool");

        let mut trail = AuditTrail::new();
        trail.record("s1", 3, "read_file", &AuthzResult::Allow, &policy);
        trail.record("s1", 3, "bad_tool", &policy.authorize("bad_tool"), &policy);

        let md = trail.turn_summary_markdown("s1", 3);
        assert!(md.contains("ALLOW"));
        assert!(md.contains("DENY"));
        assert!(md.contains("bad_tool"));
    }
}
