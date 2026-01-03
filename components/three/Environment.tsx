'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Environment() {
  return (
    <>
      {/* Ground plane - reflective cyberpunk street */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 250]} />
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
    </>
  );
}

function CityBuildings() {
  const buildingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0a0a12',
        metalness: 0.95,
        roughness: 0.15,
      }),
    []
  );

  const buildings = useMemo(() => {
    const b = [];
    const seed = 12345;
    const random = (i: number) => {
      const x = Math.sin(seed + i * 9999) * 10000;
      return x - Math.floor(x);
    };

    // Left side buildings - narrowed from ±50 to ±35
    for (let i = 0; i < 8; i++) {
      const height = 25 + random(i) * 50;
      const width = 3 + random(i + 100) * 4;
      const depth = 3 + random(i + 200) * 4;
      b.push({
        position: [-12 - i * 5 + random(i + 300) * 2, height / 2 - 2, -12 - random(i + 400) * 20] as [number, number, number],
        size: [width, height, depth] as [number, number, number],
        windowColor: ['#00ffff', '#ff00ff', '#ffaa00', '#00ff88'][Math.floor(random(i + 500) * 4)],
        hasAntenna: random(i + 600) > 0.5,
      });
    }
    // Right side buildings
    for (let i = 0; i < 8; i++) {
      const height = 25 + random(i + 1000) * 50;
      const width = 3 + random(i + 1100) * 4;
      const depth = 3 + random(i + 1200) * 4;
      b.push({
        position: [12 + i * 5 + random(i + 1300) * 2, height / 2 - 2, -12 - random(i + 1400) * 20] as [number, number, number],
        size: [width, height, depth] as [number, number, number],
        windowColor: ['#00ffff', '#ff00ff', '#ffaa00', '#00ff88'][Math.floor(random(i + 1500) * 4)],
        hasAntenna: random(i + 1600) > 0.5,
      });
    }
    // Background mega-buildings - narrower spread
    for (let i = 0; i < 10; i++) {
      const height = 50 + random(i + 2000) * 70;
      const width = 5 + random(i + 2100) * 6;
      const depth = 5 + random(i + 2200) * 6;
      b.push({
        position: [-35 + i * 7 + random(i + 2300) * 3, height / 2 - 2, -35 - random(i + 2400) * 15] as [number, number, number],
        size: [width, height, depth] as [number, number, number],
        windowColor: ['#00ffff', '#ff00ff', '#ffaa00', '#00ff88'][Math.floor(random(i + 2500) * 4)],
        hasAntenna: random(i + 2600) > 0.3,
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
        />
      ))}
    </group>
  );
}

