'use client';

import { useRef, useMemo, Suspense, useState, useCallback, useEffect } from 'react';
import { useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import { useVideoTexture, useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ScreenConfig } from '@/config/mediaConfig';
import { RESPONSIVE_SCALE, OPACITY, CYBERPUNK_COLORS } from '@/config/constants';
import SideScreen from './SideScreen';
import { usePools } from './pools';

/**
 * ============================================================================
 * POSITIONING CONSTANTS
 * Z-axis layering for proper rendering order (front to back)
 * ============================================================================
 */
const ZPOSITION = {
  /** Screen content layer */
  SCREEN_CONTENT: 0.09,
  /** Tap pulse ring */
  TAP_PULSE: 0.085,
  /** Hover highlight overlay */
  HIGHLIGHT_OVERLAY: 0.082,
  /** Scanline effect */
  SCANLINE_EFFECT: 0.09,
  /** Screen bezel/border glow */
  BEZEL_GLOW: 0.075,
  /** Metallic frame surface */
  FRAME: 0.08,
  /** Edge glow behind frame */
  EDGE_GLOW: -0.05,
  /** Corner accent lights */
  CORNER_LIGHTS: 0.1,
  /** Frame accent lights */
  FRAME_ACCENT_LIGHTS: 0.1,
  /** Back panel base layer */
  BACK_PANEL_BASE: -0.3,
  /** Back panel component layer */
  BACK_PANEL_COMPONENT: 0.08,
  /** Back panel inner details */
  BACK_PANEL_INNER: 0.04,
} as const;

/**
 * ============================================================================
 * SCREEN FRAME GEOMETRY CONSTANTS
 * Bezel dimensions and shape properties
 * ============================================================================
 */
const FRAME_GEOMETRY = {
  /** Bevel corner radius for smooth edges */
  CORNER_BEVEL_RADIUS: 0.1,
  /** Screen hole width ratio (0-1) */
  HOLE_WIDTH_RATIO: 0.9,
  /** Screen hole height ratio (0-1) */
  HOLE_HEIGHT_RATIO: 0.85,
  /** Extrude depth for 3D frame */
  EXTRUDE_DEPTH: 0.15,
  /** Bevel thickness on edges */
  BEVEL_THICKNESS: 0.02,
  /** Bevel size for chamfered edges */
  BEVEL_SIZE: 0.02,
  /** Number of bevel segments for smoothness */
  BEVEL_SEGMENTS: 2,
} as const;

/**
 * ============================================================================
 * SCREEN FRAME DIMENSIONS
 * Ratios for calculating frame size relative to screen
 * ============================================================================
 */
const FRAME_DIMENSIONS = {
  /** Frame width as ratio of screen width */
  WIDTH_RATIO: 0.58,
  /** Frame height as ratio of screen height */
  HEIGHT_RATIO: 0.58,
  /** Frame depth offset from screen */
  DEPTH_OFFSET: -0.1,
} as const;

/**
 * ============================================================================
 * INTERACTIVE STATE ANIMATION TIMING
 * Duration and speed values for animations (ms)
 * ============================================================================
 */
const INTERACTION_TIMING = {
  /** Duration for tap scale reset back to normal */
  TAP_SCALE_RESET: 150,
  /** Duration for tap state reset to initial state */
  TAP_STATE_RESET: 400,
  /** Scale factor when screen is tapped */
  TAP_SCALE_FACTOR: 1.08,
  /** Scale factor when screen is hovered */
  HOVER_SCALE_FACTOR: 1.02,
  /** Lerp speed for smooth scale animation (0-1) */
  SCALE_LERP_SPEED: 0.15,
} as const;

/**
 * ============================================================================
 * GLOW AND LIGHT ANIMATION CONSTANTS
 * Pulse and intensity values for glowing effects
 * ============================================================================
 */
const GLOW_ANIMATION = {
  /** Base glow intensity when not interacting */
  BASE_INTENSITY_IDLE: 0.3,
  /** Base glow intensity when hovered */
  BASE_INTENSITY_HOVER: 0.5,
  /** Base glow intensity when tapped */
  BASE_INTENSITY_TAP: 1.0,
  /** Pulse amount when idle */
  PULSE_AMOUNT_IDLE: 0.1,
  /** Pulse amount when hovered */
  PULSE_AMOUNT_HOVER: 0.15,
  /** Pulse amount when tapped */
  PULSE_AMOUNT_TAP: 0.3,
  /** Speed multiplier for glow pulse animation */
  PULSE_SPEED: 2,
} as const;

/**
 * ============================================================================
 * SCANLINE EFFECT CONSTANTS
 * Animation speed and appearance for CRT scanline overlay
 * ============================================================================
 */
const SCANLINE = {
  /** Speed multiplier for scanline movement */
  MOVEMENT_SPEED: 0.5,
  /** Height of scanline in world units */
  HEIGHT: 0.02,
  /** Opacity when screen idle */
  OPACITY_IDLE: 0.03,
  /** Opacity when screen hovered */
  OPACITY_HOVER: 0.06,
} as const;

/**
 * ============================================================================
 * TAP PULSE RING ANIMATION
 * Ring geometry and animation properties for tap feedback
 * ============================================================================
 */
const TAP_PULSE_RING = {
  /** Inner radius ratio relative to screen width */
  INNER_RADIUS_RATIO: 0.3,
  /** Outer radius ratio relative to screen width */
  OUTER_RADIUS_RATIO: 0.35,
  /** Number of segments for circle smoothness */
  SEGMENTS: 32,
  /** Maximum scale during pulse animation */
  MAX_SCALE: 1.5,
  /** Fade out speed for opacity */
  FADE_SPEED: 1.2,
  /** Pulse cycle duration */
  PULSE_DURATION: 0.4,
} as const;

/**
 * ============================================================================
 * SCREEN HIGHLIGHT OVERLAY
 * Colors and opacity for interactive highlights
 * ============================================================================
 */
const HIGHLIGHT_OVERLAY = {
  /** Opacity when hovered */
  OPACITY_HOVER: 0.08,
  /** Opacity when tapped */
  OPACITY_TAP: 0.15,
} as const;

/**
 * ============================================================================
 * BEZEL GLOW EFFECT
 * Border glow appearance and sizing
 * ============================================================================
 */
const BEZEL_GLOW = {
  /** Glow border width offset */
  BORDER_OFFSET: 0.1,
  /** Opacity when idle */
  OPACITY_IDLE: 0.05,
  /** Opacity when hovered */
  OPACITY_HOVER: 0.1,
} as const;

/**
 * ============================================================================
 * BRACKET AND MOUNTING CONSTANTS
 * Physical mounting bracket dimensions
 * ============================================================================
 */
const MOUNTING_BRACKETS = {
  /** Top bracket width */
  TOP_WIDTH: 0.3,
  /** Top bracket height */
  TOP_HEIGHT: 0.15,
  /** Top bracket depth */
  TOP_DEPTH: 0.4,
  /** Support rod/cable radius */
  CABLE_RADIUS: 0.02,
  /** Support cable height offset */
  CABLE_HEIGHT_OFFSET: 0.6,
  /** Cable segments for smoothness */
  CABLE_SEGMENTS: 8,
  /** Side plate width */
  SIDE_PLATE_WIDTH: 0.08,
  /** Side plate depth */
  SIDE_PLATE_DEPTH: 0.2,
  /** Side plate height ratio to screen */
  SIDE_PLATE_HEIGHT_RATIO: 0.6,
  /** Horizontal offset for top brackets */
  TOP_BRACKET_HORIZONTAL_OFFSET: 0.4,
  /** Vertical offset for top brackets */
  TOP_BRACKET_VERTICAL_OFFSET: 0.1,
  /** Horizontal offset for side plates */
  SIDE_PLATE_HORIZONTAL_OFFSET: 0.52,
} as const;

/**
 * ============================================================================
 * CORNER ACCENT LIGHTS
 * Properties for corner light decoration
 * ============================================================================
 */
const CORNER_LIGHTS = {
  /** Radius of each corner light circle */
  RADIUS: 0.06,
  /** Number of segments for circle geometry */
  SEGMENTS: 16,
  /** Offset distance from corner */
  OFFSET_DISTANCE: 0.05,
  /** Opacity for corner lights */
  OPACITY: 0.8,
  /** Number of animation phases (corners) */
  ANIMATION_PHASES: 4,
  /** Speed of blinking animation */
  BLINK_SPEED: 4,
  /** Opacity variation amplitude */
  OPACITY_AMPLITUDE: 0.4,
  /** Base opacity level */
  BASE_OPACITY: 0.6,
} as const;

/**
 * ============================================================================
 * FRAME ACCENT LIGHT CONSTANTS
 * Small indicator lights on frame edges
 * ============================================================================
 */
const FRAME_ACCENT_LIGHTS = {
  /** Radius of accent light circles */
  RADIUS: 0.04,
  /** Number of segments */
  SEGMENTS: 8,
  /** Horizontal position ratio */
  HORIZONTAL_OFFSET_RATIO: 0.48,
  /** Vertical position ratio */
  VERTICAL_OFFSET_RATIO: 0.48,
  /** Animation speed idle */
  ANIMATION_SPEED_IDLE: 2,
  /** Animation speed hover */
  ANIMATION_SPEED_HOVER: 4,
  /** Base opacity */
  OPACITY: 0.8,
  /** Animation offset for second light */
  SECOND_LIGHT_PHASE_OFFSET: Math.PI,
} as const;

/**
 * ============================================================================
 * BRACKET MATERIAL COLORS
 * Standard colors for mounting brackets
 * ============================================================================
 */
const BRACKET_MATERIALS = {
  /** Metallic bracket base color */
  BRACKET_COLOR: '#2d2d3a',
  /** Metallic property (0-1) */
  METALNESS: 0.95,
  /** Roughness property (0-1) */
  ROUGHNESS: 0.4,
  /** Frame color when idle */
  FRAME_COLOR_IDLE: '#1a1a2e',
  /** Frame color when hovered */
  FRAME_COLOR_HOVER: '#2a2a3e',
  /** Metalness for frame */
  FRAME_METALNESS: 0.9,
  /** Roughness for frame */
  FRAME_ROUGHNESS: 0.3,
  /** Env map intensity idle */
  ENV_MAP_INTENSITY_IDLE: 0.5,
  /** Env map intensity hover */
  ENV_MAP_INTENSITY_HOVER: 0.8,
} as const;

/**
 * ============================================================================
 * BACK PANEL DIMENSIONS
 * Industrial back panel component sizing
 * ============================================================================
 */
const BACK_PANEL_DIMENSIONS = {
  /** Back panel depth offset (negative = behind screen) */
  DEPTH: -0.3,
  /** Panel thickness */
  THICKNESS: 0.15,
  /** Panel width ratio to screen */
  WIDTH_RATIO: 1.05,
  /** Panel height ratio to screen */
  HEIGHT_RATIO: 1.05,
} as const;

/**
 * ============================================================================
 * VENTILATION GRILLE CONSTANTS
 * Cooling grille appearance and structure
 * ============================================================================
 */
const VENTILATION_GRILLE = {
  /** Width of grille area */
  WIDTH_RATIO: 0.2,
  /** Height of grille area */
  HEIGHT_RATIO: 0.15,
  /** Grille border thickness */
  BORDER_THICKNESS: 0.03,
  /** Grille depth from panel */
  DEPTH: 0.08,
  /** Grille bar height */
  BAR_HEIGHT: 0.025,
  /** Grille bar thickness */
  BAR_THICKNESS: 0.02,
  /** Number of bars (reduced for optimization) */
  BAR_COUNT: 4,
  /** Inner grille visualization opacity */
  INNER_OPACITY: 0.05,
  /** Grille view area ratio */
  VIEW_AREA_RATIO: 0.8,
  /** Horizontal offset for left grille */
  LEFT_OFFSET: -0.3,
  /** Horizontal offset for right grille */
  RIGHT_OFFSET: 0.3,
  /** Vertical offset for grille */
  VERTICAL_OFFSET: 0.35,
} as const;

/**
 * ============================================================================
 * POWER SUPPLY UNIT CONSTANTS
 * PSU dimensions and LED indicator properties
 * ============================================================================
 */
const POWER_SUPPLY = {
  /** PSU width ratio to screen */
  WIDTH_RATIO: 0.35,
  /** PSU height ratio to screen */
  HEIGHT_RATIO: 0.12,
  /** PSU depth */
  DEPTH: 0.1,
  /** Label area width ratio */
  LABEL_AREA_WIDTH_RATIO: 0.8,
  /** Label area height ratio */
  LABEL_AREA_HEIGHT_RATIO: 0.3,
  /** Vertical position on panel */
  VERTICAL_POSITION: 0.15,
  /** LED indicator depth */
  LED_DEPTH: 0.06,
  /** LED indicator radius */
  LED_RADIUS: 0.03,
  /** LED indicator segments */
  LED_SEGMENTS: 8,
  /** Number of LED indicators */
  LED_COUNT: 5,
  /** Spacing between LEDs */
  LED_SPACING_RATIO: 0.15,
  /** LED vertical offset from PSU center */
  LED_VERTICAL_OFFSET: -0.2,
  /** First 3 LEDs are green */
  GREEN_LED_COUNT: 3,
  /** Opacity for LEDs */
  LED_OPACITY: 0.9,
  /** Blink animation duration */
  BLINK_DURATION: 3,
  /** Blink animation threshold */
  BLINK_THRESHOLD: 2,
  /** Blink duration ms */
  BLINK_CYCLE: 0.5,
  /** Power connector horizontal offset */
  CONNECTOR_HORIZONTAL_OFFSET: 0.35,
  /** Power connector width */
  CONNECTOR_WIDTH: 0.08,
  /** Power connector height */
  CONNECTOR_HEIGHT: 0.06,
  /** Power connector depth */
  CONNECTOR_DEPTH: 0.04,
} as const;

/**
 * ============================================================================
 * CABLE CONDUIT CONSTANTS
 * Wiring and cable management appearance
 * ============================================================================
 */
const CABLE_CONDUIT = {
  /** Main conduit width ratio to screen */
  WIDTH_RATIO: 0.7,
  /** Main conduit height */
  HEIGHT: 0.08,
  /** Main conduit depth */
  DEPTH: 0.05,
  /** Vertical cable width */
  VERTICAL_CABLE_WIDTH: 0.05,
  /** Vertical cable depth */
  VERTICAL_CABLE_DEPTH: 0.03,
  /** Vertical cable height ratio */
  VERTICAL_CABLE_HEIGHT_RATIO: 0.25,
  /** Number of vertical cable runs (reduced for optimization) */
  VERTICAL_CABLE_COUNT: 2,
  /** Vertical cable offset positions */
  VERTICAL_CABLE_OFFSETS: [-0.2, 0.2] as const,
  /** Vertical cable vertical position */
  VERTICAL_CABLE_VERTICAL_OFFSET: -0.15,
} as const;

/**
 * ============================================================================
 * COOLING SYSTEM CONSTANTS
 * Fan and heat sink dimensions and animation
 * ============================================================================
 */
const COOLING_SYSTEM = {
  /** Cooler width ratio to screen */
  WIDTH_RATIO: 0.5,
  /** Cooler height ratio to screen */
  HEIGHT_RATIO: 0.18,
  /** Cooler depth */
  DEPTH: 0.12,
  /** Vertical position on panel */
  VERTICAL_POSITION: -0.32,
  /** Cooler depth from panel */
  COOLER_DEPTH: 0.07,
  /** Fan housing radius ratio */
  FAN_RADIUS_RATIO: 0.35,
  /** Fan housing height */
  FAN_HOUSING_HEIGHT: 0.04,
  /** Fan housing segments */
  FAN_HOUSING_SEGMENTS: 16,
  /** Fan blades major radius ratio */
  FAN_BLADES_MAJOR_RADIUS_RATIO: 0.25,
  /** Fan blades minor radius */
  FAN_BLADES_MINOR_RADIUS: 0.015,
  /** Fan rotation speed */
  FAN_ROTATION_SPEED: 3,
  /** Fan hub radius */
  FAN_HUB_RADIUS: 0.04,
  /** Fan hub height */
  FAN_HUB_HEIGHT: 0.02,
  /** Heat sink fin count (reduced for optimization) */
  HEAT_SINK_FIN_COUNT: 3,
  /** Heat sink fin width */
  HEAT_SINK_FIN_WIDTH: 0.03,
  /** Heat sink fin height ratio */
  HEAT_SINK_FIN_HEIGHT_RATIO: 0.8,
  /** Heat sink fin depth */
  HEAT_SINK_FIN_DEPTH: 0.1,
  /** Heat sink fin spacing ratio */
  HEAT_SINK_FIN_SPACING_RATIO: 0.2,
} as const;

/**
 * ============================================================================
 * STRUCTURAL BRACKET CONSTANTS
 * Back panel support bracket dimensions
 * ============================================================================
 */
const STRUCTURAL_BRACKETS = {
  /** Left bracket horizontal offset */
  LEFT_HORIZONTAL_OFFSET: -0.45,
  /** Right bracket horizontal offset */
  RIGHT_HORIZONTAL_OFFSET: 0.45,
  /** Bracket vertical position */
  VERTICAL_POSITION: -0.42,
  /** Bracket depth */
  DEPTH: 0.08,
  /** Vertical strut thickness */
  STRUT_WIDTH: 0.06,
  /** Vertical strut height ratio */
  STRUT_HEIGHT_RATIO: 0.15,
  /** Base plate width */
  BASE_PLATE_WIDTH: 0.15,
  /** Base plate height */
  BASE_PLATE_HEIGHT: 0.04,
  /** Base plate depth */
  BASE_PLATE_DEPTH: 0.06,
  /** Left bracket strut rotation */
  LEFT_STRUT_ROTATION: -0.2,
  /** Right bracket strut rotation */
  RIGHT_STRUT_ROTATION: 0.2,
  /** Base plate offset */
  BASE_PLATE_OFFSET: -0.05,
  /** Base plate right offset */
  BASE_PLATE_RIGHT_OFFSET: 0.05,
  /** Top reinforcement width ratio */
  TOP_BAR_WIDTH_RATIO: 0.8,
  /** Top reinforcement height */
  TOP_BAR_HEIGHT: 0.05,
  /** Top reinforcement vertical position */
  TOP_BAR_VERTICAL_POSITION: 0.48,
} as const;

/**
 * ============================================================================
 * WARNING LABEL CONSTANTS
 * Industrial warning signs and safety labels
 * ============================================================================
 */
const WARNING_LABELS = {
  /** High voltage label width */
  HV_LABEL_WIDTH: 0.2,
  /** High voltage label height */
  HV_LABEL_HEIGHT: 0.08,
  /** Caution label width */
  CAUTION_LABEL_WIDTH: 0.15,
  /** Caution label height */
  CAUTION_LABEL_HEIGHT: 0.06,
  /** Stripe thickness */
  STRIPE_THICKNESS: 0.02,
  /** Exclamation mark width */
  EXCLAMATION_WIDTH: 0.015,
  /** Exclamation mark height */
  EXCLAMATION_HEIGHT: 0.03,
  /** Exclamation dot radius */
  EXCLAMATION_DOT_RADIUS: 0.008,
  /** Label vertical position */
  VERTICAL_POSITION: 0.1,
  /** Left label horizontal position */
  LEFT_LABEL_HORIZONTAL_POSITION: -0.42,
  /** Right label horizontal position */
  RIGHT_LABEL_HORIZONTAL_POSITION: 0.42,
  /** Depth offset */
  DEPTH_OFFSET: 0.08,
  /** Text depth offset */
  TEXT_DEPTH_OFFSET: 0.001,
} as const;

/**
 * ============================================================================
 * SERIAL PLATE CONSTANTS
 * Device identification and serial number plate
 * ============================================================================
 */
const SERIAL_PLATE = {
  /** Plate width */
  PLATE_WIDTH: 0.25,
  /** Plate height */
  PLATE_HEIGHT: 0.1,
  /** Plate thickness */
  PLATE_THICKNESS: 0.01,
  /** Text line 1 width */
  TEXT_LINE_1_WIDTH: 0.2,
  /** Text line 1 height */
  TEXT_LINE_1_HEIGHT: 0.015,
  /** Text line 2 width */
  TEXT_LINE_2_WIDTH: 0.18,
  /** Text line 2 height */
  TEXT_LINE_2_HEIGHT: 0.015,
  /** Text depth offset */
  TEXT_DEPTH_OFFSET: 0.006,
  /** Screw radius */
  SCREW_RADIUS: 0.008,
  /** Screw depth */
  SCREW_DEPTH: 0.01,
  /** Screw segments */
  SCREW_SEGMENTS: 6,
  /** Horizontal position on panel */
  HORIZONTAL_POSITION: 0.35,
  /** Vertical position on panel */
  VERTICAL_POSITION: -0.45,
  /** Depth offset from panel */
  DEPTH_OFFSET: 0.08,
  /** Screw positions offsets */
  SCREW_OFFSET_X: 0.1,
  /** Screw positions offsets Y */
  SCREW_OFFSET_Y: 0.035,
} as const;

/**
 * ============================================================================
 * SCREEN BACK LIGHTING CONSTANTS
 * Ambient and accent lighting behind screen
 * ============================================================================
 */
const SCREEN_BACK_LIGHTING = {
  /** Main light depth position */
  MAIN_LIGHT_DEPTH: -0.5,
  /** Main light idle intensity */
  MAIN_LIGHT_INTENSITY_IDLE: 1.2,
  /** Main light hover intensity */
  MAIN_LIGHT_INTENSITY_HOVER: 2,
  /** Main light tap intensity */
  MAIN_LIGHT_INTENSITY_TAP: 3,
  /** Accent light intensity */
  ACCENT_LIGHT_INTENSITY: 0.7,
  /** Light decay rate */
  LIGHT_DECAY: 2,
  /** Main light distance multiplier */
  MAIN_LIGHT_DISTANCE_RATIO: 2,
  /** Accent light distance multiplier */
  ACCENT_LIGHT_DISTANCE_RATIO: 1.5,
  /** Accent light vertical offset ratio */
  ACCENT_LIGHT_VERTICAL_OFFSET_RATIO: 0.4,
  /** Pulse speed idle */
  PULSE_SPEED_IDLE: 1.5,
  /** Pulse speed hover */
  PULSE_SPEED_HOVER: 3,
  /** Pulse speed tap */
  PULSE_SPEED_TAP: 6,
  /** Pulse amplitude */
  PULSE_AMPLITUDE: 0.3,
  /** Accent light pulse amplitude */
  ACCENT_PULSE_AMPLITUDE: 0.2,
  /** Ambient glow plane size ratio */
  AMBIENT_GLOW_RATIO: 1.3,
  /** Ambient glow opacity idle */
  AMBIENT_GLOW_OPACITY_IDLE: 0.08,
  /** Ambient glow opacity hover */
  AMBIENT_GLOW_OPACITY_HOVER: 0.15,
  /** Ambient glow opacity tap */
  AMBIENT_GLOW_OPACITY_TAP: 0.2,
  /** Edge glow strip vertical position ratio */
  EDGE_GLOW_VERTICAL_OFFSET_RATIO: 0.55,
  /** Edge glow strip width ratio */
  EDGE_GLOW_WIDTH_RATIO: 1.1,
  /** Edge glow strip height */
  EDGE_GLOW_HEIGHT: 0.15,
  /** Edge glow opacity */
  EDGE_GLOW_OPACITY: 0.3,
  /** Accent light phase offset 1 */
  ACCENT_PHASE_OFFSET_1: 1,
  /** Accent light phase offset 2 */
  ACCENT_PHASE_OFFSET_2: 2,
} as const;

/**
 * ============================================================================
 * TEXTURE AND VIDEO CONSTANTS
 * Media filtering and color space settings
 * ============================================================================
 */
const TEXTURE_SETTINGS = {
  /** Cross origin setting for video textures */
  CROSS_ORIGIN: 'anonymous' as const,
  /** Enable texture loop */
  LOOP: true,
  /** Mute video */
  MUTED: true,
  /** Auto-start video */
  START: true,
  /** Generate mipmaps for images */
  GENERATE_MIPMAPS: false,
} as const;

/**
 * ============================================================================
 * COLOR CONSTANTS
 * Standard colors used throughout the screen
 * ============================================================================
 */
const SCREEN_COLORS = {
  /** Fallback background when media fails */
  FALLBACK_BACKGROUND: '#111118',
  /** Outline color for text */
  TEXT_OUTLINE_COLOR: '#000000',
} as const;

interface TVScreenProps {
  config: ScreenConfig;
}

function VideoMedia({ path }: { path: string }) {
  const { gl } = useThree();
  const texture = useVideoTexture(path, {
    loop: TEXTURE_SETTINGS.LOOP,
    muted: TEXTURE_SETTINGS.MUTED,
    start: TEXTURE_SETTINGS.START,
    crossOrigin: TEXTURE_SETTINGS.CROSS_ORIGIN,
  });

  useEffect(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = gl.capabilities.getMaxAnisotropy();
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture, gl]);

  return (
    <meshBasicMaterial map={texture} toneMapped={false} side={THREE.FrontSide} />
  );
}

