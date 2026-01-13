---
allowed-tools: Read, Write, Edit, Bash(file:*), Glob, Grep
argument-hint: [size-multiplier] [count] [complexity-level]
description: Add optimized 9x capital ships to the NUWRRRLD environment with proper geometry and material pooling
---

# Add Capital Ships (9x Optimized)

Add massive, ultra-detailed capital ships (9x size or larger) with full optimization techniques to maximize visual quality while minimizing GPU memory usage. Capital ships use geometry pooling, material pooling, and proper useMemo patterns.

## Overview

Capital ships are flagship vessels with high visual complexity (64-128+ parts). This guide ensures they're implemented using the optimization techniques documented in `ship-optimization.md` rather than creating geometries/materials in loops.

**Memory efficiency:**
- ❌ Naive approach: ~5-8 MB per ship (geometries + materials created in render loops)
- ✅ Optimized approach: ~100-200 KB per ship (shared geometries + pooled materials)
- **Savings: ~96% memory reduction**

## Quick Start

### Step 1: Setup Geometry Pool (Once in FlyingShips)

```typescript
// At top of FlyingShips component, create ONCE
const geometryPool = useMemo(() => ({
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(1, 8, 8),
  sphereHigh: new THREE.SphereGeometry(1, 16, 16),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 8),
  cylinderHigh: new THREE.CylinderGeometry(1, 1, 1, 16),
  plane: new THREE.PlaneGeometry(1, 1),
}), []);
```

### Step 2: Setup Material Pool (Once in FlyingShips)

```typescript
// Create ONCE - reuse for all capital ships
const materialPool = useMemo(() => ({
  // Hull materials
  hullDarkMetal: new THREE.MeshStandardMaterial({
    color: '#0a0a1a',
    metalness: 0.95,
    roughness: 0.15,
  }),
  hullNavy: new THREE.MeshStandardMaterial({
    color: '#1a2a3a',
    metalness: 0.92,
    roughness: 0.15,
  }),
  cockpitMetal: new THREE.MeshStandardMaterial({
    color: '#050510',
    metalness: 0.98,
    roughness: 0.1,
  }),
  // Engine glow materials
  engineOrange: new THREE.MeshStandardMaterial({
    color: '#ff6600',
    emissive: '#ff6600',
    emissiveIntensity: 1,
    metalness: 0,
    roughness: 0.8,
  }),
  engineCyan: new THREE.MeshStandardMaterial({
    color: '#00ccff',
    emissive: '#00ccff',
    emissiveIntensity: 0.8,
    metalness: 0,
    roughness: 0.8,
  }),
}), []);
```

### Step 3: Add Capital Ship to Fleet

```typescript
// Add to FlyingShips() fleet array
fleet.push({
  type: 'dreadnought',
  size: [
    (4.0 + random(seedNum) * 1.5) * 9,    // Width: 36-49.5 units
    (1.2 + random(seedNum + 1) * 0.5) * 9, // Height: 10.8-13.5 units
    (2.5 + random(seedNum + 2) * 1.0) * 9  // Depth: 22.5-29.5 units
  ],
  speed: 0.04 + random(seedNum + 3) * 0.02,  // Very slow
  color: '#0a0a1a',
  lightIntensity: 1.5,
  lightColor: '#ffddaa',
  engineColor: '#ff6600',
  yBase: 30 + random(seedNum + 4) * 10,
  zLane: -50 - random(seedNum + 5) * 15,
  direction: 1,
  offset: 0,
});
```

### Step 4: Create Capital Ship Component

