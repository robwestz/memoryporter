# Performance Report Generator

Genererar klient-färdiga SEO/performance-rapporter från GSC, GA4 och Ahrefs-data med svenskt narrativ.

## Vad den löser

Varje klient har en Data Studio-dashboard med siffror. En dashboard visar VAD som hänt; en bra rapport förklarar VARFÖR det hänt och VAD man gör härnäst. Det är den bryggan den här skillen bygger — automatiserat, per klient, månads- eller kvartalsvis.

## Snabbstart

1. Kopiera `templates/client-profile.yaml.tmpl` till `clients/<client-slug>/profile.yaml` och fyll i
2. Kör skillen via Claude Code: *"Generera månadsrapport för [client-slug] för period [YYYY-MM]"*
3. Agenten:
   - Läser profile.yaml
   - Hämtar data via Ahrefs MCP (GSC + backlinks) + GA4 API om konfigurerat
   - Skriver narrativ baserat på narrative-patterns.md
   - Producerar `clients/<client-slug>/reports/<YYYY-MM>/report.md`
4. Du granskar, eventuellt editerar, godkänner
5. Konverterar till PDF / email-HTML / dashboard-embed enligt profile.yaml
6. Skickar manuellt (alltid mänsklig gate i v1)

## Process

```
INTAKE CLIENT → FETCH DATA → NARRATIVE PASS → FORMAT → DELIVER
```

## Struktur

```
performance-report-generator/
├── SKILL.md                      — auktoritativ spec
├── README.md                     — denna fil
├── metadata.json
├── templates/
│   ├── monthly-report-sv.md.tmpl       — månadsrapport, svenska
│   ├── quarterly-report-sv.md.tmpl     — kvartalsrapport, svenska
│   └── client-profile.yaml.tmpl        — per-klient config-mall
└── references/
    ├── data-source-rubric.md           — vilken MCP/API till vilken data
    ├── narrative-patterns.md           — översätt siffra → insikt
    └── anti-patterns.md                — klassiska misstag
```

## Nyckelprinciper

- **Varje metric-förändring i rapporten har en driver-förklaring** — annars är den redundant med dashboarden
- **Siffror är konsekventa, wording varieras** — samma data varje gång, inte samma meningar
- **Ärlig osäkerhet > falskt confident** — "kräver djupare analys" är ett giltigt svar
- **Mänsklig gate innan utskick** — v1 har aldrig auto-send
- **Klientdata ligger utanför portable-kit** — sätt `clients/` i byråns privata repo

## Integration

| Skill | När |
|-------|-----|
| `seo-article-audit` | Djupgranska specifik artikel som rapporten pekar ut |
| `market-intelligence-report` | Bredare konkurrensanalys, lämpligt som bilaga till kvartalsrapport |
| `showcase-presenter` | Audit av rapportkvalitet första gången en ny mall används |

## Utökning

Planerat för v2 (inte i scope för v1):
- `email-html` via pandoc automation
- Grafiska inslag (matplotlib/vega-lite sparkline-generering) för inbäddning
- Dashboard-embed via Google Drive API
- Auto-schemaläggning via Archon workflow + cron
