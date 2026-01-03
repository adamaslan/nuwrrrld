export type MediaType = 'image' | 'video';

export interface ScreenConfig {
  id: number;
  type: MediaType;
  path: string;
  position: [number, number, number];
  rotation: [number, number, number];
  baseSize: number;
  aspectRatio: number;
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
    type: 'image',
    path: '/media/nathans1.jpg',
    // Middle screen - square (1783x1783) - medium depth
    position: [0, 0, -6],
    rotation: [0, 0, 0],
    baseSize: 22,
    aspectRatio: 1,
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
  },
];

// Scene scroll configuration
export const SCROLL_CONFIG = {
  startY: 30,      // Camera starts at top
  endY: -30,       // Camera ends at bottom
  travelDistance: 60, // Total Y units camera travels
  scrollHeight: 300,  // vh units for scroll
};
