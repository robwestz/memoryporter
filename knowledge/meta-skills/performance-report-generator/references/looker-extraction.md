# Looker Studio Extraction

> **v1.1 UPDATE 2026-04-16**: Primär metod är nu **browser-use + DOM eval**,
> inte PDF. DOM eval på Looker Studio-sidor returnerar exakt text utan OCR.
> Dashboards som är "öppna för alla med länken" kan extraheras helt automatiskt
> utan manuell PDF-export. PDF-metoden är nedgraderad till sekundär fallback.

## Primär metod: browser-use + DOM eval (v1.1)

### Varför

- Looker Studio renderar tabeller och KPI-block som DOM-element (inte canvas)
- `document.body.innerText` returnerar exakt text — inga OCR-fel på siffror, valutor eller svensk text
- Headless browser laddar "alla med länken"-dashboards utan auth
- Per-sektion-navigation fungerar via DOM-index från `browser-use state`

### Förutsättningar

```bash
pip install browser-use --user    # Python 3.13 krävs (3.14 har asyncio-breaking change)
browser-use doctor                # verifiera: 3/5 checks passed räcker (cloudflared + profile-use optional)
```

### Flöde

```
1. browser-use open <dashboard_url>
2. sleep 5 (låt charts rendera)
3. browser-use eval "document.body.innerText" > raw/<section>.txt
4. För varje sub-sektion:
   a. get fresh tab index: browser-use state | grep button + tab name
   b. browser-use click <idx>            (expandera dropdown om tabben är en)
   c. sleep 2
   d. get menuitem idx
   e. browser-use click <submenu_idx>
   f. sleep 5
   g. browser-use eval "..." > raw/<section>.txt
5. Parsa per-sektion .txt → strukturerad extrakt
```

### Kritiska detaljer

- **DOM-index ändras efter re-render**: hämta färsk state FÖRE varje klick
- **Tab-knappar är ofta dropdown-menus** (`expanded=false` i state): två klicks behövs (tab → submenu)
- **Google Ads + Länkrapport är oftast direkt-nav** (ingen dropdown)
- **Dubbel-klick på öppen dropdown toggle-stänger den** — hämta state igen om oklart
- **Viewport 2880x1800** räcker för DOM eval (inte för screenshots; men eval ignorerar visuell layout)

### Fallgropar

| Problem | Upptäcks via | Åtgärd |
|---------|--------------|--------|
| Klick fungerade inte (samma screenshot) | md5sum jämför med föregående | Hämta färsk state, ompröva klick-idx |
| Section visar fel data (t.ex. demo-template från dashboard-mall) | Sanity-check domän i URLs | Flagga i extraktion som "data integrity issue"; kräver manuell dashboard-konfig |
| Period-alignment saknas | Dashboard visar "all-time" eller olika per sektion | Sätt date-filter via browser-use innan eval, eller normalisera i narrative |

## Sekundär metod: PDF-ingestion (om DOM eval inte fungerar)

## Varför PDF, inte URL-scraping eller API

- Looker Studio är JS-renderat och auth-walled — URL-fetch returnerar tom HTML
- Looker Studio har **ingen** publik data-export-API (bekräftat av Google, by design)
- Per-source API-setup (Meta Marketing, Google Ads, GA4) är tungt per klient
- PDF är Looker Studios officiella export-format, innehåller alla charts + tabeller

PDF-filen kommer med:
- Charts renderade som hög-upplöst bild
- Tabeller som faktisk text (CSV-like när extraherat)
- Sidhuvuden + sektionrubriker
- Datumspann överst

Vision-modellen läser allt detta tillförlitligt.

## Extraktionsflöde

```
1. Load PDF (pages pdf parameter i Read-verktyget)
2. Identifiera sektioner per sida (match mot dashboard.sections i profile.yaml)
3. Per sektion: extrahera KPI-block + tabeller + chart-labels
4. Normalisera till JSON enligt schema nedan
5. Skriv till .tmp/<client>-<period>/raw/extracted.json
6. Delta-beräkna mot föregående periods extrahering (om finns)
```

## Sektionsidentifiering

Typiska Looker-dashboards har sektioner i grid-layout. Mapping:

