'use client';

import { SCENE_DIMENSIONS } from '@/config/constants';

// Layers - depth-stratified scene organization
import ForegroundLayer from './environment/layers/ForegroundLayer';
import MidgroundLayer from './environment/layers/MidgroundLayer';
import BackgroundLayer from './environment/layers/BackgroundLayer';
import OppositeLayer from './environment/layers/OppositeLayer';

// City Infrastructure
import CityBuildings from './environment/buildings/CityBuildings';
import NeonSigns from './environment/decorations/NeonSigns';
import NeonGridLines from './environment/atmosphere/NeonGridLines';

// Atmospheric Effects
import Rain from './environment/atmosphere/Rain';
import FogLayers from './environment/atmosphere/FogLayers';

// Decorative Elements
import HolographicElements from './environment/decorations/HolographicElements';
import AnimatedBillboards from './environment/decorations/AnimatedBillboards';
import Puddles from './environment/decorations/Puddles';
import CyberpunkBridge, { DEFAULT_BRIDGE_CONFIG } from './environment/decorations/CyberpunkBridge';
import BridgeRobots, { DEFAULT_ROBOT_CONFIG } from './environment/decorations/BridgeRobots';

// Dynamic Elements
import FlyingShips from './environment/ships/FlyingShips';

/**
 * Main environment component orchestrating all 3D scene elements.
 *
 * Organizes scene into depth layers for optimal rendering:
 * - Foreground: -5 to 0
 * - Midground: -20 to -10
 * - Main scene: -20 to -6
 * - Background: -100 to -60
 * - Opposite (behind camera): +25 to +65
 *
 * Total elements: ~50+ sub-components
 */
export default function Environment() {
  return (
    <>
      {/* Ground plane - reflective cyberpunk street */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
        receiveShadow
      >
        <planeGeometry
          args={[
            SCENE_DIMENSIONS.GROUND_PLANE_WIDTH,
            SCENE_DIMENSIONS.GROUND_PLANE_HEIGHT,
          ]}
        />
        <meshStandardMaterial
          color="#080810"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Depth-stratified layers */}
      <ForegroundLayer />
      <MidgroundLayer />
      <BackgroundLayer />

      {/* City infrastructure */}
      <CityBuildings />
      <NeonSigns />
      <NeonGridLines />

      {/* Atmospheric effects */}
      <Rain />
      <FogLayers />

      {/* Decorative elements */}
      <HolographicElements />
      <AnimatedBillboards />
      <Puddles />

      {/* Bridge with walking robots */}
      <group
        position={DEFAULT_BRIDGE_CONFIG.position}
        rotation={[0, DEFAULT_BRIDGE_CONFIG.rotationY, 0]}
      >
        <CyberpunkBridge config={DEFAULT_BRIDGE_CONFIG} />
        <BridgeRobots
          bridgeLength={DEFAULT_BRIDGE_CONFIG.length}
          config={DEFAULT_ROBOT_CONFIG}
          deckY={0.8}
        />
      </group>

      {/* Dynamic elements */}
      <FlyingShips />

      {/* Reverse-facing backdrop */}
      <OppositeLayer />
    </>
  );
}
