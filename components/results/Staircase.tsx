'use client';

import { useState } from 'react';
import { r2 } from '@/lib/num';
import { STAIRS_H100 } from '@/lib/data';

type Step = { label: string; detail: string; ms: number; relative?: boolean };

const CHAINS: Record<'m2' | 'h100', { title: string; steps: Step[]; note: string }> = {
  m2: {
    title: 'M2 Max laptop · OpenWAM-α',
    steps: [
      { label: 'Released', detail: 'ten-step sampler', ms: 2082 },
      { label: 'WINK', detail: 'one forward pass', ms: 442 },
      { label: '+ foveation', detail: '−20%: 412 → 328 ms on RoboCasa365', ms: 442 * (328 / 412), relative: true },
    ],
    note: 'On the laptop the pass is compute-bound: video-expert GEMMs account for 83% of inference latency, so fewer future-video rows translate directly into time.',
  },
  h100: {
    title: 'H100 · EasyWAM',
    steps: [
      { label: 'Released', detail: 'eleven evaluations, CUDA graphs', ms: STAIRS_H100.stock },
      { label: '+ deployment', detail: 'same optimizations on the released sampler', ms: STAIRS_H100.levers },
      { label: 'WINK', detail: 'one pass, same optimizations', ms: STAIRS_H100.wink },
    ],
    note: 'On the H100 the same deployment optimizations (two-stream video–action schedule, compiled kernels, fused attention) speed up both models; the remaining 7.9× comes from replacing eleven network evaluations with one.',
  },
};

export function Staircase() {
  const [which, setWhich] = useState<'m2' | 'h100'>('m2');
  const chain = CHAINS[which];
  const W = 760;
  const H = 300;
  const padL = 70;
  const padR = 30;
  const top = 30;
  const bot = 250;
  const max = chain.steps[0].ms * 1.1;
  const min = chain.steps[chain.steps.length - 1].ms * 0.6;
  const y = (v: number) => r2(top + ((Math.log10(max) - Math.log10(v)) / (Math.log10(max) - Math.log10(min))) * (bot - top));
  const n = chain.steps.length;
  const sw = (W - padL - padR) / n;
  const ticks = which === 'm2' ? [300, 500, 1000, 2000] : [15, 30, 100, 300];

  return (
    <div className="rounded-[var(--radius-lg)] bg-white p-5 ring-1 ring-rule">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="display text-[24px] leading-none text-wine-800">{chain.title}</p>
        <div className="inline-flex rounded-full bg-coral-50 p-1 ring-1 ring-rule">
          {(
            [
              ['m2', 'Laptop'],
              ['h100', 'Datacenter'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setWhich(id)}
              className={`rounded-full px-3.5 py-1 text-[13px] transition-colors ${
                which === id ? 'bg-wine-700 text-on-wine' : 'text-muted hover:text-wine-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={chain.title}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--rule)" />
            <text x={padL - 10} y={y(t) + 4} textAnchor="end" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'var(--ink-faint)' }}>
              {t >= 1000 ? `${t / 1000} s` : `${t} ms`}
            </text>
          </g>
        ))}
        {chain.steps.map((s, i) => {
          const x = padL + i * sw;
          const yy = y(s.ms);
          const prev = i > 0 ? chain.steps[i - 1] : null;
          const last = i === n - 1;
          return (
            <g key={s.label}>
              <rect
                x={x + 8}
                y={yy}
                width={sw - 16}
                height={bot - yy}
                rx={4}
                fill={i === 0 ? 'var(--coral-200)' : last ? 'var(--wine-700)' : 'var(--wine-500)'}
                opacity={s.relative ? 0.85 : 1}
                style={{ transition: 'y 600ms ease, height 600ms ease' }}
              />
              {prev && (
                <path
                  d={`M ${x - 8} ${y(prev.ms)} L ${x + 8} ${y(prev.ms)} L ${x + 8} ${yy}`}
                  fill="none"
                  stroke="var(--wine-400)"
                  strokeDasharray="3 3"
                />
              )}
              <text x={x + sw / 2} y={yy - 10} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fill: 'var(--wine-900)' }}>
                {s.relative ? '−20%' : s.ms >= 1000 ? `${(s.ms / 1000).toFixed(2)} s` : `${s.ms} ms`}
              </text>
              {prev && (
                <text x={x + sw / 2} y={yy + 20} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fill: 'var(--on-wine)' }}>
                  {(prev.ms / s.ms).toFixed(prev.ms / s.ms < 2 ? 2 : 1)}×
                </text>
              )}
              <text x={x + sw / 2} y={bot + 22} textAnchor="middle" style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, fill: 'var(--wine-800)' }}>
                {s.label}
              </text>
              <text x={x + sw / 2} y={bot + 40} textAnchor="middle" style={{ fontFamily: 'var(--font-body)', fontSize: 12, fill: 'var(--ink-muted)' }}>
                {s.detail}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-[13px] leading-[1.65] text-muted">{chain.note}</p>
    </div>
  );
}
