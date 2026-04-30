# Figma Make Kit Builder

> Produces publishable Figma Make custom kits at CMS-complexity level. Eight
> seeded kits, one shared foundation, two operating modes (full project and
> single component).

## What It Does

Generates the exact file structure Figma Make expects under **Create a kit →
Publish kit**: `guidelines/*.md`, `src/app/App.tsx`, `src/app/styles/*.css`,
`ATTRIBUTIONS.md`, `package.json`, `postcss.config.mjs`, `vite.config.ts`.

The differentiator: every kit targets admin, operator, builder, or power-user
surfaces — **not** landing pages, pricing tables, or marketing sites. A strict
complexity gate rejects generic proposals. A foundation-lock keeps tokens,
type scale, spacing, and layout primitives identical across kits, so components
can be cut from one kit and pasted into a project built from another without
breaking.

## Supported Clients

- Claude Code (skill auto-discovery via `knowledge/meta-skills/`)
- Codex CLI (reads SKILL.md frontmatter)
- Cursor (via Agent instructions)
- Any LLM agent that can read markdown + write files

## Prerequisites

- Node 18+ (for kit builds)
- Familiarity with Figma Make's "Create a kit" flow
  (https://developers.figma.com/docs/code/write-design-system-guidelines/)

## Installation

This skill lives in `knowledge/meta-skills/figma-make-kit-builder/` within
the portable-kit repo. No separate install step. Invoke via:

```
"Build a figma make kit for <domain>"
"Give me the single-component version of <component> from <kit>"
"Publish kit for <domain>"
```

## Trigger Conditions

- User mentions Figma Make, "Publish kit", or "Create a kit"
- User wants a reusable component kit for design-to-code workflows
- User wants to extend the foundation with a 9th kit (must pass complexity gate)
- User wants to cut a single component from an existing kit

Do **not** trigger for:

- Landing pages, pricing tables, marketing sites (use `ui-ux-pro-max`)
- Standard Figma files (not Make — use Figma MCP tools)
- One-off prototypes with no reuse intent

## Expected Outcome

A directory matching Figma Make's mandated kit structure, ready to upload via
**Create a kit → Publish kit**. Guidelines populated per Figma's schema
(Usage / Semantic purpose / Examples / API per component). Foundation-locked
to the shared tokens. At least 3 monetization patterns surfaced per kit.

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Core skill definition: two-mode routing, 6-step process, 8-seed table |
| `metadata.json` | Marketplace metadata (name, tags, difficulty, version) |
| `README.md` | This file |
| `references/foundation-lock.md` | Invariants every kit must preserve |
| `references/complexity-gate.md` | 5-check filter for qualifying new kits |
| `references/monetization-patterns.md` | 10 patterns each kit must carry 3+ of |
| `templates/kit-scaffold/` | Shared Figma Make kit file structure + tokens |
| `templates/kits/cms-admin-shell/` | Seed 1 — headless CMS admin |
| `templates/kits/workflow-builder/` | Seed 2 — Zapier-style automation |
| `templates/kits/multi-tenant-workspace/` | Seed 3 — SaaS org/team/RBAC |
| `templates/kits/analytics-composer/` | Seed 4 — dashboard builder |
| `templates/kits/power-data-table/` | Seed 5 — virtualized power-user table |
| `templates/kits/marketplace-console/` | Seed 6 — seller/operator console |
| `templates/kits/ai-search-chat-shell/` | Seed 7 — AI product shell |
| `templates/kits/creator-lms/` | Seed 8 — course builder + player |

## The Eight Seeds

| Kit | Domain | Headline components |
|-----|--------|---------------------|
| `cms-admin-shell` | Headless CMS | CollectionSchemaEditor, BlockRichTextEditor, MediaLibrary, DraftPublishBar, VersionHistoryDrawer |
| `workflow-builder` | Automation | NodeCanvas, TriggerPanel, ActionConfigPanel, RunLogViewer, RunHistoryTable |
| `multi-tenant-workspace` | SaaS org shell | WorkspaceSwitcher, InviteMemberModal, RBACPermissionsMatrix, BillingPerWorkspacePanel, TeamListTable |
| `analytics-composer` | Dashboard builder | WidgetCanvas, MetricBuilder, FilterComposer, SavedViewsDropdown, ComparisonMode |
| `power-data-table` | Data-power-user UI | DataTable, ColumnConfigurator, InlineCellEditor, BulkActionBar, SavedFilterSets |
| `marketplace-console` | Seller ops | ListingsManager, OrderDetail, DisputeResolutionPanel, PayoutsLedger, ReviewManagerTable |
| `ai-search-chat-shell` | AI products | StreamingAnswerPane, CitationCard, FollowUpComposer, SourceBrowser, ThreadHistorySidebar |
| `creator-lms` | Courses + LMS | CurriculumTree, LessonPlayer, QuizBuilder, ProgressTracker, StudentRoster |

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Skill activates on "build landing page" | Overly broad trigger match | Complexity gate rejects — redirect to `ui-ux-pro-max` |
| Kit's `tokens.md` has diverged from scaffold | Someone edited per-kit tokens | Restore byte-identical copy from `templates/kit-scaffold/guidelines/tokens.md`; never edit per kit |
| New component uses hex colors | Forgot semantic tokens | Run `grep -E '#[0-9a-fA-F]{3,6}' src/` in the kit; replace with `--color-*` tokens |
| Components from kit A don't fit in project from kit B | Foundation-lock was broken somewhere | Diff both kits' tokens.md + type scale against scaffold; fix drift |
| `npm install` fails after kit is generated | `package.json` has kit-specific deps not in scaffold | Check the kit's `ATTRIBUTIONS.md` for required libs (e.g., `react-flow` for workflow-builder, `dnd-kit` for analytics-composer); add to `package.json` |

## Related

- `ui-ux-pro-max` — for visual style decisions inside the foundation
- `harness-engineering` — if a generated kit graduates into a long-term repo
- `200k-blueprint` — if the kit is step 1 of a larger product build

## Version

1.0.0 — Initial release with 8 seed kits, foundation-lock, complexity gate,
monetization patterns.
