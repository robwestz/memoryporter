# Blueprint: Review Copilot

> A web app that turns raw pull request diffs into reviewer-ready findings, summaries, and follow-up questions for engineering teams.

**Created:** 2026-04-10
**Status:** Draft
**Author:** Robin Westerlund

---

## 1. Concept

| Field | Value |
|-------|-------|
| **Product** | Review Copilot is a web app that analyzes pull requests and produces high-signal review notes for software teams. |
| **User** | Staff engineers and tech leads reviewing GitHub pull requests in small-to-medium product teams. |
| **Core capability** | Turn a diff plus PR metadata into a concise, severity-ordered review with file references and missing-test callouts. |
| **Competition** | Human review checklists, GitHub Copilot review suggestions, and internal review bots with weak repo context. |
| **30-day target** | A deployed MVP that can ingest a GitHub PR URL, analyze the diff, and return a reviewer-ready report in under 2 minutes. |

## 2. Domain Brief

- Code review tools compete on signal quality, not just automation.
- False positives are expensive because reviewers stop trusting the system quickly.
- Repo context matters: diffs alone miss architecture boundaries, naming conventions, and existing tests.
- The best first wedge is asynchronous PR review, not general coding assistance.
- GitHub App installation and repository permissions are part of the product surface, not just implementation detail.
- Teams need clear auditability: what files were read, which concerns were inferred, and where confidence is low.
- Rate limits and API pagination are common operational constraints.
- Security expectations are high because private source code is involved.
- If LLMs are used, prompt-injection resistance and secret redaction are required baseline controls.
- The system should degrade gracefully when a repo is too large or connectors are unavailable.

## 3. Architecture

### Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Language** | TypeScript | Strong ecosystem for GitHub integrations, web UI, and shared schemas across client and server. |
| **Frontend** | Next.js App Router | Fastest path to authenticated SaaS UX, server actions, and deployable product pages. |
| **Backend** | Next.js server routes + background job worker | Keep MVP monolithic while isolating long-running analysis jobs from request latency. |
| **Database** | PostgreSQL | Stores users, installations, review jobs, findings, and feedback with reliable relational queries. |
| **Hosting** | Vercel + managed Postgres | Simple deploy path for the web app, with managed infra for the MVP window. |
| **Auth** | GitHub OAuth | Product is GitHub-native; separate identity system adds unnecessary friction. |
| **AI** | Claude API | Strong code-review style reasoning and file-aware summarization for the core workflow. |

### Architecture Pattern

Monolith-first SaaS. The web app, API surface, job orchestration, and admin UI live in one Next.js codebase. Background execution is separated by queue and worker process, not by microservice boundary.

### Directory Structure

```text
review-copilot/
  app/
    (marketing)/
    dashboard/
    reviews/[reviewId]/
    api/
      github/webhook/route.ts
      reviews/route.ts
  src/
    features/
      auth/
      github/
      reviews/
      findings/
      billing/
    lib/
      ai/
      db/
      queue/
      observability/
    jobs/
      analyze-pr.ts
      refresh-installation.ts
    prompts/
    schemas/
  prisma/
  tests/
    integration/
    e2e/
  docs/
    blueprint-review-copilot.md
```

### Data Model

```text
[User] --has-many--> [Workspace]
[Workspace] --has-many--> [Repository]
[Repository] --has-many--> [ReviewJob]
[ReviewJob] --has-many--> [Finding]
[Workspace] --has-many--> [Installation]
[User] --has-many--> [Feedback]
```

- User: id, email, githubUserId, role
- Workspace: id, name, billingPlan
- Repository: id, githubRepoId, defaultBranch, installationId
- ReviewJob: id, prNumber, status, startedAt, completedAt, tokenCost
- Finding: id, severity, summary, filePath, lineHint, confidence
- Feedback: id, reviewJobId, findingId, verdict, note

## 4. Quality Gates

### Baseline (200k Standard)

- [ ] Core feature works end-to-end
- [ ] Deployed and accessible
- [ ] Auth secure (if applicable)
- [ ] Error handling graceful
- [ ] README with setup + usage + deploy
- [ ] Critical path tested

### Product-Specific

| Gate | Threshold | How to verify |
|------|-----------|--------------|
| Review quality | Output includes severity, rationale, and file references for every finding | Golden PR fixtures reviewed against expected findings |
| GitHub permission safety | Private repo contents only fetched after explicit installation grant | OAuth + GitHub App flow tested in staging |
| LLM failure handling | Failed analysis returns actionable retry state, not silent empty output | Integration test with simulated upstream API failure |
| Prompt-injection resistance | Untrusted PR text cannot override system instructions or exfiltrate secrets | Adversarial prompt fixture set in automated tests |
| Feedback loop | Reviewer can mark findings useful/not useful and feedback is persisted | End-to-end dashboard test |

## 5. Skill Map

### Existing Skills (reuse these)

| Skill | Location | What it provides |
|-------|----------|-----------------|
| 200k-blueprint | `knowledge/meta-skills/200k-blueprint/SKILL.md` | Converts fuzzy product intent into a concrete technical blueprint |
| skill-forge | `knowledge/meta-skills/skill-forge/SKILL.md` | Packages domain-specific workflows into reusable skills |
| skill_session_management | `knowledge/skills/skill_session_management.md` | Patterns for persistence, replay, and resume during long-running review jobs |
| skill_tool_permission_system | `knowledge/skills/skill_tool_permission_system.md` | Guardrails for repo access and graduated tool permissions |

### Skills to Forge

| Priority | Skill | What it enables | Shape |
|----------|-------|----------------|-------|
| P1 | github-pr-intake | Normalize PR URLs, installations, repo metadata, and pagination into one stable input | Standard |
| P1 | review-finding-writer | Turn raw analysis into concise, reviewer-trustworthy findings with evidence | Full |
| P2 | adversarial-pr-safety | Evaluate prompt injection, secrets exposure, and malicious diff content | Standard |
| P2 | reviewer-feedback-loop | Capture and fold reviewer verdicts back into ranking and product metrics | Minimal |

## 6. Build Order

| Phase | Deliverable | Depends on | Estimate |
|-------|------------|-----------|----------|
| 0 | Scaffold + CI/CD + deploy | Nothing | M |
| 1 | Auth + data model + core feature | Phase 0 | L |
| 2 | Secondary features + integrations | Phase 1 | M |
| 3 | Polish + performance + SEO | Phase 2 | M |
| 4 | Launch checklist + monitoring | Phase 3 | S |

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Review output is noisy and teams stop trusting it | Med | High | Start with a narrow PR fixture set, collect reviewer feedback immediately, and optimize for precision over recall |
| GitHub API limits slow down large-repo analysis | Med | Med | Cache repository metadata, cap file counts for MVP, and queue oversized reviews for async processing |
| LLM cost spikes on large diffs | High | Med | Enforce token budgets, chunk large diffs, and short-circuit low-value files like generated assets |

## 8. Estimated Effort

| Phase | Effort | Notes |
|-------|--------|-------|
| Total | L | Feasible for a focused MVP in 30 days with one experienced full-stack builder |
| Phase 0-1 (MVP) | M | Most risk sits in GitHub integration, job orchestration, and review quality |
| Phase 2-4 (Complete) | M | Billing, feedback loops, launch polish, and monitoring round out the product |
