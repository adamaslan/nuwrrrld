'use client';

import { useMemo } from 'react';
import { usePools } from '../../pools';
import CyberpunkBuilding from './CyberpunkBuilding';
import { SCENE_DIMENSIONS } from '@/config/constants';

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
      const height = 25 + randomFn(i) * 50;
      const width = 3 + randomFn(i + 100) * 4;
      const depth = 3 + randomFn(i + 200) * 4;
      const colors = ['#00ffff', '#ff00ff', '#ffaa00', '#00ff88'] as const;

      buildings.push({
        position: [
          -12 - i * 6 + randomFn(i + 300) * 2,
          height / 2 - 2,
          -12 - randomFn(i + 400) * 20,
        ] as [number, number, number],
        size: [width, height, depth] as [number, number, number],
        windowColor: colors[Math.floor(randomFn(i + 500) * 4)],
        hasAntenna: randomFn(i + 600) > 0.6,
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
      const height = 25 + randomFn(i) * 50;
      const width = 3 + randomFn(i + 100) * 4;
      const depth = 3 + randomFn(i + 200) * 4;
      const colors = ['#00ffff', '#ff00ff', '#ffaa00', '#00ff88'] as const;

      buildings.push({
        position: [
          12 + i * 6 + randomFn(i + 300) * 2,
          height / 2 - 2,
          -12 - randomFn(i + 400) * 20,
        ] as [number, number, number],
        size: [width, height, depth] as [number, number, number],
        windowColor: colors[Math.floor(randomFn(i + 500) * 4)],
        hasAntenna: randomFn(i + 600) > 0.6,
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
      const height = 50 + randomFn(i) * 70;
      const width = 5 + randomFn(i + 100) * 6;
      const depth = 5 + randomFn(i + 200) * 6;
      const colors = ['#00ffff', '#ff00ff', '#ffaa00', '#00ff88'] as const;

      buildings.push({
        position: [
          -30 + i * 10 + randomFn(i + 300) * 3,
          height / 2 - 2,
          -35 - randomFn(i + 400) * 15,
        ] as [number, number, number],
        size: [width, height, depth] as [number, number, number],
        windowColor: colors[Math.floor(randomFn(i + 500) * 4)],
        hasAntenna: randomFn(i + 600) > 0.6,
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
