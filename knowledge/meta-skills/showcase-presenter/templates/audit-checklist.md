<!-- [FIXED] Documentation audit checklist — used in both Mode 1 and Mode 2 output -->
<!-- Appears at the end of every showcase document. Never omit. -->

## Documentation Audit

<!-- [VARIABLE: One row per capability, skill, tool, or file showcased] -->
<!-- Column headers: ✓ = pass, ✗ = fail, – = not verified in this session -->

| Capability / Item | A1 Exists | A2 README | A3 Frontmatter | A4 Invokable | A5 Output OK | A6 No Dead Refs | Status |
|-------------------|-----------|-----------|----------------|--------------|--------------|-----------------|--------|
| <!-- [VARIABLE: name] --> | <!-- [VARIABLE: ✓ \| ✗] --> | <!-- [VARIABLE: ✓ \| ✗ \| –] --> | <!-- [VARIABLE: ✓ \| ✗ \| –] --> | <!-- [VARIABLE: ✓ \| ✗ \| –] --> | <!-- [VARIABLE: ✓ \| ✗ \| –] --> | <!-- [VARIABLE: ✓ \| ✗] --> | `<!-- [VARIABLE: [READY] \| [UNTESTED] \| [INCOMPLETE] \| [BROKEN]] -->` |

<!-- [FIXED] Summary counts — compute from the rows above -->
**Ready:** <!-- [VARIABLE: N] --> / <!-- [VARIABLE: total] --> &nbsp;
**Untested:** <!-- [VARIABLE: N] --> / <!-- [VARIABLE: total] --> &nbsp;
**Incomplete:** <!-- [VARIABLE: N] --> / <!-- [VARIABLE: total] --> &nbsp;
**Broken:** <!-- [VARIABLE: N] --> / <!-- [VARIABLE: total] -->

<!-- [FIXED] Audit actions — specific fixes required for BROKEN and INCOMPLETE items -->
**Audit actions required:**

<!-- [VARIABLE: Bulleted list of specific fixes, e.g.:] -->
<!-- - Fix dead reference in skill-forge/references/: `quality-gate.md` not found at declared path -->
<!-- - Add frontmatter to `my-skill/SKILL.md` — name and version fields missing -->
<!-- - Verify invocation of `project-wiki`: run `bash build.sh --mode wiki` and confirm output -->

<!-- [FIXED] If all items pass: replace bulleted list with this line -->
<!-- No audit actions required. All checked items passed A1–A6. -->

---

<!-- [FIXED] Audit legend — always present so readers can interpret the table -->
**Legend:**
A1 = file exists on disk · A2 = README or SKILL.md present · A3 = frontmatter valid
A4 = invocation confirmed in this session · A5 = output format matches documentation
A6 = no dead file references · – = check not performed in this session

<!-- [FIXED] Example of a completed checklist (remove this block from output) -->
<!--
EXAMPLE (from portable-kit meta-skills, 2026-04-13):

| Capability / Item | A1 Exists | A2 README | A3 Frontmatter | A4 Invokable | A5 Output OK | A6 No Dead Refs | Status |
|-------------------|-----------|-----------|----------------|--------------|--------------|-----------------|--------|
| skill-forge | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `[READY]` |
| project-wiki | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | `[READY]` |
| showcase-presenter | ✓ | ✓ | ✓ | – | – | ✓ | `[UNTESTED]` |
| seo-article-audit | ✓ | ✓ | ✓ | – | – | ✓ | `[UNTESTED]` |

**Ready:** 2 / 4 &nbsp; **Untested:** 2 / 4 &nbsp; **Incomplete:** 0 / 4 &nbsp; **Broken:** 0 / 4

**Audit actions required:**
- Verify invocation of `showcase-presenter`: run a real showcase and confirm output matches SKILL.md
- Verify invocation of `seo-article-audit`: run against a real article URL and confirm scoring
-->
