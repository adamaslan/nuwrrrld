# PHASE 3: DECOMPOSITION - Environment.tsx Refactoring

## Phase 3 Overview

**Goal**: Break the 1678-line Environment.tsx into focused, maintainable component files.

**Duration**: 3-4 days

**Risk Level**: Medium

**Design Principles Applied**:
- Guideline #14: Code Decomposition
- Guideline #2: Single Responsibility Principle
- Guideline #6: Object-Oriented Principles (composition)

---

## 3.1 New Directory Structure

Create the following directory structure under `components/three/`:

```
environment/
├── index.ts                      # Barrel exports
├── Environment.tsx               # Main orchestrator (~100 lines)
│
├── layers/
│   ├── ForegroundLayer.tsx       # Debris + DataFragments
│   ├── MidgroundLayer.tsx        # Platforms + Drones
│   ├── BackgroundLayer.tsx       # Megastructures + LightBeams
│   └── OppositeLayer.tsx         # Reverse-facing backdrop
│
├── buildings/
│   ├── CityBuildings.tsx         # Building array orchestrator
│   ├── CyberpunkBuilding.tsx     # Individual building component
│   └── types.ts                  # Building-specific types
│
├── ships/
│   ├── FlyingShips.tsx           # Ship fleet orchestrator
│   ├── Ship.tsx                  # Standard ship component
│   ├── CapitalShip.tsx           # Capital ship with details
│   └── types.ts                  # Ship-specific types
│
├── atmosphere/
│   ├── Rain.tsx                  # Rain particle system
│   ├── FogLayers.tsx             # Fog layer effects
│   └── NeonGridLines.tsx         # Ground grid lines
│
├── decorations/
│   ├── NeonSigns.tsx             # Animated neon signs
│   ├── HolographicElements.tsx   # Floating holograms
│   ├── AnimatedBillboards.tsx    # Color-cycling billboards
│   └── Puddles.tsx               # Ground reflective puddles
│
└── utils/
    ├── seededRandom.ts           # Deterministic random
    └── buildingGenerator.ts      # Building configuration generator
```

---

## 3.2 Extraction Order

Extract components in this sequence to minimize dependencies:

1. **Utils** (no dependencies)
2. **Buildings** (depends on utils)
3. **Ships** (depends on utils)
4. **Atmosphere** (minimal dependencies)
5. **Decorations** (minimal dependencies)
6. **Layers** (depends on some decorations)
7. **Main Environment** (orchestrates all)

---

## 3.3 Detailed Component Specifications

### 3.3.1 Utilities

#### File: `components/three/environment/utils/seededRandom.ts`

```typescript
/**
 * Deterministic pseudo-random number generator.
 *
 * Uses seeded randomization to ensure consistent results across renders.
 * Same seed + index always produces the same "random" value.
 *
 * @param seed - Base seed for randomization
 * @param index - Index for this specific random value
 * @returns Pseudo-random number between 0 and 1
 *
 * @example
 * ```typescript
 * const seed = 42;
 * const x = seededRandom(seed, 0); // Always returns same value
 * const y = seededRandom(seed, 1); // Different but consistent value
 * ```
 */
export function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 9999) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates random position within bounds using seeded random.
 *
 * @param seed - Base seed
 * @param index - Position index
 * @param xRange - [min, max] X bounds
 * @param yRange - [min, max] Y bounds
 * @param zRange - [min, max] Z bounds
 * @returns Position tuple [x, y, z]
 */
export function seededPosition(
  seed: number,
  index: number,
  xRange: [number, number],
  yRange: [number, number],
  zRange: [number, number]
): [number, number, number] {
  const x = xRange[0] + seededRandom(seed, index) * (xRange[1] - xRange[0]);
  const y = yRange[0] + seededRandom(seed, index + 1000) * (yRange[1] - yRange[0]);
  const z = zRange[0] + seededRandom(seed, index + 2000) * (zRange[1] - zRange[0]);

  return [x, y, z];
}
```

#### File: `components/three/environment/utils/buildingGenerator.ts`

