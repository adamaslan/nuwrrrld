---
date: 2026-04-23
type: decision
tags: [decision, mobile, portrait, design, responsive]
sources: [raw/PLAN_SUMMARY.md, raw/TVSCREEN_SIDESCREEN_FEATURE.md]
---

# Decision: Portrait-First Mobile Design

## Decision

Design the 3D scene, camera, screen positioning, and UI for portrait orientation on mobile as the primary target. Desktop landscape is a secondary experience.

## Date

Initial design phase (prior to 2026-04-23).

## Context

NUWRRRLD is a portfolio showcase, not a productivity tool. Its primary distribution channel is social sharing — the owner shares the URL with contacts who click it on their phones. Most visitors arrive via mobile in portrait orientation. The scene must be compelling and legible in that context.

Additionally, the three TV screens stacked vertically (y=12, y=40, y=68) are a fundamental compositional choice that only reads as intentional design in portrait mode. In landscape, the screens are side-by-side at different depths — a less coherent arrangement.

## Alternatives Considered

**A — Desktop-first**: Most 3D web projects target desktop, where GPU capabilities and screen real estate are greater. Rejected because it misses the primary audience and makes the vertical screen stacking feel like a limitation rather than a design choice.

**B — Adaptive equal priority**: Design simultaneously for portrait and landscape, with different compositions for each. Rejected because splitting design effort weakens both experiences and doubles the responsive complexity. At the project's scale, this is over-engineering.

**C — Chosen: Portrait-first**: All compositional decisions (screen Y positions, camera FOV, HUD layout, performance budget) are made for portrait first. Desktop receives the same scene with more empty space on the sides — acceptable, not ideal, but coherent.

## Consequences

**What this enables:**
- Vertical screen stacking (y=12/y=40/y=68) reads as intentional artistic composition
- Performance budget targets are realistic for mobile GPUs
- `globals.css` portrait-first responsive rules are consistent with design intent
- The depth-based parallax (screens at z=−3, −6, −10) is most visible during portrait-mode vertical scroll/pan

**What this rules out:**
- Landscape-specific layouts (screens would need repositioning to work as well in landscape)
- Maximizing use of wide desktop viewports (the scene will have empty horizontal space on wide screens)
- Heavier visual effects that work on desktop but fail on mobile (must stay within mobile performance budget)

## Validated By

The three-screen vertical arrangement is the defining compositional feature of NUWRRRLD. It presupposes portrait orientation. The design has not changed since initial implementation, suggesting the portrait-first decision has held without pressure to reverse it.

## See Also

- [[entity-screens]] — the three-screen arrangement that presupposes portrait
- [[concept-performance-budget]] — mobile performance constraints tied to this decision
- [[concept-depth-stratification]] — depth/parallax effect is tuned for portrait camera movement
- [[entity-scene]] — camera and canvas settings tuned for portrait
