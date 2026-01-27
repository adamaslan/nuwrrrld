'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePools } from '../../pools';
import { getMeshStandardMaterial } from '@/lib/type-guards';

/**
 * Reverse-facing backdrop layer positioned behind the camera.
 *
 * Features:
 * - Structure towers with window grids
 * - Enhanced light panels
 * - Atmospheric glow orbs
 * - Volumetric light shafts
 * - All elements rotated 180 degrees to face backward
 */
export default function OppositeLayer() {
  const layerRef = useRef<THREE.Group>(null);
  const lightPanelRefs = useRef<THREE.Mesh[]>([]);

  // Use context pools instead of local duplicate pools
  const { geometries, materials } = usePools();

  // Enhanced lighting panels positioned behind camera facing forward
  const lightPanels = useMemo(
    () => [
      {
        pos: [-25, 15, 40] as [number, number, number],
        size: [20, 15] as [number, number],
        color: '#00ffff',
        intensity: 1.2,
      },
      {
        pos: [30, 25, 45] as [number, number, number],
        size: [18, 20] as [number, number],
        color: '#ff00ff',
        intensity: 1.5,
      },
      {
        pos: [-10, 5, 50] as [number, number, number],
        size: [16, 12] as [number, number],
        color: '#00ff88',
        intensity: 1,
      },
      {
        pos: [20, -10, 38] as [number, number, number],
        size: [14, 18] as [number, number],
        color: '#ffaa00',
        intensity: 1.3,
      },
    ],
    []
  );

  // Reverse-facing structures (tall vertical elements)
  const structures = useMemo(
    () => [
      {
        pos: [-35, 20, 55] as [number, number, number],
        size: [8, 50, 8] as [number, number, number],
        color: '#1a1a2e',
      },
      {
        pos: [40, 30, 60] as [number, number, number],
        size: [10, 60, 10] as [number, number, number],
        color: '#2a1a3a',
      },
      {
        pos: [0, 15, 65] as [number, number, number],
        size: [12, 45, 12] as [number, number, number],
        color: '#1a2a3a',
      },
    ],
    []
  );

  // Map local pool names to context pool equivalents
  const hullMaterialMap = useMemo(
    () => ({
      '#1a1a2e': materials.structureDark,
      '#2a1a3a': materials.structurePurple,
      '#1a2a3a': materials.structureNavy,
    }),
    [materials]
  );

  // Window materials array for indexing
  const windowMaterials = useMemo(
    () => [
      materials.windowCyan,
      materials.windowMagenta,
      materials.windowGreen,
      materials.windowAmber,
    ],
    [materials]
  );

  // Display panel materials - use emissive materials from pool
  const displayMaterialMap = useMemo(
    () => ({
      '#00ffff': materials.emissiveCyan,
      '#ff00ff': materials.emissiveMagenta,
      '#00ff88': materials.emissiveGreen,
      '#ffaa00': materials.emissiveAmber,
    }),
    [materials]
  );

  // Frame materials - use building material with slight variation
  const frameMaterial = materials.buildingDark;

  // Orb materials - use emissive materials from pool
  const orbMaterials = useMemo(
    () => [materials.emissiveCyan, materials.emissiveMagenta, materials.emissiveGreen],
    [materials]
  );

  // Animate light panels pulsing
  useFrame((state) => {
    if (layerRef.current) {
      const time = state.clock.elapsedTime;
      layerRef.current.children.forEach((child, i) => {
        // Subtle rotation and pulsing
        if (child instanceof THREE.Group) {
          child.rotation.y = Math.sin(time * 0.2 + i) * 0.1;
        }
      });
    }

    // Pulse light panel materials
    lightPanelRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = getMeshStandardMaterial(mesh);
      if (mat) {
        mat.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.3;
      }
    });
  });

  return (
    <group ref={layerRef} position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
      {/* Reverse-facing structure towers - using context pool materials and geometry */}
      {structures.map((struct, i) => {
        // Select hull material based on color using the mapping
        const hullMat =
          hullMaterialMap[struct.color as keyof typeof hullMaterialMap] ||
          materials.structureDark;

        return (
          <group key={`struct-${i}`} position={struct.pos}>
            {/* Main structure - reuses context pool geometry with scale */}
            <mesh castShadow scale={struct.size} material={hullMat} geometry={geometries.box} />

            {/* Window grid on front face - using context pool geometry/materials */}
            {Array.from({ length: 6 }).map((_, row) =>
              Array.from({ length: 4 }).map((_, col) => {
                const colIndex = col % 4;
                const windowMat = windowMaterials[colIndex];
                return (
                  <mesh
                    key={`window-${row}-${col}`}
                    position={[
                      -struct.size[0] / 2 + 1.2 + col * 2,
                      -struct.size[1] / 2 + 4 + row * 6.5,
                      struct.size[2] / 2 + 0.01,
                    ]}
                    geometry={geometries.windowPlane}
                    material={windowMat}
                    scale={[1.2, 1.25, 1]}
                  />
                );
              })
            )}

            {/* Top beacon - using emissive mesh instead of point light for optimization */}
            <mesh
              position={[0, struct.size[1] / 2 + 3, 0]}
              geometry={geometries.sphere}
              material={materials.emissiveMagenta}
              scale={0.5}
            />

            {/* Side accent - using emissive mesh instead of point light */}
            <mesh
              position={[struct.size[0] / 2 + 2, 0, 0]}
              geometry={geometries.sphere}
              material={materials.emissiveCyan}
              scale={0.4}
            />
          </group>
        );
      })}

      {/* Enhanced light panels - using context pool geometries and materials */}
      {lightPanels.map((panel, i) => {
        // Select display material based on panel color using mapping
        const panelMat =
          displayMaterialMap[panel.color as keyof typeof displayMaterialMap] ||
          materials.emissiveCyan;

        return (
          <group key={`panel-${i}`} position={panel.pos}>
            {/* Main light panel - using context pool geometry */}
            <mesh
              ref={(el) => {
                if (el) lightPanelRefs.current[i] = el;
              }}
              scale={[panel.size[0], panel.size[1], 1]}
              geometry={geometries.plane}
              material={panelMat}
            />

            {/* Panel backing frame - using context pool geometry */}
            <mesh
              position={[0, 0, -0.2]}
              scale={[panel.size[0] + 0.5, panel.size[1] + 0.5, 0.3]}
              geometry={geometries.box}
              material={frameMaterial}
            />

            {/* Primary light source - kept for key illumination */}
            <pointLight
              color={panel.color}
              intensity={panel.intensity}
              distance={35}
              position={[0, 0, 5]}
            />

            {/* Secondary fill - replaced with emissive mesh */}
            <mesh
              position={[0, 0, -3]}
              geometry={geometries.sphere}
              material={panelMat}
              scale={1.5}
            />
          </group>
        );
      })}

      {/* Atmospheric glow orbs - using context pool geometry/material */}
      {[-20, 0, 20].map((x, i) => {
        const colors = ['#00ffff', '#ff00ff', '#00ff88'];
        return (
          <group key={`orb-${i}`} position={[x, 35, 52]}>
            <mesh geometry={geometries.sphere} material={orbMaterials[i]} scale={1.2} />
            <pointLight color={colors[i]} intensity={1.2} distance={30} />
          </group>
        );
      })}

      {/* Volumetric light shafts - using context pool geometry and materials */}
      {[-15, 15].map((z, i) => (
        <mesh
          key={`shaft-${i}`}
          position={[0, 20, 42 + z]}
          geometry={geometries.lightShaft}
          material={i === 0 ? materials.shaftCyan : materials.shaftMagenta}
        />
      ))}
    </group>
  );
}
