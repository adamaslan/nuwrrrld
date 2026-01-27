import * as THREE from 'three';

/**
 * Material pool interface providing pre-configured materials for the cyberpunk aesthetic.
 * All materials are created once and shared across components for optimal performance.
 *
 * @example
 * ```tsx
 * const { materials } = usePools();
 * <mesh material={materials.windowCyan} />
 * ```
 */
export interface IMaterialPool {
  // Building materials (4 total for procedural variation)
  readonly buildingBase: THREE.MeshStandardMaterial;
  readonly buildingDark: THREE.MeshStandardMaterial;
  readonly buildingGrey: THREE.MeshStandardMaterial;
  readonly buildingNavy: THREE.MeshStandardMaterial;

  // Window materials (by color)
  readonly windowCyan: THREE.MeshBasicMaterial;
  readonly windowMagenta: THREE.MeshBasicMaterial;
  readonly windowGreen: THREE.MeshBasicMaterial;
  readonly windowAmber: THREE.MeshBasicMaterial;

  // Ship hull materials (12 total for procedural variation)
  readonly shipHullDark: THREE.MeshStandardMaterial;
  readonly shipHullNavy: THREE.MeshStandardMaterial;
  readonly shipHullPurple: THREE.MeshStandardMaterial;
  readonly shipHullGray: THREE.MeshStandardMaterial;
  readonly shipHullTeal: THREE.MeshStandardMaterial;
  readonly shipHullCrimson: THREE.MeshStandardMaterial;
  readonly shipHullGold: THREE.MeshStandardMaterial;
  readonly shipHullSlate: THREE.MeshStandardMaterial;
  readonly shipHullOlive: THREE.MeshStandardMaterial;
  readonly shipHullMaroon: THREE.MeshStandardMaterial;
  readonly shipHullSteel: THREE.MeshStandardMaterial;
  readonly shipHullCopper: THREE.MeshStandardMaterial;

  // Ship engine materials (8 total for procedural variation)
  readonly shipEngineOrange: THREE.MeshBasicMaterial;
  readonly shipEngineCyan: THREE.MeshBasicMaterial;
  readonly shipEngineGreen: THREE.MeshBasicMaterial;
  readonly shipEngineBlue: THREE.MeshBasicMaterial;
  readonly shipEngineMagenta: THREE.MeshBasicMaterial;
  readonly shipEngineYellow: THREE.MeshBasicMaterial;
  readonly shipEngineRed: THREE.MeshBasicMaterial;
  readonly shipEnginePurple: THREE.MeshBasicMaterial;

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

  // Back panel materials (TV Screen)
  readonly backPanelDarkMetal: THREE.MeshStandardMaterial;
  readonly backPanelVentGrille: THREE.MeshStandardMaterial;
  readonly backPanelPowerUnit: THREE.MeshStandardMaterial;
  readonly backPanelCoolingUnit: THREE.MeshStandardMaterial;
  readonly backPanelCable: THREE.MeshStandardMaterial;
  readonly backPanelBracket: THREE.MeshStandardMaterial;
  readonly backPanelWarningLabel: THREE.MeshBasicMaterial;
  readonly backPanelSerialPlate: THREE.MeshStandardMaterial;

  // TV Screen frame and mounting materials
  readonly screenBracketMetal: THREE.MeshStandardMaterial;
  readonly screenFrameIdle: THREE.MeshStandardMaterial;
  readonly screenFrameHover: THREE.MeshStandardMaterial;

  // Warning label colors
  readonly warningYellow: THREE.MeshBasicMaterial;
  readonly warningOrange: THREE.MeshBasicMaterial;
  readonly warningBlack: THREE.MeshBasicMaterial;

  // Serial plate elements
  readonly serialPlateText: THREE.MeshStandardMaterial;
  readonly serialPlateScrew: THREE.MeshStandardMaterial;

  // Side screen backgrounds (one per config)
  readonly sideScreenBgGreen: THREE.MeshStandardMaterial;
  readonly sideScreenBgCyan: THREE.MeshStandardMaterial;
  readonly sideScreenBgPurple: THREE.MeshStandardMaterial;
  readonly sideScreenBgAmber: THREE.MeshBasicMaterial;
}

/**
 * Creates a centralized pool of reusable materials.
 * Materials are configured with optimal settings for cyberpunk aesthetic.
 *
 * @returns Immutable pool of pre-configured materials
 * @see disposeMaterialPool
 *
 * @example
 * ```tsx
 * const materials = createMaterialPool();
 * // Use in components...
 * // On unmount:
 * disposeMaterialPool(materials);
 * ```
 */
