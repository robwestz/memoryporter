//! Gamechanger detection and documentation.
//!
//! Identifies transformative patterns from extracted knowledge that
//! fundamentally change how agent systems are built.

use crate::knowledge::{ImpactLevel, KnowledgeBase, PatternCategory};

// ── Gamechanger definition ──────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct Gamechanger {
    pub id: String,
    pub name: String,
    pub tagline: String,
    pub description: String,
    pub why_it_matters: String,
    pub how_to_use: String,
    pub code_pattern: String,
    pub source_facts: Vec<String>,
    pub category: PatternCategory,
    pub leverage: Leverage,
}

#[derive(Debug, Clone)]
pub enum Leverage {
    /// Eliminates an entire class of problems.
    ProblemEliminator,
    /// Makes something 10x faster/easier.
    TenXMultiplier,
    /// Enables something previously impossible.
    NewCapability,
    /// Composes with everything else.
    UniversalPrimitive,
}

impl Leverage {
    pub fn label(&self) -> &str {
        match self {
            Self::ProblemEliminator => "Problem Eliminator",
            Self::TenXMultiplier => "10x Multiplier",
            Self::NewCapability => "New Capability",
            Self::UniversalPrimitive => "Universal Primitive",
        }
    }
}

// ── Detector ────────────────────────────────────────────────────────────────

pub struct GamechangerDetector;

impl GamechangerDetector {
    /// Detect gamechangers from a knowledge base.
    /// Combines extracted code patterns with hardcoded deep analysis
    /// from the Claw Code architecture study.
    pub fn detect(kb: &KnowledgeBase) -> Vec<Gamechanger> {
        let mut gamechangers = Vec::new();

        // Always include the known gamechangers from deep analysis
        gamechangers.extend(Self::known_gamechangers());

        // Detect additional gamechangers from extracted patterns
        gamechangers.extend(Self::detect_from_patterns(kb));

        // Deduplicate by name
        let mut seen = std::collections::HashSet::new();
        gamechangers.retain(|g| seen.insert(g.name.clone()));

        gamechangers
    }

