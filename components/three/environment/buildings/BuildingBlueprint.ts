import { seededRandom } from '../utils/seededRandom';
import type { Vector3Tuple, WindowColor } from '@/types/three-scene';

/**
 * Blueprint element types for building construction
 */
export type BuildingElementType =
  | 'tier'
  | 'window'
  | 'antenna'
  | 'waterTower'
  | 'satelliteDish'
  | 'ventGrille'
  | 'neonStripe'
  | 'pipeCluster'
  | 'doorway'
  | 'awning';

/**
 * Window pattern types
 */
export type WindowPattern = 'grid' | 'staggered' | 'random-sparse';

/**
 * Individual building component definition
 */
export interface BuildingElement {
  readonly type: BuildingElementType;
  readonly geometry: 'box' | 'cylinder' | 'sphere' | 'plane';
  readonly position: Vector3Tuple;
  readonly scale: Vector3Tuple;
  readonly rotation?: Vector3Tuple;
  readonly material:
    | 'building'
    | 'buildingDark'
    | 'buildingGrey'
    | 'window'
    | 'antennaMetal'
    | 'antennaLight'
    | 'emissiveCyan'
    | 'emissiveMagenta'
    | 'emissiveGreen'
    | 'emissiveAmber';
}

/**
 * Building tier definition for stepped profiles
 */
export interface BuildingTier {
  readonly yOffset: number;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
}

/**
 * Complete building blueprint with all elements
 */
export interface BuildingBlueprint {
  readonly buildingMaterialIndex: number; // 0-3 (4 building materials)
  readonly windowPattern: WindowPattern;
  readonly tiers: readonly BuildingTier[];
  readonly elements: readonly BuildingElement[];
}

/**
 * Generate a random integer in range [min, max] using seeded random
 */
function randomInt(seed: number, index: number, min: number, max: number): number {
  return Math.floor(min + seededRandom(seed, index) * (max - min + 1));
}

/**
 * Generate a random float in range [min, max] using seeded random
 */
function randomFloat(seed: number, index: number, min: number, max: number): number {
  return min + seededRandom(seed, index) * (max - min);
}

/**
 * Generate procedural building blueprint from seed
 *
 * Creates unique building profiles with tiered setbacks, varied rooftops,
 * window patterns, and architectural details.
 *
 * @param baseSize - Base dimensions [width, height, depth] from BuildingConfig
 * @param windowColor - Window color for emissive windows
 * @param hasAntenna - Whether to include antenna on top
 * @param variantSeed - Seed for procedural generation (same seed = same building)
 * @returns Complete building blueprint with all elements
 */
