---
allowed-tools: Read, Write, Edit, Bash(file:*), Glob, Grep
description: Advanced optimization techniques for scaling the NUWRRRLD ship system without memory overhead
---

# Ship System Optimization Guide

Advanced techniques for scaling the NUWRRRLD ship system to higher sizes (up to 9x) with increased visual complexity while reducing GPU memory usage and maintaining performance. Applies to ships in `/components/three/Environment.tsx`.

## Overview

Without optimization, scaling ships to 9x size with 64-128+ parts would increase GPU memory from ~10-15 MB to ~100+ MB. Using the techniques in this guide, the same level of visual complexity can be achieved with only 1-2 MB of GPU memory.

**Target Optimization Result:**
- Memory reduction: ~90% (10-15 MB → 1-2 MB)
- Performance gain: +15-30% FPS
- Visual complexity: Increased by 4-8x

## 1. Material Pooling

### Problem

Currently, each ship creates its own material instances:
- 16 ships × 7-13 materials per ship = 140+ material instances
- Each material is 2-5 KB of GPU memory
- Total: ~3-5 MB wasted on duplicate materials

Example wastage:
```
Shuttle 1: MeshStandardMaterial { color: '#2a2a40', metalness: 0.92, roughness: 0.15 }
Shuttle 2: MeshStandardMaterial { color: '#2a2a40', metalness: 0.92, roughness: 0.15 }  ← Identical!
Shuttle 3: MeshStandardMaterial { color: '#2a2a40', metalness: 0.92, roughness: 0.15 }  ← Identical!
...
```

### Solution: Shared Material Pool

Create a single instance of each material type and reuse across all ships:

```typescript
// At top of FlyingShips component
const materialPool = useMemo(() => ({
  // Hull materials (base metallics)
  hullDarkMetal: new THREE.MeshStandardMaterial({
    color: '#1a1a28',
    metalness: 0.92,
    roughness: 0.15,
  }),
  hullNavyBlue: new THREE.MeshStandardMaterial({
    color: '#1a2a3a',
    metalness: 0.92,
    roughness: 0.15,
  }),
  hullDeepPurple: new THREE.MeshStandardMaterial({
    color: '#2a1a3a',
    metalness: 0.92,
    roughness: 0.15,
  }),

  // Bridge/cockpit (dark metal)
  cockpitMetal: new THREE.MeshStandardMaterial({
    color: '#0a1020',
    metalness: 0.95,
    roughness: 0.1,
  }),

  // Engine glow (emissive, no lights)
  engineCyan: new THREE.MeshBasicMaterial({
    color: '#00ccff',
    transparent: true,
    opacity: 0.4,
  }),
  engineOrange: new THREE.MeshBasicMaterial({
    color: '#ff6600',
    transparent: true,
    opacity: 0.5,
  }),

  // Detail parts
  tailLight: new THREE.MeshBasicMaterial({
    color: '#ff0033',
  }),
  runningLightGreen: new THREE.MeshBasicMaterial({
    color: '#00ff00',
  }),
  runningLightRed: new THREE.MeshBasicMaterial({
    color: '#ff0000',
  }),
}), []);

// Usage in Ship component
function Ship({ config, index }: { config: ShipConfig; index: number }) {
  const [width, height, depth] = config.size;

  // Select material based on config
  const hullMaterial = materialPool.hullDarkMetal;  // or select dynamically
  const engineMaterial = config.engineColor === '#00ccff'
    ? materialPool.engineCyan
    : materialPool.engineOrange;

  return (
    <group>
      {/* Main hull - uses shared material */}
      <mesh material={hullMaterial}>
        <boxGeometry args={[width, height, depth]} />
      </mesh>

      {/* Cockpit - uses shared material */}
      <mesh position={[width * 0.35, height * 0.3, 0]} material={materialPool.cockpitMetal}>
        <boxGeometry args={[width * 0.25, height * 0.5, depth * 0.6]} />
      </mesh>

      {/* Engine glow - uses shared material */}
      <mesh position={[-width * 0.5, 0, 0]} material={engineMaterial}>
        <sphereGeometry args={[height * 0.3, 8, 8]} />
      </mesh>
    </group>
  );
}
```