```typescript
import { seededRandom } from './seededRandom';
import type { BuildingConfig } from '@/types/three-scene';
import { CYBERPUNK_COLORS, BUILDING_CONFIG } from '@/config/constants';

/**
 * Generates building configuration with deterministic randomization.
 *
 * @param index - Building index for seeding
 * @param seed - Base random seed
 * @param basePosition - Base [x, y, z] position
 * @param heightRange - [min, max] height bounds
 * @returns Complete building configuration
 */
export function generateBuildingConfig(
  index: number,
  seed: number,
  basePosition: [number, number, number],
  heightRange: [number, number]
): BuildingConfig {
  const height =
    heightRange[0] +
    seededRandom(seed, index) * (heightRange[1] - heightRange[0]);

  const width =
    BUILDING_CONFIG.MIN_WIDTH +
    seededRandom(seed, index + 100) *
    (BUILDING_CONFIG.MAX_WIDTH - BUILDING_CONFIG.MIN_WIDTH);

  const depth =
    BUILDING_CONFIG.MIN_WIDTH +
    seededRandom(seed, index + 200) *
    (BUILDING_CONFIG.MAX_WIDTH - BUILDING_CONFIG.MIN_WIDTH);

  const colors = [
    CYBERPUNK_COLORS.CYAN,
    CYBERPUNK_COLORS.MAGENTA,
    CYBERPUNK_COLORS.AMBER,
    CYBERPUNK_COLORS.GREEN,
  ] as const;

  const windowColor = colors[
    Math.floor(seededRandom(seed, index + 500) * colors.length)
  ];

  return {
    position: [
      basePosition[0] + seededRandom(seed, index + 300) * 2,
      height / 2 - 2,
      basePosition[2] - seededRandom(seed, index + 400) * 20,
    ],
    size: [width, height, depth],
    windowColor,
    hasAntenna: seededRandom(seed, index + 600) > BUILDING_CONFIG.ANTENNA_THRESHOLD,
  };
}

/**
 * Generates array of building configurations.
 *
 * @param count - Number of buildings to generate
 * @param seed - Base random seed
 * @param xOffset - X position offset
 * @param zStart - Starting Z position
 * @param heightRange - [min, max] height bounds
 * @returns Array of building configurations
 */
export function generateBuildingArray(
  count: number,
  seed: number,
  xOffset: number,
  zStart: number,
  heightRange: [number, number]
): BuildingConfig[] {
  const buildings: BuildingConfig[] = [];

  for (let i = 0; i < count; i++) {
    const basePosition: [number, number, number] = [xOffset, 0, zStart];
    buildings.push(generateBuildingConfig(i, seed, basePosition, heightRange));
  }

  return buildings;
}
```

---

### 3.3.2 Buildings

#### File: `components/three/environment/buildings/CyberpunkBuilding.tsx`