    /// The 10 transformative patterns identified from deep Claw Code analysis.
    fn known_gamechangers() -> Vec<Gamechanger> {
        vec![
            Gamechanger {
                id: "gc_generic_runtime".into(),
                name: "Generic Trait-Based Runtime".into(),
                tagline: "Swap any component without touching the core".into(),
                description: "ConversationRuntime<C: ApiClient, T: ToolExecutor> — the entire agentic loop is parameterized over traits. API provider, tool execution strategy, even the permission prompter are all pluggable.".into(),
                why_it_matters: "You can swap Anthropic for OpenAI, mock everything for testing, compose different strategies, or run sub-agents with restricted tool sets — all without changing a single line in the core loop. This is the foundation that makes everything else possible.".into(),
                how_to_use: "Define your runtime as generic over ApiClient + ToolExecutor traits. Never hardcode a specific provider. Use trait objects for runtime polymorphism, generics for compile-time composition.".into(),
                code_pattern: r#"pub trait ApiClient {
    fn stream(&mut self, request: ApiRequest) -> Result<Vec<AssistantEvent>, RuntimeError>;
}

pub trait ToolExecutor {
    fn execute(&mut self, tool_name: &str, input: &str) -> Result<String, ToolError>;
}

pub struct ConversationRuntime<C: ApiClient, T: ToolExecutor> {
    session: Session,
    api_client: C,
    tool_executor: T,
    permission_policy: PermissionPolicy,
}"#.into(),
                source_facts: vec!["trait_apiclient".into(), "trait_toolexecutor".into(), "struct_conversationruntime".into()],
                category: PatternCategory::AgenticLoop,
                leverage: Leverage::UniversalPrimitive,
            },

            Gamechanger {
                id: "gc_auto_compaction".into(),
                name: "Auto-Compaction with Context Preservation".into(),
                tagline: "Infinite conversations without losing context".into(),
                description: "Automatically detects when input tokens exceed threshold (200K default), summarizes old messages into a compact brief, and preserves the most recent messages verbatim. The summary captures pending work, key files, and current activity.".into(),
                why_it_matters: "Agents can run indefinitely without hitting context limits. Long-running tasks, multi-hour debugging sessions, and complex multi-step builds all work seamlessly. No manual intervention needed.".into(),
                how_to_use: "Set auto_compaction_input_tokens_threshold on your runtime. When triggered: generate a summary using XML tags, preserve last 4 messages, prepend a continuation prompt explaining the context cutoff.".into(),
                code_pattern: r#"// In the agentic loop, after each turn:
if usage_tracker.cumulative.input_tokens > auto_compaction_threshold {
    let summary = generate_summary(&session.messages[..messages.len() - 4]);
    let preserved = session.messages[messages.len() - 4..].to_vec();
    session.messages = vec![system_message(summary)];
    session.messages.extend(preserved);
}"#.into(),
                source_facts: vec!["pattern_auto_compaction".into()],
                category: PatternCategory::SessionManagement,
                leverage: Leverage::ProblemEliminator,
            },

            Gamechanger {
                id: "gc_multi_transport_mcp".into(),
                name: "Multi-Transport MCP Client".into(),
                tagline: "Connect to ANY tool server with one interface".into(),
                description: "Single McpServerManager handles 6 transport types: Stdio (local processes), HTTP/SSE (remote with polling), WebSocket (bidirectional), SDK (built-in), Claude.ai Proxy (OAuth-protected). Tool naming normalized via mcp__server__toolname.".into(),
                why_it_matters: "Your agent can connect to local CLI tools, remote APIs, WebSocket services, and cloud-hosted tool servers — all through the same interface. Adding a new tool source is just a config entry, not code.".into(),
                how_to_use: "Implement McpClientTransport enum with variants for each transport. Bootstrap servers from config, normalize tool names with prefixes. Use JSON-RPC 2.0 for all communication.".into(),
                code_pattern: r#"pub enum McpClientTransport {
    Stdio(command, args, env),
    Sse(url, headers),
    Http(url, headers),
    WebSocket(url, headers),
    Sdk(name),
    ClaudeAiProxy(url, id),
}

// All tools discovered via tools/list, prefixed:
// mcp__github__list_issues, mcp__slack__send_message"#.into(),
                source_facts: vec!["enum_mcpclienttransport".into(), "struct_mcpservermanager".into()],
                category: PatternCategory::McpProtocol,
                leverage: Leverage::NewCapability,
            },

            Gamechanger {
                id: "gc_shell_hooks".into(),
                name: "Shell-Based Hook Lifecycle".into(),
                tagline: "Extend agent behavior in any language, without recompiling".into(),
                description: "Pre/post tool hooks configured as shell commands. JSON payload piped to stdin with tool_name, tool_input, tool_output. Exit codes: 0=allow, 1=warn, 2=deny. Hooks run after permission check but before/after tool execution.".into(),
                why_it_matters: "Organizations can enforce policies, audit tool usage, add guardrails, transform inputs/outputs — all without touching the agent codebase. A Python script, a bash one-liner, or a Go binary all work as hooks.".into(),
                how_to_use: "Configure hooks in settings.json under hooks.PreToolUse[] and hooks.PostToolUse[]. Each entry is a shell command. Return exit 2 to deny, exit 0 + stdout for feedback.".into(),
                code_pattern: r#"// Hook receives JSON on stdin:
{
  "hook_event_name": "PreToolUse",
  "tool_name": "bash",
  "tool_input": {"command": "rm -rf /"},
  "tool_input_json": "{...}"
}

// Hook script (any language):
#!/bin/bash
INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r .tool_name)
if [[ "$TOOL" == "bash" ]]; then
  CMD=$(echo "$INPUT" | jq -r .tool_input.command)
  if [[ "$CMD" == *"rm -rf"* ]]; then
    echo "Blocked dangerous command" >&2
    exit 2  # DENY
  fi
fi
exit 0  # ALLOW"#.into(),
                source_facts: vec!["struct_hookrunner".into(), "pattern_shell_hook_lifecycle".into()],
                category: PatternCategory::HookSystem,
                leverage: Leverage::UniversalPrimitive,
            },

            Gamechanger {
                id: "gc_permission_escalation".into(),
                name: "Permission Escalation Hierarchy".into(),
                tagline: "Graduated trust with per-tool granularity".into(),
                description: "Ordered permission modes: ReadOnly < WorkspaceWrite < DangerFullAccess. Each tool declares its minimum required mode. Policy enforces: active_mode >= required_mode. Escalation triggers user prompt only when needed.".into(),
                why_it_matters: "Sub-agents get exactly the permissions they need — an Explore agent gets ReadOnly, a code writer gets WorkspaceWrite, only the main agent gets DangerFullAccess. This is defense in depth for AI systems.".into(),
                how_to_use: "Define PermissionMode as an ordered enum. Attach required permission to each ToolSpec. Build PermissionPolicy with per-tool requirements map. Check policy before every tool execution.".into(),
                code_pattern: r#"pub enum PermissionMode {
    ReadOnly,           // glob, grep, read, web
    WorkspaceWrite,     // write, edit, todo, notebook
    DangerFullAccess,   // bash, agent, REPL
}

