---
name: performance-report-generator
description: |
  Genererar klient-färdiga SEO/performance-rapporter från GSC, GA4 och Ahrefs-data
  med Swedish narrative. En per-klient YAML-config → månads- eller kvartalsrapport
  i markdown, PDF-bar, e-post-bar eller inbäddningsbar i befintlig Data Studio-
  dashboard. Tar siffror och översätter till faktiska insikter ("trafik upp 12%
  drivet av page X som flyttat från position 8 till 3 för keyword Y") — inte
  bara metrics-listor. Cadence: månatlig eller kvartalsvis. Stöd för flera
  klienter via config-fil per klient.
  Trigger on: "generate performance report", "client performance report", "monthly
  SEO report", "kvartalsrapport", "månadsrapport", "client report generator",
  "performance dashboard report", "GSC report", "rapportera prestanda till kund".
author: Robin Westerlund
version: 1.0.0
---

# Performance Report Generator

> Från klientens GSC/GA4/Ahrefs-data till ett leveransklart rapportdokument
> med faktiska insikter, inte bara siffror. Månads- eller kvartalsvis.

## Vad den producerar

Ett markdown-dokument per klient per period med:

- Executive summary (3 meningar, lätt att skumma)
- KPI-tabell med trend-pilar + month-over-month-delta
- 2-4 wins ("det här gick bra och varför")
- 1-3 issues ("det här behöver åtgärdas")
- Next period focus (1-3 konkreta åtgärder)
- Bilaga: råtabeller (topp-pages, topp-queries, backlinks-delta)

Markdown → konverterbar till PDF, e-post-HTML, eller infogas i Data Studio-sida
via embed-iframe / Google Docs-import.

## När detta är rätt skill

| Situation | Använd? |
|-----------|---------|
| Månatlig klientrapport där data finns i GSC/GA4/Ahrefs | Ja |
| Kvartalsrapport med narrativ om trender | Ja |
| Ad-hoc djupanalys en specifik kampanj | Nej — använd market-intelligence-report eller seo-article-audit |
| Dashboard byggande från noll | Nej — det är Data Studio-arbete |
| Kund har INGEN dashboard än | Nej — skapa dashboard först, sedan kan denna skill mata den |

## Process

```
INTAKE CLIENT → FETCH DATA → NARRATIVE PASS → FORMAT → DELIVER
```

### 1. INTAKE CLIENT

Läs `clients/<client-slug>/profile.yaml`. Fyller i detta vid första körningen
för ny klient — se `templates/client-profile.yaml.tmpl`.

Obligatoriska fält:
- `client_name`, `client_slug`
- Minst en datakälla (GSC, GA4, eller Ahrefs) med credentials/IDs
- `cadence` (monthly | quarterly)
- `language` (sv | en)

### 2. FETCH DATA

Se `references/data-source-rubric.md` för vilka MCP-tool / API som matchar
vilken datakälla. Prioritet:

| Datakälla | Bäst via |
|-----------|----------|
| GSC | Ahrefs MCP `gsc-*` tools (redan konfigurerat i portable-kit) |
| GA4 | Google Analytics Data API (kräver service account JSON) |
| Ahrefs | Ahrefs MCP `site-explorer-*`, `rank-tracker-*` tools |

Hämta MINST:
- Totalclicks, impressions, CTR, avg position (period + föregående period)
- Top 10 pages by clicks (med position + delta)
- Top 10 queries by clicks (med position + delta)
- Om Ahrefs: domain rating, referring domains delta, top referring domains

Spara råa tabeller i `.tmp/<client>-<period>/raw/*.json` för reproducerbarhet.

### 3. NARRATIVE PASS

Det här är var skillen tjänar sina pengar. Se `references/narrative-patterns.md`.

Regel: **varje metric-förändring som nämns i rapporten måste ha en förklaring**.
"Trafik upp 12%" utan "varför" är oanvändbar. "Trafik upp 12% — drivet av
/page-slug som flyttat från position 8 till 3 för keyword X efter vår Q4-uppdatering"
är värd något.

Narrative-stegen:
1. Rankera varje delta efter magnitud × affärsrelevans
2. För topp-5 deltas: sök råtabellerna efter driver (vilken page/query?)
3. Skriv 2-4 meningar per nyckelrörelse
4. Om driver är otydlig: flagga "kräver djupare analys" — **fabricera inte**

### 4. FORMAT

Använd `templates/monthly-report-sv.md.tmpl` eller `quarterly-report-sv.md.tmpl`.
Fyll varje `[VARIABLE]`. Inga `[VARIABLE]` får finnas kvar i output-filen.

Skriv till: `clients/<client-slug>/reports/<YYYY-MM>/report.md`

### 5. DELIVER

Beroende på `report_channel` i profile.yaml:

| Channel | Gör |
|---------|-----|
| `markdown` | Stanna vid .md-filen. Klienten får länk. |
| `pdf` | Konvertera med pandoc: `pandoc report.md -o report.pdf --pdf-engine=xelatex` (kräver pandoc installerat) |
| `email-html` | Konvertera med pandoc: `pandoc report.md -o report.html --standalone` |
| `dashboard-embed` | Skriv till Google Doc via drive-MCP, sedan länk i Data Studio Text-widget |

Skicka **inte** automatiskt — producera filen, låt människa godkänna innan
utskick. För v1 alltid mänsklig gate.

## Konfiguration per klient

Varje klient har en mapp:

```
clients/
└── <client-slug>/
    ├── profile.yaml           ← copy från templates/client-profile.yaml.tmpl
    ├── reports/               ← genererad output
    │   └── 2026-04/
    │       ├── report.md
    │       ├── report.pdf     (om pdf-channel)
    │       └── raw/           ← data-snapshots för reproducerbarhet
    └── history.md             ← append-only log av skickade rapporter
```

`clients/` bör ligga **utanför** portable-kit (t.ex. i agency repo) — klientdata
är inte för publikt repo.

## Kvalitetsgrindar

Innan rapporten markeras klar:

- [ ] Varje metric-förändring > 5% har en förklaring
- [ ] Alla `[VARIABLE]` utfyllda
- [ ] Siffror i rapporten matchar råtabeller (sanity check mot `.tmp/raw/`)
- [ ] Inga "framgångar" om verkligheten är neutral — ärlig rapport > glättig rapport
- [ ] Sektionen "Next period focus" har konkreta åtgärder, inte bara "fortsätt arbeta"
- [ ] `/showcase-presenter` REPORT mode på första rapporten per klient (inte varje gång)

## Anti-patterns

Se `references/anti-patterns.md` för komplett lista. Topp 3:

| Gör INTE | Varför |
|----------|--------|
| Lista metrics utan narrativ | Det är Data Studio-jobbet. Denna skill ska addera värde ovanpå. |
| Fylla "wins" när det inte finns några | Klient genomskådar på 60 sekunder, kontrakt ryker |
| Hitta på driver-förklaringar när data är otydlig | Bättre flaggat ovisst än falskt confident |

## Integration

| Skill | Relation |
|-------|----------|
| `seo-article-audit` | För djupgranskning av specifik artikel som rapporten pekar ut |
| `market-intelligence-report` | Bredare konkurrentanalys — komplementerar snarare än ersätter |
| `showcase-presenter` | Audit av rapportkvalitet (när ny mall ska valideras) |
| `200k-prompt-engineering` | Layer 1-regler för rapport-copy (imperativ, tabeller, front-loaded) |

## Filer

| Fil | Roll |
|-----|------|
| `SKILL.md` | Denna fil |
| `README.md` | Kort intro |
| `metadata.json` | Paketmanifest |
| `templates/monthly-report-sv.md.tmpl` | Månadsrapport-mall, svenska |
| `templates/quarterly-report-sv.md.tmpl` | Kvartalsrapport-mall, svenska |
| `templates/client-profile.yaml.tmpl` | Per-klient config-mall |
| `references/data-source-rubric.md` | Vilken MCP/API till vilken data |
| `references/narrative-patterns.md` | Översätt siffra → insikt |
| `references/anti-patterns.md` | Vanliga misstag |
