# Quality Standard — SEO Backlink Article

> **When to read this:** Before performing manual Layer 1 checks, when a check fails and you need edge-case guidance, or when assessing any Layer 2 editorial dimension.

---

## Part 1 — The 11 Mechanical Checks

All 11 must pass. Any single failure = article rejected at Layer 1.

| # | Check | Threshold | Measure |
|---|-------|-----------|---------|
| 1 | Word count | 750–900 words | Strip markdown (keep link text, remove markup), count words |
| 2 | Anchor present | ≥ 1 occurrence | Exact string: `[anchor_text](target_url)` |
| 3 | Anchor count | Exactly 1 | More than 1 = fail even if same anchor |
| 4 | Anchor position | Word 250–550 | 1-based word position in stripped text |
| 5 | Trust links | 1–2 valid, before anchor | See validity rules below |
| 6 | No bullets | 0 list markers | No `-`, `*`, `•`, `1.` at line start |
| 7 | Headings | ≤ 1 total | Title counts as the 1 allowed heading |
| 8 | Forbidden phrases | 0 matches | Case-insensitive. See `forbidden-phrases.md` |
| 9 | Language | Matches expected | Heuristic: stop-word hit counts (sv/en) |
| 10 | SERP entities | ≥ 4 unique | From provided entity list. Skip if none supplied |
| 11 | Paragraphs | ≥ 4 non-empty | Blank-line-separated blocks; heading-only blocks excluded |

### Trust Link Validity Rules (Check 5)

A link counts as a trust link only when ALL hold:
- It is not the anchor link itself
- Domain ≠ target domain (and no subdomain of target)
- Domain ≠ publisher domain (and no subdomain of publisher)
- It appears **before** the anchor link in article text

Any link violating any rule is flagged and fails the check even if count is 1–2.

### Edge Cases by Check

| # | Edge case that trips reviewers |
|---|-------------------------------|
| 1 | Markdown stripped before counting — URL in `(url)` part removed, link text kept |
| 2 | Partial match (anchor text present but not inside `[…](…)` syntax) = fail |
| 3 | Same anchor used twice in different paragraphs = fail |
| 4 | Position measured in stripped-text words, not raw character offset |
| 5 | A link after the anchor that would otherwise qualify still fails — position is absolute |
| 5 | Subdomain of target/publisher (e.g., `blog.target.com`) also fails |
| 6 | Em-dash fragment at line start is NOT a bullet — check for space + dash + space pattern |
| 7 | Article title itself = the 1 allowed heading. Any body H2/H3 = fail |
| 8 | "sammanfattningsvis" alone triggers even without the longer variant |
| 9 | Heavily mixed-language articles may misfire heuristic — manual verify |
| 10 | Entity matching is case-insensitive. Plural/singular variants may not match |
| 11 | A heading line followed by blank line = heading-only block, excluded from paragraph count |

---

## Part 2 — The 8 Editorial Dimensions (Layer 2)

Rating scale: **Strong** (3) | **Adequate** (2) | **Weak** (1) | **Failing** (0)

---

### E1: Hook Quality

**What to assess:** Does the opening paragraph lead with a specific observation, data point, or counter-intuitive claim — or with background, definition, or helicopter perspective?

**Assessment procedure:**
1. Read only the first paragraph
2. Ask: does this opening only work for THIS article, or could it introduce any article in this topic area?
3. Ask: is the first sentence a claim/observation, or a setup/context?

**Failure signals → Failing/Weak:**
- Starts with historical background ("Sedan länge har X...")
- Starts with broad definition ("X definieras som...")
- Starts with helicopter observation ("Allt fler X..." / "X har blivit allt viktigare...")
- First paragraph is interchangeable with any article on this topic

**Pass signals → Adequate/Strong:**
- Opens with a specific event, data point, or named source
- First sentence makes a claim that requires reading on to verify
- Hook is uniquely tied to this article's thesis

**Required output:** Rating + quoted first sentence + specific diagnosis

---

### E2: Thesis Clarity

**What to assess:** Can the auditor distill the article's central argument into one sentence? Does the article argue something, or does it just describe?

**Assessment procedure:**
1. After reading the full article, write one sentence summarizing the argument
2. Ask: does the article take a position, or survey a topic?
3. Ask: would a specialist react with "hmm, is that true?" — or with "yes, obviously"?

**Failure signals:**
- Article is a tour of a topic with no central claim
- Every paragraph introduces a new point with no throughline
- The "argument" is a truism ("good lighting improves a room")
- Auditor cannot write the one-sentence summary

