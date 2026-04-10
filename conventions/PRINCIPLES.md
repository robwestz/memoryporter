# Principles — default stance for agentic repos

Use this when the project has not yet written its own architecture doctrine.

## Optimize for

- **Clarity** over cleverness  
- **Inspectability** over magic (explicit logs, reproducible steps)  
- **Explicit policy** over hidden heuristics (permissions, tool allowlists)  
- **Staged rollout** over grand architecture  
- **Durable behavior** over one-shot demos  

Assume the operator must still understand the system **six months later**.

## Solo / small-team defaults

1. **One orchestrator** until parallel agents are proven necessary.  
2. **One source of truth** for capabilities and policies (config or registry).  
3. **Separate metadata from execution** (declared tools vs. handlers).  
4. **Side effects behind gates** (approval, permission mode, sandbox).  
5. **Workflow state** is a system concern (persist, resume, idempotency when tasks are long).  
6. **Memory: small, scoped, provenance-aware** (what was inferred vs. observed).  
7. **Evaluation before scale** — a few solid scenarios beat many flaky ones.  

## Complexity ladder (add only when needed)

| Level | When | Add |
|-------|------|-----|
| Lean | Short request–response tasks | Orchestrator, capability list, permission rules, basic logging |
| Durable | Waits, retries, human approval, crashes | State machine, idempotency, resumability, retry policy |
| Extensible | Many teams or third-party tools | Plugins/hooks, stable extension boundaries, versioning |

## Anti-patterns to challenge

- Tool sprawl without a single registry  
- Silent auto-approval of destructive actions  
- Unbounded context / memory growth  
- “We’ll add tests later” for agent behavior  

## Good outputs

- Named **assumptions** and **unverified** items  
- **Verifiable** steps (commands, file paths)  
- **Smallest** change that satisfies the constraint  
