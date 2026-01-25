'use client';

import { useRef, useMemo, Suspense, useState, useCallback, useEffect } from 'react';
import { useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import { useVideoTexture, useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ScreenConfig } from '@/config/mediaConfig';
import { RESPONSIVE_SCALE, OPACITY, CYBERPUNK_COLORS } from '@/config/constants';
import SideScreen from './SideScreen';

/**
 * Interaction timing constants for screen animations.
 */
const INTERACTION_TIMING = {
  /** Duration for tap scale reset (ms) */
  TAP_SCALE_RESET: 150,
  /** Duration for tap state reset (ms) */
  TAP_STATE_RESET: 400,
} as const;

interface TVScreenProps {
  config: ScreenConfig;
}

// Industrial back panel materials
const BACK_PANEL_MATERIALS = {
  darkMetal: new THREE.MeshStandardMaterial({
    color: '#1a1a24',
    metalness: 0.85,
    roughness: 0.4,
  }),
  ventGrille: new THREE.MeshStandardMaterial({
    color: '#2a2a3a',
    metalness: 0.9,
    roughness: 0.3,
  }),
  powerUnit: new THREE.MeshStandardMaterial({
    color: '#0a0a12',
    metalness: 0.8,
    roughness: 0.5,
  }),
  coolingUnit: new THREE.MeshStandardMaterial({
    color: '#1e1e2a',
    metalness: 0.7,
    roughness: 0.6,
  }),
  cable: new THREE.MeshStandardMaterial({
    color: '#0a0a0e',
    metalness: 0.2,
    roughness: 0.8,
  }),
  bracket: new THREE.MeshStandardMaterial({
    color: '#2d2d3a',
    metalness: 0.95,
    roughness: 0.3,
  }),
  warningLabel: new THREE.MeshBasicMaterial({
    color: '#ffcc00',
  }),
  serialPlate: new THREE.MeshStandardMaterial({
    color: '#3a3a4a',
    metalness: 0.9,
    roughness: 0.2,
  }),
};

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
      return RESPONSIVE_SCALE.WIDE_SCREEN;
    } else if (isLandscape) {
      return RESPONSIVE_SCALE.LANDSCAPE;
    }
    return RESPONSIVE_SCALE.DEFAULT;
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
  const [glowIntensity, setGlowIntensity] = useState<number>(OPACITY.MEDIUM);

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
      setGlowIntensity(OPACITY.HIGH);
    }, INTERACTION_TIMING.TAP_SCALE_RESET);

    setTimeout(() => {
      setIsTapped(false);
      setGlowIntensity(OPACITY.MEDIUM);
    }, INTERACTION_TIMING.TAP_STATE_RESET);
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
  const glowColor = isTapped ? CYBERPUNK_COLORS.MAGENTA : CYBERPUNK_COLORS.CYAN;
  const bezelColor = isTapped ? CYBERPUNK_COLORS.MAGENTA : CYBERPUNK_COLORS.CYAN;

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

      {/* Industrial back panel with all components */}
      <BackPanel screenWidth={screenWidth} screenHeight={screenHeight} screenId={config.id} />

      {/* Ambient lighting behind screen */}
      <ScreenBackLighting
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        isHovered={isHovered}
        isTapped={isTapped}
      />

      {/* Optional SideScreen panel */}
      {config.sidePanel?.enabled && (
        <SideScreen
          config={config.sidePanel}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          isHovered={isHovered}
          isTapped={isTapped}
        />
      )}
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

// ============================================
// INDUSTRIAL BACK PANEL COMPONENTS
// ============================================

function BackPanel({
  screenWidth,
  screenHeight,
  screenId,
}: {
  screenWidth: number;
  screenHeight: number;
  screenId: number;
}) {
  const panelDepth = -0.3;
  const panelThickness = 0.15;

  return (
    <group position={[0, 0, panelDepth]}>
      {/* Main back panel surface */}
      <mesh>
        <boxGeometry args={[screenWidth * 1.05, screenHeight * 1.05, panelThickness]} />
        <primitive object={BACK_PANEL_MATERIALS.darkMetal} attach="material" />
      </mesh>

      {/* Ventilation grilles */}
      <VentilationGrilles screenWidth={screenWidth} screenHeight={screenHeight} />

      {/* Power supply unit with LED indicators */}
      <PowerSupplyUnit screenWidth={screenWidth} screenHeight={screenHeight} screenId={screenId} />

      {/* Cable conduits */}
      <CableConduits screenWidth={screenWidth} screenHeight={screenHeight} />

      {/* Cooling system */}
      <CoolingSystem screenWidth={screenWidth} screenHeight={screenHeight} screenId={screenId} />

      {/* Structural brackets */}
      <StructuralBrackets screenWidth={screenWidth} screenHeight={screenHeight} />

      {/* Warning labels */}
      <WarningLabels screenWidth={screenWidth} screenHeight={screenHeight} />

      {/* Serial number plate */}
      <SerialPlate screenWidth={screenWidth} screenHeight={screenHeight} screenId={screenId} />
    </group>
  );
}

