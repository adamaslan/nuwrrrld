'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface BridgeConfig {
  position: [number, number, number];
  rotationY: number;
  length: number;
  width: number;
  towerHeight: number;
  cableCount: number;
  accentColor: string;
  structureColor: string;
  glowIntensity: number;
}

export const DEFAULT_BRIDGE_CONFIG: BridgeConfig = {
  position: [-105, 18, -70],
  rotationY: 0,
  length: 70,
  width: 6,
  towerHeight: 22,
  cableCount: 8,
  accentColor: '#00ffff',
  structureColor: '#1a1a2e',
  glowIntensity: 0.8,
};

interface CyberpunkBridgeProps {
  config?: BridgeConfig;
}

export default function CyberpunkBridge({ config = DEFAULT_BRIDGE_CONFIG }: CyberpunkBridgeProps) {
  const { length, width, towerHeight, cableCount, accentColor, structureColor, glowIntensity } = config;

  const navLightRefs = useRef<THREE.Mesh[]>([]);
  const deckLightRefs = useRef<THREE.Mesh[]>([]);
  const warningDeltaRefs = useRef<THREE.Mesh[]>([]);

  const cableMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(accentColor),
        emissive: new THREE.Color(accentColor),
        emissiveIntensity: glowIntensity,
      }),
    [accentColor, glowIntensity]
  );

  const accentColorObj = useMemo(() => new THREE.Color(accentColor), [accentColor]);
  const structureColorObj = useMemo(() => new THREE.Color(structureColor), [structureColor]);

  useEffect(() => {
    return () => {
      cableMat.dispose();
    };
  }, [cableMat]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    navLightRefs.current.forEach((mesh) => {
      if (mesh?.material) {
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          0.8 + Math.sin(t * 2) * 0.4;
      }
    });

    deckLightRefs.current.forEach((mesh, i) => {
      if (mesh?.material) {
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          0.4 + Math.sin(t * 3 + i * 0.4) * 0.3;
      }
    });

    cableMat.emissiveIntensity = glowIntensity * (0.7 + Math.sin(t * 0.8) * 0.3);

    warningDeltaRefs.current.forEach((mesh) => {
      if (mesh) mesh.rotation.y += 0.2 * delta;
    });
  });

  const cablePositions = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < cableCount; i++) {
      positions.push(-length / 2 + (i / (cableCount - 1)) * length);
    }
    return positions;
  }, [cableCount, length]);

  const railingPostPositions = useMemo(() => {
    const count = Math.floor(length / 4);
    return Array.from({ length: count }, (_, i) => -length / 2 + (i / (count - 1)) * length);
  }, [length]);

  const deckLightPositions = useMemo(() => {
    const count = Math.floor(length / 5);
    return Array.from({ length: count }, (_, i) => -length / 2 + (i / (count - 1)) * length);
  }, [length]);

  const setNavLightRef = (el: THREE.Mesh | null, i: number) => {
    if (el) navLightRefs.current[i] = el;
  };
  const setDeckLightRef = (el: THREE.Mesh | null, i: number) => {
    if (el) deckLightRefs.current[i] = el;
  };
  const setWarningDeltaRef = (el: THREE.Mesh | null, i: number) => {
    if (el) warningDeltaRefs.current[i] = el;
  };

  return (
    <group>
      {/* Deck */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[length, 0.8, width]} />
        <meshStandardMaterial color={structureColorObj} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Road surface */}
      <mesh position={[0, 0.41, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Left tower */}
      <mesh position={[-length / 2, towerHeight / 2, 0]}>
        <boxGeometry args={[2, towerHeight, 2]} />
        <meshStandardMaterial color={structureColorObj} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Right tower */}
      <mesh position={[length / 2, towerHeight / 2, 0]}>
        <boxGeometry args={[2, towerHeight, 2]} />
        <meshStandardMaterial color={structureColorObj} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Tower crossbeams */}
      <mesh position={[-length / 2, towerHeight, 0]}>
        <boxGeometry args={[6, 1, 1]} />
        <meshStandardMaterial color={structureColorObj} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[length / 2, towerHeight, 0]}>
        <boxGeometry args={[6, 1, 1]} />
        <meshStandardMaterial color={structureColorObj} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Tower cap pyramids */}
      {[-length / 2, length / 2].map((x, i) => (
        <mesh key={`cap-${i}`} position={[x, towerHeight + 2, 0]}>
          <coneGeometry args={[1.5, 4, 4]} />
          <meshStandardMaterial color={accentColorObj} emissive={accentColorObj} emissiveIntensity={0.6} />
        </mesh>
      ))}

      {/* Tower nav lights */}
      {[-length / 2, length / 2].map((x, i) => (
        <mesh
          key={`nav-${i}`}
          ref={(el) => setNavLightRef(el as THREE.Mesh, i)}
          position={[x, towerHeight + 4.5, 0]}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial
            color={accentColorObj}
            emissive={accentColorObj}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}

      {/* Portal rings on towers */}
      {[-length / 2, length / 2].map((x, ti) =>
        [towerHeight * 0.25, towerHeight * 0.5, towerHeight * 0.75].map((y, ri) => (
          <mesh key={`portal-${ti}-${ri}`} position={[x, y, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[4, 0.3, 8, 24]} />
            <meshStandardMaterial color={accentColorObj} emissive={accentColorObj} emissiveIntensity={0.5} />
          </mesh>
        ))
      )}

      {/* Suspension cables */}
      {cablePositions.map((x, i) => {
        const t = i / (cableCount - 1);
        const sag = Math.sin(t * Math.PI) * towerHeight * 0.6;
        const cableY = towerHeight - sag;
        return (
          <mesh key={`cable-${i}`} position={[x, cableY / 2 + 0.4, 0]}>
            <cylinderGeometry args={[0.1, 0.1, cableY, 4]} />
            <primitive object={cableMat} attach="material" />
          </mesh>
        );
      })}

      {/* Cable anchor halos */}
      {cablePositions.map((x, i) => (
        <mesh key={`halo-${i}`} position={[x, 0.42, 0]}>
          <torusGeometry args={[0.6, 0.1, 6, 16]} />
          <meshStandardMaterial color={accentColorObj} emissive={accentColorObj} emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Side railings */}
      {[-width / 2, width / 2].map((z, i) => (
        <mesh key={`railing-${i}`} position={[0, 0.65, z]}>
          <boxGeometry args={[length, 0.5, 0.2]} />
          <meshStandardMaterial color={structureColorObj} metalness={0.7} roughness={0.4} />
        </mesh>
      ))}

      {/* Railing posts */}
      {railingPostPositions.map((x, i) =>
        [-width / 2, width / 2].map((z, si) => (
          <mesh key={`post-${i}-${si}`} position={[x, 0.9, z]}>
            <boxGeometry args={[0.15, 1, 0.15]} />
            <meshStandardMaterial color={structureColorObj} metalness={0.8} roughness={0.3} />
          </mesh>
        ))
      )}

      {/* Railing roundels */}
      {railingPostPositions
        .filter((_, i) => i % 2 === 0)
        .map((x, i) =>
          [-width / 2, width / 2].map((z, si) => (
            <mesh key={`roundel-${i}-${si}`} position={[x, 0.65, z]}>
              <torusGeometry args={[0.4, 0.08, 6, 12]} />
              <meshStandardMaterial color={accentColorObj} emissive={accentColorObj} emissiveIntensity={0.4} />
            </mesh>
          ))
        )}

      {/* Truss gussets */}
      {railingPostPositions.map((x, i) =>
        [-width / 2 + 0.3, width / 2 - 0.3].map((z, si) => (
          <mesh key={`gusset-${i}-${si}`} position={[x, -0.2, z]}>
            <tetrahedronGeometry args={[1.5]} />
            <meshStandardMaterial color={structureColorObj} metalness={0.9} roughness={0.2} />
          </mesh>
        ))
      )}

      {/* Wheel medallions */}
      {[-length / 4, length / 4].map((x, i) => (
        <group key={`medallion-${i}`} position={[x, 0.42, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2, 0.2, 6, 20]} />
            <meshStandardMaterial color={structureColorObj} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.2, 0.15, 6, 20]} />
            <meshStandardMaterial color={accentColorObj} emissive={accentColorObj} emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}

      {/* Deck chevrons (road markings) */}
      {[-length / 3, 0, length / 3].map((x, i) => (
        <mesh key={`chevron-${i}`} position={[x, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width * 0.4, 2]} />
          <meshStandardMaterial color={accentColorObj} emissive={accentColorObj} emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Deck strip lights — two rows */}
      {deckLightPositions.map((x, i) =>
        [-width / 2 + 0.8, width / 2 - 0.8].map((z, si) => (
          <mesh
            key={`dlight-${i}-${si}`}
            ref={(el) => setDeckLightRef(el as THREE.Mesh, i * 2 + si)}
            position={[x, 0.43, z]}
          >
            <sphereGeometry args={[0.3, 6, 6]} />
            <meshStandardMaterial
              color={accentColorObj}
              emissive={accentColorObj}
              emissiveIntensity={0.4}
            />
          </mesh>
        ))
      )}

      {/* Warning delta shields at entry points */}
      {[-length / 2 + 1, length / 2 - 1].map((x, i) => (
        <mesh
          key={`delta-${i}`}
          ref={(el) => setWarningDeltaRef(el as THREE.Mesh, i)}
          position={[x, 1.5, 0]}
        >
          <tetrahedronGeometry args={[0.8]} />
          <meshStandardMaterial color={accentColorObj} emissive={accentColorObj} emissiveIntensity={0.7} />
        </mesh>
      ))}
    </group>
  );
}
