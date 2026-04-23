'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { seededRandom } from '../utils/seededRandom';

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

interface RobotRefs {
  group: THREE.Group | null;
  leftLeg: THREE.Mesh | null;
  rightLeg: THREE.Mesh | null;
  leftArm: THREE.Mesh | null;
  rightArm: THREE.Mesh | null;
  leftEye: THREE.Mesh | null;
  rightEye: THREE.Mesh | null;
}

// Shared geometries (identical across all robots — created once per component mount)
function useRobotGeos() {
  return useMemo(() => ({
    torso:         new THREE.BoxGeometry(0.6, 0.8, 0.4),
    head:          new THREE.BoxGeometry(0.5, 0.4, 0.35),
    arm:           new THREE.BoxGeometry(0.15, 0.6, 0.15),
    leg:           new THREE.BoxGeometry(0.2, 0.6, 0.2),
    shoulderPad:   new THREE.BoxGeometry(0.25, 0.12, 0.45),
    chestEmblem:   new THREE.TetrahedronGeometry(0.18),
    backFin:       new THREE.TetrahedronGeometry(0.2),
    chestPort:     new THREE.TorusGeometry(0.2, 0.04, 6, 12),
    shoulderSocket:new THREE.TorusGeometry(0.14, 0.03, 6, 10),
    visorBand:     new THREE.TorusGeometry(0.22, 0.04, 4, 12, Math.PI),
    kneeJoint:     new THREE.TorusGeometry(0.12, 0.03, 5, 10),
    eye:           new THREE.SphereGeometry(0.07, 6, 6),
    sensorDot:     new THREE.SphereGeometry(0.04, 4, 4),
    antenna:       new THREE.CylinderGeometry(0.02, 0.02, 0.35, 4),
    shoulderSpike: new THREE.ConeGeometry(0.1, 0.3, 3),
    kneeGuard:     new THREE.ConeGeometry(0.15, 0.25, 3),
    footToe:       new THREE.ConeGeometry(0.12, 0.2, 3),
  }), []);
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

  const geos = useRobotGeos();

  // Shared materials — two base materials cover all body/eye parts
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.8, roughness: 0.3 }),
    [bodyColor]
  );
  const eyeMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: eyeColor,
      emissive: new THREE.Color(eyeColor),
      emissiveIntensity: 0.8,
    }),
    [eyeColor]
  );
  const sensorDotMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: new THREE.Color(eyeColor),
      emissive: new THREE.Color(eyeColor),
      emissiveIntensity: 0.8,
    }),
    [eyeColor]
  );

  // Dispose all manually-created resources on unmount
  useEffect(() => {
    return () => {
      Object.values(geos).forEach((g) => g.dispose());
      bodyMat.dispose();
      eyeMat.dispose();
      sensorDotMat.dispose();
    };
  }, [geos, bodyMat, eyeMat, sensorDotMat]);

  const robotVariants = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        phaseOffset: (i / count) * bridgeLength,
        hasAntenna: seededRandom(seed, i * 13) > 0.5,
        hasShoulderPads: seededRandom(seed, i * 17) > 0.4,
        hasBackFin: seededRandom(seed, i * 23) > 0.7,
        hasShoulderSpikes: seededRandom(seed, i * 29) > 0.5,
        sensorDotCount: 3 + Math.floor(seededRandom(seed, i * 31) * 3),
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
          <mesh position={[0, 0, 0]} geometry={geos.torso} material={bodyMat} />

          <mesh position={[0, 0.05, 0.21]} geometry={geos.chestEmblem} material={eyeMat} />

          <mesh position={[0, -0.2, 0.21]} geometry={geos.chestPort} material={eyeMat} />

          {Array.from({ length: variant.sensorDotCount }, (_, si) => (
            <mesh
              key={`sensor-${si}`}
              position={[
                -0.15 + si * (0.3 / (variant.sensorDotCount - 1)),
                0.15,
                0.21,
              ]}
              geometry={geos.sensorDot}
              material={sensorDotMat}
            />
          ))}

          {variant.hasShoulderPads && (
            <>
              <mesh position={[-0.45, 0.25, 0]} geometry={geos.shoulderPad} material={bodyMat} />
              <mesh position={[0.45, 0.25, 0]} geometry={geos.shoulderPad} material={bodyMat} />
              {variant.hasShoulderSpikes && (
                <>
                  <mesh position={[-0.45, 0.35, 0]} geometry={geos.shoulderSpike} material={bodyMat} />
                  <mesh position={[0.45, 0.35, 0]} geometry={geos.shoulderSpike} material={bodyMat} />
                </>
              )}
            </>
          )}

          {[-0.35, 0.35].map((x, si) => (
            <mesh key={`socket-${si}`} position={[x, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}
              geometry={geos.shoulderSocket} material={bodyMat} />
          ))}

          <mesh position={[0, 0.65, 0]} geometry={geos.head} material={bodyMat} />

          <mesh position={[0, 0.65, 0.18]} geometry={geos.visorBand} material={eyeMat} />

          <mesh
            ref={(el) => { if (robotRefs.current[i]) robotRefs.current[i].leftEye = el as THREE.Mesh; }}
            position={[-0.12, 0.68, 0.18]}
            geometry={geos.eye}
            material={eyeMat}
          />
          <mesh
            ref={(el) => { if (robotRefs.current[i]) robotRefs.current[i].rightEye = el as THREE.Mesh; }}
            position={[0.12, 0.68, 0.18]}
            geometry={geos.eye}
            material={eyeMat}
          />

          {variant.hasAntenna && (
            <mesh position={[0, 1.0, 0]} geometry={geos.antenna} material={bodyMat} />
          )}

          {variant.hasBackFin && (
            <mesh position={[0, 0.2, -0.22]} geometry={geos.backFin} material={bodyMat} />
          )}

          <mesh
            ref={(el) => { if (robotRefs.current[i]) robotRefs.current[i].leftArm = el as THREE.Mesh; }}
            position={[-0.45, -0.05, 0]}
            geometry={geos.arm}
            material={bodyMat}
          />
          <mesh
            ref={(el) => { if (robotRefs.current[i]) robotRefs.current[i].rightArm = el as THREE.Mesh; }}
            position={[0.45, -0.05, 0]}
            geometry={geos.arm}
            material={bodyMat}
          />

          <mesh
            ref={(el) => { if (robotRefs.current[i]) robotRefs.current[i].leftLeg = el as THREE.Mesh; }}
            position={[-0.18, -0.7, 0]}
            geometry={geos.leg}
            material={bodyMat}
          />
          <mesh
            ref={(el) => { if (robotRefs.current[i]) robotRefs.current[i].rightLeg = el as THREE.Mesh; }}
            position={[0.18, -0.7, 0]}
            geometry={geos.leg}
            material={bodyMat}
          />

          {[-0.18, 0.18].map((x, ki) => (
            <mesh key={`knee-${ki}`} position={[x, -0.65, 0.11]}
              geometry={geos.kneeJoint} material={bodyMat} />
          ))}

          {[-0.18, 0.18].map((x, ki) => (
            <mesh key={`kguard-${ki}`} position={[x, -0.58, 0.12]}
              geometry={geos.kneeGuard} material={bodyMat} />
          ))}

          {[-0.18, 0.18].map((x, fi) => (
            <mesh key={`foot-${fi}`} position={[x, -1.02, 0.13]} rotation={[Math.PI / 2, 0, 0]}
              geometry={geos.footToe} material={bodyMat} />
          ))}
        </group>
      ))}
    </>
  );
}
