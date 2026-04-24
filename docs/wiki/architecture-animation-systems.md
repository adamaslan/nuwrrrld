---
date: 2026-04-23
type: architecture
tags: [architecture, animation, useframe, ships, particles, interaction]
sources: [raw/BOUNDARY_SHIP_ROTATION_CHALLENGES.md, raw/PHASE_4_REFACTORING.md]
---

# Architecture: Animation Systems

## What It Governs

All motion in the scene — ship flight, window flicker, particle drift, rain, screen hover/tap responses, and neon flicker. Every animation in NUWRRRLD flows through one of three mechanisms: `useFrame` (Three.js animation loop), React state (UI interaction), or CSS transitions (2D overlay).

## Component Map

```
@react-three/fiber useFrame (60fps heartbeat)
├── Ship.tsx                ← horizontal move + bob + bank + engine pulse
├── CapitalShip.tsx         ← same as Ship + formation logic
├── CyberpunkBuilding.tsx   ← antenna rotation
├── HolographicElements.tsx ← octahedron rotation (ForegroundLayer)
├── Rain.tsx                ← particle Y-position update + wraparound
├── Particles.tsx           ← debris float + drift
├── NeonGridLines.tsx       ← grid scroll animation
└── AnimatedBillboards.tsx  ← billboard rotation

Custom hooks (wrap useFrame logic):
├── hooks/useOrbitalMotion.ts      ← orbital path computation
└── hooks/useFlickerAnimation.ts   ← random on/off for windows + neon signs

React state interactions:
├── TVScreen.tsx   ← hover (onPointerOver/Out) → glow + scale
│                  ← click/tap → pulse ring + ScreenContext update
└── RemoteControl  ← ScreenContext drives link display

PostProcessing (static, no animation):
└── PostProcessing.tsx  ← Bloom, grain, vignette, chromatic aberration
                           (parameters set once; no per-frame updates)
```

## Ship Animation in Detail

Ships use four layered motions computed every `useFrame` tick:

```
1. Horizontal position:
   ship.position.x += speed * delta
   if (ship.position.x > BOUNDARY) ship.position.x = -BOUNDARY  // wrap

2. Vertical bob:
   ship.position.y = baseY + Math.sin(time * bobFrequency + animationOffset) * bobAmplitude

3. Banking (Z-rotation):
   ship.rotation.z = -speed * BANK_FACTOR  // leans into direction of travel
   // reset to 0 at boundary wrap (bug fix from BOUNDARY_SHIP_ROTATION_CHALLENGES)

4. Engine light pulse:
   engineLight.intensity = BASE_INTENSITY + Math.sin(time * lightPulseRate) * PULSE_AMPLITUDE
```

The `animationOffset` per ship prevents all ships from bobbing in sync. If this offset uses `Math.random()` rather than seeded random, ships re-synchronize on every page load.

## Flicker Animation

`useFlickerAnimation.ts` drives two separate flicker effects:
- **Window flicker**: Each window has a probability per frame of toggling. The result feels like city lights turning on/off organically.
- **Neon sign flicker**: NeonSigns.tsx uses a faster, more irregular flicker for the "damaged neon" aesthetic.

Both are implemented as probability checks inside `useFrame`, not as timers or intervals — timers would not align with the render loop and would cause subtle visual artifacts.

## Boundary Wrap Bug (Resolved)

From `raw/BOUNDARY_SHIP_ROTATION_CHALLENGES.md`: ships banking (Z-rotation) accumulated rotation over time. At the boundary wrap (where X teleports to the opposite edge), the banking rotation was not reset. Ships that had been traveling right accumulated positive Z-rotation, and when they teleported and began traveling in the same direction, their body was already rotated. On high-speed ships, this compounded into visible spin at the boundary.

**Fix**: Reset `ship.rotation.z = 0` at the wrap point, before applying the new frame's banking value.

## Key Invariants

1. **All 3D animation via `useFrame`**: No `setTimeout`, `setInterval`, or `requestAnimationFrame` calls in 3D components. These would run asynchronously from the render loop and cause frame-rate-dependent visual inconsistency.

2. **`delta` time scaling**: Ship velocity should multiply by `delta` (time since last frame in seconds) so speed is consistent regardless of frame rate. A ship traveling at `speed=1` should cover the same distance per second at 30 FPS as at 60 FPS.

3. **No animation state in React state**: Animation values (ship X position, bob phase) are stored on Three.js objects (`.position`, `.rotation`), not in React state. React state re-renders are expensive; Three.js object mutations do not trigger re-renders.

## Open Questions

> ❓ Do ship animation offsets use seeded random or `Math.random()`? This determines whether the fleet de-synchronizes visually on reload.

> ❓ Is `delta` time-scaling applied to ship movement? Without it, ships move twice as fast at 120 FPS as at 60 FPS.

> ❓ Are any animations paused when the browser tab is inactive? React Three Fiber can be configured to pause `useFrame` on tab blur; without this, background animations waste CPU.

## See Also

- [[entity-ships]] — ship animation implementation detail
- [[entity-buildings]] — window flicker via useFlickerAnimation
- [[entity-layers]] — ForegroundLayer particle and holographic animation
- [[concept-performance-budget]] — animation is a primary FPS cost; useFrame per-component adds up
- [[architecture-scene-composition]] — where animated components sit in the tree
