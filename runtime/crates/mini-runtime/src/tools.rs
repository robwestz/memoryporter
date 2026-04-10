//! Basic tool executor — real implementations of common agent tools.
//!
//! Tools: bash, read_file, write_file, edit_file, glob_search, grep_search

use crate::permissions::PermissionMode;
use crate::traits::{ToolDefinition, ToolError, ToolExecutor};
use std::collections::BTreeSet;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

// ── Tool executor ───────────────────────────────────────────────────────────

pub struct BasicToolExecutor {
    allowed_tools: Option<BTreeSet<String>>,
    working_dir: PathBuf,
}

impl BasicToolExecutor {
    pub fn new() -> Self {
        Self {
            allowed_tools: None,
            working_dir: std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")),
        }
    }

    pub fn with_allowed_tools(mut self, tools: BTreeSet<String>) -> Self {
        self.allowed_tools = Some(tools);
        self
    }

    pub fn with_working_dir(mut self, dir: PathBuf) -> Self {
        self.working_dir = dir;
        self
    }

    fn resolve_path(&self, path: &str) -> PathBuf {
        let p = Path::new(path);
        if p.is_absolute() {
            p.to_path_buf()
        } else {
            self.working_dir.join(p)
        }
    }
}

impl ToolExecutor for BasicToolExecutor {
    fn execute(
        &mut self,
        tool_name: &str,
        input: &serde_json::Value,
    ) -> Result<String, ToolError> {
        // Check allowlist
        if let Some(allowed) = &self.allowed_tools {
            if !allowed.contains(tool_name) {
                return Err(ToolError::new(format!(
                    "Tool `{}` not in allowed set",
                    tool_name
                )));
            }
        }

        match tool_name {
            "bash" => self.execute_bash(input),
            "read_file" => self.execute_read_file(input),
            "write_file" => self.execute_write_file(input),
            "edit_file" => self.execute_edit_file(input),
            "glob_search" => self.execute_glob_search(input),
            "grep_search" => self.execute_grep_search(input),
            _ => Err(ToolError::new(format!("Unknown tool: {}", tool_name))),
        }
    }

    fn tool_definitions(&self) -> Vec<ToolDefinition> {
        let all = vec![
            ToolDefinition {
                name: "bash".into(),
                description: "Execute a bash command and return stdout/stderr.".into(),
                input_schema: serde_json::json!({
                    "type": "object",
                    "required": ["command"],
                    "properties": {
                        "command": { "type": "string", "description": "The command to execute" },
                        "timeout": { "type": "integer", "description": "Timeout in milliseconds" }
                    }
                }),
            },
            ToolDefinition {
                name: "read_file".into(),
                description: "Read a file and return its contents with line numbers.".into(),
                input_schema: serde_json::json!({
                    "type": "object",
                    "required": ["file_path"],
                    "properties": {
                        "file_path": { "type": "string", "description": "Absolute path to read" },
                        "offset": { "type": "integer", "description": "Start line (0-based)" },
                        "limit": { "type": "integer", "description": "Max lines to read" }
                    }
                }),
            },
            ToolDefinition {
                name: "write_file".into(),
                description: "Write content to a file, creating it if needed.".into(),
                input_schema: serde_json::json!({
                    "type": "object",
                    "required": ["file_path", "content"],
                    "properties": {
                        "file_path": { "type": "string", "description": "Absolute path to write" },
                        "content": { "type": "string", "description": "File content" }
                    }
                }),
            },
            ToolDefinition {
                name: "edit_file".into(),
                description: "Replace a string in a file.".into(),
                input_schema: serde_json::json!({
                    "type": "object",
                    "required": ["file_path", "old_string", "new_string"],
                    "properties": {
                        "file_path": { "type": "string" },
                        "old_string": { "type": "string", "description": "Text to find" },
                        "new_string": { "type": "string", "description": "Replacement text" }
                    }
                }),
            },
            ToolDefinition {
                name: "glob_search".into(),
                description: "Find files matching a glob pattern.".into(),
                input_schema: serde_json::json!({
                    "type": "object",
                    "required": ["pattern"],
                    "properties": {
                        "pattern": { "type": "string", "description": "Glob pattern (e.g. **/*.rs)" },
                        "path": { "type": "string", "description": "Directory to search in" }
                    }
                }),
            },
            ToolDefinition {
                name: "grep_search".into(),
                description: "Search file contents for a regex pattern.".into(),
                input_schema: serde_json::json!({
                    "type": "object",
                    "required": ["pattern"],
                    "properties": {
                        "pattern": { "type": "string", "description": "Regex pattern to search for" },
                        "path": { "type": "string", "description": "Directory to search in" },
                        "glob": { "type": "string", "description": "File glob filter (e.g. *.rs)" }
                    }
                }),
            },
        ];

        match &self.allowed_tools {
            Some(allowed) => all
                .into_iter()
                .filter(|t| allowed.contains(&t.name))
                .collect(),
            None => all,
        }
    }
}

