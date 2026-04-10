//! ob1 — 18-primitive agentic CLI
//!
//! Usage:
//!   ob1                           Interactive REPL
//!   ob1 -p "fix the bug"          One-shot
//!   ob1 --model sonnet -p "..."   With model

use ob1_runtime::anthropic::{AnthropicApiClient, resolve_model};
// boot::BootConfig used internally by RuntimeConfig
use ob1_runtime::budget::BudgetConfig;
use ob1_runtime::permissions::PermissionMode;
use ob1_runtime::registry::{SideEffectProfile, SourceType, ToolSpec};
use ob1_runtime::runtime::{ConversationRuntime, RuntimeConfig};
use ob1_runtime::session::SessionFile;
use ob1_runtime::tools::BasicToolExecutor;
use std::io::{self, BufRead, Write};

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let mut model = "sonnet".to_string();
    let mut prompt: Option<String> = None;
    let mut session_path: Option<String> = None;
    let mut resume_path: Option<String> = None;

    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--model" | "-m" => { i += 1; if i < args.len() { model = args[i].clone(); } }
            "-p" | "--prompt" => { i += 1; if i < args.len() { prompt = Some(args[i].clone()); } }
            "--session" => { i += 1; if i < args.len() { session_path = Some(args[i].clone()); } }
            "--resume" => { i += 1; if i < args.len() { resume_path = Some(args[i].clone()); } }
            "--version" | "-V" => { println!("ob1 0.1.0 (18 primitives)"); return; }
            "--help" | "-h" => { print_help(); return; }
            other if !other.starts_with('-') && prompt.is_none() => { prompt = Some(other.into()); }
            _ => {}
        }
        i += 1;
    }

    let resolved = resolve_model(&model);
    let api = match AnthropicApiClient::from_env(&resolved) {
        Ok(c) => c.with_max_tokens(16384),
        Err(e) => { eprintln!("Error: {}\nSet ANTHROPIC_API_KEY.", e); std::process::exit(1); }
    };

    let tools = BasicToolExecutor::new();
    let registry = build_registry();

    let cwd = std::env::current_dir().map(|p| p.display().to_string()).unwrap_or(".".into());
    let config = RuntimeConfig {
        model: resolved.clone(),
        system_prompt: vec![
            "You are a helpful coding assistant with 18 infrastructure primitives: tool registry, permissions, session persistence, workflow state, token budget, streaming events, system logging, verification, tool pool assembly, compaction, audit trail, doctor, staged boot, stop reasons, provenance, agent types, memory, and skills.".into(),
            format!("Working directory: {}", cwd),
        ],
        budget: BudgetConfig { max_budget_tokens: 200_000, ..Default::default() },
        ..Default::default()
    };

    let mut runtime = ConversationRuntime::new(config, api, tools, registry);

    // Session persistence: --resume loads existing, --session starts fresh with auto-save
    let sf_path = resume_path.or(session_path);
    if let Some(ref path) = sf_path {
        let sf = SessionFile::new(path);
        if std::path::Path::new(path).exists() {
            match sf.load() {
                Ok(mut session) => {
                    session.reconstruct_usage();
                    eprintln!("Resumed session {} ({} messages, {} turns)",
                        session.session_id, session.messages.len(), session.turn_count);
                    runtime.session = session;
                }
                Err(e) => {
                    eprintln!("Warning: could not load {}: {}", path, e);
                }
            }
        }
        runtime.session_file = Some(sf);
    }

    runtime.boot();

    match prompt {
        Some(p) => oneshot(&mut runtime, &p),
        None => repl(&mut runtime, &resolved),
    }
}

fn oneshot(rt: &mut ConversationRuntime<AnthropicApiClient, BasicToolExecutor>, prompt: &str) {
    let result = rt.run_turn(prompt);
    println!("{}", result.assistant_text);
    if !result.tool_calls.is_empty() {
        eprintln!("  [{} tool calls]", result.tool_calls.len());
    }
    eprintln!("  [stop: {:?}]", result.stop_reason);
}

