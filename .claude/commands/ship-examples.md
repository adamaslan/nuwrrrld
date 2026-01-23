---
allowed-tools: Read, Edit, Bash(file:*)
description: Copy-paste templates and examples for NUWRRRLD ships at all complexity levels
---

# Ship System Examples & Templates

Ready-to-use code examples for adding ships at various sizes and complexity levels. All examples follow the patterns in `ship-system-guide.md` and optimization techniques from `ship-optimization.md`.

## Quick Start Examples

### Example 1: Add a 2x Medium Corvette

**What it does:** Adds 6 medium-sized corvette ships (2x the size of shuttle) with moderate complexity.

**Where to add:** In `/components/three/Environment.tsx`, in the `FlyingShips()` function, after the transport generation loop (around line 500).

```typescript
// NEW: Medium Corvettes (2x size) - 6 ships
for (let i = 0; i < 6; i++) {
  fleet.push({
    type: 'corvette',
    size: [
      (1.2 + random(i) * 0.3) * 2,       // Width * 2x
      (0.35 + random(i + 10) * 0.15) * 2, // Height * 2x
      (0.6 + random(i + 20) * 0.25) * 2   // Depth * 2x
    ],
    speed: 0.22 + random(i + 30) * 0.07,
    color: ['#1a2a3a', '#281a28', '#1a2828'][i % 3],
    lightIntensity: 0.7,
    lightColor: '#ffffff',
    engineColor: '#0088ff',
    yBase: 9 + random(i + 50) * 8,
    zLane: -12 - random(i + 60) * 13,
    direction: i % 2 === 0 ? 1 : -1,
    offset: (16 + i) * 12,  // Offset after existing 16 ships
  });
}
```

**Memory impact:** ~45 KB additional (uses shared materials/geometries if pooling implemented)

**Visual result:** Six medium-sized blue-gray ships moving at moderate speed with white headlights

---

### Example 2: Add a 5x Hero Battlecruiser

**What it does:** Adds a single large battlecruiser (5x size) as a hero/focal point with higher detail and slower movement.

**Where to add:** In `FlyingShips()` after transport generation, or as a special case.

```typescript
// NEW: Hero Battlecruiser (5x size) - 1 ship
const battlecruiserIndex = fleet.length;
fleet.push({
  type: 'battlecruiser',
  size: [
    (2.5 + random(100) * 0.8) * 5,      // Much larger: 12.5-18.5 units
    (0.6 + random(101) * 0.2) * 5,      // Height: 3-4 units
    (1.2 + random(102) * 0.4) * 5       // Depth: 6-8 units
  ],
  speed: 0.10 + random(103) * 0.04,    // Very slow (impressive presence)
  color: '#0a0a1a',                     // Black metal
  lightIntensity: 1.2,                  // Bright lights
  lightColor: '#ffddaa',                // Warm accent lighting
  engineColor: '#ff6600',               // Orange engines (cargo/military)
  yBase: 20 + random(104) * 8,         // Higher altitude
  zLane: -35 - random(105) * 10,       // Further back
  direction: 1,                         // Always left-to-right
  offset: 0,                            // No phase offset
});
```

**Memory impact:** ~100-150 KB (single large ship, best with LOD system)

**Visual result:** One massive, slow-moving ship with commanding presence, warm lighting

---

### Example 3: Add a 9x Capital Ship (Optimized)

**What it does:** Adds an ultra-large capital ship (9x size) using full optimization techniques.

**Prerequisites:** Must implement material pooling and geometry pooling from `ship-optimization.md`

**Where to add:** In `FlyingShips()` as a special case, or new function.

