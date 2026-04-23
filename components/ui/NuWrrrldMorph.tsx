'use client';

import { useState, useEffect, useMemo } from 'react';

const CHAR_COUNT = 500;
const COLORS = ['#FF0055', '#00FFCC', '#FFFF00', '#8800FF'];
const CHARS = 'nuwrrrld'.split('');

type Mode = 'word' | 'shape1' | 'shape2';

interface Particle {
  id: number;
  char: string;
  color: string;
}

interface Pos {
  x: number;
  y: number;
}

function getPos(index: number, currentMode: Mode): Pos {
  if (currentMode === 'word') {
    const segment = Math.floor(index / (CHAR_COUNT / 8));
    const xBase = segment * 60 + 50;
    return {
      x: xBase + (Math.sin(index * 7.3) * 0.5 + 0.5) * 20,
      y: 100 + (Math.sin(index * 3.7) * 0.5 + 0.5) * 60,
    };
  } else if (currentMode === 'shape1') {
    const angle = (index / CHAR_COUNT) * Math.PI * 2;
    return {
      x: 250 + Math.cos(angle) * 80,
      y: 130 + Math.sin(angle) * 80,
    };
  } else {
    return {
      x: (Math.sin(index * 13.1) * 0.5 + 0.5) * 500,
      y: (Math.sin(index * 7.9) * 0.5 + 0.5) * 250,
    };
  }
}

export default function NuWrrrldMorph() {
  const [mode, setMode] = useState<Mode>('word');

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: CHAR_COUNT }, (_, i) => ({
        id: i,
        char: CHARS[i % CHARS.length],
        color: COLORS[i % COLORS.length],
      })),
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setMode((m) => (m === 'word' ? 'shape1' : m === 'shape1' ? 'shape2' : 'word'));
    }, 2000);
    return () => clearTimeout(timer);
  }, [mode]);

  return (
    <div
      style={{
        background: '#000',
        height: '400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        fontFamily: 'monospace',
      }}
    >
      <div style={{ position: 'relative', width: '600px', height: '300px' }}>
        {particles.map((p) => {
          const { x, y } = getPos(p.id, mode);
          return (
            <span
              key={p.id}
              style={{
                position: 'absolute',
                fontSize: '14px',
                fontWeight: 'bold',
                top: 0,
                left: 0,
                color: p.color,
                transform: `translate(${x}px, ${y}px)`,
                transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                willChange: 'transform',
              }}
            >
              {p.char}
            </span>
          );
        })}
      </div>
    </div>
  );
}
