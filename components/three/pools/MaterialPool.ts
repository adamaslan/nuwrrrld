import * as THREE from 'three';

/**
 * Interface defining all pooled materials available for reuse.
 * These materials are created once and shared across all components.
 */
export interface IMaterialPool {
  // Building materials
  readonly buildingBase: THREE.MeshStandardMaterial;
  readonly buildingDark: THREE.MeshStandardMaterial;
  readonly buildingGrey: THREE.MeshStandardMaterial;

  // Window materials (by color)
  readonly windowCyan: THREE.MeshBasicMaterial;
  readonly windowMagenta: THREE.MeshBasicMaterial;
  readonly windowGreen: THREE.MeshBasicMaterial;
  readonly windowAmber: THREE.MeshBasicMaterial;

  // Ship hull materials
  readonly shipHullDark: THREE.MeshStandardMaterial;
  readonly shipHullNavy: THREE.MeshStandardMaterial;
  readonly shipHullPurple: THREE.MeshStandardMaterial;
  readonly shipHullGray: THREE.MeshStandardMaterial;

  // Ship engine materials
  readonly shipEngineOrange: THREE.MeshBasicMaterial;
  readonly shipEngineCyan: THREE.MeshBasicMaterial;
  readonly shipEngineGreen: THREE.MeshBasicMaterial;
  readonly shipEngineBlue: THREE.MeshBasicMaterial;

  // Environmental materials
  readonly groundPlane: THREE.MeshStandardMaterial;
  readonly neonSignBase: THREE.MeshBasicMaterial;
  readonly gridLineCyan: THREE.MeshBasicMaterial;
  readonly gridLineMagenta: THREE.MeshBasicMaterial;

  // Structure materials
  readonly structureDark: THREE.MeshStandardMaterial;
  readonly structurePurple: THREE.MeshStandardMaterial;
  readonly structureNavy: THREE.MeshStandardMaterial;

  // Emissive materials (replacing point lights)
  readonly emissiveCyan: THREE.MeshStandardMaterial;
  readonly emissiveMagenta: THREE.MeshStandardMaterial;
  readonly emissiveGreen: THREE.MeshStandardMaterial;
  readonly emissiveAmber: THREE.MeshStandardMaterial;
  readonly emissiveRed: THREE.MeshStandardMaterial;

  // Antenna and accent materials
  readonly antennaMetal: THREE.MeshStandardMaterial;
  readonly antennaLight: THREE.MeshBasicMaterial;

  // Transparent/volumetric materials
  readonly shaftCyan: THREE.MeshStandardMaterial;
  readonly shaftMagenta: THREE.MeshStandardMaterial;
}

/**
 * Creates a centralized pool of reusable materials.
 * Materials are configured with optimal settings for cyberpunk aesthetic.
 */
