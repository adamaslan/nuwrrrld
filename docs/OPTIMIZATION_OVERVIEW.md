# NUWRRRLD Performance Optimization Overview

## Executive Summary

The NUWRRRLD scene suffers from critical performance issues due to **runtime geometry and material creation** in the render loop. This document provides context for a comprehensive optimization effort targeting **70-80% memory reduction** and sustained 60fps performance.

---

## The Problem

### Current State: Inefficient Resource Creation

**Environment.tsx (1668 lines)** creates resources in three antipatterns:

1. **Inline Geometry Creation**: Every render frame spawns new `BoxGeometry`, `PlaneGeometry`, `CylinderGeometry` instances
2. **Inline Material Creation**: Every render creates new material instances instead of reusing them
3. **Per-Instance Resource Allocation**: Ship components create unique geometries for each ship rather than pooling

### Impact Metrics

| Issue | Count | Memory per Frame | Total |
|-------|-------|------------------|-------|
| Building window geometries | 960 | 1.2 MB each | 1,152 MB |
| Building window materials | 960 | 0.8 MB each | 768 MB |
| Ship geometries (16 ships) | 40+ | 5-8 MB per ship | 200+ MB |
| Point lights (non-pooled) | 40+ | GPU overhead | ~15% FPS loss |
| **Total scene bloat** | - | - | **2+ GB unnecessary allocation** |

### Root Causes

1. **No centralized geometry pool** - Each component creates geometries independently
2. **No centralized material pool** - Materials recreated instead of reused
3. **Inconsistent pooling** - Only `OppositeEnvironmentLayer` (lines 1311-1667) implements pooling correctly
4. **Excessive point lights** - 40+ non-pooled lights throughout the scene
5. **Callback refs in loops** - `ref={(el) => arr[i] = el}` pattern causes unnecessary updates

---

## The Solution: Three-Part Strategy

### Part A: Centralized Resource Pools

Create singleton pools that all components reference:

```typescript
// GeometryPool.ts - Created once, reused everywhere
const geometryPool = {
  box: new THREE.BoxGeometry(1, 1, 1),
  plane: new THREE.PlaneGeometry(1, 1),
  windowPlane: new THREE.PlaneGeometry(1, 1.6),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 8),
  sphere: new THREE.SphereGeometry(1, 16, 16),
  // ... 8-10 total geometries
};

// MaterialPool.ts - 15-20 reusable materials
const materialPool = {
  buildingBase: new THREE.MeshStandardMaterial({ color: '#0a0a12' }),
  windowCyan: new THREE.MeshBasicMaterial({ color: '#00ffff' }),
  shipHull: new THREE.MeshStandardMaterial({ color: '#12121a' }),
  // ... consolidated materials
};
```

**Benefit**: 40+ geometries → 8, 100+ materials → 15-20

### Part B: Dependency Injection Pattern

Pass pools as props following design-principle.md:

```typescript
// Before (antipattern)
function CapitalShip({ config }) {
  return <mesh>
    <boxGeometry args={[width, height, depth]} />
    <meshStandardMaterial color={config.color} />
  </mesh>;
}

// After (design pattern)
function CapitalShip({ config, geometryPool, materialPool }) {
  return <mesh
    geometry={geometryPool.box}
    material={materialPool.shipHull}
    scale={[width, height, depth]}
  />;
}
```

**Benefit**: Type-safe, testable, single source of truth for resources

### Part C: Efficient Data Structures

Replace 960 individual meshes with instancing:

```typescript
// Before: 960 individual meshes
{buildings.map(building => (
  <CyberpunkBuilding key={building.id} data={building} />
))}
// Inside CyberpunkBuilding: 60 individual window meshes per building

// After: 16 InstancedMesh objects
{buildings.map(building => (
  <instancedMesh
    key={`windows-${building.id}`}
    args={[geometryPool.windowPlane, materialPool.windowCyan, 60]}
  />
))}
```

**Benefit**: 960 geometries + 960 materials → 16 InstancedMesh + 16 material arrays

