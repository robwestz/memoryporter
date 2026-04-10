//! Integration tests for claw-gateway using axum's in-process test utilities.
//!
//! Tests use `tower::ServiceExt::oneshot` to send requests directly through
//! the router without binding a port.

use axum::{
    body::Body,
    http::{Request, StatusCode, header},
};
use http_body_util::BodyExt;
use std::sync::Arc;
use tower::ServiceExt;

use claw_gateway::{build_router, state::AppState};

// ── Helpers ───────────────────────────────────────────────────────────────────

/// Create an AppState with a unique fresh temp data dir (no persisted state).
fn isolated_state(api_key: Option<String>) -> Arc<AppState> {
    use std::sync::atomic::{AtomicU64, Ordering};
    use std::time::{SystemTime, UNIX_EPOCH};
    static COUNTER: AtomicU64 = AtomicU64::new(0);
    let n = COUNTER.fetch_add(1, Ordering::SeqCst);
    let ts = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
    let dir = std::env::temp_dir().join(format!("claw-gw-{}-{}", ts, n));
    // Ensure completely fresh — no leftover data from prior runs
    let _ = std::fs::remove_dir_all(&dir);
    let _ = std::fs::create_dir_all(&dir);
    Arc::new(AppState::with_data_dir(api_key, dir))
}

/// Build a router backed by an `AppState` with no API key (auth disabled).
fn app_no_auth() -> axum::Router {
    build_router(isolated_state(None))
}

/// Build a router backed by an `AppState` with the given API key.
fn app_with_auth(key: &str) -> axum::Router {
    build_router(isolated_state(Some(key.to_string())))
}

/// Collect the full body of a response into a `String`.
async fn body_string(body: axum::body::Body) -> String {
    let bytes = body.collect().await.unwrap().to_bytes();
    String::from_utf8_lossy(&bytes).to_string()
}

/// Parse the full response body as `serde_json::Value`.
async fn body_json(body: axum::body::Body) -> serde_json::Value {
    let text = body_string(body).await;
    serde_json::from_str(&text).expect("response body is valid JSON")
}

/// Build a simple GET request.
fn get(uri: &str) -> Request<Body> {
    Request::builder()
        .method("GET")
        .uri(uri)
        .body(Body::empty())
        .unwrap()
}

/// Build a POST request with a JSON body.
fn post_json(uri: &str, body: serde_json::Value) -> Request<Body> {
    Request::builder()
        .method("POST")
        .uri(uri)
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(body.to_string()))
        .unwrap()
}

/// Build a POST request with a JSON body and an `x-api-key` header.
fn post_json_authed(uri: &str, body: serde_json::Value, key: &str) -> Request<Body> {
    Request::builder()
        .method("POST")
        .uri(uri)
        .header(header::CONTENT_TYPE, "application/json")
        .header("x-api-key", key)
        .body(Body::from(body.to_string()))
        .unwrap()
}

// ── /health ───────────────────────────────────────────────────────────────────

