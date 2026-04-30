# Build vs. Buy vs. Hybrid

> **When to read this:** During Step 3 (PLAN) when a DIAGNOSE finding reveals a
> dependency gap — a missing library, service, or tool — and you need to decide
> whether to build a custom solution, adopt an existing one, or combine both.

---

## Decision Table

| Signal | Choose | Rationale |
|--------|--------|-----------|
| A standard library covers the need with < 1 day of integration | Buy | Adoption cost is far lower than build cost |
| The need is tightly coupled to proprietary business logic | Build | No off-the-shelf tool can model your domain |
| A standard tool exists but needs project-specific config | Hybrid | Use the tool, write the config layer |
| The team already uses a competing tool that covers this need | Buy (reuse) | Consolidation reduces maintenance surface |
| The gap is a security-critical component (auth, crypto) | Buy | Rolling your own auth/crypto is a known risk pattern |
| The need is a one-time data migration | Build (script) | A standalone script is faster than integrating a tool |
| The tool would become a hard runtime dependency | Buy only if actively maintained | Abandoned dependencies become future rescue targets |

---

## Decision Process

Apply in order. Stop at the first matching branch.

```
1. Is this a security-critical component (auth, crypto, secret management)?
   → Buy. Do not build. Use an established library.

2. Does a maintained, well-documented library exist for this exact need?
   → Buy. Check: npm/PyPI/crates.io stars > 500, last commit < 6 months.

3. Does the need require project-specific logic that a library cannot express?
   → Build. Keep it narrow — solve only the stated problem.

4. Does a library solve 80% of the need but requires project-specific config?
   → Hybrid. Install the library; write a thin config/adapter layer.

5. Unclear?
   → Default to Buy. You can always replace a library with custom code later.
      Replacing custom code with a library means rewriting + migration.
```

---

## Common Dependency Gaps in Rescued Repos

| Gap type | Typical resolution | Notes |
|----------|-------------------|-------|
| HTTP client missing | Buy (`axios`, `reqwest`, `httpx`) | Do not reimplement HTTP |
| Auth / session management | Buy (`passport`, `jsonwebtoken`, `django-allauth`) | Never roll your own auth |
| Database ORM / query builder | Buy (`prisma`, `sqlalchemy`, `diesel`) | Raw SQL is fine for simple cases |
| Environment variable loading | Buy (`dotenv`) | 3 lines of code; still worth the library for `.env.example` discipline |
| Logging | Buy or Hybrid | Buy the library; configure output format as hybrid |
| Validation / schema | Buy (`zod`, `pydantic`, `serde`) | Schema validation is infrastructure, not business logic |
| CI pipeline | Hybrid | Use GitHub Actions / GitLab CI (buy); write workflow YAML (build config) |
| Secret management | Buy (env vars + vault) | Never store secrets in source; vault only if rotation is needed |
| Test runner | Buy (`jest`, `pytest`, `cargo test`) | Test infrastructure is not differentiating |

---

## Worked Examples

### Example: Missing HTTP Client (Node.js repo)

**Context:** A Node.js API client has `fetch` calls that fail in Node 16 because
the native `fetch` API was not available. The DIAGNOSE phase found `ReferenceError:
fetch is not defined`.

**Input:** Node 16, plain `fetch()` calls, no HTTP library installed.

**Decision:** Buy — `axios` or `node-fetch` is the standard resolution. The need is
pure HTTP; there is no proprietary logic. Choose `node-fetch` to stay closest to the
Web Fetch API the code already uses.

**Output:**
```bash
npm install node-fetch
```
Update imports: `const fetch = require('node-fetch')` or add `"type": "module"` and
use native `import fetch from 'node-fetch'`. Tier: Day 1 (build-blocking).

---

### Example: Auth Rolled Manually (Python repo)

**Context:** A Flask app implements its own session token generation using `random.uuid4()`
and stores tokens in a plain dict in memory. No expiry, no signing.

**Input:** Homegrown auth, no `flask-login` or JWT library.

**Decision:** Hybrid — the existing routes can stay; replace the session logic with
`flask-login` (buy) + configure it to the app's user model (build config layer).
Rolling crypto with `uuid4` is a security anti-pattern (not cryptographically random
enough for session tokens).

**Output:** Week 1 item (architectural, not a quick fix). Flag as High severity.
Add to action plan: "Replace manual session tokens with `flask-login` + `itsdangerous`."

---

### Example: No CI (Any repo)

**Context:** No `.github/workflows/` directory exists. Builds are manual.

**Input:** No CI. Build works locally.

**Decision:** Hybrid — use GitHub Actions (buy the platform); write the workflow YAML
(build the config). The workflow is project-specific; the CI system is not.

**Output:** Day 1 item. Use the minimal CI template in
[`references/anti-patterns.md`](anti-patterns.md#minimal-ci-template-github-actions).

---

## Anti-Patterns

| Do NOT | Instead |
|--------|---------|
| Build a library wrapper "for flexibility" | Use the library directly until a real constraint emerges |
| Delay a Buy decision because "we might need custom X later" | Buy now, migrate later if the need materializes |
| Choose a library based on familiarity alone | Check maintenance status — abandoned libs become rescue targets |
| Classify a security-critical component as "Build" | Security infrastructure is always Buy |

---

## Related

- [SKILL.md](../SKILL.md) — Parent skill; build-vs-buy is referenced in Step 3 (PLAN)
- [anti-patterns.md](anti-patterns.md) — Fix procedures; many dependency gaps have standard resolutions there
- [diagnostic-checklist.md](diagnostic-checklist.md) — Where dependency gaps are first detected
