//! Primitive #5 — Token Budget Tracking with pre-turn checks.
//!
//! Check BEFORE the API call, not after. Stop before overspending.

use serde::{Deserialize, Serialize};

/// Budget configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BudgetConfig {
    pub max_turns: u32,
    pub max_budget_tokens: u64,
    pub compact_after_turns: u32,
    pub warn_at_percentage: u8,
}

impl Default for BudgetConfig {
    fn default() -> Self {
        Self {
            max_turns: 32,
            max_budget_tokens: 200_000,
            compact_after_turns: 12,
            warn_at_percentage: 80,
        }
    }
}

/// Why a conversation ended.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum StopReason {
    Completed,
    MaxBudgetReached,
    MaxTurnsReached,
    UserCancelled,
    Error { message: String },
    Timeout,
}

/// Pre-turn budget check result.
#[derive(Debug, Clone)]
pub enum BudgetCheck {
    /// Under budget — proceed.
    Ok,
    /// Approaching limit — warn user, continue.
    Warning { used_pct: u8, remaining_tokens: u64 },
    /// Over budget — STOP before API call.
    Exceeded { stop_reason: StopReason },
}

/// Tracks token usage and cost per session.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BudgetTracker {
    pub config: BudgetConfig,
    pub total_input_tokens: u64,
    pub total_output_tokens: u64,
    pub total_cost_usd: f64,
    pub turn_count: u32,
    events: Vec<CostEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostEvent {
    pub label: String,
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub cost_usd: f64,
}

impl BudgetTracker {
    pub fn new(config: BudgetConfig) -> Self {
        Self {
            config,
            total_input_tokens: 0,
            total_output_tokens: 0,
            total_cost_usd: 0.0,
            turn_count: 0,
            events: Vec::new(),
        }
    }

    /// Pre-turn check — call BEFORE making the API request.
    pub fn pre_turn_check(&self) -> BudgetCheck {
        // Check turn limit
        if self.turn_count >= self.config.max_turns {
            return BudgetCheck::Exceeded {
                stop_reason: StopReason::MaxTurnsReached,
            };
        }

        // Check token budget
        let total = self.total_input_tokens + self.total_output_tokens;
        if total >= self.config.max_budget_tokens {
            return BudgetCheck::Exceeded {
                stop_reason: StopReason::MaxBudgetReached,
            };
        }

        // Warning threshold
        let used_pct = ((total as f64 / self.config.max_budget_tokens as f64) * 100.0) as u8;
        if used_pct >= self.config.warn_at_percentage {
            return BudgetCheck::Warning {
                used_pct,
                remaining_tokens: self.config.max_budget_tokens - total,
            };
        }

        BudgetCheck::Ok
    }

    /// Record token usage after a turn completes.
    pub fn record_turn(&mut self, label: &str, input_tokens: u64, output_tokens: u64, cost_usd: f64) {
        self.total_input_tokens += input_tokens;
        self.total_output_tokens += output_tokens;
        self.total_cost_usd += cost_usd;
        self.turn_count += 1;
        self.events.push(CostEvent {
            label: label.into(),
            input_tokens,
            output_tokens,
            cost_usd,
        });
    }

    /// Check if compaction is needed.
    pub fn needs_compaction(&self) -> bool {
        self.turn_count > 0 && self.turn_count % self.config.compact_after_turns == 0
    }

    /// Remaining budget as percentage.
    pub fn remaining_pct(&self) -> u8 {
        let total = self.total_input_tokens + self.total_output_tokens;
        if self.config.max_budget_tokens == 0 {
            return 0;
        }
        let used = (total as f64 / self.config.max_budget_tokens as f64) * 100.0;
        (100.0 - used).max(0.0) as u8
    }

    /// Get all cost events.
    pub fn events(&self) -> &[CostEvent] {
        &self.events
    }

    /// Determine the stop reason if the session should end now.
    pub fn stop_reason(&self) -> Option<StopReason> {
        match self.pre_turn_check() {
            BudgetCheck::Exceeded { stop_reason } => Some(stop_reason),
            _ => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pre_turn_check_ok() {
        let tracker = BudgetTracker::new(BudgetConfig::default());
        assert!(matches!(tracker.pre_turn_check(), BudgetCheck::Ok));
    }

    #[test]
    fn test_pre_turn_check_budget_exceeded() {
        let mut tracker = BudgetTracker::new(BudgetConfig {
            max_budget_tokens: 100,
            ..Default::default()
        });
        tracker.record_turn("turn1", 60, 50, 0.01);
        match tracker.pre_turn_check() {
            BudgetCheck::Exceeded { stop_reason } => {
                assert_eq!(stop_reason, StopReason::MaxBudgetReached);
            }
            other => panic!("Expected Exceeded, got {:?}", other),
        }
    }

    #[test]
    fn test_pre_turn_check_turns_exceeded() {
        let mut tracker = BudgetTracker::new(BudgetConfig {
            max_turns: 2,
            ..Default::default()
        });
        tracker.record_turn("t1", 10, 5, 0.001);
        tracker.record_turn("t2", 10, 5, 0.001);
        match tracker.pre_turn_check() {
            BudgetCheck::Exceeded { stop_reason } => {
                assert_eq!(stop_reason, StopReason::MaxTurnsReached);
            }
            other => panic!("Expected Exceeded, got {:?}", other),
        }
    }

    #[test]
    fn test_warning_threshold() {
        let mut tracker = BudgetTracker::new(BudgetConfig {
            max_budget_tokens: 100,
            warn_at_percentage: 80,
            ..Default::default()
        });
        tracker.record_turn("t1", 45, 40, 0.01);
        match tracker.pre_turn_check() {
            BudgetCheck::Warning { used_pct, .. } => assert!(used_pct >= 80),
            other => panic!("Expected Warning, got {:?}", other),
        }
    }

    #[test]
    fn test_compaction_trigger() {
        let mut tracker = BudgetTracker::new(BudgetConfig {
            compact_after_turns: 3,
            ..Default::default()
        });
        tracker.record_turn("t1", 10, 5, 0.0);
        tracker.record_turn("t2", 10, 5, 0.0);
        assert!(!tracker.needs_compaction());
        tracker.record_turn("t3", 10, 5, 0.0);
        assert!(tracker.needs_compaction());
    }
}
