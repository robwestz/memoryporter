//! MCP (Model Context Protocol) gateway server.
//!
//! Exposes the extracted knowledge base via JSON-RPC 2.0 over stdio.
//! Compatible with Claude Code and any MCP client.
//!
//! ## Tools exposed
//!
//! - `search_knowledge` — search facts by keyword, category, or minimum impact
//! - `get_gamechangers` — list all gamechanger patterns
//! - `get_skills` — list all generated skills
//! - `get_agents` — list all agent blueprints
//! - `get_fact` — get a specific fact by ID
//! - `get_summary` — get extraction summary statistics
//! - `reextract` — re-run extraction against source and reload knowledge base
//!
//! ## Resources exposed
//!
//! - `extraction://summary` — SUMMARY.md
//! - `extraction://index` — INDEX.md
//! - `extraction://gamechangers` — GAMECHANGERS.md
//! - `extraction://knowledge_base` — knowledge_base.json

use crate::agent::SnowballAgent;
use crate::agent_gen::AgentGenerator;
use crate::gamechanger::GamechangerDetector;
use crate::knowledge::{ImpactLevel, KnowledgeBase, PatternCategory};
use crate::output::OutputGenerator;
use crate::skill_gen::SkillGenerator;
use serde_json::{json, Value};
use std::io::{self, BufRead, Write};
use std::path::{Path, PathBuf};

fn log(msg: &str) {
    eprintln!("[snowball-mcp] {}", msg);
}

// ── JSON-RPC 2.0 ───────────────────────────────────────────────────────────

fn jsonrpc_response(id: &Value, result: Value) -> Value {
    json!({
        "jsonrpc": "2.0",
        "id": id,
        "result": result
    })
}

fn jsonrpc_error(id: &Value, code: i64, message: &str) -> Value {
    json!({
        "jsonrpc": "2.0",
        "id": id,
        "error": {
            "code": code,
            "message": message
        }
    })
}

// ── MCP Server ──────────────────────────────────────────────────────────────

pub struct McpGateway {
    kb: KnowledgeBase,
    extraction_dir: PathBuf,
    source_root: Option<PathBuf>,
}

impl McpGateway {
    /// Create a new gateway from a knowledge base JSON file and extraction directory.
    pub fn from_extraction_dir(dir: &Path) -> Result<Self, Box<dyn std::error::Error>> {
        let kb_path = dir.join("knowledge_base.json");
        let kb = if kb_path.exists() {
            log(&format!("Loading knowledge base from {}", kb_path.display()));
            KnowledgeBase::load_from_file(&kb_path)?
        } else {
            log("No knowledge_base.json found, starting empty");
            KnowledgeBase::new()
        };
        log(&format!("Loaded {} facts", kb.len()));

        Ok(Self {
            kb,
            extraction_dir: dir.to_path_buf(),
            source_root: None,
        })
    }

    /// Set the source root for live re-extraction.
    pub fn with_source_root(mut self, root: &Path) -> Self {
        self.source_root = Some(root.to_path_buf());
        self
    }

    /// Run the MCP server on stdio (blocking).
    pub fn run(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        let stdin = io::stdin();
        let stdout = io::stdout();
        let mut reader = stdin.lock();
        let mut writer = stdout.lock();

        log("MCP server ready, listening on stdio");

        loop {
            // Read Content-Length header
            let mut header = String::new();
            if reader.read_line(&mut header)? == 0 {
                log("EOF on stdin, shutting down");
                break; // EOF
            }
            let header = header.trim().to_string();

            if header.is_empty() {
                continue;
            }

            let content_length = if header.starts_with("Content-Length:") {
                header
                    .trim_start_matches("Content-Length:")
                    .trim()
                    .parse::<usize>()
                    .unwrap_or(0)
            } else {
                // Might be raw JSON (no headers) — try to parse the line directly
                match serde_json::from_str::<Value>(&header) {
                    Ok(request) => {
                        let response = self.handle_request(&request);
                        if let Some(resp) = response {
                            self.write_message(&mut writer, &resp)?;
                        }
                        continue;
                    }
                    Err(_) => {
                        log(&format!("Ignoring unparseable line: {}", &header[..header.len().min(80)]));
                        continue;
                    }
                }
            };

            if content_length == 0 {
                continue;
            }

            // Read blank line separator
            let mut blank = String::new();
            reader.read_line(&mut blank)?;

            // Read content body
            let mut body = vec![0u8; content_length];
            io::Read::read_exact(&mut reader, &mut body)?;

            match serde_json::from_slice::<Value>(&body) {
                Ok(request) => {
                    let response = self.handle_request(&request);
                    if let Some(resp) = response {
                        self.write_message(&mut writer, &resp)?;
                    }
                }
                Err(e) => {
                    log(&format!("Failed to parse JSON body: {}", e));
                    // Send error response with null id
                    let resp = jsonrpc_error(&Value::Null, -32700, "Parse error");
                    self.write_message(&mut writer, &resp)?;
                }
            }
        }

        Ok(())
    }