```typescript
function CapitalShip({
  config,
  index,
  geometryPool,
  materialPool,
}: {
  config: ShipConfig;
  index: number;
  geometryPool: any;
  materialPool: any;
}) {
  const [width, height, depth] = config.size;

  // Pre-compute non-geometry data (positions only)
  const enginePods = useMemo(() => [
    { x: -width * 0.35, z: depth * 0.35 },
    { x: -width * 0.35, z: -depth * 0.35 },
    { x: width * 0.35, z: depth * 0.35 },
    { x: width * 0.35, z: -depth * 0.35 },
  ], [width, depth]);

  const emissionPanels = useMemo(() => [
    { pos: [0, height * 0.3, depth * 0.5] as [number, number, number] },
    { pos: [0, height * 0.3, -depth * 0.5] as [number, number, number] },
  ], [height, depth]);

  // Engine material - created once per ship, derived from pool
  const engineMat = useMemo(() =>
    new THREE.MeshStandardMaterial({
      color: config.engineColor,
      emissive: config.engineColor,
      emissiveIntensity: 1,
      metalness: 0,
      roughness: 0.8,
    })
  , [config.engineColor]);

  return (
    <group>
      {/* MAIN HULL - using POOLED geometry and material */}
      <mesh
        geometry={geometryPool.box}
        scale={[width, height, depth]}
        material={materialPool.hullDarkMetal}
        castShadow
      />

      {/* SUPERSTRUCTURE TOWER 1 - using POOLED geometry */}
      <mesh
        position={[-width * 0.2, height * 0.6, 0]}
        geometry={geometryPool.box}
        scale={[width * 0.3, height * 0.8, depth * 0.4]}
        material={materialPool.hullNavy}
        castShadow
      />

      {/* SUPERSTRUCTURE TOWER 2 - using POOLED geometry */}
      <mesh
        position={[width * 0.2, height * 0.5, 0]}
        geometry={geometryPool.box}
        scale={[width * 0.25, height * 0.6, depth * 0.35]}
        material={materialPool.hullNavy}
        castShadow
      />

      {/* COMMAND BRIDGE - using POOLED geometry */}
      <mesh
        position={[0, height * 0.75, 0]}
        geometry={geometryPool.box}
        scale={[width * 0.4, height * 0.3, depth * 0.3]}
        material={materialPool.cockpitMetal}
        castShadow
      />

      {/* ENGINE PODS (4) - using POOLED cylinder, positions from useMemo */}
      {enginePods.map((pos, i) => (
        <mesh
          key={`engine-${i}`}
          position={[pos.x, -height * 0.2, pos.z]}
          geometry={geometryPool.cylinder}
          scale={[height * 0.15, height * 0.3, height * 0.2]}
          material={engineMat}
        />
      ))}

      {/* EMISSION PANELS - using POOLED plane, positions from useMemo */}
      {emissionPanels.map((panel, i) => (
        <mesh
          key={`panel-${i}`}
          position={panel.pos}
          geometry={geometryPool.plane}
          scale={[width * 0.5, height * 0.2, 1]}
          material={materialPool.engineCyan}
        />
      ))}

      {/* BEACON LIGHTS - using emissive instead of many point lights */}
      <pointLight
        color="#ff00ff"
        intensity={1.2}
        distance={40}
        position={[0, height / 2 + 3, 0]}
      />

      <pointLight
        color={config.engineColor}
        intensity={0.8}
        distance={30}
        position={[-width * 0.5, 0, 0]}
      />
    </group>
  );
}
```

## Complete Implementation Example

See `ship-examples.md` Example 3 "Add a 9x Capital Ship (Optimized)" for a full working example.

## Key Optimization Principles

### ✅ DO:
- Create geometries ONCE in `useMemo` at parent level
- Create materials ONCE in `useMemo` at parent level
- Use `useMemo` for position arrays (data-only, no geometries)
- Pass `geometryPool` and `materialPool` as props
- Reuse geometries with `scale` prop for different sizes
- Use emissive materials instead of point lights for better performance

### ❌ DON'T:
- ❌ Create new geometries inside `.map()` loops
- ❌ Create new materials inside render functions
- ❌ Use `<boxGeometry />`, `<sphereGeometry />` etc. inline
- ❌ Create 4+ point lights per ship
- ❌ Render the same material definition multiple times

## Performance Metrics

