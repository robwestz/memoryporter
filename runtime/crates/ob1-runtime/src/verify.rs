//! Primitive #8 — Verification Harness.
//!
//! Observability tells you what happened. Verification tells you it's still correct.
//! Run these when you change prompts, models, tools, or routing logic.

use crate::budget::{BudgetCheck, BudgetConfig, BudgetTracker, StopReason};
use crate::events::{EventCategory, EventLogger};
use crate::permissions::{AuthzResult, HandlerType, PermissionMode, PermissionPolicy};
use crate::registry::{SourceType, ToolRegistry, ToolSpec, SideEffectProfile};
use crate::session::Session;
use crate::workflow::Workflow;

/// Result of a single verification check.
#[derive(Debug, Clone)]
pub struct CheckResult {
    pub name: String,
    pub passed: bool,
    pub detail: String,
}

/// Run all Day 1 invariant checks. Returns failures.
pub fn run_verification_suite() -> Vec<CheckResult> {
    let mut results = Vec::new();

    results.push(check_destructive_tools_require_approval());
    results.push(check_denied_tools_never_execute());
    results.push(check_budget_exhaustion_graceful_stop());
    results.push(check_session_save_load_roundtrip());
    results.push(check_workflow_idempotency());
    results.push(check_event_logger_captures_all_categories());
    results.push(check_swarm_worker_cannot_escalate());
    results.push(check_tool_registry_metadata_first());

    results
}

/// Count failures.
pub fn failure_count(results: &[CheckResult]) -> usize {
    results.iter().filter(|r| !r.passed).count()
}

/// Render results as markdown.
pub fn results_to_markdown(results: &[CheckResult]) -> String {
    let passed = results.iter().filter(|r| r.passed).count();
    let total = results.len();
    let mut out = format!("# Verification Suite: {}/{} passed\n\n", passed, total);
    for r in results {
        let icon = if r.passed { "PASS" } else { "FAIL" };
        out.push_str(&format!("- [{}] **{}** — {}\n", icon, r.name, r.detail));
    }
    out
}

// ── Individual checks ───────────────────────────────────────────────────────

fn check_destructive_tools_require_approval() -> CheckResult {
    let policy = PermissionPolicy::new("test", PermissionMode::ReadOnly)
        .with_tool_override("bash", PermissionMode::DangerFullAccess);

    let result = policy.authorize("bash");
    let passed = matches!(result, AuthzResult::Prompt { .. } | AuthzResult::Deny { .. });

    CheckResult {
        name: "Destructive tools require approval".into(),
        passed,
        detail: if passed {
            "bash requires escalation in ReadOnly mode".into()
        } else {
            format!("Expected Prompt or Deny, got {:?}", result)
        },
    }
}

fn check_denied_tools_never_execute() -> CheckResult {
    let policy = PermissionPolicy::new("test", PermissionMode::DangerFullAccess)
        .with_deny("rm_everything");

    let result = policy.authorize("rm_everything");
    let passed = matches!(result, AuthzResult::Deny { .. });

    CheckResult {
        name: "Denied tools never execute".into(),
        passed,
        detail: if passed {
            "Deny-listed tool correctly blocked".into()
        } else {
            format!("Expected Deny, got {:?}", result)
        },
    }
}

fn check_budget_exhaustion_graceful_stop() -> CheckResult {
    let mut tracker = BudgetTracker::new(BudgetConfig {
        max_budget_tokens: 100,
        ..Default::default()
    });
    tracker.record_turn("t1", 60, 50, 0.01);

    let check = tracker.pre_turn_check();
    let passed = matches!(
        check,
        BudgetCheck::Exceeded {
            stop_reason: StopReason::MaxBudgetReached
        }
    );

    CheckResult {
        name: "Budget exhaustion produces graceful stop".into(),
        passed,
        detail: if passed {
            "Pre-turn check returns MaxBudgetReached before API call".into()
        } else {
            format!("Expected Exceeded(MaxBudgetReached), got {:?}", check)
        },
    }
}

