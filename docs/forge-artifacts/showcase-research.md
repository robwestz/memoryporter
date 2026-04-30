# Showcase Presentation Research
## For AI-Generated Markdown Showcases (portable-kit / Buildr)

*Compiled 2026-04-13. All findings oriented toward auto-generated, markdown-authored presentations.*

---

## 1. Markdown Presentation Tools

### Comparison Table

| Tool | Runtime | Markdown Flavor | Live Code | Export | Hosting | Learning Curve | Best For |
|------|---------|-----------------|-----------|--------|---------|----------------|----------|
| **Slidev** | Vue 3 / Vite | Extended MD + Vue components | Monaco editor (live run) | PDF, PNG, SPA | Any static host, Netlify | Medium-High | Developer talks, interactive demos |
| **Marp** | Node / Marpit | CommonMark + directives | No | HTML, PDF, PPTX, PNG | Any static host, VS Code preview | Low | Clean decks, CI-friendly generation |
| **reveal.js** | Vanilla JS | Markdown plugin (marked.js) | No (plugins) | PDF via print | Any static host | Medium | Maximum customization, plugins |
| **Remark.js** | Browser JS | CommonMark + extensions | No | PDF via Chrome | GitHub Pages (single HTML file) | Low | Zero-build, single-file hosting |
| **Quarto (revealjs)** | Pandoc + reveal.js | Pandoc MD | R/Python execution | PDF, HTML | GitHub Pages, Quarto Pub | Medium | Data science, reproducible docs |
| **MDX slides** | React / Next.js | MDX (MD + JSX) | Yes (React) | Build output | Vercel, Netlify | High | Full React control |

---

### Slidev

**What it is:** Vue-powered presentation framework. Write `.md`, get a hot-reloading SPA with presenter mode.

**Strengths:**
- Monaco editor embeds: `{monaco}` after a code fence turns it into a live editor; `{monaco-run}` adds a run button
- `magic-move` syntax morphs code between steps (4-backtick blocks)
- Built-in presenter mode, recording, drawing tools
- Themes distributed as npm packages — one-line theme switching
- UnoCSS for inline utility classes on slides
- Export to SPA means the entire presentation is a self-contained deployable site

**Key syntax:**
```md
---
theme: seriph
layout: cover
---

# Slide Title

---
layout: two-cols
---

::left::
Left column content

::right::
Right column content

---

```ts {monaco}
const x = 42
```

---
```

**Weaknesses:**
- Requires Node.js + npm; not suitable for pure static generation from a CI script without build step
- 8ms/slide render vs Marp's 2.8ms — noticeable at 200+ slides
- Vue component knowledge needed for advanced layouts
- Non-standard markdown: `::: left`, `<v-click>`, frontmatter layouts — not portable

**Verdict for auto-generation:** Viable but heavyweight. The npm-based theme system and build step add friction for fully automated generation. Good if the generator controls a Node environment.

---

### Marp

**What it is:** Markdown-to-slides converter. Write CommonMark, get HTML/PDF/PPTX. VS Code extension for live preview.

**Strengths:**
- Flattest learning curve of all options — 95% is standard CommonMark
- First-class CI integration: `marp input.md -o output.html` is a single command
- VS Code extension with IntelliSense for directives
- 3 built-in themes (`default`, `gaia`, `uncover`), custom themes via plain CSS
- Output HTML is fully self-contained — no runtime dependency

**Key syntax:**
```md
---
marp: true
theme: gaia
paginate: true
backgroundColor: #1a1a2e
---

# Title Slide
## Subtitle

---

<!-- _class: lead -->

# Section Header

---

![bg left:40%](image.png)

## Content slide

- Point one
- Point two
```

**Weaknesses:**
- No live code execution — it is a static converter
- Limited layout primitives (bg left/right split is the main one)
- CSS-only theming requires design skills for custom looks
- No interactive elements

**Verdict for auto-generation:** Best fit for automated pipelines. Single-command generation, no runtime, fully portable HTML output. The right choice if the showcase is "publish once, share link."

---

### reveal.js

**What it is:** The original HTML presentation framework. Slides are HTML or markdown sections in a single HTML file.

**Strengths:**
- Largest plugin ecosystem (math, code highlighting, multiplex, remote control)
- Multiplex plugin: presenter navigates, audience follows on their own device in real time
- Nested slides (vertical sub-sections) for structured content hierarchies
- Speaker notes with timer in separate browser window
- Auto-animate between slides

