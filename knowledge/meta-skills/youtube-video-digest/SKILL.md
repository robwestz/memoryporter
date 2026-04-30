---
name: youtube-video-digest
description: |
  Extracts and digests YouTube video content into structured notes without an
  API key. Use when a user provides a YouTube URL and wants a transcript, summary,
  key points, Q&A pairs, or a combined digest. Trigger on: "summarize this video",
  "key points from YouTube", "transcript for this video", "what does this video
  cover", "turn this into notes", "digest this YouTube video", "extract transcript".
  Also use when given a youtube.com or youtu.be URL with no explicit instruction
  — default to digest mode. Works via yt-dlp scraping (no API key required).
author: Robin Westerlund
version: 1.0.0
---

# YouTube Video Digest

> Turns any public YouTube video into a structured, timestamped markdown document
> in five steps: receive URL → extract content → classify video type → structure
> output → deliver. No API key. No video download.

---

## Step 1: RECEIVE

Accept any of these input forms:

| Input form | Example | Extraction |
|------------|---------|------------|
| Standard URL | `youtube.com/watch?v=VIDEO_ID` | `v=` query parameter |
| Short URL | `youtu.be/VIDEO_ID` | Path after `/` |
| Embed URL | `youtube.com/embed/VIDEO_ID` | Path after `embed/` |
| Shorts URL | `youtube.com/shorts/VIDEO_ID` | Path after `shorts/` |
| Bare ID | `dQw4w9WgXcQ` (11 chars) | Use as-is |

Also accept an optional output mode. Default: `digest`.

Strip playlist parameters (`&list=`, `&index=`) before continuing — they cause
yt-dlp to process multiple videos silently.

**Anti-pattern:** Do not pass a raw playlist URL to the scripts. Normalize first,
then pass `https://www.youtube.com/watch?v=VIDEO_ID`.

---

## Step 2: EXTRACT

Run `scripts/extract-metadata.py` and `scripts/extract-transcript.py`.

### Extraction path

| Condition | Path | How |
|-----------|------|-----|
| `youtube-transcript-api` installed | Primary (clean) | `python scripts/extract-transcript.py VIDEO_ID --lang en` |
| Only `yt-dlp` available | Fallback (VTT) | `yt-dlp --write-auto-subs --sub-langs en --skip-download URL` |
| Neither installed | Abort | Tell user: install `yt-dlp` first (`pip install yt-dlp`) |

Detect at runtime:
```python
try:
    from youtube_transcript_api import YouTubeTranscriptApi
    USE_TRANSCRIPT_API = True
except ImportError:
    USE_TRANSCRIPT_API = False
```

### API version note (youtube-transcript-api 1.x)

Version 1.x changed from class methods to instance methods. Entries are
objects, not dicts:
```python
api = YouTubeTranscriptApi()
segments = api.fetch("VIDEO_ID", languages=["en"])
# seg.text, seg.start, seg.duration — NOT seg["text"]
```

### Extract output shape

```json
{
  "id": "VIDEO_ID",
  "title": "...",
  "channel": "...",
  "duration": 3600,
  "duration_string": "1:00:00",
  "publish_date": "YYYY-MM-DD",
  "chapters": [{"title": "Intro", "start_time": 0.0, "end_time": 45.0}],
  "has_manual_captions": true,
  "has_auto_captions": true,
  "transcript_source": "manual | auto-generated | auto-generated-vtt | whisper | none",
  "segments": [{"text": "...", "start": 0.0, "duration": 2.5, "timestamp": "0:00"}],
  "full_text": "Plain text of entire transcript"
}
```

### No-transcript fallback

| Option | When | Action |
|--------|------|--------|
| Whisper (opt-in) | User approves; can install | Explain install; add `--whisper` flag explicitly |
| Description-as-content | Short factual video, no captions | Extract key info from `description` field |
| Abort with structured error | Neither viable | Return: video ID, title, reason |

See `references/youtube-api-patterns.md` for the full yt-dlp command reference
and known failure modes.

**Anti-pattern:** Do not silently proceed with an empty `full_text`. If
`transcript_source` is `none`, surface the error before continuing.

---

## Step 3: CLASSIFY

Determine the video type to guide tone and structure of output.

| Signals in title / content | Video type | Output guidance |
|----------------------------|------------|-----------------|
| "tutorial", "how to", "step by step" | Tutorial | Preserve step order; number key-points |
| "conference", "keynote", "talk", "session" | Talk | Lead summary with thesis; Q&A pairs work well |
| Multiple speakers, back-and-forth exchange | Interview | Note speaker turns; Q&A maps naturally |
| "lecture", "course", "university", academic | Lecture | Chapter structure critical; preserve definitions |
| Commentary, essay, one-person analysis | Essay/opinion | Summary should capture argument, not just topics |
| Music, art, reaction, entertainment | Entertainment | Flag: transcript may be lyrics/ambient — low digest value |

If signals are absent or ambiguous, default to **Talk** classification and note
the uncertainty in the output header.

