# Phase 5 — L1 Target Adapters

**Goal:** target_ghpages + target_heroku + jetbrains_ext + sentry_hook.
**LOC budget:** ~820 prod + ~400 test (core four adapters).
**Timeline:** D8 (1 dag).

## Prerequisites
- Phase 4 complete: v0.1.0rc1 tagged, Robin's human check-in passed
- Student pack accounts activated: Heroku, Sentry, Name.com .dev, Polypane, Codespaces

## Waves

### Wave A — target_ghpages (D8 morning, ~2h)
- `src/wapt/features/target_ghpages.py` (180 LOC)
  - Git wrapper: check if target branch exists, create if not
  - Build output: copy site root to gh-pages branch
  - Commit + push with sensible commit message
  - CLI: `wapt deploy <name> --target=ghpages`

### Wave B — target_heroku (D8 morning, ~3h)
- `src/wapt/features/target_heroku.py` (220 LOC)
  - Auth flow: `heroku auth:whoami` → fallback to `heroku login`
  - App creation: `heroku create <app-name>` if not exists
  - Deploy: `git push heroku main` with dedicated remote
  - Static sites: buildpack `heroku-community/static` + `static.json`
  - CLI: `wapt deploy <name> --target=heroku:<app-name>`

### Wave C — jetbrains_ext (D8 afternoon, ~1.5h)
- `src/wapt/features/jetbrains_ext.py` (110 LOC)
  - XML generator for External Tools:
    - Tool: wapt doctor
    - Tool: wapt status (current project)
    - Tool: wapt logs (current project)
  - Install path resolution: `%APPDATA%\JetBrains\<IDE><version>\tools\wapt.xml`
  - CLI: `wapt jetbrains-install --ide=WebStorm`

### Wave D — sentry_hook (D8 afternoon, ~1.5h)
- `src/wapt/features/sentry_hook.py` (100 LOC)
  - JS snippet generation with DSN placeholder
  - Integration in `caddyfile_stamper`: inject `<script>` before `</head>` via Caddy `templates` directive
  - Opt-in per site: `[site.<name>] sentry_dsn = "<DSN>"`
  - CLI: `wapt sentry enable <name>` / `wapt sentry disable <name>`

## Acceptance criteria
- `wapt deploy ecc --target=ghpages` pushes to gh-pages, site available at GitHub Pages URL
- `wapt deploy ecc --target=heroku:ecc-staging` creates app + deploys, public URL responds
- `wapt jetbrains-install --ide=WebStorm` generates valid External Tools XML, WebStorm recognizes it after restart
- Sentry snippet correctly injects when DSN configured; errors reach Sentry dashboard
- All four adapters have tests

## **CHECK-IN REQUIRED**
Verify Heroku deploy publicly before Phase 6. Send Robin the live URL.

## Research questions (for deepen-plan)
- Heroku CLI auth flow: `heroku auth:token` vs `~/.netrc` vs OAuth — most reliable on Windows?
- Heroku static buildpack: latest recommended approach for non-Node static sites?
- JetBrains External Tools XML schema 2024-2026: changes per IDE version?
- Sentry browser SDK: correct CDN URL + inline DSN injection without CSP violations?
- git push gh-pages: `subtree` vs `worktree` vs separate branch — which has fewest edge cases?

## Dependencies
- `references/heroku-cli-auth.md`
- `references/sentry-js-sdk.md`
- `references/jetbrains-external-tools.md`
- `references/github-pages-patterns.md`

## Risks / gotchas
- Heroku free tier was discontinued 2022; verify $13/mo credit still applies to student pack in 2026
- Sentry DSN in wapt.toml = potential commit leak; warn on `wapt init` to put in env var or 1Password
- JetBrains IDE version detection: no standard; may need user input for IDE version folder
- gh-pages push from non-git directory: requires wapt to init temp repo or require target to already be in git

## Stop signals
- Heroku auth flow fails after 2 retries: stop, verify student pack account activation
- Sentry DSN integration breaks site rendering (CSP): stop, investigate inline-script allowance

## Exit artifacts
- `src/wapt/features/{target_ghpages,target_heroku,jetbrains_ext,sentry_hook}.py`
- `src/wapt/features/__init__.py` with feature-flag based imports
- `tests/unit/features/test_*.py`
- `tests/integration/test_deploy_ghpages.py` (mocked)
- `tests/integration/test_deploy_heroku.py` (mocked CLI)
- BLUEPRINT.md LOC tracker updated for L1
- Live Heroku URL shared with Robin for verification
