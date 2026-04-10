//! Basic tool executor — implements runtime::ToolExecutor with real tools.
//!
//! bash, read_file, write_file, edit_file, glob_search, grep_search

use crate::runtime::ToolExecutor;
use std::collections::BTreeSet;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

pub struct BasicToolExecutor {
    allowed: Option<BTreeSet<String>>,
    cwd: PathBuf,
}

impl BasicToolExecutor {
    pub fn new() -> Self {
        Self {
            allowed: None,
            cwd: std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")),
        }
    }

    pub fn with_allowed(mut self, tools: BTreeSet<String>) -> Self {
        self.allowed = Some(tools);
        self
    }

    pub fn with_cwd(mut self, cwd: PathBuf) -> Self {
        self.cwd = cwd;
        self
    }

    fn resolve(&self, path: &str) -> PathBuf {
        let p = Path::new(path);
        if p.is_absolute() { p.to_path_buf() } else { self.cwd.join(p) }
    }
}

impl ToolExecutor for BasicToolExecutor {
    fn execute(&mut self, tool_name: &str, input: &str) -> Result<String, String> {
        if let Some(allowed) = &self.allowed {
            if !allowed.contains(tool_name) {
                return Err(format!("Tool '{}' not allowed", tool_name));
            }
        }

        let v: serde_json::Value =
            serde_json::from_str(input).unwrap_or(serde_json::json!({}));

        match tool_name {
            "bash" => {
                let cmd = v["command"].as_str().ok_or("Missing 'command'")?;
                let shell = if cfg!(windows) { "cmd" } else { "bash" };
                let flag = if cfg!(windows) { "/C" } else { "-lc" };
                let out = Command::new(shell)
                    .arg(flag)
                    .arg(cmd)
                    .current_dir(&self.cwd)
                    .stdout(Stdio::piped())
                    .stderr(Stdio::piped())
                    .output()
                    .map_err(|e| format!("Spawn failed: {}", e))?;
                let stdout = String::from_utf8_lossy(&out.stdout);
                let stderr = String::from_utf8_lossy(&out.stderr);
                Ok(format!(
                    "{{\"stdout\":{},\"stderr\":{},\"exit_code\":{}}}",
                    serde_json::json!(stdout.trim()),
                    serde_json::json!(stderr.trim()),
                    out.status.code().unwrap_or(-1)
                ))
            }
            "read_file" => {
                let path = v["file_path"].as_str().or(v["path"].as_str()).ok_or("Missing 'file_path'")?;
                let p = self.resolve(path);
                let content = std::fs::read_to_string(&p)
                    .map_err(|e| format!("Read {}: {}", p.display(), e))?;
                let offset = v["offset"].as_u64().unwrap_or(0) as usize;
                let limit = v["limit"].as_u64().unwrap_or(2000) as usize;
                let lines: Vec<&str> = content.lines().collect();
                let end = (offset + limit).min(lines.len());
                let numbered: String = lines[offset.min(lines.len())..end]
                    .iter()
                    .enumerate()
                    .map(|(i, l)| format!("{}\t{}", offset + i + 1, l))
                    .collect::<Vec<_>>()
                    .join("\n");
                Ok(numbered)
            }
            "write_file" => {
                let path = v["file_path"].as_str().or(v["path"].as_str()).ok_or("Missing 'file_path'")?;
                let content = v["content"].as_str().ok_or("Missing 'content'")?;
                let p = self.resolve(path);
                if let Some(parent) = p.parent() {
                    std::fs::create_dir_all(parent).ok();
                }
                std::fs::write(&p, content)
                    .map_err(|e| format!("Write {}: {}", p.display(), e))?;
                Ok(format!("Wrote {} bytes to {}", content.len(), p.display()))
            }
            "edit_file" => {
                let path = v["file_path"].as_str().or(v["path"].as_str()).ok_or("Missing 'file_path'")?;
                let old = v["old_string"].as_str().ok_or("Missing 'old_string'")?;
                let new = v["new_string"].as_str().ok_or("Missing 'new_string'")?;
                let p = self.resolve(path);
                let content = std::fs::read_to_string(&p)
                    .map_err(|e| format!("Read {}: {}", p.display(), e))?;
                let count = content.matches(old).count();
                if count == 0 { return Err("old_string not found".into()); }
                if count > 1 { return Err(format!("old_string found {} times (must be unique)", count)); }
                let updated = content.replacen(old, new, 1);
                std::fs::write(&p, &updated)
                    .map_err(|e| format!("Write {}: {}", p.display(), e))?;
                Ok(format!("Edited {}", p.display()))
            }
            "glob_search" => {
                let pattern = v["pattern"].as_str().ok_or("Missing 'pattern'")?;
                let dir = v["path"].as_str().map(|p| self.resolve(p)).unwrap_or_else(|| self.cwd.clone());
                let full = format!("{}/{}", dir.display(), pattern);
                let matches: Vec<String> = glob::glob(&full)
                    .map_err(|e| format!("Bad glob: {}", e))?
                    .filter_map(|r| r.ok())
                    .take(1000)
                    .map(|p| p.display().to_string())
                    .collect();
                Ok(matches.join("\n"))
            }
            "grep_search" => {
                let pattern = v["pattern"].as_str().ok_or("Missing 'pattern'")?;
                let dir = v["path"].as_str().map(|p| self.resolve(p)).unwrap_or_else(|| self.cwd.clone());
                let mut results = Vec::new();
                for entry in walkdir::WalkDir::new(&dir)
                    .into_iter()
                    .filter_map(|e| e.ok())
                    .filter(|e| e.file_type().is_file())
                {
                    let p = entry.path();
                    if let Ok(meta) = p.metadata() {
                        if meta.len() > 10_000_000 { continue; }
                    }
                    if let Ok(content) = std::fs::read_to_string(p) {
                        for (i, line) in content.lines().enumerate() {
                            if line.contains(pattern) {
                                results.push(format!("{}:{}: {}", p.display(), i + 1, line.trim()));
                                if results.len() >= 500 { return Ok(results.join("\n")); }
                            }
                        }
                    }
                }
                if results.is_empty() {
                    Ok(format!("No matches for '{}' in {}", pattern, dir.display()))
                } else {
                    Ok(results.join("\n"))
                }
            }
            _ => Err(format!("Unknown tool: {}", tool_name)),
        }
    }
}