```typescript
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CyberpunkBuildingProps } from '@/types/three-scene';
import { getWindowMaterialByColor } from '@/lib/scene-utils';
import { setMaterialOpacity } from '@/lib/type-guards';
import { ANIMATION_SPEEDS, BUILDING_CONFIG } from '@/config/constants';

/**
 * Cyberpunk-style building with animated windows and optional antenna.
 *
 * Features:
 * - Main building structure with specified dimensions
 * - Grid of flickering window lights
 * - Optional communication antenna on roof
 * - Seeded random for consistent window patterns
 *
 * Uses pooled geometries and materials for optimal memory usage.
 *
 * @param props - Building configuration and pooled resources
 */
export default function CyberpunkBuilding({
  position,
  size,
  material,
  windowColor,
  index,
  hasAntenna,
  geometries,
  materials,
}: CyberpunkBuildingProps) {
  const windowRefs = useRef<(THREE.Mesh | null)[]>([]);
  const [width, height, depth] = size;

  const windowMaterial = getWindowMaterialByColor(materials, windowColor);

  // Generate window grid
  const windowsX = Math.floor(width / BUILDING_CONFIG.WINDOW_SPACING);
  const windowsY = Math.floor(height / BUILDING_CONFIG.WINDOW_SPACING);

  // Flickering animation
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    windowRefs.current.forEach((ref, idx) => {
      if (!ref) return;

      const flicker = Math.sin(
        time * ANIMATION_SPEEDS.FLICKER +
        index * 10 +
        idx
      ) * 0.3;

      setMaterialOpacity(ref, 0.5 + flicker);
    });
  });

  return (
    <group position={position}>
      {/* Main building structure */}
      <mesh
        geometry={geometries.box}
        material={material}
        scale={size}
        castShadow
        receiveShadow
      />

      {/* Window grid */}
      {Array.from({ length: windowsY }).map((_, y) =>
        Array.from({ length: windowsX }).map((_, x) => {
          const idx = y * windowsX + x;
          const offsetX = (x - windowsX / 2) * BUILDING_CONFIG.WINDOW_SPACING;
          const offsetY = (y - windowsY / 2) * BUILDING_CONFIG.WINDOW_SPACING;

          return (
            <mesh
              key={`${x}-${y}`}
              ref={(el) => (windowRefs.current[idx] = el)}
              geometry={geometries.plane}
              material={windowMaterial}
              position={[offsetX, offsetY, depth / 2 + 0.01]}
              scale={[0.3, 0.4, 1]}
            />
          );
        })
      )}

      {/* Optional antenna */}
      {hasAntenna && (
        <group position={[0, height / 2 + 1, 0]}>
          <mesh
            geometry={geometries.cylinder}
            material={materials.metalDark}
            scale={[0.05, 2, 0.05]}
          />
          <mesh
            geometry={geometries.sphere}
            material={materials.emissiveRed}
            position={[0, 1, 0]}
            scale={[0.1, 0.1, 0.1]}
          />
        </group>
      )}
    </group>
  );
}
```

#### File: `components/three/environment/buildings/CityBuildings.tsx`

```typescript
'use client';

import { useMemo } from 'react';
import { usePools } from '../../pools';
import CyberpunkBuilding from './CyberpunkBuilding';
import { generateBuildingArray } from '../utils/buildingGenerator';
import { SCENE_DIMENSIONS } from '@/config/constants';

/**
 * Orchestrates all city buildings in the scene.
 *
 * Generates and renders:
 * - Left side buildings
 * - Right side buildings
 * - Background megastructures
 *
 * Uses seeded randomization for consistent placement across renders.
 */
export default function CityBuildings() {
  const { geometries, materials } = usePools();
  const seed = 12345; // Consistent seed for reproducibility

  // Generate building configurations once
  const leftBuildings = useMemo(
    () => generateBuildingArray(
      SCENE_DIMENSIONS.LEFT_BUILDINGS,
      seed,
      -25,
      -10,
      [15, 35]
    ),
    []
  );

  const rightBuildings = useMemo(
    () => generateBuildingArray(
      SCENE_DIMENSIONS.RIGHT_BUILDINGS,
      seed + 100,
      25,
      -10,
      [15, 35]
    ),
    []
  );

  const backgroundBuildings = useMemo(
    () => generateBuildingArray(
      SCENE_DIMENSIONS.BACKGROUND_BUILDINGS,
      seed + 200,
      0,
      -70,
      [40, 80]
    ),
    []
  );

  return (
    <group>
      {/* Left side buildings */}
      {leftBuildings.map((config, i) => (
        <CyberpunkBuilding
          key={`left-${i}`}
          position={config.position}
          size={config.size}
          material={materials.buildingDark}
          windowColor={config.windowColor}
          index={i}
          hasAntenna={config.hasAntenna}
          geometries={geometries}
          materials={materials}
        />
      ))}

      {/* Right side buildings */}
      {rightBuildings.map((config, i) => (
        <CyberpunkBuilding
          key={`right-${i}`}
          position={config.position}
          size={config.size}
          material={materials.buildingMid}
          windowColor={config.windowColor}
          index={i + SCENE_DIMENSIONS.LEFT_BUILDINGS}
          hasAntenna={config.hasAntenna}
          geometries={geometries}
          materials={materials}
        />
      ))}

      {/* Background megastructures */}
      {backgroundBuildings.map((config, i) => (
        <CyberpunkBuilding
          key={`bg-${i}`}
          position={config.position}
          size={config.size}
          material={materials.buildingLight}
          windowColor={config.windowColor}
          index={i + SCENE_DIMENSIONS.LEFT_BUILDINGS + SCENE_DIMENSIONS.RIGHT_BUILDINGS}
          hasAntenna={config.hasAntenna}
          geometries={geometries}
          materials={materials}
        />
      ))}
    </group>
  );
}
```

