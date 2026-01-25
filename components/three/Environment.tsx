'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePools } from './pools';
import { SCENE_DIMENSIONS, ANIMATION_SPEEDS, OPACITY, BUILDING_CONFIG, CYBERPUNK_COLORS, SHIP_SCALE } from '@/config/constants';
import type { PoolsProps, ShipConfig, CyberpunkBuildingProps } from '@/types/three-scene';
import { getMeshBasicMaterial, getMeshStandardMaterial } from '@/lib/type-guards';

export default function Environment() {
  return (
    <>
      {/* Ground plane - reflective cyberpunk street */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
        receiveShadow
      >
        <planeGeometry args={[SCENE_DIMENSIONS.GROUND_PLANE_WIDTH, SCENE_DIMENSIONS.GROUND_PLANE_HEIGHT]} />
        <meshStandardMaterial
          color="#080810"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* FOREGROUND LAYER (Z = 0 to -5) */}
      <ForegroundDebris />
      <DataFragments />

      {/* MID-GROUND LAYER (Z = -10 to -20) */}
      <FloatingPlatforms />
      <DroneSwarm />

      {/* DEEP BACKGROUND LAYER (Z = -60 to -100) */}
      <DistantMegaStructures />
      <AtmosphericLightBeams />

      {/* Futuristic city skyline */}
      <CityBuildings />

      {/* Animated neon signs */}
      <NeonSigns />

      {/* Neon ground lines */}
      <NeonGridLines />

      {/* Rain effect */}
      <Rain />

      {/* Floating holographic elements */}
      <HolographicElements />

      {/* Flying Ships - 3 size classes */}
      <FlyingShips />

      {/* Animated billboards */}
      <AnimatedBillboards />

      {/* Atmospheric fog layers */}
      <FogLayers />

      {/* Ground puddle reflections */}
      <Puddles />

      {/* REVERSE-FACING LAYER: Opposite direction with enhanced lighting */}
      <OppositeEnvironmentLayer />
    </>
  );
}

function CityBuildings() {
  const { geometries, materials } = usePools();

  // Use pooled building material instead of creating new one
  const buildingMaterial = materials.buildingDark;

  const buildings = useMemo(() => {
    const b = [];
    const seed = 12345;
    const random = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000;
      return x - Math.floor(x);
    };

    // Left side buildings
    for (let i = 0; i < SCENE_DIMENSIONS.LEFT_BUILDINGS; i++) {
      const height = 25 + random(i) * 50;
      const width = 3 + random(i + 100) * 4;
      const depth = 3 + random(i + 200) * 4;
      b.push({
        position: [-12 - i * 6 + random(i + 300) * 2, height / 2 - 2, -12 - random(i + 400) * 20] as [number, number, number],
        size: [width, height, depth] as [number, number, number],
        windowColor: ['#00ffff', '#ff00ff', '#ffaa00', '#00ff88'][Math.floor(random(i + 500) * 4)],
        hasAntenna: random(i + 600) > BUILDING_CONFIG.ANTENNA_THRESHOLD,
      });
    }
    // Right side buildings
    for (let i = 0; i < SCENE_DIMENSIONS.RIGHT_BUILDINGS; i++) {
      const height = 25 + random(i + 1000) * 50;
      const width = 3 + random(i + 1100) * 4;
      const depth = 3 + random(i + 1200) * 4;
      b.push({
        position: [12 + i * 6 + random(i + 1300) * 2, height / 2 - 2, -12 - random(i + 1400) * 20] as [number, number, number],
        size: [width, height, depth] as [number, number, number],
        windowColor: ['#00ffff', '#ff00ff', '#ffaa00', '#00ff88'][Math.floor(random(i + 1500) * 4)],
        hasAntenna: random(i + 1600) > 0.6,
      });
    }
    // Background mega-buildings
    for (let i = 0; i < SCENE_DIMENSIONS.BACKGROUND_BUILDINGS; i++) {
      const height = 50 + random(i + 2000) * 70;
      const width = 5 + random(i + 2100) * 6;
      const depth = 5 + random(i + 2200) * 6;
      b.push({
        position: [-30 + i * 10 + random(i + 2300) * 3, height / 2 - 2, -35 - random(i + 2400) * 15] as [number, number, number],
        size: [width, height, depth] as [number, number, number],
        windowColor: ['#00ffff', '#ff00ff', '#ffaa00', '#00ff88'][Math.floor(random(i + 2500) * 4)],
        hasAntenna: random(i + 2600) > BUILDING_CONFIG.ANTENNA_THRESHOLD,
      });
    }
    return b;
  }, []);

  return (
    <group>
      {buildings.map((building, i) => (
        <CyberpunkBuilding
          key={i}
          position={building.position}
          size={building.size}
          material={buildingMaterial}
          windowColor={building.windowColor}
          index={i}
          hasAntenna={building.hasAntenna}
          geometries={geometries}
          materials={materials}
        />
      ))}
    </group>
  );
}

