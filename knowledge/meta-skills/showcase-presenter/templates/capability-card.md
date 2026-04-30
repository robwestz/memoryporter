<!-- [FIXED] Capability card — one per READY or UNTESTED capability in demo-showcase -->
<!-- Do NOT create a card for BROKEN capabilities -->

### <!-- [VARIABLE: Capability Name] --> `<!-- [VARIABLE: [READY] | [UNTESTED] | [INCOMPLETE] ] -->`

<!-- [FIXED] One-sentence description — active voice, present tense, specific outcome, no hedging -->
<!-- [VARIABLE: What it does in one sentence. "Packages a codebase knowledge base into a single-file HTML wiki with full-text search." NOT "A tool that can be used to create documentation."] -->

---

<!-- [FIXED] Invocation block — must be copy-pasteable and work as written -->
**How to invoke:**

```
<!-- [VARIABLE: exact prompt or command — e.g. 'Build the project wiki for [project]'
     or 'bash build.sh --mode wiki --project [path]'
     Must work as written. No placeholders that require secret knowledge to fill.] -->
```

---

<!-- [FIXED] Example input → output block -->
**Example:**

**Input:** <!-- [VARIABLE: real input description, e.g. "knowledge/meta-skills/skill-forge/SKILL.md (47KB, 5 files)"] -->

<!-- [FIXED] Mark ILLUSTRATIVE if this is not actual recorded output from a real run -->
<!-- Delete the comment below if the example IS real output -->
<!-- ILLUSTRATIVE: replace with real output once capability has been executed -->

```<!-- [VARIABLE: language tag, e.g. bash, json, markdown, text] -->
<!-- [VARIABLE: Real example output.
     For CLI: show the actual terminal output including timing.
     For document generation: show the first meaningful lines of the output.
     For API: show the actual response structure.
     Rule: if you have to say "imagine this does X", do not write it — leave ILLUSTRATIVE tag.] -->
```

**Output:** <!-- [VARIABLE: output artifact description, e.g. "skill-forge-v1.0.0.html (127KB, self-contained)"] -->
**Time:** <!-- [VARIABLE: measured execution time, e.g. "8.2s" — or "[NOT MEASURED]"] -->

---

<!-- [FIXED] Edge case — shows one failure mode and how it is handled -->
**Edge case:** <!-- [VARIABLE: Describe a specific failure scenario, e.g. "SKILL.md is missing from the path"] -->

```
<!-- [VARIABLE: Show the ACTUAL system output on this failure — not "it handles this gracefully".
     Example: "ERROR: SKILL.md not found at knowledge/meta-skills/my-skill/SKILL.md.
     Searched: SKILL.md, README.md. Stopping — cannot build wiki without root skill file."
     If not tested: write "[UNTESTED EDGE CASE: expected behavior: ...]" ] -->
```

---

<!-- [FIXED] Try it prompt — must be copy-pasteable and usable immediately -->
> **Try it:** <!-- [VARIABLE: Exact prompt the reader can paste to invoke this capability.
>   Example: "Build a demo showcase for the skill-forge and seo-article-audit skills.
>   Include capability cards with real invoke examples."] -->

---
