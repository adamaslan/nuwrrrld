---
date: 2026-04-23
type: decision
tags: [decision, planet, scale, buildings, screens, environment]
sources: [components/three/SceneContent.tsx, components/three/environment/buildings/CityBuildings.tsx, config/mediaConfig.ts, config/constants.ts]
---

# Decision: Planet-Scale Expansion + 2 New Building Screens

## Decision

Triple the perceived scale of the environment so the city feels like it sits on a planet surface, and add 2 new TV screens mounted on buildings linking to Archive and NuWrrrld Financial.

## Date

2026-04-23

## Context

The current scene has buildings spread across a compact area (left buildings at x: −12 to −42, right at x: +12 to +42, background at z: −35 to −50) with a sky dome scaled to 200 units. It reads as a small urban set rather than a city on a planetary scale. The request is to:

1. Make the environment feel 3× larger — planetary, vast, the buildings as specks in a world
2. Add 2 new screens in the building zone linking to Archive and NuWrrrld Financial

## Current State (baseline)

| Element | Current value |
|---------|--------------|
| Sky dome scale | 200 × 200 × 200 |
| Left buildings X | −12 to −42 |
| Right buildings X | +12 to +42 |
| Background buildings Z | −35 to −50 |
| Background building height | 50–120 units |
| Camera far clip | 300 |
| Fog start / end | 50 / 200 |
| TV screens | 3 (y=68, y=40, y=12) |
| OrbitControls maxDistance | 100 |

## Proposed Changes

### 1. Sky Dome — scale 200 → 600

