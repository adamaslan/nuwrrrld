'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CyberpunkBuildingProps } from '@/types/three-scene';
import { getMeshBasicMaterial } from '@/lib/type-guards';
import { ANIMATION_SPEEDS, OPACITY, BUILDING_CONFIG } from '@/config/constants';

/**
 * Cyberpunk-style building with animated windows and optional antenna.
 *
 * Features:
 * - Main building structure with specified dimensions
 * - Grid of flickering window lights
 * - Optional communication antenna on roof
 * - Seeded random for consistent window patterns
 *
 * Uses pooled geometries and materials for optimal memory usage.
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
}: CyberpunkBuildingProps) {
  const windowRefs = useRef<(THREE.Mesh | null)[]>([]);
  const accentRef = useRef<THREE.Mesh>(null);
  const antennaLightRef = useRef<THREE.PointLight>(null);
  const [width, height, depth] = size;

  // Get pooled window material based on color
  const getWindowMaterial = () => {
    switch (windowColor) {
      case '#ff00ff':
        return materials.windowMagenta;
      case '#ffaa00':
        return materials.windowAmber;
      case '#00ff88':
        return materials.windowGreen;
      default:
        return materials.windowCyan;
    }
  };
  const windowMaterial = getWindowMaterial();

  // Generate window grid
  const windowRows = Math.floor(size[1] / 2.5);
  const windowCols = Math.floor(size[0] / 1.8);

  // Flickering animation
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

    if (accentRef.current) {
      const mat = getMeshBasicMaterial(accentRef.current);
      if (mat) {
        mat.opacity =
          OPACITY.HIGH + Math.sin(time * ANIMATION_SPEEDS.MEDIUM + index) * 0.3;
      }
    }

    if (antennaLightRef.current) {
      antennaLightRef.current.intensity =
        OPACITY.HIGH + Math.sin(time * ANIMATION_SPEEDS.VERY_FAST + index) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Main building structure */}
      <mesh
        geometry={geometries.box}
        material={material}
        scale={size}
        castShadow
      />

      {/* Windows - grid of flickering lights */}
      {Array.from({ length: Math.min(windowRows, 15) }).map((_, row) =>
        Array.from({ length: Math.min(windowCols, 4) }).map((_, col) => {
          const idx = row * windowCols + col;
          return (
            <mesh
              key={`${row}-${col}`}
              ref={(el) => {
                if (el) windowRefs.current[idx] = el;
              }}
              position={[
                -size[0] / 2 + 0.9 + col * 1.6,
                -size[1] / 2 + 2 + row * 2.5,
                size[2] / 2 + 0.01,
              ]}
              geometry={geometries.windowPlane}
              material={windowMaterial}
            />
          );
        })
      )}

      {/* Accent stripe */}
      <mesh
        ref={accentRef}
        position={[0, size[1] / 2 - 1, size[2] / 2 + 0.02]}
        geometry={geometries.plane}
        material={windowMaterial}
        scale={[size[0] * 0.95, 0.4, 1]}
      />

      {/* Mid-building stripe for tall buildings */}
      {size[1] > 30 && (
        <mesh
          position={[0, 0, size[2] / 2 + 0.02]}
          geometry={geometries.plane}
          material={windowMaterial}
          scale={[size[0] * 0.95, 0.2, 1]}
        />
      )}

      {/* Optional antenna on roof */}
      {hasAntenna && (
        <group position={[0, size[1] / 2, 0]}>
          <mesh
            geometry={geometries.cylinder}
            material={materials.antennaMetal}
            scale={[0.15, 5, 0.15]}
          />
          {/* Antenna light beacon */}
          <mesh
            position={[0, 2.8, 0]}
            geometry={geometries.sphere}
            material={materials.emissiveRed}
            scale={0.15}
          />
          {/* Antenna beacon light */}
          <pointLight
            ref={antennaLightRef}
            color="#ff0000"
            intensity={OPACITY.HIGH}
            distance={20}
            position={[0, 3, 0]}
          />
        </group>
      )}
    </group>
  );
}