function ImageMedia({ path }: { path: string }) {
  const { gl } = useThree();
  const texture = useTexture(path);

  useEffect(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = gl.capabilities.getMaxAnisotropy();
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = TEXTURE_SETTINGS.GENERATE_MIPMAPS;
      texture.needsUpdate = true;
    }
  }, [texture, gl]);

  return (
    <meshBasicMaterial map={texture} toneMapped={false} side={THREE.FrontSide} />
  );
}

function ScreenMedia({ type, path }: { type: 'image' | 'video'; path: string }) {
  if (type === 'video') {
    return <VideoMedia path={path} />;
  }
  return <ImageMedia path={path} />;
}

function FallbackMaterial() {
  return (
    <meshBasicMaterial color={SCREEN_COLORS.FALLBACK_BACKGROUND} />
  );
}

function useResponsiveScale() {
  const { size } = useThree();
  const aspectRatio = size.width / size.height;
  const isLandscape = aspectRatio > 1;
  const isWideScreen = aspectRatio > 1.5;

  return useMemo(() => {
    if (isWideScreen) {
      return RESPONSIVE_SCALE.WIDE_SCREEN;
    } else if (isLandscape) {
      return RESPONSIVE_SCALE.LANDSCAPE;
    }
    return RESPONSIVE_SCALE.DEFAULT;
  }, [isLandscape, isWideScreen]);
}

