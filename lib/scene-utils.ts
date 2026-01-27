import * as THREE from 'three';
import type { IMaterialPool } from '@/components/three/pools';
import { CYBERPUNK_COLORS } from '@/config/constants';

/**
 * Maps window color string to pooled material.
 *
 * Centralizes color-to-material lookup logic used across
 * buildings, megastructures, and UI elements.
 *
 * @param materials - The material pool
 * @param color - Hex color string
 * @returns MeshBasicMaterial with matching color
 *
 * @example
 * ```typescript
 * const windowMat = getWindowMaterialByColor(materials, '#00ffff');
 * ```
 */
export function getWindowMaterialByColor(
  materials: IMaterialPool,
  color: string
): THREE.MeshBasicMaterial {
  const colorMap: Record<string, keyof IMaterialPool> = {
    [CYBERPUNK_COLORS.CYAN]: 'windowCyan',
    [CYBERPUNK_COLORS.MAGENTA]: 'windowMagenta',
    [CYBERPUNK_COLORS.AMBER]: 'windowAmber',
    [CYBERPUNK_COLORS.GREEN]: 'windowGreen',
  };

  const key = colorMap[color] ?? 'windowCyan';
  return materials[key] as THREE.MeshBasicMaterial;
}

/**
 * Maps hull color to pooled ship material.
 *
 * Analyzes hex color to determine appropriate material variant.
 *
 * @param materials - The material pool
 * @param color - Hex color string
 * @returns MeshStandardMaterial for ship hull
 */
export function getHullMaterialByColor(
  materials: IMaterialPool,
  color: string
): THREE.MeshStandardMaterial {
  // Navy blue variants
  if (color.includes('2a3a') || color.includes('1a2a')) {
    return materials.shipHullNavy;
  }

  // Purple variants
  if (color.includes('1a3a') || color.includes('2a1a')) {
    return materials.shipHullPurple;
  }

  // Gray variants
  if (color.includes('1a28') || color.includes('2828')) {
    return materials.shipHullGray;
  }

  // Default dark hull
  return materials.shipHullDark;
}

/**
 * Calculates orbital position for circular motion.
 *
 * Common pattern for drones, particles, and rotating elements.
 *
 * @param time - Current animation time
 * @param radius - Orbit radius
 * @param speed - Orbital speed multiplier
 * @param offset - Phase offset for staggering
 * @returns Position tuple [x, y, z]
 */
export function orbitalPosition(
  time: number,
  radius: number,
  speed: number,
  offset: number
): [number, number, number] {
  const angle = time * speed + offset;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return [x, 0, z];
}

/**
 * Calculates hover/float animation offset.
 *
 * Smooth sine wave motion for floating elements.
 *
 * @param time - Current animation time
 * @param amplitude - Hover height range
 * @param speed - Hover speed multiplier
 * @param offset - Phase offset
 * @returns Y position offset
 */
export function hoverOffset(
  time: number,
  amplitude: number,
  speed: number,
  offset: number
): number {
  return Math.sin(time * speed + offset) * amplitude;
}

/**
 * Calculates flicker intensity for neon/emissive effects.
 *
 * @param time - Current animation time
 * @param baseIntensity - Base emissive/opacity value
 * @param flickerAmount - Flicker intensity (0-1)
 * @param speed - Flicker speed
 * @param offset - Phase offset
 * @returns Current intensity value
 */
export function flickerIntensity(
  time: number,
  baseIntensity: number,
  flickerAmount: number,
  speed: number,
  offset: number
): number {
  return baseIntensity + Math.sin(time * speed + offset) * flickerAmount;
}