export function createMaterialPool(): IMaterialPool {
  return {
    // Building materials (4 total for procedural variation)
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
    buildingNavy: new THREE.MeshStandardMaterial({
      color: '#1a2a3e',
      metalness: 0.85,
      roughness: 0.25,
      emissive: '#0a1a1e',
      emissiveIntensity: 0.15,
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

    // Ship hull materials (12 total for procedural variation)
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
    shipHullTeal: new THREE.MeshStandardMaterial({
      color: '#1a3a3a',
      metalness: 0.88,
      roughness: 0.17,
    }),
    shipHullCrimson: new THREE.MeshStandardMaterial({
      color: '#3a1a1a',
      metalness: 0.90,
      roughness: 0.14,
    }),
    shipHullGold: new THREE.MeshStandardMaterial({
      color: '#3a2a1a',
      metalness: 0.95,
      roughness: 0.10,
    }),
    shipHullSlate: new THREE.MeshStandardMaterial({
      color: '#22222a',
      metalness: 0.91,
      roughness: 0.16,
    }),
    shipHullOlive: new THREE.MeshStandardMaterial({
      color: '#2a2a1a',
      metalness: 0.87,
      roughness: 0.19,
    }),
    shipHullMaroon: new THREE.MeshStandardMaterial({
      color: '#2a1a22',
      metalness: 0.89,
      roughness: 0.15,
    }),
    shipHullSteel: new THREE.MeshStandardMaterial({
      color: '#1e1e2a',
      metalness: 0.93,
      roughness: 0.11,
    }),
    shipHullCopper: new THREE.MeshStandardMaterial({
      color: '#2a1e1a',
      metalness: 0.94,
      roughness: 0.13,
    }),

    // Ship engine materials (8 total for procedural variation)
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
    shipEngineMagenta: new THREE.MeshBasicMaterial({
      color: '#ff00ff',
      transparent: true,
      opacity: 0.65,
      toneMapped: false,
    }),
    shipEngineYellow: new THREE.MeshBasicMaterial({
      color: '#ffff00',
      transparent: true,
      opacity: 0.55,
      toneMapped: false,
    }),
    shipEngineRed: new THREE.MeshBasicMaterial({
      color: '#ff3300',
      transparent: true,
      opacity: 0.7,
      toneMapped: false,
    }),
    shipEnginePurple: new THREE.MeshBasicMaterial({
      color: '#aa00ff',
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

    // Back panel materials (TV Screen)
    backPanelDarkMetal: new THREE.MeshStandardMaterial({
      color: '#1a1a24',
      metalness: 0.85,
      roughness: 0.4,
    }),
    backPanelVentGrille: new THREE.MeshStandardMaterial({
      color: '#2a2a3a',
      metalness: 0.9,
      roughness: 0.3,
    }),
    backPanelPowerUnit: new THREE.MeshStandardMaterial({
      color: '#0a0a12',
      metalness: 0.8,
      roughness: 0.5,
    }),
    backPanelCoolingUnit: new THREE.MeshStandardMaterial({
      color: '#1e1e2a',
      metalness: 0.7,
      roughness: 0.6,
    }),
    backPanelCable: new THREE.MeshStandardMaterial({
      color: '#0a0a0e',
      metalness: 0.2,
      roughness: 0.8,
    }),
    backPanelBracket: new THREE.MeshStandardMaterial({
      color: '#2d2d3a',
      metalness: 0.95,
      roughness: 0.3,
    }),
    backPanelWarningLabel: new THREE.MeshBasicMaterial({
      color: '#ffcc00',
    }),
    backPanelSerialPlate: new THREE.MeshStandardMaterial({
      color: '#3a3a4a',
      metalness: 0.9,
      roughness: 0.2,
    }),

    // TV Screen frame and mounting materials
    screenBracketMetal: new THREE.MeshStandardMaterial({
      color: '#2a2a38',
      metalness: 0.95,
      roughness: 0.25,
    }),
    screenFrameIdle: new THREE.MeshStandardMaterial({
      color: '#1a1a28',
      metalness: 0.9,
      roughness: 0.2,
      emissive: '#0a0a12',
      emissiveIntensity: 0.1,
    }),
    screenFrameHover: new THREE.MeshStandardMaterial({
      color: '#2a2a38',
      metalness: 0.9,
      roughness: 0.2,
      emissive: '#00ffff',
      emissiveIntensity: 0.3,
    }),

    // Warning label colors
    warningYellow: new THREE.MeshBasicMaterial({
      color: '#ffcc00',
      toneMapped: false,
    }),
    warningOrange: new THREE.MeshBasicMaterial({
      color: '#ff6600',
      toneMapped: false,
    }),
    warningBlack: new THREE.MeshBasicMaterial({
      color: '#0a0a0a',
    }),

    // Serial plate elements
    serialPlateText: new THREE.MeshStandardMaterial({
      color: '#cccccc',
      metalness: 0.1,
      roughness: 0.9,
      emissive: '#ffffff',
      emissiveIntensity: 0.05,
    }),
    serialPlateScrew: new THREE.MeshStandardMaterial({
      color: '#1a1a1a',
      metalness: 0.95,
      roughness: 0.3,
    }),

    // Side screen backgrounds (one per config)
    sideScreenBgGreen: new THREE.MeshStandardMaterial({
      color: '#001a12',
      metalness: 0.85,
      roughness: 0.4,
      emissive: '#00ff88',
      emissiveIntensity: 0.05,
    }),
    sideScreenBgCyan: new THREE.MeshStandardMaterial({
      color: '#001a1a',
      metalness: 0.85,
      roughness: 0.4,
      emissive: '#00ffff',
      emissiveIntensity: 0.05,
    }),
    sideScreenBgPurple: new THREE.MeshStandardMaterial({
      color: '#1a001a',
      metalness: 0.85,
      roughness: 0.4,
      emissive: '#ff00ff',
      emissiveIntensity: 0.05,
    }),
    sideScreenBgAmber: new THREE.MeshBasicMaterial({
      color: '#1a1a00',
      transparent: true,
      opacity: 0.9,
    }),
  };
}

/**
 * Safely disposes all materials in a pool.
 * Call this on unmount to prevent memory leaks.
 *
 * @param pool - The material pool to dispose
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const pool = createMaterialPool();
 *   return () => disposeMaterialPool(pool);
 * }, []);
 * ```
 */
export function disposeMaterialPool(pool: IMaterialPool): void {
  Object.values(pool).forEach((material) => {
    if (material instanceof THREE.Material) {
      material.dispose();
    }
  });
}

/**
 * Maps window color to appropriate pooled material.
 *
 * @param pool - The material pool
 * @param color - Hex color string (#00ffff, #ff00ff, etc.) or color name (cyan, magenta)
 * @returns MeshBasicMaterial with matching color
 *
 * @example
 * ```tsx
 * const windowMat = getWindowMaterial(materials, '#00ffff');
 * <mesh material={windowMat} />
 * ```
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
 * Maps hull color to appropriate ship material.
 * Analyzes color hex to determine navy/purple/gray variant.
 *
 * @param pool - The material pool
 * @param color - Hex color string or color name
 * @returns MeshStandardMaterial for ship hull
 *
 * @example
 * ```tsx
 * const hullMat = getShipHullMaterial(materials, '#1a2a3a');
 * <mesh material={hullMat} />
 * ```
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

/**
 * Gets hull material by index for procedural ship generation.
 * Maps index 0-11 to one of 12 hull color variants.
 *
 * @param pool - The material pool
 * @param index - Hull color index (0-11)
 * @returns MeshStandardMaterial for ship hull
 *
 * @example
 * ```tsx
 * const hullMat = getHullMaterialByIndex(materials, 5);
 * <mesh material={hullMat} />
 * ```
 */
export function getHullMaterialByIndex(
  pool: IMaterialPool,
  index: number
): THREE.MeshStandardMaterial {
  const hullMaterials = [
    pool.shipHullDark,
    pool.shipHullNavy,
    pool.shipHullPurple,
    pool.shipHullGray,
    pool.shipHullTeal,
    pool.shipHullCrimson,
    pool.shipHullGold,
    pool.shipHullSlate,
    pool.shipHullOlive,
    pool.shipHullMaroon,
    pool.shipHullSteel,
    pool.shipHullCopper,
  ];
  return hullMaterials[index % 12];
}

/**
 * Gets engine material by index for procedural ship generation.
 * Maps index 0-7 to one of 8 engine glow color variants.
 *
 * @param pool - The material pool
 * @param index - Engine color index (0-7)
 * @returns MeshBasicMaterial for ship engine glow
 *
 * @example
 * ```tsx
 * const engineMat = getEngineMaterialByIndex(materials, 3);
 * <mesh material={engineMat} />
 * ```
 */
export function getEngineMaterialByIndex(
  pool: IMaterialPool,
  index: number
): THREE.MeshBasicMaterial {
  const engineMaterials = [
    pool.shipEngineOrange,
    pool.shipEngineCyan,
    pool.shipEngineGreen,
    pool.shipEngineBlue,
    pool.shipEngineMagenta,
    pool.shipEngineYellow,
    pool.shipEngineRed,
    pool.shipEnginePurple,
  ];
  return engineMaterials[index % 8];
}

/**
 * Gets building material by index for procedural building generation.
 * Maps index 0-3 to one of 4 building material variants.
 *
 * @param pool - The material pool
 * @param index - Building material index (0-3)
 * @returns MeshStandardMaterial for building structure
 *
 * @example
 * ```tsx
 * const buildingMat = getBuildingMaterialByIndex(materials, 2);
 * <mesh material={buildingMat} />
 * ```
 */
export function getBuildingMaterialByIndex(
  pool: IMaterialPool,
  index: number
): THREE.MeshStandardMaterial {
  const buildingMaterials = [
    pool.buildingBase,
    pool.buildingDark,
    pool.buildingGrey,
    pool.buildingNavy,
  ];
  return buildingMaterials[index % 4];
}