pub struct PermissionPolicy {
    active_mode: PermissionMode,
    tool_requirements: BTreeMap<String, PermissionMode>,
}

// In loop: authorize before execute
let outcome = policy.authorize(tool_name, &prompter);
match outcome {
    Allow => execute_tool(...),
    Deny { reason } => tool_result_error(reason),
}"#.into(),
                source_facts: vec!["enum_permissionmode".into(), "struct_permissionpolicy".into()],
                category: PatternCategory::PermissionModel,
                leverage: Leverage::ProblemEliminator,
            },

            Gamechanger {
                id: "gc_scoped_config".into(),
                name: "Scoped Configuration Merging".into(),
                tagline: "Right config at the right scope, always traceable".into(),
                description: "5-level config hierarchy: ~/.claude.json (legacy) → ~/.claude/settings.json (user) → .claude.json (project) → .claude/settings.json (project) → .claude/settings.local.json (local). Deep merge with MCP server deduplication. Each entry tagged with its source scope.".into(),
                why_it_matters: "Teams share project config via git, individuals customize locally without conflicts, user-level settings travel across projects. When something goes wrong, you can trace exactly which scope provided the setting.".into(),
                how_to_use: "Define a ConfigScope enum (User, Project, Local). Load files in order, deep-merge JSON objects. Track provenance per key. Deduplicate MCP servers by name (last scope wins).".into(),
                code_pattern: r#"// Discovery order:
let sources = [
    ("~/.claude.json", Scope::User),
    ("~/.claude/settings.json", Scope::User),
    (".claude.json", Scope::Project),
    (".claude/settings.json", Scope::Project),
    (".claude/settings.local.json", Scope::Local),
];

// Deep merge with scope tracking
for (path, scope) in sources {
    if let Ok(json) = load_json(path) {
        config.deep_merge(json, scope);
    }
}"#.into(),
                source_facts: vec!["struct_runtimeconfig".into()],
                category: PatternCategory::ConfigHierarchy,
                leverage: Leverage::TenXMultiplier,
            },

            Gamechanger {
                id: "gc_session_snapshot".into(),
                name: "Session Snapshot with Embedded Usage".into(),
                tagline: "One file = complete conversation state + cost history".into(),
                description: "Session serialized as JSON with version, messages array, and per-message token usage. UsageTracker reconstructed from embedded fields on resume. Supports save/load/resume lifecycle.".into(),
                why_it_matters: "Session files are self-contained: resume anywhere, debug any turn, audit costs, replay conversations. No external logging or database needed. One JSON file captures everything.".into(),
                how_to_use: "Embed TokenUsage in each ConversationMessage. On save: serialize entire Session. On load: reconstruct UsageTracker by scanning embedded usage. Use version field for future schema migration.".into(),
                code_pattern: r#"pub struct Session {
    version: u32,
    messages: Vec<ConversationMessage>,
}

