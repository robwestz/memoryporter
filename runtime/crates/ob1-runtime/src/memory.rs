//! Primitive #17 — Memory System with provenance.
//!
//! 8-module design: relevance scoring, aging, categorization, scoping.
//! Memory without provenance is accumulated hallucination.

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// Memory scope — who can see this memory.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MemoryScope {
    Personal,
    Team { team_id: String },
    Project { project_id: String },
}

/// How this memory was created.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum MemoryOrigin {
    UserStated,
    ModelInferred,
    Imported { source: String },
    SessionLearned,
}

/// A single memory entry with full provenance.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryEntry {
    pub id: String,
    pub content: String,
    pub scope: MemoryScope,
    pub origin: MemoryOrigin,
    pub tags: Vec<String>,
    pub relevance_score: f32,
    pub created_at: u64,
    pub last_validated: Option<u64>,
    pub last_accessed: Option<u64>,
    pub access_count: u32,
    pub is_contradicted: bool,
    pub contradicted_by: Option<String>,
}

impl MemoryEntry {
    /// Calculate an age-adjusted relevance score.
    /// Older memories score lower. Frequently accessed score higher.
    pub fn effective_score(&self, now: u64) -> f32 {
        if self.is_contradicted {
            return 0.0;
        }

        let age_seconds = now.saturating_sub(self.created_at);
        let age_days = age_seconds as f32 / 86400.0;

        // Decay: halve relevance every 30 days
        let age_factor = 0.5f32.powf(age_days / 30.0);

        // Access boost: +10% per access, capped at 2x
        let access_factor = (1.0 + self.access_count as f32 * 0.1).min(2.0);

        // Validation boost: recently validated memories score higher
        let validation_factor = if let Some(validated) = self.last_validated {
            let validation_age = now.saturating_sub(validated);
            if validation_age < 86400 * 7 { 1.2 } else { 1.0 } // Validated within 7 days
        } else {
            0.9 // Never validated = slight penalty
        };

        self.relevance_score * age_factor * access_factor * validation_factor
    }
}

/// The memory store — manages all memory entries.
#[derive(Debug, Clone, Default)]
pub struct MemoryStore {
    entries: BTreeMap<String, MemoryEntry>,
}

impl MemoryStore {
    pub fn new() -> Self {
        Self { entries: BTreeMap::new() }
    }

    /// Add a memory entry.
    pub fn add(&mut self, entry: MemoryEntry) {
        self.entries.insert(entry.id.clone(), entry);
    }

    /// Get a memory by ID.
    pub fn get(&self, id: &str) -> Option<&MemoryEntry> {
        self.entries.get(id)
    }

    /// Mark a memory as accessed (updates access tracking).
    pub fn touch(&mut self, id: &str, now: u64) {
        if let Some(entry) = self.entries.get_mut(id) {
            entry.last_accessed = Some(now);
            entry.access_count += 1;
        }
    }

    /// Mark a memory as validated (still correct as of now).
    pub fn validate(&mut self, id: &str, now: u64) {
        if let Some(entry) = self.entries.get_mut(id) {
            entry.last_validated = Some(now);
        }
    }

    /// Mark a memory as contradicted by a newer memory.
    pub fn contradict(&mut self, id: &str, contradicted_by: &str) {
        if let Some(entry) = self.entries.get_mut(id) {
            entry.is_contradicted = true;
            entry.contradicted_by = Some(contradicted_by.into());
        }
    }

    /// Find relevant memories for a query, sorted by effective score.
    pub fn find_relevant(
        &self,
        keywords: &[&str],
        scope: Option<&MemoryScope>,
        limit: usize,
        now: u64,
    ) -> Vec<&MemoryEntry> {
        let mut matches: Vec<(&MemoryEntry, f32)> = self.entries.values()
            .filter(|e| !e.is_contradicted)
            .filter(|e| {
                if let Some(s) = scope {
                    &e.scope == s
                } else {
                    true
                }
            })
            .filter(|e| {
                if keywords.is_empty() {
                    true
                } else {
                    let lower = e.content.to_lowercase();
                    keywords.iter().any(|kw| lower.contains(&kw.to_lowercase()))
                }
            })
            .map(|e| (e, e.effective_score(now)))
            .collect();

        matches.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        matches.into_iter().take(limit).map(|(e, _)| e).collect()
    }

