# extract-transcript.py — YouTube transcript extractor
# Usage: python extract-transcript.py "https://youtube.com/watch?v=..."
#        python extract-transcript.py "https://youtube.com/watch?v=..." --lang en
# Requires: yt-dlp (mandatory), youtube-transcript-api (optional: pip install youtube-transcript-api)
# Output: JSON to stdout with keys: video_id, url, transcript_source, language, segments, full_text
# No API key required. Primary path uses youtube-transcript-api; fallback uses yt-dlp VTT subtitles.

import sys
import json
import re
import subprocess
import tempfile
import os
import argparse
from pathlib import Path


def extract_video_id(url: str) -> str:
    patterns = [
        r"(?:v=|youtu\.be/)([A-Za-z0-9_-]{11})",
        r"(?:embed/)([A-Za-z0-9_-]{11})",
        r"(?:shorts/)([A-Za-z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError(f"Could not extract video ID from URL: {url}")


def fetch_via_transcript_api(video_id: str, lang: str) -> dict:
    from youtube_transcript_api import (
        YouTubeTranscriptApi, NoTranscriptFound, TranscriptsDisabled,
        VideoUnavailable,
    )

    api = YouTubeTranscriptApi()

    try:
        transcript_list = api.list(video_id)
    except TranscriptsDisabled:
        return {"error": "transcripts_disabled", "message": "Transcripts are disabled for this video."}
    except VideoUnavailable:
        return {"error": "unavailable", "message": "This video is unavailable."}
    except Exception as e:
        return {"error": "fetch_failed", "message": str(e)}

    # Try requested language first, then English, then any available
    candidates = [lang, "en"] if lang != "en" else ["en"]
    transcript = None
    used_lang = None
    source = None

    for candidate in candidates:
        try:
            transcript = transcript_list.find_manually_created_transcript([candidate])
            used_lang = candidate
            source = "manual"
            break
        except NoTranscriptFound:
            pass

    if transcript is None:
        for candidate in candidates:
            try:
                transcript = transcript_list.find_generated_transcript([candidate])
                used_lang = candidate
                source = "auto-generated"
                break
            except NoTranscriptFound:
                pass

    if transcript is None:
        # Take whatever is available
        try:
            available = list(transcript_list)
            if not available:
                return {"error": "no_transcript", "message": "No transcripts available for this video."}
            transcript = available[0]
            used_lang = transcript.language_code
            source = "manual" if not transcript.is_generated else "auto-generated"
        except Exception as e:
            return {"error": "no_transcript", "message": str(e)}

    try:
        fetched = transcript.fetch()
    except Exception as e:
        return {"error": "fetch_failed", "message": str(e)}

    segments = [
        {
            "text": seg.text,
            "start": round(seg.start, 3),
            "duration": round(seg.duration, 3),
            "timestamp": format_timestamp(seg.start),
        }
        for seg in fetched
    ]
    full_text = " ".join(seg["text"] for seg in segments)

    return {
        "transcript_source": source,
        "language": used_lang,
        "segments": segments,
        "full_text": full_text,
    }


def format_timestamp(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def clean_vtt(vtt_text: str) -> list[dict]:
    """Parse VTT content into timestamped segments, deduplicating yt-dlp auto-sub artifacts."""
    lines = vtt_text.splitlines()
    segments = []
    seen_texts = []
    i = 0

    # Skip WEBVTT header
    while i < len(lines) and not re.match(r"\d{2}:\d{2}", lines[i]):
        i += 1

    while i < len(lines):
        line = lines[i].strip()
        # Timestamp line: 00:00:00.000 --> 00:00:05.000
        ts_match = re.match(r"(\d{2}:\d{2}:\d{2}[\.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[\.,]\d{3})", line)
        if ts_match:
            start_str = ts_match.group(1).replace(",", ".")
            start_sec = vtt_time_to_seconds(start_str)
            i += 1
            # Collect text lines until blank line
            text_lines = []
            while i < len(lines) and lines[i].strip():
                raw = lines[i].strip()
                # Strip inline timing tags like <00:00:01.234>
                clean = re.sub(r"<\d{2}:\d{2}:\d{2}\.\d{3}>", "", raw)
                clean = re.sub(r"</?c>", "", clean).strip()
                if clean:
                    text_lines.append(clean)
                i += 1
            text = " ".join(text_lines)
            # Deduplicate: yt-dlp repeats lines in overlapping windows
            if text and text not in seen_texts[-3:]:
                segments.append({
                    "text": text,
                    "start": round(start_sec, 3),
                    "timestamp": format_timestamp(start_sec),
                })
                seen_texts.append(text)
        else:
            i += 1

    return segments


def vtt_time_to_seconds(ts: str) -> float:
    parts = ts.split(":")
    h, m, s = int(parts[0]), int(parts[1]), float(parts[2])
    return h * 3600 + m * 60 + s


def fetch_via_ytdlp(video_id: str, lang: str) -> dict:
    url = f"https://www.youtube.com/watch?v={video_id}"

    with tempfile.TemporaryDirectory() as tmpdir:
        cmd = [
            "yt-dlp",
            "--skip-download",
            "--write-auto-subs",
            "--write-subs",
            "--sub-langs", lang,
            "--sub-format", "vtt",
            "--output", os.path.join(tmpdir, "%(id)s.%(ext)s"),
            "--quiet",
            url,
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)

        # Look for any .vtt file
        vtt_files = list(Path(tmpdir).glob("*.vtt"))
        if not vtt_files:
            # Try with auto-subs in any language
            cmd_fallback = [
                "yt-dlp",
                "--skip-download",
                "--write-auto-subs",
                "--sub-langs", "en.*",
                "--sub-format", "vtt",
                "--output", os.path.join(tmpdir, "%(id)s.%(ext)s"),
                "--quiet",
                url,
            ]
            subprocess.run(cmd_fallback, capture_output=True, text=True)
            vtt_files = list(Path(tmpdir).glob("*.vtt"))

        if not vtt_files:
            return {
                "error": "no_transcript",
                "message": "No subtitles/captions available via yt-dlp."
            }

        vtt_path = vtt_files[0]
        vtt_text = vtt_path.read_text(encoding="utf-8", errors="replace")
        source_lang = vtt_path.stem.split(".")[-1] if "." in vtt_path.stem else lang

        segments = clean_vtt(vtt_text)
        if not segments:
            return {"error": "parse_failed", "message": "VTT file found but could not parse segments."}

        full_text = " ".join(s["text"] for s in segments)
        return {
            "transcript_source": "auto-generated-vtt",
            "language": source_lang,
            "segments": segments,
            "full_text": full_text,
        }


def main():
    parser = argparse.ArgumentParser(
        description="Extract YouTube transcript as structured JSON."
    )
    parser.add_argument("url", help="YouTube video URL")
    parser.add_argument("--lang", default="en", help="Preferred language code (default: en)")
    args = parser.parse_args()

    try:
        video_id = extract_video_id(args.url)
    except ValueError as e:
        print(json.dumps({"error": "invalid_url", "message": str(e)}), flush=True)
        sys.exit(1)

    # Try youtube-transcript-api first
    try:
        from youtube_transcript_api import YouTubeTranscriptApi  # noqa: F401
        result = fetch_via_transcript_api(video_id, args.lang)
    except ImportError:
        result = {"error": "fallback"}  # signal to use yt-dlp

    # Fall back to yt-dlp VTT if transcript-api failed or not installed
    if "error" in result:
        if result["error"] != "no_transcript":
            ytdlp_result = fetch_via_ytdlp(video_id, args.lang)
            if "error" not in ytdlp_result:
                result = ytdlp_result
            # else keep original error from transcript-api (more informative)

    output = {
        "video_id": video_id,
        "url": args.url,
        **result,
    }
    print(json.dumps(output, ensure_ascii=False, indent=2), flush=True)


if __name__ == "__main__":
    main()
