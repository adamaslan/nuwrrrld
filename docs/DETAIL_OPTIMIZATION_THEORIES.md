# NUWRRRLD: 10x Detail/Diversity + 25% Memory Reduction Plan

## Current State Summary

| Category | Count | Meshes | Key Issue |
|----------|-------|--------|-----------|
| Ships | 19 | ~160 | All box-based, 4 hull colors, no silhouette variety |
| Buildings | 16 | ~204 | Identical rectangular boxes with window grids |
| TV Screens | 3 | ~285 | ~30 inline geometries + ~15 inline materials not in pool |
| **Total** | | **~750** | **~71 point lights, ~6.3 MB media (3 files over 1MB)** |

---

## A) 3 Theories for 10x Detail & Diversity

### Theory 1: Procedural Variation Engine (RECOMMENDED)
Use seeded parameters to generate unique ship silhouettes, building profiles, and back-panel layouts from the existing 10 pool geometry primitives. Each object gets a `variantSeed` driving a blueprint generator that determines hull sections, fins, greebles, engine pods, antennas, tiered building profiles, and rooftop details. Expands hull colors from 4 to 12, engine colors from 4 to 8 (96 color combos per ship).

**Why best:** Works WITH existing pool architecture. `seededRandom.ts` already exists. No new deps or paradigm shifts. Every object gets unique identity.

### Theory 2: InstancedMesh with Per-Instance Attributes
Replace repeating detail elements with `THREE.InstancedMesh` - one draw call per element type across the entire scene. Per-instance transforms via `InstancedBufferAttribute`.

**Why not:** Requires rewriting the entire component hierarchy. Breaks the React/R3F per-component pattern. Per-instance animation is complex. Better as Phase 2 future optimization.

### Theory 3: LOD with Progressive Detail Layers
Distance-based Level of Detail - simplified meshes far away, full detail when close.

**Why not:** Camera is semi-fixed (vertical scroll). Most objects stay at consistent distances. Minimal visual benefit for the added complexity.

---

## B) 3 Theories for 25% Memory Reduction

### Theory B1: Media Compression Pipeline (RECOMMENDED)
Compress all media over 1MB at build time. Convert images to WebP, re-encode video at lower bitrate, add runtime size validation.

- `doves1.jpg` (992 KB) -> WebP ~250 KB
- `thresh-plan1-good.mp4` (4.1 MB) -> H.264 CRF 28 ~1.5 MB
- `nathans1.jpg` (1.1 MB) -> WebP ~300 KB or remove if unused
- Total: 6.3 MB -> ~2.2 MB (65% reduction)

### Theory B2: Geometry Merging + Inline Elimination (RECOMMENDED)
Merge static (non-animated) geometry per component into single BufferGeometries. Eliminate ~30 inline geometries and ~15 inline materials in TVScreen.tsx by using pool references.

- Back panel merging: 135 meshes -> ~12 merged groups (saves 123 meshes)
- Static ship merging: saves ~57 meshes
- Static building merging: saves ~32 meshes
- Inline geometry elimination: ~40 unique geometries -> 10 pooled
- **Total: ~750 meshes -> ~510 (32% fewer draw calls)**

### Theory B3: Smart Culling & Disposal
Frustum culling + texture disposal for off-screen elements.

**Why not:** Most of the scene is always visible during vertical scroll. Texture re-creation causes hitches. Marginal gains for the complexity.

---

## C) Implementation Plan (Best Theories Combined)

### Phase 1: Media Compression Pipeline

**Files to create/modify:**
- NEW: `scripts/optimize-media.sh` - build-time compression script
- NEW: `scripts/check-media-size.ts` - validation script (warn if any file > 1MB)
- MODIFY: `config/mediaConfig.ts` - update paths to `.webp` extensions

**Actions:**
1. Create shell script using `cwebp` for images (quality 80, max 1024px) and `ffmpeg` for video (CRF 28, max 720p)
2. Run compression on `doves1.jpg`, `postmascaa1.jpg`, `thresh-plan1-good.mp4`
3. Update `SCREEN_CONFIGS` paths in mediaConfig.ts
4. Add size check script as npm script

### Phase 2: Geometry Merging Utility

**Files to create/modify:**
- NEW: `lib/mergeStaticGeometry.ts` - utility for merging BufferGeometries by material
- Uses `THREE.BufferGeometryUtils.mergeGeometries()` from three/addons

**Utility API:**
```typescript
interface MergeEntry {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
}
function createMergedMeshByMaterial(
  entries: MergeEntry[],
  material: THREE.Material
): THREE.Mesh;
```

### Phase 3: Inline Elimination (TVScreen.tsx + SideScreen.tsx)

**Files to modify:**
- `components/three/TVScreen.tsx` - replace ~30 inline `<boxGeometry>`, `<planeGeometry>`, etc. with `geometry={geometries.box}` + `scale`
- `components/three/SideScreen.tsx` - replace ~5 inline geometries
- `components/three/pools/MaterialPool.ts` - add ~15 new materials (screen brackets, warning colors, serial plate, side screen backgrounds)
- `components/three/pools/GeometryPool.ts` - verify all types covered

**Result:** `renderer.info.memory.geometries` drops from ~50 to 10.

### Phase 4: Procedural Ship Variation Engine

