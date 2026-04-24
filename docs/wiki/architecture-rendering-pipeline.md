---
date: 2026-04-23
type: architecture
tags: [architecture, rendering, webgl, postprocessing, pipeline]
sources: [raw/OPTIMIZATION_OVERVIEW.md, raw/ENVIRONMENT_OPTIMIZATION_GUIDE.md]
---

# Architecture: Rendering Pipeline

## What It Governs

The full rendering stack from JavaScript scene graph to pixels on screen — how Three.js, React Three Fiber, and the post-processing pipeline compose, and where performance costs live in this stack.

## Pipeline

```
React component tree (JSX)
        │
        ▼  (React Three Fiber reconciler)
Three.js scene graph (Scene, Mesh, Light, Camera objects)
        │
        ▼  (Three.js WebGLRenderer)
WebGL draw calls to GPU
        │
        ▼  (scene rendered to offscreen framebuffer)
@react-three/postprocessing effects pipeline:
    1. Bloom pass          ← extracts bright pixels, blurs, composites
    2. Film grain/noise    ← adds per-frame noise texture overlay
    3. Vignette            ← darkens screen edges
    4. Chromatic aberration ← color channel offset at frame edges
        │
        ▼
Final composite → canvas element → browser display
```

## React Three Fiber's Role

React Three Fiber (RxF) is a React reconciler that maps React component tree mutations to Three.js scene graph operations. Creating a `<mesh>` component creates a `THREE.Mesh`; setting `position` props sets `mesh.position`. This means the full power of React (hooks, context, Suspense, error boundaries) can drive a Three.js scene.

The cost: every React re-render that touches a 3D component triggers the reconciler. Poorly managed state can cause unnecessary scene graph updates. For performance-critical animation, Three.js objects are mutated directly inside `useFrame` rather than through React state (see [[architecture-animation-systems]]).

## Post-Processing Stack Detail

`PostProcessing.tsx` using `@react-three/postprocessing`:

| Effect | What it does | Performance cost |
|--------|-------------|-----------------|
| Bloom | Extracts emissive/bright pixels, blurs them, composites | High (multiple full-screen passes) |
| Film grain | Noise texture overlay | Low |
| Vignette | Dark edge gradient | Very low |
| Chromatic aberration | RGB channel offset at edges | Low |

**Bloom is the dominant cost.** It requires rendering the scene twice (once for the main pass, once for the bloom extraction) and running several blur passes. On mobile GPUs, this is the most expensive single operation.

## Lighting Model

`Lighting.tsx` places 11+ light sources:
- **Point lights**: Radiate in all directions from a point; used for neon accent lights
- **Spot lights**: Directional cone; used for dramatic highlights on screens or buildings
- **Ambient light**: Base illumination, prevents pure-black shadow areas

Emissive materials in ship engines, building windows, and holographic elements glow independently of the lighting model — they do not need to be illuminated by a light source. This reduces the lighting load: not all "glowing" surfaces require a light.

> ❓ Open question: Are shadow maps enabled? Shadows from 11+ lights require 11+ shadow map render passes (one per shadow-casting light). On mobile, this could be the single largest rendering expense.

## Resource Pipeline

```
PoolContext (GeometryPool + MaterialPool)
    ↓
Ship/Building components request geometry + material by key
    ↓
Same geometry/material object reused across N components
    ↓
InstancedMesh for 960 windows: 1 draw call, N transforms
    ↓
Fewer unique objects → fewer GPU state changes → higher FPS
```

## Key Invariants

1. **Post-processing renders after the main scene pass**: Post-processing effects see the completed scene render, not individual objects. This means they cannot be selectively applied to individual meshes (e.g., bloom cannot be applied to only the ships). All emissive surfaces above the bloom threshold will bloom.

2. **Canvas pixel ratio is capped**: The `<Canvas dpr={[1, 1.5]}>` (or similar) cap prevents ultra-high pixel densities from multiplying fill rate on Retina displays. Without a cap, a 3× Retina phone would render at 9× the pixel count of a 1× display.

3. **WebGL context limit**: Browsers limit WebGL contexts per page (typically 8–16). With Next.js SSR and multiple `<Canvas>` elements, context exhaustion is possible. NUWRRRLD should have exactly one `<Canvas>`.

## Open Questions

> ❓ Are shadow maps enabled in Scene.tsx? (see above — critical performance question)

> ❓ What `dpr` cap is set on `<Canvas>`?

> ❓ Is anti-aliasing (MSAA or FXAA) enabled? MSAA is expensive; FXAA is cheap and handled as a post-process.

> ❓ Is the renderer configured with `powerPreference: 'high-performance'` or `'low-power'`? This affects GPU selection on laptops with dual GPUs.

## See Also

- [[entity-scene]] — Scene.tsx sets the Canvas and renderer parameters
- [[entity-pools]] — resource pooling reduces draw calls in the WebGL layer
- [[concept-performance-budget]] — FPS and memory targets this pipeline must meet
- [[concept-cyberpunk-aesthetic]] — bloom and lighting choices that drive pipeline cost
- [[architecture-animation-systems]] — how per-frame updates drive the pipeline
- [[architecture-scene-composition]] — what scene graph this pipeline renders
