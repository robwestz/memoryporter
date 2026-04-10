//! Primitive #12 — Doctor Pattern (Health Check).
//!
//! /doctor validates everything: API creds, connections, config, tools, MCP.
//! Run at startup AND expose as admin command.

use serde::{Deserialize, Serialize};

/// Result of a single health check.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheck {
    pub name: String,
    pub passed: bool,
    pub detail: String,
}

/// Aggregated doctor report.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DoctorReport {
    pub checks: Vec<HealthCheck>,
    pub passed_count: usize,
    pub failed_count: usize,
    pub overall_healthy: bool,
}

impl DoctorReport {
    pub fn to_markdown(&self) -> String {
        let icon = if self.overall_healthy { "OK" } else { "ISSUES FOUND" };
        let mut out = format!(
            "# Doctor Report: {} ({}/{})\n\n",
            icon, self.passed_count, self.checks.len()
        );
        for check in &self.checks {
            let mark = if check.passed { "PASS" } else { "FAIL" };
            out.push_str(&format!("- [{}] **{}** — {}\n", mark, check.name, check.detail));
        }
        out
    }
}

/// Configurable doctor that runs a set of health checks.
pub struct Doctor {
    checks: Vec<Box<dyn DoctorCheck>>,
}

pub trait DoctorCheck: Send {
    fn name(&self) -> &str;
    fn run(&self) -> HealthCheck;
}

impl Doctor {
    pub fn new() -> Self {
        Self { checks: Vec::new() }
    }

    pub fn add_check(&mut self, check: Box<dyn DoctorCheck>) {
        self.checks.push(check);
    }

    /// Run all checks and produce a report.
    pub fn diagnose(&self) -> DoctorReport {
        let checks: Vec<HealthCheck> = self.checks.iter().map(|c| c.run()).collect();
        let passed_count = checks.iter().filter(|c| c.passed).count();
        let failed_count = checks.len() - passed_count;
        DoctorReport {
            overall_healthy: failed_count == 0,
            passed_count,
            failed_count,
            checks,
        }
    }
}

// ── Built-in checks ─────────────────────────────────────────────────────────

/// Check that an environment variable is set.
pub struct EnvVarCheck {
    pub var_name: String,
}

impl DoctorCheck for EnvVarCheck {
    fn name(&self) -> &str {
        &self.var_name
    }

    fn run(&self) -> HealthCheck {
        let exists = std::env::var(&self.var_name).is_ok();
        HealthCheck {
            name: format!("env:{}", self.var_name),
            passed: exists,
            detail: if exists {
                "Set".into()
            } else {
                format!("${} is not set", self.var_name)
            },
        }
    }
}

/// Check that a directory exists and is readable.
pub struct DirectoryCheck {
    pub path: String,
    pub label: String,
}

impl DoctorCheck for DirectoryCheck {
    fn name(&self) -> &str {
        &self.label
    }

    fn run(&self) -> HealthCheck {
        let exists = std::path::Path::new(&self.path).is_dir();
        HealthCheck {
            name: self.label.clone(),
            passed: exists,
            detail: if exists {
                format!("{} exists", self.path)
            } else {
                format!("{} not found", self.path)
            },
        }
    }
}

/// Check that a file exists and is parseable as JSON.
pub struct JsonFileCheck {
    pub path: String,
    pub label: String,
}

impl DoctorCheck for JsonFileCheck {
    fn name(&self) -> &str {
        &self.label
    }

    fn run(&self) -> HealthCheck {
        match std::fs::read_to_string(&self.path) {
            Ok(content) => match serde_json::from_str::<serde_json::Value>(&content) {
                Ok(_) => HealthCheck {
                    name: self.label.clone(),
                    passed: true,
                    detail: "Valid JSON".into(),
                },
                Err(e) => HealthCheck {
                    name: self.label.clone(),
                    passed: false,
                    detail: format!("Invalid JSON: {}", e),
                },
            },
            Err(e) => HealthCheck {
                name: self.label.clone(),
                passed: false,
                detail: format!("Cannot read: {}", e),
            },
        }
    }
}

/// Check tool registry health.
pub struct ToolRegistryCheck {
    pub expected_count: usize,
    pub actual_count: usize,
}

impl DoctorCheck for ToolRegistryCheck {
    fn name(&self) -> &str {
        "tool_registry"
    }

    fn run(&self) -> HealthCheck {
        HealthCheck {
            name: "tool_registry".into(),
            passed: self.actual_count >= self.expected_count,
            detail: format!("{}/{} tools loaded", self.actual_count, self.expected_count),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_doctor_all_pass() {
        let mut doctor = Doctor::new();
        doctor.add_check(Box::new(ToolRegistryCheck {
            expected_count: 5,
            actual_count: 10,
        }));
        let report = doctor.diagnose();
        assert!(report.overall_healthy);
        assert_eq!(report.passed_count, 1);
    }

    #[test]
    fn test_doctor_with_failure() {
        let mut doctor = Doctor::new();
        doctor.add_check(Box::new(ToolRegistryCheck {
            expected_count: 20,
            actual_count: 5,
        }));
        let report = doctor.diagnose();
        assert!(!report.overall_healthy);
        assert_eq!(report.failed_count, 1);
    }

    #[test]
    fn test_doctor_markdown() {
        let mut doctor = Doctor::new();
        doctor.add_check(Box::new(ToolRegistryCheck {
            expected_count: 5,
            actual_count: 10,
        }));
        let report = doctor.diagnose();
        let md = report.to_markdown();
        assert!(md.contains("PASS"));
        assert!(md.contains("tool_registry"));
    }

    #[test]
    fn test_directory_check() {
        let check = DirectoryCheck {
            path: ".".into(),
            label: "cwd".into(),
        };
        let result = check.run();
        assert!(result.passed);
    }
}
