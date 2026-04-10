# Sidecar format — `<repo>.wiki/`

> **When to read this:** when you want to enrich a generated wiki with hand-written content, AI summaries, custom themes, or persistent reader notes — and have those enrichments survive regeneration.

## What is the sidecar?

A *sidecar* is a companion directory that lives **next to** the source repo (not inside it):

```
/path/to/some-repo/        ← orört, source of truth
/path/to/some-repo.wiki/   ← sidecar — created by `--init-sidecar`
```

The source repo stays read-only. The sidecar holds wiki-specific enrichments that need to survive regeneration: hand-written annotations, AI-explanation cache, project-specific theme overrides, branding, reading order.

## Layout

```
some-repo.wiki/
├── wiki.toml              ← config: theme, pages, extras, branding
├── README.md              ← bootstrap-time instructions for humans
├── annotations/
│   ├── overview.md        ← replaces or extends the auto-rendered README
│   ├── modules/
│   │   └── <name>.md      ← per-module hand-written explanation
│   └── files/
│       └── <path>.md      ← per-file note (uses the file's repo-relative path)
├── theme.css              ← project-specific CSS variable overrides
└── cache/
    ├── ai-explanations.json
    └── git-snapshot.json
```

## File ownership

| Path | Owner |
|------|-------|
| `wiki.toml` | you (after init) |
| `annotations/**/*.md` | you (forever) |
| `theme.css` | you (forever) |
| `cache/**` | the generator (auto-managed) |
| `README.md` | bootstrap template (overwritten by `--force`) |

The generator never overwrites files in `annotations/` or `theme.css`. Only `wiki.toml`, `README.md`, and `cache/` are touched by `--init-sidecar --force`.

## wiki.toml reference

```toml
[meta]
title = "MyProject"
tagline = ""
order = "explore"          # "explore" | "tour"

[theme]
preset = "midnight"        # midnight | aurora | solar
custom_css = "theme.css"   # path relative to sidecar, optional

[pages]
overview = true
structure = true
files = true
modules = true
deps = true
activity = true

[extras]
charts = true
ai_explanations = false    # opt-in
search = true

[branding]
icon_path = ""
home_url = ""
```

## Workflow

```bash
# 1. Create the sidecar
python project-wiki/scripts/generate.py --init-sidecar /path/to/some-repo

# 2. Edit annotations + tweak wiki.toml
echo "# Custom overview" > /path/to/some-repo.wiki/annotations/overview.md
echo "Handles JWT validation." > /path/to/some-repo.wiki/annotations/modules/auth.md

# 3. Generate the wiki (sidecar is picked up automatically)
python project-wiki/scripts/generate.py --repo /path/to/some-repo --output some-repo.html
```

## Merge precedence

When both repo and sidecar provide content for the same slot, sidecar wins:

| Slot | Priority order (highest first) |
|------|-------------------------------|
| Overview content | `sidecar.annotations.overview` → `repo/README.md` → empty state |
| Module description | `sidecar.annotations.modules.<name>` → `sidecar.ai_explanations.<name>` → metadata only |
| File note | `sidecar.annotations.files.<path>` → none |
| Theme | `localStorage` (user choice) → `wiki.toml [theme] preset` → `midnight` (default) |
| Page toggles | `localStorage` → `wiki.toml [pages]` → all true |
| CSS | `theme.css` (sidecar, last in cascade) → theme CSS → tokens.css |

## Versioning

Decide whether to commit `<repo>.wiki/`:

- **Commit it** if the wiki is a deliverable for your team — annotations and config are part of the project
- **Gitignore it** if it's just for your own reference — every dev maintains their own

To gitignore: add `*.wiki/` to your `.gitignore`.

## Trigger phrases

Use this skill's sidecar features when the user says:

- "init a wiki sidecar"
- "annotate the wiki for this repo"
- "add a custom explanation for the auth module"
- "remember my notes between regenerates"
- "set up persistent wiki content for this repo"
- "give the wiki a project-specific theme override"
