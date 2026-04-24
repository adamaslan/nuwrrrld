# PHASE 4: DRY REFACTORING - Code Cleanup

## Phase 4 Overview

**Goal**: Eliminate duplicate code patterns and create reusable utilities.

**Duration**: 2-3 days

**Risk Level**: Low

**Design Principles Applied**:
- Guideline #16: Eliminate Duplicate Code
- Guideline #24: Reuse Existing Libraries
- Guideline #14: Code Decomposition (continued)

---

## 4.1 Create Scene Utilities

### File to Create: `lib/scene-utils.ts`

Centralized utilities for common scene operations.

```typescript
import * as THREE from 'three';
import type { IMaterialPool } from '@/components/three/pools';
import { CYBERPUNK_COLORS } from '@/config/constants';

/**
 * Maps window color string to pooled material.
 *
 * Centralizes color-to-material lookup logic used across
 * buildings, megastructures, and UI elements.
 *
 * @param materials - The material pool
 * @param color - Hex color string
 * @returns MeshBasicMaterial with matching color
 *
 * @example
 * ```typescript
 * const windowMat = getWindowMaterialByColor(materials, '#00ffff');
 * ```
 */
export function getWindowMaterialByColor(
  materials: IMaterialPool,
  color: string
): THREE.MeshBasicMaterial {
  const colorMap: Record<string, keyof IMaterialPool> = {
    [CYBERPUNK_COLORS.CYAN]: 'windowCyan',
    [CYBERPUNK_COLORS.MAGENTA]: 'windowMagenta',
    [CYBERPUNK_COLORS.AMBER]: 'windowAmber',
    [CYBERPUNK_COLORS.GREEN]: 'windowGreen',
    '#00ffff': 'windowCyan',
    '#ff00ff': 'windowMagenta',
    '#ffaa00': 'windowAmber',
    '#00ff88': 'windowGreen',
  };

  const key = colorMap[color] ?? 'windowCyan';
  return materials[key] as THREE.MeshBasicMaterial;
}

/**
 * Maps hull color to pooled ship material.
 *
 * Analyzes hex color to determine appropriate material variant.
 *
 * @param materials - The material pool
 * @param color - Hex color string
 * @returns MeshStandardMaterial for ship hull
 */
export function getHullMaterialByColor(
  materials: IMaterialPool,
  color: string
): THREE.MeshStandardMaterial {
  // Navy blue variants
  if (color.includes('2a3a') || color.includes('1a2a')) {
    return materials.shipHullNavy;
  }

  // Purple variants
  if (color.includes('1a3a') || color.includes('2a1a')) {
    return materials.shipHullPurple;
  }

  // Gray variants
  if (color.includes('1a28') || color.includes('2828')) {
    return materials.shipHullGray;
  }

  // Default dark hull
  return materials.shipHullDark;
}

/**
 * Calculates orbital position for circular motion.
 *
 * Common pattern for drones, particles, and rotating elements.
 *
 * @param time - Current animation time
 * @param radius - Orbit radius
 * @param speed - Orbital speed multiplier
 * @param offset - Phase offset for staggering
 * @returns Position tuple [x, y, z]
 */
export function orbitalPosition(
  time: number,
  radius: number,
  speed: number,
  offset: number
): [number, number, number] {
  const angle = time * speed + offset;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return [x, 0, z];
}

/**
 * Calculates hover/float animation offset.
 *
 * Smooth sine wave motion for floating elements.
 *
 * @param time - Current animation time
 * @param amplitude - Hover height range
 * @param speed - Hover speed multiplier
 * @param offset - Phase offset
 * @returns Y position offset
 */
export function hoverOffset(
  time: number,
  amplitude: number,
  speed: number,
  offset: number
): number {
  return Math.sin(time * speed + offset) * amplitude;
}

/**
 * Calculates flicker intensity for neon/emissive effects.
 *
 * @param time - Current animation time
 * @param baseIntensity - Base emissive/opacity value
 * @param flickerAmount - Flicker intensity (0-1)
 * @param speed - Flicker speed
 * @param offset - Phase offset
 * @returns Current intensity value
 */
export function flickerIntensity(
  time: number,
  baseIntensity: number,
  flickerAmount: number,
  speed: number,
  offset: number
): number {
  return baseIntensity + Math.sin(time * speed + offset) * flickerAmount;
}
```

---

## 4.2 Create Animation Hooks

### File to Create: `hooks/useFlickerAnimation.ts`

Reusable hook for flickering effects.

