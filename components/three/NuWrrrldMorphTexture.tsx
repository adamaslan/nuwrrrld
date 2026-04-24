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

// Rich chaotic character set — lots of visual noise
const CHAOS_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
  '!@#$%^&*()_+-=[]{}|;:<>?,./~`¡¢£¤¥¦§©ª«®°±²³µ¶·¹º»¼½¾¿×÷' +
  'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω' +
  '░▒▓█▄▀▌▐■□▪▫▬▮▯▰▱◆◇○●◎★☆';

type Mode = 'word' | 'shape' | 'label';

interface ParticleData {
  // The letter this particle represents in word/label mode
  wordChar: string;
  labelChar: string;
  color: string;
  word: { x: number; y: number };
  shape: { x: number; y: number };
  label: { x: number; y: number };
  cx: number;
  cy: number;
  // Chaos character cycles independently per particle
  chaosOffset: number;
  chaosSpeed: number;
}

function buildWordPositions(text: string): Array<{ x: number; y: number }> {
  const chars = text.split('');
  const charWidth = Math.floor((CANVAS_W * 0.82) / chars.length);
  const totalWidth = chars.length * charWidth;
  const startX = (CANVAS_W - totalWidth) / 2 + charWidth * 0.3;
  const particlesPerChar = Math.floor(CHAR_COUNT / chars.length);
  return Array.from({ length: CHAR_COUNT }, (_, i) => {
    const charIdx = Math.min(Math.floor(i / particlesPerChar), chars.length - 1);
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
  labelText: string,
): ParticleData[] {
  const nuwrrrldChars = 'nuwrrrld'.split('');
  const labelChars = labelText.split('');
  const circlePositions = buildCirclePositions();
  const particlesPerWordChar = Math.floor(CHAR_COUNT / nuwrrrldChars.length);
  const particlesPerLabelChar = Math.floor(CHAR_COUNT / labelChars.length);

  return Array.from({ length: CHAR_COUNT }, (_, i) => {
    const wordCharIdx = Math.min(Math.floor(i / particlesPerWordChar), nuwrrrldChars.length - 1);
    const labelCharIdx = Math.min(Math.floor(i / particlesPerLabelChar), labelChars.length - 1);
    return {
      wordChar: nuwrrrldChars[wordCharIdx],
      labelChar: labelChars[labelCharIdx],
      color: COLORS[i % COLORS.length],
      word: wordPositions[i],
      shape: circlePositions[i],
      label: labelPositions[i],
      cx: wordPositions[i].x,
      cy: wordPositions[i].y,
      // Each particle has its own chaos phase and speed so letters scramble unevenly
      chaosOffset: Math.floor(Math.random() * CHAOS_CHARS.length),
      chaosSpeed: 8 + Math.random() * 24,
    };
  });
}

function targetForMode(p: ParticleData, mode: Mode) {
  if (mode === 'word') return p.word;
  if (mode === 'shape') return p.shape;
  return p.label;
}

function charForMode(p: ParticleData, mode: Mode, elapsed: number): string {
  if (mode === 'word') return p.wordChar;
  if (mode === 'label') return p.labelChar;
  // shape = chaos: each particle cycles through CHAOS_CHARS at its own speed
  const idx = Math.floor(p.chaosOffset + elapsed * p.chaosSpeed) % CHAOS_CHARS.length;
  return CHAOS_CHARS[idx];
}

export interface NuWrrrldMorphTextureProps {
  variant?: 'archive' | 'financial';
}

export default function NuWrrrldMorphTexture({ variant = 'archive' }: NuWrrrldMorphTextureProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const modeRef = useRef<Mode>('word');
  const modeElapsedRef = useRef<number>(0);
  const totalElapsedRef = useRef<number>(0);

  const labelText = variant === 'financial' ? 'financial' : 'archive';

  const wordPositions = useMemo(() => buildWordPositions('nuwrrrld'), []);
  const labelPositions = useMemo(() => buildWordPositions(labelText), [labelText]);

  // Lazy init: useRef initializer runs every render but only the first value is kept.
  // Using null! + guard means buildParticles only runs once at mount.
  const particlesRef = useRef<ParticleData[]>(null!);
  if (!particlesRef.current) {
    particlesRef.current = buildParticles(wordPositions, labelPositions, labelText);
  }

  useEffect(() => {
    const oldParticles = particlesRef.current;
    const newParticles = buildParticles(wordPositions, labelPositions, labelText);
    // Preserve current cx/cy so particles lerp from where they are rather than snapping to word start
    for (let i = 0; i < newParticles.length; i++) {
      if (oldParticles[i]) {
        newParticles[i].cx = oldParticles[i].cx;
        newParticles[i].cy = oldParticles[i].cy;
      }
    }
    particlesRef.current = newParticles;
  }, [wordPositions, labelPositions, labelText]);

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
      texture.dispose();
    };
  }, [texture]);

  useFrame((_, delta) => {
    totalElapsedRef.current += delta;
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
      ctx.fillText(charForMode(p, mode, totalElapsedRef.current), p.cx, p.cy);
    }

    tex.needsUpdate = true;
  });

  return <meshBasicMaterial map={texture} toneMapped={false} />;
}
