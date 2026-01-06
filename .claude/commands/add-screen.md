---
allowed-tools: Read, Write, Edit, Bash(file:*), Glob
argument-hint: <image-path> [y-position] [base-size]
description: Add a new TV screen to the 3D scene with full industrial design
---

# Add New TV Screen

Add a new media screen to the NUWRRRLD scene with full industrial cyberpunk design.

## Arguments
- `$1` - Image path (relative to /public, e.g., `/media/myimage.jpg`)
- `$2` - Y position (optional, default: auto-calculate based on existing screens)
- `$3` - Base size (optional, default: 20)

## Steps

1. **Check if image exists** in `/public/media/`
2. **Get image dimensions** to calculate aspect ratio
3. **Determine optimal position**:
   - Y: Space evenly between existing screens or use provided value
   - Z: Stagger depth (-3 to -12) for parallax effect
4. **Update `config/mediaConfig.ts`** with new screen config
5. **Confirm addition** with screen details

## Screen Design Specifications

The TVScreen component includes these design elements that will be applied:

### Front Side
- **Screen mesh**: Displays the image/video with proper aspect ratio
- **Scanline overlay**: Animated CRT-style horizontal line
- **Bezel glow**: Colored border glow (cyan default, magenta on tap)
- **Corner accent lights**: 4 animated lights at corners on hover

### Back Panel (Industrial Design)
```
┌─────────────────────────────────┐
│  ╔═══╗        ╔═══╗            │  <- Ventilation grilles
│  ║░░░║        ║░░░║            │
│  ╚═══╝        ╚═══╝            │
│     ┌──────────────┐           │
│     │ POWER UNIT   │           │  <- Power supply box
│     │  ○ ○ ○ ○ ○   │           │     with LED indicators
│     └──────────────┘           │
│  ════════════════════════      │  <- Cable conduits
│     │    │    │    │           │
│  ┌──┴────┴────┴────┴──┐        │
│  │   COOLING SYSTEM   │        │  <- Cooling unit
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │        │     with fan texture
│  └────────────────────┘        │
│        ╱╲      ╱╲              │  <- Structural brackets
│       ╱  ╲    ╱  ╲             │
└─────────────────────────────────┘
```

### Back Panel Components
1. **Ventilation grilles** (2x) - Metallic mesh panels with subtle glow
2. **Power supply unit** - Box with 5 LED indicator lights (animated)
3. **Cable conduits** - Horizontal bars with vertical cable runs
4. **Cooling system** - Large panel with animated fan texture
5. **Structural brackets** - Angled support struts
6. **Warning labels** - Small "HIGH VOLTAGE" decals
7. **Serial number plate** - Metallic plate with embossed text

### Frame Design
- **Metallic frame**: Beveled edges with brushed metal material
- **Mounting brackets**: Industrial support arms (top)
- **Support cables/rods**: Vertical suspension elements
- **Side mounting plates**: Reinforcement panels

### Materials
- Frame: `metalness: 0.9, roughness: 0.3`
- Back panel: `metalness: 0.85, roughness: 0.4`
- Accent lights: `emissive` materials with glow
- Cables: Dark rubber texture

## Config Format

```typescript
{
  id: <next-id>,
  type: 'image',
  path: '$1',
  position: [0, <y>, <z>],
  rotation: [<slight-tilt>, 0, 0],
  baseSize: $3 || 20,
  aspectRatio: <calculated-from-image>,
}
```

## Example Usage

```
/add-screen /media/artwork.jpg
/add-screen /media/photo.jpg 15 24
/add-screen /media/video.mp4 -10 18
```
