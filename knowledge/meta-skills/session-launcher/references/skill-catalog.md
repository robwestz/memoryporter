# Skill Catalog

> Complete listing of every known skill — name, trigger phrases, what it does,
> when to use, when NOT to use. Built from actual SKILL.md files on disk.
>
> Last updated: 2026-04-13

---

## Meta-Skills (knowledge/meta-skills/)

These are production-grade skill packages with templates, references, and scripts.

### 200k-blueprint

| Field | Value |
|-------|-------|
| **What it does** | Turns a product concept into a complete technical blueprint — architecture, stack, directory structure, quality gates, and skill map |
| **Triggers** | "build X", "new product", "I want to create...", "200k blueprint", "design the architecture for", "what would it take to build" |
| **When to use** | First step before any 200k-repo build. When evaluating whether a product idea is worth building. |
| **When NOT to use** | When you already have a blueprint and need to execute (use buildr-operator). When forging a single skill (use skill-forge). |
| **Category** | orchestrator |

### 200k-pipeline

| Field | Value |
|-------|-------|
| **What it does** | Master production line that bundles skill-forge + 200k-blueprint + Archon workflow templates. Routes to sub-skills based on intent. |
| **Triggers** | "forge a skill", "create a skill package", "200k blueprint", "build a product", "new product", "turn this into a skill", "design the architecture for", "skill pipeline", "production line" |
| **When to use** | Any request to produce a structured skill package or product blueprint from knowledge, code, or a concept. |
| **When NOT to use** | Simple file edits. Tasks that don't produce a skill or blueprint as output. |
| **Category** | meta |

### code-review-checklist

| Field | Value |
|-------|-------|
| **What it does** | Structured PR review producing severity-ranked checklist across correctness, security, performance, style, testing, documentation |
| **Triggers** | "review this PR", "code review", "check this pull request", "PR review", "review the diff", "go through this PR", "what's wrong with this PR" |
| **When to use** | Reviewing a finished PR before merge. Getting a second-pass review. Evaluating a diff or branch comparison. |
| **When NOT to use** | Writing new code (not a review). Architecture discussions (no diff to review). |
| **Category** | analyzer |

### generation-pipeline

| Field | Value |
|-------|-------|
| **What it does** | Orchestrates the full multi-pass generation sequence for a skill-based writing tool: sources, compiled prompt, outline, draft, quality check |
| **Triggers** | "generate document", "run generation pipeline", "start generation", "generate with skill" |
| **When to use** | When a validated Brief has been submitted and a complete generated document is the expected output. |
| **When NOT to use** | Freeform writing without a Brief. Code generation (wrong pipeline). |
| **Category** | orchestrator |

### kb-document-factory

| Field | Value |
|-------|-------|
| **What it does** | Governs article structure, format selection, quality enforcement, and cross-referencing for all three KB layers (domain, methods, components) |
| **Triggers** | "write a KB article", "add to the knowledge base", "compile this into the KB", "create a cheat sheet for X", "document this method" |
| **When to use** | Creating or updating any document in a knowledge base. Structuring raw knowledge into KB articles. |
| **When NOT to use** | Writing code. Creating skills (use skill-forge). General documentation outside a KB. |
| **Category** | formatter |

### market-intelligence-report

| Field | Value |
|-------|-------|
| **What it does** | Produces consulting-grade competitive intelligence reports. Seven-phase process: Scope, Discover, Map, Size, Analyze, Position, Deliver. |
| **Triggers** | "competitive analysis for [niche]", "market intelligence report", "who are the competitors in [space]", "is there room in [market]", "competitive landscape", "market sizing" |
| **When to use** | Founder needs competitive landscape. Investor needs market sizing. Product team needs positioning whitespace. |
| **When NOT to use** | When you need primary research (expert interviews, mystery shopping). Internal product analysis. |
| **Category** | researcher |

### repo-rescue

