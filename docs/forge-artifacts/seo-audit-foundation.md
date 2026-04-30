# SEO Backlink Article — Quality Standard Reference

> Source: BACOWR v6.3 (article_validator.py, SYSTEM.md, editorial-overlay.md, job_07.md, job_08.md)
> Extracted: 2026-04-13

---

## 1. The 11 QA Validator Checks

All 11 must pass. Any single failure = article rejected.

| # | Check | Threshold | Notes |
|---|-------|-----------|-------|
| 1 | **Word count** | 750–900 words | Hard limits. Below 750 or above 900 = fail. Markdown stripped before counting (link text kept, markup removed) |
| 2 | **Anchor text present** | ≥ 1 occurrence | Exact string match: `[anchor_text](target_url)` |
| 3 | **Anchor count** | Exactly 1 | More than 1 anchor = fail |
| 4 | **Anchor position** | Word 250–550 | 1-based word position of anchor start in stripped text. Must vary per article — don't default to same position |
| 5 | **Trust links** | 1–2, before anchor, not target/publisher domain | Deep links only. Must appear before the anchor in article flow. Cannot link to target domain or publisher domain |
| 6 | **No bullets/lists** | 0 list markers | No `-`, `*`, `•` bullets, no `1.` numbered lists |
| 7 | **Headings** | ≤ 1 | Max one H1/H2/H3/etc. in the entire article |
| 8 | **Forbidden AI phrases** | 0 matches | See Section 2. Case-insensitive match |
| 9 | **Language** | Matches expected (sv/en) | Heuristic: Swedish vs English stop-word hit counts |
| 10 | **SERP entities** | ≥ 4 unique entities | From the provided SERP probe entity list. Skipped if no entities supplied |
| 11 | **Paragraphs** | ≥ 4 | Non-empty blocks separated by blank lines. Heading-only blocks excluded from count |

### Trust link validity rules (Check 5 detail)

A link is counted as a trust link only if ALL of these hold:
- Not the anchor link itself
- Domain ≠ target domain
- Domain ≠ publisher domain
- Appears before the anchor link in the article text

Any link violating these rules is flagged as an issue and fails the check even if count is 1–2.

---

## 2. Forbidden AI Phrases (23 exact strings)

All checked case-insensitively. Zero matches required.

```
i en värld där
det är viktigt att notera
det är värt att notera
i denna artikel kommer vi att
denna artikel utforskar
sammanfattningsvis kan sägas
sammanfattningsvis
låt oss utforska
i dagens digitala värld
i dagens läge
det har blivit allt viktigare
har du någonsin undrat
i den här guiden
vi kommer att titta på
i slutändan
det råder ingen tvekan om
utan tvekan
faktum är att
det bör noteras att
det kan konstateras att
i takt med att
i denna text
i denna artikel
```

Note: "sammanfattningsvis" is a substring of "sammanfattningsvis kan sägas" — both are listed separately, so the word alone also fails.

---

## 3. Structural Rules (from SYSTEM.md)

- **One H1 title only.** No H2/H3 subheadings anywhere in the body.
- **Flowing prose only.** No bullet points, no numbered lists, ever.
- **Minimum 4 substantial paragraphs**, each 100–200 words.
- **Blueprint sections** (hook, establish, deepen, anchor, pivot, resolve) are the writing framework — not visible labels in the output.
- **Anchor position must vary** per article. Do not default to the same word position batch after batch.
- **Anchor text is immutable.** Zero modification from the CSV job spec.
- **Anchor sentence must work without the link.** If removing the hyperlink breaks the sentence, rewrite.
- **No CTA language** as anchor text ("Klicka här", "Läs mer", etc.).
- **Trustlinks placed before the anchor** in article flow, not after.
- **"Du" max 2–3 times** per article.
- **First person ("vi/jag") only** if publisher explicitly uses it.
- **End without a summary.** No recap paragraph. Last sentence should be the one that stays with the reader.

---

## 4. Editorial Overlay Quality Markers

The editorial overlay (editorial-overlay.md) defines what separates a 11/11-pass article from a genuinely premium article. Four core quality markers:

### 4.1 Spänning (Narrative Tension)

Before writing a word, mine the 5 SERP probes for one of:

- **Motsägelsen** — Something in SERP data that contradicts the obvious narrative (e.g., top-3 results talk price, but best-ranked competitor talks certification)
- **Trenden** — Multiple probes pointing the same direction, revealing a shift
- **Det oväntade sambandet** — Non-obvious connection between publisher's domain and target's reality
- **Specialistinsikten** — What would a practitioner in this field react to? Not "I knew that" but "I hadn't thought of it that way"

**Write the tension in one sentence.** This becomes the narrative engine. If you can't find it — dig deeper. It's there.

### 4.2 Tes (Thesis)

Blueprint provides `thesis_seed`. Refine it through the tension to produce ONE sentence that:
- Takes a position (not just describes)
- Can prompt "hmm, is that true?" from someone who knows the field
- Cannot be met with "yes obviously"
- Can be supported by SERP-confirmed entities

**Weak tes:** *"Mattor bidrar till en hemtrevlig inredning."* → No one reacts, no one learns anything.

**Strong tes:** *"Det skandinaviska mattformatet har gått från dekorativt tillägg till rumsdefiniering — och det syns i att sökvolymerna för 'matta som rumsavdelare' tredubblades mellan 2024 och 2025."* → Specific, data point, takes position, creates curiosity.

Every paragraph must either underpin, complicate, or deepen the thesis. If a paragraph does none of these — cut it.

### 4.3 Röd Tråd (Through-Line)