```typescript
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { setMaterialOpacity, setEmissiveIntensity } from '@/lib/type-guards';

/**
 * Options for flicker animation.
 */
interface FlickerOptions {
  /** Animation speed multiplier (default: 2) */
  speed?: number;
  /** Base opacity/intensity (default: 0.5) */
  baseValue?: number;
  /** Flicker intensity (default: 0.3) */
  amount?: number;
  /** Phase offset for staggering (default: 0) */
  offset?: number;
  /** What to animate: 'opacity' or 'emissive' (default: 'opacity') */
  mode?: 'opacity' | 'emissive';
}

/**
 * Hook for flickering light/material animations.
 *
 * Common pattern in neon signs, windows, and indicators.
 * Automatically handles material type checking and safe updates.
 *
 * @param meshRef - Ref to the mesh to animate
 * @param options - Animation configuration
 *
 * @example
 * ```typescript
 * const meshRef = useRef<THREE.Mesh>(null);
 *
 * useFlickerAnimation(meshRef, {
 *   speed: 20,
 *   baseValue: 0.5,
 *   amount: 0.3,
 *   offset: index * 0.5,
 * });
 *
 * return <mesh ref={meshRef} ... />;
 * ```
 */
export function useFlickerAnimation(
  meshRef: React.RefObject<THREE.Mesh>,
  options: FlickerOptions = {}
): void {
  const {
    speed = 2,
    baseValue = 0.5,
    amount = 0.3,
    offset = 0,
    mode = 'opacity',
  } = options;

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const flicker = Math.sin(time * speed + offset) * amount;
    const value = baseValue + flicker;

    if (mode === 'opacity') {
      setMaterialOpacity(meshRef.current, value);
    } else if (mode === 'emissive') {
      setEmissiveIntensity(meshRef.current, value);
    }
  });
}
```

### File to Create: `hooks/useOrbitalMotion.ts`

Reusable hook for orbital/circular motion.

```typescript
'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Options for orbital motion.
 */
interface OrbitalOptions {
  /** Orbit radius (default: 5) */
  radius?: number;
  /** Orbital speed (default: 1) */
  speed?: number;
  /** Phase offset (default: 0) */
  offset?: number;
  /** Center position (default: [0, 0, 0]) */
  center?: [number, number, number];
  /** Vertical bobbing (default: 0) */
  yAmplitude?: number;
  /** Vertical bobbing speed (default: 1) */
  ySpeed?: number;
}

/**
 * Hook for circular orbital motion.
 *
 * Common for drones, particles, and rotating elements.
 *
 * @param groupRef - Ref to group or mesh to animate
 * @param options - Motion configuration
 *
 * @example
 * ```typescript
 * const groupRef = useRef<THREE.Group>(null);
 *
 * useOrbitalMotion(groupRef, {
 *   radius: 10,
 *   speed: 0.5,
 *   offset: index * Math.PI / 6,
 *   yAmplitude: 2,
 * });
 * ```
 */
export function useOrbitalMotion(
  groupRef: React.RefObject<THREE.Group | THREE.Mesh>,
  options: OrbitalOptions = {}
): void {
  const {
    radius = 5,
    speed = 1,
    offset = 0,
    center = [0, 0, 0],
    yAmplitude = 0,
    ySpeed = 1,
  } = options;

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    const angle = time * speed + offset;

    groupRef.current.position.x = center[0] + Math.cos(angle) * radius;
    groupRef.current.position.z = center[2] + Math.sin(angle) * radius;

    if (yAmplitude > 0) {
      groupRef.current.position.y =
        center[1] + Math.sin(time * ySpeed + offset) * yAmplitude;
    }
  });
}
```

---

## 4.3 Consolidate Duplicate Patterns

### Replace Window Material Selection

**Files affected:**
- `environment/buildings/CyberpunkBuilding.tsx`
- `environment/layers/OppositeLayer.tsx` (if contains buildings)

**Before:**
```typescript
const getWindowMaterial = () => {
  switch (windowColor) {
    case '#ff00ff': return materials.windowMagenta;
    case '#ffaa00': return materials.windowAmber;
    case '#00ff88': return materials.windowGreen;
    default: return materials.windowCyan;
  }
};
```

**After:**
```typescript
import { getWindowMaterialByColor } from '@/lib/scene-utils';

const windowMaterial = getWindowMaterialByColor(materials, windowColor);
```

### Replace Ship Hull Selection

**Files affected:**
- `environment/ships/Ship.tsx`
- `environment/ships/CapitalShip.tsx`

**Before:**
```typescript
const getHullMaterial = () => {
  if (color.includes('2a3a')) return materials.shipHullNavy;
  // ... etc
};
```

**After:**
```typescript
import { getHullMaterialByColor } from '@/lib/scene-utils';

const hullMaterial = getHullMaterialByColor(materials, config.color);
```

### Replace Flicker Animations

**Files affected:**
- `environment/decorations/NeonSigns.tsx`
- `environment/buildings/CyberpunkBuilding.tsx` (windows)
- Any component with flickering lights