In [SceneContent.tsx:51](components/three/SceneContent.tsx#L51):
```tsx
// Before
<mesh ref={meshRef} scale={[200, 200, 200]}>

// After
<mesh ref={meshRef} scale={[600, 600, 600]}>
```

The dome renders `side: THREE.BackSide` so scaling it outward expands the visible sky without affecting anything else.

---

### 2. Scene fog — push far to match new scale

In [Scene.tsx:31](components/three/Scene.tsx#L31):
```tsx
// Before
<fog attach="fog" args={['#0a0510', 50, 200]} />

// After
<fog attach="fog" args={['#0a0510', 150, 600]} />
```

Camera far clip in [Scene.tsx:22](components/three/Scene.tsx#L22):
```tsx
// Before
far: 300,

// After
far: 800,
```

---

### 3. OrbitControls — expand maxDistance

In [SceneContent.tsx:78](components/three/SceneContent.tsx#L78):
```tsx
// Before
maxDistance={100}

// After
maxDistance={300}
```

---

### 4. Building positions — spread 3× outward

In [CityBuildings.tsx](components/three/environment/buildings/CityBuildings.tsx), multiply all X and Z spread values by 3:

**Left buildings** (currently `−12 − i*6`):
```ts
// Before
position: [
  -12 - i * 6 + randomFn(i + 300) * 2,
  height / 2 - 2,
  -12 - randomFn(i + 400) * 20,
]

// After
position: [
  -36 - i * 18 + randomFn(i + 300) * 6,
  height / 2 - 2,
  -36 - randomFn(i + 400) * 60,
]
```

**Right buildings** (currently `+12 + i*6`):
```ts
// Before
position: [
  12 + i * 6 + randomFn(i + 300) * 2,
  height / 2 - 2,
  -12 - randomFn(i + 400) * 20,
]

// After
position: [
  36 + i * 18 + randomFn(i + 300) * 6,
  height / 2 - 2,
  -36 - randomFn(i + 400) * 60,
]
```

**Background megastructures** (currently `−30 + i*10`, z: `−35 − rand*15`):
```ts
// Before
position: [
  -30 + i * 10 + randomFn(i + 300) * 3,
  height / 2 - 2,
  -35 - randomFn(i + 400) * 15,
]

// After
position: [
  -90 + i * 30 + randomFn(i + 300) * 9,
  height / 2 - 2,
  -105 - randomFn(i + 400) * 45,
]
```

**Building heights** — also scale up to match planet feel:
```ts
// Left/right: before 25 + rand*50 → after 75 + rand*150
// Background: before 50 + rand*70 → after 150 + rand*210
```

---

### 5. Two new building-mounted screens

Add to `SCREEN_CONFIGS` in [mediaConfig.ts](config/mediaConfig.ts).

These screens are positioned in the building zone — off-center X so they appear embedded in the city, at mid-height Y, pushed back in Z to sit among the buildings.

**Screen 4 — Archive** (left building zone, amber accent):
```ts
{
  id: 4,
  type: 'image',
  path: '/media/loved.jpg',       // placeholder — replace with archive image
  position: [-28, 35, -30],       // left building zone, mid-height, building depth
  rotation: [0, 0.3, 0],          // angled slightly toward camera
  baseSize: 18,
  aspectRatio: 900 / 1600,
  title: 'Archive',
  accentColor: '#ffaa00',
  links: [
    { label: 'Archive', url: 'https://archive.org', color: '#ffaa00' },
  ],
  sidePanel: {
    enabled: true,
    position: 'right',
    widthRatio: 0.85,
    text: 'Archive\n\nStatus: ACTIVE\nAll Media\nclick for info',
    textColor: '#ffaa00',
    textSize: 1.1,
    textAlign: 'center',
    backgroundColor: '#2a1a0a',
    backgroundOpacity: 0.9,
    glowEnabled: true,
    glowColor: '#ffaa00',
    glowIntensity: 0.5,
  },
},
```

**Screen 5 — NuWrrrld Financial** (right building zone, cyan accent):
```ts
{
  id: 5,
  type: 'image',
  path: '/media/loved.jpg',       // placeholder — replace with financial image
  position: [28, 28, -25],        // right building zone, mid-height, building depth
  rotation: [0, -0.3, 0],         // angled slightly toward camera
  baseSize: 18,
  aspectRatio: 900 / 1600,
  title: 'NuWrrrld Financial',
  accentColor: '#00ffff',
  links: [
    { label: 'NuWrrrld Financial', url: 'https://financial.nuwrrrld.com', color: '#00ffff' },
  ],
  sidePanel: {
    enabled: true,
    position: 'left',
    widthRatio: 0.85,
    text: 'NuWrrrld\nFinancial\n\nMarkets: LIVE\nData: REAL-TIME',
    textColor: '#00ffff',
    textSize: 1.1,
    textAlign: 'center',
    backgroundColor: '#0a1a2a',
    backgroundOpacity: 0.9,
    glowEnabled: true,
    glowColor: '#00ffff',
    glowIntensity: 0.5,
  },
},
```

> ❓ **Action needed**: Replace `path: '/media/loved.jpg'` placeholders with actual images for Archive and NuWrrrld Financial once assets exist. Aspect ratios should be updated to match.

> ❓ **Action needed**: Update Archive and NuWrrrld Financial URLs to the real destinations once known.

---

### 6. constants.ts — update SCENE_DIMENSIONS to reflect new scale

```ts
// GROUND_PLANE_WIDTH: 300 → 900
// GROUND_PLANE_HEIGHT: 375 → 1125
GROUND_PLANE_WIDTH: 900,
GROUND_PLANE_HEIGHT: 1125,
```

And update `DEPTH_LAYERS`:
```ts
BACKGROUND_START: -180,
BACKGROUND_END:   -300,
```

---

## File Change Summary

| File | What changes |
|------|-------------|
| [SceneContent.tsx](components/three/SceneContent.tsx#L51) | Sky dome scale 200 → 600 |
| [Scene.tsx](components/three/Scene.tsx#L22) | `far: 800`, fog `(150, 600)` |
| [SceneContent.tsx](components/three/SceneContent.tsx#L78) | `maxDistance: 300` |
| [CityBuildings.tsx](components/three/environment/buildings/CityBuildings.tsx) | All X/Z positions × 3, heights × 3 |
| [mediaConfig.ts](config/mediaConfig.ts) | Add screens 4 (Archive) and 5 (NuWrrrld Financial) |
| [constants.ts](config/constants.ts) | `GROUND_PLANE_WIDTH/HEIGHT` × 3, `DEPTH_LAYERS` × 3 |

## Alternatives Considered

**A — Scale the entire scene with a `<group scale={[3,3,3]}>` wrapper**: Simple one-line change but scales everything uniformly — screens get 3× bigger and need repositioning, ships get 3× further away, fog disappears. Too blunt.

**B — Only push buildings outward, leave sky dome**: Buildings would float in the void without a matching sky. The dome must scale with the spread.

**C — Chosen: Targeted × 3 multipliers on building positions + sky dome + fog/clip**: Each element scaled independently so the overall scene reads as 3× larger without breaking the existing 3 screens or ship positions.

## Consequences

- Ships will now fly through a much emptier middle space — may need spawn area adjustment in FlyingShips.tsx to match new scale (not in this change)
- The 3 existing screens stay at their current positions (y=68/40/12, z=−10/−6/−3) — they remain the focal point; the new building screens are background elements
- Rain and particles may feel sparse at 3× scale — RAIN_COUNT could be increased separately
- Mobile orbit may feel lost in empty space — camera start position `[0, 5, 25]` may need slight pull-back to `[0, 15, 60]`

---

### 7. Bridge — new component `CyberpunkBridge.tsx`

A diagonal bridge spanning between the building columns, visible through the gap between left and right buildings. Positioned in the midground-to-background transition zone. Fully configurable via a `BridgeConfig` object.

**New file**: `components/three/environment/decorations/CyberpunkBridge.tsx`

**Config shape**:
```ts
export interface BridgeConfig {
  // Position of bridge center
  position: [number, number, number];
  // Y-axis rotation in radians — controls diagonal angle
  // 0 = straight across X, Math.PI/4 = 45° diagonal
  rotationY: number;
  // Total span length (X-axis before rotation)
  length: number;
  // Bridge deck width
  width: number;
  // Height of suspension towers above deck
  towerHeight: number;
  // Number of suspension cable arches
  cableCount: number;
  // Neon accent color for lights and cables
  accentColor: string;
  // Secondary color for structural elements
  structureColor: string;
  // Emissive intensity of cable lights (0–1)
  glowIntensity: number;
}

export const DEFAULT_BRIDGE_CONFIG: BridgeConfig = {
  position: [0, 2, -45],         // center of building gap, ground level, behind mid buildings
  rotationY: Math.PI / 6,        // 30° diagonal
  length: 120,
  width: 8,
  towerHeight: 40,
  cableCount: 12,
  accentColor: '#00ffff',
  structureColor: '#1a1a2e',
  glowIntensity: 0.6,
};
```

**Bridge geometry** (all procedural, no assets):
```
- Deck: BoxGeometry (length × 0.8 × width) — flat roadbed, structureColor
- Road surface: PlaneGeometry on top of deck — slightly lighter color
- Left tower: BoxGeometry (2 × towerHeight × 2) at position [-length/2, towerHeight/2, 0]
- Right tower: BoxGeometry (2 × towerHeight × 2) at position [+length/2, towerHeight/2, 0]
- Tower crossbeam: BoxGeometry (6 × 1 × 1) at tower tops
- Suspension cables: cableCount thin CylinderGeometry arcs from tower tops to deck surface,
    distributed evenly across length, accentColor emissive
- Side railings: BoxGeometry (length × 0.5 × 0.2) at deck edges, structureColor
- Railing posts: N thin boxes evenly spaced along railing
- Tower nav lights: SphereGeometry (r=1) at each tower top, accentColor emissive, pulsing
- Deck strip lights: 2 rows of small emissive spheres (r=0.3) running deck length, accentColor

Circles on bridge:
- Portal rings: 3× TorusGeometry (r=4, tube=0.3) mounted vertically on tower faces,
    accentColor emissive, evenly spaced up the tower height — decorative archway motif
- Wheel medallions: 2× TorusGeometry (r=2, tube=0.2) flat on deck surface at quarter-span
    marks, structureColor with accentColor emissive inner ring (nested torus, r=1.2)
- Railing roundels: small TorusGeometry (r=0.4, tube=0.08) between every other railing post,
    accentColor emissive — repeating rhythm along full bridge length
- Cable anchor halos: TorusGeometry (r=0.6, tube=0.1) at each cable-to-deck attachment point,
    accentColor emissive, pulsing in sync with cable glow breath

Triangles on bridge:
- Truss gussets: TetrahedronGeometry (r=1.5) pairs flanking each railing post base,
    structureColor metallic — industrial truss language
- Tower cap pyramids: 2× ConeGeometry (r=1.5, h=4, segments=4) crown each tower top above
    the nav light sphere, accentColor emissive tip — warning-beacon silhouette
- Deck chevrons: PlaneGeometry triangles (base=width, h=2) painted as road markings on the
    road surface at centerline — alternating accentColor and a dimmer secondary stripe
- Warning delta shields: TetrahedronGeometry (r=0.8) mounted at bridge entry points on both
    ends, accentColor emissive, rotating slowly (Y-axis, 0.2 rad/s) as hazard markers
```

**Animation** (in `useFrame`):
```ts
// Tower nav lights pulse
navLightIntensity = 0.8 + Math.sin(time * 2) * 0.4

// Deck strip lights — sequential wave pulse along length
deckLights[i].intensity = 0.4 + Math.sin(time * 3 + i * 0.4) * 0.3

// Cable glow — subtle breathe
cableMat.emissiveIntensity = glowIntensity * (0.7 + Math.sin(time * 0.8) * 0.3)
```

**Where to add it**:
- Import in `BackgroundLayer.tsx` alongside `DistantMegaStructures`
- Or, given the 3× scale expansion, add directly to `Environment.tsx` as a sibling of `CityBuildings`
- Pass `DEFAULT_BRIDGE_CONFIG` or a custom config as a prop

**Recommended placement after 3× scale**:
```ts
position: [0, 2, -45],   // sits in the gap between left/right building columns
rotationY: Math.PI / 6,  // 30° diagonal — visible from default camera position
```

---

### 8. Bridge Robots — new component `BridgeRobots.tsx`

Robots that walk along the bridge deck surface. Fully configurable count and appearance. Procedurally generated silhouettes using the same seeded-random pattern as ships and buildings.

**New file**: `components/three/environment/decorations/BridgeRobots.tsx`

**Config shape**:
```ts
export interface RobotConfig {
  // How many robots on the bridge
  count: number;
  // Scale of each robot (1 = ~2 world units tall)
  scale: number;
  // Walking speed (units/sec)
  speed: number;
  // Primary body color
  bodyColor: string;
  // Emissive eye/sensor color
  eyeColor: string;
  // Seed for procedural variation (head shape, limb proportions)
  seed: number;
  // Whether robots reverse at bridge ends (true) or teleport (false)
  bounce: boolean;
}

export const DEFAULT_ROBOT_CONFIG: RobotConfig = {
  count: 6,
  scale: 1.0,
  speed: 1.5,
  bodyColor: '#2a2a3e',
  eyeColor: '#00ffff',
  seed: 42,
  bounce: true,
};
```

**Robot geometry** (per robot, procedural from seed + index):
```
- Torso: BoxGeometry — main body, bodyColor metallic
- Head: BoxGeometry (slightly narrower) — mounted above torso
- Eyes: 2× SphereGeometry (r=0.15) — emissive eyeColor, front-facing
- Left arm: BoxGeometry (thin, long) — offset from torso, angled down
- Right arm: BoxGeometry (thin, long) — mirrored
- Left leg: BoxGeometry — below torso
- Right leg: BoxGeometry — mirrored, phase-offset for walk cycle
- Antenna: CylinderGeometry (thin) on head top — optional per seed
- Shoulder pads: BoxGeometry (wide, flat) — optional per seed

Circles on robots:
- Chest port: TorusGeometry (r=0.2, tube=0.04) centered on torso front, eyeColor emissive —
    reactor / power socket detail
- Knee joints: TorusGeometry (r=0.12, tube=0.03) at each knee, bodyColor with slight emissive
    — mechanical joint ring, animates scale 0.9–1.0 with step phase
- Shoulder socket: TorusGeometry (r=0.14, tube=0.03) where each arm meets torso, structureColor
- Head visor band: TorusGeometry (r=0.22, tube=0.04, arc=Math.PI) half-ring across head front,
    eyeColor emissive — gives a visor / helmet brim appearance
- Sensor dot array: 3–5× SphereGeometry (r=0.04) in a small arc on torso face, eyeColor
    emissive — randomized per seed for visual variation

Triangles on robots:
- Chest emblem: TetrahedronGeometry (r=0.18) on torso front center, eyeColor emissive —
    faction or unit insignia
- Knee guards: ConeGeometry (r=0.15, h=0.25, segments=3) flat face forward on each knee,
    bodyColor — armored knee plate with triangular profile
- Shoulder spikes: ConeGeometry (r=0.1, h=0.3, segments=3) on outer shoulder pad top,
    bodyColor — optional per seed (50% chance)
- Foot toe-cap: ConeGeometry (r=0.12, h=0.2, segments=3) at front of each foot, pointing
    forward — boot tip detail, structureColor
- Back fin: TetrahedronGeometry (r=0.2) mounted on upper back, bodyColor metallic — jetpack
    nub / dorsal plate, optional per seed (30% chance)
```

**Walk animation** (in `useFrame`):
```ts
// Each robot has a phase offset = index * (bridgeLength / count)
// Position along bridge X (before bridge rotation applied):
robotX = startX + ((time * speed + phaseOffset) % bridgeLength) - bridgeLength/2

// If bounce=true, use Math.abs(sawtooth) pattern instead of modulo

// Leg swing: left leg rotates +sin, right leg rotates -sin
leftLeg.rotation.x  =  Math.sin(time * speed * 4 + phaseOffset) * 0.4
rightLeg.rotation.x = -Math.sin(time * speed * 4 + phaseOffset) * 0.4

// Arm swing: opposite phase to legs
leftArm.rotation.x  = -Math.sin(time * speed * 4 + phaseOffset) * 0.3
rightArm.rotation.x =  Math.sin(time * speed * 4 + phaseOffset) * 0.3

// Head bob: subtle Y offset
robotGroup.position.y = deckY + 0.05 * Math.abs(Math.sin(time * speed * 4 + phaseOffset))

// Eye pulse: sync with step
eyeMat.emissiveIntensity = 0.8 + Math.sin(time * 2 + phaseOffset) * 0.2
```

**How robots inherit bridge orientation**:
Robots are rendered inside a `<group>` that matches the bridge's `position` and `rotationY`. They walk along the local X-axis of that group, so the diagonal is handled automatically:
```tsx
<group position={bridgeConfig.position} rotation={[0, bridgeConfig.rotationY, 0]}>
  <CyberpunkBridge config={bridgeConfig} />
  <BridgeRobots bridgeLength={bridgeConfig.length} config={robotConfig} deckY={0.8} />
</group>
```

**Recommended defaults after 3× scale**:
```ts
count: 8,
scale: 1.2,       // slightly larger to be visible at distance
speed: 1.5,
bodyColor: '#1e1e30',
eyeColor: '#00ff88',
seed: 77,
bounce: true,
```

---

## File Change Summary (updated)

| File | What changes |
|------|-------------|
| [SceneContent.tsx:51](components/three/SceneContent.tsx#L51) | Sky dome scale 200 → 600 |
| [Scene.tsx:22,31](components/three/Scene.tsx#L22) | `far: 800`, fog `(150, 600)` |
| [SceneContent.tsx:78](components/three/SceneContent.tsx#L78) | `maxDistance: 300` |
| [CityBuildings.tsx](components/three/environment/buildings/CityBuildings.tsx) | All X/Z positions × 3, heights × 3 |
| [mediaConfig.ts](config/mediaConfig.ts) | Add screens 4 (Archive) and 5 (NuWrrrld Financial) |
| [constants.ts](config/constants.ts) | `GROUND_PLANE_WIDTH/HEIGHT` × 3, `DEPTH_LAYERS` × 3 |
| `components/three/environment/decorations/CyberpunkBridge.tsx` | **NEW** — configurable diagonal bridge |
| `components/three/environment/decorations/BridgeRobots.tsx` | **NEW** — configurable walking robots on bridge |
| [Environment.tsx](components/three/Environment.tsx) | Import + render `<BridgeScene>` (bridge + robots wrapper group) |

## Alternatives Considered

**A — Scale the entire scene with a `<group scale={[3,3,3]}>` wrapper**: Simple one-line change but scales everything uniformly — screens get 3× bigger and need repositioning, ships get 3× further away, fog disappears. Too blunt.

**B — Only push buildings outward, leave sky dome**: Buildings would float in the void without a matching sky. The dome must scale with the spread.

**C — Robots as sprites / billboards instead of 3D geometry**: Cheaper to render, easier to implement. Rejected — at the scale of 8 walking robots the geometry cost is trivial and sprites would look flat against the rest of the 3D scene.

**D — Chosen: Targeted × 3 multipliers on building positions + sky dome + fog/clip + procedural bridge + procedural robots**: Each element scaled/added independently. Bridge and robots share a parent group so orientation is inherited automatically.

## Consequences

- Ships will now fly through a much emptier middle space — may need spawn area adjustment in `FlyingShips.tsx` to match new scale (not in this change)
- The 3 existing screens stay at their current positions (y=68/40/12, z=−10/−6/−3) — they remain the focal point; the new building screens are background elements
- Rain and particles may feel sparse at 3× scale — `RAIN_COUNT` could be increased separately
- Camera start position `[0, 5, 25]` may need pull-back to `[0, 15, 60]` to frame the wider scene
- Bridge + robots add ~30 meshes total — well within performance budget at 1 bridge

## Validated By

**Fully implemented** across commits `ebf81ea` through `2df2d06` (branch `feature/nuwrrrld-morph-canvas-screen`, PR #40, deployed to Vercel).

| Change | Status | Commit |
|--------|--------|--------|
| Sky dome 200 → 600 | ✅ Done | `ebf81ea` |
| Fog 150→600, far=800 | ✅ Done | `ebf81ea` |
| maxDistance=300 | ✅ Done | `ebf81ea` |
| Building positions × 3 | ✅ Done | `ebf81ea` |
| Screen 4 (Archive, canvas) | ✅ Done | `287c0b9` |
| Screen 5 (NuWrrrld Financial) | ✅ Done | `ebf81ea` |
| GROUND_PLANE_WIDTH=1350, HEIGHT=1688 | ✅ Done | `ebf81ea` |
| CyberpunkBridge.tsx | ✅ Done | `ebf81ea` |
| BridgeRobots.tsx | ✅ Done | `ebf81ea` |
| All magic numbers → BUILDING_CONFIG / CITY_LIGHTS | ✅ Done | `2df2d06` |

Build passes locally and on Vercel. Scene renders without errors.

## See Also

- [[entity-buildings]] — building positions and generation
- [[entity-scene]] — sky dome, fog, camera, canvas
- [[entity-screens]] — existing 3 screens; new screens follow same config pattern
- [[entity-layers]] — bridge sits in background/midground transition zone
- [[concept-depth-stratification]] — Z-range conventions bridge and robots must respect
- [[concept-procedural-generation]] — robot geometry follows same seeded-random pattern as ships
- [[decision-portrait-first-design]] — new screens angled toward camera to remain legible in portrait
