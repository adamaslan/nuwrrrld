# Implementation Checklist & Workflow

## Quick Start

**Total Estimated Time**: 2-4 hours (depends on testing thoroughness)

**Dependencies**: None - all work is independent and self-contained

**Risk Level**: Low - all changes are backwards-compatible additions/replacements

---

## Pre-Implementation

### Preparation Steps

- [ ] Read [OPTIMIZATION_OVERVIEW.md](./OPTIMIZATION_OVERVIEW.md)
- [ ] Read [ENVIRONMENT_OPTIMIZATION_GUIDE.md](./ENVIRONMENT_OPTIMIZATION_GUIDE.md)
- [ ] Read [TVSCREEN_SIDESCREEN_FEATURE.md](./TVSCREEN_SIDESCREEN_FEATURE.md)
- [ ] Review current /components/three/Environment.tsx (lines 1-100)
- [ ] Review current /components/three/TVScreen.tsx (lines 1-50)
- [ ] Take screenshots of current scene for before/after comparison
- [ ] Open Chrome DevTools Memory tab for profiling

### Backup Steps

- [ ] Commit current work: `git add -A && git commit -m "Pre-optimization backup"`
- [ ] Create feature branch: `git checkout -b feature/perf-optimization`

---

## Phase 1: Foundation (Core Infrastructure)

These changes enable all downstream work. **Do these first.**

### Task 1.1: Create GeometryPool Module

**File**: Create `/components/three/pools/GeometryPool.ts`

- [ ] Copy GeometryPool.ts code from ENVIRONMENT_OPTIMIZATION_GUIDE.md (Suggestion 1)
- [ ] Verify all geometry types are defined
- [ ] Add JSDoc comments for each geometry
- [ ] Type check: `tsc --noEmit` passes
- [ ] Git commit: `git add components/three/pools/GeometryPool.ts && git commit -m "feat: add geometry pool"`

**Verification**:
```bash
npm run build
# Should complete without errors
```

### Task 1.2: Create MaterialPool Module

**File**: Create `/components/three/pools/MaterialPool.ts`

- [ ] Copy MaterialPool.ts code from ENVIRONMENT_OPTIMIZATION_GUIDE.md (Suggestion 2)
- [ ] Verify all material types are defined
- [ ] Match material colors to existing scene colors
- [ ] Verify metalness/roughness values appropriate
- [ ] Type check passes
- [ ] Git commit: `git add components/three/pools/MaterialPool.ts && git commit -m "feat: add material pool"`

**Verification**:
```bash
npm run build
# Should complete without errors
```

### Task 1.3: Create PoolContext Provider

**File**: Create `/components/three/pools/PoolContext.tsx`

- [ ] Create React Context for geometry/material pools
- [ ] Create `PoolProvider` component that wraps Environment
- [ ] Export `usePools()` hook for child components
- [ ] Add TypeScript types for context value
- [ ] Git commit: `git add components/three/pools/PoolContext.tsx && git commit -m "feat: add pool context provider"`

```typescript
// components/three/pools/PoolContext.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { createGeometryPool, type IGeometryPool } from './GeometryPool';
import { createMaterialPool, type IMaterialPool } from './MaterialPool';

interface PoolContextType {
  geometries: IGeometryPool;
  materials: IMaterialPool;
}

const PoolContext = createContext<PoolContextType | null>(null);

export function PoolProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(
    () => ({
      geometries: createGeometryPool(),
      materials: createMaterialPool(),
    }),
    []
  );

  return (
    <PoolContext.Provider value={value}>
      {children}
    </PoolContext.Provider>
  );
}

export function usePools(): PoolContextType {
  const context = useContext(PoolContext);
  if (!context) {
    throw new Error('usePools must be used within PoolProvider');
  }
  return context;
}
```

**Verification**:
```bash
npm run build
# Check for context usage errors
```

### Task 1.4: Update mediaConfig.ts

**File**: Edit `/config/mediaConfig.ts`

- [ ] Add `SidePanelConfig` interface (from TVSCREEN_SIDESCREEN_FEATURE.md)
- [ ] Add `DEFAULT_SIDE_PANEL` constant
- [ ] Extend `ScreenConfig` with optional `sidePanel` property
- [ ] Add example configurations to SCREEN_CONFIGS
- [ ] Type check passes
- [ ] Git commit: `git add config/mediaConfig.ts && git commit -m "feat: add side panel config"`

