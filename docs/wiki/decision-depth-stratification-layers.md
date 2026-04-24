---
date: 2026-04-23
type: decision
tags: [decision, depth, layers, architecture, parallax]
sources: [raw/PHASE_3_DECOMPOSITION.md]
---

# Decision: Depth Stratification via Explicit Z-Ranges

## Decision

Organize all scene elements into four explicit Z-position ranges (foreground, midground, background, opposite), each owned by a dedicated `*Layer.tsx` component, rather than placing elements at arbitrary Z values.

## Date

Early scene decomposition phase (prior to 2026-04-23, during Phase 3 work).

## Context

`Environment.tsx` had grown to 1678 lines with all scene elements placed at ad hoc Z positions. Problems:
1. No clear model for where new elements should go — every addition required reading the whole file to find a safe Z position
2. Z-fighting between elements that happened to share the same Z value
3. No systematic parallax — depth differences were inconsistent, weakening the 3D effect
4. The file was unmaintainable at 1678 lines

The decomposition needed a principle, not just a split. Explicit Z-ranges provided the principle.

## Alternatives Considered

**A — Render layers / render order**: Three.js supports `renderOrder` on materials and objects, which controls draw order independent of Z. This would solve Z-fighting but not the organizational problem (elements would still be scattered) and would add GPU overhead (explicit render order overrides depth sorting).

**B — Arbitrary split by element type**: Group by element category (ships file, buildings file, particles file) without Z coordination. This is how the current file structure works at the component level, but without Z coordination, parallax is still inconsistent.

**C — Single continuous Z space with conventions**: Use named constants for Z positions (`const SHIP_Z = -15`) without enforcing layer ownership. Simpler but still fragile — two developers could independently choose Z values that conflict.

**D — Chosen: Explicit Z-range ownership via Layer components**: Four ranges, each owned by a component. New elements must be placed in the appropriate Layer. The component structure enforces the architectural rule.

## Consequences

**What this enables:**
- Clear ownership: any new element has an obvious home
- `/add-environment-layer` command is possible — it encodes the Z-range convention
- Parallax is systematic: depth differences are consistent by construction
- Environment.tsx is decomposed into maintainable components

**What this rules out:**
- Elements that span layers (e.g., a very tall building that extends from midground to background) require special handling
- Ships that fly at varying Z depths across layers must be managed outside layer components
- The OppositeLayer at positive Z is a special case that breaks the front-to-back depth metaphor

## Validated By

The four-layer structure has been stable across all documented scene changes. The `/add-environment-layer` command encodes the convention, demonstrating that it is teachable and repeatable. No Z-fighting incidents have been recorded post-decomposition.

## See Also

- [[concept-depth-stratification]] — the concept this decision created
- [[entity-layers]] — the four Layer components that implement it
- [[architecture-scene-composition]] — how layers fit into the full scene tree
