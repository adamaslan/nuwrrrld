# PHASE 1: FOUNDATIONS - Constants, Types, and Documentation

## Phase 1 Overview

**Goal**: Extract magic numbers, centralize type definitions, and add comprehensive documentation without changing functionality.

**Duration**: 2-3 days

**Risk Level**: Low

**Design Principles Applied**:
- Guideline #15: Avoid Magic Numbers
- Guideline #27: Use Type Annotations Throughout
- Guideline #19: JSDoc for All Public Functions

---

## 1.1 Create Constants File

### File to Create: `config/constants.ts`

This file centralizes all magic numbers currently scattered across the codebase.

```typescript
/**
 * Animation timing constants for scene elements.
 * All values represent multipliers for time-based animations.
 */
export const ANIMATION_SPEEDS = {
  /** Slow pulsing effects (0.3x speed) */
  SLOW: 0.3,
  /** Medium rotation/movement (1.5x speed) */
  MEDIUM: 1.5,
  /** Fast animations (2.0x speed) */
  FAST: 2.0,
  /** Very fast effects like engine pulses (4.0x speed) */
  VERY_FAST: 4.0,
  /** Rapid flickering for neon signs (20x speed) */
  FLICKER: 20,
} as const;

/**
 * Opacity levels for various scene elements.
 * Values range from 0.0 (transparent) to 1.0 (opaque).
 */
export const OPACITY = {
  /** Nearly invisible (0.08) */
  SUBTLE: 0.08,
  /** Low visibility for background elements (0.15) */
  LOW: 0.15,
  /** Medium visibility for secondary elements (0.25) */
  MEDIUM: 0.25,
  /** High visibility for interactive elements (0.5) */
  HIGH: 0.5,
  /** Near-opaque for primary elements (0.8) */
  FULL: 0.8,
} as const;

/**
 * Responsive scale multipliers based on viewport aspect ratio.
 */
export const RESPONSIVE_SCALE = {
  /** Widescreen aspect ratio >1.5 (0.85x scale) */
  WIDE_SCREEN: 0.85,
  /** Landscape aspect ratio >1.0 (0.9x scale) */
  LANDSCAPE: 0.9,
  /** Default/portrait aspect ratio (1.0x scale) */
  DEFAULT: 1.0,
} as const;

/**
 * Scene geometry dimensions and element counts.
 * These values define the physical size and density of the environment.
 */
export const SCENE_DIMENSIONS = {
  /** Ground plane width in units */
  GROUND_PLANE_WIDTH: 200,
  /** Ground plane depth in units */
  GROUND_PLANE_HEIGHT: 250,

  // Element counts (optimized from initial higher values)
  /** Number of foreground debris particles */
  DEBRIS_COUNT: 100,
  /** Number of holographic data fragments */
  DATA_FRAGMENTS_COUNT: 8,
  /** Number of flying drones in swarm */
  DRONE_COUNT: 12,
  /** Number of rain particles */
  RAIN_COUNT: 800,
  /** Number of floating platforms */
  PLATFORM_COUNT: 6,
  /** Number of fog layers */
  FOG_LAYER_COUNT: 3,
  /** Number of animated neon signs */
  NEON_SIGN_COUNT: 4,
  /** Number of distant megastructures */
  MEGASTRUCTURE_COUNT: 4,

  // Building counts
  /** Buildings on left side of scene */
  LEFT_BUILDINGS: 5,
  /** Buildings on right side of scene */
  RIGHT_BUILDINGS: 5,
  /** Large background buildings */
  BACKGROUND_BUILDINGS: 6,
} as const;

/**
 * Ship size multipliers for different vessel classes.
 */
export const SHIP_SCALE = {
  /** Small shuttle size multiplier (1.5x base) */
  SHUTTLE_MULTIPLIER: 1.5,
  /** Medium transport size multiplier (1.5x base) */
  TRANSPORT_MULTIPLIER: 1.5,
  /** Large freighter size multiplier (1.5x base) */
  FREIGHTER_MULTIPLIER: 1.5,
  /** Massive capital ship multiplier (9x base) */
  CAPITAL_MULTIPLIER: 9,

  // Fleet composition
  /** Number of small shuttles */
  SHUTTLE_COUNT: 8,
  /** Number of medium transports */
  TRANSPORT_COUNT: 5,
  /** Number of large freighters */
  FREIGHTER_COUNT: 3,
  /** Number of capital ships */
  CAPITAL_COUNT: 3,
} as const;

/**
 * Cyberpunk color palette used throughout the scene.
 * Maintains consistent aesthetic across all elements.
 */
export const CYBERPUNK_COLORS = {
  /** Primary cyan (#00ffff) */
  CYAN: '#00ffff',
  /** Primary magenta (#ff00ff) */
  MAGENTA: '#ff00ff',
  /** Accent amber/orange (#ffaa00) */
  AMBER: '#ffaa00',
  /** Accent green (#00ff88) */
  GREEN: '#00ff88',
  /** Alert red (#ff0000) */
  RED: '#ff0000',
  /** Dark navy blue (#1a2a3a) */
  NAVY: '#1a2a3a',
  /** Dark purple (#2a1a3a) */
  PURPLE: '#2a1a3a',
  /** Dark gray (#1a1a28) */
  DARK_GRAY: '#1a1a28',
} as const;

/**
 * Light intensity values for consistent illumination.
 */
export const LIGHT_INTENSITY = {
  /** Dim ambient light */
  AMBIENT: 0.3,
  /** Standard point light */
  POINT: 0.5,
  /** Bright spot light */
  SPOT: 1.0,
  /** Very bright emissive */
  EMISSIVE: 1.5,
  /** Maximum HDR glow */
  HDR_MAX: 2.0,
} as const;

/**
 * Z-depth positions for scene layering.
 * Negative Z moves away from camera.
 */
export const DEPTH_LAYERS = {
  /** Foreground layer (0 to -5) */
  FOREGROUND_START: 0,
  FOREGROUND_END: -5,

  /** Midground layer (-10 to -20) */
  MIDGROUND_START: -10,
  MIDGROUND_END: -20,

  /** Main scene layer (-6 to -20) */
  MAIN_START: -6,
  MAIN_END: -20,

  /** Deep background (-60 to -100) */
  BACKGROUND_START: -60,
  BACKGROUND_END: -100,

  /** Reverse-facing layer (+25 to +65) */
  OPPOSITE_START: 25,
  OPPOSITE_END: 65,
} as const;

/**
 * Building generation parameters.
 */
export const BUILDING_CONFIG = {
  /** Minimum building height */
  MIN_HEIGHT: 15,
  /** Maximum building height */
  MAX_HEIGHT: 40,
  /** Minimum building width */
  MIN_WIDTH: 3,
  /** Maximum building width */
  MAX_WIDTH: 7,
  /** Antenna probability threshold */
  ANTENNA_THRESHOLD: 0.6,
  /** Window grid spacing */
  WINDOW_SPACING: 2,
} as const;

/**
 * Type guard to ensure const assertion.
 */
type Immutable<T> = {
  readonly [K in keyof T]: T[K];
};
```

