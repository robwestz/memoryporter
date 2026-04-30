# Worked Example: youtube-video-digest in summary mode

> This example shows the full pipeline applied to a 48-minute technical lecture.
> It demonstrates: chapter detection from description, auto-caption notice, and summary-mode output.

---

## Inputs

```
URL:    https://www.youtube.com/watch?v=uTMLqIoMDoE
Mode:   summary
Lang:   en
```

**Video details:**
- Title: "Designing Data-Intensive Applications — Chapter 1 Overview"
- Channel: CS Lectures Archive
- Duration: 48:12
- Captions: Auto-generated (no manual captions available)
- Chapters: Detected from description (not native YouTube chapters)

**Description excerpt that produced chapters:**
```
0:00 Introduction and book overview
3:45 What makes an application data-intensive?
9:20 Reliability — tolerating faults
18:30 Scalability — measuring load and performance
31:00 Maintainability — operability, simplicity, evolvability
42:10 Summary and key takeaways
46:00 Q&A
```

---

## Script invocation

```bash
python scripts/extract_transcript.py \
  "https://www.youtube.com/watch?v=uTMLqIoMDoE" \
  --mode summary \
  --lang en \
  --output ./lecture-digest.md
```

**stderr output:**
```
[youtube-video-digest] video_id=uTMLqIoMDoE
[youtube-video-digest] Fetching metadata...
[youtube-video-digest] Fetching captions (lang=en)...
[youtube-video-digest] Caption source: auto-generated
[youtube-video-digest] Found 7 chapters in description.
[youtube-video-digest] Segmented into 7 chapters.
[youtube-video-digest] Output written to ./lecture-digest.md
```

---

## Output document (lecture-digest.md)

```markdown
# Designing Data-Intensive Applications — Chapter 1 Overview

## Metadata

- **Channel:** CS Lectures Archive
- **Published:** 2024-03-15
- **Duration:** 0:48:12
- **URL:** https://www.youtube.com/watch?v=uTMLqIoMDoE
- **Transcript source:** auto-generated
- **Mode:** summary

> [NOTICE] Auto-generated captions detected — technical terms, names, and
> acronyms may be inaccurate. Verify critical information independently.

---

<!-- Claude: apply the Summary template from templates/summary-output.md -->
<!-- Structured transcript follows — process in summary mode -->

## [Chapter] Introduction and book overview [0:00:00]

[0:00:03] Welcome everyone. Today we're going through chapter one of
Designing Data Intensive Applications by Martin Kleppmann...
[0:00:18] This is probably the most important chapter for understanding
the rest of the book because it establishes the vocabulary...
[... transcript entries ...]

## [Chapter] What makes an application data-intensive? [0:03:45]

[0:03:47] So the term data-intensive gets thrown around a lot...
[0:04:12] The author distinguishes between compute-intensive, where
the CPU is the bottleneck, and data-intensive...
[... transcript entries ...]

[... remaining chapters ...]
```

---

## Claude's processing (summary mode applied)

After loading `lecture-digest.md`, Claude applies `templates/summary-output.md`:

---

# Designing Data-Intensive Applications — Chapter 1 Overview

## Metadata

- **Channel:** CS Lectures Archive
- **Published:** 2024-03-15
- **Duration:** 0:48:12
- **URL:** https://www.youtube.com/watch?v=uTMLqIoMDoE
- **Transcript source:** auto-generated
- **Mode:** summary

> [NOTICE] Auto-generated captions detected — technical terms, names, and acronyms may be inaccurate. Verify critical information independently.

---

## Overall Summary

Chapter 1 of *Designing Data-Intensive Applications* establishes three foundational properties that all data systems should exhibit: reliability, scalability, and maintainability. The lecturer walks through each property with practical definitions and real-world examples, drawing heavily from Kleppmann's framing. The central argument is that modern applications are more constrained by data volume, complexity, and change rate than by raw compute power, and that understanding these three properties is prerequisite to making good architectural decisions. The chapter closes by emphasizing that trade-offs are unavoidable, and that recognizing which property you are optimizing for — and which you are sacrificing — is the core skill of a systems engineer.

