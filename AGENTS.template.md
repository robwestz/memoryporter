# AGENTS.md

Projektspecifika instruktioner för kodningsagenter.
Fyll i alla [PLACEHOLDER]-fält. Ta bort denna kommentar när det är klart.

---

## Stack

- Språk: [PLACEHOLDER: t.ex. TypeScript, Rust, Python]
- Pakethanterare / bygg: [PLACEHOLDER: t.ex. pnpm, cargo, uv, pip]
- Entry points: [PLACEHOLDER: t.ex. src/index.ts, crates/cli]
- Databas: [PLACEHOLDER: t.ex. PostgreSQL, SQLite, ingen]
- Ramverk: [PLACEHOLDER: t.ex. Next.js, Axum, FastAPI]

## Verify (krav innan du påstår att du är klar)

Exakt samma kommandon som i CI. Kör ALLA innan du säger "klar":

```bash
[PLACEHOLDER: t.ex. pnpm lint && pnpm typecheck && pnpm test]
```

- Formatering: [PLACEHOLDER: t.ex. prettier --check .]
- Typkontroll / kompilering: [PLACEHOLDER: t.ex. tsc --noEmit]
- Tester: [PLACEHOLDER: t.ex. pnpm test]
- Lint: [PLACEHOLDER: t.ex. eslint .]

## Projektspecifika regler

- Rör inte: [PLACEHOLDER: t.ex. migrations/, public API-kontrakt, genererade filer]
- Hemligheter: [PLACEHOLDER: t.ex. .env.local — committa aldrig, använd .env.example som mall]
- Designsystem / stil: [PLACEHOLDER: t.ex. Tailwind, shadcn/ui, projektets egna komponenter]
- Namnkonventioner: [PLACEHOLDER: t.ex. snake_case i backend, camelCase i frontend]

## Katalogstruktur

```
[PLACEHOLDER: fyll i ditt projekts nyckelkataloger]
```

## Agentresurser i detta repo

- Operationsmanual: CLAUDE.md (läs vid sessionsstart)
- Kunskapsbas: knowledge/INDEX.md
- Skill-engine: skill-engine/PROTOCOL.md
- Skill-creator: skill-creator/SKILL.md
- Kvalitetsprotokoll: protocols/small-model-premium.md
- Orkestreringsprotokoll: protocols/agent-orchestration.md
- Arkitekturprinciper: conventions/PRINCIPLES.md

## Sessionshygien

- Föredra små, granskningsbara diffar
- Ange antaganden och vad som INTE verifierats
- Påstå aldrig att CI är grön utan loggbevis
- Följ uppgiftsroutingen i CLAUDE.md
- För substantiellt arbete: följ kvalitetsprotokollet (Fas 0-3 internt, Fas 4 synlig)