**Verification**:
```bash
npm run build
# No type errors
```

---

## Phase 2: Environment Optimization (Core Performance Gains)

**Do these after Phase 1.** These give the biggest memory/performance improvements.

### Task 2.1: Update Environment.tsx Header (Integrate Pools)

**File**: Edit `/components/three/Environment.tsx`

- [ ] Import `usePools()` hook at top of file
- [ ] Wrap Environment with `PoolProvider` in parent component
- [ ] In Environment component, call `const { geometries, materials } = usePools()`
- [ ] Type check passes
- [ ] Git commit: `git add components/three/Environment.tsx && git commit -m "feat: integrate geometry/material pools"`

### Task 2.2: Refactor CyberpunkBuilding with InstancedMesh

**File**: Edit `/components/three/Environment.tsx` (lines 70-242)

- [ ] Replace individual window meshes (lines 191-208) with `<instancedMesh>`
- [ ] Update `CyberpunkBuilding` props to accept `geometryPool` and `materialPool`
- [ ] Create window positioning matrix in `useEffect`
- [ ] Test in browser: windows should still animate
- [ ] Screenshot to verify visual identical to before
- [ ] Check Chrome DevTools - memory should drop significantly
- [ ] Git commit: `git commit -m "refactor: use InstancedMesh for building windows"`

**Line references**:
- Line 191-208: Individual window meshes → `<instancedMesh>`
- Line 166-172: Window animation useFrame hook (keep, but now affects InstancedMesh)

### Task 2.3: Refactor Ship Components

**File**: Edit `/components/three/Environment.tsx` (lines 745-894)

- [ ] Update `CapitalShip` component signature to accept `pools` prop
- [ ] Replace all inline `<boxGeometry>` with `geometry={pools.geometries.box}`
- [ ] Replace all inline `<meshStandardMaterial>` with materials from `pools.materials`
- [ ] Use `scale` prop instead of geometry args: `scale={[width, height, depth]}`
- [ ] Update all ship types (shuttle, transport, freighter)
- [ ] Test in browser: all ships render correctly
- [ ] Screenshot comparison: visual should be identical
- [ ] Git commit: `git commit -m "refactor: use pooled geometries for ships"`

**Key changes**:
- Line 767: `<boxGeometry args={[width, height, depth]} />` → `geometry={pools.geometries.box} scale={[width, height, depth]}`
- Line 778: Material reference to pool
- Line 805-814: Transport wings use same geometry with scale
- Line 859-868: Sphere lights use pooled geometry

### Task 2.4: Replace Point Lights with Emissive Materials

**File**: Edit `/components/three/Environment.tsx` (multiple locations)

- [ ] Identify all `<pointLight>` elements:
  - Line 277: NeonSigns
  - Line 933: AnimatedBillboards
  - Line 1149-1154: FloatingPlatforms
  - Line 1204: DroneSwarm
  - Line 1260-1265: DistantMegaStructures

- [ ] For each point light, replace with emissive material mesh:
  ```typescript
  // Before
  <pointLight color="#00ffff" intensity={0.8} distance={8} />

  // After
  <meshStandardMaterial
    color="#00ffff"
    emissive="#00ffff"
    emissiveIntensity={0.8}
    toneMapped={false}
  />
  ```

- [ ] Test in browser: lighting should look identical
- [ ] Check FPS: should improve 5-15%
- [ ] Git commit: `git commit -m "refactor: replace point lights with emissive materials"`

### Task 2.5: Consolidate useFrame Hooks (Optional)

**File**: Edit `/components/three/Environment.tsx` (multiple locations)

- [ ] Identify all `useFrame` hooks:
  - Line 166-172: CyberpunkBuilding windows
  - Line 247-258: NeonSigns
  - Line 287-293: NeonGridLines
  - Line 378-388: HolographicElements
  - Line 906-908: AnimatedBillboards

- [ ] Create centralized `useEnvironmentAnimations()` hook
- [ ] Move all animation logic into single hook
- [ ] Test animations still work smoothly
- [ ] Verify FPS improvement
- [ ] Git commit: `git commit -m "refactor: consolidate animation hooks"`

