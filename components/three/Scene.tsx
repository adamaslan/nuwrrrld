'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import SceneContent from './SceneContent';
import PostProcessing from './PostProcessing';
import { SCROLL_CONFIG } from '@/config/mediaConfig';

export default function Scene() {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
        preserveDrawingBuffer: true,
      }}
      dpr={[1, 3]}
      camera={{
        fov: 70,
        near: 0.1,
        far: 300,
        position: [0, SCROLL_CONFIG.startY, 14],
      }}
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'pan-y', // Allow vertical scrolling
      }}
    >
      <fog attach="fog" args={['#1a0505', 40, 150]} />
      <Suspense fallback={null}>
        <SceneContent />
        <PostProcessing />
      </Suspense>
    </Canvas>
  );
}
