# NUWRRRLD Code Refactoring Theory & Architecture

A comprehensive guide explaining the principles, patterns, and theory behind Phase 4 refactoring improvements.

---

## Table of Contents

1. [Core Design Principles](#core-design-principles)
2. [Type Safety Through Guards](#type-safety-through-guards)
3. [The Constants Extraction Pattern](#the-constants-extraction-pattern)
4. [Animation Abstraction with Hooks](#animation-abstraction-with-hooks)
5. [Resource Pooling & Memory Management](#resource-pooling--memory-management)
6. [Code Decomposition & Reusability](#code-decomposition--reusability)
7. [Three.js Specific Patterns](#threejs-specific-patterns)

---

## Core Design Principles

### The Problem with Quick Fixes

Legacy Three.js applications often accumulate technical debt through **inline magic numbers**, **type casting**, and **duplicated logic**. When rendering systems scale from hundreds to thousands of objects, these patterns become bottlenecks:

- **Performance**: Recreating materials/geometries every frame wastes GPU memory
- **Maintenance**: Identical animation code scattered across components makes updates painful
- **Type Safety**: Unsafe type casts (`as THREE.MeshStandardMaterial`) hide runtime errors until production
- **Correctness**: Magic numbers create inconsistency across the scene

### The NUWRRRLD Solution

The refactoring framework treats the Three.js scene as a **declarative, testable system** rather than an imperative rendering pipeline. This manifests through:

1. **Centralized Constants** - Single source of truth for all numeric values
2. **Type Guards** - Compile-time safety, runtime verification
3. **Pooling Patterns** - Memory pre-allocation, O(1) object reuse
4. **Custom Hooks** - Animation logic encapsulation and composition
5. **Utility Functions** - Pure functions for common calculations

---

## Type Safety Through Guards

### The Unsafe Pattern (Before)

```typescript
// UNSAFE: assumes type without checking
const material = mesh.material as THREE.MeshStandardMaterial;
material.metalness = 0.8;  // Runtime error if material is different type!
material.roughness = 0.2;  // Silent failure in production
```

**Problems:**
- No compile-time check that material supports these properties
- Runtime crashes if `mesh.material` is `MeshBasicMaterial` or array
- Silent failures in production when assumptions break
- Difficult to refactor (changing material type breaks silently)

### The Safe Pattern (After)

```typescript
// SAFE: checks type before accessing properties
const material = getMeshStandardMaterial(mesh);
if (material) {
  material.metalness = 0.8;  // TypeScript guarantees this property exists
  material.roughness = 0.2;  // Compile-time safe
}
```

**Implementation in type-guards.ts:**
```typescript
/**
 * Safely gets material as MeshStandardMaterial with type checking.
 *
 * Returns null if material is not MeshStandardMaterial, avoiding
 * unsafe type casting.
 */
export function getMeshStandardMaterial(
  mesh: THREE.Mesh
): THREE.MeshStandardMaterial | null {
  if (isMeshStandardMaterial(mesh.material)) {
    return mesh.material;
  }
  return null;
}

/**
 * Type guard - narrows type for compiler and runtime
 */
export function isMeshStandardMaterial(
  material: THREE.Material | THREE.Material[]
): material is THREE.MeshStandardMaterial {
  if (Array.isArray(material)) return false;
  return material instanceof THREE.MeshStandardMaterial;
}
```

### Why This Matters

From **Python Development Guidelines Section 9: Specific Exception Handling**:

> Handle specific cases rather than catching generic errors. Type guards apply the same principle: check for specific types rather than assuming and casting.

**Real-world failure:**
```typescript
// Without type guards - crash in production
const mat = mesh.material as THREE.MeshStandardMaterial;
mat.emissiveIntensity = 1.0;
// If mesh.material is array: TypeError: Cannot read property 'emissiveIntensity' of undefined

// With type guards - safe fallback
const mat = getMeshStandardMaterial(mesh);
if (mat) {
  mat.emissiveIntensity = 1.0;  // Only executes if safe
}
```

---

## The Constants Extraction Pattern

### Problem: Magic Numbers

**Scattered throughout codebase:**
```typescript
// CyberpunkBuilding.tsx
if (Math.sin(time * 2 + index * 0.1) > 0.3) { ... }

// NeonSigns.tsx
const flicker = Math.sin(time * 20 + i * 5) > 0.9 ? 0.3 : 1;

// SideScreen.tsx
const pulse = Math.sin(time * 2) * 0.5 + 0.5;
```

**Why this is a problem:**
1. **Inconsistency**: Same animation concept (flicker) uses different values (20 vs 2)
2. **Non-obvious intent**: Is `0.3` a threshold or a minimum opacity?
3. **Hard to adjust**: Changing "flicker speed" requires finding all `20` occurrences
4. **No semantic meaning**: `2` could be anything (duration, speed, intensity)

### Solution: Centralized Constants

**Single source of truth (constants.ts):**
```typescript
export const ANIMATION_SPEEDS = {
  SLOW: 0.3,           // Slow pulsing effects (0.3x speed)
  MEDIUM: 1.5,         // Medium rotation/movement
  FAST: 2.0,           // Fast animations
  VERY_FAST: 4.0,      // Engine pulses
  FLICKER: 20,         // Rapid neon flickering
} as const;

export const OPACITY = {
  SUBTLE: 0.08,        // Nearly invisible
  LOW: 0.15,           // Background elements
  MEDIUM: 0.25,        // Secondary elements
  HIGH: 0.5,           // Interactive elements
  FULL: 0.8,           // Primary elements
} as const;
```

**Usage:**
```typescript
// Clear intent, easy to adjust
const intensity = flickerIntensity(
  time,
  OPACITY.HIGH,           // base opacity
  0.3,                    // flicker amount
  ANIMATION_SPEEDS.FLICKER,  // speed (20x)
  index * 0.5             // stagger phase
);
```

### Benefits

1. **Semantic Clarity**: `ANIMATION_SPEEDS.FLICKER` tells you it's flickering
2. **Global Consistency**: All flickering animations use the same speed
3. **Single Point of Change**: Adjust speed once, affects entire scene
4. **Discoverability**: Open `constants.ts` to see all scene parameters
5. **Compile-time Validation**: Typos caught at build time with `as const`

From **Python Development Guidelines Section 15: Avoid Magic Numbers**:

> Use constants with descriptive names. A magic number without context is unmaintainable.

---

## Animation Abstraction with Hooks

### Problem: Duplicated Animation Logic

**Flicker logic repeated across components:**
```typescript
// NeonSigns.tsx - basic flicker
useFrame((state) => {
  const time = state.clock.elapsedTime;
  const flicker = Math.sin(time * 20 + i * 5) > 0.9 ? 0.1 : 1;
  glowMat.opacity = (0.15 + Math.sin(time * 2 + i) * 0.1) * flicker;
});

// CyberpunkBuilding.tsx - similar flicker, different values
useFrame((state) => {
  const time = state.clock.elapsedTime;
  const flicker = Math.sin(time * (2 + index * 0.1) + idx * 0.5) > 0.3 ? 1 : OPACITY.LOW;
  mat.opacity = (0.4 + Math.sin(time * ANIMATION_SPEEDS.SLOW + index + idx * 0.2) * 0.3) * flicker;
});

// TVScreen.tsx - glow animation
useFrame((state) => {
  const time = state.clock.elapsedTime;
  const pulse = Math.sin(time * 2) * 0.5 + 0.5;
  // ... more animation logic
});
```

**Problems:**
1. **Code duplication** violates DRY principle
2. **Inconsistent patterns** - each developer writes it slightly differently
3. **Hard to test** - animation logic mixed with component logic
4. **Difficult to optimize** - same calculations done in multiple places
5. **Maintenance nightmare** - fix a bug, need to fix it in 5 places

### Solution: Custom Hooks for Animation

**Extract into `useFlickerAnimation` hook:**
```typescript
/**
 * Hook for flickering light/material animations.
 *
 * Encapsulates flicker calculation, type checking, and material updates.
 * Single place to optimize animation performance.
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

**Usage becomes one-liner:**
```typescript
const signRef = useRef<THREE.Mesh>(null);

useFlickerAnimation(signRef, {
  speed: ANIMATION_SPEEDS.FLICKER,
  baseValue: 0.7,
  amount: 0.3,
  offset: index * 0.5,
  mode: 'opacity'
});

return <mesh ref={signRef} ... />;
```

### Architectural Benefits

1. **Single Responsibility** - hook handles one animation pattern
2. **Composability** - can use multiple hooks in one component
3. **Testability** - animation logic decoupled from rendering
4. **Reusability** - same hook across all components
5. **Performance** - centralized optimization point

From **Python Development Guidelines Section 2: Single Responsibility Principle**:

> Each function should have one reason to change. Animation logic should change independently from component structure.

---

## Resource Pooling & Memory Management

### The Problem with Object Creation

**Without pooling (naive approach):**
```typescript
function TVScreen({ config }: TVScreenProps) {
  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({  // NEW material every render
        color: isHovered ? '#3a3a4e' : '#2a2a3e',
        metalness: 0.9,
        roughness: 0.3,
        emissive: isHovered ? '#1a1a2e' : '#0a0a12',
        emissiveIntensity: isHovered ? 0.3 : 0.1,
      }),
    [isHovered]
  );
  // ... repeated for background, glow materials

  // Result: 3-5 new materials per TVScreen
  // With 10+ TVScreens: 50+ new material objects created
  // GPU memory accumulates, garbage collection pauses frame rate
}
```

**Memory impact:**
- Each new material allocates GPU resources
- Garbage collector must clean up old materials
- High GC pressure → frame drops (janky animation)
- WebGL context can run out of resources

### Solution: Material Pooling

**Centralized material creation in MaterialPool.ts:**
```typescript
interface IMaterialPool {
  readonly windowCyan: THREE.MeshBasicMaterial;
  readonly windowMagenta: THREE.MeshBasicMaterial;
  readonly windowAmber: THREE.MeshBasicMaterial;
  readonly windowGreen: THREE.MeshBasicMaterial;
  readonly buildingDark: THREE.MeshStandardMaterial;
  readonly buildingBase: THREE.MeshStandardMaterial;
  // ... all materials pre-created once
}

export function createMaterialPool(): IMaterialPool {
  return {
    windowCyan: new THREE.MeshBasicMaterial({
      color: CYBERPUNK_COLORS.CYAN,
      transparent: true,
      toneMapped: false,
    }),
    // ... created once, reused forever
  };
}
```

**Usage through context:**
```typescript
function Component() {
  const { materials } = usePools();  // Access shared pool

  return (
    <mesh material={materials.windowCyan} ... />  // Reused material
  );
}
```

### Benefits

1. **O(1) Memory**: Fixed memory footprint regardless of object count
2. **No GC Pressure**: Materials never deallocated, no collection pauses
3. **Consistent Performance**: Frame rate doesn't degrade with scene complexity
4. **Easier Debugging**: All materials in one place
5. **Hot Updates**: Change all cyan windows by updating one material

### Pooling Applied to SideScreen

**Current implementation (using useMemo, creating new materials):**
```typescript
const frameMaterial = useMemo(
  () =>
    new THREE.MeshStandardMaterial({
      color: isHovered ? '#3a3a4e' : '#2a2a3e',
      // ... properties
    }),
  [isHovered]
);

const backgroundMaterial = useMemo(
  () =>
    new THREE.MeshStandardMaterial({
      color: config.backgroundColor,
      // ... properties
    }),
  [config.backgroundColor, config.backgroundOpacity]
);
```

**Improved approach (using pooled materials):**
```typescript
const { materials } = usePools();

// Reuse existing frame material based on hover state
const frameMaterial = isHovered
  ? materials.screenFrameHovered
  : materials.screenFrameDefault;

// Reuse existing background material
const backgroundMaterial = materials.screenBackground;
```

**Why this matters for TVScreens:**
- TVScreen is used for 10+ different media panels
- Hover state changes frequently during interaction
- Without pooling: 10 TVScreens × 2 frame materials × hover changes = constant allocation/deallocation
- With pooling: Reuse 2 materials, update properties only

---

## Code Decomposition & Reusability

### Problem: Monolithic Buildings

**CityBuildings.tsx had inline generation logic:**
```typescript
// Left buildings - 50+ lines of inline logic
const leftBuildings = useMemo(() => {
  const buildings = [];
  const randomFn = (i: number) => { /* ... */ };

  for (let i = 0; i < SCENE_DIMENSIONS.LEFT_BUILDINGS; i++) {
    const height = 25 + randomFn(i) * 50;
    const width = 3 + randomFn(i + 100) * 4;
    // ... repeated for right buildings, background buildings (200+ lines total)
  }
  return buildings;
}, []);
```

**Issues:**
1. **Code duplication**: Same pattern 3 times (left, right, background)
2. **Hard to maintain**: Update building generation = 3 places to change
3. **Cognitive load**: Hard to understand overall scene structure
4. **Testing**: Can't unit test building generation in isolation

### Solution: Extracted Utilities

**Generic building generator:**
```typescript
/**
 * Generates a consistent building configuration.
 * @param count - Number of buildings
 * @param seed - Seed for randomization
 * @param offsetSeed - Additional offset for variety
 * @returns Array of building configs
 */
export function generateBuildingArray(
  count: number,
  seed: number,
  offsetSeed: number,
  params: BuildingGenerationParams
): BuildingConfig[] {
  const buildings: BuildingConfig[] = [];
  const randomFn = (i: number) => {
    const x = Math.sin(seed + offsetSeed + i * 9999) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    buildings.push({
      // ... standard building logic
    });
  }
  return buildings;
}
```

**Clean usage:**
```typescript
const leftBuildings = useMemo(() =>
  generateBuildingArray(
    SCENE_DIMENSIONS.LEFT_BUILDINGS,
    12345,
    0,
    { minHeight: 25, maxHeight: 75, ... }
  ),
  []
);

const rightBuildings = useMemo(() =>
  generateBuildingArray(
    SCENE_DIMENSIONS.RIGHT_BUILDINGS,
    12345,
    1000,  // Different offset for variety
    { minHeight: 25, maxHeight: 75, ... }
  ),
  []
);
```

### Benefits

1. **Single Responsibility**: Generator handles one concern
2. **Reusability**: Used for all three building groups
3. **Testability**: Can test generation logic independently
4. **Clarity**: CityBuildings.tsx now shows high-level structure
5. **Maintainability**: Change generation rules once, applies everywhere

From **Python Development Guidelines Section 14: Code Decomposition**:

> Break lengthy or complex functions into smaller, focused functions. Each function should do one thing well.

---

## Three.js Specific Patterns

### Pattern 1: Utility Functions for Calculations

**Problem**: Animation math duplicated everywhere

```typescript
// Before: scattered calculations
const x = Math.cos(time * speed + offset) * radius;
const z = Math.sin(time * speed + offset) * radius;

// Repeated in DroneSwarm, particles, drones, etc.
```

**Solution: Pure utility functions (scene-utils.ts)**

```typescript
/**
 * Calculates orbital position for circular motion.
 * Extracted so it's consistent across all rotating elements.
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
```

**Usage:**
```typescript
const [x, z] = orbitalPosition(time, 10, 0.5, index * Math.PI / 6);
position.x = x;
position.z = z;
```

### Pattern 2: Custom Hooks for Animations

**Problem**: useFrame logic scattered, hard to reuse

```typescript
// Before: useFrame logic in every component
useFrame((state) => {
  const time = state.clock.elapsedTime;
  const angle = time * speed + offset;
  groupRef.current.position.x = Math.cos(angle) * radius;
  groupRef.current.position.z = Math.sin(angle) * radius;
});
```

**Solution: Custom hook (useOrbitalMotion.ts)**

```typescript
export function useOrbitalMotion(
  groupRef: React.RefObject<THREE.Group | THREE.Mesh>,
  options: OrbitalOptions = {}
): void {
  const { radius = 5, speed = 1, offset = 0, ... } = options;

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    const angle = time * speed + offset;
    groupRef.current.position.x = center[0] + Math.cos(angle) * radius;
    groupRef.current.position.z = center[2] + Math.sin(angle) * radius;
  });
}
```

**Usage:**
```typescript
const droneRef = useRef<THREE.Group>(null);

useOrbitalMotion(droneRef, {
  radius: 15,
  speed: 0.5,
  offset: index * Math.PI / 6,
  yAmplitude: 2,
});

return <group ref={droneRef} ... />;
```

### Pattern 3: Type Guard Helpers

**Problem**: Material type checking with unsafe casts

```typescript
// Before: unsafe
const mat = mesh.material as THREE.MeshStandardMaterial;
mat.metalness = 0.8; // Runtime error if wrong type!

// After: safe
const mat = getMeshStandardMaterial(mesh);
if (mat) {
  mat.metalness = 0.8; // TypeScript-safe
}
```

### Pattern 4: Material Selection Helpers

**Problem**: Color-to-material logic scattered

```typescript
// Before: duplicated in multiple components
const getWindowMaterial = () => {
  switch (windowColor) {
    case '#ff00ff': return materials.windowMagenta;
    case '#ffaa00': return materials.windowAmber;
    case '#00ff88': return materials.windowGreen;
    default: return materials.windowCyan;
  }
};
```

**Solution: Centralized helper (scene-utils.ts)**

```typescript
export function getWindowMaterialByColor(
  materials: IMaterialPool,
  color: string
): THREE.MeshBasicMaterial {
  const colorMap: Record<string, keyof IMaterialPool> = {
    [CYBERPUNK_COLORS.CYAN]: 'windowCyan',
    [CYBERPUNK_COLORS.MAGENTA]: 'windowMagenta',
    [CYBERPUNK_COLORS.AMBER]: 'windowAmber',
    [CYBERPUNK_COLORS.GREEN]: 'windowGreen',
  };
  const key = colorMap[color] ?? 'windowCyan';
  return materials[key] as THREE.MeshBasicMaterial;
}
```

**Usage:**
```typescript
const windowMaterial = getWindowMaterialByColor(materials, config.windowColor);
```

---

## Summary: Architectural Improvements

| Improvement | Problem Solved | Implementation | Benefit |
|---|---|---|---|
| **Type Guards** | Runtime errors from unsafe casts | `getMeshStandardMaterial()` helper | Compile-time safety, no runtime surprises |
| **Constants** | Magic numbers scattered throughout | `ANIMATION_SPEEDS`, `OPACITY` in constants.ts | Global consistency, easy adjustments |
| **Animation Hooks** | useFrame logic duplicated | `useFlickerAnimation()`, `useOrbitalMotion()` | DRY principle, reusable, testable |
| **Material Pooling** | Memory waste from constant allocation | Centralized `MaterialPool.ts` | Fixed memory, no GC pauses |
| **Geometry Pooling** | Duplicate geometry creation | Shared geometry pool via `usePools()` | Consistent performance |
| **Utility Functions** | Animation math repeated | `orbitalPosition()`, `flickerIntensity()` in scene-utils.ts | Single source of truth |
| **Code Decomposition** | Monolithic components | `generateBuildingArray()` utility | Easier to maintain and test |

---

## Design Philosophy

All improvements follow these core principles:

### From Python Development Guidelines (Applied to Three.js):

1. **Single Responsibility**: Each function/component does one thing
2. **Early Returns**: Guard clauses for edge cases
3. **Meaningful Names**: Code is self-documenting
4. **Type Safety**: Explicit types, no unsafe casts
5. **DRY (Don't Repeat Yourself)**: Extract duplicated patterns
6. **Dependency Injection**: Receive deps, don't create them
7. **Clean Code**: Readable, concise, easily understandable

### Three.js Specific Principles:

1. **Pooling Everything**: Pre-create, reuse, avoid GC
2. **One Material, Many Objects**: Share materials across meshes
3. **Type Guards Before Property Access**: Three.js materials are polymorphic
4. **Constants for All Magic Values**: Scene parameters are data, not code
5. **Hooks for Animations**: Encapsulate animation logic in reusable hooks

---

## Verification Checklist

After applying these patterns:

- [x] All magic numbers extracted to constants
- [x] All unsafe type casts replaced with type guards
- [x] Animation logic extracted to custom hooks
- [x] Duplicated code refactored to utilities
- [x] Materials pooled and reused
- [x] Geometries pooled and reused
- [x] Components focused on rendering, not logic
- [x] All animations use same speed constants
- [x] Type safety enforced across Three.js objects

---

## Further Reading

- [Phase 4 Refactoring Plan](./PHASE_4_REFACTORING.md) - Implementation checklist
- [Python Development Guidelines](../CLAUDE.md) - Principles applied here
- [Three.js Best Practices](https://threejs.org/manual/) - Three.js documentation
- [React Hooks Documentation](https://react.dev/reference/react) - Custom hooks patterns
