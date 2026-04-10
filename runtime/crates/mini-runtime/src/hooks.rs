//! Shell-Based Hook Lifecycle.
//!
//! Gamechanger #4: Extend agent behavior in any language, without recompiling.
//! Pre/post tool hooks as shell commands. JSON on stdin, exit codes control flow.

use serde::{Deserialize, Serialize};
use std::io::Write;
use std::process::{Command, Stdio};

// ── Hook config ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct HookConfig {
    pub pre_tool_use: Vec<String>,
    pub post_tool_use: Vec<String>,
}

// ── Hook payload (sent to hooks as JSON on stdin) ───────────────────────────

#[derive(Debug, Clone, Serialize)]
pub struct HookPayload {
    pub hook_event_name: String,
    pub tool_name: String,
    pub tool_input: serde_json::Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_output: Option<String>,
    pub tool_result_is_error: bool,
}

// ── Hook result ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct HookResult {
    pub allowed: bool,
    pub feedback: Option<String>,
    pub exit_code: i32,
}

// ── Hook runner ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct HookRunner {
    config: HookConfig,
}

impl HookRunner {
    pub fn new(config: HookConfig) -> Self {
        Self { config }
    }

    pub fn empty() -> Self {
        Self {
            config: HookConfig::default(),
        }
    }

    /// Run pre-tool-use hooks. Returns Err if any hook denies (exit 2).
    pub fn run_pre_tool_use(
        &self,
        tool_name: &str,
        tool_input: &serde_json::Value,
    ) -> HookResult {
        let payload = HookPayload {
            hook_event_name: "PreToolUse".into(),
            tool_name: tool_name.into(),
            tool_input: tool_input.clone(),
            tool_output: None,
            tool_result_is_error: false,
        };
        self.run_hooks(&self.config.pre_tool_use, &payload)
    }

    /// Run post-tool-use hooks.
    pub fn run_post_tool_use(
        &self,
        tool_name: &str,
        tool_input: &serde_json::Value,
        tool_output: &str,
        is_error: bool,
    ) -> HookResult {
        let payload = HookPayload {
            hook_event_name: "PostToolUse".into(),
            tool_name: tool_name.into(),
            tool_input: tool_input.clone(),
            tool_output: Some(tool_output.into()),
            tool_result_is_error: is_error,
        };
        self.run_hooks(&self.config.post_tool_use, &payload)
    }

    fn run_hooks(&self, commands: &[String], payload: &HookPayload) -> HookResult {
        if commands.is_empty() {
            return HookResult {
                allowed: true,
                feedback: None,
                exit_code: 0,
            };
        }

        let payload_json = match serde_json::to_string(payload) {
            Ok(json) => json,
            Err(e) => {
                return HookResult {
                    allowed: true,
                    feedback: Some(format!("Hook payload serialization failed: {}", e)),
                    exit_code: -1,
                };
            }
        };

        for cmd in commands {
            let result = self.execute_hook(cmd, &payload_json, payload);
            if !result.allowed {
                return result; // First denial wins
            }
        }

        HookResult {
            allowed: true,
            feedback: None,
            exit_code: 0,
        }
    }

    fn execute_hook(&self, cmd: &str, payload_json: &str, payload: &HookPayload) -> HookResult {
        let shell = if cfg!(windows) { "cmd" } else { "sh" };
        let flag = if cfg!(windows) { "/C" } else { "-lc" };

        let child = Command::new(shell)
            .arg(flag)
            .arg(cmd)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .env("HOOK_EVENT", &payload.hook_event_name)
            .env("HOOK_TOOL_NAME", &payload.tool_name)
            .spawn();

        let mut child = match child {
            Ok(c) => c,
            Err(e) => {
                return HookResult {
                    allowed: true, // Don't block on hook spawn failure
                    feedback: Some(format!("Hook spawn failed: {}", e)),
                    exit_code: -1,
                };
            }
        };

        // Pipe JSON payload to stdin
        if let Some(mut stdin) = child.stdin.take() {
            let _ = stdin.write_all(payload_json.as_bytes());
        }

        let output = match child.wait_with_output() {
            Ok(o) => o,
            Err(e) => {
                return HookResult {
                    allowed: true,
                    feedback: Some(format!("Hook wait failed: {}", e)),
                    exit_code: -1,
                };
            }
        };

        let exit_code = output.status.code().unwrap_or(-1);
        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();

        match exit_code {
            0 => HookResult {
                allowed: true,
                feedback: if stdout.is_empty() { None } else { Some(stdout) },
                exit_code: 0,
            },
            2 => HookResult {
                allowed: false,
                feedback: Some(if !stderr.is_empty() {
                    stderr
                } else if !stdout.is_empty() {
                    stdout
                } else {
                    format!("Hook denied tool `{}`", payload.tool_name)
                }),
                exit_code: 2,
            },
            code => HookResult {
                allowed: true, // Non-zero non-2 = warn, don't block
                feedback: Some(format!(
                    "Hook warning (exit {}): {}",
                    code,
                    if !stderr.is_empty() { &stderr } else { &stdout }
                )),
                exit_code: code,
            },
        }
    }

    pub fn has_hooks(&self) -> bool {
        !self.config.pre_tool_use.is_empty() || !self.config.post_tool_use.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_empty_hooks() {
        let runner = HookRunner::empty();
        let result = runner.run_pre_tool_use("bash", &serde_json::json!({"command": "ls"}));
        assert!(result.allowed);
        assert!(result.feedback.is_none());
    }

    #[test]
    fn test_allow_hook() {
        let exit_cmd = if cfg!(windows) {
            "exit /b 0".to_string()
        } else {
            "exit 0".to_string()
        };
        let config = HookConfig {
            pre_tool_use: vec![exit_cmd],
            post_tool_use: vec![],
        };
        let runner = HookRunner::new(config);
        let result = runner.run_pre_tool_use("read_file", &serde_json::json!({}));
        assert!(result.allowed);
    }

    #[test]
    fn test_deny_hook() {
        let deny_cmd = if cfg!(windows) {
            "echo Blocked >&2 & exit /b 2".to_string()
        } else {
            "echo 'Blocked' >&2; exit 2".to_string()
        };
        let config = HookConfig {
            pre_tool_use: vec![deny_cmd],
            post_tool_use: vec![],
        };
        let runner = HookRunner::new(config);
        let result = runner.run_pre_tool_use("bash", &serde_json::json!({"command": "rm -rf /"}));
        assert!(!result.allowed);
        assert_eq!(result.exit_code, 2);
    }

    #[test]
    fn test_hook_payload_serialization() {
        let payload = HookPayload {
            hook_event_name: "PreToolUse".into(),
            tool_name: "bash".into(),
            tool_input: serde_json::json!({"command": "ls"}),
            tool_output: None,
            tool_result_is_error: false,
        };
        let json = serde_json::to_string(&payload).unwrap();
        assert!(json.contains("PreToolUse"));
        assert!(json.contains("bash"));
        assert!(!json.contains("tool_output")); // skipped when None
    }
}
