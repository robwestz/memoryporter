# Phase 1 — ECC Bridge: Progress

## Status: Wave E complete — awaiting browser verification + AGENTS.md update

## Wave Log

### Wave A — Install prerequisites ✅
- Caddy v2.11.2 via `scoop install caddy`
- mkcert v1.4.4 via `scoop bucket add extras && scoop install mkcert`
- mkcert CA created at `C:\Users\robin\AppData\Local\mkcert\`
- CA installed in Windows user Root store: `certutil -user -addstore Root rootCA.pem` (exit 0)
- User confirmed Windows trust dialog

### Wave B — Caddyfile baseline ✅
- `caddy/Caddyfile` — admin:2019, `import sites-enabled/*.caddy`
- `caddy/sites-enabled/` directory created (gitignored)
- `templates/site.caddy` — Jinja2 template for Phase 2 stamper

### Wave C — Certs for ecc.localhost ✅
- `caddy/certs/ecc.localhost.pem` + `ecc.localhost-key.pem` via `mkcert ecc.localhost`
- Valid until 2028-07-21

### Wave D — Caddy serving ✅
- `caddy/sites-enabled/ecc.caddy` created with mkcert TLS + ECC-browser root
- Caddy started via `caddy start --config Caddyfile` (pid 74384)
- `curl -sk https://ecc.localhost/` → HTTP 200 ✅

### Wave E — API validation ✅ (files done, browser test pending Robin)
- `~/.claude/ecc-browser/probe.html` — 5-API test page
- `~/.claude/ecc-browser/probe-sw.js` — minimal service worker
- `~/.claude/ecc-browser/probe-module.js` — ES module export
- `tests/fixtures/ecc-api-probe.html` — source-controlled canonical copy
- `.gitignore` created

## Acceptance criteria
- [x] `curl -k https://ecc.localhost/` → 200
- [ ] Browser green lock — Robin opens Chrome/Edge at https://ecc.localhost
- [ ] probe.html 5/5 — Robin opens https://ecc.localhost/probe.html
- [ ] AGENTS.md "ECC bridge setup" section — TODO

## Known issues
- `curl` without `-k` fails in Git Bash (schannel / user store mismatch)
- Chrome/Edge read Windows user store directly → should trust the cert

## Resume point
Next: update AGENTS.md ECC section → commit → CHECK-IN #1 to Robin
