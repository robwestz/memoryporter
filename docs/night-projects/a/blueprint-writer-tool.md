# Blueprint: AI Writing Tool (Skill-Template Platform)

> A writing tool where baked-in prompting expertise replaces the need for users to know how to prompt — producing human-indistinguishable content through structured skill-templates.

**Created:** 2026-04-14
**Status:** Draft
**Author:** Robin Westerlund

---

## 1. Concept

| Field | Value |
|-------|-------|
| **Product** | AI writing tool where skill-templates encode prompting expertise so content professionals get consistent, human-quality output without knowing how to prompt |
| **User** | Content professionals: freelance writers, agencies, marketing teams who already use AI but produce recognizably AI output |
| **Core capability** | Output indistinguishable from human writers, consistently — not via post-processing tricks but via structurally correct generation from the start |
| **Competition** | ChatGPT (generic, requires prompting skill), Jasper (shallow templates, fill-in-the-blank), Copy.ai (marketing workflows, still requires craft) |
| **30-day target** | 3 skill-templates working end-to-end: reaction piece, long-form essay, product announcement — each producing source-verified, human-quality output |

---

## 2. Domain Brief

**The prompting gap:** Most content professionals use ChatGPT like a typewriter — paste a brief, accept the output, cringe at the result. The problem isn't the model; it's the prompt architecture. Expert prompts for long-form content encode: genre conventions, structural scaffolding, tone calibration, source grounding, and constraint layers. Non-experts produce none of this.

**The market pain:** Agencies and writers can't charge for "AI content" because clients can tell. They either hide that they're using AI (fragile) or reject AI entirely (expensive). The real product isn't "AI that writes" — it's "AI that writes so well no one knows it's AI."

**Existing solutions and gaps:**
- **Jasper:** Template-based but templates are shallow (subject + tone + CTA). No structural scaffolding, no source grounding, no genre conventions. Output is still recognizably AI.
- **Copy.ai:** Workflow-focused, good for marketing copy (headlines, emails), breaks down on anything requiring depth or citation.
- **ChatGPT/Claude direct:** Ceiling is expert-level human — floor is embarrassing. Wide variance, requires prompting skill to hit the ceiling.

**The differentiation:** A skill-template is not a fill-in-the-blank form. It is a compiled prompt architecture: genre conventions embedded, structural scaffolding baked in, source verification integrated, tone calibrated to the niche. The user provides the topic and brief. The skill does the rest.

**Bacowr as proof of concept:** Backlink content (guest posts, link-bait) is the first niche. It has clear genre conventions (hook + argument + authority + CTA), well-understood quality markers (DA relevance, link placement naturalness), and a measurable output: does a real editor accept it? If yes, the skill works.

**The generalization:** Each niche has its own genre conventions. Each skill IS a niche. The platform's value compounds with each skill added. The catalog is the moat.

**Key technical constraints:**
- AI detection tools (Originality.ai, GPTZero, Winston AI) are improving — source-grounding and structural variety are the defenses, not post-processing rewrites
- Claude API is the right AI choice: best instruction-following, best long-context, best for nuanced prose
- Source verification requires real-time web access or a curated sources layer — hallucinated citations destroy trust instantly
- Generation for long-form (1500–3000 words) takes 30–90s — streaming output is non-negotiable UX

---

## 3. Architecture

### Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Language** | TypeScript | Full-stack JS ecosystem, shared types between frontend and backend, best Next.js compatibility |
| **Frontend** | Next.js 14 App Router | SaaS with auth, SSR for document pages, streaming support via React Server Components |
| **Backend** | Next.js API Routes + Edge Functions | Streaming generation via Edge, standard CRUD via Node routes, no separate service needed |
| **Database** | Supabase (PostgreSQL) | Managed Postgres, built-in auth, Row-Level Security for multi-tenant isolation, real-time subscriptions for document updates |
| **Hosting** | Vercel | Native Next.js, Edge Functions for streaming, zero-config deployment |
| **Auth** | Supabase Auth | Already in stack, handles OAuth (Google), email/password, session management |
| **AI** | Claude API (claude-sonnet-4-6) | Best long-form instruction following, 200k context for multi-pass generation, streaming via SSE |

### Architecture Pattern

**Monolith-first (Next.js App Router)** — SaaS with auth, document management, and streaming generation. The "skill-template engine" is a library within the monolith, not a separate service. Extract only if multi-tenancy or catalog scale demands it (Phase 3+).

### Directory Structure

