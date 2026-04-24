# Wiki Log

_Append-only. Never edit past entries._

Format: `## [{date}] {operation} | {detail} | pages touched: N`

Parse with: `grep "^## \[" log.md | tail -10`

---

## [2026-04-23] init | Bootstrap

Wiki initialized for NUWRRRLD. Scaffold created: `SCHEMA.md`, `ORIGIN.md`, `Welcome.md`, `index.md`, `log.md`.

---

## [2026-04-23] ingest | Full codebase + all docs first pass | pages touched: 19

Sources read: PLAN_SUMMARY.md, OPTIMIZATION_OVERVIEW.md, ENVIRONMENT_OPTIMIZATION_GUIDE.md, TVSCREEN_SIDESCREEN_FEATURE.md, IMPLEMENTATION_CHECKLIST.md, PHASE_1–4 docs, REFACTORING_THEORY.md, BOUNDARY_SHIP_ROTATION_CHALLENGES.md, DETAIL_OPTIMIZATION_THEORIES.md, Typescript-design-guide.md, design-priniciple.md, all 12 .claude/commands/*.md files, package.json, tsconfig.json, mediaConfig.ts structure, constants.ts structure.

**Pages created:**
- `overview.md` — system map, tech stack, component hierarchy, health status
- `entity-scene.md` — canvas, orchestration, postprocessing, lighting, contexts
- `entity-ships.md` — 16-ship fleet, ShipConfig, procedural gen, animation system
- `entity-buildings.md` — 16 buildings, BuildingBlueprint, InstancedMesh windows
- `entity-screens.md` — 3 TV screens, mediaConfig, TVScreen/SideScreen, interaction
- `entity-layers.md` — 4 depth layers, Z-ranges, parallax, layer contents
- `entity-pools.md` — GeometryPool, MaterialPool, PoolContext, memory targets
- `entity-commands.md` — 12 slash commands, categories, integration gaps
- `concept-procedural-generation.md` — ships + buildings from seeds
- `concept-seeded-random.md` — deterministic PRNG for consistency
- `concept-depth-stratification.md` — Z-based organization + parallax
- `concept-cyberpunk-aesthetic.md` — neon palette, emissive, CRT, bloom
- `concept-performance-budget.md` — explicit memory/FPS targets
- `concept-resource-pooling.md` — shared geometry/material pools
- `concept-command-as-documentation.md` — commands as living docs
- `architecture-scene-composition.md` — full scene assembly chain
- `architecture-animation-systems.md` — useFrame patterns, all animation
- `architecture-rendering-pipeline.md` — WebGL → RxF → postprocessing
- `decision-depth-stratification-layers.md` — why 4 explicit Z-ranges
- `decision-seeded-random-generation.md` — why deterministic PRNG
- `decision-resource-pool-pattern.md` — why centralized pools
- `decision-portrait-first-design.md` — why portrait-first mobile

**Open questions filed:**
- Are shadow maps enabled in Scene.tsx?
- What pixel ratio cap is used?
- Is LOD implemented or only planned?
- Are PoolContext providers wrapping all consumers correctly?
- Do ship animation offsets use the seeded PRNG or Math.random()?
- What triggers cache invalidation in the geometry/material pools?

**Contradictions found:**
- None identified in first pass — source docs are largely consistent

**Commands updated:**
- `.claude/commands/mcp-and-guidance.md` — appended wiki reference section

---

## [2026-04-23] decision | Planet-scale expansion + 2 new building screens | pages touched: 2

Created `decision-planet-scale-expansion.md` — plan to triple environment scale and add Archive + NuWrrrld Financial screens in building zone.

**Pages touched:**
- `decision-planet-scale-expansion.md` — created with full change plan
- `index.md` — added decision entry

**Status**: Plan only. Not yet implemented.

---

## [2026-04-23] decision | Bridge + walking robots added to planet-scale plan | pages touched: 1

Updated `decision-planet-scale-expansion.md` — appended sections 7 (CyberpunkBridge) and 8 (BridgeRobots) with full config interfaces, geometry breakdown, animation spec, and parent-group orientation strategy. File change summary updated to include 2 new component files and Environment.tsx.

---

## [2026-04-24] lint | 6 issues found; all resolved in same session | pages touched: 8

**Issues found and fixed:**

1. **Stale claim** — `entity-buildings.md`: height 15–40 listed; actual planet-scale heights are 75–225 (side) and 150–360 (background). Fixed: updated procedural properties table and What It Is section.
2. **Answered open question** — `entity-buildings.md`: building materials open question answered by code audit (shared via `usePools()`). Resolved.
3. **Stale claim** — `entity-screens.md`: said 3 screens; actual count is 5 (+ canvas MediaType). Fixed: full rewrite with 5-screen table, NuWrrrldMorphTexture, axis-mode RemoteControl.
4. **Stale claim** — `overview.md`: component hierarchy missing Bridge, BridgeRobots, NuWrrrldMorphTexture; health table outdated; config hub descriptions incomplete. Fixed: full hierarchy update, health table, open questions.
5. **Stale claim** — `decision-planet-scale-expansion.md`: "Validated By: Not yet implemented." Fixed: replaced with implementation commit table and PR #40 reference.
6. **Missing entity page** — `CyberpunkBridge` + `BridgeRobots` exist in code; no wiki page. Fixed: created `entity-decorations.md`.
7. **Missing concept page** — Named constants pattern (`BUILDING_CONFIG`, `CITY_LIGHTS`) is a project convention with no wiki page. Fixed: created `concept-named-constants.md`. Also filed legacy contradiction (`MIN_HEIGHT`/`MAX_HEIGHT` stale fields).
8. **Index** — `index.md` missing `entity-decorations`, `concept-named-constants`; screen count stale; decision status stale. Fixed: updated all.

**No orphan pages found** — all existing pages are referenced from index.

**Pages touched:** `entity-buildings.md`, `entity-screens.md`, `overview.md`, `decision-planet-scale-expansion.md`, `entity-decorations.md` (new), `concept-named-constants.md` (new), `index.md`, `log.md`

---

## [2026-04-24] ingest | scene layout + morph legibility changes | pages touched: 1

Changes ingested from commits `3e98e07` and `fb406a9`:
- Camera Y raised 22→33; orbit target y=10 so all 3 focal screens visible on load
- Bridge condensed (length 150→70, deck Y=18 for ship clearance, angle 0°, repositioned to far-left)
- Background building cluster moved to far-left (x≈−140 to −220, tight step/jitter)
- Screens 4+5 repositioned to front-center of far-left cluster; screen 5 changed to canvas type
- NuWrrrldMorphTexture legibility pass: 1024×1024 canvas, 22 px font, 180 particles, tight scatter

**Pages updated:** `entity-screens.md` — screen config table (positions, types), Canvas Screen Type section expanded with morph parameters table and tuning guidance, open question updated.
