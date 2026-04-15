You are a Claude Code agent working in the portable-kit repo at
C:/Users/robin/Downloads/portable-kit. The repo contains a 200k-pipeline
(skill-forge, 200k-blueprint, showcase-presenter, session-launcher),
Archon (workflow runner), MemPalace (persistent memory), a Rust runtime,
and a catalog of domain skills. Follow the structure below exactly.

# INTENT
Goal:          build a reusable repo-analysis skill package that imposes a mandatory core workflow, surfaces multiple post-intake paths for any repository, and packages scripts, templates, references, and audits that keep every run systematic from start to finish.
Anti-goals:    - do not hard-code BACOWR-only assumptions or vocabulary into mandatory logic
               - do not let the agent skip directly to upgrade advice before producing the core artifacts and path options
               - do not ship a skill that relies on free-form judgment where deterministic scaffolds or audits should exist
Success looks like:
  - File exists at `knowledge/meta-skills/repo-strategy-orchestrator/SKILL.md` with populated `scripts/`, `references/`, and `templates/`
  - Running `python knowledge/meta-skills/repo-strategy-orchestrator/scripts/bootstrap_case.py demo-case "understand a repo and present options" --workspace tmp/repo-strategy-demo && python knowledge/meta-skills/repo-strategy-orchestrator/scripts/scaffold_branch.py tmp/repo-strategy-demo/demo-case upgrade-existing --name upgrade-path && python knowledge/meta-skills/repo-strategy-orchestrator/scripts/mechanical_audit.py tmp/repo-strategy-demo/demo-case` returns 0
  - A showcase-presenter audit of the skill and demo artifacts passes with any failure explicitly badge-labeled instead of hidden

# CONTEXT TO LOAD (staged boot, L0->L2)
Read in order - stop when you have enough to route:
  1. CLAUDE.md (repo rules) + AGENTS.md (verify commands)
  2. `C:/Users/robin/Downloads/portable-kit/knowledge/meta-skills/portable-kit-prompt-compiler/SKILL.md`; `C:/Users/robin/Downloads/portable-kit/knowledge/meta-skills/portable-kit-prompt-compiler/templates/meta-prompt-template.md`; `C:/Users/robin/Downloads/portable-kit/knowledge/meta-skills/portable-kit-prompt-compiler/templates/rubric.md`
  3. knowledge/INDEX.md (only if the task touches unfamiliar domain)
  4. none

# SKILLS TO ACTIVATE
Primary:    /skill-forge
Support:    /showcase-presenter, /blueprint
Avoid:      /repo-rescue - this task is not a one-off rescue and should not optimize for patching a single failure; /seo-audit - the word content can misroute the build toward SEO outputs instead of repo orchestration

# WORKFLOW SHAPE
Shape:      parallel fan-out
Parallel branches (only if Shape is fan-out or Archon):
  A. Design the mandatory repo-intake method, path architecture, and user choice stop-point, with a written contract for required artifacts and invariants
  B. Build deterministic scaffolds and audits, then prove a sample case can complete the core stage, scaffold a chosen path, and pass structural audit
  C. Write the portable-kit build prompt, package metadata, and user-facing docs so the skill can be rebuilt, extended, or specialized later
Join:       Synthesize branches A, B, and C into one skill folder, then run a full self-audit before packaging
Human gate: Publishing the finished skill into the canonical live catalog or replacing an existing skill with the same name

# QUALITY GATES (the 200k+ lever - all three required)
Before claiming done, pass all three:
  1. Adversarial pass - state the single most likely failure mode for this
     output, then demonstrate how the output survives it (not "handles it
     gracefully" - show the evidence).
  2. showcase-presenter audit - run /showcase-presenter on the artifacts
     produced. Every capability card must have a real file. Items that
     do not work get [BROKEN] or [INCOMPLETE] badges; hiding failure is not
     acceptable.
  3. Delta summary in the final response:
       - Assumptions made (not verified)
       - Risks / edge cases
       - What I did NOT verify

# COMPOUNDING (what makes this run reusable)
This run must also produce exactly ONE of:
  - Blueprint at docs/blueprints/repo-strategy-orchestrator.md
Reason:     Future sessions can extend, fork, or domain-specialize the skill without re-deriving the core method, invariants, and expected artifacts

# CONSTRAINTS
Time budget:    2 hours
Context budget: stay under ~75% of window; the two-stage compaction hook
                will warn you. If you hit the soft warning, run /compact
                before continuing rather than letting hard trigger fire.
Anti-patterns to avoid on this specific task:
  - Treating repo understanding as a loose analysis instead of a required artifact sequence with audits and a mandatory user choice point
  - Overfitting the package to BACOWR examples so heavily that generic repo intake stops being reusable

Begin by stating back the INTENT in your own words to confirm understanding,
then execute.
