---
date: 2026-04-24
type: entity
tags: [screens, media, interaction, ui, canvas]
sources: [raw/TVSCREEN_SIDESCREEN_FEATURE.md, raw/PLAN_SUMMARY.md, config/mediaConfig.ts, components/three/NuWrrrldMorphTexture.tsx]
---

# Entity: Screens

## What It Is

Five interactive TV screens display portfolio content in NUWRRRLD. Three are the vertical focal stack at scene center; two are building-mounted screens in the background city zone. Each screen is a 3D object with a metallic beveled frame, CRT scanline overlay, hover glow, and tap interaction. Each has an associated side panel. All screen config lives in `mediaConfig.ts`.

The `MediaType` union now includes `'canvas'` — screens of this type render a live Three.js canvas animation rather than a static image or video. Screen 4 (Archive) is the first canvas-type screen, using `NuWrrrldMorphTexture.tsx` as its content.

## Key Files

| File | Role |
|------|------|
| `components/three/TVScreen.tsx` | 3D TV screen: frame, media plane, CRT overlay, hover/tap interaction |
| `components/three/SideScreen.tsx` | Side panel: status text, accent color |
| `components/three/NuWrrrldMorphTexture.tsx` | Canvas animation used by screen 4 (Archive) |
| `components/ui/NuWrrrldMorph.tsx` | 2D UI canvas animation component (non-Three.js version) |
| `config/mediaConfig.ts` | Source of truth for all 5 screen configs; exports `MediaType`, `ScreenConfig`, `SCREEN_CONFIGS` |
| `context/ScreenContext.tsx` | Tracks which screen is currently selected/active |
| `components/ui/RemoteControl.tsx` | 2D UI overlay: axis-mode camera controls + clickable links per screen |

## Screen Configuration

| ID | Title | Type | X | Y | Z | rotY | Accent |
|----|-------|------|---|---|---|------|--------|
| 1 | NuWrrrld News | image | 0 | 68 | −10 | 0 | #00ff88 (green) |
| 2 | Threshold_ | video | 0 | 40 | −6 | 0 | #00ffff (cyan) |
| 3 | ZXY Gallery | image | 0 | 12 | −3 | 0 | #ff00ff (magenta) |
| 4 | Archive | **canvas** | −155 | 35 | −60 | +0.5 | #ffaa00 (amber) |
| 5 | NuWrrrld Financial | **canvas** | −165 | 20 | −58 | +0.5 | #00ffff (cyan) |

Screens 1–3 form the portrait vertical stack (Y: 12→40→68), all visible from the initial camera position. Screens 4–5 are in the front-center of the far-left building cluster (x≈−155/−165), angled 0.5 rad toward the camera so they face the viewer despite being far to the left.

## Interaction Model

- **Hover**: glow intensification + scale-up animation on the screen frame
- **Tap/click**: pulse ring effect + glow color shift; updates ScreenContext
- **RemoteControl**: 2D floating panel; shows axis-mode orbit/pan controls and links for the active screen

## Canvas Screen Type

Both screens 4 and 5 are `type: 'canvas'`. `NuWrrrldMorphTexture.tsx` renders a procedural particle morph animation onto a Three.js `CanvasTexture` and returns it as a `<meshBasicMaterial>`. `TVScreen` passes `screenId` to `ScreenMedia`, which maps id 5 → `variant="financial"` and everything else → `variant="archive"`.

**Morph cycle** (each state holds for 2.5 s):
1. **NuWrrrld** — particles spell "nuwrrrld" in a horizontal band
2. **Circle** — particles orbit in a ring (radius = 320 px on a 1024×1024 canvas)
3. **Archive / Financial** — particles re-spell the screen's label word

**Legibility parameters** (tuned for desktop viewing distance):

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Canvas resolution | 1024×1024 | 2× over original 512; sharper texture on screen mesh |
| Font size | 22 px | Readable at scene viewing distance; was 11 px |
| Particle count | 180 | Less overlap per character; was 500 |
| Vertical scatter | ±1.2× font height | Particles stay on word baseline; was ±80 px cloud |

If the animation looks blurry at a given viewing distance, increase canvas resolution or font size before increasing particle count — more particles at small font makes it worse, not better.

## Depth & Parallax

The focal stack Z positions (−3, −6, −10) produce parallax with camera movement — bottom screen shifts more than top. The building-mounted screens (Z: −25, −30) are in the midground-to-background transition and shift significantly during orbit.

## Where Used

- [[entity-scene]] — screens are direct children of SceneContent.tsx
- [[architecture-scene-composition]] — screens render alongside Environment and Lighting
- [[concept-depth-stratification]] — Z-position differences create parallax
- [[concept-cyberpunk-aesthetic]] — CRT overlay, neon accent colors, metallic frames
- [[decision-planet-scale-expansion]] — building-mounted screens (4 and 5) added in this expansion

## Known Issues

> ❓ Open question: Video autoplay on mobile (thresh-plan1.mp4) — is it muted by default? iOS requires `muted` and `playsInline` for autoplay. If not set, the video screen may show a black frame on mobile.

> ❓ Open question: Screen 5 (NuWrrrld Financial) URL still points to `https://financial.nuwrrrld.com` — update when the real destination is known.

## See Also

- [[entity-scene]] — screens orchestrated by SceneContent.tsx
- [[entity-decorations]] — bridge and robots share the building zone with screens 4 and 5
- [[concept-depth-stratification]] — Z-position creates parallax
- [[decision-portrait-first-design]] — why focal screens stack on Y in portrait
- [[decision-planet-scale-expansion]] — when building-mounted screens were added
- [[concept-cyberpunk-aesthetic]] — neon accents and CRT overlay
- [[architecture-scene-composition]] — full scene assembly chain
