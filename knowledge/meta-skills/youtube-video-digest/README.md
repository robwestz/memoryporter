# YouTube Video Digest

> Extracts and structures any YouTube video's transcript and metadata into a Claude-readable markdown document with five selectable output modes.

## What It Does

Given a YouTube URL or video ID, this skill runs `scripts/extract-metadata.py` and `scripts/extract-transcript.py` (yt-dlp wrappers) to pull the transcript and metadata, classifies the video type (tutorial, talk, interview, lecture, essay, entertainment), segments content by chapters or auto-generated boundaries, and produces a structured markdown document. Five output modes are available: `digest` (default), `summary`, `key-points`, `transcript`, and `qa`. No API key required. No video download.

## Supported Clients

- Claude Code
- Cursor
- Codex
- Any AI client that can read SKILL.md and execute bash commands

## Prerequisites

- Python 3.9+
- `yt-dlp` — `pip install yt-dlp` (keep updated; YouTube breaks older versions)
- `requests` — `pip install requests` (only needed if using the optional YouTube Data API v3 key)
- Internet access (the script fetches from YouTube at runtime)
- No YouTube account or API key required for basic usage

## Installation

1. Copy the entire `youtube-video-digest/` directory into the skills location for your AI client.
2. Verify the script is runnable: `python scripts/extract_transcript.py --help`
3. Restart or reload the client so it picks up `SKILL.md`.
4. Test with a trigger prompt: `"Digest this YouTube video: https://www.youtube.com/watch?v=dQw4w9WgXcQ — give me key points."`

For Claude Code:

```bash
mkdir -p ~/.claude/skills/youtube-video-digest
cp -r . ~/.claude/skills/youtube-video-digest/
```

## Trigger Conditions

- "youtube-video-digest"
- "Digest this YouTube video: [URL]"
- "Summarize this YouTube video"
- "Get the transcript from [URL]"
- "Extract key points from this video: [URL]"
- "What does this video cover?"
- "Turn this video into notes"
- "I want to ask questions about [URL]"
- Any youtube.com or youtu.be URL with no explicit instruction (defaults to digest)

## Expected Outcome

When installed and invoked correctly, the skill produces:

- A status line: `Extracted: [title] ([duration]) — source: [transcript_source] — type: [video_type] — mode: [mode]`
- A `.md` document with a header block (title, URL, channel, published, duration, mode, video type, transcript source)
- Optional `[NOTICE]` block if auto-captions or auto-segmentation were used
- Mode-specific content (default: `digest` — summary + global takeaways + per-chapter bullets)
- Segments labeled `[Chapter]` (author-defined) or `[Auto-segmented]` (inferred)

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Core skill — 5-step workflow, decision tables, anti-patterns |
| `README.md` | This file — installation, usage, troubleshooting |
| `metadata.json` | Machine-readable metadata for indexing and discovery |
| `scripts/extract-metadata.py` | yt-dlp wrapper: fetches title, channel, duration, chapters |
| `scripts/extract-transcript.py` | Transcript extractor: transcript-api primary, yt-dlp VTT fallback |
| `templates/metadata-header.md` | Fixed header block used at the top of every output mode |
| `templates/full-transcript.md` | Segment structure for verbatim transcript output |
| `templates/summary.md` | Structure for abstract + key takeaways |
| `templates/key-points.md` | Structure for per-chapter bullet extraction |
| `templates/qa-extraction.md` | Structure for Q&A pair extraction |
| `templates/study-notes.md` | Structure for digest (summary + per-chapter bullets) |
| `references/transcript-formats.md` | JSON3, VTT, SRT parsing details and format quirks |
| `references/youtube-api-patterns.md` | yt-dlp command reference + optional YouTube Data API v3 |
| `references/chunking-strategy.md` | Token estimation and chunking logic for long videos |

## Troubleshooting

**Issue: `yt-dlp: command not found` or `FileNotFoundError`**
Solution: Install yt-dlp with `pip install yt-dlp`. If it is installed but not on PATH, call it as `python -m yt_dlp` and update the `cmd` list in `extract_transcript.py` line 1 of the `check_ytdlp()` function to match.

**Issue: `ERROR: No captions available for this video`**
Solution: The video has no caption tracks in the requested language. Try `--lang` with a different code (e.g., `--lang en-US`, `--lang en-GB`, or the video's native language). If no captions exist at all, use Whisper for audio transcription: `whisper <audio_file> --language en`.

**Issue: Output segments are all `[Auto-segmented]` even though the video has chapters**
Solution: yt-dlp did not return a `chapters` field for this video. This happens when chapters are defined in the description but not as native YouTube chapters. The script will attempt description-timestamp parsing automatically. If that also fails, the video's description may use a non-standard format — check `meta.json` after running `--meta-only` and look at the `description` field.

**Issue: Transcript contains garbled technical terms or names**
Solution: Auto-generated captions are in use (check the `[NOTICE]` block). This is normal for technical content. Verify critical terms independently. If manual captions are available in another language, try `--lang [code]` to get the manually-transcribed track.

**Issue: Skill does not activate in Claude Code**
Solution: Confirm `SKILL.md` is in a directory that Claude Code scans for skills (typically `~/.claude/skills/`). The trigger phrases must appear in the `description` frontmatter field — verify the frontmatter is valid YAML (no tabs, no trailing spaces after `|`).

## Notes for Other Clients

The core behavior that must be preserved is: run `scripts/extract_transcript.py` with the video ID and mode, then load the output into the conversation context before applying the mode-specific template. Clients other than Claude Code may expose the script differently (as a tool call, MCP server, or manual paste step), but the structured markdown output format is client-agnostic.