The article is a REASONING, not an essay with labels. Mechanical requirement:
- Last sentence of each paragraph opens for the next
- First sentence of next paragraph picks up that thread

But threading alone is not enough. The through-line IS the argument:
- **Underbygger** tesen (shows it holds)
- **Komplicerar** tesen (shows nuance)
- **Fördjupar** tesen (shows consequence or implication)

Test: Can you summarize the article's argument in one sentence? If not — the thread is broken somewhere.

### 4.4 Specialist-Test

A person who works in this field should:
- Learn something new, OR
- See a connection they hadn't made

They should NOT think "standard text" after paragraph one. If they would — rewrite the hook.

---

## 5. Good vs Mediocre — Anti-Pattern Table

| Anti-mönster | Why it fails | Fix |
|--------------|-------------|-----|
| Opens with history/background | Nobody reads on | Lead with the specific observation that sparked the thesis |
| "X är viktigt eftersom..." | Tells instead of shows | Show with specific data point |
| Paragraphs that describe instead of argue | Article becomes an encyclopedia entry | Every paragraph drives the thesis |
| Trustlinks dropped without integration | Reads as footnotes | Make them evidence in the argument |
| Anchor link as disruption in flow | Reveals the article has an ulterior purpose | Build context so the link is the natural next step |
| Closing paragraph that repeats what was said | Disrespects reader's time | End with new insight, not recap |
| Generic observations | Could be in any article on the topic | Make specific with SERP data |
| All paragraphs approximately same length | Mechanical, inhuman | Vary — short and long, mix sentence structures |
| All sentences same structure | Monotonous | Alternate short/long, lead with subject and object |
| Filler and padding | Every sentence must carry information | Cut mercilessly |
| Helicopter perspective opening | "I en värld där X..." | Start with what's interesting about THIS article specifically |
| Helikopter: "Allt fler använder internet" | Self-evident, treats reader as uninformed | Specific datapunkt from SERP research instead |
| Passive voice default | "Det kan konstateras att studien visar" | Active form: "Studien visar" |

### What makes a GOOD article (observed in job_07.md and job_08.md)

**job_07 (Mattor/Rusta):**
- Opens with Formex trend data + Pantone color call — specific, dateable, not generic
- Trustlink deployed as evidence ("En kartläggning av textiltrenderna för 2025 visar...") with concrete percentages from the source
- Anchor placed in stycke 4, embedded in functional comparison prose ("240 mattor i olika material...") — link is the natural resolution to a practical question
- Final paragraph argues for a shift in how mattors are positioned culturally — ends on an idea, not a summary

**job_08 (Kopieringspapper/Arkitekter):**
- Opens with a counter-intuitive observation: digitalization hasn't reduced paper use
- Trustlink uses specific statistic from the source (50% of workday locating info, 7.5% docs lost) — not generic citation
- Anchor embedded in a practical logistics argument about format/quality/delivery — functional, not decorative
- Closes with a legal/functional argument for why paper persists — genuine insight, not a recap

**Common pattern in both:** The article argues something. The trustlinks are proof. The anchor is the natural practical destination. The close is an idea, not a summary.

---

## 6. Trustlink Strategy

Trustlinks are not decorations. They are the bridge mechanism:

- **Publisher ↔ Target gap**: Trustlinks move the article's semantic territory toward the target's SERP entities
- **Example**: Publisher = construction magazine. Target = Rusta's lighting section. Without trustlink: weak connection. With a Boverket guide on lighting planning in renovations as trustlink: the article's semantic territory is now renovation + lighting planning, making the anchor natural.
- **Trustlink as proof**: Introduce the trustlink's content as a fact or observation. Link so the reader thinks "I want to read more of that." Never: "Enligt [källa] är X viktigt." Always: a specific finding from the source with a number or concrete claim.
- **One trustlink** suffices only when publisher and target already have significant overlap. Otherwise minimum two to bridge the full distance.

---

## 7. Anchor Placement Logic

The stycke containing the anchor should be the **strongest paragraph in the article** — the point where the argument is most concrete. It is not a commercial interruption; it is the argument's peak.

Test before finalizing:
1. Read the paragraph without the anchor. Does the sentence work? Good.
2. Read with anchor. Does the link feel like a natural resource? Good.
3. Does it feel like a detour? Rewrite the surrounding context.

Context around the anchor **must contain core SERP entities** from the research.

---

## 8. Publisher Voice Rules

| Publisher type | Tone |
|---------------|------|
| Tech blog | Knowledgeable, lightly informal |
| News site | Neutral, fact-based |
| Lifestyle | Warm, personal |
| B2B | Professional, data-oriented |

Never use first person unless publisher clearly does so. "Du" max 2–3 per article.

---

## 9. Semantic Distance Reference

| Distance | Meaning | Handling |
|----------|---------|---------|
| ≥ 0.90 | Same topic | Direct connection, straightforward |
| ≥ 0.70 | Adjacent | Shared entities sufficient |
| ≥ 0.50 | Moderate overlap | Clear bridge needed |
| ≥ 0.30 | Weak overlap | Explicit variable-marriage strategy |
| < 0.30 | No connection | Flag for manual review — risk of unnatural result |

---

## 10. Priority Order (conflict resolution)

When rules conflict, higher wins:

1. **Safety** — Non-negotiable
2. **Hard requirements** — Anchor (exact text, position 250-550, count=1), word count (750-900), trustlinks (1-2), no bullets, max 1 heading
3. **SERP fidelity** — Article strengthens SERP-confirmed entities, not guesses
4. **Quality** — QA script 11/11 PASS
5. **Style** — Writing guidelines, publisher voice
6. **Guidelines** — Other recommendations
