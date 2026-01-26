# NUWRRRLD Refactoring - Quick Reference Guide

Fast lookup for refactoring patterns, examples, and best practices.

---

## Table of Contents

1. [Type Safety Patterns](#type-safety-patterns)
2. [Constants & Configuration](#constants--configuration)
3. [Animation Patterns](#animation-patterns)
4. [Resource Management](#resource-management)
5. [Common Tasks](#common-tasks)

---

## Type Safety Patterns

### Pattern: Safe Material Access

**❌ UNSAFE (Don't use)**
```typescript
const mat = mesh.material as THREE.MeshStandardMaterial;
mat.metalness = 0.8;  // Runtime error if type wrong!
```

**✅ SAFE (Use this)**
```typescript
import { getMeshStandardMaterial } from '@/lib/type-guards';

const mat = getMeshStandardMaterial(mesh);
if (mat) {
  mat.metalness = 0.8;  // Guaranteed safe
}
```

### Pattern: Type Checking Before Property Access

**Common Type Guards**:
```typescript
import {
  isMeshBasicMaterial,
  isMeshStandardMaterial,
  isPointLight,
  isGroup,
  isMesh,
} from '@/lib/type-guards';

if (isMeshStandardMaterial(mesh.material)) {
  mesh.material.roughness = 0.5;  // Safe!
}

if (isPointLight(object)) {
  object.intensity = 1.0;  // Safe!
}
```

### Pattern: Safe Property Updates

**For Opacity**:
```typescript
import { setMaterialOpacity } from '@/lib/type-guards';

if (setMaterialOpacity(mesh, 0.5)) {
  console.log('Opacity updated');
} else {
  console.warn('Material does not support opacity');
}
```

**For Emissive Intensity**:
```typescript
import { setEmissiveIntensity } from '@/lib/type-guards';

if (setEmissiveIntensity(mesh, 1.2)) {
  console.log('Emissive updated');
}
```

---

## Constants & Configuration

### Never Use Magic Numbers

**❌ BAD**
```typescript
// What does 20 mean? Speed? Multiplier? Iterations?
if (Math.sin(time * 20 + i * 5) > 0.9) { ... }

// What is 0.3? Threshold? Opacity? Intensity?
const baseIntensity = 0.3;
```

**✅ GOOD**
```typescript
import { ANIMATION_SPEEDS, OPACITY } from '@/config/constants';

if (Math.sin(time * ANIMATION_SPEEDS.FLICKER + i * 5) > 0.9) { ... }

const baseIntensity = OPACITY.LOW;
```

### Using Animation Speeds

```typescript
import { ANIMATION_SPEEDS } from '@/config/constants';

// Available speeds
ANIMATION_SPEEDS.SLOW        // 0.3x - Slow pulsing
ANIMATION_SPEEDS.MEDIUM      // 1.5x - Regular movement
ANIMATION_SPEEDS.FAST        // 2.0x - Quick animations
ANIMATION_SPEEDS.VERY_FAST   // 4.0x - Engine pulses
ANIMATION_SPEEDS.FLICKER     // 20x  - Rapid flickering
```

### Using Opacity Constants

```typescript
import { OPACITY } from '@/config/constants';

// Available opacity levels
OPACITY.SUBTLE   // 0.08  - Barely visible
OPACITY.LOW      // 0.15  - Background elements
OPACITY.MEDIUM   // 0.25  - Secondary elements
OPACITY.HIGH     // 0.5   - Interactive elements
OPACITY.FULL     // 0.8   - Primary elements
```

### Using Colors

```typescript
import { CYBERPUNK_COLORS } from '@/config/constants';

CYBERPUNK_COLORS.CYAN       // '#00ffff'
CYBERPUNK_COLORS.MAGENTA    // '#ff00ff'
CYBERPUNK_COLORS.AMBER      // '#ffaa00'
CYBERPUNK_COLORS.GREEN      // '#00ff88'
CYBERPUNK_COLORS.RED        // '#ff0000'
CYBERPUNK_COLORS.NAVY       // '#1a2a3a'
CYBERPUNK_COLORS.PURPLE     // '#2a1a3a'
CYBERPUNK_COLORS.DARK_GRAY  // '#1a1a28'
```

### Using Scene Dimensions

```typescript
import { SCENE_DIMENSIONS } from '@/config/constants';

SCENE_DIMENSIONS.NEON_SIGN_COUNT    // 4
SCENE_DIMENSIONS.LEFT_BUILDINGS     // 5
SCENE_DIMENSIONS.RIGHT_BUILDINGS    // 5
SCENE_DIMENSIONS.BACKGROUND_BUILDINGS // 6
SCENE_DIMENSIONS.RAIN_COUNT         // 800
SCENE_DIMENSIONS.DRONE_COUNT        // 12
```

---

## Animation Patterns

### Pattern: Flickering Animations

**Simple one-liner approach**:
```typescript
import { useFlickerAnimation } from '@/hooks/useFlickerAnimation';
import { ANIMATION_SPEEDS, OPACITY } from '@/config/constants';

export function MyComponent() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Use hook - no manual animation code needed!
  useFlickerAnimation(meshRef, {
    speed: ANIMATION_SPEEDS.FLICKER,
    baseValue: OPACITY.HIGH,
    amount: 0.3,
    offset: index * 0.5,
    mode: 'opacity'
  });

  return <mesh ref={meshRef} ... />;
}
```

**How it works**:
```typescript
// Hook handles all of this automatically:
useFrame((state) => {
  const time = state.clock.elapsedTime;
  const flicker = Math.sin(time * speed + offset) * amount;
  const value = baseValue + flicker;

  if (mode === 'opacity') {
    setMaterialOpacity(mesh, value);
  } else if (mode === 'emissive') {
    setEmissiveIntensity(mesh, value);
  }
});
```

### Pattern: Orbital Motion

**Simple one-liner approach**:
```typescript
import { useOrbitalMotion } from '@/hooks/useOrbitalMotion';

export function DroneSwarm() {
  const droneRef = useRef<THREE.Group>(null);

  // Use hook - no manual position updates needed!
  useOrbitalMotion(droneRef, {
    radius: 15,
    speed: 0.5,
    offset: index * Math.PI / 6,
    yAmplitude: 2,  // Optional vertical bobbing
  });

  return (
    <group ref={droneRef}>
      {/* drone geometry */}
    </group>
  );
}
```

**How it works**:
```typescript
// Hook handles orbital calculation:
useFrame((state) => {
  const time = state.clock.elapsedTime;
  const angle = time * speed + offset;

  groupRef.current.position.x = center[0] + Math.cos(angle) * radius;
  groupRef.current.position.z = center[2] + Math.sin(angle) * radius;

  if (yAmplitude > 0) {
    groupRef.current.position.y = center[1] + Math.sin(time * ySpeed + offset) * yAmplitude;
  }
});
```

### Pattern: Manual Animation Utilities

**When you need calculations without hooks**:
```typescript
import {
  orbitalPosition,
  hoverOffset,
  flickerIntensity,
} from '@/lib/scene-utils';
import { ANIMATION_SPEEDS, OPACITY } from '@/config/constants';

// In useFrame callback:
const time = state.clock.elapsedTime;

// Get orbital position
const [x, z] = orbitalPosition(time, 10, 0.5, index * Math.PI / 6);
mesh.position.x = x;
mesh.position.z = z;

// Get hover offset
const y = hoverOffset(time, 2, 1, index * 0.5);
mesh.position.y = baseY + y;

// Get flicker value
const intensity = flickerIntensity(
  time,
  OPACITY.HIGH,
  0.3,
  ANIMATION_SPEEDS.FLICKER,
  index * 0.5
);
mat.opacity = intensity;
```

---

## Resource Management

### Pattern: Using Pooled Materials

**✅ Correct approach**:
```typescript
import { usePools } from '@/components/three/pools';

export function MyComponent() {
  const { materials } = usePools();

  return (
    <mesh material={materials.windowCyan} ... />
  );
}
```

**❌ Wrong approach**:
```typescript
// DON'T create new materials!
const material = useMemo(
  () => new THREE.MeshBasicMaterial({ color: '#00ffff' }),
  []
);

return <mesh material={material} ... />;
```

### Pattern: Using Pooled Geometries

**✅ Correct approach**:
```typescript
import { usePools } from '@/components/three/pools';

export function MyComponent() {
  const { geometries } = usePools();

  return (
    <mesh geometry={geometries.box} ... />
  );
}
```

### Pattern: Material Selection by Color

**✅ Correct approach**:
```typescript
import { getWindowMaterialByColor } from '@/lib/scene-utils';
import { usePools } from '@/components/three/pools';

export function Building({ windowColor }) {
  const { materials } = usePools();

  const windowMaterial = getWindowMaterialByColor(materials, windowColor);

  return <mesh material={windowMaterial} ... />;
}
```

**Available Material Selector Functions**:
```typescript
// For windows by color
getWindowMaterialByColor(materials, color)

// For ship hulls by color
getHullMaterialByColor(materials, color)
```

---

## Common Tasks

### Task: Add a Flickering Light Effect

```typescript
import { useFlickerAnimation } from '@/hooks/useFlickerAnimation';
import { ANIMATION_SPEEDS, OPACITY } from '@/config/constants';

function NeonLight() {
  const lightRef = useRef<THREE.Mesh>(null);

  useFlickerAnimation(lightRef, {
    speed: ANIMATION_SPEEDS.FLICKER,
    baseValue: OPACITY.HIGH,
    amount: 0.3,
    offset: 0,
    mode: 'emissive'
  });

  return (
    <mesh ref={lightRef} geometry={geom} material={mat} />
  );
}
```

### Task: Create a Rotating Element

```typescript
import { useOrbitalMotion } from '@/hooks/useOrbitalMotion';

function SpinningObject() {
  const groupRef = useRef<THREE.Group>(null);

  useOrbitalMotion(groupRef, {
    radius: 0,      // Zero radius = pure rotation
    speed: 1,       // 1 rotation per second
    offset: 0,
  });

  return <group ref={groupRef}>...</group>;
}
```

### Task: Create a Pulsing Glow

```typescript
import { useFlickerAnimation } from '@/hooks/useFlickerAnimation';
import { ANIMATION_SPEEDS, OPACITY } from '@/config/constants';

function PulsingGlow() {
  const glowRef = useRef<THREE.Mesh>(null);

  useFlickerAnimation(glowRef, {
    speed: ANIMATION_SPEEDS.SLOW,     // Slow pulse
    baseValue: OPACITY.SUBTLE,        // Start dim
    amount: 0.1,                      // Pulse amplitude
    offset: 0,
    mode: 'opacity'
  });

  return <mesh ref={glowRef} ... />;
}
```

### Task: Generate Buildings

```typescript
import { generateBuildingArray } from '@/components/three/environment/utils/buildingGenerator';
import { SCENE_DIMENSIONS } from '@/config/constants';

function CityBuildings() {
  const buildings = useMemo(() =>
    generateBuildingArray(
      SCENE_DIMENSIONS.LEFT_BUILDINGS,
      12345,           // Seed
      0,               // Offset seed
      {
        minHeight: 20,
        maxHeight: 50,
        minWidth: 2,
        maxWidth: 6,
      }
    ),
    []
  );

  return (
    <group>
      {buildings.map((config, i) => (
        <Building key={i} config={config} />
      ))}
    </group>
  );
}
```

### Task: Safe Type Checking

```typescript
import {
  getMeshBasicMaterial,
  getMeshStandardMaterial,
  isMeshBasicMaterial,
} from '@/lib/type-guards';

function UpdateMaterial(mesh: THREE.Mesh) {
  // Method 1: Using getter function
  const basicMat = getMeshBasicMaterial(mesh);
  if (basicMat) {
    basicMat.opacity = 0.5;
  }

  // Method 2: Using type guard
  if (isMeshBasicMaterial(mesh.material)) {
    mesh.material.opacity = 0.5;
  }

  // Method 3: Setter function (most convenient)
  setMaterialOpacity(mesh, 0.5);
}
```

---

## Ref Type Safety

### Pattern: Array of Refs

**❌ UNSAFE**
```typescript
const meshRefs = useRef<THREE.Mesh[]>([]);
```

**✅ SAFE**
```typescript
const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

// Usage:
meshRefs.current[i] = el;
const mesh = meshRefs.current[i];
if (mesh) {
  // Safe to use mesh
}
```

---

## File Organization

### Where to Find What

| What | Where |
|------|-------|
| Animation constants | `config/constants.ts` |
| Color palette | `config/constants.ts` |
| Scene dimensions | `config/constants.ts` |
| Type guards | `lib/type-guards.ts` |
| Scene utilities | `lib/scene-utils.ts` |
| Animation hooks | `hooks/useFlickerAnimation.ts`, `hooks/useOrbitalMotion.ts` |
| Pooled materials | `components/three/pools/MaterialPool.ts` |
| Pooled geometries | `components/three/pools/GeometryPool.ts` |
| Pool context | `components/three/pools/PoolContext.tsx` |
| usePools hook | `components/three/pools/index.ts` |

---

## Checklist for New Components

When creating a new component, verify:

- [ ] Using constants instead of magic numbers
- [ ] Using type guards instead of `as` casts
- [ ] Using pooled materials (not creating new ones)
- [ ] Using pooled geometries (not creating new ones)
- [ ] Using animation hooks instead of manual useFrame logic
- [ ] Ref types properly annotated (e.g., `(THREE.Mesh | null)[]`)
- [ ] JSDoc comments on component
- [ ] No console.log statements (remove before committing)
- [ ] All color values from `CYBERPUNK_COLORS`
- [ ] All animation speeds from `ANIMATION_SPEEDS`
- [ ] All opacity values from `OPACITY`

---

## Performance Tips

1. **Always use pooled materials** - Never create new materials in components
2. **Always use pooled geometries** - Never create new geometries in components
3. **Use useFlickerAnimation hook** - More efficient than manual useFrame
4. **Use useOrbitalMotion hook** - Encapsulated, optimized motion
5. **Extract constants** - Don't hardcode numbers (they get optimized better)
6. **Use type guards** - Safer, catches bugs earlier
7. **Minimize useFrame logic** - Move to hooks/utilities when possible
8. **Memoize calculations** - useMemo for expensive computations (except materials)

---

## Debug Tips

### Check If Material is Being Pooled

```typescript
const mat1 = materials.windowCyan;
const mat2 = materials.windowCyan;
console.assert(mat1 === mat2, 'Materials should be same reference!');
```

### Check If Geometry is Being Pooled

```typescript
const geom1 = geometries.box;
const geom2 = geometries.box;
console.assert(geom1 === geom2, 'Geometries should be same reference!');
```

### Check Type Guard Works

```typescript
const mat = mesh.material;
const stMat = getMeshStandardMaterial(mesh);
console.assert(stMat === null || stMat === mat, 'Type guard failed!');
```

---

## Common Mistakes

### ❌ Creating Materials in Components

```typescript
// WRONG - don't do this!
export function Building() {
  const material = useMemo(() =>
    new THREE.MeshBasicMaterial({ color: '#00ffff' }),  // BAD!
    []
  );
}
```

### ❌ Using Type Casts

```typescript
// WRONG - don't do this!
const mat = mesh.material as THREE.MeshStandardMaterial;  // BAD!
mat.metalness = 0.8;  // Might crash at runtime
```

### ❌ Hardcoding Numbers

```typescript
// WRONG - don't do this!
if (Math.sin(time * 20 + i * 5) > 0.9) { ... }  // BAD! What is 20?
mat.opacity = 0.3;  // BAD! What is 0.3?
```

### ❌ Manual Animation Logic

```typescript
// WRONG - don't do this!
useFrame((state) => {
  const time = state.clock.elapsedTime;
  mesh.position.x = Math.cos(time * speed + offset) * radius;  // BAD!
  mesh.position.z = Math.sin(time * speed + offset) * radius;  // BAD!
});
```

---

## Getting Help

- **Confused about type guards?** → Read `lib/type-guards.ts` comments
- **Need animation constants?** → Check `config/constants.ts`
- **Animation examples?** → Look at `NeonSigns.tsx`, `CyberpunkBuilding.tsx`
- **Memory management?** → See `components/three/pools/`
- **Full explanation?** → Read `docs/REFACTORING_THEORY.md`

---

## Summary

The refactoring provides a **consistent, safe, performant foundation** for Three.js development:

✅ **Type Safety** - No runtime surprises from unsafe casts
✅ **Performance** - Fixed memory, no GC pauses
✅ **Maintainability** - Single source of truth for values
✅ **Reusability** - Hooks and utilities for common patterns
✅ **Consistency** - Everyone uses the same approach

**Golden Rule**: If you find yourself repeating code, extract it. The patterns are already established—use them!
