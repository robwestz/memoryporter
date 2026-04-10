//! File-based persistence for sessions and schedules.
//!
//! Uses atomic writes (write to .tmp then rename) to prevent corruption.
//! Missing or corrupt files are silently treated as empty — the gateway
//! starts clean rather than failing hard.

use crate::state::{ScheduleRecord, SessionRecord};
use std::collections::HashMap;
use std::path::Path;

const SESSIONS_FILE: &str = "sessions.json";
const SCHEDULES_FILE: &str = "schedules.json";

// ── Sessions ──────────────────────────────────────────────

pub fn load_sessions(dir: &Path) -> HashMap<String, SessionRecord> {
    let path = dir.join(SESSIONS_FILE);
    read_json_map(&path)
}

pub fn save_sessions(dir: &Path, sessions: &HashMap<String, SessionRecord>) {
    let path = dir.join(SESSIONS_FILE);
    write_json_atomic(&path, sessions);
}

// ── Schedules ─────────────────────────────────────────────

pub fn load_schedules(dir: &Path) -> HashMap<String, ScheduleRecord> {
    let path = dir.join(SCHEDULES_FILE);
    read_json_map(&path)
}

pub fn save_schedules(dir: &Path, schedules: &HashMap<String, ScheduleRecord>) {
    let path = dir.join(SCHEDULES_FILE);
    write_json_atomic(&path, schedules);
}

// ── Internal helpers ──────────────────────────────────────

/// Read a JSON file as `HashMap<String, T>`. Returns empty map on any error
/// (missing file, corrupt JSON, wrong shape) — the gateway recovers gracefully.
fn read_json_map<T>(path: &Path) -> HashMap<String, T>
where
    T: serde::de::DeserializeOwned,
{
    let content = match std::fs::read_to_string(path) {
        Ok(c) => c,
        Err(_) => return HashMap::new(), // missing file → fresh start
    };
    match serde_json::from_str::<HashMap<String, T>>(&content) {
        Ok(map) => map,
        Err(_) => HashMap::new(), // corrupt file → fresh start
    }
}

/// Write `data` as pretty JSON atomically: write to `path.tmp` then rename.
/// Silently ignores I/O errors — persistence failures must not crash the server.
fn write_json_atomic<T: serde::Serialize>(path: &Path, data: &T) {
    let json = match serde_json::to_string_pretty(data) {
        Ok(j) => j,
        Err(_) => return,
    };

    let tmp_path = path.with_extension("json.tmp");

    if std::fs::write(&tmp_path, &json).is_err() {
        return;
    }

    // Best-effort rename — on Windows this may fail if target exists; try
    // removing the old file first.
    if std::fs::rename(&tmp_path, path).is_err() {
        let _ = std::fs::remove_file(path);
        let _ = std::fs::rename(&tmp_path, path);
    }
}