---

## Design Principles Applied

This optimization effort aligns with **design-principle.md**:

| Principle | Application |
|-----------|-------------|
| **Single Responsibility** | Each pool manages one resource type |
| **Dependency Injection** | Pools passed as props, not created inline |
| **Code Decomposition** | 1668-line file split into focused modules |
| **Immutability** | Resources created once, never modified |
| **Early Returns** | Pool context checked first, graceful fallback |
| **Avoid Magic Numbers** | Pool keys are descriptive constants |
| **Type Safety** | Strict interfaces for all pools |

---

## Three-Phase Implementation

### Phase 1: Foundation (Enables all downstream work)
- [ ] Create GeometryPool.ts
- [ ] Create MaterialPool.ts
- [ ] Create PoolContext.tsx
- [ ] Extend ScreenConfig with SidePanelConfig

### Phase 2: Environment Optimization (Core performance gains)
- [ ] CyberpunkBuilding: Replace 960 window meshes with InstancedMesh
- [ ] Ship components: Apply pool dependency injection
- [ ] Replace 40+ point lights with emissive materials
- [ ] Consolidate useFrame hooks

### Phase 3: TVScreen Enhancement (New feature)
- [ ] Create SideScreen.tsx component
- [ ] Integrate into TVScreen.tsx
- [ ] Add configuration examples

### Phase 4: Cleanup & Polish (Code quality)
- [ ] Extract sub-components from Environment.tsx
- [ ] Add performance monitoring
- [ ] Verify no visual regressions

---

## Expected Outcomes

### Memory Reduction
```
Building geometries:  960 → 1 (InstancedMesh) = 99.9% reduction
Building materials:   960 → 1 (shared)         = 99.9% reduction
Ship geometries:      40+ → 8 (pooled)         = 80% reduction
Materials:           100+ → 15-20 (pooled)     = 85% reduction
Point lights:         40+ → 15 (strategic)      = 60% reduction

TOTAL: ~2GB unnecessary → ~400-600MB = 70-80% reduction
```

### Performance Gains
- **Memory**: Reduced GC pressure, fewer allocation cycles
- **FPS**: Sustained 60fps instead of variable 30-50fps
- **Load Time**: Faster scene initialization
- **Maintainability**: Clearer code structure, easier to debug

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Visual regression | Screenshot before/after, pixel comparison |
| Missing edge cases | Comprehensive testing of all ship types |
| Shader compatibility | Use pooled geometries with same vertex structure |
| Material state mutations | Immutable material approach, no per-instance modifications |

---

## Quick Reference: Files to Modify

| File | Lines | Type | Impact |
|------|-------|------|--------|
| [Environment.tsx](../components/three/Environment.tsx) | 1668 | Major refactor | 70% of memory savings |
| [TVScreen.tsx](../components/three/TVScreen.tsx) | 994 | Enhancement | New SidePanel feature |
| [mediaConfig.ts](../config/mediaConfig.ts) | 70 | Config update | Enable SidePanel |
| [SceneContent.tsx](../components/three/SceneContent.tsx) | ~150 | Integration | Pool provider |
| [Lighting.tsx](../components/three/Lighting.tsx) | ~80 | Optimization | Light pooling |

---

## Next Steps

1. **Read** `ENVIRONMENT_OPTIMIZATION_GUIDE.md` for 10 detailed suggestions
2. **Read** `TVSCREEN_SIDESCREEN_FEATURE.md` for customizable text panel design
3. **Read** `IMPLEMENTATION_CHECKLIST.md` for step-by-step tasks
4. **Review** `/Users/adamaslan/.claude/plans/temporal-greeting-goose.md` for complete plan

---

## Questions This Answers

- **Why is performance poor?** Geometry/material creation in render loop
- **How do we fix it?** Centralized pools + dependency injection
- **Will it break anything?** No - geometry/material replacement is non-breaking
- **How much will it improve?** 70-80% memory reduction, sustained 60fps
- **How long will it take?** ~2-4 hours based on phase breakdown
