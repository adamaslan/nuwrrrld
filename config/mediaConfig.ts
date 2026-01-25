export type MediaType = 'image' | 'video';
export type TextAlign = 'top' | 'center' | 'bottom';
export type PanelPosition = 'left' | 'right';

/**
 * Configuration for optional side panel attached to TVScreen.
 * Enables display of customizable text with background.
 */
export interface SidePanelConfig {
  /** Feature flag to enable/disable panel */
  readonly enabled: boolean;

  /** Position relative to main screen */
  readonly position: PanelPosition;
  /** Panel width as ratio of main screen width (0.15 = 15%) */
  readonly widthRatio: number;

  /** Text content to display (supports \n for newlines) */
  readonly text: string;
  /** Text color in hex format */
  readonly textColor: string;
  /** Text size in world units */
  readonly textSize: number;
  /** Vertical text alignment */
  readonly textAlign: TextAlign;
  /** Optional custom font path */
  readonly fontFamily?: string;

  /** Background color in hex format */
  readonly backgroundColor: string;
  /** Background opacity (0-1) */
  readonly backgroundOpacity: number;
  /** Optional background image path */
  readonly backgroundImagePath?: string;

  /** Enable glow effect on frame */
  readonly glowEnabled: boolean;
  /** Glow color (defaults to textColor if not specified) */
  readonly glowColor?: string;
  /** Glow intensity (0-1) */
  readonly glowIntensity?: number;
}

/**
 * Default side panel configuration (disabled)
 */
export const DEFAULT_SIDE_PANEL: SidePanelConfig = {
  enabled: false,
  position: 'right',
  widthRatio: 0.15,
  text: '',
  textColor: '#ffffff',
  textSize: 0.3,
  textAlign: 'center',
  backgroundColor: '#1a1a28',
  backgroundOpacity: 0.9,
  glowEnabled: false,
};

export interface ScreenConfig {
  id: number;
  type: MediaType;
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  baseSize: number;
  aspectRatio: number;
  /** Optional side panel configuration */
  sidePanel?: SidePanelConfig;
}

/**
 * Configuration for the 3 TV screens in the scene.
 *
 * Optimized for 1080x2400 viewport (mobile portrait).
 * Screens occupy ~70% of viewport width with staggered Z for parallax.
 *
 * aspectRatio: width / height of the source image
 * baseSize: controls overall screen size (height in world units)
 *
 * To update media:
 * 1. Place your JPEG or video files in /public/media/
 * 2. Update the path, type, and aspectRatio below
 *
 * Supported formats:
 * - Images: JPEG, PNG, WebP
 * - Video: MP4 (H.264), WebM (recommended over MOV for browser compatibility)
 */
export const SCREEN_CONFIGS: ScreenConfig[] = [
  {
    id: 1,
    type: 'image',
    path: '/media/doves1.jpg',
    // Top screen - portrait (900x1600) - furthest back for parallax
    position: [0, 28, -10],
    rotation: [0.05, 0, 0],
    baseSize: 26,
    aspectRatio: 900 / 1600,
  },
  {
    id: 2,
    type: 'video',
    path: '/media/thresh-plan1-good.mov',
    // Middle screen - square (1783x1783) - medium depth
    position: [0, 0, -6],
    rotation: [0, 0, 0],
    baseSize: 22,
    aspectRatio: 1,
    sidePanel: {
      enabled: true,
      position: 'right',
      widthRatio: 0.15,
      text: 'LIVE FEED\n\nSystem Status: OK\nTemp: 52°C\nPower: 98%',
      textColor: '#00ffff',
      textSize: 0.25,
      textAlign: 'center',
      backgroundColor: '#1a1a28',
      backgroundOpacity: 0.9,
      glowEnabled: true,
      glowColor: '#00ffff',
      glowIntensity: 0.5,
    },
  },
  {
    id: 3,
    type: 'image',
    path: '/media/postmascaa1.jpg',
    // Bottom screen - portrait (948x1188) - closest for strong parallax
    position: [0, -28, -3],
    rotation: [-0.05, 0, 0],
    baseSize: 24,
    aspectRatio: 948 / 1188,
    sidePanel: {
      enabled: true,
      position: 'left',
      widthRatio: 0.2,
      text: 'PROJECT ALPHA\n\nProgress: 87%\nDeadline: Q2 2026',
      textColor: '#ff00ff',
      textSize: 0.28,
      textAlign: 'top',
      backgroundColor: '#2d1b4e',
      backgroundOpacity: 0.85,
      glowEnabled: true,
      glowColor: '#ff00ff',
      glowIntensity: 0.4,
    },
  },
];

// Scene scroll configuration
export const SCROLL_CONFIG = {
  startY: 30,      // Camera starts at top
  endY: -30,       // Camera ends at bottom
  travelDistance: 60, // Total Y units camera travels
  scrollHeight: 300,  // vh units for scroll
};