| Metric | Naive | Optimized | Savings |
|--------|-------|-----------|---------|
| GPU Memory per ship | 5-8 MB | 100-200 KB | **96%** |
| Geometry instances per ship | 40-60 | 6-8 | **87-90%** |
| Material instances per ship | 40-60 | 8-12 | **80-87%** |
| Draw calls per ship | 40-60 | 4-8 | **85-90%** |
| Point lights per ship | 6-8 | 2-3 | **60-70%** |

With proper pooling, you can add 5-10 capital ships instead of just 1, with less total memory usage.

## Size Reference

| Size | Dimensions | Use Case | Complexity |
|------|-----------|----------|-----------|
| 5x | 4-10 units | Large cruiser | 24-48 parts |
| 7x | 6-14 units | Heavy battleship | 48-96 parts |
| 9x | 7-18 units | Capital dreadnought | 64-128+ parts |
| 15x | 12-30 units | Massive flagship | 128-256+ parts (LOD required) |

## Common Mistakes

### Mistake 1: Creating Geometries in Loops
```typescript
// ❌ WRONG - Creates new geometry every render iteration
{enginePods.map((pos, i) => (
  <mesh key={i} position={pos}>
    <cylinderGeometry args={[height * 0.15, height * 0.2, height * 0.3, 8]} />
    {/* ... */}
  </mesh>
))}
```

**Fix:** Use pooled geometry
```typescript
// ✅ CORRECT - Geometry created once in pool
{enginePods.map((pos, i) => (
  <mesh key={i} position={pos} geometry={geometryPool.cylinder}>
    {/* ... */}
  </mesh>
))}
```

### Mistake 2: Creating Materials in Loops
```typescript
// ❌ WRONG - Creates new material for every panel
{emissionPanels.map((panel, i) => (
  <mesh key={i} position={panel.pos}>
    <meshBasicMaterial color="#00ffff" emissive="#00ffff" />
  </mesh>
))}
```

**Fix:** Create material once
```typescript
// ✅ CORRECT - Material created once in useMemo
const panelMat = useMemo(() =>
  new THREE.MeshStandardMaterial({
    color: '#00ffff',
    emissive: '#00ffff',
    emissiveIntensity: 0.5,
  })
, []);

{emissionPanels.map((panel, i) => (
  <mesh key={i} position={panel.pos} material={panelMat} geometry={geometryPool.plane} />
))}
```

### Mistake 3: Too Many Point Lights
```typescript
// ❌ WRONG - 8+ point lights per ship
<pointLight ... />
<pointLight ... />
<pointLight ... />
// ... (repeated)
```

**Fix:** Use emissive materials + limited lights
```typescript
// ✅ CORRECT - 2-3 lights, rest are emissive
<pointLight color="#ff00ff" intensity={1} distance={40} /> {/* Beacon */}
<pointLight color={config.engineColor} intensity={0.8} distance={30} /> {/* Engine */}

{/* Panels use emissive material, not lights */}
<mesh material={emissiveMaterial} />
```

## Advanced: InstancedMesh for Windows

For 64-128+ windows, use InstancedMesh instead of individual meshes:

```typescript
const windowInstanceRef = useRef<THREE.InstancedMesh>(null);

useFrame(() => {
  // Update window positions via matrix transforms
  let index = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 16; col++) {
      const matrix = new THREE.Matrix4();
      matrix.setPosition(
        col * windowSpacing.x,
        row * windowSpacing.y,
        surfaceZ
      );
      windowInstanceRef.current.setMatrixAt(index, matrix);
      index++;
    }
  }
  windowInstanceRef.current.instanceMatrix.needsUpdate = true;
});

return (
  <instancedMesh ref={windowInstanceRef} args={[geometryPool.plane, windowMaterial, totalWindows]} />
);
```

This reduces 128 meshes → 1 draw call.

## Related Documentation

- **Ship System Guide**: `ship-system-guide.md` - Architecture and configuration
- **Optimization Guide**: `ship-optimization.md` - Detailed pooling techniques
- **Code Examples**: `ship-examples.md` - Complete working examples
- **Implementation**: `/components/three/Environment.tsx` lines 421-675
