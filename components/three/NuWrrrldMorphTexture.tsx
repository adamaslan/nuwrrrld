'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CHAR_COUNT = 500;
const COLORS = ['#FF0055', '#00FFCC', '#FFFF00', '#8800FF'];
const CANVAS_W = 512;
const CANVAS_H = 512;
const MODE_DURATION_S = 2.0;
const LERP_RATE = 0.08;

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
  const charWidth = 52;
  const totalWidth = chars.length * charWidth;
  const startX = (CANVAS_W - totalWidth) / 2 + charWidth / 2;
  return Array.from({ length: CHAR_COUNT }, (_, i) => {
    const seg = Math.floor(i / (CHAR_COUNT / chars.length));
    const charIdx = Math.min(seg, chars.length - 1);
    return {
      x: startX + charIdx * charWidth + (Math.sin(i * 7.3) * 0.5 + 0.5) * 14,
      y: CANVAS_H / 2 + (Math.sin(i * 3.7) * 0.5 + 0.5) * 80,
    };
  });
}

function buildCirclePositions(): Array<{ x: number; y: number }> {
  return Array.from({ length: CHAR_COUNT }, (_, i) => {
    const angle = (i / CHAR_COUNT) * Math.PI * 2;
    return {
      x: CANVAS_W / 2 + Math.cos(angle) * 160,
      y: CANVAS_H / 2 + Math.sin(angle) * 160,
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
    ctx.font = 'bold 11px monospace';
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