| Field | Value |
|-------|-------|
| **What it does** | Autonomously rescues stuck, broken, or abandoned repositories through DISCOVER, DIAGNOSE, PLAN, FIX, REPORT workflow |
| **Triggers** | "rescue this repo", "unstick this project", "fix this broken codebase", "repo is stuck", "get this building again", "diagnose this codebase", "triage this project", "the build is broken", "nothing works and I don't know where to start" |
| **When to use** | Build is failing with unclear root cause. Repo abandoned for months. CI red with no obvious fix. Pre-sprint triage. |
| **When NOT to use** | Single specific bug already identified. Greenfield project (nothing to rescue). Refactoring a working codebase. |
| **Category** | analyzer |

### seo-article-audit

| Field | Value |
|-------|-------|
| **What it does** | Audits backlink SEO articles in two layers: mechanical QA (11 checks) + editorial quality (8 dimensions) |
| **Triggers** | "audit this article", "check this backlink article", "is this article ready to publish", "QA this SEO article", "review article quality" |
| **When to use** | Reviewing a finished article before publishing. Grading articles against BACOWR quality standard. Training writers. |
| **When NOT to use** | Writing articles (this audits, not generates). Non-SEO content review. |
| **Category** | analyzer |

### session-launcher

| Field | Value |
|-------|-------|
| **What it does** | Takes a task intent and produces a complete startup prompt for a new Codex session |
| **Triggers** | "launch session for", "prepare a session", "session launcher", "startup prompt for", "what skills do I need for", "plan a session", "handoff prompt" |
| **When to use** | Starting a new session for a known task. Preparing handoff prompts. Auditing skill coverage. |
| **When NOT to use** | Trivial tasks. When you need to create a missing skill (use skill-forge first). |
| **Category** | meta |

### showcase-presenter

| Field | Value |
|-------|-------|
| **What it does** | Generates professional project showcases from build artifacts, reports, or skill packages. Two modes: Report (narrative) and Demo (capability inventory). |
| **Triggers** | "showcase this project", "make a presentation from these reports", "demo showcase", "generate a showcase", "present what was built", "document audit", "capability demo" |
| **When to use** | Presenting what was built. Creating capability demos. Auditing documentation health. Turning build reports into stakeholder artifacts. |
| **When NOT to use** | Building new features. Writing code. Planning (this presents, not plans). |
| **Category** | formatter |

### skill-forge

| Field | Value |
|-------|-------|
| **What it does** | Production line for creating marketplace-ready agent skill packages. 6-step process: ANALYZE, OUTLINE, SCAFFOLD, AUTHOR, VERIFY, PACKAGE. |
| **Triggers** | "forge a skill", "create a skill package", "build a skill from this codebase", "turn this into a marketplace skill", "skill-forge" |
| **When to use** | Creating a new skill from scratch. Converting a workflow into a distributable skill. Restructuring a prototype to commercial standard. |
| **When NOT to use** | Testing/evaluating an existing skill (use skill-creator). Using an existing skill. |
| **Category** | meta |

### skill-template-engine

| Field | Value |
|-------|-------|
| **What it does** | Compiles a SkillTemplate definition and user Brief into a fully-structured prompt architecture ready for Claude |
| **Triggers** | "compile skill template", "build prompt architecture", "run template engine", "skill-template-engine" |
| **When to use** | Building the prompt for any skill-based generation. Compiling a new skill definition. Validating a Brief against skill requirements. |
| **When NOT to use** | General prompting (not skill-template based). Direct code generation. |
| **Category** | orchestrator |

### source-grounding

| Field | Value |
|-------|-------|
| **What it does** | Fetches real web sources via search API, verifies each URL resolves with relevant content, injects verified excerpts into generation context |
| **Triggers** | "ground sources", "fetch sources for topic", "source-grounding", "verify citations", "find real sources" |
| **When to use** | Any generation requiring cited sources. When citation_required: true. When a Brief includes topics that could produce hallucinated references. |
| **When NOT to use** | Code generation (no citations needed). Internal documentation. Opinion pieces. |
| **Category** | researcher |

### youtube-video-digest

