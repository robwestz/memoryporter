# Narrative Patterns — Från siffra till insikt

> Det här är vad skillen faktiskt tjänar sina pengar på. Den som bara listar
> metrics har byggt en sämre version av Data Studio. Det här dokumentet
> beskriver hur man översätter rörelser till narrativ.

## Grundregel

**Varje metric-förändring som nämns i rapporten måste svara på tre frågor:**

1. **Vad** förändrades (med siffra + delta)
2. **Varför** det förändrades (konkret driver, inte spekulation)
3. **Vad betyder det** för klientens affär

Om någon fråga inte kan besvaras från data → välj en av två: (a) utelämna
rörelsen från rapporten, eller (b) flagga som "kräver djupare analys."
**Aldrig** fylla i med gissning.

## Mönster per rörelse-typ

### Trafik upp

Sök i ordning:
1. Vilka pages drev ökningen? (Topp 3 pages med största clicks-delta)
2. Vilka queries matchar dessa pages? (Sök query-raw efter samma URLs)
3. Vad hände positionsmässigt? (Ny ranking, nytt SERP-feature, säsong?)
4. Korrelerar det med nya länkar? (Ahrefs refdomains-delta under perioden)

Skriv:
> **Trafik upp [X]%** — drivet av [page-slug] som flyttat från position [före] till [efter] för queries kring [tema]. [Om tillämpligt: Detta korrelerar med [N] nya referring domains mot den sidan under perioden.]

### Trafik ner

Samma logik i spegelvänd:
1. Vilka pages tappar mest?
2. Är det positionsförlust eller impressions-förlust?
3. Gick konkurrent upp? (Jämför positionen för samma query mot konkurrenternas ranking om konfigurerat)
4. Tappade vi länkar? (broken-backlinks + refdomains-delta negativ)
5. Teknisk ändring? (Kontrollera om sidan indexeras, core web vitals, etc.)

Skriv:
> **Trafik ner [X]%** — huvudsakligen från [page-slug] som tappat [delta] positioner för [query-tema]. [Konkret driver om identifierbar: länkförlust / teknisk issue / konkurrent som passerat.]

### Position förbättring utan trafiklyft

Detta är vanligt och värt att förklara:
- Position gick från 6 → 3 men CTR steg inte
- Oftast: SERP-feature (featured snippet, people-also-ask, AI overview) tar klickar
- Check impressions — om de steg OCH CTR föll, är det SERP-konkurrens, inte ranking

Skriv:
> **Position upp [X→Y] för [query-kluster]**, men CTR föll från [X%] till [Y%]. Trolig orsak: [SERP-feature eller AI-overview] äter klickar. Rekommendation: [optimera title/description för att vinna tillbaka CTR / eller flytta fokus till query-kluster utan sådan konkurrens].

### Impressions upp, clicks ner

Title/meta behöver arbete. Vanlig fix.
> Impressions upp [X]% men clicks ner [Y]%. Title-tag eller meta description behöver optimeras för att matcha intent bättre. Affected pages: [lista].

### Backlinks-rörelser

**Nya länkar från DR ≥ 40**: alltid nämn individuellt med kort kontext.
> Ny länk från [domän] (DR [X]) på [kontext: artikel om tema]. Detta är [relevans för klient].

**Förlorade länkar > DR 40**: alltid nämn + rekommendera outreach.
> Förlorad länk från [domän] (DR [X]). Sidan [borttagen / omstrukturerad / no-follow]. Återskaffa-möjlighet: [hög/medel/låg].

## Vad som INTE är narrativ

- "Trafiken varierade under månaden" — inte insikt, bara observation
- "Konverteringarna är på en bra nivå" — inte relativ till vad
- "SEO-arbetet ger resultat" — generisk, ej bunden till data
- "Vi rekommenderar fortsatt SEO-fokus" — ingen handling
- "Algoritmuppdatering kan ha påverkat" — bara om bekräftat med Google status + timing

## Handlingsrekommendations-mönster

Varje "next focus"-punkt ska vara:
- **Konkret**: namnger sida / query / åtgärd
- **Mätbar**: du vet när den är klar
- **Tidsrimlig**: kan göras inom nästa period

Skala per rekommendation:

| Kategori | Exempel |
|----------|---------|
| Quick win (< 4h) | "Uppdatera title på [page] — position 5, CTR 2.8% vs förväntad 6%" |
| Medium (1-3 dagar) | "Publicera djupartikel om [query-kluster där vi har impressions men position > 20]" |
| Strategisk (vecka+) | "Bygg cluster kring [tema] där vi har vunnit [X] queries — konkurrent [namn] har inte täckt området" |

Rekommendera max 3 per månad. Klienten ska kunna säga ja eller nej.

## När du faktiskt inte vet

Det är okej att skriva:

> **[Metric] rörde [X]% — driver inte tydligt identifierbar från tillgänglig data. Rekommenderar djupare analys om rörelsen kvarstår.**

Klienten betalar bättre för ärlig osäkerhet än för falskt confident gissning.

## Exempel: Komplett narrativ-pass (fiktivt)

**Sammanfattning**:
> April var en stark månad — clicks upp 23% QoQ drivet av två pages som brutit top-5 för huvudqueries. Backlink-profilen stabil. Nästa månad handlar om att kapitalisera på dessa vinster genom att bygga intern länkning mot dessa pages.

**Top win**:
> **/hyra-bil-spanien upp från 45 clicks till 127 clicks (+182%)** — sidan flyttade från position 11 till 4 för query-kluster kring "hyrbil spanien billigt". Drivet av innehållsuppdateringen från 2026-03-12 samt tre nya referring domains, varav [domänname.se] (DR 54) är viktigast. Bevis: se GSC-snapshot i bilaga.

Det är vad rapporten ska leverera — inte en tabell-dump.