    /// Get memories by scope.
    pub fn by_scope(&self, scope: &MemoryScope) -> Vec<&MemoryEntry> {
        self.entries.values().filter(|e| &e.scope == scope).collect()
    }

    /// Total memory count.
    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// Save to disk.
    pub fn save(&self, path: &std::path::Path) -> Result<(), Box<dyn std::error::Error>> {
        let json = serde_json::to_string_pretty(&self.entries)?;
        std::fs::write(path, json)?;
        Ok(())
    }

    /// Load from disk.
    pub fn load(path: &std::path::Path) -> Result<Self, Box<dyn std::error::Error>> {
        let json = std::fs::read_to_string(path)?;
        let entries: BTreeMap<String, MemoryEntry> = serde_json::from_str(&json)?;
        Ok(Self { entries })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_memory(id: &str, content: &str, created: u64, relevance: f32) -> MemoryEntry {
        MemoryEntry {
            id: id.into(),
            content: content.into(),
            scope: MemoryScope::Personal,
            origin: MemoryOrigin::UserStated,
            tags: vec![],
            relevance_score: relevance,
            created_at: created,
            last_validated: None,
            last_accessed: None,
            access_count: 0,
            is_contradicted: false,
            contradicted_by: None,
        }
    }

    #[test]
    fn test_add_and_find() {
        let mut store = MemoryStore::new();
        store.add(make_memory("m1", "I prefer Rust over Python", 1000, 0.9));
        store.add(make_memory("m2", "Meeting on Tuesday at 3pm", 1000, 0.8));

        let results = store.find_relevant(&["Rust"], None, 10, 1000);
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].id, "m1");
    }

    #[test]
    fn test_aging() {
        let now = 86400 * 60; // 60 days
        let old = make_memory("old", "old memory", 0, 1.0); // 60 days old
        let new = make_memory("new", "new memory", 86400 * 59, 1.0); // 1 day old

        assert!(new.effective_score(now) > old.effective_score(now));
    }

    #[test]
    fn test_contradiction() {
        let mut store = MemoryStore::new();
        store.add(make_memory("m1", "The API key is abc123", 1000, 1.0));
        store.add(make_memory("m2", "The API key was rotated to xyz789", 2000, 1.0));
        store.contradict("m1", "m2");

        let results = store.find_relevant(&["API key"], None, 10, 2000);
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].id, "m2"); // Only non-contradicted
    }

    #[test]
    fn test_scope_filtering() {
        let mut store = MemoryStore::new();
        store.add(MemoryEntry {
            scope: MemoryScope::Personal,
            ..make_memory("personal", "my note", 1000, 0.9)
        });
        store.add(MemoryEntry {
            scope: MemoryScope::Team { team_id: "eng".into() },
            ..make_memory("team", "team note", 1000, 0.9)
        });

        let personal = store.by_scope(&MemoryScope::Personal);
        assert_eq!(personal.len(), 1);
        let team = store.by_scope(&MemoryScope::Team { team_id: "eng".into() });
        assert_eq!(team.len(), 1);
    }

    #[test]
    fn test_access_boost() {
        let mut store = MemoryStore::new();
        store.add(make_memory("m1", "frequently accessed", 1000, 0.5));
        store.touch("m1", 1000);
        store.touch("m1", 1000);
        store.touch("m1", 1000);

        let entry = store.get("m1").unwrap();
        let base_score = 0.5f32;
        assert!(entry.effective_score(1000) > base_score);
    }
}
