---
date: 2026-04-23
type: concept
tags: [pooling, geometry, materials, instancing, memory]
sources: [raw/OPTIMIZATION_OVERVIEW.md, raw/ENVIRONMENT_OPTIMIZATION_GUIDE.md]
---

# Concept: Resource Pooling

## The Pattern

Geometry and material objects in Three.js are expensive to create and must be manually disposed to avoid memory leaks. Resource pooling creates these objects once, stores them in a keyed cache, and provides them to all components that need them. Components do not create their own resources — they request them from the pool by key and receive a shared instance.

This is implemented via `GeometryPool.ts` (geometries keyed by type+size), `MaterialPool.ts` (materials keyed by color+properties), and `PoolContext.tsx` (React context making the pools available tree-wide).

The most impactful specific application: `InstancedMesh` for the 960 building windows — all instances rendered in one draw call with a per-instance matrix (position/rotation/scale).

## Where It Appears

- **[[entity-pools]]** — the physical implementation
- **[[entity-ships]]** — ship geometry and material consumption from pools
- **[[entity-buildings]]** — InstancedMesh for windows; material variants from pool
- **[[entity-scene]]** — PoolContext provider wraps the entire scene tree

## Why It Exists

Without pooling, every React component that renders a ship or building calls `new BoxGeometry(...)`, `new MeshStandardMaterial(...)`, etc. In a 60 FPS animation loop, each re-render potentially triggers creation of new objects. 16 ships × 8 geometry objects each = 128 geometry objects; 16 buildings × 4 material slots = 64 material instances. Multiply by re-renders and you reach 2+ GB and 40+ geometries per frame.

Pooling collapses this: the same geometry object is shared across all ships of the same type. The same material object is shared across all surfaces of the same color. Object creation happens once at pool initialization, not on every render.

## Contradictions / Tensions

**Shared state complexity**: Pools introduce shared mutable state into the component tree. Two components that reference the same geometry from the pool must not mutate it (e.g., by calling `.dispose()` or changing properties directly). This requires discipline — accidental mutation would affect all consumers.

**React lifecycle vs. pool lifecycle**: React components mount and unmount; Three.js resources should be disposed when no longer needed. With per-component resources, disposal is natural (cleanup in `useEffect`). With pooled resources, disposal is complex — the pool must know when the last consumer unmounts before disposing. If disposal is not handled correctly, pools either leak (never disposed) or cause errors (disposed while still in use).

**Cache invalidation**: Pools cache by key (e.g., `'box-1x1x1'`, `'cyan-standard'`). When configuration changes (e.g., a ship changes color), the old material stays in the pool under the old key. The component must request the new key. If the key-generation logic is wrong, components may use stale cached resources.

> ❓ Open question: How does the current PoolContext handle component unmount? Does it track reference counts per pooled resource?

## See Also

- [[entity-pools]] — the physical implementation of GeometryPool, MaterialPool, PoolContext
- [[concept-performance-budget]] — the target metrics that resource pooling is designed to hit
- [[entity-ships]] — primary geometry pool consumer
- [[entity-buildings]] — primary InstancedMesh consumer
- [[decision-resource-pool-pattern]] — recorded decision explaining why this architecture was chosen
