import { seededRandom } from './environment/utils/seededRandom';
import type { Vector3Tuple } from '@/types/three-scene';

/**
 * Blueprint element types for TV screen back panel construction
 */
export type BackPanelElementType =
  | 'ventGrille'
  | 'powerUnit'
  | 'cableConduit'
  | 'coolingUnit'
  | 'bracket'
  | 'warningLabel'
  | 'serialPlate'
  | 'led'
  | 'fan';

/**
 * Individual back panel component definition
 */
export interface BackPanelElement {
  readonly type: BackPanelElementType;
  readonly geometry: 'box' | 'cylinder' | 'plane' | 'circle' | 'torus';
  readonly position: Vector3Tuple;
  readonly scale: Vector3Tuple | number;
  readonly rotation?: Vector3Tuple;
  readonly material:
    | 'darkMetal'
    | 'ventGrille'
    | 'powerUnit'
    | 'coolingUnit'
    | 'bracket'
    | 'cable'
    | 'serialPlate'
    | 'ledGreen'
    | 'ledYellow'
    | 'ledRed'
    | 'warningYellow'
    | 'warningOrange';
  readonly isAnimated?: boolean; // true for LEDs and fans
}

/**
 * Complete back panel blueprint with all elements
 */
export interface BackPanelBlueprint {
  readonly variantSeed: number;
  readonly elements: readonly BackPanelElement[];
  readonly layout: BackPanelLayout;
}

/**
 * Layout configuration for procedural back panel
 */
