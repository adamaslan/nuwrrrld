'use client';

import { createContext, useContext, useRef, useCallback } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraContextValue {
  /** Ref to the OrbitControls instance */
  controlsRef: React.RefObject<OrbitControlsImpl>;
  /** Rotate the camera by delta azimuth (radians) */
  rotate: (deltaAzimuth: number, deltaPolar?: number) => void;
  /** Zoom the camera by a factor (>1 zoom in, <1 zoom out) */
  zoom: (factor: number) => void;
}

const CameraContext = createContext<CameraContextValue | null>(null);

export function CameraProvider({ children }: { children: React.ReactNode }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const rotate = useCallback((deltaAzimuth: number, deltaPolar = 0) => {
    const ctrl = controlsRef.current as (OrbitControlsImpl & {
      rotateLeft: (angle: number) => void;
      rotateUp: (angle: number) => void;
    }) | null;
    if (!ctrl) return;
    ctrl.rotateLeft(deltaAzimuth);
    if (deltaPolar !== 0) ctrl.rotateUp(deltaPolar);
    ctrl.update();
  }, []);

  const zoom = useCallback((factor: number) => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    if (factor > 1) ctrl.dollyIn(factor);
    else ctrl.dollyOut(1 / factor);
    ctrl.update();
  }, []);

  return (
    <CameraContext.Provider value={{ controlsRef, rotate, zoom }}>
      {children}
    </CameraContext.Provider>
  );
}

export function useCameraContext(): CameraContextValue {
  const ctx = useContext(CameraContext);
  if (!ctx) throw new Error('useCameraContext must be used inside CameraProvider');
  return ctx;
}