function VentilationGrilles({
  screenWidth,
  screenHeight,
}: {
  screenWidth: number;
  screenHeight: number;
}) {
  // Simplified: reduced bar count from 8 to 4 for RAM optimization
  const grilleBars = useMemo(() => {
    const bars = [];
    const barCount = 4;
    const grilleHeight = screenHeight * 0.15;
    const barSpacing = grilleHeight / barCount;

    for (let i = 0; i < barCount; i++) {
      bars.push({
        y: -grilleHeight / 2 + barSpacing * i + barSpacing / 2,
      });
    }
    return bars;
  }, [screenHeight]);

  const grilleWidth = screenWidth * 0.2;
  const grilleHeight = screenHeight * 0.15;

  return (
    <>
      {/* Left grille - simplified */}
      <group position={[-screenWidth * 0.3, screenHeight * 0.35, 0.08]}>
        <mesh>
          <boxGeometry args={[grilleWidth + 0.1, grilleHeight + 0.1, 0.03]} />
          <primitive object={BACK_PANEL_MATERIALS.ventGrille} attach="material" />
        </mesh>
        {grilleBars.map((bar, i) => (
          <mesh key={i} position={[0, bar.y, 0.04]}>
            <boxGeometry args={[grilleWidth * 0.9, 0.025, 0.02]} />
            <primitive object={BACK_PANEL_MATERIALS.darkMetal} attach="material" />
          </mesh>
        ))}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[grilleWidth * 0.8, grilleHeight * 0.8]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.05} />
        </mesh>
      </group>

      {/* Right grille - simplified */}
      <group position={[screenWidth * 0.3, screenHeight * 0.35, 0.08]}>
        <mesh>
          <boxGeometry args={[grilleWidth + 0.1, grilleHeight + 0.1, 0.03]} />
          <primitive object={BACK_PANEL_MATERIALS.ventGrille} attach="material" />
        </mesh>
        {grilleBars.map((bar, i) => (
          <mesh key={i} position={[0, bar.y, 0.04]}>
            <boxGeometry args={[grilleWidth * 0.9, 0.025, 0.02]} />
            <primitive object={BACK_PANEL_MATERIALS.darkMetal} attach="material" />
          </mesh>
        ))}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[grilleWidth * 0.8, grilleHeight * 0.8]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.05} />
        </mesh>
      </group>
    </>
  );
}

function PowerSupplyUnit({
  screenWidth,
  screenHeight,
  screenId,
}: {
  screenWidth: number;
  screenHeight: number;
  screenId: number;
}) {
  const ledsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ledsRef.current) {
      const time = state.clock.elapsedTime;
      ledsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        // Staggered LED blinking pattern
        const phase = (time * 2 + i * 0.5 + screenId) % 3;
        mat.opacity = phase < 2 ? 0.9 : 0.3;
      });
    }
  });

  const unitWidth = screenWidth * 0.35;
  const unitHeight = screenHeight * 0.12;

  return (
    <group position={[0, screenHeight * 0.15, 0.1]}>
      {/* Power unit box */}
      <mesh>
        <boxGeometry args={[unitWidth, unitHeight, 0.1]} />
        <primitive object={BACK_PANEL_MATERIALS.powerUnit} attach="material" />
      </mesh>

      {/* Power unit label area */}
      <mesh position={[0, unitHeight * 0.2, 0.051]}>
        <planeGeometry args={[unitWidth * 0.8, unitHeight * 0.3]} />
        <meshStandardMaterial color="#1a1a2a" metalness={0.5} roughness={0.8} />
      </mesh>

      {/* LED indicator lights */}
      <group ref={ledsRef} position={[0, -unitHeight * 0.2, 0.06]}>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[(i - 2) * (unitWidth * 0.15), 0, 0]}>
            <circleGeometry args={[0.03, 8]} />
            <meshBasicMaterial
              color={i < 3 ? '#00ff00' : i === 3 ? '#ffff00' : '#ff0000'}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>

      {/* Power connector */}
      <mesh position={[unitWidth * 0.35, 0, 0.06]}>
        <boxGeometry args={[0.08, 0.06, 0.04]} />
        <primitive object={BACK_PANEL_MATERIALS.cable} attach="material" />
      </mesh>
    </group>
  );
}