```typescript
// NEW: Capital Ship (9x size) - 1 ultra-detailed ship (OPTIMIZED)
function FlyingShips() {
  // ... existing code ...

  // Setup optimization resources ONCE
  const { materialPool, geometryCache } = useMemo(() => {
    return {
      materialPool: {
        hullDarkMetal: new THREE.MeshStandardMaterial({
          color: '#0a0a1a',
          metalness: 0.95,
          roughness: 0.15,
        }),
        hullNavyBlue: new THREE.MeshStandardMaterial({
          color: '#1a2a3a',
          metalness: 0.92,
          roughness: 0.15,
        }),
        cockpitMetal: new THREE.MeshStandardMaterial({
          color: '#050510',
          metalness: 0.98,
          roughness: 0.1,
        }),
        engineGlowOrange: new THREE.MeshBasicMaterial({
          color: '#ff6600',
          transparent: true,
          opacity: 0.5,
        }),
      },
      geometryCache: {
        box: new THREE.BoxGeometry(1, 1, 1),
        sphere: new THREE.SphereGeometry(1, 8, 8),
        sphereHigh: new THREE.SphereGeometry(1, 16, 16),
        cylinder: new THREE.CylinderGeometry(1, 1, 1, 8),
        cylinderHigh: new THREE.CylinderGeometry(1, 1, 1, 16),
      },
    };
  }, []);

  // Add capital ship to fleet
  fleet.push({
    type: 'dreadnought',
    size: [
      (4.0 + random(200) * 1.5) * 9,    // 36-49.5 units - massive
      (1.2 + random(201) * 0.5) * 9,    // 10.8-13.5 units - tall
      (2.5 + random(202) * 1.0) * 9     // 22.5-29.5 units - deep
    ],
    speed: 0.04 + random(203) * 0.02,   // Very slow
    color: '#0a0a1a',
    lightIntensity: 1.5,
    lightColor: '#ffddaa',
    engineColor: '#ff6600',
    yBase: 30 + random(204) * 10,       // High altitude
    zLane: -50 - random(205) * 15,      // Deep background
    direction: 1,
    offset: 0,
  });

  // ... rest of FlyingShips implementation ...
}

// NEW: Optimized capital ship component - DEMONSTRATES PROPER POOLING
function CapitalShip({
  config,
  index,
  materialPool,
  geometryCache,
}: {
  config: ShipConfig;
  index: number;
  materialPool: any;
  geometryCache: any;
}) {
  const [width, height, depth] = config.size;

  // Pre-compute engine pod positions (data-only, no geometry)
  const enginePods = useMemo(() => [
    { x: -width * 0.35, z: depth * 0.35 },
    { x: -width * 0.35, z: -depth * 0.35 },
    { x: width * 0.35, z: depth * 0.35 },
    { x: width * 0.35, z: -depth * 0.35 },
  ], [width, depth]);

  // Pre-compute panel positions (data-only, no geometry)
  const emissionPanels = useMemo(() => [
    { pos: [0, height * 0.3, depth * 0.5] as [number, number, number] },
    { pos: [0, height * 0.3, -depth * 0.5] as [number, number, number] },
  ], [height, depth]);

  // Create engine material once per ship (or pass from pool if available)
  const engineMat = useMemo(() =>
    new THREE.MeshStandardMaterial({
      color: config.engineColor,
      emissive: config.engineColor,
      emissiveIntensity: 1,
      metalness: 0,
      roughness: 0.8,
      toneMapped: false,
    })
  , [config.engineColor]);

  // Create panel material once per ship (or pass from pool)
  const panelMat = useMemo(() =>
    new THREE.MeshStandardMaterial({
      color: '#00ffff',
      emissive: '#00ffff',
      emissiveIntensity: 0.5,
      metalness: 0,
      roughness: 0.8,
    })
  , []);

  return (
    <group position={[0, 0, 0]}>
      {/* Main hull - using POOLED geometry and material */}
      <mesh
        geometry={geometryCache.box}
        scale={[width, height, depth]}
        material={materialPool.hullDarkMetal}
      />

      {/* Superstructure tower - 1 - using POOLED geometry and material */}
      <mesh
        position={[-width * 0.2, height * 0.6, 0]}
        geometry={geometryCache.box}
        scale={[width * 0.3, height * 0.8, depth * 0.4]}
        material={materialPool.hullNavyBlue}
      />

      {/* Superstructure tower - 2 - using POOLED geometry and material */}
      <mesh
        position={[width * 0.2, height * 0.5, 0]}
        geometry={geometryCache.box}
        scale={[width * 0.25, height * 0.6, depth * 0.35]}
        material={materialPool.hullNavyBlue}
      />

      {/* Command bridge - using POOLED geometry and material */}
      <mesh
        position={[0, height * 0.75, 0]}
        geometry={geometryCache.box}
        scale={[width * 0.4, height * 0.3, depth * 0.3]}
        material={materialPool.cockpitMetal}
      />

      {/* Primary engines (4 pods) - using POOLED cylinder geometry, computed positions */}
      {enginePods.map((pos, i) => (
        <mesh
          key={`engine-${i}`}
          position={[pos.x, -height * 0.2, pos.z]}
          scale={[height * 0.15, height * 0.3, height * 0.2]}
          geometry={geometryCache.cylinder}
          material={engineMat}
        />
      ))}

      {/* Emission panels - using POOLED plane geometry, computed positions */}
      {emissionPanels.map((panel, i) => (
        <mesh
          key={`panel-${i}`}
          position={panel.pos}
          scale={[width * 0.5, height * 0.2, 1]}
          geometry={geometryCache.plane}
          material={panelMat}
        />
      ))}

      {/* Note: Windows would use InstancedMesh for 64-128+ total elements */}
      {/* This template shows proper pooling for all non-instanced parts */}
    </group>
  );
}
```

