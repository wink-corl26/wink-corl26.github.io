'use client';

import { useEffect, useRef, useState } from 'react';
import { STREAMING_PLACEBO, STREAMING_TABLE } from '@/lib/data';

const DT = 50;
const SPAN = 8000;
const STRIDE = 16;
const D = 8;

type Mode = 'sync' | 'stream';
type Seg = { t0: number; t1: number; kind: 'move' | 'wait' | 'commit' | 'infer' };

const LATENCIES = [
  { id: 'wink', label: 'WINK, one pass', ms: 442 },
  { id: 'released', label: 'Released, ten steps', ms: 2082 },
] as const;

function schedule(mode: Mode, L: number) {
  const robot: Seg[] = [{ t0: 0, t1: L, kind: 'wait' }];
  const model: Seg[] = [{ t0: 0, t1: L, kind: 'infer' }];
  let t = L;
  while (t < SPAN) {
    if (mode === 'sync') {
      robot.push({ t0: t, t1: t + STRIDE * DT, kind: 'move' });
      t += STRIDE * DT;
      robot.push({ t0: t, t1: t + L, kind: 'wait' });
      model.push({ t0: t, t1: t + L, kind: 'infer' });
      t += L;
    } else {
      robot.push({ t0: t, t1: t + (STRIDE - D) * DT, kind: 'move' });
      t += (STRIDE - D) * DT;
      model.push({ t0: t, t1: t + L, kind: 'infer' });
      robot.push({ t0: t, t1: t + D * DT, kind: 'commit' });
      const extra = Math.max(L - D * DT, 0);
      t += D * DT;
      if (extra > 0) {
        robot.push({ t0: t, t1: t + extra, kind: 'wait' });
        t += extra;
      }
    }
  }
  return { robot, model };
}

function executed(segs: Seg[], time: number) {
  return segs.reduce((n, s) => (s.kind === 'move' || s.kind === 'commit' ? n + Math.max(0, Math.min(time, s.t1) - s.t0) / DT : n), 0);
}

const FILL: Record<Seg['kind'], string> = {
  move: 'var(--coral-300)',
  commit: 'var(--wine-600)',
  wait: 'url(#st-w)',
  infer: 'var(--wine-800)',
};

export function StreamingTimeline() {
  const [time, setTime] = useState(0);
  const [lat, setLat] = useState<(typeof LATENCIES)[number]['id']>('wink');
  const raf = useRef(0);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (reduce) {
        setTime(SPAN);
        return;
      }
      setTime((now - t0) % (SPAN + 1500));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);
  const L = LATENCIES.find((x) => x.id === lat)!.ms;
  const W = 1040;
  const x0 = 250;
  const x = (t: number) => x0 + (Math.min(t, SPAN) / SPAN) * (W - x0 - 20);
  const shown = Math.min(time, SPAN);
  const lanes = (['sync', 'stream'] as const).map((m) => ({ mode: m, ...schedule(m, L) }));
  const counts = lanes.map((l) => Math.floor(executed(l.robot, shown)));

  const bar = (segs: Seg[], y: number, h: number) =>
    segs
      .filter((s) => s.t0 < shown)
      .map((s, k) => (
        <rect key={k} x={x(s.t0)} y={y} width={Math.max(x(Math.min(s.t1, shown)) - x(s.t0), 0)} height={h} rx={s.kind === 'infer' ? 2 : 0} fill={FILL[s.kind]} />
      ));

  return (
    <div className="rounded-[var(--radius-lg)] bg-white p-5 ring-1 ring-rule">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-coral-50 p-1 ring-1 ring-rule">
          {LATENCIES.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setLat(o.id)}
              className={`rounded-full px-3.5 py-1 text-[13px] transition-colors ${lat === o.id ? 'bg-wine-700 text-on-wine' : 'text-muted hover:text-wine-700'}`}
            >
              {o.label} · {o.ms.toLocaleString('en-US')} ms
            </button>
          ))}
        </div>
        <span className="font-mono text-[11.5px] text-muted">
          same model and latency in both lanes · s = {STRIDE}, d = {D}, committed window {D * DT} ms
        </span>
      </div>
      <svg viewBox={`0 0 ${W} 236`} className="block h-auto w-full" role="img" aria-label="Robot and model timelines, synchronous versus streaming">
        <defs>
          <pattern id="st-w" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="white" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--wine-400)" strokeWidth="1.5" />
          </pattern>
        </defs>
        {lanes.map((l, i) => {
          const y = 22 + i * 96;
          return (
            <g key={l.mode}>
              <text x={0} y={y + 14} style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, fill: i ? 'var(--wine-700)' : 'var(--wine-900)' }}>
                {l.mode === 'sync' ? 'Synchronous' : 'Streaming'}
              </text>
              <text x={0} y={y + 32} style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, fill: 'var(--ink-muted)' }}>
                {l.mode === 'sync' ? 'robot stops for every pass' : 'pass overlaps committed actions'}
              </text>
              <text x={x0 - 10} y={y + 15} textAnchor="end" style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fill: 'var(--ink-faint)' }}>
                robot
              </text>
              <text x={x0 - 10} y={y + 41} textAnchor="end" style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fill: 'var(--ink-faint)' }}>
                model
              </text>
              <rect x={x0} y={y} width={W - x0 - 20} height={22} fill="var(--coral-50)" rx={3} />
              {bar(l.robot, y, 22)}
              {bar(l.model, y + 32, 12)}
              <text x={W - 20} y={y + 66} textAnchor="end" style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fill: 'var(--ink-muted)' }}>
                {counts[i]} control steps executed
                {i === 1 && counts[1] > counts[0] ? ` · +${counts[1] - counts[0]} ahead` : ''}
              </text>
            </g>
          );
        })}
        <line x1={x(shown)} x2={x(shown)} y1={14} y2={200} stroke="var(--wine-800)" strokeWidth={1} />
        <text x={x0} y={226} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-faint)' }}>
          0 s
        </text>
        <text x={W - 20} y={226} textAnchor="end" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-faint)' }}>
          {SPAN / 1000} s at 20 Hz
        </text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-muted">
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-4 translate-y-[1px] bg-coral-300" />
          executing
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-4 translate-y-[1px] bg-wine-600" />
          executing committed actions while the next pass runs
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-4 translate-y-[1px] ring-1 ring-wine-400" style={{ background: 'repeating-linear-gradient(45deg, white 0 3px, var(--wine-400) 3px 4.5px)' }} />
          waiting for inference
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2.5 w-4 translate-y-[1px] rounded-sm bg-wine-800" />
          forward pass
        </span>
      </div>
      <p className="mt-3 text-[12.5px] leading-[1.6] text-faint">
        Illustrative schedule using the M2 Max replanning latencies of OpenWAM-α in Table 2. Streaming hides the pass only when it fits in
        the committed window (L ≤ d Δt); a ten-step sampler still leaves the robot waiting.
      </p>
    </div>
  );
}

