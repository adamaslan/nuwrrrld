# TVScreen SideScreen Feature Guide

## Overview

This document details the design and implementation of a new **SideScreen** component that attaches to existing TV screens with highly customizable text, background colors, and optional background images.

---

## Design Goals

1. **Extensibility**: Easily add customizable panels to any TVScreen instance
2. **Reusability**: SideScreen component works with any screen configuration
3. **Consistency**: Visual design matches existing TVScreen aesthetic (dark metal, neon accents)
4. **Performance**: Uses pooled geometries/materials like the main screen
5. **Flexibility**: Text and background fully customizable via config

---

## User Interface Design

### Visual Appearance

```
TVScreen (main)          SideScreen (new)
┌──────────────────┐    ┌─────────┐
│                  │    │ Custom  │
│    Image/Video   │    │  Text   │
│    1920x1440     │    │  Panel  │
│                  │    │  Content│
│                  │    │         │
└──────────────────┘    └─────────┘
   Position: [0,y,z]    Position: [x,y,z]
```

### Color Scheme
- **Default Background**: Dark navy `#1a1a28` with 90% opacity
- **Frame Color**: Metallic grey `#2a2a3e` (matches screen frame)
- **Text Color**: White `#ffffff` or custom color
- **Glow**: Optional cyan/magenta matching main screen

---

## Configuration Interface

### 1. Update mediaConfig.ts

```typescript
// config/mediaConfig.ts

export type TextAlign = 'top' | 'center' | 'bottom';
export type PanelPosition = 'left' | 'right';

/**
 * Configuration for optional side panel attached to TVScreen.
 * Enables display of customizable text with background.
 */
export interface SidePanelConfig {
  // Feature flag
  readonly enabled: boolean;

  // Position
  readonly position: PanelPosition; // 'left' | 'right'
  readonly widthRatio: number; // 0.15 = 15% of main screen width

  // Text options
  readonly text: string; // Content to display
  readonly textColor: string; // hex color, e.g. '#ffffff'
  readonly textSize: number; // world units, e.g. 0.3
  readonly textAlign: TextAlign; // vertical alignment
  readonly fontFamily?: string; // optional custom font

  // Background options
  readonly backgroundColor: string; // hex color for solid background
  readonly backgroundOpacity: number; // 0-1, default 0.9
  readonly backgroundImagePath?: string; // optional image/texture path

  // Effects
  readonly glowEnabled: boolean; // glow effect on frame
  readonly glowColor?: string; // glow hex color
  readonly glowIntensity?: number; // glow brightness, 0-1
}

/**
 * Extend ScreenConfig to support optional side panels
 */
export interface ScreenConfig {
  id: number;
  type: MediaType;
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  baseSize: number;
  aspectRatio: number;
  sidePanel?: SidePanelConfig; // NEW: Optional side panel
}

/**
 * Default side panel configuration (disabled)
 */
export const DEFAULT_SIDE_PANEL: SidePanelConfig = {
  enabled: false,
  position: 'right',
  widthRatio: 0.15,
  text: '',
  textColor: '#ffffff',
  textSize: 0.3,
  textAlign: 'center',
  backgroundColor: '#1a1a28',
  backgroundOpacity: 0.9,
  glowEnabled: false,
};

/**
 * Example configurations for TVScreens with side panels
 */
export const SCREEN_CONFIGS: ScreenConfig[] = [
  {
    id: 1,
    type: 'image',
    path: '/media/doves1.jpg',
    position: [0, 28, -10],
    rotation: [0.05, 0, 0],
    baseSize: 26,
    aspectRatio: 900 / 1600,
    // No side panel on first screen
  },
  {
    id: 2,
    type: 'video',
    path: '/media/thresh-plan1-good.mov',
    position: [0, 0, -6],
    rotation: [0, 0, 0],
    baseSize: 22,
    aspectRatio: 1,
    sidePanel: {
      enabled: true,
      position: 'right',
      widthRatio: 0.15,
      text: 'LIVE FEED\n\nSystem Status: OK\nTemp: 52°C\nPower: 98%',
      textColor: '#00ffff',
      textSize: 0.25,
      textAlign: 'center',
      backgroundColor: '#1a1a28',
      backgroundOpacity: 0.9,
      glowEnabled: true,
      glowColor: '#00ffff',
      glowIntensity: 0.5,
    },
  },
  {
    id: 3,
    type: 'image',
    path: '/media/postmascaa1.jpg',
    position: [0, -28, -3],
    rotation: [-0.05, 0, 0],
    baseSize: 24,
    aspectRatio: 948 / 1188,
    sidePanel: {
      enabled: true,
      position: 'left',
      widthRatio: 0.2,
      text: 'PROJECT ALPHA\n\nProgress: 87%\nDeadline: Q2 2026',
      textColor: '#ff00ff',
      textSize: 0.28,
      textAlign: 'top',
      backgroundColor: '#2d1b4e',
      backgroundOpacity: 0.85,
      glowEnabled: true,
      glowColor: '#ff00ff',
      glowIntensity: 0.4,
    },
  },
];
```

