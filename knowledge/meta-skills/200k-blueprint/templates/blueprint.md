<!-- [FIXED] Blueprint header -->
# Blueprint: [VARIABLE: Product Name]

> [VARIABLE: One-sentence description of what this product is]

**Created:** [VARIABLE: YYYY-MM-DD]
**Status:** Draft
**Author:** [VARIABLE: Name]

---

<!-- [FIXED] Concept section — from INTAKE -->
## 1. Concept

| Field | Value |
|-------|-------|
| **Product** | [VARIABLE: one sentence] |
| **User** | [VARIABLE: who uses it] |
| **Core capability** | [VARIABLE: the ONE thing] |
| **Competition** | [VARIABLE: what exists today] |
| **30-day target** | [VARIABLE: what "done" looks like] |

<!-- [VARIABLE] Domain brief — only if research was needed -->
## 2. Domain Brief

[VARIABLE: 10-20 lines capturing domain terms, existing solutions, constraints, and regulatory requirements. Delete this section if the domain was already familiar.]

<!-- [FIXED] Architecture section -->
## 3. Architecture

### Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Language** | [VARIABLE] | [VARIABLE: why] |
| **Frontend** | [VARIABLE] | [VARIABLE: why] |
| **Backend** | [VARIABLE] | [VARIABLE: why] |
| **Database** | [VARIABLE] | [VARIABLE: why] |
| **Hosting** | [VARIABLE] | [VARIABLE: why] |
| **Auth** | [VARIABLE] | [VARIABLE: why] |
| **AI** | [VARIABLE] | [VARIABLE: why, or "N/A"] |

### Architecture Pattern

[VARIABLE: Which pattern (static-first, monolith-first, backend+frontend, CLI, platform) and why]

### Directory Structure

```
[VARIABLE: project tree extending the selected scaffold]
```

### Data Model

```
[VARIABLE: entity-relationship sketch]
```

<!-- [FIXED] Quality gates section -->
## 4. Quality Gates

### Baseline (200k Standard)

- [ ] Core feature works end-to-end
- [ ] Deployed and accessible
- [ ] Auth secure (if applicable)
- [ ] Error handling graceful
- [ ] README with setup + usage + deploy
- [ ] Critical path tested

### Product-Specific

<!-- [VARIABLE] Add gates specific to this product -->
| Gate | Threshold | How to verify |
|------|-----------|--------------|
| [VARIABLE] | [VARIABLE] | [VARIABLE] |

<!-- [FIXED] Skill map section -->
## 5. Skill Map

### Existing Skills (reuse these)

| Skill | Location | What it provides |
|-------|----------|-----------------|
| [VARIABLE] | [VARIABLE: path] | [VARIABLE] |

### Skills to Forge

| Priority | Skill | What it enables | Shape |
|----------|-------|----------------|-------|
| P1 | [VARIABLE] | [VARIABLE] | [VARIABLE: Minimal/Standard/Full] |
| P2 | [VARIABLE] | [VARIABLE] | [VARIABLE] |

<!-- [FIXED] Build order section -->
## 6. Build Order

| Phase | Deliverable | Depends on | Estimate |
|-------|------------|-----------|----------|
| 0 | Scaffold + CI/CD + deploy | Nothing | [VARIABLE: S/M/L] |
| 1 | Auth + data model + core feature | Phase 0 | [VARIABLE] |
| 2 | Secondary features + integrations | Phase 1 | [VARIABLE] |
| 3 | Polish + performance + SEO | Phase 2 | [VARIABLE] |
| 4 | Launch checklist + monitoring | Phase 3 | [VARIABLE] |

<!-- [FIXED] Risk register -->
## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| [VARIABLE] | [VARIABLE: Low/Med/High] | [VARIABLE: Low/Med/High] | [VARIABLE] |
| [VARIABLE] | [VARIABLE] | [VARIABLE] | [VARIABLE] |
| [VARIABLE] | [VARIABLE] | [VARIABLE] | [VARIABLE] |

<!-- [FIXED] Effort estimate -->
## 8. Estimated Effort

| Phase | Effort | Notes |
|-------|--------|-------|
| Total | [VARIABLE: S/M/L/XL] | [VARIABLE] |
| Phase 0-1 (MVP) | [VARIABLE] | [VARIABLE] |
| Phase 2-4 (Complete) | [VARIABLE] | [VARIABLE] |
