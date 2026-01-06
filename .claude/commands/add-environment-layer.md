---
allowed-tools: Read, Write, Edit, Bash(file:*), Glob
argument-hint: <layer-type> [depth-range] [density]
description: Add a new environment layer to the 3D scene
---

# Add Environment Layer

Add a new depth layer to the NUWRRRLD cyberpunk environment.

## Arguments
- `$1` - Layer type: `foreground`, `midground`, `background`, or `custom`
- `$2` - Depth range (optional): e.g., `-5:-15` for Z positions
- `$3` - Density (optional): `sparse`, `medium`, `dense` (default: medium)

## Steps

1. **Read existing Environment.tsx** to understand current layers
2. **Determine layer Z-range** based on type or custom input
3. **Select appropriate objects** for the depth range
4. **Generate the layer component** with proper styling
5. **Add to Environment export** and test

## Layer Types

### Foreground (Z: 0 to -5)
Close to camera, subtle movement, adds atmosphere.

**Available objects:**
- `debris` - Floating dust/debris particles (200-500 count)
- `dataFragments` - Wireframe geometric shapes with glow
- `sparks` - Electric spark particles with emissive material
- `scanLines` - Horizontal holographic scan effects

### Midground (Z: -10 to -25)
Interactive depth, visible detail, parallax movement.

**Available objects:**
- `platforms` - Floating industrial platforms with edge lights
- `drones` - Animated drone swarm with oscillating movement
- `billboards` - Holographic advertisement panels
- `cables` - Vertical/diagonal cable runs with glow
- `walkways` - Suspended walkway segments

### Background (Z: -40 to -100)
Distant atmosphere, silhouettes, ambient glow.

**Available objects:**
- `megaStructures` - Massive distant towers/buildings
- `lightBeams` - Volumetric atmospheric light rays
- `aurora` - Animated aurora/sky glow effect
- `cityscape` - Procedural distant building silhouettes
- `ships` - Large distant vessels (slow movement)

## Component Template

```typescript
function ${LayerName}() {
  const groupRef = useRef<THREE.Group>(null);

  // Animation (optional)
  useFrame((state) => {
    if (groupRef.current) {
      // Add subtle movement
    }
  });

  const objects = useMemo(() => {
    return Array.from({ length: ${count} }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * ${spreadX},
        (Math.random() - 0.5) * ${spreadY},
        ${minZ} + Math.random() * ${depthRange},
      ] as [number, number, number],
      scale: ${baseScale} + Math.random() * ${scaleVariance},
      rotation: Math.random() * Math.PI * 2,
    }));
  }, []);

  return (
    <group ref={groupRef}>
      {objects.map((obj, i) => (
        <mesh key={i} position={obj.position} scale={obj.scale}>
          <${geometry} />
          <meshStandardMaterial
            color="${color}"
            emissive="${emissiveColor}"
            emissiveIntensity={${emissiveIntensity}}
            metalness={${metalness}}
            roughness={${roughness}}
            transparent
            opacity={${opacity}}
          />
        </mesh>
      ))}
    </group>
  );
}
```

## Density Settings

| Density | Foreground | Midground | Background |
|---------|------------|-----------|------------|
| sparse  | 50-100     | 5-10      | 3-5        |
| medium  | 150-250    | 10-20     | 5-10       |
| dense   | 300-500    | 20-40     | 10-20      |

## Material Presets

### Holographic
```typescript
{
  color: '#00ffff',
  emissive: '#00ffff',
  emissiveIntensity: 0.5,
  transparent: true,
  opacity: 0.7,
  side: THREE.DoubleSide,
}
```

### Industrial Metal
```typescript
{
  color: '#2a2a3e',
  metalness: 0.9,
  roughness: 0.3,
  envMapIntensity: 0.5,
}
```

### Neon Glow
```typescript
{
  color: '#ff00ff',
  emissive: '#ff00ff',
  emissiveIntensity: 2.0,
  toneMapped: false,
}
```

### Atmospheric
```typescript
{
  color: '#1a1a2e',
  transparent: true,
  opacity: 0.3,
  depthWrite: false,
}
```

## Example Usage

```
/add-environment-layer foreground
/add-environment-layer midground -15:-25 dense
/add-environment-layer background -60:-100 sparse
/add-environment-layer custom -8:-12 medium
```
