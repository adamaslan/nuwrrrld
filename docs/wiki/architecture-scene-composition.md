---
date: 2026-04-23
type: architecture
tags: [architecture, scene, composition, providers, config]
sources: [raw/PHASE_3_DECOMPOSITION.md, raw/PHASE_1_FOUNDATIONS.md]
---

# Architecture: Scene Composition

## What It Governs

How the entire 3D scene is assembled — from Next.js page entry through React context providers, the WebGL canvas, the scene orchestrator, and down to every environment element. This is the load-bearing architecture: change the composition chain and everything can break.

## Component Map

```
app/page.tsx                         ← Next.js App Router entry
└── [Context Providers]
    ├── PoolContext.Provider          ← GeometryPool + MaterialPool
    ├── CameraContext.Provider        ← camera position state
    └── ScreenContext.Provider        ← selected screen state
        └── Scene.tsx                 ← Three.js <Canvas>, camera setup, Suspense
            └── SceneContent.tsx      ← scene orchestrator
                ├── Environment.tsx   ← environment orchestrator
                │   ├── CityBuildings.tsx
                │   │   └── CyberpunkBuilding.tsx × 16
                │   ├── FlyingShips.tsx
                │   │   ├── Ship.tsx × N
                │   │   └── CapitalShip.tsx × N
                │   ├── ForegroundLayer.tsx   (z: −5 to 0)
                │   │   ├── Particles (100 debris points)
                │   │   └── HolographicElements (8 octahedrons)
                │   ├── MidgroundLayer.tsx    (z: −10 to −20)
                │   ├── BackgroundLayer.tsx   (z: −60 to −100)
                │   ├── OppositeLayer.tsx     (z: +25 to +65)
                │   ├── Rain.tsx              (800 particles)
                │   ├── FogLayers.tsx         (3 fog planes)
                │   ├── NeonGridLines.tsx
                │   ├── NeonSigns.tsx         (4 signs)
                │   ├── AnimatedBillboards.tsx
                │   ├── HolographicElements.tsx
                │   └── Puddles.tsx
                ├── TVScreen.tsx × 3  (y=68/y=40/y=12)
                │   └── SideScreen.tsx × 3
                ├── Lighting.tsx      (11+ lights)
                └── PostProcessing.tsx (Bloom→grain→vignette→chromatic)

UI (outside Canvas):
└── RemoteControl.tsx                 (2D overlay with screen links)
```

## Configuration Hubs

Two files govern the entire scene configuration:

- **`config/mediaConfig.ts`**: Source of truth for all 3 TV screen positions, Z depths, media paths, accent colors, side panel content, and link URLs. Change a screen — change it here only.
- **`config/constants.ts`**: `CYBERPUNK_COLORS` palette, scene dimensions, scale factors. Change the aesthetic — change it here only.

## Data / Control Flow

```
mediaConfig.ts ──► TVScreen props ──► ScreenContext (selected screen)
                                  └──► RemoteControl (links panel)

constants.ts ──► all color/size consumers

seededRandom(seed) ──► ShipBlueprint ──► Ship geometry (deterministic)
seededRandom(seed) ──► BuildingBlueprint ──► Building geometry (deterministic)

PoolContext ──► GeometryPool.get(key) ──► Ship/Building geometry objects
            └──► MaterialPool.get(key) ──► Ship/Building material objects

CameraContext ──► camera position updates ──► parallax effect
ScreenContext ──► active screen state ──► TVScreen highlight + RemoteControl
```

## Key Invariants

1. **PoolContext must be outermost**: Any component that consumes `GeometryPool` or `MaterialPool` must be inside `PoolContext.Provider`. If a ship or building component is rendered outside the provider chain, it will throw at runtime.

2. **Environment.tsx owns all environmental elements**: Nothing environmental (atmosphere, buildings, ships, layers) should be placed directly in SceneContent. SceneContent's role is to compose: Environment + Screens + Lighting + PostProcessing.

3. **mediaConfig.ts is the only screen config location**: TV screen positions, media, and colors must not be hardcoded in TVScreen.tsx. They live in mediaConfig.ts exclusively.

4. **Layer components own their Z-range**: New elements for a depth zone must be placed inside the appropriate `*Layer.tsx`. Placing elements at arbitrary Z values outside layer components breaks the depth stratification contract.

## Open Questions

> ❓ Where exactly does `PoolContext.Provider` sit in the React tree? Is it in `app/page.tsx`, in `Scene.tsx`, or at a higher level?

> ❓ Is `RemoteControl.tsx` inside the `<Canvas>` or outside? It should be outside (it's a 2D HTML overlay), but this determines whether it has access to ScreenContext if that context is placed inside Canvas.

## See Also

- [[entity-scene]] — Scene.tsx and SceneContent.tsx detail
- [[entity-layers]] — the four depth layer components
- [[entity-screens]] — TV screens and their configuration
- [[entity-pools]] — PoolContext provider and its requirements
- [[concept-depth-stratification]] — why the layer structure exists
- [[architecture-rendering-pipeline]] — what happens after scene composition (WebGL → postprocessing)
