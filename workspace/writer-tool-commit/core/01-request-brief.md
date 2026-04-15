# Request brief - writer-tool-commit

## Objective
Decide the product scope, first-niche choice, and launch shape for the
writer-tool concept — then feed the decision directly into
project-launcher to compose an autonomous-build workspace.

## Repo target
- Repo hint: docs/night-projects/a/ (blueprint + skill-map + showcase) + docs/night-projects/c/repobrain-launch-package (reusable launch assets)
- Branch or revision: main
- Primary user outcome: Robin has ONE committed product direction with dated exit criteria, not four semi-projects.

## Known facts
- [OBSERVED] Blueprint exists at docs/night-projects/a/blueprint-writer-tool.md: "AI writing tool where skill-templates encode prompting expertise"
- [OBSERVED] User segment in blueprint: content professionals (freelance writers, agencies, marketing teams) who already use AI but produce recognizably AI output
- [OBSERVED] Stack decided in blueprint: Next.js 14 App Router + Supabase + Vercel Edge + Claude API (Sonnet 4.6)
- [OBSERVED] First niche proposed in blueprint: Bacowr-style backlink content (hook + argument + authority + CTA)
- [OBSERVED] 30-day target in blueprint: 3 working skill-templates (reaction piece, long-form essay, product announcement)
- [OBSERVED] Launch-package skill exists from night-project C (landing page, pitch deck, emails, PH listing, social, demo script) — tested on RepoBrain
- [OBSERVED] Writer-tool was tabled 2026-04-10 mid-brainstorm, reactivated as night-project A
- [OBSERVED] Robin has three other semi-products (RepoBrain, Bacowr, code-QA idea); writer-tool is #4 in the portfolio

## Open questions
- [ASSUMED] Content professionals will pay $30-100/mo for "output indistinguishable from human"
- [ASSUMED] Bacowr is the right first niche rather than a generalist tool with niche skills
- [ASSUMED] AI-detection arms race (Originality.ai etc.) is winnable via source-grounding + structural variety
- [OPEN-RISK] Bacowr exists as separate product — does writer-tool cannibalize Bacowr or become its generation engine?
- [OPEN-RISK] The skill-template catalog as moat assumes Robin can author new templates faster than users need them

## Done criteria
- One option chosen from options-matrix with explicit anti-simplification review
- Branch scaffolded for chosen option
- Project-launcher receives: product description, constraints, chosen niche, 30-day exit criteria
- Case saved in cases.jsonl for future reference
