export type MediaType = 'image' | 'video';
export type TextAlign = 'top' | 'center' | 'bottom';
export type PanelPosition = 'left' | 'right';

/**
 * A clickable link associated with a TV screen.
 * Displayed in the RemoteControl panel when the screen is selected.
 */
export interface ScreenLink {
  /** Display label for the link */
  readonly label: string;
  /** URL to navigate to */
  readonly url: string;
  /** Optional accent color (defaults to screen color) */
  readonly color?: string;
}

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
  /** Human-readable name shown in RemoteControl */
  title?: string;
  /** Accent color for this screen (used in RemoteControl) */
  accentColor?: string;
  /** Clickable links shown in RemoteControl when this screen is selected */
  links?: ScreenLink[];
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
    path: '/media/loved.jpg',
    // Top screen - portrait (900x1600) - furthest back for parallax
    position: [0, 68, -10],
    rotation: [0.05, 0, 0],
    baseSize: 26,
    aspectRatio: 900 / 1600,
    title: 'NuWrrrld News',
    accentColor: '#00ff88',
    links: [
      { label: 'Work with us', url: 'https://portfolio.adamaslan.com', color: '#00ff88' },
      { label: 'GITHUB', url: 'https://github.com/adamaslan', color: '#00ff88' },
    ],
    sidePanel: {
      enabled: true,
      position: 'right',
      widthRatio: 0.85,
      text: 'NuWrrrld News\n\nStatus: ACTIVE\nFeatured Projects\nclick for info',
      textColor: '#00ff88',
      textSize: 1.28,
      textAlign: 'center',
      backgroundColor: '#1a2a1e',
      backgroundOpacity: 0.9,
      glowEnabled: true,
      glowColor: '#00ff88',
      glowIntensity: 0.5,
    },
  },
  {
    id: 2,
    type: 'video',
    path: '/media/thresh-plan1.mp4',
    // Middle screen - square (1783x1783) - medium depth
    position: [0, 40, -6],
    rotation: [0, 0, 0],
    baseSize: 22,
    aspectRatio: 1,
    title: 'Threshold_',
    accentColor: '#00ffff',
    links: [
      { label: 'On Newtown Radio', url: 'https://newtownradio.com', color: '#00ffff' },
      { label: 'Mix Cloud ARCHIVE', url: 'https://www.mixcloud.com/newtownradiobk/threshold_-with-lambface-1-20-26/', color: '#00ffff' },
    ],
    sidePanel: {
      enabled: true,
      position: 'right',
      widthRatio: 0.85,
      text: 'Liminal Electronic\n\nSystem Status: OK\nMusic Type: Ambient\n2nd: Minimal',
      textColor: '#00ffff',
      textSize: 1.25,
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
    position: [0, 12, -3],
    rotation: [-0.05, 0, 0],
    baseSize: 24,
    aspectRatio: 948 / 1188,
    title: 'ZXY Gallery',
    accentColor: '#ff00ff',
    links: [
      { label: 'website', url: 'https://zxygallery.com', color: '#ff00ff' },
      { label: 'CONTACT via Instagram', url: 'https://www.instagram.com/zxygallery', color: '#ff00ff' },
    ],
    sidePanel: {
      enabled: true,
      position: 'left',
      widthRatio: 0.85,
      text: 'ZXY Gallery\n\nProgress: 87%\nDeadline: Q2 2026',
      textColor: '#ff00ff',
      textSize: 1.28,
      textAlign: 'top',
      backgroundColor: '#2d1b4e',
      backgroundOpacity: 0.85,
      glowEnabled: true,
      glowColor: '#ff00ff',
      glowIntensity: 0.4,
    },
  },
  {
    id: 4,
    type: 'image',
    path: '/media/loved.jpg',
    position: [-28, 35, -30],
    rotation: [0, 0.3, 0],
    baseSize: 18,
    aspectRatio: 900 / 1600,
    title: 'Archive',
    accentColor: '#ffaa00',
    links: [
      { label: 'Archive', url: 'https://archive.org', color: '#ffaa00' },
    ],
    sidePanel: {
      enabled: true,
      position: 'right',
      widthRatio: 0.85,
      text: 'Archive\n\nStatus: ACTIVE\nAll Media\nclick for info',
      textColor: '#ffaa00',
      textSize: 1.1,
      textAlign: 'center',
      backgroundColor: '#2a1a0a',
      backgroundOpacity: 0.9,
      glowEnabled: true,
      glowColor: '#ffaa00',
      glowIntensity: 0.5,
    },
  },
  {
    id: 5,
    type: 'image',
    path: '/media/loved.jpg',
    position: [28, 28, -25],
    rotation: [0, -0.3, 0],
    baseSize: 18,
    aspectRatio: 900 / 1600,
    title: 'NuWrrrld Financial',
    accentColor: '#00ffff',
    links: [
      { label: 'NuWrrrld Financial', url: 'https://financial.nuwrrrld.com', color: '#00ffff' },
    ],
    sidePanel: {
      enabled: true,
      position: 'left',
      widthRatio: 0.85,
      text: 'NuWrrrld\nFinancial\n\nMarkets: LIVE\nData: REAL-TIME',
      textColor: '#00ffff',
      textSize: 1.1,
      textAlign: 'center',
      backgroundColor: '#0a1a2a',
      backgroundOpacity: 0.9,
      glowEnabled: true,
      glowColor: '#00ffff',
      glowIntensity: 0.5,
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
