'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

const CLOSE_MS = 150;
const HOLD_MS = 280;
const OPEN_MS = 220;

function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function useWink(autoDelay = 1100) {
  const [t, setT] = useState(0);
  const busy = useRef(false);
  const raf = useRef(0);

  const wink = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    const start = performance.now();
    const total = CLOSE_MS + HOLD_MS + OPEN_MS;
    const step = (now: number) => {
      const e = now - start;
      if (e < CLOSE_MS) setT(ease(e / CLOSE_MS));
      else if (e < CLOSE_MS + HOLD_MS) setT(1);
      else if (e < total) setT(1 - ease((e - CLOSE_MS - HOLD_MS) / OPEN_MS));
      else {
        setT(0);
        busy.current = false;
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = window.setTimeout(wink, autoDelay);
    return () => {
      window.clearTimeout(id);
      cancelAnimationFrame(raf.current);
    };
  }, [wink, autoDelay]);

  return { t, wink };
}

function Tittle({ t, color }: { t: number; color: string }) {
  const cx = 50;
  const cy = 40;
  const a = 26 * t;
  const b = 20 * t;
  const w = 26 - 15 * t;
  return (
    <svg viewBox="0 0 100 80" className="block h-full w-full overflow-visible" aria-hidden>
      <path
        d={`M ${cx - a} ${cy - b * 0.35} Q ${cx} ${cy + b} ${cx + a} ${cy - b * 0.35}`}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WinkWord({
  className = '',
  dotColor = 'currentColor',
  autoDelay,
  style,
}: {
  className?: string;
  dotColor?: string;
  autoDelay?: number;
  style?: React.CSSProperties;
}) {
  const { t, wink } = useWink(autoDelay);
  return (
    <span
      className={`relative inline-flex select-none items-baseline leading-none ${className}`}
      style={{ fontWeight: 100, gap: '0.045em', ...style }}
      onMouseEnter={wink}
      onFocus={wink}
      onClick={wink}
      role="img"
      aria-label="WINK"
      tabIndex={-1}
    >
      <span aria-hidden>W</span>
      <span aria-hidden className="relative">
        I
        <span
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{ top: '0.005em', width: '0.24em', height: '0.19em' }}
        >
          <Tittle t={t} color={dotColor} />
        </span>
      </span>
      <span aria-hidden>N</span>
      <span aria-hidden>K</span>
    </span>
  );
}

export function TitleEyelid({ tone = 'wine', banner, tag = false }: { tone?: 'wine' | 'paper'; banner?: string[]; tag?: boolean }) {
  const aspect = tag ? 512 : 470;
  const onWine = tone === 'wine';
  const text = onWine ? 'var(--on-wine)' : 'var(--wine-800)';
  return (
    <h1 className="display relative mx-auto w-full max-w-[520px]" style={{ containerType: 'inline-size' }}>
      <span className="sr-only">Imagine in a WINK: One-Step World Action Models via Drifting</span>
      <div className="relative" style={{ aspectRatio: `1000 / ${aspect}` }} aria-hidden>
        <svg viewBox={`0 60 1000 ${aspect}`} className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <path id="text-top" d="M 230 200 Q 500 30 770 200" />
            <path id="text-bot" d={tag ? 'M 40 468 Q 500 584 960 468' : 'M 40 420 Q 500 540 960 420'} />
          </defs>
          <text
            fill={onWine ? 'var(--on-wine-muted)' : 'var(--wine-500)'}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 100, fontSize: 50, letterSpacing: '0.04em' }}
          >
            <textPath href="#text-top" startOffset="50%" textAnchor="middle">
              Imagine in a
            </textPath>
          </text>
          <text
            fill={text}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 100, fontSize: 52, letterSpacing: '0.02em' }}
          >
            <textPath href="#text-bot" startOffset="50%" textAnchor="middle">
              One-Step World Action Models via Drifting
            </textPath>
          </text>
        </svg>
        {banner && <Banner items={banner} />}
        <div className="absolute inset-0 grid place-items-center" style={{ paddingTop: '3cqw' }}>
          <span className="relative" style={{ paddingInline: tag ? '3.4cqw' : '2.2cqw' }}>
            {banner && (
              <span
                aria-hidden
                className="absolute inset-x-0"
                style={
                  tag
                    ? {
                        top: 'calc(50% - 14cqw)',
                        height: '25.5cqw',
                        background: onWine ? 'var(--wine-800)' : 'var(--paper)',
                        border: `1.5px solid ${onWine ? 'var(--coral-200)' : 'var(--wine-700)'}`,
                        borderRadius: '3px',
                      }
                    : {
                        top: '50%',
                        transform: 'translateY(-50%)',
                        height: 'calc(max(34px, 6.6cqw) + 2px)',
                        background: onWine ? 'var(--wine-800)' : 'var(--paper)',
                      }
                }
              />
            )}
            <WinkWord
              className="rise"
              dotColor={onWine ? 'var(--coral-200)' : 'var(--wine-500)'}
              style={{ fontSize: '27cqw', color: onWine ? 'var(--on-wine)' : 'var(--wine-700)' }}
            />
          </span>
        </div>
      </div>
    </h1>
  );
}

function Banner({ items }: { items: string[] }) {
  const run = (key: string) => (
    <span key={key} className="flex shrink-0 items-center" aria-hidden={key === 'b'}>
      {items.map((x) => (
        <span key={x} className="flex shrink-0 items-center">
          <span className="whitespace-nowrap px-7">{x}</span>
          <span className="h-[5px] w-[5px] rotate-45 bg-coral-200 opacity-80" />
        </span>
      ))}
    </span>
  );
  return (
    <div
      className="banner absolute left-1/2 flex items-center overflow-hidden"
      style={{
        top: 'calc(50% + 1.5cqw)',
        width: '100vw',
        height: 'max(34px, 6.6cqw)',
        transform: 'translate(-50%, -50%)',
        background:
          'linear-gradient(to right, transparent, color-mix(in srgb, var(--wine-700) 88%, transparent) 14%, color-mix(in srgb, var(--wine-700) 88%, transparent) 86%, transparent)',
      }}
    >
      <div className="banner-track flex w-max font-mono text-[12px] uppercase tracking-[0.16em] text-on-wine">
        {run('a')}
        {run('b')}
      </div>
    </div>
  );
}
