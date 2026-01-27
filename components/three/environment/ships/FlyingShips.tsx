'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePools } from '../../pools';
import Ship from './Ship';
import type { ShipConfig } from '@/types/three-scene';
import { ANIMATION_SPEEDS, SHIP_SCALE } from '@/config/constants';

/**
 * Orchestrates the flying ship fleet.
 *
 * Manages 4 size classes of ships:
 * - Shuttles (small, fast)
 * - Transports (medium)
 * - Freighters (large)
 * - Capital Ships / Dreadnoughts (massive, 9x scale)
 *
 * Each ship type has distinct characteristics, movement patterns,
 * and visual styling.
 */
export default function FlyingShips() {
  const shipsRef = useRef<THREE.Group>(null);
  const { geometries, materials } = usePools();

  // Generate ship fleet with 4 size classes
  const ships: ShipConfig[] = useMemo(() => {
    const fleet: ShipConfig[] = [];
    const seed = 54321;
    const random = (i: number) => {
      const x = Math.sin(seed + i * 7777) * 10000;
      return x - Math.floor(x);
    };

    // Small Shuttles (8x)
    for (let i = 0; i < SHIP_SCALE.SHUTTLE_COUNT; i++) {
      fleet.push({
        type: 'shuttle',
        size: [
          (0.8 + random(i) * 0.4) * 1.5,
          (0.25 + random(i + 10) * 0.1) * 1.5,
          (0.4 + random(i + 20) * 0.2) * 1.5,
        ],
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

    // Medium Transports (5x)
    for (let i = 0; i < SHIP_SCALE.TRANSPORT_COUNT; i++) {
      fleet.push({
        type: 'transport',
        size: [
          (2.2 + random(i + 100) * 0.6) * 1.5,
          (0.5 + random(i + 110) * 0.2) * 1.5,
          (1.0 + random(i + 120) * 0.4) * 1.5,
        ],
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

    // Large Freighters (3x)
    for (let i = 0; i < SHIP_SCALE.FREIGHTER_COUNT; i++) {
      fleet.push({
        type: 'freighter',
        size: [
          (4.0 + random(i + 200) * 1.5) * 1.5,
          (1.0 + random(i + 210) * 0.5) * 1.5,
          (2.0 + random(i + 220) * 0.8) * 1.5,
        ],
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

    // Capital Ships - 3 ultra-massive dreadnoughts with different colors
    // Capital Ship 1: Deep Navy Blue with Orange Engines
    fleet.push({
      type: 'dreadnought',
      size: [
        (4.0 + random(300) * 1.5) * 9,
        (1.2 + random(301) * 0.5) * 9,
        (2.5 + random(302) * 1.0) * 9,
      ],
      speed: 0.04 + random(303) * 0.015,
      color: '#1a2a3a', // Deep navy blue
      lightIntensity: 1.5,
      lightColor: '#ffddaa',
      engineColor: '#ff6600', // Orange engines
      yBase: 32 + random(304) * 8,
      zLane: -50 - random(305) * 15,
      direction: 1,
      offset: 0,
    });

    // Capital Ship 2: Dark Purple with Cyan Engines
    fleet.push({
      type: 'dreadnought',
      size: [
        (3.8 + random(310) * 1.4) * 9,
        (1.3 + random(311) * 0.6) * 9,
        (2.6 + random(312) * 1.1) * 9,
      ],
      speed: 0.03 + random(313) * 0.012,
      color: '#2a1a3a', // Dark purple
      lightIntensity: 1.4,
      lightColor: '#ddaaff', // Purple accent light
      engineColor: '#00ccff', // Cyan engines
      yBase: 35 + random(314) * 8,
      zLane: -55 - random(315) * 12,
      direction: -1,
      offset: 40,
    });

    // Capital Ship 3: Dark Gray with Green Engines
    fleet.push({
      type: 'dreadnought',
      size: [
        (4.1 + random(320) * 1.6) * 9,
        (1.1 + random(321) * 0.4) * 9,
        (2.4 + random(322) * 0.9) * 9,
      ],
      speed: 0.035 + random(323) * 0.014,
      color: '#1a1a28', // Dark gray
      lightIntensity: 1.6,
      lightColor: '#aaffdd', // Green-tinted light
      engineColor: '#00ff88', // Green engines
      yBase: 29 + random(324) * 9,
      zLane: -45 - random(325) * 18,
      direction: 1,
      offset: 20,
    });

    return fleet;
  }, []);

  // Animate ship movement and rotation
  useFrame((state) => {
    if (!shipsRef.current) return;
    const time = state.clock.elapsedTime;

    shipsRef.current.children.forEach((shipGroup, i) => {
      const config = ships[i];
      const xRange =
        config.type === 'freighter' ? 50 : config.type === 'transport' ? 45 : 40;

      // Movement with wrapping - narrower for portrait
      const rawX =
        (time * config.speed * config.direction * 12 + config.offset) %
        (xRange * 2);
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
        <Ship
          key={i}
          config={config}
          index={i}
          geometries={geometries}
          materials={materials}
        />
      ))}
    </group>
  );
}
