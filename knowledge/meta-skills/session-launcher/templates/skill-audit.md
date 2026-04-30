# Skill Audit Template

> Quick inventory of all available skills. Use during Step 2 (SCAN) or when
> the user requests a skill coverage report.

---

## Skill Inventory

**Scanned:** {{ISO_DATE}}
**Total skills found:** {{TOTAL_COUNT}}
**Global skills (/.claude/skills/):** {{GLOBAL_COUNT}}
**Meta-skills (knowledge/meta-skills/):** {{META_COUNT}}
**Project-local (.skills/):** {{LOCAL_COUNT}}

---

### By Category

| Category | Count | Skills |
|----------|-------|--------|
| Builder | {{N}} | {{skill_list}} |
| Analyzer | {{N}} | {{skill_list}} |
| Researcher | {{N}} | {{skill_list}} |
| Orchestrator | {{N}} | {{skill_list}} |
| Formatter | {{N}} | {{skill_list}} |
| Infra | {{N}} | {{skill_list}} |
| Meta | {{N}} | {{skill_list}} |
| Context | {{N}} | {{skill_list}} |

---

### Coverage Matrix

Map task categories against available skills:

| Task category | Covered by | Gaps |
|---------------|-----------|------|
| **Build** | {{skills}} | {{gaps_or_none}} |
| **Audit** | {{skills}} | {{gaps_or_none}} |
| **Research** | {{skills}} | {{gaps_or_none}} |
| **Launch** | {{skills}} | {{gaps_or_none}} |
| **Rescue** | {{skills}} | {{gaps_or_none}} |
| **Present** | {{skills}} | {{gaps_or_none}} |

---

### Full Listing

| # | Skill | Location | Category | Key triggers |
|---|-------|----------|----------|-------------|
| 1 | {{name}} | {{global/meta/local}} | {{category}} | {{top_3_triggers}} |
| 2 | ... | ... | ... | ... |

---

## Notes

- Skills with trigger match score 0 for all task categories may be candidates for removal
- Skills that appear in multiple categories are high-value generalists
- Project-local skills (.skills/) override global skills of the same name