export function generateBuildingBlueprint(
  baseSize: Vector3Tuple,
  windowColor: WindowColor,
  hasAntenna: boolean,
  variantSeed: number
): BuildingBlueprint {
  const [width, height, depth] = baseSize;
  const elements: BuildingElement[] = [];
  const tiers: BuildingTier[] = [];

  let indexCounter = 0;

  // Building material selection (0-3)
  const buildingMaterialIndex = randomInt(variantSeed, indexCounter++, 0, 3);

  // Window pattern selection
  const windowPatternValue = randomInt(variantSeed, indexCounter++, 0, 2);
  const windowPattern: WindowPattern =
    windowPatternValue === 0 ? 'grid' : windowPatternValue === 1 ? 'staggered' : 'random-sparse';

  // Generate tiered profile (2-4 tiers)
  const tierCount = randomInt(variantSeed, indexCounter++, 2, 4);
  let currentY = 0;
  let currentWidth = width;
  let currentDepth = depth;

  for (let i = 0; i < tierCount; i++) {
    const tierHeight = height / tierCount;
    const widthReduction = i > 0 ? seededRandom(variantSeed, indexCounter++) * 0.2 + 0.05 : 0;
    const depthReduction = i > 0 ? seededRandom(variantSeed, indexCounter++) * 0.2 + 0.05 : 0;

    currentWidth *= 1 - widthReduction;
    currentDepth *= 1 - depthReduction;

    tiers.push({
      yOffset: currentY + tierHeight / 2,
      width: currentWidth,
      height: tierHeight,
      depth: currentDepth,
    });

    // Add main tier structure
    elements.push({
      type: 'tier',
      geometry: 'box',
      position: [0, currentY + tierHeight / 2, 0],
      scale: [currentWidth, tierHeight, currentDepth],
      material: 'building',
    });

    // Add windows based on pattern
    addWindowsToTier(
      elements,
      windowPattern,
      currentWidth,
      tierHeight,
      currentDepth,
      currentY,
      windowColor,
      variantSeed,
      indexCounter
    );
    indexCounter += 50; // Reserve indices for windows

    currentY += tierHeight;
  }

  // Rooftop elements
  const topTier = tiers[tiers.length - 1];
  const roofY = currentY;

  // Antennas (1-3)
  if (hasAntenna) {
    const antennaCount = randomInt(variantSeed, indexCounter++, 1, 3);

    for (let i = 0; i < antennaCount; i++) {
      const xPos = randomFloat(variantSeed, indexCounter++, -topTier.width * 0.3, topTier.width * 0.3);
      const zPos = randomFloat(variantSeed, indexCounter++, -topTier.depth * 0.3, topTier.depth * 0.3);
      const antennaHeight = randomFloat(variantSeed, indexCounter++, 1.5, 3.0);

      // Antenna pole
      elements.push({
        type: 'antenna',
        geometry: 'cylinder',
        position: [xPos, roofY + antennaHeight / 2, zPos],
        scale: [0.05, antennaHeight, 0.05],
        material: 'antennaMetal',
      });

      // Antenna light
      elements.push({
        type: 'antenna',
        geometry: 'sphere',
        position: [xPos, roofY + antennaHeight, zPos],
        scale: [0.15, 0.15, 0.15],
        material: 'antennaLight',
      });
    }
  }

  // Water tower (40% chance)
  if (seededRandom(variantSeed, indexCounter++) > 0.6) {
    const xPos = randomFloat(variantSeed, indexCounter++, -topTier.width * 0.25, topTier.width * 0.25);
    const zPos = randomFloat(variantSeed, indexCounter++, -topTier.depth * 0.25, topTier.depth * 0.25);

    elements.push({
      type: 'waterTower',
      geometry: 'cylinder',
      position: [xPos, roofY + 0.8, zPos],
      scale: [0.6, 1.6, 0.6],
      material: 'buildingDark',
    });
  }

  // Satellite dish (30% chance)
  if (seededRandom(variantSeed, indexCounter++) > 0.7) {
    const xPos = randomFloat(variantSeed, indexCounter++, -topTier.width * 0.3, topTier.width * 0.3);
    const zPos = randomFloat(variantSeed, indexCounter++, -topTier.depth * 0.3, topTier.depth * 0.3);

    // Dish (represented as flattened sphere)
    elements.push({
      type: 'satelliteDish',
      geometry: 'sphere',
      position: [xPos, roofY + 0.5, zPos],
      scale: [0.8, 0.2, 0.8],
      rotation: [Math.PI / 4, 0, 0],
      material: 'buildingDark',
    });
  }

  // Side panel details (vent grilles, neon stripes, pipes)
  for (let tierIdx = 0; tierIdx < tiers.length; tierIdx++) {
    const tier = tiers[tierIdx];
    const detailCount = randomInt(variantSeed, indexCounter++, 2, 5);

    for (let i = 0; i < detailCount; i++) {
      const detailType = randomInt(variantSeed, indexCounter++, 0, 2);
      const side = randomInt(variantSeed, indexCounter++, 0, 1); // 0=front, 1=back
      const zPos = side === 0 ? tier.depth / 2 + 0.02 : -tier.depth / 2 - 0.02;
      const xPos = randomFloat(variantSeed, indexCounter++, -tier.width * 0.4, tier.width * 0.4);
      const yPos = tier.yOffset + randomFloat(variantSeed, indexCounter++, -tier.height * 0.3, tier.height * 0.3);

      if (detailType === 0) {
        // Vent grille
        elements.push({
          type: 'ventGrille',
          geometry: 'box',
          position: [xPos, yPos, zPos],
          scale: [0.4, 0.3, 0.05],
          material: 'buildingDark',
        });
      } else if (detailType === 1) {
        // Neon stripe
        elements.push({
          type: 'neonStripe',
          geometry: 'box',
          position: [xPos, yPos, zPos],
          scale: [0.1, 0.5, 0.02],
          material: 'emissiveCyan',
        });
      } else {
        // Pipe cluster
        elements.push({
          type: 'pipeCluster',
          geometry: 'cylinder',
          position: [xPos, yPos, zPos],
          scale: [0.08, 0.6, 0.08],
          material: 'buildingDark',
        });
      }
    }
  }

  // Ground level doorway (on bottom tier)
  const bottomTier = tiers[0];
  elements.push({
    type: 'doorway',
    geometry: 'box',
    position: [0, bottomTier.yOffset - bottomTier.height * 0.3, bottomTier.depth / 2 + 0.01],
    scale: [0.8, 1.2, 0.05],
    material: 'buildingDark',
  });

  // Awning above doorway (50% chance)
  if (seededRandom(variantSeed, indexCounter++) > 0.5) {
    elements.push({
      type: 'awning',
      geometry: 'box',
      position: [0, bottomTier.yOffset + bottomTier.height * 0.1, bottomTier.depth / 2 + 0.2],
      scale: [1.2, 0.05, 0.4],
      material: 'buildingDark',
    });
  }

  return {
    buildingMaterialIndex,
    windowPattern,
    tiers,
    elements,
  };
}

