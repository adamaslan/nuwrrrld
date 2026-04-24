'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import SceneContent from './SceneContent';
import PostProcessing from './PostProcessing';

export default function Scene() {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      dpr={[1, 2]}
      camera={{
        fov: 60,
        near: 0.1,
        far: 800,
        position: [0, 22, 55],
      }}
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    >
      <fog attach="fog" args={['#0a0510', 150, 600]} />
      <Suspense fallback={null}>
        <SceneContent />
        <PostProcessing />
      </Suspense>
    </Canvas>
  );
}
