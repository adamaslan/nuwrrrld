# Image Resolution Issues & Responsive Design Analysis

This document explains why screen images may appear blurry or lack clarity, and why the current implementation is not truly mobile-first or responsive.

---

## 5 Causes of Poor Image Resolution on TV Screens

### 1. No Texture Filtering Configuration

The `useTexture` hook in `TVScreen.tsx` loads images without configuring texture filtering:

```typescript
// Current implementation (TVScreen.tsx:27)
const texture = useTexture(path);
```

**Problem**: Three.js default texture settings may use linear filtering and auto-generated mipmaps that blur the image, especially when viewed at angles or from varying distances.

**Solution**: Configure texture properties explicitly:
```typescript
const texture = useTexture(path);
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.anisotropy = gl.capabilities.getMaxAnisotropy();
```

---

### 2. Post-Processing Effects Degrade Clarity

The `PostProcessing.tsx` applies multiple effects that reduce perceived sharpness:

| Effect | Setting | Impact on Clarity |
|--------|---------|-------------------|
| Bloom | `intensity={0.5}` | Bleeds bright areas into surrounding pixels |
| Noise | `opacity={0.12}` | Adds film grain over entire scene |
| Chromatic Aberration | `offset={0.0008, 0.0008}` | Shifts RGB channels, creating edge blur |
| Vignette | `darkness={0.5}` | Darkens edges, reducing contrast |

These effects are intentional for the cyberpunk aesthetic but directly reduce image fidelity.

---

### 3. Device Pixel Ratio Capped at 2x

```typescript
// Scene.tsx:19
dpr={[1, 2]}
```

**Problem**: Modern devices have 3x DPR (iPhone Pro, many Android flagships). Capping at 2x means rendering at 66% of native resolution on these devices.

**Trade-off**: Higher DPR significantly impacts performance. This is a deliberate optimization, but it reduces sharpness on high-end displays.

---

### 4. Screen Geometry Scaling Distorts Aspect Ratio

```typescript
// TVScreen.tsx:60-61
const screenWidth = config.scale[0] * 0.95;
const screenHeight = config.scale[1] * 0.85;
```

**Problem**: Arbitrary multipliers (0.95, 0.85) modify the screen dimensions independent of source image aspect ratios. This can cause:
- Image stretching or compression
- Black bars or cropping
- Non-uniform pixel mapping

Source images have different aspect ratios:
- `doves1.jpg`: 900x1600 (9:16)
- `nathans1.jpg`: 1783x1783 (1:1)
- `postmascaa1.jpg`: 948x1188 (~4:5)

But screen scales don't match these ratios.

---

### 5. No Texture Resolution Optimization

Images are loaded at their source resolution without optimization for display size:

- Source files may be larger or smaller than needed
- No responsive image loading based on viewport
- No texture compression (KTX2/Basis) for faster loading with better quality
- Browser may downsample large textures on memory-constrained devices

---

## Why It's Not Mobile-First or Responsive

Despite the CSS using mobile-first breakpoints, the 3D scene itself is **not responsive**:

### 1. Hardcoded 3D Positions

Screen positions are fixed values that don't adapt to viewport:

```typescript
// mediaConfig.ts
position: [0, 8, -4],   // Top screen
position: [0, 3.5, -3], // Middle screen
position: [0, -0.5, -2] // Bottom screen
```

On a small phone, these positions may place screens outside the visible frustum. On a wide desktop, the content appears small and centered.

### 2. Fixed Camera Configuration

```typescript
// Scene.tsx:20-25
camera={{
  fov: 65,
  position: [0, 5, 14],
}}
```

- FOV doesn't adapt to portrait vs landscape orientation
- Camera position doesn't adjust for different aspect ratios
- No consideration for varying screen sizes

### 3. CSS Responsive, Canvas Not

The CSS constrains the page layout:
```css
/* globals.css:198 */
max-width: 600px; /* tablet */
max-width: 900px; /* large desktop */
```

But the 3D content inside the canvas renders identically regardless of container size. A 375px phone and a 1440px desktop see the same 3D scene composition.

### 4. No Viewport-Based Scale Adjustments

True responsive 3D would adjust:
- Screen scales based on viewport dimensions
- Camera distance based on aspect ratio
- FOV to maintain consistent framing
- Touch target sizes for different device classes

### 5. Portrait-Optimized but Not Responsive

The scene is *designed* for portrait viewing (vertical screen stack) but doesn't *adapt* to different contexts:
- Landscape mode shows excessive empty space
- Desktop users see a narrow column
- No layout reconfiguration for different orientations

---

## Summary

| Category | Issue | Root Cause |
|----------|-------|------------|
| Resolution | Blurry textures | No filtering config |
| Resolution | Soft edges | Post-processing effects |
| Resolution | Reduced sharpness | DPR capped at 2 |
| Resolution | Distortion | Aspect ratio mismatch |
| Resolution | Quality variance | No texture optimization |
| Responsive | Fixed layout | Hardcoded 3D positions |
| Responsive | No adaptation | Static camera/FOV |
| Responsive | Orientation issues | No landscape handling |