**Memory impact:** ~100-150 KB with pooling (vs ~5 MB without optimization!)

**Visual result:** Massive capital ship with multiple superstructures, 4 engine pods, emissive panels

---

## Component Templates

### Template 1: Basic Ship (Low Complexity, 4-8 parts)

Best for: 1x-2x ships, background, swarms

**IMPORTANT:** This template should be passed `geometryPool` and `materialPool` props from parent component. See optimization guide for pooling setup.

```typescript
import { useMemo } from 'react';

function BasicShip({
  config,
  geometryPool,
  materialPool,
}: {
  config: ShipConfig;
  geometryPool: any;
  materialPool: any;
}) {
  const [width, height, depth] = config.size;

  // Create ship-specific materials using useMemo (or reuse from pool if available)
  const hullMat = useMemo(() =>
    new THREE.MeshStandardMaterial({
      color: config.color,
      metalness: 0.92,
      roughness: 0.15,
    })
  , [config.color]);

  const engineGlow = useMemo(() =>
    new THREE.MeshStandardMaterial({
      color: config.engineColor,
      emissive: config.engineColor,
      emissiveIntensity: 1,
      metalness: 0,
      roughness: 0.8,
      toneMapped: false,
    })
  , [config.engineColor]);

  return (
    <group>
      {/* Main hull - using POOLED geometry */}
      <mesh
        geometry={geometryPool.box}
        scale={[width, height, depth]}
        material={hullMat}
      />

      {/* Cockpit (small) - using POOLED geometry */}
      <mesh
        position={[width * 0.35, height * 0.2, 0]}
        geometry={geometryPool.box}
        scale={[width * 0.2, height * 0.4, depth * 0.5]}
        material={materialPool.cockpitMetal}
      />

      {/* Tail lights - red - using POOLED geometry */}
      <mesh
        position={[-width * 0.5, 0, depth * 0.3]}
        geometry={geometryPool.box}
        scale={[0.05, height * 0.4, 0.15]}
        material={materialPool.tailLight}
      />

      <mesh
        position={[-width * 0.5, 0, -depth * 0.3]}
        geometry={geometryPool.box}
        scale={[0.05, height * 0.4, 0.15]}
        material={materialPool.tailLight}
      />

      {/* Engine glow (emissive) - using POOLED geometry */}
      <mesh
        position={[-width * 0.5, 0, 0]}
        geometry={geometryPool.sphere}
        scale={[height * 0.3, height * 0.3, height * 0.3]}
        material={engineGlow}
      />

      {/* Headlight - optional, consider using emissive only for better performance */}
      <pointLight
        color={config.lightColor}
        intensity={config.lightIntensity}
        distance={6}
        position={[width * 0.5, 0, 0]}
      />
    </group>
  );
}
```

