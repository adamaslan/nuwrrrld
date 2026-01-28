'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { ShipConfig, PoolsProps } from '@/types/three-scene';
import CapitalShip from './CapitalShip';
import { generateShipBlueprint } from './ShipBlueprint';
import { getHullMaterialByIndex, getEngineMaterialByIndex } from '@/components/three/pools/MaterialPool';

/**
 * Standard ship component that handles all vessel types.
 *
 * For capital ships (dreadnoughts), delegates rendering to CapitalShip.
 * For other types (shuttle, transport, freighter), renders procedurally generated ships.
 *
 * Uses ShipBlueprint system for 10x visual diversity:
 * - Unique hull silhouettes per ship
 * - Varied fin/wing configurations
 * - Multiple engine arrangements
 * - Procedural greebles (detail elements)
 * - Antenna variations
 * - 96 color combinations (12 hull x 8 engine colors)
 *
 * @param props - Ship configuration and pooled resources
 */
export default function Ship({
  config,
  index,
  geometries,
  materials,
}: {
  config: ShipConfig;
  index: number;
} & PoolsProps) {
  // Generate procedural blueprint from variant seed
  const blueprint = useMemo(
    () => generateShipBlueprint(
      config.type,
      config.size,
      config.variantSeed ?? index
    ),
    [config.type, config.size, config.variantSeed, index]
  );

  // Get materials by index from blueprint
  const hullMaterial = useMemo(
    () => getHullMaterialByIndex(materials, blueprint.hullColorIndex),
    [materials, blueprint.hullColorIndex]
  );

  const engineMaterial = useMemo(
    () => getEngineMaterialByIndex(materials, blueprint.engineColorIndex),
    [materials, blueprint.engineColorIndex]
  );

  const isCapitalShip = config.type === 'dreadnought';

  // Capital ships have their own detailed rendering
  if (isCapitalShip) {
    return (
      <CapitalShip
        config={config}
        index={index}
        geometries={geometries}
        materials={materials}
      />
    );
  }

  // Helper to get geometry by name
  const getGeometry = (geomType: 'box' | 'cylinder' | 'sphere' | 'plane') => {
    switch (geomType) {
      case 'box':
        return geometries.box;
      case 'cylinder':
        return geometries.cylinder;
      case 'sphere':
        return geometries.sphere;
      case 'plane':
        return geometries.plane;
      default:
        return geometries.box;
    }
  };

  // Helper to get material by name
  const getMaterial = (matType: string) => {
    switch (matType) {
      case 'hull':
        return hullMaterial;
      case 'hullDark':
        return materials.shipHullDark;
      case 'engine':
        return engineMaterial;
      case 'emissiveCyan':
        return materials.emissiveCyan;
      case 'emissiveRed':
        return materials.emissiveRed;
      case 'emissiveGreen':
        return materials.emissiveGreen;
      case 'emissiveOrange':
        return materials.emissiveAmber;
      default:
        return hullMaterial;
    }
  };

  return (
    <group>
      {/* Render all blueprint elements */}
      {blueprint.elements.map((element, idx) => {
        const geometry = getGeometry(element.geometry);
        const material = getMaterial(element.material);
        const scale = element.scale;

        return (
          <mesh
            key={`${element.type}-${idx}`}
            position={element.position}
            rotation={element.rotation ? [element.rotation[0], element.rotation[1], element.rotation[2]] : undefined}
            geometry={geometry}
            material={material}
            scale={scale}
          />
        );
      })}
    </group>
  );
}
