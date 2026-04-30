# Phase 1 — ECC Bridge

**Goal:** ECC-browser kör på `https://ecc.localhost` med alla Web APIs operativa.
**LOC budget:** ~0 wapt-kod (bara Caddy + mkcert config + tester).
**Timeline:** D1 (1 dag).

## Prerequisites
- Phase 0 klar: PROJECT/BLUEPRINT/ROADMAP/AGENTS/CLAUDE/.agent finns
- Caddy v2.8+ tillgänglig (installeras i Wave A om saknas)
- mkcert v1.4+ tillgänglig (installeras i Wave A om saknas)

## Waves

### Wave A — Install prerequisites
- Kontrollera om Caddy finns på PATH; om inte: installera via Scoop (`scoop install caddy`) eller manuell download
- Kontrollera om mkcert finns; om inte: `scoop install mkcert`
- Kör `mkcert -install` för rot-CA i trust store
- Validering: `caddy version`, `mkcert -CAROOT`

### Wave B — Caddyfile baseline
- Skapa `caddy/Caddyfile` med admin-block + `import sites-enabled/*.caddy`
- Skapa `caddy/sites-enabled/` katalog (gitignored)
- Skapa `templates/site.caddy` med default TLS + file_server + gzip + log

### Wave C — Certs för ecc.localhost
- `mkcert ecc.localhost` → cert+key i `caddy/certs/`
- Skapa `caddy/sites-enabled/ecc.caddy` manuellt (efterliknar vad wapt.add kommer göra i Phase 2)

### Wave D — Caddy serving
- Starta Caddy: `caddy run --config caddy/Caddyfile`
- Verifiera: `curl -k https://ecc.localhost` → 200 + ECC-browser innehåll
- Verifiera browser: Chrome + Edge visar grönt lås

### Wave E — API validation
- Skapa `tests/fixtures/ecc-api-probe.html` med 5 API-tests:
  - `fetch('/data.json')` mot en test-fil
  - Service Worker registration
  - localStorage read/write persistence
  - ES module dynamic import
  - `navigator.clipboard.writeText`
- Öppna probe-filen via `https://ecc.localhost/probe.html`
- Alla 5 passerar

## Acceptance criteria
- `curl -k https://ecc.localhost/` returnerar 200
- Browser-test i Chrome + Edge: grönt lås, ingen cert-varning
- `tests/fixtures/ecc-api-probe.html` rapporterar 5/5 passerar
- AGENTS.md uppdaterad med "ECC bridge setup" sektion

## Research questions (for deepen-plan)
- Vad är senaste stabila Caddy-version för Windows och hur installeras den smidigast (Scoop vs manual vs Chocolatey)?
- Vilka Windows-specifika gotchas finns med mkcert (trust store, admin rights, Defender)?
- Hur fungerar `*.localhost` i Chrome/Edge/Firefox 2026 — behövs flags eller fungerar det ur kartongen?
- Kan Service Workers registreras på `https://ecc.localhost` utan särskild config?
- Hur kör man Caddy i bakgrunden på Windows utan systemd (DETACHED_PROCESS, scheduler, Service)?

## Dependencies
- `references/caddy-windows-install.md` (producerad av deepen-plan)
- `references/mkcert-windows-gotchas.md` (producerad av deepen-plan)
- `references/localhost-rfc-behavior.md` (producerad av deepen-plan)

## Risks / gotchas
- Chrome kan cacha file:// localStorage separat; test på ny profil om oväntat
- Windows Defender kan flagga Caddy vid första körning; kräver användargodkännande
- Port 443 kan vara upptagen (Skype, IIS); planera för alternativ port-mapping

## Stop signals
- **Primary value delivered** efter Wave E — stop-signal till Robin
- Om Wave A misslyckas på dev-maskinen efter 2 försök: stoppa, fråga Robin
- Om browser inte litar på mkcert-certet efter `mkcert -install`: stoppa, undersök trust store manuellt

## Exit artifacts
- `caddy/Caddyfile` + `caddy/sites-enabled/ecc.caddy`
- `templates/site.caddy`
- `tests/fixtures/ecc-api-probe.html`
- AGENTS.md "ECC bridge setup" sektion
- Caddy-processen kör i bakgrunden