---

### Template 2: Medium Complexity Ship (12-24 parts)

Best for: 2x-3x ships, mid-ground, escorts

```typescript
function MediumShip({ config }: { config: ShipConfig }) {
  const [width, height, depth] = config.size;
  const engineRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (engineRef.current) {
      const t = state.clock.elapsedTime;
      engineRef.current.intensity = config.lightIntensity * (0.8 + Math.sin(t * 8) * 0.2);
    }
  });

  return (
    <group>
      {/* Main hull */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={config.color}
          metalness={0.92}
          roughness={0.15}
        />
      </mesh>

      {/* Cockpit */}
      <mesh position={[width * 0.35, height * 0.3, 0]}>
        <boxGeometry args={[width * 0.25, height * 0.5, depth * 0.6]} />
        <meshStandardMaterial color="#0a1020" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Wing/fin structures */}
      <mesh position={[0, 0, depth * 0.6]}>
        <boxGeometry args={[width * 0.6, height * 0.15, depth * 0.3]} />
        <meshStandardMaterial color={config.color} metalness={0.9} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0, -depth * 0.6]}>
        <boxGeometry args={[width * 0.6, height * 0.15, depth * 0.3]} />
        <meshStandardMaterial color={config.color} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Tail lights */}
      <mesh position={[-width * 0.5, 0, depth * 0.3]}>
        <boxGeometry args={[0.05, height * 0.4, 0.15]} />
        <meshBasicMaterial color="#ff0033" />
      </mesh>

      <mesh position={[-width * 0.5, 0, -depth * 0.3]}>
        <boxGeometry args={[0.05, height * 0.4, 0.15]} />
        <meshBasicMaterial color="#ff0033" />
      </mesh>

      {/* Running lights */}
      <mesh position={[0, height * 0.5, depth * 0.4]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>

      <mesh position={[0, height * 0.5, -depth * 0.4]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* Engine exhaust */}
      <mesh position={[-width * 0.52, 0, 0]}>
        <cylinderGeometry args={[height * 0.3, height * 0.5, 0.5, 8]} />
        <meshBasicMaterial color={config.engineColor} transparent opacity={0.4} />
      </mesh>

      {/* Lights */}
      <pointLight
        color={config.lightColor}
        intensity={config.lightIntensity}
        distance={10}
        position={[width * 0.5, 0, 0]}
      />

      <pointLight
        ref={engineRef}
        color={config.engineColor}
        intensity={config.lightIntensity * 0.8}
        distance={5}
        position={[-width * 0.5, 0, 0]}
      />
    </group>
  );
}
```

---

### Template 3: High Complexity Ship (48-64 parts)

Best for: 5x ships, hero ships, focal points

Uses material pooling and geometry caching:

```typescript
function HighDetailShip({
  config,
  index,
  materialPool,
  geometryCache,
}: {
  config: ShipConfig;
  index: number;
  materialPool: any;
  geometryCache: any;
}) {
  const [width, height, depth] = config.size;
  const engineRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (engineRef.current) {
      const t = state.clock.elapsedTime;
      engineRef.current.intensity = config.lightIntensity * (0.8 + Math.sin(t * 8 + index) * 0.2);
    }
  });

  return (
    <group>
      {/* Main hull - using shared geometry */}
      <mesh
        geometry={geometryCache.box}
        scale={[width, height, depth]}
        material={materialPool.hullDarkMetal}
      />

      {/* Cockpit/Bridge */}
      <mesh
        position={[width * 0.35, height * 0.3, 0]}
        scale={[width * 0.25, height * 0.5, depth * 0.6]}
        geometry={geometryCache.box}
        material={materialPool.cockpitMetal}
      />

      {/* Cargo section (freighter-style) */}
      <mesh
        position={[-width * 0.15, height * 0.1, 0]}
        scale={[width * 0.5, height * 0.8, depth * 0.9]}
        geometry={geometryCache.box}
        material={materialPool.cargoMetal}
      />

      {/* Cargo light panel */}
      <mesh
        position={[-width * 0.15, height * 0.5, depth * 0.46]}
        scale={[width * 0.4, 0.1, 0.01]}
        geometry={geometryCache.plane}
        material={materialPool.cargoLightGreen}
      />

      {/* Wing structures (2) */}
      <mesh
        position={[0, 0, depth * 0.6]}
        scale={[width * 0.6, height * 0.15, depth * 0.3]}
        geometry={geometryCache.box}
        material={materialPool.wingMetal}
      />

      <mesh
        position={[0, 0, -depth * 0.6]}
        scale={[width * 0.6, height * 0.15, depth * 0.3]}
        geometry={geometryCache.box}
        material={materialPool.wingMetal}
      />

      {/* Multiple tail lights (4 total) */}
      {[
        { pos: [-width * 0.5, height * 0.2, depth * 0.3] },
        { pos: [-width * 0.5, -height * 0.2, depth * 0.3] },
        { pos: [-width * 0.5, height * 0.2, -depth * 0.3] },
        { pos: [-width * 0.5, -height * 0.2, -depth * 0.3] },
      ].map((light, i) => (
        <mesh
          key={i}
          position={light.pos}
          scale={[0.05, height * 0.4, 0.15]}
          geometry={geometryCache.box}
          material={materialPool.tailLight}
        />
      ))}

      {/* Running lights (multiple) */}
      {[
        { color: '#00ff00', pos: [0, height * 0.5, depth * 0.4] },
        { color: '#ff0000', pos: [0, height * 0.5, -depth * 0.4] },
        { color: '#00ff00', pos: [-width * 0.2, height * 0.4, depth * 0.3] },
        { color: '#ff0000', pos: [-width * 0.2, height * 0.4, -depth * 0.3] },
      ].map((light, i) => (
        <mesh
          key={i}
          position={light.pos as [number, number, number]}
          scale={0.06}
          geometry={geometryCache.sphere}
        >
          <meshBasicMaterial color={light.color} />
        </mesh>
      ))}

      {/* Engine pods (4) */}
      {[
        { x: width * 0.3, z: depth * 0.4 },
        { x: width * 0.3, z: -depth * 0.4 },
        { x: -width * 0.1, z: depth * 0.35 },
        { x: -width * 0.1, z: -depth * 0.35 },
      ].map((pos, i) => (
        <mesh
          key={i}
          position={[pos.x, -height * 0.3, pos.z]}
          scale={[height * 0.2, height * 0.3, height * 0.3]}
          geometry={geometryCache.cylinder}
        >
          <meshBasicMaterial
            color={config.engineColor}
            emissive={config.engineColor}
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Lights - headlight and engine */}
      <pointLight
        color={config.lightColor}
        intensity={config.lightIntensity}
        distance={15}
        position={[width * 0.5, 0, 0]}
      />

      <pointLight
        ref={engineRef}
        color={config.engineColor}
        intensity={config.lightIntensity * 0.8}
        distance={8}
        position={[-width * 0.5, 0, 0]}
      />
    </group>
  );
}
```

---

### Template 4: Ultra Complexity Ship (128+ parts with optimizations)

Best for: 9x capital ships, requires full optimization suite

See **Example 3** above for implementation.

---

## Configuration Examples

### Example Config 1: Small Fighter Squadron (8 ships, 1x)

```typescript
const fighterSquadron: ShipConfig[] = [
  {
    type: 'shuttle',
    size: [0.8, 0.25, 0.4],
    speed: 0.28,
    color: '#2a2a40',
    lightIntensity: 0.5,
    lightColor: '#ffffff',
    engineColor: '#00ccff',
    yBase: 6,
    zLane: -8,
    direction: 1,
    offset: 0,
  },
  // ... repeat for 8 ships with variation ...
];
```

---

### Example Config 2: Mixed Fleet (5x Hero + 2x Support)

