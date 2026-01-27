import { seededRandom } from './seededRandom';
import type { BuildingConfig, WindowColor } from '@/types/three-scene';
import { BUILDING_CONFIG } from '@/config/constants';

/**
 * Generates building configuration with deterministic randomization.
 *
 * @param index - Building index for seeding
 * @param seed - Base random seed
 * @param basePosition - Base [x, y, z] position
 * @param heightRange - [min, max] height bounds
 * @returns Complete building configuration
 */
export function generateBuildingConfig(
  index: number,
  seed: number,
  basePosition: [number, number, number],
  heightRange: [number, number]
): BuildingConfig {
  const height =
    heightRange[0] +
    seededRandom(seed, index) * (heightRange[1] - heightRange[0]);

  const width =
    BUILDING_CONFIG.MIN_WIDTH +
    seededRandom(seed, index + 100) *
      (BUILDING_CONFIG.MAX_WIDTH - BUILDING_CONFIG.MIN_WIDTH);

  const depth =
    BUILDING_CONFIG.MIN_WIDTH +
    seededRandom(seed, index + 200) *
      (BUILDING_CONFIG.MAX_WIDTH - BUILDING_CONFIG.MIN_WIDTH);

  const colors: readonly WindowColor[] = [
    '#00ffff',
    '#ff00ff',
    '#ffaa00',
    '#00ff88',
  ];

  const windowColor = colors[
    Math.floor(seededRandom(seed, index + 500) * colors.length)
  ];

  return {
    position: [
      basePosition[0] + seededRandom(seed, index + 300) * 2,
      height / 2 - 2,
      basePosition[2] - seededRandom(seed, index + 400) * 20,
    ],
    size: [width, height, depth],
    windowColor,
    hasAntenna: seededRandom(seed, index + 600) > BUILDING_CONFIG.ANTENNA_THRESHOLD,
  };
}

/**
 * Generates array of building configurations.
 *
 * @param count - Number of buildings to generate
 * @param seed - Base random seed
 * @param xOffset - X position offset
 * @param zStart - Starting Z position
 * @param heightRange - [min, max] height bounds
 * @returns Array of building configurations
 */
export function generateBuildingArray(
  count: number,
  seed: number,
  xOffset: number,
  zStart: number,
  heightRange: [number, number]
): BuildingConfig[] {
  const buildings: BuildingConfig[] = [];

  for (let i = 0; i < count; i++) {
    const basePosition: [number, number, number] = [xOffset, 0, zStart];
    buildings.push(generateBuildingConfig(i, seed, basePosition, heightRange));
  }

  return buildings;
}
