---
date: 2026-04-24
type: concept
tags: [constants, maintainability, configuration, refactoring]
sources: [config/constants.ts, components/three/environment/buildings/CityBuildings.tsx, components/three/Lighting.tsx]
---

# Concept: Named Constants (No Magic Numbers)

## The Pattern

Every numeric value that appears in more than one place, or that has a non-obvious meaning, is extracted into a named constant in `config/constants.ts`. Components import and use these names rather than raw literals. This was enforced as a project-wide convention after the planet-scale expansion introduced a large batch of layout values.

**The rule in one line**: if you have to explain what `63` means in a comment, it belongs in `BUILDING_CONFIG.LEFT_X_ORIGIN` instead.

### Key constant groups

| Group | What it covers |
|-------|---------------|
| `CYBERPUNK_COLORS` | Full neon palette — all color strings |
| `LIGHT_INTENSITY` | Ambient, point, spot, emissive, HDR max |
| `CITY_LIGHTS` | Atmospheric city glow: near/far intensity, near/far/center distance |
| `BUILDING_CONFIG` | All planet-scale building layout: X/Z origins, steps, jitters, height bases/ranges, dimension ranges, ground offset, antenna threshold |
| `SCENE_DIMENSIONS` | Ground plane size, element counts (rain, drones, buildings, etc.) |
| `ANIMATION_SPEEDS` | Slow / medium / fast / flicker multipliers |
| `OPACITY` | Subtle through full opacity levels |
| `DEPTH_LAYERS` | Z-range boundaries for all four layers |
| `PROCEDURAL_CONFIG` | Ship and building procedural generation parameters |

## Where It Appears

- `config/constants.ts` — the single source of truth; all groups are `as const` frozen objects
- `components/three/environment/buildings/CityBuildings.tsx` — imports `BUILDING_CONFIG`, `CYBERPUNK_COLORS`, `SCENE_DIMENSIONS`; no magic numbers in layout loops
- `components/three/Lighting.tsx` — imports `CITY_LIGHTS`, `LIGHT_INTENSITY`, `CYBERPUNK_COLORS`; no raw intensity or distance values
- All other scene components import `CYBERPUNK_COLORS` for consistent color usage

## Contradictions / Tensions

- Some older components (pre-refactor) may still contain raw literals for one-off values. When editing those files, extract to constants as you go.
- The `BUILDING_CONFIG.MIN_HEIGHT` / `MAX_HEIGHT` fields (15 / 40) are now stale — they reflect the pre-planet-scale values and do not match the `SIDE_HEIGHT_BASE/RANGE` fields that actually drive building generation. These should be updated or removed to avoid confusion.

> ⚠️ Contradiction: `BUILDING_CONFIG.MIN_HEIGHT = 15` and `MAX_HEIGHT = 40` are legacy values from before planet-scale expansion. Actual side building heights are 75–225; background buildings are 150–360. The legacy fields are unused by `CityBuildings.tsx` but may mislead readers.

## See Also

- [[entity-buildings]] — first consumer of `BUILDING_CONFIG`
- [[entity-scene]] — `Lighting.tsx` uses `CITY_LIGHTS`
- [[decision-planet-scale-expansion]] — the expansion that made this convention necessary
- [[concept-resource-pooling]] — related: centralize shared resources, not just names
