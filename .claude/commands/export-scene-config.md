---
allowed-tools: Read, Write, Glob, Grep
argument-hint: [--format=json|yaml|ts] [--output=path]
description: Export the complete scene configuration to a portable format
---

# Export Scene Config

Export the complete NUWRRRLD scene configuration including screens, environment layers, camera settings, and lighting.

## Arguments
- `--format` - Output format: `json` (default), `yaml`, or `ts`
- `--output` - Output path (optional, default: `./exports/scene-config.{format}`)

## Steps

1. **Read all configuration sources**:
   - `config/mediaConfig.ts` - Screen configurations
   - `components/three/Scene.tsx` - Camera and canvas settings
   - `components/three/Lighting.tsx` - Light sources
   - `components/three/Environment.tsx` - Environment objects
   - `components/three/PostProcessing.tsx` - Effects settings

2. **Compile unified config object**
3. **Convert to specified format**
4. **Write to output file**
5. **Validate output**

## Config Schema

```typescript
interface SceneConfig {
  version: string;
  exportedAt: string;

  canvas: {
    dpr: [number, number];
    antialias: boolean;
    alpha: boolean;
    powerPreference: string;
  };

  camera: {
    fov: number;
    near: number;
    far: number;
    position: [number, number, number];
  };

  fog: {
    color: string;
    near: number;
    far: number;
  };

  screens: ScreenConfig[];

  lighting: {
    ambient: {
      color: string;
      intensity: number;
    };
    directional: Array<{
      color: string;
      intensity: number;
      position: [number, number, number];
      castShadow: boolean;
    }>;
    point: Array<{
      color: string;
      intensity: number;
      position: [number, number, number];
      distance: number;
      decay: number;
    }>;
  };

  environment: {
    skyDome: {
      type: 'gradient' | 'texture' | 'hdri';
      topColor?: string;
      bottomColor?: string;
      texturePath?: string;
    };
    layers: Array<{
      name: string;
      type: string;
      zRange: [number, number];
      objectCount: number;
      material: MaterialConfig;
    }>;
  };

  postProcessing: {
    enabled: boolean;
    effects: Array<{
      type: string;
      settings: Record<string, unknown>;
    }>;
  };

  controls: {
    type: 'orbit' | 'fly' | 'pointer';
    settings: Record<string, unknown>;
  };
}

interface ScreenConfig {
  id: number;
  type: 'image' | 'video';
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  baseSize: number;
  aspectRatio: number;
}

interface MaterialConfig {
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  opacity?: number;
  transparent?: boolean;
}
```

## Output Examples

### JSON Format
```json
{
  "version": "1.0.0",
  "exportedAt": "2025-01-05T12:00:00Z",
  "canvas": {
    "dpr": [1, 2],
    "antialias": true,
    "alpha": false,
    "powerPreference": "high-performance"
  },
  "camera": {
    "fov": 60,
    "near": 0.1,
    "far": 300,
    "position": [0, 5, 25]
  },
  "screens": [
    {
      "id": 1,
      "type": "image",
      "path": "/media/doves1.jpg",
      "position": [0, 28, -10],
      "rotation": [0.05, 0, 0],
      "baseSize": 26,
      "aspectRatio": 0.5625
    }
  ]
}
```

### YAML Format
```yaml
version: "1.0.0"
exportedAt: "2025-01-05T12:00:00Z"

canvas:
  dpr: [1, 2]
  antialias: true
  alpha: false
  powerPreference: high-performance

camera:
  fov: 60
  near: 0.1
  far: 300
  position: [0, 5, 25]

screens:
  - id: 1
    type: image
    path: /media/doves1.jpg
    position: [0, 28, -10]
    rotation: [0.05, 0, 0]
    baseSize: 26
    aspectRatio: 0.5625
```

### TypeScript Format
```typescript
import { SceneConfig } from '@/types/scene';

export const sceneConfig: SceneConfig = {
  version: '1.0.0',
  exportedAt: '2025-01-05T12:00:00Z',

  canvas: {
    dpr: [1, 2],
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  },

  camera: {
    fov: 60,
    near: 0.1,
    far: 300,
    position: [0, 5, 25],
  },

  screens: [
    {
      id: 1,
      type: 'image',
      path: '/media/doves1.jpg',
      position: [0, 28, -10],
      rotation: [0.05, 0, 0],
      baseSize: 26,
      aspectRatio: 0.5625,
    },
  ],
};
```

## Import/Restore

The exported config can be used to:
1. **Restore scene state** - Load config into a fresh scene
2. **Share configurations** - Send scene setup to collaborators
3. **Version control** - Track scene changes over time
4. **Multi-environment** - Different configs for dev/prod

```typescript
// Load config
import sceneConfig from './exports/scene-config.json';

// Apply to scene
function loadSceneFromConfig(config: SceneConfig) {
  // Apply camera settings
  // Load screens from config.screens
  // Configure lighting from config.lighting
  // Setup post-processing from config.postProcessing
}
```

## Example Usage

```
/export-scene-config
/export-scene-config --format=yaml
/export-scene-config --format=ts --output=./config/exported-scene.ts
/export-scene-config --format=json --output=./backups/scene-2025-01-05.json
```