/**
 * Add windows to a building tier based on pattern
 */
function addWindowsToTier(
  elements: BuildingElement[],
  pattern: WindowPattern,
  tierWidth: number,
  tierHeight: number,
  tierDepth: number,
  tierY: number,
  windowColor: WindowColor,
  seed: number,
  startIndex: number
): void {
  const windowMaterial = getWindowMaterial(windowColor);
  let indexCounter = startIndex;

  if (pattern === 'grid') {
    // Regular grid pattern
    const cols = Math.floor(tierWidth / 0.6) + 1;
    const rows = Math.floor(tierHeight / 0.8) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const xPos = (col / cols - 0.5) * tierWidth * 0.8;
        const yPos = tierY + (row / rows - 0.5) * tierHeight * 0.8;

        // Front face windows
        elements.push({
          type: 'window',
          geometry: 'plane',
          position: [xPos, yPos, tierDepth / 2 + 0.01],
          scale: [0.4, 0.6, 1],
          material: windowMaterial,
        });

        // Back face windows
        elements.push({
          type: 'window',
          geometry: 'plane',
          position: [xPos, yPos, -tierDepth / 2 - 0.01],
          scale: [0.4, 0.6, 1],
          material: windowMaterial,
        });
      }
    }
  } else if (pattern === 'staggered') {
    // Staggered pattern
    const cols = Math.floor(tierWidth / 0.6) + 1;
    const rows = Math.floor(tierHeight / 0.8) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const offset = row % 2 === 0 ? 0.3 : 0;
        const xPos = (col / cols - 0.5) * tierWidth * 0.8 + offset;
        const yPos = tierY + (row / rows - 0.5) * tierHeight * 0.8;

        elements.push({
          type: 'window',
          geometry: 'plane',
          position: [xPos, yPos, tierDepth / 2 + 0.01],
          scale: [0.4, 0.6, 1],
          material: windowMaterial,
        });

        elements.push({
          type: 'window',
          geometry: 'plane',
          position: [xPos, yPos, -tierDepth / 2 - 0.01],
          scale: [0.4, 0.6, 1],
          material: windowMaterial,
        });
      }
    }
  } else {
    // Random sparse pattern
    const windowCount = Math.floor((tierWidth * tierHeight) / 2);

    for (let i = 0; i < windowCount; i++) {
      if (seededRandom(seed, indexCounter++) > 0.5) {
        const xPos = randomFloat(seed, indexCounter++, -tierWidth * 0.4, tierWidth * 0.4);
        const yPos = tierY + randomFloat(seed, indexCounter++, -tierHeight * 0.4, tierHeight * 0.4);

        elements.push({
          type: 'window',
          geometry: 'plane',
          position: [xPos, yPos, tierDepth / 2 + 0.01],
          scale: [0.4, 0.6, 1],
          material: windowMaterial,
        });

        elements.push({
          type: 'window',
          geometry: 'plane',
          position: [xPos, yPos, -tierDepth / 2 - 0.01],
          scale: [0.4, 0.6, 1],
          material: windowMaterial,
        });
      }
    }
  }
}

/**
 * Map window color to material name
 */
function getWindowMaterial(color: WindowColor): 'emissiveCyan' | 'emissiveMagenta' | 'emissiveGreen' | 'emissiveAmber' {
  switch (color) {
    case '#00ffff':
      return 'emissiveCyan';
    case '#ff00ff':
      return 'emissiveMagenta';
    case '#00ff88':
      return 'emissiveGreen';
    case '#ffaa00':
      return 'emissiveAmber';
    default:
      return 'emissiveCyan';
  }
}
