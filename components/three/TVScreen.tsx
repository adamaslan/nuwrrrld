'use client';

import { useRef, useMemo, Suspense, useState, useCallback, useEffect } from 'react';
import { useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import { useVideoTexture, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { ScreenConfig } from '@/config/mediaConfig';

interface TVScreenProps {
  config: ScreenConfig;
}

function VideoMedia({ path }: { path: string }) {
  const { gl } = useThree();
  const texture = useVideoTexture(path, {
    loop: true,
    muted: true,
    start: true,
    crossOrigin: 'anonymous',
  });

  useEffect(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = gl.capabilities.getMaxAnisotropy();
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture, gl]);

  return (
    <meshBasicMaterial map={texture} toneMapped={false} side={THREE.FrontSide} />
  );
}

function ImageMedia({ path }: { path: string }) {
  const { gl } = useThree();
  const texture = useTexture(path);

  useEffect(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = gl.capabilities.getMaxAnisotropy();
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
    }
  }, [texture, gl]);

  return (
    <meshBasicMaterial map={texture} toneMapped={false} side={THREE.FrontSide} />
  );
}

function ScreenMedia({ type, path }: { type: 'image' | 'video'; path: string }) {
  if (type === 'video') {
    return <VideoMedia path={path} />;
  }
  return <ImageMedia path={path} />;
}

function FallbackMaterial() {
  return (
    <meshBasicMaterial color="#111118" />
  );
}

function useResponsiveScale() {
  const { size } = useThree();
  const aspectRatio = size.width / size.height;
  const isLandscape = aspectRatio > 1;
  const isWideScreen = aspectRatio > 1.5;

  return useMemo(() => {
    if (isWideScreen) {
      return 0.85;
    } else if (isLandscape) {
      return 0.9;
    }
    return 1.0;
  }, [isLandscape, isWideScreen]);
}