export default function TVScreen({ config }: TVScreenProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const scanlineRef = useRef<THREE.Mesh>(null);
  const screenMeshRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  const responsiveScale = useResponsiveScale();
  const { materials } = usePools();

  // Interactive state
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [tapScale, setTapScale] = useState(1);
  const [glowIntensity, setGlowIntensity] = useState<number>(OPACITY.MEDIUM);

  // Calculate screen dimensions from aspect ratio (no distortion)
  const screenHeight = config.baseSize * responsiveScale;
  const screenWidth = screenHeight * config.aspectRatio;
  const frameWidth = screenWidth * FRAME_DIMENSIONS.WIDTH_RATIO;
  const frameHeight = screenHeight * FRAME_DIMENSIONS.HEIGHT_RATIO;

  const frameGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = frameWidth;
    const h = frameHeight;
    const bevel = FRAME_GEOMETRY.CORNER_BEVEL_RADIUS;

    shape.moveTo(-w + bevel, -h);
    shape.lineTo(w - bevel, -h);
    shape.quadraticCurveTo(w, -h, w, -h + bevel);
    shape.lineTo(w, h - bevel);
    shape.quadraticCurveTo(w, h, w - bevel, h);
    shape.lineTo(-w + bevel, h);
    shape.quadraticCurveTo(-w, h, -w, h - bevel);
    shape.lineTo(-w, -h + bevel);
    shape.quadraticCurveTo(-w, -h, -w + bevel, -h);

    const holeW = w * FRAME_GEOMETRY.HOLE_WIDTH_RATIO;
    const holeH = h * FRAME_GEOMETRY.HOLE_HEIGHT_RATIO;
    const hole = new THREE.Path();
    hole.moveTo(-holeW, -holeH);
    hole.lineTo(holeW, -holeH);
    hole.lineTo(holeW, holeH);
    hole.lineTo(-holeW, holeH);
    shape.holes.push(hole);

    return new THREE.ExtrudeGeometry(shape, {
      depth: FRAME_GEOMETRY.EXTRUDE_DEPTH,
      bevelEnabled: true,
      bevelThickness: FRAME_GEOMETRY.BEVEL_THICKNESS,
      bevelSize: FRAME_GEOMETRY.BEVEL_SIZE,
      bevelSegments: FRAME_GEOMETRY.BEVEL_SEGMENTS,
    });
  }, [frameWidth, frameHeight]);

  const bracketMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: BRACKET_MATERIALS.BRACKET_COLOR,
        metalness: BRACKET_MATERIALS.METALNESS,
        roughness: BRACKET_MATERIALS.ROUGHNESS,
      }),
    []
  );

  // Handle tap/click on screen
  const handleTap = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setIsTapped(true);
    setTapScale(INTERACTION_TIMING.TAP_SCALE_FACTOR);
    setGlowIntensity(1);

    // Reset after animation
    setTimeout(() => {
      setTapScale(1);
      setGlowIntensity(OPACITY.HIGH);
    }, INTERACTION_TIMING.TAP_SCALE_RESET);

    setTimeout(() => {
      setIsTapped(false);
      setGlowIntensity(OPACITY.MEDIUM);
    }, INTERACTION_TIMING.TAP_STATE_RESET);
  }, []);

  // Handle pointer enter (hover)
  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  // Handle pointer leave
  const handlePointerLeave = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Animate glow
    if (glowRef.current) {
      const baseIntensity = isTapped
        ? GLOW_ANIMATION.BASE_INTENSITY_TAP
        : isHovered
          ? GLOW_ANIMATION.BASE_INTENSITY_HOVER
          : GLOW_ANIMATION.BASE_INTENSITY_IDLE;
      const pulseAmount = isTapped
        ? GLOW_ANIMATION.PULSE_AMOUNT_TAP
        : isHovered
          ? GLOW_ANIMATION.PULSE_AMOUNT_HOVER
          : GLOW_ANIMATION.PULSE_AMOUNT_IDLE;
      const intensity =
        baseIntensity +
        Math.sin(time * GLOW_ANIMATION.PULSE_SPEED + config.id) * pulseAmount;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = intensity;
    }

    // Animate scanline
    if (scanlineRef.current) {
      scanlineRef.current.position.y =
        ((time * SCANLINE.MOVEMENT_SPEED + config.id) % 1) * screenHeight -
        screenHeight / 2;
    }

    // Animate pulse ring on tap
    if (pulseRef.current && isTapped) {
      const pulseScale =
        1 + ((time % TAP_PULSE_RING.PULSE_DURATION) / TAP_PULSE_RING.PULSE_DURATION) * (TAP_PULSE_RING.MAX_SCALE - 1);
      pulseRef.current.scale.set(pulseScale, pulseScale, 1);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(
        0,
        0.5 - ((time % TAP_PULSE_RING.PULSE_DURATION) / TAP_PULSE_RING.PULSE_DURATION) * TAP_PULSE_RING.FADE_SPEED
      );
    }

    // Smooth scale animation
    if (groupRef.current) {
      const targetScale = tapScale * (isHovered ? INTERACTION_TIMING.HOVER_SCALE_FACTOR : 1);
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        INTERACTION_TIMING.SCALE_LERP_SPEED
      );
    }
  });

  // Glow color based on state
  const glowColor = isTapped ? CYBERPUNK_COLORS.MAGENTA : CYBERPUNK_COLORS.CYAN;
  const bezelColor = isTapped ? CYBERPUNK_COLORS.MAGENTA : CYBERPUNK_COLORS.CYAN;

  return (
    <group
      ref={groupRef}
      position={config.position}
      rotation={config.rotation}
    >
      {/* Interactive screen surface */}
      <mesh
        ref={screenMeshRef}
        position={[0, 0, ZPOSITION.SCREEN_CONTENT]}
        onClick={handleTap}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <planeGeometry args={[screenWidth, screenHeight]} />
        <Suspense fallback={<FallbackMaterial />}>
          <ScreenMedia type={config.type} path={config.path} />
        </Suspense>
      </mesh>

      {/* Tap pulse effect */}
      {isTapped && (
        <mesh ref={pulseRef} position={[0, 0, ZPOSITION.TAP_PULSE]}>
          <ringGeometry
            args={[
              screenWidth * TAP_PULSE_RING.INNER_RADIUS_RATIO,
              screenWidth * TAP_PULSE_RING.OUTER_RADIUS_RATIO,
              TAP_PULSE_RING.SEGMENTS,
            ]}
          />
          <meshBasicMaterial color={CYBERPUNK_COLORS.MAGENTA} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Hover/tap highlight overlay */}
      {(isHovered || isTapped) && (
        <mesh position={[0, 0, ZPOSITION.HIGHLIGHT_OVERLAY]}>
          <planeGeometry args={[screenWidth, screenHeight]} />
          <meshBasicMaterial
            color={isTapped ? CYBERPUNK_COLORS.MAGENTA : CYBERPUNK_COLORS.CYAN}
            transparent
            opacity={isTapped ? HIGHLIGHT_OVERLAY.OPACITY_TAP : HIGHLIGHT_OVERLAY.OPACITY_HOVER}
          />
        </mesh>
      )}

      {/* Scanline effect overlay */}
      <mesh ref={scanlineRef} position={[0, 0, ZPOSITION.SCANLINE_EFFECT]}>
        <planeGeometry args={[screenWidth, SCANLINE.HEIGHT]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={isHovered ? SCANLINE.OPACITY_HOVER : SCANLINE.OPACITY_IDLE}
        />
      </mesh>

      {/* Screen bezel/border glow */}
      <mesh position={[0, 0, ZPOSITION.BEZEL_GLOW]}>
        <planeGeometry
          args={[
            screenWidth + BEZEL_GLOW.BORDER_OFFSET,
            screenHeight + BEZEL_GLOW.BORDER_OFFSET,
          ]}
        />
        <meshBasicMaterial
          color={bezelColor}
          transparent
          opacity={isHovered ? BEZEL_GLOW.OPACITY_HOVER : BEZEL_GLOW.OPACITY_IDLE}
        />
      </mesh>

      {/* Metallic frame */}
      <mesh geometry={frameGeometry}>
        <meshStandardMaterial
          color={
            isHovered
              ? BRACKET_MATERIALS.FRAME_COLOR_HOVER
              : BRACKET_MATERIALS.FRAME_COLOR_IDLE
          }
          metalness={BRACKET_MATERIALS.FRAME_METALNESS}
          roughness={BRACKET_MATERIALS.FRAME_ROUGHNESS}
          envMapIntensity={
            isHovered
              ? BRACKET_MATERIALS.ENV_MAP_INTENSITY_HOVER
              : BRACKET_MATERIALS.ENV_MAP_INTENSITY_IDLE
          }
        />
      </mesh>

      {/* Edge glow behind frame */}
      <mesh ref={glowRef} position={[0, 0, ZPOSITION.EDGE_GLOW]}>
        <planeGeometry
          args={[
            screenWidth * 1.15,
            screenHeight * 1.15,
          ]}
        />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Corner accent lights - more visible on hover */}
      <CornerLights
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        isHovered={isHovered}
        isTapped={isTapped}
      />

      {/* Industrial mounting brackets */}
      <MountingBrackets screenWidth={screenWidth} screenHeight={screenHeight} material={bracketMaterial} />

      {/* Small accent lights on frame */}
      <FrameAccentLights screenWidth={screenWidth} screenHeight={screenHeight} isHovered={isHovered} />

      {/* Industrial back panel with all components */}
      <BackPanel screenWidth={screenWidth} screenHeight={screenHeight} screenId={config.id} materials={materials} />

      {/* Ambient lighting behind screen */}
      <ScreenBackLighting
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        isHovered={isHovered}
        isTapped={isTapped}
      />

      {/* Optional SideScreen panel */}
      {config.sidePanel?.enabled && (
        <SideScreen
          config={config.sidePanel}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          isHovered={isHovered}
          isTapped={isTapped}
        />
      )}
    </group>
  );
}

