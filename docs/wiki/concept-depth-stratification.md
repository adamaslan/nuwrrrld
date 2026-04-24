---
date: 2026-04-23
type: concept
tags: [depth, layers, parallax, z-position, scene-organization]
sources: [raw/PHASE_3_DECOMPOSITION.md, raw/ENVIRONMENT_OPTIMIZATION_GUIDE.md]
---

# Concept: Depth Stratification

## The Pattern

The scene is organized into four explicit Z-position ranges rather than placing elements at arbitrary Z values. Each range is owned by a `*Layer.tsx` component that acts as the container for all elements at that depth. The Z-position differences between layers produce a natural parallax effect during camera movement, with closer elements shifting more than farther ones.

```
OppositeLayer     z: +25 to +65   (behind camera — reverse backdrop)
ForegroundLayer   z: −5 to 0      (closest — debris, holographics)
MidgroundLayer    z: −10 to −20   (mid — decorative elements)
BackgroundLayer   z: −60 to −100  (farthest — megastructures)
```

TV screens are not in a layer component but respect the same convention: z=−3, z=−6, z=−10 (near-foreground range).

## Where It Appears

- **[[entity-layers]]** — the four `*Layer.tsx` components that implement this
- **[[entity-screens]]** — screen Z positions (−3, −6, −10) follow the convention
- **[[entity-ships]]** — ships traverse across Z ranges as they fly
- **[[entity-buildings]]** — buildings inhabit the midground Z range
- **`/add-environment-layer` command** — the slash command encodes this convention so new layers are placed correctly

## Why It Exists

Before the layer decomposition, `Environment.tsx` was 1678 lines with all elements at arbitrary Z values. Problems:
1. No clear ownership of where new elements belong
2. Z-fighting risk where elements accidentally share the same Z
3. No systematic parallax — depth effect was inconsistent

Explicit Z-ranges solve all three: new elements have a designated home, Z-fighting within a layer is predictable, and parallax is consistent because depth differences are intentional.

## Contradictions / Tensions

**OppositeLayer breaks the metaphor**: Positive Z values place elements "behind the camera" in Three.js's default coordinate system (camera looks down −Z by default). This is a deliberate design choice for environmental immersion, but it is counterintuitive — a new contributor might not expect that positive-Z elements appear at all.

**Buildings as implicit midground**: Buildings rendered via `CityBuildings.tsx` effectively occupy the midground Z range, but they are not children of `MidgroundLayer.tsx`. They are direct children of `Environment.tsx`. This is a mild inconsistency — the layer ownership is implicit rather than explicit for buildings.

**Ships cross layers**: Flying ships traverse horizontally across the scene and their Z position is set by their configuration, not by a layer component. A ship could theoretically be configured at z=−80 (background range) while rendered by `FlyingShips.tsx` outside any layer component.

## See Also

- [[entity-layers]] — the physical implementation of this concept
- [[decision-depth-stratification-layers]] — why 4 ranges were chosen and alternatives rejected
- [[entity-screens]] — screen Z positions as a practical application of depth stratification
- [[architecture-scene-composition]] — how layers fit into the full scene assembly
