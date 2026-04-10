//! claw-mini — Minimal agentic CLI powered by mini-runtime.
//!
//! Usage:
//!   claw-mini                          Interactive REPL
//!   claw-mini -p "prompt"              One-shot prompt
//!   claw-mini --model sonnet -p "..."  With model selection
//!
//! Requires: ANTHROPIC_API_KEY environment variable.

use mini_runtime::*;
use mini_runtime::anthropic::{AnthropicClient, resolve_model};
use mini_runtime::tools::{BasicToolExecutor, tool_permission};
use std::io::{self, BufRead, Write};

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();

    let mut model = "sonnet".to_string();
    let mut prompt: Option<String> = None;
    let mut permission_mode = PermissionMode::DangerFullAccess;

    // Parse args
    let mut i = 0;
    while i < args.len() {
        match args[i].as_str() {
            "--model" | "-m" => {
                i += 1;
                if i < args.len() {
                    model = args[i].clone();
                }
            }
            "-p" | "--prompt" => {
                i += 1;
                if i < args.len() {
                    prompt = Some(args[i].clone());
                }
            }
            "--read-only" => {
                permission_mode = PermissionMode::ReadOnly;
            }
            "--workspace-write" => {
                permission_mode = PermissionMode::WorkspaceWrite;
            }
            "--version" | "-V" => {
                println!("claw-mini 0.1.0 (mini-runtime)");
                return;
            }
            "--help" | "-h" => {
                print_help();
                return;
            }
            other => {
                // Treat as prompt if no flag
                if prompt.is_none() && !other.starts_with('-') {
                    prompt = Some(other.to_string());
                }
            }
        }
        i += 1;
    }

    let resolved_model = resolve_model(&model);

    // Build runtime
    let api_client = match AnthropicClient::new(&resolved_model) {
        Ok(c) => c.with_max_tokens(16384),
        Err(e) => {
            eprintln!("Error: {}", e);
            eprintln!("Set ANTHROPIC_API_KEY environment variable.");
            std::process::exit(1);
        }
    };

    let tool_executor = BasicToolExecutor::new();

    // Build permission policy from tool requirements
    let mut policy = PermissionPolicy::new(permission_mode);
    for def in tool_executor.tool_definitions() {
        policy = policy.with_tool(&def.name, tool_permission(&def.name));
    }

    let cwd = std::env::current_dir()
        .map(|p| p.display().to_string())
        .unwrap_or_else(|_| ".".into());

    let system_prompt = vec![
        "You are a helpful coding assistant. You have access to tools for reading, writing, and searching files, and executing bash commands.".into(),
        format!("Working directory: {}", cwd),
        format!("Permission mode: {}", permission_mode.label()),
    ];

    let mut runtime = ConversationRuntime::new(api_client, tool_executor, policy, system_prompt)
        .with_max_iterations(32)
        .with_compaction(CompactionConfig {
            input_token_threshold: 200_000,
            preserve_recent: 6,
        });

    // One-shot or REPL
    match prompt {
        Some(p) => {
            run_oneshot(&mut runtime, &p);
        }
        None => {
            run_repl(&mut runtime, &resolved_model);
        }
    }
}

fn run_oneshot(runtime: &mut ConversationRuntime<AnthropicClient, BasicToolExecutor>, prompt: &str) {
    match runtime.run_turn(prompt) {
        Ok(summary) => {
            println!("{}", summary.final_text);
            eprintln!(
                "\n--- {} iterations, {} tool calls, ~${:.4} ---",
                summary.iterations,
                summary.tool_calls,
                summary.usage.estimated_cost_usd()
            );
        }
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}

fn run_repl(runtime: &mut ConversationRuntime<AnthropicClient, BasicToolExecutor>, model: &str) {
    println!("claw-mini 0.1.0 — {} — type /help or /quit", model);
    println!();

    let stdin = io::stdin();
    let mut stdout = io::stdout();

    loop {
        print!("> ");
        stdout.flush().unwrap();

        let mut input = String::new();
        if stdin.lock().read_line(&mut input).unwrap() == 0 {
            break; // EOF
        }

        let trimmed = input.trim();
        if trimmed.is_empty() {
            continue;
        }

        // Slash commands
        match trimmed {
            "/quit" | "/exit" | "/q" => break,
            "/help" | "/h" => {
                println!("Commands: /quit, /status, /cost, /save <path>, /clear, /help");
                continue;
            }
            "/status" => {
                let usage = runtime.usage();
                println!(
                    "Turns: {} | Input: {}k | Output: {}k | Cost: ~${:.4}",
                    usage.turns,
                    usage.cumulative.input_tokens / 1000,
                    usage.cumulative.output_tokens / 1000,
                    usage.estimated_cost_usd()
                );
                continue;
            }
            "/cost" => {
                let usage = runtime.usage();
                println!("Estimated cost: ${:.4}", usage.estimated_cost_usd());
                println!(
                    "  Input:  {} tokens",
                    usage.cumulative.input_tokens
                );
                println!(
                    "  Output: {} tokens",
                    usage.cumulative.output_tokens
                );
                continue;
            }
            "/clear" => {
                runtime.session = Session::new();
                println!("Session cleared.");
                continue;
            }
            cmd if cmd.starts_with("/save ") => {
                let path = cmd.trim_start_matches("/save ").trim();
                match runtime.session().save(std::path::Path::new(path)) {
                    Ok(()) => println!("Session saved to {}", path),
                    Err(e) => eprintln!("Save failed: {}", e),
                }
                continue;
            }
            _ => {}
        }

        // Send to runtime
        eprint!("thinking...");
        match runtime.run_turn(trimmed) {
            Ok(summary) => {
                // Clear "thinking..." line
                eprint!("\r            \r");
                println!("{}", summary.final_text);
                if summary.tool_calls > 0 {
                    eprintln!(
                        "  [{} iterations, {} tool calls]",
                        summary.iterations, summary.tool_calls
                    );
                }
            }
            Err(e) => {
                eprint!("\r            \r");
                eprintln!("Error: {}", e);
            }
        }
        println!();
    }

    // Print final stats
    let usage = runtime.usage();
    if usage.turns > 0 {
        eprintln!(
            "\nSession: {} turns, ~${:.4}",
            usage.turns,
            usage.estimated_cost_usd()
        );
    }
}

fn print_help() {
    println!(
        "claw-mini — Minimal agentic CLI

USAGE:
    claw-mini                       Start interactive REPL
    claw-mini -p \"prompt\"           One-shot prompt
    claw-mini --model opus -p \"..\" Use specific model

OPTIONS:
    -m, --model MODEL     Model alias (opus, sonnet, haiku) or full name
    -p, --prompt TEXT     One-shot prompt (non-interactive)
    --read-only           Only allow read tools
    --workspace-write     Allow read + write tools, no bash
    --version, -V         Print version
    --help, -h            Print this help

ENVIRONMENT:
    ANTHROPIC_API_KEY     Required. Your Anthropic API key.
    ANTHROPIC_BASE_URL    Optional. API base URL (for proxies).

REPL COMMANDS:
    /help                 Show help
    /status               Show session stats
    /cost                 Show cost breakdown
    /save <path>          Save session to file
    /clear                Clear conversation
    /quit                 Exit
"
    );
}
