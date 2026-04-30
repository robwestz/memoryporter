# YouTube Content Extraction — Tool Research

*Date: 2026-04-13 | System: Windows 11, Python 3.14.3*

---

## System Check Results

| Tool | Status | Notes |
|------|--------|-------|
| `yt-dlp` | **INSTALLED** v2026.3.17 | `C:\Python314\Lib\site-packages` |
| `youtube_transcript_api` | **NOT installed** | Can be installed via pip (v1.2.4 available) |
| `YOUTUBE_API_KEY` | **NOT SET** | YouTube Data API v3 requires manual setup |

---

## 1. yt-dlp

**Best all-around tool. Already installed.**

### Install
```bash
pip install yt-dlp
# or standalone exe from https://github.com/yt-dlp/yt-dlp/releases
```

### Transcript / Subtitle Extraction

```bash
# List all available subtitle languages
yt-dlp --list-subs "https://www.youtube.com/watch?v=VIDEO_ID"

# Download manually-created subs (English)
yt-dlp --write-subs --sub-langs en --skip-download "VIDEO_URL"

# Download auto-generated subs (YouTube ASR)
yt-dlp --write-auto-subs --sub-langs en --skip-download "VIDEO_URL"

# Download BOTH manual + auto-generated
yt-dlp --write-subs --write-auto-subs --sub-langs en --skip-download "VIDEO_URL"

# Output as SRT instead of VTT
yt-dlp --write-auto-subs --sub-langs en --sub-format srt --skip-download "VIDEO_URL"

# Convert VTT → plain text (strip timestamps)
yt-dlp --write-auto-subs --sub-langs en --skip-download \
  --convert-subs srt "VIDEO_URL"
```

Output files: `<title>.en.vtt` or `<title>.en.srt`

### Metadata Extraction

```bash
# Dump all metadata as JSON (no download)
yt-dlp --dump-json --skip-download "VIDEO_URL"

# Write metadata to .info.json file
yt-dlp --write-info-json --skip-download "VIDEO_URL"

# Key fields in .info.json:
# id, title, description, uploader, upload_date, duration,
# view_count, like_count, tags, categories,
# chapters (list of {title, start_time, end_time}),
# subtitles, automatic_captions, thumbnails
```

### Chapter Extraction

Chapters are included in `--dump-json` output under the `chapters` key:

```json
"chapters": [
  {"title": "Intro", "start_time": 0.0, "end_time": 45.0},
  {"title": "Main topic", "start_time": 45.0, "end_time": 300.0}
]
```

Extract chapters only via Python:
```python
import json, subprocess
result = subprocess.run(
    ["yt-dlp", "--dump-json", "--skip-download", VIDEO_URL],
    capture_output=True, text=True
)
data = json.loads(result.stdout)
chapters = data.get("chapters", [])
description = data.get("description", "")
```

### Limitations
- Auto-generated subtitles may have poor punctuation and word boundaries
- Rate-limited by YouTube; add `--sleep-interval 2` for bulk downloads
- VTT format has timing tags (`<00:00:01.234>`) that need stripping for plain text
- Some videos are age-gated or region-locked → requires cookies (`--cookies-from-browser chrome`)
- **No API key required** — works via web scraping

---

## 2. youtube-transcript-api (Python)

**Simplest for transcript-only extraction. Not installed, but installable.**

### Install
```bash
pip install youtube-transcript-api
```

### Usage

```python
from youtube_transcript_api import YouTubeTranscriptApi

# Get transcript (auto-selects best available language)
transcript = YouTubeTranscriptApi.get_transcript("VIDEO_ID")

# Each entry: {'text': '...', 'start': 0.0, 'duration': 2.5}
full_text = " ".join(entry["text"] for entry in transcript)

# List all available transcripts for a video
transcript_list = YouTubeTranscriptApi.list_transcripts("VIDEO_ID")
for t in transcript_list:
    print(t.language, t.language_code, t.is_generated, t.is_translatable)

# Get a specific language
transcript = YouTubeTranscriptApi.get_transcript("VIDEO_ID", languages=["en", "en-US"])

# Fetch auto-generated if no manual exists
for t in transcript_list:
    if t.is_generated:
        data = t.fetch()
```

### CLI Usage
```bash
youtube_transcript_api VIDEO_ID --languages en
youtube_transcript_api VIDEO_ID --format json
```

### Limitations
- Transcripts only — no metadata, chapters, or video download
- Requires the video to have subtitles (auto or manual)
- Some videos have transcripts disabled → raises `TranscriptsDisabled`
- May break if YouTube changes their internal API (has happened before)
- **No API key required** — reverse-engineers YouTube's internal caption endpoint
- Current version: 1.2.4 (as of 2026-04-13)

---

## 3. YouTube Data API v3

**Official API. Structured metadata, search, channel data. Requires API key.**

