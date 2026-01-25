/**
 * Animation timing constants for scene elements.
 * All values represent multipliers for time-based animations.
 */
export const ANIMATION_SPEEDS = {
  /** Slow pulsing effects (0.3x speed) */
  SLOW: 0.3,
  /** Medium rotation/movement (1.5x speed) */
  MEDIUM: 1.5,
  /** Fast animations (2.0x speed) */
  FAST: 2.0,
  /** Very fast effects like engine pulses (4.0x speed) */
  VERY_FAST: 4.0,
  /** Rapid flickering for neon signs (20x speed) */
  FLICKER: 20,
} as const;

/**
 * Opacity levels for various scene elements.
 * Values range from 0.0 (transparent) to 1.0 (opaque).
 */
export const OPACITY = {
  /** Nearly invisible (0.08) */
  SUBTLE: 0.08,
  /** Low visibility for background elements (0.15) */
  LOW: 0.15,
  /** Medium visibility for secondary elements (0.25) */
  MEDIUM: 0.25,
  /** High visibility for interactive elements (0.5) */
  HIGH: 0.5,
  /** Near-opaque for primary elements (0.8) */
  FULL: 0.8,
} as const;

/**
 * Responsive scale multipliers based on viewport aspect ratio.
 */
export const RESPONSIVE_SCALE = {
  /** Widescreen aspect ratio >1.5 (0.85x scale) */
  WIDE_SCREEN: 0.85,
  /** Landscape aspect ratio >1.0 (0.9x scale) */
  LANDSCAPE: 0.9,
  /** Default/portrait aspect ratio (1.0x scale) */
  DEFAULT: 1.0,
} as const;

/**
 * Scene geometry dimensions and element counts.
 * These values define the physical size and density of the environment.
 */
export const SCENE_DIMENSIONS = {
  /** Ground plane width in units */
  GROUND_PLANE_WIDTH: 200,
  /** Ground plane depth in units */
  GROUND_PLANE_HEIGHT: 250,

  // Element counts (optimized from initial higher values)
  /** Number of foreground debris particles */
  DEBRIS_COUNT: 100,
  /** Number of holographic data fragments */
  DATA_FRAGMENTS_COUNT: 8,
  /** Number of flying drones in swarm */
  DRONE_COUNT: 12,
  /** Number of rain particles */
  RAIN_COUNT: 800,
  /** Number of floating platforms */
  PLATFORM_COUNT: 6,
  /** Number of fog layers */
  FOG_LAYER_COUNT: 3,
  /** Number of animated neon signs */
  NEON_SIGN_COUNT: 4,
  /** Number of distant megastructures */
  MEGASTRUCTURE_COUNT: 4,

  // Building counts
  /** Buildings on left side of scene */
  LEFT_BUILDINGS: 5,
  /** Buildings on right side of scene */
  RIGHT_BUILDINGS: 5,
  /** Large background buildings */
  BACKGROUND_BUILDINGS: 6,
} as const;

/**
 * Ship size multipliers for different vessel classes.
 */
export const SHIP_SCALE = {
  /** Small shuttle size multiplier (1.5x base) */
  SHUTTLE_MULTIPLIER: 1.5,
  /** Medium transport size multiplier (1.5x base) */
  TRANSPORT_MULTIPLIER: 1.5,
  /** Large freighter size multiplier (1.5x base) */
  FREIGHTER_MULTIPLIER: 1.5,
  /** Massive capital ship multiplier (9x base) */
  CAPITAL_MULTIPLIER: 9,

  // Fleet composition
  /** Number of small shuttles */
  SHUTTLE_COUNT: 8,
  /** Number of medium transports */
  TRANSPORT_COUNT: 5,
  /** Number of large freighters */
  FREIGHTER_COUNT: 3,
  /** Number of capital ships */
  CAPITAL_COUNT: 3,
} as const;

/**
 * Cyberpunk color palette used throughout the scene.
 * Maintains consistent aesthetic across all elements.
 */
export const CYBERPUNK_COLORS = {
  /** Primary cyan (#00ffff) */
  CYAN: '#00ffff',
  /** Primary magenta (#ff00ff) */
  MAGENTA: '#ff00ff',
  /** Accent amber/orange (#ffaa00) */
  AMBER: '#ffaa00',
  /** Accent green (#00ff88) */
  GREEN: '#00ff88',
  /** Alert red (#ff0000) */
  RED: '#ff0000',
  /** Dark navy blue (#1a2a3a) */
  NAVY: '#1a2a3a',
  /** Dark purple (#2a1a3a) */
  PURPLE: '#2a1a3a',
  /** Dark gray (#1a1a28) */
  DARK_GRAY: '#1a1a28',
} as const;

/**
 * Light intensity values for consistent illumination.
 */
export const LIGHT_INTENSITY = {
  /** Dim ambient light */
  AMBIENT: 0.3,
  /** Standard point light */
  POINT: 0.5,
  /** Bright spot light */
  SPOT: 1.0,
  /** Very bright emissive */
  EMISSIVE: 1.5,
  /** Maximum HDR glow */
  HDR_MAX: 2.0,
} as const;

/**
 * Z-depth positions for scene layering.
 * Negative Z moves away from camera.
 */
export const DEPTH_LAYERS = {
  /** Foreground layer (0 to -5) */
  FOREGROUND_START: 0,
  FOREGROUND_END: -5,

  /** Midground layer (-10 to -20) */
  MIDGROUND_START: -10,
  MIDGROUND_END: -20,

  /** Main scene layer (-6 to -20) */
  MAIN_START: -6,
  MAIN_END: -20,

  /** Deep background (-60 to -100) */
  BACKGROUND_START: -60,
  BACKGROUND_END: -100,

  /** Reverse-facing layer (+25 to +65) */
  OPPOSITE_START: 25,
  OPPOSITE_END: 65,
} as const;

/**
 * Building generation parameters.
 */
export const BUILDING_CONFIG = {
  /** Minimum building height */
  MIN_HEIGHT: 15,
  /** Maximum building height */
  MAX_HEIGHT: 40,
  /** Minimum building width */
  MIN_WIDTH: 3,
  /** Maximum building width */
  MAX_WIDTH: 7,
  /** Antenna probability threshold */
  ANTENNA_THRESHOLD: 0.6,
  /** Window grid spacing */
  WINDOW_SPACING: 2,
} as const;

/**
 * Type guard to ensure const assertion.
 */
type Immutable<T> = {
  readonly [K in keyof T]: T[K];
};
