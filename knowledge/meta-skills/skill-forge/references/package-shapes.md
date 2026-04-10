# Package Shapes — Decision Tree and File Manifests

> **When to read this:** During CLASSIFY, when the decision tree in SKILL.md needs more context.

---

## The Four Shapes

Every skill package is one of four shapes. The shape determines which files exist,
how much structure the agent gets, and what distribution channels are available.

| Shape | Files | Target audience | Maintenance cost |
|-------|-------|-----------------|-----------------|
| **Minimal** | SKILL.md only | Author or tight team | Very low |
| **Standard** | SKILL.md + README.md + metadata.json | Shared across projects | Low |
| **Full** | Standard + templates/ + examples/ + references/ | Marketplace or community | Medium |
| **Production** | Full + scripts/ + assets/ + evals/ | Automated pipelines | High |

---

## Decision Tree

Start at the top. Follow the first branch that matches.

```
Does the skill automate mechanical steps with code (scripts, transforms, pipelines)?
│
├─ YES → Does it produce visual or testable output?
│        │
│        ├─ YES → PRODUCTION
│        │        (scripts/, assets/, evals/ needed)
│        │
│        └─ NO  → FULL with scripts/ added
│                  (not full Production — no evals or assets)
│
└─ NO  → Does the skill generate structured output from templates?
         │
         ├─ YES → FULL
         │        (templates/, examples/, references/ needed)
         │
         └─ NO  → Will anyone besides the original author use this skill?
                   │
                   ├─ YES → STANDARD
                   │        (README + metadata for discoverability)
                   │
                   └─ NO  → Is the domain narrow and well-understood?
                            │
                            ├─ YES → MINIMAL
                            │        (SKILL.md is self-contained)
                            │
                            └─ NO  → STANDARD
                                     (default — you can promote later)
```

---

## Signal Table

Use this table when the decision tree is ambiguous. Match the skill's behavior
to the strongest signal.

| If the skill does this... | Shape | Reason |
|---------------------------|-------|--------|
| Follows a single checklist with no generated output | Minimal | No templates, no distribution need |
| Encodes an expert's decision-making process | Standard | Needs README for onboarding |
| Produces documents, configs, or files from a template | Full | Templates + examples required |
| Has multiple output variants based on input type | Full | Decision tables + references needed |
| Runs Python/Bash scripts as part of the workflow | Production | Code handles deterministic steps |
| Requires evals or A/B testing to validate output | Production | evals/ directory needed |
| Generates visual artifacts (charts, diagrams, UI) | Production | assets/ directory needed |
| Is a meta-skill (creates other skills) | Full or Production | References + examples essential |
| Wraps an external API or service | Standard | Simple interface, needs install docs |
| Applies a single rule across many file types | Minimal | One rule, no templates |
| Produces structured data (JSON, YAML, CSV) | Full | Schema templates + worked examples |
| Requires domain-specific knowledge base | Full | references/ for domain deep-dives |

---

## File Manifest by Shape

### Minimal

```
skill-name/
└── SKILL.md              # Everything in one file
```

**SKILL.md requirements:**
- Valid YAML frontmatter (name, description, author, version)
- Complete workflow in the body (no external references needed)
- Under 500 lines
- Self-contained: a reader needs nothing else

### Standard

```
skill-name/
├── SKILL.md              # Core workflow and decision logic
├── README.md             # Installation, triggers, expected outcome
└── metadata.json         # Machine-readable index entry
```

**Additional requirements over Minimal:**
- README.md with all 9 required sections (see SKILL.md Step 4.2)
- metadata.json with all required fields
- `name` in metadata.json matches `name` in SKILL.md frontmatter exactly

### Full

```
skill-name/
├── SKILL.md              # Core workflow — max 500 lines
├── README.md             # Installation and trigger guide
├── metadata.json         # Machine-readable index
├── templates/            # Output templates with Fixed/Variable zones
│   └── [template-name].md
├── examples/             # At least one complete worked example
│   └── [example-name]/
│       └── ...           # Full output as if the skill ran
└── references/           # Deep-dive sub-topics
    └── [topic].md        # Each starts with "When to read this:"
```

**Additional requirements over Standard:**
- At least one template with Fixed/Variable annotations
- At least one worked example that passes the quality gate
- References extracted when any section exceeds 30 lines of specialized content
- SKILL.md stays under 500 lines by delegating depth to references/

### Production

```
skill-name/
├── SKILL.md              # Core workflow — max 500 lines
├── README.md             # Installation, triggers, dependencies
├── metadata.json         # Machine-readable index
├── templates/            # Output templates
│   └── [template-name].md
├── examples/             # Complete worked examples
│   └── [example-name]/
├── references/           # Deep-dive documents
│   └── [topic].md
├── scripts/              # Executable automation
│   ├── [script].py       # Standalone, documented, parameterized
│   └── [script].sh
├── assets/               # Static resources (images, schemas, configs)
│   └── [asset]
└── evals/                # Test definitions
    └── evals.json        # Structured test cases
```

**Additional requirements over Full:**
- Scripts execute standalone (no SKILL.md context required)
- Scripts accept inputs as arguments, not hardcoded values
- evals.json defines at least 3 test cases with input/expected-output pairs
- assets/ contains only static resources (no generated output)

---

## Real Skill Examples by Shape

### Minimal — `brand-guidelines`

A checklist for reviewing text against brand voice. No templates, no generated
output. The skill IS the checklist.