| Field | Value |
|-------|-------|
| **What it does** | Extracts YouTube video content into structured notes without an API key. Transcript, summary, key points, Q&A pairs. |
| **Triggers** | "summarize this video", "key points from YouTube", "transcript for this video", "what does this video cover", "turn this into notes", "digest this YouTube video" |
| **When to use** | Any YouTube URL provided. Extracting knowledge from video content. Creating notes from presentations. |
| **When NOT to use** | Non-YouTube video content. When a transcript is already available. |
| **Category** | researcher |

---

## Global Skills (~/.codex/skills/, fallback ~/.claude/skills/)

These are installed skills available across all projects.

### 200k-pipeline (global copy)

Duplicate of meta-skill. See above.

### advanced-evaluation

| Field | Value |
|-------|-------|
| **What it does** | Production-grade LLM-as-judge evaluation — direct scoring, pairwise comparison, position bias mitigation |
| **Triggers** | "implement LLM-as-judge", "compare model outputs", "create evaluation rubrics", "mitigate evaluation bias" |
| **When to use** | Building evaluation pipelines. Comparing multiple model responses. Establishing quality standards. Debugging inconsistent evaluation. |
| **When NOT to use** | Evaluating non-LLM outputs. Simple pass/fail testing. |
| **Category** | analyzer |

### agent-create-roadmap

| Field | Value |
|-------|-------|
| **What it does** | Creates ROADMAP.md with phase definitions from project context |
| **Triggers** | "/agent:create-roadmap", needs project phases, wants a ROADMAP.md |
| **When to use** | After /agent:new-project completes. When PROJECT.md exists but ROADMAP.md is empty. |
| **When NOT to use** | When a roadmap already exists. When you need to execute phases (use agent-execute-phase). |
| **Category** | orchestrator |

### agent-evaluation

| Field | Value |
|-------|-------|
| **What it does** | Quality engineering for agents — behavioral regression tests, capability assessments, reliability metrics |
| **Triggers** | "evaluate agent", "agent quality", "agent testing", "agent reliability" |
| **When to use** | Testing agent performance systematically. Building test frameworks. Measuring quality. |
| **When NOT to use** | Testing non-agent software. Unit testing regular code. |
| **Category** | analyzer |

### agent-execute-phase

| Field | Value |
|-------|-------|
| **What it does** | Runs all plans in a phase using wave-based parallel execution |
| **Triggers** | "/agent:execute-phase", "run all plans in phase", "parallel execution" |
| **When to use** | After /agent:plan-phase completes. When multiple plans need parallel execution. |
| **When NOT to use** | Single plan execution (use agent-execute-plan). When plans haven't been created yet. |
| **Category** | orchestrator |

### agent-execute-plan

| Field | Value |
|-------|-------|
| **What it does** | Executes the next incomplete plan from PLAN.md files |
| **Triggers** | "/agent:execute-plan", "run the next plan", "execute tasks" |
| **When to use** | PLAN.md files exist and need execution. After /agent:plan-phase completes. |
| **When NOT to use** | When no plans exist. When you need to create plans first (use agent-plan-phase). |
| **Category** | orchestrator |

### agent-framework

| Field | Value |
|-------|-------|
| **What it does** | Transforms AI coding assistants into structured, quality-focused development agents |
| **Triggers** | "agent framework", "agent commands", "/agent:*" commands |
| **When to use** | Project has .agent/ directory. Initializing agent framework. Asking about agent commands. |
| **When NOT to use** | Projects not using the agent framework. Simple tasks that don't need structured workflow. |
| **Category** | orchestrator |

### agent-go

| Field | Value |
|-------|-------|
| **What it does** | Autonomous project execution — detects current state and runs until complete or checkpoint |
| **Triggers** | "/agent:go", "run autonomously", "start building" |
| **When to use** | Starting or continuing autonomous project execution. When the framework should auto-detect next action. |
| **When NOT to use** | When you need fine-grained control over each step. Exploratory work. |
| **Category** | orchestrator |

### agent-install

| Field | Value |
|-------|-------|
| **What it does** | Installs Agent Intelligence Framework (.agent/ folder) in a project |
| **Triggers** | "/agent:install", "set up agent framework", "initialize .agent" |
| **When to use** | New project needs agent framework. No .agent/ folder exists yet. |
| **When NOT to use** | Framework already installed. Project uses a different workflow system. |
| **Category** | orchestrator |