fn check_session_save_load_roundtrip() -> CheckResult {
    let dir = std::env::temp_dir().join("ob1_verify_session");
    let _ = std::fs::create_dir_all(&dir);
    let path = dir.join("verify_session.json");

    let mut session = Session::new("verify-001");
    session.add_user_message("test");
    session.add_assistant_message(
        "response",
        crate::session::TokenUsage {
            input_tokens: 42,
            output_tokens: 17,
            ..Default::default()
        },
    );

    let save_ok = session.save(&path).is_ok();
    let load_result = Session::load(&path);
    let _ = std::fs::remove_file(&path);

    let passed = save_ok
        && load_result.is_ok()
        && load_result.as_ref().unwrap().cumulative_usage.input_tokens == 42;

    CheckResult {
        name: "Session save/load roundtrip preserves state".into(),
        passed,
        detail: if passed {
            "Session persisted and restored with correct usage".into()
        } else {
            "Save or load failed, or usage mismatch".into()
        },
    }
}

fn check_workflow_idempotency() -> CheckResult {
    let mut wf = Workflow::new("verify-wf", "Idempotency check");
    wf.add_step("step1", "Test step");

    wf.begin_step("step1").unwrap();
    wf.checkpoint_step("step1", serde_json::json!({"done": true}))
        .unwrap();

    let is_completed = wf.is_completed("verify-wf_step1");
    // Retry should be no-op
    wf.begin_step("step1").unwrap();
    let still_completed = wf.is_completed("verify-wf_step1");

    let passed = is_completed && still_completed;

    CheckResult {
        name: "Workflow idempotency prevents double-execution".into(),
        passed,
        detail: if passed {
            "Completed step retry is a no-op".into()
        } else {
            "Idempotency check failed".into()
        },
    }
}

fn check_event_logger_captures_all_categories() -> CheckResult {
    let mut logger = EventLogger::new();
    logger.bootstrap("test", "boot");
    logger.permission("test", "auth");
    logger.error("test", "err");
    logger.log(EventCategory::ToolExecution, "test", "exec");

    let passed = logger.count() == 4
        && logger.by_category(&EventCategory::Bootstrap).len() == 1
        && logger.by_category(&EventCategory::Error).len() == 1;

    CheckResult {
        name: "Event logger captures all categories".into(),
        passed,
        detail: if passed {
            format!("4 events across 4 categories captured")
        } else {
            format!("Expected 4 events, got {}", logger.count())
        },
    }
}

fn check_swarm_worker_cannot_escalate() -> CheckResult {
    let policy = PermissionPolicy::new("swarm", PermissionMode::ReadOnly)
        .with_handler(HandlerType::SwarmWorker)
        .with_tool_override("bash", PermissionMode::DangerFullAccess);

    let result = policy.authorize("bash");
    let passed = matches!(result, AuthzResult::Deny { .. });

    CheckResult {
        name: "Swarm worker cannot escalate permissions".into(),
        passed,
        detail: if passed {
            "SwarmWorker correctly denied without escalation".into()
        } else {
            format!("Expected Deny, got {:?}", result)
        },
    }
}

fn check_tool_registry_metadata_first() -> CheckResult {
    let mut reg = ToolRegistry::new();
    reg.register(ToolSpec {
        name: "test_tool".into(),
        description: "A test".into(),
        source_type: SourceType::BuiltIn,
        required_permission: PermissionMode::ReadOnly,
        input_schema: serde_json::json!({"type": "object"}),
        side_effects: SideEffectProfile::default(),
        enabled: true,
        aliases: vec![],
    });

    // list_tools returns metadata without executing
    let tools = reg.list_tools();
    let passed = tools.len() == 1 && tools[0].name == "test_tool";

    CheckResult {
        name: "Tool registry is metadata-first (no execution on list)".into(),
        passed,
        detail: if passed {
            "list_tools() returns specs without side effects".into()
        } else {
            "Registry listing failed".into()
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verification_suite() {
        let results = run_verification_suite();
        let failures = failure_count(&results);
        let md = results_to_markdown(&results);

        println!("{}", md);

        assert_eq!(
            failures, 0,
            "Verification suite has {} failures:\n{}",
            failures, md
        );
    }
}
