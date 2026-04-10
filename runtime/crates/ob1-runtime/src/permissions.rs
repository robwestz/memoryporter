//! Primitive #2 — Permission System with trust tiers.
//!
//! Graduated access control: ReadOnly < WorkspaceWrite < DangerFullAccess.
//! Per-tool overrides. Three handler types. Deny-lists with O(1) matching.

use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};

/// Ordered permission modes — higher = more access.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum PermissionMode {
    ReadOnly,
    WorkspaceWrite,
    DangerFullAccess,
}

/// How to handle escalation requests.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum HandlerType {
    /// User-facing — ask for confirmation.
    Interactive,
    /// Multi-agent orchestration — no user UI.
    Coordinator,
    /// Autonomous worker — most restricted.
    SwarmWorker,
}

/// A named permission policy applied to a session or agent.
#[derive(Debug, Clone)]
pub struct PermissionPolicy {
    pub name: String,
    pub active_mode: PermissionMode,
    pub handler_type: HandlerType,
    tool_overrides: BTreeMap<String, PermissionMode>,
    deny_names: BTreeSet<String>,
    deny_prefixes: Vec<String>,
    allow_list: BTreeSet<String>,
}

/// Result of an authorization check.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AuthzResult {
    Allow,
    Deny { reason: String },
    Prompt { tool: String, required: PermissionMode },
}

/// A recorded permission decision.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionDecision {
    pub tool_name: String,
    pub result: String,
    pub reason: String,
    pub mode_required: String,
    pub mode_active: String,
}

impl PermissionPolicy {
    pub fn new(name: &str, mode: PermissionMode) -> Self {
        Self {
            name: name.into(),
            active_mode: mode,
            handler_type: HandlerType::Interactive,
            tool_overrides: BTreeMap::new(),
            deny_names: BTreeSet::new(),
            deny_prefixes: Vec::new(),
            allow_list: BTreeSet::new(),
        }
    }

    pub fn with_handler(mut self, handler: HandlerType) -> Self {
        self.handler_type = handler;
        self
    }

    pub fn with_tool_override(mut self, tool: &str, mode: PermissionMode) -> Self {
        self.tool_overrides.insert(tool.into(), mode);
        self
    }

    pub fn with_deny(mut self, tool: &str) -> Self {
        self.deny_names.insert(tool.to_lowercase());
        self
    }

    pub fn with_deny_prefix(mut self, prefix: &str) -> Self {
        self.deny_prefixes.push(prefix.to_lowercase());
        self
    }

    pub fn with_allow_only(mut self, tools: &[&str]) -> Self {
        self.allow_list = tools.iter().map(|t| t.to_string()).collect();
        self
    }

    /// Authorize a tool invocation. This is the core gate.
    pub fn authorize(&self, tool_name: &str) -> AuthzResult {
        let lower = tool_name.to_lowercase();

        // Check explicit deny list (O(1) set lookup)
        if self.deny_names.contains(&lower) {
            return AuthzResult::Deny {
                reason: format!("Tool '{}' is in deny list", tool_name),
            };
        }

        // Check deny prefixes
        for prefix in &self.deny_prefixes {
            if lower.starts_with(prefix) {
                return AuthzResult::Deny {
                    reason: format!("Tool '{}' blocked by deny prefix '{}'", tool_name, prefix),
                };
            }
        }

        // Check allow list (if non-empty, ONLY these tools are allowed)
        if !self.allow_list.is_empty() && !self.allow_list.contains(tool_name) {
            return AuthzResult::Deny {
                reason: format!("Tool '{}' not in allow list", tool_name),
            };
        }

        // Check permission level
        let required = self
            .tool_overrides
            .get(tool_name)
            .copied()
            .unwrap_or(PermissionMode::ReadOnly);

        if self.active_mode >= required {
            AuthzResult::Allow
        } else {
            match self.handler_type {
                HandlerType::Interactive => AuthzResult::Prompt {
                    tool: tool_name.into(),
                    required,
                },
                HandlerType::Coordinator | HandlerType::SwarmWorker => AuthzResult::Deny {
                    reason: format!(
                        "Tool '{}' requires {:?} but session is {:?} ({:?} handler cannot escalate)",
                        tool_name, required, self.active_mode, self.handler_type
                    ),
                },
            }
        }
    }

    /// Record a decision for the audit trail.
    pub fn record_decision(&self, tool_name: &str, result: &AuthzResult) -> PermissionDecision {
        let required = self
            .tool_overrides
            .get(tool_name)
            .copied()
            .unwrap_or(PermissionMode::ReadOnly);
        PermissionDecision {
            tool_name: tool_name.into(),
            result: match result {
                AuthzResult::Allow => "allow".into(),
                AuthzResult::Deny { .. } => "deny".into(),
                AuthzResult::Prompt { .. } => "prompt".into(),
            },
            reason: match result {
                AuthzResult::Deny { reason } => reason.clone(),
                AuthzResult::Prompt { .. } => "escalation required".into(),
                AuthzResult::Allow => String::new(),
            },
            mode_required: format!("{:?}", required),
            mode_active: format!("{:?}", self.active_mode),
        }
    }
}

