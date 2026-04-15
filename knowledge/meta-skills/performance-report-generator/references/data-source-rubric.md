# Data Source Rubric

> Vilken MCP/API använder agenten för vilken data. Agenten läser detta i
> FETCH-DATA-steget.

## GSC — Google Search Console

**Primary: Ahrefs MCP (redan konfigurerat i portable-kit via claude_ai_Ahrefs).**

| Behov | Tool |
|-------|------|
| Total clicks/impressions/CTR/position per period | `mcp__claude_ai_Ahrefs__gsc-performance-history` |
| Topp pages by clicks | `mcp__claude_ai_Ahrefs__gsc-pages` |
| Pages-historik per URL | `mcp__claude_ai_Ahrefs__gsc-page-history` |
| Topp queries | `mcp__claude_ai_Ahrefs__gsc-keywords` |
| Keyword-historik | `mcp__claude_ai_Ahrefs__gsc-keyword-history` |
| Per-country breakdown | `mcp__claude_ai_Ahrefs__gsc-metrics-by-country` |
| Per-device (desktop/mobile) | `mcp__claude_ai_Ahrefs__gsc-performance-by-device` |
| CTR by position (för benchmarking) | `mcp__claude_ai_Ahrefs__gsc-ctr-by-position` |
| Anonyma queries (not provided) | `mcp__claude_ai_Ahrefs__gsc-anonymous-queries` |

**Fallback om Ahrefs GSC-integration inte är aktiverad för klienten**:
Direct GSC API via Python `google-api-python-client` med service account. Mer
tid att sätta upp per klient; använd bara om Ahrefs inte har klienten.

## Ahrefs — Backlink- och rankingdata

| Behov | Tool |
|-------|------|
| Domain Rating + historik | `mcp__claude_ai_Ahrefs__site-explorer-domain-rating`, `...-history` |
| Referring domains | `mcp__claude_ai_Ahrefs__site-explorer-referring-domains` |
| Referring domains-historik (för delta) | `mcp__claude_ai_Ahrefs__site-explorer-refdomains-history` |
| Alla backlinks | `mcp__claude_ai_Ahrefs__site-explorer-all-backlinks` |
| Förlorade backlinks | `mcp__claude_ai_Ahrefs__site-explorer-broken-backlinks` |
| Topp-pages by traffic | `mcp__claude_ai_Ahrefs__site-explorer-pages-by-traffic` |
| Topp-pages by backlinks | `mcp__claude_ai_Ahrefs__site-explorer-pages-by-backlinks` |
| Organiska keywords för klient | `mcp__claude_ai_Ahrefs__site-explorer-organic-keywords` |
| Organiska konkurrenter | `mcp__claude_ai_Ahrefs__site-explorer-organic-competitors` |
| Rank-tracker (om konfigurerat) | `mcp__claude_ai_Ahrefs__rank-tracker-*` |

## GA4 — Sessions, konverteringar, beteende

**Google Analytics Data API.** Kräver service account JSON per klient eller
delegated access.

Minimum per rapport:
- sessions (period + föregående)
- totalUsers
- engagementRate
- conversions (för definierade events)
- sessionSource/Medium (för att attribuera trafik)
- pagePath topp 10

Implementation: Python-script med `google-analytics-data` paket. Se
`scripts/fetch-ga4.py` (skapa vid behov — finns inte som template i v1).

**Om GA4 inte är tillgänglig för klient**: rapportera explicit i bilagan och
stanna vid GSC + Ahrefs. Inte fabricera.

## Datastruktur — hur agenten lagrar mellan FETCH och NARRATIVE

```
.tmp/<client-slug>-<period>/raw/
├── gsc-performance.json           ← top-level metrics
├── gsc-pages.json                 ← topp-pages
├── gsc-queries.json               ← topp-queries
├── ga4-summary.json               ← om GA4 tillgängligt
├── ahrefs-metrics.json            ← DR + refdomains
├── ahrefs-backlinks-delta.json    ← nya + förlorade
└── meta.json                      ← fetch-timestamp, period-range, errors
```

Narrative-passet läser ENDAST från dessa filer. Om agenten behöver komplement
vid narrativ-skrivning — gå tillbaka till FETCH-steget och uppdatera raw/.
Blanda inte nya API-calls inne i narrativ-passet.

## Felhantering

Om en datakälla failar (API down, auth expired, quota hit):

1. Logga i `meta.json` under `errors`
2. Flagga i rapportens bilaga: "GA4-data ej tillgänglig vid generering — baseras endast på GSC + Ahrefs"
3. Fortsätt med vad som finns
4. Fabricera ALDRIG saknad data

## Quota-hushållning

- Ahrefs API: kolla `subscription-info-limits-and-usage` innan batch-körning av flera klienter
- GSC via Ahrefs: ingångna queries räknas som API-calls
- GA4 API: gratis tier är generöst men kolla vid multi-tenant

Batch-körning av 10+ klienter samtidigt: kör sekventiellt med delay, inte
parallellt, för att inte trigga rate limits.
