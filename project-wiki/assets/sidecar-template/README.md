# Sidecar — `{{REPO_NAME}}.wiki/`

This directory is the *wiki-adapted* companion to the repo at `../{{REPO_NAME}}/`. Everything in here belongs to the wiki, not to the source code.

## Files

| Path | Owner | Purpose |
|------|-------|---------|
| `wiki.toml` | you | Config: theme, pages, extras, branding |
| `annotations/overview.md` | you | Custom overview — replaces or extends the auto-rendered README |
| `annotations/modules/<name>.md` | you | Per-module hand-written explanation, shown on the Modules page |
| `annotations/files/<path>.md` | you | Per-file note shown above the source in the file viewer |
| `theme.css` | you | Project-specific CSS variable overrides applied after the chosen theme |
| `cache/ai-explanations.json` | generator | Cached LLM-generated module summaries |
| `cache/git-snapshot.json` | generator | Previous git stats for delta tracking |

## Workflow

```bash
# from the parent of the repo
project-wiki init ./{{REPO_NAME}}
# edit wiki.toml + drop annotations
project-wiki --repo ./{{REPO_NAME}} --output ./{{REPO_NAME}}.html
```

## Versioning

Decide whether to commit `<repo>.wiki/`:
- **Commit it** if the wiki is a deliverable for your team
- **Gitignore it** if it's just for your own reference