---

## Component Implementation

### 2. Create SideScreen.tsx

```typescript
// components/three/SideScreen.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { SidePanelConfig } from '@/config/mediaConfig';

interface SideScreenProps {
  /**
   * Side panel configuration
   */
  config: SidePanelConfig;

  /**
   * Main screen dimensions (from parent TVScreen)
   */
  screenWidth: number;
  screenHeight: number;

  /**
   * Interactive state from parent TVScreen
   */
  isHovered: boolean;
  isTapped: boolean;

  /**
   * Optional pooled geometry/materials for optimization
   */
  geometryPool?: {
    plane: THREE.PlaneGeometry;
  };
  materialPool?: {
    sideFrameDark: THREE.MeshStandardMaterial;
    sidePanelBackground: THREE.MeshStandardMaterial;
  };
}

/**
 * SideScreen - Customizable text panel attached to TVScreen
 *
 * Features:
 * - Customizable text with color, size, alignment
 * - Background color or image
 * - Optional glow effect
 * - Responsive to parent hover/tap state
 * - Performance-optimized with material pooling
 */
export const SideScreen: React.FC<SideScreenProps> = ({
  config,
  screenWidth,
  screenHeight,
  isHovered,
  isTapped,
  geometryPool,
  materialPool,
}) => {
  // Calculate panel dimensions
  const panelWidth = screenWidth * config.widthRatio;
  const panelHeight = screenHeight;

  // Calculate position based on left/right
  const xOffset =
    config.position === 'right'
      ? (screenWidth + panelWidth) / 2 + 0.05
      : -(screenWidth + panelWidth) / 2 - 0.05;

  // Load background image if provided
  const bgTexture = useMemo(
    () =>
      config.backgroundImagePath
        ? useTexture(config.backgroundImagePath)
        : null,
    [config.backgroundImagePath]
  );

  // Create or use pooled plane geometry
  const planeGeometry = useMemo(
    () => geometryPool?.plane || new THREE.PlaneGeometry(1, 1),
    [geometryPool]
  );

  // Refs for animation
  const glowRef = useRef<THREE.Mesh>(null);

  // Animate glow effect
  useFrame((state) => {
    if (glowRef.current && config.glowEnabled) {
      const time = state.clock.elapsedTime;
      const pulse = Math.sin(time * 2) * 0.5 + 0.5;

      // Enhance glow when hovered
      const glowIntensity =
        (config.glowIntensity || 0.3) * (isHovered ? 1.5 : 1);

      if (glowRef.current.material instanceof THREE.MeshBasicMaterial) {
        glowRef.current.material.opacity =
          glowIntensity * pulse * 0.5;
      }
    }
  });

  return (
    <group position={[xOffset, 0, 0]}>
      {/* Background panel mesh with optional image/color */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[panelWidth, panelHeight]} />
        {bgTexture ? (
          // Image background
          <meshBasicMaterial
            map={bgTexture}
            transparent
            opacity={config.backgroundOpacity}
          />
        ) : (
          // Solid color background
          <meshStandardMaterial
            color={config.backgroundColor}
            transparent
            opacity={config.backgroundOpacity}
            metalness={0.8}
            roughness={0.3}
            emissive="#0a0a12"
            emissiveIntensity={0.1}
          />
        )}
      </mesh>

      {/* Frame border - metal accent */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[panelWidth + 0.05, panelHeight + 0.05]} />
        <meshStandardMaterial
          color={isHovered ? '#3a3a4e' : '#2a2a3e'}
          metalness={0.9}
          roughness={0.3}
          emissive={isHovered ? '#1a1a2e' : '#0a0a12'}
          emissiveIntensity={isHovered ? 0.3 : 0.1}
        />
      </mesh>

      {/* Text content - uses @react-three/drei Text */}
      {config.text && (
        <SideScreenText
          text={config.text}
          color={config.textColor}
          fontSize={config.textSize}
          align={config.textAlign}
          panelWidth={panelWidth}
          panelHeight={panelHeight}
          fontFamily={config.fontFamily}
        />
      )}

      {/* Glow effect behind panel */}
      {config.glowEnabled && (
        <mesh ref={glowRef} position={[0, 0, -0.05]}>
          <planeGeometry args={[panelWidth * 1.15, panelHeight * 1.15]} />
          <meshBasicMaterial
            color={config.glowColor || config.textColor}
            transparent
            opacity={(config.glowIntensity || 0.3) * (isHovered ? 1.5 : 1)}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
};

interface SideScreenTextProps {
  text: string;
  color: string;
  fontSize: number;
  align: 'top' | 'center' | 'bottom';
  panelWidth: number;
  panelHeight: number;
  fontFamily?: string;
}

/**
 * SideScreenText - Renders customizable text using @react-three/drei Text
 * Already imported in TVScreen.tsx line 5
 */
const SideScreenText: React.FC<SideScreenTextProps> = ({
  text,
  color,
  fontSize,
  align,
  panelWidth,
  panelHeight,
  fontFamily,
}) => {
  // Calculate Y position based on alignment
  const yPosition =
    align === 'top'
      ? panelHeight * 0.35
      : align === 'bottom'
        ? -panelHeight * 0.35
        : 0;

  return (
    <Text
      position={[0, yPosition, 0.02]}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY={align === 'center' ? 'middle' : align === 'top' ? 'top' : 'bottom'}
      maxWidth={panelWidth * 0.9}
      lineHeight={1.3}
      textAlign="center"
      font={fontFamily || '/fonts/inter-bold.woff'} // Uses default or custom font
      outlineWidth={0.002}
      outlineColor="#000000"
    >
      {text}
    </Text>
  );
};

export default SideScreen;
```

