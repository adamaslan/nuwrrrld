---
date: 2026-04-23
type: concept
tags: [aesthetic, cyberpunk, neon, colors, postprocessing, materials]
sources: [raw/PLAN_SUMMARY.md, raw/TVSCREEN_SIDESCREEN_FEATURE.md]
---

# Concept: Cyberpunk Aesthetic

## The Pattern

NUWRRRLD uses a cohesive visual language built around four neon colors against dark backgrounds, applied consistently through: emissive material properties (surfaces that appear to glow), a post-processing bloom pass that makes emissive surfaces radiate light, CRT scanline overlays on TV screens, and metallic/industrial materials for ships and buildings. The palette is defined in `config/constants.ts` as `CYBERPUNK_COLORS` and is the single source of truth for all color decisions.

**The four primary neon colors:**
- Cyan: `#00ffff` — technology, screens, primary accent
- Magenta: `#ff00ff` — danger, energy, secondary accent
- Green: `#00ff88` — status, health, safe systems
- Amber: `#ffaa00` — warning, warmth, mechanical

**Background palette:**
- Dark navy: `#1a2a3a`
- Dark purple: `#2a1a3a`
- Near-black: `#1a1a28`

## Where It Appears

- **[[entity-screens]]** — each screen has an assigned accent color (green/cyan/magenta); CRT scanline overlay; neon frame corner lights
- **[[entity-buildings]]** — window colors drawn from CYBERPUNK_COLORS; 4 material variants with metallic properties
- **[[entity-ships]]** — hull colors from CYBERPUNK_COLORS; engine light colors; emissive engine glow
- **[[entity-scene]]** — 11+ neon-colored point/spot lights in `Lighting.tsx`; bloom + chromatic aberration in `PostProcessing.tsx`
- **[[entity-layers]]** — holographic elements in ForegroundLayer use translucent emissive materials
- **`/cyberpunk-theme` command** — encodes 5 full theme palettes (neon/noir/vapor/matrix/sunset) for scene-wide recoloring

## Post-Processing Role

The bloom pass in `PostProcessing.tsx` is the multiplier that makes the aesthetic work. Emissive materials on their own produce colored surfaces; bloom makes them radiate glowing halos. Without bloom, the scene looks like colored geometry. With bloom, it looks neon-lit.

The chromatic aberration pass adds the final "CRT screen" quality — slight color fringing at the edges of the frame — reinforcing the cyberpunk digital aesthetic.

## Contradictions / Tensions

**Bloom is expensive on mobile**: The bloom pass requires rendering the scene to an offscreen buffer, extracting bright pixels, blurring, and compositing — multiple full-screen passes. On mobile GPUs with limited fill rate, this is the most expensive post-processing step. The cyberpunk aesthetic *requires* bloom for its signature look, but this directly conflicts with [[concept-performance-budget]] on mobile.

**Emissive materials and lighting**: Emissive materials glow regardless of scene lighting — they do not cast or receive light. This means the 11+ lights in `Lighting.tsx` are primarily for illuminating non-emissive surfaces. There is a design tension between using lights (realistic but expensive) and emissive materials (cheaper but flat-looking) for the neon glow effect.

**Color consistency**: `CYBERPUNK_COLORS` is the single source of truth, but the `/cyberpunk-theme` command can override it. If a theme is applied and then the codebase is modified, the constants and the applied theme may diverge.

## See Also

- [[entity-scene]] — PostProcessing.tsx implements bloom; Lighting.tsx implements neon lights
- [[entity-screens]] — CRT overlay and accent colors are the most visible aesthetic elements
- [[concept-performance-budget]] — bloom is the primary aesthetic/performance conflict
- [[architecture-rendering-pipeline]] — where in the render stack the post-processing effects live
