'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SCREEN_CONFIGS } from '@/config/mediaConfig';
import { useScreenContext } from '@/context/ScreenContext';
import { useCameraContext } from '@/context/CameraContext';

const ROTATE_STEP = 0.08;
const ZOOM_FACTOR = 1.12;
const REPEAT_MS = 80;

/**
 * Cyberpunk floating remote control with orbit drag and zoom controls.
 * Optimized for both touch (mobile) and mouse (desktop).
 */
export default function RemoteControl() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedScreenId, toggleScreen } = useScreenContext();
  const { rotate, zoom } = useCameraContext();

  const selectedConfig = SCREEN_CONFIGS.find((s) => s.id === selectedScreenId) ?? null;

  const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const handleChannelClick = useCallback(
    (id: number) => toggleScreen(id),
    [toggleScreen]
  );

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.5rem',
        fontFamily: "'Courier New', Consolas, monospace",
        pointerEvents: 'none',
      }}
    >
      {/* Expanded panel */}
      {isOpen && (
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(8, 8, 20, 0.92)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '6px',
            padding: '0',
            minWidth: '220px',
            maxWidth: '280px',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 0 24px rgba(0, 255, 255, 0.15), 0 0 48px rgba(255, 0, 255, 0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.5rem 0.75rem',
              borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0, 255, 255, 0.05)',
            }}
          >
            <span
              style={{
                fontSize: '0.6rem',
                letterSpacing: '0.25em',
                color: '#00ffff',
                textTransform: 'uppercase',
                textShadow: '0 0 8px rgba(0, 255, 255, 0.6)',
              }}
            >
              ◈ CTRL PANEL
            </span>
            <button
              onClick={handleToggle}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(0, 255, 255, 0.5)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: '0',
                lineHeight: 1,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#ff00ff';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0, 255, 255, 0.5)';
              }}
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          {/* ── CAMERA CONTROLS ── */}
          <div
            style={{
              padding: '0.75rem',
              borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
            }}
          >
            <div
              style={{
                fontSize: '0.5rem',
                letterSpacing: '0.2em',
                color: 'rgba(0, 255, 255, 0.4)',
                textTransform: 'uppercase',
                marginBottom: '0.6rem',
              }}
            >
              ORBIT + ZOOM
            </div>

            {/* D-pad + zoom cluster */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {/* D-pad */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 36px)',
                  gridTemplateRows: 'repeat(3, 36px)',
                  gap: '2px',
                }}
              >
                {/* Row 1: _, up, _ */}
                <div />
                <CamBtn
                  label="↑"
                  title="Orbit up"
                  onHold={() => rotate(0, ROTATE_STEP)}
                />
                <div />

                {/* Row 2: left, center dot, right */}
                <CamBtn
                  label="←"
                  title="Orbit left"
                  onHold={() => rotate(ROTATE_STEP)}
                />
                {/* Center dot */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(0, 255, 255, 0.25)',
                    fontSize: '0.5rem',
                  }}
                >
                  ◉
                </div>
                <CamBtn
                  label="→"
                  title="Orbit right"
                  onHold={() => rotate(-ROTATE_STEP)}
                />

                {/* Row 3: _, down, _ */}
                <div />
                <CamBtn
                  label="↓"
                  title="Orbit down"
                  onHold={() => rotate(0, -ROTATE_STEP)}
                />
                <div />
              </div>

              {/* Zoom column */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  marginLeft: '2px',
                }}
              >
                <CamBtn
                  label="＋"
                  title="Zoom in"
                  onHold={() => zoom(ZOOM_FACTOR)}
                  accent="#00ff88"
                />
                <div style={{ height: '4px' }} />
                <CamBtn
                  label="−"
                  title="Zoom out"
                  onHold={() => zoom(1 / ZOOM_FACTOR)}
                  accent="#ff6644"
                />
              </div>
            </div>
          </div>

          {/* Channel selector */}
          <div
            style={{
              padding: '0.6rem 0.75rem',
              borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
            }}
          >
            <div
              style={{
                fontSize: '0.5rem',
                letterSpacing: '0.2em',
                color: 'rgba(0, 255, 255, 0.4)',
                textTransform: 'uppercase',
                marginBottom: '0.4rem',
              }}
            >
              SELECT CHANNEL
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {SCREEN_CONFIGS.map((screen) => {
                const isSelected = selectedScreenId === screen.id;
                const color = '#ff00ff';
                return (
                  <button
                    key={screen.id}
                    onClick={() => handleChannelClick(screen.id)}
                    style={{
                      flex: 1,
                      padding: '0.4rem 0.25rem',
                      background: isSelected
                        ? `rgba(${hexToRgb(color)}, 0.15)`
                        : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? color : 'rgba(255,0,255,0.3)'}`,
                      borderRadius: '4px',
                      color: isSelected ? color : 'rgba(255, 0, 255, 0.6)',
                      cursor: 'pointer',
                      fontSize: '0.55rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      transition: 'all 0.2s',
                      textShadow: isSelected ? `0 0 6px ${color}` : `0 0 4px rgba(255,0,255,0.3)`,
                      boxShadow: isSelected ? `0 0 8px rgba(${hexToRgb(color)}, 0.3)` : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = color;
                        (e.currentTarget as HTMLButtonElement).style.color = color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                          'rgba(255,0,255,0.3)';
                        (e.currentTarget as HTMLButtonElement).style.color =
                          'rgba(255, 0, 255, 0.6)';
                      }
                    }}
                    aria-pressed={isSelected}
                    aria-label={`Select screen ${screen.id}: ${screen.title ?? `Channel ${screen.id}`}`}
                  >
                    CH-0{screen.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected screen info + links */}
          {selectedConfig ? (
            <div style={{ padding: '0.6rem 0.75rem' }}>
              <div
                style={{
                  fontSize: '0.6rem',
                  letterSpacing: '0.2em',
                  color: selectedConfig.accentColor ?? '#00ffff',
                  textTransform: 'uppercase',
                  textShadow: `0 0 8px ${selectedConfig.accentColor ?? '#00ffff'}`,
                  marginBottom: '0.5rem',
                }}
              >
                ▶ {selectedConfig.title ?? `SCREEN ${selectedConfig.id}`}
              </div>

              {selectedConfig.links && selectedConfig.links.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {selectedConfig.links.map((link, i) => {
                    const linkColor = link.color ?? selectedConfig.accentColor ?? '#00ffff';
                    return (
                      <a
                        key={i}
                        href={link.url}
                        target={link.url.startsWith('mailto:') ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.35rem 0.5rem',
                          background: `rgba(${hexToRgb(linkColor)}, 0.06)`,
                          border: `1px solid rgba(${hexToRgb(linkColor)}, 0.25)`,
                          borderRadius: '3px',
                          color: linkColor,
                          textDecoration: 'none',
                          fontSize: '0.55rem',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          transition: 'all 0.2s',
                          textShadow: `0 0 6px rgba(${hexToRgb(linkColor)}, 0.4)`,
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLAnchorElement;
                          el.style.background = `rgba(${hexToRgb(linkColor)}, 0.18)`;
                          el.style.borderColor = linkColor;
                          el.style.boxShadow = `0 0 10px rgba(${hexToRgb(linkColor)}, 0.3)`;
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLAnchorElement;
                          el.style.background = `rgba(${hexToRgb(linkColor)}, 0.06)`;
                          el.style.borderColor = `rgba(${hexToRgb(linkColor)}, 0.25)`;
                          el.style.boxShadow = 'none';
                        }}
                      >
                        <span style={{ opacity: 0.6 }}>→</span>
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: '0.5rem',
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  NO LINKS CONFIGURED
                </div>
              )}

              <div
                style={{
                  marginTop: '0.6rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '0.45rem',
                    color: 'rgba(255,255,255,0.2)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  {selectedConfig.type === 'video' ? '◉ VIDEO' : '◈ IMAGE'}
                </span>
                <span
                  style={{
                    fontSize: '0.45rem',
                    color: '#00ff44',
                    letterSpacing: '0.12em',
                    textShadow: '0 0 6px rgba(0, 255, 68, 0.5)',
                    textTransform: 'uppercase',
                  }}
                >
                  ● ACTIVE
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '0.75rem',
                fontSize: '0.5rem',
                color: '#ff00ff',
                textShadow: '0 0 8px rgba(255, 0, 255, 0.6)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              — SELECT A CHANNEL —
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={handleToggle}
        style={{
          pointerEvents: 'auto',
          width: '44px',
          height: '44px',
          borderRadius: '6px',
          background: isOpen
            ? 'rgba(0, 255, 255, 0.15)'
            : 'rgba(8, 8, 20, 0.88)',
          border: `1px solid ${isOpen ? 'rgba(0, 255, 255, 0.6)' : 'rgba(0, 255, 255, 0.25)'}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: isOpen
            ? '0 0 16px rgba(0, 255, 255, 0.3)'
            : '0 0 8px rgba(0, 255, 255, 0.1)',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.4)';
          el.style.borderColor = 'rgba(0, 255, 255, 0.7)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.boxShadow = isOpen
            ? '0 0 16px rgba(0, 255, 255, 0.3)'
            : '0 0 8px rgba(0, 255, 255, 0.1)';
          el.style.borderColor = isOpen
            ? 'rgba(0, 255, 255, 0.6)'
            : 'rgba(0, 255, 255, 0.25)';
        }}
        aria-label={isOpen ? 'Close control panel' : 'Open control panel'}
        aria-expanded={isOpen}
      >
        <svg
          width="18"
          height="14"
          viewBox="0 0 18 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: isOpen ? 1 : 0.7 }}
        >
          <rect x="0" y="0" width="18" height="2" rx="1" fill={isOpen ? '#00ffff' : '#00ffff'} />
          <rect x="3" y="6" width="12" height="2" rx="1" fill={isOpen ? '#ff00ff' : '#00ffff'} />
          <rect x="6" y="12" width="6" height="2" rx="1" fill={isOpen ? '#00ff88' : '#00ffff'} />
        </svg>
      </button>
    </div>
  );
}

