'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CHAR_COUNT = 500;
const COLORS = ['#FF0055', '#00FFCC', '#FFFF00', '#8800FF'];
const CHARS = 'nuwrrrld'.split('');
const CANVAS_W = 512;
const CANVAS_H = 512;
const MODE_DURATION = 2000;

type Mode = 'word' | 'shape1' | 'shape2';

interface ParticleData {
  char: string;
  color: string;
  // stable seeded target positions per mode
  word: { x: number; y: number };
  shape1: { x: number; y: number };
  shape2: { x: number; y: number };
  // current animated position
  cx: number;
  cy: number;
}

function buildParticles(): ParticleData[] {
  return Array.from({ length: CHAR_COUNT }, (_, i) => {
    const wordSeg = Math.floor(i / (CHAR_COUNT / 8));
    const wx = wordSeg * 58 + 30 + (Math.sin(i * 7.3) * 0.5 + 0.5) * 18;
    const wy = 200 + (Math.sin(i * 3.7) * 0.5 + 0.5) * 110;

    const angle = (i / CHAR_COUNT) * Math.PI * 2;
    const s1x = CANVAS_W / 2 + Math.cos(angle) * 140;
    const s1y = CANVAS_H / 2 + Math.sin(angle) * 140;

    const s2x = (Math.sin(i * 13.1) * 0.5 + 0.5) * CANVAS_W;
    const s2y = (Math.sin(i * 7.9) * 0.5 + 0.5) * CANVAS_H;

    return {
      char: CHARS[i % CHARS.length],
      color: COLORS[i % COLORS.length],
      word: { x: wx, y: wy },
      shape1: { x: s1x, y: s1y },
      shape2: { x: s2x, y: s2y },
      cx: wx,
      cy: wy,
    };
  });
}

function targetForMode(p: ParticleData, mode: Mode) {
  if (mode === 'word') return p.word;
  if (mode === 'shape1') return p.shape1;
  return p.shape2;
}

export default function NuWrrrldMorphTexture() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const particlesRef = useRef<ParticleData[]>(buildParticles());
  const modeRef = useRef<Mode>('word');
  const lastSwitchRef = useRef<number>(Date.now());

  // Build canvas + texture once
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

  useFrame(() => {
    const now = Date.now();
    if (now - lastSwitchRef.current > MODE_DURATION) {
      modeRef.current =
        modeRef.current === 'word'
          ? 'shape1'
          : modeRef.current === 'shape1'
          ? 'shape2'
          : 'word';
      lastSwitchRef.current = now;
    }

    const canvas = canvasRef.current;
    const tex = textureRef.current;
    if (!canvas || !tex) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Lerp each particle toward its target
    const mode = modeRef.current;
    ctx.font = 'bold 11px monospace';
    for (const p of particlesRef.current) {
      const target = targetForMode(p, mode);
      p.cx += (target.x - p.cx) * 0.08;
      p.cy += (target.y - p.cy) * 0.08;
      ctx.fillStyle = p.color;
      ctx.fillText(p.char, p.cx, p.cy);
    }

    tex.needsUpdate = true;
  });

  return <meshBasicMaterial map={texture} toneMapped={false} />;
}
