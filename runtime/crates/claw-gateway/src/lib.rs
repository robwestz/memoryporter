//! claw-gateway library — router and handlers, usable from tests.

use axum::{
    extract::{
        ws::{Message as WsMessage, WebSocket, WebSocketUpgrade},
        Path, Query, State,
    },
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Json},
    routing::{delete, get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Command as ProcessCommand;
use std::sync::Arc;
use tower_http::cors::CorsLayer;

pub mod persistence;
pub mod state;
use state::*;

// ── Router ────────────────────────────────────────────────

pub fn build_router(app_state: Arc<AppState>) -> Router {
    Router::new()
        // Health
        .route("/health", get(health))
        .route("/api/status", get(api_status))
        // Agent
        .route("/api/agent/turn", post(agent_turn))
        .route("/api/agent/session/:id", get(agent_session))
        .route("/api/agent/doctor", post(agent_doctor))
        // Knowledge
        .route("/api/knowledge/search", get(knowledge_search))
        .route("/api/knowledge/gamechangers", get(knowledge_gamechangers))
        .route("/api/knowledge/skills", get(knowledge_skills))
        .route("/api/knowledge/summary", get(knowledge_summary))
        // Schedule
        .route("/api/schedule", get(schedule_list).post(schedule_create))
        .route("/api/schedules/:id", delete(schedule_cancel))
        // WebSocket
        .route("/ws", get(ws_handler))
        .layer(CorsLayer::permissive())
        .with_state(app_state)
}

// ── Health ────────────────────────────────────────────────

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "version": "0.1.0",
        "uptime_secs": 0,
    }))
}

async fn api_status(State(state): State<Arc<AppState>>) -> Json<serde_json::Value> {
    let sessions = state.sessions.lock().unwrap();
    let schedules = state.schedules.lock().unwrap();
    Json(serde_json::json!({
        "active_sessions": sessions.len(),
        "scheduled_tasks": schedules.len(),
        "knowledge_loaded": state.knowledge_path.is_some(),
    }))
}

// ── Agent ─────────────────────────────────────────────────

#[derive(Deserialize)]
struct TurnRequest {
    message: String,
    session_id: Option<String>,
    model: Option<String>,
}

#[derive(Serialize)]
struct TurnResponse {
    session_id: String,
    text: String,
    tool_calls: Vec<ToolCallInfo>,
    usage: UsageInfo,
    stop_reason: String,
}

#[derive(Serialize)]
struct ToolCallInfo {
    name: String,
    input_preview: String,
}

#[derive(Serialize)]
struct UsageInfo {
    input_tokens: u64,
    output_tokens: u64,
}

async fn agent_turn(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(req): Json<TurnRequest>,
) -> Result<Json<TurnResponse>, (StatusCode, String)> {
    state.check_auth(&headers)?;

    let session_id = req.session_id.unwrap_or_else(|| format!("s-{}", rand_id()));
    let model = req.model.unwrap_or_else(|| "sonnet".into());

    // Shell out to ob1 for now — later: in-process runtime
    let ob1_bin = state.ob1_path();
    let output = tokio::task::spawn_blocking(move || {
        ProcessCommand::new(&ob1_bin)
            .args(["-m", &model, "-p", &req.message])
            .output()
    })
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("Spawn error: {}", e)))?
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, format!("ob1 error: {}", e)))?;

    let text = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    // Parse tool call count from stderr hints
    let tool_calls: Vec<ToolCallInfo> = if stderr.contains("tool calls") {
        vec![ToolCallInfo { name: "(see full output)".into(), input_preview: "...".into() }]
    } else {
        vec![]
    };

    {
        let mut sessions = state.sessions.lock().unwrap();
        let prev_count = sessions.get(&session_id).map(|s| s.turn_count).unwrap_or(0);
        sessions.insert(session_id.clone(), SessionRecord {
            id: session_id.clone(),
            last_message: text.chars().take(200).collect(),
            turn_count: prev_count + 1,
        });
    } // release lock before saving
    state.save_sessions();

    Ok(Json(TurnResponse {
        session_id,
        text,
        tool_calls,
        usage: UsageInfo { input_tokens: 0, output_tokens: 0 },
        stop_reason: if output.status.success() { "end_turn".into() } else { "error".into() },
    }))
}

