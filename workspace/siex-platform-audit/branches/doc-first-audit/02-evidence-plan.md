# Evidence plan - doc-first-audit

Tag each claim/source/assumption with an evidence class:
`[OBSERVED]`, `[DERIVED]`, `[ASSUMED]`, `[OPEN-RISK]`.

## Claims to verify
- [ASSUMED] Each [KEY] file listed in arch doc v2.1.0 still exists at the claimed path and has implementation (not scaffold). Check: file present + has docstring + >=1 non-trivial class/function body.
- [ASSUMED] Each of the 5 domain transformers (seo, medical, legal, financial, creative) runs in isolation. Check: import succeeds, sample call produces non-placeholder output.
- [ASSUMED] The "5 probe" subsystem Robin named is locatable in the codebase by grep. Check: search for "probe" + "5" proximity; cross-reference with pipeline files.
- [ASSUMED] Bacowr consumes SIE-X via copied files (fragment-import). Check: grep Bacowr repo for `from sie_x` imports AND for filenames matching SIE-X files.
- [ASSUMED] `core/test_core.py` passes on SIE-X master today. Check: run it.
- [ASSUMED] The 8 known issues in arch doc are still open. Check: spot-verify each (e.g., look for `.env` presence, Dockerfile presence, test file count).
- [ASSUMED] The "several versions" of SIE-X Robin mentioned are accessible. Check: Robin must name their locations — this is data only he has.
- [ASSUMED] Edge assets beyond xai.py have real depth. Check: sample `multilingual/engine.py`, `federated/*`, `automl/*`, `testing/*`, `training/*` for docstrings + implementation bodies.
- [ASSUMED] `prompts/writer_prompt.md` + `integrations/bacowr_adapter.py` form a working pair with smart_constraints JSON. Check: read both, confirm JSON schema match at the `smart_constraints` contract.

## Evidence sources
- [OBSERVED] `D:/sie_x/` directory — direct code reading, primary source.
- [OBSERVED] `D:/sie_x/FULL_SYSTEM_ARCHITECTURE.txt` v2.1.0 — architectural claims to verify against code.
- [OBSERVED] `D:/sie_x/arcitechture.txt` — legacy internal data-flow notes, secondary source.
- [OBSERVED] Bacowr repo (path TBD from Robin) — comparison target for drift analysis.
- [OBSERVED] `core/test_core.py` — executable evidence of core health.
- [OBSERVED] Robin's direct answers (case 01 Known facts) — verified statements from the author.
- [ASSUMED] Git log on D:/sie_x/ if a git repo exists there — authorship and change history.

## Gaps and assumptions
- [ASSUMED] Read access to Bacowr's repo is granted on a path Robin can share. Without it, drift report cannot be produced from evidence — only from arch doc.
- [ASSUMED] Robin can name the "several versions" of SIE-X. Without that, the drift report cannot address intra-SIE-X drift.
- [OPEN-RISK] If SIE-X's core/test_core.py is broken on master, Bacowr is running on Bacowr's MERGED copy of core — meaning the "working" system is not SIE-X master. The audit scope then changes to "audit Bacowr's merged copy as the de-facto master."
- [OPEN-RISK] Some files may have grown past the arch doc's v2.1.0 snapshot; others may have been deleted. Arch doc is 2 months stale; change since then is unknown until spot-checked.
- [ASSUMED] The fresh-LLM-probe test is valid as a proxy for "LLM-readable" — nothing guarantees the probe's LLM and Robin's next LLM have comparable onboarding ability. First run accepts this; later runs may need multiple probe models.

## Required checks
- **Baseline check** (run before any audit work): `cd D:/sie_x && python -m pytest core/test_core.py -x` — record pass/fail. If fail, audit scope pivots.
- **File-existence check**: for every file named in arch doc's Complete File Index, verify the path exists and collect LOC. Output: one-column table `path | exists | LOC | has_docstring`.
- **Depth spot-check**: for each of 20 directory types (core, transformers, api, auth, integrations, sdk, orchestration, streaming, multilingual, chunking, cache, explainability, audit, automl, training, federated, plugins, monitoring, testing, agents), sample 1 file. For each: scaffold or substance? Status goes into capability-map.
- **Transformer end-to-end check**: import each of 5 transformers in isolation, call the primary method with a trivial input, record result type + first 100 chars of output. Flag any that throw, return None, or return placeholders.
- **Bacowr grep check**: grep Bacowr for `from sie_x`, for `import sie_x`, for filenames `engine.py`, `extractors.py`, etc. Build table of what Bacowr imports vs copies.
- **Drift measurement**: for each SIE-X file Bacowr has a copy of, run `diff` — count lines changed. Categorize: identical / minor (<20 lines) / major (≥20 lines) / diverged (>50%).
- **Five-probe hunt**: grep the codebase for "probe", "5", "five"; Robin to clarify if unclear; if no file surfaces, declare unresolvable from code alone in `five-probe-report.md`.
- **Fresh-LLM probe**: after first SKILL.md draft, spawn a fresh Claude Code session with SKILL.md + capability-map + gap-list + code-read access, 60-minute timer, task = "propose one new adapter (non-SEO, non-medical, non-legal, non-financial, non-creative — something novel)." Record outcome with artifacts.
- **Bacowr continuity**: during the audit window, ensure at least one Bacowr content production run completes successfully; record before/after rates.
