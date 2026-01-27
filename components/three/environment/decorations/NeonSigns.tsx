'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMeshStandardMaterial, getMeshBasicMaterial } from '@/lib/type-guards';
import { ANIMATION_SPEEDS, OPACITY, SCENE_DIMENSIONS } from '@/config/constants';

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

  // Neon signs array with positions and colors
  const signs = Array.from({ length: SCENE_DIMENSIONS.NEON_SIGN_COUNT }).map(
    (_, i) => {
      const positions = [
        {
          pos: [-8, 6, -6] as [number, number, number],
          color: '#ff00ff',
          size: [2.5, 0.7] as [number, number],
        },
        {
          pos: [9, 8, -10] as [number, number, number],
          color: '#00ffff',
          size: [3, 0.8] as [number, number],
        },
        {
          pos: [-12, 12, -15] as [number, number, number],
          color: '#ffaa00',
          size: [4, 1] as [number, number],
        },
        {
          pos: [7, 18, -20] as [number, number, number],
          color: '#00aaff',
          size: [5, 1.2] as [number, number],
        },
      ];
      return positions[i % positions.length];
    }
  );

  // Animate sign flickering and glow
  useFrame((state) => {
    if (!signsRef.current) return;
    const time = state.clock.elapsedTime;
    signsRef.current.children.forEach((sign, i) => {
      const mesh = sign.children[0] as THREE.Mesh;
      const glowMesh = sign.children[1] as THREE.Mesh;
      if (mesh) {
        const mat = getMeshStandardMaterial(mesh);
        if (mat) {
          const flicker =
            Math.sin(time * ANIMATION_SPEEDS.FLICKER + i * 5) > 0.9
              ? OPACITY.LOW
              : 1;
          const intensity =
            (0.7 + Math.sin(time * ANIMATION_SPEEDS.MEDIUM + i) * 0.3) * flicker;
          mat.opacity = intensity;
          mat.emissiveIntensity = intensity * 1.2;
        }
      }
      if (glowMesh) {
        const glowMat = getMeshBasicMaterial(glowMesh);
        if (glowMat) {
          const flicker =
            Math.sin(time * ANIMATION_SPEEDS.FLICKER + i * 5) > 0.9 ? 0.1 : 1;
          glowMat.opacity =
            (0.15 + Math.sin(time * ANIMATION_SPEEDS.MEDIUM + i) * 0.1) * flicker;
        }
      }
    });
  });

  return (
    <group ref={signsRef}>
      {signs.map((sign, i) => (
        <group key={i} position={sign.pos}>
          {/* Main sign with emissive material */}
          <mesh>
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
          <mesh position={[0, 0, -0.1]}>
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
