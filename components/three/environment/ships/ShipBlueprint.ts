import { seededRandom } from '../utils/seededRandom';
import type { ShipType, Vector3Tuple } from '@/types/three-scene';

/**
 * Blueprint element types for ship construction
 */
export type ElementType =
  | 'hull'
  | 'cockpit'
  | 'fin'
  | 'engine'
  | 'greeble'
  | 'antenna'
  | 'cargo'
  | 'wing';

/**
 * Individual ship component definition
 */
export interface ShipElement {
  readonly type: ElementType;
  readonly geometry: 'box' | 'cylinder' | 'sphere' | 'plane';
  readonly position: Vector3Tuple;
  readonly scale: Vector3Tuple;
  readonly rotation?: Vector3Tuple;
  readonly material:
    | 'hull'
    | 'hullDark'
    | 'engine'
    | 'emissiveCyan'
    | 'emissiveRed'
    | 'emissiveGreen'
    | 'emissiveOrange';
}

/**
 * Complete ship blueprint with all elements
 */
export interface ShipBlueprint {
  readonly type: ShipType;
  readonly hullColorIndex: number; // 0-11 (12 hull colors)
  readonly engineColorIndex: number; // 0-7 (8 engine colors)
  readonly elements: readonly ShipElement[];
}

/**
 * Blueprint configuration parameters per ship type
 */
interface BlueprintConfig {
  hullSections: [number, number]; // min/max hull sections
  finCount: [number, number]; // min/max fins
  engineCount: [number, number]; // min/max engines
  greebleCount: [number, number]; // min/max greebles
  antennaCount: [number, number]; // min/max antennas
  detailDensity: number; // 0-1, affects spawn chance
}

const BLUEPRINT_CONFIGS: Record<ShipType, BlueprintConfig> = {
  shuttle: {
    hullSections: [1, 2],
    finCount: [0, 2],
    engineCount: [1, 1],
    greebleCount: [2, 4],
    antennaCount: [0, 1],
    detailDensity: 0.6,
  },
  transport: {
    hullSections: [2, 3],
    finCount: [2, 2],
    engineCount: [1, 2],
    greebleCount: [4, 8],
    antennaCount: [1, 2],
    detailDensity: 0.7,
  },
  freighter: {
    hullSections: [3, 4],
    finCount: [0, 1],
    engineCount: [2, 4],
    greebleCount: [8, 12],
    antennaCount: [1, 3],
    detailDensity: 0.8,
  },
  dreadnought: {
    hullSections: [4, 6],
    finCount: [2, 4],
    engineCount: [4, 6],
    greebleCount: [12, 20],
    antennaCount: [2, 4],
    detailDensity: 0.9,
  },
};

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
 * Generate procedural ship blueprint from seed
 *
 * Creates unique ship silhouettes with varied hull sections, fins, engines,
 * greebles (small detail elements), and antennas based on ship type.
 *
 * @param type - Ship classification (shuttle, transport, freighter, dreadnought)
 * @param baseSize - Base dimensions [width, height, depth] from ShipConfig
 * @param variantSeed - Seed for procedural generation (same seed = same ship)
 * @returns Complete ship blueprint with all elements
 */
