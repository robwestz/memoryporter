# Portable Agent Kit

Komplett, portabelt toolkit for autonom AI-driven utveckling.
Kopiera till ett nytt projekt, kor bootstrap, borja bygga.

## Snabbstart

```bash
cp -r portable-kit/ mitt-projekt/
cd mitt-projekt
./bootstrap.sh
# Fyll i AGENTS.md med projektets stack och verify-kommandon
# Starta Claude Code
```

## Innehall

| Mapp | Filer | Funktion |
|------|-------|----------|
| `knowledge/` | 41 | Gamechangers (varfor), skills (hur), agentritningar (vem), meta-skills (produktionslinor) |
| `skill-engine/` | 10 | 5-stegs beslutspipeline med 38 short skills |
| `skill-creator/` | 21 | Skill-fabrik: skapa, testa, iterera, paketera |
| `protocols/` | 3 | Kvalitetsprotokoll, orkestrering, arkitekturaudit |
| `conventions/` | 3 | Regler, principer, maskinlasbart manifest |
| `scaffolds/` | 3 | Projektmallar: Rust, TypeScript, Python |
| `runtime/` | 60 | 4 Rust crates: ob1, mini, snowball, gateway |
| `mempalace/` | 136 | Minnessystem: ChromaDB + knowledge graph + MCP-server + hooks |
| `.cursor/` | 5 | IDE-integration (Cursor skills + rules) |

## Hur det fungerar

1. **CLAUDE.md** lases av agenten vid sessionsstart - den wires allt
2. **AGENTS.md** innehaller projektspecifika verify-kommandon och regler
3. Agenten foljer uppgiftsrouting: trivial -> direkt, komplex -> skill-engine pipeline
4. Kvalitetsprotokollet (5 faser) appliceras pa allt substantiellt arbete

## Krav

- Claude Code (eller Cursor med Claude)
- Rust toolchain (installeras automatiskt av bootstrap.sh)
- ANTHROPIC_API_KEY (for runtime-binarerna)
