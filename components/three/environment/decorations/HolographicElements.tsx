'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMeshBasicMaterial } from '@/lib/type-guards';

/**
 * Floating holographic elements that rotate and animate.
 *
 * Features:
 * - Rotating torus geometries
 * - Pulsing opacity animation
 * - Wireframe rendering for holographic effect
 * - Multiple elements with different colors
 */
export default function HolographicElements() {
  const holoRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Animate holographic elements
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    holoRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.rotation.y = time * 0.3 + i;
      mesh.rotation.x = Math.sin(time * 0.5 + i) * 0.2;
      mesh.position.y = 10 + i * 4 + Math.sin(time * 0.6 + i) * 1;
      const mat = getMeshBasicMaterial(mesh);
      if (mat) {
        mat.opacity = 0.12 + Math.sin(time * 1.5 + i) * 0.08;
      }
    });
  });

  // Narrowed and more vertical for portrait
  const positions: [number, number, number][] = [
    [-6, 10, -6],
    [6, 14, -5],
    [0, 18, -12],
  ];

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) holoRefs.current[i] = el;
          }}
          position={pos}
        >
          <torusGeometry args={[1.2 + i * 0.2, 0.06, 8, 48]} />
          <meshBasicMaterial
            color={['#00ffff', '#ff00ff', '#00ff88'][i]}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