function CyberpunkBuilding(props: CyberpunkBuildingProps) {
  const { position, size, material, windowColor, index, hasAntenna, geometries, materials } = props;
  const windowRefs = useRef<(THREE.Mesh | null)[]>([]);
  const accentRef = useRef<THREE.Mesh>(null);
  const antennaLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    windowRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = getMeshBasicMaterial(mesh);
      if (!mat) return;
      const flicker = Math.sin(time * (2 + index * 0.1) + i * 0.5) > 0.3 ? 1 : OPACITY.LOW;
      mat.opacity = (0.4 + Math.sin(time * ANIMATION_SPEEDS.SLOW + index + i * 0.2) * 0.3) * flicker;
    });
    if (accentRef.current) {
      const mat = getMeshBasicMaterial(accentRef.current);
      if (mat) {
        mat.opacity = OPACITY.HIGH + Math.sin(time * ANIMATION_SPEEDS.MEDIUM + index) * 0.3;
      }
    }
    if (antennaLightRef.current) {
      antennaLightRef.current.intensity = OPACITY.HIGH + Math.sin(time * ANIMATION_SPEEDS.VERY_FAST + index) * 0.3;
    }
  });

  const windowRows = Math.floor(size[1] / 2.5);
  const windowCols = Math.floor(size[0] / 1.8);

  // Get pooled window material based on color
  const getWindowMaterial = () => {
    switch (windowColor) {
      case '#ff00ff': return materials.windowMagenta;
      case '#ffaa00': return materials.windowAmber;
      case '#00ff88': return materials.windowGreen;
      default: return materials.windowCyan;
    }
  };
  const windowMaterial = getWindowMaterial();

  return (
    <group position={position}>
      {/* Main hull - using pooled box geometry with scale */}
      <mesh
        geometry={geometries.box}
        material={material}
        scale={size}
        castShadow
      />

      {/* Windows - using pooled windowPlane geometry */}
      {Array.from({ length: Math.min(windowRows, 15) }).map((_, row) =>
        Array.from({ length: Math.min(windowCols, 4) }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            ref={(el) => {
              if (el) windowRefs.current[row * windowCols + col] = el;
            }}
            position={[
              -size[0] / 2 + 0.9 + col * 1.6,
              -size[1] / 2 + 2 + row * 2.5,
              size[2] / 2 + 0.01,
            ]}
            geometry={geometries.windowPlane}
            material={windowMaterial}
          />
        ))
      )}

      {/* Accent stripe - using pooled plane geometry with scale */}
      <mesh
        ref={accentRef}
        position={[0, size[1] / 2 - 1, size[2] / 2 + 0.02]}
        geometry={geometries.plane}
        material={windowMaterial}
        scale={[size[0] * 0.95, 0.4, 1]}
      />

      {/* Mid-building stripe for tall buildings */}
      {size[1] > 30 && (
        <mesh
          position={[0, 0, size[2] / 2 + 0.02]}
          geometry={geometries.plane}
          material={windowMaterial}
          scale={[size[0] * 0.95, 0.2, 1]}
        />
      )}

      {/* Antenna using pooled geometries */}
      {hasAntenna && (
        <group position={[0, size[1] / 2, 0]}>
          <mesh
            geometry={geometries.cylinder}
            material={materials.antennaMetal}
            scale={[0.15, 5, 0.15]}
          />
          {/* Antenna light - using pooled sphere and emissive material */}
          <mesh
            position={[0, 2.8, 0]}
            geometry={geometries.sphere}
            material={materials.emissiveRed}
            scale={0.15}
          />
        </group>
      )}
    </group>
  );
}

function NeonSigns() {
  const signsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!signsRef.current) return;
    const time = state.clock.elapsedTime;
    signsRef.current.children.forEach((sign, i) => {
      const mesh = sign.children[0] as THREE.Mesh;
      const glowMesh = sign.children[1] as THREE.Mesh;
      if (mesh) {
        const mat = getMeshStandardMaterial(mesh);
        if (mat) {
          const flicker = Math.sin(time * ANIMATION_SPEEDS.FLICKER + i * 5) > 0.9 ? OPACITY.LOW : 1;
          const intensity = (0.7 + Math.sin(time * ANIMATION_SPEEDS.MEDIUM + i) * 0.3) * flicker;
          mat.opacity = intensity;
          mat.emissiveIntensity = intensity * 1.2;
        }
      }
      if (glowMesh) {
        const glowMat = getMeshBasicMaterial(glowMesh);
        if (glowMat) {
          const flicker = Math.sin(time * ANIMATION_SPEEDS.FLICKER + i * 5) > 0.9 ? 0.1 : 1;
          glowMat.opacity = (0.15 + Math.sin(time * ANIMATION_SPEEDS.MEDIUM + i) * 0.1) * flicker;
        }
      }
    });
  });

  // Neon signs array
  const signs = Array.from({ length: SCENE_DIMENSIONS.NEON_SIGN_COUNT }).map((_, i) => {
    const positions = [
      { pos: [-8, 6, -6] as [number, number, number], color: '#ff00ff', size: [2.5, 0.7] as [number, number] },
      { pos: [9, 8, -10] as [number, number, number], color: '#00ffff', size: [3, 0.8] as [number, number] },
      { pos: [-12, 12, -15] as [number, number, number], color: '#ffaa00', size: [4, 1] as [number, number] },
      { pos: [7, 18, -20] as [number, number, number], color: '#00aaff', size: [5, 1.2] as [number, number] },
    ];
    return positions[i % positions.length];
  });


  return (
    <group ref={signsRef}>
      {signs.map((sign, i) => (
        <group key={i} position={sign.pos}>
          {/* Main sign with emissive material - replaces point light */}
          <mesh>
            <planeGeometry args={sign.size} />
            <meshStandardMaterial
              color={sign.color}
              emissive={sign.color}
              emissiveIntensity={1}
              transparent
              opacity={0.8}
              toneMapped={false}
            />
          </mesh>
          {/* Glow halo behind sign - provides ambient light effect */}
          <mesh position={[0, 0, -0.1]}>
            <planeGeometry args={[sign.size[0] * 1.5, sign.size[1] * 2]} />
            <meshBasicMaterial
              color={sign.color}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function NeonGridLines() {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!linesRef.current) return;
    const time = state.clock.elapsedTime;
    linesRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = getMeshBasicMaterial(mesh);
      if (mat) {
        mat.opacity = OPACITY.LOW + Math.sin(time * ANIMATION_SPEEDS.SLOW + i * 0.3) * 0.1;
      }
    });
  });

  // Narrowed for portrait view
  return (
    <group ref={linesRef}>
      {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((z, i) => (
        <mesh
          key={`h-${i}`}
          position={[0, -1.98, z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[80, 0.08]} />
          <meshBasicMaterial color={CYBERPUNK_COLORS.CYAN} transparent opacity={OPACITY.LOW} />
        </mesh>
      ))}
      {[-30, -20, -10, 0, 10, 20, 30].map((x, i) => (
        <mesh
          key={`v-${i}`}
          position={[x, -1.98, -20]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        >
          <planeGeometry args={[80, 0.08]} />
          <meshBasicMaterial color={CYBERPUNK_COLORS.MAGENTA} transparent opacity={OPACITY.LOW} />
        </mesh>
      ))}
    </group>
  );
}

function Rain() {
  const rainRef = useRef<THREE.Points>(null);
  const rainCount = SCENE_DIMENSIONS.RAIN_COUNT;

  const positions = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
    }
    return pos;
  }, [rainCount]);

  useFrame(() => {
    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] -= 0.6;
        if (positions[i * 3 + 1] < -2) {
          positions[i * 3 + 1] = 60;
          positions[i * 3] = (Math.random() - 0.5) * 60;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={rainRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={rainCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#6688aa"
        size={0.1}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

function HolographicElements() {
  const holoRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    holoRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.rotation.y = time * 0.3 + i;
      mesh.rotation.x = Math.sin(time * 0.5 + i) * 0.2;
      mesh.position.y = 10 + i * 4 + Math.sin(time * 0.6 + i) * 1;
      const mat = getMeshBasicMaterial(mesh);
      if (mat) {
        mat.opacity = 0.12 + Math.sin(time * 1.5 + i) * 0.08;
      }
    });
  });

  // Narrowed and more vertical for portrait
  const positions: [number, number, number][] = [
    [-6, 10, -6],
    [6, 14, -5],
    [0, 18, -12],
  ];

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) holoRefs.current[i] = el;
          }}
          position={pos}
        >
          <torusGeometry args={[1.2 + i * 0.2, 0.06, 8, 48]} />
          <meshBasicMaterial
            color={['#00ffff', '#ff00ff', '#00ff88'][i]}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ShipConfig is imported from @/types/three-scene

