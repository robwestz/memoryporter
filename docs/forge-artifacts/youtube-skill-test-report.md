# Skill Test Report — youtube-video-digest

*Date: 2026-04-13 | Tester: Claude (automated)*

---

## Test Setup

| Field | Value |
|-------|-------|
| Video | Python in 100 Seconds |
| URL | https://www.youtube.com/watch?v=x7X9w_GIm1s |
| Channel | Fireship |
| Duration | 2:23 |
| Chapters | 5 (native YouTube chapters) |
| Modes tested | summary, key-points |
| Output | `docs/forge-artifacts/youtube-skill-test-output.md` |

---

## Workflow Execution

### Step 1: RECEIVE — PASS

- URL accepted and video ID `x7X9w_GIm1s` extracted correctly
- Mode defaulted to `digest`; overridden to test `summary` and `key-points`
- No playlist parameters present; normalization not required

### Step 2: EXTRACT — PASS

Both scripts executed successfully.

| Script | Status | Time | Notes |
|--------|--------|------|-------|
| `extract-metadata.py` | PASS | ~3s | Correct JSON, all fields populated |
| `extract-transcript.py` | PASS | ~2s | Used `youtube-transcript-api` 1.x (primary path) |

**Transcript source:** `auto-generated` — video has no manual captions.

`[NOTICE]` block triggered correctly.

**Metadata quality:**

| Field | Value | Correct? |
|-------|-------|----------|
| `title` | "Python in 100 Seconds" | ✓ |
| `channel` | "Fireship" | ✓ |
| `duration` | 143 / "2:23" | ✓ |
| `publish_date` | "2021-10-25" | ✓ (normalized from `20211025`) |
| `chapters` | 5 entries | ✓ |
| `has_manual_captions` | false | ✓ |
| `has_auto_captions` | true | ✓ |

### Step 3: CLASSIFY — PASS

Video type determined: **Tutorial**

Signals used:
- Title contains "100 Seconds" (format-based rapid overview)
- Content covers: what it is, why it's used, how syntax works — classic tutorial structure
- Single speaker walking through a programming language
- No ambiguity; Tutorial classification is unambiguous here

Classification was straightforward. The skill's signal table (title keywords, single-speaker, structured progression) worked cleanly on this video type.

### Step 4: STRUCTURE — PASS (with caveats)

**Summary mode:** Clean output. Abstract and takeaways accurately represent the video's content. Auto-caption errors were detected and corrected during synthesis:

| Raw auto-caption artifact | Corrected in output |
|---------------------------|---------------------|
| "spaming eggs" | `spam` and `eggs` (context-corrected) |
| "serers side" | server-side |
| "tupal" | tuple |
| "rappers for" | wrappers for |
| "iynb" | `.ipynb` |
| "decode" | to code |
| No punctuation throughout | Added during synthesis |

**Key-points mode:** 5 chapter sections rendered with correct timestamps. Per-chapter bullet counts appropriate for chapter length (3 bullets for short chapters, 7 for "How Python Works" which is 75 seconds).

**Chapter boundary issue (low severity):** The "Outro" chapter starts at 2:02 but substantive content (third-party libraries, pip) runs until ~2:12 before the actual sign-off. This is a video metadata issue (creator-defined chapter boundary), not a skill issue. The skill correctly used the chapter metadata as provided.

### Step 5: DELIVER — PASS

Status line emitted:
```
Extracted: Python in 100 Seconds (2:23) — source: auto-generated — type: Tutorial — mode: summary + key-points
```

Output written to `docs/forge-artifacts/youtube-skill-test-output.md`.
`[NOTICE]` block appears in both mode outputs above the content.

---

## Quality Assessment

### Would a user find this useful?

**Summary mode:** Yes. The 7-bullet takeaway list covers all major concepts covered in the video. A user who wanted to quickly understand what Python is and whether to pursue it would get accurate, complete information in ~45 seconds of reading. This is genuinely better than watching the 2:23 video for the reference use case.

