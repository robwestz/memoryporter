# YouTube Video Digest — Skill Package Design

*Date: 2026-04-13 | Forge input: youtube-tool-research.md + skill-forge/SKILL.md*

---

## ANALYZE

### What the skill does (core workflow)

```
URL → extract metadata + transcript → chunk if needed → render in chosen output mode
```

User gives a YouTube URL and a mode. The skill produces a structured document.
That's it. No downloading, no audio processing, no API keys required for the happy path.

### Decision points (these become tables in SKILL.md)

| Decision | Choices | Becomes |
|----------|---------|---------|
| Extraction method | yt-dlp only vs yt-dlp + youtube-transcript-api | Decision table in SKILL.md |
| Output mode | transcript / summary / key-points / qa / digest | Mode routing table |
| Chunking trigger | short / medium / long video | Length decision table |
| No-transcript fallback | warn + Whisper path vs skip | Fallback table |
| Language selection | en preferred, auto-detect if absent | Parameter in script |

### Patterns (these become templates)

Each output mode has a fixed skeleton and variable content zones:
- `transcript` — header block + chapter-segmented text
- `summary` — header block + abstract + N takeaways
- `key-points` — header block + per-chapter bullets
- `qa` — header block + Q&A pairs
- `digest` — summary block + key-points block (default mode)

### Trigger phrases

"summarize this YouTube video", "digest this video", "extract transcript from YouTube",
"what does this video cover", "key points from this video", "turn this video into notes",
"transcript for [URL]", "make a Q&A from this video"

### Output format

A Markdown document written to stdout or a file, structured per the chosen mode template.

### Dependencies

| Dependency | Status | Role |
|------------|--------|------|
| `yt-dlp` | INSTALLED (v2026.3.17) | Metadata + chapters + subtitle fallback |
| `youtube-transcript-api` | pip install needed | Clean transcript (primary path) |
| `python` | INSTALLED (3.14.3) | Runs extraction scripts |
| `whisper` | NOT installed | No-transcript fallback (opt-in only) |
| YouTube API key | NOT SET | Not used — all scraping-based |

### What varies vs. what is fixed

| Fixed | Variable |
|-------|----------|
| Extraction pipeline (yt-dlp → transcript-api → clean) | URL |
| Output mode names and their template shapes | Output mode selection |
| Chunking thresholds (30 / 90 min) | Language preference |
| VTT stripping logic | Output file path |
| Template header fields | Chunk size override |

---

## CLASSIFY

**Shape: PRODUCTION**

Reasoning:
- Output has predictable repeating structure → needs `templates/`
- Extraction is mechanical, not LLM work → needs `scripts/`
- Multiple variants of output → needs at least 5 template files
- Others will install this → needs `README.md` + `metadata.json`
- Testable pipeline with defined inputs/outputs → needs `evals/`

Classification path:
```
Full (structured output, multiple variants)
  + scripts/ (extraction is purely mechanical)
  = Production
```

---

## SCAFFOLD — Directory Structure

```
skills/youtube-video-digest/
├── SKILL.md                        ← Agent protocol (how to run the skill)
├── README.md                       ← Human installation + usage guide
├── metadata.json                   ← Marketplace metadata
│
├── scripts/
│   ├── extract.py                  ← Fetch transcript + metadata (yt-dlp + transcript-api)
│   └── vtt_clean.py                ← Strip VTT/SRT formatting → plain text
│
├── templates/
│   ├── transcript.md               ← Full transcript output template
│   ├── summary.md                  ← Executive summary output template
│   ├── key-points.md               ← Bulleted key points per chapter template
│   ├── qa.md                       ← Q&A pairs extraction template
│   └── digest.md                   ← Combined summary + key-points (default)
│
├── references/
│   ├── extraction-methods.md       ← yt-dlp + transcript-api usage reference
│   ├── chunking-strategy.md        ← Long video handling rules
│   └── no-transcript-fallback.md   ← Whisper path + manual options
│
└── examples/
    └── example-digest.md           ← Worked example: full digest output
```

---

## OUTPUT MODES

### Mode routing