```typescript
const mixedFleet: ShipConfig[] = [
  // Hero ship
  {
    type: 'battlecruiser',
    size: [3.0, 0.8, 1.5],
    speed: 0.12,
    color: '#0a0a1a',
    lightIntensity: 1.2,
    lightColor: '#ffddaa',
    engineColor: '#ff6600',
    yBase: 18,
    zLane: -28,
    direction: 1,
    offset: 0,
  },
  // Support escort 1
  {
    type: 'corvette',
    size: [1.6, 0.5, 0.8],
    speed: 0.20,
    color: '#1a2a3a',
    lightIntensity: 0.7,
    lightColor: '#ffffff',
    engineColor: '#0088ff',
    yBase: 12,
    zLane: -25,
    direction: 1,
    offset: 5,
  },
  // Support escort 2
  {
    type: 'corvette',
    size: [1.6, 0.5, 0.8],
    speed: 0.20,
    color: '#1a2a3a',
    lightIntensity: 0.7,
    lightColor: '#ffffff',
    engineColor: '#0088ff',
    yBase: 14,
    zLane: -30,
    direction: 1,
    offset: 10,
  },
  // More escorts...
];
```

---

### Example Config 3: Capital Ship with Escort

```typescript
const capitalFleet: ShipConfig[] = [
  // Capital ship (9x)
  {
    type: 'dreadnought',
    size: [36, 11, 22.5],
    speed: 0.05,
    color: '#0a0a1a',
    lightIntensity: 1.5,
    lightColor: '#ffddaa',
    engineColor: '#ff6600',
    yBase: 30,
    zLane: -50,
    direction: 1,
    offset: 0,
  },
  // Escort fighters (10x 1x shuttles)
  ...Array.from({ length: 10 }, (_, i) => ({
    type: 'shuttle' as const,
    size: [0.8, 0.25, 0.4],
    speed: 0.28,
    color: ['#2a2a40', '#1a2a3a'][i % 2],
    lightIntensity: 0.5,
    lightColor: '#ffffff',
    engineColor: '#00ccff',
    yBase: 28 + (i % 2 === 0 ? 2 : -2),
    zLane: -48 - (i * 2),
    direction: 1,
    offset: i * 8,
  })),
];
```

---

## Material & Geometry Pool Complete Example

Full working implementation for reference:

```typescript
// At top of FlyingShips component
const { materialPool, geometryCache } = useMemo(() => {
  const materials = {
    // Hull materials
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

    // Cockpit/Bridge
    cockpitMetal: new THREE.MeshStandardMaterial({
      color: '#0a1020',
      metalness: 0.95,
      roughness: 0.1,
    }),

    // Wing metal
    wingMetal: new THREE.MeshStandardMaterial({
      color: '#1a1a28',
      metalness: 0.9,
      roughness: 0.2,
    }),

    // Cargo
    cargoMetal: new THREE.MeshStandardMaterial({
      color: '#12121a',
      metalness: 0.85,
      roughness: 0.25,
    }),

    // Engine glows (emissive, replaces lights)
    engineCyan: new THREE.MeshBasicMaterial({
      color: '#00ccff',
      transparent: true,
      opacity: 0.4,
    }),
    engineBlue: new THREE.MeshBasicMaterial({
      color: '#0088ff',
      transparent: true,
      opacity: 0.4,
    }),
    engineOrange: new THREE.MeshBasicMaterial({
      color: '#ff6600',
      transparent: true,
      opacity: 0.5,
    }),

    // Detail lights
    tailLight: new THREE.MeshBasicMaterial({
      color: '#ff0033',
    }),
    runningLightGreen: new THREE.MeshBasicMaterial({
      color: '#00ff00',
    }),
    runningLightRed: new THREE.MeshBasicMaterial({
      color: '#ff0000',
    }),
    cargoLightGreen: new THREE.MeshBasicMaterial({
      color: '#00ff88',
      transparent: true,
      opacity: 0.6,
    }),
  };

  const geometries = {
    // Base geometries (normalized to 1x1x1)
    box: new THREE.BoxGeometry(1, 1, 1),
    sphere: new THREE.SphereGeometry(1, 8, 8),
    sphereHigh: new THREE.SphereGeometry(1, 16, 16),
    cylinder: new THREE.CylinderGeometry(1, 1, 1, 8),
    cylinderHigh: new THREE.CylinderGeometry(1, 1, 1, 16),
    cone: new THREE.CylinderGeometry(0, 1, 1, 8),
    plane: new THREE.PlaneGeometry(1, 1),
  };

  return { materialPool: materials, geometryCache: geometries };
}, []);

// Now pass these to Ship components
<Ship key={i} config={config} materialPool={materialPool} geometryCache={geometryCache} />
```