function FlyingShips() {
  const shipsRef = useRef<THREE.Group>(null);
  const { geometries, materials } = usePools();

  // Generate ship fleet with 3 size classes
  const ships: ShipConfig[] = useMemo(() => {
    const fleet: ShipConfig[] = [];
    const seed = 54321;
    const random = (i: number) => {
      const x = Math.sin(seed + i * 7777) * 10000;
      return x - Math.floor(x);
    };

    // Small Shuttles
    for (let i = 0; i < SHIP_SCALE.SHUTTLE_COUNT; i++) {
      fleet.push({
        type: 'shuttle',
        size: [(0.8 + random(i) * 0.4) * 1.5, (0.25 + random(i + 10) * 0.1) * 1.5, (0.4 + random(i + 20) * 0.2) * 1.5],
        speed: 0.28 + random(i + 30) * 0.1,
        color: ['#2a2a40', '#1a2a3a', '#2a1a3a'][i % 3],
        lightIntensity: 0.5,
        lightColor: random(i + 40) > 0.5 ? '#ffffff' : '#ffeecc',
        engineColor: '#00ccff',
        yBase: 6 + random(i + 50) * 8,
        zLane: -8 - random(i + 60) * 15,
        direction: i % 2 === 0 ? 1 : -1,
        offset: i * 10,
      });
    }

    // Medium Transports
    for (let i = 0; i < SHIP_SCALE.TRANSPORT_COUNT; i++) {
      fleet.push({
        type: 'transport',
        size: [(2.2 + random(i + 100) * 0.6) * 1.5, (0.5 + random(i + 110) * 0.2) * 1.5, (1.0 + random(i + 120) * 0.4) * 1.5],
        speed: 0.15 + random(i + 130) * 0.08,
        color: ['#1a1a28', '#281a28', '#1a2828'][i % 3],
        lightIntensity: 0.9,
        lightColor: '#ffffff',
        engineColor: '#00aaff',
        yBase: 12 + random(i + 140) * 10,
        zLane: -15 - random(i + 150) * 12,
        direction: i % 2 === 0 ? 1 : -1,
        offset: i * 15,
      });
    }

    // Large Freighters
    for (let i = 0; i < SHIP_SCALE.FREIGHTER_COUNT; i++) {
      fleet.push({
        type: 'freighter',
        size: [(4.0 + random(i + 200) * 1.5) * 1.5, (1.0 + random(i + 210) * 0.5) * 1.5, (2.0 + random(i + 220) * 0.8) * 1.5],
        speed: 0.06 + random(i + 230) * 0.04,
        color: ['#0a0a1a', '#1a0a1a', '#0a1a1a'][i % 3],
        lightIntensity: 1.5,
        lightColor: '#ffddaa',
        engineColor: '#ff6600',
        yBase: 20 + random(i + 240) * 15,
        zLane: -25 - random(i + 250) * 10,
        direction: i % 2 === 0 ? 1 : -1,
        offset: i * 25,
      });
    }

    // Capital Ships (9x size) - 3 ultra-massive ships with different colors/geometries
    // Capital Ship 1: Deep Navy Blue with Orange Engines
    fleet.push({
      type: 'dreadnought',
      size: [
        (4.0 + random(300) * 1.5) * 9,     // 36-49.5 units - massive width
        (1.2 + random(301) * 0.5) * 9,     // 10.8-13.5 units - tall
        (2.5 + random(302) * 1.0) * 9      // 22.5-29.5 units - deep
      ],
      speed: 0.04 + random(303) * 0.015,
      color: '#1a2a3a',  // Deep navy blue
      lightIntensity: 1.5,
      lightColor: '#ffddaa',
      engineColor: '#ff6600',  // Orange engines
      yBase: 32 + random(304) * 8,
      zLane: -50 - random(305) * 15,
      direction: 1,
      offset: 0,
    });

    // Capital Ship 2: Dark Purple with Cyan Engines
    fleet.push({
      type: 'dreadnought',
      size: [
        (3.8 + random(310) * 1.4) * 9,     // 34.2-48.6 units
        (1.3 + random(311) * 0.6) * 9,     // 11.7-14.1 units
        (2.6 + random(312) * 1.1) * 9      // 23.4-31.5 units
      ],
      speed: 0.03 + random(313) * 0.012,
      color: '#2a1a3a',  // Dark purple
      lightIntensity: 1.4,
      lightColor: '#ddaaff',  // Purple accent light
      engineColor: '#00ccff',  // Cyan engines
      yBase: 35 + random(314) * 8,
      zLane: -55 - random(315) * 12,
      direction: -1,
      offset: 40,
    });

    // Capital Ship 3: Dark Gray with Green Engines
    fleet.push({
      type: 'dreadnought',
      size: [
        (4.1 + random(320) * 1.6) * 9,     // 36.9-50.5 units
        (1.1 + random(321) * 0.4) * 9,     // 9.9-12.6 units
        (2.4 + random(322) * 0.9) * 9      // 21.6-28.5 units
      ],
      speed: 0.035 + random(323) * 0.014,
      color: '#1a1a28',  // Dark gray
      lightIntensity: 1.6,
      lightColor: '#aaffdd',  // Green-tinted light
      engineColor: '#00ff88',  // Green engines
      yBase: 29 + random(324) * 9,
      zLane: -45 - random(325) * 18,
      direction: 1,
      offset: 20,
    });

    return fleet;
  }, []);

  useFrame((state) => {
    if (!shipsRef.current) return;
    const time = state.clock.elapsedTime;
    shipsRef.current.children.forEach((shipGroup, i) => {
      const config = ships[i];
      const xRange = config.type === 'freighter' ? 50 : config.type === 'transport' ? 45 : 40;

      // Movement with wrapping - narrower for portrait
      const rawX = (time * config.speed * config.direction * 12 + config.offset) % (xRange * 2);
      shipGroup.position.x = rawX - xRange;
      shipGroup.position.z = config.zLane;
      shipGroup.position.y = config.yBase + Math.sin(time * 1.5 + i) * 0.4;
      shipGroup.rotation.y = config.direction > 0 ? 0 : Math.PI;

      // Slight banking on turns
      shipGroup.rotation.z = Math.sin(time * 2 + i) * 0.05 * config.direction;
    });
  });

  return (
    <group ref={shipsRef}>
      {ships.map((config, i) => (
        <Ship key={i} config={config} index={i} geometries={geometries} materials={materials} />
      ))}
    </group>
  );
}