function CyberpunkBuilding({
  position,
  size,
  material,
  windowColor,
  index,
  hasAntenna,
}: {
  position: [number, number, number];
  size: [number, number, number];
  material: THREE.Material;
  windowColor: string;
  index: number;
  hasAntenna: boolean;
}) {
  const windowRefs = useRef<THREE.Mesh[]>([]);
  const accentRef = useRef<THREE.Mesh>(null);
  const antennaLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    windowRefs.current.forEach((mesh, i) => {
      if (mesh) {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        const flicker = Math.sin(time * (2 + index * 0.1) + i * 0.5) > 0.3 ? 1 : 0.2;
        mat.opacity = (0.4 + Math.sin(time * 0.3 + index + i * 0.2) * 0.3) * flicker;
      }
    });
    if (accentRef.current) {
      const mat = accentRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 + Math.sin(time * 1.5 + index) * 0.3;
    }
    if (antennaLightRef.current) {
      antennaLightRef.current.intensity = 0.5 + Math.sin(time * 4 + index) * 0.3;
    }
  });

  const windowRows = Math.floor(size[1] / 2.5);
  const windowCols = Math.floor(size[0] / 1.8);

  return (
    <group position={position}>
      <mesh material={material} castShadow>
        <boxGeometry args={size} />
      </mesh>

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
          >
            <planeGeometry args={[1, 1.6]} />
            <meshBasicMaterial color={windowColor} transparent opacity={0.5} />
          </mesh>
        ))
      )}

      <mesh
        ref={accentRef}
        position={[0, size[1] / 2 - 1, size[2] / 2 + 0.02]}
      >
        <planeGeometry args={[size[0] * 0.95, 0.4]} />
        <meshBasicMaterial color={windowColor} transparent opacity={0.6} />
      </mesh>

      {size[1] > 30 && (
        <mesh position={[0, 0, size[2] / 2 + 0.02]}>
          <planeGeometry args={[size[0] * 0.95, 0.2]} />
          <meshBasicMaterial color={windowColor} transparent opacity={0.3} />
        </mesh>
      )}

      {hasAntenna && (
        <group position={[0, size[1] / 2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.15, 5, 8]} />
            <meshStandardMaterial color="#1a1a28" metalness={0.95} roughness={0.2} />
          </mesh>
          <pointLight
            ref={antennaLightRef}
            color="#ff0000"
            intensity={0.5}
            distance={15}
            position={[0, 3, 0]}
          />
          <mesh position={[0, 2.8, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </group>
      )}

      <pointLight
        color={windowColor}
        intensity={0.2}
        distance={15}
        position={[0, size[1] / 2 + 2, size[2] / 2]}
      />
    </group>
  );
}

function NeonSigns() {
  const signsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (signsRef.current) {
      signsRef.current.children.forEach((sign, i) => {
        const mesh = sign.children[0] as THREE.Mesh;
        if (mesh) {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          const time = state.clock.elapsedTime;
          const flicker = Math.sin(time * 20 + i * 5) > 0.9 ? 0.3 : 1;
          mat.opacity = (0.7 + Math.sin(time * 2 + i) * 0.3) * flicker;
        }
      });
    }
  });

  // Narrowed positions for portrait
  const signs = [
    { pos: [-8, 6, -6] as [number, number, number], color: '#ff00ff', size: [2.5, 0.7] as [number, number] },
    { pos: [9, 8, -10] as [number, number, number], color: '#00ffff', size: [3, 0.8] as [number, number] },
    { pos: [-12, 12, -15] as [number, number, number], color: '#ffaa00', size: [4, 1] as [number, number] },
    { pos: [14, 10, -12] as [number, number, number], color: '#00ff88', size: [3, 0.8] as [number, number] },
    { pos: [-5, 15, -18] as [number, number, number], color: '#ff0066', size: [3.5, 0.9] as [number, number] },
    { pos: [7, 18, -20] as [number, number, number], color: '#00aaff', size: [5, 1.2] as [number, number] },
  ];

  return (
    <group ref={signsRef}>
      {signs.map((sign, i) => (
        <group key={i} position={sign.pos}>
          <mesh>
            <planeGeometry args={sign.size} />
            <meshBasicMaterial color={sign.color} transparent opacity={0.8} />
          </mesh>
          <pointLight color={sign.color} intensity={0.8} distance={8} />
        </group>
      ))}
    </group>
  );
}

function NeonGridLines() {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (linesRef.current) {
      const time = state.clock.elapsedTime;
      linesRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.15 + Math.sin(time * 0.8 + i * 0.3) * 0.1;
      });
    }
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
          <meshBasicMaterial color="#00ffff" transparent opacity={0.15} />
        </mesh>
      ))}
      {[-30, -20, -10, 0, 10, 20, 30].map((x, i) => (
        <mesh
          key={`v-${i}`}
          position={[x, -1.98, -20]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        >
          <planeGeometry args={[80, 0.08]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.12} />
        </mesh>
      ))}
    </group>
  );
}

