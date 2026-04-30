# Quality Gate Verification — youtube-video-digest

*Date: 2026-04-13 | Gate: knowledge/meta-skills/skill-forge/references/quality-gate.md*

---

## File Tree

```
knowledge/meta-skills/youtube-video-digest/
├── SKILL.md                             261 lines
├── README.md                             98 lines
├── metadata.json
│
├── scripts/
│   ├── extract-metadata.py              149 lines  ← active
│   ├── extract-transcript.py            264 lines  ← active
│   └── extract_transcript.py            ???  lines  ← STALE (underscore — older version)
│
├── templates/
│   ├── metadata-header.md                36 lines
│   ├── full-transcript.md                44 lines
│   ├── full-transcript-output.md         34 lines
│   ├── key-points.md                     48 lines
│   ├── key-points-output.md              50 lines
│   ├── summary.md                        58 lines
│   ├── summary-output.md                 48 lines
│   ├── qa-extraction.md                  52 lines
│   ├── qa-output.md                      49 lines
│   └── study-notes.md                    83 lines
│
├── references/
│   ├── transcript-formats.md            192 lines
│   ├── chunking-strategy.md             184 lines
│   └── youtube-api-patterns.md          208 lines
│
└── examples/
    └── example-digest.md                169 lines
```

**Shape:** Production (SKILL + README + metadata + scripts + templates + references + examples)

---

## Category 1: Structural Integrity — 13/13 MUST PASS

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1.1 | SKILL.md exists | ✓ PASS | |
| 1.2 | Valid YAML frontmatter | ✓ PASS | Parsed cleanly |
| 1.3 | `name` field present | ✓ PASS | `youtube-video-digest` |
| 1.4 | `description` field present | ✓ PASS | |
| 1.5 | `author` field present | ✓ PASS | `Robin Westerlund` |
| 1.6 | `version` field present | ✓ PASS | `1.0.0` |
| 1.7 | `name` is lowercase-kebab-case | ✓ PASS | regex: `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` matches |
| 1.8 | `description` ≥ 50 characters | ✓ PASS | 566 chars / 88 words |
| 1.9 | SKILL.md body < 500 lines | ✓ PASS | 261 lines |
| 1.10 | Every referenced file exists | ✓ PASS | All 5 refs in SKILL.md verified |
| 1.11 | No hardcoded absolute paths | ✓ PASS | grep clean |
| 1.12 | No API keys or secrets | ✓ PASS | grep clean |
| 1.13 | Directory matches declared shape | ✓ PASS | Production shape complete |
| 1.14 | metadata.json is valid JSON | ✓ PASS | 11 keys |
| 1.15 | metadata name matches SKILL.md name | ✓ PASS | "YouTube Video Digest" / `youtube-video-digest` |
| 1.16 | templates/ has .md files | ✓ PASS | 10 template files |
| 1.17 | examples/ has a complete example | ✗ FAIL | Placeholder — see Issues |
| 1.18 | Scripts executable with usage comment | ✓ PASS | Both scripts verified, --help works |
| 1.19 | evals.json (if evals/ exists) | — N/A | No evals/ directory |

**MUST: 13/13 ✓**

---

## Category 2: Content Quality — 11/14 SHOULD PASS (78.6%)

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 2.1 | First section delivers standalone value | ✓ PASS | RECEIVE: URL form table is immediately actionable |
| 2.2 | Tables used for 3+ parallel items | ✓ PASS | URL forms, extraction path, mode routing, chunking thresholds — all tables |
| 2.3 | Anti-pattern per major process section | ✓ PASS | Steps 1–5 all have explicit anti-patterns |
| 2.4 | Decision tables at branch points | ✓ PASS | If/Then tables for: extraction path, fallback, mode routing, segmentation |
| 2.5 | Imperative form throughout | ✓ PASS | "Accept", "Strip", "Run", "Determine", "Print" |
| 2.6 | Examples for ambiguous rules | ✓ PASS | API version code block, URL normalization table |
| 2.7 | No "be smart" vague directives | ✓ PASS | All rules are testable |
| 2.8 | Key insight first in each section | ✓ PASS | Each step opens with its action, not context |
| 2.9 | Verification steps testable | ✓ PASS | Checkbox list with concrete pass/fail criteria |
| 2.10 | Code examples syntactically valid | ✓ PASS | Python snippets verified |
| 2.11 | Templates have Fixed/Variable annotations | ✓ PASS | All 10 templates have both `[FIXED]` and `[VARIABLE]` |
| 2.12 | Worked examples are real, not stubs | ✗ FAIL | example-digest.md is fabricated — see Issues |
| 2.13 | No orphan references | ✗ FAIL | Two-tier template system (*.md vs *-output.md) undocumented |
| 2.14 | Consistent terminology | ✗ FAIL | Mode name mismatches — see Issues |

