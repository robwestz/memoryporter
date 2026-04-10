//! Pre-analyzed knowledge from the Python source code (claw-code-main/src/).
//!
//! These facts fill the 10 gaps identified in EXECUTION_PLAN.md.
//! They were extracted via deep analysis of the Python port's 60+ modules.

use crate::knowledge::{ImpactLevel, KnowledgeBase, KnowledgeFact, PatternCategory};

/// Inject all Python-derived gap facts into a knowledge base.
pub fn seed_python_knowledge(kb: &mut KnowledgeBase) {
    // ── GAP 1: Workflow State & Idempotency ─────────────────────────────
    kb.add_fact(
        "py_workflow_state".into(),
        KnowledgeFact {
            category: PatternCategory::SessionManagement,
            title: "Workflow State & Idempotency".into(),
            description: "StoredSession (frozen dataclass) with session_id as idempotency key. PortingTask (frozen) represents named, replay-safe work units. TranscriptStore implements append-only log with lazy flush and retention window. State transitions via immutable new instances, not mutation.".into(),
            source: "claw-code-main/src/session_store.py, task.py, transcript.py".into(),
            impact: ImpactLevel::Gamechanger,
            related_ids: vec!["py_session_persistence".into(), "py_transcript_compaction".into()],
            tags: vec!["python".into(), "gap1".into(), "idempotency".into(), "state".into()],
        },
    );

    kb.add_fact(
        "py_session_persistence".into(),
        KnowledgeFact {
            category: PatternCategory::SessionManagement,
            title: "Session Persistence (Python)".into(),
            description: "StoredSession is a frozen dataclass with session_id, messages tuple, input_tokens, output_tokens. save_session() writes JSON to disk. load_session() reconstructs full agent state. Sessions survive crashes via per-event persistence.".into(),
            source: "claw-code-main/src/session_store.py".into(),
            impact: ImpactLevel::High,
            related_ids: vec!["py_workflow_state".into()],
            tags: vec!["python".into(), "gap1".into(), "session".into()],
        },
    );

    kb.add_fact(
        "py_transcript_compaction".into(),
        KnowledgeFact {
            category: PatternCategory::SessionManagement,
            title: "Transcript Compaction (Python)".into(),
            description: "TranscriptStore with entries list, flushed flag. compact(keep_last=10) trims to last N entries. replay() returns full tuple for reconstruction. The 3-line auto-compact fix: mutable_messages[:] = mutable_messages[-N:] replaces complex retry logic that caused 3,272 consecutive failures.".into(),
            source: "claw-code-main/src/transcript.py, query_engine.py:129-132".into(),
            impact: ImpactLevel::High,
            related_ids: vec!["py_workflow_state".into(), "py_token_budget".into()],
            tags: vec!["python".into(), "gap1".into(), "compaction".into()],
        },
    );

    // ── GAP 2: System Event Logging ─────────────────────────────────────
    kb.add_fact(
        "py_system_event_logging".into(),
        KnowledgeFact {
            category: PatternCategory::AgenticLoop,
            title: "System Event Logging".into(),
            description: "HistoryLog with append-only HistoryEvent(title, detail) records. Events logged: context loading, registry init (commands/tools counts), routing decisions (match count), execution counts, session persistence paths. Rendered as markdown bullet list. Separate from conversation transcript — answers 'what did the system do' vs 'what did user/agent say'.".into(),
            source: "claw-code-main/src/history.py, runtime.py".into(),
            impact: ImpactLevel::High,
            related_ids: vec!["py_workflow_state".into()],
            tags: vec!["python".into(), "gap2".into(), "logging".into(), "events".into()],
        },
    );

    // ── GAP 3: Doctor Pattern ───────────────────────────────────────────
    kb.add_fact(
        "py_doctor_pattern".into(),
        KnowledgeFact {
            category: PatternCategory::ConfigHierarchy,
            title: "Doctor Pattern (Health Check)".into(),
            description: "Distributed health check system: PrefetchResult checks (keychain, MDM, project scan), ParityAuditResult (archive presence, root/directory/command/tool coverage ratios), trust gating (deferred_init only runs if trusted=True). build_system_init_message() renders full startup state. /doctor command validates API creds, connections, config integrity, tool availability.".into(),
            source: "claw-code-main/src/setup.py, system_init.py, parity_audit.py, prefetch.py".into(),
            impact: ImpactLevel::Gamechanger,
            related_ids: vec!["py_staged_boot".into()],
            tags: vec!["python".into(), "gap3".into(), "health".into(), "doctor".into()],
        },
    );

    // ── GAP 4: Staged Boot Sequence ─────────────────────────────────────
    kb.add_fact(
        "py_staged_boot".into(),
        KnowledgeFact {
            category: PatternCategory::ConfigHierarchy,
            title: "7-Stage Staged Boot Sequence".into(),
            description: "BootstrapGraph defines 7 sequential stages: (1) top-level prefetch side effects, (2) warning handler and environment guards, (3) CLI parser and pre-action trust gate, (4) setup() + commands/agents parallel load, (5) deferred init after trust [TRUST GATE — plugins, skills, MCP, session hooks only if trusted], (6) mode routing: local/remote/ssh/teleport/direct/deep, (7) query engine submit loop. Each stage is gated on the previous. Agent has situational awareness before user's first prompt.".into(),
            source: "claw-code-main/src/bootstrap_graph.py, deferred_init.py, setup.py, runtime.py".into(),
            impact: ImpactLevel::Gamechanger,
            related_ids: vec!["py_doctor_pattern".into(), "py_deferred_init".into()],
            tags: vec!["python".into(), "gap4".into(), "boot".into(), "stages".into()],
        },
    );

    kb.add_fact(
        "py_deferred_init".into(),
        KnowledgeFact {
            category: PatternCategory::ConfigHierarchy,
            title: "Trust-Gated Deferred Init".into(),
            description: "DeferredInitResult (frozen dataclass) with trusted flag controlling: plugin_init, skill_init, mcp_prefetch, session_hooks. All four are gated on trusted=True. Separates safe startup (stages 1-4) from privileged operations (stage 5). Defense in depth: untrusted sessions get limited capabilities.".into(),
            source: "claw-code-main/src/deferred_init.py".into(),
            impact: ImpactLevel::High,
            related_ids: vec!["py_staged_boot".into()],
            tags: vec!["python".into(), "gap4".into(), "trust".into(), "deferred".into()],
        },
    );

    // ── GAP 5: Token Budget & Cost Tracking ─────────────────────────────
    kb.add_fact(
        "py_token_budget".into(),
        KnowledgeFact {
            category: PatternCategory::CostTracking,
            title: "Pre-Turn Token Budget Checking".into(),
            description: "QueryEngineConfig defines max_turns (8), max_budget_tokens (2000), compact_after_turns (12). Budget checked BEFORE applying the turn: projected_usage = total_usage.add_turn(prompt, output); if projected > max_budget_tokens → stop_reason = 'max_budget_reached'. Prevents overage by design. CostTracker accumulates events as 'label:units' pairs. costHook applies recording as post-execution hook.".into(),
            source: "claw-code-main/src/query_engine.py:61-104, cost_tracker.py, costHook.py".into(),
            impact: ImpactLevel::Gamechanger,
            related_ids: vec!["py_transcript_compaction".into(), "py_stop_reasons".into()],
            tags: vec!["python".into(), "gap5".into(), "budget".into(), "tokens".into(), "cost".into()],
        },
    );

    kb.add_fact(
        "py_stop_reasons".into(),
        KnowledgeFact {
            category: PatternCategory::AgenticLoop,
            title: "Stop Reason Taxonomy".into(),
            description: "Every conversation end has a name: 'completed' (natural finish), 'max_budget_reached' (token limit), 'max_turns_reached' (turn limit). Checked before processing, not after. Stop reason included in final streaming event and TurnResult. Enables UI to show appropriate messaging.".into(),
            source: "claw-code-main/src/query_engine.py".into(),
            impact: ImpactLevel::High,
            related_ids: vec!["py_token_budget".into()],
            tags: vec!["python".into(), "gap5".into(), "stop_reason".into()],
        },
    );

    // ── GAP 6: Tool Pool Assembly ───────────────────────────────────────
    kb.add_fact(
        "py_tool_pool_assembly".into(),
        KnowledgeFact {
            category: PatternCategory::ToolSystem,
            title: "Three-Layer Tool Pool Assembly".into(),
            description: "Not every conversation needs every tool. ToolPool assembles session-specific tools via 3-layer filtering: (1) Mode Flags — simple_mode restricts to {BashTool, FileReadTool, FileEditTool}, (2) Feature Flags — include_mcp excludes MCP tools by name/source_hint matching, (3) Permission Context — ToolPermissionContext with frozenset deny_names (O(1) exact match) + deny_prefixes tuple (prefix matching). Fewer tools = smaller prompts, faster responses, better security, lower cost.".into(),
            source: "claw-code-main/src/tool_pool.py, tools.py, permissions.py".into(),
            impact: ImpactLevel::Gamechanger,
            related_ids: vec!["py_permission_audit".into()],
            tags: vec!["python".into(), "gap6".into(), "tool_pool".into(), "filtering".into()],
        },
    );

    // ── GAP 7: Permission Audit Trail ───────────────────────────────────
    kb.add_fact(
        "py_permission_audit".into(),
        KnowledgeFact {
            category: PatternCategory::PermissionModel,
            title: "Permission Audit Trail with Three Handler Types".into(),
            description: "PermissionDenial (frozen dataclass: tool_name, reason) accumulated per-session in QueryEnginePort.permission_denials. Three handler types: (1) interactiveHandler — user confirmation UI, (2) coordinatorHandler — multi-agent orchestration denials, (3) swarmWorkerHandler — worker role restrictions. Denials inferred eagerly at routing time (pre-execution). Included in TurnResult for streaming. Every permission decision — granted and denied — logged with context to enable replay.".into(),
            source: "claw-code-main/src/permissions.py, runtime.py, query_engine.py, hooks/toolPermission/".into(),
            impact: ImpactLevel::High,
            related_ids: vec!["py_tool_pool_assembly".into()],
            tags: vec!["python".into(), "gap7".into(), "audit".into(), "permission".into()],
        },
    );

    // ── GAP 8: Coordinator System ───────────────────────────────────────
    kb.add_fact(
        "py_coordinator_system".into(),
        KnowledgeFact {
            category: PatternCategory::SubAgent,
            title: "Coordinator System (Multi-Agent Orchestration)".into(),
            description: "Coordinator mode is a separate runtime mode (distinct from normal, ssh, teleport, deep-link). coordinatorMode.ts handles: mode selection logic, agent delegation, message routing between agents. Coordinator has unique permission rules via coordinatorHandler. Enables splitting complex tasks across specialized agents while maintaining central orchestration. Python port: archived placeholder awaiting migration.".into(),
            source: "claw-code-main/src/coordinator/, reference_data/subsystems/coordinator.json".into(),
            impact: ImpactLevel::High,
            related_ids: vec!["py_permission_audit".into()],
            tags: vec!["python".into(), "gap8".into(), "coordinator".into(), "multi-agent".into()],
        },
    );

    // ── GAP 9: Memory Directory ─────────────────────────────────────────
    kb.add_fact(
        "py_memory_directory".into(),
        KnowledgeFact {
            category: PatternCategory::SessionManagement,
            title: "8-Module File-Based Memory System".into(),
            description: "Memory subsystem with 8 modules: (1) findRelevantMemories — relevance scoring/retrieval, (2) memdir — core file-based API, (3) memoryAge — aging/TTL logic, (4) memoryScan — directory scanning and indexing, (5) memoryTypes — record schemas (personal, team, project scope), (6) paths — file path management, (7) teamMemPaths — team-scoped isolation, (8) teamMemPrompts — prompt templates for memory injection. Key insight: memory without provenance becomes accumulated hallucination.".into(),
            source: "claw-code-main/src/memdir/, reference_data/subsystems/memdir.json".into(),
            impact: ImpactLevel::Gamechanger,
            related_ids: vec!["py_coordinator_system".into()],
            tags: vec!["python".into(), "gap9".into(), "memory".into(), "relevance".into(), "aging".into()],
        },
    );

    // ── GAP 10: Hooks Architecture ──────────────────────────────────────
    kb.add_fact(
        "py_hooks_architecture".into(),
        KnowledgeFact {
            category: PatternCategory::HookSystem,
            title: "104-Module Hooks Architecture".into(),
            description: "Hooks subsystem with 104 modules across categories: (1) Notifications — 16 modules (deprecation warnings, subscription status, auto-mode), (2) Tool Permission — 4 modules (PermissionContext, interactiveHandler, coordinatorHandler, swarmWorkerHandler, permissionLogging), (3) UI State — fileSuggestions, unifiedSuggestions, renderPlaceholder. Streaming integration: query engine yields typed events (message_start, command_match, tool_match, permission_denial, message_delta, message_stop) as pre/post hook points. Every streaming event is a hook opportunity.".into(),
            source: "claw-code-main/src/hooks/, reference_data/subsystems/hooks.json, query_engine.py:106-127".into(),
            impact: ImpactLevel::Gamechanger,
            related_ids: vec!["py_permission_audit".into(), "py_tool_pool_assembly".into()],
            tags: vec!["python".into(), "gap10".into(), "hooks".into(), "streaming".into(), "events".into()],
        },
    );

    // ── GAP 5 Supplemental: Streaming Events ────────────────────────────
    kb.add_fact(
        "py_streaming_events".into(),
        KnowledgeFact {
            category: PatternCategory::Streaming,
            title: "Typed Streaming Events Architecture".into(),
            description: "Query engine yields typed dict events: message_start (session metadata), command_match (matched commands), tool_match (matched tools), permission_denial (denied tools with reasons), message_delta (streaming text), message_stop (usage stats + stop_reason). Each event communicates meaningful state, not just text fragments. Enables real-time course correction — user can intervene mid-thought by watching event stream.".into(),
            source: "claw-code-main/src/query_engine.py:106-127".into(),
            impact: ImpactLevel::High,
            related_ids: vec!["py_hooks_architecture".into(), "py_stop_reasons".into()],
            tags: vec!["python".into(), "streaming".into(), "events".into()],
        },
    );

    // Cross-reference all gaps
    let _gap_ids = vec![
        "py_workflow_state", "py_session_persistence", "py_transcript_compaction",
        "py_system_event_logging", "py_doctor_pattern", "py_staged_boot",
        "py_deferred_init", "py_token_budget", "py_stop_reasons",
        "py_tool_pool_assembly", "py_permission_audit", "py_coordinator_system",
        "py_memory_directory", "py_hooks_architecture", "py_streaming_events",
    ];
    // Link Python facts to their Rust counterparts where applicable
    let rust_python_pairs = [
        ("py_session_persistence", "struct_session"),
        ("py_token_budget", "struct_usagetracker"),
        ("py_tool_pool_assembly", "struct_toolspec"),
        ("py_permission_audit", "enum_permissionmode"),
        ("py_hooks_architecture", "struct_hookrunner"),
        ("py_streaming_events", "struct_sseparser"),
    ];
    for (py_id, rs_id) in &rust_python_pairs {
        kb.add_relation(py_id, rs_id);
    }
}

/// Count how many Python seed facts exist.
pub fn python_seed_count() -> usize {
    15
}
