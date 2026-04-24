---
date: 2026-04-23
type: decision
tags: [decision, seeded-random, procedural, performance, determinism]
sources: [raw/OPTIMIZATION_OVERVIEW.md]
---

# Decision: Seeded PRNG for All Procedural Generation

## Decision

Use a seeded pseudo-random number generator (PRNG) for all procedural generation of ships and buildings, so that identical geometry is produced on every render, on every device, indefinitely.

## Date

Early development (prior to 2026-04-23).

## Context

Ships and buildings are generated procedurally at runtime. Three options existed for randomness:

The core problem: Three.js geometry creation is expensive. Any approach that produces *different* geometry on different renders triggers re-creation of geometry objects on every render (or every page load), which causes memory churn, geometry leaks, and unstable FPS. The project was already hitting memory issues; adding geometry churn would compound them.

Additionally, visual consistency matters for a portfolio showcase. Users who share a link or revisit the site should see the same scene. A different arrangement of ships and buildings on every visit is jarring.

## Alternatives Considered

**A — `Math.random()` directly**: Produces different values on every call. Every re-render produces different geometry decisions → different geometry objects created → geometry churn → memory leak. Eliminated immediately.

**B — Hand-authored 3D models**: Pre-made `.glb`/`.gltf` files for each ship and building. No randomness needed — determinism is guaranteed by the file. Rejected because:
- Requires a 3D artist for 16+ unique ships and 16+ unique buildings
- Inflexible: changing ship type or proportions requires re-authoring the model
- Binary assets in git have poor diff/merge properties
- Large asset bundle increases page load time

**C — Pre-computed and committed geometry data**: Run the generator once, commit the output as JSON, load at runtime. More flexible than hand-authored assets but still requires a re-commit whenever the algorithm or configuration changes. Also: the JSON would be large and unreadable.

**D — Chosen: Seeded PRNG**: A pure function `seededRandom(seed) → [0,1)` that produces the same sequence for the same seed. Geometry generation calls this function; same seed → same geometry → same visual → no churn. Seeds are configuration values assigned per-ship and per-building.

## Consequences

**What this enables:**
- 16 unique ships and 16 unique buildings from code, no 3D artist required
- Geometry computed once, `useMemo`-cached, no per-frame re-creation
- Visual consistency across reloads, devices, and browsers
- Configuration-driven: changing a seed changes one ship, not all

**What this rules out:**
- Per-session variety (the scene is always the same)
- Easy artistic iteration: changing the generation algorithm globally changes all ships and buildings
- Transparent design: the seed-to-shape relationship is opaque without running the generator

## Validated By

The 16-ship fleet and 16-building city have operated stably with seeded generation. No geometry churn issues have been recorded post-implementation. The boundary wrap bug (see [[architecture-animation-systems]]) was a separate animation issue, not a seeded-random issue.

## See Also

- [[concept-seeded-random]] — the mechanics of the seeded PRNG
- [[concept-procedural-generation]] — the broader pattern this supports
- [[entity-ships]] — primary consumer
- [[entity-buildings]] — secondary consumer