// ─── CamBtn ──────────────────────────────────────────────────────────────────

interface CamBtnProps {
  label: string;
  title: string;
  onHold: () => void;
  accent?: string;
}

/**
 * Camera control button that fires continuously while held (pointer down).
 * Works on both touch and mouse via pointer events.
 */
function CamBtn({ label, title, onHold, accent = '#00ffff' }: CamBtnProps) {
  const [active, setActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHold = useCallback(() => {
    onHold();
    setActive(true);
    intervalRef.current = setInterval(onHold, REPEAT_MS);
  }, [onHold]);

  const stopHold = useCallback(() => {
    setActive(false);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => () => stopHold(), [stopHold]);

  const rgb = hexToRgb(accent);

  return (
    <button
      aria-label={title}
      title={title}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        startHold();
      }}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '4px',
        border: `1px solid ${active ? accent : `rgba(${rgb}, 0.3)`}`,
        background: active
          ? `rgba(${rgb}, 0.25)`
          : `rgba(${rgb}, 0.06)`,
        color: active ? accent : `rgba(${rgb}, 0.7)`,
        fontSize: '1rem',
        lineHeight: 1,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.1s, border-color 0.1s, color 0.1s',
        boxShadow: active ? `0 0 10px rgba(${rgb}, 0.45)` : 'none',
        textShadow: active ? `0 0 8px ${accent}` : 'none',
        // No text selection on hold
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
    >
      {label}
    </button>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