    fn write_message(
        &self,
        writer: &mut impl Write,
        message: &Value,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let body = serde_json::to_string(message)?;
        write!(writer, "Content-Length: {}\r\n\r\n{}", body.len(), body)?;
        writer.flush()?;
        Ok(())
    }

    /// Handle a single JSON-RPC request. Returns None for notifications.
    fn handle_request(&mut self, request: &Value) -> Option<Value> {
        let method = request.get("method")?.as_str()?;
        let id = request.get("id");
        let params = request.get("params").cloned().unwrap_or(json!({}));

        match method {
            "initialize" => {
                let id = id?;
                Some(jsonrpc_response(
                    id,
                    json!({
                        "protocolVersion": "2024-11-05",
                        "capabilities": {
                            "tools": { "listChanged": false },
                            "resources": { "listChanged": false }
                        },
                        "serverInfo": {
                            "name": "snowball-knowledge-gateway",
                            "version": "0.2.0"
                        }
                    }),
                ))
            }

            "initialized" => None, // notification, no response

            "tools/list" => {
                let id = id?;
                Some(jsonrpc_response(id, json!({ "tools": self.tool_definitions() })))
            }

            "tools/call" => {
                let id = id?;
                let tool_name = params.get("name").and_then(|n| n.as_str()).unwrap_or("");
                let arguments = params.get("arguments").cloned().unwrap_or(json!({}));
                let result = self.call_tool(tool_name, &arguments);
                Some(jsonrpc_response(id, result))
            }

            "resources/list" => {
                let id = id?;
                Some(jsonrpc_response(
                    id,
                    json!({ "resources": self.resource_definitions() }),
                ))
            }

            "resources/read" => {
                let id = id?;
                let uri = params.get("uri").and_then(|u| u.as_str()).unwrap_or("");
                match self.read_resource(uri) {
                    Ok(content) => Some(jsonrpc_response(
                        id,
                        json!({
                            "contents": [{
                                "uri": uri,
                                "mimeType": if uri.ends_with("json") { "application/json" } else { "text/markdown" },
                                "text": content
                            }]
                        }),
                    )),
                    Err(e) => Some(jsonrpc_error(id, -32602, &e)),
                }
            }

            "ping" => {
                let id = id?;
                Some(jsonrpc_response(id, json!({})))
            }

            _ => {
                if let Some(id) = id {
                    Some(jsonrpc_error(id, -32601, &format!("Method not found: {}", method)))
                } else {
                    None
                }
            }
        }
    }

    // ── Tool definitions ────────────────────────────────────────────────────