**SHOULD: 11/14 = 78.6% — 1.4 percentage points below 80% threshold**

---

## Category 3: Progressive Disclosure — 9/9 SHOULD PASS (100%)

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 3.1 | Description 50–150 words | ✓ PASS | 88 words |
| 3.2 | SKILL.md self-contained for core workflow | ✓ PASS | Full 5-step process inline; references are depth-only |
| 3.3 | References for depth, not required | ✓ PASS | Removing references/ does not break SKILL.md workflow |
| 3.4 | Every reference file has "When to read this:" | ✓ PASS | All 3 references verified |
| 3.5 | Templates usable standalone | ✓ PASS | FIXED/VARIABLE annotations make them self-explaining |
| 3.6 | README readable without SKILL.md | ✓ PASS | All 9 sections cover install, trigger, outcome |
| 3.7 | Reference index in SKILL.md if 4+ refs | — N/A | 3 reference files; condition does not apply |
| 3.8 | Sections ordered by frequency of use | ✓ PASS | Core path (RECEIVE→EXTRACT→CLASSIFY→STRUCTURE→DELIVER), verification last |
| 3.9 | Long sections have sub-headings | ✓ PASS | Step 4 STRUCTURE has 5 sub-sections |
| 3.10 | No duplication between SKILL.md and references | ✓ PASS | Clean separation: SKILL.md rules, references/ implementation detail |

**SHOULD: 9/9 = 100% ✓**

---

## Category 4: Compatibility — 9/9 MUST+SHOULD PASS (100%)

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 4.1 | name is unique in corpus | ✓ PASS | No collision found |
| 4.2 | description has trigger phrases | ✓ PASS | "Use when", "Trigger on", "Also use when" all present |
| 4.3 | Triggers are specific | ✓ PASS | Concrete user actions, not "when needed" |
| 4.4 | No hardcoded tool paths | ✓ PASS | |
| 4.5 | No project-specific paths | ✓ PASS | All paths are relative |
| 4.6 | Dependencies in metadata.json | ✓ PASS | `yt-dlp` required, `youtube-transcript-api` + `openai-whisper` optional |
| 4.7 | Compatible with skill-engine | ✓ PASS | Clear inputs, outputs, verification checklist |
| 4.8 | Graceful failure when service unavailable | ✓ PASS | No-transcript fallback table in EXTRACT |
| 4.9 | Sub-agent permission level | — N/A | No sub-agents spawned |
| 4.10 | Loadable by resolver | ✓ PASS | 5 trigger phrases + domain signal (youtube.com URL) |
| 4.11 | Version follows SemVer | ✓ PASS | `1.0.0` |
| 4.12 | Output paths documented | ✓ PASS | DELIVER: stdout or --output PATH |

**MUST: 3/3 ✓ | SHOULD: 6/6 = 100% ✓**

---

## Category 5: Marketplace Readiness — 5/6 SHOULD + 2 CHECK FAIL

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 5.1 | README.md exists | ✓ PASS | |
| 5.2 | README has all 9 required sections | ✓ PASS | All 9 sections verified |
| 5.3 | metadata.json exists | ✓ PASS | |
| 5.4 | metadata.json has all required fields | ✓ PASS | All 11 fields present |
| 5.5 | Tags lowercase, kebab-case | ✓ PASS | All lowercase, no spaces |
| 5.6 | Tags include domain + function tag | ✓ PASS | domain: youtube, video; function: digest, summarize, transcript |
| 5.7 | Category is recognized | ✓ PASS | `"skills"` |
| 5.8 | examples/ has a worked example | ✗ FAIL | Placeholder, not real output — see Issues |
| 5.9 | README Files table matches actual directory | ✗ FAIL | Missing 6 files — see Issues |
| 5.10 | Display name is human-readable | ✓ PASS | "YouTube Video Digest" |
| 5.11 | Prerequisites listed in README | ✓ PASS | Python, yt-dlp, requests listed |
| 5.12 | Troubleshooting ≥ 2 entries | ✓ PASS | 5 entries |
| 5.13 | Installation commands copy-pasteable | ✓ PASS | pip commands complete |

