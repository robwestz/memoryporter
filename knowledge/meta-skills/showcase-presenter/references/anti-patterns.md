# Anti-Patterns

> **When to read this:** When output feels thin, untrustworthy, or like it was generated
> in a hurry. These are the specific failure modes that destroy showcase credibility.

---

## The Ten Credibility Killers

Each is drawn from a real failure mode identified in research or practice.
Each has a concrete fix.

---

### 1. Invented Metrics

**What it looks like:**
> "The system processed approximately 50 files with a success rate of around 90%."

**Why it fails:**
"Approximately" and "around" signal that the author is guessing. Sophisticated
readers spot invented numbers immediately — the precision is always suspiciously round.

**Fix:**
Extract the actual number from the artifact. If the log says "47 of 51 commands
succeeded," write exactly that. If no number exists, write `[NO DATA]`.

```
WRONG: "approximately 50 files"
RIGHT: "47 files created — source: docs/morning-report-2026-04-13.md"
RIGHT: "[NO DATA] — file count not logged in this session's reports"
```

---

### 2. Hidden Broken Items

**What it looks like:**
A showcase that lists only the working capabilities, silently omitting the ones
with missing files, dead references, or unresolved errors.

**Why it fails:**
Users trust the showcase to be a complete picture. When they discover a broken
item later, they question every other item in the showcase.

**Fix:**
Include every item in the inventory with its badge. `[BROKEN]` items appear last,
with their badge visible. The audit checklist shows them explicitly.

```
WRONG: Omit seo-article-audit from inventory because its templates/ dir is missing
RIGHT: | seo-article-audit | Audits SEO quality of articles | [BROKEN] | — |
       ...then in audit: A6 ✗ — templates/ directory not found at declared path
```

---

### 3. Vague Executive Summary

**What it looks like:**
> "Good progress was made this session. The team worked on various improvements
> and the system is now more capable."

**Why it fails:**
This sentence contains zero information. A reader could substitute any project
name and it would be equally (non-)informative.

**Fix:**
Three sentences. Name the specific thing built. Name the specific metric. Name
the specific next action.

```
WRONG: "Good progress was made. The system is more capable."
RIGHT: "The showcase-presenter skill was forged to Full shape with 5 templates,
        4 reference files, README, and metadata.json. All structural quality gate
        checks pass; invocation is [UNTESTED]. Next: run skill-creator eval loop
        against real report artifacts to verify Mode 1 output."
```

---

### 4. Placeholder Examples

**What it looks like:**
```
Input: [insert your project path here]
Output: [your showcase will appear here]
```

**Why it fails:**
Placeholder examples prove nothing. The reader cannot evaluate whether the system
works without seeing it work.

**Fix:**
Use real artifacts. If the capability has been run, use its actual output.
If not, construct a representative example that is honest about being illustrative,
and mark it `<!-- ILLUSTRATIVE -->`.

```
WRONG: Input: [your project]  Output: [showcase output]
RIGHT: Input: knowledge/meta-skills/skill-forge/ (5 files, 47KB total)
       Output: skill-forge-showcase.md (112 lines, SHOWCASE-READY verdict)
       Time: 23s
       <!-- ILLUSTRATIVE: constructed from SKILL.md content, not a recorded run -->
```

---

### 5. Skipping the Documentation Audit

**What it looks like:**
A showcase that describes capabilities without checking whether they actually exist
and function as documented.

**Why it fails:**
Without the audit, the showcase is aspirational, not factual. It describes what
was intended, not what was built.

**Fix:**
Run checks A1–A6 for every item. Apply badges. Show the audit table at the end.
The audit IS part of the showcase, not a post-processing step.

---

### 6. Architecture Diagram as the Opening

**What it looks like:**
```
# My Project

[Large Mermaid diagram showing 12 components and their relationships]

The diagram above shows the system architecture...
```

**Why it fails:**
Nobody cares about boxes until they understand the problem. An opening diagram
signals that the author prioritizes their technical solution over the reader's
comprehension.

**Fix:**
Problem first. One sentence: what specific pain does this solve for whom.
Then the diagram, after the reader understands what they're looking at.

---

### 7. "Handles This Gracefully" Edge Cases

**What it looks like:**
> **Edge case:** What if the input file is missing?
> The system handles this gracefully and shows an appropriate error.

**Why it fails:**
"Handles gracefully" tells the reader nothing. What does the error say? Does it
include the path that was searched? Does it exit with a non-zero code?

**Fix:**
Show the actual output. Copy the real terminal output or document the expected
behavior with enough specificity to be testable.

```
WRONG: "The system handles this gracefully."
RIGHT: "ERROR: SKILL.md not found at knowledge/meta-skills/my-skill/SKILL.md.
        Searched: SKILL.md, README.md. Cannot build wiki without root skill file.
        Exit code: 1"
```

---

### 8. Future Tense for Shipped Features

**What it looks like:**
> "The bundler will handle namespace collisions by prefixing imports."

**Why it fails:**
If this is a showcase of what was built, past or present tense applies. Future
tense implies the feature doesn't exist yet. Using it for shipped features signals
the doc was never updated after implementation.

**Fix:**
Present tense for what exists now. Past tense for what happened.

```
WRONG: "The bundler will handle namespace collisions."
RIGHT: "The bundler handles namespace collisions by prefixing imports with the skill name."
```

---

### 9. Y-Statement Skipped for Decisions

**What it looks like:**
> "We chose YAML for the wave state format."

**Why it fails:**
"We chose X" tells you nothing about why X was chosen over alternatives, what
tradeoff was accepted, or whether the decision is transferable to similar situations.

**Fix:**
Y-Statement format is mandatory for decisions in showcases.

```
WRONG: "We chose YAML."
RIGHT: In the context of multi-agent orchestration with shared state,
       facing the need for human readability and machine parsability,
       we decided on YAML over JSON or TOML,
       to achieve human-editable wave files that support inline comments,
       accepting that YAML's indentation sensitivity creates parse errors
       on malformed input.
```

---

### 10. Verdict Softening

**What it looks like:**
A `DRAFT-ONLY` document relabeled as "early-stage showcase" or "initial draft showcase."
A `DEMO-WITH-CAVEATS` verdict buried in a footnote while the header says "DEMO-READY."

**Why it fails:**
The verdict exists to communicate the document's reliability to downstream consumers.
Softening it causes consumers to over-trust the document.

**Fix:**
Display the verdict exactly as computed. If the verdict is `DRAFT-ONLY`, the document
header says `DRAFT-ONLY`. No euphemisms.

---

## Mode-Specific Anti-Patterns

### Mode 1 (Report) Only

| Anti-pattern | Fix |
|-------------|-----|
| Summarizing tone ("progress was made") | Extract facts: what was built, which commands ran, what failed |
| Decisions section omitted when no ADRs found | Write the explicit "no decisions found" message — do not silently skip |
| Gap register with "no gaps" when items were incomplete | Re-read the artifacts — incomplete items are almost always present |
| Timeline with only successes | Failures belong in the timeline; they are the most instructive entries |

### Mode 2 (Demo) Only

| Anti-pattern | Fix |
|-------------|-----|
| Capability cards for `[BROKEN]` items | Broken items appear in inventory only — no card |
| `[UNTESTED]` items presented as `[READY]` | Only mark READY after verifying invocation in this session |
| Fabricated capability chains | Only show chains that follow from documented interfaces |
| "Try it" prompt that doesn't work | Test the prompt before including it — or mark `[NOT VERIFIED]` |