    fn tool_definitions(&self) -> Vec<Value> {
        vec![
            json!({
                "name": "search_knowledge",
                "description": "Search the extracted knowledge base. Filter by keyword, category, or minimum impact level. Returns matching facts with descriptions and sources.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "keyword": {
                            "type": "string",
                            "description": "Search term to match against fact titles and descriptions"
                        },
                        "category": {
                            "type": "string",
                            "description": "Filter by category: AgenticLoop, ToolSystem, McpProtocol, PermissionModel, SessionManagement, ConfigHierarchy, HookSystem, SubAgent, Streaming, ErrorHandling, CostTracking, TraitSystem, DesignPattern"
                        },
                        "min_impact": {
                            "type": "string",
                            "description": "Minimum impact level: Low, Medium, High, Gamechanger"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Max results to return (default 20)"
                        }
                    }
                }
            }),
            json!({
                "name": "get_gamechangers",
                "description": "Get all gamechanger patterns — transformative insights that fundamentally change agent development. Each includes what, why, how, and code patterns.",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            }),
            json!({
                "name": "get_skills",
                "description": "Get all generated skills with steps, verification checklists, and code templates. Skills are agnostic building blocks for agent systems.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "category": {
                            "type": "string",
                            "description": "Filter by category (optional)"
                        }
                    }
                }
            }),
            json!({
                "name": "get_agents",
                "description": "Get all agent blueprints with capabilities, tool access, system prompts, and spawn conditions.",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            }),
            json!({
                "name": "get_fact",
                "description": "Get a specific knowledge fact by its ID. Use search_knowledge first to find IDs.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "id": {
                            "type": "string",
                            "description": "The fact ID (e.g., 'trait_apiclient', 'struct_conversationruntime', 'pattern_generic_trait-based_composition')"
                        }
                    },
                    "required": ["id"]
                }
            }),
            json!({
                "name": "get_summary",
                "description": "Get extraction summary: total facts, counts by category, top gamechangers, generated skills and agents.",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            }),
            json!({
                "name": "reextract",
                "description": "Re-run extraction against the source codebase and reload the knowledge base. Use after code changes to get updated facts, skills, and gamechangers. Also regenerates all output files.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "source_root": {
                            "type": "string",
                            "description": "Path to source root to analyze (optional, uses configured default)"
                        }
                    }
                }
            }),
        ]
    }

    // ── Tool execution ──────────────────────────────────────────────────────

    fn call_tool(&mut self, name: &str, args: &Value) -> Value {
        log(&format!("Tool call: {}", name));
        match name {
            "search_knowledge" => self.tool_search_knowledge(args),
            "get_gamechangers" => self.tool_get_gamechangers(),
            "get_skills" => self.tool_get_skills(args),
            "get_agents" => self.tool_get_agents(),
            "get_fact" => self.tool_get_fact(args),
            "get_summary" => self.tool_get_summary(),
            "reextract" => self.tool_reextract(args),
            _ => json!({
                "content": [{ "type": "text", "text": format!("Unknown tool: {}", name) }],
                "isError": true
            }),
        }
    }

    fn tool_search_knowledge(&self, args: &Value) -> Value {
        let keyword = args.get("keyword").and_then(|k| k.as_str()).unwrap_or("");
        let category_filter = args.get("category").and_then(|c| c.as_str());
        let min_impact = args
            .get("min_impact")
            .and_then(|m| m.as_str())
            .unwrap_or("Low");
        let limit = args
            .get("limit")
            .and_then(|l| l.as_u64())
            .unwrap_or(20) as usize;

        let min_impact_level = match min_impact {
            "Gamechanger" => ImpactLevel::Gamechanger,
            "High" => ImpactLevel::High,
            "Medium" => ImpactLevel::Medium,
            _ => ImpactLevel::Low,
        };

        let mut results: Vec<Value> = Vec::new();

        for (id, fact) in self.kb.facts() {
            // Filter by impact
            if fact.impact < min_impact_level {
                continue;
            }

            // Filter by category
            if let Some(cat) = category_filter {
                let fact_cat = format!("{:?}", fact.category);
                if !fact_cat.eq_ignore_ascii_case(cat) {
                    continue;
                }
            }

            // Filter by keyword
            if !keyword.is_empty() {
                let kw_lower = keyword.to_lowercase();
                let matches = fact.title.to_lowercase().contains(&kw_lower)
                    || fact.description.to_lowercase().contains(&kw_lower)
                    || fact.tags.iter().any(|t| t.to_lowercase().contains(&kw_lower));
                if !matches {
                    continue;
                }
            }

            results.push(json!({
                "id": id,
                "title": fact.title,
                "category": fact.category.display_name(),
                "impact": format!("{:?}", fact.impact),
                "description": fact.description,
                "source": fact.source,
                "tags": fact.tags,
                "related": fact.related_ids,
            }));

            if results.len() >= limit {
                break;
            }
        }

        // Sort by impact (highest first)
        results.sort_by(|a, b| {
            let score_a = match a["impact"].as_str().unwrap_or("") {
                "Gamechanger" => 4,
                "High" => 3,
                "Medium" => 2,
                _ => 1,
            };
            let score_b = match b["impact"].as_str().unwrap_or("") {
                "Gamechanger" => 4,
                "High" => 3,
                "Medium" => 2,
                _ => 1,
            };
            score_b.cmp(&score_a)
        });

        let text = serde_json::to_string_pretty(&json!({
            "total_matches": results.len(),
            "results": results
        }))
        .unwrap_or_default();

        json!({
            "content": [{ "type": "text", "text": text }]
        })
    }

    fn tool_get_gamechangers(&self) -> Value {
        let gamechangers = GamechangerDetector::detect(&self.kb);
        let mut items: Vec<Value> = Vec::new();

        for gc in &gamechangers {
            items.push(json!({
                "id": gc.id,
                "name": gc.name,
                "tagline": gc.tagline,
                "leverage": gc.leverage.label(),
                "category": gc.category.display_name(),
                "description": gc.description,
                "why_it_matters": gc.why_it_matters,
                "how_to_use": gc.how_to_use,
                "code_pattern": gc.code_pattern,
            }));
        }

        let text = serde_json::to_string_pretty(&json!({
            "total": items.len(),
            "gamechangers": items
        }))
        .unwrap_or_default();

        json!({
            "content": [{ "type": "text", "text": text }]
        })
    }

    fn tool_get_skills(&self, args: &Value) -> Value {
        let category_filter = args.get("category").and_then(|c| c.as_str());
        let skills = SkillGenerator::generate(&self.kb);
        let mut items: Vec<Value> = Vec::new();

        for skill in &skills {
            if let Some(cat) = category_filter {
                let skill_cat = skill.category.display_name();
                if !skill_cat.eq_ignore_ascii_case(cat) {
                    continue;
                }
            }

            items.push(json!({
                "id": skill.id,
                "name": skill.name,
                "category": skill.category.display_name(),
                "description": skill.description,
                "trigger": skill.trigger,
                "steps": skill.steps,
                "verification": skill.verification,
                "code_template": skill.code_template,
            }));
        }

        let text = serde_json::to_string_pretty(&json!({
            "total": items.len(),
            "skills": items
        }))
        .unwrap_or_default();

        json!({
            "content": [{ "type": "text", "text": text }]
        })
    }

    fn tool_get_agents(&self) -> Value {
        let agents = AgentGenerator::generate(&self.kb);
        let mut items: Vec<Value> = Vec::new();

        for agent in &agents {
            items.push(json!({
                "id": agent.id,
                "name": agent.name,
                "role": agent.role,
                "description": agent.description,
                "capabilities": agent.capabilities,
                "permission_mode": agent.permission_mode,
                "max_iterations": agent.max_iterations,
                "when_to_spawn": agent.when_to_spawn,
                "tools": agent.tools.iter().map(|t| json!({
                    "name": t.tool_name,
                    "permission": t.permission,
                    "purpose": t.purpose,
                })).collect::<Vec<_>>(),
            }));
        }

        let text = serde_json::to_string_pretty(&json!({
            "total": items.len(),
            "agents": items
        }))
        .unwrap_or_default();

        json!({
            "content": [{ "type": "text", "text": text }]
        })
    }

    fn tool_get_fact(&self, args: &Value) -> Value {
        let id = args.get("id").and_then(|i| i.as_str()).unwrap_or("");

        match self.kb.get_fact(id) {
            Some(fact) => {
                let text = serde_json::to_string_pretty(&json!({
                    "id": id,
                    "title": fact.title,
                    "category": fact.category.display_name(),
                    "impact": format!("{:?}", fact.impact),
                    "description": fact.description,
                    "source": fact.source,
                    "tags": fact.tags,
                    "related": fact.related_ids,
                }))
                .unwrap_or_default();

                json!({
                    "content": [{ "type": "text", "text": text }]
                })
            }
            None => json!({
                "content": [{ "type": "text", "text": format!("Fact not found: {}", id) }],
                "isError": true
            }),
        }
    }

    fn tool_get_summary(&self) -> Value {
        let stats = self.kb.stats();
        let output = OutputGenerator::generate(&self.kb);

        let mut categories: Vec<Value> = Vec::new();
        for category in PatternCategory::all() {
            let count = stats.by_category.get(&category).unwrap_or(&0);
            if *count > 0 {
                categories.push(json!({
                    "category": category.display_name(),
                    "count": count
                }));
            }
        }

        let text = serde_json::to_string_pretty(&json!({
            "total_facts": stats.total_facts,
            "gamechanger_count": output.gamechangers.len(),
            "skills_count": output.skills.len(),
            "agents_count": output.agents.len(),
            "knowledge_score": stats.total_score,
            "facts_by_category": categories,
        }))
        .unwrap_or_default();

        json!({
            "content": [{ "type": "text", "text": text }]
        })
    }

    // ── Resource definitions ────────────────────────────────────────────────

    fn resource_definitions(&self) -> Vec<Value> {
        vec![
            json!({
                "uri": "extraction://summary",
                "name": "Extraction Summary",
                "description": "Statistics and overview of extracted knowledge",
                "mimeType": "text/markdown"
            }),
            json!({
                "uri": "extraction://index",
                "name": "Extraction Index",
                "description": "Index of all generated skills, agents, and gamechangers",
                "mimeType": "text/markdown"
            }),
            json!({
                "uri": "extraction://gamechangers",
                "name": "Gamechangers Report",
                "description": "Full report of transformative patterns with code examples",
                "mimeType": "text/markdown"
            }),
            json!({
                "uri": "extraction://knowledge_base",
                "name": "Knowledge Base",
                "description": "Raw knowledge base with all extracted facts",
                "mimeType": "application/json"
            }),
            json!({
                "uri": "extraction://execution_plan",
                "name": "Execution Plan",
                "description": "Master plan: 12 primitives × extracted knowledge × skills × OB1 infra, with 4-phase build order",
                "mimeType": "text/markdown"
            }),
            json!({
                "uri": "extraction://skill_bundle_explicit",
                "name": "Explicit Skills Catalog",
                "description": "18 explicitly triggerable short skills (batch, debug, loop, verify, etc.) with YAML specs",
                "mimeType": "text/markdown"
            }),
            json!({
                "uri": "extraction://skill_bundle_implicit",
                "name": "Implicit Skills Catalog",
                "description": "22 implicit architectural skills (plan-mode, agent-spawn, memory-routing, etc.)",
                "mimeType": "text/markdown"
            }),
            json!({
                "uri": "extraction://loader_blueprint",
                "name": "Skill Loader Blueprint",
                "description": "Scoring algorithm for skill selection: priority + triggers + context bonuses",
                "mimeType": "text/markdown"
            }),
        ]
    }

    fn tool_reextract(&mut self, args: &Value) -> Value {
        let source_root = args
            .get("source_root")
            .and_then(|s| s.as_str())
            .map(PathBuf::from)
            .or_else(|| self.source_root.clone());

        let Some(root) = source_root else {
            return json!({
                "content": [{ "type": "text", "text": "No source_root configured or provided. Pass source_root argument or start the server with --source-root." }],
                "isError": true
            });
        };

        log(&format!("Re-extracting from {}", root.display()));

        let mut agent = SnowballAgent::new(&root);
        let result = agent.iterate();
        log(&format!("  {}", result));

        // Replace knowledge base
        self.kb = agent.knowledge_base().clone();

        // Write updated output
        match agent.write_output(&self.extraction_dir) {
            Ok(()) => {
                log(&format!("Updated extraction output in {}", self.extraction_dir.display()));
            }
            Err(e) => {
                log(&format!("Warning: failed to write output: {}", e));
            }
        }

        let stats = self.kb.stats();
        let text = serde_json::to_string_pretty(&json!({
            "status": "ok",
            "source_root": root.display().to_string(),
            "files_scanned": result.files_scanned,
            "total_lines": result.total_lines,
            "total_facts": stats.total_facts,
            "gamechanger_count": stats.gamechanger_count,
            "knowledge_score": stats.total_score,
        }))
        .unwrap_or_default();

        json!({
            "content": [{ "type": "text", "text": text }]
        })
    }

    fn read_resource(&self, uri: &str) -> Result<String, String> {
        let file = match uri {
            "extraction://summary" => "SUMMARY.md",
            "extraction://index" => "INDEX.md",
            "extraction://gamechangers" => "gamechangers/GAMECHANGERS.md",
            "extraction://knowledge_base" => "knowledge_base.json",
            "extraction://execution_plan" => "EXECUTION_PLAN.md",
            "extraction://skill_bundle_explicit" => "skill-bundle/explicit-skills.md",
            "extraction://skill_bundle_implicit" => "skill-bundle/implicit-skills.md",
            "extraction://loader_blueprint" => "skill-bundle/loader-blueprint.md",
            _ => return Err(format!("Unknown resource: {}", uri)),
        };

        let path = self.extraction_dir.join(file);
        std::fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read {}: {}", path.display(), e))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn setup_gateway() -> McpGateway {
        McpGateway {
            kb: KnowledgeBase::new(),
            extraction_dir: PathBuf::from("."),
            source_root: None,
        }
    }

    #[test]
    fn test_initialize() {
        let mut gw = setup_gateway();
        let request = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": { "capabilities": {} }
        });
        let response = gw.handle_request(&request).unwrap();
        assert_eq!(response["result"]["serverInfo"]["name"], "snowball-knowledge-gateway");
    }

    #[test]
    fn test_tools_list() {
        let mut gw = setup_gateway();
        let request = json!({
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/list",
            "params": {}
        });
        let response = gw.handle_request(&request).unwrap();
        let tools = response["result"]["tools"].as_array().unwrap();
        assert_eq!(tools.len(), 7);
        assert!(tools.iter().any(|t| t["name"] == "search_knowledge"));
        assert!(tools.iter().any(|t| t["name"] == "get_gamechangers"));
    }

    #[test]
    fn test_get_summary() {
        let mut gw = setup_gateway();
        let result = gw.call_tool("get_summary", &json!({}));
        let text = result["content"][0]["text"].as_str().unwrap();
        assert!(text.contains("total_facts"));
    }

    #[test]
    fn test_get_gamechangers() {
        let mut gw = setup_gateway();
        let result = gw.call_tool("get_gamechangers", &json!({}));
        let text = result["content"][0]["text"].as_str().unwrap();
        let parsed: Value = serde_json::from_str(text).unwrap();
        assert!(parsed["total"].as_u64().unwrap() >= 10);
    }

    #[test]
    fn test_search_knowledge() {
        let mut kb = KnowledgeBase::new();
        kb.add_fact(
            "test_fact".into(),
            crate::knowledge::KnowledgeFact {
                category: PatternCategory::AgenticLoop,
                title: "Test Runtime Pattern".into(),
                description: "A test pattern for the agentic loop".into(),
                source: "test.rs:1".into(),
                impact: ImpactLevel::High,
                related_ids: vec![],
                tags: vec!["test".into()],
            },
        );

        let mut gw = McpGateway {
            kb,
            extraction_dir: PathBuf::from("."),
            source_root: None,
        };

        // Search by keyword
        let result = gw.call_tool("search_knowledge", &json!({ "keyword": "runtime" }));
        let text = result["content"][0]["text"].as_str().unwrap();
        assert!(text.contains("Test Runtime Pattern"));

        // Search by category
        let result = gw.call_tool("search_knowledge", &json!({ "category": "AgenticLoop" }));
        let text = result["content"][0]["text"].as_str().unwrap();
        assert!(text.contains("test_fact"));
    }

    #[test]
    fn test_get_fact() {
        let mut kb = KnowledgeBase::new();
        kb.add_fact(
            "my_fact".into(),
            crate::knowledge::KnowledgeFact {
                category: PatternCategory::ToolSystem,
                title: "My Fact".into(),
                description: "Details here".into(),
                source: "lib.rs:42".into(),
                impact: ImpactLevel::Medium,
                related_ids: vec![],
                tags: vec![],
            },
        );

        let mut gw = McpGateway { kb, extraction_dir: PathBuf::from("."), source_root: None };
        let result = gw.call_tool("get_fact", &json!({ "id": "my_fact" }));
        let text = result["content"][0]["text"].as_str().unwrap();
        assert!(text.contains("My Fact"));

        // Not found
        let result = gw.call_tool("get_fact", &json!({ "id": "nope" }));
        assert!(result["isError"].as_bool().unwrap_or(false));
    }

    #[test]
    fn test_resources_list() {
        let mut gw = setup_gateway();
        let request = json!({
            "jsonrpc": "2.0",
            "id": 3,
            "method": "resources/list",
            "params": {}
        });
        let response = gw.handle_request(&request).unwrap();
        let resources = response["result"]["resources"].as_array().unwrap();
        assert_eq!(resources.len(), 8);
    }

    #[test]
    fn test_resource_read() {
        let dir = tempdir().unwrap();
        std::fs::write(dir.path().join("SUMMARY.md"), "# Test Summary").unwrap();

        let mut gw = McpGateway {
            kb: KnowledgeBase::new(),
            extraction_dir: dir.path().to_path_buf(),
            source_root: None,
        };

        let request = json!({
            "jsonrpc": "2.0",
            "id": 4,
            "method": "resources/read",
            "params": { "uri": "extraction://summary" }
        });
        let response = gw.handle_request(&request).unwrap();
        let text = response["result"]["contents"][0]["text"].as_str().unwrap();
        assert_eq!(text, "# Test Summary");
    }
}