### Memory Savings Calculation

Before optimization:
- 140 material instances × 3 KB average = 420 KB
- Plus 140 × 0.5 KB overhead = 70 KB
- **Total: ~490 KB for materials alone**

After optimization:
- 8-12 shared materials × 3 KB = 24-36 KB
- Plus minimal overhead = 30-40 KB
- **Total: ~35 KB for materials**

**Savings: ~93% reduction** (490 KB → 35 KB)

### Implementation Steps

1. Add `useMemo` hook at top of `FlyingShips()` to create material pool
2. Define 8-12 commonly used material configurations
3. Pass `materialPool` to `Ship` component as prop
4. Replace all `new THREE.MeshStandardMaterial()` calls with references to pool
5. Use config values to select appropriate material from pool

## 2. Geometry Pooling

### Problem

Each ship creates unique geometry instances:
- 16 ships × 7-13 geometries per ship = 140+ geometry instances
- Each geometry: 1-3 KB depending on vertices
- Total: ~3-8 MB wasted on duplicate geometries

Example wastage:
```
Shuttle 1: boxGeometry(0.8, 0.25, 0.4)
Shuttle 2: boxGeometry(0.8, 0.25, 0.4)  ← Same dimensions!
Shuttle 3: boxGeometry(0.8, 0.25, 0.4)  ← Same dimensions!
...
(Also happens with cylinders, spheres, planes)
```

### Solution: Geometry Cache with Scaling

Create base geometries once and reuse with scale transforms:

```typescript
// At top of FlyingShips component
const geometryCache = useMemo(() => ({
  // Normalized geometries (1x1x1)
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(1, 8, 8),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 8),
  cone: new THREE.CylinderGeometry(0, 1, 1, 8),
  plane: new THREE.PlaneGeometry(1, 1),

  // Higher detail versions (for 9x ships)
  sphereHigh: new THREE.SphereGeometry(1, 16, 16),
  cylinderHigh: new THREE.CylinderGeometry(1, 1, 1, 16),
}), []);

// Usage in Ship component
function Ship({ config, index }: { config: ShipConfig; index: number }) {
  const [width, height, depth] = config.size;

  return (
    <group>
      {/* Main hull using cached geometry with scale */}
      <mesh scale={[width, height, depth]} geometry={geometryCache.box}>
        <meshStandardMaterial color={config.color} />
      </mesh>

      {/* Engine glow sphere using cached geometry with scale */}
      <mesh
        position={[-width * 0.5, 0, 0]}
        scale={[height * 0.3, height * 0.3, height * 0.3]}
        geometry={geometryCache.sphere}
      >
        <meshBasicMaterial color={config.engineColor} />
      </mesh>

      {/* Tail light (tiny box) */}
      <mesh
        position={[-width * 0.5, 0, depth * 0.3]}
        scale={[0.05, height * 0.4, 0.15]}
        geometry={geometryCache.box}
      >
        <meshBasicMaterial color="#ff0033" />
      </mesh>
    </group>
  );
}
```

### Memory Savings Calculation

Before optimization:
- 140 geometry instances × 2-5 KB average = 280-700 KB
- **Total: ~500 KB average for geometries**

After optimization:
- 5-7 cached geometries × 2-5 KB = 10-35 KB
- Scaling transforms: negligible overhead
- **Total: ~20 KB for geometries**

**Savings: ~96% reduction** (500 KB → 20 KB)

### Implementation Steps

1. Create `geometryCache` useMemo at top of `FlyingShips()`
2. Define 5-7 base normalized geometries (unit size)
3. Pass `geometryCache` to `Ship` component
4. Replace all `new THREE.BoxGeometry()`, etc. with references to cache
5. Use `scale` prop on meshes to achieve desired dimensions

