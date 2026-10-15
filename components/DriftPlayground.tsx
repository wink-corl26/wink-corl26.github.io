'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { r2 } from '@/lib/num';

type P = { x: number; y: number };

const W = 560;
const H = 320;

const START: P[] = [
  { x: 120, y: 90 },
  { x: 150, y: 210 },
  { x: 210, y: 150 },
  { x: 100, y: 260 },
  { x: 250, y: 70 },
  { x: 200, y: 250 },
];

function cloud(cx: number, cy: number): P[] {
  return Array.from({ length: 8 }, (_, k) => {
    const a = (2 * Math.PI * k) / 8;
    const r = 18 + 6 * (k % 2);
    return { x: r2(cx + r * Math.cos(a)), y: r2(cy + r * Math.sin(a)) };
  });
}

const DATA: Record<1 | 2, P[]> = {
  1: cloud(430, 160),
  2: [...cloud(440, 82), ...cloud(440, 238)],
};

function field(u: P[], pos: P[], tau: number) {
  const dist = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y);
  const all: number[] = [];
  u.forEach((ui, i) => {
    pos.forEach((y) => all.push(dist(ui, y)));
    u.forEach((uj, j) => j !== i && all.push(dist(ui, uj)));
  });
  const s = all.reduce((acc, d) => acc + d, 0) / Math.max(all.length, 1) || 1;
  return u.map((ui, i) => {
    const targets = [...pos.map((y) => ({ y, sign: 1 })), ...u.filter((_, j) => j !== i).map((y) => ({ y, sign: -1 }))];
    const logits = targets.map((t) => -dist(ui, t.y) / (s * tau));
    const m = Math.max(...logits);
    const e = logits.map((l) => Math.exp(l - m));
    const z = e.reduce((acc, v) => acc + v, 0);
    const attract = { x: 0, y: 0 };
    const repel = { x: 0, y: 0 };
    targets.forEach((t, k) => {
      const w = e[k] / z;
      const into = t.sign > 0 ? attract : repel;
      into.x += t.sign * w * (t.y.x - ui.x);
      into.y += t.sign * w * (t.y.y - ui.y);
    });
    return { attract, repel };
  });
}

export function DriftPlayground() {
  const [u, setU] = useState<P[]>(START);
  const [modes, setModes] = useState<1 | 2>(2);
  const [tau, setTau] = useState(0.3);
  const [running, setRunning] = useState(false);
  const [tried, setTried] = useState(false);
  const drag = useRef<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const pos = DATA[modes];
  const V = useMemo(() => field(u, pos, tau), [u, pos, tau]);

  const step = useCallback(() => {
    setU((cur) => {
      const f = field(cur, pos, tau);
      return cur.map((p, i) => ({
        x: Math.min(W - 12, Math.max(12, p.x + 0.3 * (f[i].attract.x + f[i].repel.x))),
        y: Math.min(H - 12, Math.max(12, p.y + 0.3 * (f[i].attract.y + f[i].repel.y))),
      }));
    });
  }, [pos, tau]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(step, 60);
    return () => window.clearInterval(id);
  }, [running, step]);

  const toLocal = (e: React.PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const arrow = (from: P, d: P, color: string, id: string, scale: number) => {
    const len = Math.hypot(d.x, d.y) * scale;
    if (len < 2) return null;
    const k = Math.min(len, 70) / Math.hypot(d.x, d.y);
    return <line key={id} x1={r2(from.x)} y1={r2(from.y)} x2={r2(from.x + d.x * k)} y2={r2(from.y + d.y * k)} stroke={color} strokeWidth={1.6} markerEnd={`url(#dp-${color === 'var(--wine-600)' ? 'a' : 'r'})`} />;
  };

  return (
    <div className="rounded-[var(--radius-lg)] bg-white p-5 ring-1 ring-rule">
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-[13px]">
        <div className="inline-flex rounded-full bg-coral-50 p-1 ring-1 ring-rule">
          {([1, 2] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModes(m)}
              className={`rounded-full px-3.5 py-1 transition-colors ${modes === m ? 'bg-wine-700 text-on-wine' : 'text-muted hover:text-wine-700'}`}
            >
              {m === 1 ? 'One cluster of data' : 'Two clusters of data'}
            </button>
          ))}
        </div>
        <label className="flex min-w-[200px] flex-1 items-center gap-3 text-muted">
          <span className="shrink-0">temperature τ = {tau.toFixed(2)}</span>
          <input
            className="scrub"
            type="range"
            min={0.05}
            max={1}
            step={0.01}
            value={tau}
            onChange={(e) => setTau(Number(e.target.value))}
            style={{ ['--fill' as string]: `${((tau - 0.05) / 0.95) * 100}%` }}
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setTried(true);
              setRunning((r) => !r);
            }}
            className={`rounded-full bg-wine-700 px-4 py-1 text-on-wine transition-transform hover:scale-[1.03] ${tried ? '' : 'nudge'}`}
          >
            {running ? 'Pause' : 'Train'}
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setU(START.map((p) => ({ ...p })));
            }}
            className="rounded-full px-4 py-1 text-wine-700 ring-1 ring-coral-300 hover:bg-coral-50"
          >
            Reset
          </button>
        </div>
        {!tried && <span className="text-[12.5px] italic text-wine-500">Press Train to watch the particles drift.</span>}
      </div>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full touch-none select-none"
        onPointerMove={(e) => {
          if (drag.current === null) return;
          const p = toLocal(e);
          setU((cur) => cur.map((q, i) => (i === drag.current ? p : q)));
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
        role="img"
        aria-label="Particles moved by the drifting field"
      >
        <defs>
          <marker id="dp-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--wine-600)" />
          </marker>
          <marker id="dp-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--coral-400)" />
          </marker>
        </defs>
        <rect x={0} y={0} width={W} height={H} rx={10} fill="var(--coral-50)" />
        {pos.map((p, k) => (
          <g key={k}>
            <path
              d={Array.from({ length: 10 })
                .map((_, i) => {
                  const a = (Math.PI / 5) * i - Math.PI / 2;
                  const r = i % 2 === 0 ? 6 : 2.6;
                  return `${i === 0 ? 'M' : 'L'} ${r2(p.x + r * Math.cos(a))} ${r2(p.y + r * Math.sin(a))}`;
                })
                .join(' ') + ' Z'}
              fill="var(--wine-700)"
            />
          </g>
        ))}
        {u.map((p, i) => (
          <g key={i}>
            {arrow(p, V[i].attract, 'var(--wine-600)', `a${i}`, 0.6)}
            {arrow(p, V[i].repel, 'var(--coral-400)', `r${i}`, 0.6)}
            <circle
              cx={r2(p.x)}
              cy={r2(p.y)}
              r={8}
              fill="var(--wine-900)"
              stroke="white"
              strokeWidth={2}
              style={{ cursor: 'grab' }}
              onPointerDown={(e) => {
                (e.target as Element).setPointerCapture?.(e.pointerId);
                drag.current = i;
                setRunning(false);
              }}
            />
          </g>
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-muted">
        <span>
          <span className="mr-1.5 inline-block h-0.5 w-4 translate-y-[-3px] bg-wine-600" />
          Attraction to data
        </span>
        <span>
          <span className="mr-1.5 inline-block h-0.5 w-4 translate-y-[-3px] bg-coral-400" />
          Repulsion from other particles
        </span>
        <span className="text-faint">
          Drag the particles. Stars are samples of the data distribution; each particle is attracted to them and repelled by the
          other particles under one softmax kernel. In WINK each condition contributes a single recorded sample per field.
        </span>
      </div>
    </div>
  );
}
