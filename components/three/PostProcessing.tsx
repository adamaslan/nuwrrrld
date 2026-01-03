'use client';

import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';

export default function PostProcessing() {
  return (
    <EffectComposer>
      {/* Bloom - reduced intensity for sharper images */}
      <Bloom
        intensity={0.25}
        luminanceThreshold={0.75}
        luminanceSmoothing={0.5}
        mipmapBlur
      />

      {/* Film grain - reduced for clearer images */}
      <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />

      {/* Vignette - subtler for less edge darkening */}
      <Vignette darkness={0.3} offset={0.4} />

      {/* Chromatic aberration - minimized for sharper edges */}
      <ChromaticAberration
        offset={new Vector2(0.0003, 0.0003)}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0.0}
      />
    </EffectComposer>
  );
}