function CapitalShip({ config, index, geometries, materials }: { config: ShipConfig; index: number } & PoolsProps) {
  const beaconRef = useRef<THREE.PointLight>(null);
  const engineRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (beaconRef.current) {
      const t = state.clock.elapsedTime;
      beaconRef.current.intensity = 1 + Math.sin(t * 3 + index) * 0.5;
    }
    if (engineRef.current) {
      const t = state.clock.elapsedTime;
      engineRef.current.intensity = config.lightIntensity * (0.7 + Math.sin(t * 6 + index) * 0.3);
    }
  });

  const [width, height, depth] = config.size;

  // Pre-compute positions for engine pods
  const enginePods = useMemo(() => [
    { x: -width * 0.35, z: depth * 0.35 },
    { x: -width * 0.35, z: -depth * 0.35 },
    { x: width * 0.25, z: depth * 0.35 },
    { x: width * 0.25, z: -depth * 0.35 },
  ], [width, depth]);

  // Pre-compute positions for superstructures
  const towers = useMemo(() => [
    { pos: [-width * 0.2, height * 0.6, 0] as [number, number, number], scale: [width * 0.3, height * 0.8, depth * 0.4] as [number, number, number] },
    { pos: [width * 0.2, height * 0.5, 0] as [number, number, number], scale: [width * 0.25, height * 0.6, depth * 0.35] as [number, number, number] },
  ], [width, height, depth]);

  // Get ship hull material based on color
  const getHullMaterial = () => {
    if (config.color.includes('2a3a') || config.color.includes('1a2a')) return materials.shipHullNavy;
    if (config.color.includes('1a3a') || config.color.includes('2a1a')) return materials.shipHullPurple;
    if (config.color.includes('1a28') || config.color.includes('2828')) return materials.shipHullGray;
    return materials.shipHullDark;
  };
  const hullMaterial = getHullMaterial();

  // Get engine material based on engine color
  const getEngineMaterial = () => {
    if (config.engineColor.includes('ff66') || config.engineColor.includes('ff88')) return materials.shipEngineOrange;
    if (config.engineColor.includes('00cc') || config.engineColor.includes('00ff')) return materials.shipEngineCyan;
    if (config.engineColor.includes('00ff88')) return materials.shipEngineGreen;
    return materials.shipEngineCyan;
  };
  const engineMaterial = getEngineMaterial();

  return (
    <group>
      {/* MAIN HULL - using pooled box geometry with scale */}
      <mesh
        geometry={geometries.box}
        material={hullMaterial}
        scale={[width, height, depth]}
        castShadow
      />

      {/* SUPERSTRUCTURE TOWERS (2) - using pooled geometry */}
      {towers.map((tower, i) => (
        <mesh
          key={`tower-${i}`}
          position={tower.pos}
          geometry={geometries.box}
          material={hullMaterial}
          scale={tower.scale}
          castShadow
        />
      ))}

      {/* COMMAND BRIDGE - using pooled geometry */}
      <mesh
        position={[0, height * 0.75, 0]}
        geometry={geometries.box}
        material={materials.shipHullDark}
        scale={[width * 0.4, height * 0.3, depth * 0.3]}
        castShadow
      />

      {/* PRIMARY ENGINE PODS (4) - using pooled cylinder */}
      {enginePods.map((pos, i) => (
        <mesh
          key={`engine-${i}`}
          position={[pos.x, -height * 0.2, pos.z]}
          geometry={geometries.cylinder}
          material={engineMaterial}
          scale={[height * 0.18, height * 0.3, height * 0.18]}
          castShadow
        />
      ))}

      {/* EMISSION PANELS - using pooled box geometry with emissive material */}
      <mesh
        position={[0, height * 0.25, depth * 0.5]}
        geometry={geometries.box}
        material={materials.emissiveCyan}
        scale={[width * 0.6, height * 0.15, depth * 0.08]}
        castShadow
      />
      <mesh
        position={[0, height * 0.25, -depth * 0.5]}
        geometry={geometries.box}
        material={materials.emissiveCyan}
        scale={[width * 0.6, height * 0.15, depth * 0.08]}
        castShadow
      />

      {/* VENTRAL DETAILS - using pooled geometry */}
      <mesh
        position={[-width * 0.1, -height * 0.35, 0]}
        geometry={geometries.box}
        material={hullMaterial}
        scale={[width * 0.4, height * 0.15, depth * 0.6]}
        castShadow
      />

      {/* DORSAL RIDGE - using pooled geometry */}
      <mesh
        position={[0, height * 0.5, 0]}
        geometry={geometries.box}
        material={hullMaterial}
        scale={[width * 0.25, height * 0.2, depth * 0.8]}
        castShadow
      />

      {/* BEACON LIGHT - kept as point light for key illumination on capital ships */}
      <pointLight
        ref={beaconRef}
        color={config.engineColor}
        intensity={1}
        distance={60}
        position={[0, height / 2 + 4, 0]}
      />

      {/* HEADLIGHT - forward-facing light */}
      <pointLight
        color={config.lightColor}
        intensity={config.lightIntensity}
        distance={50}
        position={[width * 0.5, height * 0.3, 0]}
      />

      {/* ENGINE GLOW LIGHT - rear engines */}
      <pointLight
        ref={engineRef}
        color={config.engineColor}
        intensity={config.lightIntensity * 0.9}
        distance={40}
        position={[-width * 0.4, -height * 0.2, 0]}
      />
    </group>
  );
}

