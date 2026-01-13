---
allowed-tools: Read, Write, Edit, Bash(file:*), Glob, Grep
argument-hint: [ship-type] [size-multiplier] [complexity-level]
description: Comprehensive guide to the NUWRRRLD ship system architecture and scaling
---

# NUWRRRLD Ship System Guide

Complete reference for the flying ship system in NUWRRRLD, including current architecture, configuration interface, size scaling strategies, and memory optimization guidance for adding ships from 1x to 9x physical size with high complexity.

## Table of Contents
1. [Current Architecture Overview](#current-architecture-overview)
2. [Ship Configuration Interface](#ship-configuration-interface)
3. [Size Tiers & Scaling Strategy](#size-tiers--scaling-strategy)
4. [Adding New Ships](#adding-new-ships)
5. [Memory & Performance Considerations](#memory--performance-considerations)
6. [Quick Reference](#quick-reference)

## Current Architecture Overview

### Fleet Composition

The NUWRRRLD environment features an optimized fleet of 16 flying ships reduced from the original 25 to improve browser performance. Ships are classified into three size classes:

| Ship Type | Count | Avg Geometries | Avg Materials | Lights Per Ship | Key Characteristics |
|-----------|-------|----------------|---------------|-----------------|---------------------|
| Shuttle | 8 | 7 | 7 | 2 | Small, fast, frequent |
| Transport | 5 | 9 | 9 | 2 | Medium-sized, moderate speed |
| Freighter | 3 | 13 | 13 | 2 | Large, slow, cargo-focused |
| **TOTAL** | **16** | **~9 avg** | **~9 avg** | **32 total** | - |

### Memory Footprint Analysis

Current implementation uses approximately **140 geometries, 140 materials, and 32 point lights**:

| Resource | Count | Est. Memory | Notes |
|----------|-------|-------------|-------|
| Geometries | ~140 | 3-8 MB | Each ship creates unique geometry instances |
| Materials | ~140 | 3-5 MB | Each ship creates unique material instances |
| Point Lights | 32 | ~50 KB | 2 per ship (headlight + engine glow) |
| **Total GPU Memory** | - | **~10-15 MB** | Can be reduced to 1-2 MB with optimizations |

### Code Location & Structure

- **Main Component**: `/components/three/Environment.tsx` lines 421-675
- **Fleet Generation**: `FlyingShips()` function (lines 436-528)
- **Individual Ship**: `Ship()` component (lines 531-675)
- **Configuration Generator**: Seeded random generation (lines 440-497)

### Ship Architecture Pattern

Ships are generated using a deterministic pseudorandom system to ensure consistent placement and properties across renders:

```typescript
// Ship configuration interface (ShipConfig)
interface ShipConfig {
  type: 'shuttle' | 'transport' | 'freighter';
  size: [number, number, number];           // [width, height, depth]
  speed: number;                             // Movement speed multiplier
  color: string;                             // Hull color (hex)
  lightIntensity: number;                    // Light brightness
  lightColor: string;                        // Headlight color
  engineColor: string;                       // Engine glow color
  yBase: number;                             // Base Y position
  zLane: number;                             // Depth lane (Z position)
  direction: 1 | -1;                         // Movement direction
  offset: number;                            // Animation phase offset
}
```

### How Ships Are Generated

Ships use seeded random functions for deterministic generation:

```typescript
// Example from FlyingShips() - Shuttle generation
for (let i = 0; i < 8; i++) {
  fleet.push({
    type: 'shuttle',
    size: [(0.8 + random(i) * 0.4) * 1.5, (0.25 + random(i + 10) * 0.1) * 1.5, (0.4 + random(i + 20) * 0.2) * 1.5],
    speed: 0.28 + random(i + 30) * 0.1,
    color: ['#2a2a40', '#1a2a3a', '#2a1a3a'][i % 3],
    lightIntensity: 0.5,
    lightColor: random(i + 40) > 0.5 ? '#ffffff' : '#ffeecc',
    engineColor: '#00ccff',
    yBase: 6 + random(i + 50) * 8,
    zLane: -8 - random(i + 60) * 15,
    direction: i % 2 === 0 ? 1 : -1,
    offset: i * 10,
  });
}
```

## Ship Configuration Interface

### ShipConfig Properties Explained

| Property | Type | Range | Purpose | Example |
|----------|------|-------|---------|---------|
| `type` | string | 'shuttle' \| 'transport' \| 'freighter' | Determines ship class and visual style | 'transport' |
| `size` | [number, number, number] | [0.5-20, 0.1-3, 0.2-8] | Physical dimensions [width, height, depth] in world units | [2.4, 0.6, 1.2] |
| `speed` | number | 0.05-0.4 | Movement speed in world units/frame. Slower for larger ships | 0.15 |
| `color` | string | hex color | Primary hull color | '#1a2a3a' |
| `lightIntensity` | number | 0.3-1.5 | Brightness of ship lights (multiplier) | 0.8 |
| `lightColor` | string | hex color | Headlight color | '#ffffff' |
| `engineColor` | string | hex color | Engine glow color (cyan, orange, etc.) | '#00ccff' |
| `yBase` | number | 0-50 | Base height (Y axis) | 12 |
| `zLane` | number | -80 to 0 | Depth position (Z axis). Negative is away from camera | -15 |
| `direction` | 1 \| -1 | ±1 | Left-to-right (1) or right-to-left (-1) | 1 |
| `offset` | number | 0+ | Phase offset for cycling animations | 12 |

### Material Configuration

Each ship uses `MeshStandardMaterial` for the hull and `MeshBasicMaterial` for lights/glows:

```typescript
// Hull material (shared across ship parts)
<meshStandardMaterial
  color="#2a2a40"          // Cyberpunk metal color
  metalness={0.92}         // Highly reflective
  roughness={0.15}         // Smooth but not mirror-like
/>

// Engine glow (no lights for memory efficiency)
<meshBasicMaterial
  color="#00ccff"          // Cyan for engine
  transparent={true}
  opacity={0.4}
/>
```

### Animation System

Ships animate via `useFrame` hook with three animation layers:

**1. Position Animation** - Horizontal movement and wrapping:
```typescript
const rawX = (time * config.speed * config.direction * 12 + config.offset) % (xRange * 2);
shipGroup.position.x = rawX - xRange;  // Wraps around screen edges
```

**2. Bobbing Motion** - Vertical sine wave:
```typescript
shipGroup.position.y = config.yBase + Math.sin(time * 1.5 + i) * 0.4;
```

**3. Banking Animation** - Rotation on turns:
```typescript
shipGroup.rotation.z = Math.sin(time * 2 + i) * 0.05 * config.direction;
shipGroup.rotation.y = config.direction > 0 ? 0 : Math.PI;  // Face correct direction
```

**4. Engine Light Pulsing** - PointLight intensity modulation:
```typescript
engineRef.current.intensity = config.lightIntensity * (0.8 + Math.sin(t * 8 + index) * 0.2);
```

## Size Tiers & Scaling Strategy

### Size Tier System

The ship scaling system uses five predefined tiers, each with recommended complexity levels and optimization techniques:

| Tier | Multiplier | Base Dimension | Use Case | Complexity | Parts | Optimizations |
|------|------------|-----------------|----------|------------|-------|----------------|
| 1x | 1.0 | 0.8-2.0 units | Background, distant, swarms | Low | 4-8 | None needed |
| 2x | 2.0 | 1.6-4.0 units | Mid-ground traffic, patrol | Medium | 8-16 | Material pooling |
| 3x | 3.0 | 2.4-6.0 units | Prominent mid-ground, escorts | Medium-High | 12-24 | Material + Geometry pooling |
| 5x | 5.0 | 4.0-10.0 units | Hero ships, focal points | High | 24-48 | Pooling + LOD |
| 9x | 9.0 | 7.2-18.0 units | Capital ships, centerpieces | Ultra | 64-128+ | ALL optimizations required |

### Physical Size Calculation

To calculate dimensions for a custom size multiplier:

```typescript
// Base shuttle dimensions
const baseSize = [0.8, 0.25, 0.4];

// Apply multiplier
const sizeMultiplier = 3.0;  // 3x size
const scaledSize = baseSize.map(dim => dim * sizeMultiplier);
// Result: [2.4, 0.75, 1.2]
```

### Complexity vs Size Matrix

Visual guide for recommended part counts per size tier:

```
Complexity Breakdown by Size

Size →      1x      2x       3x        5x         9x
            ▼       ▼        ▼         ▼          ▼
Low-Poly    ✓       ✓        ✓         -          -
            4-8    6-12     8-16       -          -

Medium      -       ✓        ✓         ✓          -
            -      10-20   16-32     24-48        -

High        -       -        ✓         ✓          ✓
            -       -       24-48    48-64      64-128

Ultra       -       -        -         -          ✓
            -       -        -         -         128+

✓ = Recommended    - = Not recommended
```

### Depth Distribution Strategy

Ships are organized into depth layers (Z-space) for parallax effect and performance:

```
Camera Perspective (Z = 0)
                  ▲
                  | Foreground
    ───────────────────────────────
  -5 to -15: Small ships (Shuttles, Fighters) - Frequent
             Fast movement, small details

  -15 to -30: Mid-ground (Corvettes, Transports) - Standard
             Moderate speed, balanced detail

  -30 to -80: Background (Freighters, Cruisers) - Anchor
             Slow movement, emphasized silhouette

  -80+: Deep (Capital Ships, Stations) - Rare
        Static or very slow, detailed only if close
```

## Adding New Ships

### Step-by-Step Process

#### Step 1: Choose Your Tier and Type
Decide on size (1x-9x), complexity level, and function (fighter, transport, capital, etc.)

#### Step 2: Calculate Dimensions
Multiply base dimensions by your size multiplier:
```typescript
const sizeMultiplier = 3.0;
const baseShuttle = [0.8, 0.25, 0.4];
const newSize = baseShuttle.map(d => d * sizeMultiplier);
// Result: [2.4, 0.75, 1.2]
```

#### Step 3: Choose Speed and Color
Larger ships should move slower and use appropriate hull colors:
```typescript
const speed = 0.28 / Math.sqrt(sizeMultiplier);  // Slower with size
const color = '#1a2a3a';  // Cyberpunk palette
```

#### Step 4: Define Lights and Glow
Choose engine color and intensity based on size:
```typescript
const lightIntensity = Math.min(0.5 + (sizeMultiplier / 10), 1.5);
const engineColor = '#00ccff';  // or '#ff6600', '#00ff88'
```

#### Step 5: Position in Fleet Array
Add to appropriate generation loop in `FlyingShips()`:
```typescript
fleet.push({
  type: 'cruiser',
  size: newSize,
  speed: speed,
  color: color,
  lightIntensity: lightIntensity,
  lightColor: '#ffffff',
  engineColor: engineColor,
  yBase: 15 + Math.random() * 10,
  zLane: -25 - Math.random() * 15,
  direction: Math.random() > 0.5 ? 1 : -1,
  offset: shipIndex * 12,
});
```

### Example: Adding a 3x Medium Cruiser

Here's a complete example of adding a new ship type to the fleet:

```typescript
// In FlyingShips(), add to fleet generation (around line 500)

// NEW: Medium Cruisers (3x size) - 6 ships
for (let i = 0; i < 6; i++) {
  fleet.push({
    type: 'cruiser',  // Custom type identifier
    size: [
      (1.5 + random(i) * 0.5) * 3,     // Width multiplied by 3x
      (0.4 + random(i + 10) * 0.2) * 3, // Height multiplied by 3x
      (0.8 + random(i + 20) * 0.3) * 3  // Depth multiplied by 3x
    ],
    speed: 0.20 + random(i + 30) * 0.05,  // Slower than transport
    color: ['#1a2a3a', '#281a28', '#1a2828'][i % 3],
    lightIntensity: 0.8,
    lightColor: '#ffffff',
    engineColor: '#0088ff',
    yBase: 15 + random(i + 50) * 10,
    zLane: -20 - random(i + 60) * 15,
    direction: i % 2 === 0 ? 1 : -1,
    offset: (16 + i) * 12,  // Offset after existing 16 ships
  });
}
```

Then update the ship rendering loop to handle the new type. For 3x size with medium complexity, reference the optimization guide for material pooling techniques.

## Memory & Performance Considerations

### Current Bottlenecks

The current implementation has identified optimization opportunities:

1. **Material Duplication** - Each ship creates 7-13 unique material instances
   - Current: 140+ materials
   - Impact: ~3-5 MB GPU memory
   - Solution: Share materials across ships

2. **Geometry Duplication** - Each ship creates 7-13 unique geometry instances
   - Current: 140+ geometries
   - Impact: ~3-8 MB GPU memory
   - Solution: Cache and reuse geometries

3. **No Instancing** - Identical parts rendered individually
   - Current: 140+ draw calls
   - Impact: Reduced FPS, especially on mobile
   - Solution: Use InstancedMesh for repeated elements

4. **Excessive Lights** - 32 point lights across 16 ships
   - Current: 32 lights
   - Impact: ~15-30% FPS reduction
   - Solution: Use emissive materials + conditional lighting

### Optimization Strategies Overview

See `ship-optimization.md` for detailed implementation of:

- **Material Pooling** - ~90% memory reduction
- **Geometry Pooling** - ~85-90% memory reduction
- **InstancedMesh** - ~70-85% draw call reduction
- **LOD System** - Distance-based complexity scaling
- **Emissive Materials** - Replace point lights
- **React.memo** - Prevent unnecessary re-renders

### Performance Budget by Device

Target specifications for different hardware classes:

| Device Class | Max Ships | Max Geometries | Max Lights | Target FPS | Recommended Tier |
|--------------|-----------|----------------|------------|------------|------------------|
| Mobile Low | 8-10 | 80-100 | 8-12 | 30+ | 1x-2x only |
| Mobile High | 12-16 | 120-160 | 16-24 | 45+ | 1x-3x |
| Desktop Low | 16-24 | 160-240 | 24-32 | 45+ | 1x-5x |
| Desktop High | 32+ | 320+ | 32+ | 60+ | 1x-9x |

## Quick Reference

### Ship Type Characteristics

| Type | Speed | Size Range | Hull Colors | Engine Colors | Use Case |
|------|-------|-----------|-------------|---------------|----------|
| Shuttle | Fast (0.25-0.35) | Small (0.5-1.5x) | Dark grays | Cyan, White | Scout, fighter, frequent |
| Corvette | Fast (0.20-0.28) | Small-Medium (2-3x) | Dark grays | Blue, Cyan | Interceptor, patrol |
| Transport | Moderate (0.15-0.22) | Medium (2-5x) | Dark grays | White, Yellow | Trade route, escort |
| Cruiser | Moderate (0.12-0.18) | Medium-Large (3-5x) | Navy blues | Blue, Orange | Exploration, combat |
| Freighter | Slow (0.06-0.12) | Large (3-7x) | Dark metals | Orange, Red | Cargo, slow patrol |
| Battleship | Very Slow (0.02-0.06) | Very Large (5-9x) | Dark metals | Red, Orange | Capital, centerpiece |

### Size Multiplier Quick Reference

| Multiplier | Shuttle Size | Transport Size | Speed Adjustment | Part Count | Device Support |
|------------|-------------|-----------------|------------------|-----------|----------------|
| 1x | 0.8 units | 2.2 units | 1.0x speed | 4-8 | All devices |
| 2x | 1.6 units | 4.4 units | 0.7x speed | 8-16 | All devices |
| 3x | 2.4 units | 6.6 units | 0.58x speed | 12-24 | Mobile+ |
| 5x | 4.0 units | 11 units | 0.45x speed | 24-48 | Desktop |
| 9x | 7.2 units | 19.8 units | 0.33x speed | 64-128 | Desktop+ |

### Cyberpunk Color Palette

**Hull Colors:**
- `#1a1a28` - Deep black
- `#1a2a3a` - Navy blue
- `#2a1a3a` - Deep purple
- `#281a28` - Dark magenta

**Engine/Glow Colors:**
- `#00ffff` - Cyan (cool)
- `#00ccff` - Light blue (cool)
- `#00ff88` - Green (tech)
- `#ff6600` - Orange (warm)
- `#ff00ff` - Magenta (neon)
- `#ffaa00` - Amber (cargo)

**Light Colors:**
- `#ffffff` - Pure white
- `#ffeecc` - Warm white
- `#00ff00` - Green running light
- `#ff0033` - Red tail light

---

## Related Documentation

- **Optimization Techniques**: See `ship-optimization.md` for memory efficiency strategies
- **Code Examples & Templates**: See `ship-examples.md` for copy-paste templates
- **Current Implementation**: `/components/three/Environment.tsx` lines 421-675
