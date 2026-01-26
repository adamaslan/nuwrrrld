'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getMeshBasicMaterial } from '@/lib/type-guards';
import { SCENE_DIMENSIONS } from '@/config/constants';

/**
 * Foreground layer containing floating debris and holographic data fragments.
 *
 * Creates visual depth with elements close to the camera.
 */
export default function ForegroundLayer() {
  return (
    <>
      <ForegroundDebris />
      <DataFragments />
    </>
  );
}

/**
 * Floating debris particles in the foreground.
 *
 * Uses Points geometry for efficient rendering of many small particles.
 */
function ForegroundDebris() {
  const debrisRef = useRef<THREE.Points>(null);
  const debrisCount = SCENE_DIMENSIONS.DEBRIS_COUNT;

  const positions = useMemo(() => {
    const pos = new Float32Array(debrisCount * 3);
    for (let i = 0; i < debrisCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = -30 + Math.random() * 80;
      pos[i * 3 + 2] = Math.random() * 8 - 2;
    }
    return pos;
  }, [debrisCount]);

  useFrame((state) => {
    if (debrisRef.current) {
      const time = state.clock.elapsedTime;
      debrisRef.current.rotation.y = time * 0.01;
      const positions = debrisRef.current.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < debrisCount; i++) {
        positions[i * 3 + 1] += Math.sin(time + i) * 0.002;
      }
      debrisRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={debrisRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={debrisCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffaa44"
        size={0.08}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Holographic data fragments - rotating wireframe shapes.
 */
function DataFragments() {
  const fragmentsRef = useRef<THREE.Group>(null);

  const fragments = useMemo(() => {
    const frags = [];
    for (let i = 0; i < SCENE_DIMENSIONS.DATA_FRAGMENTS_COUNT; i++) {
      frags.push({
        pos: [
          (Math.random() - 0.5) * 20,
          -25 + Math.random() * 60,
          Math.random() * 6 - 1,
        ] as [number, number, number],
        size: 0.3 + Math.random() * 0.5,
        color: ['#00ffff', '#ff00ff', '#00ff88', '#ffaa00'][
          Math.floor(Math.random() * 4)
        ],
        rotSpeed: 0.5 + Math.random() * 2,
      });
    }
    return frags;
  }, []);

  useFrame((state) => {
    if (!fragmentsRef.current) return;
    const time = state.clock.elapsedTime;
    fragmentsRef.current.children.forEach((child, i) => {
      child.rotation.y = time * fragments[i].rotSpeed;
      child.rotation.x = time * fragments[i].rotSpeed * 0.5;
      child.position.y = fragments[i].pos[1] + Math.sin(time + i) * 0.5;
      const mesh = child as THREE.Mesh;
      const mat = getMeshBasicMaterial(mesh);
      if (mat) {
        mat.opacity = 0.3 + Math.sin(time * 2 + i) * 0.2;
      }
    });
  });

  return (
    <group ref={fragmentsRef}>
      {fragments.map((frag, i) => (
        <mesh key={i} position={frag.pos}>
          <octahedronGeometry args={[frag.size, 0]} />
          <meshBasicMaterial
            color={frag.color}
            transparent
            opacity={0.4}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}
