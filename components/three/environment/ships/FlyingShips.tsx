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

interface BoundaryWaypoint {
  x: number;
  z: number;
  arrivalTime: number;
}

export default function FlyingShips() {
  const shipsRef = useRef<THREE.Group>(null);
  const waypointsRef = useRef<Map<number, BoundaryWaypoint[]>>(new Map());
  const currentWaypointRef = useRef<Map<number, number>>(new Map());
  const { geometries, materials } = usePools();

  // Generate boundary waypoints for capital ships
  const generateBoundaryWaypoints = (shipIndex: number, capitalShipIndex: number): BoundaryWaypoint[] => {
    const seed = 54321 + capitalShipIndex * 1000;
    const random = (i: number) => {
      const x = Math.sin(seed + i * 7777) * 10000;
      return x - Math.floor(x);
    };

    const BOUNDARY_X = 150;
    const BOUNDARY_Z = 187.5;
    const waypoints: BoundaryWaypoint[] = [];

    // Generate 4 waypoints at different boundaries (corners)
    const corners = [
      { x: BOUNDARY_X, z: BOUNDARY_Z },      // top-right
      { x: -BOUNDARY_X, z: BOUNDARY_Z },     // top-left
      { x: -BOUNDARY_X, z: -BOUNDARY_Z },    // bottom-left
      { x: BOUNDARY_X, z: -BOUNDARY_Z },     // bottom-right
    ];

    // Shuffle corners with randomness and add some mid-boundary points
    const shuffledCorners = [...corners].sort(() => random(shipIndex * 100) - 0.5);
    let timeAccum = 0;

    for (let i = 0; i < shuffledCorners.length + 2; i++) {
      if (i < shuffledCorners.length) {
        const corner = shuffledCorners[i];
        timeAccum += 30 + random(shipIndex * 10 + i) * 20; // 30-50 seconds between waypoints
        waypoints.push({
          x: corner.x + (random(shipIndex * 20 + i) - 0.5) * 30,
          z: corner.z + (random(shipIndex * 30 + i) - 0.5) * 30,
          arrivalTime: timeAccum,
        });
      } else {
        // Add mid-boundary waypoints for variety
        const side = Math.floor(random(shipIndex * 40 + i) * 4);
        let x = 0, z = 0;
        switch (side) {
          case 0: // right edge
            x = BOUNDARY_X + (random(shipIndex * 50 + i) - 0.5) * 20;
            z = (random(shipIndex * 60 + i) - 0.5) * BOUNDARY_Z * 2;
            break;
          case 1: // left edge
            x = -BOUNDARY_X + (random(shipIndex * 50 + i) - 0.5) * 20;
            z = (random(shipIndex * 60 + i) - 0.5) * BOUNDARY_Z * 2;
            break;
          case 2: // top edge
            z = BOUNDARY_Z + (random(shipIndex * 50 + i) - 0.5) * 20;
            x = (random(shipIndex * 60 + i) - 0.5) * BOUNDARY_X * 2;
            break;
          case 3: // bottom edge
            z = -BOUNDARY_Z + (random(shipIndex * 50 + i) - 0.5) * 20;
            x = (random(shipIndex * 60 + i) - 0.5) * BOUNDARY_X * 2;
            break;
        }
        timeAccum += 30 + random(shipIndex * 10 + i) * 20;
        waypoints.push({ x, z, arrivalTime: timeAccum });
      }
    }

    return waypoints;
  };

  // Generate ship fleet with 4 size classes
  const ships: ShipConfig[] = useMemo(() => {
    const fleet: ShipConfig[] = [];
    const seed = 54321;
    const random = (i: number) => {
      const x = Math.sin(seed + i * 7777) * 10000;
      return x - Math.floor(x);
    };

    let capitalShipIndex = 0;

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
        variantSeed: 1000 + i,
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
        variantSeed: 2000 + i,
      });
    }

    // Large Freighters (3x)
    for (let i = 0; i < SHIP_SCALE.FREIGHTER_COUNT; i++) {
      fleet.push({
        type: 'freighter',
        size: [
          (4.0 + random(i + 200) * 1.5) * 1.5,
          (4.0 + random(i + 210) * 0.5) * 1.5,
          (2.0 + random(i + 220) * 0.8) * 1.5,
        ],
        speed: 0.06 + random(i + 230) * 0.04,
        color: ['#0a0a1a', '#1a0a1a', '#0a1a1a'][i % 3],
        lightIntensity: 1.5,
        lightColor: '#ffddaa',
        engineColor: '#f30ff7',
        yBase: 20 + random(i + 240) * 15,
        zLane: -25 - random(i + 250) * 10,
        direction: i % 2 === 0 ? 1 : -1,
        offset: i * 25,
        variantSeed: 3000 + i,
      });
    }

    // Capital Ships - 3 ultra-massive dreadnoughts with different colors
    // Capital Ship 1: Deep Navy Blue with Orange Engines - 10x MEGA SHIP
    const capitalShip1Index = fleet.length;
    fleet.push({
      type: 'dreadnought',
      size: [
        (5.0 + random(300) * 1.5) * 10,
        (5.2 + random(301) * 0.5) * 10,
        (2.5 + random(302) * 1.0) * 10,
      ],
      speed: 0.04 + random(303) * 0.015,
      color: '#f30ff7', // Bright Pink
      lightIntensity: 1.5,
      lightColor: '#ffddaa',
      engineColor: '#ff6600', // Orange engines
      yBase: 32 + random(304) * 8,
      zLane: 10 - random(305) * 15,
      direction: 1,
      offset: 0,
      variantSeed: 9001,
    });
    waypointsRef.current.set(capitalShip1Index, generateBoundaryWaypoints(capitalShip1Index, capitalShipIndex++));

    // Capital Ship 2: Dark Purple with Cyan Engines
    const capitalShip2Index = fleet.length;
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
      variantSeed: 9002,
    });
    waypointsRef.current.set(capitalShip2Index, generateBoundaryWaypoints(capitalShip2Index, capitalShipIndex++));

    // Capital Ship 3: Dark Gray with Green Engines
    const capitalShip3Index = fleet.length;
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
      variantSeed: 9003,
    });
    waypointsRef.current.set(capitalShip3Index, generateBoundaryWaypoints(capitalShip3Index, capitalShipIndex++));

    return fleet;
  }, []);

  // Animate ship movement and rotation
  useFrame((state) => {
    if (!shipsRef.current) return;
    const time = state.clock.elapsedTime;

    shipsRef.current.children.forEach((shipGroup, i) => {
      const config = ships[i];

      if (config.type === 'dreadnought') {
        // Capital ships use waypoint-based navigation visiting boundaries
        const waypoints = waypointsRef.current.get(i);
        if (!waypoints || waypoints.length === 0) return;

        let currentWaypointIdx = currentWaypointRef.current.get(i) ?? 0;
        const cycleTime = waypoints[waypoints.length - 1].arrivalTime;
        const adjustedTime = time % cycleTime;

        // Find current and next waypoints
        let currentWaypoint = waypoints[0];
        let nextWaypoint = waypoints[1] || waypoints[0];
        let currentIdx = 0;

        for (let j = 0; j < waypoints.length - 1; j++) {
          if (adjustedTime >= waypoints[j].arrivalTime && adjustedTime < waypoints[j + 1].arrivalTime) {
            currentWaypoint = waypoints[j];
            nextWaypoint = waypoints[j + 1];
            currentIdx = j;
            break;
          }
        }

        currentWaypointRef.current.set(i, currentIdx);

        // Linear interpolation between waypoints
        const segmentDuration = nextWaypoint.arrivalTime - currentWaypoint.arrivalTime;
        const segmentTime = adjustedTime - currentWaypoint.arrivalTime;
        const t = Math.max(0, Math.min(1, segmentTime / segmentDuration));

        shipGroup.position.x = currentWaypoint.x + (nextWaypoint.x - currentWaypoint.x) * t;
        shipGroup.position.z = currentWaypoint.z + (nextWaypoint.z - currentWaypoint.z) * t;
        shipGroup.position.y = config.yBase + Math.sin(time * 1.5 + i) * 0.4;

        // Rotate toward next waypoint
        const dx = nextWaypoint.x - currentWaypoint.x;
        const dz = nextWaypoint.z - currentWaypoint.z;
        const angle = Math.atan2(dx, dz);
        shipGroup.rotation.y = angle;

        // Slight banking on turns
        shipGroup.rotation.z = Math.sin(time * 2 + i) * 0.05;
      } else {
        // Standard ships use wrapping movement
        const xRange =
          config.type === 'freighter' ? 50 : config.type === 'transport' ? 45 : 40;

        const rawX =
          (time * config.speed * config.direction * 12 + config.offset) %
          (xRange * 2);
        shipGroup.position.x = rawX - xRange;
        shipGroup.position.z = config.zLane;
        shipGroup.position.y = config.yBase + Math.sin(time * 1.5 + i) * 0.4;
        shipGroup.rotation.y = config.direction > 0 ? 0 : Math.PI;

        // Slight banking on turns
        shipGroup.rotation.z = Math.sin(time * 2 + i) * 0.05 * config.direction;
      }
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