---

## Integration with TVScreen

### 3. Update TVScreen.tsx

```typescript
// components/three/TVScreen.tsx
import { SideScreen } from './SideScreen';

interface TVScreenProps {
  config: ScreenConfig;
  // ... other existing props
}

export default function TVScreen({ config }: TVScreenProps) {
  // ... existing code ...

  const screenWidth = baseSize * config.aspectRatio;
  const screenHeight = baseSize;

  return (
    <group ref={groupRef} position={config.position} rotation={config.rotation}>
      {/* Main TVScreen content */}
      <group position={[0, 0, 0]}>
        {/* Screen surface with image/video */}
        {/* ... existing screen elements ... */}
      </group>

      {/* Back panel with industrial details */}
      <BackPanel
        frameWidth={frameWidth}
        frameHeight={frameHeight}
        isHovered={isHovered}
        isTapped={isTapped}
      />

      {/* NEW: Optional SideScreen panel */}
      {config.sidePanel?.enabled && (
        <SideScreen
          config={config.sidePanel}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          isHovered={isHovered}
          isTapped={isTapped}
          // Pass pooled resources if available
          geometryPool={geometryPool}
          materialPool={materialPool}
        />
      )}

      {/* Lighting and effects */}
      {/* ... existing lighting and effects ... */}
    </group>
  );
}
```

---

## Usage Examples

### Example 1: Data Display Panel
```typescript
{
  id: 2,
  type: 'video',
  path: '/media/thresh-plan1-good.mov',
  position: [0, 0, -6],
  rotation: [0, 0, 0],
  baseSize: 22,
  aspectRatio: 1,
  sidePanel: {
    enabled: true,
    position: 'right',
    widthRatio: 0.2,
    text: 'SYSTEM STATUS\n\nCPU: 45%\nMem: 8.2GB\nTemp: 62°C\nUptime: 247d',
    textColor: '#00ff00',
    textSize: 0.25,
    textAlign: 'top',
    backgroundColor: '#0a1a0a',
    backgroundOpacity: 0.95,
    glowEnabled: true,
    glowColor: '#00ff00',
    glowIntensity: 0.6,
  }
}
```

### Example 2: Project Info Panel with Background Image
```typescript
{
  id: 1,
  type: 'image',
  path: '/media/project-hero.jpg',
  position: [0, 20, -8],
  rotation: [0, 0, 0],
  baseSize: 25,
  aspectRatio: 16/9,
  sidePanel: {
    enabled: true,
    position: 'left',
    widthRatio: 0.25,
    text: 'PROJECT\nDETAILS',
    textColor: '#ffffff',
    textSize: 0.35,
    textAlign: 'center',
    backgroundColor: '#1a1a28',
    backgroundOpacity: 0.8,
    backgroundImagePath: '/media/panel-bg.jpg',
    glowEnabled: false,
  }
}
```

