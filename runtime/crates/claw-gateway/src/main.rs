//! claw-gateway — Unified API for agentic platform.
//!
//! Same binary runs on Mac (local) and Digital Ocean (cloud).
//! Bridges Windows PC → agent runtimes (ob1, OpenClaw) + MCP servers.
//!
//! Usage:
//!   claw-gateway                          # localhost:8080
//!   claw-gateway --bind 0.0.0.0 --port 8080
//!   GATEWAY_API_KEY=secret claw-gateway   # with auth

use claw_gateway::{build_router, state::AppState};
use std::sync::Arc;

#[tokio::main]
async fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let mut bind = "127.0.0.1".to_string();
    let mut port: u16 = 8080;

    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--bind" | "-b" => { i += 1; if i < args.len() { bind = args[i].clone(); } }
            "--port" | "-p" => { i += 1; if i < args.len() { port = args[i].parse().unwrap_or(8080); } }
            "--version" | "-V" => { println!("claw-gateway 0.1.0"); return; }
            "--help" | "-h" => { print_help(); return; }
            _ => {}
        }
        i += 1;
    }

    let api_key = std::env::var("GATEWAY_API_KEY").ok();
    let app_state = Arc::new(AppState::new(api_key));

    let app = build_router(app_state);

    let addr = format!("{}:{}", bind, port);
    println!("claw-gateway 0.1.0 listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

fn print_help() {
    println!("claw-gateway 0.1.0 — Unified API for agentic platform\n");
    println!("USAGE:");
    println!("  claw-gateway [OPTIONS]\n");
    println!("OPTIONS:");
    println!("  -b, --bind <ADDR>    Bind address (default: 127.0.0.1)");
    println!("  -p, --port <PORT>    Port (default: 8080)");
    println!("  -V, --version        Version");
    println!("  -h, --help           Help\n");
    println!("ENVIRONMENT:");
    println!("  GATEWAY_API_KEY      API key for auth (optional)");
    println!("  ANTHROPIC_API_KEY    For ob1 agent runtime");
    println!("  KNOWLEDGE_PATH       Path to knowledge_base.json");
    println!("  OB1_PATH             Path to ob1 binary");
    println!("  SNOWBALL_MCP_PATH    Path to snowball-mcp binary\n");
    println!("ENDPOINTS:");
    println!("  GET  /health                     Health check");
    println!("  GET  /api/status                 Gateway status");
    println!("  POST /api/agent/turn             Send message to agent");
    println!("  GET  /api/agent/session/:id      Get session");
    println!("  POST /api/agent/doctor           Run health check");
    println!("  GET  /api/knowledge/search?q=    Search knowledge base");
    println!("  GET  /api/knowledge/gamechangers List gamechangers");
    println!("  GET  /api/knowledge/skills       List skills");
    println!("  GET  /api/knowledge/summary      Stats");
    println!("  POST /api/schedule               Create scheduled task");
    println!("  GET  /api/schedule               List scheduled tasks");
    println!("  DEL  /api/schedule/:id           Cancel task");
}