function CornerLights({
  screenWidth,
  screenHeight,
  isHovered,
  isTapped,
}: {
  screenWidth: number;
  screenHeight: number;
  isHovered: boolean;
  isTapped: boolean;
}) {
  const lightsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (lightsRef.current && (isHovered || isTapped)) {
      const time = state.clock.elapsedTime;
      lightsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity =
          CORNER_LIGHTS.BASE_OPACITY +
          Math.sin(time * CORNER_LIGHTS.BLINK_SPEED + (i * Math.PI) / (CORNER_LIGHTS.ANIMATION_PHASES / 2)) *
            CORNER_LIGHTS.OPACITY_AMPLITUDE;
      });
    }
  });

  if (!isHovered && !isTapped) return null;

  const color = isTapped ? CYBERPUNK_COLORS.MAGENTA : CYBERPUNK_COLORS.CYAN;
  const corners = [
    [-screenWidth / 2 - CORNER_LIGHTS.OFFSET_DISTANCE, screenHeight / 2 + CORNER_LIGHTS.OFFSET_DISTANCE],
    [screenWidth / 2 + CORNER_LIGHTS.OFFSET_DISTANCE, screenHeight / 2 + CORNER_LIGHTS.OFFSET_DISTANCE],
    [-screenWidth / 2 - CORNER_LIGHTS.OFFSET_DISTANCE, -screenHeight / 2 - CORNER_LIGHTS.OFFSET_DISTANCE],
    [screenWidth / 2 + CORNER_LIGHTS.OFFSET_DISTANCE, -screenHeight / 2 - CORNER_LIGHTS.OFFSET_DISTANCE],
  ];

  return (
    <group ref={lightsRef}>
      {corners.map(([x, y], i) => (
        <mesh key={i} position={[x, y, ZPOSITION.CORNER_LIGHTS]}>
          <circleGeometry args={[CORNER_LIGHTS.RADIUS, CORNER_LIGHTS.SEGMENTS]} />
          <meshBasicMaterial color={color} transparent opacity={CORNER_LIGHTS.OPACITY} />
        </mesh>
      ))}
    </group>
  );
}

