'use client';

import { useEffect, useRef, useState } from 'react';
import { r2 } from '@/lib/num';

type Sampler = 'flow10' | 'flow1' | 'wink';

const SAMPLERS: { id: Sampler; label: string; passes: number }[] = [
  { id: 'flow10', label: 'Flow, 10 steps', passes: 10 },
  { id: 'flow1', label: 'Flow, 1 step', passes: 1 },
  { id: 'wink', label: 'WINK, 1 step', passes: 1 },
];

const N = 9;

function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function draw(seed: number) {
  const r = rand(seed);
  return Array.from({ length: N }).map(() => ({ side: r() < 0.5 ? -1 : 1, jitter: (r() - 0.5) * 0.35 }));
}

function targets(s: Sampler, noise: { side: number; jitter: number }[]) {
  return noise.map((n) => (s === 'flow1' ? 0 : n.side * (1 + n.jitter * 0.6)));
}

export function BlurToy() {
  const [sampler, setSampler] = useState<Sampler>('flow1');
  const [seed, setSeed] = useState(7);
  const [amp, setAmp] = useState<number[]>(() => targets('flow1', draw(7)));
  const ampRef = useRef(amp);
  const raf = useRef(0);

  useEffect(() => {
    const goal = targets(sampler, draw(seed));
    const from = ampRef.current.slice();
    const t0 = performance.now();
    cancelAnimationFrame(raf.current);
    const step = (now: number) => {
      const k = Math.min((now - t0) / 650, 1);
      const e = 1 - Math.pow(1 - k, 3);
      const next = from.map((f, i) => f + (goal[i] - f) * e);
      ampRef.current = next;
      setAmp(next);
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [sampler, seed]);

  const W = 640;
  const H = 260;
  const x0 = 60;
  const x1 = 580;
  const yc = 130;
  const path = (a: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40;
      const x = x0 + (x1 - x0) * u;
      const y = r2(yc - a * 78 * Math.sin(Math.PI * u));
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };
  const collides = (a: number) => Math.abs(a) < 0.45;
  const passes = SAMPLERS.find((s) => s.id === sampler)!.passes;

  return (
    <div className="rounded-[var(--radius-lg)] bg-white p-5 ring-1 ring-rule">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-coral-50 p-1 ring-1 ring-rule">
          {SAMPLERS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSampler(s.id)}
              className={`rounded-full px-3.5 py-1 text-[13px] transition-colors ${
                sampler === s.id ? 'bg-wine-700 text-on-wine' : 'text-muted hover:text-wine-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSeed((x) => x + 1)}
          className="rounded-full px-3.5 py-1 text-[13px] text-wine-700 ring-1 ring-coral-300 transition-colors hover:bg-coral-50"
        >
          Resample noise
        </button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Trajectories sampled around an obstacle">
        <rect x={x0 - 6} y={8} width={x1 - x0 + 12} height={H - 16} rx={10} fill="var(--coral-50)" />
        <path d={path(1)} fill="none" stroke="var(--rule-strong)" strokeWidth={10} strokeLinecap="round" opacity={0.6} />
        <path d={path(-1)} fill="none" stroke="var(--rule-strong)" strokeWidth={10} strokeLinecap="round" opacity={0.6} />
        <rect x={(x0 + x1) / 2 - 34} y={yc - 34} width={68} height={68} rx={8} fill="var(--wine-800)" />
        <text x={(x0 + x1) / 2} y={yc + 52} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--wine-800)' }}>
          obstacle
        </text>
        {amp.map((a, i) => (
          <path
            key={i}
            d={path(a)}
            fill="none"
            stroke={collides(a) ? 'var(--coral-400)' : 'var(--wine-600)'}
            strokeWidth={1.8}
            opacity={0.75}
          />
        ))}
        <circle cx={x0} cy={yc} r={7} fill="var(--wine-700)" />
        <circle cx={x1} cy={yc} r={7} fill="none" stroke="var(--wine-700)" strokeWidth={2} />
        <text x={x0} y={yc + 26} textAnchor="middle" style={{ fontFamily: 'var(--font-body)', fontSize: 12, fill: 'var(--ink-muted)' }}>
          start
        </text>
        <text x={x1} y={yc + 26} textAnchor="middle" style={{ fontFamily: 'var(--font-body)', fontSize: 12, fill: 'var(--ink-muted)' }}>
          goal
        </text>
      </svg>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-[13px] text-muted">
        <span>
          {sampler === 'flow1'
            ? 'Every noise draw lands on the conditional mean, which passes through the obstacle.'
            : sampler === 'flow10'
              ? 'Integrating the flow over many steps recovers both modes.'
              : 'Drifting trains the single step itself to land on one mode or the other.'}
        </span>
        <span className="font-mono text-[11.5px] text-faint">
          {N} samples · {passes} network pass{passes > 1 ? 'es' : ''} each
        </span>
      </div>
    </div>
  );
}