**Pass signals:**
- Clear position a reader could agree or disagree with
- Specific claim supported by named entities/data from SERP research
- Paragraphs circle back to and develop the same argument

**Required output:** Rating + auditor's one-sentence summary of the argument (if extractable) + diagnosis

---

### E3: Entity Integration

**What to assess:** Are SERP entities used as precise natural vocabulary — or listed, forced, or introduced as concepts?

**Assessment procedure:**
1. Identify where SERP entities appear in the text
2. For each occurrence: is the entity the natural word choice, or dropped in?
3. Count unique entities used (feeds Check 10 if < 4)

**Failure signals:**
- "Ett begrepp som blivit aktuellt är [entity]" — introducing instead of deploying
- Entity appears in a list or enumeration rather than embedded in argument
- Entity concentrated in one paragraph only
- Generic terms used where a SERP entity would be more precise

**Pass signals:**
- Entity is the natural word choice — removing it would weaken precision
- Entities distributed across multiple paragraphs
- LSI terms appear naturally without announcement

**Required output:** Rating + one example of good deployment + one example of weak deployment (if any) + entity count visible in the text

---

### E4: Trustlink Integration

**What to assess:** Are trustlinks woven into the argument as evidence — or dropped as citations/footnotes?

**Assessment procedure:**
1. Find each trustlink in the text
2. For each: does the surrounding sentence introduce a specific finding/number/claim from the linked source?
3. Ask: does the link make the reader think "I want to read more of that" — or "okay, source noted"?

**Failure signals:**
- "Enligt [källa] är X viktigt." — generic citation without substance
- Link anchor is a generic descriptor ("klicka här", "läs mer", "enligt denna källa")
- Trustlink appears in a sentence that would say the same without it
- No concrete claim from the source in surrounding text

**Pass signals (model: job_07/08):**
- Specific statistic or finding from the source introduced before/around the link
- The linked claim advances the article's argument — not just supports it
- Anchor text is descriptive of actual content ("en kartläggning av textiltrenderna för 2025")

**Required output:** Rating + quoted trustlink sentence + diagnosis for each trustlink found

---

### E5: Anchor Naturalness

**What to assess:** Does the anchor link feel like the natural practical destination of the argument at that point — or like a commercial interruption?

**Assessment procedure:**
1. Find the anchor paragraph
2. Read the paragraph WITHOUT the hyperlink — does the sentence work standalone?
3. Read WITH the link — does the linked resource feel like the natural next step?
4. Ask: is this the strongest, most concrete paragraph in the article?

**Failure signals:**
- Sentence doesn't work without the link (grammatical or logical dependency)
- Paragraph feels like it exists only to host the link
- Anchor paragraph is weaker than surrounding paragraphs
- Link anchor uses CTA language ("läs mer", "klicka här")
- Anchor context does not contain core SERP entities

**Pass signals:**
- Paragraph is the most concrete/specific in the article
- Sentence works without the link — link adds a resource, not a dependency
- Surrounding text contains SERP entities relevant to the anchor's target topic

**Required output:** Rating + quoted anchor sentence + result of the remove-link test + specific diagnosis

---

### E6: Red Thread

**What to assess:** Does each paragraph continue the argument from the previous one — or does the article restart topics paragraph by paragraph?

**Assessment procedure:**
1. For each transition (P1→P2, P2→P3, etc.): does the next paragraph pick up the thread from the close of the previous?
2. For each paragraph: does it underpin, complicate, or deepen the thesis — or just introduce new information?
3. Apply the "and then what?" test: does each paragraph's conclusion naturally open the door to the next?

**Failure signals:**
- Two consecutive paragraphs on entirely different sub-topics with no bridging
- A paragraph that could be moved anywhere without breaking flow
- Closing sentence of a paragraph just ends — opens nothing
- Article feels like a collection of paragraphs rather than a developing argument

**Pass signals:**
- Each paragraph's last sentence creates a question or implication the next paragraph answers
- The argument is traceable: P1 → P2 → P3 as logical sequence
- No paragraph is detachable without breaking something

**Required output:** Rating + identification of weakest transition (quote closing + opening sentences) + overall thread summary

---

### E7: Closing Quality

**What to assess:** Does the final paragraph end with a genuine insight, implication, or forward-look — or does it summarize what was already said?

**Assessment procedure:**
1. Read only the last paragraph
2. Ask: is there anything here the reader didn't have after reading the previous paragraphs?
3. Ask: does the final sentence stay with the reader?
4. Ask: if the article ended one paragraph earlier, would anything of value be lost?