### agent-new-project

| Field | Value |
|-------|-------|
| **What it does** | Initializes a new project with deep context gathering and PROJECT.md |
| **Triggers** | "/agent:new-project", "start a new structured project" |
| **When to use** | Starting a fresh structured project. No .agent/02-PROJECT.md exists. |
| **When NOT to use** | Existing project (use agent-install or agent-go). Unstructured exploration. |
| **Category** | orchestrator |

### agent-plan-phase

| Field | Value |
|-------|-------|
| **What it does** | Creates detailed PLAN.md files for a specific phase from ROADMAP.md |
| **Triggers** | "/agent:plan-phase", "create plans for phase", "break down phase" |
| **When to use** | ROADMAP.md exists with phase definitions. Need executable plans before building. |
| **When NOT to use** | No roadmap exists (create one first). When plans already exist for the phase. |
| **Category** | orchestrator |

### agent-plugin

| Field | Value |
|-------|-------|
| **What it does** | Launches plugins/mini-projects in separate context windows without interrupting main workflow |
| **Triggers** | "/agent:plugin", "side-task", "mini-project", "spawn work" |
| **When to use** | Need to run side-task without interrupting main work. Quick project in separate context. |
| **When NOT to use** | Main workflow tasks. Tasks that need main context. |
| **Category** | orchestrator |

### agent-status

| Field | Value |
|-------|-------|
| **What it does** | Shows current project status — phase, plan, identity, progress |
| **Triggers** | "/agent:status", "what's the status?", "project progress" |
| **When to use** | Checking current position in project. Seeing overall progress. |
| **When NOT to use** | When you need to take action (use agent-go or agent-execute-plan). |
| **Category** | orchestrator |

### agentic-workflow-orchestration

| Field | Value |
|-------|-------|
| **What it does** | Multi-agent coordination, orchestrator-worker patterns, /plan decomposition for GitHub Agentic Workflows |
| **Triggers** | "orchestrate workflows", "orchestrator-worker pattern", "/plan decomposition", "coordinate agents" |
| **When to use** | Breaking down complex automation into coordinated workflows. Implementing multi-agent patterns. Using /plan for issue decomposition. |
| **When NOT to use** | Single-agent tasks. Simple linear workflows. |
| **Category** | orchestrator |

### asyncreview

| Field | Value |
|-------|-------|
| **What it does** | AI-powered GitHub PR/Issue reviews with agentic codebase access |
| **Triggers** | "review pull request", "PR feedback", "analyze code changes", "check this PR" |
| **When to use** | Reviewing PRs on GitHub. Getting AI feedback on code changes. Checking if a PR breaks functionality. |
| **When NOT to use** | Local-only code review (use code-review-checklist). Non-GitHub PRs. |
| **Category** | analyzer |

### bdi-mental-states

| Field | Value |
|-------|-------|
| **What it does** | Transforms RDF context into agent mental states (beliefs, desires, intentions) using BDI ontology |
| **Triggers** | "model agent mental states", "implement BDI architecture", "create belief-desire-intention models", "build cognitive agent" |
| **When to use** | Building cognitive agents. Implementing BDI frameworks. Enabling explainability through reasoning chains. |
| **When NOT to use** | Simple agents without cognitive requirements. Non-agent software. |
| **Category** | builder |

### browser-use

| Field | Value |
|-------|-------|
| **What it does** | Automates browser interactions — web testing, form filling, screenshots, data extraction |
| **Triggers** | "browse website", "fill form", "take screenshot", "extract from web page", "web testing" |
| **When to use** | Navigating websites. Interacting with web pages. Taking screenshots. Extracting web data. |
| **When NOT to use** | API-based data fetching. Static file processing. |
| **Category** | builder |

### buildr-executor

| Field | Value |
|-------|-------|
| **What it does** | Executes a Buildr workspace wave by wave to completion |
| **Triggers** | "bygg projektet", "kör workspace", "fortsätt projektet", "execute the project", "run the workspace", "next wave" |
| **When to use** | Opening a project with WORKSPACE.md, RUN.md, and state/orchestration.yaml. Building a Buildr project. |
| **When NOT to use** | No workspace exists (use buildr-operator first). Non-Buildr projects. |
| **Category** | builder |

