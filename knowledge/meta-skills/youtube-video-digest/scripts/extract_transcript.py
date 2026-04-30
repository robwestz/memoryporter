#!/usr/bin/env python3
"""
extract_transcript.py — YouTube transcript extractor for youtube-video-digest skill

Fetches transcript and metadata from a YouTube video using yt-dlp and outputs
a structured markdown document ready for Claude to consume.

Usage:
    python extract_transcript.py <URL_OR_VIDEO_ID> [options]

Options:
    --meta-only          Fetch metadata only, write JSON to --output
    --fetch-captions     Fetch captions only (internal use; default is full pipeline)
    --lang LANG          Caption language code (default: en)
    --mode MODE          Output mode: full-transcript, summary, key-points,
                         qa-extraction (default: full-transcript)
    --output PATH        Output file path; use - for stdout (default: -)
    --sleep SECS         Sleep between yt-dlp requests — use 2 for batch (default: 0)
    --api-key KEY        YouTube Data API v3 key for richer metadata (optional)

Requirements:
    pip install yt-dlp

Exit codes:
    0  Success
    1  Bad input / no captions available
    2  Video unavailable or private
    3  yt-dlp not installed
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path


# ─────────────────────────────────────────────────────────────────────────────
# URL Normalization
# ─────────────────────────────────────────────────────────────────────────────

_VIDEO_ID_RE = re.compile(r'^[A-Za-z0-9_-]{11}$')

_URL_PATTERNS = [
    # Standard: youtube.com/watch?v=VIDEO_ID (captures before & or end)
    re.compile(r'[?&]v=([A-Za-z0-9_-]{11})'),
    # Short: youtu.be/VIDEO_ID
    re.compile(r'youtu\.be/([A-Za-z0-9_-]{11})'),
    # Embed: youtube.com/embed/VIDEO_ID
    re.compile(r'youtube\.com/embed/([A-Za-z0-9_-]{11})'),
    # Shorts: youtube.com/shorts/VIDEO_ID
    re.compile(r'youtube\.com/shorts/([A-Za-z0-9_-]{11})'),
]


def normalize_video_id(url_or_id: str) -> str:
    """
    Extract the canonical 11-character video ID from any YouTube URL form.

    Accepts:
      - Standard watch URL:   https://www.youtube.com/watch?v=dQw4w9WgXcQ
      - Short URL:            https://youtu.be/dQw4w9WgXcQ
      - Embed URL:            https://www.youtube.com/embed/dQw4w9WgXcQ
      - Shorts URL:           https://www.youtube.com/shorts/dQw4w9WgXcQ
      - Bare ID:              dQw4w9WgXcQ

    Raises ValueError on unrecognized input.
    """
    url_or_id = url_or_id.strip()

    if _VIDEO_ID_RE.match(url_or_id):
        return url_or_id

    for pattern in _URL_PATTERNS:
        match = pattern.search(url_or_id)
        if match:
            return match.group(1)

    raise ValueError(
        f"Cannot extract video ID from: {url_or_id!r}\n"
        "Supported forms: standard URL, youtu.be short URL, embed URL, "
        "Shorts URL, or bare 11-character video ID."
    )


# ─────────────────────────────────────────────────────────────────────────────
# yt-dlp helpers
# ─────────────────────────────────────────────────────────────────────────────

def _check_ytdlp() -> None:
    """Exit with code 3 if yt-dlp is not installed."""
    try:
        subprocess.run(['yt-dlp', '--version'], capture_output=True, check=True)
    except FileNotFoundError:
        print(
            "ERROR: yt-dlp not found.\n"
            "Install with: pip install yt-dlp\n"
            "Keep up to date: pip install -U yt-dlp",
            file=sys.stderr,
        )
        sys.exit(3)


def fetch_metadata(video_id: str, sleep: int = 0) -> dict:
    """
    Fetch video metadata using yt-dlp --dump-json.

    Returns the parsed JSON object with fields including:
      title, channel, uploader, description, duration, upload_date,
      chapters (list, may be absent), id
    """
    url = f'https://www.youtube.com/watch?v={video_id}'
    cmd = ['yt-dlp', '--dump-json', '--no-playlist']
    if sleep:
        cmd += ['--sleep-interval', str(sleep)]
    cmd.append(url)

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        stderr = result.stderr.strip()
        if any(phrase in stderr for phrase in ('Private video', 'not available', 'This video has been removed')):
            print(f"ERROR: Video unavailable or private — {video_id}", file=sys.stderr)
            sys.exit(2)
        raise RuntimeError(f"yt-dlp metadata fetch failed:\n{stderr}")

    return json.loads(result.stdout)


def fetch_captions(video_id: str, lang: str = 'en', output_dir: str = '.', sleep: int = 0) -> tuple:
    """
    Download the best available caption track.

    Returns (file_path: str, source: str) where source is 'manual' or 'auto-generated'.
    Returns (None, None) if no captions are available.

    Priority: manual captions > auto-generated captions.
    Both are converted to SRT by yt-dlp for uniform parsing.
    """
    url = f'https://www.youtube.com/watch?v={video_id}'
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    base_args = [
        'yt-dlp',
        '--skip-download',
        '--no-playlist',
        '--sub-langs', lang,
        '--convert-subs', 'srt',
        '-o', os.path.join(output_dir, '%(id)s.%(ext)s'),
    ]
    if sleep:
        base_args += ['--sleep-interval', str(sleep)]

    # Attempt 1: manual captions
    subprocess.run(base_args + ['--write-subs', url], capture_output=True, text=True)
    caption_files = list(Path(output_dir).glob('*.srt')) + list(Path(output_dir).glob('*.vtt'))
    if caption_files:
        return str(caption_files[0]), 'manual'

    # Attempt 2: auto-generated captions
    subprocess.run(base_args + ['--write-auto-subs', url], capture_output=True, text=True)
    caption_files = list(Path(output_dir).glob('*.srt')) + list(Path(output_dir).glob('*.vtt'))
    if caption_files:
        return str(caption_files[0]), 'auto-generated'

    return None, None


# ─────────────────────────────────────────────────────────────────────────────
# Transcript Parsing
# ─────────────────────────────────────────────────────────────────────────────

_SRT_TIMESTAMP_RE = re.compile(
    r'(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})'
)
_HTML_TAG_RE = re.compile(r'<[^>]+>')
_DESCRIPTION_TS_RE = re.compile(
    r'^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\s+(.+)$',
    re.MULTILINE,
)


def _to_ms(h: int, m: int, s: int, ms: int = 0) -> int:
    return ((h * 60 + m) * 60 + s) * 1000 + ms


def parse_srt(content: str) -> list:
    """
    Parse SRT content into [{start_ms, end_ms, text}, ...].

    Handles both standard SRT from yt-dlp and converted-from-VTT SRT files.
    Strips HTML tags that yt-dlp injects in auto-caption downloads.
    """
    entries = []
    for block in re.split(r'\n{2,}', content.strip()):
        lines = block.strip().splitlines()
        for i, line in enumerate(lines):
            m = _SRT_TIMESTAMP_RE.match(line.strip())
            if m:
                start = _to_ms(int(m.group(1)), int(m.group(2)), int(m.group(3)), int(m.group(4)))
                end = _to_ms(int(m.group(5)), int(m.group(6)), int(m.group(7)), int(m.group(8)))
                raw_text = ' '.join(lines[i + 1:]).strip()
                text = _HTML_TAG_RE.sub('', raw_text).strip()
                if text:
                    entries.append({'start_ms': start, 'end_ms': end, 'text': text})
                break
    return entries


def parse_chapters_from_description(description: str) -> list:
    """
    Extract chapter timestamps from the video description.

    Matches lines like:
      0:00 Introduction
      00:00:00 Intro
      1:23:45 Deep Dive

    Returns [{title, start_ms}, ...] sorted by start time.
    Only invoked when yt-dlp returns no native chapters.
    """
    chapters = []
    for m in _DESCRIPTION_TS_RE.finditer(description):
        h = int(m.group(1)) if m.group(1) else 0
        mins = int(m.group(2))
        secs = int(m.group(3))
        title = m.group(4).strip()
        chapters.append({'title': title, 'start_ms': _to_ms(h, mins, secs)})

    # Require at least 2 timestamps to treat as a chapter list
    if len(chapters) < 2:
        return []

    return sorted(chapters, key=lambda c: c['start_ms'])


# ─────────────────────────────────────────────────────────────────────────────
# Segmentation
# ─────────────────────────────────────────────────────────────────────────────

_AUTO_SEGMENT_MS = 5 * 60 * 1000  # 5-minute target


def segment_by_chapters(entries: list, chapters: list, duration_ms: int) -> list:
    """Assign transcript entries to chapter-defined segments."""
    segments = []
    for i, ch in enumerate(chapters):
        start = ch['start_ms']
        end = chapters[i + 1]['start_ms'] if i + 1 < len(chapters) else duration_ms
        seg_entries = [e for e in entries if start <= e['start_ms'] < end]
        segments.append({
            'title': ch['title'],
            'start_ms': start,
            'end_ms': end,
            'label': '[Chapter]',
            'entries': seg_entries,
        })
    return segments


def segment_auto(entries: list, duration_ms: int) -> list:
    """
    Split transcript into ~5-minute segments when no chapters are available.

    Splits at the entry boundary nearest to each 5-minute mark, not mid-sentence.
    All segments are labeled [Auto-segmented] to distinguish from author chapters.
    """
    if not entries:
        return []

    segments = []
    current: list = []
    current_start = entries[0]['start_ms']
    seg_num = 1
    next_boundary = current_start + _AUTO_SEGMENT_MS

    for entry in entries:
        if entry['start_ms'] >= next_boundary and current:
            segments.append({
                'title': f'Segment {seg_num}',
                'start_ms': current_start,
                'end_ms': entry['start_ms'],
                'label': '[Auto-segmented]',
                'entries': current,
            })
            seg_num += 1
            current_start = entry['start_ms']
            next_boundary = current_start + _AUTO_SEGMENT_MS
            current = []
        current.append(entry)

    if current:
        segments.append({
            'title': f'Segment {seg_num}',
            'start_ms': current_start,
            'end_ms': duration_ms,
            'label': '[Auto-segmented]',
            'entries': current,
        })

    return segments


# ─────────────────────────────────────────────────────────────────────────────
# Output Assembly
# ─────────────────────────────────────────────────────────────────────────────

def _fmt_ts(ms_val: int) -> str:
    """Convert milliseconds to [H:MM:SS] format."""
    total_s = ms_val // 1000
    h = total_s // 3600
    m = (total_s % 3600) // 60
    s = total_s % 60
    return f"[{h}:{m:02d}:{s:02d}]"


def _fmt_duration(seconds: int) -> str:
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    return f"{h}:{m:02d}:{s:02d}"


def assemble_document(
    metadata: dict,
    segments: list,
    caption_source: str,
    mode: str,
    notices: list,
) -> str:
    """
    Compose the final markdown document.

    Structure:
      1. Metadata header (always present)
      2. [NOTICE] blocks (one per fallback; omitted if none)
      3. Horizontal rule
      4. Mode-specific content
    """
    video_id = metadata.get('id', '')
    title = metadata.get('title', 'Unknown Title')
    channel = metadata.get('channel') or metadata.get('uploader', 'Unknown')

    raw_date = metadata.get('upload_date', '')
    upload_date = (
        f"{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:]}"
        if len(raw_date) == 8 else raw_date
    )

    duration = _fmt_duration(int(metadata.get('duration', 0)))
    url = f"https://www.youtube.com/watch?v={video_id}"

    lines = [
        f"# {title}",
        "",
        "## Metadata",
        "",
        f"- **Channel:** {channel}",
        f"- **Published:** {upload_date}",
        f"- **Duration:** {duration}",
        f"- **URL:** {url}",
        f"- **Transcript source:** {caption_source}",
        f"- **Mode:** {mode}",
        "",
    ]

    for notice in notices:
        lines += [f"> [NOTICE] {notice}", ""]

    lines += ["---", ""]

    if mode == 'full-transcript':
        for seg in segments:
            ts = _fmt_ts(seg['start_ms'])
            lines.append(f"## {seg['label']} {seg['title']} {ts}")
            lines.append("")
            for entry in seg['entries']:
                lines.append(f"{_fmt_ts(entry['start_ms'])} {entry['text']}")
            lines.append("")

    elif mode in ('summary', 'key-points', 'qa-extraction'):
        mode_label = {
            'summary': 'Summary',
            'key-points': 'Key Points',
            'qa-extraction': 'Q&A Extraction',
        }[mode]
        template_ref = {
            'summary': 'templates/summary-output.md',
            'key-points': 'templates/key-points-output.md',
            'qa-extraction': 'templates/qa-output.md',
        }[mode]

        lines += [
            f"<!-- Claude: apply the {mode_label} template from {template_ref} -->",
            f"<!-- Structured transcript follows — process in {mode} mode -->",
            "",
        ]
        for seg in segments:
            ts = _fmt_ts(seg['start_ms'])
            lines.append(f"## {seg['label']} {seg['title']} {ts}")
            lines.append("")
            for entry in seg['entries']:
                lines.append(f"{_fmt_ts(entry['start_ms'])} {entry['text']}")
            lines.append("")

    return '\n'.join(lines)


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description='YouTube transcript extractor for youtube-video-digest skill',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument('url_or_id', help='YouTube URL or video ID')
    parser.add_argument('--meta-only', action='store_true',
                        help='Fetch and output metadata JSON only; skip transcript')
    parser.add_argument('--lang', default='en', metavar='LANG',
                        help='Caption language code (default: en)')
    parser.add_argument('--mode', default='full-transcript',
                        choices=['full-transcript', 'summary', 'key-points', 'qa-extraction'],
                        help='Output mode (default: full-transcript)')
    parser.add_argument('--output', default='-', metavar='PATH',
                        help='Output file path; - for stdout (default: -)')
    parser.add_argument('--sleep', type=int, default=0, metavar='SECS',
                        help='Sleep between yt-dlp requests (default: 0; use 2 for batch)')

    args = parser.parse_args()

    _check_ytdlp()

    # Step 1: Normalize input
    try:
        video_id = normalize_video_id(args.url_or_id)
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)

    print(f"[youtube-video-digest] video_id={video_id}", file=sys.stderr)

    # Step 2: Fetch metadata
    print("[youtube-video-digest] Fetching metadata...", file=sys.stderr)
    metadata = fetch_metadata(video_id, sleep=args.sleep)

    if args.meta_only:
        output = json.dumps(metadata, indent=2, ensure_ascii=False)
        _write_output(output, args.output)
        return

    # Step 3: Fetch transcript
    notices: list = []
    with tempfile.TemporaryDirectory() as tmpdir:
        print(f"[youtube-video-digest] Fetching captions (lang={args.lang})...", file=sys.stderr)
        caption_file, caption_source = fetch_captions(
            video_id, lang=args.lang, output_dir=tmpdir, sleep=args.sleep
        )

        if not caption_file:
            print(
                f"ERROR: No captions available for video {video_id} in language '{args.lang}'.\n"
                "Try: --lang en-US, --lang en-GB, or the video's native language code.\n"
                "If no captions exist at all, use Whisper: pip install openai-whisper",
                file=sys.stderr,
            )
            sys.exit(1)

        print(f"[youtube-video-digest] Caption source: {caption_source}", file=sys.stderr)

        if caption_source == 'auto-generated':
            notices.append(
                "Auto-generated captions detected — technical terms, names, and "
                "acronyms may be inaccurate. Verify critical information independently."
            )

        # Step 4: Parse transcript
        content = Path(caption_file).read_text(encoding='utf-8')

    entries = parse_srt(content)
    print(f"[youtube-video-digest] Parsed {len(entries)} transcript entries.", file=sys.stderr)

    # Step 5: Detect chapters and segment
    chapters = metadata.get('chapters') or []

    if not chapters:
        desc = metadata.get('description', '')
        chapters = parse_chapters_from_description(desc)
        if chapters:
            print(
                f"[youtube-video-digest] Found {len(chapters)} chapters in description.",
                file=sys.stderr,
            )

    duration_ms = int(metadata.get('duration', 0)) * 1000

    if chapters:
        segments = segment_by_chapters(entries, chapters, duration_ms)
        print(f"[youtube-video-digest] Segmented into {len(segments)} chapters.", file=sys.stderr)
    elif duration_ms <= 5 * 60 * 1000:
        segments = [{
            'title': metadata.get('title', 'Video'),
            'start_ms': 0,
            'end_ms': duration_ms,
            'label': '[Chapter]',
            'entries': entries,
        }]
    else:
        segments = segment_auto(entries, duration_ms)
        notices.append(
            f"No chapters found — video split into {len(segments)} auto-generated segments "
            "of approximately 5 minutes each. Segment titles are inferred, not authored."
        )
        print(
            f"[youtube-video-digest] Auto-segmented into {len(segments)} segments.",
            file=sys.stderr,
        )

    # Steps 6 + 7: Assemble output
    document = assemble_document(metadata, segments, caption_source, args.mode, notices)
    _write_output(document, args.output)


def _write_output(content: str, path: str) -> None:
    if path == '-':
        print(content)
    else:
        out = Path(path)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(content, encoding='utf-8')
        print(f"[youtube-video-digest] Output written to {path}", file=sys.stderr)


if __name__ == '__main__':
    main()
