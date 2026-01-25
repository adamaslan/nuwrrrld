'use client';

import { useRef, useMemo } from 'react';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Lighting from './Lighting';
import Environment from './Environment';
import TVScreen from './TVScreen';
import Particles from './Particles';
import { PoolProvider } from './pools';
import { SCREEN_CONFIGS } from '@/config/mediaConfig';
import { SceneErrorBoundary, MediaErrorBoundary } from './ErrorBoundary';

// Custom gradient material using shader
function GradientSkyDome() {
  const meshRef = useRef<THREE.Mesh>(null);

  const gradientMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0a0a1a) },
        bottomColor: { value: new THREE.Color(0x1a0510) },
        offset: { value: 20 },
        exponent: { value: 0.6 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide,
    });
  }, []);

  return (
    <mesh ref={meshRef} scale={[200, 200, 200]}>
      <sphereGeometry args={[1, 32, 32]} />
      <primitive object={gradientMaterial} attach="material" />
    </mesh>
  );
}

export default function SceneContent() {
  return (
    <PoolProvider>
      <SceneErrorBoundary
        onError={(error) => {
          console.error('Scene error:', error);
        }}
      >
        {/* Gradient sky dome background */}
        <GradientSkyDome />

        {/* Orbit controls for exploration */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={100}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI - 0.2}
          target={[0, 0, -5]}
        />

        {/* Lighting setup */}
        <Lighting />

        {/* Futuristic city environment */}
        <SceneErrorBoundary fallback={<group />}>
          <Environment />
        </SceneErrorBoundary>

        {/* TV Screens - 3 big screens at staggered depths */}
        {SCREEN_CONFIGS.map((config) => (
          <MediaErrorBoundary key={config.id}>
            <TVScreen config={config} />
          </MediaErrorBoundary>
        ))}

        {/* Atmospheric particles */}
        <Particles />
      </SceneErrorBoundary>
    </PoolProvider>
  );
}