### Files to Update

**1. `components/three/Environment.tsx`**

Replace all magic numbers:
```typescript
// Before
Math.sin(time * 2 + index)
opacity: 0.15

// After
import { ANIMATION_SPEEDS, OPACITY } from '@/config/constants';
Math.sin(time * ANIMATION_SPEEDS.FAST + index)
opacity: OPACITY.LOW
```

**2. `components/three/TVScreen.tsx`**

Replace opacity and timing values:
```typescript
// Before
const glowIntensity = 0.3;
setTimeout(() => setIsTapped(false), 400);

// After
import { OPACITY } from '@/config/constants';
const INTERACTION_TIMING = {
  TAP_DURATION: 400,
  HOVER_TRANSITION: 200,
} as const;

const glowIntensity = OPACITY.MEDIUM;
setTimeout(() => setIsTapped(false), INTERACTION_TIMING.TAP_DURATION);
```

**3. `components/three/Lighting.tsx`**

Replace light intensity values:
```typescript
// Before
<pointLight intensity={0.5} />

// After
import { LIGHT_INTENSITY } from '@/config/constants';
<pointLight intensity={LIGHT_INTENSITY.POINT} />
```

---

## 1.2 Create Shared Types File

### File to Create: `types/three-scene.ts`

Centralized type definitions for all 3D scene components.

