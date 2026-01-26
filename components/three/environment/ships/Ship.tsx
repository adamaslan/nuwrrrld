'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ShipConfig, PoolsProps } from '@/types/three-scene';
import CapitalShip from './CapitalShip';

/**
 * Standard ship component that handles all vessel types.
 *
 * For capital ships (dreadnoughts), delegates rendering to CapitalShip.
 * For other types (shuttle, transport, freighter), renders standard ship geometry.
 *
 * Features:
 * - Main hull structure
 * - Cockpit/bridge for larger ships
 * - Cargo sections for freighters
 * - Wing/fin structures for transports
 * - Engine lights and exhaust
 * - Running lights for navigation
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
  const engineRef = useRef<THREE.PointLight>(null);
  const [width, height, depth] = config.size;
  const isCapitalShip = config.type === 'dreadnought';

  // Get ship hull material based on color (memoized)
  const hullMaterial = useMemo(() => {
    if (config.color.includes('2a3a') || config.color.includes('1a2a'))
      return materials.shipHullNavy;
    if (config.color.includes('1a3a') || config.color.includes('2a1a'))
      return materials.shipHullPurple;
    if (config.color.includes('1a28') || config.color.includes('2828'))
      return materials.shipHullGray;
    return materials.shipHullDark;
  }, [config.color, materials]);

  // Engine light animation - only used for standard ships
  useFrame((state) => {
    if (!isCapitalShip && engineRef.current) {
      const t = state.clock.elapsedTime;
      // Pulsing engine glow
      engineRef.current.intensity =
        config.lightIntensity * (0.8 + Math.sin(t * 8 + index) * 0.2);
    }
  });

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

  return (
    <group>
      {/* Main hull - using pooled geometry with scale */}
      <mesh
        geometry={geometries.box}
        material={hullMaterial}
        scale={[width, height, depth]}
      />

      {/* Cockpit/Bridge for larger ships - using pooled geometry */}
      {config.type !== 'shuttle' && (
        <mesh
          position={[width * 0.35, height * 0.3, 0]}
          geometry={geometries.box}
          material={materials.shipHullDark}
          scale={[width * 0.25, height * 0.5, depth * 0.6]}
        />
      )}

      {/* Cargo section for freighters - using pooled geometry */}
      {config.type === 'freighter' && (
        <>
          <mesh
            position={[-width * 0.15, height * 0.1, 0]}
            geometry={geometries.box}
            material={materials.shipHullDark}
            scale={[width * 0.5, height * 0.8, depth * 0.9]}
          />
          {/* Container lights - using pooled plane with emissive */}
          <mesh
            position={[-width * 0.15, height * 0.5, depth * 0.46]}
            geometry={geometries.plane}
            material={materials.emissiveGreen}
            scale={[width * 0.4, 0.1, 1]}
          />
        </>
      )}

      {/* Wing/fin structures for transports - using pooled geometry */}
      {config.type === 'transport' && (
        <>
          <mesh
            position={[0, 0, depth * 0.6]}
            geometry={geometries.box}
            material={hullMaterial}
            scale={[width * 0.6, height * 0.15, depth * 0.3]}
          />
          <mesh
            position={[0, 0, -depth * 0.6]}
            geometry={geometries.box}
            material={hullMaterial}
            scale={[width * 0.6, height * 0.15, depth * 0.3]}
          />
        </>
      )}

      {/* Headlight - kept as point light for key illumination */}
      <pointLight
        color={config.lightColor}
        intensity={config.lightIntensity}
        distance={
          config.type === 'freighter'
            ? 15
            : config.type === 'transport'
              ? 10
              : 6
        }
        position={[width * 0.5, 0, 0]}
      />

      {/* Tail lights - using pooled geometry with emissive */}
      <mesh
        position={[-width * 0.5, 0, depth * 0.3]}
        geometry={geometries.box}
        material={materials.emissiveRed}
        scale={[0.05, height * 0.4, 0.15]}
      />
      <mesh
        position={[-width * 0.5, 0, -depth * 0.3]}
        geometry={geometries.box}
        material={materials.emissiveRed}
        scale={[0.05, height * 0.4, 0.15]}
      />

      {/* Engine glow - kept as point light for key illumination */}
      <pointLight
        ref={engineRef}
        color={config.engineColor}
        intensity={config.lightIntensity * 0.8}
        distance={
          config.type === 'freighter'
            ? 12
            : config.type === 'transport'
              ? 8
              : 5
        }
        position={[-width * 0.5, 0, 0]}
      />

      {/* Engine exhaust visual - using pooled cylinder geometry with scale */}
      <mesh
        position={[-width * 0.52, 0, 0]}
        geometry={geometries.cylinder}
        material={materials.shipEngineCyan}
        scale={[
          height * 0.4,
          config.type === 'freighter' ? 0.8 : config.type === 'transport' ? 0.5 : 0.3,
          height * 0.4,
        ]}
      />

      {/* Running lights for larger ships - using pooled sphere */}
      {config.type !== 'shuttle' && (
        <>
          <mesh
            position={[0, height * 0.5, depth * 0.4]}
            geometry={geometries.sphere}
            material={materials.emissiveGreen}
            scale={0.06}
          />
          <mesh
            position={[0, height * 0.5, -depth * 0.4]}
            geometry={geometries.sphere}
            material={materials.emissiveRed}
            scale={0.06}
          />
        </>
      )}

      {/* Freighter-specific engine pods - using pooled cylinder */}
      {config.type === 'freighter' && (
        <>
          <mesh
            position={[-width * 0.5, height * 0.3, depth * 0.35]}
            geometry={geometries.cylinder}
            material={materials.shipEngineOrange}
            scale={[0.25, 0.6, 0.25]}
          />
          <mesh
            position={[-width * 0.5, height * 0.3, -depth * 0.35]}
            geometry={geometries.cylinder}
            material={materials.shipEngineOrange}
            scale={[0.25, 0.6, 0.25]}
          />
          <mesh
            position={[-width * 0.5, -height * 0.3, depth * 0.35]}
            geometry={geometries.cylinder}
            material={materials.shipEngineOrange}
            scale={[0.25, 0.6, 0.25]}
          />
          <mesh
            position={[-width * 0.5, -height * 0.3, -depth * 0.35]}
            geometry={geometries.cylinder}
            material={materials.shipEngineOrange}
            scale={[0.25, 0.6, 0.25]}
          />
        </>
      )}
    </group>
  );
}