// ── Tool implementations ────────────────────────────────────────────────────

impl BasicToolExecutor {
    fn execute_bash(&self, input: &serde_json::Value) -> Result<String, ToolError> {
        let command = input["command"]
            .as_str()
            .ok_or_else(|| ToolError::new("Missing 'command' parameter"))?;

        let timeout_ms = input["timeout"].as_u64().unwrap_or(120_000);

        let shell = if cfg!(windows) { "cmd" } else { "bash" };
        let flag = if cfg!(windows) { "/C" } else { "-lc" };

        let child = Command::new(shell)
            .arg(flag)
            .arg(command)
            .current_dir(&self.working_dir)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| ToolError::new(format!("Failed to spawn: {}", e)))?;

        let output = child
            .wait_with_output()
            .map_err(|e| ToolError::new(format!("Wait failed: {}", e)))?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);
        let exit_code = output.status.code().unwrap_or(-1);

        Ok(serde_json::json!({
            "stdout": stdout.trim(),
            "stderr": stderr.trim(),
            "exit_code": exit_code,
        })
        .to_string())
    }

    fn execute_read_file(&self, input: &serde_json::Value) -> Result<String, ToolError> {
        let file_path = input["file_path"]
            .as_str()
            .ok_or_else(|| ToolError::new("Missing 'file_path'"))?;

        let path = self.resolve_path(file_path);
        let content = fs::read_to_string(&path)
            .map_err(|e| ToolError::new(format!("Failed to read {}: {}", path.display(), e)))?;

        let offset = input["offset"].as_u64().unwrap_or(0) as usize;
        let limit = input["limit"].as_u64().unwrap_or(2000) as usize;

        let lines: Vec<&str> = content.lines().collect();
        let end = (offset + limit).min(lines.len());
        let selected = &lines[offset.min(lines.len())..end];

        let numbered: Vec<String> = selected
            .iter()
            .enumerate()
            .map(|(i, line)| format!("{}\t{}", offset + i + 1, line))
            .collect();

        Ok(numbered.join("\n"))
    }

    fn execute_write_file(&self, input: &serde_json::Value) -> Result<String, ToolError> {
        let file_path = input["file_path"]
            .as_str()
            .ok_or_else(|| ToolError::new("Missing 'file_path'"))?;
        let content = input["content"]
            .as_str()
            .ok_or_else(|| ToolError::new("Missing 'content'"))?;

        let path = self.resolve_path(file_path);

        // Create parent directories
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| ToolError::new(format!("Failed to create dirs: {}", e)))?;
        }

        fs::write(&path, content)
            .map_err(|e| ToolError::new(format!("Failed to write {}: {}", path.display(), e)))?;

        Ok(format!(
            "Wrote {} bytes to {}",
            content.len(),
            path.display()
        ))
    }

    fn execute_edit_file(&self, input: &serde_json::Value) -> Result<String, ToolError> {
        let file_path = input["file_path"]
            .as_str()
            .ok_or_else(|| ToolError::new("Missing 'file_path'"))?;
        let old_string = input["old_string"]
            .as_str()
            .ok_or_else(|| ToolError::new("Missing 'old_string'"))?;
        let new_string = input["new_string"]
            .as_str()
            .ok_or_else(|| ToolError::new("Missing 'new_string'"))?;

        let path = self.resolve_path(file_path);
        let content = fs::read_to_string(&path)
            .map_err(|e| ToolError::new(format!("Failed to read {}: {}", path.display(), e)))?;

        let count = content.matches(old_string).count();
        if count == 0 {
            return Err(ToolError::new(format!(
                "old_string not found in {}",
                path.display()
            )));
        }
        if count > 1 {
            return Err(ToolError::new(format!(
                "old_string found {} times (must be unique)",
                count
            )));
        }

        let new_content = content.replacen(old_string, new_string, 1);
        fs::write(&path, &new_content)
            .map_err(|e| ToolError::new(format!("Failed to write {}: {}", path.display(), e)))?;

        Ok(format!("Edited {}", path.display()))
    }

    fn execute_glob_search(&self, input: &serde_json::Value) -> Result<String, ToolError> {
        let pattern = input["pattern"]
            .as_str()
            .ok_or_else(|| ToolError::new("Missing 'pattern'"))?;

        let search_dir = input["path"]
            .as_str()
            .map(|p| self.resolve_path(p))
            .unwrap_or_else(|| self.working_dir.clone());

        let full_pattern = format!("{}/{}", search_dir.display(), pattern);
        let mut matches: Vec<String> = Vec::new();

        for entry in glob::glob(&full_pattern).map_err(|e| ToolError::new(format!("Bad glob: {}", e)))? {
            if let Ok(path) = entry {
                matches.push(path.display().to_string());
                if matches.len() >= 1000 {
                    break;
                }
            }
        }

        Ok(matches.join("\n"))
    }

    fn execute_grep_search(&self, input: &serde_json::Value) -> Result<String, ToolError> {
        let pattern = input["pattern"]
            .as_str()
            .ok_or_else(|| ToolError::new("Missing 'pattern'"))?;

        let search_dir = input["path"]
            .as_str()
            .map(|p| self.resolve_path(p))
            .unwrap_or_else(|| self.working_dir.clone());

        let file_glob = input["glob"].as_str();

        // Walk directory and search files
        let mut results = Vec::new();
        let mut file_count = 0;

        for entry in walkdir::WalkDir::new(&search_dir)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
        {
            let path = entry.path();

            // Apply glob filter
            if let Some(glob_pattern) = file_glob {
                let file_name = path.file_name().unwrap_or_default().to_string_lossy();
                if !simple_glob_match(glob_pattern, &file_name) {
                    continue;
                }
            }

            // Skip binary files and very large files
            let metadata = match path.metadata() {
                Ok(m) => m,
                Err(_) => continue,
            };
            if metadata.len() > 10_000_000 {
                continue;
            }

            let content = match fs::read_to_string(path) {
                Ok(c) => c,
                Err(_) => continue,
            };

            for (line_num, line) in content.lines().enumerate() {
                if line.contains(pattern) {
                    results.push(format!("{}:{}: {}", path.display(), line_num + 1, line.trim()));
                    if results.len() >= 500 {
                        return Ok(results.join("\n"));
                    }
                }
            }

            file_count += 1;
            if file_count >= 10_000 {
                break;
            }
        }

        if results.is_empty() {
            Ok(format!("No matches for '{}' in {}", pattern, search_dir.display()))
        } else {
            Ok(results.join("\n"))
        }
    }
}