pub struct ConversationMessage {
    role: MessageRole,
    blocks: Vec<ContentBlock>,
    usage: Option<TokenUsage>,  // Embedded per-message
}

// Resume: reconstruct tracker from history
let tracker = UsageTracker::from_session(&session);"#.into(),
                source_facts: vec!["struct_session".into(), "struct_usagetracker".into()],
                category: PatternCategory::SessionManagement,
                leverage: Leverage::TenXMultiplier,
            },

            Gamechanger {
                id: "gc_subagent_spawning".into(),
                name: "Sub-Agent Spawning with Tool Restriction".into(),
                tagline: "Parallel agents with exactly the tools they need".into(),
                description: "Sub-agents spawned as threads with per-type tool allowlists. Each agent type (Explore, Plan, Verification, general-purpose) gets a specific set of tools. Manifest-tracked lifecycle: running → completed/failed. Isolated permission policies.".into(),
                why_it_matters: "You can safely parallelize work: an Explore agent can only read, a Plan agent can read + write todos, a Verification agent can run tests. If a sub-agent goes wrong, it can't escape its sandbox.".into(),
                how_to_use: "Define SubagentToolExecutor that filters by allowed set. Map agent types to tool allowlists. Spawn in threads with manifest tracking. Each sub-agent gets its own ConversationRuntime with restricted tools.".into(),
                code_pattern: r#"fn allowed_tools_for_subagent(agent_type: &str) -> BTreeSet<String> {
    match agent_type {
        "Explore" => set!["read_file", "glob_search", "grep_search"],
        "Plan"    => set!["read_file", "glob_search", "grep_search", "TodoWrite"],
        "general" => all_tools(),
        _ => set!["read_file"],
    }
}

struct SubagentToolExecutor { allowed_tools: BTreeSet<String> }

impl ToolExecutor for SubagentToolExecutor {
    fn execute(&mut self, name: &str, input: &str) -> Result<String, ToolError> {
        if !self.allowed_tools.contains(name) {
            return Err(ToolError::new(format!("{name} not enabled")));
        }
        execute_tool(name, input)
    }
}"#.into(),
                source_facts: vec!["struct_agentoutput".into(), "pattern_sub_agent_spawning".into()],
                category: PatternCategory::SubAgent,
                leverage: Leverage::NewCapability,
            },

            Gamechanger {
                id: "gc_markdown_streaming".into(),
                name: "Markdown-Aware Stream Buffering".into(),
                tagline: "Never break a code block mid-render".into(),
                description: "MarkdownStreamState accumulates streaming deltas and detects safe rendering boundaries. Tracks fence state (inside/outside code blocks). Only flushes at paragraph breaks outside fences, buffers everything inside fences.".into(),
                why_it_matters: "Streaming output looks perfect every time. No half-rendered code blocks, no broken syntax highlighting. Users see clean, progressive output even at high token throughput.".into(),
                how_to_use: "Implement a stateful stream buffer with push(delta) and flush(). Track code fence depth. Find safe boundaries (empty lines outside fences). Render only complete chunks.".into(),
                code_pattern: r#"pub struct MarkdownStreamState {
    pending: String,
}

