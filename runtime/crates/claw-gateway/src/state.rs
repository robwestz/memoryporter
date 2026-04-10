//! Shared application state for the gateway.

use axum::http::{HeaderMap, StatusCode};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;

use crate::persistence;

pub struct AppState {
    pub api_key: Option<String>,
    pub sessions: Mutex<HashMap<String, SessionRecord>>,
    pub schedules: Mutex<HashMap<String, ScheduleRecord>>,
    pub knowledge_path: Option<String>,
    pub data_dir: PathBuf,
    ob1_path: String,
    snowball_mcp_path: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct SessionRecord {
    pub id: String,
    pub last_message: String,
    pub turn_count: u32,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct ScheduleRecord {
    pub id: String,
    pub name: String,
    pub cron: String,
    pub command: String,
    pub enabled: bool,
}

impl AppState {
    /// Create with explicit data dir (for tests).
    pub fn with_data_dir(api_key: Option<String>, data_dir: PathBuf) -> Self {
        let home = std::env::var("HOME")
            .or_else(|_| std::env::var("USERPROFILE"))
            .unwrap_or_else(|_| ".".into());
        let claw_bin = format!("{}/.openclaw/bin", home);
        let _ = std::fs::create_dir_all(&data_dir);
        let sessions = persistence::load_sessions(&data_dir);
        let schedules = persistence::load_schedules(&data_dir);
        Self {
            api_key,
            sessions: Mutex::new(sessions),
            schedules: Mutex::new(schedules),
            knowledge_path: None,
            data_dir,
            ob1_path: "ob1".into(),
            snowball_mcp_path: "snowball-mcp".into(),
        }
    }

    pub fn new(api_key: Option<String>) -> Self {
        let home = std::env::var("HOME")
            .or_else(|_| std::env::var("USERPROFILE"))
            .unwrap_or_else(|_| ".".into());
        let claw_bin = format!("{}/.openclaw/bin", home);

        // Resolve data directory: env var, or (in tests) a unique temp dir per
        // instance, or default ~/.openclaw/gateway/.
        let data_dir: PathBuf = std::env::var("GATEWAY_DATA_DIR")
            .map(PathBuf::from)
            .unwrap_or_else(|_| {
                #[cfg(test)]
                {
                    // Each AppState in tests gets its own isolated temp dir so
                    // tests never see each other's persisted data.
                    use std::time::{SystemTime, UNIX_EPOCH};
                    let n = SystemTime::now()
                        .duration_since(UNIX_EPOCH)
                        .unwrap()
                        .as_nanos();
                    // Add a thread-local counter for extra uniqueness within
                    // the same nanosecond (parallel tests).
                    std::env::temp_dir()
                        .join("claw-gateway-test")
                        .join(format!("{:x}", n))
                }
                #[cfg(not(test))]
                {
                    PathBuf::from(&home).join(".openclaw").join("gateway")
                }
            });

        // Ensure the data directory exists; ignore errors (e.g. read-only FS)
        let _ = std::fs::create_dir_all(&data_dir);

        // Load persisted data (returns empty maps if files are missing/corrupt)
        let sessions = persistence::load_sessions(&data_dir);
        let schedules = persistence::load_schedules(&data_dir);

        Self {
            api_key,
            sessions: Mutex::new(sessions),
            schedules: Mutex::new(schedules),
            knowledge_path: std::env::var("KNOWLEDGE_PATH").ok().or_else(|| {
                let p = format!("{}/.openclaw/knowledge/knowledge_base.json", home);
                if std::path::Path::new(&p).exists() { Some(p) } else { None }
            }),
            data_dir,
            ob1_path: std::env::var("OB1_PATH").unwrap_or_else(|_| {
                let p = format!("{}/ob1", claw_bin);
                if std::path::Path::new(&p).exists() { p } else { "ob1".into() }
            }),
            snowball_mcp_path: std::env::var("SNOWBALL_MCP_PATH").unwrap_or_else(|_| {
                let p = format!("{}/snowball-mcp", claw_bin);
                if std::path::Path::new(&p).exists() { p } else { "snowball-mcp".into() }
            }),
        }
    }

    /// Flush the current sessions to disk. Call after every mutation.
    pub fn save_sessions(&self) {
        let sessions = self.sessions.lock().unwrap();
        persistence::save_sessions(&self.data_dir, &sessions);
    }

    /// Flush the current schedules to disk. Call after every mutation.
    pub fn save_schedules(&self) {
        let schedules = self.schedules.lock().unwrap();
        persistence::save_schedules(&self.data_dir, &schedules);
    }

    pub fn check_auth(&self, headers: &HeaderMap) -> Result<(), (StatusCode, String)> {
        if let Some(expected) = &self.api_key {
            let provided = headers
                .get("x-api-key")
                .or_else(|| headers.get("authorization"))
                .and_then(|v| v.to_str().ok())
                .map(|s| s.trim_start_matches("Bearer ").to_string());

            match provided {
                Some(key) if &key == expected => Ok(()),
                Some(_) => Err((StatusCode::UNAUTHORIZED, "Invalid API key".into())),
                None => Err((StatusCode::UNAUTHORIZED, "Missing API key".into())),
            }
        } else {
            Ok(()) // No auth configured
        }
    }

    pub fn ob1_path(&self) -> String {
        self.ob1_path.clone()
    }

    pub fn snowball_mcp_path(&self) -> String {
        self.snowball_mcp_path.clone()
    }

    pub fn load_knowledge_base(&self) -> Vec<serde_json::Value> {
        if let Some(path) = &self.knowledge_path {
            if let Ok(content) = std::fs::read_to_string(path) {
                if let Ok(items) = serde_json::from_str::<Vec<serde_json::Value>>(&content) {
                    return items;
                }
                // Try as object with "facts" key
                if let Ok(obj) = serde_json::from_str::<serde_json::Value>(&content) {
                    if let Some(facts) = obj.get("facts").and_then(|f| f.as_array()) {
                        return facts.clone();
                    }
                }
            }
        }
        Vec::new()
    }
}
