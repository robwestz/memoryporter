//! Primitive #18 — Skills & Extensibility.
//!
//! Skills are the middle ground between "agent does everything from scratch"
//! and "developer hard-codes every workflow." Self-contained units with
//! trigger, prompt, tool requirements, and I/O contracts.

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// Skill kind — determines loading and trust behavior.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SkillKind {
    /// Bundled with the runtime — highest trust.
    Bundled,
    /// User-defined, loaded from skills directory.
    UserDefined,
    /// Auto-generated from MCP server capabilities.
    McpGenerated { server: String },
}

/// A skill definition.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillSpec {
    pub name: String,
    pub kind: SkillKind,
    pub description: String,
    pub triggers: Vec<String>,
    pub priority: u8,
    pub required_tools: Vec<String>,
    pub prompt_template: String,
    pub source_evidence: String,
}

/// Skill matching result.
#[derive(Debug, Clone)]
pub struct SkillMatch {
    pub skill: SkillSpec,
    pub score: f32,
    pub matched_trigger: String,
}

/// Skill registry — discovers and ranks skills.
#[derive(Debug, Clone, Default)]
pub struct SkillRegistry {
    skills: BTreeMap<String, SkillSpec>,
    /// Use count per skill (promotion tracking).
    use_counts: BTreeMap<String, u32>,
}

impl SkillRegistry {
    pub fn new() -> Self {
        Self::default()
    }

    /// Register a skill.
    pub fn register(&mut self, spec: SkillSpec) {
        self.skills.insert(spec.name.clone(), spec);
    }

    /// Find matching skills for a user prompt.
    /// Returns top matches sorted by score (max 3 per loader-blueprint rules).
    pub fn match_prompt(&self, prompt: &str, max_results: usize) -> Vec<SkillMatch> {
        let lower = prompt.to_lowercase();
        let mut matches: Vec<SkillMatch> = Vec::new();

        for spec in self.skills.values() {
            let mut best_trigger = String::new();
            let mut trigger_score = 0.0f32;

            for trigger in &spec.triggers {
                let trigger_lower = trigger.to_lowercase();
                if lower.contains(&trigger_lower) {
                    // Exact match: +3
                    trigger_score = 3.0;
                    best_trigger = trigger.clone();
                    break;
                } else if trigger_lower.split_whitespace().any(|w| lower.contains(w)) {
                    // Fuzzy match: +1
                    if trigger_score < 1.0 {
                        trigger_score = 1.0;
                        best_trigger = trigger.clone();
                    }
                }
            }

            if trigger_score > 0.0 {
                let score = spec.priority as f32 + trigger_score;
                matches.push(SkillMatch {
                    skill: spec.clone(),
                    score,
                    matched_trigger: best_trigger,
                });
            }
        }

        // Sort by score descending
        matches.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));

        // Max 3 results (loader-blueprint rule)
        matches.truncate(max_results.min(3));
        matches
    }

    /// Record a skill use (for promotion tracking).
    pub fn record_use(&mut self, name: &str) {
        *self.use_counts.entry(name.into()).or_insert(0) += 1;
    }

    /// Get use count for a skill.
    pub fn use_count(&self, name: &str) -> u32 {
        self.use_counts.get(name).copied().unwrap_or(0)
    }

    /// Check if a skill should be promoted to permanent (3+ uses).
    pub fn should_promote(&self, name: &str) -> bool {
        self.use_count(name) >= 3
    }

    /// Get all registered skills.
    pub fn all(&self) -> Vec<&SkillSpec> {
        self.skills.values().collect()
    }

    /// Count skills.
    pub fn len(&self) -> usize {
        self.skills.len()
    }

    pub fn is_empty(&self) -> bool {
        self.skills.is_empty()
    }
}

/// Load skills from a directory of SKILL.md files.
pub fn load_skills_from_dir(dir: &std::path::Path) -> Vec<SkillSpec> {
    let mut skills = Vec::new();
    let Ok(entries) = std::fs::read_dir(dir) else {
        return skills;
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            let skill_file = path.join("SKILL.md");
            if skill_file.exists() {
                if let Ok(content) = std::fs::read_to_string(&skill_file) {
                    if let Some(spec) = parse_skill_frontmatter(&content, &path) {
                        skills.push(spec);
                    }
                }
            }
        }
    }

    skills
}

/// Parse skill name and description from SKILL.md frontmatter.
fn parse_skill_frontmatter(content: &str, path: &std::path::Path) -> Option<SkillSpec> {
    let dir_name = path.file_name()?.to_string_lossy().to_string();

    // Simple frontmatter extraction
    let mut name = dir_name.clone();
    let mut description = String::new();
    let mut triggers = Vec::new();

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("name:") {
            name = trimmed.trim_start_matches("name:").trim().to_string();
        } else if trimmed.starts_with("description:") {
            description = trimmed.trim_start_matches("description:").trim().to_string();
        } else if trimmed.starts_with("trigger:") {
            triggers.push(trimmed.trim_start_matches("trigger:").trim().to_string());
        }
    }

    if triggers.is_empty() {
        triggers.push(name.clone());
    }

    Some(SkillSpec {
        name,
        kind: SkillKind::UserDefined,
        description,
        triggers,
        priority: 5,
        required_tools: Vec::new(),
        prompt_template: content.to_string(),
        source_evidence: path.display().to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_skill(name: &str, triggers: &[&str], priority: u8) -> SkillSpec {
        SkillSpec {
            name: name.into(),
            kind: SkillKind::Bundled,
            description: format!("Test skill {}", name),
            triggers: triggers.iter().map(|t| t.to_string()).collect(),
            priority,
            required_tools: vec![],
            prompt_template: String::new(),
            source_evidence: String::new(),
        }
    }

    #[test]
    fn test_skill_matching() {
        let mut reg = SkillRegistry::new();
        reg.register(sample_skill("commit", &["/commit", "commit changes"], 8));
        reg.register(sample_skill("debug", &["/debug", "debug this"], 7));
        reg.register(sample_skill("review", &["/review", "review pr"], 6));

        let matches = reg.match_prompt("please commit changes", 3);
        assert_eq!(matches.len(), 1);
        assert_eq!(matches[0].skill.name, "commit");
    }

    #[test]
    fn test_max_3_results() {
        let mut reg = SkillRegistry::new();
        for i in 0..5 {
            reg.register(sample_skill(
                &format!("skill{}", i),
                &["test"],
                5,
            ));
        }
        let matches = reg.match_prompt("test", 10);
        assert!(matches.len() <= 3); // Loader blueprint rule: max 3
    }

    #[test]
    fn test_promotion_tracking() {
        let mut reg = SkillRegistry::new();
        reg.register(sample_skill("verify", &["/verify"], 8));

        assert!(!reg.should_promote("verify"));
        reg.record_use("verify");
        reg.record_use("verify");
        assert!(!reg.should_promote("verify"));
        reg.record_use("verify");
        assert!(reg.should_promote("verify")); // 3rd use = promote
    }

    #[test]
    fn test_exact_vs_fuzzy() {
        let mut reg = SkillRegistry::new();
        reg.register(sample_skill("exact", &["run tests"], 5));
        reg.register(sample_skill("fuzzy", &["test execution pipeline"], 5));

        let matches = reg.match_prompt("run tests", 3);
        assert!(!matches.is_empty());
        // "exact" should score higher (exact match +3 vs fuzzy +1)
        assert_eq!(matches[0].skill.name, "exact");
    }
}