| Mode | When to use | What it produces |
|------|-------------|-----------------|
| `transcript` | User wants the raw words | Header + chapter-segmented plain text |
| `summary` | User wants quick understanding | Abstract (3-5 sentences) + N key takeaways |
| `key-points` | User wants scannable bullets | Per-chapter bullet lists (3-7 bullets each) |
| `qa` | User wants to study or reference | 5-10 Q&A pairs covering major claims |
| `digest` | Default — best for notes/research | Summary block + key-points block |

### Default: `digest`

When the user provides a URL with no mode specified, run `digest`. It covers the most
use cases without requiring the user to know the mode vocabulary.

---

## EXTRACTION METHOD

### Primary path (both tools available)

```
1. yt-dlp --dump-json → metadata, duration, chapters, caption availability
2. youtube-transcript-api → clean transcript [{text, start, duration}]
3. Merge: align transcript segments with chapter boundaries
4. Produce: {metadata, chapters, transcript_by_chapter, full_text}
```

### Fallback path (only yt-dlp available)

```
1. yt-dlp --dump-json → metadata, chapters
2. yt-dlp --write-auto-subs --sub-langs en → VTT file
3. vtt_clean.py → plain text (deduplication + timing strip)
4. Produce: {metadata, chapters, full_text} (no per-chapter alignment)
```

### Detection logic in extract.py

```python
try:
    from youtube_transcript_api import YouTubeTranscriptApi
    USE_TRANSCRIPT_API = True
except ImportError:
    USE_TRANSCRIPT_API = False
    # Falls back to yt-dlp VTT method
```

### Anti-patterns

- Do NOT attempt to download the video. `--skip-download` is mandatory.
- Do NOT assume VTT is available. Check `has_auto_captions` from metadata first.
- Do NOT chain yt-dlp calls without checking the first succeeded.

---

## CHUNKING STRATEGY

### Thresholds

| Duration | Strategy | Why |
|----------|----------|-----|
| < 30 min | Single block | Fits comfortably in one LLM context pass |
| 30–90 min | Chunk by chapters if available; else 15-min segments | Chapter boundaries are semantically coherent |
| > 90 min | Mandatory chapter chunks; max 15 min per chunk | Prevents quality degradation at long context tails |

### Chapter-based chunking (preferred)

When `chapters` field is present in metadata:
- Each chapter becomes one chunk
- Chapter title + timestamps carried into the output template
- LLM processes each chunk independently, then merges results

### Time-based chunking (fallback)

When no chapters exist:
- Split transcript by word count: ~2,250 words ≈ 15 minutes at average speaking pace
- Label each chunk as "Segment 1 (0:00–15:00)", etc.
- Process and merge same as chapter-based

### Token estimation

```
~150 words/minute (average speech pace)
30 min  → ~4,500 words  → ~6,000 tokens   (safe single pass)
60 min  → ~9,000 words  → ~12,000 tokens  (fine, but chunk by chapter for quality)
90 min  → ~13,500 words → ~18,000 tokens  (chunk required)
180 min → ~27,000 words → ~36,000 tokens  (must chunk, multiple passes)
```

### Merge strategy after chunking

- `transcript`: concatenate with chapter headers as separators
- `summary`: summarize each chunk → meta-summarize the summaries
- `key-points`: collect per-chapter bullets, keep chapter structure
- `qa`: pool all Q&A pairs, deduplicate overlapping questions
- `digest`: chapter-level key-points + one meta-summary pass at the end

---

## NO-TRANSCRIPT FALLBACK

### Detection

```python
if not data.get("automatic_captions") and not data.get("subtitles"):
    # No transcript available
```

### Response options

| Option | When | How |
|--------|------|-----|
| Surface Whisper path | User can install locally | Explain: pip install openai-whisper, requires ~1.5GB model |
| Use description | Short factual videos | Extract key info from video description field |
| Fail gracefully | Neither option viable | Return structured error: video ID, title, reason |

### Whisper integration (opt-in)

The skill does NOT auto-invoke Whisper. If the user confirms they want it:

```bash
# 1. Download audio only
yt-dlp --extract-audio --audio-format mp3 --skip-download "VIDEO_URL"
# 2. Transcribe
whisper audio.mp3 --model medium --language en --output_format txt
```

The `extract.py` script accepts `--whisper` flag to enable this path explicitly.

### Anti-pattern

Do NOT silently return an empty transcript. Always surface whether transcript came
from manual captions, auto-captions, Whisper, or failed entirely.