**Key-points mode:** Yes, especially for the "How Python Works" chapter which is 75 seconds of fast-paced content. The bullet list makes it scannable in a way the spoken-word format cannot.

**Auto-caption correction quality:** The synthesis step (Claude's STRUCTURE pass) corrected all identifiable auto-caption errors without introducing new inaccuracies. The `[NOTICE]` block appropriately cues the user to verify names and technical terms, even though in this case they were all corrected.

### Scores

| Criterion | Score | Notes |
|-----------|-------|-------|
| Extraction accuracy | 5/5 | Both scripts ran without error; all metadata correct |
| Transcript quality | 3/5 | Auto-captions only; multiple word errors; no punctuation |
| Classification accuracy | 5/5 | Tutorial — unambiguous |
| Output structure | 5/5 | Header block, [NOTICE], chapters in correct order |
| Content accuracy | 5/5 | All facts verified against video description and known content |
| User value | 4/5 | Useful for reference/notes; less useful for nuanced technical content where auto-caption errors would accumulate |

**Overall: PASS — production-ready for typical educational content**

---

## Issues Found

### Issue 1: Script naming inconsistency (low severity)

SKILL.md references `scripts/extract-metadata.py` and `scripts/extract-transcript.py` (hyphen-separated). The scripts directory also contains `scripts/extract_transcript.py` (underscore). The hyphen-named scripts are the correct, functional versions. The underscore file may be an earlier draft.

**Recommendation:** Delete `scripts/extract_transcript.py` (underscore) to eliminate confusion. Update README Files table if needed.

### Issue 2: Auto-caption error accumulation at scale (known limitation, documented)

For a 2:23 video with clean spoken English, auto-caption errors were frequent (~8 noticeable errors in 143 seconds). For technical content (conference talks, coding tutorials with fast speech), error density would be higher. The `[NOTICE]` block correctly warns users.

**Recommendation:** No code change needed — `[NOTICE]` is the right mechanism. Consider adding a note in `references/no-transcript-fallback.md` that Whisper produces significantly better output for technical content with poor auto-captions.

### Issue 3: full_text lacks punctuation (known limitation)

The `full_text` field from `extract-transcript.py` is space-joined segments with no punctuation normalization. This is expected (auto-caption limitation) but makes the raw text difficult to use directly in the `transcript` mode. The synthesis step (Claude) naturally adds punctuation for `summary` and `key-points` modes.

**Recommendation:** For `transcript` mode, add a note in the SKILL.md that raw `full_text` from auto-captions will lack punctuation and sentence boundaries — this is expected behavior.

### Issue 4: Chapter "Outro" contains substantive content (video metadata issue)

The creator-defined "Outro" chapter (2:02) includes 10 seconds of content about third-party libraries and pip before the actual outro (2:12). This causes the last substantive content (ecosystem/pip) to appear under "Outro" rather than "How Python Works".

**Recommendation:** This is a creator metadata limitation, not a skill issue. The skill correctly uses the chapter boundaries as defined. No change needed.

---

## Verification Checklist Result

| Check | Status |
|-------|--------|
| Header block present, all fields filled | ✓ |
| `transcript_source` accurate | ✓ auto-generated |
| Chapter labels correct (`[Chapter]` for native chapters) | ✓ |
| Output length appropriate for video length | ✓ concise |
| No invented facts | ✓ all claims from transcript |
| `[NOTICE]` block present (auto-captions used) | ✓ |

---

## Conclusion

The skill package works end-to-end on a real educational video. Both extraction scripts ran without errors. The 5-step workflow (RECEIVE → EXTRACT → CLASSIFY → STRUCTURE → DELIVER) executed cleanly. The output in both summary and key-points modes is accurate, well-structured, and genuinely useful.

The primary limitation is auto-caption quality for technical content — this is documented in `references/no-transcript-fallback.md` and signaled to the user via `[NOTICE]`. For videos with manual English captions (common on well-produced educational channels), output quality would be significantly higher.

**Verdict: Skill is production-ready for short educational content. Recommend testing next with a video that has manual captions and chapters on a more technical topic.**