function Rain() {
  const rainRef = useRef<THREE.Points>(null);
  const rainCount = 1500;

  const positions = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60; // Narrower for portrait
      pos[i * 3 + 1] = Math.random() * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
    }
    return pos;
  }, []);

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
  const holoRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    holoRefs.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.rotation.y = time * 0.3 + i;
        mesh.rotation.x = Math.sin(time * 0.5 + i) * 0.2;
        mesh.position.y = 10 + i * 4 + Math.sin(time * 0.6 + i) * 1;
        const mat = mesh.material as THREE.MeshBasicMaterial;
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

// Ship configuration types
interface ShipConfig {
  type: 'shuttle' | 'transport' | 'freighter';
  size: [number, number, number];
  speed: number;
  color: string;
  lightIntensity: number;
  lightColor: string;
  engineColor: string;
  yBase: number;
  zLane: number;
  direction: 1 | -1;
  offset: number;
}

function FlyingShips() {
  const shipsRef = useRef<THREE.Group>(null);

  // Generate ship fleet with 3 size classes
  const ships: ShipConfig[] = useMemo(() => {
    const fleet: ShipConfig[] = [];
    const seed = 54321;
    const random = (i: number) => {
      const x = Math.sin(seed + i * 7777) * 10000;
      return x - Math.floor(x);
    };

    // Small Shuttles - 12 ships (fast, numerous)
    for (let i = 0; i < 12; i++) {
      fleet.push({
        type: 'shuttle',
        size: [0.8 + random(i) * 0.4, 0.25 + random(i + 10) * 0.1, 0.4 + random(i + 20) * 0.2],
        speed: 0.28 + random(i + 30) * 0.1,
        color: ['#2a2a40', '#1a2a3a', '#2a1a3a'][i % 3],
        lightIntensity: 0.35,
        lightColor: random(i + 40) > 0.5 ? '#ffffff' : '#ffeecc',
        engineColor: '#00ccff',
        yBase: 6 + random(i + 50) * 8,
        zLane: -8 - random(i + 60) * 15,
        direction: i % 2 === 0 ? 1 : -1,
        offset: i * 8,
      });
    }

    // Medium Transports - 8 ships (medium speed, standard size)
    for (let i = 0; i < 8; i++) {
      fleet.push({
        type: 'transport',
        size: [2.2 + random(i + 100) * 0.6, 0.5 + random(i + 110) * 0.2, 1.0 + random(i + 120) * 0.4],
        speed: 0.15 + random(i + 130) * 0.08,
        color: ['#1a1a28', '#281a28', '#1a2828'][i % 3],
        lightIntensity: 0.6,
        lightColor: '#ffffff',
        engineColor: '#00aaff',
        yBase: 12 + random(i + 140) * 10,
        zLane: -15 - random(i + 150) * 12,
        direction: i % 2 === 0 ? 1 : -1,
        offset: i * 12,
      });
    }

    // Large Freighters - 5 ships (slow, imposing)
    for (let i = 0; i < 5; i++) {
      fleet.push({
        type: 'freighter',
        size: [4.0 + random(i + 200) * 1.5, 1.0 + random(i + 210) * 0.5, 2.0 + random(i + 220) * 0.8],
        speed: 0.06 + random(i + 230) * 0.04,
        color: ['#0a0a1a', '#1a0a1a', '#0a1a1a'][i % 3],
        lightIntensity: 1.0,
        lightColor: '#ffddaa',
        engineColor: '#ff6600',
        yBase: 20 + random(i + 240) * 15,
        zLane: -25 - random(i + 250) * 10,
        direction: i % 2 === 0 ? 1 : -1,
        offset: i * 20,
      });
    }

    return fleet;
  }, []);

  useFrame((state) => {
    if (shipsRef.current) {
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
    }
  });

  return (
    <group ref={shipsRef}>
      {ships.map((config, i) => (
        <Ship key={i} config={config} index={i} />
      ))}
    </group>
  );
}