### buildr-operator

| Field | Value |
|-------|-------|
| **What it does** | Produces a complete agent-executable project workspace from a human project description |
| **Triggers** | "bygg", "skapa", "jag vill ha", "projekt", "build", "create", "I want", "make me" |
| **When to use** | User wants to build something — website, app, tool, SaaS. User provides a project description. |
| **When NOT to use** | Executing an existing workspace (use buildr-executor). Rescuing a broken project (use buildr-rescue). |
| **Category** | builder |

### buildr-rescue

| Field | Value |
|-------|-------|
| **What it does** | Rescues stuck, broken, or abandoned projects — scans codebase, diagnoses, wraps Buildr workspace, generates fix-waves |
| **Triggers** | "fixa detta projekt", "det har kört fast", "ta över", "debug", "rescue", "stuck", "broken project", "fix this" |
| **When to use** | Existing project stalled, has bugs, architectural problems, or was abandoned. Taking over from another developer/agent. |
| **When NOT to use** | Starting from zero (use buildr-operator). The project works fine (use code-review-checklist for improvement). |
| **Category** | analyzer |

### buildr-scout

| Field | Value |
|-------|-------|
| **What it does** | Extracts actionable knowledge from external sources and converts to Buildr system artifacts |
| **Triggers** | "analysera", "extrahera", "researcha", "undersök", "analyze", "extract", "research", "investigate", "scout" |
| **When to use** | User provides an article/URL/doc for extraction. System needs to absorb new patterns. Research for architectural decisions. |
| **When NOT to use** | Building code (use buildr-operator). Internal code review (use code-review-checklist). |
| **Category** | researcher |

### buildr-smith

| Field | Value |
|-------|-------|
| **What it does** | Creates and maintains agnostic Vault items — skills, constraints, strategies, routines, memory templates |
| **Triggers** | "ny skill", "lägg till constraint", "skapa rutin", "vault item", "new skill", "add to vault", "memory template" |
| **When to use** | Adding new skills to the Vault. Creating constraints, strategies, routines. Improving existing Vault items. |
| **When NOT to use** | Creating distributable skill packages (use skill-forge). Using existing vault items (use buildr-executor). |
| **Category** | meta |

### context-compression

| Field | Value |
|-------|-------|
| **What it does** | Strategies for compressing context — structured summarization, tokens-per-task optimization |
| **Triggers** | "compress context", "summarize conversation history", "implement compaction", "reduce token usage" |
| **When to use** | Agent sessions exceed context limits. Designing summarization strategies. Debugging agents that forget. |
| **When NOT to use** | Context is not the bottleneck. Simple short conversations. |
| **Category** | context |

### context-degradation

| Field | Value |
|-------|-------|
| **What it does** | Patterns for recognizing and mitigating context failures — lost-in-middle, poisoning, attention drift |
| **Triggers** | "diagnose context problems", "fix lost-in-middle", "debug agent failures", "context poisoning" |
| **When to use** | Agent performance degrades unexpectedly. Debugging incorrect outputs. Designing systems for large contexts. |
| **When NOT to use** | Context is small and working fine. Non-agent applications. |
| **Category** | context |

### context-engineering-collection

| Field | Value |
|-------|-------|
| **What it does** | Comprehensive collection of context engineering skills — umbrella over fundamentals, optimization, compression, degradation |
| **Triggers** | "context engineering", "build agent system", "optimize agent", "debug agent context" |
| **When to use** | Building new agent systems. Optimizing existing agent performance. Multi-agent architectures. |
| **When NOT to use** | When you know which specific context skill you need (use it directly). |
| **Category** | context |

### context-fundamentals

| Field | Value |
|-------|-------|
| **What it does** | Foundational understanding of context engineering — components, attention mechanics, progressive disclosure, budgeting |
| **Triggers** | "understand context", "explain context windows", "design agent architecture", "debug context issues" |
| **When to use** | Designing new agent systems. Debugging unexpected behavior. Onboarding to context engineering. |
| **When NOT to use** | Already deep in implementation (use context-optimization). |
| **Category** | context |