**Before:**
```typescript
const holoRefs = useRef<THREE.Mesh[]>([]);

useFrame((state) => {
  holoRefs.current.forEach((mesh, i) => {
    if (mesh) {
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const time = state.clock.elapsedTime;
      mat.opacity = 0.5 + Math.sin(time * 20 + i * 3) * 0.3;
    }
  });
});
```

**After:**
```typescript
import { useFlickerAnimation } from '@/hooks/useFlickerAnimation';

// For each sign
const signRef = useRef<THREE.Mesh>(null);
useFlickerAnimation(signRef, {
  speed: 20,
  baseValue: 0.5,
  amount: 0.3,
  offset: index * 3,
});
```

### Replace Orbital Motion

**Files affected:**
- `environment/layers/MidgroundLayer.tsx` (drones)
- Any component with circular motion

**Before:**
```typescript
useFrame((state) => {
  if (droneRef.current) {
    const time = state.clock.elapsedTime;
    const angle = time * speed + offset;
    droneRef.current.position.x = Math.cos(angle) * radius;
    droneRef.current.position.z = Math.sin(angle) * radius;
  }
});
```

**After:**
```typescript
import { useOrbitalMotion } from '@/hooks/useOrbitalMotion';

const droneRef = useRef<THREE.Group>(null);
useOrbitalMotion(droneRef, {
  radius: 15,
  speed: 0.5,
  offset: index * Math.PI / 6,
  yAmplitude: 2,
});
```

---

## 4.4 Move TVScreen Materials to Pool

### Current Issue

TVScreen.tsx creates materials at module level (lines 14-54), outside the pool system.

### Solution

**Option A: Add to MaterialPool** (Recommended)

Add to `components/three/pools/MaterialPool.ts`:

```typescript
export interface IBackPanelMaterials {
  readonly darkMetal: THREE.MeshStandardMaterial;
  readonly ventGrille: THREE.MeshStandardMaterial;
  readonly powerUnit: THREE.MeshStandardMaterial;
  readonly coolingUnit: THREE.MeshStandardMaterial;
  readonly cable: THREE.MeshStandardMaterial;
  readonly bracket: THREE.MeshStandardMaterial;
  readonly warningLabel: THREE.MeshBasicMaterial;
  readonly serialPlate: THREE.MeshStandardMaterial;
}

export interface IMaterialPool extends IBackPanelMaterials {
  // ... existing materials
}

export function createMaterialPool(): IMaterialPool {
  return {
    // ... existing materials

    // Back panel materials
    darkMetal: new THREE.MeshStandardMaterial({
      color: '#1a1a1a',
      metalness: 0.9,
      roughness: 0.3,
    }),
    // ... etc
  };
}
```

**Then update TVScreen.tsx:**
```typescript
// Remove module-level material creation

// In component:
const { materials } = usePools();

// Use materials.darkMetal, materials.ventGrille, etc.
```

---

## 4.5 Fix Ref Type Safety

### Pattern to Apply

```typescript
// Before (unsafe)
const refs = useRef<THREE.Mesh[]>([]);

// After (safe)
const refs = useRef<(THREE.Mesh | null)[]>([]);
```

**Files to update:**
- Environment components with arrays of refs
- TVScreen.tsx (window refs, corner light refs)
- Any component storing multiple refs in array

---

## Implementation Checklist - Phase 4

### Step 1: Create Utilities
- [ ] Create `lib/scene-utils.ts`
- [ ] Add getWindowMaterialByColor
- [ ] Add getHullMaterialByColor
- [ ] Add orbitalPosition helper
- [ ] Add hoverOffset helper
- [ ] Add flickerIntensity helper

### Step 2: Create Hooks
- [ ] Create `hooks/useFlickerAnimation.ts`
- [ ] Create `hooks/useOrbitalMotion.ts`
- [ ] Test hooks in isolation

### Step 3: Replace Duplicate Patterns
- [ ] Replace window material selection in CyberpunkBuilding
- [ ] Replace window material selection in OppositeLayer
- [ ] Replace hull material selection in Ship
- [ ] Replace hull material selection in CapitalShip
- [ ] Count replacements (should be 6+ instances)

### Step 4: Replace Flicker Animations
- [ ] Replace in NeonSigns component
- [ ] Replace in CyberpunkBuilding windows
- [ ] Replace in any indicator lights
- [ ] Count replacements (should be 10+ instances)

### Step 5: Replace Orbital Motion
- [ ] Replace in DroneSwarm
- [ ] Replace in any circular motion patterns
- [ ] Count replacements (should be 3+ instances)