function MountingBrackets({
  screenWidth,
  screenHeight,
  material,
}: {
  screenWidth: number;
  screenHeight: number;
  material: THREE.Material;
}) {
  return (
    <>
      {/* Top brackets */}
      <mesh
        position={[
          -screenWidth * MOUNTING_BRACKETS.TOP_BRACKET_HORIZONTAL_OFFSET,
          screenHeight * 0.5 + MOUNTING_BRACKETS.TOP_BRACKET_VERTICAL_OFFSET,
          FRAME_DIMENSIONS.DEPTH_OFFSET,
        ]}
        material={material}
      >
        <boxGeometry
          args={[
            MOUNTING_BRACKETS.TOP_WIDTH,
            MOUNTING_BRACKETS.TOP_HEIGHT,
            MOUNTING_BRACKETS.TOP_DEPTH,
          ]}
        />
      </mesh>
      <mesh
        position={[
          screenWidth * MOUNTING_BRACKETS.TOP_BRACKET_HORIZONTAL_OFFSET,
          screenHeight * 0.5 + MOUNTING_BRACKETS.TOP_BRACKET_VERTICAL_OFFSET,
          FRAME_DIMENSIONS.DEPTH_OFFSET,
        ]}
        material={material}
      >
        <boxGeometry
          args={[
            MOUNTING_BRACKETS.TOP_WIDTH,
            MOUNTING_BRACKETS.TOP_HEIGHT,
            MOUNTING_BRACKETS.TOP_DEPTH,
          ]}
        />
      </mesh>

      {/* Support cables/rods */}
      <mesh
        position={[
          -screenWidth * MOUNTING_BRACKETS.TOP_BRACKET_HORIZONTAL_OFFSET,
          screenHeight * 0.5 + MOUNTING_BRACKETS.CABLE_HEIGHT_OFFSET,
          FRAME_DIMENSIONS.DEPTH_OFFSET,
        ]}
        material={material}
      >
        <cylinderGeometry
          args={[
            MOUNTING_BRACKETS.CABLE_RADIUS,
            MOUNTING_BRACKETS.CABLE_RADIUS,
            1,
            MOUNTING_BRACKETS.CABLE_SEGMENTS,
          ]}
        />
      </mesh>
      <mesh
        position={[
          screenWidth * MOUNTING_BRACKETS.TOP_BRACKET_HORIZONTAL_OFFSET,
          screenHeight * 0.5 + MOUNTING_BRACKETS.CABLE_HEIGHT_OFFSET,
          FRAME_DIMENSIONS.DEPTH_OFFSET,
        ]}
        material={material}
      >
        <cylinderGeometry
          args={[
            MOUNTING_BRACKETS.CABLE_RADIUS,
            MOUNTING_BRACKETS.CABLE_RADIUS,
            1,
            MOUNTING_BRACKETS.CABLE_SEGMENTS,
          ]}
        />
      </mesh>

      {/* Side mounting plates */}
      <mesh
        position={[-screenWidth * MOUNTING_BRACKETS.SIDE_PLATE_HORIZONTAL_OFFSET, 0, -0.05]}
        material={material}
      >
        <boxGeometry
          args={[
            MOUNTING_BRACKETS.SIDE_PLATE_WIDTH,
            screenHeight * MOUNTING_BRACKETS.SIDE_PLATE_HEIGHT_RATIO,
            MOUNTING_BRACKETS.SIDE_PLATE_DEPTH,
          ]}
        />
      </mesh>
      <mesh
        position={[screenWidth * MOUNTING_BRACKETS.SIDE_PLATE_HORIZONTAL_OFFSET, 0, -0.05]}
        material={material}
      >
        <boxGeometry
          args={[
            MOUNTING_BRACKETS.SIDE_PLATE_WIDTH,
            screenHeight * MOUNTING_BRACKETS.SIDE_PLATE_HEIGHT_RATIO,
            MOUNTING_BRACKETS.SIDE_PLATE_DEPTH,
          ]}
        />
      </mesh>
    </>
  );
}

