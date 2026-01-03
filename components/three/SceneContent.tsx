'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Lighting from './Lighting';
import Environment from './Environment';
import TVScreen from './TVScreen';
import Particles from './Particles';
import { SCREEN_CONFIGS, SCROLL_CONFIG } from '@/config/mediaConfig';

function useResponsiveCameraSettings() {
  const { size } = useThree();
  const aspectRatio = size.width / size.height;
  const isLandscape = aspectRatio > 1;
  const isWideScreen = aspectRatio > 1.5;

  return useMemo(() => {
    if (isWideScreen) {
      return {
        fov: 60,
        baseZ: 20,
        lookAtOffset: -8,
      };
    } else if (isLandscape) {
      return {
        fov: 65,
        baseZ: 18,
        lookAtOffset: -7,
      };
    } else {
      // Portrait mode - optimized for 1080x2400
      return {
        fov: 70,
        baseZ: 14,
        lookAtOffset: -6,
      };
    }
  }, [isLandscape, isWideScreen]);
}

function ScrollCamera() {
  const { camera, size } = useThree();
  const settings = useResponsiveCameraSettings();
  const targetY = useRef(SCROLL_CONFIG.startY);
  const scrollProgress = useRef(0);

  useEffect(() => {
    (camera as THREE.PerspectiveCamera).fov = settings.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [camera, settings.fov]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
      scrollProgress.current = progress;
      targetY.current = SCROLL_CONFIG.startY - progress * SCROLL_CONFIG.travelDistance;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const aspectRatio = size.width / size.height;
    const isLandscape = aspectRatio > 1;

    // Subtle sway while scrolling
    const swayX = isLandscape ? 0.3 : 0.15;
    const swayZ = 0.1;

    // Smooth lerp to target Y position
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY.current, 0.08);
    camera.position.x = Math.sin(t * 0.03) * swayX;
    camera.position.z = settings.baseZ + Math.sin(t * 0.02) * swayZ;

    // Look slightly ahead of camera Y position
    camera.lookAt(0, camera.position.y + settings.lookAtOffset, -5);
  });

  return null;
}

function SkyBackground() {
  const { scene } = useThree();
  const textureRef = useRef<THREE.Texture | null>(null);
  const previousBackground = useRef<THREE.Texture | THREE.Color | null>(null);
  const previousEnvironment = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    let isMounted = true;
    let abortController: AbortController | null = null;

    const loadEXR = async () => {
      try {
        // Dynamically import EXRLoader to avoid build issues
        const { EXRLoader } = await import('three/examples/jsm/loaders/EXRLoader.js');
        const loader = new EXRLoader();

        // Store previous values for restoration
        previousBackground.current = scene.background;
        previousEnvironment.current = scene.environment;

        loader.load(
          '/media/the_sky_is_on_fire_4k.exr',
          (texture) => {
            if (!isMounted) {
              // If component unmounted during load, dispose immediately
              texture.dispose();
              return;
            }

            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.SRGBColorSpace;
            scene.background = texture;
            scene.environment = texture;
            textureRef.current = texture;
          },
          undefined,
          (error) => {
            if (isMounted) {
              console.warn('Failed to load EXR background:', error);
              // Fallback: use a simple dark color
              scene.background = new THREE.Color(0x050508);
            }
          }
        );
      } catch (error) {
        if (isMounted) {
          console.warn('EXRLoader not available:', error);
          // Fallback to dark background
          scene.background = new THREE.Color(0x050508);
        }
      }
    };

    loadEXR();

    return () => {
      isMounted = false;

      // Cleanup: dispose texture and restore previous background/environment
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }

      // Restore previous scene state
      if (previousBackground.current) {
        scene.background = previousBackground.current;
      } else {
        scene.background = null;
      }

      if (previousEnvironment.current) {
        scene.environment = previousEnvironment.current;
      } else {
        scene.environment = null;
      }
    };
  }, [scene]);

  return null;
}

export default function SceneContent() {
  return (
    <>
      {/* EXR Sky background and environment map */}
      <SkyBackground />

      {/* Scroll-driven camera with parallax */}
      <ScrollCamera />

      {/* Lighting setup */}
      <Lighting />

      {/* Futuristic city environment */}
      <Environment />

      {/* TV Screens - 3 big screens at staggered depths */}
      {SCREEN_CONFIGS.map((config) => (
        <TVScreen key={config.id} config={config} />
      ))}

      {/* Atmospheric particles */}
      <Particles />
    </>
  );
}
