'use client';

import { useRef, useMemo } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCameraContext } from '@/context/CameraContext';
import Lighting from './Lighting';
import Environment from './Environment';
import TVScreen from './TVScreen';
import Particles from './Particles';
import { PoolProvider } from './pools';
import { SCREEN_CONFIGS } from '@/config/mediaConfig';
import { SceneErrorBoundary, MediaErrorBoundary } from './ErrorBoundary';

// Cyberpunk sky dome — three-zone gradient, star field, animated horizon glow
function GradientSkyDome() {
  const meshRef = useRef<THREE.Mesh>(null);

  const gradientMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        // three altitude zones
        colorZenith:  { value: new THREE.Color(0x03010f) }, // near-black deep space
        colorMid:     { value: new THREE.Color(0x0d0040) }, // deep indigo
        colorHorizon: { value: new THREE.Color(0x2d003a) }, // dark magenta-purple
        colorGlow:    { value: new THREE.Color(0xff0080) }, // neon pink horizon rim
      },
      vertexShader: `
        varying vec3 vWorldDir;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldDir = normalize(worldPos.xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 colorZenith;
        uniform vec3 colorMid;
        uniform vec3 colorHorizon;
        uniform vec3 colorGlow;
        varying vec3 vWorldDir;

        // Cheap hash for star field
        float hash(vec2 p) {
          p = fract(p * vec2(234.35, 851.73));
          p += dot(p, p + 34.23);
          return fract(p.x * p.y);
        }

        float stars(vec3 dir) {
          // Project direction onto a grid
          vec2 uv = vec2(atan(dir.x, dir.z), asin(dir.y)) * 8.0;
          vec2 cell = floor(uv);
          vec2 f = fract(uv) - 0.5;
          float h = hash(cell);
          // Only show stars in upper hemisphere; vary brightness
          float brightness = step(0.97, h) * step(0.0, dir.y);
          float twinkle = 0.6 + 0.4 * sin(uTime * (3.0 + h * 7.0) + h * 6.28);
          float dist = length(f - (hash(cell + 0.1) - 0.5) * 0.6);
          return brightness * twinkle * smoothstep(0.12, 0.0, dist);
        }

        void main() {
          float h = vWorldDir.y; // -1 (nadir) to +1 (zenith)

          // Three-zone sky gradient
          vec3 sky = mix(colorHorizon, colorMid, smoothstep(-0.05, 0.35, h));
          sky = mix(sky, colorZenith, smoothstep(0.2, 0.9, h));

          // Pulsing neon horizon rim — thin band just below equator
          float horizonBand = smoothstep(0.18, 0.0, abs(h + 0.04));
          float pulse = 0.55 + 0.45 * sin(uTime * 0.7);
          sky += colorGlow * horizonBand * pulse * 0.6;

          // Horizontal scanline shimmer (very subtle)
          float scanline = 0.97 + 0.03 * sin((h + uTime * 0.04) * 420.0);
          sky *= scanline;

          // Star field
          float starGlow = stars(vWorldDir);
          sky += vec3(0.9, 0.85, 1.0) * starGlow;

          gl_FragColor = vec4(sky, 1.0);
        }
      `,
      side: THREE.BackSide,
    });
  }, []);

  useFrame((_, delta) => {
    gradientMaterial.uniforms.uTime.value += delta;
  });

  return (
    <mesh ref={meshRef} scale={[1200, 1200, 1200]}>
      <sphereGeometry args={[1, 32, 32]} />
      <primitive object={gradientMaterial} attach="material" />
    </mesh>
  );
}

export default function SceneContent() {
  const { controlsRef } = useCameraContext();

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
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={800}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI - 0.2}
          target={[0, 10, -5]}
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
