'use client';

import { useMemo } from 'react';
import { usePools } from '../../pools';
import CyberpunkBuilding from './CyberpunkBuilding';
import { SCENE_DIMENSIONS, BUILDING_CONFIG, CYBERPUNK_COLORS } from '@/config/constants';

/**
 * Orchestrates all city buildings in the scene.
 *
 * Generates and renders:
 * - Left side buildings
 * - Right side buildings
 * - Background megastructures
 *
 * Uses seeded randomization for consistent placement across renders.
 */
export default function CityBuildings() {
  const { geometries, materials } = usePools();
  const seed = 12345; // Consistent seed for reproducibility

  // Left side buildings (5 buildings)
  const leftBuildings = useMemo(() => {
    const buildings = [];
    const randomFn = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < SCENE_DIMENSIONS.LEFT_BUILDINGS; i++) {
      const height = BUILDING_CONFIG.SIDE_HEIGHT_BASE + randomFn(i) * BUILDING_CONFIG.SIDE_HEIGHT_RANGE;
      const width = BUILDING_CONFIG.SIDE_DIM_MIN + randomFn(i + 100) * BUILDING_CONFIG.SIDE_DIM_RANGE;
      const depth = BUILDING_CONFIG.SIDE_DIM_MIN + randomFn(i + 200) * BUILDING_CONFIG.SIDE_DIM_RANGE;
      const colors = [CYBERPUNK_COLORS.CYAN, CYBERPUNK_COLORS.MAGENTA, CYBERPUNK_COLORS.AMBER, CYBERPUNK_COLORS.GREEN] as const;

      buildings.push({
        position: [
          BUILDING_CONFIG.LEFT_X_ORIGIN - i * BUILDING_CONFIG.LEFT_X_STEP + randomFn(i + 300) * BUILDING_CONFIG.LEFT_X_JITTER,
          height / 2 + BUILDING_CONFIG.Y_GROUND_OFFSET,
          BUILDING_CONFIG.SIDE_Z_ORIGIN - randomFn(i + 400) * BUILDING_CONFIG.SIDE_Z_RANGE,
        ] as [number, number, number],
        size: [width, height, depth] as [number, number, number],
        windowColor: colors[Math.floor(randomFn(i + 500) * colors.length)],
        hasAntenna: randomFn(i + 600) > BUILDING_CONFIG.ANTENNA_THRESHOLD,
        variantSeed: 5000 + i,
      });
    }

    return buildings;
  }, []);

  // Right side buildings (5 buildings)
  const rightBuildings = useMemo(() => {
    const buildings = [];
    const randomFn = (i: number) => {
      const x = Math.sin(seed + 1000 + i * 9999) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < SCENE_DIMENSIONS.RIGHT_BUILDINGS; i++) {
      const height = BUILDING_CONFIG.SIDE_HEIGHT_BASE + randomFn(i) * BUILDING_CONFIG.SIDE_HEIGHT_RANGE;
      const width = BUILDING_CONFIG.SIDE_DIM_MIN + randomFn(i + 100) * BUILDING_CONFIG.SIDE_DIM_RANGE;
      const depth = BUILDING_CONFIG.SIDE_DIM_MIN + randomFn(i + 200) * BUILDING_CONFIG.SIDE_DIM_RANGE;
      const colors = [CYBERPUNK_COLORS.CYAN, CYBERPUNK_COLORS.MAGENTA, CYBERPUNK_COLORS.AMBER, CYBERPUNK_COLORS.GREEN] as const;

      buildings.push({
        position: [
          -BUILDING_CONFIG.LEFT_X_ORIGIN + i * BUILDING_CONFIG.LEFT_X_STEP + randomFn(i + 300) * BUILDING_CONFIG.LEFT_X_JITTER,
          height / 2 + BUILDING_CONFIG.Y_GROUND_OFFSET,
          BUILDING_CONFIG.SIDE_Z_ORIGIN - randomFn(i + 400) * BUILDING_CONFIG.SIDE_Z_RANGE,
        ] as [number, number, number],
        size: [width, height, depth] as [number, number, number],
        windowColor: colors[Math.floor(randomFn(i + 500) * colors.length)],
        hasAntenna: randomFn(i + 600) > BUILDING_CONFIG.ANTENNA_THRESHOLD,
        variantSeed: 6000 + i,
      });
    }

    return buildings;
  }, []);

  // Background megastructures (6 buildings)
  const backgroundBuildings = useMemo(() => {
    const buildings = [];
    const randomFn = (i: number) => {
      const x = Math.sin(seed + 2000 + i * 9999) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < SCENE_DIMENSIONS.BACKGROUND_BUILDINGS; i++) {
      const height = BUILDING_CONFIG.BG_HEIGHT_BASE + randomFn(i) * BUILDING_CONFIG.BG_HEIGHT_RANGE;
      const width = BUILDING_CONFIG.BG_DIM_MIN + randomFn(i + 100) * BUILDING_CONFIG.BG_DIM_RANGE;
      const depth = BUILDING_CONFIG.BG_DIM_MIN + randomFn(i + 200) * BUILDING_CONFIG.BG_DIM_RANGE;
      const colors = [CYBERPUNK_COLORS.CYAN, CYBERPUNK_COLORS.MAGENTA, CYBERPUNK_COLORS.AMBER, CYBERPUNK_COLORS.GREEN] as const;

      buildings.push({
        position: [
          BUILDING_CONFIG.BG_X_ORIGIN + i * BUILDING_CONFIG.BG_X_STEP + randomFn(i + 300) * BUILDING_CONFIG.BG_X_JITTER,
          height / 2 + BUILDING_CONFIG.Y_GROUND_OFFSET,
          BUILDING_CONFIG.BG_Z_ORIGIN - randomFn(i + 400) * BUILDING_CONFIG.BG_Z_RANGE,
        ] as [number, number, number],
        size: [width, height, depth] as [number, number, number],
        windowColor: colors[Math.floor(randomFn(i + 500) * colors.length)],
        hasAntenna: randomFn(i + 600) > BUILDING_CONFIG.ANTENNA_THRESHOLD,
        variantSeed: 7000 + i,
      });
    }

    return buildings;
  }, []);

  return (
    <group>
      {/* Left side buildings */}
      {leftBuildings.map((config, i) => (
        <CyberpunkBuilding
          key={`left-${i}`}
          position={config.position}
          size={config.size}
          material={materials.buildingDark}
          windowColor={config.windowColor}
          index={i}
          hasAntenna={config.hasAntenna}
          geometries={geometries}
          materials={materials}
          variantSeed={config.variantSeed}
        />
      ))}

      {/* Right side buildings */}
      {rightBuildings.map((config, i) => (
        <CyberpunkBuilding
          key={`right-${i}`}
          position={config.position}
          size={config.size}
          material={materials.buildingBase}
          windowColor={config.windowColor}
          index={i + SCENE_DIMENSIONS.LEFT_BUILDINGS}
          hasAntenna={config.hasAntenna}
          geometries={geometries}
          materials={materials}
          variantSeed={config.variantSeed}
        />
      ))}

      {/* Background megastructures */}
      {backgroundBuildings.map((config, i) => (
        <CyberpunkBuilding
          key={`bg-${i}`}
          position={config.position}
          size={config.size}
          material={materials.buildingGrey}
          windowColor={config.windowColor}
          index={i + SCENE_DIMENSIONS.LEFT_BUILDINGS + SCENE_DIMENSIONS.RIGHT_BUILDINGS}
          hasAntenna={config.hasAntenna}
          geometries={geometries}
          materials={materials}
          variantSeed={config.variantSeed}
        />
      ))}
    </group>
  );
}
