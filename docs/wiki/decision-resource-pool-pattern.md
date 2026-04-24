---
date: 2026-04-23
type: decision
tags: [decision, pools, performance, memory, architecture]
sources: [raw/OPTIMIZATION_OVERVIEW.md, raw/ENVIRONMENT_OPTIMIZATION_GUIDE.md]
---

# Decision: Centralized Resource Pool Pattern

## Decision

Centralize Three.js geometry and material object creation in shared pools (GeometryPool, MaterialPool) accessed via React context (PoolContext), rather than creating resources per-component or per-ship/building.

## Date

Optimization phase, after memory hit 2+ GB (prior to 2026-04-23).

## Context

Memory usage had reached 2+ GB with unstable 30–50 FPS. Profiling revealed the cause: every ship and building component created its own Three.js geometry and material objects. With 16 ships × 8 geometry objects each, and 16 buildings × 4 material slots each, plus re-creation on re-renders, the scene was generating 40+ geometries and 100+ materials per frame.

Three.js objects created in JavaScript are not garbage-collected automatically — they must be manually disposed by calling `.dispose()`. Without explicit disposal, abandoned objects accumulate in GPU memory. Per-component creation without strict disposal tracking was the root cause of the memory leak.

## Alternatives Considered

**A — Per-component `useMemo`**: Each component wraps its geometry/material creation in `useMemo`. Prevents re-creation on re-renders but still produces N copies for N ships of the same type. 16 ships using the same hull geometry = 16 identical geometry objects = 16× the memory. Partial improvement, not sufficient.

**B — Module-level singletons**: Create geometry and material objects as module-level constants (outside React). Simple, deterministic. Rejected because: module-level objects persist for the entire browser session (no cleanup), break React's lifecycle model (can't respond to config changes), and cannot be garbage-collected even when the scene unmounts.

**C — InstancedMesh only**: Three.js InstancedMesh renders N copies of the same geometry in one draw call. Perfect for the 960 building windows. But ships have varied geometry (procedurally generated, different per type) — InstancedMesh only works when all instances share the exact same geometry. Cannot replace a geometry pool for ships.

**D — Chosen: Centralized pools via React context**: GeometryPool and MaterialPool create objects on first request and cache by key. PoolContext provides them tree-wide. InstancedMesh used specifically for building windows. This handles both use cases: shared geometry for identical-geometry elements (windows) and pooled variants for procedurally generated elements (ships).

## Consequences

**What this enables:**
- 70% memory reduction (target: 400–600 MB from 2+ GB)
- Single disposal point — pools manage their own cleanup when context unmounts
- Configuration-driven caching — same geometry key = same object
- InstancedMesh for 960 windows = 1 draw call instead of 960

**What this rules out:**
- Simple per-component resource creation (adds complexity to all ship/building components)
- Components must accept pool context rather than creating their own resources
- Pool invalidation on config change requires explicit cache-busting logic
- PoolContext must be correctly placed as an ancestor of all consumers (architectural constraint)

## Validated By

Pool implementation is in progress as of 2026-04-23. The target metrics (400–600 MB, 60 FPS stable) have not yet been validated against production measurements.

> ❓ Open question: What is the measured memory after pool implementation? This decision should be validated with a before/after profiling comparison.

## See Also

- [[concept-resource-pooling]] — the design pattern this decision created
- [[concept-performance-budget]] — the targets driving this decision
- [[entity-pools]] — the implementation
- [[entity-ships]] — primary consumer
- [[entity-buildings]] — InstancedMesh consumer for windows
