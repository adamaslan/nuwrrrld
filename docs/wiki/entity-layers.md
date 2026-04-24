---
date: 2026-04-23
type: entity
tags: [layers, depth, parallax, environment]
sources: [raw/ENVIRONMENT_OPTIMIZATION_GUIDE.md, raw/PHASE_3_DECOMPOSITION.md]
---

# Entity: Layers

## What It Is

The layer system organizes all scene elements into four explicit Z-position ranges. Layers are not a rendering technique — they are an architectural pattern: each `*Layer.tsx` component groups the visual elements that belong at that depth, creating a clear ownership model for where new scene elements should live. The Z-position differences between layers produce a natural parallax effect as the camera moves.

## Key Files

| File | Z Range | Contents |
|------|---------|---------|
| `components/three/environment/layers/ForegroundLayer.tsx` | −5 to 0 | Debris particles (100), holographic fragments (8 rotating octahedrons) |
| `components/three/environment/layers/MidgroundLayer.tsx` | −10 to −20 | Mid-depth decorative elements |
| `components/three/environment/layers/BackgroundLayer.tsx` | −60 to −100 | Distant megastructures, far-field detail |
| `components/three/environment/layers/OppositeLayer.tsx` | +25 to +65 | Reverse-facing backdrop behind the camera |

## Layer Contents in Detail

**ForegroundLayer (closest)**: Two particle systems — 100 floating debris points using `Points` geometry, and 8 holographic data fragments (wireframe octahedrons that rotate slowly). These elements are closest to camera and move fastest in parallax.

**MidgroundLayer**: Mid-depth scene elements. Buildings effectively occupy this zone even though they are rendered through `CityBuildings.tsx` rather than being direct MidgroundLayer children.

**BackgroundLayer (farthest forward)**: Distant megastructures that create depth. Elements here move barely at all during camera panning — they feel "locked" to the horizon.

**OppositeLayer (behind camera, positive Z)**: A unique design choice — this layer places elements at positive Z values (closer to the viewer from behind), creating a backdrop that is technically behind the camera's default forward direction. Used for environmental immersion rather than direct composition.

## Parallax Mechanics

The depth difference between layers is what creates parallax. When the camera pans:
- ForegroundLayer elements (z near 0) shift the most in screen space
- BackgroundLayer elements (z −60 to −100) shift barely at all
- TV screens (z −3, −6, −10) have subtle relative motion between them

This is entirely geometric — no special parallax shader needed. See [[concept-depth-stratification]].

## Where Used

- [[entity-scene]] — all layers render inside Environment.tsx, which is inside SceneContent.tsx
- [[entity-buildings]] — buildings inhabit the midground depth range
- [[entity-ships]] — ships traverse across foreground/midground Z ranges
- [[architecture-scene-composition]] — how layers integrate into the full assembly

## Known Issues

> ⚠️ The OppositeLayer at positive Z values breaks the depth metaphor — elements at z=+25 are "behind the camera" in the default forward-Z orientation of Three.js. This is intentional but means the layer's elements only appear if the camera or scene is oriented to see them. A new contributor might not expect this behavior.

> ❓ Open question: What specific elements currently live in MidgroundLayer and BackgroundLayer? The source exploration identified their Z-ranges but not their full contents.

## See Also

- [[concept-depth-stratification]] — the design principle this entity implements
- [[decision-depth-stratification-layers]] — why 4 explicit ranges were chosen
- [[entity-scene]] — layers are rendered inside Environment.tsx
- [[entity-buildings]] — buildings effectively occupy midground depth
- [[architecture-scene-composition]] — full assembly including layer placement