---

## Animation Pattern Examples

### Pattern 1: Basic Movement (Current Implementation)

```typescript
useFrame((state) => {
  if (shipsRef.current) {
    const time = state.clock.elapsedTime;
    shipsRef.current.children.forEach((shipGroup, i) => {
      const config = ships[i];

      // Horizontal movement with wrapping
      const xRange = 40;
      const rawX = (time * config.speed * config.direction * 12 + config.offset) % (xRange * 2);
      shipGroup.position.x = rawX - xRange;

      // Z position (depth lane)
      shipGroup.position.z = config.zLane;

      // Vertical bobbing
      shipGroup.position.y = config.yBase + Math.sin(time * 1.5 + i) * 0.4;

      // Rotation to face direction
      shipGroup.rotation.y = config.direction > 0 ? 0 : Math.PI;

      // Banking on turns
      shipGroup.rotation.z = Math.sin(time * 2 + i) * 0.05 * config.direction;
    });
  }
});
```

---

### Pattern 2: Advanced Banking & Rolling

```typescript
useFrame((state) => {
  if (shipsRef.current) {
    const time = state.clock.elapsedTime;
    shipsRef.current.children.forEach((shipGroup, i) => {
      const config = ships[i];

      // Horizontal movement
      const xRange = 40;
      const rawX = (time * config.speed * config.direction * 12 + config.offset) % (xRange * 2);
      shipGroup.position.x = rawX - xRange;
      shipGroup.position.z = config.zLane;

      // Vertical movement with more complexity
      shipGroup.position.y = config.yBase +
        Math.sin(time * 1.5 + i) * 0.4 +
        Math.cos(time * 0.8 + i * 0.5) * 0.2;

      // Direction
      shipGroup.rotation.y = config.direction > 0 ? 0 : Math.PI;

      // Complex banking (pitch + roll)
      shipGroup.rotation.z = Math.sin(time * 2 + i) * 0.08 * config.direction;
      shipGroup.rotation.x = Math.sin(time * 1.2 + i) * 0.04;

      // Slight yaw variation
      shipGroup.rotation.y += Math.sin(time * 0.5 + i) * 0.02 * config.direction;
    });
  }
});
```

---

### Pattern 3: Formation Flying

```typescript
// Ships maintain relative positions in formation
const formations = [
  { offset: [0, 0], role: 'leader' },
  { offset: [-5, -2], role: 'wingman-left' },
  { offset: [5, -2], role: 'wingman-right' },
];

useFrame((state) => {
  if (shipsRef.current) {
    const time = state.clock.elapsedTime;

    formations.forEach((formation, formationIndex) => {
      const baseIndex = formationIndex * formations.length;

      formations.forEach((_, shipOffset) => {
        const shipIndex = baseIndex + shipOffset;
        if (shipIndex >= shipsRef.current.children.length) return;

        const ship = shipsRef.current.children[shipIndex];
        const config = ships[shipIndex];

        // Formation center position
        const centerX = time * config.speed * 12;
        const centerY = config.yBase;
        const centerZ = config.zLane;

        // Offset from formation center
        ship.position.x = centerX + formation.offset[0];
        ship.position.y = centerY + formation.offset[1] + Math.sin(time * 1.5 + shipIndex) * 0.2;
        ship.position.z = centerZ;

        // Face center of formation
        const angle = Math.atan2(formation.offset[0], formation.offset[1]);
        ship.rotation.y = angle;
      });
    });
  }
});
```

---

## Related Documentation

- **Architecture Guide**: See `ship-system-guide.md` for configuration details
- **Optimization Techniques**: See `ship-optimization.md` for memory reduction strategies
- **Implementation**: `/components/three/Environment.tsx` lines 421-675
