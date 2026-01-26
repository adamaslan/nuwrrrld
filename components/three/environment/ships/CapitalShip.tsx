'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ShipConfig, PoolsProps } from '@/types/three-scene';
import { getHullMaterialByColor } from '@/lib/scene-utils';

/**
 * Capital ship component for massive dreadnought vessels.
 *
 * Features:
 * - Large main hull structure
 * - Multiple superstructure towers
 * - Command bridge
 * - Primary engine pods (4x)
 * - Emission panels for ambient illumination
 * - Ventral and dorsal details
 * - Beacon and headlight systems
 *
 * Designed as ultra-large capital ships (9x scale) with detailed geometry.
 *
 * @param props - Ship configuration and pooled resources
 */
export default function CapitalShip({
  config,
  index,
  geometries,
  materials,
}: {
  config: ShipConfig;
  index: number;
} & PoolsProps) {
  const beaconRef = useRef<THREE.PointLight>(null);
  const engineRef = useRef<THREE.PointLight>(null);
  const [width, height, depth] = config.size;

  // Pre-compute positions for engine pods
  const enginePods = useMemo(
    () => [
      { x: -width * 0.35, z: depth * 0.35 },
      { x: -width * 0.35, z: -depth * 0.35 },
      { x: width * 0.25, z: depth * 0.35 },
      { x: width * 0.25, z: -depth * 0.35 },
    ],
    [width, depth]
  );

  // Pre-compute positions for superstructures
  const towers = useMemo(
    () => [
      {
        pos: [-width * 0.2, height * 0.6, 0] as [number, number, number],
        scale: [width * 0.3, height * 0.8, depth * 0.4] as [number, number, number],
      },
      {
        pos: [width * 0.2, height * 0.5, 0] as [number, number, number],
        scale: [width * 0.25, height * 0.6, depth * 0.35] as [number, number, number],
      },
    ],
    [width, height, depth]
  );

  // Get ship hull material based on color
  const hullMaterial = useMemo(
    () => getHullMaterialByColor(materials, config.color),
    [config.color, materials]
  );

  // Get engine material based on engine color
  const getEngineMaterial = () => {
    if (config.engineColor.includes('ff66') || config.engineColor.includes('ff88'))
      return materials.shipEngineOrange;
    if (config.engineColor.includes('00cc') || config.engineColor.includes('00ff'))
      return materials.shipEngineCyan;
    if (config.engineColor.includes('00ff88')) return materials.shipEngineGreen;
    return materials.shipEngineCyan;
  };
  const engineMaterial = getEngineMaterial();

  // Beacon and engine light animation
  useFrame((state) => {
    if (beaconRef.current) {
      const t = state.clock.elapsedTime;
      beaconRef.current.intensity = 1 + Math.sin(t * 3 + index) * 0.5;
    }
    if (engineRef.current) {
      const t = state.clock.elapsedTime;
      engineRef.current.intensity =
        config.lightIntensity * (0.7 + Math.sin(t * 6 + index) * 0.3);
    }
  });

  return (
    <group>
      {/* MAIN HULL - using pooled box geometry with scale */}
      <mesh
        geometry={geometries.box}
        material={hullMaterial}
        scale={[width, height, depth]}
        castShadow
      />

      {/* SUPERSTRUCTURE TOWERS (2) - using pooled geometry */}
      {towers.map((tower, i) => (
        <mesh
          key={`tower-${i}`}
          position={tower.pos}
          geometry={geometries.box}
          material={hullMaterial}
          scale={tower.scale}
          castShadow
        />
      ))}

      {/* COMMAND BRIDGE - using pooled geometry */}
      <mesh
        position={[0, height * 0.75, 0]}
        geometry={geometries.box}
        material={materials.shipHullDark}
        scale={[width * 0.4, height * 0.3, depth * 0.3]}
        castShadow
      />

      {/* PRIMARY ENGINE PODS (4) - using pooled cylinder */}
      {enginePods.map((pos, i) => (
        <mesh
          key={`engine-${i}`}
          position={[pos.x, -height * 0.2, pos.z]}
          geometry={geometries.cylinder}
          material={engineMaterial}
          scale={[height * 0.18, height * 0.3, height * 0.18]}
          castShadow
        />
      ))}

      {/* EMISSION PANELS - using pooled box geometry with emissive material */}
      <mesh
        position={[0, height * 0.25, depth * 0.5]}
        geometry={geometries.box}
        material={materials.emissiveCyan}
        scale={[width * 0.6, height * 0.15, depth * 0.08]}
        castShadow
      />
      <mesh
        position={[0, height * 0.25, -depth * 0.5]}
        geometry={geometries.box}
        material={materials.emissiveCyan}
        scale={[width * 0.6, height * 0.15, depth * 0.08]}
        castShadow
      />

      {/* VENTRAL DETAILS - using pooled geometry */}
      <mesh
        position={[-width * 0.1, -height * 0.35, 0]}
        geometry={geometries.box}
        material={hullMaterial}
        scale={[width * 0.4, height * 0.15, depth * 0.6]}
        castShadow
      />

      {/* DORSAL RIDGE - using pooled geometry */}
      <mesh
        position={[0, height * 0.5, 0]}
        geometry={geometries.box}
        material={hullMaterial}
        scale={[width * 0.25, height * 0.2, depth * 0.8]}
        castShadow
      />

      {/* BEACON LIGHT - kept as point light for key illumination on capital ships */}
      <pointLight
        ref={beaconRef}
        color={config.engineColor}
        intensity={1}
        distance={60}
        position={[0, height / 2 + 4, 0]}
      />

      {/* HEADLIGHT - forward-facing light */}
      <pointLight
        color={config.lightColor}
        intensity={config.lightIntensity}
        distance={50}
        position={[width * 0.5, height * 0.3, 0]}
      />

      {/* ENGINE GLOW LIGHT - rear engines */}
      <pointLight
        ref={engineRef}
        color={config.engineColor}
        intensity={config.lightIntensity * 0.9}
        distance={40}
        position={[-width * 0.4, -height * 0.2, 0]}
      />
    </group>
  );
}