**SHOULD: 5/6 = 83.3% ✓ | CHECK: 2 fail**

---

## Script Execution Verification

| Script | Executes | Usage comment | --help | API correct |
|--------|----------|---------------|--------|-------------|
| `scripts/extract-metadata.py` | ✓ | ✓ (lines 1–8) | ✓ | ✓ yt-dlp 1.x |
| `scripts/extract-transcript.py` | ✓ | ✓ (lines 1–7) | ✓ | ✓ transcript-api 1.x |
| `scripts/extract_transcript.py` | ✓ | ✓ | ✓ | ✗ OLDER API — stale |

Both active scripts tested live against `https://www.youtube.com/watch?v=x7X9w_GIm1s` (see `youtube-skill-test-report.md`). Both PASS.

---

## Template Verification

All 10 templates have `[FIXED]` and `[VARIABLE]` annotations. ✓

| Template | Mode in file | SKILL.md mode | Match |
|----------|-------------|---------------|-------|
| `summary.md` | `summary` | `summary` | ✓ |
| `summary-output.md` | `summary` | `summary` | ✓ |
| `key-points.md` | `key-points` | `key-points` | ✓ |
| `key-points-output.md` | `key-points` | `key-points` | ✓ |
| `full-transcript.md` | `full-transcript` | `transcript` | ✗ name mismatch |
| `full-transcript-output.md` | `full-transcript` | `transcript` | ✗ name mismatch |
| `qa-extraction.md` | `qa-extraction` | `qa` | ✗ name mismatch |
| `qa-output.md` | `qa-extraction` | `qa` | ✗ name mismatch |
| `study-notes.md` | `study-notes` | `digest` | ✗ different mode entirely |
| `metadata-header.md` | (shared) | all modes | ✓ |

**`digest` mode template: MISSING.** `study-notes.md` is a distinct mode (learning notes with definitions, open questions) — not a digest (summary + takeaways + per-chapter bullets).

---

## Issues Found

### Issue 1 — MEDIUM | Missing `digest` template

**What:** SKILL.md defines `digest` as the default mode. No template file corresponds to it. `study-notes.md` has `Mode: study-notes` hard-coded in a FIXED zone; it is a structurally different output (adds Key Terms table, Open Questions) not a digest.

**Impact:** An agent following SKILL.md Step 4 for the default mode has no template to apply.

**Fix:** Create `templates/digest.md` and `templates/digest-output.md` following the per-mode structure rules already written in SKILL.md (summary block + global takeaways + per-chapter bullets). OR rename `study-notes` to `digest` if the intent was always to use study-notes as digest — but the content differs, so this is not equivalent.

---

### Issue 2 — LOW | Mode name mismatches in templates

**What:** Three template file names use different mode names than SKILL.md:

| SKILL.md mode | Template file | Template's hardcoded mode |
|---------------|---------------|--------------------------|
| `transcript` | `full-transcript.md` | `full-transcript` |
| `qa` | `qa-extraction.md` | `qa-extraction` |

**Impact:** An agent told to apply the `transcript` template will not find a file named `transcript.md`. Minor — the README files table maps mode to file — but creates friction.

**Fix (Option A):** Update SKILL.md Step 4 mode routing table to use the template file names as the canonical mode names (`full-transcript`, `qa-extraction`).

**Fix (Option B):** Rename template files to match SKILL.md modes (`transcript.md`, `qa.md`).

Recommend Option A — template files were created first and their names are more descriptive.

---

### Issue 3 — MEDIUM | `example-digest.md` is a fabricated placeholder

