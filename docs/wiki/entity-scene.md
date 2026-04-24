---
date: 2026-04-23
type: entity
tags: [scene, canvas, rendering, contexts, postprocessing]
sources: [raw/PHASE_1_FOUNDATIONS.md, raw/OPTIMIZATION_OVERVIEW.md]
---

# Entity: Scene

## What It Is

The Scene entity is the root of the 3D world. It encompasses the WebGL canvas setup, the scene orchestrator that composes all elements, the lighting rig, the post-processing effects pipeline, and the React context providers that make shared resources available to all child components. Everything visible in NUWRRRLD descends from this entity.

## Key Files

| File | Role |
|------|------|
| `app/page.tsx` | Next.js App Router entry; renders the `<Scene>` component |
| `components/three/Scene.tsx` | WebGL `<Canvas>` wrapper; sets camera, renderer settings, Suspense |
| `components/three/SceneContent.tsx` | Scene orchestrator; composes Environment, TVScreens, Lighting, PostProcessing |
| `components/three/Lighting.tsx` | 11+ point and spot lights; neon color-matched |
| `components/three/PostProcessing.tsx` | Bloom → film grain → vignette → chromatic aberration pipeline |
| `components/three/ErrorBoundary.tsx` | React error boundary; catches WebGL failures gracefully |
| `context/CameraContext.tsx` | Camera position state; shared across RemoteControl and scene |
| `context/ScreenContext.tsx` | Selected screen state; drives TV screen highlight and RemoteControl |
| `components/three/pools/PoolContext.tsx` | Provides GeometryPool + MaterialPool to all consumers |

## Provider Chain

```
PoolContext.Provider
└── CameraContext.Provider
    └── ScreenContext.Provider
        └── Scene.tsx (Canvas)
            └── SceneContent.tsx
```

PoolContext must be outermost — any component that consumes the geometry or material pool must be inside it.

## Where Used

- [[entity-ships]] — consumes PoolContext for geometry/material reuse
- [[entity-buildings]] — consumes PoolContext for InstancedMesh windows
- [[entity-screens]] — renders inside SceneContent; drives ScreenContext
- [[entity-layers]] — rendered inside Environment.tsx, which is inside SceneContent
- [[entity-pools]] — provided by this entity's PoolContext

## Known Issues

> ❓ Open question: Is shadow mapping enabled in Scene.tsx? Enabling shadows on 11+ lights is expensive — especially on mobile. If enabled, it may be a primary driver of the unstable FPS.

> ❓ Open question: What devicePixelRatio cap is set on the Canvas? A cap of 1.5 vs 2.0 significantly affects fill rate on high-DPI mobile screens.

## See Also

- [[entity-pools]] — the geometry/material pool system provided by this entity
- [[architecture-scene-composition]] — full scene assembly chain from page.tsx down
- [[architecture-rendering-pipeline]] — how WebGL, React Three Fiber, and postprocessing compose
- [[concept-performance-budget]] — targets this entity's renderer must meet
- [[concept-cyberpunk-aesthetic]] — postprocessing and lighting choices driven by aesthetic