function Ship({ config, index }: { config: ShipConfig; index: number }) {
  const engineRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (engineRef.current) {
      const t = state.clock.elapsedTime;
      // Pulsing engine glow
      engineRef.current.intensity = config.lightIntensity * (0.8 + Math.sin(t * 8 + index) * 0.2);
    }
  });

  const [width, height, depth] = config.size;

  return (
    <group>
      {/* Main hull */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={config.color}
          metalness={0.92}
          roughness={0.15}
        />
      </mesh>

      {/* Cockpit/Bridge for larger ships */}
      {config.type !== 'shuttle' && (
        <mesh position={[width * 0.35, height * 0.3, 0]}>
          <boxGeometry args={[width * 0.25, height * 0.5, depth * 0.6]} />
          <meshStandardMaterial
            color="#0a1020"
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
      )}

      {/* Cargo section for freighters */}
      {config.type === 'freighter' && (
        <>
          <mesh position={[-width * 0.15, height * 0.1, 0]}>
            <boxGeometry args={[width * 0.5, height * 0.8, depth * 0.9]} />
            <meshStandardMaterial color="#12121a" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Container lights */}
          <mesh position={[-width * 0.15, height * 0.5, depth * 0.46]}>
            <planeGeometry args={[width * 0.4, 0.1]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.6} />
          </mesh>
        </>
      )}

      {/* Wing/fin structures for transports */}
      {config.type === 'transport' && (
        <>
          <mesh position={[0, 0, depth * 0.6]}>
            <boxGeometry args={[width * 0.6, height * 0.15, depth * 0.3]} />
            <meshStandardMaterial color={config.color} metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, -depth * 0.6]}>
            <boxGeometry args={[width * 0.6, height * 0.15, depth * 0.3]} />
            <meshStandardMaterial color={config.color} metalness={0.9} roughness={0.2} />
          </mesh>
        </>
      )}

      {/* Headlights */}
      <pointLight
        color={config.lightColor}
        intensity={config.lightIntensity}
        distance={config.type === 'freighter' ? 15 : config.type === 'transport' ? 10 : 6}
        position={[width * 0.5, 0, 0]}
      />

      {/* Tail lights */}
      <mesh position={[-width * 0.5, 0, depth * 0.3]}>
        <boxGeometry args={[0.05, height * 0.4, 0.15]} />
        <meshBasicMaterial color="#ff0033" />
      </mesh>
      <mesh position={[-width * 0.5, 0, -depth * 0.3]}>
        <boxGeometry args={[0.05, height * 0.4, 0.15]} />
        <meshBasicMaterial color="#ff0033" />
      </mesh>

      {/* Engine glow */}
      <pointLight
        ref={engineRef}
        color={config.engineColor}
        intensity={config.lightIntensity * 0.8}
        distance={config.type === 'freighter' ? 12 : config.type === 'transport' ? 8 : 5}
        position={[-width * 0.5, 0, 0]}
      />

      {/* Engine exhaust visual */}
      <mesh position={[-width * 0.52, 0, 0]}>
        <cylinderGeometry
          args={[
            height * 0.3,
            height * 0.5,
            config.type === 'freighter' ? 0.8 : config.type === 'transport' ? 0.5 : 0.3,
            8
          ]}
        />
        <meshBasicMaterial color={config.engineColor} transparent opacity={0.4} />
      </mesh>

      {/* Running lights for larger ships */}
      {config.type !== 'shuttle' && (
        <>
          <mesh position={[0, height * 0.5, depth * 0.4]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
          <mesh position={[0, height * 0.5, -depth * 0.4]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </>
      )}

      {/* Freighter-specific details */}
      {config.type === 'freighter' && (
        <>
          {/* Multiple engine pods */}
          <mesh position={[-width * 0.5, height * 0.3, depth * 0.35]}>
            <cylinderGeometry args={[0.2, 0.3, 0.6, 8]} />
            <meshBasicMaterial color={config.engineColor} transparent opacity={0.5} />
          </mesh>
          <mesh position={[-width * 0.5, height * 0.3, -depth * 0.35]}>
            <cylinderGeometry args={[0.2, 0.3, 0.6, 8]} />
            <meshBasicMaterial color={config.engineColor} transparent opacity={0.5} />
          </mesh>
          <mesh position={[-width * 0.5, -height * 0.3, depth * 0.35]}>
            <cylinderGeometry args={[0.2, 0.3, 0.6, 8]} />
            <meshBasicMaterial color={config.engineColor} transparent opacity={0.5} />
          </mesh>
          <mesh position={[-width * 0.5, -height * 0.3, -depth * 0.35]}>
            <cylinderGeometry args={[0.2, 0.3, 0.6, 8]} />
            <meshBasicMaterial color={config.engineColor} transparent opacity={0.5} />
          </mesh>
        </>
      )}
    </group>
  );
}

