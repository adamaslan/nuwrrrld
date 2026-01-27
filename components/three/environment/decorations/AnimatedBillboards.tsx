'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMeshStandardMaterial, getMeshBasicMaterial } from '@/lib/type-guards';

/**
 * Animated billboards with color-cycling displays.
 *
 * Features:
 * - HSL color cycling animation
 * - Emissive material glow
 * - Metallic frame
 * - Glow halo effect
 * - Positioned at various heights in the background
 */
export default function AnimatedBillboards() {
  const billboardsRef = useRef<THREE.Group>(null);

  // Animate billboard colors and glow
  useFrame((state) => {
    if (!billboardsRef.current) return;
    const time = state.clock.elapsedTime;
    billboardsRef.current.children.forEach((billboard, i) => {
      const mesh = billboard.children[0] as THREE.Mesh;
      const glowMesh = billboard.children[2] as THREE.Mesh;
      if (mesh) {
        const mat = getMeshStandardMaterial(mesh);
        if (mat) {
          const hue = (time * 0.1 + i * 0.3) % 1;
          mat.color.setHSL(hue, 0.8, 0.5);
          mat.emissive.setHSL(hue, 0.8, 0.5);
          const intensity = 0.6 + Math.sin(time * 3 + i) * 0.2;
          mat.opacity = intensity;
          mat.emissiveIntensity = intensity * 1.5;
        }
      }
      if (glowMesh) {
        const glowMat = getMeshBasicMaterial(glowMesh);
        if (glowMat) {
          const hue = (time * 0.1 + i * 0.3) % 1;
          glowMat.color.setHSL(hue, 0.8, 0.5);
          glowMat.opacity = 0.1 + Math.sin(time * 3 + i) * 0.05;
        }
      }
    });
  });

  // Narrowed positions for portrait
  const billboards = [
    {
      pos: [-16, 22, -28] as [number, number, number],
      size: [6, 10] as [number, number],
    },
    {
      pos: [18, 28, -32] as [number, number, number],
      size: [8, 12] as [number, number],
    },
    {
      pos: [0, 35, -40] as [number, number, number],
      size: [10, 15] as [number, number],
    },
  ];

  return (
    <group ref={billboardsRef}>
      {billboards.map((bb, i) => (
        <group key={i} position={bb.pos}>
          {/* Billboard with emissive material */}
          <mesh>
            <planeGeometry args={bb.size} />
            <meshStandardMaterial
              color="#ff00ff"
              emissive="#ff00ff"
              emissiveIntensity={1}
              transparent
              opacity={0.7}
              toneMapped={false}
            />
          </mesh>

          {/* Frame */}
          <mesh position={[0, 0, -0.1]}>
            <boxGeometry args={[bb.size[0] + 0.4, bb.size[1] + 0.4, 0.25]} />
            <meshStandardMaterial color="#1a1a28" metalness={0.9} roughness={0.3} />
          </mesh>

          {/* Glow halo */}
          <mesh position={[0, 0, -0.15]}>
            <planeGeometry args={[bb.size[0] * 1.4, bb.size[1] * 1.3]} />
            <meshBasicMaterial
              color="#ff00ff"
              transparent
              opacity={0.12}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
