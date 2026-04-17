# Writer E2E Proof — Results

Run at: 2026-04-15T08:00:00+00:00
Script: `D:/sie_x/writer_e2e_proof.py`

---

## Step 1 — MockEngine (15 diverse keywords)

- OK: MockEngine created — 15 keywords across types: CONCEPT, FIELD, LOC, METHOD, ORG, PERSON, PRODUCT, STAT, TECHNOLOGY, TOOL

## Step 2 — Pipeline: ExtractStep(mock) → ExportStep

- OK: Pipeline built: Pipeline(name='writer-e2e', steps=2)
- OK: Pipeline validation passed

## Step 3 — Run pipeline

- OK: Pipeline ran successfully — 15 keywords in result

## Step 4 — WriterAdapter: all three genres

**guest-post**
- Domain: `writer-guest-post`
- Constraint keys: 10
- Rendered prompt: 3286 chars
- First section: "Hook"
- Structural sections: 6

**long-form-essay**
- Domain: `writer-long-form-essay`
- Constraint keys: 10
- Rendered prompt: 3455 chars
- First section: "Opening"
- Structural sections: 6

**product-announcement**
- Domain: `writer-product-announcement`
- Constraint keys: 10
- Rendered prompt: 3099 chars
- First section: "Lead"
- Structural sections: 5

## Step 5 — AdapterRegistry.list_domains()

- Total domains: 4
- All domains: ['content-writing', 'writer-guest-post', 'writer-long-form-essay', 'writer-product-announcement']
- All 3 writer-* domains registered

---

## Result

```
RESULT: PASS  (22/22 checks passed)
```

All checks passed. WriterAdapter is functional across all three genres.