| Dashboard-etikett (vanlig) | profile.yaml section-nyckel | Förväntade datapunkter |
|----------------------------|------------------------------|------------------------|
| "Overview" / "Sammanfattning" | `overview` | Topp-KPI:er (clicks, impressions, spend, conversions) |
| "Search Console" / "Organic" | `search_console` | Clicks, impressions, CTR, position, top pages, top queries |
| "Ahrefs" / "Backlinks" | `ahrefs` | DR, refdomains, organic keywords, top pages |
| "Meta Ads" / "Facebook" | `meta_ads` | Spend, impressions, clicks, CTR, conversions, kampanjer |
| "Google Ads" | `google_ads` | Cost, impressions, clicks, conversions, impression share |
| "Länkrapport" / "Levererade länkar" | `link_delivery` | Nya länkar denna period: target, source, DR, status |

Robust-strategi: om en sektion inte finns i PDF:en enligt dashboard.sections,
flagga i `extracted.json` som `"status": "section_missing"` — fabricera inte.

## JSON-schema för normaliserad output

```json
{
  "client": "wellio",
  "period": "2026-04",
  "extracted_at": "2026-04-15T14:30:00Z",
  "source_pdf": "clients/wellio/snapshots/2026-04/dashboard.pdf",
  "period_range": {"start": "2026-04-01", "end": "2026-04-30"},
  "comparison_range": {"start": "2026-03-01", "end": "2026-03-31"},
  "sections": {
    "overview": {
      "status": "extracted",
      "kpis": {
        "total_clicks": {"value": 14230, "prev": 12700, "delta_pct": 12.0},
        "total_sessions": {"value": 23450, "prev": 21200, "delta_pct": 10.6},
        "total_spend_sek": {"value": 125400, "prev": 118900, "delta_pct": 5.5},
        "total_conversions": {"value": 412, "prev": 389, "delta_pct": 5.9}
      }
    },
    "search_console": {
      "status": "extracted",
      "totals": {
        "clicks": 8430, "impressions": 412000, "ctr": 2.05, "avg_position": 18.3
      },
      "top_pages": [
        {"url": "/madrasser", "clicks": 1240, "position": 4.2, "delta_clicks_pct": 22.0}
      ],
      "top_queries": [
        {"query": "bästa madrass 2026", "clicks": 320, "position": 3.8, "ctr": 8.1}
      ]
    }
    // ... övriga sektioner
  },
  "extraction_warnings": []
}
```

## Edge cases

| Situation | Strategi |
|-----------|----------|
| Flersidig PDF | Läs alla sidor, sektioner kan ligga på olika sidor |
| Chart utan tabell (visuell trend) | Extrahera label + slutvärde; flagga om intermediate values behövs |
| Ny metric denna period som inte fanns föregående | `delta` = null, kommentera i extraction_warnings |
| Delta-beräkning saknar föregående PDF | Sätt prev-värden till null, skriv i warnings |
| PDF-text OCR:ad otydligt (siffror kan vara 3 eller 8) | Flagga som `"confidence": "low"` — agenten be om manuell verifiering innan leverans |
| Sektion delvis tomt i dashboard (t.ex. ingen Meta Ads denna månad) | `"status": "section_empty"` med förklarande note |
| Filtermärken i dashboard (t.ex. "Last 30 days") | Verifiera att period matchar profile.yaml-angiven period |

## Kvalitetskontroll efter extraction

Innan narrative-passet körs:

- [ ] Alla dashboard.sections täckta (extracted ELLER medvetet flaggat empty)
- [ ] Inga null-värden i top-KPI:er utan förklaring i warnings
- [ ] Period-range i extrahering matchar profile.yaml
- [ ] Delta-procent matematiskt korrekta (sanity: värde / prev = 1 + delta_pct/100)
- [ ] Top-listor har minst 3 rader (annars flagga lilla dataset)

## Fallback när PDF-extraction är otillräcklig

Om extraction får >3 warnings eller >1 missing section:

1. Agenten STOPPAR
2. Rapporterar till användaren med konkret lista av vad som saknas
3. Erbjuder tre alternativ:
   - Omexport av PDF (kanske bättre kvalitet om Robin byter zoom/format)
   - API-fetch för saknade sektioner (om konfigurerat)
   - Manuell CSV-import för saknade sektioner

Fabricera INTE saknad data för att göra rapporten "komplett."