function Ship({ config, index, geometries, materials }: { config: ShipConfig; index: number } & PoolsProps) {
  const engineRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (engineRef.current) {
      const t = state.clock.elapsedTime;
      // Pulsing engine glow
      engineRef.current.intensity = config.lightIntensity * (0.8 + Math.sin(t * 8 + index) * 0.2);
    }
  });

  const [width, height, depth] = config.size;

  // If it's a capital ship (dreadnought), render with detailed structure
  if (config.type === 'dreadnought') {
    return <CapitalShip config={config} index={index} geometries={geometries} materials={materials} />;
  }

  // Get ship hull material based on color
  const getHullMaterial = () => {
    if (config.color.includes('2a3a') || config.color.includes('1a2a')) return materials.shipHullNavy;
    if (config.color.includes('1a3a') || config.color.includes('2a1a')) return materials.shipHullPurple;
    if (config.color.includes('1a28') || config.color.includes('2828')) return materials.shipHullGray;
    return materials.shipHullDark;
  };
  const hullMaterial = getHullMaterial();

  return (
    <group>
      {/* Main hull - using pooled geometry with scale */}
      <mesh
        geometry={geometries.box}
        material={hullMaterial}
        scale={[width, height, depth]}
      />

      {/* Cockpit/Bridge for larger ships - using pooled geometry */}
      {config.type !== 'shuttle' && (
        <mesh
          position={[width * 0.35, height * 0.3, 0]}
          geometry={geometries.box}
          material={materials.shipHullDark}
          scale={[width * 0.25, height * 0.5, depth * 0.6]}
        />
      )}

      {/* Cargo section for freighters - using pooled geometry */}
      {config.type === 'freighter' && (
        <>
          <mesh
            position={[-width * 0.15, height * 0.1, 0]}
            geometry={geometries.box}
            material={materials.shipHullDark}
            scale={[width * 0.5, height * 0.8, depth * 0.9]}
          />
          {/* Container lights - using pooled plane with emissive */}
          <mesh
            position={[-width * 0.15, height * 0.5, depth * 0.46]}
            geometry={geometries.plane}
            material={materials.emissiveGreen}
            scale={[width * 0.4, 0.1, 1]}
          />
        </>
      )}

      {/* Wing/fin structures for transports - using pooled geometry */}
      {config.type === 'transport' && (
        <>
          <mesh
            position={[0, 0, depth * 0.6]}
            geometry={geometries.box}
            material={hullMaterial}
            scale={[width * 0.6, height * 0.15, depth * 0.3]}
          />
          <mesh
            position={[0, 0, -depth * 0.6]}
            geometry={geometries.box}
            material={hullMaterial}
            scale={[width * 0.6, height * 0.15, depth * 0.3]}
          />
        </>
      )}

      {/* Headlight - kept as point light for key illumination */}
      <pointLight
        color={config.lightColor}
        intensity={config.lightIntensity}
        distance={config.type === 'freighter' ? 15 : config.type === 'transport' ? 10 : 6}
        position={[width * 0.5, 0, 0]}
      />

      {/* Tail lights - using pooled geometry with emissive */}
      <mesh
        position={[-width * 0.5, 0, depth * 0.3]}
        geometry={geometries.box}
        material={materials.emissiveRed}
        scale={[0.05, height * 0.4, 0.15]}
      />
      <mesh
        position={[-width * 0.5, 0, -depth * 0.3]}
        geometry={geometries.box}
        material={materials.emissiveRed}
        scale={[0.05, height * 0.4, 0.15]}
      />

      {/* Engine glow - kept as point light for key illumination */}
      <pointLight
        ref={engineRef}
        color={config.engineColor}
        intensity={config.lightIntensity * 0.8}
        distance={config.type === 'freighter' ? 12 : config.type === 'transport' ? 8 : 5}
        position={[-width * 0.5, 0, 0]}
      />

      {/* Engine exhaust visual - using pooled cylinder geometry with scale */}
      <mesh
        position={[-width * 0.52, 0, 0]}
        geometry={geometries.cylinder}
        material={materials.shipEngineCyan}
        scale={[
          height * 0.4,
          config.type === 'freighter' ? 0.8 : config.type === 'transport' ? 0.5 : 0.3,
          height * 0.4
        ]}
      />

      {/* Running lights for larger ships - using pooled sphere */}
      {config.type !== 'shuttle' && (
        <>
          <mesh
            position={[0, height * 0.5, depth * 0.4]}
            geometry={geometries.sphere}
            material={materials.emissiveGreen}
            scale={0.06}
          />
          <mesh
            position={[0, height * 0.5, -depth * 0.4]}
            geometry={geometries.sphere}
            material={materials.emissiveRed}
            scale={0.06}
          />
        </>
      )}

      {/* Freighter-specific engine pods - using pooled cylinder */}
      {config.type === 'freighter' && (
        <>
          <mesh
            position={[-width * 0.5, height * 0.3, depth * 0.35]}
            geometry={geometries.cylinder}
            material={materials.shipEngineOrange}
            scale={[0.25, 0.6, 0.25]}
          />
          <mesh
            position={[-width * 0.5, height * 0.3, -depth * 0.35]}
            geometry={geometries.cylinder}
            material={materials.shipEngineOrange}
            scale={[0.25, 0.6, 0.25]}
          />
          <mesh
            position={[-width * 0.5, -height * 0.3, depth * 0.35]}
            geometry={geometries.cylinder}
            material={materials.shipEngineOrange}
            scale={[0.25, 0.6, 0.25]}
          />
          <mesh
            position={[-width * 0.5, -height * 0.3, -depth * 0.35]}
            geometry={geometries.cylinder}
            material={materials.shipEngineOrange}
            scale={[0.25, 0.6, 0.25]}
          />
        </>
      )}
    </group>
  );
}

