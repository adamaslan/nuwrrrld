'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMeshBasicMaterial, getMeshStandardMaterial } from '@/lib/type-guards';
import { SCENE_DIMENSIONS } from '@/config/constants';
import { orbitalPosition, flickerIntensity } from '@/lib/scene-utils';

/**
 * Midground layer containing floating platforms and drone swarms.
 *
 * Creates interactive visual elements at mid-depth.
 */
export default function MidgroundLayer() {
  return (
    <>
      <FloatingPlatforms />
      <DroneSwarm />
    </>
  );
}

/**
 * Floating platforms with glowing edges and underside illumination.
 */
function FloatingPlatforms() {
  const platformsRef = useRef<THREE.Group>(null);

  const platforms = useMemo(
    () => [
      {
        pos: [-10, 20, -12] as [number, number, number],
        size: [5, 0.4, 4] as [number, number, number],
      },
      {
        pos: [12, 8, -15] as [number, number, number],
        size: [4, 0.3, 3] as [number, number, number],
      },
      {
        pos: [-8, -5, -10] as [number, number, number],
        size: [6, 0.5, 5] as [number, number, number],
      },
      {
        pos: [6, -18, -14] as [number, number, number],
        size: [4, 0.3, 3.5] as [number, number, number],
      },
      {
        pos: [-5, 32, -18] as [number, number, number],
        size: [5, 0.4, 4] as [number, number, number],
      },
      {
        pos: [9, -28, -12] as [number, number, number],
        size: [3.5, 0.3, 3] as [number, number, number],
      },
    ],
    []
  );

  useFrame((state) => {
    if (!platformsRef.current) return;
    const time = state.clock.elapsedTime;
    platformsRef.current.children.forEach((platform, i) => {
      platform.position.y = platforms[i].pos[1] + Math.sin(time * 0.3 + i * 2) * 0.5;
      platform.rotation.y = Math.sin(time * 0.1 + i) * 0.05;
      // Animate underside glow
      const undersideMesh = platform.children[2] as THREE.Mesh;
      if (undersideMesh) {
        const mat = getMeshStandardMaterial(undersideMesh);
        if (mat) {
          mat.emissiveIntensity = 0.6 + Math.sin(time * 2 + i) * 0.3;
        }
      }
    });
  });

  return (
    <group ref={platformsRef}>
      {platforms.map((plat, i) => (
        <group key={i} position={plat.pos}>
          {/* Platform base */}
          <mesh>
            <boxGeometry args={plat.size} />
            <meshStandardMaterial
              color="#1a1a28"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>

          {/* Edge lights with emissive */}
          <mesh position={[0, plat.size[1] / 2 + 0.01, 0]}>
            <boxGeometry
              args={[plat.size[0] * 0.9, 0.05, plat.size[2] * 0.9]}
            />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.8}
              transparent
              opacity={0.4}
              toneMapped={false}
            />
          </mesh>

          {/* Underside glow - emissive mesh replaces point light */}
          <mesh
            position={[0, -plat.size[1] / 2 - 0.1, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[plat.size[0] * 0.8, plat.size[2] * 0.8]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.8}
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Drone swarm with orbital movement patterns.
 */
function DroneSwarm() {
  const dronesRef = useRef<THREE.Group>(null);

  const drones = useMemo(() => {
    const d = [];
    for (let i = 0; i < SCENE_DIMENSIONS.DRONE_COUNT; i++) {
      d.push({
        basePos: [
          (Math.random() - 0.5) * 40,
          -25 + Math.random() * 60,
          -10 - Math.random() * 15,
        ] as [number, number, number],
        speed: 0.5 + Math.random() * 1.5,
        orbitRadius: 1 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? '#00ffff' : '#ff00ff',
      });
    }
    return d;
  }, []);

  useFrame((state) => {
    if (!dronesRef.current) return;
    const time = state.clock.elapsedTime;
    dronesRef.current.children.forEach((drone, i) => {
      const config = drones[i];

      // Use orbital position utility for smoother drone movement
      const [x, , z] = orbitalPosition(time, config.orbitRadius, config.speed, config.phase);
      drone.position.x = config.basePos[0] + x;
      drone.position.z = config.basePos[2] + z * 0.5;
      drone.position.y = config.basePos[1] + Math.sin(time * config.speed * 0.7 + config.phase) * 2;
      drone.rotation.y = time * 2;

      // Animate glow halo
      const glowMesh = drone.children[1] as THREE.Mesh;
      if (glowMesh) {
        const mat = getMeshBasicMaterial(glowMesh);
        if (mat) {
          mat.opacity = flickerIntensity(time, 0.2, 0.1, 4, i);
        }
      }
    });
  });

  return (
    <group ref={dronesRef}>
      {drones.map((drone, i) => (
        <group key={i} position={drone.basePos}>
          {/* Drone body with emissive */}
          <mesh>
            <octahedronGeometry args={[0.15, 0]} />
            <meshStandardMaterial
              color={drone.color}
              emissive={drone.color}
              emissiveIntensity={1.2}
              toneMapped={false}
            />
          </mesh>

          {/* Glow halo */}
          <mesh>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial
              color={drone.color}
              transparent
              opacity={0.2}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
