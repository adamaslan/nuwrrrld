---
date: 2026-04-23
type: entity
tags: [pools, performance, memory, geometry, materials]
sources: [raw/OPTIMIZATION_OVERVIEW.md, raw/ENVIRONMENT_OPTIMIZATION_GUIDE.md, raw/DETAIL_OPTIMIZATION_THEORIES.md]
---

# Entity: Pools

## What It Is

The pool system centralizes creation and sharing of Three.js geometry and material objects. Without pooling, each ship and building component creates its own geometry and material instances, leading to 40+ geometries and 100+ materials per frame and 2+ GB of memory. The pool system creates these objects once, stores them, and provides them to all consumers via React context.

## Key Files

| File | Role |
|------|------|
| `components/three/pools/GeometryPool.ts` | Creates and caches geometry objects by type/size key |
| `components/three/pools/MaterialPool.ts` | Creates and caches material objects by color/type key |
| `components/three/pools/PoolContext.tsx` | React context providing GeometryPool + MaterialPool to the component tree |

## Memory Targets

| Metric | Before pools | Target (with pools) |
|--------|-------------|-------------------|
| Total memory | 2+ GB | 400–600 MB |
| Geometries/frame | 40+ | 8 (pooled) |
| Materials/frame | 100+ | 15–20 (pooled) |
| Draw calls (windows) | 960 individual | 1 InstancedMesh |
| Memory reduction | — | ~70% |

## InstancedMesh: The 960-Window Optimization

Building windows are the highest-impact pooling target. 16 buildings × ~60 windows = 960 meshes. Without InstancedMesh, each window is a separate draw call. With InstancedMesh, all 960 windows render in a single draw call with per-instance transform data.

This alone is expected to drop draw call count significantly and reduce the geometry burden on the GPU.

## How Components Use the Pool

Components that previously created geometry in-line:
```typescript
// Before pools (bad)
const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshStandardMaterial({ color: '#00ffff' });
```

Consume the pool via context:
```typescript
// With pools (good)
const { geometryPool, materialPool } = useContext(PoolContext);
const geometry = geometryPool.get('box-1x1x1');
const material = materialPool.get('cyan-standard');
```

## Pool Invalidation

> ❓ Open question: How does the pool handle invalidation when scene configuration changes (e.g., a ship color changes in mediaConfig)? If pools cache by key and a color changes, the old material stays cached under the old key. Does the pool need a `clear()` call on config change?

## Where Used

- [[entity-ships]] — ship geometry and material for all 16 ships consumed from pools
- [[entity-buildings]] — InstancedMesh for 960 windows; material variants from pool
- [[entity-scene]] — PoolContext provider wraps the entire scene tree

## Known Issues

- Pool implementation is in progress as of 2026-04-23 (see [[overview]] health status)
- Capital ships (9x size tier) are the most complex consumers — require InstancedMesh for greeble details in addition to materials

## See Also

- [[concept-resource-pooling]] — design principle behind shared geometry/material
- [[concept-performance-budget]] — targets this entity must achieve
- [[entity-scene]] — PoolContext is provided at the scene root
- [[decision-resource-pool-pattern]] — why centralized pools over per-component creation
- [[entity-ships]] — primary consumer of GeometryPool
- [[entity-buildings]] — primary consumer of InstancedMesh window optimization
