# Status definitions — full rules with worked examples

> The four-status taxonomy is the load-bearing part of this skill. Get it wrong
> and the whole legitimacy-block degrades into vibes.

---

## The four Status values

### Verified

**Rule:** ≥ 3 independent sources support, 0 dissent — OR — direct measurement — OR — canonical authority.

**"Independent"** means different authors, different evidence chains, different
domains. Three blog posts that all cite the same Hacker News thread are ONE
source, not three.

**Examples:**

| Claim | Why Verified |
|-------|--------------|
| "Claude Code's headless flag is `-p`" | Anthropic docs (canonical) + multiple independent walkthrough articles + direct CLI test |
| "Python 3.14 was released in October 2025" | Python.org release notes (canonical) |
| "yt-dlp can extract subtitles via `--write-auto-subs`" | Official yt-dlp docs + direct invocation in this session |

**Anti-examples:**

| Claim | Why NOT Verified |
|-------|------------------|
| "Most teams prefer X" — 5 blog posts all citing the same survey | One source repeated |
| "Library X is fast" — vendor docs + vendor blog + vendor changelog | Not independent |

---

### Supported

**Rule:** 2 independent sources, 0 dissent — OR — strong inference from one A-rated authority.

**Examples:**

| Claim | Why Supported |
|-------|---------------|
| "Karpathy LLM Wiki pattern beats vector DB at personal scale" | Karpathy gist (A-rated authority) + Mejba's blog (independent), no dissent |
| "MCP push-via-server is emerging as preferred over polling" | Calmops 2026 guide + GitHub MCP server changelog, no dissent |

**Threshold:** if a Verified claim loses one of its 3 sources to closer inspection
("oh, those two are actually the same person"), it downgrades to Supported.

---

### Unverified

**Rule:** 1 source only — OR — pure reasoning without external check.

**Examples:**

| Claim | Why Unverified |
|-------|---------------|
| "any_webhook fallback to `_raw/webhook-inbox/` is a reasonable pattern" | Pure reasoning; no source endorses or refutes |
| "graphify exposes a `render_force_layout` capability" | Inferred from name; not read from the repo |
| "Capability vocabulary will drift without a single owner" | Reasoning + analogy to other taxonomies; no measurement |

**Important:** Unverified is NOT the same as wrong. It means *not externally
checked*. Many Unverified claims are true. The point is the reader can see
they're load-bearing on the author's judgment alone.

---

### Disputed

**Rule:** Sources actively disagree, regardless of count.

**Examples:**

| Topic | Position A | Position B |
|-------|-----------|-----------|
| "Do you need a vector DB?" | "Karpathy/Obsidian killed vector DB" (Mejba, Chase AI) | "SBOM/metadata tooling assumes structured index" (CISA, NIST, OpenMetadata) |
| "Local vs remote automations" | "Let Claude decide" (Chase AI video) | "Explicit policy with cost gates" (production patterns) |
| "Skill granularity" | "Many small skills" (GrowwStacks) | "Few orchestrator-skills calling sub-skills" (MindStudio) |

**Resolution:**

- **Both true at different scales** — say it explicitly, name the scales.
- **Robin's call / Reader's call** — valid for opinion-shaped questions.
- **Disputed — unresolved** — valid. Better than false synthesis.

**Anti-pattern:** Resolving disputes by counting (3 vs 1 → "majority wins").
Count is captured in Status; quality is captured in Confidence. Disputes
are resolved by *evidence*, not vote.

---

## Status vs Confidence — easy to confuse

| | Status | Confidence |
|---|--------|------------|
| Axis | Count of independent sources | Quality of evidence |
| Levels | 4 (Verified/Supported/Unverified/Disputed) | 3 (High/Medium/Low) |
| Upgraded by | More independent sources | Better evidence type |
| Downgraded by | Sources turning out to be dependent | Source quality being lower than thought |

**A claim from one peer-reviewed paper:** Status = Unverified, Confidence = High.
The author's count is 1; the quality is excellent. Both facts matter.

**A claim from 3 marketing blog posts that cite each other:** Status = Unverified,
Confidence = Low. Count of independents is 1; quality is poor.

**A claim from 3 independent A-rated docs:** Status = Verified, Confidence = High.
Both maxed.

---

## Critical? flag — when it matters

A claim is **critical** if any conclusion, recommendation, or next-step in the
upstream output depends on it being true.

**Test:** delete the claim from the document. Do any conclusions change?

- Yes → critical = yes
- No → critical = no

**Why this matters:** the Grade block's `critical_unverified` count is the
single most important number in the legitimacy-block. A document can be 90%
Verified but if the 10% Unverified is all critical claims, the verdict is
`needs-more-research`, not `sufficient`.

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Upgrading Status because source is A-rated | Quality goes in Confidence; Status is by count |
| "Most experts agree" without naming experts | Either name them (-> Supported with their names as sources) or downgrade to Unverified |
| Hiding a contradiction | That's a Dispute. Surface it. |
| "More research needed" as the only gap | Be specific — what didn't you check, and how would you close it? |
| Rounding verdict up when borderline | Round DOWN. Honest inconclusiveness > false sufficiency. |