fn repl(rt: &mut ConversationRuntime<AnthropicApiClient, BasicToolExecutor>, model: &str) {
    println!("ob1 0.1.0 — {} — /help /status /quit", model);
    let stdin = io::stdin();
    let mut stdout = io::stdout();

    loop {
        print!("> ");
        stdout.flush().unwrap();
        let mut input = String::new();
        if stdin.lock().read_line(&mut input).unwrap() == 0 { break; }
        let trimmed = input.trim();
        if trimmed.is_empty() { continue; }

        match trimmed {
            "/quit" | "/q" => break,
            "/help" => { println!("/quit /status /cost /doctor /save <path> /clear"); continue; }
            "/status" => {
                println!("Turns: {} | Budget: {}% remaining", rt.budget.turn_count, rt.budget.remaining_pct());
                println!("Events: {} | Audit: {} entries", rt.events.count(), rt.audit.total());
                continue;
            }
            "/cost" => {
                println!("Input: {} tokens | Output: {} tokens",
                    rt.budget.total_input_tokens, rt.budget.total_output_tokens);
                continue;
            }
            "/doctor" => {
                let doc = ob1_runtime::doctor::Doctor::new();
                let report = doc.diagnose();
                println!("{}", report.to_markdown());
                continue;
            }
            "/clear" => {
                rt.session = ob1_runtime::session::Session::new("new");
                println!("Session cleared.");
                continue;
            }
            cmd if cmd.starts_with("/save ") => {
                let path = cmd.trim_start_matches("/save ").trim();
                match rt.session.save(std::path::Path::new(path)) {
                    Ok(()) => println!("Saved to {}", path),
                    Err(e) => eprintln!("Save failed: {}", e),
                }
                continue;
            }
            _ => {}
        }

        eprint!("thinking...");
        let result = rt.run_turn(trimmed);
        eprint!("\r            \r");
        println!("{}", result.assistant_text);
        if !result.tool_calls.is_empty() {
            eprintln!("  [{} tool calls]", result.tool_calls.len());
        }
        if !result.denials.is_empty() {
            for d in &result.denials { eprintln!("  [denied: {}]", d); }
        }
        println!();
    }
}

fn build_registry() -> ob1_runtime::registry::ToolRegistry {
    let mut reg = ob1_runtime::registry::ToolRegistry::new();
    let tools = [
        ("bash", "Execute a shell command", PermissionMode::DangerFullAccess, true, false),
        ("read_file", "Read a file with line numbers", PermissionMode::ReadOnly, false, false),
        ("write_file", "Write content to a file", PermissionMode::WorkspaceWrite, true, false),
        ("edit_file", "Replace text in a file", PermissionMode::WorkspaceWrite, true, false),
        ("glob_search", "Find files by pattern", PermissionMode::ReadOnly, false, false),
        ("grep_search", "Search file contents", PermissionMode::ReadOnly, false, false),
    ];
    for (name, desc, perm, writes, destructive) in tools {
        reg.register(ToolSpec {
            name: name.into(),
            description: desc.into(),
            source_type: SourceType::BuiltIn,
            required_permission: perm,
            input_schema: serde_json::json!({"type": "object"}),
            side_effects: SideEffectProfile { writes_files: writes, destructive, ..Default::default() },
            enabled: true,
            aliases: vec![],
        });
    }
    reg
}

fn print_help() {
    println!("ob1 — 18-primitive agentic CLI\n\nUSAGE:\n  ob1                           REPL\n  ob1 -p \"...\"                  One-shot\n  ob1 --session sess.json       Auto-save session to file\n  ob1 --resume sess.json        Resume from saved session\n\nOPTIONS:\n  -m, --model    Model (opus/sonnet/haiku)\n  -p, --prompt   One-shot prompt\n  --session      Auto-save session to file (new or existing)\n  --resume       Load and continue from saved session file\n  -V, --version  Version\n  -h, --help     Help\n\nREPL:\n  /status /cost /doctor /save /clear /quit");
}