**Failure signals:**
- Last paragraph begins with "Sammanfattningsvis", "Sammantaget", "Kort sagt", or equivalent
- Last paragraph restates the opening thesis without development
- Last sentence is a generic wrap-up ("Oavsett val finns det alternativ för alla behov")
- The close could be from any article on this topic

**Pass signals (model: job_07/08):**
- Final paragraph introduces a new angle, consequence, or cultural/structural observation
- Last sentence makes a claim that resonates beyond the immediate topic
- Close could not work as the close to any other article — it's specific to this one's argument

**Required output:** Rating + quoted final sentence + diagnosis

---

### E8: AI Smell

**What to assess:** Does the article exhibit any of the 10 mediocrity patterns that reveal the text as mechanical, generic, or AI-generated?

**Assessment procedure:** Scan for each pattern explicitly:

| Pattern | Where to check |
|---------|---------------|
| Opens with history/background | First paragraph |
| "X är viktigt eftersom..." phrasing | Grep for "viktigt" + "eftersom/för att" |
| Descriptive paragraphs (no argument) | Each paragraph: describe vs. argue |
| Trustlinks as footnotes | Covered by E4 — surface here if relevant |
| Anchor as interruption | Covered by E5 — surface here if relevant |
| Summary-style closing | Covered by E7 — surface here if relevant |
| Generic observations not grounded in SERP data | Sentences that could appear in any topic article |
| Uniform paragraph length | Visual scan — all paragraphs ≈ same word count? |
| Uniform sentence structure | Are all sentences Subject-Verb-Object? Any variation? |
| Filler and padding | Sentences that can be removed with zero information loss |

**Scoring:**
- 0 patterns = Strong
- 1–2 patterns = Adequate/Weak depending on severity
- 3+ patterns = Failing

**Required output:** Rating + list of detected patterns with quoted evidence + count of patterns found

---

## Part 3 — Structural Rules

- One H1 title only. No H2/H3 subheadings in the body.
- Flowing prose only. No bullet points, no numbered lists.
- Minimum 4 substantial paragraphs, each 100–200 words.
- Blueprint sections (hook, establish, deepen, anchor, pivot, resolve) are the writing framework — not visible labels.
- Anchor position must vary per article. Do not default to the same word position batch after batch.
- Anchor text is immutable. Zero modification from the job spec.
- Anchor sentence must work without the link. If removing the hyperlink breaks the sentence, rewrite.
- No CTA language as anchor text ("Klicka här", "Läs mer", etc.).
- Trustlinks placed before the anchor in article flow, not after.
- "Du" max 2–3 times per article.
- First person ("vi/jag") only if publisher explicitly uses it.
- End without a summary. No recap paragraph. Last sentence should be the one that stays with the reader.

---

## Part 4 — Trustlink Strategy

Trustlinks are not decorations. They are the bridge mechanism:

| Situation | Handling |
|-----------|---------|
| Publisher and target have significant overlap | One trustlink may suffice |
| Moderate gap between publisher and target | Two trustlinks needed to bridge |
| Weak overlap (semantic distance < 0.50) | Explicit entity-bridging trustlinks required |

**Trustlink as proof:** Introduce the trustlink's content as a fact or observation. Link so the reader thinks "I want to read more of that." Never: "Enligt [källa] är X viktigt." Always: a specific finding from the source with a number or concrete claim.

---

## Part 5 — Anchor Placement Logic

The paragraph containing the anchor should be the **strongest paragraph in the article** — the point where the argument is most concrete. It is not a commercial interruption; it is the argument's peak.

Test before finalizing:
1. Read the paragraph without the anchor. Does the sentence work? Good.
2. Read with anchor. Does the link feel like a natural resource? Good.
3. Does it feel like a detour? Rewrite the surrounding context.

Context around the anchor **must contain core SERP entities** from the research.

---

## Part 6 — Publisher Voice Rules

| Publisher type | Tone |
|----------------|------|
| Tech blog | Knowledgeable, lightly informal |
| News site | Neutral, fact-based |
| Lifestyle | Warm, personal |
| B2B | Professional, data-oriented |

Never use first person unless publisher clearly does so. "Du" max 2–3 per article.

---

## Part 7 — Priority Order (conflict resolution)

When rules conflict, higher wins:

1. **Safety** — Non-negotiable
2. **Hard requirements** — Anchor (exact text, position 250–550, count=1), word count (750–900), trustlinks (1–2), no bullets, max 1 heading
3. **SERP fidelity** — Article strengthens SERP-confirmed entities, not guesses
4. **Quality** — QA script 11/11 PASS
5. **Style** — Writing guidelines, publisher voice
6. **Guidelines** — Other recommendations
