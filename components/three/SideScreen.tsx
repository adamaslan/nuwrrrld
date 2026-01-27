'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { SidePanelConfig } from '@/config/mediaConfig';

/**
 * ============================================================================
 * SIDE SCREEN POSITIONING CONSTANTS
 * Z-axis layering for side panel rendering
 * ============================================================================
 */
const SIDE_SCREEN_ZPOSITION = {
  /** Frame border layer (behind content) */
  FRAME_BORDER: -0.01,
  /** Background panel layer */
  BACKGROUND: 0,
  /** Text content layer */
  TEXT_CONTENT: 0.02,
  /** Glow effect layer (behind all) */
  GLOW_EFFECT: -0.05,
  /** Top edge accent */
  TOP_EDGE: 0.01,
  /** Bottom edge accent */
  BOTTOM_EDGE: 0.01,
} as const;

/**
 * ============================================================================
 * SIDE PANEL DIMENSIONS
 * Sizing and spacing properties
 * ============================================================================
 */
const SIDE_PANEL_DIMENSIONS = {
  /** Frame border offset from panel edge */
  FRAME_BORDER_OFFSET: 0.08,
  /** Glow effect size multiplier */
  GLOW_SIZE_RATIO: 1.15,
  /** Edge accent top position ratio */
  EDGE_TOP_POSITION_RATIO: 0.5,
  /** Edge accent bottom position ratio */
  EDGE_BOTTOM_POSITION_RATIO: 0.5,
  /** Edge accent height */
  EDGE_HEIGHT: 0.03,
  /** Edge accent width ratio */
  EDGE_WIDTH_RATIO: 0.9,
  /** Side panel horizontal offset from screen */
  HORIZONTAL_OFFSET: 0.05,
} as const;

/**
 * ============================================================================
 * SIDE PANEL TEXT PROPERTIES
 * Text rendering and alignment
 * ============================================================================
 */
const SIDE_PANEL_TEXT = {
  /** Text outline width */
  OUTLINE_WIDTH: 0.002,
  /** Text outline color */
  OUTLINE_COLOR: '#000000',
  /** Text max width ratio */
  MAX_WIDTH_RATIO: 0.9,
  /** Text line height */
  LINE_HEIGHT: 1.3,
  /** Top alignment position ratio */
  TOP_ALIGN_RATIO: 0.35,
  /** Bottom alignment position ratio */
  BOTTOM_ALIGN_RATIO: 0.35,
  /** Text Z position offset */
  Z_OFFSET: 0.02,
} as const;

/**
 * ============================================================================
 * SIDE PANEL MATERIAL PROPERTIES
 * Colors, metalness, and roughness values
 * ============================================================================
 */
const SIDE_PANEL_MATERIALS = {
  /** Frame color when idle */
  FRAME_COLOR_IDLE: '#2a2a3e',
  /** Frame color when hovered */
  FRAME_COLOR_HOVER: '#3a3a4e',
  /** Frame metalness */
  METALNESS: 0.9,
  /** Frame roughness */
  ROUGHNESS: 0.3,
  /** Frame emissive color idle */
  EMISSIVE_IDLE: '#0a0a12',
  /** Frame emissive color hover */
  EMISSIVE_HOVER: '#1a1a2e',
  /** Frame emissive intensity idle */
  EMISSIVE_INTENSITY_IDLE: 0.1,
  /** Frame emissive intensity hover */
  EMISSIVE_INTENSITY_HOVER: 0.3,
  /** Background metalness */
  BG_METALNESS: 0.8,
  /** Background roughness */
  BG_ROUGHNESS: 0.3,
  /** Background emissive color */
  BG_EMISSIVE: '#0a0a12',
  /** Background emissive intensity */
  BG_EMISSIVE_INTENSITY: 0.1,
} as const;

/**
 * ============================================================================
 * SIDE PANEL GLOW EFFECT CONSTANTS
 * Pulsing and intensity properties for glow
 * ============================================================================
 */