---

### 3.3.3 Ships (Abbreviated - Full specs similar to buildings)

#### File: `components/three/environment/ships/Ship.tsx`

Ship component with engine glow, hull, cockpit, wings (~150-180 lines)

#### File: `components/three/environment/ships/CapitalShip.tsx`

Large capital ship with superstructure, engine pods, beacon lights (~180-200 lines)

#### File: `components/three/environment/ships/FlyingShips.tsx`

Fleet orchestrator managing all ships in scene (~120-150 lines)

---

### 3.3.4 Layers (Abbreviated)

#### File: `components/three/environment/layers/ForegroundLayer.tsx`

Contains ForegroundDebris and DataFragments components (~150 lines)

#### File: `components/three/environment/layers/MidgroundLayer.tsx`

Contains FloatingPlatforms and DroneSwarm components (~180 lines)

#### File: `components/three/environment/layers/BackgroundLayer.tsx`

Contains DistantMegastructures and AtmosphericLightBeams (~160 lines)

---

### 3.3.5 Main Environment (After Decomposition)

#### File: `components/three/environment/Environment.tsx`

```typescript
'use client';

import { usePools } from '../pools';
import { SCENE_DIMENSIONS } from '@/config/constants';

// Layers
import ForegroundLayer from './layers/ForegroundLayer';
import MidgroundLayer from './layers/MidgroundLayer';
import BackgroundLayer from './layers/BackgroundLayer';
import OppositeLayer from './layers/OppositeLayer';

// Buildings
import CityBuildings from './buildings/CityBuildings';

// Ships
import FlyingShips from './ships/FlyingShips';

// Atmosphere
import Rain from './atmosphere/Rain';
import FogLayers from './atmosphere/FogLayers';
import NeonGridLines from './atmosphere/NeonGridLines';

// Decorations
import NeonSigns from './decorations/NeonSigns';
import HolographicElements from './decorations/HolographicElements';
import AnimatedBillboards from './decorations/AnimatedBillboards';
import Puddles from './decorations/Puddles';

/**
 * Main environment component orchestrating all 3D scene elements.
 *
 * Organizes scene into depth layers for optimal rendering:
 * - Foreground: -5 to 0
 * - Midground: -20 to -10
 * - Main scene: -20 to -6
 * - Background: -100 to -60
 * - Opposite (behind camera): +25 to +65
 *
 * Total elements: ~50+ sub-components
 */
export default function Environment() {
  const { materials, geometries } = usePools();

  return (
    <>
      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
        receiveShadow
      >
        <planeGeometry
          args={[
            SCENE_DIMENSIONS.GROUND_PLANE_WIDTH,
            SCENE_DIMENSIONS.GROUND_PLANE_HEIGHT
          ]}
        />
        <primitive object={materials.groundPlane} attach="material" />
      </mesh>

      {/* Depth-stratified layers */}
      <ForegroundLayer />
      <MidgroundLayer />
      <BackgroundLayer />

      {/* City infrastructure */}
      <CityBuildings />
      <NeonSigns />
      <NeonGridLines />

      {/* Atmospheric effects */}
      <Rain />
      <FogLayers />

      {/* Decorative elements */}
      <HolographicElements />
      <AnimatedBillboards />
      <Puddles />

      {/* Dynamic elements */}
      <FlyingShips />

      {/* Reverse-facing backdrop */}
      <OppositeLayer />
    </>
  );
}
```

#### File: `components/three/environment/index.ts`

```typescript
/**
 * Barrel export for environment components.
 *
 * Import the main Environment component from this file.
 *
 * @example
 * ```tsx
 * import Environment from '@/components/three/environment';
 * ```
 */
export { default } from './Environment';
```

---

## 3.4 Migration Strategy

### Step-by-Step Process