function CableConduits({
  screenWidth,
  screenHeight,
}: {
  screenWidth: number;
  screenHeight: number;
}) {
  const conduitWidth = screenWidth * 0.7;

  return (
    <group position={[0, 0, 0.08]}>
      {/* Main horizontal conduit */}
      <mesh>
        <boxGeometry args={[conduitWidth, 0.08, 0.05]} />
        <primitive object={BACK_PANEL_MATERIALS.darkMetal} attach="material" />
      </mesh>

      {/* Vertical cable runs - reduced from 4 to 2 for RAM optimization */}
      {[-0.2, 0.2].map((xOffset, i) => (
        <group key={i} position={[screenWidth * xOffset, -screenHeight * 0.15, 0]}>
          <mesh>
            <boxGeometry args={[0.05, screenHeight * 0.25, 0.03]} />
            <primitive object={BACK_PANEL_MATERIALS.cable} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CoolingSystem({
  screenWidth,
  screenHeight,
  screenId,
}: {
  screenWidth: number;
  screenHeight: number;
  screenId: number;
}) {
  const fanRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (fanRef.current) {
      // Rotate fan blades
      fanRef.current.rotation.z = state.clock.elapsedTime * 3 + screenId;
    }
  });

  const coolerWidth = screenWidth * 0.5;
  const coolerHeight = screenHeight * 0.18;

  return (
    <group position={[0, -screenHeight * 0.32, 0.1]}>
      {/* Cooling unit housing */}
      <mesh>
        <boxGeometry args={[coolerWidth, coolerHeight, 0.12]} />
        <primitive object={BACK_PANEL_MATERIALS.coolingUnit} attach="material" />
      </mesh>

      {/* Fan housing */}
      <mesh position={[0, 0, 0.07]}>
        <cylinderGeometry args={[coolerHeight * 0.35, coolerHeight * 0.35, 0.04, 16]} />
        <primitive object={BACK_PANEL_MATERIALS.darkMetal} attach="material" />
      </mesh>

      {/* Fan blades */}
      <mesh ref={fanRef} position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[coolerHeight * 0.25, 0.015, 4, 6]} />
        <meshStandardMaterial color="#3a3a4a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Fan center hub */}
      <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 8]} />
        <primitive object={BACK_PANEL_MATERIALS.bracket} attach="material" />
      </mesh>

      {/* Heat sink fins - reduced from 6 to 3 for RAM optimization */}
      {[...Array(3)].map((_, i) => (
        <mesh
          key={i}
          position={[(i - 1) * (coolerWidth * 0.2), 0, 0.01]}
        >
          <boxGeometry args={[0.03, coolerHeight * 0.8, 0.1]} />
          <primitive object={BACK_PANEL_MATERIALS.ventGrille} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function StructuralBrackets({
  screenWidth,
  screenHeight,
}: {
  screenWidth: number;
  screenHeight: number;
}) {
  return (
    <>
      {/* Left angled bracket */}
      <group position={[-screenWidth * 0.45, -screenHeight * 0.42, 0.08]}>
        {/* Vertical strut */}
        <mesh position={[0, 0.05, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.06, screenHeight * 0.15, 0.04]} />
          <primitive object={BACK_PANEL_MATERIALS.bracket} attach="material" />
        </mesh>
        {/* Base plate */}
        <mesh position={[-0.05, -0.08, 0]}>
          <boxGeometry args={[0.15, 0.04, 0.06]} />
          <primitive object={BACK_PANEL_MATERIALS.bracket} attach="material" />
        </mesh>
      </group>

      {/* Right angled bracket */}
      <group position={[screenWidth * 0.45, -screenHeight * 0.42, 0.08]}>
        <mesh position={[0, 0.05, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.06, screenHeight * 0.15, 0.04]} />
          <primitive object={BACK_PANEL_MATERIALS.bracket} attach="material" />
        </mesh>
        <mesh position={[0.05, -0.08, 0]}>
          <boxGeometry args={[0.15, 0.04, 0.06]} />
          <primitive object={BACK_PANEL_MATERIALS.bracket} attach="material" />
        </mesh>
      </group>

      {/* Top reinforcement bar */}
      <mesh position={[0, screenHeight * 0.48, 0.08]}>
        <boxGeometry args={[screenWidth * 0.8, 0.05, 0.04]} />
        <primitive object={BACK_PANEL_MATERIALS.bracket} attach="material" />
      </mesh>
    </>
  );
}

function WarningLabels({
  screenWidth,
  screenHeight,
}: {
  screenWidth: number;
  screenHeight: number;
}) {
  return (
    <>
      {/* HIGH VOLTAGE warning - left side */}
      <group position={[-screenWidth * 0.42, screenHeight * 0.1, 0.08]}>
        {/* Warning background */}
        <mesh>
          <planeGeometry args={[0.2, 0.08]} />
          <meshBasicMaterial color="#ffcc00" />
        </mesh>
        {/* Warning stripes */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[0.18, 0.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0, 0.025, 0.001]}>
          <planeGeometry args={[0.18, 0.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>

      {/* CAUTION label - right side */}
      <group position={[screenWidth * 0.42, screenHeight * 0.1, 0.08]}>
        <mesh>
          <planeGeometry args={[0.15, 0.06]} />
          <meshBasicMaterial color="#ff6600" />
        </mesh>
        {/* Exclamation symbol approximation */}
        <mesh position={[0, 0.005, 0.001]}>
          <planeGeometry args={[0.015, 0.03]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0, -0.02, 0.001]}>
          <circleGeometry args={[0.008, 8]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>
    </>
  );
}

function SerialPlate({
  screenWidth,
  screenHeight,
  screenId,
}: {
  screenWidth: number;
  screenHeight: number;
  screenId: number;
}) {
  return (
    <group position={[screenWidth * 0.35, -screenHeight * 0.45, 0.08]}>
      {/* Metal plate */}
      <mesh>
        <boxGeometry args={[0.25, 0.1, 0.01]} />
        <primitive object={BACK_PANEL_MATERIALS.serialPlate} attach="material" />
      </mesh>
      {/* Embossed text effect - simplified as lines */}
      <mesh position={[0, 0.02, 0.006]}>
        <planeGeometry args={[0.2, 0.015]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.02, 0.006]}>
        <planeGeometry args={[0.18, 0.015]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Corner screws */}
      {[[-0.1, 0.035], [0.1, 0.035], [-0.1, -0.035], [0.1, -0.035]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.01]}>
          <cylinderGeometry args={[0.008, 0.008, 0.01, 6]} />
          <meshStandardMaterial color="#4a4a5a" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================
// SCREEN BACK LIGHTING
// ============================================

function ScreenBackLighting({
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
  const mainLightRef = useRef<THREE.PointLight>(null);
  const accentLight1Ref = useRef<THREE.PointLight>(null);
  const accentLight2Ref = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const baseIntensity = isTapped ? 3 : isHovered ? 2 : 1.2;
    const pulseSpeed = isTapped ? 6 : isHovered ? 3 : 1.5;

    if (mainLightRef.current) {
      mainLightRef.current.intensity = baseIntensity + Math.sin(time * pulseSpeed) * 0.3;
    }
    if (accentLight1Ref.current) {
      accentLight1Ref.current.intensity = (baseIntensity * 0.6) + Math.sin(time * pulseSpeed + 1) * 0.2;
    }
    if (accentLight2Ref.current) {
      accentLight2Ref.current.intensity = (baseIntensity * 0.6) + Math.sin(time * pulseSpeed + 2) * 0.2;
    }
  });

  const mainColor = isTapped ? '#ff00ff' : '#00ffff';
  const accentColor1 = '#ff00ff';
  const accentColor2 = '#00ffff';

  return (
    <group position={[0, 0, -0.5]}>
      {/* Main center backlight */}
      <pointLight
        ref={mainLightRef}
        color={mainColor}
        intensity={1.2}
        distance={screenWidth * 2}
        decay={2}
      />

      {/* Top accent light */}
      <pointLight
        ref={accentLight1Ref}
        color={accentColor1}
        intensity={0.7}
        distance={screenWidth * 1.5}
        decay={2}
        position={[0, screenHeight * 0.4, 0]}
      />

      {/* Bottom accent light */}
      <pointLight
        ref={accentLight2Ref}
        color={accentColor2}
        intensity={0.7}
        distance={screenWidth * 1.5}
        decay={2}
        position={[0, -screenHeight * 0.4, 0]}
      />

      {/* Ambient glow plane behind screen */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[screenWidth * 1.3, screenHeight * 1.3]} />
        <meshBasicMaterial
          color={mainColor}
          transparent
          opacity={isHovered ? 0.15 : isTapped ? 0.2 : 0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Edge glow strips */}
      <mesh position={[0, screenHeight * 0.55, 0]}>
        <planeGeometry args={[screenWidth * 1.1, 0.15]} />
        <meshBasicMaterial color={accentColor1} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, -screenHeight * 0.55, 0]}>
        <planeGeometry args={[screenWidth * 1.1, 0.15]} />
        <meshBasicMaterial color={accentColor2} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