## 3. InstancedMesh for Repeated Parts

### Problem

Many identical parts rendered as individual meshes:
- Ship windows: 8-12 per ship × 16 ships = 128-192 individual meshes
- Running lights: 2 per large ship × 8 large ships = 16 individual meshes
- Tail lights: 2 per ship × 16 ships = 32 individual meshes

Each individual mesh = 1 draw call. Total: 140+ draw calls for ships alone.

### Solution: Batch Rendering with InstancedMesh

Use `THREE.InstancedMesh` to render identical geometry/material in one draw call:

```typescript
// Example: Efficient window rendering across entire fleet
function ShipWindows() {
  const instanceRef = useRef<THREE.InstancedMesh>(null);

  // Calculate total windows
  const totalWindows = useMemo(() => {
    let count = 0;
    // 8 shuttles × 8 windows each
    count += 8 * 8;
    // 5 transports × 12 windows each
    count += 5 * 12;
    // 3 freighters × 16 windows each
    count += 3 * 16;
    return count;  // 200+ windows total
  }, []);

  useFrame(() => {
    if (instanceRef.current) {
      // Update matrix for each window
      let index = 0;
      ships.forEach((ship, shipIndex) => {
        const windowsPerShip = calculateWindowCount(ship.type);
        for (let w = 0; w < windowsPerShip; w++) {
          const matrix = new THREE.Matrix4();
          const shipPos = getShipPosition(shipIndex);
          const windowPos = getWindowPosition(ship, w);

          matrix.setPosition(
            shipPos.x + windowPos.x,
            shipPos.y + windowPos.y,
            shipPos.z + windowPos.z
          );

          instanceRef.current.setMatrixAt(index, matrix);
          index++;
        }
      });
      instanceRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={instanceRef} args={[
      geometryCache.plane,
      materialPool.windowGlass,
      totalWindows
    ]} />
  );
}
```

### When to Use InstancedMesh

- Parts appear 10+ times with identical geometry/material
- Can use matrix transforms for positioning
- Parts update relatively frequently

### Examples in Ship System

| Part Type | Count | Current Draw Calls | With Instancing | Savings |
|-----------|-------|-------------------|-----------------|---------|
| Windows | 200+ | 200+ | 1 | 99.5% |
| Running Lights | 16 | 16 | 1 | 94% |
| Tail Lights | 32 | 32 | 2 | 94% |
| **TOTAL SAMPLE** | **248** | **248** | **4** | **98%** |

### Memory Savings Calculation

Before optimization (for windows only):
- 200 meshes × 2 KB overhead = 400 KB
- 200 geometries × 0.5 KB = 100 KB
- Total: 500 KB for windows alone

After optimization:
- 1 InstancedMesh + 1 geometry = 3 KB
- Matrix array: ~3 KB for 200 transforms
- Total: 6 KB for windows

**Savings: ~99% reduction** (500 KB → 6 KB)

## 4. LOD (Level of Detail) System

### Concept

Render ships with different complexity based on distance from camera:
- **LOD 0** (0-30 units): Full detail - all parts rendered
- **LOD 1** (30-80 units): Medium detail - simplified cockpit, fewer lights
- **LOD 2** (80+ units): Low detail - simple hull, no detail parts

```
Camera (Z=0)
           Detail Level
    0-30: ████████████████ Full (100% parts)
  30-80:  ████████░░░░░░░░░ Medium (50% parts)
   80+:   ███░░░░░░░░░░░░░░ Low (20% parts)
```

### Implementation with @react-three/drei