async fn agent_session(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let sessions = state.sessions.lock().unwrap();
    match sessions.get(&id) {
        Some(s) => Ok(Json(serde_json::json!(s))),
        None => Err(StatusCode::NOT_FOUND),
    }
}

async fn agent_doctor(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    state.check_auth(&headers)?;
    let checks = vec![
        check_binary("ob1", &state.ob1_path()),
        check_binary("snowball-mcp", &state.snowball_mcp_path()),
        check_env("ANTHROPIC_API_KEY"),
    ];
    let all_ok = checks.iter().all(|c| c["status"] == "ok");
    Ok(Json(serde_json::json!({
        "healthy": all_ok,
        "checks": checks,
    })))
}

fn check_binary(name: &str, path: &str) -> serde_json::Value {
    let exists = std::path::Path::new(path).exists();
    serde_json::json!({
        "name": name,
        "path": path,
        "status": if exists { "ok" } else { "missing" },
    })
}

fn check_env(name: &str) -> serde_json::Value {
    let set = std::env::var(name).is_ok();
    serde_json::json!({
        "name": name,
        "status": if set { "ok" } else { "not_set" },
    })
}

// ── Knowledge ─────────────────────────────────────────────

#[derive(Deserialize)]
struct SearchQuery {
    q: String,
}

async fn knowledge_search(
    State(state): State<Arc<AppState>>,
    Query(params): Query<SearchQuery>,
) -> Json<serde_json::Value> {
    let kb = state.load_knowledge_base();
    let query = params.q.to_lowercase();
    let results: Vec<&serde_json::Value> = kb.iter()
        .filter(|item| {
            let text = item.to_string().to_lowercase();
            text.contains(&query)
        })
        .take(20)
        .collect();
    Json(serde_json::json!({ "query": params.q, "count": results.len(), "results": results }))
}

async fn knowledge_gamechangers(State(state): State<Arc<AppState>>) -> Json<serde_json::Value> {
    let kb = state.load_knowledge_base();
    let gcs: Vec<&serde_json::Value> = kb.iter()
        .filter(|item| item.get("category").and_then(|c| c.as_str()) == Some("gamechanger"))
        .collect();
    Json(serde_json::json!({ "count": gcs.len(), "gamechangers": gcs }))
}

async fn knowledge_skills(State(state): State<Arc<AppState>>) -> Json<serde_json::Value> {
    let kb = state.load_knowledge_base();
    let skills: Vec<&serde_json::Value> = kb.iter()
        .filter(|item| item.get("category").and_then(|c| c.as_str()) == Some("skill"))
        .collect();
    Json(serde_json::json!({ "count": skills.len(), "skills": skills }))
}

async fn knowledge_summary(State(state): State<Arc<AppState>>) -> Json<serde_json::Value> {
    let kb = state.load_knowledge_base();
    let mut categories: HashMap<String, usize> = HashMap::new();
    for item in &kb {
        let cat = item.get("category").and_then(|c| c.as_str()).unwrap_or("unknown");
        *categories.entry(cat.into()).or_default() += 1;
    }
    Json(serde_json::json!({
        "total_facts": kb.len(),
        "categories": categories,
        "knowledge_path": state.knowledge_path,
    }))
}

// ── Schedule ──────────────────────────────────────────────

#[derive(Deserialize)]
struct ScheduleRequest {
    name: String,
    cron: String,
    command: String,
}

