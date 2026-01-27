import * as THREE from 'three';
import type { IGeometryPool, IMaterialPool } from '@/components/three/pools';
import type { ShipBlueprint } from '@/components/three/environment/ships/ShipBlueprint';
import type { BuildingBlueprint } from '@/components/three/environment/buildings/BuildingBlueprint';
import type { BackPanelBlueprint } from '@/components/three/BackPanelBlueprint';

/**
 * 3D position/rotation tuple [x, y, z].
 */
export type Vector3Tuple = readonly [number, number, number];

/**
 * 2D position/size tuple [x, y].
 */
export type Vector2Tuple = readonly [number, number];

/**
 * Ship classification types.
 */
export type ShipType = 'shuttle' | 'transport' | 'freighter' | 'dreadnought';

/**
 * Ship movement direction.
 * 1 = moving right, -1 = moving left
 */
export type ShipDirection = 1 | -1;

/**
 * Window color options for buildings.
 */
export type WindowColor = '#00ffff' | '#ff00ff' | '#ffaa00' | '#00ff88';

/**
 * Configuration for a flying ship.
 */
export interface ShipConfig {
  /** Ship classification */
  readonly type: ShipType;
  /** Ship dimensions [width, height, depth] */
  readonly size: Vector3Tuple;
  /** Movement speed multiplier */
  readonly speed: number;
  /** Hull color hex code */
  readonly color: string;
  /** Light intensity for ship lights */
  readonly lightIntensity: number;
  /** Light color hex code */
  readonly lightColor: string;
  /** Engine glow color hex code */
  readonly engineColor: string;
  /** Base Y position */
  readonly yBase: number;
  /** Z lane for movement path */
  readonly zLane: number;
  /** Movement direction (1 or -1) */
  readonly direction: ShipDirection;
  /** Animation phase offset */
  readonly offset: number;
  /** Seed for procedural variation (optional, defaults to index) */
  readonly variantSeed?: number;
}

/**
 * Configuration for a cyberpunk building.
 */
export interface BuildingConfig {
  /** Building position [x, y, z] */
  readonly position: Vector3Tuple;
  /** Building dimensions [width, height, depth] */
  readonly size: Vector3Tuple;
  /** Window light color */
  readonly windowColor: WindowColor;
  /** Whether building has antenna */
  readonly hasAntenna: boolean;
  /** Seed for procedural variation (optional, defaults to index) */
  readonly variantSeed?: number;
}

/**
 * Props for CyberpunkBuilding component.
 */
export interface CyberpunkBuildingProps {
  /** Building position */
  readonly position: Vector3Tuple;
  /** Building dimensions */
  readonly size: Vector3Tuple;
  /** Building hull material */
  readonly material: THREE.Material;
  /** Window color */
  readonly windowColor: string;
  /** Building index for animation offset */
  readonly index: number;
  /** Whether to add antenna on top */
  readonly hasAntenna: boolean;
  /** Pooled geometries */
  readonly geometries: IGeometryPool;
  /** Pooled materials */
  readonly materials: IMaterialPool;
  /** Seed for procedural variation (optional, defaults to index) */
  readonly variantSeed?: number;
}

/**
 * Reusable pools props interface.
 */
export interface PoolsProps {
  /** Pooled geometries */
  readonly geometries: IGeometryPool;
  /** Pooled materials */
  readonly materials: IMaterialPool;
}

/**
 * Animation state for interactive elements.
 */
export interface AnimationState {
  /** Whether element is being hovered */
  readonly isHovered: boolean;
  /** Whether element was just tapped/clicked */
  readonly isTapped: boolean;
}

/**
 * Drone configuration for swarm.
 */
export interface DroneConfig {
  /** Orbital radius */
  readonly radius: number;
  /** Orbital speed */
  readonly speed: number;
  /** Vertical offset */
  readonly yOffset: number;
  /** Phase offset for orbit */
  readonly phaseOffset: number;
}

/**
 * Platform configuration for floating platforms.
 */
export interface PlatformConfig {
  /** Platform position */
  readonly position: Vector3Tuple;
  /** Platform dimensions */
  readonly size: Vector2Tuple;
  /** Hover animation speed */
  readonly hoverSpeed: number;
  /** Hover amplitude */
  readonly hoverAmplitude: number;
}

/**
 * Neon sign configuration.
 */
export interface NeonSignConfig {
  /** Sign position */
  readonly position: Vector3Tuple;
  /** Sign text content */
  readonly text: string;
  /** Sign color */
  readonly color: string;
  /** Flicker speed */
  readonly flickerSpeed: number;
}

/**
 * Re-export blueprint types for convenience.
 * These are imported from their respective blueprint generator modules.
 */
export type { ShipBlueprint, BuildingBlueprint, BackPanelBlueprint };
