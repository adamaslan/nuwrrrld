'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMeshStandardMaterial, getMeshBasicMaterial } from '@/lib/type-guards';
import { ANIMATION_SPEEDS, OPACITY, SCENE_DIMENSIONS } from '@/config/constants';
import { flickerIntensity } from '@/lib/scene-utils';

/**
 * Represents a neon sign configuration
 */
interface NeonSign {
  pos: [number, number, number];
  color: string;
  size: [number, number];
}

/**
 * Animated neon signs scattered throughout the scene.
 *
 * Features:
 * - Flickering neon glow with emissive materials
 * - Glowing halo effect behind each sign
 * - Distributed across various positions in the scene
 */
export default function NeonSigns() {
  const signsRef = useRef<THREE.Group>(null);
  const signMeshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const glowMeshRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Neon signs array with positions and colors
  const signs: NeonSign[] = Array.from({
    length: SCENE_DIMENSIONS.NEON_SIGN_COUNT,
  }).map((_, i) => {
    const positions: NeonSign[] = [
      {
        pos: [-8, 6, -6],
        color: '#ff00ff',
        size: [2.5, 0.7],
      },
      {
        pos: [9, 8, -10],
        color: '#00ffff',
        size: [3, 0.8],
      },
      {
        pos: [-12, 12, -15],
        color: '#ffaa00',
        size: [4, 1],
      },
      {
        pos: [7, 18, -20],
        color: '#00aaff',
        size: [5, 1.2],
      },
    ];
    return positions[i % positions.length];
  });

  // Animate sign flickering and glow
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Update each sign and its glow
    signs.forEach((_, i) => {
      const signMesh = signMeshRefs.current[i];
      const glowMesh = glowMeshRefs.current[i];

      if (signMesh) {
        const mat = getMeshStandardMaterial(signMesh);
        if (mat) {
          const intensity = flickerIntensity(time, 0.7, 0.3, ANIMATION_SPEEDS.FLICKER, i * 0.5);
          mat.opacity = intensity;
          mat.emissiveIntensity = intensity * 1.2;
        }
      }

      if (glowMesh) {
        const glowMat = getMeshBasicMaterial(glowMesh);
        if (glowMat) {
          const intensity = flickerIntensity(time, 0.15, 0.1, ANIMATION_SPEEDS.MEDIUM, i * 0.5);
          glowMat.opacity = intensity;
        }
      }
    });
  });

  return (
    <group ref={signsRef}>
      {signs.map((sign, i) => (
        <group key={i} position={sign.pos}>
          {/* Main sign with emissive material */}
          <mesh
            ref={(el) => {
              if (el) signMeshRefs.current[i] = el;
            }}
          >
            <planeGeometry args={sign.size} />
            <meshStandardMaterial
              color={sign.color}
              emissive={sign.color}
              emissiveIntensity={1}
              transparent
              opacity={0.8}
              toneMapped={false}
            />
          </mesh>

          {/* Glow halo behind sign */}
          <mesh
            ref={(el) => {
              if (el) glowMeshRefs.current[i] = el;
            }}
            position={[0, 0, -0.1]}
          >
            <planeGeometry args={[sign.size[0] * 1.5, sign.size[1] * 2]} />
            <meshBasicMaterial
              color={sign.color}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
