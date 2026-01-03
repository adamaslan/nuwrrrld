# Resolution & Responsive Design Fix Plan

This document summarizes all fixes implemented to address the image resolution and responsive design issues.

---

## Fixes Implemented

### 1. EXR Sky Background

**File:** `components/three/SceneContent.tsx`

Added `SkyBackground` component that loads the 4K EXR file as both scene background and environment map:

```typescript
function SkyBackground() {
  const exrTexture = useLoader(EXRLoader, '/media/the_sky_is_on_fire_4k.exr');
  // Sets as both background and environment for reflections
  scene.background = exrTexture;
  scene.environment = exrTexture;
}
```

---

### 2. Texture Filtering Configuration

**File:** `components/three/TVScreen.tsx`

Both `ImageMedia` and `VideoMedia` components now configure proper texture filtering:

```typescript
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.anisotropy = gl.capabilities.getMaxAnisotropy();
texture.colorSpace = THREE.SRGBColorSpace;
texture.generateMipmaps = false; // Images only
```

**Benefits:**
- Maximum anisotropic filtering for sharp textures at angles
- Proper color space for accurate colors
- Disabled mipmaps to prevent blurring

---

### 3. Reduced Post-Processing Effects

**File:** `components/three/PostProcessing.tsx`

| Effect | Before | After | Impact |
|--------|--------|-------|--------|
| Bloom intensity | 0.5 | 0.25 | Less glow bleeding |
| Bloom threshold | 0.6 | 0.75 | Only brightest areas bloom |
| Noise opacity | 0.12 | 0.04 | Much less grain |
| Vignette darkness | 0.5 | 0.3 | Subtler edge darkening |
| Chromatic aberration | 0.0008 | 0.0003 | Sharper edges |

---

### 4. Increased Device Pixel Ratio

**File:** `components/three/Scene.tsx`

```typescript
// Before
dpr={[1, 2]}

// After
dpr={[1, 3]}
```

Now supports 3x Retina displays (iPhone Pro, high-end Android).

---

### 5. Fixed Screen Geometry Aspect Ratios

**File:** `config/mediaConfig.ts`

Changed from arbitrary `scale` to proper `aspectRatio` + `baseSize`:

```typescript
// Before
scale: [2.5, 4, 0.2] // Arbitrary, caused distortion

// After
baseSize: 4,
aspectRatio: 900 / 1600, // Exact source ratio
```

**File:** `components/three/TVScreen.tsx`

Screen dimensions now calculated correctly:

```typescript
const screenHeight = config.baseSize * responsiveScale;
const screenWidth = screenHeight * config.aspectRatio;
```

---

### 6. Viewport-Aware 3D Scaling

**File:** `components/three/TVScreen.tsx`

Added `useResponsiveScale` hook:

```typescript
function useResponsiveScale() {
  const { size } = useThree();
  const aspectRatio = size.width / size.height;

  if (aspectRatio > 1.5) return 0.85;  // Wide screen
  if (aspectRatio > 1) return 0.9;     // Landscape
  return 1.0;                          // Portrait
}
```

---

### 7. Responsive Camera

**File:** `components/three/SceneContent.tsx`

Added `useResponsiveCamera` hook that adjusts:
- FOV (55° wide, 60° landscape, 65° portrait)
- Camera position based on aspect ratio
- Look-at target for optimal framing

```typescript
function useResponsiveCamera() {
  if (isWideScreen) {
    return { fov: 55, position: [0, 4, 18], lookAt: [0, 3.5, -2] };
  } else if (isLandscape) {
    return { fov: 60, position: [0, 4.5, 16], lookAt: [0, 3.5, -2] };
  }
  return { fov: 65, position: [0, 5, 14], lookAt: [0, 4, -2] };
}
```

---

### 8. Landscape Orientation Handling

Camera sway animation adapts to orientation:

```typescript
const swayX = isLandscape ? 0.2 : 0.1;
const swayY = isLandscape ? 0.3 : 0.4;
```

---

## Files Modified

| File | Changes |
|------|---------|
| `components/three/SceneContent.tsx` | EXR background, responsive camera |
| `components/three/TVScreen.tsx` | Texture filtering, aspect ratio geometry, viewport scaling |
| `components/three/PostProcessing.tsx` | Reduced effect intensities |
| `components/three/Scene.tsx` | DPR 3x, fog color adjusted |
| `config/mediaConfig.ts` | New `aspectRatio` + `baseSize` fields |

---

## Summary

| Issue | Status |
|-------|--------|
| No texture filtering | ✅ Fixed |
| Post-processing blur | ✅ Reduced |
| DPR capped at 2x | ✅ Now 3x |
| Aspect ratio distortion | ✅ Fixed |
| Hardcoded positions | ✅ Viewport-aware |
| Fixed camera | ✅ Responsive |
| No landscape handling | ✅ Added |
| EXR sky background | ✅ Added |