**Markdown mode:**
```html
<section data-markdown>
  <textarea data-template>
    ## Slide Title
    - Item 1
    - Item 2

    Note:
    Speaker note here (not shown to audience)
  </textarea>
</section>
```

Or with `reveal-md` (wrapper tool): pure `.md` files, served with `reveal-md slides.md`.

**Weaknesses:**
- Pure reveal.js requires HTML wrapping — markdown is a plugin, not native
- `reveal-md` adds a layer but is less actively maintained
- Styling requires CSS knowledge + understanding of reveal's class hierarchy
- No live code execution built in

**Verdict for auto-generation:** Good if reveal-md is used. The HTML output is widely understood and themeable. Plugin ecosystem valuable for specific features (multiplex for live audience sync). More setup than Marp.

---

### Remark.js

**What it is:** Single-file, browser-rendered markdown slideshow. One HTML file loads a `.md` from same host.

**Strengths:**
- Zero build step: drop an HTML file + a markdown file on any server (including GitHub Pages)
- Presenter mode built in (press `p`)
- Layout templates (one slide can be a template for others)
- Works with Jekyll/GitHub Pages natively

**Key syntax:**
```md
class: center, middle

# Title

---

# Slide 2

.left-column[
Left content
]

.right-column[
Right content
]

???

Speaker notes here
```

**Weaknesses:**
- No npm ecosystem — themes are manual CSS
- CSS-only styling, no component model
- Slide separation must avoid `---` in code blocks (escaping needed)
- Export is only via browser print-to-PDF
- Project is in maintenance mode (low recent activity)

**Verdict for auto-generation:** Excellent for the simplest case — generate a `.md` file, point an HTML wrapper at it, done. Limited visual ceiling without CSS investment.

---

### Quarto (revealjs backend)

**What it is:** Pandoc-based scientific publishing system. Presentations are `.qmd` files rendered to reveal.js HTML.

**Strengths:**
- 11 built-in reveal.js themes
- Code execution (R, Python, Julia) built in — output embedded in slides
- Single source → multiple formats (slides, PDF, Word, website)
- Good for data-heavy showcases with charts/tables generated from code

**Key syntax:**
```md
---
format: revealjs
theme: dark
---

## Slide Title

```{python}
import matplotlib.pyplot as plt
plt.plot([1,2,3])
plt.show()
```

## {background-color="#1a1a2e"}

Large text slide
```

**Weaknesses:**
- Requires Quarto CLI + language runtime (R/Python)
- Overkill if no data execution needed
- Academic aesthetic by default

**Verdict for auto-generation:** Best for data/metrics-heavy showcases. If the generator already produces data artifacts, Quarto can embed them. Otherwise, overhead is unjustified.

---

### MDX-based (e.g., mdx-deck, Spectacle)

**What it is:** React-rendered slides from `.mdx` files (markdown + JSX).

**Strengths:**
- Full React component access — anything renderable in React appears in slides
- Interactive components (terminals, live editors, animated diagrams)
- Tight integration with component libraries (shadcn, etc.)

**Weaknesses:**
- Requires React knowledge to author
- Markdown is no longer "just markdown" — JSX syntax embedded
- Highest build complexity of all options
- mdx-deck project is largely dormant; ecosystem fragmented

**Verdict for auto-generation:** Not recommended. The JSX bleed means auto-generation must produce valid JSX, which is a harder contract than plain markdown.

---

## 2. Project Showcase Patterns

### What top open-source projects do well

Analysis of high-starred repos (from `matiassingers/awesome-readme` and similar collections) reveals consistent patterns:

**Above the fold (first screenful):**
- Product name + one-sentence value proposition — not "A framework for X" but "Turn markdown into production agent runtimes in one command"
- A GIF or screenshot that shows the product working — never a static architecture diagram as the first image
- Badge row: build status, version, license, stars — signals active maintenance
- Single primary CTA: Install command in a code block or "Try it" button

**Structure that converts:**
1. Hero (name + tagline + demo GIF)
2. Why this exists (problem, one paragraph)
3. Quick start (fewest steps to working demo — under 5 commands)
4. Feature list (specific, with code examples, not marketing bullets)
5. Architecture / how it works (diagram or brief description)
6. Documentation link / full reference
7. Contributing / license