/// Simple glob matching for file names (supports * and ?).
fn simple_glob_match(pattern: &str, name: &str) -> bool {
    if pattern == "*" {
        return true;
    }
    if let Some(ext) = pattern.strip_prefix("*.") {
        return name.ends_with(&format!(".{}", ext));
    }
    name.contains(pattern.trim_matches('*'))
}

// ── Preset tool sets ────────────────────────────────────────────────────────

/// All tools for full-access agents.
pub fn all_tools() -> BTreeSet<String> {
    ["bash", "read_file", "write_file", "edit_file", "glob_search", "grep_search"]
        .iter()
        .map(|s| s.to_string())
        .collect()
}

/// Read-only tools for explorer sub-agents.
pub fn read_only_tools() -> BTreeSet<String> {
    ["read_file", "glob_search", "grep_search"]
        .iter()
        .map(|s| s.to_string())
        .collect()
}

/// Write tools for code-editing sub-agents.
pub fn write_tools() -> BTreeSet<String> {
    ["read_file", "write_file", "edit_file", "glob_search", "grep_search"]
        .iter()
        .map(|s| s.to_string())
        .collect()
}

/// Tool permission requirements.
pub fn tool_permission(name: &str) -> PermissionMode {
    match name {
        "bash" => PermissionMode::DangerFullAccess,
        "write_file" | "edit_file" => PermissionMode::WorkspaceWrite,
        _ => PermissionMode::ReadOnly,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn executor_in(dir: &Path) -> BasicToolExecutor {
        BasicToolExecutor::new().with_working_dir(dir.to_path_buf())
    }

    #[test]
    fn test_read_write_file() {
        let dir = tempdir().unwrap();
        let mut exec = executor_in(dir.path());

        // Write
        let result = exec
            .execute(
                "write_file",
                &serde_json::json!({
                    "file_path": dir.path().join("test.txt").to_str().unwrap(),
                    "content": "hello\nworld\n"
                }),
            )
            .unwrap();
        assert!(result.contains("12 bytes"));

        // Read
        let result = exec
            .execute(
                "read_file",
                &serde_json::json!({
                    "file_path": dir.path().join("test.txt").to_str().unwrap()
                }),
            )
            .unwrap();
        assert!(result.contains("hello"));
        assert!(result.contains("world"));
    }

    #[test]
    fn test_edit_file() {
        let dir = tempdir().unwrap();
        let file = dir.path().join("code.rs");
        fs::write(&file, "fn main() {\n    println!(\"old\");\n}\n").unwrap();

        let mut exec = executor_in(dir.path());
        let result = exec
            .execute(
                "edit_file",
                &serde_json::json!({
                    "file_path": file.to_str().unwrap(),
                    "old_string": "println!(\"old\")",
                    "new_string": "println!(\"new\")"
                }),
            )
            .unwrap();
        assert!(result.contains("Edited"));

        let content = fs::read_to_string(&file).unwrap();
        assert!(content.contains("new"));
        assert!(!content.contains("old"));
    }

    #[test]
    fn test_glob_search() {
        let dir = tempdir().unwrap();
        fs::write(dir.path().join("a.rs"), "").unwrap();
        fs::write(dir.path().join("b.rs"), "").unwrap();
        fs::write(dir.path().join("c.txt"), "").unwrap();

        let mut exec = executor_in(dir.path());
        let result = exec
            .execute(
                "glob_search",
                &serde_json::json!({
                    "pattern": "*.rs",
                    "path": dir.path().to_str().unwrap()
                }),
            )
            .unwrap();

        assert!(result.contains("a.rs"));
        assert!(result.contains("b.rs"));
        assert!(!result.contains("c.txt"));
    }

    #[test]
    fn test_grep_search() {
        let dir = tempdir().unwrap();
        fs::write(dir.path().join("code.rs"), "pub fn hello() {}\nfn secret() {}").unwrap();
        fs::write(dir.path().join("other.rs"), "// no match here").unwrap();

        let mut exec = executor_in(dir.path());
        let result = exec
            .execute(
                "grep_search",
                &serde_json::json!({
                    "pattern": "pub fn",
                    "path": dir.path().to_str().unwrap()
                }),
            )
            .unwrap();

        assert!(result.contains("pub fn hello"));
        assert!(!result.contains("secret"));
    }

    #[test]
    fn test_bash() {
        let mut exec = BasicToolExecutor::new();
        let cmd = if cfg!(windows) { "echo hello" } else { "echo hello" };
        let result = exec
            .execute("bash", &serde_json::json!({"command": cmd}))
            .unwrap();
        assert!(result.contains("hello"));
    }

    #[test]
    fn test_tool_allowlist() {
        let mut exec = BasicToolExecutor::new().with_allowed_tools(read_only_tools());

        // read_file should work (in the set)
        let definitions = exec.tool_definitions();
        assert!(definitions.iter().any(|t| t.name == "read_file"));
        assert!(!definitions.iter().any(|t| t.name == "bash"));

        // bash should be rejected
        let result = exec.execute("bash", &serde_json::json!({"command": "ls"}));
        assert!(result.is_err());
    }
}