export default function TVScreen({ config }: TVScreenProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const scanlineRef = useRef<THREE.Mesh>(null);
  const screenMeshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  const responsiveScale = useResponsiveScale();

  // Interactive state
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [tapScale, setTapScale] = useState(1);
  const [glowIntensity, setGlowIntensity] = useState(0.3);

  // Calculate screen dimensions from aspect ratio (no distortion)
  const screenHeight = config.baseSize * responsiveScale;
  const screenWidth = screenHeight * config.aspectRatio;
  const frameWidth = screenWidth * 0.58;
  const frameHeight = screenHeight * 0.58;

  const frameGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = frameWidth;
    const h = frameHeight;
    const bevel = 0.1;

    shape.moveTo(-w + bevel, -h);
    shape.lineTo(w - bevel, -h);
    shape.quadraticCurveTo(w, -h, w, -h + bevel);
    shape.lineTo(w, h - bevel);
    shape.quadraticCurveTo(w, h, w - bevel, h);
    shape.lineTo(-w + bevel, h);
    shape.quadraticCurveTo(-w, h, -w, h - bevel);
    shape.lineTo(-w, -h + bevel);
    shape.quadraticCurveTo(-w, -h, -w + bevel, -h);

    const holeW = w * 0.9;
    const holeH = h * 0.85;
    const hole = new THREE.Path();
    hole.moveTo(-holeW, -holeH);
    hole.lineTo(holeW, -holeH);
    hole.lineTo(holeW, holeH);
    hole.lineTo(-holeW, holeH);
    shape.holes.push(hole);

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
  }, [frameWidth, frameHeight]);

  const bracketMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2d2d3a',
        metalness: 0.95,
        roughness: 0.4,
      }),
    []
  );

  // Handle tap/click on screen
  const handleTap = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setIsTapped(true);
    setTapScale(1.08);
    setGlowIntensity(1);

    // Reset after animation
    setTimeout(() => {
      setTapScale(1);
      setGlowIntensity(0.5);
    }, 150);

    setTimeout(() => {
      setIsTapped(false);
      setGlowIntensity(0.3);
    }, 400);
  }, []);

  // Handle pointer enter (hover)
  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  // Handle pointer leave
  const handlePointerLeave = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Animate glow
    if (glowRef.current) {
      const baseIntensity = isTapped ? glowIntensity : (isHovered ? 0.5 : 0.3);
      const pulseAmount = isTapped ? 0.3 : (isHovered ? 0.15 : 0.1);
      const intensity = baseIntensity + Math.sin(time * 2 + config.id) * pulseAmount;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = intensity;
    }

    // Animate scanline
    if (scanlineRef.current) {
      scanlineRef.current.position.y =
        ((time * 0.5 + config.id) % 1) * screenHeight - screenHeight / 2;
    }

    // Animate pulse ring on tap
    if (pulseRef.current && isTapped) {
      const pulseScale = 1 + (time % 0.4) * 0.5;
      pulseRef.current.scale.set(pulseScale, pulseScale, 1);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity =
        Math.max(0, 0.5 - (time % 0.4) * 1.2);
    }

    // Smooth scale animation
    if (groupRef.current) {
      const targetScale = tapScale * (isHovered ? 1.02 : 1);
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.15
      );
    }
  });

  // Glow color based on state
  const glowColor = isTapped ? '#ff00ff' : (isHovered ? '#00ffff' : '#00ffff');
  const bezelColor = isTapped ? '#ff00ff' : (isHovered ? '#00ffff' : '#00ffff');

  return (
    <group
      ref={groupRef}
      position={config.position}
      rotation={config.rotation}
    >
      {/* Interactive screen surface */}
      <mesh
        ref={screenMeshRef}
        position={[0, 0, 0.08]}
        onClick={handleTap}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <planeGeometry args={[screenWidth, screenHeight]} />
        <Suspense fallback={<FallbackMaterial />}>
          <ScreenMedia type={config.type} path={config.path} />
        </Suspense>
      </mesh>

      {/* Tap pulse effect */}
      {isTapped && (
        <mesh ref={pulseRef} position={[0, 0, 0.085]}>
          <ringGeometry args={[screenWidth * 0.3, screenWidth * 0.35, 32]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Hover/tap highlight overlay */}
      {(isHovered || isTapped) && (
        <mesh position={[0, 0, 0.082]}>
          <planeGeometry args={[screenWidth, screenHeight]} />
          <meshBasicMaterial
            color={isTapped ? '#ff00ff' : '#00ffff'}
            transparent
            opacity={isTapped ? 0.15 : 0.08}
          />
        </mesh>
      )}

      {/* Scanline effect overlay */}
      <mesh ref={scanlineRef} position={[0, 0, 0.09]}>
        <planeGeometry args={[screenWidth, 0.02]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={isHovered ? 0.06 : 0.03} />
      </mesh>

      {/* Screen bezel/border glow */}
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[screenWidth + 0.1, screenHeight + 0.1]} />
        <meshBasicMaterial
          color={bezelColor}
          transparent
          opacity={isHovered ? 0.1 : 0.05}
        />
      </mesh>

      {/* Metallic frame */}
      <mesh geometry={frameGeometry}>
        <meshStandardMaterial
          color={isHovered ? '#2a2a3e' : '#1a1a2e'}
          metalness={0.9}
          roughness={0.3}
          envMapIntensity={isHovered ? 0.8 : 0.5}
        />
      </mesh>

      {/* Edge glow behind frame */}
      <mesh ref={glowRef} position={[0, 0, -0.05]}>
        <planeGeometry args={[screenWidth * 1.15, screenHeight * 1.15]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Corner accent lights - more visible on hover */}
      <CornerLights
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        isHovered={isHovered}
        isTapped={isTapped}
      />

      {/* Industrial mounting brackets */}
      <MountingBrackets screenWidth={screenWidth} screenHeight={screenHeight} material={bracketMaterial} />

      {/* Small accent lights on frame */}
      <FrameAccentLights screenWidth={screenWidth} screenHeight={screenHeight} isHovered={isHovered} />
    </group>
  );
}

function CornerLights({
  screenWidth,
  screenHeight,
  isHovered,
  isTapped,
}: {
  screenWidth: number;
  screenHeight: number;
  isHovered: boolean;
  isTapped: boolean;
}) {
  const lightsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (lightsRef.current && (isHovered || isTapped)) {
      const time = state.clock.elapsedTime;
      lightsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.6 + Math.sin(time * 4 + i * Math.PI / 2) * 0.4;
      });
    }
  });

  if (!isHovered && !isTapped) return null;

  const color = isTapped ? '#ff00ff' : '#00ffff';
  const corners = [
    [-screenWidth / 2 - 0.05, screenHeight / 2 + 0.05],
    [screenWidth / 2 + 0.05, screenHeight / 2 + 0.05],
    [-screenWidth / 2 - 0.05, -screenHeight / 2 - 0.05],
    [screenWidth / 2 + 0.05, -screenHeight / 2 - 0.05],
  ];

  return (
    <group ref={lightsRef}>
      {corners.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.1]}>
          <circleGeometry args={[0.06, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function MountingBrackets({
  screenWidth,
  screenHeight,
  material,
}: {
  screenWidth: number;
  screenHeight: number;
  material: THREE.Material;
}) {
  return (
    <>
      {/* Top brackets */}
      <mesh
        position={[-screenWidth * 0.4, screenHeight * 0.5 + 0.1, -0.1]}
        material={material}
      >
        <boxGeometry args={[0.3, 0.15, 0.4]} />
      </mesh>
      <mesh
        position={[screenWidth * 0.4, screenHeight * 0.5 + 0.1, -0.1]}
        material={material}
      >
        <boxGeometry args={[0.3, 0.15, 0.4]} />
      </mesh>

      {/* Support cables/rods */}
      <mesh
        position={[-screenWidth * 0.4, screenHeight * 0.5 + 0.6, -0.1]}
        material={material}
      >
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
      </mesh>
      <mesh
        position={[screenWidth * 0.4, screenHeight * 0.5 + 0.6, -0.1]}
        material={material}
      >
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
      </mesh>

      {/* Side mounting plates */}
      <mesh position={[-screenWidth * 0.52, 0, -0.05]} material={material}>
        <boxGeometry args={[0.08, screenHeight * 0.6, 0.2]} />
      </mesh>
      <mesh position={[screenWidth * 0.52, 0, -0.05]} material={material}>
        <boxGeometry args={[0.08, screenHeight * 0.6, 0.2]} />
      </mesh>
    </>
  );
}

function FrameAccentLights({
  screenWidth,
  screenHeight,
  isHovered,
}: {
  screenWidth: number;
  screenHeight: number;
  isHovered: boolean;
}) {
  const light1Ref = useRef<THREE.Mesh>(null);
  const light2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const speed = isHovered ? 4 : 2;
    if (light1Ref.current) {
      (light1Ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.6 + Math.sin(t * speed) * 0.4;
    }
    if (light2Ref.current) {
      (light2Ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.6 + Math.sin(t * speed + Math.PI) * 0.4;
    }
  });

  return (
    <>
      <mesh ref={light1Ref} position={[-screenWidth * 0.48, -screenHeight * 0.48, 0.1]}>
        <circleGeometry args={[0.04, 8]} />
        <meshBasicMaterial color={isHovered ? '#00ff88' : '#00ff00'} transparent opacity={0.8} />
      </mesh>
      <mesh ref={light2Ref} position={[screenWidth * 0.48, -screenHeight * 0.48, 0.1]}>
        <circleGeometry args={[0.04, 8]} />
        <meshBasicMaterial color={isHovered ? '#ff4488' : '#ff0000'} transparent opacity={0.8} />
      </mesh>
    </>
  );
}