export function createMaterialPool(): IMaterialPool {
  return {
    // Building materials
    buildingBase: new THREE.MeshStandardMaterial({
      color: '#1a1a2e',
      metalness: 0.8,
      roughness: 0.2,
      emissive: '#0a0a12',
      emissiveIntensity: 0.2,
    }),
    buildingDark: new THREE.MeshStandardMaterial({
      color: '#0a0a12',
      metalness: 0.95,
      roughness: 0.15,
    }),
    buildingGrey: new THREE.MeshStandardMaterial({
      color: '#2a2a3e',
      metalness: 0.7,
      roughness: 0.3,
    }),

    // Window materials
    windowCyan: new THREE.MeshBasicMaterial({
      color: '#00ffff',
      transparent: true,
      opacity: 0.5,
      toneMapped: false,
    }),
    windowMagenta: new THREE.MeshBasicMaterial({
      color: '#ff00ff',
      transparent: true,
      opacity: 0.5,
      toneMapped: false,
    }),
    windowGreen: new THREE.MeshBasicMaterial({
      color: '#00ff88',
      transparent: true,
      opacity: 0.5,
      toneMapped: false,
    }),
    windowAmber: new THREE.MeshBasicMaterial({
      color: '#ffaa00',
      transparent: true,
      opacity: 0.5,
      toneMapped: false,
    }),

    // Ship hull materials
    shipHullDark: new THREE.MeshStandardMaterial({
      color: '#12121a',
      metalness: 0.92,
      roughness: 0.15,
    }),
    shipHullNavy: new THREE.MeshStandardMaterial({
      color: '#1a2a3a',
      metalness: 0.88,
      roughness: 0.18,
    }),
    shipHullPurple: new THREE.MeshStandardMaterial({
      color: '#2a1a3a',
      metalness: 0.90,
      roughness: 0.16,
    }),
    shipHullGray: new THREE.MeshStandardMaterial({
      color: '#1a1a28',
      metalness: 0.92,
      roughness: 0.12,
    }),

    // Ship engine materials
    shipEngineOrange: new THREE.MeshBasicMaterial({
      color: '#ff6600',
      transparent: true,
      opacity: 0.7,
      toneMapped: false,
    }),
    shipEngineCyan: new THREE.MeshBasicMaterial({
      color: '#00ccff',
      transparent: true,
      opacity: 0.6,
      toneMapped: false,
    }),
    shipEngineGreen: new THREE.MeshBasicMaterial({
      color: '#00ff88',
      transparent: true,
      opacity: 0.5,
      toneMapped: false,
    }),
    shipEngineBlue: new THREE.MeshBasicMaterial({
      color: '#00aaff',
      transparent: true,
      opacity: 0.6,
      toneMapped: false,
    }),

    // Environmental materials
    groundPlane: new THREE.MeshStandardMaterial({
      color: '#080810',
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.5,
    }),
    neonSignBase: new THREE.MeshBasicMaterial({
      color: '#ffffff',
      toneMapped: false,
    }),
    gridLineCyan: new THREE.MeshBasicMaterial({
      color: '#00ffff',
      transparent: true,
      opacity: 0.15,
    }),
    gridLineMagenta: new THREE.MeshBasicMaterial({
      color: '#ff00ff',
      transparent: true,
      opacity: 0.12,
    }),

    // Structure materials
    structureDark: new THREE.MeshStandardMaterial({
      color: '#1a1a2e',
      metalness: 0.85,
      roughness: 0.25,
      emissive: '#1a1a28',
      emissiveIntensity: 0.3,
    }),
    structurePurple: new THREE.MeshStandardMaterial({
      color: '#2a1a3a',
      metalness: 0.85,
      roughness: 0.25,
      emissive: '#1a1a28',
      emissiveIntensity: 0.3,
    }),
    structureNavy: new THREE.MeshStandardMaterial({
      color: '#1a2a3a',
      metalness: 0.85,
      roughness: 0.25,
      emissive: '#1a1a28',
      emissiveIntensity: 0.3,
    }),

    // Emissive materials (replacing point lights)
    emissiveCyan: new THREE.MeshStandardMaterial({
      color: '#00ffff',
      emissive: '#00ffff',
      emissiveIntensity: 0.8,
      toneMapped: false,
      transparent: true,
      opacity: 0.8,
    }),
    emissiveMagenta: new THREE.MeshStandardMaterial({
      color: '#ff00ff',
      emissive: '#ff00ff',
      emissiveIntensity: 0.8,
      toneMapped: false,
      transparent: true,
      opacity: 0.8,
    }),
    emissiveGreen: new THREE.MeshStandardMaterial({
      color: '#00ff88',
      emissive: '#00ff88',
      emissiveIntensity: 0.8,
      toneMapped: false,
      transparent: true,
      opacity: 0.8,
    }),
    emissiveAmber: new THREE.MeshStandardMaterial({
      color: '#ffaa00',
      emissive: '#ffaa00',
      emissiveIntensity: 0.8,
      toneMapped: false,
      transparent: true,
      opacity: 0.8,
    }),
    emissiveRed: new THREE.MeshStandardMaterial({
      color: '#ff0000',
      emissive: '#ff0000',
      emissiveIntensity: 0.8,
      toneMapped: false,
      transparent: true,
      opacity: 0.8,
    }),

    // Antenna and accent materials
    antennaMetal: new THREE.MeshStandardMaterial({
      color: '#1a1a28',
      metalness: 0.95,
      roughness: 0.2,
    }),
    antennaLight: new THREE.MeshBasicMaterial({
      color: '#ff0000',
    }),

    // Transparent/volumetric materials
    shaftCyan: new THREE.MeshStandardMaterial({
      color: '#00ffff',
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      emissive: '#00ffff',
      emissiveIntensity: 0.3,
    }),
    shaftMagenta: new THREE.MeshStandardMaterial({
      color: '#ff00ff',
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      emissive: '#ff00ff',
      emissiveIntensity: 0.3,
    }),
  };
}

/**
 * Disposes all materials in the pool.
 * Call this when unmounting the scene to free GPU memory.
 */
export function disposeMaterialPool(pool: IMaterialPool): void {
  Object.values(pool).forEach((material) => {
    if (material instanceof THREE.Material) {
      material.dispose();
    }
  });
}

/**
 * Helper to get window material by color name
 */
export function getWindowMaterial(
  pool: IMaterialPool,
  color: string
): THREE.MeshBasicMaterial {
  const colorMap: Record<string, keyof IMaterialPool> = {
    '#00ffff': 'windowCyan',
    '#ff00ff': 'windowMagenta',
    '#00ff88': 'windowGreen',
    '#ffaa00': 'windowAmber',
    cyan: 'windowCyan',
    magenta: 'windowMagenta',
    green: 'windowGreen',
    amber: 'windowAmber',
  };
  const key = colorMap[color.toLowerCase()] || 'windowCyan';
  return pool[key] as THREE.MeshBasicMaterial;
}

/**
 * Helper to get ship hull material by color
 */
export function getShipHullMaterial(
  pool: IMaterialPool,
  color: string
): THREE.MeshStandardMaterial {
  const lowerColor = color.toLowerCase();
  if (lowerColor.includes('navy') || lowerColor.includes('1a2a3a')) {
    return pool.shipHullNavy;
  }
  if (lowerColor.includes('purple') || lowerColor.includes('2a1a3a')) {
    return pool.shipHullPurple;
  }
  if (lowerColor.includes('gray') || lowerColor.includes('1a1a28')) {
    return pool.shipHullGray;
  }
  return pool.shipHullDark;
}