1. **Create directory structure** (all folders)
2. **Extract utils** (no dependencies, safe first step)
3. **Extract one building**, test rendering
4. **Extract all buildings**, verify scene looks correct
5. **Extract one ship**, test animation
6. **Extract all ships**, verify fleet works
7. **Extract atmosphere components** one by one
8. **Extract decoration components** one by one
9. **Extract layers** (depend on decorations, do last)
10. **Refactor main Environment.tsx** to orchestrator
11. **Delete old Environment.tsx** after verification

### Testing Between Steps

After each extraction:
```bash
npm run build  # Check for TypeScript errors
npm run dev    # Visual inspection
```

Verify:
- Component renders in correct position
- Animations still work
- Materials and geometries load correctly
- Performance unchanged

---

## Implementation Checklist - Phase 3

### Step 1: Setup
- [ ] Create `components/three/environment/` directory
- [ ] Create subdirectories: layers/, buildings/, ships/, atmosphere/, decorations/, utils/
- [ ] Create index.ts barrel export

### Step 2: Extract Utils
- [ ] Create `utils/seededRandom.ts`
- [ ] Create `utils/buildingGenerator.ts`
- [ ] Update imports in Environment.tsx (test)

### Step 3: Extract Buildings
- [ ] Create `buildings/types.ts`
- [ ] Create `buildings/CyberpunkBuilding.tsx`
- [ ] Test single building renders
- [ ] Create `buildings/CityBuildings.tsx`
- [ ] Test full building array
- [ ] Update Environment.tsx imports

### Step 4: Extract Ships
- [ ] Create `ships/types.ts`
- [ ] Create `ships/Ship.tsx`
- [ ] Test single ship
- [ ] Create `ships/CapitalShip.tsx`
- [ ] Test capital ship
- [ ] Create `ships/FlyingShips.tsx`
- [ ] Test full fleet
- [ ] Update Environment.tsx imports

### Step 5: Extract Atmosphere
- [ ] Create `atmosphere/Rain.tsx`
- [ ] Test rain particles
- [ ] Create `atmosphere/FogLayers.tsx`
- [ ] Test fog rendering
- [ ] Create `atmosphere/NeonGridLines.tsx`
- [ ] Test grid lines
- [ ] Update Environment.tsx imports

### Step 6: Extract Decorations
- [ ] Create `decorations/NeonSigns.tsx`
- [ ] Test neon signs
- [ ] Create `decorations/HolographicElements.tsx`
- [ ] Test holograms
- [ ] Create `decorations/AnimatedBillboards.tsx`
- [ ] Test billboards
- [ ] Create `decorations/Puddles.tsx`
- [ ] Test puddles
- [ ] Update Environment.tsx imports

### Step 7: Extract Layers
- [ ] Create `layers/ForegroundLayer.tsx`
- [ ] Test foreground
- [ ] Create `layers/MidgroundLayer.tsx`
- [ ] Test midground
- [ ] Create `layers/BackgroundLayer.tsx`
- [ ] Test background
- [ ] Create `layers/OppositeLayer.tsx`
- [ ] Test opposite layer
- [ ] Update Environment.tsx imports

### Step 8: Refactor Main Environment
- [ ] Simplify Environment.tsx to ~100 lines
- [ ] Import all sub-components
- [ ] Verify all elements render
- [ ] Check performance (should be same)

### Step 9: Cleanup
- [ ] Delete old Environment.tsx (after backup)
- [ ] Update all imports project-wide
- [ ] Run full build test
- [ ] Visual regression test

### Step 10: Verification
- [ ] Run `npm run build` - no errors
- [ ] Run `npm run dev` - visual inspection
- [ ] Compare before/after screenshots
- [ ] Test all animations
- [ ] Test interactions
- [ ] Performance profiling

---

## Success Criteria - Phase 3

- ✅ Environment.tsx reduced from 1678 to ~100 lines
- ✅ All components extracted to focused files (150-200 lines each)
- ✅ Scene renders identically to before
- ✅ All animations work correctly
- ✅ No performance regression
- ✅ No TypeScript errors
- ✅ Clear component hierarchy