### Step 6: Move TVScreen Materials
- [ ] Add back panel materials to MaterialPool interface
- [ ] Add back panel materials to createMaterialPool
- [ ] Remove module-level materials from TVScreen.tsx
- [ ] Update TVScreen to use pooled materials
- [ ] Test TVScreen renders correctly

### Step 7: Fix Ref Types
- [ ] Search for `useRef<THREE.Mesh[]>`
- [ ] Replace with `useRef<(THREE.Mesh | null)[]>`
- [ ] Search for similar patterns with Group, PointLight
- [ ] Update all occurrences

### Step 8: Final Cleanup
- [ ] Remove any unused imports
- [ ] Remove commented-out code
- [ ] Verify all constants are used
- [ ] Check for any remaining magic numbers

### Step 9: Verification
- [ ] Run `npm run build` - no TypeScript errors
- [ ] Run `npm run dev` - visual inspection
- [ ] Test all animations work
- [ ] Test all interactions work
- [ ] Performance profiling (should be better)
- [ ] Check bundle size (should be smaller)

---

## Success Criteria - Phase 4

- ✅ All duplicate patterns eliminated
- ✅ Reusable utilities created
- ✅ Reusable hooks created
- ✅ TVScreen materials in pool
- ✅ All ref types safe
- ✅ No TypeScript errors
- ✅ Scene renders identically
- ✅ Better performance (fewer allocations)
- ✅ Smaller bundle size

---

## Final Verification (All Phases Complete)

### Build & Test
```bash
npm run build    # Should succeed with no errors
npm run dev      # Visual inspection
npm run lint     # Should pass
npm run type-check  # Should pass
```

### Manual Testing
- [ ] Scene loads without errors
- [ ] All buildings render correctly
- [ ] Ships move along paths
- [ ] Lights flicker as expected
- [ ] Rain falls continuously
- [ ] TV screens display media
- [ ] Interactions work (hover, tap)
- [ ] Performance is acceptable (60 FPS)

### Code Quality Checks
- [ ] No magic numbers remain
- [ ] All functions have JSDoc
- [ ] All types are explicit
- [ ] No unsafe type casts
- [ ] Error boundaries work
- [ ] No duplicate code patterns
- [ ] File sizes under 200 lines

---

## Optional Enhancements (From T-script-design-deep.md)

The following enhancements can be added to each phase for additional improvements. These are **optional** and can be implemented based on project priorities and timeline.

### Phase 1 Optional Enhancements

1. **TypeScript Path Aliases** - Add granular path aliases for cleaner imports
2. **Auto-generated API Documentation** - Setup TypeDoc for living documentation
3. **Constants Validation Schema** - Add runtime validation with Zod
4. **Visual Regression Testing** - Setup Playwright for screenshot comparison

### Phase 2 Optional Enhancements

1. **Performance Error Boundaries** - Track and report performance issues
2. **Error Recovery Strategies** - Implement retry logic with fallbacks
3. **Error Analytics Integration** - Send error reports to monitoring service
4. **Interactive Error Boundaries** - Allow users to retry/recover from errors

### Phase 3 Optional Enhancements

1. **Component Registry System** - Enable dynamic scene composition
2. **Scene Graph Inspector** - Development tool for debugging Three.js hierarchy
3. **LOD System** - Implement Level-of-Detail for distant objects
4. **Scene State Machine** - Use XState for predictable state transitions

### Phase 4 Optional Enhancements

1. **Material Instance Manager** - Advanced reference counting for materials
2. **Animation Composition System** - Composable animation strategies
3. **Performance Profiling Hooks** - Built-in performance measurement
4. **Code Splitting** - Dynamic imports for lazy loading components

### Cross-Phase Enhancement

**TypeScript Custom Transformer** - Enforce design rules at compile time with custom TypeScript transformer plugin.

---

## Implementation Priority

**Core Plan (Required)**:
- Phase 1: Foundations
- Phase 2: Error Handling
- Phase 3: Decomposition
- Phase 4: DRY Refactoring

**Optional Enhancements** (Choose based on needs):
- High Priority: Visual Regression Testing, Error Analytics, LOD System
- Medium Priority: Path Aliases, Performance Profiling, Code Splitting
- Low Priority: Scene Inspector, State Machine, Custom Transformer

---

## Summary

This 4-phase plan systematically transforms the NUWRRRLD codebase to align with the TypeScript Design Guide:

1. **Phase 1** establishes foundations (constants, types, docs)
2. **Phase 2** adds robust error handling
3. **Phase 3** decomposes monolithic files
4. **Phase 4** eliminates duplication

Each phase builds on the previous, minimizing risk while maximizing code quality improvements.

**Critical Pattern**: All phases must enforce pooled geometry usage to maintain performance and consistency.

**Optional Enhancements**: Additional improvements from T-script-design-deep.md can be implemented based on project priorities.