**What:** The example claims to demonstrate a 48-minute lecture at `https://www.youtube.com/watch?v=uTMLqIoMDoE` ("CS Lectures Archive"). Evidence it is fabricated:
- Script invocation uses flags that do not exist: `scripts/extract_transcript.py --mode summary --output`
- Stderr output format (`[youtube-video-digest]` prefix) is not produced by either real script
- The video ID `uTMLqIoMDoE` resolves to a different video than described (or is unavailable)
- Script name uses the stale underscore version

**Impact:** Fails quality gate 1.17 and 2.12. Users following the example will get errors.

**Fix:** Replace with the real test output already captured in `docs/forge-artifacts/youtube-skill-test-output.md`. The "Python in 100 Seconds" run is a genuine, reproducible worked example. Update invocation to use the real two-script interface.

---

### Issue 4 — LOW | Stale `scripts/extract_transcript.py` (underscore)

**What:** An older version of the transcript script exists alongside the active `extract-transcript.py` (hyphen). The older version has a different interface (`--meta-only`, `--fetch-captions` flags instead of separate scripts). The README "Notes for Other Clients" section still references the old name.

**Impact:** Confusion about which script to use. README points new users to the wrong file.

**Fix:** Delete `scripts/extract_transcript.py`. Update the README "Notes for Other Clients" paragraph to reference `extract-metadata.py` and `extract-transcript.py`.

---

### Issue 5 — LOW | README Files table incomplete

**What:** The following files exist in the package but are absent from the README Files table:

| Missing from table | Actual location |
|-------------------|-----------------|
| `examples/example-digest.md` | `examples/` |
| `templates/full-transcript-output.md` | `templates/` |
| `templates/key-points-output.md` | `templates/` |
| `templates/summary-output.md` | `templates/` |
| `templates/qa-output.md` | `templates/` |

**Impact:** Fails quality gate 5.9. Users cannot discover the output templates.

**Fix:** Add the missing rows to the README Files table. Consider grouping templates by type (instruction vs output).

---

### Issue 6 — LOW | Two-tier template system undocumented

**What:** Templates exist in two variants — `*.md` (authoring instructions for Claude) and `*-output.md` (the actual output structure). This is a useful design but is never explained in SKILL.md, README, or any reference file.

**Impact:** Fails quality gate 2.13. An agent or user reading SKILL.md does not know which template to apply for output and which to use as authoring guidance.

**Fix:** Add one sentence to SKILL.md Step 4 or to `README.md`: "Each mode has two template files: `[mode].md` (authoring guidance — what Claude reads) and `[mode]-output.md` (the output structure — what Claude fills in)."

---

## Final Score

| Category | MUST | SHOULD | CHECK |
|----------|------|--------|-------|
| 1. Structural Integrity | **13/13** ✓ | — | 1 fail (1.17) |
| 2. Content Quality | — | **11/14** = 78.6% | — |
| 3. Progressive Disclosure | — | **9/9** = 100% ✓ | 0 applicable |
| 4. Compatibility | **3/3** ✓ | **6/6** = 100% ✓ | all pass |
| 5. Marketplace Readiness | — | **5/6** = 83.3% ✓ | 2 fail (5.8, 5.9) |
| **Total** | **16/16** ✓ | **31/35** = 88.6% ✓ | 3 fail |

**Gate thresholds:**
- MUST: 16/16 required → **16/16 ✓**
- SHOULD: ≥ 80% required → **88.6% ✓** (Category 2 alone is 78.6% — borderline)
- CHECK: evaluate all applicable → **3 failures documented above**

**Verdict: CONDITIONAL PASS**

The skill ships as functional. The extraction pipeline works end-to-end (verified live). All structural requirements are met. The main quality gap is the missing `digest` template — the default mode has no template file. This should be fixed before the skill is promoted to `explicit-skills.md`.

**Priority fix list:**
1. Create `templates/digest.md` + `templates/digest-output.md` (Issue 1 — blocks default mode)
2. Replace `example-digest.md` with real output (Issue 3 — user-facing quality)
3. Delete `scripts/extract_transcript.py` (Issue 4 — stale file)
4. Update README files table (Issue 5 — 5 missing rows)
5. Document two-tier template system (Issue 6 — 1 sentence in SKILL.md)
6. Align mode names (Issue 2 — low friction, choose one convention and apply)
