# Skill-Forge: ANALYZE — youtube-video-digest

> Step 1 output per skill-forge SKILL.md. Input: user description (no codebase to read).
> Source type: domain / raw knowledge → workflow extracted from description + known patterns.

---

## Core Workflow

```
INPUT (URL or video ID)
  │
  ▼
NORMALIZE → extract video ID from any YouTube URL form
  │
  ▼
FETCH METADATA → title, channel, description, duration, publish date, chapter markers
  │  (source: yt-dlp --dump-json, or YouTube Data API v3)
  ▼
FETCH TRANSCRIPT → ordered priority:
  1. Manual captions (most accurate)
  2. Auto-generated captions (fallback)
  3. yt-dlp subtitle download (catches both)
  │  Output format: JSON3 (preferred), VTT, SRT
  ▼
PARSE TRANSCRIPT → normalize to internal format:
  │  [{start_ms, end_ms, text}, ...]
  ▼
SEGMENT → chunk by:
  1. YouTube chapters (if present in metadata) — preferred
  2. Topic/silence breaks (heuristic: long pauses, paragraph density)
  3. Fixed time windows (fallback, overlap 10%)
  │  Each segment gets: title (chapter name or generated), start, end, text
  ▼
MODE DISPATCH (varies per invocation):
  ├── full-transcript   → all segments, timestamped, no reduction
  ├── summary          → per-segment 1-2 sentence synthesis + overall summary
  ├── key-points       → bullet extraction across all segments, deduplicated
  └── qa-extraction    → questions surfaced in video + answers from transcript
  │
  ▼
FORMAT OUTPUT → structured markdown document
  (frontmatter metadata block + mode-specific content)
```

---

## Decision Points

| Decision | Options | Signal | Preferred |
|----------|---------|--------|-----------|
| Transcript source | YouTube API captions vs yt-dlp | API requires key; yt-dlp works without auth | yt-dlp as default, API as optional enhancement |
| Transcript format | JSON3 / VTT / SRT | JSON3 has confidence scores and word-level timing | JSON3 when available, SRT as fallback |
| Segmentation strategy | Chapters / topic / time-window | Chapters are explicit intent; topic requires LLM; time is dumb | Chapters → topic → time-window, in priority order |
| Output mode | full / summary / key-points / qa | Caller decides based on use case | No default — require explicit mode selection |
| Long video handling | Single pass / chunked | Claude context window ~200k tokens; 1h video ≈ 15k tokens transcript | Single pass up to ~3h; chunked with overlap above that |
| Language | Auto / specified | Many videos have multiple tracks | Default: first available English; flag others |
| Chapter detection | Native chapters / description parsing | Not all videos use YouTube chapters | Try native first, then parse "00:00 Title" lines from description |

---

## Patterns That Repeat (→ become templates or reusable blocks)

| Pattern | Appears in | Becomes |
|---------|-----------|---------|
| Metadata header block | All output modes | `templates/metadata-header.md` |
| Timestamped segment block | full-transcript, summary | `templates/segment-block.md` |
| Key-points list format | key-points mode | `templates/key-points-output.md` |
| Q&A pair format | qa-extraction mode | `templates/qa-output.md` |
| Summary digest format | summary mode | `templates/summary-output.md` |
| URL normalization regex | script entry point | `scripts/extract_transcript.py` helper |
| Chapter-from-description parser | segmentation step | `scripts/extract_transcript.py` helper |

---

## Trigger Phrases

Direct invocations:
- "youtube-video-digest"
- "digest this YouTube video: [URL]"
- "get transcript from [URL]"
- "extract key points from this video: [URL]"
- "summarize this YouTube video"
- "what does this video cover?"
- "process this video for Claude"
- "get the chapters and key points from [URL]"

Implicit triggers (user shares YouTube URL with a task):
- "analyze [URL]"
- "review what's in [URL]"
- "I want to ask questions about [URL]"

---

## Output Format

All modes produce a markdown document with this structure:

```markdown
# [Video Title]

## Metadata
- **Channel:** [name]
- **Published:** [YYYY-MM-DD]
- **Duration:** [H:MM:SS]
- **URL:** [url]
- **Transcript source:** [auto-generated | manual | language code]
- **Mode:** [full-transcript | summary | key-points | qa-extraction]

---

[Mode-specific content below]
```

### Per-mode output structure

| Mode | Structure |
|------|-----------|
| `full-transcript` | Segments with `## [Chapter/Segment Title] [HH:MM:SS]` headers, raw transcript text |
| `summary` | Segments with `## [Title] [HH:MM:SS]` + 1-3 sentence synthesis per segment + overall summary at top |
| `key-points` | Flat bulleted list grouped by theme, with `[HH:MM:SS]` source timestamp per point |
| `qa-extraction` | `**Q:** [question]\n**A:** [answer] — [HH:MM:SS]` pairs |