```typescript
import * as THREE from 'three';
import type { IGeometryPool, IMaterialPool } from '@/components/three/pools';

/**
 * 3D position/rotation tuple [x, y, z].
 */
export type Vector3Tuple = readonly [number, number, number];

/**
 * 2D position/size tuple [x, y].
 */
export type Vector2Tuple = readonly [number, number];

/**
 * Ship classification types.
 */
export type ShipType = 'shuttle' | 'transport' | 'freighter' | 'dreadnought';

/**
 * Ship movement direction.
 * 1 = moving right, -1 = moving left
 */
export type ShipDirection = 1 | -1;

/**
 * Window color options for buildings.
 */
export type WindowColor = '#00ffff' | '#ff00ff' | '#ffaa00' | '#00ff88';

/**
 * Configuration for a flying ship.
 */
export interface ShipConfig {
  /** Ship classification */
  readonly type: ShipType;
  /** Ship dimensions [width, height, depth] */
  readonly size: Vector3Tuple;
  /** Movement speed multiplier */
  readonly speed: number;
  /** Hull color hex code */
  readonly color: string;
  /** Light intensity for ship lights */
  readonly lightIntensity: number;
  /** Light color hex code */
  readonly lightColor: string;
  /** Engine glow color hex code */
  readonly engineColor: string;
  /** Base Y position */
  readonly yBase: number;
  /** Z lane for movement path */
  readonly zLane: number;
  /** Movement direction (1 or -1) */
  readonly direction: ShipDirection;
  /** Animation phase offset */
  readonly offset: number;
}

/**
 * Configuration for a cyberpunk building.
 */
export interface BuildingConfig {
  /** Building position [x, y, z] */
  readonly position: Vector3Tuple;
  /** Building dimensions [width, height, depth] */
  readonly size: Vector3Tuple;
  /** Window light color */
  readonly windowColor: WindowColor;
  /** Whether building has antenna */
  readonly hasAntenna: boolean;
}

/**
 * Props for CyberpunkBuilding component.
 */
export interface CyberpunkBuildingProps {
  /** Building position */
  readonly position: Vector3Tuple;
  /** Building dimensions */
  readonly size: Vector3Tuple;
  /** Building hull material */
  readonly material: THREE.Material;
  /** Window color */
  readonly windowColor: string;
  /** Building index for animation offset */
  readonly index: number;
  /** Whether to add antenna on top */
  readonly hasAntenna: boolean;
  /** Pooled geometries */
  readonly geometries: IGeometryPool;
  /** Pooled materials */
  readonly materials: IMaterialPool;
}

/**
 * Reusable pools props interface.
 */
export interface PoolsProps {
  /** Pooled geometries */
  readonly geometries: IGeometryPool;
  /** Pooled materials */
  readonly materials: IMaterialPool;
}

/**
 * Animation state for interactive elements.
 */
export interface AnimationState {
  /** Whether element is being hovered */
  readonly isHovered: boolean;
  /** Whether element was just tapped/clicked */
  readonly isTapped: boolean;
}

/**
 * Drone configuration for swarm.
 */
export interface DroneConfig {
  /** Orbital radius */
  readonly radius: number;
  /** Orbital speed */
  readonly speed: number;
  /** Vertical offset */
  readonly yOffset: number;
  /** Phase offset for orbit */
  readonly phaseOffset: number;
}

/**
 * Platform configuration for floating platforms.
 */
export interface PlatformConfig {
  /** Platform position */
  readonly position: Vector3Tuple;
  /** Platform dimensions */
  readonly size: Vector2Tuple;
  /** Hover animation speed */
  readonly hoverSpeed: number;
  /** Hover amplitude */
  readonly hoverAmplitude: number;
}

/**
 * Neon sign configuration.
 */
export interface NeonSignConfig {
  /** Sign position */
  readonly position: Vector3Tuple;
  /** Sign text content */
  readonly text: string;
  /** Sign color */
  readonly color: string;
  /** Flicker speed */
  readonly flickerSpeed: number;
}
```

### Files to Update

**1. `components/three/Environment.tsx`**

Extract inline interfaces:
```typescript
// Before (inline around line 471)
interface ShipConfig {
  type: 'shuttle' | 'transport' | 'freighter' | 'dreadnought';
  size: [number, number, number];
  // ... etc
}

// After
import type { ShipConfig, BuildingConfig, PoolsProps } from '@/types/three-scene';
```

**2. Extract CyberpunkBuilding props**:
```typescript
// Before (inline around line 100)
function CyberpunkBuilding({
  position,
  size,
  material,
  // ... 8 parameters
}: {
  position: [number, number, number];
  // ... inline type
})

// After
import type { CyberpunkBuildingProps } from '@/types/three-scene';

function CyberpunkBuilding(props: CyberpunkBuildingProps)
```

---

## 1.3 Add Comprehensive JSDoc

### Priority 1: Pool Files

**File: `components/three/pools/GeometryPool.ts`**