**Anti-pattern:** Do not skip classification. The type shapes how you phrase
summaries, how many key-points per chapter, and whether timestamps matter.

---

## Step 4: STRUCTURE

Apply the template for the chosen output mode.

### Mode routing

| Mode | Default? | When to use | What it produces |
|------|----------|-------------|-----------------|
| `digest` | **YES** | Research, notes, reference | Summary + global takeaways + per-chapter bullets |
| `summary` | | Quick understanding | Abstract (3–5 sentences) + key takeaways (3–7) |
| `key-points` | | Scannable reference | Per-chapter bullet lists (3–7 bullets each) |
| `transcript` | | Raw text, archiving | Chapter-segmented plain text with timestamps |
| `qa` | | Study, testing | 5–10 Q&A pairs covering major claims |

### Header block — all modes

```markdown
# [Video Title]

> **Source:** [YouTube URL]
> **Channel:** [Channel Name]
> **Published:** [YYYY-MM-DD]
> **Duration:** [H:MM:SS]
> **Mode:** [mode]
> **Video type:** [Tutorial | Talk | Interview | Lecture | Essay | Entertainment]
> **Transcript source:** [manual | auto-generated | whisper | description-only]
```

If auto-captions were used, add immediately after the header:
```markdown
> **[NOTICE]** Auto-generated captions detected — technical terms and names
> may be inaccurate. Verify critical content independently.
```

### Chunking thresholds

| Duration | Strategy |
|----------|----------|
| < 30 min | Single pass — process full transcript at once |
| 30–90 min | Chunk by chapters (preferred) or 15-min time segments |
| > 90 min | Mandatory chapter chunks; max 15 min per chunk; merge after |

For token budget math and merge strategies, see `references/chunking-strategy.md`.

### Per-mode structure rules

**digest** (default):
1. Write summary block: 3–5 sentences covering main argument or purpose
2. Write global takeaways: 3–7 standalone bullets
3. Write `## By Chapter` section: `### Chapter Title \`0:14:23\`` + 3–5 bullets each
4. If no chapters: use 15-min segments labeled `### Segment N (0:00–15:00)`

**summary**:
1. Write abstract: 3–5 sentences (what + why + conclusion)
2. Write takeaways: 3–7 bullets
3. No chapter breakdown

**key-points**:
1. One `## Chapter Title \`timestamp\`` section per chapter
2. 3–7 bullets per chapter
3. Scale bullet count to chapter density (longer chapter → more bullets)

**transcript**:
1. One `## Chapter Title \`timestamp\`` section per chapter
2. Raw plain text of that chapter's transcript below heading
3. Deduplicate consecutive identical lines (VTT artifact)

**qa**:
1. 5–10 Q&A pairs from the full transcript
2. Cover major claims, how-tos, definitions
3. Format: `**Q:** ...\n\nA: ...` with `---` between pairs

### Segmentation source

| Source | Label in output | Reliability |
|--------|-----------------|-------------|
| YouTube chapters (native) | `[Chapter]` | High — explicit author intent |
| Description timestamps | `[Chapter]` | Medium — common but inconsistent |
| Auto-split (5-min boundaries) | `[Auto-segmented]` | Low — mechanical; use when nothing else |

**Anti-patterns for STRUCTURE:**

| Do NOT | Instead |
|--------|---------|
| Invent content not in transcript | Quote or paraphrase only what was said |
| Use prose where bullets fit | Bullets for key-points and takeaways always |
| Omit the header block | Always include — it is the provenance record |
| Label auto-splits as `[Chapter]` | Use `[Auto-segmented]` — users notice the difference |
| Return 20 bullets for a 5-min video | Scale bullet count to video length and density |

---

## Step 5: DELIVER

Print a status line first:
```
Extracted: [title] ([duration]) — source: [transcript_source] — type: [video_type] — mode: [mode]
```

Then output the formatted Markdown.

| Destination | When |
|-------------|------|
| Stdout (inline) | Default — user reads it directly in conversation |
| File (`--output PATH`) | User specifies a path or says "save to file" |

**Anti-pattern:** Do not suppress extraction warnings. If auto-captions or
auto-segmentation were used, the `[NOTICE]` block must appear in the output
so the user can calibrate trust.

---

## Verification Checklist

Before delivering:

- [ ] Header block present with all fields filled (including video type)
- [ ] `transcript_source` accurate — matches what extract script returned
- [ ] Chapter/segment labels correct (`[Chapter]` vs `[Auto-segmented]`)
- [ ] Output length appropriate for video length
- [ ] No invented facts — all claims traceable to transcript
- [ ] `[NOTICE]` block present if auto-captions or auto-segmentation used

---

## Related

- `references/youtube-api-patterns.md` — yt-dlp command reference, failure modes, optional Data API v3
- `references/transcript-formats.md` — JSON3, VTT, SRT parsing details and pitfalls
- `references/chunking-strategy.md` — Token budget math and merge strategies for long videos
