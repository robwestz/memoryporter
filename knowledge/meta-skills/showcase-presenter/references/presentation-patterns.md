# Presentation Patterns

> **When to read this:** Before reviewing showcase output quality, or when the output
> feels like "meeting notes" rather than a professional artifact.

---

## What Separates Professional Showcases from Side-Project Writeups

Drawn from analysis of high-starred open source projects and YC-style demo day feedback.
These are concrete, checkable signals — not aesthetic preferences.

---

## Credibility Signals (presence = professional)

### Specificity of Claims

| Signal | Professional | Side project |
|--------|-------------|-------------|
| Metrics | "92% command success rate across 51 commands" | "mostly works" |
| Scope | "for platform engineers running >10 concurrent agents" | "for developers" |
| Examples | Use plausible real data with realistic names | `foo`, `bar`, `example.com`, `test123` |
| Versioning | v1.2.0 — implies release discipline | "v0.0.1" with no subsequent releases |

### Demo Quality

- [ ] Demo shows the actual product, not a mockup or placeholder
- [ ] Demo shows outcome (before/after), not just steps
- [ ] Failure states are handled gracefully and shown, not hidden
- [ ] Install/run instructions are tested and work as written
- [ ] There is no "in a future version" anywhere in the demo

### Visual Hierarchy

- [ ] One clear primary action at all times (CTA, command, next step)
- [ ] Consistent heading scale (one size per level, not ad hoc)
- [ ] Code blocks have correct language tags for syntax highlighting
- [ ] Dark/light theme consistent throughout (no mixed screenshots)
- [ ] Tables for all parallel information (3+ items with shared attributes)

### Social Proof and External Validation

- [ ] At least one third-party signal (integration with known tool, real user count, stars)
- [ ] Changelog or release history exists (signals ongoing maintenance)
- [ ] External documentation link — not "see below," a real docs site or wiki section

### Professionalism of Language

| Avoid | Use instead |
|-------|------------|
| "WIP", "TODO: add description" | Complete the description or mark `[INCOMPLETE]` |
| Passive voice ("can be used to") | Active voice ("generates", "converts", "ships") |
| Generic headers ("Architecture") | Informative headers ("How the memory system prevents context loss") |
| Hedging ("might be useful", "should work") | Direct ("solves", "works", "ships") |
| Future tense for shipped features ("will allow") | Present tense ("allows") |

### Architecture and Depth Signals

- [ ] At least one diagram (Mermaid preferred — see `references/mermaid-cheatsheet.md`)
- [ ] Decisions are explained, not just stated: "We use YAML because it is human-editable"
- [ ] Edge cases are acknowledged: "This does not support X" shows you know the limits
- [ ] The document answers questions a skeptic would ask

---

## Anti-Signals (presence = side project)

Any of these appearing in a showcase output is an automatic failure of the professional
signals check:

| Anti-signal | Why it fails |
|-------------|-------------|
| "Coming soon" sections | Implies the thing doesn't exist |
| Architecture diagram as the first image | Nobody cares about boxes until they understand the problem |
| Generic tagline ("A powerful tool for all your needs") | Tells the reader nothing — signals you don't understand your own product |
| Inconsistent tense ("The tool will allow...") | Signals the doc was never reviewed |
| No working demo link / demo link that 404s | The worst possible signal |
| "Star the repo if you find it useful" as the primary CTA | Signals the author wants validation more than users |
| README as personal notes ("I wanted to build X because...") | Not a product document |
| Installation requiring 10+ steps | Shows the author never did a fresh install |
| Screenshots only (no GIF or runnable command) | Static images prove nothing |
| Claims without evidence ("reduces errors by 90%") | Invites disbelief |

---

## YC Demo Day Narrative Arc

For Mode 2 Demo Showcases presented live, follow this arc. Each section earns the
right to make the next claim.

```
[0:00–0:15]  Name + one-line description — the compression test
             "We are [X] for [Y]" — if you can't compress it, you don't understand it

[0:15–0:40]  Problem — specific, felt pain
             Name the exact user. Describe the exact moment of failure.
             One real anecdote > one paragraph of statistics.

[0:40–1:05]  Solution — show the product working, not a diagram
             "Here's what used to take 4 hours. Watch."
             One demo interaction, end-to-end, outcome visible.

[1:05–1:25]  Traction — numbers with dates
             "Last month: X. This month: Y."
             No projected numbers. Only actuals.

[1:25–1:55]  Market + business model
             TAM framing: "There are 4M professional developers who [specific behavior]"

[1:55–2:10]  Team — why you specifically can win
             Domain insight, not credentials.

[2:10–2:15]  Ask — what you need, what you'll do with it
             Vague ask = vague thinking.
```

**Structural rules:**
- Problem → Solution is the emotional engine. If the problem doesn't land, nothing after matters.
- Traction is proof, not promise. Skip if you have nothing real; never fake it.
- Demo shows outcome, not steps. Before and after — not the click sequence.

---

## Quick Checklist Before Marking Output Complete

Run this before delivering any showcase document:

- [ ] Every metric has a number, a unit, and a source
- [ ] Every decision names the alternative that was rejected
- [ ] Every gap in the register has an effort estimate
- [ ] Failures appear in the timeline, not just successes
- [ ] `[NO DATA]` visible where data is absent
- [ ] `[BROKEN]` items shown, not removed
- [ ] Active voice throughout
- [ ] Executive summary is exactly 3 sentences
- [ ] Next steps are 3–5, each with an effort tag
- [ ] Audit summary table appears at the end
- [ ] Verdict is displayed and not softened
