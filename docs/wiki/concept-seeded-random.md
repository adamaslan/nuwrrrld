---
date: 2026-04-23
type: concept
tags: [seeded-random, prng, determinism, performance]
sources: [raw/OPTIMIZATION_OVERVIEW.md]
---

# Concept: Seeded Random

## The Pattern

A seeded pseudo-random number generator (PRNG) provides deterministic randomness. Given the same seed, the generator produces the same sequence of numbers every time, on every device, on every page reload. This is implemented in `lib/utils/seededRandom.ts` and consumed by `ShipBlueprint.ts` and `BuildingBlueprint.ts`.

The core property: **same seed = same geometry, forever**. The 16 ships and 16 buildings look identical on every page load because each has a fixed seed.

## Where It Appears

- `lib/utils/seededRandom.ts` — the PRNG implementation
- `components/three/environment/ships/ShipBlueprint.ts` — consumes seeded random for all ship geometry decisions
- `components/three/environment/buildings/BuildingBlueprint.ts` — consumes seeded random for all building geometry decisions
- `config/constants.ts` or `FlyingShips.tsx` — where seeds are defined per ship
- `CityBuildings.tsx` — where seeds are defined per building

## Why It Exists

Three.js geometry objects are expensive. If a ship component used `Math.random()` directly, every re-render (including every `useFrame` tick) would compute different random numbers → different geometry decisions → different geometry objects created → geometry churn → memory leak → 2+ GB memory and unstable FPS.

Seeded random solves this by making the geometry computation deterministic. Combined with `useMemo`, the blueprint is computed once and reused. The seed acts as the cache key: if the seed hasn't changed, the geometry hasn't changed.

## Contradictions / Tensions

**Frozen variety**: The scene looks "alive" (ships moving, lights pulsing) but is visually static in geometry. Every session shows the same 16 ships in the same configurations. This is a trade-off: determinism for the sake of performance and visual consistency.

**Seed management**: Seeds are likely hardcoded constants. Adding a new ship requires assigning it a seed. Two ships with the same seed would look identical — a silent bug that's easy to miss.

> ❓ Open question: Are animation offsets (the phase offset that prevents synchronized bobbing) also seeded, or do they use `Math.random()`? If the latter, ships re-synchronize their bob animations on page reload, breaking visual consistency.

**Algorithm coupling**: The seed produces a specific silhouette only relative to a specific algorithm version. If `ShipBlueprint.ts` changes its generation logic (even adding one new `random()` call at the top), all downstream numbers shift and every ship's silhouette changes globally.

## See Also

- [[concept-procedural-generation]] — the pattern that depends on seeded random
- [[entity-ships]] — primary consumer of seeded random for hull/fin/engine generation
- [[entity-buildings]] — secondary consumer for height/window/antenna generation
- [[decision-seeded-random-generation]] — recorded decision with alternatives considered
