'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENE_DIMENSIONS } from '@/config/constants';

/**
 * Rain particle system that creates falling rain effect.
 *
 * Uses Points geometry with custom animation for efficient rendering.
 * Particles wrap around the scene for continuous effect.
 */
export default function Rain() {
  const rainRef = useRef<THREE.Points>(null);
  const rainCount = SCENE_DIMENSIONS.RAIN_COUNT;

  const positions = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
    }
    return pos;
  }, [rainCount]);

  // Animate rain falling down and wrapping
  useFrame(() => {
    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] -= 0.6;
        if (positions[i * 3 + 1] < -2) {
          positions[i * 3 + 1] = 60;
          positions[i * 3] = (Math.random() - 0.5) * 60;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={rainRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={rainCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#6688aa"
        size={0.1}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}
