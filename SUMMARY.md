# NUWRRRLD

An immersive interactive 3D web application featuring a cyberpunk-inspired display environment that showcases media on animated TV screens within a richly detailed 3D scene. Portrait-first, mobile-optimized.

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | Next.js 14.2.0, React 18.2.0 |
| 3D Graphics | Three.js 0.162.0 |
| 3D React Binding | @react-three/fiber, @react-three/drei |
| Post-Processing | @react-three/postprocessing |
| Styling | Tailwind CSS 3.4.0 |
| Language | TypeScript 5.3.0 |

## Project Structure

```
nuwrrrld/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page entry point
│   └── globals.css         # Global styling (portrait-first responsive)
├── components/
│   ├── three/              # Three.js/3D components
│   │   ├── Scene.tsx       # Main canvas wrapper
│   │   ├── SceneContent.tsx # Scene composition
│   │   ├── TVScreen.tsx    # Interactive 3D TV screens
│   │   ├── Lighting.tsx    # Multi-light neon cyberpunk setup
│   │   ├── Environment.tsx # City, neon signs, flying ships, particles
│   │   ├── Particles.tsx   # Floating particle system
│   │   └── PostProcessing.tsx # Bloom, noise, vignette effects
│   └── ui/
│       └── LoadingScreen.tsx
├── config/
│   └── mediaConfig.ts      # Screen positions and media paths
├── public/
│   └── media/              # Images and videos for TV screens
├── package.json
├── next.config.js
├── tsconfig.json
└── tailwind.config.ts
```

## Features

### Interactive 3D Scene
- Three.js canvas with high-performance rendering
- Portrait-optimized camera with cinematic floating animation
- Adaptive viewport for all screen sizes

### Media Display System
- Three stacked TV screens at varying depths
- Supports static images (JPEG, PNG, WebP) and video (MP4, WebM)
- Independent configuration per screen (position, rotation, scale)

### Screen Interactions
- Hover effects: glow intensifies, scale animation
- Tap/Click: pulse ring effect, glow color shift (cyan to magenta)
- CRT-style scanline overlay
- Metallic beveled frames with corner accent lights

### Cinematic Environment
- Procedurally generated cyberpunk cityscape
- 11+ point lights and 3 animated spot lights
- Animated neon signs and grid lines
- 25 AI-controlled flying ships (shuttles, transports, freighters)
- Rain particles (1500 particles) and floating holographic elements
- Reflective ground with metallic puddles

### Post-Processing
- Bloom (neon glow)
- Film grain/Noise
- Vignette
- Chromatic aberration

## Configuration

Media and screen layout can be customized in `config/mediaConfig.ts`:

```typescript
// Example: Add or modify screens
export const screenConfigs = [
  {
    position: [0, 2, -3],
    rotation: [0, 0, 0],
    scale: 1.2,
    mediaPath: '/media/your-image.jpg'
  },
  // ...
]
```

## Running the Project

```bash
# Development server (localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Design Highlights

- **Portrait-first responsive** design with breakpoints at 375px, 414px, 768px, 1024px, 1280px, 1440px+
- **Neon color palette**: Cyan (#00ffff), Magenta (#ff00ff), Accent (#00ff88, #ffaa00)
- **Performance optimized**: Memoized geometries, efficient particle systems, adaptive DPR
- **Extensible**: Easy to add screens, modify camera behavior, add environmental elements