### context-optimization

| Field | Value |
|-------|-------|
| **What it does** | Extends effective context capacity through compression, masking, caching, partitioning |
| **Triggers** | "optimize context", "reduce token costs", "improve context efficiency", "KV-cache optimization", "partition context" |
| **When to use** | Context limits constrain task complexity. Cost reduction. Latency reduction. Production systems at scale. |
| **When NOT to use** | Context is not the bottleneck. Prototyping phase where optimization is premature. |
| **Category** | context |

### critique

| Field | Value |
|-------|-------|
| **What it does** | UX evaluation — visual hierarchy, information architecture, emotional resonance, cognitive load, quantitative scoring |
| **Triggers** | "review design", "critique", "evaluate design", "give feedback on design", "UX review" |
| **When to use** | Reviewing UI/UX designs. Evaluating components. Getting design feedback. |
| **When NOT to use** | Code review (use code-review-checklist). Backend logic review. |
| **Category** | analyzer |

### evaluation

| Field | Value |
|-------|-------|
| **What it does** | Evaluation methods for agent systems — behavioral testing, capability assessment, quality gates |
| **Triggers** | "evaluate agent performance", "build test framework", "measure agent quality", "create evaluation rubrics" |
| **When to use** | Testing agent performance. Validating context engineering choices. Building quality gates. |
| **When NOT to use** | Evaluating non-agent software. Simple unit testing. |
| **Category** | analyzer |

### filesystem-context

| Field | Value |
|-------|-------|
| **What it does** | Offloads context to filesystem — dynamic discovery, tool output persistence, agent scratch pads |
| **Triggers** | "offload context to files", "dynamic context discovery", "filesystem for agent memory", "reduce context bloat" |
| **When to use** | Tool outputs bloating context. Agents need state persistence. Sub-agents sharing information. Tasks exceed context window. |
| **When NOT to use** | Context window is sufficient. Simple single-turn tasks. |
| **Category** | context |

### find-skills

| Field | Value |
|-------|-------|
| **What it does** | Discovers and installs agent skills from the open ecosystem |
| **Triggers** | "how do I do X", "find a skill for X", "is there a skill that can...", "extend capabilities" |
| **When to use** | Looking for functionality that might exist as a skill. Searching for tools or templates. |
| **When NOT to use** | You already know which skill to use. Building a new skill (use skill-forge). |
| **Category** | meta |

### harness-engineering

| Field | Value |
|-------|-------|
| **What it does** | Sets up agent-first engineering harness — AGENTS.md, documentation structure, architecture boundaries, .harness/ config |
| **Triggers** | "harness this repo", "set up harness", "agent-first setup", "make this agent-ready", "set up AGENTS.md" |
| **When to use** | Making a repo agent-ready. Setting up AGENTS.md. Defining domain boundaries. Auditing agent readiness. |
| **When NOT to use** | Repo already has a working harness. Non-codebase projects. |
| **Category** | infra |

### hosted-agents

| Field | Value |
|-------|-------|
| **What it does** | Hosted agent infrastructure — sandboxed VMs, background coding agents, multiplayer sessions |
| **Triggers** | "build background agent", "create hosted coding agent", "sandboxed execution", "multiplayer agent" |
| **When to use** | Building background agents. Designing sandboxed environments. Scaling agent infrastructure. |
| **When NOT to use** | Local-only agent work. Simple single-agent tasks. |
| **Category** | infra |

### last30days

| Field | Value |
|-------|-------|
| **What it does** | Deep research across 10+ sources (Reddit, X, YouTube, TikTok, HN, etc.) for last 30 days. AI-synthesized cited reports. |
| **Triggers** | "last30 [topic]", "recent research on", "what happened with [X] recently", "last 30 days" |
| **When to use** | Recency research on any topic. Competitive intelligence. Trend analysis. |
| **When NOT to use** | Historical research (older than 30 days). Well-known facts that don't change. |
| **Category** | researcher |

### memory-systems