```
brand-guidelines/
└── SKILL.md    (120 lines: frontmatter + voice rules + do/don't table)
```

Why Minimal: the output is a judgment (pass/fail), not a generated artifact.

### Minimal — `code-review-checklist`

A structured review procedure. The agent reads code and checks items.

```
code-review-checklist/
└── SKILL.md    (90 lines: frontmatter + checklist + severity table)
```

Why Minimal: single-purpose, no installation needed, author-only use.

### Standard — `deal-memo-drafting`

Drafts deal memos from term sheets. Shared across a legal team. Needs
installation docs and trigger conditions, but the output format is flexible
enough to not require templates.

```
deal-memo-drafting/
├── SKILL.md        (280 lines: workflow + decision tables + anti-patterns)
├── README.md       (triggers, prerequisites, installation)
└── metadata.json   (tags: legal, deal-memo, drafting)
```

Why Standard: multiple users need onboarding, but output structure varies
enough that rigid templates would hinder more than help.

### Standard — `panning-for-gold`

Extracts key insights from long documents. Shared tool with clear triggers.

```
panning-for-gold/
├── SKILL.md        (200 lines: extraction rules + output format + examples)
├── README.md       (what it does, when to trigger, expected output)
└── metadata.json   (tags: extraction, analysis, summarization)
```

Why Standard: the output is flexible prose, not templated structure.

### Full — `kb-document-factory`

Generates knowledge base documents from source material. Multiple output types
(how-to, reference, troubleshooting). Each type has a template.

```
kb-document-factory/
├── SKILL.md
├── README.md
├── metadata.json
├── templates/
│   ├── how-to.md
│   ├── reference.md
│   └── troubleshooting.md
├── examples/
│   └── api-authentication/
│       ├── how-to.md          (complete worked output)
│       └── troubleshooting.md (complete worked output)
└── references/
    └── document-types.md      (deep-dive on when to use each type)
```

Why Full: structured output from templates, multiple variants, needs examples
to show what "good" looks like.

### Production — `data-pipeline-builder`

Generates data transformation pipelines with validation scripts and test suites.

```
data-pipeline-builder/
├── SKILL.md
├── README.md
├── metadata.json
├── templates/
│   └── pipeline-config.yaml
├── examples/
│   └── csv-to-json/
├── references/
│   └── transform-catalog.md
├── scripts/
│   ├── validate_pipeline.py
│   └── run_transform.sh
├── assets/
│   └── schema.json
└── evals/
    └── evals.json
```

Why Production: deterministic steps (validation, transformation) are better as
code than prose. Evals verify the pipeline output is correct.

---

## Disambiguation: When Two Shapes Seem Right

### Minimal vs Standard

| Signal | Choose |
|--------|--------|
| Only you will use this skill | Minimal |
| A teammate will install this skill | Standard |
| The skill needs trigger documentation | Standard |
| The skill is a personal checklist | Minimal |
| You want it findable via search tags | Standard |

**Rule of thumb:** If you need a README, it is Standard.

### Standard vs Full

| Signal | Choose |
|--------|--------|
| Output structure varies every time | Standard |
| Output has a predictable skeleton | Full |
| The skill generates files or documents | Full |
| The skill is a decision-making procedure | Standard |
| Multiple output variants exist | Full |
| Users ask "what does good output look like?" | Full (add examples/) |

**Rule of thumb:** If the skill's output has Fixed zones, it needs templates. Templates mean Full.

### Full vs Production

| Signal | Choose |
|--------|--------|
| All steps are prose-described for the agent | Full |
| Some steps are mechanical and error-prone | Production (automate them) |
| Output correctness is subjective | Full |
| Output correctness is objectively testable | Production (add evals/) |
| The skill generates code or data | Production |
| The skill generates documents or plans | Full |

**Rule of thumb:** If a step is purely mechanical (no judgment needed), automate
it in scripts/ and use Production.

---

## Promotion Path

Skills grow. A Minimal skill that gets shared becomes Standard. A Standard skill
whose users ask for examples becomes Full. This is normal and expected.

### Minimal to Standard

**When to promote:** Someone besides you needs to use the skill.

**Steps:**
1. Add README.md with the 9 required sections
2. Add metadata.json with all required fields
3. Verify `name` matches across SKILL.md and metadata.json
4. Run the quality gate

**Effort:** 15-30 minutes.

### Standard to Full

**When to promote:** Users ask "what should the output look like?" or the skill
starts generating structured output.

**Steps:**
1. Extract output patterns into templates/ with Fixed/Variable annotations
2. Create at least one complete worked example in examples/
3. Move specialized content (> 30 lines) from SKILL.md into references/
4. Ensure SKILL.md stays under 500 lines
5. Run the quality gate

**Effort:** 1-2 hours.

### Full to Production

**When to promote:** A step in the workflow is purely mechanical and keeps
getting done wrong by agents.

**Steps:**
1. Identify mechanical steps and extract them into scripts/
2. Write evals.json with at least 3 test cases (input + expected output)
3. Add any static resources to assets/
4. Ensure scripts execute standalone with argument-based inputs
5. Update README.md with new dependencies and setup instructions
6. Run the quality gate

**Effort:** 2-4 hours.

### Demotion (rare)

Demoting a skill (e.g., Full to Standard) removes files that users may depend on.
Only demote when:
- The templates/examples are actively misleading
- The skill's scope has narrowed significantly
- No downstream users depend on the removed files

Document the demotion in the skill's changelog or README.
