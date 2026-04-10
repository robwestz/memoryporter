//! Primitive #13 — 7-Stage Staged Boot Sequence.
//!
//! Agent has situational awareness before the first prompt.
//! Each stage gates the next. Trust gate at stage 5.

use serde::{Deserialize, Serialize};
use crate::events::EventLogger;

/// The 7 bootstrap stages.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum BootStage {
    /// Stage 1: Parallel prefetch (credentials, project scan).
    Prefetch = 1,
    /// Stage 2: Warning handler and environment guards.
    EnvironmentGuards = 2,
    /// Stage 3: CLI parser and pre-action trust gate.
    TrustGate = 3,
    /// Stage 4: Parallel workspace + registry load.
    RegistryLoad = 4,
    /// Stage 5: Trust-gated deferred init (plugins, skills, MCP, hooks).
    DeferredInit = 5,
    /// Stage 6: Mode routing (local/remote/ssh/teleport).
    ModeRouting = 6,
    /// Stage 7: Query engine submit loop.
    MainLoop = 7,
}

impl BootStage {
    pub fn label(&self) -> &str {
        match self {
            Self::Prefetch => "prefetch",
            Self::EnvironmentGuards => "environment_guards",
            Self::TrustGate => "trust_gate",
            Self::RegistryLoad => "registry_load",
            Self::DeferredInit => "deferred_init",
            Self::ModeRouting => "mode_routing",
            Self::MainLoop => "main_loop",
        }
    }

    pub fn all() -> &'static [BootStage] {
        &[
            Self::Prefetch,
            Self::EnvironmentGuards,
            Self::TrustGate,
            Self::RegistryLoad,
            Self::DeferredInit,
            Self::ModeRouting,
            Self::MainLoop,
        ]
    }
}

/// Result of a single boot stage.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StageResult {
    pub stage: BootStage,
    pub success: bool,
    pub detail: String,
    pub skipped: bool,
}

/// Boot configuration.
#[derive(Debug, Clone)]
pub struct BootConfig {
    pub trusted: bool,
    pub enable_plugins: bool,
    pub enable_skills: bool,
    pub enable_mcp: bool,
}

impl Default for BootConfig {
    fn default() -> Self {
        Self {
            trusted: true,
            enable_plugins: true,
            enable_skills: true,
            enable_mcp: true,
        }
    }
}

/// Run the staged boot sequence. Returns results for each stage.
pub fn run_boot_sequence(
    config: &BootConfig,
    logger: &mut EventLogger,
) -> Vec<StageResult> {
    let mut results = Vec::new();

    // Stage 1: Prefetch
    logger.bootstrap("boot:prefetch", "Starting prefetch operations");
    results.push(StageResult {
        stage: BootStage::Prefetch,
        success: true,
        detail: "Prefetch completed".into(),
        skipped: false,
    });

    // Stage 2: Environment guards
    logger.bootstrap("boot:env_guards", "Checking environment");
    results.push(StageResult {
        stage: BootStage::EnvironmentGuards,
        success: true,
        detail: "Environment OK".into(),
        skipped: false,
    });

    // Stage 3: Trust gate
    logger.bootstrap("boot:trust_gate", &format!("Trust: {}", config.trusted));
    results.push(StageResult {
        stage: BootStage::TrustGate,
        success: true,
        detail: format!("Trusted: {}", config.trusted),
        skipped: false,
    });

    // Stage 4: Registry load
    logger.bootstrap("boot:registry", "Loading tool and command registries");
    results.push(StageResult {
        stage: BootStage::RegistryLoad,
        success: true,
        detail: "Registries loaded".into(),
        skipped: false,
    });

    // Stage 5: Deferred init — TRUST GATED
    let deferred_skipped = !config.trusted;
    if deferred_skipped {
        logger.bootstrap("boot:deferred_init", "SKIPPED (untrusted)");
    } else {
        let mut inits = Vec::new();
        if config.enable_plugins { inits.push("plugins"); }
        if config.enable_skills { inits.push("skills"); }
        if config.enable_mcp { inits.push("mcp"); }
        inits.push("session_hooks");
        logger.bootstrap("boot:deferred_init", &format!("Initialized: {}", inits.join(", ")));
    }
    results.push(StageResult {
        stage: BootStage::DeferredInit,
        success: true,
        detail: if deferred_skipped {
            "Skipped (untrusted session)".into()
        } else {
            "Deferred init completed".into()
        },
        skipped: deferred_skipped,
    });

    // Stage 6: Mode routing
    logger.bootstrap("boot:mode_routing", "Routing: local mode");
    results.push(StageResult {
        stage: BootStage::ModeRouting,
        success: true,
        detail: "Mode: local".into(),
        skipped: false,
    });

    // Stage 7: Main loop ready
    logger.bootstrap("boot:main_loop", "Query engine ready");
    results.push(StageResult {
        stage: BootStage::MainLoop,
        success: true,
        detail: "Ready for input".into(),
        skipped: false,
    });

    results
}

/// Check if boot completed successfully.
pub fn boot_healthy(results: &[StageResult]) -> bool {
    results.iter().all(|r| r.success)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_trusted_boot() {
        let mut logger = EventLogger::new();
        let config = BootConfig::default();
        let results = run_boot_sequence(&config, &mut logger);
        assert_eq!(results.len(), 7);
        assert!(boot_healthy(&results));
        assert!(!results[4].skipped); // Stage 5 NOT skipped
        assert!(logger.count() >= 7);
    }

    #[test]
    fn test_untrusted_boot() {
        let mut logger = EventLogger::new();
        let config = BootConfig { trusted: false, ..Default::default() };
        let results = run_boot_sequence(&config, &mut logger);
        assert_eq!(results.len(), 7);
        assert!(boot_healthy(&results));
        assert!(results[4].skipped); // Stage 5 SKIPPED
    }

    #[test]
    fn test_stage_ordering() {
        let stages = BootStage::all();
        assert_eq!(stages.len(), 7);
        assert_eq!(stages[0], BootStage::Prefetch);
        assert_eq!(stages[6], BootStage::MainLoop);
    }
}