function FrameAccentLights({
  screenWidth,
  screenHeight,
  isHovered,
}: {
  screenWidth: number;
  screenHeight: number;
  isHovered: boolean;
}) {
  const light1Ref = useRef<THREE.Mesh>(null);
  const light2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const speed = isHovered ? FRAME_ACCENT_LIGHTS.ANIMATION_SPEED_HOVER : FRAME_ACCENT_LIGHTS.ANIMATION_SPEED_IDLE;
    if (light1Ref.current) {
      (light1Ref.current.material as THREE.MeshBasicMaterial).opacity =
        FRAME_ACCENT_LIGHTS.OPACITY * 0.75 + Math.sin(t * speed) * 0.4;
    }
    if (light2Ref.current) {
      (light2Ref.current.material as THREE.MeshBasicMaterial).opacity =
        FRAME_ACCENT_LIGHTS.OPACITY * 0.75 + Math.sin(t * speed + FRAME_ACCENT_LIGHTS.SECOND_LIGHT_PHASE_OFFSET) * 0.4;
    }
  });

  return (
    <>
      <mesh ref={light1Ref} position={[-screenWidth * FRAME_ACCENT_LIGHTS.HORIZONTAL_OFFSET_RATIO, -screenHeight * FRAME_ACCENT_LIGHTS.VERTICAL_OFFSET_RATIO, ZPOSITION.FRAME_ACCENT_LIGHTS]}>
        <circleGeometry args={[FRAME_ACCENT_LIGHTS.RADIUS, FRAME_ACCENT_LIGHTS.SEGMENTS]} />
        <meshBasicMaterial color={isHovered ? '#00ff88' : '#00ff00'} transparent opacity={FRAME_ACCENT_LIGHTS.OPACITY} />
      </mesh>
      <mesh ref={light2Ref} position={[screenWidth * FRAME_ACCENT_LIGHTS.HORIZONTAL_OFFSET_RATIO, -screenHeight * FRAME_ACCENT_LIGHTS.VERTICAL_OFFSET_RATIO, ZPOSITION.FRAME_ACCENT_LIGHTS]}>
        <circleGeometry args={[FRAME_ACCENT_LIGHTS.RADIUS, FRAME_ACCENT_LIGHTS.SEGMENTS]} />
        <meshBasicMaterial color={isHovered ? '#ff4488' : '#ff0000'} transparent opacity={FRAME_ACCENT_LIGHTS.OPACITY} />
      </mesh>
    </>
  );
}

// ============================================
// INDUSTRIAL BACK PANEL COMPONENTS
// ============================================

