'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMeshBasicMaterial, getMeshStandardMaterial } from '@/lib/type-guards';
import { SCENE_DIMENSIONS } from '@/config/constants';

/**
 * Background layer containing distant megastructures and light beams.
 *
 * Creates depth and atmosphere in the far background of the scene.
 */
export default function BackgroundLayer() {
  return (
    <>
      <DistantMegaStructures />
      <AtmosphericLightBeams />
    </>
  );
}

/**
 * Distant mega-structures with animated window lights and beacons.
 */
function DistantMegaStructures() {
  const structuresRef = useRef<THREE.Group>(null);

  const structures = useMemo(
    () => [
      {
        pos: [-60, 30, -80] as [number, number, number],
        size: [15, 120, 15] as [number, number, number],
        color: '#0a0a15',
      },
      {
        pos: [70, 40, -90] as [number, number, number],
        size: [20, 150, 20] as [number, number, number],
        color: '#0a0a18',
      },
      {
        pos: [0, 60, -110] as [number, number, number],
        size: [30, 200, 30] as [number, number, number],
        color: '#080810',
      },
      {
        pos: [-40, 50, -100] as [number, number, number],
        size: [25, 180, 25] as [number, number, number],
        color: '#080812',
      },
    ],
    []
  );

  useFrame((state) => {
    if (!structuresRef.current) return;
    const time = state.clock.elapsedTime;
    structuresRef.current.children.forEach((struct, i) => {
      // Subtle pulse on window lights
      const windowMesh = struct.children[1] as THREE.Mesh;
      if (windowMesh) {
        const mat = getMeshStandardMaterial(windowMesh);
        if (mat) {
          const intensity = 0.2 + Math.sin(time * 0.5 + i) * 0.1;
          mat.opacity = intensity;
          mat.emissiveIntensity = intensity * 2;
        }
      }
      // Pulse beacon
      const beaconMesh = struct.children[2] as THREE.Mesh;
      if (beaconMesh) {
        const mat = getMeshStandardMaterial(beaconMesh);
        if (mat) {
          mat.emissiveIntensity = 1 + Math.sin(time * 3 + i) * 0.5;
        }
      }
    });
  });

  return (
    <group ref={structuresRef}>
      {structures.map((struct, i) => (
        <group key={i} position={struct.pos}>
          {/* Main structure */}
          <mesh>
            <boxGeometry args={struct.size} />
            <meshStandardMaterial
              color={struct.color}
              metalness={0.95}
              roughness={0.3}
            />
          </mesh>

          {/* Window strip with emissive */}
          <mesh position={[0, 0, struct.size[2] / 2 + 0.1]}>
            <planeGeometry args={[struct.size[0] * 0.8, struct.size[1] * 0.9]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.4}
              transparent
              opacity={0.2}
              toneMapped={false}
            />
          </mesh>

          {/* Top beacon - emissive sphere replaces point light */}
          <mesh position={[0, struct.size[1] / 2 + 5, 0]}>
            <sphereGeometry args={[2, 8, 8]} />
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={1.5}
              toneMapped={false}
            />
          </mesh>

          {/* Beacon glow halo */}
          <mesh position={[0, struct.size[1] / 2 + 5, 0]}>
            <sphereGeometry args={[5, 8, 8]} />
            <meshBasicMaterial
              color="#ff0000"
              transparent
              opacity={0.1}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Atmospheric light beams emanating from the background.
 */
function AtmosphericLightBeams() {
  const beamsRef = useRef<THREE.Group>(null);

  const beams = useMemo(
    () => [
      {
        pos: [-50, 0, -70] as [number, number, number],
        color: '#00ffff',
        height: 150,
      },
      {
        pos: [60, 0, -80] as [number, number, number],
        color: '#ff00ff',
        height: 180,
      },
      {
        pos: [0, 0, -100] as [number, number, number],
        color: '#ff0066',
        height: 200,
      },
    ],
    []
  );

  useFrame((state) => {
    if (!beamsRef.current) return;
    const time = state.clock.elapsedTime;
    beamsRef.current.children.forEach((beam, i) => {
      const mesh = beam as THREE.Mesh;
      const mat = getMeshBasicMaterial(mesh);
      if (mat) {
        mat.opacity = 0.08 + Math.sin(time * 0.3 + i * 2) * 0.04;
      }
    });
  });

  return (
    <group ref={beamsRef}>
      {beams.map((beam, i) => (
        <mesh key={i} position={[beam.pos[0], beam.height / 2, beam.pos[2]]}>
          <cylinderGeometry args={[0.5, 3, beam.height, 8]} />
          <meshBasicMaterial
            color={beam.color}
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