async fn schedule_create(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(req): Json<ScheduleRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    state.check_auth(&headers)?;
    let id = format!("sched-{}", rand_id());
    let record = ScheduleRecord {
        id: id.clone(),
        name: req.name,
        cron: req.cron,
        command: req.command,
        enabled: true,
    };
    {
        let mut schedules = state.schedules.lock().unwrap();
        schedules.insert(id.clone(), record);
    } // release lock before saving
    state.save_schedules();
    Ok(Json(serde_json::json!({ "id": id, "status": "created" })))
}

async fn schedule_list(State(state): State<Arc<AppState>>) -> Json<serde_json::Value> {
    let schedules = state.schedules.lock().unwrap();
    let list: Vec<&ScheduleRecord> = schedules.values().collect();
    Json(serde_json::json!({ "count": list.len(), "schedules": list }))
}

async fn schedule_cancel(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
    state.check_auth(&headers)?;
    let removed = {
        let mut schedules = state.schedules.lock().unwrap();
        schedules.remove(&id).is_some()
    }; // release lock before saving
    if removed {
        state.save_schedules();
        Ok(Json(serde_json::json!({ "id": id, "status": "cancelled" })))
    } else {
        Err((StatusCode::NOT_FOUND, format!("Schedule {} not found", id)))
    }
}

// ── WebSocket ────────────────────────────────────────────

#[derive(Deserialize)]
struct WsQuery {
    key: Option<String>,
}

async fn ws_handler(
    State(state): State<Arc<AppState>>,
    Query(params): Query<WsQuery>,
    ws: WebSocketUpgrade,
) -> impl IntoResponse {
    // Auth check via query param
    if let Some(ref required_key) = state.api_key {
        match &params.key {
            Some(k) if k == required_key => {}
            _ => {
                return (StatusCode::UNAUTHORIZED, "Missing or invalid key").into_response();
            }
        }
    }

    ws.on_upgrade(move |socket| handle_ws(socket, state))
}

async fn handle_ws(mut socket: WebSocket, state: Arc<AppState>) {
    let session_id = format!("ws-{}", rand_id());

    // Register session
    {
        let mut sessions = state.sessions.lock().unwrap();
        sessions.insert(session_id.clone(), SessionRecord {
            id: session_id.clone(),
            last_message: "(websocket)".into(),
            turn_count: 0,
        });
    }
    state.save_sessions();

    // Send welcome
    let welcome = serde_json::json!({
        "type": "connected",
        "session_id": &session_id,
    });
    if socket.send(WsMessage::Text(welcome.to_string().into())).await.is_err() {
        return;
    }

    // Message loop
    while let Some(Ok(msg)) = socket.recv().await {
        match msg {
            WsMessage::Text(text) => {
                let parsed: serde_json::Value = match serde_json::from_str(&text) {
                    Ok(v) => v,
                    Err(_) => {
                        let err = serde_json::json!({
                            "type": "error",
                            "content": "Invalid JSON",
                        });
                        let _ = socket.send(WsMessage::Text(err.to_string().into())).await;
                        continue;
                    }
                };

                let user_msg = parsed.get("message")
                    .and_then(|m| m.as_str())
                    .unwrap_or("");

                // Update session
                {
                    let mut sessions = state.sessions.lock().unwrap();
                    if let Some(s) = sessions.get_mut(&session_id) {
                        s.turn_count += 1;
                        s.last_message = user_msg.chars().take(200).collect();
                    }
                }

                // Echo response (in production: route to ob1 runtime)
                let response = serde_json::json!({
                    "role": "assistant",
                    "content": format!("echo: {}", user_msg),
                    "session_id": &session_id,
                });
                if socket.send(WsMessage::Text(response.to_string().into())).await.is_err() {
                    break;
                }
            }
            WsMessage::Close(_) => break,
            _ => {}
        }
    }

    // Cleanup session
    {
        let mut sessions = state.sessions.lock().unwrap();
        sessions.remove(&session_id);
    }
    state.save_sessions();
}

// ── Helpers ───────────────────────────────────────────────

pub fn rand_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let n = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
    format!("{:x}", n % 0xFFFFFFFF)
}