**Note**: This is optional but improves code maintainability.

---

## Phase 3: TVScreen Enhancement (New Feature)

**Do these after Phase 1.** These add the new SideScreen feature.

### Task 3.1: Create SideScreen Component

**File**: Create `/components/three/SideScreen.tsx`

- [ ] Copy code from TVSCREEN_SIDESCREEN_FEATURE.md
- [ ] Verify all imports present:
  - `useFrame`, `useLoader` from `@react-three/fiber`
  - `Text`, `useTexture` from `@react-three/drei`
  - `SidePanelConfig` from `@/config/mediaConfig`
- [ ] Type check passes
- [ ] Git commit: `git add components/three/SideScreen.tsx && git commit -m "feat: add SideScreen component"`

### Task 3.2: Integrate SideScreen into TVScreen

**File**: Edit `/components/three/TVScreen.tsx`

- [ ] Import `SideScreen` component at top
- [ ] Add rendering logic (from TVSCREEN_SIDESCREEN_FEATURE.md):
  ```typescript
  {config.sidePanel?.enabled && (
    <SideScreen
      config={config.sidePanel}
      screenWidth={screenWidth}
      screenHeight={screenHeight}
      isHovered={isHovered}
      isTapped={isTapped}
    />
  )}
  ```
- [ ] Place SideScreen inside main TVScreen group (after main screen, before lighting)
- [ ] Test in browser: side panel renders next to main screen
- [ ] Verify text displays correctly
- [ ] Test hover interactions
- [ ] Git commit: `git commit -m "feat: integrate SideScreen into TVScreen"`

### Task 3.3: Add Example Configurations

**File**: Edit `/config/mediaConfig.ts` (SCREEN_CONFIGS array)

- [ ] Update screen #2 with side panel configuration (data display example)
- [ ] Update screen #3 with side panel configuration (project info example)
- [ ] Test in browser: both screens should render side panels
- [ ] Verify text, colors, and alignment match config
- [ ] Git commit: `git commit -m "docs: add example side panel configurations"`

---

## Phase 4: Verification & Testing

**Do these after all implementation.** These ensure quality and no regressions.

### Task 4.1: Visual Regression Testing

- [ ] Open Scene in browser
- [ ] Compare before/after screenshots side-by-side
- [ ] Verify:
  - [ ] All building windows visible and flickering
  - [ ] All ships visible with correct colors
  - [ ] Neon signs glowing (even though point lights removed)
  - [ ] Grid lines visible
  - [ ] Side panels rendering correctly
  - [ ] No missing meshes or black areas
  - [ ] No obvious visual artifacts

- [ ] Git commit: `git commit -m "test: visual regression testing passed"`

### Task 4.2: Performance Profiling

**Chrome DevTools > Memory tab**:

- [ ] Take heap snapshot before optimization
- [ ] Reload page to clear cache
- [ ] Compare memory usage:
  - [ ] Expect 60-80% reduction in allocated memory
  - [ ] Geometry allocations: 40+ → 8-10
  - [ ] Material allocations: 100+ → 15-20
  - [ ] Point lights: 40+ → reduced

**Chrome DevTools > Performance tab**:

- [ ] Record 10-second session
- [ ] Check FPS:
  - [ ] Should be stable at 60fps
  - [ ] No frame drops below 50fps
  - [ ] Smooth animations

- [ ] Git commit: `git commit -m "test: performance profiling passed"`

### Task 4.3: Type Safety Check

```bash
npm run build
# or
tsc --noEmit
```

- [ ] No TypeScript errors
- [ ] All imports resolve
- [ ] All types match

### Task 4.4: Runtime Testing Checklist

- [ ] [ ] Scene loads without console errors
- [ ] [ ] All buildings render
- [ ] [ ] All ships render and move smoothly
- [ ] [ ] Window animations play
- [ ] [ ] Neon signs flicker
- [ ] [ ] Grid lines visible
- [ ] [ ] Camera controls work
- [ ] [ ] OrbitControls responsive
- [ ] [ ] No memory leaks (heap grows then stable)
- [ ] [ ] Side panels display correctly
- [ ] [ ] Side panel text colors match config
- [ ] [ ] Side panel background colors correct
- [ ] [ ] Glow effects work
- [ ] [ ] Hover states responsive

