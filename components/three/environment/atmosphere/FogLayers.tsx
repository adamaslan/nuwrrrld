'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMeshBasicMaterial } from '@/lib/type-guards';
import { SCENE_DIMENSIONS } from '@/config/constants';

/**
 * Atmospheric fog layers that provide depth and atmosphere to the scene.
 *
 * Multiple semi-transparent planes that subtly shift position and opacity
 * to create a dynamic atmospheric effect.
 */
export default function FogLayers() {
  const fogRef = useRef<THREE.Group>(null);

  // Animate fog layer movement and opacity
  useFrame((state) => {
    if (!fogRef.current) return;
    const time = state.clock.elapsedTime;
    fogRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      mesh.position.x = Math.sin(time * 0.05 + i * 2) * 8;
      mesh.position.z = -25 + Math.cos(time * 0.03 + i) * 4;
      const mat = getMeshBasicMaterial(mesh);
      if (mat) {
        mat.opacity = 0.025 + Math.sin(time * 0.1 + i) * 0.015;
      }
    });
  });

  return (
    <group ref={fogRef}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 5 + i * 12, -25]}>
          <planeGeometry args={[100, 15]} />
          <meshBasicMaterial
            color="#1a1a2e"
            transparent
            opacity={0.04}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