---

## TEMPLATE DESIGN

### All templates share a fixed header block

```markdown
<!-- [FIXED] Header — always present -->
# [VARIABLE: Video Title]

> **Source:** [VARIABLE: YouTube URL]
> **Channel:** [VARIABLE: Channel name]
> **Published:** [VARIABLE: YYYY-MM-DD]
> **Duration:** [VARIABLE: H:MM:SS]
> **Mode:** [VARIABLE: transcript | summary | key-points | qa | digest]
> **Transcript source:** [VARIABLE: manual | auto-generated | whisper | description-only]

---
```

### transcript.md

```markdown
<!-- [FIXED] Header block (see above) -->

<!-- [VARIABLE] Chapter sections — repeat per chapter or segment -->
## [VARIABLE: Chapter Title] `[VARIABLE: HH:MM:SS]`

[VARIABLE: Plain text transcript for this chapter]

---
<!-- [FIXED] End of chapter block — repeat -->
```

### summary.md

```markdown
<!-- [FIXED] Header block -->

## Summary

[VARIABLE: 3-5 sentence abstract covering the video's main argument or purpose]

## Key Takeaways

<!-- [VARIABLE] 3-7 bullet points — most important standalone facts -->
- [VARIABLE]
- [VARIABLE]
- [VARIABLE]
```

### key-points.md

```markdown
<!-- [FIXED] Header block -->

<!-- [VARIABLE] Repeat per chapter -->
## [VARIABLE: Chapter Title] `[VARIABLE: HH:MM:SS]`

- [VARIABLE: Point 1]
- [VARIABLE: Point 2]
- [VARIABLE: Point 3]

<!-- [FIXED] Separator -->
---
```

### qa.md

```markdown
<!-- [FIXED] Header block -->

## Q&A

<!-- [VARIABLE] 5-10 pairs — repeat -->
**Q: [VARIABLE: Question derived from content]**
A: [VARIABLE: Answer drawn from transcript]

---
```

### digest.md (default)

```markdown
<!-- [FIXED] Header block -->

## Summary

[VARIABLE: 3-5 sentence abstract]

## Key Takeaways

- [VARIABLE]

---

## By Chapter

<!-- [VARIABLE] Repeat per chapter -->
### [VARIABLE: Chapter Title] `[VARIABLE: HH:MM:SS]`

- [VARIABLE: Bullet 1]
- [VARIABLE: Bullet 2]
- [VARIABLE: Bullet 3]

---
```

---

## SCRIPTS

### extract.py — primary extraction script

**Inputs:** `--url URL [--lang en] [--mode digest] [--output path] [--whisper]`

**Outputs:** JSON to stdout OR markdown file at `--output`

**Logic:**
```
1. yt-dlp --dump-json → metadata dict
2. If youtube-transcript-api available → fetch transcript segments
   Else → yt-dlp VTT → vtt_clean.py → plain text
3. Align transcript to chapter boundaries (if chapters exist)
4. If no transcript and --whisper → download audio → run whisper
5. If no transcript and no --whisper → return {error: "no_transcript"}
6. Build output dict: {metadata, chapters, transcript_by_chapter, full_text, source}
7. Print JSON or pass to template renderer
```

**Usage comment block:**
```python
# extract.py — YouTube content extractor
# Usage: python extract.py --url "https://youtube.com/watch?v=..." [--lang en] [--whisper]
# Requires: yt-dlp (mandatory), youtube-transcript-api (optional, pip install it)
# Output: JSON with keys: id, title, channel, duration, chapters, transcript, source
# No API keys required.
```

### vtt_clean.py — VTT/SRT → plain text

**Inputs:** VTT or SRT file path

**Outputs:** Plain text to stdout

**Logic:** Strip timing lines, WEBVTT headers, inline timing tags `<HH:MM:SS.mmm>`,
deduplicate consecutive repeated lines (yt-dlp auto-subs artifact).

---

## metadata.json