function BackPanel({
  screenWidth,
  screenHeight,
  screenId,
  materials,
}: {
  screenWidth: number;
  screenHeight: number;
  screenId: number;
  materials: ReturnType<typeof usePools>['materials'];
}) {
  const panelDepth = -0.3;
  const panelThickness = 0.15;

  return (
    <group position={[0, 0, panelDepth]}>
      {/* Main back panel surface */}
      <mesh>
        <boxGeometry args={[screenWidth * 1.05, screenHeight * 1.05, panelThickness]} />
        <primitive object={materials.backPanelDarkMetal} attach="material" />
      </mesh>

      {/* Ventilation grilles */}
      <VentilationGrilles screenWidth={screenWidth} screenHeight={screenHeight} materials={materials} />

      {/* Power supply unit with LED indicators */}
      <PowerSupplyUnit screenWidth={screenWidth} screenHeight={screenHeight} screenId={screenId} materials={materials} />

      {/* Cable conduits */}
      <CableConduits screenWidth={screenWidth} screenHeight={screenHeight} materials={materials} />

      {/* Cooling system */}
      <CoolingSystem screenWidth={screenWidth} screenHeight={screenHeight} screenId={screenId} materials={materials} />

      {/* Structural brackets */}
      <StructuralBrackets screenWidth={screenWidth} screenHeight={screenHeight} materials={materials} />

      {/* Warning labels */}
      <WarningLabels screenWidth={screenWidth} screenHeight={screenHeight} materials={materials} />

      {/* Serial number plate */}
      <SerialPlate screenWidth={screenWidth} screenHeight={screenHeight} screenId={screenId} materials={materials} />
    </group>
  );
}

function VentilationGrilles({
  screenWidth,
  screenHeight,
  materials,
}: {
  screenWidth: number;
  screenHeight: number;
  materials: ReturnType<typeof usePools>['materials'];
}) {
  // Simplified: reduced bar count from 8 to 4 for RAM optimization
  const grilleBars = useMemo(() => {
    const bars = [];
    const barCount = 4;
    const grilleHeight = screenHeight * 0.15;
    const barSpacing = grilleHeight / barCount;

    for (let i = 0; i < barCount; i++) {
      bars.push({
        y: -grilleHeight / 2 + barSpacing * i + barSpacing / 2,
      });
    }
    return bars;
  }, [screenHeight]);

  const grilleWidth = screenWidth * 0.2;
  const grilleHeight = screenHeight * 0.15;

  return (
    <>
      {/* Left grille - simplified */}
      <group position={[-screenWidth * 0.3, screenHeight * 0.35, 0.08]}>
        <mesh>
          <boxGeometry args={[grilleWidth + 0.1, grilleHeight + 0.1, 0.03]} />
          <primitive object={materials.backPanelVentGrille} attach="material" />
        </mesh>
        {grilleBars.map((bar, i) => (
          <mesh key={i} position={[0, bar.y, 0.04]}>
            <boxGeometry args={[grilleWidth * 0.9, 0.025, 0.02]} />
            <primitive object={materials.backPanelDarkMetal} attach="material" />
          </mesh>
        ))}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[grilleWidth * 0.8, grilleHeight * 0.8]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.05} />
        </mesh>
      </group>

      {/* Right grille - simplified */}
      <group position={[screenWidth * 0.3, screenHeight * 0.35, 0.08]}>
        <mesh>
          <boxGeometry args={[grilleWidth + 0.1, grilleHeight + 0.1, 0.03]} />
          <primitive object={materials.backPanelVentGrille} attach="material" />
        </mesh>
        {grilleBars.map((bar, i) => (
          <mesh key={i} position={[0, bar.y, 0.04]}>
            <boxGeometry args={[grilleWidth * 0.9, 0.025, 0.02]} />
            <primitive object={materials.backPanelDarkMetal} attach="material" />
          </mesh>
        ))}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[grilleWidth * 0.8, grilleHeight * 0.8]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.05} />
        </mesh>
      </group>
    </>
  );
}

function PowerSupplyUnit({
  screenWidth,
  screenHeight,
  screenId,
  materials,
}: {
  screenWidth: number;
  screenHeight: number;
  screenId: number;
  materials: ReturnType<typeof usePools>['materials'];
}) {
  const ledsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ledsRef.current) {
      const time = state.clock.elapsedTime;
      ledsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        // Staggered LED blinking pattern
        const phase = (time * 2 + i * 0.5 + screenId) % 3;
        mat.opacity = phase < 2 ? 0.9 : 0.3;
      });
    }
  });

  const unitWidth = screenWidth * 0.35;
  const unitHeight = screenHeight * 0.12;

  return (
    <group position={[0, screenHeight * 0.15, 0.1]}>
      {/* Power unit box */}
      <mesh>
        <boxGeometry args={[unitWidth, unitHeight, 0.1]} />
        <primitive object={materials.backPanelPowerUnit} attach="material" />
      </mesh>

      {/* Power unit label area */}
      <mesh position={[0, unitHeight * 0.2, 0.051]}>
        <planeGeometry args={[unitWidth * 0.8, unitHeight * 0.3]} />
        <meshStandardMaterial color="#1a1a2a" metalness={0.5} roughness={0.8} />
      </mesh>

      {/* LED indicator lights */}
      <group ref={ledsRef} position={[0, -unitHeight * 0.2, 0.06]}>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[(i - 2) * (unitWidth * 0.15), 0, 0]}>
            <circleGeometry args={[0.03, 8]} />
            <meshBasicMaterial
              color={i < 3 ? '#00ff00' : i === 3 ? '#ffff00' : '#ff0000'}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>

      {/* Power connector */}
      <mesh position={[unitWidth * 0.35, 0, 0.06]}>
        <boxGeometry args={[0.08, 0.06, 0.04]} />
        <primitive object={materials.backPanelCable} attach="material" />
      </mesh>
    </group>
  );
}

