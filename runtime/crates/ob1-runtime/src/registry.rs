//! Primitive #1 — Tool Registry with metadata-first design.
//!
//! Define agent capabilities as data structures before writing implementation.
//! The registry answers "what exists?" without executing anything.

use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::BTreeMap;

use crate::permissions::PermissionMode;

/// A single tool definition — the metadata that tells the model what it can do.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolSpec {
    pub name: String,
    pub description: String,
    pub source_type: SourceType,
    pub required_permission: PermissionMode,
    pub input_schema: Value,
    pub side_effects: SideEffectProfile,
    pub enabled: bool,
    pub aliases: Vec<String>,
}

/// Where a tool comes from — determines trust level.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SourceType {
    BuiltIn,
    Plugin,
    Skill,
    Mcp { server_url: String },
}

/// What a tool does to the outside world.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SideEffectProfile {
    pub writes_files: bool,
    pub network_access: bool,
    pub destructive: bool,
    pub reversible: bool,
}

/// The tool registry — single source of truth for all capabilities.
#[derive(Debug, Clone)]
pub struct ToolRegistry {
    tools: BTreeMap<String, ToolSpec>,
}

impl ToolRegistry {
    pub fn new() -> Self {
        Self {
            tools: BTreeMap::new(),
        }
    }

    /// Register a tool. Returns previous spec if name already existed.
    pub fn register(&mut self, spec: ToolSpec) -> Option<ToolSpec> {
        let name = spec.name.clone();
        self.tools.insert(name, spec)
    }

    /// List all tools without executing anything (metadata-first).
    pub fn list_tools(&self) -> Vec<&ToolSpec> {
        self.tools.values().filter(|t| t.enabled).collect()
    }

    /// List tools filtered by source type.
    pub fn list_by_source(&self, source: &SourceType) -> Vec<&ToolSpec> {
        self.tools
            .values()
            .filter(|t| t.enabled && &t.source_type == source)
            .collect()
    }

    /// Get a specific tool by name or alias.
    pub fn get(&self, name: &str) -> Option<&ToolSpec> {
        self.tools.get(name).or_else(|| {
            self.tools
                .values()
                .find(|t| t.aliases.iter().any(|a| a == name))
        })
    }

    /// Disable a tool without removing it.
    pub fn disable(&mut self, name: &str) -> bool {
        if let Some(spec) = self.tools.get_mut(name) {
            spec.enabled = false;
            true
        } else {
            false
        }
    }

    /// Number of enabled tools.
    pub fn enabled_count(&self) -> usize {
        self.tools.values().filter(|t| t.enabled).count()
    }

    /// Total tool count (including disabled).
    pub fn total_count(&self) -> usize {
        self.tools.len()
    }

    /// Generate JSON tool definitions for an API call.
    pub fn to_api_tools(&self) -> Vec<Value> {
        self.list_tools()
            .into_iter()
            .map(|spec| {
                serde_json::json!({
                    "name": spec.name,
                    "description": spec.description,
                    "input_schema": spec.input_schema,
                })
            })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_tool(name: &str, perm: PermissionMode) -> ToolSpec {
        ToolSpec {
            name: name.into(),
            description: format!("Test tool {}", name),
            source_type: SourceType::BuiltIn,
            required_permission: perm,
            input_schema: serde_json::json!({"type": "object"}),
            side_effects: SideEffectProfile::default(),
            enabled: true,
            aliases: vec![],
        }
    }

    #[test]
    fn test_register_and_list() {
        let mut reg = ToolRegistry::new();
        reg.register(sample_tool("read_file", PermissionMode::ReadOnly));
        reg.register(sample_tool("bash", PermissionMode::DangerFullAccess));
        assert_eq!(reg.enabled_count(), 2);
        assert_eq!(reg.list_tools().len(), 2);
    }

    #[test]
    fn test_disable() {
        let mut reg = ToolRegistry::new();
        reg.register(sample_tool("bash", PermissionMode::DangerFullAccess));
        assert_eq!(reg.enabled_count(), 1);
        reg.disable("bash");
        assert_eq!(reg.enabled_count(), 0);
        assert_eq!(reg.total_count(), 1);
    }

    #[test]
    fn test_get_by_alias() {
        let mut reg = ToolRegistry::new();
        let mut tool = sample_tool("read_file", PermissionMode::ReadOnly);
        tool.aliases = vec!["Read".into(), "cat".into()];
        reg.register(tool);
        assert!(reg.get("Read").is_some());
        assert!(reg.get("cat").is_some());
        assert!(reg.get("nope").is_none());
    }
}