export interface BackPanelLayout {
  readonly ventGrilleCount: number; // 1-2 grilles
  readonly ledCount: number; // 3-5 LEDs
  readonly coolingUnitStyle: 'fan' | 'heatsink' | 'both'; // cooling type
  readonly hasPowerConnector: boolean;
  readonly hasSerialPlate: boolean;
  readonly warningLabelStyle: 'highVoltage' | 'caution' | 'both';
  readonly cableRouting: 'horizontal' | 'vertical' | 'both';
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
 * Generate procedural back panel blueprint from seed
 *
 * Creates unique industrial back panel configurations with varied:
 * - Ventilation grille positions and patterns
 * - Power supply unit layouts
 * - Cable routing patterns
 * - Cooling system configurations
 * - Warning label placements
 * - LED indicator arrangements
 *
 * @param screenWidth - Width of the screen in world units
 * @param screenHeight - Height of the screen in world units
 * @param variantSeed - Seed for procedural generation (same seed = same panel)
 * @returns Complete back panel blueprint with all elements
 */
export function generateBackPanelBlueprint(
  screenWidth: number,
  screenHeight: number,
  variantSeed: number
): BackPanelBlueprint {
  const elements: BackPanelElement[] = [];
  let indexCounter = 0;

  // Layout configuration
  const ventGrilleCount = randomInt(variantSeed, indexCounter++, 1, 2);
  const ledCount = randomInt(variantSeed, indexCounter++, 3, 5);
  const coolingStyles = ['fan', 'heatsink', 'both'] as const;
  const coolingUnitStyle = coolingStyles[randomInt(variantSeed, indexCounter++, 0, 2)];
  const hasPowerConnector = seededRandom(variantSeed, indexCounter++) > 0.3;
  const hasSerialPlate = seededRandom(variantSeed, indexCounter++) > 0.2;
  const warningStyles = ['highVoltage', 'caution', 'both'] as const;
  const warningLabelStyle = warningStyles[randomInt(variantSeed, indexCounter++, 0, 2)];
  const cableRoutingTypes = ['horizontal', 'vertical', 'both'] as const;
  const cableRouting = cableRoutingTypes[randomInt(variantSeed, indexCounter++, 0, 2)];

  const layout: BackPanelLayout = {
    ventGrilleCount,
    ledCount,
    coolingUnitStyle,
    hasPowerConnector,
    hasSerialPlate,
    warningLabelStyle,
    cableRouting,
  };

  // VENTILATION GRILLES (1-2)
  const grilleWidth = screenWidth * 0.2;
  const grilleHeight = screenHeight * 0.15;
  const grilleDepth = 0.08;

  if (ventGrilleCount === 1) {
    // Single centered grille
    const xPos = randomFloat(variantSeed, indexCounter++, -screenWidth * 0.2, screenWidth * 0.2);
    elements.push({
      type: 'ventGrille',
      geometry: 'box',
      position: [xPos, screenHeight * 0.35, grilleDepth],
      scale: [grilleWidth + 0.1, grilleHeight + 0.1, 0.03],
      material: 'ventGrille',
    });

    // Grille bars
    for (let i = 0; i < 4; i++) {
      const barY = -grilleHeight / 2 + (grilleHeight / 4) * i + grilleHeight / 8;
      elements.push({
        type: 'ventGrille',
        geometry: 'box',
        position: [xPos, screenHeight * 0.35 + barY, grilleDepth + 0.04],
        scale: [grilleWidth * 0.9, 0.025, 0.02],
        material: 'darkMetal',
      });
    }
  } else {
    // Two grilles (left and right)
    const leftX = -screenWidth * 0.3;
    const rightX = screenWidth * 0.3;

    [leftX, rightX].forEach((xPos) => {
      elements.push({
        type: 'ventGrille',
        geometry: 'box',
        position: [xPos, screenHeight * 0.35, grilleDepth],
        scale: [grilleWidth + 0.1, grilleHeight + 0.1, 0.03],
        material: 'ventGrille',
      });

      // Grille bars
      for (let i = 0; i < 4; i++) {
        const barY = -grilleHeight / 2 + (grilleHeight / 4) * i + grilleHeight / 8;
        elements.push({
          type: 'ventGrille',
          geometry: 'box',
          position: [xPos, screenHeight * 0.35 + barY, grilleDepth + 0.04],
          scale: [grilleWidth * 0.9, 0.025, 0.02],
          material: 'darkMetal',
        });
      }
    });
  }

  // POWER SUPPLY UNIT
  const unitWidth = screenWidth * randomFloat(variantSeed, indexCounter++, 0.3, 0.4);
  const unitHeight = screenHeight * 0.12;
  const unitY = screenHeight * randomFloat(variantSeed, indexCounter++, 0.1, 0.2);

  elements.push({
    type: 'powerUnit',
    geometry: 'box',
    position: [0, unitY, 0.1],
    scale: [unitWidth, unitHeight, 0.1],
    material: 'powerUnit',
  });

  // LED indicators (animated)
  const ledSpacing = unitWidth * 0.15;
  for (let i = 0; i < ledCount; i++) {
    const ledX = (i - (ledCount - 1) / 2) * ledSpacing;
    const ledMaterial = i < 3 ? 'ledGreen' : i === 3 ? 'ledYellow' : 'ledRed';
    elements.push({
      type: 'led',
      geometry: 'circle',
      position: [ledX, unitY - unitHeight * 0.2, 0.16],
      scale: 0.03,
      material: ledMaterial,
      isAnimated: true,
    });
  }

  // Power connector (optional)
  if (hasPowerConnector) {
    elements.push({
      type: 'powerUnit',
      geometry: 'box',
      position: [unitWidth * 0.35, unitY, 0.16],
      scale: [0.08, 0.06, 0.04],
      material: 'cable',
    });
  }

  // CABLE CONDUITS
  const conduitWidth = screenWidth * 0.7;

  if (cableRouting === 'horizontal' || cableRouting === 'both') {
    elements.push({
      type: 'cableConduit',
      geometry: 'box',
      position: [0, 0, 0.08],
      scale: [conduitWidth, 0.08, 0.05],
      material: 'darkMetal',
    });
  }

  if (cableRouting === 'vertical' || cableRouting === 'both') {
    const verticalCableCount = randomInt(variantSeed, indexCounter++, 1, 2);
    const offsets = verticalCableCount === 1 ? [0] : [-0.2, 0.2];
    offsets.forEach((xOffset) => {
      elements.push({
        type: 'cableConduit',
        geometry: 'box',
        position: [screenWidth * xOffset, -screenHeight * 0.15, 0.08],
        scale: [0.05, screenHeight * 0.25, 0.03],
        material: 'cable',
      });
    });
  }

  // COOLING SYSTEM
  const coolerWidth = screenWidth * 0.5;
  const coolerHeight = screenHeight * 0.18;
  const coolerY = -screenHeight * randomFloat(variantSeed, indexCounter++, 0.28, 0.35);

  elements.push({
    type: 'coolingUnit',
    geometry: 'box',
    position: [0, coolerY, 0.1],
    scale: [coolerWidth, coolerHeight, 0.12],
    material: 'coolingUnit',
  });

  if (coolingUnitStyle === 'fan' || coolingUnitStyle === 'both') {
    // Fan housing
    elements.push({
      type: 'coolingUnit',
      geometry: 'cylinder',
      position: [0, coolerY, 0.17],
      scale: [coolerHeight * 0.35, 0.04, coolerHeight * 0.35],
      material: 'darkMetal',
    });

    // Fan blades (animated)
    elements.push({
      type: 'fan',
      geometry: 'torus',
      position: [0, coolerY, 0.2],
      rotation: [Math.PI / 2, 0, 0],
      scale: [coolerHeight * 0.25, coolerHeight * 0.25, coolerHeight * 0.25],
      material: 'darkMetal',
      isAnimated: true,
    });

    // Fan hub
    elements.push({
      type: 'coolingUnit',
      geometry: 'cylinder',
      position: [0, coolerY, 0.2],
      rotation: [Math.PI / 2, 0, 0],
      scale: [0.04, 0.02, 0.04],
      material: 'bracket',
    });
  }

  if (coolingUnitStyle === 'heatsink' || coolingUnitStyle === 'both') {
    // Heat sink fins
    const finCount = randomInt(variantSeed, indexCounter++, 2, 4);
    for (let i = 0; i < finCount; i++) {
      elements.push({
        type: 'coolingUnit',
        geometry: 'box',
        position: [(i - (finCount - 1) / 2) * (coolerWidth * 0.2), coolerY, 0.11],
        scale: [0.03, coolerHeight * 0.8, 0.1],
        material: 'ventGrille',
      });
    }
  }

  // STRUCTURAL BRACKETS
  // Left bracket
  elements.push({
    type: 'bracket',
    geometry: 'box',
    position: [-screenWidth * 0.45, -screenHeight * 0.42 + 0.05, 0.08],
    rotation: [0, 0, -0.2],
    scale: [0.06, screenHeight * 0.15, 0.04],
    material: 'bracket',
  });

  elements.push({
    type: 'bracket',
    geometry: 'box',
    position: [-screenWidth * 0.45 - 0.05, -screenHeight * 0.42 - 0.08, 0.08],
    scale: [0.15, 0.04, 0.06],
    material: 'bracket',
  });

  // Right bracket
  elements.push({
    type: 'bracket',
    geometry: 'box',
    position: [screenWidth * 0.45, -screenHeight * 0.42 + 0.05, 0.08],
    rotation: [0, 0, 0.2],
    scale: [0.06, screenHeight * 0.15, 0.04],
    material: 'bracket',
  });

  elements.push({
    type: 'bracket',
    geometry: 'box',
    position: [screenWidth * 0.45 + 0.05, -screenHeight * 0.42 - 0.08, 0.08],
    scale: [0.15, 0.04, 0.06],
    material: 'bracket',
  });

  // Top reinforcement bar
  elements.push({
    type: 'bracket',
    geometry: 'box',
    position: [0, screenHeight * 0.48, 0.08],
    scale: [screenWidth * 0.8, 0.05, 0.04],
    material: 'bracket',
  });

  // WARNING LABELS
  const labelY = screenHeight * randomFloat(variantSeed, indexCounter++, 0.05, 0.15);

  if (warningLabelStyle === 'highVoltage' || warningLabelStyle === 'both') {
    elements.push({
      type: 'warningLabel',
      geometry: 'plane',
      position: [-screenWidth * 0.42, labelY, 0.08],
      scale: [0.2, 0.08, 1],
      material: 'warningYellow',
    });
  }

  if (warningLabelStyle === 'caution' || warningLabelStyle === 'both') {
    elements.push({
      type: 'warningLabel',
      geometry: 'plane',
      position: [screenWidth * 0.42, labelY, 0.08],
      scale: [0.15, 0.06, 1],
      material: 'warningOrange',
    });
  }

  // SERIAL PLATE (optional)
  if (hasSerialPlate) {
    const plateX = screenWidth * randomFloat(variantSeed, indexCounter++, 0.25, 0.4);
    const plateY = -screenHeight * randomFloat(variantSeed, indexCounter++, 0.4, 0.48);

    elements.push({
      type: 'serialPlate',
      geometry: 'box',
      position: [plateX, plateY, 0.08],
      scale: [0.25, 0.1, 0.01],
      material: 'serialPlate',
    });

    // Corner screws
    const screwPositions: [number, number][] = [
      [-0.1, 0.035],
      [0.1, 0.035],
      [-0.1, -0.035],
      [0.1, -0.035],
    ];
    screwPositions.forEach(([offsetX, offsetY]) => {
      elements.push({
        type: 'serialPlate',
        geometry: 'cylinder',
        position: [plateX + offsetX, plateY + offsetY, 0.09],
        scale: [0.008, 0.01, 0.008],
        material: 'bracket',
      });
    });
  }

  return {
    variantSeed,
    elements,
    layout,
  };
}