---

## [Chapter] Introduction and book overview [0:00:00]

The lecturer introduces Martin Kleppmann's book as the definitive modern reference for systems design at scale, noting that Chapter 1 is intentionally conceptual rather than prescriptive. He previews the three core properties (reliability, scalability, maintainability) and explains why the book opens with vocabulary rather than solutions — because the field's biggest failures come from engineers optimizing the wrong thing.

## [Chapter] What makes an application data-intensive? [0:03:45]

The lecturer draws a distinction between compute-intensive and data-intensive applications: the former is bottlenecked by CPU cycles; the latter by the volume, variety, or velocity of data. Most modern web and backend systems are data-intensive, meaning that raw processing power is rarely the limiting factor — the constraints are in how data is stored, retrieved, transmitted, and transformed.

## [Chapter] Reliability — tolerating faults [0:09:20]

Reliability is defined as the system continuing to work correctly even when things go wrong — with "correctly" meaning it performs the expected function at the required level of performance. The lecturer distinguishes between faults (a component deviating from spec) and failures (the system as a whole stops providing service), and emphasizes that the goal is fault-tolerant design, not fault-free design, since faults in complex systems are inevitable. Hardware faults, software bugs, and human errors are covered as the three main fault categories.

## [Chapter] Scalability — measuring load and performance [0:18:30]

Scalability is framed not as a binary property but as the question "if the system grows in a particular way, what are our options for coping with that growth?" The lecturer introduces load parameters (e.g., requests per second, ratio of reads to writes, active users) as the right way to describe current system load, then covers percentile-based performance metrics — particularly the p95 and p99 tail latencies — as more meaningful than averages for user-facing systems. The Twitter timeline example from the book is used to illustrate how a choice of load parameter changes the architectural trade-offs entirely.

## [Chapter] Maintainability — operability, simplicity, evolvability [0:31:00]

Maintainability is the most underappreciated of the three properties, according to the lecturer, because its costs are diffuse and long-term. He breaks it into three sub-properties: operability (making it easy for operations teams to keep the system running), simplicity (reducing accidental complexity), and evolvability (making future change easy). The key insight is that most software cost is in ongoing maintenance, not initial development, and that design choices that feel fast in the short term — tight coupling, implicit state, magic behavior — create disproportionate long-term cost.

## [Chapter] Summary and key takeaways [0:42:10]

The lecturer recaps the three properties and their definitions, then poses a meta-point: real systems require choosing which property to prioritize, and those choices are often in tension. He recommends reading the chapter again after finishing the book to see how the vocabulary introduced here threads through every subsequent design decision. The remaining chapters each address specific technologies (databases, encoding, replication, etc.) through this three-property lens.

## [Chapter] Q&A [0:46:00]

A student asks whether maintainability and reliability overlap — the lecturer clarifies that they are separate: reliability is about the system's behavior under fault conditions; maintainability is about the human cost of keeping it correct over time. A second question about whether "evolvability" is just "agility" by another name prompts the lecturer to note that evolvability is specifically about data systems, where schema changes and backward compatibility are first-class concerns that typical agile frameworks do not address.

---

## What this example demonstrates

| Decision point | What happened | Rule validated |
|---------------|---------------|---------------|
| Caption source | Auto-generated (no manual track) | `[NOTICE]` block was emitted |
| Chapter detection | Found in description (not native chapters) | Description parsing worked; chapters labeled `[Chapter]` not `[Auto-segmented]` |
| Mode selection | Summary — Claude synthesized, did not copy | 1-3 sentences per segment; factual, no editorializing |
| Overall summary | Written first, then per-segment | Template order followed |
| Token count | ~12,000 tokens for full transcript | Well within single-pass limit |

**Anti-pattern avoided:** The `[NOTICE]` block is present and specific. A user who needs to cite the transcript precisely knows to verify technical terms. Without the notice, they would not know the transcript quality was degraded.