const SIDE_PANEL_GLOW = {
  /** Glow pulse speed */
  PULSE_SPEED: 2,
  /** Glow base intensity multiplier */
  BASE_INTENSITY_MULTIPLIER: 0.5,
  /** Glow hover intensity multiplier */
  HOVER_INTENSITY_MULTIPLIER: 1.5,
  /** Glow tap intensity multiplier */
  TAP_INTENSITY_MULTIPLIER: 2,
  /** Glow opacity multiplier for pulse */
  OPACITY_PULSE_MULTIPLIER: 0.5,
  /** Glow side effect opacity idle */
  SIDE_OPACITY_IDLE: 0.3,
  /** Glow side effect opacity hover */
  SIDE_OPACITY_HOVER: 0.6,
} as const;

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
      ? panelHeight * SIDE_PANEL_TEXT.TOP_ALIGN_RATIO
      : align === 'bottom'
        ? -panelHeight * SIDE_PANEL_TEXT.BOTTOM_ALIGN_RATIO
        : 0;

  return (
    <Text
      position={[0, yPosition, SIDE_PANEL_TEXT.Z_OFFSET]}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY={align === 'center' ? 'middle' : align === 'top' ? 'top' : 'bottom'}
      maxWidth={panelWidth * SIDE_PANEL_TEXT.MAX_WIDTH_RATIO}
      lineHeight={SIDE_PANEL_TEXT.LINE_HEIGHT}
      textAlign="center"
      outlineWidth={SIDE_PANEL_TEXT.OUTLINE_WIDTH}
      outlineColor={SIDE_PANEL_TEXT.OUTLINE_COLOR}
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

  // Calculate position based on left/right positioning
  const xOffset =
    config.position === 'right'
      ? (screenWidth + panelWidth) / 2 + SIDE_PANEL_DIMENSIONS.HORIZONTAL_OFFSET
      : -(screenWidth + panelWidth) / 2 - SIDE_PANEL_DIMENSIONS.HORIZONTAL_OFFSET;

  // Frame material - responsive to hover state
  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isHovered ? SIDE_PANEL_MATERIALS.FRAME_COLOR_HOVER : SIDE_PANEL_MATERIALS.FRAME_COLOR_IDLE,
        metalness: SIDE_PANEL_MATERIALS.METALNESS,
        roughness: SIDE_PANEL_MATERIALS.ROUGHNESS,
        emissive: isHovered ? SIDE_PANEL_MATERIALS.EMISSIVE_HOVER : SIDE_PANEL_MATERIALS.EMISSIVE_IDLE,
        emissiveIntensity: isHovered ? SIDE_PANEL_MATERIALS.EMISSIVE_INTENSITY_HOVER : SIDE_PANEL_MATERIALS.EMISSIVE_INTENSITY_IDLE,
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
        metalness: SIDE_PANEL_MATERIALS.BG_METALNESS,
        roughness: SIDE_PANEL_MATERIALS.BG_ROUGHNESS,
        emissive: SIDE_PANEL_MATERIALS.BG_EMISSIVE,
        emissiveIntensity: SIDE_PANEL_MATERIALS.BG_EMISSIVE_INTENSITY,
      }),
    [config.backgroundColor, config.backgroundOpacity]
  );

  // Animate glow effect
  useFrame((state) => {
    if (glowRef.current && config.glowEnabled) {
      const time = state.clock.elapsedTime;
      const pulse = Math.sin(time * SIDE_PANEL_GLOW.PULSE_SPEED) * SIDE_PANEL_GLOW.BASE_INTENSITY_MULTIPLIER + SIDE_PANEL_GLOW.BASE_INTENSITY_MULTIPLIER;

      // Enhance glow when hovered or tapped
      const hoverMultiplier = isHovered ? SIDE_PANEL_GLOW.HOVER_INTENSITY_MULTIPLIER : 1;
      const tapMultiplier = isTapped ? SIDE_PANEL_GLOW.TAP_INTENSITY_MULTIPLIER : 1;
      const glowIntensity = (config.glowIntensity || SIDE_PANEL_GLOW.BASE_INTENSITY_MULTIPLIER) * hoverMultiplier * tapMultiplier;

      if (glowRef.current.material instanceof THREE.MeshBasicMaterial) {
        glowRef.current.material.opacity = glowIntensity * pulse * SIDE_PANEL_GLOW.OPACITY_PULSE_MULTIPLIER;
      }
    }
  });

  return (
    <group position={[xOffset, 0, 0]}>
      {/* Frame border - metal accent (rendered behind background) */}
      <mesh position={[0, 0, SIDE_SCREEN_ZPOSITION.FRAME_BORDER]} material={frameMaterial}>
        <planeGeometry
          args={[
            panelWidth + SIDE_PANEL_DIMENSIONS.FRAME_BORDER_OFFSET,
            panelHeight + SIDE_PANEL_DIMENSIONS.FRAME_BORDER_OFFSET,
          ]}
        />
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
        <mesh position={[0, 0, SIDE_SCREEN_ZPOSITION.BACKGROUND]} material={backgroundMaterial}>
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
        <mesh ref={glowRef} position={[0, 0, SIDE_SCREEN_ZPOSITION.GLOW_EFFECT]}>
          <planeGeometry
            args={[
              panelWidth * SIDE_PANEL_DIMENSIONS.GLOW_SIZE_RATIO,
              panelHeight * SIDE_PANEL_DIMENSIONS.GLOW_SIZE_RATIO,
            ]}
          />
          <meshBasicMaterial
            color={config.glowColor || config.textColor}
            transparent
            opacity={
              (config.glowIntensity || SIDE_PANEL_GLOW.BASE_INTENSITY_MULTIPLIER) *
              (isHovered ? SIDE_PANEL_GLOW.HOVER_INTENSITY_MULTIPLIER : 1)
            }
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Edge accent - top */}
      <mesh
        position={[
          0,
          panelHeight * SIDE_PANEL_DIMENSIONS.EDGE_TOP_POSITION_RATIO,
          SIDE_SCREEN_ZPOSITION.TOP_EDGE,
        ]}
      >
        <planeGeometry
          args={[panelWidth * SIDE_PANEL_DIMENSIONS.EDGE_WIDTH_RATIO, SIDE_PANEL_DIMENSIONS.EDGE_HEIGHT]}
        />
        <meshBasicMaterial
          color={config.glowColor || config.textColor}
          transparent
          opacity={isHovered ? SIDE_PANEL_GLOW.SIDE_OPACITY_HOVER : SIDE_PANEL_GLOW.SIDE_OPACITY_IDLE}
        />
      </mesh>

      {/* Edge accent - bottom */}
      <mesh
        position={[
          0,
          -panelHeight * SIDE_PANEL_DIMENSIONS.EDGE_BOTTOM_POSITION_RATIO,
          SIDE_SCREEN_ZPOSITION.BOTTOM_EDGE,
        ]}
      >
        <planeGeometry
          args={[panelWidth * SIDE_PANEL_DIMENSIONS.EDGE_WIDTH_RATIO, SIDE_PANEL_DIMENSIONS.EDGE_HEIGHT]}
        />
        <meshBasicMaterial
          color={config.glowColor || config.textColor}
          transparent
          opacity={isHovered ? SIDE_PANEL_GLOW.SIDE_OPACITY_HOVER : SIDE_PANEL_GLOW.SIDE_OPACITY_IDLE}
        />
      </mesh>
    </group>
  );
}
