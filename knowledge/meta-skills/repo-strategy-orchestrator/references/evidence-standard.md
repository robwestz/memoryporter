# Evidence Standard

This skill is built for repos where non-obvious constraints matter. Do not flatten that complexity.

## Evidence classes

Separate these clearly:

- **Observed fact**: directly confirmed in the repo or provided materials
- **Derived inference**: reasoned from multiple observed facts
- **Assumption**: plausible but not yet verified
- **Open risk**: a failure path that still needs proof or mitigation

## Constraint taxonomy

Use these buckets in the constraint map:

- **Hard constraints**: breaking them invalidates the system or the deliverable
- **Soft constraints**: strong preferences that guide tradeoffs
- **Epistemic constraints**: rules that prevent false confidence or hallucinated understanding
- **Process constraints**: rules about sequence, approvals, or human choices

## Anti-simplification checks

Before recommending anything, ask:

1. What existing safeguard would disappear if this change succeeded locally?
2. Which output looks better in isolation but weakens the global purpose chain?
3. Which assumption is being smuggled in as if it were proven?
4. What would a false positive improvement look like here?

## Requirement for options

Every option in the options matrix must state:

- what it preserves
- what it changes
- what evidence it depends on
- what could break if the option is wrong

## Requirement for branch work

Every branch must include:

- claims to verify
- evidence sources to inspect
- success tests
- failure triggers
- rollback or containment logic
