'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CHAR_COUNT = 180;
const COLORS = ['#FF0055', '#00FFCC', '#FFFF00', '#8800FF'];
const CANVAS_W = 1024;
const CANVAS_H = 1024;
const MODE_DURATION_S = 2.5;
const LERP_RATE = 0.1;
const FONT_SIZE = 22;

type Mode = 'word' | 'shape' | 'label';

interface ParticleData {
  char: string;
  color: string;
  word: { x: number; y: number };
  shape: { x: number; y: number };
  label: { x: number; y: number };
  cx: number;
  cy: number;
}

function buildWordPositions(text: string): Array<{ x: number; y: number }> {
  const chars = text.split('');
  // charWidth scaled to fill ~80% of canvas width
  const charWidth = Math.floor((CANVAS_W * 0.82) / chars.length);
  const totalWidth = chars.length * charWidth;
  const startX = (CANVAS_W - totalWidth) / 2 + charWidth * 0.3;
  const particlesPerChar = Math.floor(CHAR_COUNT / chars.length);
  return Array.from({ length: CHAR_COUNT }, (_, i) => {
    const charIdx = Math.min(Math.floor(i / particlesPerChar), chars.length - 1);
    // Tight horizontal spread within the character cell; minimal vertical scatter
    const jitterX = (Math.sin(i * 7.3) * 0.5 + 0.5) * charWidth * 0.55;
    const jitterY = (Math.sin(i * 3.7) - 0.5) * FONT_SIZE * 1.2;
    return {
      x: startX + charIdx * charWidth + jitterX,
      y: CANVAS_H / 2 + jitterY,
    };
  });
}

function buildCirclePositions(): Array<{ x: number; y: number }> {
  return Array.from({ length: CHAR_COUNT }, (_, i) => {
    const angle = (i / CHAR_COUNT) * Math.PI * 2;
    return {
      x: CANVAS_W / 2 + Math.cos(angle) * 320,
      y: CANVAS_H / 2 + Math.sin(angle) * 320,
    };
  });
}

function buildParticles(
  wordPositions: Array<{ x: number; y: number }>,
  labelPositions: Array<{ x: number; y: number }>,
): ParticleData[] {
  const nuwrrrldChars = 'nuwrrrld'.split('');
  const circlePositions = buildCirclePositions();
  return Array.from({ length: CHAR_COUNT }, (_, i) => ({
    char: nuwrrrldChars[i % nuwrrrldChars.length],
    color: COLORS[i % COLORS.length],
    word: wordPositions[i],
    shape: circlePositions[i],
    label: labelPositions[i],
    cx: wordPositions[i].x,
    cy: wordPositions[i].y,
  }));
}

function targetForMode(p: ParticleData, mode: Mode) {
  if (mode === 'word') return p.word;
  if (mode === 'shape') return p.shape;
  return p.label;
}

export interface NuWrrrldMorphTextureProps {
  variant?: 'archive' | 'financial';
}

export default function NuWrrrldMorphTexture({ variant = 'archive' }: NuWrrrldMorphTextureProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const modeRef = useRef<Mode>('word');
  const modeElapsedRef = useRef<number>(0);

  const labelText = variant === 'financial' ? 'financial' : 'archive';

  const wordPositions = useMemo(() => buildWordPositions('nuwrrrld'), []);
  const labelPositions = useMemo(() => buildWordPositions(labelText), [labelText]);
  const particlesRef = useRef<ParticleData[]>(buildParticles(wordPositions, labelPositions));

  // Rebuild particles when variant changes
  useEffect(() => {
    particlesRef.current = buildParticles(wordPositions, labelPositions);
  }, [wordPositions, labelPositions]);

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    canvasRef.current = canvas;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    textureRef.current = tex;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      textureRef.current?.dispose();
    };
  }, [texture]);

  useFrame((_, delta) => {
    modeElapsedRef.current += delta;
    if (modeElapsedRef.current >= MODE_DURATION_S) {
      modeRef.current =
        modeRef.current === 'word'
          ? 'shape'
          : modeRef.current === 'shape'
          ? 'label'
          : 'word';
      modeElapsedRef.current = 0;
    }

    const canvas = canvasRef.current;
    const tex = textureRef.current;
    if (!canvas || !tex) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const alpha = 1 - Math.pow(1 - LERP_RATE, delta * 60);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const mode = modeRef.current;
    ctx.font = `bold ${FONT_SIZE}px monospace`;
    for (const p of particlesRef.current) {
      const target = targetForMode(p, mode);
      p.cx += (target.x - p.cx) * alpha;
      p.cy += (target.y - p.cy) * alpha;
      ctx.fillStyle = p.color;
      ctx.fillText(p.char, p.cx, p.cy);
    }

    tex.needsUpdate = true;
  });

  return <meshBasicMaterial map={texture} toneMapped={false} />;
}