| Field | Value |
|-------|-------|
| **What it does** | Memory architecture design — temporal knowledge graphs, vector stores, entity memory, cross-session persistence |
| **Triggers** | "implement agent memory", "persist state across sessions", "build knowledge graph", "track entities" |
| **When to use** | Building agents that persist across sessions. Implementing reasoning over accumulated knowledge. |
| **When NOT to use** | Single-session agents. Simple stateless tools. |
| **Category** | context |

### multi-agent-patterns

| Field | Value |
|-------|-------|
| **What it does** | Multi-agent architecture patterns — supervisor, swarm, context isolation, agent handoffs |
| **Triggers** | "design multi-agent system", "supervisor pattern", "swarm architecture", "coordinate multiple agents" |
| **When to use** | Tasks exceed single-agent context limits. Natural decomposition into parallel subtasks. Different subtasks need different tools. |
| **When NOT to use** | Simple tasks that fit in one context. When coordination overhead exceeds benefit. |
| **Category** | orchestrator |

### openclaw-secure-linux-cloud

| Field | Value |
|-------|-------|
| **What it does** | Self-hosting OpenClaw on cloud servers — SSH tunneling, Tailscale, Podman, token auth, tool permissions |
| **Triggers** | "self-host OpenClaw", "harden remote gateway", "SSH tunnel for OpenClaw", "secure deployment" |
| **When to use** | Deploying OpenClaw on a cloud server. Hardening a remote gateway. Choosing exposure strategy. |
| **When NOT to use** | Local development. Non-OpenClaw deployments. |
| **Category** | infra |

### polish

| Field | Value |
|-------|-------|
| **What it does** | Final quality pass — alignment, spacing, consistency, micro-detail fixes before shipping |
| **Triggers** | "polish", "finishing touches", "pre-launch review", "something looks off", "good to great" |
| **When to use** | Right before shipping. When something feels off but you can't pinpoint it. Final QA pass. |
| **When NOT to use** | Early development (polish later). Major feature work still pending. |
| **Category** | analyzer |

### project-development

| Field | Value |
|-------|-------|
| **What it does** | LLM project lifecycle — batch pipeline design, task-model fit evaluation, cost estimation, architecture |
| **Triggers** | "start an LLM project", "design batch pipeline", "evaluate task-model fit", "structure agent project" |
| **When to use** | Starting an LLM-based project. Designing pipelines. Evaluating whether a task fits an LLM. |
| **When NOT to use** | Non-LLM projects. Simple scripting tasks. |
| **Category** | builder |

### secure-linux-web-hosting

| Field | Value |
|-------|-------|
| **What it does** | Cloud server setup — DNS, SSH, firewalls, Nginx, static-site hosting, HTTPS, reverse proxy |
| **Triggers** | "set up server", "harden cloud server", "nginx setup", "HTTPS with Let's Encrypt", "deploy to VPS" |
| **When to use** | Setting up a cloud server. Configuring Nginx. Setting up HTTPS. Deploying web apps. |
| **When NOT to use** | Managed hosting (Vercel, Netlify). Local development. |
| **Category** | infra |

### showcase-presenter (global copy)

Duplicate of meta-skill. See above.

### supabase-postgres-best-practices

| Field | Value |
|-------|-------|
| **What it does** | Postgres performance optimization from Supabase — query optimization, schema design, database configuration |
| **Triggers** | "optimize postgres", "database performance", "schema design", "supabase best practices" |
| **When to use** | Writing, reviewing, or optimizing Postgres queries. Schema design. Database configuration. |
| **When NOT to use** | Non-Postgres databases. Application-level logic. |
| **Category** | builder |

### team-architect

| Field | Value |
|-------|-------|
| **What it does** | Designs and launches optimal Claude Code agent teams — asks strategic questions before spawning |
| **Triggers** | "agent team", "team architect", "parallel agents", "multi-agent", "team plan" |
| **When to use** | Task clearly benefits from parallel independent work. Need to design an agent team. |
| **When NOT to use** | Simple single-agent tasks. Tasks with tight sequential dependencies. |
| **Category** | orchestrator |

### test-driven-development