```typescript
import { Lod } from '@react-three/drei';

function AdaptiveShip({ config, index }: { config: ShipConfig; index: number }) {
  const [width, height, depth] = config.size;

  return (
    <Lod distances={[30, 80]}>
      {/* LOD 0: Full detail (closest range) */}
      <group>
        {/* Main hull */}
        <mesh geometry={geometryCache.box} scale={[width, height, depth]}>
          <meshStandardMaterial color={config.color} />
        </mesh>

        {/* Cockpit */}
        <mesh position={[width * 0.35, height * 0.3, 0]}
              scale={[width * 0.25, height * 0.5, depth * 0.6]}
              geometry={geometryCache.box}>
          <meshStandardMaterial color="#0a1020" />
        </mesh>

        {/* Tail lights (2) */}
        <mesh position={[-width * 0.5, 0, depth * 0.3]} scale={[0.05, height * 0.4, 0.15]} geometry={geometryCache.box}>
          <meshBasicMaterial color="#ff0033" />
        </mesh>
        <mesh position={[-width * 0.5, 0, -depth * 0.3]} scale={[0.05, height * 0.4, 0.15]} geometry={geometryCache.box}>
          <meshBasicMaterial color="#ff0033" />
        </mesh>

        {/* Running lights (2) */}
        <mesh position={[0, height * 0.5, depth * 0.4]} scale={0.06} geometry={geometryCache.sphere}>
          <meshBasicMaterial color="#00ff00" />
        </mesh>
        <mesh position={[0, height * 0.5, -depth * 0.4]} scale={0.06} geometry={geometryCache.sphere}>
          <meshBasicMaterial color="#ff0000" />
        </mesh>

        {/* Engine exhaust */}
        <mesh position={[-width * 0.52, 0, 0]} scale={[height * 0.3, height * 0.5, 0.3]} geometry={geometryCache.cylinder}>
          <meshBasicMaterial color={config.engineColor} transparent opacity={0.4} />
        </mesh>
      </group>

      {/* LOD 1: Medium detail (mid-range) */}
      <group>
        {/* Main hull */}
        <mesh geometry={geometryCache.box} scale={[width, height, depth]}>
          <meshStandardMaterial color={config.color} />
        </mesh>

        {/* Cockpit only */}
        <mesh position={[width * 0.35, height * 0.3, 0]}
              scale={[width * 0.25, height * 0.5, depth * 0.6]}
              geometry={geometryCache.box}>
          <meshStandardMaterial color="#0a1020" />
        </mesh>

        {/* Engine glow only */}
        <mesh position={[-width * 0.5, 0, 0]} scale={height * 0.2} geometry={geometryCache.sphere}>
          <meshBasicMaterial color={config.engineColor} />
        </mesh>
      </group>

      {/* LOD 2: Low detail (far away) */}
      <group>
        {/* Just the hull with emissive color */}
        <mesh geometry={geometryCache.box} scale={[width, height, depth]}>
          <meshBasicMaterial
            color={config.color}
            emissive={config.engineColor}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    </Lod>
  );
}
```

### Detail Level Guidelines

| LOD | Distance | Hull | Cockpit | Lights | Exhaust | Detail Parts | Geometry Count |
|-----|----------|------|---------|--------|---------|--------------|----------------|
| 0 (Full) | 0-30 | ✓ | ✓ | ✓ | ✓ | ✓ | 8-16 |
| 1 (Med) | 30-80 | ✓ | ✓ | ✓ | - | - | 3-4 |
| 2 (Low) | 80+ | ✓ | - | - | - | - | 1 |

### Performance Improvement

Assuming typical scene (1x, 2x, 3x, 5x ships at various distances):
- Full fleet (no LOD): 140+ draw calls
- With LOD: ~40-60 draw calls
- **Improvement: 60-70% reduction**

## 5. Light Reduction Strategies

### Problem

32 point lights in scene (2 per ship):
- Each point light: ~0.5-1 KB memory
- THREE.js rendering cost: high (especially 100+ lights)
- Mobile performance: severely impacted

### Solution 1: Emissive Materials Instead of Point Lights

Replace point lights with emissive materials:

```typescript
// BEFORE: Using point light (expensive)
<pointLight
  color="#00ccff"
  intensity={0.8}
  distance={6}
  position={[-width * 0.5, 0, 0]}
/>

// AFTER: Using emissive material (cheap)
<mesh position={[-width * 0.5, 0, 0]} scale={height * 0.3} geometry={geometryCache.sphere}>
  <meshBasicMaterial
    color="#00ccff"
    emissive="#00ccff"
    emissiveIntensity={1}
    toneMapped={false}  // Prevents tone mapping for bright effects
  />
</mesh>

// No light needed - the emissive mesh provides the visual effect
```

Emissive material characteristics:
- Self-illuminated appearance
- No performance penalty
- Doesn't cast light on other objects
- Perfect for engine glows, running lights, window lights

### Solution 2: Conditional Lighting for Closest Ships

Only render lights for nearest ships:

```typescript
function ShipWithConditionalLights({ config, index }: ShipProps) {
  const ref = useRef<THREE.Group>(null);
  const [hasLights, setHasLights] = useState(false);

  useFrame(({ camera }) => {
    if (ref.current) {
      const distanceToCamera = camera.position.distanceTo(ref.current.position);
      const shouldHaveLights = distanceToCamera < 40;  // Lights only within 40 units
      setHasLights(shouldHaveLights);
    }
  });

  return (
    <group ref={ref} position={[x, y, z]}>
      {/* Hull and parts */}

      {/* Lights only for close ships */}
      {hasLights && (
        <>
          <pointLight color={config.lightColor} intensity={0.8} distance={6} position={[width * 0.5, 0, 0]} />
          <pointLight color={config.engineColor} intensity={0.6} distance={5} position={[-width * 0.5, 0, 0]} />
        </>
      )}
    </group>
  );
}
```

### Combined Strategy

Best approach combines both:
1. All ships use emissive materials (no performance cost)
2. Only closest 3-4 ships have point lights (visual enhancement)
3. Result: 32 lights → 3-8 lights, ~75-90% reduction

## 6. React.memo Optimization

### Problem

Ship component re-renders unnecessarily when parent component updates:

```typescript
// Without memo: ShipA re-renders even if only ShipB config changed
const ships = [
  <Ship key={0} config={configA} />,
  <Ship key={1} config={configB} />,  // Changed
  <Ship key={2} config={configC} />,  // Re-renders unnecessarily
];
```

### Solution: Memoize with Custom Comparison

```typescript
const Ship = React.memo(
  ({ config, index }: { config: ShipConfig; index: number }) => {
    // Component implementation
    return (
      <group>
        {/* Render logic */}
      </group>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - only consider config changes
    return prevProps.config === nextProps.config && prevProps.index === nextProps.index;
  }
);
```

### Rendering Impact

- Without memo: 16 components re-render ~60 times/second = 960 re-renders/frame
- With memo: ~2-3 components re-render = 2-3 re-renders/frame
- **Improvement: 99% fewer re-renders**

## 7. High-Complexity Ship Template (64+ Parts)

### Architecture for 9x Capital Ship

For massive 9x ships with ultra detail (64-128+ parts), use a modular architecture:

```typescript
interface CapitalShipConfig extends ShipConfig {
  complexity: 'ultra';
  segmentCount: number;  // 64+

  sections: {
    hull: { parts: number; detailLevel: number };
    superstructure: { towers: number; details: number };
    engines: { pods: number; exhausts: number };
    weapons: { turrets: number; bays: number };
    details: { count: number };
  };
}

function CapitalShip({ config }: { config: CapitalShipConfig }) {
  return (
    <group>
      {/* Main hull (1 instanced mesh with 10+ segments) */}
      <HullSegments config={config} />

      {/* Superstructure (8-16 individual parts, instanced windows) */}
      <Superstructure config={config} />

      {/* Engine pods (4-8 pods with 2-4 exhausts each) */}
      <EngineArray config={config} />

      {/* Weapon systems (8-16 turrets/bays) */}
      <WeaponSystems config={config} />

      {/* Details (100+ elements via instancing) */}
      <DetailElements config={config} />

      {/* Lights (only emissive or conditional) */}
      <BeaconLights config={config} />
    </group>
  );
}
```

