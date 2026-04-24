---
date: 2026-04-23
type: concept
tags: [procedural, generation, ships, buildings, blueprints]
sources: [raw/OPTIMIZATION_OVERVIEW.md, raw/ENVIRONMENT_OPTIMIZATION_GUIDE.md]
---

# Concept: Procedural Generation

## The Pattern

Ships and buildings in NUWRRRLD are not hand-modelled 3D assets. They are computed at runtime from seed values using blueprint generators (`ShipBlueprint.ts`, `BuildingBlueprint.ts`). A blueprint generator takes a seed number and configuration (size, type, color) and deterministically produces a list of geometry elements — hull sections, fins, engines, windows, antennas. The same inputs always produce the same output.

This means 16 unique ships and 16 unique buildings are created from code, not from a 3D artist's work. Changing the generation algorithm produces globally different results; changing a seed produces a different variant.

## Where It Appears

- **[[entity-ships]]** — `ShipBlueprint.ts` generates per-ship hull sections, fins, engine nacelles, greeble details, antennas
- **[[entity-buildings]]** — `BuildingBlueprint.ts` generates per-building height, tiers, window layout, antenna presence
- **[[concept-seeded-random]]** — the PRNG that makes generation deterministic; procedural generation depends on seeded random as its foundation

## Why It Exists

Three alternatives were considered:

1. **Hand-authored 3D models**: Would require a 3D artist and cannot scale to 16+ unique variants without enormous asset work. Also inflexible — changing a ship type means re-authoring the model.
2. **Math.random() generation**: Would produce different shapes on every render (geometry churn), destroying performance and visual consistency.
3. **Pre-baked geometry**: Static 3D data committed to the repo. Inflexible; changing configuration requires re-baking.

Procedural generation with seeded random threads between these — unique variety without hand-authoring, and consistent output without pre-baking.

## Contradictions / Tensions

**Artistic iteration is slow**: When you change the generation algorithm (e.g., add a new antenna shape), every ship and building that uses that code path changes. There is no way to update one ship in isolation without giving it a different seed, which changes its entire silhouette.

**Seeds are opaque**: The seed-to-silhouette relationship is not obvious. You cannot look at a seed number and know what the ship will look like without running the generator.

**Detail quality ceiling**: Procedural generation with a PRNG is limited in artistic quality compared to hand-modelled assets. The cyberpunk aesthetic tolerates this because greeble/industrial shapes are forgiving, but faces or organic forms would not work with this approach.

## See Also

- [[concept-seeded-random]] — the PRNG mechanism that makes this deterministic
- [[entity-ships]] — primary implementation of procedural generation
- [[entity-buildings]] — secondary implementation, with 960-window InstancedMesh challenge
- [[decision-seeded-random-generation]] — recorded decision explaining why this approach was chosen
