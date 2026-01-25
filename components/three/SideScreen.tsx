'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { SidePanelConfig } from '@/config/mediaConfig';

interface SideScreenProps {
  /** Side panel configuration */
  config: SidePanelConfig;
  /** Main screen width (from parent TVScreen) */
  screenWidth: number;
  /** Main screen height (from parent TVScreen) */
  screenHeight: number;
  /** Interactive state from parent TVScreen */
  isHovered: boolean;
  /** Tap state from parent TVScreen */
  isTapped: boolean;
}

interface SideScreenTextProps {
  text: string;
  color: string;
  fontSize: number;
  align: 'top' | 'center' | 'bottom';
  panelWidth: number;
  panelHeight: number;
  fontFamily?: string;
}

/**
 * SideScreenText - Renders customizable text using @react-three/drei Text
 */
function SideScreenText({
  text,
  color,
  fontSize,
  align,
  panelWidth,
  panelHeight,
  fontFamily,
}: SideScreenTextProps) {
  // Calculate Y position based on alignment
  const yPosition =
    align === 'top'
      ? panelHeight * 0.35
      : align === 'bottom'
        ? -panelHeight * 0.35
        : 0;

  return (
    <Text
      position={[0, yPosition, 0.02]}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY={align === 'center' ? 'middle' : align === 'top' ? 'top' : 'bottom'}
      maxWidth={panelWidth * 0.9}
      lineHeight={1.3}
      textAlign="center"
      outlineWidth={0.002}
      outlineColor="#000000"
    >
      {text}
    </Text>
  );
}

/**
 * BackgroundImage - Loads and displays optional background image
 */
function BackgroundImage({
  path,
  width,
  height,
  opacity,
}: {
  path: string;
  width: number;
  height: number;
  opacity: number;
}) {
  const texture = useTexture(path);

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} />
    </mesh>
  );
}

/**
 * SideScreen - Customizable text panel attached to TVScreen
 *
 * Features:
 * - Customizable text with color, size, alignment
 * - Background color or image
 * - Optional glow effect
 * - Responsive to parent hover/tap state
 */
export default function SideScreen({
  config,
  screenWidth,
  screenHeight,
  isHovered,
  isTapped,
}: SideScreenProps) {
  const glowRef = useRef<THREE.Mesh>(null);

  // Calculate panel dimensions
  const panelWidth = screenWidth * config.widthRatio;
  const panelHeight = screenHeight;

  // Calculate position based on left/right
  const xOffset =
    config.position === 'right'
      ? (screenWidth + panelWidth) / 2 + 0.05
      : -(screenWidth + panelWidth) / 2 - 0.05;

  // Frame material - responsive to hover state
  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isHovered ? '#3a3a4e' : '#2a2a3e',
        metalness: 0.9,
        roughness: 0.3,
        emissive: isHovered ? '#1a1a2e' : '#0a0a12',
        emissiveIntensity: isHovered ? 0.3 : 0.1,
      }),
    [isHovered]
  );

  // Background material
  const backgroundMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: config.backgroundColor,
        transparent: true,
        opacity: config.backgroundOpacity,
        metalness: 0.8,
        roughness: 0.3,
        emissive: '#0a0a12',
        emissiveIntensity: 0.1,
      }),
    [config.backgroundColor, config.backgroundOpacity]
  );

  // Animate glow effect
  useFrame((state) => {
    if (glowRef.current && config.glowEnabled) {
      const time = state.clock.elapsedTime;
      const pulse = Math.sin(time * 2) * 0.5 + 0.5;

      // Enhance glow when hovered
      const glowIntensity =
        (config.glowIntensity || 0.3) * (isHovered ? 1.5 : 1) * (isTapped ? 2 : 1);

      if (glowRef.current.material instanceof THREE.MeshBasicMaterial) {
        glowRef.current.material.opacity = glowIntensity * pulse * 0.5;
      }
    }
  });

  return (
    <group position={[xOffset, 0, 0]}>
      {/* Frame border - metal accent (rendered behind background) */}
      <mesh position={[0, 0, -0.01]} material={frameMaterial}>
        <planeGeometry args={[panelWidth + 0.08, panelHeight + 0.08]} />
      </mesh>

      {/* Background panel */}
      {config.backgroundImagePath ? (
        <BackgroundImage
          path={config.backgroundImagePath}
          width={panelWidth}
          height={panelHeight}
          opacity={config.backgroundOpacity}
        />
      ) : (
        <mesh position={[0, 0, 0]} material={backgroundMaterial}>
          <planeGeometry args={[panelWidth, panelHeight]} />
        </mesh>
      )}

      {/* Text content */}
      {config.text && (
        <SideScreenText
          text={config.text}
          color={config.textColor}
          fontSize={config.textSize}
          align={config.textAlign}
          panelWidth={panelWidth}
          panelHeight={panelHeight}
          fontFamily={config.fontFamily}
        />
      )}

      {/* Glow effect behind panel */}
      {config.glowEnabled && (
        <mesh ref={glowRef} position={[0, 0, -0.05]}>
          <planeGeometry args={[panelWidth * 1.15, panelHeight * 1.15]} />
          <meshBasicMaterial
            color={config.glowColor || config.textColor}
            transparent
            opacity={(config.glowIntensity || 0.3) * (isHovered ? 1.5 : 1)}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Edge accent - top */}
      <mesh position={[0, panelHeight / 2 + 0.02, 0.01]}>
        <planeGeometry args={[panelWidth * 0.9, 0.03]} />
        <meshBasicMaterial
          color={config.glowColor || config.textColor}
          transparent
          opacity={isHovered ? 0.6 : 0.3}
        />
      </mesh>

      {/* Edge accent - bottom */}
      <mesh position={[0, -panelHeight / 2 - 0.02, 0.01]}>
        <planeGeometry args={[panelWidth * 0.9, 0.03]} />
        <meshBasicMaterial
          color={config.glowColor || config.textColor}
          transparent
          opacity={isHovered ? 0.6 : 0.3}
        />
      </mesh>
    </group>
  );
}
