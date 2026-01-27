'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMeshBasicMaterial } from '@/lib/type-guards';
import { ANIMATION_SPEEDS, OPACITY, CYBERPUNK_COLORS } from '@/config/constants';

/**
 * Neon ground grid lines that create a cyberpunk aesthetic.
 *
 * Creates a grid of horizontal and vertical lines on the ground plane,
 * with subtle opacity pulsing animation.
 */
export default function NeonGridLines() {
  const linesRef = useRef<THREE.Group>(null);

  // Animate grid line opacity
  useFrame((state) => {
    if (!linesRef.current) return;
    const time = state.clock.elapsedTime;
    linesRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = getMeshBasicMaterial(mesh);
      if (mat) {
        mat.opacity =
          OPACITY.LOW + Math.sin(time * ANIMATION_SPEEDS.SLOW + i * 0.3) * 0.1;
      }
    });
  });

  // Narrowed for portrait view
  return (
    <group ref={linesRef}>
      {/* Horizontal grid lines */}
      {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((z, i) => (
        <mesh
          key={`h-${i}`}
          position={[0, -1.98, z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[80, 0.08]} />
          <meshBasicMaterial
            color={CYBERPUNK_COLORS.CYAN}
            transparent
            opacity={OPACITY.LOW}
          />
        </mesh>
      ))}

      {/* Vertical grid lines */}
      {[-30, -20, -10, 0, 10, 20, 30].map((x, i) => (
        <mesh
          key={`v-${i}`}
          position={[x, -1.98, -20]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        >
          <planeGeometry args={[80, 0.08]} />
          <meshBasicMaterial
            color={CYBERPUNK_COLORS.MAGENTA}
            transparent
            opacity={OPACITY.LOW}
          />
        </mesh>
      ))}
    </group>
  );
}
