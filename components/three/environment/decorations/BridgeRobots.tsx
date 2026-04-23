'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface RobotConfig {
  count: number;
  scale: number;
  speed: number;
  bodyColor: string;
  eyeColor: string;
  seed: number;
  bounce: boolean;
}

export const DEFAULT_ROBOT_CONFIG: RobotConfig = {
  count: 8,
  scale: 1.2,
  speed: 1.5,
  bodyColor: '#1e1e30',
  eyeColor: '#00ff88',
  seed: 77,
  bounce: true,
};

interface BridgeRobotsProps {
  bridgeLength: number;
  config?: RobotConfig;
  deckY?: number;
}

function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface RobotRefs {
  group: THREE.Group | null;
  leftLeg: THREE.Mesh | null;
  rightLeg: THREE.Mesh | null;
  leftArm: THREE.Mesh | null;
  rightArm: THREE.Mesh | null;
  leftEye: THREE.Mesh | null;
  rightEye: THREE.Mesh | null;
}

export default function BridgeRobots({
  bridgeLength,
  config = DEFAULT_ROBOT_CONFIG,
  deckY = 0.8,
}: BridgeRobotsProps) {
  const { count, scale, speed, bodyColor, eyeColor, seed, bounce } = config;

  const robotRefs = useRef<RobotRefs[]>(
    Array.from({ length: count }, () => ({
      group: null,
      leftLeg: null,
      rightLeg: null,
      leftArm: null,
      rightArm: null,
      leftEye: null,
      rightEye: null,
    }))
  );

  const bodyColorObj = useMemo(() => new THREE.Color(bodyColor), [bodyColor]);
  const eyeColorObj = useMemo(() => new THREE.Color(eyeColor), [eyeColor]);

  const robotVariants = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        phaseOffset: (i / count) * bridgeLength,
        hasAntenna: seededRand(seed + i * 13) > 0.5,
        hasShoulderPads: seededRand(seed + i * 17) > 0.4,
        hasBackFin: seededRand(seed + i * 23) > 0.7,
        hasShoulderSpikes: seededRand(seed + i * 29) > 0.5,
        sensorDotCount: 3 + Math.floor(seededRand(seed + i * 31) * 3),
      })),
    [count, bridgeLength, seed]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    robotRefs.current.forEach((refs, i) => {
      if (!refs.group) return;
      const variant = robotVariants[i];
      const { phaseOffset } = variant;

      let localX: number;
      if (bounce) {
        const raw = ((t * speed + phaseOffset) % (bridgeLength * 2)) / bridgeLength;
        localX = (raw < 1 ? raw : 2 - raw) * bridgeLength - bridgeLength / 2;
        refs.group.rotation.y = raw < 1 ? 0 : Math.PI;
      } else {
        localX = ((t * speed + phaseOffset) % bridgeLength) - bridgeLength / 2;
        refs.group.rotation.y = 0;
      }

      refs.group.position.x = localX;
      refs.group.position.y =
        deckY + 0.05 * Math.abs(Math.sin(t * speed * 4 + phaseOffset));

      const legSwing = Math.sin(t * speed * 4 + phaseOffset) * 0.4;
      if (refs.leftLeg) refs.leftLeg.rotation.x = legSwing;
      if (refs.rightLeg) refs.rightLeg.rotation.x = -legSwing;
      if (refs.leftArm) refs.leftArm.rotation.x = -legSwing * 0.75;
      if (refs.rightArm) refs.rightArm.rotation.x = legSwing * 0.75;

      const eyePulse = 0.8 + Math.sin(t * 2 + phaseOffset) * 0.2;
      if (refs.leftEye?.material) {
        (refs.leftEye.material as THREE.MeshStandardMaterial).emissiveIntensity = eyePulse;
      }
      if (refs.rightEye?.material) {
        (refs.rightEye.material as THREE.MeshStandardMaterial).emissiveIntensity = eyePulse;
      }
    });
  });

  return (
    <>
      {robotVariants.map((variant, i) => (
        <group
          key={`robot-${i}`}
          ref={(el) => {
            if (robotRefs.current[i]) robotRefs.current[i].group = el as THREE.Group;
          }}
          scale={[scale, scale, scale]}
          position={[variant.phaseOffset - bridgeLength / 2, deckY, 0]}
        >
          {/* Torso */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.6, 0.8, 0.4]} />
            <meshStandardMaterial color={bodyColorObj} metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Chest emblem */}
          <mesh position={[0, 0.05, 0.21]}>
            <tetrahedronGeometry args={[0.18]} />
            <meshStandardMaterial color={eyeColorObj} emissive={eyeColorObj} emissiveIntensity={0.7} />
          </mesh>

          {/* Chest port */}
          <mesh position={[0, -0.2, 0.21]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.2, 0.04, 6, 12]} />
            <meshStandardMaterial color={eyeColorObj} emissive={eyeColorObj} emissiveIntensity={0.6} />
          </mesh>

          {/* Sensor dots */}
          {Array.from({ length: variant.sensorDotCount }, (_, si) => (
            <mesh
              key={`sensor-${si}`}
              position={[
                -0.15 + si * (0.3 / (variant.sensorDotCount - 1)),
                0.15,
                0.21,
              ]}
            >
              <sphereGeometry args={[0.04, 4, 4]} />
              <meshStandardMaterial color={eyeColorObj} emissive={eyeColorObj} emissiveIntensity={0.8} />
            </mesh>
          ))}

          {/* Shoulder pads */}
          {variant.hasShoulderPads && (
            <>
              <mesh position={[-0.45, 0.25, 0]}>
                <boxGeometry args={[0.25, 0.12, 0.45]} />
                <meshStandardMaterial color={bodyColorObj} metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[0.45, 0.25, 0]}>
                <boxGeometry args={[0.25, 0.12, 0.45]} />
                <meshStandardMaterial color={bodyColorObj} metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Shoulder spikes */}
              {variant.hasShoulderSpikes && (
                <>
                  <mesh position={[-0.45, 0.35, 0]}>
                    <coneGeometry args={[0.1, 0.3, 3]} />
                    <meshStandardMaterial color={bodyColorObj} metalness={0.8} roughness={0.3} />
                  </mesh>
                  <mesh position={[0.45, 0.35, 0]}>
                    <coneGeometry args={[0.1, 0.3, 3]} />
                    <meshStandardMaterial color={bodyColorObj} metalness={0.8} roughness={0.3} />
                  </mesh>
                </>
              )}
            </>
          )}

          {/* Shoulder sockets */}
          {[-0.35, 0.35].map((x, si) => (
            <mesh key={`socket-${si}`} position={[x, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.14, 0.03, 6, 10]} />
              <meshStandardMaterial color={bodyColorObj} metalness={0.7} roughness={0.4} />
            </mesh>
          ))}

          {/* Head */}
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[0.5, 0.4, 0.35]} />
            <meshStandardMaterial color={bodyColorObj} metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Head visor band */}
          <mesh position={[0, 0.65, 0.18]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.22, 0.04, 4, 12, Math.PI]} />
            <meshStandardMaterial color={eyeColorObj} emissive={eyeColorObj} emissiveIntensity={0.6} />
          </mesh>

          {/* Eyes */}
          <mesh
            ref={(el) => {
              if (robotRefs.current[i]) robotRefs.current[i].leftEye = el as THREE.Mesh;
            }}
            position={[-0.12, 0.68, 0.18]}
          >
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshStandardMaterial color={eyeColorObj} emissive={eyeColorObj} emissiveIntensity={0.8} />
          </mesh>
          <mesh
            ref={(el) => {
              if (robotRefs.current[i]) robotRefs.current[i].rightEye = el as THREE.Mesh;
            }}
            position={[0.12, 0.68, 0.18]}
          >
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshStandardMaterial color={eyeColorObj} emissive={eyeColorObj} emissiveIntensity={0.8} />
          </mesh>

          {/* Antenna */}
          {variant.hasAntenna && (
            <mesh position={[0, 1.0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.35, 4]} />
              <meshStandardMaterial color={bodyColorObj} metalness={0.9} roughness={0.2} />
            </mesh>
          )}

          {/* Back fin */}
          {variant.hasBackFin && (
            <mesh position={[0, 0.2, -0.22]}>
              <tetrahedronGeometry args={[0.2]} />
              <meshStandardMaterial color={bodyColorObj} metalness={0.8} roughness={0.3} />
            </mesh>
          )}

          {/* Left arm */}
          <mesh
            ref={(el) => {
              if (robotRefs.current[i]) robotRefs.current[i].leftArm = el as THREE.Mesh;
            }}
            position={[-0.45, -0.05, 0]}
          >
            <boxGeometry args={[0.15, 0.6, 0.15]} />
            <meshStandardMaterial color={bodyColorObj} metalness={0.7} roughness={0.4} />
          </mesh>

          {/* Right arm */}
          <mesh
            ref={(el) => {
              if (robotRefs.current[i]) robotRefs.current[i].rightArm = el as THREE.Mesh;
            }}
            position={[0.45, -0.05, 0]}
          >
            <boxGeometry args={[0.15, 0.6, 0.15]} />
            <meshStandardMaterial color={bodyColorObj} metalness={0.7} roughness={0.4} />
          </mesh>

          {/* Left leg */}
          <mesh
            ref={(el) => {
              if (robotRefs.current[i]) robotRefs.current[i].leftLeg = el as THREE.Mesh;
            }}
            position={[-0.18, -0.7, 0]}
          >
            <boxGeometry args={[0.2, 0.6, 0.2]} />
            <meshStandardMaterial color={bodyColorObj} metalness={0.7} roughness={0.4} />
          </mesh>

          {/* Right leg */}
          <mesh
            ref={(el) => {
              if (robotRefs.current[i]) robotRefs.current[i].rightLeg = el as THREE.Mesh;
            }}
            position={[0.18, -0.7, 0]}
          >
            <boxGeometry args={[0.2, 0.6, 0.2]} />
            <meshStandardMaterial color={bodyColorObj} metalness={0.7} roughness={0.4} />
          </mesh>

          {/* Knee joints */}
          {[-0.18, 0.18].map((x, ki) => (
            <mesh key={`knee-${ki}`} position={[x, -0.65, 0.11]}>
              <torusGeometry args={[0.12, 0.03, 5, 10]} />
              <meshStandardMaterial color={bodyColorObj} metalness={0.6} roughness={0.5} emissive={bodyColorObj} emissiveIntensity={0.1} />
            </mesh>
          ))}

          {/* Knee guards */}
          {[-0.18, 0.18].map((x, ki) => (
            <mesh key={`kguard-${ki}`} position={[x, -0.58, 0.12]}>
              <coneGeometry args={[0.15, 0.25, 3]} />
              <meshStandardMaterial color={bodyColorObj} metalness={0.8} roughness={0.3} />
            </mesh>
          ))}

          {/* Foot toe-caps */}
          {[-0.18, 0.18].map((x, fi) => (
            <mesh key={`foot-${fi}`} position={[x, -1.02, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.12, 0.2, 3]} />
              <meshStandardMaterial color={bodyColorObj} metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}