### Setup
1. Go to Google Cloud Console → enable YouTube Data API v3
2. Create an API key (free tier: 10,000 units/day)
3. Set `YOUTUBE_API_KEY=your_key` in environment

### What You Can Get (without OAuth)

```bash
# Video metadata
GET https://www.googleapis.com/youtube/v3/videos
  ?part=snippet,contentDetails,statistics,chapters
  &id=VIDEO_ID
  &key=API_KEY

# Returns: title, description, publishedAt, channelId, tags,
#          categoryId, duration (ISO 8601), viewCount, likeCount,
#          commentCount, thumbnails
```

```python
import requests

def get_video_metadata(video_id, api_key):
    url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "part": "snippet,contentDetails,statistics",
        "id": video_id,
        "key": api_key
    }
    return requests.get(url, params=params).json()
```

### Captions via API (requires OAuth, not just API key)

The `captions.list` and `captions.download` endpoints require **OAuth 2.0** (user must authenticate as the video owner). Public captions cannot be downloaded via the Data API without OAuth — this is a deliberate restriction.

**Workaround:** Use `yt-dlp` or `youtube-transcript-api` for public captions instead.

### Limitations
- **API key required** for all requests (not installed/set on this system)
- Caption download requires OAuth (video owner only)
- 10,000 units/day free quota; list=100 units, captions.list=50 units
- Chapters are NOT returned in API responses — they're parsed from the description by clients
- No transcript/subtitle content available without OAuth

---

## 4. Other Tools Worth Knowing

### pytube
```bash
pip install pytube
```
- Python library for video/audio download
- Can access `captions` attribute on YouTube objects
- Less reliable than yt-dlp (breaks more often with YouTube changes)
- Simpler API for caption extraction when it works

```python
from pytube import YouTube
yt = YouTube("https://www.youtube.com/watch?v=VIDEO_ID")
caption = yt.captions.get_by_language_code("en")
if caption:
    print(caption.generate_srt_captions())
```

### ffmpeg (subtitle extraction from downloaded files)
If you have a video file with embedded subtitles:
```bash
ffmpeg -i video.mp4 -map 0:s:0 subtitles.srt
```

### Whisper (OpenAI) — audio → transcript
For videos without subtitles:
```bash
pip install openai-whisper
whisper audio.mp3 --model medium --language en
```
- Requires downloading the video first (via yt-dlp)
- Runs locally, no API key needed (model weights downloaded on first use)
- High accuracy, handles accents well
- Medium model: ~1.5GB, processes ~1 min audio in ~10-30s on CPU

---

## Recommended Stack for This System

Given what's installed:

| Task | Best Tool | Command |
|------|-----------|---------|
| Get transcript (quick) | `yt-dlp` (installed) | `yt-dlp --write-auto-subs --skip-download` |
| Get full metadata + chapters | `yt-dlp` (installed) | `yt-dlp --dump-json --skip-download` |
| Clean transcript in Python | install `youtube-transcript-api` | `pip install youtube-transcript-api` |
| Videos without subtitles | Whisper (needs install) | `pip install openai-whisper` |

**Install recommendation:**
```bash
pip install youtube-transcript-api
```
This covers the most common transcript use case with the cleanest API. yt-dlp handles everything else.

---

## Quick Recipes

### Extract clean transcript text via yt-dlp (no extra deps)

```bash
# 1. Download auto-subtitles as VTT
yt-dlp --write-auto-subs --sub-langs en --skip-download "VIDEO_URL"

# 2. Strip VTT formatting to plain text (Python)
python -c "
import re, sys
vtt = open(sys.argv[1]).read()
# Remove VTT header and timing lines
lines = [l for l in vtt.splitlines() 
         if l and not re.match(r'^\d{2}:\d{2}', l) 
         and not l.startswith('WEBVTT')
         and not l.startswith('Kind:')
         and not l.startswith('Language:')]
# Deduplicate consecutive identical lines (yt-dlp auto-subs repeat)
seen = []
for l in lines:
    clean = re.sub(r'<[^>]+>', '', l).strip()
    if clean and clean != (seen[-1] if seen else ''):
        seen.append(clean)
print(' '.join(seen))
" video.en.vtt
```

### Full metadata + transcript in one Python script

```python
import json, subprocess, re

def extract_youtube_content(url):
    # Get metadata
    result = subprocess.run(
        ["yt-dlp", "--dump-json", "--skip-download", url],
        capture_output=True, text=True
    )
    data = json.loads(result.stdout)
    
    return {
        "id": data["id"],
        "title": data["title"],
        "description": data.get("description", ""),
        "duration": data.get("duration"),
        "upload_date": data.get("upload_date"),
        "view_count": data.get("view_count"),
        "chapters": data.get("chapters", []),
        "has_auto_captions": bool(data.get("automatic_captions")),
        "has_manual_captions": bool(data.get("subtitles")),
    }
```
