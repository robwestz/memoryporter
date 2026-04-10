---
name: 200k-blueprint
description: |
  Turn a product concept into a complete technical blueprint — architecture,
  stack, directory structure, quality gates, and the list of skills needed to
  build it. Use as the FIRST step before any 200k-repo build. Trigger on:
  "build X", "new product", "I want to create...", "200k blueprint", "design
  the architecture for", "what would it take to build", or any product concept
  that needs a structured plan before code. Also use when evaluating whether a
  product idea is worth building — the blueprint process reveals complexity.
author: Robin Westerlund
version: 1.0.0
---

# 200k Blueprint

## Purpose

Every 200k-repo starts the same way: a concept becomes a blueprint before
anyone writes a line of code. This skill is that conversion.

It takes a fuzzy idea ("build a SaaS dashboard for X") and produces a
concrete, actionable blueprint that downstream tools can execute:
- **skill-forge** reads the blueprint to know which skills to create
- **scaffolds** read it to know which project template to use
- **quality gates** read it to know what "done" means for this product
- **agents** read it to know what to build and in what order

**Without a blueprint, every 200k-repo is improvised. With one, they're
consistent.** This is the difference between "I built a thing" and "I have
a production line."

---

## Step 0: Read Before Blueprinting

**MANDATORY.** Before starting any blueprint:

1. Read this entire SKILL.md
2. Read `templates/blueprint.md` — the output template
3. If the domain is unfamiliar, read `references/domain-research.md`

---

## Step 1: INTAKE — Capture the Concept

**Action:** Understand what the user wants to build and for whom.

### The Five Questions

Ask these. Do not skip any. If the user doesn't know, that's a finding.

| # | Question | What it reveals | If unknown |
|---|----------|----------------|-----------|
| 1 | **What is the product?** (one sentence) | Scope and category | Too vague to blueprint — help them narrow |
| 2 | **Who uses it?** | User personas, access patterns | Default: technical users, single persona |
| 3 | **What is the ONE thing it must do well?** | Core feature, MVP scope | Everything = nothing. Push for one. |
| 4 | **What exists today?** (competitors, current solution) | Market context, differentiation | Research needed — see Step 2 |
| 5 | **What does success look like in 30 days?** | Deliverable scope, deployment target | Default: working MVP deployed somewhere |

### Capture Format

```markdown
## Concept
- Product: [one sentence]
- User: [who]
- Core capability: [the ONE thing]
- Competition: [what exists]
- 30-day target: [what "done" looks like]
```

**Anti-pattern:** Do not accept "build me an app" as a concept. Every blueprint
needs at minimum: what, who, and the one thing it must do well.

---

## Step 2: RESEARCH — Understand the Domain

**Action:** Gather enough domain knowledge to make architecture decisions.

### If the domain is familiar

Skip to Step 3. Don't research what you already know.

### If the domain is unfamiliar

| Research area | How | Time budget |
|--------------|-----|-------------|
| Competitor products | Web search, product pages, GitHub repos | 10 min |
| Technical landscape | What frameworks/APIs/services exist for this domain | 10 min |
| Common pitfalls | "Why do X products fail" — search for post-mortems | 5 min |
| Regulatory / compliance | Does this domain have legal requirements? | 5 min |

### Output: Domain Brief

A short document (10-20 lines) capturing:
- Key domain terms the blueprint will use
- Existing solutions and their trade-offs
- Technical constraints specific to this domain
- Regulatory requirements (if any)

**Anti-pattern:** Do not spend 2 hours researching before blueprinting. The research
budget is 30 minutes. If you need more, the concept is too vague — go back to Step 1.

---

## Step 3: ARCHITECT — Design the System

**Action:** Make the core technical decisions.

### 3.1 Stack Selection

Use this decision framework:

| Factor | Options | Decision criteria |
|--------|---------|-------------------|
| **Language** | TypeScript / Python / Rust / Go | Team skill, ecosystem, performance needs |
| **Frontend** | Next.js / Astro / SvelteKit / None | SPA vs static vs SSR vs API-only |
| **Backend** | Next.js API / FastAPI / Axum / Express | Complexity, auth needs, real-time |
| **Database** | PostgreSQL / SQLite / Supabase / None | Scale, complexity, managed vs self-hosted |
| **Hosting** | Vercel / Cloudflare / Railway / Docker | Cost, complexity, deployment frequency |
| **Auth** | Clerk / NextAuth / Supabase Auth / None | User management needs |
| **AI** | Claude API / OpenAI / Local model / None | Intelligence needs, cost, privacy |

**Decision rule:** Choose the SIMPLEST stack that handles the requirements.
A Next.js + Supabase + Vercel stack handles 80% of SaaS products. Don't
over-architect.

### 3.2 Architecture Pattern

| If the product is... | Use pattern... | Because... |
|---------------------|---------------|------------|
| Content site / marketing | Static-first (Astro/Next.js SSG) | Speed, SEO, low infra cost |
| SaaS with auth | Monolith-first (Next.js App Router) | Fast to build, easy to deploy |
| Data-heavy / API-first | Backend + separate frontend | Separation of concerns, API reuse |
| CLI tool / agent | Single binary (Rust) or script (Python) | No web overhead |
| Platform / marketplace | Service-oriented (start as monolith) | Evolve to services when needed |

**Anti-pattern:** Do not design microservices for an MVP. Start monolith. Extract
services only when you have a concrete scaling problem.

### 3.3 Directory Structure

Produce the project's directory tree. Use the matching scaffold from
`scaffolds/` as a starting point:

| Stack | Scaffold |
|-------|----------|
| Rust agent/CLI | `scaffolds/rust-agent.md` |
| TypeScript web/API | `scaffolds/typescript-agent.md` |
| Python CLI/API | `scaffolds/python-agent.md` |

Extend the scaffold with product-specific directories (e.g., `src/features/`,
`prisma/`, `public/assets/`).

### 3.4 Data Model

Produce an entity-relationship sketch:

```
[User] --has-many--> [Project] --has-many--> [Item]
[User] --has-one--> [Subscription]
```

For each entity: key fields, relationships, and access patterns.

**Anti-pattern:** Do not design the full database schema in the blueprint.
Entity sketches are enough. Schema details come during implementation.

---

## Step 4: DEFINE QUALITY — Set the Gates

**Action:** Define what "done" means for this specific product.

### Baseline: The 200k Standard

Every product inherits these non-negotiable gates:

| Gate | Threshold |
|------|-----------|
| Core feature works | User can complete the primary workflow end-to-end |
| Deployed | Accessible via URL or installable binary |
| Auth (if applicable) | Secure login, session management, no secrets in client |
| Error handling | Graceful failures, error boundaries, user-facing messages |
| Documentation | README with setup, usage, and deployment instructions |
| Tests | Critical path covered (not 100% coverage, but the happy path works) |

### Product-Specific Gates

Add gates specific to this product:

| If the product involves... | Add gate... |
|---------------------------|-------------|
| User data | Data privacy, backup strategy, GDPR compliance |
| Payments | Stripe/payment integration tested, refund flow documented |
| AI/LLM | Token budget limits, fallback when API is down, output validation |
| Public API | API docs (OpenAPI), rate limiting, versioning strategy |
| Content/SEO | Meta tags, sitemap, Core Web Vitals, structured data |
| Real-time | WebSocket reconnection, offline state handling |

### Output: Quality Checklist

A markdown checklist saved in the blueprint. Agents reference this to know
when they're done.

---

## Step 5: MAP SKILLS — What Needs to Be Forged

**Action:** Identify which agent skills are needed to build this product.

### Skill Audit

For each major capability the product needs:

| Capability | Existing skill? | Action |
|-----------|----------------|--------|
| [capability] | Check `skill-engine/explicit-skills.md` and `knowledge/skills/` | If exists: reference it. If not: add to forge list. |

### Forge List

