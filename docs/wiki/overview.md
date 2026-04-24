---
date: 2026-04-24
type: overview
tags: [overview, architecture, stack]
sources: [raw/PLAN_SUMMARY.md, raw/OPTIMIZATION_OVERVIEW.md, components/three/Environment.tsx, config/mediaConfig.ts, config/constants.ts]
---

# NUWRRRLD — System Overview

## What It Is

NUWRRRLD is a cyberpunk 3D portfolio showcase. Five interactive TV screens display the owner's work (image, video, and canvas animation) inside a richly detailed planet-scale scene: 16 procedurally generated flying ships, 16 cyberpunk buildings, a diagonal bridge with walking robots, atmospheric rain/fog/neon, and a depth-stratified environment that creates visual parallax. The scene is portrait-first and mobile-optimized, deployed on Vercel.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.2.0 |
| UI | React | 18.2.0 |
| 3D renderer | Three.js | 0.162.0 |
| React ↔ Three.js | @react-three/fiber | 8.15.0 |
| 3D components | @react-three/drei | 9.99.0 |
| Post-processing | @react-three/postprocessing | 2.16.0 |
| Language | TypeScript (strict) | 5.3.0 |
| Styling | Tailwind CSS | 3.4.0 |
| Deployment | Vercel | — |

## Component Hierarchy

```
app/page.tsx
└── Scene.tsx                    (WebGL Canvas, camera far=800, fog 150→600, Suspense)
    └── SceneContent.tsx         (scene orchestrator, sky dome scale=600, maxDistance=300)
        ├── Environment.tsx      (environment orchestrator)
        │   ├── CityBuildings.tsx → 16× CyberpunkBuilding.tsx  (planet-scale positions)
        │   ├── FlyingShips.tsx  → 16× Ship.tsx + CapitalShip.tsx
        │   ├── CyberpunkBridge.tsx  (diagonal bridge, background zone)
        │   ├── BridgeRobots.tsx     (8 walking robots on bridge)
        │   ├── ForegroundLayer.tsx   (z: −5 to 0)
        │   ├── MidgroundLayer.tsx    (z: −10 to −20)
        │   ├── BackgroundLayer.tsx   (z: −180 to −300)
        │   ├── OppositeLayer.tsx     (z: +25 to +65)
        │   ├── Rain.tsx             (800 particles)
        │   ├── FogLayers.tsx        (3 fog planes)
        │   ├── NeonGridLines.tsx
        │   ├── NeonSigns.tsx        (4 signs)
        │   ├── AnimatedBillboards.tsx
        │   ├── HolographicElements.tsx
        │   └── Puddles.tsx
        ├── TVScreen.tsx × 5     (screens 1–3: focal stack; 4–5: building-mounted)
        │   ├── SideScreen.tsx   (side panel per screen)
        │   └── NuWrrrldMorphTexture.tsx  (canvas texture for screens 4 and 5)
        ├── Lighting.tsx         (11+ point/spot lights + 5 city atmospheric glow lights)
        └── PostProcessing.tsx   (Bloom → grain → vignette → chromatic aberration)

Providers (wrap everything):
├── PoolContext.tsx     (GeometryPool + MaterialPool)
├── CameraContext.tsx  (camera position state, axis-mode pan)
└── ScreenContext.tsx  (selected screen state)
```

## Configuration Hubs

- `config/mediaConfig.ts` — source of truth for all 5 screen positions, media paths, colors, side panel text; exports `MediaType` (`'image' | 'video' | 'canvas'`)
- `config/constants.ts` — `CYBERPUNK_COLORS` palette, `SCENE_DIMENSIONS`, `BUILDING_CONFIG` (all planet-scale layout values), `CITY_LIGHTS` (atmospheric glow intensities/distances), `LIGHT_INTENSITY`

## Data Flow

```
mediaConfig.ts ──► TVScreen.tsx ──► ScreenContext ──► RemoteControl.tsx (UI links)
constants.ts   ──► all components (colors, sizes)
ShipBlueprint  ◄── seededRandom ──► Ship.tsx geometry
BuildingBlueprint ◄── seededRandom ──► CyberpunkBuilding.tsx geometry
GeometryPool / MaterialPool ──► pooled resources ──► Ship + Building components
```

## Current Health

| Area | State | Detail |
|------|-------|--------|
| TV Screens (5) | ✅ Stable | Hover/tap, side panels, CRT overlay; screens 4+5 use canvas texture |
| Ships (16) | ✅ Stable | Horizontal wrap, bobbing, banking, engine lights |
| Buildings (16) | ✅ Stable | Planet-scale positions, all layout values in BUILDING_CONFIG |
| Bridge + robots | ✅ Stable | CyberpunkBridge + BridgeRobots in background zone |
| Depth layers (4) | ✅ Stable | Parallax working; background pushed to z: −180→−300 |
| Post-processing | ✅ Stable | Bloom, grain, vignette |
| Resource pools | ⚠️ In progress | GeometryPool/MaterialPool in use; InstancedMesh for windows not yet done |
| RemoteControl | ✅ Stable | Axis-mode pan (orbit / X / Y / Z) + screen links |
| Mobile FPS | ⚠️ In progress | Target 60 FPS; currently 30–50 unstable |
| Memory | ⚠️ In progress | Currently 2+ GB; target 400–600 MB |

## Open Questions

> ❓ Are shadow maps enabled in Scene.tsx? (spotLights have `castShadow` — confirm shadow map size/cost on mobile)
> ❓ What pixel ratio cap is used in Scene.tsx?
> ❓ Is the LOD system implemented or only planned?
> ❓ Screen 5 (NuWrrrld Financial) uses a placeholder image — when will real asset and URL be added?

## See Also

- [[entity-scene]] · [[entity-ships]] · [[entity-buildings]] · [[entity-screens]] · [[entity-layers]] · [[entity-pools]]
- [[architecture-scene-composition]] · [[architecture-rendering-pipeline]] · [[architecture-animation-systems]]
- [[concept-performance-budget]] · [[concept-depth-stratification]] · [[concept-procedural-generation]]