**What separates high-signal READMEs:**
- Specificity: "Reduces inference latency by 40ms on p50" not "fast"
- Demo evidence: GIF of the actual tool running, not a screenshot of code
- Quick start that actually works: tested, minimal dependencies
- Version numbers: implies stability and ongoing development
- Real usage examples: not `example.com` but actual plausible use cases

**GitHub Pages demo page patterns:**
- Mirror README structure but with more visual breathing room
- Navigation: Docs / API / Changelog / GitHub
- Dark theme with syntax highlighting for code samples
- "View on GitHub" button always visible
- Mobile-responsive (signals professionalism; side projects often aren't)

---

## 3. Demo Day Structure

### YC-Style Narrative Arc

YC coaches every batch on a ~2-minute, ~15-slide arc. The internal logic: each section earns the right to make the next claim.

```
[0:00–0:15] Company name + one-line description
            "We are [X] for [Y]" — the compression test
            If you can't compress it, you don't understand it yet.

[0:15–0:40] Problem
            Specific, felt pain. Not "the market is large."
            Name the exact user. Describe the exact moment of failure.
            One real anecdote > one paragraph of statistics.

[0:40–1:05] Solution
            Show the product working. Not a diagram. The actual product.
            Narrate: "Here's what used to take 4 hours. Watch."
            One demo interaction, end-to-end, outcome visible.

[1:05–1:25] Traction
            Numbers with dates. "Last month: X. This month: Y."
            Retention, revenue, or deployment count — whichever is strongest.
            No projected numbers. Only actuals.

[1:25–1:40] Market
            TAM framing: not "the $400B software market" but
            "There are 4M professional developers who [specific behavior]."
            How you reach them (distribution, not just existence).

[1:40–1:55] Business model
            How money flows. One sentence.

[1:55–2:10] Team
            Why you specifically can win this.
            Domain insight, not credentials.

[2:10–2:15] Ask
            What you need. What you'll do with it.
```

**Structural rules:**
- Problem → Solution is the emotional engine. If the problem doesn't land, nothing after it matters.
- Traction is proof, not promise. Skip it if you have nothing real; don't fake it.
- Demo must show outcome, not steps. Show the before and after, not the click sequence.
- The ask is a signal of clarity: vague ask = vague thinking.

---

## 4. Technical Demo Script Template

Reusable skeleton for a developer-audience product walkthrough.

```markdown
## [PRODUCT NAME] — Technical Demo Script

### Pre-roll context (30 seconds)
State the problem in one sentence.
State who experiences it (role + context).
State what currently exists and why it fails.

Example: "Every agent team eventually hits the same wall: 
the agent works in dev, breaks in prod, and nobody knows why. 
Existing solutions log what happened but not why it decided that."

---

### Setup reveal (45 seconds)
Show the starting state — the empty canvas.
What does the environment look like BEFORE your tool?
Commands run to get to baseline (real terminal, real output).

```bash
$ <install command>
$ <init command>
```

Expected output shown and narrated.

---

### Core demonstration (2–3 minutes)
Walk through ONE representative use case end-to-end.
Structure: input → process → output → so-what.

Beat 1: "Here's the input" — show the real artifact being fed in.
Beat 2: "Here's what's happening" — brief narration during processing.
Beat 3: "Here's the output" — show it, don't just say it exists.
Beat 4: "Here's what this means" — business/engineering implication.

Rule: if you have to say "imagine this does X" you haven't built it yet.

---

### Power feature reveal (60 seconds)
One feature that signals depth.
Not a checkbox feature — something that shows genuine insight.
"This is the part that took us six months to get right."

---

### Failure mode + recovery (30 seconds)
Show what happens when something goes wrong.
How does the system behave? How does the user recover?
Professional products handle failure gracefully. Side projects crash or silently fail.

---

### Integration / composability (30 seconds)
"It works with what you already have."
Show a concrete integration: CLI pipe, API call, config file, IDE plugin.

---

### Closing statement (15 seconds)
Restate the problem solved.
Restate the outcome demonstrated.
Call to action: where to get it, what to do next.
```

**Developer-specific rules:**
- Never say "it's fast" — show latency numbers or a timing command
- Never use `example.com` or placeholder data — use real-looking artifacts
- If there's a CLI, show it in a real terminal, not a screenshot
- Show error handling — developers trust tools that fail gracefully more than tools that claim to never fail
- One deep demo > three shallow feature tours

---

## 5. ADR as Visual Narrative

### The problem with traditional ADRs in presentations

Standard ADR format (Context / Decision / Consequences) is write-optimized, not read-optimized. It answers "what did we decide" but doesn't convey "why this was hard" or "what we learned."

### Nygard format (standard)
```
# ADR-001: Use YAML for wave state

Status: Accepted
Context: We need a human-editable, machine-readable format for wave orchestration state.
Decision: We will use YAML.
Consequences: Humans can edit wave files directly. Tooling must handle YAML parsing.
```

### Y-Statement format (compressed, one slide)
```
In the context of [situation],
facing [concern],
we decided [option],
to achieve [quality],
accepting [downside].
```

Example:
```
In the context of multi-agent orchestration with shared state,
facing the need for human readability and machine parsability,
we decided on YAML over JSON or TOML,
to achieve human-editable wave files with comments,
accepting that YAML's indentation sensitivity creates parse errors on malformed input.
```

### Visual narrative ADR (presentation slide format)

Each architecture decision becomes a 3-part slide sequence:

**Slide 1: The Tension** (title: "The Problem We Had to Solve")
- Left: what we needed
- Right: what existing options gave us
- The gap between them is the tension. Name it explicitly.

**Slide 2: The Options Considered** (title: "What We Evaluated")
- Table: Option | Pro | Con | Dealbreaker?
- One row per real option considered (2–4 options)
- The option you chose is highlighted, not hidden

**Slide 3: The Decision + Evidence** (title: "What We Chose and Why")
- Y-Statement (one compressed sentence)
- One concrete before/after or benchmark
- "We know this was right because X" — specific evidence, not assertion

**Connecting ADRs into a narrative arc:**

Don't present ADRs as a list. Present them as a journey:
1. "Here's the problem space we entered"
2. "Here's the first hard decision — and why it was hard"
3. "That decision created this new constraint"
4. "Which forced this second decision"
5. "The result is the architecture you see today"

This makes the architecture feel inevitable and reasoned, not arbitrary.

---

## 6. Professional vs Side-Project Signals

Concrete checklist of what separates a professional-feeling project from a side project. Applicable to README, demo page, slide deck, and demo script alike.

### Credibility signals (presence = professional)

**Specificity of claims**
- [ ] Metrics are concrete: numbers, dates, units — not "fast", "reliable", "scalable"
- [ ] Use cases name a real role and scenario: "for platform engineers running >10 agents" not "for developers"
- [ ] Examples use plausible real data, not `foo`, `bar`, `example`, `test123`
- [ ] Version numbers appear — implies release discipline and history

**Demo quality**
- [ ] The demo shows the actual product, not a mockup or placeholder
- [ ] The demo shows outcome (before/after), not just steps
- [ ] Failure states are handled gracefully and shown, not hidden
- [ ] Install/run instructions are tested and work as written
- [ ] There is no "in a future version" in the demo

**Visual hierarchy**
- [ ] One clear primary action at all times (CTA, command, next step)
- [ ] Consistent typographic scale (one heading size per level, not ad hoc)
- [ ] Code blocks are syntax-highlighted with the correct language tag
- [ ] Images/GIFs are crisp (not blurry, not low-res screenshots)
- [ ] Dark/light theme is consistent throughout (no mixed screenshots)

**Social proof and external validation**
- [ ] At least one third-party signal: GitHub stars, user quote, integration with known tool
- [ ] Contributor list or user count (even if small — implies real usage)
- [ ] External link to documentation (not "see below" — a real docs site or wiki)
- [ ] Changelog or release history exists (signals ongoing maintenance)

**Professionalism of language**
- [ ] No typos, no "WIP", no "TODO: add description"
- [ ] Active voice, present tense: "Buildr generates X" not "Buildr can be used to generate X"
- [ ] Section headers are informative, not generic: "How the memory system works" not "Architecture"
- [ ] No unnecessary hedging: "might be useful" → "solves"

**Architecture and depth signals**
- [ ] A diagram exists (even a simple ASCII one) — implies someone thought about structure
- [ ] Decisions are explained, not just stated: "We use YAML because it's human-editable"
- [ ] Edge cases are acknowledged: "This does not support X" shows you know the limits
- [ ] The README/docs answer the questions a skeptic would ask

### Side-project anti-signals (presence = amateur)

- "Coming soon" sections in the main README
- Architecture diagram as the first image (nobody cares about your boxes until they understand the problem)
- Generic tagline: "A powerful tool for all your needs"
- Inconsistent tense ("The tool will allow..." in a shipped project)
- No working demo link (or a demo link that 404s)
- "Star the repo if you find it useful" as the primary CTA
- README written as personal notes ("I wanted to build X because...")
- No version number or "v0.0.1" with no subsequent releases
- Installation instructions that require 10+ steps
- Screenshots only (no GIF showing the tool actually doing something)
- Claims without evidence: "reduces errors by 90%" with no citation or methodology

---

## 7. Recommended Approach

### Single opinionated recommendation for AI-generated markdown showcases

**Use Marp for automated generation. Use Slidev for presenter-mode showcases.**

The choice depends on the generation context:

---

### Case A: Fully automated pipeline (no human editor)

**Tool: Marp**

Rationale:
1. Single command: `npx @marp-team/marp-cli input.md --html -o output.html`
2. No build step beyond the CLI — zero npm install headaches in CI
3. Output is a standalone HTML file — one artifact, link-shareable
4. Frontmatter directives are simple enough for an LLM to generate reliably
5. `gaia` theme looks professional without any CSS customization

**Generated document structure (slide order):**
```
Slide 1: Cover — Project name + one-sentence value proposition
Slide 2: The Problem — specific pain, named user, concrete failure
Slide 3: Solution Overview — what the system does (diagram if available)
Slide 4: Architecture in 60 seconds — key components, one-line each
Slide 5: Key Design Decision — one ADR in Y-Statement format
Slide 6: Live Demo / Output — actual CLI output or screenshot of result
Slide 7: Metrics / Evidence — numbers, dates, specifics
Slide 8: Quick Start — 3-5 commands to running state
Slide 9: What's Next — roadmap in 3 bullets (no "coming soon" vagueness)
Slide 10: Links — GitHub, docs, contact
```

**Marp template for generated showcases:**
```md
---
marp: true
theme: gaia
class: lead
paginate: true
backgroundColor: #0f172a
color: #e2e8f0
---

<!-- _class: lead -->

# [Project Name]

[One sentence. Active voice. Specific outcome.]

---

<!-- _class: invert -->

## The Problem

[Specific user] currently [specific painful workflow].
This causes [concrete failure mode] [N] times per [unit].

Existing solutions [fail because X].

---

## How It Works

[Diagram or 3-5 bullet architecture overview]

---

## A Key Decision

> In the context of [X], we chose [Y] over [Z]
> to achieve [outcome], accepting [tradeoff].

**Evidence:** [specific metric or before/after]
```

---

### Case B: Human-presented, interactive showcase

**Tool: Slidev**

Rationale:
1. Monaco live editor: run code during the demo, in the slide
2. Presenter mode with timer built in
3. `magic-move` for progressive code reveals (best-in-class)
4. Self-contained SPA — deploy to GitHub Pages, share one URL
5. Recording built in for async showcases

**Add-on: reveal-md for intermediate cases**

If the generator can produce reveal.js markdown but not a full Slidev setup, `reveal-md` provides a middle path: markdown files served as reveal.js presentations with a single command.

---

### Architecture for auto-generated showcases in portable-kit / Buildr

The optimal pipeline:

```
Build artifacts (logs, metrics, ADRs, README sections)
  ↓
Showcase generator (AI reads artifacts, writes Marp .md)
  ↓
marp-cli (CI command: npx marp --html showcase.md)
  ↓
output/showcase.html (self-contained, shareable)
```

**The generator's job (prompt contract):**
- Extract the strongest metric from build logs → Slide 7
- Extract the hardest design decision → Slide 5 (Y-Statement format)
- Extract the install sequence from README → Slide 8
- Write the problem statement from the project description → Slide 2
- Never invent metrics — leave the slot empty if data is absent

**What makes the output feel professional (not generated):**
- Specific numbers from real logs, not placeholders
- Y-Statement ADRs that name the actual tradeoff
- Code blocks with real command output, not `...`
- No hedging language ("might", "could", "aims to")
- Consistent dark theme that matches the Gaia Marp theme defaults

---

*Research compiled from primary sources. All tool assessments based on current (2025-2026) documentation and community analysis.*