**Files to create/modify:**
- NEW: `components/three/environment/ships/ShipBlueprint.ts` - blueprint generator
- MODIFY: `components/three/environment/ships/Ship.tsx` - render from blueprint
- MODIFY: `components/three/environment/ships/CapitalShip.tsx` - enhanced blueprint
- MODIFY: `components/three/environment/ships/FlyingShips.tsx` - add `variantSeed` to configs
- MODIFY: `components/three/pools/MaterialPool.ts` - add 8 hull + 4 engine color variants
- MODIFY: `types/three-scene.ts` - add `ShipBlueprint` type, `variantSeed` to `ShipConfig`

**Blueprint generates per ship type:**
| Type | Hull Sections | Fins | Engines | Greebles | Antennas | Total Meshes |
|------|--------------|------|---------|----------|----------|-------------|
| Shuttle | 1-2 | 0-2 | 1 | 2-4 | 0-1 | 8-15 |
| Transport | 2-3 | 2 | 1-2 | 4-8 | 1-2 | 15-25 |
| Freighter | 3-4 | 0-1 | 2-4 | 8-12 | 1-3 | 25-40 |
| Capital | 4-6 | 2-4 | 4-6 | 12-20 | 2-4 | 40-60 |

**Static greebles are merged** using Phase 2 utility, so draw call count stays manageable.

### Phase 5: Procedural Building Variation Engine

**Files to create/modify:**
- NEW: `components/three/environment/buildings/BuildingBlueprint.ts` - blueprint generator
- MODIFY: `components/three/environment/buildings/CyberpunkBuilding.tsx` - render tiered profiles
- MODIFY: `components/three/environment/buildings/CityBuildings.tsx` - add `variantSeed` per building
- MODIFY: `components/three/pools/MaterialPool.ts` - add 4 building material variants
- MODIFY: `types/three-scene.ts` - add `BuildingBlueprint` type
- MODIFY: `config/constants.ts` - add `PROCEDURAL_CONFIG` constants

**Blueprint generates:**
- 2-4 tiered setbacks (stepped profile instead of flat box)
- Window patterns: grid / staggered / random-sparse
- Rooftop: 1-3 antennas, optional water tower (cylinder), satellite dish (torus)
- Side panels: vent grilles, neon stripes, pipe clusters
- Ground level: doorway cutout, awning

### Phase 6: Point Light Reduction

**Files to modify:**
- `components/three/environment/ships/Ship.tsx` - replace ship point lights with emissive meshes
- `components/three/environment/buildings/CyberpunkBuilding.tsx` - remove antenna point lights (keep emissive sphere)

**Reduction:** ~71 lights -> ~29 lights (59% fewer). Capital ships and TV screens keep their lights for dramatic effect.

### Phase 7: Screen Back Panel Enhancement + Merging

**Files to modify:**
- `components/three/TVScreen.tsx` - split BackPanel into StaticBackPanel (merged) + AnimatedBackPanel (LEDs, fan)
- Each screen gets unique industrial configuration via blueprint

**Result:** 10x more visual detail per back panel, but same or fewer draw calls.

### Phase 8: Configuration & Type Updates

**Files to modify:**
- `config/constants.ts` - add `PROCEDURAL_CONFIG` with greeble densities, tier ranges, detail chances
- `types/three-scene.ts` - add blueprint types, expand config types with `variantSeed`

---

## Expected Outcomes

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Ship visual variants | 4 types, same shape | 19 unique silhouettes | **10x+ diversity** |
| Building visual variants | 1 box shape | 16 unique profiles | **10x+ diversity** |
| Hull color combos | 4 | 96 (12 hull x 8 engine) | **24x palette** |
| Media size | 6.3 MB | ~2.2 MB | **-65%** |
| Point lights | 71 | 29 | **-59%** |
| Draw calls | ~750 | ~510 | **-32%** |
| Inline geometries | ~40 | 0 (all pooled) | **-100%** |
| Inline materials | ~15 | 0 (all pooled) | **-100%** |
| **Total RAM reduction** | | | **~30-35%** |

---

## Verification

1. `ls -la public/media/` - all files under 1MB (video under 2MB)
2. Scene renders with no visual regressions on existing elements
3. Each ship is visually distinct (different silhouette, color, detail)
4. Each building has unique profile (tiered setbacks, varied rooftops)
5. Browser DevTools -> Memory profiler shows reduced JS heap
6. Three.js inspector: `renderer.info.memory.geometries` = 10 (pool only)
7. Three.js inspector: `renderer.info.render.calls` reduced by ~32%
8. `npm run build` succeeds with no errors
9. Grep for inline `<boxGeometry`, `<planeGeometry` etc. returns 0 outside pool files

## Phase Dependencies

```
Phase 1 (Media) ─────────────────────────────────┐
Phase 2 (Merge Utility) ──┬──────────────────────┤
Phase 3 (Inline Elim) ────┤                      ├── Phase 8 (Config)
Phase 6 (Light Reduction) ─┤                      │
Phase 4 (Ship Blueprints) ─┼── Phase 7 (Panels) ──┘
Phase 5 (Building Blueprints)┘
```

Phases 1, 2, and 6 can run in parallel. Phases 3-5 depend on Phase 2. Phase 7 depends on 2+4. Phase 8 depends on 4+5.