### Part Budget Breakdown for 9x Capital Ship

| Component | Parts | Memory | Technique |
|-----------|-------|--------|-----------|
| Main Hull | 1 instanced mesh | 2 KB | InstancedMesh |
| Superstructure | 8-16 boxes | 20 KB | Geometry pool + materials pool |
| Engines | 20-32 cylinders/spheres | 30 KB | Geometry pool + instancing |
| Weapons | 12-20 boxes | 25 KB | Geometry pool + materials pool |
| Windows | 50-100 planes | 5 KB | InstancedMesh |
| Details | 50-100+ elements | 10 KB | InstancedMesh |
| Lights | 0 point lights + emissive | 5 KB | Emissive materials |
| **TOTAL** | **64-128+ visual parts** | **~100 KB** | - |

Compare to unoptimized: Would be 2-5 MB for same visual complexity!

## 8. Performance Testing & Metrics

### How to Profile in Browser

**Using Chrome DevTools:**

1. Open DevTools (F12)
2. Go to "Performance" tab
3. Click record, let scene run 3-5 seconds, stop
4. Look for:
   - Frame rate (should be 60 FPS, min 45)
   - GPU memory (should be < 50 MB total)
   - Draw calls (should be < 100 for entire scene)

**Using Three.js Stats.js:**

```typescript
import Stats from 'three/examples/jsm/libs/stats.module.js';

// Add to your canvas
const stats = new Stats();
document.body.appendChild(stats.dom);

// In animation loop
stats.update();
```

Monitor:
- **FPS**: Target 60 on desktop, 45+ on mobile
- **Geometries**: Current benchmark ~140, target <50 optimized
- **Materials**: Current benchmark ~140, target <15 optimized
- **Textures**: Monitor in DevTools Memory tab

### Target Metrics by Size Tier

| Tier | Ships | Expected FPS | GPU Memory | Draw Calls | Recommendation |
|------|-------|--------------|-----------|-----------|-----------------|
| 1x (current) | 16 | 55-60 | 10-15 MB | 120-140 | Baseline |
| 1x + optimized | 16 | 58-60 | 1-2 MB | 20-30 | 95% improvement |
| 3x + optimized | 16 | 50-55 | 3-5 MB | 35-50 | Still mobile-friendly |
| 5x + optimized | 16 | 45-50 | 5-8 MB | 50-70 | Desktop recommended |
| 9x + optimized | 16 | 40-45 | 8-12 MB | 70-100 | Desktop required |

### Bottleneck Identification

**If FPS drops:**
1. Check draw calls (DevTools) - if >150, use instancing
2. Check GPU memory - if >50 MB, use pooling
3. Check for 100+ lights - reduce using emissive materials

**If mobile is slow:**
1. Reduce LOD distances (switch to lower detail sooner)
2. Disable lights (use emissive only)
3. Reduce ship count or use 1x/2x sizes only

---

## Summary: Optimization Impact

Combining all techniques for a fleet of 16 ships:

| Metric | Current | Optimized | Improvement |
|--------|---------|-----------|------------|
| GPU Memory | 10-15 MB | 1-2 MB | **~90%** |
| Draw Calls | 140+ | 20-40 | **~85%** |
| Materials | 140+ | 8-12 | **~93%** |
| Geometries | 140+ | 6-10 | **~96%** |
| Point Lights | 32 | 0-3 | **~90%** |
| FPS (Desktop) | 55-60 | 58-60 | **+5-10%** |
| FPS (Mobile) | 25-35 | 40-50 | **+50%** |

This enables scaling to 9x ships with 64-128+ parts while using LESS memory than the current 16 basic ships.

---

## Related Documentation

- **Architecture & Configuration**: See `ship-system-guide.md`
- **Code Examples**: See `ship-examples.md` with full optimization implementations
- **Implementation**: `/components/three/Environment.tsx` lines 421-675
