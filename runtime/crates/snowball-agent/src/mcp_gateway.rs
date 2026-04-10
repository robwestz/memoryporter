//! MCP Gateway binary — exposes extracted knowledge via MCP stdio transport.
//!
//! Usage:
//!   snowball-mcp <extraction_dir> [--source-root <path>]
//!
//! Options:
//!   --source-root <path>  Enable live re-extraction from this source directory

use snowball_agent::mcp_server::McpGateway;
use std::path::PathBuf;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let extraction_dir = resolve_extraction_dir(&args);
    let source_root = resolve_source_root(&args);

    eprintln!(
        "snowball-mcp v0.2.0 — serving knowledge from {}",
        extraction_dir.display()
    );
    if let Some(ref root) = source_root {
        eprintln!("  source-root: {} (reextract enabled)", root.display());
    }

    let mut gateway = match McpGateway::from_extraction_dir(&extraction_dir) {
        Ok(gw) => gw,
        Err(e) => {
            eprintln!("Failed to load knowledge base: {}", e);
            eprintln!("Run `snowball` first to generate extraction data.");
            std::process::exit(1);
        }
    };

    if let Some(root) = source_root {
        gateway = gateway.with_source_root(&root);
    }

    if let Err(e) = gateway.run() {
        eprintln!("MCP server error: {}", e);
        std::process::exit(1);
    }
}

fn resolve_extraction_dir(args: &[String]) -> PathBuf {
    // First non-flag argument is extraction_dir
    for (i, arg) in args.iter().enumerate().skip(1) {
        if !arg.starts_with("--") && (i < 2 || !args[i - 1].starts_with("--")) {
            return PathBuf::from(arg);
        }
    }

    // SNOWBALL_EXTRACTION_DIR env var
    if let Ok(dir) = std::env::var("SNOWBALL_EXTRACTION_DIR") {
        return PathBuf::from(dir);
    }

    // extraction/ relative to CWD
    let cwd = std::env::current_dir().unwrap_or_default();
    cwd.join("extraction")
}

fn resolve_source_root(args: &[String]) -> Option<PathBuf> {
    // --source-root <path>
    for (i, arg) in args.iter().enumerate() {
        if arg == "--source-root" {
            return args.get(i + 1).map(PathBuf::from);
        }
    }

    // SNOWBALL_SOURCE_ROOT env var
    std::env::var("SNOWBALL_SOURCE_ROOT").ok().map(PathBuf::from)
}
