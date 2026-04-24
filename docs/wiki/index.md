---
date: 2026-04-24
type: index
tags: [index, navigation]
---

# Wiki Index

_Last updated: 2026-04-24_

Read this file first on any query to find relevant pages, then drill in. For wiki philosophy see [[ORIGIN]]. For conventions see [[SCHEMA]].

---

## Overview

- [[overview]] — system map, tech stack, component hierarchy, data flow, current health

---

## Entities

One page per named system component. These are the hubs — concepts and decisions link to them.

- [[entity-scene]] — WebGL canvas, SceneContent orchestrator, PostProcessing, Lighting, contexts
- [[entity-ships]] — 16-ship fleet (shuttles/transports/freighters), ShipConfig, procedural generation, animation
- [[entity-buildings]] — 16 cyberpunk buildings, planet-scale layout, BUILDING_CONFIG constants
- [[entity-screens]] — 5 TV screens (3 focal + 2 building-mounted), canvas type, NuWrrrldMorphTexture
- [[entity-decorations]] — CyberpunkBridge + BridgeRobots, background zone, procedural geometry
- [[entity-layers]] — 4 depth layers (foreground/midground/background/opposite), Z-ranges, parallax
- [[entity-pools]] — GeometryPool, MaterialPool, PoolContext, memory targets
- [[entity-commands]] — 12 slash commands, categories (ships/scene/workflow/guidance), gaps

---

## Concepts

Cross-cutting patterns and design philosophy.

- [[concept-procedural-generation]] — ships and buildings generated from seeds, not hand-modelled
- [[concept-seeded-random]] — deterministic PRNG prevents geometry churn, ensures visual consistency
- [[concept-depth-stratification]] — 4 explicit Z-ranges create parallax and organize 100+ elements
- [[concept-cyberpunk-aesthetic]] — neon palette, emissive materials, CRT overlay, bloom
- [[concept-performance-budget]] — explicit memory/FPS targets govern every rendering decision
- [[concept-resource-pooling]] — shared geometry/material pools, InstancedMesh for 960 windows
- [[concept-command-as-documentation]] — slash commands as both executable workflows and living docs
- [[concept-named-constants]] — no magic numbers; all layout/light values in config/constants.ts

---

## Architecture

How components compose and interact.

- [[architecture-scene-composition]] — entry point to full scene assembly, provider chain, config hubs
- [[architecture-animation-systems]] — useFrame patterns, ship/building/particle/screen animation
- [[architecture-rendering-pipeline]] — WebGL → React Three Fiber → postprocessing stack

---

## Decisions

Recorded design choices with rationale, alternatives rejected, and validation history.

- [[decision-depth-stratification-layers]] — why 4 explicit Z-ranges instead of arbitrary placement
- [[decision-seeded-random-generation]] — why deterministic PRNG over Math.random() or hand-authored models
- [[decision-resource-pool-pattern]] — why centralized GeometryPool/MaterialPool instead of per-component creation
- [[decision-portrait-first-design]] — why mobile portrait is the primary design target
- [[decision-planet-scale-expansion]] — **implemented**: 3× scale, bridge, robots, 2 building screens (PR #40)

---

## Incidents

Production bugs and significant failures. Each incident links to the entity pages it affected.

_(None recorded yet — create `incident-YYYY-MM-DD-name.md` when issues occur)_

---

## Slash Commands (12)

| Command | What it does |
|---------|-------------|
| `/ship-system-guide` | Architecture reference: ship types, ShipConfig, size tiers 1x–9x |
| `/ship-optimization` | Memory/performance optimization: pooling, LOD, InstancedMesh |
| `/ship-examples` | Copy-paste ship templates at all complexity levels |
| `/add-capital-ship` | Add optimized 9x capital ships with geometry/material pools |
| `/add-screen` | Add TV screen with industrial back-panel design |
| `/add-environment-layer` | Add depth layer (foreground/midground/background/custom) |
| `/cyberpunk-theme` | Apply neon/noir/vapor/matrix/sunset/custom color theme |
| `/scene-audit` | Audit scene for performance, visual, and responsive issues |
| `/export-scene-config` | Export complete scene config to JSON/YAML/TypeScript |
| `/mcp-and-guidance` | MCP server status and project guidance |
| `/lpr` | Descriptive PR creator (branch, build, commit, PR) |
| `/verpr` | Vercel deploy + PR workflow |

---

## Sources (raw/)

Immutable source documents. LLM reads; never modifies.

| File | What it is |
|------|-----------|
| `raw/PLAN_SUMMARY.md` | Executive summary of optimization and feature roadmap |
| `raw/OPTIMIZATION_OVERVIEW.md` | Memory/FPS problem statement and solution strategy |
| `raw/ENVIRONMENT_OPTIMIZATION_GUIDE.md` | 10 specific optimization suggestions with code examples |
| `raw/TVSCREEN_SIDESCREEN_FEATURE.md` | SideScreen component design and implementation guide |
| `raw/IMPLEMENTATION_CHECKLIST.md` | Step-by-step optimization tasks |
| `raw/PHASE_1_FOUNDATIONS.md` | Constants extraction, type definitions, JSDoc |
| `raw/PHASE_2_ERROR_HANDLING.md` | Custom error classes, type guards, error boundaries |
| `raw/PHASE_3_DECOMPOSITION.md` | Breaking Environment.tsx (1678 lines) into components |
| `raw/PHASE_4_REFACTORING.md` | Final refactoring pass |
| `raw/REFACTORING_THEORY.md` | Principles behind the 4-phase refactoring |
| `raw/BOUNDARY_SHIP_ROTATION_CHALLENGES.md` | Capital ship movement and rotation technical fixes |
| `raw/DETAIL_OPTIMIZATION_THEORIES.md` | Theories for 10x detail and 25% memory reduction |
| `raw/Typescript-design-guide.md` | 27 TypeScript development guidelines |
| `raw/design-priniciple.md` | Core development principles (root level) |

---

## Meta

- [[SCHEMA]] — wiki conventions, page types, required sections, ingest/query/lint workflows
- [[ORIGIN]] — philosophy: why LLM-maintained wikis work and how to apply the pattern
- [[Welcome]] — home page with system status and quick navigation
