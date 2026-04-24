# Boundary & Ship Rotation: Challenges and Solutions

## Overview

This document covers the technical challenges encountered when implementing capital ship boundary patrol movement and the rotation/type fixes across the 3D scene system.

---

## 1. Capital Ship Boundary Patrol Movement

### Challenge

Capital ships (dreadnoughts) originally moved in a simple horizontal wrap pattern, traveling in a straight line along the X-axis and wrapping when reaching the edge. This made their movement predictable and confined to a narrow lane, ignoring most of the environment space.

The goal was to have capital ships visit all boundaries of the expanded environment (1.5x larger: 300x375 units) while maintaining smooth, continuous motion.

### Solution

Implemented a **waypoint-based navigation system** that generates boundary waypoints at corners and edges of the environment.

**Key components:**
- `BoundaryWaypoint` interface storing `x`, `z`, and `arrivalTime`
- `generateBoundaryWaypoints()` function creating 6 waypoints per ship (4 shuffled corners + 2 mid-boundary points)
- `CAPITAL_SHIP_BOUNDARIES` constants derived from `SCENE_DIMENSIONS` for maintainability
- Linear interpolation between waypoints with `atan2`-based heading rotation

**Files changed:** `FlyingShips.tsx`, `config/constants.ts`

---

## 2. Waypoint Interpolation Wrap-Around

### Challenge

The initial interpolation logic failed in two scenarios:
1. **Before the first waypoint's arrival time** -- the ship remained static at the origin
2. **Last-to-first waypoint transition** -- the ship jumped abruptly because the segment duration was negative when looping back

Both caused jerky, non-continuous movement.

### Solution

Initialize the default segment to the **wrap-around segment** (last waypoint to first) instead of the first-to-second segment:

```typescript
let currentWaypoint = waypoints[waypoints.length - 1];
let nextWaypoint = waypoints[0];
```

Handle negative segment duration when the cycle wraps:

```typescript
if (segmentDuration < 0) {
  segmentDuration += cycleTime;
  timeIntoSegment += cycleTime;
}
```

This ensures smooth, continuous orbital paths with no gaps or jumps at cycle boundaries.

**File changed:** `FlyingShips.tsx`

---

## 3. Rotation Type Mismatch (Vector3Tuple vs Euler)

### Challenge

The `rotation` prop on Three.js `<mesh>` components expects a mutable `Euler` type (`[x, y, z, order?]`), but `BuildingBlueprintElement.rotation` was typed as `readonly [number, number, number]` (Vector3Tuple).

Two failed attempts:
- **Spread operator** `[...element.rotation]` -- TypeScript inferred `any[]`, losing tuple length information. The compiler could not guarantee 3 elements.
- **`as any` cast** -- Suppressed the error but bypassed type safety entirely.

### Solution

Explicit destructuring preserves the tuple type and handles the optional nature of `rotation`:

```typescript
rotation={element.rotation
  ? [element.rotation[0], element.rotation[1], element.rotation[2]]
  : undefined}
```

This produces a mutable `[number, number, number]` tuple that satisfies the Euler prop while keeping full type safety.

**File changed:** `CyberpunkBuilding.tsx`

---

## 4. Scale Type Mismatch (number vs Vector3Tuple)

### Challenge

The antenna light element in `BuildingBlueprint.ts` set `scale: 0.15` (a single number), but the type system expected `Vector3Tuple` (`[number, number, number]`).

### Solution

Changed to uniform scale tuple:

```typescript
scale: [0.15, 0.15, 0.15]
```

**File changed:** `BuildingBlueprint.ts`

---

## 5. React Hooks Called Conditionally

### Challenge

In `Ship.tsx`, three `useMemo` hooks were called after an early return for capital ships. React requires hooks to be called in the same order on every render -- conditional hooks violate this rule and cause runtime errors.

### Solution

Moved all `useMemo` hooks above the conditional return. The hooks now execute unconditionally, and the early return for capital ships happens afterward:

```typescript
// Hooks first (always called)
const blueprint = useMemo(...);
const hullMaterial = useMemo(...);
const engineMaterial = useMemo(...);

// Conditional return after hooks
if (isCapitalShip) {
  return <CapitalShip ... />;
}
```

**File changed:** `Ship.tsx`

---

## 6. seededRandom Function Signature Mismatch

### Challenge

The `seededRandom` utility expects two arguments `(seed, index)`, but calls in `generateBoundaryWaypoints` combined them into a single argument: `seededRandom(seed + shipIndex * 100)`. The missing second argument defaulted to `undefined`, causing `NaN` to propagate through all waypoint calculations -- breaking shuffling, positioning, and timing.

### Solution

Separated the arguments across all 8 call sites:

```typescript
// Before (broken)
seededRandom(seed + shipIndex * 100)

// After (correct)
seededRandom(seed, shipIndex * 100)
```

**File changed:** `FlyingShips.tsx`

---

## 7. Hardcoded Boundary Values

### Challenge

Boundary dimensions (`BOUNDARY_X = 150`, `BOUNDARY_Z = 187.5`) were hardcoded inside `generateBoundaryWaypoints`. If the environment size changed, these values would silently fall out of sync with `SCENE_DIMENSIONS`.

### Solution

Added `CAPITAL_SHIP_BOUNDARIES` to `config/constants.ts`, derived from `SCENE_DIMENSIONS`:

```typescript
export const CAPITAL_SHIP_BOUNDARIES = {
  BOUNDARY_X: SCENE_DIMENSIONS.GROUND_PLANE_WIDTH / 2,
  BOUNDARY_Z: SCENE_DIMENSIONS.GROUND_PLANE_HEIGHT / 2,
} as const;
```

Changing the environment size now automatically updates the ship patrol boundaries.

**Files changed:** `config/constants.ts`, `FlyingShips.tsx`

---

## Summary Table

| Issue | Root Cause | Fix Location |
|-------|-----------|--------------|
| Static/jerky capital ship movement | Missing wrap-around interpolation | `FlyingShips.tsx` |
| Readonly rotation tuple | `Vector3Tuple` incompatible with mutable `Euler` | `CyberpunkBuilding.tsx` |
| Scale type error | Single number instead of 3-tuple | `BuildingBlueprint.ts` |
| Conditional React hooks | `useMemo` called after early return | `Ship.tsx` |
| NaN waypoint values | Wrong `seededRandom` call signature | `FlyingShips.tsx` |
| Brittle boundary values | Hardcoded instead of derived from config | `constants.ts` |