---

## Dependencies

| Dependency | Type | Required | Notes |
|------------|------|----------|-------|
| `yt-dlp` | CLI tool | Yes — core | `pip install yt-dlp`; extracts transcript + metadata without API key |
| `Python 3.9+` | Runtime | Yes | Script runtime |
| `YouTube Data API v3` | External API | No — optional | Richer metadata, higher rate limits; requires API key |
| `requests` | Python lib | If using API | `pip install requests` |
| `webvtt-py` | Python lib | Optional | VTT parsing; fallback: manual parser included in script |

---

## What Varies vs. What Is Fixed

### FIXED (same every invocation)
- Metadata field names and order
- Output document structure (frontmatter → mode content)
- Timestamp format: `[HH:MM:SS]`
- Segmentation priority order: chapters → topic → time-window
- Script interface: `extract_transcript.py [URL_OR_ID] [--mode MODE] [--lang LANG] [--output PATH]`
- Internal transcript format: `[{start_ms, end_ms, text}]`

### VARIABLE (changes per invocation)
- URL / video ID
- Output mode (full-transcript / summary / key-points / qa-extraction)
- Language track selection
- Whether YouTube API key is available
- Whether manual or auto-generated captions are present
- Whether chapters exist in the video
- Output file path or destination

---

## What an Expert Knows That a Beginner Doesn't

- YouTube auto-captions are notoriously bad for technical terms — flag this in output
- `yt-dlp --write-auto-subs --write-subs --sub-langs en` downloads both; prefer manual if present
- JSON3 format (YouTube's native) has word-level timing — SRT has only line-level; use JSON3 for better chunk boundaries
- Chapter markers from YouTube chapters are far more reliable than parsing the description
- Videos with music-heavy intros/outros produce garbage transcripts for those sections — trim heuristically
- Long transcripts should estimate token count before passing to Claude (1 word ≈ 1.3 tokens)
- yt-dlp can also extract the description, which often contains chapters even when YouTube chapters aren't set
- Rate limiting: yt-dlp can get throttled; add `--sleep-interval 2` for batch use

---

## Package Shape Classification

**Classification: PRODUCTION**

Reasoning:
- Has templates/ (4 output-mode templates + metadata header + segment block) → Full shape
- Has scripts/ (yt-dlp extraction script, Python, standalone) → Production shape
- Has references/ (YouTube API patterns, transcript format specs) → Full shape
- Has evals/ potential (deterministic enough to test: given URL X, extract Y chapters)

**File manifest:**
```
youtube-video-digest/
├── SKILL.md
├── README.md
├── metadata.json
├── scripts/
│   └── extract_transcript.py        ← yt-dlp wrapper + parser
├── templates/
│   ├── metadata-header.md           ← Fixed metadata block for all modes
│   ├── full-transcript-output.md    ← Full transcript mode template
│   ├── summary-output.md            ← Summary mode template
│   ├── key-points-output.md         ← Key points mode template
│   └── qa-output.md                 ← Q&A extraction mode template
├── references/
│   ├── transcript-formats.md        ← JSON3 / VTT / SRT format specs + parser notes
│   ├── youtube-api-patterns.md      ← YouTube Data API v3 endpoints for metadata/captions
│   └── chunking-strategy.md         ← Long-video handling, token estimation, overlap logic
└── examples/
    └── example-digest.md            ← Worked example: one real video → summary output
```

---

## Anti-Patterns to Address in the Skill

| Anti-pattern | Risk | Rule to encode |
|--------------|------|----------------|
| Using video ID without URL normalization | Fails for short URLs, embed URLs, playlist URLs | Always normalize first |
| Treating auto-captions as ground truth | Technical terms garbled | Label transcript source in output; note confidence |
| Chunking by fixed character count | Breaks mid-sentence, mid-thought | Chunk only at segment/chapter boundaries |
| Passing raw transcript to Claude without structure | Claude must re-parse timestamps | Always pre-structure; Claude consumes, not parses |
| Silently falling back without informing user | User unaware of quality degradation | Emit a `[NOTICE]` block at top of output for each fallback used |
| Generating chapters when none exist without labeling them | User mistakes generated titles for official chapters | Label generated segments as `[Auto-segmented]` vs `[Chapter]` |

---

*Analysis complete. Next step: SCAFFOLD (shape = PRODUCTION, manifest above).*
