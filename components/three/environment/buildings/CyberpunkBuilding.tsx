'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CyberpunkBuildingProps, WindowColor } from '@/types/three-scene';
import { getMeshBasicMaterial } from '@/lib/type-guards';
import { ANIMATION_SPEEDS, OPACITY } from '@/config/constants';
import { generateBuildingBlueprint } from './BuildingBlueprint';
import { getBuildingMaterialByIndex } from '@/components/three/pools/MaterialPool';

/**
 * Cyberpunk-style building with procedurally generated architecture.
 *
 * Uses BuildingBlueprint system for 10x visual diversity:
 * - Tiered setback profiles (2-4 tiers)
 * - Varied window patterns (grid, staggered, random-sparse)
 * - Rooftop elements (antennas, water towers, satellite dishes)
 * - Architectural details (vents, neon stripes, pipes, doorways)
 * - 4 building material variants
 *
 * @param props - Building configuration and pooled resources
 */
export default function CyberpunkBuilding({
  position,
  size,
  material,
  windowColor,
  index,
  hasAntenna,
  geometries,
  materials,
  variantSeed,
}: CyberpunkBuildingProps) {
  const windowRefs = useRef<(THREE.Mesh | null)[]>([]);
  const [width, height, depth] = size;

  // Generate procedural blueprint from variant seed
  const blueprint = useMemo(
    () => generateBuildingBlueprint(
      size,
      windowColor as WindowColor,
      hasAntenna,
      variantSeed ?? index
    ),
    [size, windowColor, hasAntenna, variantSeed, index]
  );

  // Get building material by index from blueprint
  const buildingMaterial = useMemo(
    () => getBuildingMaterialByIndex(materials, blueprint.buildingMaterialIndex),
    [materials, blueprint.buildingMaterialIndex]
  );

  // Flickering animation for windows
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    windowRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      const mat = getMeshBasicMaterial(ref);
      if (!mat) return;
      const flicker =
        Math.sin(time * (2 + index * 0.1) + idx * 0.5) > 0.3 ? 1 : OPACITY.LOW;
      mat.opacity =
        (0.4 + Math.sin(time * ANIMATION_SPEEDS.SLOW + index + idx * 0.2) * 0.3) *
        flicker;
    });
  });

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
      case 'building':
        return buildingMaterial;
      case 'buildingDark':
        return materials.buildingDark;
      case 'buildingGrey':
        return materials.buildingGrey;
      case 'window':
      case 'emissiveCyan':
        return materials.emissiveCyan;
      case 'emissiveMagenta':
        return materials.emissiveMagenta;
      case 'emissiveGreen':
        return materials.emissiveGreen;
      case 'emissiveAmber':
        return materials.emissiveAmber;
      case 'antennaMetal':
        return materials.antennaMetal;
      case 'antennaLight':
        return materials.antennaLight;
      default:
        return buildingMaterial;
    }
  };

  return (
    <group position={position}>
      {/* Render all blueprint elements */}
      {blueprint.elements.map((element, idx) => {
        const geometry = getGeometry(element.geometry);
        const elementMaterial = getMaterial(element.material);
        const scale = element.scale;

        // Track window elements for animation
        const isWindow = element.type === 'window';

        return (
          <mesh
            key={`${element.type}-${idx}`}
            ref={isWindow ? (el) => { if (el) windowRefs.current[idx] = el; } : undefined}
            position={element.position}
            rotation={element.rotation ? [element.rotation[0], element.rotation[1], element.rotation[2]] : undefined}
            geometry={geometry}
            material={elementMaterial}
            scale={scale}
            castShadow={element.type === 'tier'}
          />
        );
      })}
    </group>
  );
}
