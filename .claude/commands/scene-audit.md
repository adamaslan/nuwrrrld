---
allowed-tools: Read, Glob, Grep, Bash(file:*)
argument-hint: [--performance | --visual | --responsive | --all]
description: Audit the 3D scene for issues and optimization opportunities
---

# Scene Audit

Analyze the NUWRRRLD 3D scene for performance, visual quality, and responsiveness issues.

## Arguments
- `$1` - Audit type (optional, default: `--all`)
  - `--performance` - Check for performance bottlenecks
  - `--visual` - Check visual quality and consistency
  - `--responsive` - Check responsive behavior
  - `--all` - Run all audits

## Steps

1. **Read configuration files** (mediaConfig.ts, Scene.tsx, PostProcessing.tsx)
2. **Analyze components** for issues based on audit type
3. **Generate report** with findings and recommendations
4. **Output summary** with priority rankings

## Audit Checks

### Performance Audit

#### Geometry Complexity
- [ ] Total vertex count across all meshes
- [ ] Polygon count per object (flag if > 10k)
- [ ] Instanced vs individual meshes
- [ ] LOD (Level of Detail) implementation

#### Texture Analysis
- [ ] Texture sizes (flag if > 2048x2048)
- [ ] Texture format optimization (WebP/AVIF support)
- [ ] Mipmap generation settings
- [ ] Anisotropic filtering levels
- [ ] Unused texture detection

#### Render Pipeline
- [ ] Post-processing effect count
- [ ] Bloom intensity and threshold
- [ ] Shadow map resolution
- [ ] DPR (Device Pixel Ratio) settings
- [ ] Antialiasing mode

#### Animation Performance
- [ ] useFrame hook count
- [ ] Heavy calculations in render loop
- [ ] Proper useMemo/useCallback usage
- [ ] Shader compilation caching

### Visual Quality Audit

#### Screen Display
- [ ] Image aspect ratio vs geometry match
- [ ] Texture filtering (Linear vs Nearest)
- [ ] Color space settings (sRGB)
- [ ] Screen edge bleeding/artifacts

#### Lighting
- [ ] Light source count and types
- [ ] Shadow quality settings
- [ ] Ambient vs directional balance
- [ ] Emissive material consistency

#### Post-Processing
- [ ] Bloom bleed on edges
- [ ] Chromatic aberration intensity
- [ ] Noise grain visibility
- [ ] Vignette falloff

#### Material Consistency
- [ ] Metalness/roughness ranges
- [ ] Color palette cohesion
- [ ] Transparency sorting issues
- [ ] Z-fighting detection

### Responsive Audit

#### Viewport Handling
- [ ] Camera FOV adjustment for aspect ratio
- [ ] Screen scaling for viewport width
- [ ] Touch interaction support
- [ ] Orientation change handling

#### Mobile Optimization
- [ ] DPR capping for mobile
- [ ] Reduced particle counts
- [ ] Simplified post-processing
- [ ] Touch gesture implementation

#### Performance Budgets
- [ ] Target FPS by device class
- [ ] Memory usage monitoring
- [ ] GPU utilization

## Report Format

```markdown
# Scene Audit Report

## Summary
- **Performance Score:** X/100
- **Visual Quality Score:** X/100
- **Responsive Score:** X/100

## Critical Issues
1. [CRITICAL] Description...
2. [CRITICAL] Description...

## Warnings
1. [WARNING] Description...

## Recommendations
1. [PERF] Recommendation...
2. [VISUAL] Recommendation...
3. [RESPONSIVE] Recommendation...

## Metrics
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Vertex Count | X | <100k | OK/WARN |
| Texture Memory | X MB | <50MB | OK/WARN |
| Post-FX Count | X | <5 | OK/WARN |
| FPS (Mobile) | X | >30 | OK/WARN |
```

## Common Issues & Fixes

### High Vertex Count
```typescript
// Use instancing for repeated objects
<instancedMesh args={[geometry, material, count]}>
```

### Texture Memory
```typescript
// Compress and resize textures
// Use .webp format where supported
// Enable generateMipmaps: false for UI textures
```

### Post-Processing Overload
```typescript
// Reduce bloom samples
<Bloom
  luminanceThreshold={0.8}  // Higher = less bloom
  intensity={0.3}           // Lower intensity
  levels={3}                // Fewer mip levels
/>
```

### Mobile Performance
```typescript
// Conditional quality based on device
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
const dpr = isMobile ? [1, 1.5] : [1, 2];
const particleCount = isMobile ? 100 : 500;
```

## Example Usage

```
/scene-audit
/scene-audit --performance
/scene-audit --visual
/scene-audit --responsive
/scene-audit --all
```