export function StreamingNumbers() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-[var(--radius-lg)] bg-white p-5 ring-1 ring-rule">
        <p className="mb-4 text-[13px] font-semibold text-wine-800">Success rate (%), OpenWAM-α, d = 8</p>
        <div className="space-y-4">
          {STREAMING_TABLE.rows.map((r) => {
            const lo = Math.min(...r.values) - 6;
            const hi = Math.max(...r.values) + 1;
            return (
              <div key={r.label}>
                <p className="mb-1.5 text-[13.5px] text-ink">{r.label}</p>
                {r.values.map((v, i) => (
                  <div key={i} className="grid grid-cols-[110px_minmax(0,1fr)_42px] items-center gap-3 py-[2px]">
                    <span className="text-[12px] text-muted">{STREAMING_TABLE.columns[i]}</span>
                    <div className="h-[10px] rounded-[2px] bg-coral-50">
                      <div
                        className="h-full rounded-[2px]"
                        style={{ width: `${((v - lo) / (hi - lo)) * 100}%`, background: i === 0 ? 'var(--coral-200)' : i === 1 ? 'var(--wine-500)' : 'var(--wine-700)' }}
                      />
                    </div>
                    <span className={`tnum text-right font-mono text-[12px] ${i === r.best ? 'font-semibold text-wine-800' : 'text-muted'}`}>{v.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-[12.5px] leading-[1.6] text-muted">Axes are zoomed per row. Prefix + TAEHV uses a faster current-frame encoder for laptop deployment.</p>
      </div>
      <div className="flex flex-col gap-6">
        <div className="rounded-[var(--radius-lg)] bg-white p-5 ring-1 ring-rule">
          <p className="mb-4 text-[13px] font-semibold text-wine-800">What the prefix contains, RoboCasa365</p>
          {STREAMING_PLACEBO.map((p, i) => (
            <div key={p.label} className="grid grid-cols-[130px_minmax(0,1fr)_42px] items-center gap-3 py-[3px]">
              <span className="text-[12.5px] text-muted">{p.label}</span>
              <div className="h-[10px] rounded-[2px] bg-coral-50">
                <div className="h-full rounded-[2px]" style={{ width: `${(p.value / 50) * 100}%`, background: i === 0 ? 'var(--wine-700)' : 'var(--coral-300)' }} />
              </div>
              <span className="tnum text-right font-mono text-[12px] text-muted">{p.value.toFixed(1)}</span>
            </div>
          ))}
          <p className="mt-4 text-[12.5px] leading-[1.6] text-muted">
            Replacing the committed actions with zero or stationary prefixes removes the gain: the model benefits from conditioning on
            the motion that is actually under way.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ['33.4 → 6.9 s', 'median LIBERO task time on the laptop'],
            ['81% → 10%', 'time spent waiting for inference'],
            ['≈ 20 Hz', 'closed-loop control on an M2 Max'],
          ].map(([big, small]) => (
            <div key={big} className="rounded-[var(--radius-md)] bg-wine-950 p-4 text-on-wine ring-1 ring-white/10">
              <p className="display text-[26px] leading-none">{big}</p>
              <p className="mt-2 text-[11.5px] leading-snug text-on-wine-muted">{small}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
