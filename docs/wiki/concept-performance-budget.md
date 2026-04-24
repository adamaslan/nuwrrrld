---
date: 2026-04-23
type: concept
tags: [performance, memory, fps, mobile, optimization]
sources: [raw/OPTIMIZATION_OVERVIEW.md, raw/ENVIRONMENT_OPTIMIZATION_GUIDE.md, raw/DETAIL_OPTIMIZATION_THEORIES.md]
---

# Concept: Performance Budget

## The Pattern

Every rendering decision in NUWRRRLD is measured against explicit targets. The performance budget is not aspirational — it is the constraint that drives architecture. When the memory budget was exceeded (2+ GB), the resource pool system was introduced. When the geometry budget was exceeded (40+ per frame), InstancedMesh was chosen for windows. The budget makes trade-offs legible: bloom is expensive, but it is the budget line item the team chose to keep; per-component geometry creation was a budget line item that was cut.

**Current state vs. targets:**

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Memory | 2+ GB | 400–600 MB | ~70% reduction needed |
| FPS | 30–50 (unstable) | 60 stable | significant |
| Geometries/frame | 40+ | 8 (pooled) | 5× reduction needed |
| Materials/frame | 100+ | 15–20 (pooled) | 5–7× reduction needed |
| Draw calls (windows) | 960 | 1 (InstancedMesh) | 960× reduction |

## Where It Appears

- **[[entity-pools]]** — the primary mechanism for hitting the memory and geometry targets
- **[[entity-ships]]** — 16 ships are the largest contributor to geometry count
- **[[entity-buildings]]** — 960 windows are the largest contributor to draw calls
- **[[entity-scene]]** — renderer settings (pixel ratio cap, shadow map toggle) are budget decisions
- **[[concept-resource-pooling]]** — the implementation pattern that bridges current state to target
- **[[concept-cyberpunk-aesthetic]]** — bloom is the primary aesthetic feature that costs budget

## Why Explicit Targets Matter

Without targets, optimization is subjective. "Feels slow" is not actionable. "Currently 2+ GB, target 400–600 MB, pool geometry to reduce by 5×" is. The targets also communicate priority: hitting 60 FPS matters more than adding more ship detail, because the primary audience is mobile users.

The portrait-first mobile design (see [[decision-portrait-first-design]]) makes the performance budget especially constraining — mobile GPUs have significantly less fill rate, memory bandwidth, and compute than desktop, so the budget must be achievable on a mid-range phone.

## Contradictions / Tensions

**Aesthetic vs. performance**: The cyberpunk aesthetic (bloom, 11+ lights, chromatic aberration, 16 ships, 16 buildings) is fundamentally at odds with mobile performance targets. Every visual richness decision costs budget. The resolution is to optimize the *implementation* (pool geometry, use InstancedMesh) rather than reduce the *design* (fewer ships, simpler buildings).

**Capital ships at 9x**: A 9x capital ship has 64–128+ geometry parts. Even with pooling, a capital ship costs significantly more than a 1x shuttle. Adding multiple capital ships to the fleet while maintaining the budget requires either LOD (Level of Detail — switching to simplified geometry at distance) or strict limits on capital ship count.

**LOD system not yet implemented**: LOD is the most impactful remaining optimization. Distant ships could render as simple box shapes while close ships render fully detailed. As of 2026-04-23, LOD is planned but not implemented.

> ❓ Open question: What is the FPS on a mid-range phone (e.g., iPhone 12, Pixel 6) with the current implementation? The budget targets assume mobile, but no mobile benchmark is recorded.

## See Also

- [[entity-pools]] — primary mechanism for memory reduction
- [[concept-resource-pooling]] — pooling implementation strategy
- [[concept-cyberpunk-aesthetic]] — the primary source of budget pressure
- [[decision-resource-pool-pattern]] — why the pool architecture was chosen
- [[decision-portrait-first-design]] — why mobile is the primary target