impl MarkdownStreamState {
    pub fn push(&mut self, delta: &str) -> Option<String> {
        self.pending.push_str(delta);
        // Find safe boundary: not inside code fence
        let in_fence = self.pending.matches("```").count() % 2 != 0;
        if in_fence { return None; }
        // Flush at paragraph break
        if let Some(pos) = self.pending.rfind("\n\n") {
            let chunk = self.pending[..pos + 2].to_string();
            self.pending = self.pending[pos + 2..].to_string();
            Some(render_markdown(&chunk))
        } else { None }
    }
}"#.into(),
                source_facts: vec!["struct_markdownstreamstate".into()],
                category: PatternCategory::Streaming,
                leverage: Leverage::TenXMultiplier,
            },

            Gamechanger {
                id: "gc_sse_incremental".into(),
                name: "Incremental SSE Parser with Frame Buffering".into(),
                tagline: "Handle any chunk size, never lose a frame".into(),
                description: "SseParser.push() accepts arbitrary byte chunks, buffers until frame boundary (\\n\\n), extracts complete frames, leaves remainder for next chunk. Handles multi-line JSON data, ping filtering, and graceful finish().".into(),
                why_it_matters: "Network chunking is unpredictable — you might get half a JSON object, or three frames at once. This parser handles every edge case without blocking or losing data.".into(),
                how_to_use: "Implement push(bytes) → Vec<Event> with internal buffer. Scan for \\n\\n boundaries. Parse event: and data: fields. Join multi-line data. Provide finish() for trailing data.".into(),
                code_pattern: r#"pub struct SseParser {
    buffer: Vec<u8>,
}