```
writer-tool/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    ← Document list
│   │   │   ├── documents/
│   │   │   │   ├── [id]/page.tsx           ← Document editor
│   │   │   │   └── new/page.tsx            ← Skill picker → brief → generate
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── generate/route.ts           ← Edge: streams generation via Claude
│   │   │   ├── sources/route.ts            ← Source search + verification
│   │   │   └── documents/route.ts          ← CRUD
│   │   └── layout.tsx
│   ├── components/
│   │   ├── editor/
│   │   │   ├── DocumentEditor.tsx          ← Rich text (Tiptap or Lexical)
│   │   │   └── StreamingOverlay.tsx        ← Live generation display
│   │   ├── skill-picker/
│   │   │   ├── SkillCatalog.tsx            ← Browse skills by category
│   │   │   └── SkillCard.tsx
│   │   ├── brief-form/
│   │   │   └── BriefForm.tsx               ← Dynamic form driven by skill schema
│   │   ├── source-panel/
│   │   │   └── SourcePanel.tsx             ← Cited sources sidebar
│   │   └── ui/                             ← shadcn/ui components
│   ├── lib/
│   │   ├── claude/
│   │   │   ├── client.ts                   ← Anthropic SDK wrapper
│   │   │   └── stream.ts                   ← SSE streaming handler
│   │   ├── skill-engine/
│   │   │   ├── loader.ts                   ← Load + validate skill definitions
│   │   │   ├── compiler.ts                 ← Brief → full prompt architecture
│   │   │   └── types.ts                    ← SkillTemplate, Brief, GenerationJob
│   │   ├── sources/
│   │   │   ├── search.ts                   ← Source lookup (Brave/Serper API)
│   │   │   └── verify.ts                   ← Citation grounding + fact checking
│   │   └── db/
│   │       └── supabase.ts                 ← Supabase client + typed queries
│   └── skills-catalog/                     ← Skill template definitions (TypeScript)
│       ├── _schema.ts                      ← SkillTemplate interface
│       ├── reaction-piece.ts               ← Phase 1
│       ├── long-form-essay.ts              ← Phase 1
│       └── product-announcement.ts         ← Phase 1
├── supabase/
│   └── migrations/
│       ├── 001_users.sql
│       ├── 002_documents.sql
│       └── 003_skills.sql
├── tests/
│   ├── skill-engine/
│   │   ├── compiler.test.ts
│   │   └── loader.test.ts
│   └── e2e/
│       └── generate-document.spec.ts
├── public/
├── .env.local.example
├── package.json
└── README.md
```

### Data Model

```
[User] --has-many--> [Document]
[User] --has-one-->  [Subscription]

[Document] --belongs-to--> [SkillTemplate]
[Document] --has-many-->   [Source]
[Document] --has-many-->   [DocumentVersion]

[SkillTemplate]
  id, slug, name, category, version
  brief_schema: JSON      ← Drives BriefForm dynamically
  prompt_architecture: JSON  ← The compiled prompt layers
  quality_markers: JSON   ← What "good" looks like for this skill
  active: boolean

[Document]
  id, user_id, skill_slug
  brief: JSON             ← User-provided inputs
  content: text           ← Final output
  word_count, status
  created_at, updated_at

[Source]
  id, document_id
  url, title, excerpt
  verified: boolean
  cited_in_content: boolean

[Subscription]
  user_id, plan, generations_used, generations_limit
```

---

## 4. Quality Gates

### Baseline (200k Standard)

- [ ] Core feature works end-to-end (brief → generation → document saved)
- [ ] Deployed and accessible via URL
- [ ] Auth secure (Supabase RLS enforced, no cross-user data access)
- [ ] Error handling graceful (generation failure shows retry, no silent data loss)
- [ ] README with setup + usage + deploy instructions
- [ ] Critical path tested (compiler.test.ts passes, e2e generation test passes)

### Product-Specific

| Gate | Threshold | How to verify |
|------|-----------|--------------|
| AI detection score | < 20% AI on Originality.ai for 3 sample outputs per skill | Run 3 generations per skill through Originality.ai before launch |
| Human quality bar | Each skill's output reviewed by 1 experienced writer in that niche who rates it "publishable as-is" or "needs minor edits" | Manual review session per skill before marking it live |
| Source verification | Zero hallucinated citations — every cited source resolves to a real URL with relevant content | Automated: test each source URL, spot-check 10 documents manually |
| Generation latency | First token < 5s, full document < 90s | Load test with 5 concurrent generations |
| Token cost ceiling | < $0.15 per long-form generation at scale | Log token usage per generation, alert if > threshold |
| Skill structural correctness | Output matches expected structure (correct sections, word count ±20%, format requirements) | Automated assertion against skill's `quality_markers` schema |
| Streaming UX | User sees content appearing within 3s of submitting brief | Manual test + Lighthouse measurement |

---

## 5. Skill Map

### Existing Skills (reuse these)

| Skill | Location | What it provides |
|-------|----------|-----------------|
| Token Budget | `knowledge/skills/skill_token_budget.md` | Per-generation cost control, pre-turn budget checks |
| Streaming Renderer | `knowledge/skills/skill_streaming_renderer.md` | SSE chunk handling, markdown streaming without broken code blocks |
| Session Management | `knowledge/skills/skill_session_management.md` | Document state persistence, resume interrupted generation |
| Build Agentic Loop | `knowledge/skills/skill_build_agentic_loop.md` | Multi-pass generation architecture (outline → draft → refine) |

### Skills to Forge

