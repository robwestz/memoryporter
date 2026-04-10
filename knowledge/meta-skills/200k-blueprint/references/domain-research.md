# Domain Research Guide

> **When to read this:** During Step 2 (RESEARCH), when the product domain is unfamiliar.

## Purpose

Structured process for gaining enough domain knowledge to make architecture
decisions. This is NOT deep research — it's a 30-minute sprint to understand
the landscape well enough to blueprint.

## The 4-Area Scan

### Area 1: Competitor Products (10 min)

| Action | Tool | What to capture |
|--------|------|----------------|
| Search "[domain] SaaS" or "[domain] tool" | Web search | Top 3-5 products |
| Visit each product page | Web fetch | Core features, pricing model, tech stack (if visible) |
| Check GitHub | Search | Open-source alternatives, their star count and activity |

**Output:** Competitor table

| Product | Core feature | Pricing | Tech (if known) | Weakness |
|---------|-------------|---------|-----------------|----------|
| ... | ... | ... | ... | ... |

### Area 2: Technical Landscape (10 min)

| Action | What to capture |
|--------|----------------|
| Search "[domain] API" | Available APIs and services |
| Search "[domain] framework" | Existing frameworks/libraries |
| Search "[domain] open source" | Reusable components |
| Check npm/PyPI/crates.io | Package ecosystem |

**Output:** Tech options table

| Need | Options | Maturity | Cost |
|------|---------|----------|------|
| ... | ... | ... | ... |

### Area 3: Common Pitfalls (5 min)

Search: "why [domain] startups fail", "[domain] product post-mortem"

**Output:** 3-5 bullet points of things that go wrong in this domain.

### Area 4: Regulatory / Compliance (5 min)

| Domain | Likely requirements |
|--------|-------------------|
| Health/medical | HIPAA, data encryption, audit logs |
| Finance/payments | PCI DSS, KYC/AML, transaction logs |
| Education | FERPA, COPPA (if children) |
| EU users | GDPR, cookie consent, data portability |
| General SaaS | Terms of Service, Privacy Policy, data deletion |

If none apply, note "No specific regulatory requirements identified."

## Output: Domain Brief

```markdown
## Domain Brief: [Domain Name]

**Key terms:** [domain-specific vocabulary the blueprint will use]

**Existing solutions:**
- [Product A] — [what it does well] — [weakness]
- [Product B] — [what it does well] — [weakness]

**Technical landscape:**
- [Available APIs/services]
- [Relevant frameworks]

**Common pitfalls:**
- [Pitfall 1]
- [Pitfall 2]

**Compliance requirements:** [list or "none identified"]
```

## Anti-patterns

| Do NOT | Instead |
|--------|---------|
| Spend > 30 minutes researching | Time-box. If you need more, the concept is too vague. |
| Deep-dive one competitor | Breadth over depth. You need landscape, not analysis. |
| Skip the pitfalls search | This is the highest-ROI 5 minutes. |
| Assume no compliance needs | Check the table above. Missing GDPR = costly later. |
