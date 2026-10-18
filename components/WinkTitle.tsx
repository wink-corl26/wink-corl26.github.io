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
      style={{ gap: '0.03em', ...style }}
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
          style={{ top: '-0.25em', width: '0.48em', height: '0.38em' }}
        >
          <Tittle t={t} color={dotColor} />
        </span>
      </span>
      <span aria-hidden>N</span>
      <span aria-hidden>K</span>
    </span>
  );
}

export function Title() {
  return (
    <h1
      className="display mx-auto max-w-[1180px] px-4 text-center text-ink"
      style={{ fontSize: 'clamp(29px, 4.4vw, 52px)', lineHeight: 1.15, textWrap: 'balance' }}
    >
      <span className="sr-only">WINK: World-Action Imagination in a Blink</span>
      <span aria-hidden>
        <WinkWord className="rise" dotColor="var(--brand-500)" style={{ color: 'var(--brand-700)' }} />
        <span className="rise">: World-Action Imagination in a Blink</span>
      </span>
    </h1>
  );
}

export function Banner({ items }: { items: string[] }) {
  const run = (key: string) => (
    <span key={key} className="flex shrink-0 items-center" aria-hidden={key === 'b'}>
      {items.map((x) => (
        <span key={x} className="flex shrink-0 items-center">
          <span className="whitespace-nowrap px-7">{x}</span>
          <span className="h-[5px] w-[5px] rotate-45 bg-tint-300" />
        </span>
      ))}
    </span>
  );
  return (
    <div className="banner flex h-9 items-center overflow-hidden border-y border-rule bg-tint-50">
      <div className="banner-track flex w-max font-mono text-[11.5px] uppercase tracking-[0.16em] text-brand-700">
        {run('a')}
        {run('b')}
      </div>
    </div>
  );
}