### Task 4.5: Edge Cases

- [ ] Hover over side panels (glow should intensify)
- [ ] Tap/click side panels (isTapped state propagates)
- [ ] Resize window (panels scale correctly)
- [ ] Scroll scene (parallax works)
- [ ] Load/unload background images (if configured)

---

## Phase 5: Documentation & Cleanup

### Task 5.1: Update Code Comments

- [ ] Add JSDoc comments to new pool functions
- [ ] Add comments explaining InstancedMesh usage
- [ ] Add comments to SideScreen component

### Task 5.2: Create Implementation Summary

- [ ] Document final results
- [ ] Note any deviations from plan
- [ ] List performance improvements achieved

### Task 5.3: Commit Final Changes

```bash
git add -A
git commit -m "docs: add implementation documentation"
```

---

## Rollback Plan (If Issues Arise)

If something breaks during implementation, rollback is simple:

```bash
# Rollback to last good commit
git reset --hard <commit-before-optimization>

# Or checkout specific file
git checkout <commit> components/three/Environment.tsx
```

All changes are modular and non-destructive.

---

## Performance Metrics Checklist

Track before and after:

| Metric | Before | After | Expected |
|--------|--------|-------|----------|
| Heap size (MB) | _____ | _____ | -60-80% |
| Total geometries | _____ | _____ | -85-95% |
| Total materials | _____ | _____ | -80-90% |
| Point lights | _____ | _____ | -60% |
| FPS (avg) | _____ | _____ | 60 (stable) |
| FPS (min) | _____ | _____ | >50 |
| Frame time (ms) | _____ | _____ | <16.67 |

---

## Time Breakdown

| Phase | Task | Est. Time |
|-------|------|-----------|
| Phase 1 | Create pools, context, config | 20-30 min |
| Phase 2.1 | Integrate pools | 10 min |
| Phase 2.2 | CyberpunkBuilding InstancedMesh | 30 min |
| Phase 2.3 | Ship component refactoring | 30-40 min |
| Phase 2.4 | Replace point lights | 15-20 min |
| Phase 2.5 | Consolidate useFrame (optional) | 20 min |
| Phase 3 | SideScreen feature | 30-40 min |
| Phase 4 | Testing & verification | 30-45 min |
| Phase 5 | Cleanup & documentation | 15-20 min |
| **Total** | - | **200-280 min (3.5-4.5 hrs)** |

---

## Success Criteria

✅ Implementation is complete when:

- [ ] All Phase 1 files created and type-safe
- [ ] All Phase 2 refactorings complete and visually identical
- [ ] SideScreen feature working with example configs
- [ ] Memory usage reduced by 60-80%
- [ ] FPS stable at 60fps
- [ ] No console errors
- [ ] All commits made with descriptive messages
- [ ] Visual regression testing passed

---

## Notes

- **Do not skip Phase 1** - pools enable all other work
- **Test frequently** - verify visuals after each major change
- **Commit often** - each task gets its own commit
- **Use git branches** - keep main clean during development
- **Monitor memory** - use DevTools to verify improvements

---

## Questions During Implementation?

Refer to:
1. **Why?**: See OPTIMIZATION_OVERVIEW.md
2. **How?**: See ENVIRONMENT_OPTIMIZATION_GUIDE.md or TVSCREEN_SIDESCREEN_FEATURE.md
3. **Code examples**: All guides include detailed TypeScript examples
4. **Common issues**: See each guide's testing section

---

## Post-Implementation

After completion:

1. **Merge to main**: Create PR, request review
2. **Deploy**: Update production when ready
3. **Monitor**: Watch production memory/FPS metrics
4. **Iterate**: Use this foundation for future optimizations

---

## Future Optimization Ideas

- [ ] Implement shader-based rain (offload to GPU)
- [ ] Reduce Lighting component point lights
- [ ] Extract Environment sub-components to separate files
- [ ] Add performance monitoring to Scene.tsx
- [ ] Migrate particle system to GPU
- [ ] Cache texture loading between scenes
