'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { setMaterialOpacity, setEmissiveIntensity } from '@/lib/type-guards';

/**
 * Options for flicker animation.
 */
interface FlickerOptions {
  /** Animation speed multiplier (default: 2) */
  speed?: number;
  /** Base opacity/intensity (default: 0.5) */
  baseValue?: number;
  /** Flicker intensity (default: 0.3) */
  amount?: number;
  /** Phase offset for staggering (default: 0) */
  offset?: number;
  /** What to animate: 'opacity' or 'emissive' (default: 'opacity') */
  mode?: 'opacity' | 'emissive';
}

/**
 * Hook for flickering light/material animations.
 *
 * Common pattern in neon signs, windows, and indicators.
 * Automatically handles material type checking and safe updates.
 *
 * @param meshRef - Ref to the mesh to animate
 * @param options - Animation configuration
 *
 * @example
 * ```typescript
 * const meshRef = useRef<THREE.Mesh>(null);
 *
 * useFlickerAnimation(meshRef, {
 *   speed: 20,
 *   baseValue: 0.5,
 *   amount: 0.3,
 *   offset: index * 0.5,
 * });
 *
 * return <mesh ref={meshRef} ... />;
 * ```
 */
export function useFlickerAnimation(
  meshRef: React.RefObject<THREE.Mesh>,
  options: FlickerOptions = {}
): void {
  const {
    speed = 2,
    baseValue = 0.5,
    amount = 0.3,
    offset = 0,
    mode = 'opacity',
  } = options;

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const flicker = Math.sin(time * speed + offset) * amount;
    const value = baseValue + flicker;

    if (mode === 'opacity') {
      setMaterialOpacity(meshRef.current, value);
    } else if (mode === 'emissive') {
      setEmissiveIntensity(meshRef.current, value);
    }
  });
}
