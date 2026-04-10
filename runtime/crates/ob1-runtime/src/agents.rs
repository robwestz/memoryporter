//! Primitive #16 — Agent Type System.
//!
//! 6 built-in agent types, each with its own tool set, prompt, and constraints.
//! An explore agent can't edit files. A plan agent doesn't execute code.

use crate::permissions::PermissionMode;
use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;

/// Built-in agent types with predefined capabilities.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum AgentType {
    /// Read-only exploration — can search and read, nothing else.
    Explore,
    /// Planning — can read + write todos, no execution.
    Plan,
    /// Verification — can read + run tests, no writes.
    Verification,
    /// Guide — answers questions about the codebase.
    Guide,
    /// General purpose — full access (default).
    GeneralPurpose,
    /// Custom agent with user-defined constraints.
    Custom { name: String },
}

impl AgentType {
    pub fn label(&self) -> &str {
        match self {
            Self::Explore => "explore",
            Self::Plan => "plan",
            Self::Verification => "verification",
            Self::Guide => "guide",
            Self::GeneralPurpose => "general-purpose",
            Self::Custom { name } => name,
        }
    }
}

/// Defines what an agent type can and cannot do.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentConstraints {
    pub agent_type: AgentType,
    pub permission_mode: PermissionMode,
    pub allowed_tools: BTreeSet<String>,
    pub denied_tools: BTreeSet<String>,
    pub max_iterations: usize,
    pub system_prompt_suffix: String,
}

impl AgentConstraints {
    /// Get the default constraints for a built-in agent type.
    pub fn for_type(agent_type: &AgentType) -> Self {
        match agent_type {
            AgentType::Explore => Self {
                agent_type: agent_type.clone(),
                permission_mode: PermissionMode::ReadOnly,
                allowed_tools: [
                    "read_file", "glob_search", "grep_search",
                    "WebFetch", "WebSearch", "ToolSearch",
                ].iter().map(|s| s.to_string()).collect(),
                denied_tools: BTreeSet::new(),
                max_iterations: 32,
                system_prompt_suffix: "You are an Explore agent. Read and search only. Do not modify files.".into(),
            },
            AgentType::Plan => Self {
                agent_type: agent_type.clone(),
                permission_mode: PermissionMode::ReadOnly,
                allowed_tools: [
                    "read_file", "glob_search", "grep_search",
                    "WebFetch", "WebSearch", "ToolSearch", "TodoWrite",
                ].iter().map(|s| s.to_string()).collect(),
                denied_tools: BTreeSet::new(),
                max_iterations: 16,
                system_prompt_suffix: "You are a Plan agent. Research and plan. Write todos. Do not execute code.".into(),
            },
            AgentType::Verification => Self {
                agent_type: agent_type.clone(),
                permission_mode: PermissionMode::ReadOnly,
                allowed_tools: [
                    "read_file", "glob_search", "grep_search", "bash",
                    "TodoWrite",
                ].iter().map(|s| s.to_string()).collect(),
                denied_tools: ["write_file", "edit_file"].iter().map(|s| s.to_string()).collect(),
                max_iterations: 32,
                system_prompt_suffix: "You are a Verification agent. Read code and run tests. Do not write files.".into(),
            },
            AgentType::Guide => Self {
                agent_type: agent_type.clone(),
                permission_mode: PermissionMode::ReadOnly,
                allowed_tools: [
                    "read_file", "glob_search", "grep_search",
                    "WebFetch", "WebSearch",
                ].iter().map(|s| s.to_string()).collect(),
                denied_tools: BTreeSet::new(),
                max_iterations: 16,
                system_prompt_suffix: "You are a Guide agent. Answer questions about the codebase. Do not modify anything.".into(),
            },
            AgentType::GeneralPurpose => Self {
                agent_type: agent_type.clone(),
                permission_mode: PermissionMode::DangerFullAccess,
                allowed_tools: BTreeSet::new(), // empty = all tools
                denied_tools: BTreeSet::new(),
                max_iterations: 64,
                system_prompt_suffix: "You are a general-purpose agent with full access.".into(),
            },
            AgentType::Custom { name } => Self {
                agent_type: agent_type.clone(),
                permission_mode: PermissionMode::ReadOnly,
                allowed_tools: BTreeSet::new(),
                denied_tools: BTreeSet::new(),
                max_iterations: 32,
                system_prompt_suffix: format!("You are a custom agent: {}.", name),
            },
        }
    }

    /// Check if a tool is allowed for this agent type.
    pub fn tool_allowed(&self, tool_name: &str) -> bool {
        if self.denied_tools.contains(tool_name) {
            return false;
        }
        if self.allowed_tools.is_empty() {
            return true; // Empty allow list = all tools
        }
        self.allowed_tools.contains(tool_name)
    }
}

/// Agent manifest — tracks a spawned sub-agent.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentManifest {
    pub id: String,
    pub agent_type: AgentType,
    pub status: AgentStatus,
    pub description: String,
    pub created_at: String,
    pub completed_at: Option<String>,
    pub output: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AgentStatus {
    Running,
    Completed,
    Failed,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_explore_constraints() {
        let c = AgentConstraints::for_type(&AgentType::Explore);
        assert_eq!(c.permission_mode, PermissionMode::ReadOnly);
        assert!(c.tool_allowed("read_file"));
        assert!(c.tool_allowed("grep_search"));
        assert!(!c.tool_allowed("bash"));
        assert!(!c.tool_allowed("write_file"));
    }

    #[test]
    fn test_verification_constraints() {
        let c = AgentConstraints::for_type(&AgentType::Verification);
        assert!(c.tool_allowed("bash"));
        assert!(c.tool_allowed("read_file"));
        assert!(!c.tool_allowed("write_file")); // Explicitly denied
        assert!(!c.tool_allowed("edit_file"));
    }

    #[test]
    fn test_general_purpose_all_tools() {
        let c = AgentConstraints::for_type(&AgentType::GeneralPurpose);
        assert!(c.tool_allowed("bash"));
        assert!(c.tool_allowed("write_file"));
        assert!(c.tool_allowed("anything_at_all"));
    }

    #[test]
    fn test_custom_agent() {
        let c = AgentConstraints::for_type(&AgentType::Custom { name: "data-analyst".into() });
        assert!(c.system_prompt_suffix.contains("data-analyst"));
    }
}
