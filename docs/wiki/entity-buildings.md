---
date: 2026-04-24
type: entity
tags: [buildings, procedural, instancing, cyberpunk]
sources: [raw/OPTIMIZATION_OVERVIEW.md, raw/ENVIRONMENT_OPTIMIZATION_GUIDE.md, components/three/environment/buildings/CityBuildings.tsx, config/constants.ts]
---

# Entity: Buildings

## What It Is

The building system generates 16 unique cyberpunk skyscrapers at planet scale that form the city backdrop behind the TV screens. Buildings are procedurally generated, positioned in three groups (left, right, background), and vary in height, width, window pattern, and architectural details. They are static — no per-frame movement — but their windows flicker via the `useFlickerAnimation` hook. The most performance-critical aspect is the 960 window instances, which are the primary candidate for InstancedMesh optimization.

After the planet-scale expansion (commit `ebf81ea`), all building positions and sizes were tripled and then extracted into named constants in `BUILDING_CONFIG` (commit `2df2d06`). `CityBuildings.tsx` no longer contains any magic numbers — all layout values come from `config/constants.ts`.

## Key Files

| File | Role |
|------|------|
| `components/three/environment/buildings/CityBuildings.tsx` | Fleet manager: 16 buildings in 3 groups |
| `components/three/environment/buildings/CyberpunkBuilding.tsx` | Individual building: geometry, windows, antennas, details |
| `components/three/environment/buildings/BuildingBlueprint.ts` | Procedural generator: height, width, tiers, window layout |
| `components/three/environment/buildings/types.ts` | BuildingConfig and BuildingBlueprint interfaces |
| `hooks/useFlickerAnimation.ts` | Window flicker animation (random on/off per frame rate) |
| `lib/utils/seededRandom.ts` | PRNG used by BuildingBlueprint |

## Building Layout

| Group | Count | X range (approx) | Z range (approx) | Purpose |
|-------|-------|-----------------|-----------------|---------|
| Left | 5 | −63 to −189 | −54 to −144 | Left city wall |
| Right | 5 | +63 to +189 | −54 to −144 | Right city wall |
| Background | 6 | −157.5 to +157.5 | −157.5 to −225 | Depth and density |

All position values are derived from `BUILDING_CONFIG` constants — see `config/constants.ts`.

## Procedural Properties

Each building is generated from a seed to produce:
- **Side building height**: 75–225 units (base 75 + random × 150) — `BUILDING_CONFIG.SIDE_HEIGHT_BASE/RANGE`
- **Background building height**: 150–360 units (base 150 + random × 210) — `BUILDING_CONFIG.BG_HEIGHT_BASE/RANGE`
- **Side building width/depth**: 3–7 units — `BUILDING_CONFIG.SIDE_DIM_MIN/RANGE`
- **Background building width/depth**: 5–11 units — `BUILDING_CONFIG.BG_DIM_MIN/RANGE`
- **Tiers**: setbacks and recesses for architectural variety
- **Window pattern**: grid, staggered, or random-sparse
- **Window colors**: from `CYBERPUNK_COLORS` (cyan, magenta, amber, green)
- **Antennas**: 60% of buildings have antennas — `BUILDING_CONFIG.ANTENNA_THRESHOLD`
- **Details**: water towers, satellite dishes, awnings (per building)
- **Material variant**: 4 types with varying metallic and roughness values; materials are shared via `usePools()` — not duplicated per building

## Performance: The 960-Window Problem

With 16 buildings × ~60 windows each = 960 window meshes. Without InstancedMesh, each window is a separate draw call. Target optimization: replace per-window meshes with a single `InstancedMesh` that renders all 960 windows in one draw call.

This is the single highest-impact optimization available for buildings. See [[entity-pools]] and [[concept-resource-pooling]].

## Where Used

- [[entity-layers]] — buildings occupy mid-range Z depth, effectively the midground layer
- [[concept-procedural-generation]] — generation strategy shared with ships
- [[concept-seeded-random]] — deterministic seed ensures same buildings every render
- [[concept-cyberpunk-aesthetic]] — window colors and material palette defined in constants.ts

## Known Issues

_(No open questions remaining — materials answered by code audit 2026-04-24.)_

## See Also

- [[entity-pools]] — InstancedMesh for 960 windows is the primary pool optimization target
- [[entity-decorations]] — CyberpunkBridge + BridgeRobots live in the building zone
- [[concept-resource-pooling]] — why pooling matters at the scale of 960 windows
- [[concept-performance-budget]] — buildings contribute to the 2+ GB memory problem
- [[concept-named-constants]] — BUILDING_CONFIG pattern: no magic numbers in layout code
- [[decision-seeded-random-generation]] — why buildings use deterministic generation
- [[decision-resource-pool-pattern]] — why centralized pools over per-component creation
- [[decision-planet-scale-expansion]] — when and why building positions were tripled
