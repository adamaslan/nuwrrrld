'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 500;

export default function Particles() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = Math.random() * 12 - 2;
      positions[i3 + 2] = (Math.random() - 0.5) * 20 - 5;

      velocities[i3] = (Math.random() - 0.5) * 0.008;
      velocities[i3 + 1] = Math.random() * 0.004 + 0.002;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.008;
    }

    return { positions, velocities };
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      posArray[i3] += velocities[i3];
      posArray[i3 + 1] += velocities[i3 + 1];
      posArray[i3 + 2] += velocities[i3 + 2];

      if (posArray[i3 + 1] > 10) {
        posArray[i3 + 1] = -2;
        posArray[i3] = (Math.random() - 0.5) * 30;
        posArray[i3 + 2] = (Math.random() - 0.5) * 20 - 5;
      }

      if (posArray[i3] > 15) posArray[i3] = -15;
      if (posArray[i3] < -15) posArray[i3] = 15;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#888899"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
