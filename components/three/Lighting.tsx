'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Lighting() {
  const spotLight1Ref = useRef<THREE.SpotLight>(null);
  const spotLight2Ref = useRef<THREE.SpotLight>(null);
  const spotLight3Ref = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (spotLight1Ref.current) {
      spotLight1Ref.current.intensity = 3 + Math.sin(t * 0.5) * 0.5;
    }
    if (spotLight2Ref.current) {
      spotLight2Ref.current.intensity = 2.5 + Math.sin(t * 0.4 + 1) * 0.4;
    }
    if (spotLight3Ref.current) {
      spotLight3Ref.current.intensity = 2 + Math.sin(t * 0.6 + 2) * 0.3;
    }
  });

  return (
    <>
      {/* Ambient city glow */}
      <ambientLight intensity={0.1} color="#1a1a3e" />

      {/* Main spotlight - illuminates center stacked screens from above */}
      <spotLight
        ref={spotLight1Ref}
        position={[0, 18, 8]}
        angle={0.5}
        penumbra={0.9}
        intensity={3}
        color="#00ffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Left accent - magenta */}
      <spotLight
        ref={spotLight2Ref}
        position={[-12, 10, 6]}
        angle={0.6}
        penumbra={0.8}
        intensity={2.5}
        color="#ff00ff"
        castShadow
      />

      {/* Right accent - warm */}
      <spotLight
        ref={spotLight3Ref}
        position={[12, 12, 5]}
        angle={0.6}
        penumbra={0.7}
        intensity={2}
        color="#ff8800"
        castShadow
      />

      {/* Screen illumination - key lights for each stacked screen */}
      <pointLight position={[0, 10, 2]} intensity={1} color="#00ffff" distance={20} />
      <pointLight position={[0, 5, 2]} intensity={1.2} color="#ff00ff" distance={20} />
      <pointLight position={[0, 0, 2]} intensity={1} color="#00ff88" distance={20} />

      {/* Rim lights behind screens */}
      <pointLight position={[0, 8, -6]} intensity={1.5} color="#ff00ff" distance={25} />
      <pointLight position={[-6, 4, -5]} intensity={1} color="#00ffff" distance={20} />
      <pointLight position={[6, 4, -4]} intensity={1} color="#00ff88" distance={20} />

      {/* City background atmospheric glow */}
      <pointLight position={[-35, 25, -40]} intensity={0.8} color="#ff00ff" distance={80} />
      <pointLight position={[35, 30, -45]} intensity={0.8} color="#00ffff" distance={80} />
      <pointLight position={[0, 40, -60]} intensity={0.6} color="#ffaa00" distance={100} />

      {/* Ground reflection */}
      <pointLight position={[0, -1, 5]} intensity={0.2} color="#0066ff" distance={25} />

      {/* Subtle fill from camera direction */}
      <directionalLight
        position={[0, 5, 15]}
        intensity={0.15}
        color="#ffffff"
      />
    </>
  );
}