Enhance existing docs:
```typescript
/**
 * Geometry pool interface providing pre-created unit geometries.
 * All geometries are unit-sized (1x1x1) and should be scaled via mesh.scale.
 *
 * @example
 * ```tsx
 * const { geometries } = usePools();
 * <mesh geometry={geometries.box} scale={[2, 3, 1]} />
 * ```
 */
export interface IGeometryPool {
  /** Unit box geometry (1x1x1) */
  readonly box: THREE.BoxGeometry;
  /** Unit plane geometry (1x1) */
  readonly plane: THREE.PlaneGeometry;
  // ... document all 10 properties
}

/**
 * Creates a new geometry pool with all standard shapes.
 * Geometries are created once and should be disposed via disposeGeometryPool.
 *
 * @returns Immutable pool of unit geometries
 * @see disposeGeometryPool
 */
export function createGeometryPool(): IGeometryPool { /* ... */ }

/**
 * Safely disposes all geometries in a pool.
 * Call this on unmount to prevent memory leaks.
 *
 * @param pool - The geometry pool to dispose
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const pool = createGeometryPool();
 *   return () => disposeGeometryPool(pool);
 * }, []);
 * ```
 */
export function disposeGeometryPool(pool: IGeometryPool): void { /* ... */ }
```

**File: `components/three/pools/MaterialPool.ts`**

Document helper functions:
```typescript
/**
 * Maps window color to appropriate pooled material.
 *
 * @param pool - The material pool
 * @param color - Hex color string (#00ffff, #ff00ff, etc.)
 * @returns MeshBasicMaterial with matching color
 *
 * @example
 * ```tsx
 * const windowMat = getWindowMaterial(materials, '#00ffff');
 * <mesh material={windowMat} />
 * ```
 */
export function getWindowMaterial(
  pool: IMaterialPool,
  color: string
): THREE.MeshBasicMaterial { /* ... */ }

/**
 * Maps hull color to appropriate ship material.
 * Analyzes color hex to determine navy/purple/gray variant.
 *
 * @param pool - The material pool
 * @param color - Hex color string
 * @returns MeshStandardMaterial for ship hull
 */
export function getShipHullMaterial(
  pool: IMaterialPool,
  color: string
): THREE.MeshStandardMaterial { /* ... */ }
```

### Priority 2: Configuration Files

**File: `config/mediaConfig.ts`**

```typescript
/**
 * Configuration for TV screen displays in the scene.
 *
 * Each screen can display an image or video with optional side panels.
 * Screens are positioned in 3D space with specified rotations and sizes.
 */

/**
 * Available media types for screen content.
 */
export type MediaType = 'image' | 'video';

/**
 * Configuration array for all TV screens.
 *
 * Screens are positioned at different Z depths to create parallax effect.
 *
 * @example
 * ```tsx
 * SCREEN_CONFIGS.map(config => (
 *   <TVScreen key={config.id} config={config} />
 * ))
 * ```
 */
export const SCREEN_CONFIGS: ScreenConfig[] = [
  {
    id: 1,
    type: 'image',
    path: '/media/doves1.jpg',
    // ... with inline comments
  },
];

/**
 * Scroll behavior configuration for screen interactions.
 *
 * Controls how screens respond to page scroll events.
 */
export const SCROLL_CONFIG = {
  /** Initial Y position at top of page */
  startY: 30,
  /** Final Y position when fully scrolled */
  endY: -30,
  /** Scroll speed multiplier */
  speed: 0.5,
} as const;
```

### Priority 3: Component Functions

**File: `components/three/Environment.tsx`**

Add JSDoc to all internal components (to be extracted in Phase 3):

```typescript
/**
 * Renders foreground debris particles.
 *
 * Creates floating particle field in front of main scene.
 * Particles use seeded randomization for consistent placement.
 *
 * @param props - Pooled geometries and materials
 */
function ForegroundDebris({ geometries, materials }: PoolsProps) { /* ... */ }

/**
 * Renders holographic data fragments.
 *
 * Floating translucent rectangles with rotating animation.
 * Uses emissive materials for glow effect.
 *
 * @param props - Pooled geometries and materials
 */
function DataFragments({ geometries, materials }: PoolsProps) { /* ... */ }

/**
 * Renders cyberpunk-style building with animated windows.
 *
 * Buildings feature:
 * - Flickering window lights
 * - Optional antenna on roof
 * - Seeded random window patterns
 *
 * @param props - Building configuration and pools
 */