function AnimatedBillboards() {
  const billboardsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (billboardsRef.current) {
      const time = state.clock.elapsedTime;
      billboardsRef.current.children.forEach((billboard, i) => {
        const mesh = billboard.children[0] as THREE.Mesh;
        if (mesh) {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          const hue = (time * 0.1 + i * 0.3) % 1;
          mat.color.setHSL(hue, 0.8, 0.5);
          mat.opacity = 0.6 + Math.sin(time * 3 + i) * 0.2;
        }
      });
    }
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
          <mesh>
            <planeGeometry args={bb.size} />
            <meshBasicMaterial color="#ff00ff" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 0, -0.1]}>
            <boxGeometry args={[bb.size[0] + 0.4, bb.size[1] + 0.4, 0.25]} />
            <meshStandardMaterial color="#1a1a28" metalness={0.9} roughness={0.3} />
          </mesh>
          <pointLight color="#ff00ff" intensity={1} distance={18} />
        </group>
      ))}
    </group>
  );
}

function FogLayers() {
  const fogRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (fogRef.current) {
      const time = state.clock.elapsedTime;
      fogRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        mesh.position.x = Math.sin(time * 0.05 + i * 2) * 8;
        mesh.position.z = -25 + Math.cos(time * 0.03 + i) * 4;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.025 + Math.sin(time * 0.1 + i) * 0.015;
      });
    }
  });

  return (
    <group ref={fogRef}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[0, 5 + i * 8, -25]}
        >
          <planeGeometry args={[100, 12]} />
          <meshBasicMaterial
            color="#1a1a2e"
            transparent
            opacity={0.03}
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
  const debrisCount = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(debrisCount * 3);
    for (let i = 0; i < debrisCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = -30 + Math.random() * 80; // Full vertical range
      pos[i * 3 + 2] = Math.random() * 8 - 2; // Z = -2 to 6 (close to camera)
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
    for (let i = 0; i < 15; i++) {
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
    if (fragmentsRef.current) {
      const time = state.clock.elapsedTime;
      fragmentsRef.current.children.forEach((child, i) => {
        child.rotation.y = time * fragments[i].rotSpeed;
        child.rotation.x = time * fragments[i].rotSpeed * 0.5;
        child.position.y = fragments[i].pos[1] + Math.sin(time + i) * 0.5;
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.3 + Math.sin(time * 2 + i) * 0.2;
      });
    }
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
    if (platformsRef.current) {
      const time = state.clock.elapsedTime;
      platformsRef.current.children.forEach((platform, i) => {
        platform.position.y = platforms[i].pos[1] + Math.sin(time * 0.3 + i * 2) * 0.5;
        platform.rotation.y = Math.sin(time * 0.1 + i) * 0.05;
      });
    }
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
          {/* Edge lights */}
          <mesh position={[0, plat.size[1] / 2 + 0.01, 0]}>
            <boxGeometry args={[plat.size[0] * 0.9, 0.05, plat.size[2] * 0.9]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
          </mesh>
          {/* Underside glow */}
          <pointLight
            color="#00ffff"
            intensity={0.5}
            distance={8}
            position={[0, -1, 0]}
          />
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
    for (let i = 0; i < 25; i++) {
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
    if (dronesRef.current) {
      const time = state.clock.elapsedTime;
      dronesRef.current.children.forEach((drone, i) => {
        const config = drones[i];
        drone.position.x = config.basePos[0] + Math.cos(time * config.speed + config.phase) * config.orbitRadius;
        drone.position.y = config.basePos[1] + Math.sin(time * config.speed * 0.7 + config.phase) * 2;
        drone.position.z = config.basePos[2] + Math.sin(time * config.speed + config.phase) * config.orbitRadius * 0.5;
        drone.rotation.y = time * 2;
      });
    }
  });

  return (
    <group ref={dronesRef}>
      {drones.map((drone, i) => (
        <group key={i} position={drone.basePos}>
          <mesh>
            <octahedronGeometry args={[0.15, 0]} />
            <meshBasicMaterial color={drone.color} />
          </mesh>
          <pointLight color={drone.color} intensity={0.3} distance={4} />
        </group>
      ))}
    </group>
  );
}

// DEEP BACKGROUND LAYER: Distant mega-structures
function DistantMegaStructures() {
  const structuresRef = useRef<THREE.Group>(null);

  const structures = useMemo(() => [
    { pos: [-60, 30, -80] as [number, number, number], size: [15, 120, 15] as [number, number, number], color: '#0a0a15' },
    { pos: [70, 40, -90] as [number, number, number], size: [20, 150, 20] as [number, number, number], color: '#0a0a18' },
    { pos: [-40, 50, -100] as [number, number, number], size: [25, 180, 25] as [number, number, number], color: '#080812' },
    { pos: [50, 35, -85] as [number, number, number], size: [12, 100, 12] as [number, number, number], color: '#0a0a15' },
    { pos: [0, 60, -110] as [number, number, number], size: [30, 200, 30] as [number, number, number], color: '#080810' },
    { pos: [-70, 45, -95] as [number, number, number], size: [18, 130, 18] as [number, number, number], color: '#0a0a18' },
    { pos: [80, 55, -105] as [number, number, number], size: [22, 160, 22] as [number, number, number], color: '#080812' },
  ], []);

  useFrame((state) => {
    if (structuresRef.current) {
      const time = state.clock.elapsedTime;
      structuresRef.current.children.forEach((struct, i) => {
        // Subtle pulse on window lights
        const windowMesh = struct.children[1] as THREE.Mesh;
        if (windowMesh) {
          const mat = windowMesh.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.2 + Math.sin(time * 0.5 + i) * 0.1;
        }
      });
    }
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
          {/* Window strip */}
          <mesh position={[0, 0, struct.size[2] / 2 + 0.1]}>
            <planeGeometry args={[struct.size[0] * 0.8, struct.size[1] * 0.9]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={0.2}
            />
          </mesh>
          {/* Top beacon */}
          <pointLight
            color="#ff0000"
            intensity={0.8}
            distance={30}
            position={[0, struct.size[1] / 2 + 5, 0]}
          />
        </group>
      ))}
    </group>
  );
}

// DEEP BACKGROUND LAYER: Atmospheric light beams
function AtmosphericLightBeams() {
  const beamsRef = useRef<THREE.Group>(null);

  const beams = useMemo(() => [
    { pos: [-50, 0, -70] as [number, number, number], color: '#00ffff', height: 150 },
    { pos: [60, 0, -80] as [number, number, number], color: '#ff00ff', height: 180 },
    { pos: [-30, 0, -90] as [number, number, number], color: '#00ff88', height: 160 },
    { pos: [40, 0, -75] as [number, number, number], color: '#ffaa00', height: 140 },
    { pos: [0, 0, -100] as [number, number, number], color: '#ff0066', height: 200 },
  ], []);

  useFrame((state) => {
    if (beamsRef.current) {
      const time = state.clock.elapsedTime;
      beamsRef.current.children.forEach((beam, i) => {
        const mat = (beam as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = 0.08 + Math.sin(time * 0.3 + i * 2) * 0.04;
      });
    }
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