| Field | Value |
|-------|-------|
| **What it does** | TDD workflow — write tests before implementation code |
| **Triggers** | "implement feature", "before writing implementation", "TDD", "test first" |
| **When to use** | Implementing any feature or bugfix. Before writing implementation code. |
| **When NOT to use** | Exploratory prototyping. Documentation-only changes. |
| **Category** | builder |

### tool-design

| Field | Value |
|-------|-------|
| **What it does** | Agent tool design — descriptions, consolidation, architectural reduction, naming conventions |
| **Triggers** | "design agent tools", "create tool descriptions", "reduce tool complexity", "MCP tools" |
| **When to use** | Designing tools for agents. Consolidating too many tools. Implementing MCP tools. |
| **When NOT to use** | Using existing tools. Non-agent tool development. |
| **Category** | builder |

### ui-ux-pro-max

| Field | Value |
|-------|-------|
| **What it does** | UI/UX design intelligence — 50+ styles, 161 palettes, 57 font pairings, 161 product types, 99 UX guidelines across 10 stacks |
| **Triggers** | "design UI", "UX guidelines", "color palette", "font pairing", "component design" |
| **When to use** | UI design decisions. Choosing styles, colors, fonts. Following UX best practices. |
| **When NOT to use** | Backend-only work. Non-visual systems. |
| **Category** | builder |

### using-superpowers

| Field | Value |
|-------|-------|
| **What it does** | Establishes how to find and use skills — requires Skill tool invocation before any response |
| **Triggers** | Starting any conversation |
| **When to use** | At conversation start to discover available skills. |
| **When NOT to use** | Mid-conversation when skills are already loaded. |
| **Category** | meta |

### workspace-planner

| Field | Value |
|-------|-------|
| **What it does** | Phase-based project workspaces with lead agents, subagents, skills, workflows, constraints, context budgets |
| **Triggers** | "plan project", "phase plan", "assign agents", "agent roles", "workspace plan", "context engineering plan" |
| **When to use** | Planning multi-phase projects. Assigning agent roles. Defining context budgets. |
| **When NOT to use** | Single-phase simple tasks. Tasks that don't need formal planning. |
| **Category** | orchestrator |

### writing-plans

| Field | Value |
|-------|-------|
| **What it does** | Creates multi-step execution plans from specs or requirements before touching code |
| **Triggers** | "write a plan", "plan this spec", "before touching code" |
| **When to use** | Have a spec/requirements for a multi-step task. Before starting implementation. |
| **When NOT to use** | Trivial single-step tasks. Plans already exist. |
| **Category** | orchestrator |

---

## Quick Lookup by Task Category

### Build tasks
`buildr-operator`, `buildr-executor`, `test-driven-development`, `ui-ux-pro-max`, `project-development`, `bdi-mental-states`, `supabase-postgres-best-practices`, `tool-design`, `browser-use`

### Audit tasks
`code-review-checklist`, `repo-rescue`, `seo-article-audit`, `advanced-evaluation`, `agent-evaluation`, `critique`, `evaluation`, `polish`, `asyncreview`

### Research tasks
`buildr-scout`, `market-intelligence-report`, `source-grounding`, `youtube-video-digest`, `last30days`

### Launch tasks
`secure-linux-web-hosting`, `openclaw-secure-linux-cloud`, `hosted-agents`, `harness-engineering`

### Rescue tasks
`repo-rescue`, `buildr-rescue`

### Present tasks
`showcase-presenter`, `kb-document-factory`

### Orchestration (cross-cutting)
`agent-framework`, `agent-go`, `agent-execute-phase`, `agent-execute-plan`, `agent-plan-phase`, `agent-create-roadmap`, `agentic-workflow-orchestration`, `multi-agent-patterns`, `team-architect`, `workspace-planner`, `writing-plans`

### Context engineering (cross-cutting)
`context-engineering-collection`, `context-fundamentals`, `context-optimization`, `context-compression`, `context-degradation`, `filesystem-context`, `memory-systems`

### Meta (skill management)
`200k-pipeline`, `skill-forge`, `session-launcher`, `find-skills`, `buildr-smith`, `using-superpowers`