function CyberpunkBuilding(props: CyberpunkBuildingProps) { /* ... */ }
```

**File: `components/three/TVScreen.tsx`**

```typescript
/**
 * Interactive TV screen with industrial back panel.
 *
 * Features:
 * - Image or video display
 * - Hover and tap interactions
 * - Industrial aesthetic with ventilation, power unit, cables
 * - Optional side panel for text content
 *
 * @param props - Screen configuration
 */
export default function TVScreen({ config }: TVScreenProps) { /* ... */ }

/**
 * Corner indicator lights for screen frame.
 * Pulse on hover/tap interactions.
 *
 * @param props - Screen dimensions and interaction state
 */
function CornerLights(props: CornerLightsProps) { /* ... */ }

/**
 * Industrial back panel assembly.
 *
 * Includes:
 * - Ventilation grilles
 * - Power supply unit with LED indicators
 * - Cable conduits
 * - Cooling system with rotating fans
 * - Warning labels and serial plate
 *
 * @param props - Screen dimensions and pools
 */
function BackPanel(props: BackPanelProps) { /* ... */ }
```

---

## Implementation Checklist - Phase 1

### Step 1: Create Constants File
- [ ] Create `config/constants.ts`
- [ ] Add ANIMATION_SPEEDS with JSDoc
- [ ] Add OPACITY levels with JSDoc
- [ ] Add SCENE_DIMENSIONS with JSDoc
- [ ] Add SHIP_SCALE with JSDoc
- [ ] Add CYBERPUNK_COLORS with JSDoc
- [ ] Add LIGHT_INTENSITY with JSDoc
- [ ] Add DEPTH_LAYERS with JSDoc
- [ ] Add BUILDING_CONFIG with JSDoc

### Step 2: Update Files with Constants
- [ ] Import constants in Environment.tsx
- [ ] Replace animation speed magic numbers
- [ ] Replace opacity magic numbers
- [ ] Replace scene dimension numbers
- [ ] Replace ship scale numbers
- [ ] Import constants in TVScreen.tsx
- [ ] Replace opacity values
- [ ] Replace timing values
- [ ] Import constants in Lighting.tsx
- [ ] Replace light intensity values

### Step 3: Create Types File
- [ ] Create `types/three-scene.ts`
- [ ] Add Vector3Tuple, Vector2Tuple types
- [ ] Add ShipType, ShipDirection types
- [ ] Add WindowColor type
- [ ] Add ShipConfig interface
- [ ] Add BuildingConfig interface
- [ ] Add CyberpunkBuildingProps interface
- [ ] Add PoolsProps interface
- [ ] Add AnimationState interface
- [ ] Add DroneConfig interface
- [ ] Add PlatformConfig interface
- [ ] Add NeonSignConfig interface

### Step 4: Extract Inline Types
- [ ] Update Environment.tsx to import types
- [ ] Replace inline ShipConfig with import
- [ ] Extract CyberpunkBuilding props to named interface
- [ ] Update Ship component to use ShipConfig
- [ ] Update CapitalShip to use ShipConfig
- [ ] Replace all inline PoolsProps with import

### Step 5: Add JSDoc Documentation
- [ ] Enhance GeometryPool.ts JSDoc
- [ ] Document createGeometryPool function
- [ ] Document disposeGeometryPool function
- [ ] Enhance MaterialPool.ts JSDoc
- [ ] Document getWindowMaterial function
- [ ] Document getShipHullMaterial function
- [ ] Add JSDoc to mediaConfig.ts exports
- [ ] Document SCREEN_CONFIGS array
- [ ] Document SCROLL_CONFIG object
- [ ] Add JSDoc to Environment.tsx components
- [ ] Document ForegroundDebris
- [ ] Document DataFragments
- [ ] Document FloatingPlatforms
- [ ] Document DroneSwarm
- [ ] Document CyberpunkBuilding
- [ ] Document Ship
- [ ] Document CapitalShip
- [ ] Add JSDoc to TVScreen.tsx components
- [ ] Document TVScreen main component
- [ ] Document CornerLights
- [ ] Document BackPanel
- [ ] Document all BackPanel sub-components

### Step 6: Verification
- [ ] Run `npm run build` - no TypeScript errors
- [ ] Run `npm run dev` - visual inspection
- [ ] Verify all constants resolve correctly
- [ ] Verify no runtime errors
- [ ] Check that animations still work correctly
- [ ] Verify scene renders identically to before

---

## Success Criteria - Phase 1

- ✅ All magic numbers extracted to constants
- ✅ All inline types extracted to types file
- ✅ All public functions have JSDoc
- ✅ No TypeScript errors
- ✅ Scene renders identically
- ✅ All animations work as before