```json
{
  "name": "YouTube Video Digest",
  "description": "Extracts transcript, metadata, and chapters from any YouTube video and renders them in one of five output modes: full transcript, summary, key-points, Q&A, or digest (default). No API key required.",
  "category": "skills",
  "author": { "name": "Robin Westerlund", "github": "robinwesterlund" },
  "version": "1.0.0",
  "requires": {
    "open_brain": false,
    "services": [],
    "tools": ["yt-dlp"],
    "optional_tools": ["youtube-transcript-api", "openai-whisper"]
  },
  "tags": ["youtube", "transcript", "video", "summarize", "digest", "research", "notes"],
  "difficulty": "beginner",
  "estimated_time": "1-3 minutes",
  "created": "2026-04-13",
  "updated": "2026-04-13"
}
```

---

## SKILL.md frontmatter

```yaml
---
name: youtube-video-digest
description: |
  Extracts and digests YouTube video content into structured notes.
  Use when a user provides a YouTube URL and wants a transcript, summary,
  key points, Q&A pairs, or a combined digest. Trigger on: "summarize this
  video", "key points from YouTube", "transcript for this video", "what does
  this video cover", "turn this into notes", "digest this YouTube video".
  Also use when given a youtube.com or youtu.be URL with no explicit instruction
  — default to digest mode. Works without an API key via yt-dlp scraping.
author: Robin Westerlund
version: 1.0.0
---
```

---

## REFERENCES needed

### references/extraction-methods.md

> **When to read this:** When the primary extraction path fails or you need to
> understand which tool is doing what and why.

Contents: yt-dlp command reference, youtube-transcript-api API surface,
tool detection logic, known failure modes and their fixes.

### references/chunking-strategy.md

> **When to read this:** When processing videos over 30 minutes or when
> chapter boundaries are absent and you need to split manually.

Contents: Token budget math, chapter-based vs. time-based chunking rules,
merge strategies per output mode, quality tradeoffs.

### references/no-transcript-fallback.md

> **When to read this:** When extract.py returns `{error: "no_transcript"}`
> or when the video is in a language with no available subtitles.

Contents: Whisper opt-in flow, description-as-content heuristic,
when to abort and surface an honest error to the user.

---

## VERIFY CHECKLIST (pre-build)

### Must-pass

- [ ] `name` will be `youtube-video-digest` (lowercase-kebab)
- [ ] Description >= 50 chars with trigger phrases (frontmatter above: 347 chars)
- [ ] SKILL.md body target: < 500 lines
- [ ] All 3 reference files exist in `references/`
- [ ] All 5 template files exist in `templates/`
- [ ] Both scripts exist in `scripts/`
- [ ] No hardcoded paths or API keys in any file
- [ ] `examples/example-digest.md` exists (Full+ requirement)

### Should-pass

- [ ] Each output mode section has at least one anti-pattern
- [ ] Mode routing is a table (not prose)
- [ ] Chunking thresholds are a table (not prose)
- [ ] Extraction fallback logic is a table (not prose)
- [ ] README Files table matches actual directory
- [ ] metadata.json `name` = `YouTube Video Digest` matches frontmatter `name` = `youtube-video-digest`

---

## BUILD ORDER

1. `scripts/vtt_clean.py` — foundation, no dependencies
2. `scripts/extract.py` — depends on vtt_clean.py interface
3. `references/extraction-methods.md` — documents what scripts do
4. `references/chunking-strategy.md` — documents length handling
5. `references/no-transcript-fallback.md` — documents failure paths
6. `templates/digest.md` — default mode, most complex, establish pattern
7. `templates/transcript.md`, `summary.md`, `key-points.md`, `qa.md` — simpler variants
8. `examples/example-digest.md` — worked example using digest template
9. `SKILL.md` — agent protocol referencing all of the above
10. `README.md` — human guide
11. `metadata.json` — final metadata

---

## OPEN QUESTIONS (resolve before build)

| Question | Default assumption | Override if |
|----------|--------------------|-------------|
| Should `qa` mode use the full transcript or only chapter summaries as input? | Full transcript | User explicitly asks for chapter-scoped Q&A |
| Should `digest` include timestamps on each chapter? | Yes — `## Chapter Name \`0:14:23\`` | User asks for clean output without timestamps |
| Should extract.py write subtitle files to disk or pipe to stdout? | Pipe to stdout, no disk artifacts | User asks for a saved `.vtt` file |
| Should Whisper be invoked automatically if no transcript? | No — require `--whisper` flag | User says "use Whisper" or "transcribe the audio" |
| Language default | `en`, auto-fallback to first available | `--lang` parameter overrides |