Produce a prioritized list of skills to create:

```markdown
## Skills to Forge (via skill-forge)

### Priority 1 — Blocks everything
1. [skill-name] — [what it enables] — Shape: [Minimal/Standard/Full]

### Priority 2 — Blocks specific features
2. [skill-name] — [what it enables] — Shape: [Minimal/Standard/Full]

### Priority 3 — Nice to have
3. [skill-name] — [what it enables] — Shape: [Minimal/Standard/Full]
```

**Anti-pattern:** Do not forge skills for standard operations (git, file editing,
testing). Only forge skills for domain-specific or product-specific workflows.

---

## Step 6: PRODUCE BLUEPRINT — Write the Document

**Action:** Assemble everything into the blueprint document.

Use `templates/blueprint.md` as the starting point. Fill all Variable zones.

The blueprint is saved to: `docs/blueprint-[product-name].md`

### Blueprint Sections (from template)

1. **Concept** — From Step 1
2. **Domain Brief** — From Step 2 (if applicable)
3. **Architecture** — Stack, pattern, directory structure, data model (Step 3)
4. **Quality Gates** — Baseline + product-specific (Step 4)
5. **Skill Map** — Existing + to-forge (Step 5)
6. **Build Order** — What to build first, second, third
7. **Risk Register** — What could go wrong, how to mitigate
8. **Estimated Effort** — T-shirt sizing (S/M/L/XL) per phase

### Build Order Logic

| Phase | What | Depends on |
|-------|------|-----------|
| 0 | Scaffold + CI/CD + deploy pipeline | Nothing |
| 1 | Auth + data model + core feature (MVP) | Phase 0 |
| 2 | Secondary features + integrations | Phase 1 |
| 3 | Polish + performance + SEO | Phase 2 |
| 4 | Launch checklist + monitoring | Phase 3 |

**Anti-pattern:** Do not put polish before core features. Phase 1 must deliver
the ONE thing the product does well. Everything else is Phase 2+.

---

## Step 7: VERIFY — Blueprint Quality Check

Before handing off the blueprint:

- [ ] All Five Questions answered (Step 1)
- [ ] Stack decision justified (not just "I like Next.js")
- [ ] Directory structure extends a scaffold (not invented from scratch)
- [ ] Quality gates are measurable (pass/fail, not subjective)
- [ ] Skill map checked against existing skills (no duplicate forging)
- [ ] Build order has phases with dependencies
- [ ] Risk register has at least 3 entries
- [ ] Effort estimates are present (even if rough)

---

## Integration Points

| Component | How 200k-blueprint connects |
|-----------|---------------------------|
| **skill-forge** | Blueprint's Skill Map feeds directly into forge: "forge these skills" |
| **scaffolds/** | Blueprint selects which scaffold to use as starting point |
| **skill-engine** | Blueprint checks existing skills before recommending new ones |
| **kb-document-factory** | If the product needs a knowledge base, reference kb-doc templates |
| **quality-gate (references)** | Blueprint's quality checklist extends the 200k baseline |
| **ob1-runtime / claw-gateway** | Blueprint selects runtime when the product is an agent/API |

---

## Quick Reference

```
INTAKE      → 5 questions: what, who, one thing, competition, 30-day target
RESEARCH    → 30 min max: competitors, tech landscape, pitfalls, compliance
ARCHITECT   → Stack + pattern + directory + data model (simplest that works)
QUALITY     → 200k baseline + product-specific gates
MAP SKILLS  → Audit existing, list what to forge, prioritize
BLUEPRINT   → Assemble into template, add build order + risks + effort
VERIFY      → 8-item checklist
```

---

## Notes

- This skill produces the plan. It does not execute the plan.
- The blueprint is a living document — update it as understanding grows
- Default stack for most SaaS: Next.js + Supabase + Vercel + Clerk
- Default stack for agents/tools: Rust (ob1-runtime) or Python (CLI)
- When in doubt about scope: smaller is better. Ship Phase 1, learn, expand.
