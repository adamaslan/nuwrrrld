'use client';

import { useRef, useEffect, useMemo } from 'react';

const CHAR_COUNT = 500;
const COLORS = ['#FF0055', '#00FFCC', '#FFFF00', '#8800FF'];
const CHARS = 'nuwrrrld'.split('');
const W = 600;
const H = 300;
const MODE_DURATION_S = 2.0;
const LERP_RATE = 0.08;

type Mode = 'word' | 'shape1' | 'shape2';

interface Particle {
  char: string;
  color: string;
  word: { x: number; y: number };
  shape1: { x: number; y: number };
  shape2: { x: number; y: number };
  cx: number;
  cy: number;
}

function buildParticles(): Particle[] {
  return Array.from({ length: CHAR_COUNT }, (_, i) => {
    const seg = Math.floor(i / (CHAR_COUNT / 8));
    const wx = seg * 60 + 50 + (Math.sin(i * 7.3) * 0.5 + 0.5) * 20;
    const wy = 100 + (Math.sin(i * 3.7) * 0.5 + 0.5) * 60;
    const angle = (i / CHAR_COUNT) * Math.PI * 2;
    return {
      char: CHARS[i % CHARS.length],
      color: COLORS[i % COLORS.length],
      word: { x: wx, y: wy },
      shape1: { x: W / 2 + Math.cos(angle) * 80, y: H / 2 + Math.sin(angle) * 80 },
      shape2: { x: (Math.sin(i * 13.1) * 0.5 + 0.5) * W, y: (Math.sin(i * 7.9) * 0.5 + 0.5) * H },
      cx: wx,
      cy: wy,
    };
  });
}

export default function NuWrrrldMorph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useMemo(buildParticles, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mode: Mode = 'word';
    let modeElapsed = 0;
    let lastTime = performance.now();
    let rafId: number;

    // Re-assert non-null so the closure retains the narrowing
    const ctx2 = ctx;

    function tick(now: number) {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      modeElapsed += delta;
      if (modeElapsed >= MODE_DURATION_S) {
        mode = mode === 'word' ? 'shape1' : mode === 'shape1' ? 'shape2' : 'word';
        modeElapsed = 0;
      }

      const alpha = 1 - Math.pow(1 - LERP_RATE, delta * 60);

      ctx2.fillStyle = '#000';
      ctx2.fillRect(0, 0, W, H);
      ctx2.font = 'bold 14px monospace';

      for (const p of particles) {
        const target = mode === 'word' ? p.word : mode === 'shape1' ? p.shape1 : p.shape2;
        p.cx += (target.x - p.cx) * alpha;
        p.cy += (target.y - p.cy) * alpha;
        ctx2.fillStyle = p.color;
        ctx2.fillText(p.char, p.cx, p.cy);
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [particles]);

  return (
    <div
      style={{
        background: '#000',
        height: '400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <canvas ref={canvasRef} width={W} height={H} />
    </div>
  );
}
