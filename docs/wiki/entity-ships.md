---
date: 2026-04-23
type: entity
tags: [ships, animation, procedural, performance]
sources: [raw/PLAN_SUMMARY.md, raw/OPTIMIZATION_OVERVIEW.md, raw/BOUNDARY_SHIP_ROTATION_CHALLENGES.md]
---

# Entity: Ships

## What It Is

The ship system manages a fleet of 16 procedurally generated flying spacecraft that populate the scene. Ships are the most complex animated entities in NUWRRRLD — each has a unique silhouette generated from a seed, animates continuously with multiple motion layers, and varies in size from small 1x shuttles to enormous 9x capital ships. The fleet creates the sense of a living cyberpunk city skyline.

## Key Files

| File | Role |
|------|------|
| `components/three/environment/ships/FlyingShips.tsx` | Fleet manager; instantiates and positions all 16 ships |
| `components/three/environment/ships/Ship.tsx` | Individual ship: animation, lights, blueprint rendering |
| `components/three/environment/ships/CapitalShip.tsx` | Large capital ship variant with enhanced detail and geometry pools |
| `components/three/environment/ships/ShipBlueprint.ts` | Procedural generator: hull sections, fins, engines, greebles, antennas |

## Ship Types & Sizes

| Type | Count | Size tier | Parts | Memory |
|------|-------|-----------|-------|--------|
| Shuttle | 8 | 1x–2x | 4–8 | Low |
| Transport | 5 | 3x–5x | 8–16 | Medium |
| Freighter | 3 | 5x–7x | 12–24 | High |
| Capital | variable | 9x | 64–128+ | Very high → needs pools |

## ShipConfig Interface (11 properties)

```typescript
type: 'shuttle' | 'transport' | 'freighter' | 'capital'
size: number          // 1–9 scale multiplier
speed: number         // horizontal velocity
color: string         // hull color (CYBERPUNK_COLORS)
lightColor: string    // engine/nav light color
lightIntensity: number
position: Vector3Tuple
animationOffset: number  // phase offset prevents synchronized bobbing
seed: number          // drives ShipBlueprint deterministic generation
hasEscort: boolean
lightPulseRate: number
```

## Animation System

Ships animate on every `useFrame` tick with four layered motions:

1. **Horizontal wrapping** — ships move in X, teleport to opposite edge at boundary
2. **Vertical bobbing** — sine wave on Y, amplitude and frequency per-ship, offset by `animationOffset`
3. **Banking on turns** — Z-axis rotation proportional to horizontal velocity direction
4. **Engine light pulsing** — point light intensity oscillates on `lightPulseRate`

The boundary wrapping fix (from `raw/BOUNDARY_SHIP_ROTATION_CHALLENGES.md`) resolved a bug where ships would spin erratically at the teleport boundary due to the banking rotation not resetting on wrap.

## Procedural Generation

ShipBlueprint.ts uses seeded random to generate per-ship geometry:
- Hull sections (variable count based on size tier)
- Fins and wing geometry
- Engine nacelles
- Greeble details (surface complexity)
- Antenna elements

Same seed = same ship every render. See [[concept-seeded-random]] and [[concept-procedural-generation]].

## Performance

**Before pools**: each of 16 ships creates its own geometry/material objects → 40+ geometries, 100+ materials per frame → 2+ GB memory.

**With pools** (in progress): geometry shapes shared across ships of same type, materials shared across same color → target 10–15 MB for entire fleet.

Capital ships at 9x size tier require [[entity-pools]] InstancedMesh for their window/detail elements.

## Known Issues

- Memory currently 2+ GB without full pool implementation (see [[concept-performance-budget]])
- Boundary wrapping rotation bug — resolved (see `raw/BOUNDARY_SHIP_ROTATION_CHALLENGES.md`)

> ❓ Open question: Do `animationOffset` values use the seeded PRNG or `Math.random()`? If the latter, ships re-sync on page reload.

## See Also

- [[entity-pools]] — geometry/material pools that reduce ship memory footprint
- [[concept-procedural-generation]] — how ShipBlueprint generates unique silhouettes
- [[concept-seeded-random]] — why seeds make generation deterministic
- [[concept-performance-budget]] — memory and FPS targets the ship system must meet
- [[architecture-animation-systems]] — how useFrame drives ship motion
- [[decision-seeded-random-generation]] — why seeded PRNG over hand-authored models
- [[decision-resource-pool-pattern]] — why pool architecture was chosen for ships
