'use client';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Options for orbital motion.
 */
interface OrbitalOptions {
  /** Orbit radius (default: 5) */
  radius?: number;
  /** Orbital speed (default: 1) */
  speed?: number;
  /** Phase offset (default: 0) */
  offset?: number;
  /** Center position (default: [0, 0, 0]) */
  center?: [number, number, number];
  /** Vertical bobbing (default: 0) */
  yAmplitude?: number;
  /** Vertical bobbing speed (default: 1) */
  ySpeed?: number;
}

/**
 * Hook for circular orbital motion.
 *
 * Common for drones, particles, and rotating elements.
 *
 * @param groupRef - Ref to group or mesh to animate
 * @param options - Motion configuration
 *
 * @example
 * ```typescript
 * const groupRef = useRef<THREE.Group>(null);
 *
 * useOrbitalMotion(groupRef, {
 *   radius: 10,
 *   speed: 0.5,
 *   offset: index * Math.PI / 6,
 *   yAmplitude: 2,
 * });
 * ```
 */
export function useOrbitalMotion(
  groupRef: React.RefObject<THREE.Group | THREE.Mesh>,
  options: OrbitalOptions = {}
): void {
  const {
    radius = 5,
    speed = 1,
    offset = 0,
    center = [0, 0, 0],
    yAmplitude = 0,
    ySpeed = 1,
  } = options;

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    const angle = time * speed + offset;

    groupRef.current.position.x = center[0] + Math.cos(angle) * radius;
    groupRef.current.position.z = center[2] + Math.sin(angle) * radius;

    if (yAmplitude > 0) {
      groupRef.current.position.y =
        center[1] + Math.sin(time * ySpeed + offset) * yAmplitude;
    }
  });
}
