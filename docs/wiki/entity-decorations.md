---
date: 2026-04-24
type: entity
tags: [decorations, bridge, robots, animation, procedural]
sources: [components/three/environment/decorations/CyberpunkBridge.tsx, components/three/environment/decorations/BridgeRobots.tsx, decision-planet-scale-expansion.md]
---

# Entity: Decorations (Bridge + Robots)

## What It Is

Two new environment decoration components added during the planet-scale expansion: a diagonal suspension bridge (`CyberpunkBridge.tsx`) and a squad of walking robots (`BridgeRobots.tsx`) that traverse it. Both sit in the background zone, visible through the gap between left and right building columns. They share a parent `<group>` in `Environment.tsx` so the robots automatically inherit the bridge's orientation.

## Key Files

| File | Role |
|------|------|
| `components/three/environment/decorations/CyberpunkBridge.tsx` | Configurable diagonal suspension bridge; exports `DEFAULT_BRIDGE_CONFIG` |
| `components/three/environment/decorations/BridgeRobots.tsx` | Walking robot squad; exports `DEFAULT_ROBOT_CONFIG` |
| `components/three/Environment.tsx` | Imports both; renders `<CyberpunkBridge>` + `<BridgeRobots>` inside a shared orientation group |

## Bridge

The bridge is fully procedural — no external assets. Geometry breakdown:

- **Deck**: `BoxGeometry` flat roadbed
- **Towers** (×2): `BoxGeometry` columns at each end; topped with `ConeGeometry` cap pyramids
- **Suspension cables**: `CylinderGeometry` arcs from tower tops to deck; emissive, breathing glow
- **Railings + posts**: `BoxGeometry` edges; `TetrahedronGeometry` truss gussets at post bases
- **Decorative rings** (`TorusGeometry`): portal rings on tower faces, wheel medallions on deck, railing roundels, cable anchor halos
- **Road markings**: `PlaneGeometry` deck chevrons + `TetrahedronGeometry` warning deltas at entries

**Default config** (`DEFAULT_BRIDGE_CONFIG`):

| Property | Value |
|----------|-------|
| position | [0, 2, −45] |
| rotationY | Math.PI / 6 (30°) |
| length | 120 |
| width | 8 |
| towerHeight | 40 |
| cableCount | 12 |
| accentColor | #00ffff |

**Animation** (in `useFrame`): tower nav light pulse, sequential deck strip wave, cable glow breathe.

## Robots

Eight robots walk along the bridge deck. Each robot is procedurally generated from `seed + index` using the same seeded-random pattern as ships and buildings.

Per-robot geometry: torso, head, eyes (emissive), arms, legs, optional antenna/shoulder pads/back fin. Decorative `TorusGeometry` chest port, knee joints, shoulder sockets, head visor band.

**Default config** (`DEFAULT_ROBOT_CONFIG`):

| Property | Value |
|----------|-------|
| count | 8 |
| scale | 1.2 |
| speed | 1.5 |
| bodyColor | #1e1e30 |
| eyeColor | #00ff88 |
| seed | 77 |
| bounce | true |

**Animation**: position along bridge X oscillates (bounce mode); legs/arms swing in opposite phase; head bobs with step; eye emissive pulses.

## Orientation Inheritance

```tsx
<group position={bridgeConfig.position} rotation={[0, bridgeConfig.rotationY, 0]}>
  <CyberpunkBridge config={bridgeConfig} />
  <BridgeRobots bridgeLength={bridgeConfig.length} config={robotConfig} deckY={0.8} />
</group>
```

Robots walk along the local X-axis of the group, so the 30° diagonal is handled automatically.

## Where Used

- [[entity-scene]] — decorations are rendered as part of `Environment.tsx`
- [[entity-buildings]] — decorations are positioned in the building zone
- [[entity-screens]] — building-mounted screens 4 and 5 share the same background Z-range
- [[concept-procedural-generation]] — robot silhouettes follow same seeded-random pattern as ships
- [[concept-seeded-random]] — deterministic seed ensures same robots every render
- [[decision-planet-scale-expansion]] — bridge and robots were part of the original plan; fully implemented

## Known Issues

> ❓ Open question: With `bounce=true`, do robots at bridge ends clip through the railings? Depends on whether position clamping matches the railing inner edge.

## See Also

- [[entity-buildings]] — decorations sit in the building zone
- [[entity-screens]] — screens 4 and 5 share the background Z-range with decorations
- [[concept-procedural-generation]] — robot generation strategy
- [[concept-seeded-random]] — deterministic PRNG used for robot variation
- [[decision-planet-scale-expansion]] — why bridge and robots were added
- [[concept-performance-budget]] — bridge + robots add ~30 meshes; acceptable for 1 bridge