function CableConduits({
  screenWidth,
  screenHeight,
  materials,
}: {
  screenWidth: number;
  screenHeight: number;
  materials: ReturnType<typeof usePools>['materials'];
}) {
  const conduitWidth = screenWidth * 0.7;

  return (
    <group position={[0, 0, 0.08]}>
      {/* Main horizontal conduit */}
      <mesh>
        <boxGeometry args={[conduitWidth, 0.08, 0.05]} />
        <primitive object={materials.backPanelDarkMetal} attach="material" />
      </mesh>

      {/* Vertical cable runs - reduced from 4 to 2 for RAM optimization */}
      {[-0.2, 0.2].map((xOffset, i) => (
        <group key={i} position={[screenWidth * xOffset, -screenHeight * 0.15, 0]}>
          <mesh>
            <boxGeometry args={[0.05, screenHeight * 0.25, 0.03]} />
            <primitive object={materials.backPanelCable} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CoolingSystem({
  screenWidth,
  screenHeight,
  screenId,
  materials,
}: {
  screenWidth: number;
  screenHeight: number;
  screenId: number;
  materials: ReturnType<typeof usePools>['materials'];
}) {
  const fanRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (fanRef.current) {
      // Rotate fan blades
      fanRef.current.rotation.z = state.clock.elapsedTime * 3 + screenId;
    }
  });

  const coolerWidth = screenWidth * 0.5;
  const coolerHeight = screenHeight * 0.18;

  return (
    <group position={[0, -screenHeight * 0.32, 0.1]}>
      {/* Cooling unit housing */}
      <mesh>
        <boxGeometry args={[coolerWidth, coolerHeight, 0.12]} />
        <primitive object={materials.backPanelCoolingUnit} attach="material" />
      </mesh>

      {/* Fan housing */}
      <mesh position={[0, 0, 0.07]}>
        <cylinderGeometry args={[coolerHeight * 0.35, coolerHeight * 0.35, 0.04, 16]} />
        <primitive object={materials.backPanelDarkMetal} attach="material" />
      </mesh>

      {/* Fan blades */}
      <mesh ref={fanRef} position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[coolerHeight * 0.25, 0.015, 4, 6]} />
        <meshStandardMaterial color="#3a3a4a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Fan center hub */}
      <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 8]} />
        <primitive object={materials.backPanelBracket} attach="material" />
      </mesh>

      {/* Heat sink fins - reduced from 6 to 3 for RAM optimization */}
      {[...Array(3)].map((_, i) => (
        <mesh
          key={i}
          position={[(i - 1) * (coolerWidth * 0.2), 0, 0.01]}
        >
          <boxGeometry args={[0.03, coolerHeight * 0.8, 0.1]} />
          <primitive object={materials.backPanelVentGrille} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function StructuralBrackets({
  screenWidth,
  screenHeight,
  materials,
}: {
  screenWidth: number;
  screenHeight: number;
  materials: ReturnType<typeof usePools>['materials'];
}) {
  return (
    <>
      {/* Left angled bracket */}
      <group position={[-screenWidth * 0.45, -screenHeight * 0.42, 0.08]}>
        {/* Vertical strut */}
        <mesh position={[0, 0.05, 0]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.06, screenHeight * 0.15, 0.04]} />
          <primitive object={materials.backPanelBracket} attach="material" />
        </mesh>
        {/* Base plate */}
        <mesh position={[-0.05, -0.08, 0]}>
          <boxGeometry args={[0.15, 0.04, 0.06]} />
          <primitive object={materials.backPanelBracket} attach="material" />
        </mesh>
      </group>

      {/* Right angled bracket */}
      <group position={[screenWidth * 0.45, -screenHeight * 0.42, 0.08]}>
        <mesh position={[0, 0.05, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.06, screenHeight * 0.15, 0.04]} />
          <primitive object={materials.backPanelBracket} attach="material" />
        </mesh>
        <mesh position={[0.05, -0.08, 0]}>
          <boxGeometry args={[0.15, 0.04, 0.06]} />
          <primitive object={materials.backPanelBracket} attach="material" />
        </mesh>
      </group>

      {/* Top reinforcement bar */}
      <mesh position={[0, screenHeight * 0.48, 0.08]}>
        <boxGeometry args={[screenWidth * 0.8, 0.05, 0.04]} />
        <primitive object={materials.backPanelBracket} attach="material" />
      </mesh>
    </>
  );
}

function WarningLabels({
  screenWidth,
  screenHeight,
  materials,
}: {
  screenWidth: number;
  screenHeight: number;
  materials: ReturnType<typeof usePools>['materials'];
}) {
  return (
    <>
      {/* HIGH VOLTAGE warning - left side */}
      <group position={[-screenWidth * 0.42, screenHeight * 0.1, 0.08]}>
        {/* Warning background */}
        <mesh>
          <planeGeometry args={[0.2, 0.08]} />
          <meshBasicMaterial color="#ffcc00" />
        </mesh>
        {/* Warning stripes */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[0.18, 0.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0, 0.025, 0.001]}>
          <planeGeometry args={[0.18, 0.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>

      {/* CAUTION label - right side */}
      <group position={[screenWidth * 0.42, screenHeight * 0.1, 0.08]}>
        <mesh>
          <planeGeometry args={[0.15, 0.06]} />
          <meshBasicMaterial color="#ff6600" />
        </mesh>
        {/* Exclamation symbol approximation */}
        <mesh position={[0, 0.005, 0.001]}>
          <planeGeometry args={[0.015, 0.03]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0, -0.02, 0.001]}>
          <circleGeometry args={[0.008, 8]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>
    </>
  );
}

function SerialPlate({
  screenWidth,
  screenHeight,
  screenId,
  materials,
}: {
  screenWidth: number;
  screenHeight: number;
  screenId: number;
  materials: ReturnType<typeof usePools>['materials'];
}) {
  return (
    <group position={[screenWidth * 0.35, -screenHeight * 0.45, 0.08]}>
      {/* Metal plate */}
      <mesh>
        <boxGeometry args={[0.25, 0.1, 0.01]} />
        <primitive object={materials.backPanelSerialPlate} attach="material" />
      </mesh>
      {/* Embossed text effect - simplified as lines */}
      <mesh position={[0, 0.02, 0.006]}>
        <planeGeometry args={[0.2, 0.015]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.02, 0.006]}>
        <planeGeometry args={[0.18, 0.015]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Corner screws */}
      {[[-0.1, 0.035], [0.1, 0.035], [-0.1, -0.035], [0.1, -0.035]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.01]}>
          <cylinderGeometry args={[0.008, 0.008, 0.01, 6]} />
          <meshStandardMaterial color="#4a4a5a" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// ============================================
// SCREEN BACK LIGHTING
// ============================================

function ScreenBackLighting({
  screenWidth,
  screenHeight,
  isHovered,
  isTapped,
}: {
  screenWidth: number;
  screenHeight: number;
  isHovered: boolean;
  isTapped: boolean;
}) {
  const mainLightRef = useRef<THREE.PointLight>(null);
  const accentLight1Ref = useRef<THREE.PointLight>(null);
  const accentLight2Ref = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const baseIntensity = isTapped ? 3 : isHovered ? 2 : 1.2;
    const pulseSpeed = isTapped ? 6 : isHovered ? 3 : 1.5;

    if (mainLightRef.current) {
      mainLightRef.current.intensity = baseIntensity + Math.sin(time * pulseSpeed) * 0.3;
    }
    if (accentLight1Ref.current) {
      accentLight1Ref.current.intensity = (baseIntensity * 0.6) + Math.sin(time * pulseSpeed + 1) * 0.2;
    }
    if (accentLight2Ref.current) {
      accentLight2Ref.current.intensity = (baseIntensity * 0.6) + Math.sin(time * pulseSpeed + 2) * 0.2;
    }
  });

  const mainColor = isTapped ? '#ff00ff' : '#00ffff';
  const accentColor1 = '#ff00ff';
  const accentColor2 = '#00ffff';

  return (
    <group position={[0, 0, -0.5]}>
      {/* Main center backlight */}
      <pointLight
        ref={mainLightRef}
        color={mainColor}
        intensity={1.2}
        distance={screenWidth * 2}
        decay={2}
      />

      {/* Top accent light */}
      <pointLight
        ref={accentLight1Ref}
        color={accentColor1}
        intensity={0.7}
        distance={screenWidth * 1.5}
        decay={2}
        position={[0, screenHeight * 0.4, 0]}
      />

      {/* Bottom accent light */}
      <pointLight
        ref={accentLight2Ref}
        color={accentColor2}
        intensity={0.7}
        distance={screenWidth * 1.5}
        decay={2}
        position={[0, -screenHeight * 0.4, 0]}
      />

      {/* Ambient glow plane behind screen */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[screenWidth * 1.3, screenHeight * 1.3]} />
        <meshBasicMaterial
          color={mainColor}
          transparent
          opacity={isHovered ? 0.15 : isTapped ? 0.2 : 0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Edge glow strips */}
      <mesh position={[0, screenHeight * 0.55, 0]}>
        <planeGeometry args={[screenWidth * 1.1, 0.15]} />
        <meshBasicMaterial color={accentColor1} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, -screenHeight * 0.55, 0]}>
        <planeGeometry args={[screenWidth * 1.1, 0.15]} />
        <meshBasicMaterial color={accentColor2} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