| Priority | Skill | What it enables | Shape |
|----------|-------|----------------|-------|
| P1 | `skill-template-engine` | Compiles a SkillTemplate + Brief into a full prompt architecture; the core of the product | Full |
| P1 | `source-grounding` | Fetches real sources for a topic, verifies they exist, injects into generation context | Standard |
| P1 | `generation-pipeline` | Orchestrates multi-pass generation: sources → outline → draft → quality check | Standard |
| P2 | `brief-form-builder` | Renders a dynamic form from a skill's `brief_schema` JSON — no hardcoding per skill | Minimal |
| P2 | `skill-quality-assertion` | Runs a post-generation check against `quality_markers`: structure, word count, citation presence | Minimal |
| P3 | `skill-authoring` | Admin UI for creating new SkillTemplates — the catalog growth engine | Full |
| P3 | `ai-detection-evasion-audit` | Runs a batch of outputs through detection APIs, reports score, flags patterns | Standard |

**Note:** `ai-detection-evasion-audit` is for quality monitoring (measuring if output is good), not for gaming detection tools. The defense is structural generation quality, not obfuscation.

---

## 6. Build Order

| Phase | Deliverable | Depends on | Estimate |
|-------|------------|-----------|----------|
| 0 | Next.js scaffold + Supabase schema + Vercel deploy + env setup | Nothing | S (1–2 days) |
| 1 | Auth + one working skill end-to-end: `reaction-piece` (brief → sources → generation → saved document) | Phase 0 | M (4–6 days) |
| 2 | Skills 2–3 (`long-form-essay`, `product-announcement`) + streaming UI + source panel | Phase 1 | M (4–5 days) |
| 3 | Quality gates: AI detection audit, human review loop, structural assertion, generation cost monitoring | Phase 2 | S (2–3 days) |
| 4 | Document management UI (list, edit, export), usage limits, launch checklist, monitoring | Phase 3 | M (3–4 days) |

**30-day scope:** Phases 0–2 deliver the stated target (3 skills working). Phase 3 gates them for quality. Phase 4 makes it launchable.

---

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| AI detection tools improve and start flagging output | Med | High | Detection evasion must be structural (source grounding, varied sentence architecture) not cosmetic. Build quality-assertion gate that runs before marking any skill live. Monitor scores weekly. |
| Source grounding introduces latency > UX threshold | Med | Med | Cache source lookups by topic fingerprint (24h TTL). Run source fetch in parallel with outline generation. Set 5s timeout with graceful fallback to sourceless generation + warning. |
| Claude API costs per generation exceed margin | Low | High | Token budget gate in P1: enforce max tokens per phase (outline: 500, draft: 2000, refine: 500). Log actual usage per generation from day 1. Alert at 80% of cost ceiling. |
| Skill-template quality varies — some skills produce poor output for certain topics | Med | Med | Human review gate before any skill goes live. Quality markers schema enforced per skill. Provide a "regenerate" option so users can retry without losing their brief. |
| Users submit briefs that defeat the template structure (too vague, contradictory constraints) | High | Med | Brief validation in `skill-template-engine`: check required fields, flag thin briefs before generation starts. Guide users with examples in the brief form. |
| Source verification API (Brave/Serper) goes down mid-generation | Low | Med | Retry with exponential backoff (2 attempts). Fall back to generation without verified sources + flag in document: "sources unverified." Never silently produce hallucinated citations. |

---

## 8. Estimated Effort

| Phase | Effort | Notes |
|-------|--------|-------|
| **Total** | L (3–4 weeks solo) | Achievable in 30 days with focused execution |
| **Phase 0–1 (working MVP)** | M (5–8 days) | Scaffold + auth + one complete skill pipeline. This is the critical path. |
| **Phase 2 (30-day target)** | M (4–5 days) | Adding skills 2–3 is mostly template work once the engine exists. The engine is the hard part. |
| **Phase 3–4 (launchable)** | M (5–7 days) | Quality gates and management UI. Skip polish until skills pass human review. |

---

## Verify Checklist

- [x] All Five Questions answered
- [x] Stack decision justified (Next.js + Supabase + Vercel = standard SaaS, Claude API = best long-form)
- [x] Directory structure extends TypeScript scaffold
- [x] Quality gates are measurable (AI detection score < 20%, latency < 90s, cost < $0.15)
- [x] Skill map checked against existing skills (token-budget, streaming-renderer, session-management, agentic-loop reused)
- [x] Build order has phases with dependencies
- [x] Risk register has 6 entries (≥ 3 required)
- [x] Effort estimates present per phase

---

## Notes

- **The catalog is the moat.** Engineering the platform is a few weeks. Building a catalog of 20+ high-quality skill-templates takes months. Start with 3, validate quality bar, then scale the catalog.
- **Bacowr is instance 1.** Once the platform exists, Bacowr becomes `backlink-content` skill in the catalog. Same engine, different skill definition.
- **The skill-template format is the product's IP.** The `brief_schema` + `prompt_architecture` + `quality_markers` triple is what distinguishes this from any competitor. Treat it as the proprietary format.
- **Human review gate is non-negotiable for launch.** Ship nothing that hasn't been rated "publishable" by a domain expert. One bad skill destroys trust in the catalog.