impl SseParser {
    pub fn push(&mut self, chunk: &[u8]) -> Vec<SseEvent> {
        self.buffer.extend_from_slice(chunk);
        let mut events = Vec::new();
        while let Some(pos) = find_frame_boundary(&self.buffer) {
            let frame = &self.buffer[..pos];
            if let Some(event) = parse_sse_frame(frame) {
                events.push(event);
            }
            self.buffer = self.buffer[pos + 2..].to_vec();
        }
        events
    }
    pub fn finish(&mut self) -> Vec<SseEvent> { /* flush remainder */ }
}"#.into(),
                source_facts: vec!["struct_sseparser".into()],
                category: PatternCategory::Streaming,
                leverage: Leverage::ProblemEliminator,
            },

            // ── Python-derived gamechangers (filling EXECUTION_PLAN gaps) ────

            Gamechanger {
                id: "gc_staged_boot".into(),
                name: "7-Stage Staged Boot Sequence".into(),
                tagline: "Agent has situational awareness before the first prompt".into(),
                description: "Linear pipeline with trust gate: (1) prefetch (credentials, project scan), (2) environment guards, (3) CLI parser + trust gate, (4) parallel workspace + registry load, (5) trust-gated deferred init (plugins, skills, MCP, hooks), (6) mode routing, (7) query engine loop. Stage 5 only runs if trusted=True — untrusted sessions get limited capabilities.".into(),
                why_it_matters: "Without staged boot, your agent is blind when the user's first prompt arrives. Pre-validate credentials, pre-scan workspace, parallelize what you can. The trust gate at stage 5 means untrusted contexts (CI, sandboxes) are safe by default.".into(),
                how_to_use: "Define BootstrapGraph with ordered stages. Gate privileged operations behind a trust flag. Run prefetch in parallel. Load registries before the first turn. Validate everything before accepting user input.".into(),
                code_pattern: r#"stages = (
    'top-level prefetch side effects',           # parallel: creds, project scan
    'warning handler and environment guards',     # safety checks
    'CLI parser and pre-action trust gate',       # trust decision
    'setup() + commands/agents parallel load',    # registries
    'deferred init after trust',                  # GATE: plugins, skills, MCP
    'mode routing',                               # local/remote/ssh/teleport
    'query engine submit loop',                   # main loop
)"#.into(),
                source_facts: vec!["py_staged_boot".into(), "py_deferred_init".into()],
                category: PatternCategory::ConfigHierarchy,
                leverage: Leverage::ProblemEliminator,
            },

            Gamechanger {
                id: "gc_doctor_pattern".into(),
                name: "Doctor Pattern (Unified Health Check)".into(),
                tagline: "Know what's broken before the user does".into(),
                description: "Distributed health check: PrefetchResult (keychain, MDM, project scan), ParityAuditResult (archive/file/command/tool coverage ratios), trust validation, system init message. /doctor validates API creds, connections, config integrity, tool availability, and resource health. Run at startup AND expose as admin command.".into(),
                why_it_matters: "Without /doctor, debugging is guesswork. When an MCP server fails to connect, a credential expires, or a tool registry is corrupted, you need a single command that tells you exactly what's wrong.".into(),
                how_to_use: "Build a /doctor command that checks: API creds valid, external connections reachable, config files parseable, tool registry complete, MCP servers responsive. Return structured results with pass/fail per check.".into(),
                code_pattern: r#"@dataclass(frozen=True)
class HealthCheck:
    api_credentials: bool
    mcp_servers: dict[str, bool]
    tool_registry: tuple[int, int]  # loaded/expected
    config_valid: bool
    session_store: bool

def run_doctor() -> HealthCheck: ..."#.into(),
                source_facts: vec!["py_doctor_pattern".into()],
                category: PatternCategory::ConfigHierarchy,
                leverage: Leverage::TenXMultiplier,
            },

            Gamechanger {
                id: "gc_pre_turn_budget".into(),
                name: "Pre-Turn Token Budget Checking".into(),
                tagline: "Stop BEFORE you overspend, not after".into(),
                description: "Budget checked before the API call: projected_usage = total_usage.add_turn(prompt, output). If projected > max_budget_tokens → stop_reason = 'max_budget_reached' BEFORE processing. CostTracker accumulates events. The 3-line auto-compact fix (mutable_messages[:] = mutable_messages[-N:]) replaced complex retry logic that caused 3,272 consecutive failures in production.".into(),
                why_it_matters: "Without pre-turn budget checking, you discover limits after spending the money. A runaway loop or verbose prompt injection drains budget silently. Anthropic's own product had a bug where compaction failed 3,272 times in a row — fixed by 3 lines.".into(),
                how_to_use: "Track running total of input+output tokens per session. Before each turn: project cost, check against budget, switch to 'wrap up' mode if approaching limit. Expose budget status to user.".into(),
                code_pattern: r#"projected = self.total_usage.add_turn(prompt, output)
if projected.total() > self.config.max_budget_tokens:
    stop_reason = 'max_budget_reached'  # STOP BEFORE API CALL
    break"#.into(),
                source_facts: vec!["py_token_budget".into(), "py_stop_reasons".into()],
                category: PatternCategory::CostTracking,
                leverage: Leverage::ProblemEliminator,
            },

            Gamechanger {
                id: "gc_tool_pool_assembly".into(),
                name: "Three-Layer Tool Pool Assembly".into(),
                tagline: "Right tools, right context, right permissions".into(),
                description: "Per-session tool filtering via 3 layers: (1) Mode Flags — simple_mode restricts to safe subset, (2) Feature Flags — include_mcp excludes by name/prefix, (3) Permission Context — ToolPermissionContext with frozenset deny_names (O(1)) + deny_prefixes tuple. Fewer tools = smaller system prompts, faster model responses, better security, lower token cost.".into(),
                why_it_matters: "Giving an agent all tools in every context is like giving every employee the master key. Tool pool assembly means a read-only exploration agent literally cannot see write tools, and an untrusted context cannot discover bash.".into(),
                how_to_use: "Build an assemble_tool_pool(mode, features, permissions) function. Apply layers in order: mode → features → deny-list. Use frozenset for O(1) exact matching.".into(),
                code_pattern: r#"def assemble_tool_pool(simple_mode, include_mcp, permission_context):
    tools = all_tools()
    if simple_mode:
        tools = [t for t in tools if t.name in SAFE_SUBSET]
    if not include_mcp:
        tools = [t for t in tools if 'mcp' not in t.name.lower()]
    return filter_by_permission_context(tools, permission_context)"#.into(),
                source_facts: vec!["py_tool_pool_assembly".into(), "py_permission_audit".into()],
                category: PatternCategory::ToolSystem,
                leverage: Leverage::TenXMultiplier,
            },

            Gamechanger {
                id: "gc_memory_system".into(),
                name: "8-Module File-Based Memory with Provenance".into(),
                tagline: "Memory without provenance is accumulated hallucination".into(),
                description: "8 modules: findRelevantMemories (relevance scoring), memdir (core API), memoryAge (TTL), memoryScan (indexing), memoryTypes (schemas), paths (file management), teamMemPaths (team isolation), teamMemPrompts (injection templates). Memories typed: personal, team, project scope. Each memory tracks: source, whether user-stated or model-inferred, last validated, whether contradicted.".into(),
                why_it_matters: "Without provenance, retrieved memories become another prompt-injection surface. Instruction-like text in retrieved context silently becomes a new system prompt. The aging system prevents stale memories from poisoning decisions.".into(),
                how_to_use: "Store: content, source, is_user_stated, last_validated, is_contradicted. Score relevance. Age out stale entries. Scope by personal/team/project. Never inject unscored memories into system prompt.".into(),
                code_pattern: String::new(),
                source_facts: vec!["py_memory_directory".into()],
                category: PatternCategory::SessionManagement,
                leverage: Leverage::NewCapability,
            },
        ]
    }

    /// Detect additional gamechangers from knowledge base patterns.
    fn detect_from_patterns(kb: &KnowledgeBase) -> Vec<Gamechanger> {
        let mut extras = Vec::new();

        // Check for patterns not already in known list
        let pattern_facts = kb.by_category(&PatternCategory::DesignPattern);
        for (id, fact) in &pattern_facts {
            if fact.impact == ImpactLevel::Gamechanger {
                // Only add if not already covered by known gamechangers
                let already_known = Self::known_gamechangers()
                    .iter()
                    .any(|g| g.source_facts.contains(id));
                if !already_known {
                    extras.push(Gamechanger {
                        id: format!("gc_detected_{}", id),
                        name: fact.title.clone(),
                        tagline: "Detected from code analysis".into(),
                        description: fact.description.clone(),
                        why_it_matters: "Identified as a high-impact pattern through automated code analysis.".into(),
                        how_to_use: "See source code for implementation details.".into(),
                        code_pattern: String::new(),
                        source_facts: vec![id.to_string()],
                        category: fact.category.clone(),
                        leverage: Leverage::TenXMultiplier,
                    });
                }
            }
        }

        extras
    }

    /// Generate a markdown report of all gamechangers.
    pub fn report(gamechangers: &[Gamechanger]) -> String {
        let mut out = String::new();
        out.push_str("# Gamechangers — Transformative Patterns from Claw Code\n\n");
        out.push_str(&format!(
            "> {} patterns identified that fundamentally change agent development.\n\n",
            gamechangers.len()
        ));

        for (i, gc) in gamechangers.iter().enumerate() {
            out.push_str(&format!("---\n\n## {}. {}\n\n", i + 1, gc.name));
            out.push_str(&format!("**{}**\n\n", gc.tagline));
            out.push_str(&format!("**Leverage:** {}\n\n", gc.leverage.label()));
            out.push_str(&format!("**Category:** {}\n\n", gc.category.display_name()));
            out.push_str(&format!("### What\n\n{}\n\n", gc.description));
            out.push_str(&format!("### Why It Matters\n\n{}\n\n", gc.why_it_matters));
            out.push_str(&format!("### How To Use\n\n{}\n\n", gc.how_to_use));
            if !gc.code_pattern.is_empty() {
                out.push_str(&format!("### Code Pattern\n\n```rust\n{}\n```\n\n", gc.code_pattern));
            }
        }

        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_known_gamechangers() {
        let gamechangers = GamechangerDetector::known_gamechangers();
        assert!(gamechangers.len() >= 10);
        assert!(gamechangers.iter().any(|g| g.name.contains("Generic")));
        assert!(gamechangers.iter().any(|g| g.name.contains("Hook")));
    }

    #[test]
    fn test_detect_with_kb() {
        let kb = KnowledgeBase::new();
        let gamechangers = GamechangerDetector::detect(&kb);
        assert!(gamechangers.len() >= 10);
    }

    #[test]
    fn test_report_generation() {
        let gamechangers = GamechangerDetector::known_gamechangers();
        let report = GamechangerDetector::report(&gamechangers);
        assert!(report.contains("# Gamechangers"));
        assert!(report.contains("Generic Trait-Based Runtime"));
    }
}