export function generateShipBlueprint(
  type: ShipType,
  baseSize: Vector3Tuple,
  variantSeed: number
): ShipBlueprint {
  const config = BLUEPRINT_CONFIGS[type];
  const [width, height, depth] = baseSize;
  const elements: ShipElement[] = [];

  let indexCounter = 0;

  // Hull color and engine color selection
  const hullColorIndex = randomInt(variantSeed, indexCounter++, 0, 11);
  const engineColorIndex = randomInt(variantSeed, indexCounter++, 0, 7);

  // Main hull sections (fore, mid, aft)
  const hullSections = randomInt(
    variantSeed,
    indexCounter++,
    config.hullSections[0],
    config.hullSections[1]
  );

  for (let i = 0; i < hullSections; i++) {
    const sectionWidth = width * (0.3 + seededRandom(variantSeed, indexCounter++) * 0.4);
    const sectionHeight = height * (0.6 + seededRandom(variantSeed, indexCounter++) * 0.4);
    const sectionDepth = depth * (0.7 + seededRandom(variantSeed, indexCounter++) * 0.3);
    const xOffset = (width / hullSections) * (i - hullSections / 2 + 0.5);

    elements.push({
      type: 'hull',
      geometry: 'box',
      position: [xOffset, 0, 0],
      scale: [sectionWidth, sectionHeight, sectionDepth],
      material: 'hull',
    });
  }

  // Cockpit/Bridge (if not shuttle)
  if (type !== 'shuttle') {
    const cockpitScale = seededRandom(variantSeed, indexCounter++) * 0.3 + 0.2;
    elements.push({
      type: 'cockpit',
      geometry: 'box',
      position: [width * 0.35, height * 0.3, 0],
      scale: [width * cockpitScale, height * 0.5, depth * 0.6],
      material: 'hullDark',
    });
  }

  // Fins/Wings
  const finCount = randomInt(variantSeed, indexCounter++, config.finCount[0], config.finCount[1]);

  for (let i = 0; i < finCount; i++) {
    const finSide = i % 2 === 0 ? 1 : -1;
    const finPos = seededRandom(variantSeed, indexCounter++) * 0.5 - 0.25;
    const finLength = seededRandom(variantSeed, indexCounter++) * 0.4 + 0.3;

    elements.push({
      type: 'fin',
      geometry: 'box',
      position: [finPos * width, 0, depth * 0.6 * finSide],
      scale: [width * finLength, height * 0.15, depth * 0.3],
      material: 'hull',
    });
  }

  // Engines
  const engineCount = randomInt(
    variantSeed,
    indexCounter++,
    config.engineCount[0],
    config.engineCount[1]
  );

  for (let i = 0; i < engineCount; i++) {
    const yPos = height * (seededRandom(variantSeed, indexCounter++) * 0.6 - 0.3);
    const zPos = depth * (seededRandom(variantSeed, indexCounter++) * 0.7 - 0.35);
    const engineSize = seededRandom(variantSeed, indexCounter++) * 0.3 + 0.2;

    elements.push({
      type: 'engine',
      geometry: 'cylinder',
      position: [-width * 0.5, yPos, zPos],
      scale: [engineSize, 0.5 + seededRandom(variantSeed, indexCounter++) * 0.5, engineSize],
      material: 'engine',
    });
  }

  // Greebles (small detail elements)
  const greebleCount = randomInt(
    variantSeed,
    indexCounter++,
    config.greebleCount[0],
    config.greebleCount[1]
  );

  for (let i = 0; i < greebleCount; i++) {
    if (seededRandom(variantSeed, indexCounter++) > config.detailDensity) continue;

    const greebleType = randomInt(variantSeed, indexCounter++, 0, 2);
    const xPos = randomFloat(variantSeed, indexCounter++, -width * 0.4, width * 0.4);
    const yPos = randomFloat(variantSeed, indexCounter++, -height * 0.4, height * 0.4);
    const zSide = randomInt(variantSeed, indexCounter++, 0, 1) === 0 ? 1 : -1;
    const zPos = depth * 0.5 * zSide;

    if (greebleType === 0) {
      // Box greeble
      elements.push({
        type: 'greeble',
        geometry: 'box',
        position: [xPos, yPos, zPos],
        scale: [0.1, 0.1, 0.05],
        material: 'hullDark',
      });
    } else if (greebleType === 1) {
      // Cylinder greeble (vent/thruster)
      elements.push({
        type: 'greeble',
        geometry: 'cylinder',
        position: [xPos, yPos, zPos],
        scale: [0.08, 0.15, 0.08],
        material: 'hullDark',
      });
    } else {
      // Sphere greeble (sensor dome)
      elements.push({
        type: 'greeble',
        geometry: 'sphere',
        position: [xPos, yPos, zPos],
        scale: 0.08,
        material: 'emissiveCyan',
      });
    }
  }

  // Antennas
  const antennaCount = randomInt(
    variantSeed,
    indexCounter++,
    config.antennaCount[0],
    config.antennaCount[1]
  );

  for (let i = 0; i < antennaCount; i++) {
    const xPos = randomFloat(variantSeed, indexCounter++, -width * 0.3, width * 0.3);
    const antennaHeight = randomFloat(variantSeed, indexCounter++, 0.4, 0.8);

    elements.push({
      type: 'antenna',
      geometry: 'cylinder',
      position: [xPos, height * 0.5, 0],
      scale: [0.02, antennaHeight, 0.02],
      material: 'hullDark',
    });

    // Antenna tip light
    elements.push({
      type: 'greeble',
      geometry: 'sphere',
      position: [xPos, height * 0.5 + antennaHeight / 2, 0],
      scale: 0.05,
      material: 'emissiveRed',
    });
  }

  // Cargo section (freighters only)
  if (type === 'freighter') {
    elements.push({
      type: 'cargo',
      geometry: 'box',
      position: [-width * 0.15, height * 0.1, 0],
      scale: [width * 0.5, height * 0.8, depth * 0.9],
      material: 'hullDark',
    });

    // Container lights
    elements.push({
      type: 'greeble',
      geometry: 'plane',
      position: [-width * 0.15, height * 0.5, depth * 0.46],
      scale: [width * 0.4, 0.1, 1],
      material: 'emissiveGreen',
    });
  }

  // Navigation lights (headlight + tail lights)
  elements.push({
    type: 'greeble',
    geometry: 'sphere',
    position: [width * 0.5, 0, 0],
    scale: type === 'freighter' ? 0.15 : type === 'transport' ? 0.12 : 0.08,
    material: 'emissiveCyan',
  });

  elements.push({
    type: 'greeble',
    geometry: 'box',
    position: [-width * 0.5, 0, depth * 0.3],
    scale: [0.05, height * 0.4, 0.15],
    material: 'emissiveRed',
  });

  elements.push({
    type: 'greeble',
    geometry: 'box',
    position: [-width * 0.5, 0, -depth * 0.3],
    scale: [0.05, height * 0.4, 0.15],
    material: 'emissiveRed',
  });

  return {
    type,
    hullColorIndex,
    engineColorIndex,
    elements,
  };
}
