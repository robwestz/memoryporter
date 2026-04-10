//! Permission Escalation Hierarchy.
//!
//! Gamechanger #5: Graduated trust with per-tool granularity.
//! ReadOnly < WorkspaceWrite < DangerFullAccess.

use crate::traits::{PermissionDecision, PermissionPrompter, PermissionRequest};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

// ── Permission modes (ordered) ──────────────────────────────────────────────

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum PermissionMode {
    ReadOnly,
    WorkspaceWrite,
    DangerFullAccess,
}

impl PermissionMode {
    pub fn label(&self) -> &str {
        match self {
            Self::ReadOnly => "read-only",
            Self::WorkspaceWrite => "workspace-write",
            Self::DangerFullAccess => "danger-full-access",
        }
    }
}

// ── Permission policy ───────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct PermissionPolicy {
    active_mode: PermissionMode,
    tool_requirements: BTreeMap<String, PermissionMode>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum PermissionOutcome {
    Allow,
    Deny { reason: String },
}

impl PermissionPolicy {
    /// Create a policy with a given active mode.
    pub fn new(mode: PermissionMode) -> Self {
        Self {
            active_mode: mode,
            tool_requirements: BTreeMap::new(),
        }
    }

    /// Builder: set the required permission for a tool.
    pub fn with_tool(mut self, tool_name: impl Into<String>, mode: PermissionMode) -> Self {
        self.tool_requirements.insert(tool_name.into(), mode);
        self
    }

    /// Check authorization for a tool. Calls prompter if escalation needed.
    pub fn authorize(
        &self,
        tool_name: &str,
        prompter: &mut dyn PermissionPrompter,
    ) -> PermissionOutcome {
        let required = self
            .tool_requirements
            .get(tool_name)
            .copied()
            .unwrap_or(PermissionMode::ReadOnly);

        if self.active_mode >= required {
            return PermissionOutcome::Allow;
        }

        // Escalation: ask the prompter
        let request = PermissionRequest {
            tool_name: tool_name.to_string(),
            required_mode: required.label().to_string(),
            current_mode: self.active_mode.label().to_string(),
        };

        match prompter.prompt(&request) {
            PermissionDecision::Allow => PermissionOutcome::Allow,
            PermissionDecision::Deny { reason } => PermissionOutcome::Deny { reason },
        }
    }

    /// Check without prompting — pure mode comparison.
    pub fn check(&self, tool_name: &str) -> PermissionOutcome {
        let required = self
            .tool_requirements
            .get(tool_name)
            .copied()
            .unwrap_or(PermissionMode::ReadOnly);

        if self.active_mode >= required {
            PermissionOutcome::Allow
        } else {
            PermissionOutcome::Deny {
                reason: format!(
                    "Tool `{}` requires `{}` but active mode is `{}`",
                    tool_name,
                    required.label(),
                    self.active_mode.label()
                ),
            }
        }
    }

    pub fn active_mode(&self) -> PermissionMode {
        self.active_mode
    }
}

// ── Common policies ─────────────────────────────────────────────────────────

/// Standard policy for a full-access agent.
pub fn full_access_policy() -> PermissionPolicy {
    PermissionPolicy::new(PermissionMode::DangerFullAccess)
        .with_tool("bash", PermissionMode::DangerFullAccess)
        .with_tool("write_file", PermissionMode::WorkspaceWrite)
        .with_tool("edit_file", PermissionMode::WorkspaceWrite)
        .with_tool("read_file", PermissionMode::ReadOnly)
        .with_tool("glob_search", PermissionMode::ReadOnly)
        .with_tool("grep_search", PermissionMode::ReadOnly)
        .with_tool("Agent", PermissionMode::DangerFullAccess)
}

/// Read-only policy for explorer sub-agents.
pub fn read_only_policy() -> PermissionPolicy {
    PermissionPolicy::new(PermissionMode::ReadOnly)
        .with_tool("read_file", PermissionMode::ReadOnly)
        .with_tool("glob_search", PermissionMode::ReadOnly)
        .with_tool("grep_search", PermissionMode::ReadOnly)
}

/// Write policy for code-editing sub-agents.
pub fn workspace_write_policy() -> PermissionPolicy {
    PermissionPolicy::new(PermissionMode::WorkspaceWrite)
        .with_tool("read_file", PermissionMode::ReadOnly)
        .with_tool("glob_search", PermissionMode::ReadOnly)
        .with_tool("grep_search", PermissionMode::ReadOnly)
        .with_tool("write_file", PermissionMode::WorkspaceWrite)
        .with_tool("edit_file", PermissionMode::WorkspaceWrite)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::traits::{AutoAllowPrompter, AutoDenyPrompter};

    #[test]
    fn test_permission_hierarchy() {
        assert!(PermissionMode::DangerFullAccess > PermissionMode::WorkspaceWrite);
        assert!(PermissionMode::WorkspaceWrite > PermissionMode::ReadOnly);
    }

    #[test]
    fn test_full_access_allows_everything() {
        let policy = full_access_policy();
        assert_eq!(policy.check("bash"), PermissionOutcome::Allow);
        assert_eq!(policy.check("read_file"), PermissionOutcome::Allow);
        assert_eq!(policy.check("write_file"), PermissionOutcome::Allow);
    }

    #[test]
    fn test_read_only_blocks_writes() {
        let policy = read_only_policy();
        assert_eq!(policy.check("read_file"), PermissionOutcome::Allow);
        assert_eq!(policy.check("glob_search"), PermissionOutcome::Allow);

        // Unknown tools default to ReadOnly, which is allowed
        assert_eq!(policy.check("unknown_tool"), PermissionOutcome::Allow);
    }

    #[test]
    fn test_read_only_blocks_bash_with_requirement() {
        let policy = PermissionPolicy::new(PermissionMode::ReadOnly)
            .with_tool("bash", PermissionMode::DangerFullAccess);

        match policy.check("bash") {
            PermissionOutcome::Deny { reason } => {
                assert!(reason.contains("bash"));
                assert!(reason.contains("danger-full-access"));
            }
            _ => panic!("bash should be denied in read-only mode"),
        }
    }

    #[test]
    fn test_prompter_escalation() {
        let policy = PermissionPolicy::new(PermissionMode::ReadOnly)
            .with_tool("bash", PermissionMode::DangerFullAccess);

        // Auto-allow prompter grants escalation
        let mut allow = AutoAllowPrompter;
        assert_eq!(
            policy.authorize("bash", &mut allow),
            PermissionOutcome::Allow
        );

        // Auto-deny prompter blocks escalation
        let mut deny = AutoDenyPrompter;
        match policy.authorize("bash", &mut deny) {
            PermissionOutcome::Deny { .. } => {} // expected
            _ => panic!("should be denied"),
        }
    }
}