### Example 3: Minimal Text Panel
```typescript
{
  id: 3,
  type: 'image',
  path: '/media/scene.jpg',
  position: [0, -25, -5],
  rotation: [0, 0, 0],
  baseSize: 24,
  aspectRatio: 1,
  sidePanel: {
    enabled: true,
    position: 'right',
    widthRatio: 0.12,
    text: 'LIVE',
    textColor: '#ff0000',
    textSize: 0.4,
    textAlign: 'center',
    backgroundColor: '#2a0a0a',
    backgroundOpacity: 0.7,
    glowEnabled: true,
    glowColor: '#ff0000',
    glowIntensity: 0.5,
  }
}
```

---

## Customization Guide

### Text Options

| Option | Type | Default | Notes |
|--------|------|---------|-------|
| `text` | string | '' | Supports newlines `\n` for multi-line |
| `textColor` | hex | '#ffffff' | Any valid hex color |
| `textSize` | number | 0.3 | In world units, scale relative to screen |
| `textAlign` | enum | 'center' | 'top' \| 'center' \| 'bottom' |
| `fontFamily` | string | '/fonts/inter-bold.woff' | Path to custom font file |

### Background Options

| Option | Type | Default | Notes |
|--------|------|---------|-------|
| `backgroundColor` | hex | '#1a1a28' | Solid color background |
| `backgroundOpacity` | 0-1 | 0.9 | Transparency (0 = invisible) |
| `backgroundImagePath` | string | undefined | Optional image texture |

### Effects Options

| Option | Type | Default | Notes |
|--------|------|---------|-------|
| `glowEnabled` | bool | false | Enable/disable glow |
| `glowColor` | hex | config.textColor | Glow color (defaults to text color) |
| `glowIntensity` | 0-1 | 0.3 | Glow brightness, intensifies on hover |

### Position Options

| Option | Type | Default | Notes |
|--------|------|---------|-------|
| `position` | enum | 'right' | 'left' \| 'right' |
| `widthRatio` | decimal | 0.15 | Panel width as % of main screen |

---

## Performance Considerations

### Memory Usage
- **Geometry**: Reuses pooled plane geometry (~10 KB)
- **Materials**: 2-3 materials per panel (~50 KB)
- **Text**: Cached by drei (~20 KB per unique text)
- **Texture**: Optional background image (~1-5 MB depending on resolution)

### Optimization Tips
1. **Share geometries** via `geometryPool` prop
2. **Reuse materials** for multiple panels with same colors
3. **Limit text changes** - recreate Text component only on config change
4. **Use CSS-rendered text** for frequently updated numbers (future improvement)
5. **Compress background images** to <500 KB each

---

## Animation Examples

### Pulsing Glow on Data Changes
```typescript
// In SideScreen, hook into parent state
useEffect(() => {
  if (dataChanged) {
    // Trigger glow pulse
    // Existing glowRef animation already pulsates on isHovered
  }
}, [dataChanged]);
```

### Text Fade In/Out
```typescript
// Add opacity animation to Text component
<Text
  position={[0, yPos, 0.02]}
  // ... other props ...
  opacity={isHovered ? 1 : 0.7}
/>
```

### Dynamic Text Updates
```typescript
// Replace text based on real-time data
sidePanel: {
  ...DEFAULT_SIDE_PANEL,
  text: `Live Data\n\nValue: ${realTimeValue}\nUpdate: ${timestamp}`,
  enabled: true,
}
```

---

## Testing Checklist

- [ ] Panel renders at correct position (left/right)
- [ ] Panel width scales correctly with `widthRatio`
- [ ] Text displays with correct color and size
- [ ] Text alignment works (top/center/bottom)
- [ ] Background color renders correctly
- [ ] Background image loads and displays
- [ ] Glow effect works and pulses
- [ ] Glow intensifies on hover
- [ ] Performance monitor shows minimal overhead
- [ ] Multi-line text wraps correctly
- [ ] Custom fonts load properly
- [ ] No visual artifacts or Z-fighting with main screen

---

## Future Enhancements

1. **CSS Overlay**: Render real-time data via CSS/DOM layer
2. **Analytics Dashboard**: Built-in charts/metrics visualization
3. **Live Update Hooks**: Subscribe to data streams for automatic text updates
4. **Animation Presets**: Fade, slide, pulse animations
5. **Multi-Column Layout**: Support 2-3 columns within side panel
6. **Interactive Elements**: Clickable buttons/controls on panel