/// Tool pool assembly — 3-layer filtering.
pub struct ToolPool;

impl ToolPool {
    /// Assemble a filtered tool set from a registry.
    pub fn assemble(
        all_tools: &[String],
        simple_mode: bool,
        include_mcp: bool,
        policy: &PermissionPolicy,
    ) -> Vec<String> {
        let safe_subset = ["read_file", "glob_search", "grep_search"];

        let mut tools: Vec<String> = all_tools.to_vec();

        // Layer 1: Mode flags
        if simple_mode {
            tools.retain(|t| safe_subset.contains(&t.as_str()));
        }

        // Layer 2: Feature flags
        if !include_mcp {
            tools.retain(|t| !t.to_lowercase().starts_with("mcp_"));
        }

        // Layer 3: Permission deny-list
        tools.retain(|t| policy.authorize(t) != AuthzResult::Deny {
            reason: String::new(),
        } || policy.authorize(t) == AuthzResult::Allow);

        // Re-filter properly with full authz check
        tools.retain(|t| !matches!(policy.authorize(t), AuthzResult::Deny { .. }));

        tools
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_permission_hierarchy() {
        assert!(PermissionMode::ReadOnly < PermissionMode::WorkspaceWrite);
        assert!(PermissionMode::WorkspaceWrite < PermissionMode::DangerFullAccess);
    }

    #[test]
    fn test_authorize_allow() {
        let policy = PermissionPolicy::new("test", PermissionMode::DangerFullAccess)
            .with_tool_override("bash", PermissionMode::DangerFullAccess);
        assert_eq!(policy.authorize("bash"), AuthzResult::Allow);
    }

    #[test]
    fn test_authorize_deny_list() {
        let policy = PermissionPolicy::new("test", PermissionMode::DangerFullAccess)
            .with_deny("dangerous_tool");
        match policy.authorize("dangerous_tool") {
            AuthzResult::Deny { reason } => assert!(reason.contains("deny list")),
            other => panic!("Expected Deny, got {:?}", other),
        }
    }

    #[test]
    fn test_authorize_deny_prefix() {
        let policy = PermissionPolicy::new("test", PermissionMode::DangerFullAccess)
            .with_deny_prefix("mcp_");
        match policy.authorize("mcp_github_issues") {
            AuthzResult::Deny { reason } => assert!(reason.contains("deny prefix")),
            other => panic!("Expected Deny, got {:?}", other),
        }
    }

    #[test]
    fn test_authorize_escalation() {
        let policy = PermissionPolicy::new("readonly", PermissionMode::ReadOnly)
            .with_tool_override("bash", PermissionMode::DangerFullAccess);
        // Interactive → prompt for escalation
        match policy.authorize("bash") {
            AuthzResult::Prompt { tool, required } => {
                assert_eq!(tool, "bash");
                assert_eq!(required, PermissionMode::DangerFullAccess);
            }
            other => panic!("Expected Prompt, got {:?}", other),
        }

        // SwarmWorker → hard deny (no escalation)
        let swarm = PermissionPolicy::new("swarm", PermissionMode::ReadOnly)
            .with_handler(HandlerType::SwarmWorker)
            .with_tool_override("bash", PermissionMode::DangerFullAccess);
        match swarm.authorize("bash") {
            AuthzResult::Deny { reason } => assert!(reason.contains("cannot escalate")),
            other => panic!("Expected Deny, got {:?}", other),
        }
    }

    #[test]
    fn test_tool_pool_assembly() {
        let tools = vec![
            "read_file".into(),
            "bash".into(),
            "mcp_github".into(),
            "glob_search".into(),
        ];
        let policy = PermissionPolicy::new("test", PermissionMode::DangerFullAccess);

        // Simple mode: only safe tools
        let simple = ToolPool::assemble(&tools, true, true, &policy);
        assert!(simple.contains(&"read_file".to_string()));
        assert!(!simple.contains(&"bash".to_string()));

        // No MCP: filter mcp_ prefix
        let no_mcp = ToolPool::assemble(&tools, false, false, &policy);
        assert!(!no_mcp.contains(&"mcp_github".to_string()));
        assert!(no_mcp.contains(&"bash".to_string()));
    }

    #[test]
    fn test_allow_list() {
        let policy = PermissionPolicy::new("restricted", PermissionMode::DangerFullAccess)
            .with_allow_only(&["read_file", "grep_search"]);
        assert_eq!(policy.authorize("read_file"), AuthzResult::Allow);
        match policy.authorize("bash") {
            AuthzResult::Deny { .. } => {}
            other => panic!("Expected Deny, got {:?}", other),
        }
    }
}
