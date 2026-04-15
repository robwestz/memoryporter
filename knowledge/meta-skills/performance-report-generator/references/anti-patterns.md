# Anti-patterns

> Klassiska misstag när man automatiserar klientrapporter. Varje har observerats
> i praktiken och har ett specifikt failure mode.

## Innehållsmässiga

| Gör INTE | Failure mode | Istället |
|----------|--------------|----------|
| Lista metrics utan narrativ | Det är Data Studio-jobbet — denna skill är redundant | Varje metric som nämns har en driver-förklaring |
| Säga "SEO-arbetet ger resultat" | Generiskt, omätbart, försämrar trovärdighet | Koppla till specifik ranking/länk/innehåll |
| Fylla "wins"-sektionen när månaden var neutral | Klient genomskådar och tappar förtroende | Skriv "månaden var stabil, inga större rörelser" om det är sant |
| Hitta på driver-förklaringar vid otydlig data | Klient hittar en motfakta, kontraktet blir svårt | Flagga som "kräver djupare analys" |
| Rekommendera "fortsätt SEO-fokus" | Inget att agera på | Konkret nästa steg med sida/query/tid |
| Skriva om "algoritmuppdatering" utan bekräftelse | Låter som ursäkt, underminerar trovärdighet | Nämn bara om Google statuspage + timing stöder |

## Strukturella

| Gör INTE | Failure mode | Istället |
|----------|--------------|----------|
| Ett 20-sidors monsterdokument | Klient skumm-läser, missar viktigt | 2-3 sidor tätt, bilaga för råtabeller |
| Svamla in i executive summary | Sammanfattningen ska kunna stå ensam | 3 meningar, den viktigaste rörelsen först |
| Inkludera varje möjlig metric | Signal-to-noise krymper | Fokus: GSC core + GA4 core + top 10 pages + top 10 queries |
| Lämna `[VARIABLE]` placeholders | Direkt bevis på att det är agent-genererat dåligt | Verify-kontroll innan leverans |
| Samma wording varje månad | Klient börjar hoppa över | Variera fraser, men **inte** siffror (siffror är konsekventa) |

## Tekniska

| Gör INTE | Failure mode | Istället |
|----------|--------------|----------|
| Fetcha data mitt i narrativ-skrivningen | Inkonsistens mellan fetch-pass och skriv-pass | FETCH först, lagra råtabeller, sedan NARRATIVE |
| Lita på att siffror i mallen stämmer utan verifiering | Tabell säger 23%, text säger 25% = direkt kredibilitetsförlust | Sanity-check: siffror i narrativ ska finnas identiskt i tabell |
| Automatisk utskick till klient | En dålig månad går ut, inget filter | `auto_send: false` alltid i v1 — mänsklig gate |
| Köra batch för alla klienter parallellt | API rate limits, data-mix-up | Sekventiellt, med delay, med per-klient-mapp |
| Spara nyckel-credentials i portable-kit | Läcker till publikt repo | `clients/` ligger utanför kit, i agency repo med gitignore |

## Klient-förtroendefällor

| Gör INTE | Failure mode |
|----------|--------------|
| Använda jargong utan förklaring ("TTFB", "CLS", "LCP") | Klient känner sig dum, slutar läsa |
| Skriva på engelska när klient är svensk | Onödig friktion, mindre tydlighet |
| Lova saker ("detta kommer leda till X") | Om det inte levereras: kontraktsbrott-nivå risk |
| Jämföra mot ovärdig baseline (cherry-picka period) | Klient jämför med egen data, upptäcker manipulation |
| Överdramatisera dip ("allvarlig nedgång") vid normal variation | Låter desperat, undergräver strategisk bild |

## Operativa

| Gör INTE | Failure mode | Istället |
|----------|--------------|----------|
| Producera rapport innan alla datakällor är verifierade | Skickar incomplete data som ser komplett ut | Fetch → verify → narrative. Om fetch failar: stop + flag |
| Glömma datum-intervall i bilagan | Klient vet inte vad de tittar på | Alltid explicit "YYYY-MM-DD → YYYY-MM-DD" |
| Blanda olika klienters data i `.tmp/` | Fel siffror i fel rapport | `.tmp/<client-slug>-<period>/` alltid isolerat |
| Ingen historik över skickade rapporter | Ingen kan svara på "skickade vi rapport i februari?" | `history.md` per klient, append-only |
| Rapportera utan versionering | Om en klient frågar om "rapport från mars" 6 månader senare, finns den kanske inte | `reports/YYYY-MM/` struktur, arkivera, inte radera |

## Om fallgroparna kommer tillsammans

Klassiskt worst-case:
- Dålig månad för klient
- Agent "fyller wins" med svaga data points
- Automatiskt utskick utan granskning
- Klient granskar, hittar överdrifterna
- Kontraktet vinglar

Motgift: **mänsklig gate mellan producera och skicka, alltid.**
