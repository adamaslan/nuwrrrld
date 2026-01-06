---
allowed-tools: Read, Write, Edit, Glob
argument-hint: <theme-name>
description: Apply a cyberpunk color theme to the entire scene
---

# Cyberpunk Theme

Apply a cohesive cyberpunk color theme across all scene elements including lighting, materials, post-processing, and UI.

## Arguments
- `$1` - Theme name: `neon`, `noir`, `vapor`, `matrix`, `sunset`, or `custom`

## Steps

1. **Load theme palette** based on selected theme
2. **Update Lighting.tsx** with themed light colors
3. **Update Environment.tsx** materials with theme colors
4. **Update PostProcessing.tsx** effects
5. **Update globals.css** UI colors
6. **Update GradientSkyDome** colors in SceneContent.tsx

## Theme Palettes

### Neon (Default)
The classic cyan/magenta cyberpunk aesthetic.
```typescript
{
  primary: '#00ffff',      // Cyan
  secondary: '#ff00ff',    // Magenta
  accent: '#ffff00',       // Yellow
  dark: '#0a0a1a',         // Deep blue-black
  darkAlt: '#1a0510',      // Deep purple-black
  glow: '#00aaff',         // Bright blue
  warning: '#ff3366',      // Hot pink
  neutral: '#2a2a3e',      // Slate
}
```

### Noir
Dark, moody, high contrast with minimal color.
```typescript
{
  primary: '#ffffff',      // Pure white
  secondary: '#888888',    // Gray
  accent: '#ff0000',       // Red accent
  dark: '#000000',         // Pure black
  darkAlt: '#0a0a0a',      // Near black
  glow: '#444444',         // Dim gray
  warning: '#ff0000',      // Red
  neutral: '#1a1a1a',      // Dark gray
}
```

### Vapor
Vaporwave aesthetic with pinks and blues.
```typescript
{
  primary: '#ff71ce',      // Hot pink
  secondary: '#01cdfe',    // Sky blue
  accent: '#05ffa1',       // Mint green
  dark: '#1a0a2e',         // Deep purple
  darkAlt: '#2d1b4e',      // Purple
  glow: '#b967ff',         // Violet
  warning: '#fffb96',      // Pale yellow
  neutral: '#3d2a5e',      // Muted purple
}
```

### Matrix
Green-on-black hacker aesthetic.
```typescript
{
  primary: '#00ff00',      // Matrix green
  secondary: '#00cc00',    // Dark green
  accent: '#00ff66',       // Bright green
  dark: '#000a00',         // Black-green
  darkAlt: '#001500',      // Very dark green
  glow: '#00ff00',         // Green glow
  warning: '#ffff00',      // Yellow
  neutral: '#0a1a0a',      // Dark green-gray
}
```

### Sunset
Warm oranges and purples like a neon sunset.
```typescript
{
  primary: '#ff6b35',      // Orange
  secondary: '#9b5de5',    // Purple
  accent: '#f15bb5',       // Pink
  dark: '#1a0a0a',         // Dark warm
  darkAlt: '#2a1020',      // Dark purple-red
  glow: '#ff9500',         // Golden
  warning: '#ff0054',      // Red-pink
  neutral: '#3a2a2a',      // Warm gray
}
```

## Application Mapping

### Lighting (Lighting.tsx)
```typescript
// Ambient light
<ambientLight color={theme.neutral} intensity={0.1} />

// Directional lights
<directionalLight color={theme.primary} intensity={0.3} />
<directionalLight color={theme.secondary} intensity={0.2} />

// Point lights
<pointLight color={theme.glow} intensity={1} />
<pointLight color={theme.accent} intensity={0.5} />
```

### Sky Dome (SceneContent.tsx)
```typescript
const gradientMaterial = new THREE.ShaderMaterial({
  uniforms: {
    topColor: { value: new THREE.Color(theme.dark) },
    bottomColor: { value: new THREE.Color(theme.darkAlt) },
  },
  // ...
});
```

### Environment Materials
```typescript
// Platforms
<meshStandardMaterial
  color={theme.neutral}
  emissive={theme.primary}
  emissiveIntensity={0.2}
/>

// Neon edges
<meshBasicMaterial
  color={theme.primary}
  toneMapped={false}
/>

// Holographic
<meshBasicMaterial
  color={theme.secondary}
  transparent
  opacity={0.6}
/>
```

### Post-Processing (PostProcessing.tsx)
```typescript
<Bloom
  luminanceThreshold={0.6}
  intensity={0.4}
  // Bloom color influenced by emissive materials
/>

<ChromaticAberration
  offset={[0.001, 0.001]}
  // Subtle effect
/>

// Optional: Color grading toward theme
<ColorDepth
  color={theme.primary}
  intensity={0.1}
/>
```

### CSS/UI (globals.css)
```css
:root {
  --color-primary: ${theme.primary};
  --color-secondary: ${theme.secondary};
  --color-accent: ${theme.accent};
  --color-dark: ${theme.dark};
  --color-glow: ${theme.glow};
}

.site-title {
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-primary));
}

.footer-text {
  color: rgba(from var(--color-primary) r g b / 0.5);
}
```

## Files Modified

| File | Changes |
|------|---------|
| `components/three/Lighting.tsx` | Light colors |
| `components/three/SceneContent.tsx` | Sky dome gradient |
| `components/three/Environment.tsx` | Material emissive/colors |
| `components/three/TVScreen.tsx` | Bezel glow color |
| `components/three/PostProcessing.tsx` | Effect settings |
| `app/globals.css` | CSS custom properties |

## Custom Theme

Create a custom theme by providing a JSON palette:

```
/cyberpunk-theme custom --palette='{"primary":"#ff0000","secondary":"#0000ff",...}'
```

Or create a config file at `config/customTheme.ts`:

```typescript
export const customTheme = {
  primary: '#yourcolor',
  secondary: '#yourcolor',
  // ... all required colors
};
```

Then run:
```
/cyberpunk-theme custom
```

## Example Usage

```
/cyberpunk-theme neon
/cyberpunk-theme noir
/cyberpunk-theme vapor
/cyberpunk-theme matrix
/cyberpunk-theme sunset
/cyberpunk-theme custom
```