function AnimatedBillboards() {
  const billboardsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!billboardsRef.current) return;
    const time = state.clock.elapsedTime;
    billboardsRef.current.children.forEach((billboard, i) => {
      const mesh = billboard.children[0] as THREE.Mesh;
      const glowMesh = billboard.children[2] as THREE.Mesh;
      if (mesh) {
        const mat = getMeshStandardMaterial(mesh);
        if (mat) {
          const hue = (time * 0.1 + i * 0.3) % 1;
          mat.color.setHSL(hue, 0.8, 0.5);
          mat.emissive.setHSL(hue, 0.8, 0.5);
          const intensity = 0.6 + Math.sin(time * 3 + i) * 0.2;
          mat.opacity = intensity;
          mat.emissiveIntensity = intensity * 1.5;
        }
      }
      if (glowMesh) {
        const glowMat = getMeshBasicMaterial(glowMesh);
        if (glowMat) {
          const hue = (time * 0.1 + i * 0.3) % 1;
          glowMat.color.setHSL(hue, 0.8, 0.5);
          glowMat.opacity = 0.1 + Math.sin(time * 3 + i) * 0.05;
        }
      }
    });
  });

  // Narrowed positions for portrait
  const billboards = [
    { pos: [-16, 22, -28] as [number, number, number], size: [6, 10] as [number, number] },
    { pos: [18, 28, -32] as [number, number, number], size: [8, 12] as [number, number] },
    { pos: [0, 35, -40] as [number, number, number], size: [10, 15] as [number, number] },
  ];

  return (
    <group ref={billboardsRef}>
      {billboards.map((bb, i) => (
        <group key={i} position={bb.pos}>
          {/* Billboard with emissive material - replaces point light */}
          <mesh>
            <planeGeometry args={bb.size} />
            <meshStandardMaterial
              color="#ff00ff"
              emissive="#ff00ff"
              emissiveIntensity={1}
              transparent
              opacity={0.7}
              toneMapped={false}
            />
          </mesh>
          {/* Frame */}
          <mesh position={[0, 0, -0.1]}>
            <boxGeometry args={[bb.size[0] + 0.4, bb.size[1] + 0.4, 0.25]} />
            <meshStandardMaterial color="#1a1a28" metalness={0.9} roughness={0.3} />
          </mesh>
          {/* Glow halo - provides ambient light effect */}
          <mesh position={[0, 0, -0.15]}>
            <planeGeometry args={[bb.size[0] * 1.4, bb.size[1] * 1.3]} />
            <meshBasicMaterial
              color="#ff00ff"
              transparent
              opacity={0.12}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FogLayers() {
  const fogRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!fogRef.current) return;
    const time = state.clock.elapsedTime;
    fogRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      mesh.position.x = Math.sin(time * 0.05 + i * 2) * 8;
      mesh.position.z = -25 + Math.cos(time * 0.03 + i) * 4;
      const mat = getMeshBasicMaterial(mesh);
      if (mat) {
        mat.opacity = 0.025 + Math.sin(time * 0.1 + i) * 0.015;
      }
    });
  });

  return (
    <group ref={fogRef}>
      {[0, 1, 2].map((i) => ( // Reduced from 5 to 3 fog layers
        <mesh
          key={i}
          position={[0, 5 + i * 12, -25]}
        >
          <planeGeometry args={[100, 15]} />
          <meshBasicMaterial
            color="#1a1a2e"
            transparent
            opacity={0.04}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function Puddles() {
  return (
    <group>
      {[
        { pos: [-3, -1.97, 4], size: 2.5 },
        { pos: [4, -1.97, 1], size: 3 },
        { pos: [-2, -1.97, -2], size: 2 },
        { pos: [3, -1.97, 6], size: 2.8 },
      ].map((puddle, i) => (
        <mesh
          key={i}
          position={puddle.pos as [number, number, number]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[puddle.size, 32]} />
          <meshStandardMaterial
            color="#0a0a15"
            metalness={1}
            roughness={0}
            envMapIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
}

// ============================================
// NEW DEPTH LAYERS
// ============================================

// FOREGROUND LAYER: Floating debris close to camera
function ForegroundDebris() {
  const debrisRef = useRef<THREE.Points>(null);
  const debrisCount = 100; // Reduced from 200 for RAM optimization

  const positions = useMemo(() => {
    const pos = new Float32Array(debrisCount * 3);
    for (let i = 0; i < debrisCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = -30 + Math.random() * 80;
      pos[i * 3 + 2] = Math.random() * 8 - 2;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (debrisRef.current) {
      const time = state.clock.elapsedTime;
      debrisRef.current.rotation.y = time * 0.01;
      const positions = debrisRef.current.geometry.attributes.position.array as Float32Array;
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

// FOREGROUND LAYER: Holographic data fragments
function DataFragments() {
  const fragmentsRef = useRef<THREE.Group>(null);

  const fragments = useMemo(() => {
    const frags = [];
    for (let i = 0; i < 8; i++) { // Reduced from 15 for RAM optimization
      frags.push({
        pos: [
          (Math.random() - 0.5) * 20,
          -25 + Math.random() * 60,
          Math.random() * 6 - 1,
        ] as [number, number, number],
        size: 0.3 + Math.random() * 0.5,
        color: ['#00ffff', '#ff00ff', '#00ff88', '#ffaa00'][Math.floor(Math.random() * 4)],
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

// MID-GROUND LAYER: Floating platforms
function FloatingPlatforms() {
  const platformsRef = useRef<THREE.Group>(null);

  const platforms = useMemo(() => [
    { pos: [-10, 20, -12] as [number, number, number], size: [5, 0.4, 4] as [number, number, number] },
    { pos: [12, 8, -15] as [number, number, number], size: [4, 0.3, 3] as [number, number, number] },
    { pos: [-8, -5, -10] as [number, number, number], size: [6, 0.5, 5] as [number, number, number] },
    { pos: [6, -18, -14] as [number, number, number], size: [4, 0.3, 3.5] as [number, number, number] },
    { pos: [-5, 32, -18] as [number, number, number], size: [5, 0.4, 4] as [number, number, number] },
    { pos: [9, -28, -12] as [number, number, number], size: [3.5, 0.3, 3] as [number, number, number] },
  ], []);

  useFrame((state) => {
    if (!platformsRef.current) return;
    const time = state.clock.elapsedTime;
    platformsRef.current.children.forEach((platform, i) => {
      platform.position.y = platforms[i].pos[1] + Math.sin(time * 0.3 + i * 2) * 0.5;
      platform.rotation.y = Math.sin(time * 0.1 + i) * 0.05;
      // Animate underside glow
      const undersideMesh = platform.children[2] as THREE.Mesh;
      if (undersideMesh) {
        const mat = getMeshStandardMaterial(undersideMesh);
        if (mat) {
          mat.emissiveIntensity = 0.6 + Math.sin(time * 2 + i) * 0.3;
        }
      }
    });
  });

  return (
    <group ref={platformsRef}>
      {platforms.map((plat, i) => (
        <group key={i} position={plat.pos}>
          {/* Platform base */}
          <mesh>
            <boxGeometry args={plat.size} />
            <meshStandardMaterial
              color="#1a1a28"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          {/* Edge lights with emissive */}
          <mesh position={[0, plat.size[1] / 2 + 0.01, 0]}>
            <boxGeometry args={[plat.size[0] * 0.9, 0.05, plat.size[2] * 0.9]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.8}
              transparent
              opacity={0.4}
              toneMapped={false}
            />
          </mesh>
          {/* Underside glow - emissive mesh replaces point light */}
          <mesh position={[0, -plat.size[1] / 2 - 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[plat.size[0] * 0.8, plat.size[2] * 0.8]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.8}
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// MID-GROUND LAYER: Drone swarm
function DroneSwarm() {
  const dronesRef = useRef<THREE.Group>(null);

  const drones = useMemo(() => {
    const d = [];
    for (let i = 0; i < 12; i++) { // Reduced from 25 for RAM optimization
      d.push({
        basePos: [
          (Math.random() - 0.5) * 40,
          -25 + Math.random() * 60,
          -10 - Math.random() * 15,
        ] as [number, number, number],
        speed: 0.5 + Math.random() * 1.5,
        orbitRadius: 1 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? '#00ffff' : '#ff00ff',
      });
    }
    return d;
  }, []);

  useFrame((state) => {
    if (!dronesRef.current) return;
    const time = state.clock.elapsedTime;
    dronesRef.current.children.forEach((drone, i) => {
      const config = drones[i];
      drone.position.x = config.basePos[0] + Math.cos(time * config.speed + config.phase) * config.orbitRadius;
      drone.position.y = config.basePos[1] + Math.sin(time * config.speed * 0.7 + config.phase) * 2;
      drone.position.z = config.basePos[2] + Math.sin(time * config.speed + config.phase) * config.orbitRadius * 0.5;
      drone.rotation.y = time * 2;
      // Animate glow halo
      const glowMesh = drone.children[1] as THREE.Mesh;
      if (glowMesh) {
        const mat = getMeshBasicMaterial(glowMesh);
        if (mat) {
          mat.opacity = 0.2 + Math.sin(time * 4 + i) * 0.1;
        }
      }
    });
  });

  return (
    <group ref={dronesRef}>
      {drones.map((drone, i) => (
        <group key={i} position={drone.basePos}>
          {/* Drone body with emissive - replaces point light */}
          <mesh>
            <octahedronGeometry args={[0.15, 0]} />
            <meshStandardMaterial
              color={drone.color}
              emissive={drone.color}
              emissiveIntensity={1.2}
              toneMapped={false}
            />
          </mesh>
          {/* Glow halo */}
          <mesh>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial
              color={drone.color}
              transparent
              opacity={0.2}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// DEEP BACKGROUND LAYER: Distant mega-structures
function DistantMegaStructures() {
  const structuresRef = useRef<THREE.Group>(null);

  // Reduced from 7 to 4 structures for RAM optimization
  const structures = useMemo(() => [
    { pos: [-60, 30, -80] as [number, number, number], size: [15, 120, 15] as [number, number, number], color: '#0a0a15' },
    { pos: [70, 40, -90] as [number, number, number], size: [20, 150, 20] as [number, number, number], color: '#0a0a18' },
    { pos: [0, 60, -110] as [number, number, number], size: [30, 200, 30] as [number, number, number], color: '#080810' },
    { pos: [-40, 50, -100] as [number, number, number], size: [25, 180, 25] as [number, number, number], color: '#080812' },
  ], []);

  useFrame((state) => {
    if (!structuresRef.current) return;
    const time = state.clock.elapsedTime;
    structuresRef.current.children.forEach((struct, i) => {
      // Subtle pulse on window lights
      const windowMesh = struct.children[1] as THREE.Mesh;
      if (windowMesh) {
        const mat = getMeshStandardMaterial(windowMesh);
        if (mat) {
          const intensity = 0.2 + Math.sin(time * 0.5 + i) * 0.1;
          mat.opacity = intensity;
          mat.emissiveIntensity = intensity * 2;
        }
      }
      // Pulse beacon
      const beaconMesh = struct.children[2] as THREE.Mesh;
      if (beaconMesh) {
        const mat = getMeshStandardMaterial(beaconMesh);
        if (mat) {
          mat.emissiveIntensity = 1 + Math.sin(time * 3 + i) * 0.5;
        }
      }
    });
  });

  return (
    <group ref={structuresRef}>
      {structures.map((struct, i) => (
        <group key={i} position={struct.pos}>
          {/* Main structure */}
          <mesh>
            <boxGeometry args={struct.size} />
            <meshStandardMaterial
              color={struct.color}
              metalness={0.95}
              roughness={0.3}
            />
          </mesh>
          {/* Window strip with emissive */}
          <mesh position={[0, 0, struct.size[2] / 2 + 0.1]}>
            <planeGeometry args={[struct.size[0] * 0.8, struct.size[1] * 0.9]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.4}
              transparent
              opacity={0.2}
              toneMapped={false}
            />
          </mesh>
          {/* Top beacon - emissive sphere replaces point light */}
          <mesh position={[0, struct.size[1] / 2 + 5, 0]}>
            <sphereGeometry args={[2, 8, 8]} />
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={1.5}
              toneMapped={false}
            />
          </mesh>
          {/* Beacon glow halo */}
          <mesh position={[0, struct.size[1] / 2 + 5, 0]}>
            <sphereGeometry args={[5, 8, 8]} />
            <meshBasicMaterial
              color="#ff0000"
              transparent
              opacity={0.1}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// DEEP BACKGROUND LAYER: Atmospheric light beams
function AtmosphericLightBeams() {
  const beamsRef = useRef<THREE.Group>(null);

  // Reduced from 5 to 3 beams for RAM optimization
  const beams = useMemo(() => [
    { pos: [-50, 0, -70] as [number, number, number], color: '#00ffff', height: 150 },
    { pos: [60, 0, -80] as [number, number, number], color: '#ff00ff', height: 180 },
    { pos: [0, 0, -100] as [number, number, number], color: '#ff0066', height: 200 },
  ], []);

  useFrame((state) => {
    if (!beamsRef.current) return;
    const time = state.clock.elapsedTime;
    beamsRef.current.children.forEach((beam, i) => {
      const mesh = beam as THREE.Mesh;
      const mat = getMeshBasicMaterial(mesh);
      if (mat) {
        mat.opacity = 0.08 + Math.sin(time * 0.3 + i * 2) * 0.04;
      }
    });
  });

  return (
    <group ref={beamsRef}>
      {beams.map((beam, i) => (
        <mesh key={i} position={[beam.pos[0], beam.height / 2, beam.pos[2]]}>
          <cylinderGeometry args={[0.5, 3, beam.height, 8]} />
          <meshBasicMaterial
            color={beam.color}
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// REVERSE-FACING LAYER: Behind camera with enhanced lighting
function OppositeEnvironmentLayer() {
  const layerRef = useRef<THREE.Group>(null);
  const lightPanelRefs = useRef<THREE.Mesh[]>([]);

  // Use context pools instead of local duplicate pools
  const { geometries, materials } = usePools();

  // Enhanced lighting panels positioned behind camera facing forward
  const lightPanels = useMemo(() => [
    { pos: [-25, 15, 40] as [number, number, number], size: [20, 15] as [number, number], color: '#00ffff', intensity: 1.2 },
    { pos: [30, 25, 45] as [number, number, number], size: [18, 20] as [number, number], color: '#ff00ff', intensity: 1.5 },
    { pos: [-10, 5, 50] as [number, number, number], size: [16, 12] as [number, number], color: '#00ff88', intensity: 1 },
    { pos: [20, -10, 38] as [number, number, number], size: [14, 18] as [number, number], color: '#ffaa00', intensity: 1.3 },
  ], []);

  // Reverse-facing structures (tall vertical elements)
  const structures = useMemo(() => [
    { pos: [-35, 20, 55] as [number, number, number], size: [8, 50, 8] as [number, number, number], color: '#1a1a2e' },
    { pos: [40, 30, 60] as [number, number, number], size: [10, 60, 10] as [number, number, number], color: '#2a1a3a' },
    { pos: [0, 15, 65] as [number, number, number], size: [12, 45, 12] as [number, number, number], color: '#1a2a3a' },
  ], []);

  // Map local pool names to context pool equivalents
  const hullMaterialMap = useMemo(() => ({
    '#1a1a2e': materials.structureDark,
    '#2a1a3a': materials.structurePurple,
    '#1a2a3a': materials.structureNavy,
  }), [materials]);

  // Window materials array for indexing
  const windowMaterials = useMemo(() => [
    materials.windowCyan,
    materials.windowMagenta,
    materials.windowGreen,
    materials.windowAmber,
  ], [materials]);

  // Display panel materials - use emissive materials from pool
  const displayMaterialMap = useMemo(() => ({
    '#00ffff': materials.emissiveCyan,
    '#ff00ff': materials.emissiveMagenta,
    '#00ff88': materials.emissiveGreen,
    '#ffaa00': materials.emissiveAmber,
  }), [materials]);

  // Frame materials - use building material with slight variation
  const frameMaterial = materials.buildingDark;

  // Orb materials - use emissive materials from pool
  const orbMaterials = useMemo(() => [
    materials.emissiveCyan,
    materials.emissiveMagenta,
    materials.emissiveGreen,
  ], [materials]);

  useFrame((state) => {
    if (layerRef.current) {
      const time = state.clock.elapsedTime;
      layerRef.current.children.forEach((child, i) => {
        // Subtle rotation and pulsing
        if (child instanceof THREE.Group) {
          child.rotation.y = Math.sin(time * 0.2 + i) * 0.1;
        }
      });
    }

    // Pulse light panel materials
    lightPanelRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = getMeshStandardMaterial(mesh);
      if (mat) {
        mat.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.3;
      }
    });
  });

  return (
    <group ref={layerRef} position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
      {/* Reverse-facing structure towers - using context pool materials and geometry */}
      {structures.map((struct, i) => {
        // Select hull material based on color using the mapping
        const hullMat = hullMaterialMap[struct.color as keyof typeof hullMaterialMap] || materials.structureDark;

        return (
          <group key={`struct-${i}`} position={struct.pos}>
            {/* Main structure - reuses context pool geometry with scale */}
            <mesh castShadow scale={struct.size} material={hullMat} geometry={geometries.box} />

            {/* Window grid on front face - using context pool geometry/materials */}
            {Array.from({ length: 6 }).map((_, row) =>
              Array.from({ length: 4 }).map((_, col) => {
                const colIndex = col % 4;
                const windowMat = windowMaterials[colIndex];
                return (
                  <mesh
                    key={`window-${row}-${col}`}
                    position={[
                      -struct.size[0] / 2 + 1.2 + col * 2,
                      -struct.size[1] / 2 + 4 + row * 6.5,
                      struct.size[2] / 2 + 0.01,
                    ]}
                    geometry={geometries.windowPlane}
                    material={windowMat}
                    scale={[1.2, 1.25, 1]}
                  />
                );
              })
            )}

            {/* Top beacon - using emissive mesh instead of point light for optimization */}
            <mesh
              position={[0, struct.size[1] / 2 + 3, 0]}
              geometry={geometries.sphere}
              material={materials.emissiveMagenta}
              scale={0.5}
            />

            {/* Side accent - using emissive mesh instead of point light */}
            <mesh
              position={[struct.size[0] / 2 + 2, 0, 0]}
              geometry={geometries.sphere}
              material={materials.emissiveCyan}
              scale={0.4}
            />
          </group>
        );
      })}

      {/* Enhanced light panels - using context pool geometries and materials */}
      {lightPanels.map((panel, i) => {
        // Select display material based on panel color using mapping
        const panelMat = displayMaterialMap[panel.color as keyof typeof displayMaterialMap] || materials.emissiveCyan;

        return (
          <group key={`panel-${i}`} position={panel.pos}>
            {/* Main light panel - using context pool geometry */}
            <mesh
              ref={(el) => {
                if (el) lightPanelRefs.current[i] = el;
              }}
              scale={[panel.size[0], panel.size[1], 1]}
              geometry={geometries.plane}
              material={panelMat}
            />

            {/* Panel backing frame - using context pool geometry */}
            <mesh
              position={[0, 0, -0.2]}
              scale={[panel.size[0] + 0.5, panel.size[1] + 0.5, 0.3]}
              geometry={geometries.box}
              material={frameMaterial}
            />

            {/* Primary light source - kept for key illumination */}
            <pointLight
              color={panel.color}
              intensity={panel.intensity}
              distance={35}
              position={[0, 0, 5]}
            />

            {/* Secondary fill - replaced with emissive mesh */}
            <mesh
              position={[0, 0, -3]}
              geometry={geometries.sphere}
              material={panelMat}
              scale={1.5}
            />
          </group>
        );
      })}

      {/* Atmospheric glow orbs - using context pool geometry/material */}
      {[-20, 0, 20].map((x, i) => {
        const colors = ['#00ffff', '#ff00ff', '#00ff88'];
        return (
          <group key={`orb-${i}`} position={[x, 35, 52]}>
            <mesh geometry={geometries.sphere} material={orbMaterials[i]} scale={1.2} />
            <pointLight color={colors[i]} intensity={1.2} distance={30} />
          </group>
        );
      })}

      {/* Volumetric light shafts - using context pool geometry and materials */}
      {[-15, 15].map((z, i) => (
        <mesh
          key={`shaft-${i}`}
          position={[0, 20, 42 + z]}
          geometry={geometries.lightShaft}
          material={i === 0 ? materials.shaftCyan : materials.shaftMagenta}
        />
      ))}
    </group>
  );
}