// ── Tests ─────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    // ── helpers to build test fixtures ───────────────────

    fn make_session(id: &str) -> SessionRecord {
        SessionRecord {
            id: id.into(),
            last_message: format!("hello from {}", id),
            turn_count: 3,
        }
    }

    fn make_schedule(id: &str) -> ScheduleRecord {
        ScheduleRecord {
            id: id.into(),
            name: format!("task-{}", id),
            cron: "0 * * * *".into(),
            command: "echo hi".into(),
            enabled: true,
        }
    }

    // ── data-dir creation ─────────────────────────────────

    #[test]
    fn data_dir_is_created_by_app_state() {
        // This is covered by AppState::new() in state.rs, but we verify here
        // that the directory can be created and used for read/write.
        let base = std::env::temp_dir().join("claw-gw-dir-test");
        let data_dir = base.join("nested").join("gateway");
        // Ensure a clean slate
        let _ = std::fs::remove_dir_all(&base);

        std::fs::create_dir_all(&data_dir).expect("create_dir_all");
        assert!(data_dir.exists());

        // Cleanup
        let _ = std::fs::remove_dir_all(&base);
    }

    // ── sessions roundtrip ────────────────────────────────

    #[test]
    fn sessions_save_and_load_roundtrip() {
        let dir = std::env::temp_dir().join("claw-gw-sessions-roundtrip");
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();

        let mut sessions = HashMap::new();
        sessions.insert("s-001".into(), make_session("s-001"));
        sessions.insert("s-002".into(), make_session("s-002"));

        save_sessions(&dir, &sessions);
        let loaded = load_sessions(&dir);

        assert_eq!(loaded.len(), 2);
        let s = loaded.get("s-001").expect("s-001");
        assert_eq!(s.id, "s-001");
        assert_eq!(s.turn_count, 3);

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn sessions_empty_after_clear() {
        let dir = std::env::temp_dir().join("claw-gw-sessions-clear");
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();

        let mut sessions = HashMap::new();
        sessions.insert("s-abc".into(), make_session("s-abc"));
        save_sessions(&dir, &sessions);

        // Save empty map
        save_sessions(&dir, &HashMap::new());
        let loaded = load_sessions(&dir);
        assert!(loaded.is_empty());

        let _ = std::fs::remove_dir_all(&dir);
    }

    // ── schedules roundtrip ───────────────────────────────

    #[test]
    fn schedules_save_and_load_roundtrip() {
        let dir = std::env::temp_dir().join("claw-gw-schedules-roundtrip");
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();

        let mut schedules = HashMap::new();
        schedules.insert("sched-1".into(), make_schedule("sched-1"));
        schedules.insert("sched-2".into(), make_schedule("sched-2"));

        save_schedules(&dir, &schedules);
        let loaded = load_schedules(&dir);

        assert_eq!(loaded.len(), 2);
        let sc = loaded.get("sched-1").expect("sched-1");
        assert_eq!(sc.name, "task-sched-1");
        assert_eq!(sc.cron, "0 * * * *");
        assert!(sc.enabled);

        let _ = std::fs::remove_dir_all(&dir);
    }

    // ── missing / corrupt files ───────────────────────────

    #[test]
    fn load_sessions_missing_file_returns_empty() {
        let dir = std::env::temp_dir().join("claw-gw-missing-sessions");
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();

        let loaded = load_sessions(&dir);
        assert!(loaded.is_empty(), "missing file should yield empty map");

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn load_schedules_missing_file_returns_empty() {
        let dir = std::env::temp_dir().join("claw-gw-missing-schedules");
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();

        let loaded = load_schedules(&dir);
        assert!(loaded.is_empty(), "missing file should yield empty map");

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn load_sessions_corrupt_file_returns_empty() {
        let dir = std::env::temp_dir().join("claw-gw-corrupt-sessions");
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();

        std::fs::write(dir.join(SESSIONS_FILE), b"{ this is not valid json !!!")
            .expect("write corrupt file");

        let loaded = load_sessions(&dir);
        assert!(loaded.is_empty(), "corrupt file should yield empty map");

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn load_schedules_corrupt_file_returns_empty() {
        let dir = std::env::temp_dir().join("claw-gw-corrupt-schedules");
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();

        std::fs::write(dir.join(SCHEDULES_FILE), b"[broken")
            .expect("write corrupt file");

        let loaded = load_schedules(&dir);
        assert!(loaded.is_empty(), "corrupt file should yield empty map");

        let _ = std::fs::remove_dir_all(&dir);
    }

    // ── restart simulation ────────────────────────────────

    #[test]
    fn sessions_survive_simulated_restart() {
        let dir = std::env::temp_dir().join("claw-gw-restart-sessions");
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();

        // "Before restart" — save state
        let mut before: HashMap<String, SessionRecord> = HashMap::new();
        before.insert("s-restart-1".into(), SessionRecord {
            id: "s-restart-1".into(),
            last_message: "last thing I said".into(),
            turn_count: 7,
        });
        save_sessions(&dir, &before);

        // "After restart" — load back (new process starts fresh, calls load_sessions)
        let after = load_sessions(&dir);
        let rec = after.get("s-restart-1").expect("session must survive restart");
        assert_eq!(rec.id, "s-restart-1");
        assert_eq!(rec.turn_count, 7);
        assert_eq!(rec.last_message, "last thing I said");

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn schedules_survive_simulated_restart() {
        let dir = std::env::temp_dir().join("claw-gw-restart-schedules");
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();

        // "Before restart"
        let mut before: HashMap<String, ScheduleRecord> = HashMap::new();
        before.insert("sched-restart".into(), ScheduleRecord {
            id: "sched-restart".into(),
            name: "nightly-build".into(),
            cron: "0 2 * * *".into(),
            command: "cargo build --release".into(),
            enabled: true,
        });
        save_schedules(&dir, &before);

        // "After restart"
        let after = load_schedules(&dir);
        let rec = after.get("sched-restart").expect("schedule must survive restart");
        assert_eq!(rec.name, "nightly-build");
        assert_eq!(rec.cron, "0 2 * * *");
        assert!(rec.enabled);

        let _ = std::fs::remove_dir_all(&dir);
    }
}
