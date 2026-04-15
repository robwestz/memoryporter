# Branch Catalog

Use these standard path types after the core workflow. Always keep the user wording, but map each path to the closest standard pattern.

## 1. Upgrade existing system

Use when the repo should remain the product nucleus and the goal is better output, better consistency, lower risk, or better maintainability.

Focus:

- preserve constraints that already carry value
- locate brittle points
- propose targeted changes before wholesale rewrites

## 2. Extract reusable subsystem

Use when one part of the repo is valuable outside the original system.

Focus:

- isolate boundaries
- define dependencies that must move with the subsystem
- prevent accidental coupling to the rest of the repo

## 3. Build adjacent or precursor system

Use when the best next step lives before or beside the current repo, for example planning, orchestration, or intake.

Focus:

- define how the new layer feeds the existing repo
- clarify which insights the upstream layer must produce
- prevent overlap with the existing execution layer

## 4. Specialize an existing capability

Use when one capability should become much deeper or more domain-specific while still depending on the repo foundation.

Focus:

- name the specialization boundary
- state what remains shared with the base system
- state what new assets or checks the specialization needs

## 5. Research spike

Use when the right path is not yet implementation-ready.

Focus:

- define the uncertainty being reduced
- keep scope narrow
- require an explicit go or no-go criterion

## 6. Custom path

Use when the user defines a path that does not fit the defaults exactly.

Adaptation rule:

1. Keep the user label.
2. Map it to the closest standard pattern.
3. Reuse the same branch artifacts.
4. State what is custom and what remains standard.