#[tokio::test]
async fn health_returns_200() {
    let response = app_no_auth().oneshot(get("/health")).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn health_returns_status_ok() {
    let response = app_no_auth().oneshot(get("/health")).await.unwrap();
    let json = body_json(response.into_body()).await;
    assert_eq!(json["status"], "ok");
}

#[tokio::test]
async fn health_contains_version() {
    let response = app_no_auth().oneshot(get("/health")).await.unwrap();
    let json = body_json(response.into_body()).await;
    assert!(json["version"].is_string(), "expected a version field");
}

// ── /api/status ───────────────────────────────────────────────────────────────

#[tokio::test]
async fn api_status_returns_200() {
    let response = app_no_auth().oneshot(get("/api/status")).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn api_status_has_expected_fields() {
    let response = app_no_auth().oneshot(get("/api/status")).await.unwrap();
    let json = body_json(response.into_body()).await;
    assert!(json["active_sessions"].is_number(), "expected active_sessions");
    assert!(json["scheduled_tasks"].is_number(), "expected scheduled_tasks");
    assert!(json.get("knowledge_loaded").is_some(), "expected knowledge_loaded");
}

#[tokio::test]
async fn api_status_starts_with_zero_sessions_and_schedules() {
    let state = isolated_state(None);
    let app = build_router(state);
    let response = app.oneshot(get("/api/status")).await.unwrap();
    let status = response.status();
    let text = body_string(response.into_body()).await;
    assert_eq!(status, StatusCode::OK, "status endpoint returned {} body: '{}'", status, text);
    let json: serde_json::Value = serde_json::from_str(&text).unwrap();
    assert_eq!(json["active_sessions"], 0, "fresh state: {}", json);
    assert_eq!(json["scheduled_tasks"], 0, "fresh state: {}", json);
}

// ── /api/agent/doctor ─────────────────────────────────────────────────────────

#[tokio::test]
async fn doctor_returns_200_without_auth() {
    // When no API key is configured, doctor should succeed.
    let response = app_no_auth()
        .oneshot(post_json("/api/agent/doctor", serde_json::json!({})))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn doctor_returns_checks_array() {
    let response = app_no_auth()
        .oneshot(post_json("/api/agent/doctor", serde_json::json!({})))
        .await
        .unwrap();
    let json = body_json(response.into_body()).await;
    assert!(json["checks"].is_array(), "expected checks array");
    assert!(json.get("healthy").is_some(), "expected healthy field");
}

#[tokio::test]
async fn doctor_with_valid_auth_returns_200() {
    const KEY: &str = "test-secret";
    let response = app_with_auth(KEY)
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/agent/doctor")
                .header(header::CONTENT_TYPE, "application/json")
                .header("x-api-key", KEY)
                .body(Body::from("{}"))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn doctor_without_auth_key_returns_401_when_key_configured() {
    const KEY: &str = "test-secret";
    let response = app_with_auth(KEY)
        .oneshot(post_json("/api/agent/doctor", serde_json::json!({})))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

// ── /api/knowledge/* ──────────────────────────────────────────────────────────

#[tokio::test]
async fn knowledge_search_returns_results_array() {
    let response = app_no_auth()
        .oneshot(get("/api/knowledge/search?q=test"))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let json = body_json(response.into_body()).await;
    assert!(json["results"].is_array(), "expected results array");
    assert!(json["count"].is_number(), "expected count");
    assert_eq!(json["query"], "test");
}

#[tokio::test]
async fn knowledge_gamechangers_returns_array() {
    let response = app_no_auth()
        .oneshot(get("/api/knowledge/gamechangers"))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let json = body_json(response.into_body()).await;
    assert!(json["gamechangers"].is_array(), "expected gamechangers array");
    assert!(json["count"].is_number(), "expected count");
}

#[tokio::test]
async fn knowledge_skills_returns_array() {
    let response = app_no_auth()
        .oneshot(get("/api/knowledge/skills"))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let json = body_json(response.into_body()).await;
    assert!(json["skills"].is_array(), "expected skills array");
    assert!(json["count"].is_number(), "expected count");
}

#[tokio::test]
async fn knowledge_summary_has_expected_shape() {
    let response = app_no_auth()
        .oneshot(get("/api/knowledge/summary"))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let json = body_json(response.into_body()).await;
    assert!(json["total_facts"].is_number(), "expected total_facts");
    assert!(json["categories"].is_object(), "expected categories object");
}

// ── /api/schedule ─────────────────────────────────────────────────────────────

#[tokio::test]
async fn schedule_list_returns_200() {
    let response = app_no_auth().oneshot(get("/api/schedule")).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let json = body_json(response.into_body()).await;
    assert!(json["schedules"].is_array(), "expected schedules array");
    assert!(json["count"].is_number(), "expected count");
}

#[tokio::test]
async fn schedule_create_returns_id_and_status() {
    let body = serde_json::json!({
        "name": "nightly-summary",
        "cron": "0 2 * * *",
        "command": "ob1 -p summarize"
    });
    let response = app_no_auth()
        .oneshot(post_json("/api/schedule", body))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let json = body_json(response.into_body()).await;
    assert!(json["id"].is_string(), "expected id string");
    assert_eq!(json["status"], "created");
}

#[tokio::test]
async fn schedule_create_increments_count() {
    let state = isolated_state(None);
    let app = || build_router(Arc::clone(&state));

    let body = serde_json::json!({
        "name": "hourly-ping",
        "cron": "0 * * * *",
        "command": "echo ping"
    });

    // Create one schedule.
    let _ = app()
        .oneshot(post_json("/api/schedule", body))
        .await
        .unwrap();

    // Now the list should report count=1.
    let list_resp = app().oneshot(get("/api/schedule")).await.unwrap();
    let json = body_json(list_resp.into_body()).await;
    assert_eq!(json["count"], 1, "expected 1 schedule after creation");
}

#[tokio::test]
async fn schedule_delete_cancels_existing() {
    let state = isolated_state(None);

    // Create schedule, capture its id.
    let create_body = serde_json::json!({
        "name": "to-be-deleted",
        "cron": "0 0 * * *",
        "command": "echo bye"
    });
    let create_resp = build_router(Arc::clone(&state))
        .oneshot(post_json("/api/schedule", create_body))
        .await
        .unwrap();
    assert_eq!(create_resp.status(), StatusCode::OK, "schedule create should return 200");
    let create_json = body_json(create_resp.into_body()).await;
    let id = create_json["id"].as_str().expect("id must be a string").to_string();

    // Verify the schedule is listed before deletion.
    let pre_list = build_router(Arc::clone(&state))
        .oneshot(get("/api/schedule"))
        .await
        .unwrap();
    let pre_list_json = body_json(pre_list.into_body()).await;
    let count_before = pre_list_json["count"].as_u64().unwrap_or(0);
    assert!(
        count_before >= 1,
        "schedule must appear in list before delete, got: {}",
        pre_list_json
    );

    // Also verify in-memory state directly
    let in_mem = state.schedules.lock().unwrap();
    assert!(in_mem.contains_key(&id), "schedule {} not in state map, keys: {:?}", id, in_mem.keys().collect::<Vec<_>>());
    drop(in_mem);

    // Delete it.
    let delete_uri = format!("/api/schedules/{}", id);
    let del_resp = build_router(Arc::clone(&state))
        .oneshot(
            Request::builder()
                .method("DELETE")
                .uri(&delete_uri)
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    let del_status = del_resp.status();
    let del_body_str = body_string(del_resp.into_body()).await;
    assert!(
        del_status == StatusCode::OK,
        "DELETE /api/schedules/{} should return 200, got {} body: '{}'",
        id, del_status, del_body_str
    );

    // List should no longer contain the deleted schedule.
    let list_resp = build_router(Arc::clone(&state))
        .oneshot(get("/api/schedule"))
        .await
        .unwrap();
    let list_json = body_json(list_resp.into_body()).await;
    let remaining = list_json["schedules"]
        .as_array()
        .map(|arr| arr.iter().any(|s| s["id"] == id))
        .unwrap_or(false);
    assert!(!remaining, "deleted schedule should not appear in list");
}

#[tokio::test]
async fn schedule_delete_unknown_id_returns_404() {
    let response = app_no_auth()
        .oneshot(
            Request::builder()
                .method("DELETE")
                .uri("/api/schedules/does-not-exist")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

// ── Auth ─────────────────────────────────────────────────────────────────────

#[tokio::test]
async fn auth_correct_key_allows_access() {
    const KEY: &str = "my-secret-key";
    let body = serde_json::json!({
        "name": "auth-test",
        "cron": "* * * * *",
        "command": "echo ok"
    });
    let response = app_with_auth(KEY)
        .oneshot(post_json_authed("/api/schedule", body, KEY))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn auth_wrong_key_returns_401() {
    const KEY: &str = "correct-key";
    let body = serde_json::json!({
        "name": "auth-test",
        "cron": "* * * * *",
        "command": "echo ok"
    });
    let response = app_with_auth(KEY)
        .oneshot(post_json_authed("/api/schedule", body, "wrong-key"))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn auth_missing_key_returns_401() {
    const KEY: &str = "required-key";
    let body = serde_json::json!({
        "name": "auth-test",
        "cron": "* * * * *",
        "command": "echo ok"
    });
    let response = app_with_auth(KEY)
        .oneshot(post_json("/api/schedule", body))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn auth_bearer_token_accepted() {
    const KEY: &str = "bearer-key";
    let body = serde_json::json!({
        "name": "bearer-test",
        "cron": "0 * * * *",
        "command": "echo bearer"
    });
    let response = app_with_auth(KEY)
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/schedule")
                .header(header::CONTENT_TYPE, "application/json")
                .header(header::AUTHORIZATION, format!("Bearer {}", KEY))
                .body(Body::from(body.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn no_auth_configured_allows_unauthenticated_access() {
    // When GATEWAY_API_KEY is not set, auth-gated endpoints must be open.
    let body = serde_json::json!({
        "name": "open-access",
        "cron": "0 0 * * *",
        "command": "echo open"
    });
    let response = app_no_auth()
        .oneshot(post_json("/api/schedule", body))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}

// ── Agent session ─────────────────────────────────────────────────────────────

#[tokio::test]
async fn agent_session_unknown_id_returns_404() {
    let response = app_no_auth()
        .oneshot(get("/api/agent/session/nonexistent-session-id"))
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}
