//! Primitive #4 — Workflow State & Idempotency.
//!
//! Resuming a conversation is NOT resuming a workflow.
//! Chat transcript = "what we said". Workflow state = "what step we're on,
//! what side effects happened, is it safe to retry."

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// Explicit workflow states — no implicit state from conversation.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum WorkflowStatus {
    Planned,
    AwaitingApproval,
    Executing,
    WaitingOnExternal,
    Completed,
    Failed { reason: String },
}

/// A single workflow step with checkpoint tracking.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStep {
    pub id: String,
    pub description: String,
    pub status: WorkflowStatus,
    pub idempotency_key: Option<String>,
    pub side_effects: Vec<String>,
    pub checkpoint: Option<serde_json::Value>,
}

/// Workflow engine — manages multi-step task execution with crash recovery.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workflow {
    pub id: String,
    pub name: String,
    pub steps: Vec<WorkflowStep>,
    pub current_step: usize,
    pub overall_status: WorkflowStatus,
    /// Idempotency keys that have been completed — retry is a no-op.
    completed_keys: BTreeMap<String, serde_json::Value>,
}

impl Workflow {
    pub fn new(id: &str, name: &str) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            steps: Vec::new(),
            current_step: 0,
            overall_status: WorkflowStatus::Planned,
            completed_keys: BTreeMap::new(),
        }
    }

    /// Add a step to the workflow.
    pub fn add_step(&mut self, id: &str, description: &str) -> &mut WorkflowStep {
        self.steps.push(WorkflowStep {
            id: id.into(),
            description: description.into(),
            status: WorkflowStatus::Planned,
            idempotency_key: Some(format!("{}_{}", self.id, id)),
            side_effects: Vec::new(),
            checkpoint: None,
        });
        self.steps.last_mut().unwrap()
    }

    /// Check if an operation has already completed (idempotent).
    pub fn is_completed(&self, idempotency_key: &str) -> bool {
        self.completed_keys.contains_key(idempotency_key)
    }

    /// Get the result of a previously completed operation.
    pub fn get_completed_result(&self, idempotency_key: &str) -> Option<&serde_json::Value> {
        self.completed_keys.get(idempotency_key)
    }

    /// Mark a step as executing (before the side effect).
    pub fn begin_step(&mut self, step_id: &str) -> Result<(), String> {
        // Check idempotency first (before borrowing steps mutably)
        let idem_key = self.steps.iter()
            .find(|s| s.id == step_id)
            .ok_or_else(|| format!("Step '{}' not found", step_id))?
            .idempotency_key.clone();

        if let Some(key) = &idem_key {
            if self.completed_keys.contains_key(key) {
                return Ok(()); // Already done — no-op
            }
        }

        let step = self.find_step_mut(step_id)?;
        step.status = WorkflowStatus::Executing;
        self.overall_status = WorkflowStatus::Executing;
        Ok(())
    }

    /// Checkpoint after a side-effecting step (persist before continuing).
    pub fn checkpoint_step(
        &mut self,
        step_id: &str,
        result: serde_json::Value,
    ) -> Result<(), String> {
        // Extract key before mutable borrow
        let idem_key = self.steps.iter()
            .find(|s| s.id == step_id)
            .ok_or_else(|| format!("Step '{}' not found", step_id))?
            .idempotency_key.clone();

        let step = self.find_step_mut(step_id)?;
        step.status = WorkflowStatus::Completed;
        step.checkpoint = Some(result.clone());

        if let Some(key) = idem_key {
            self.completed_keys.insert(key, result);
        }

        // Advance current step
        if self.current_step < self.steps.len() - 1 {
            self.current_step += 1;
        } else {
            self.overall_status = WorkflowStatus::Completed;
        }

        Ok(())
    }

    /// Mark a step as failed.
    pub fn fail_step(&mut self, step_id: &str, reason: &str) -> Result<(), String> {
        let step = self.find_step_mut(step_id)?;
        step.status = WorkflowStatus::Failed {
            reason: reason.into(),
        };
        self.overall_status = WorkflowStatus::Failed {
            reason: format!("Step '{}' failed: {}", step_id, reason),
        };
        Ok(())
    }

    /// Get the next pending step (for resume).
    pub fn next_pending_step(&self) -> Option<&WorkflowStep> {
        self.steps.iter().find(|s| {
            matches!(
                s.status,
                WorkflowStatus::Planned | WorkflowStatus::AwaitingApproval
            )
        })
    }

    /// Serialize for persistence.
    pub fn save(&self, path: &std::path::Path) -> Result<(), Box<dyn std::error::Error>> {
        let json = serde_json::to_string_pretty(self)?;
        std::fs::write(path, json)?;
        Ok(())
    }

    pub fn load(path: &std::path::Path) -> Result<Self, Box<dyn std::error::Error>> {
        let json = std::fs::read_to_string(path)?;
        Ok(serde_json::from_str(&json)?)
    }

    fn find_step_mut(&mut self, step_id: &str) -> Result<&mut WorkflowStep, String> {
        self.steps
            .iter_mut()
            .find(|s| s.id == step_id)
            .ok_or_else(|| format!("Step '{}' not found", step_id))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_workflow_lifecycle() {
        let mut wf = Workflow::new("wf-1", "Deploy feature");
        wf.add_step("build", "Build the project");
        wf.add_step("test", "Run tests");
        wf.add_step("deploy", "Deploy to production");

        assert_eq!(wf.steps.len(), 3);
        assert_eq!(wf.overall_status, WorkflowStatus::Planned);

        // Execute first step
        wf.begin_step("build").unwrap();
        assert_eq!(wf.overall_status, WorkflowStatus::Executing);

        wf.checkpoint_step("build", json!({"artifact": "build.zip"})).unwrap();
        assert_eq!(wf.steps[0].status, WorkflowStatus::Completed);
        assert_eq!(wf.current_step, 1);
    }

    #[test]
    fn test_idempotency() {
        let mut wf = Workflow::new("wf-2", "Idempotent test");
        wf.add_step("send_email", "Send notification email");

        wf.begin_step("send_email").unwrap();
        wf.checkpoint_step("send_email", json!({"sent": true})).unwrap();

        // Retry is a no-op
        assert!(wf.is_completed("wf-2_send_email"));
        wf.begin_step("send_email").unwrap(); // Doesn't re-execute
    }

    #[test]
    fn test_failure_and_resume() {
        let mut wf = Workflow::new("wf-3", "Failing workflow");
        wf.add_step("step1", "First step");
        wf.add_step("step2", "Second step");

        wf.begin_step("step1").unwrap();
        wf.checkpoint_step("step1", json!({})).unwrap();

        wf.begin_step("step2").unwrap();
        wf.fail_step("step2", "Connection refused").unwrap();

        assert!(matches!(wf.overall_status, WorkflowStatus::Failed { .. }));

        // Resume: find next pending step
        // step2 failed, step1 completed — need to re-plan step2
    }

    #[test]
    fn test_save_load() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("workflow.json");

        let mut wf = Workflow::new("wf-4", "Persist test");
        wf.add_step("a", "Step A");
        wf.begin_step("a").unwrap();
        wf.checkpoint_step("a", json!({"ok": true})).unwrap();
        wf.save(&path).unwrap();

        let loaded = Workflow::load(&path).unwrap();
        assert_eq!(loaded.id, "wf-4");
        assert!(loaded.is_completed("wf-4_a"));
    }
}
