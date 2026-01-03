'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Lighting from './Lighting';
import Environment from './Environment';
import TVScreen from './TVScreen';
import Particles from './Particles';
import { SCREEN_CONFIGS } from '@/config/mediaConfig';

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
    <>
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
      <Environment />

      {/* TV Screens - 3 big screens at staggered depths */}
      {SCREEN_CONFIGS.map((config) => (
        <TVScreen key={config.id} config={config} />
      ))}

      {/* Atmospheric particles */}
      <Particles />
    </>
  );
}
