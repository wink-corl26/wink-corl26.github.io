'use client';

import { useState } from 'react';
import { r2 } from '@/lib/num';
import { DEVICES, LATENCY, type Device } from '@/lib/data';

type Measure = 'action' | 'joint' | 'task';

const MEASURES: { id: Measure; label: string; unit: string; note: string }[] = [
  { id: 'action', label: 'Action-only', unit: 'ms', note: 'Median replanning latency, host-resident observations to executable actions.' },
  { id: 'joint', label: 'With future video', unit: 'ms', note: 'Median replanning latency including future-video decoding.' },
  { id: 'task', label: 'Task completion', unit: 's', note: 'Median LIBERO task completion time over successful episodes at 20 Hz.' },
];

function fmt(v: number, unit: string) {
  if (unit === 's') return `${v.toFixed(1)} s`;
  return v >= 1000 ? `${(v / 1000).toFixed(2)} s` : `${v >= 100 ? Math.round(v) : v.toFixed(1)} ms`;
}

export function LatencyLadder() {
  const [device, setDevice] = useState<Device>('h100');
  const [measure, setMeasure] = useState<Measure>('action');
  const m = MEASURES.find((x) => x.id === measure)!;

  const rows = LATENCY.map((r) => {
    const rel = measure === 'task' ? r.task.released[device] : r.released[device][measure];
    const ours = r.wink ? (measure === 'task' ? r.task.wink?.[device] ?? null : r.wink[device][measure]) : null;
    const streaming = measure === 'task' ? r.task.winkStreaming?.[device] ?? false : false;
    return { model: r.model, rel, ours, streaming };
  });
  const vals = rows.flatMap((r) => [r.rel, r.ours]).filter((v): v is number => v !== null && v > 0);
  const lo = Math.log10(Math.min(...vals) * 0.6);
  const hi = Math.log10(Math.max(...vals) * 1.15);
  const pos = (v: number) => r2(((Math.log10(v) - lo) / (hi - lo)) * 100);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-rule">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDevice(d.id)}
              className={`rounded-full px-4 py-1.5 text-[13.5px] transition-colors ${
                device === d.id ? 'bg-wine-700 text-on-wine' : 'text-muted hover:text-wine-700'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-rule">
          {MEASURES.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setMeasure(x.id)}
              className={`rounded-full px-3 py-1 text-[12.5px] transition-colors ${
                measure === x.id ? 'bg-coral-100 text-wine-800' : 'text-muted hover:text-wine-700'
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>
        <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
          {DEVICES.find((d) => d.id === device)!.kind} · log scale
        </span>
      </div>
      <div className="space-y-6">
        {rows.map((r) => (
          <div key={r.model} className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)_72px] sm:items-center sm:gap-5">
            <p className="display text-[24px] leading-none text-wine-800">{r.model}</p>
            <div className="space-y-1.5">
              {(
                [
                  ['Released', r.rel, false],
                  ['WINK', r.ours, true],
                ] as const
              ).map(([label, v, ours]) => (
                <div key={label} className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3">
                  <span className={`text-[12.5px] ${ours ? 'font-semibold text-wine-700' : 'text-muted'}`}>{label}</span>
                  {v === null ? (
                    <span className="font-mono text-[11.5px] text-faint">{ours ? 'not adapted' : 'no video at inference'}</span>
                  ) : (
                    <div className="relative h-[18px]">
                      <div
                        className="absolute inset-y-0 left-0 rounded-[3px] transition-[width] duration-700 ease-out"
                        style={{ width: `${pos(v)}%`, background: ours ? 'var(--wine-700)' : 'var(--coral-200)' }}
                      />
                      <span
                        className={`tnum absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[11.5px] transition-[left] duration-700 ease-out ${
                          pos(v) > 72 ? `-translate-x-full pr-2 ${ours ? 'text-on-wine' : 'text-wine-900'}` : 'pl-2 text-ink'
                        }`}
                        style={{ left: `${pos(v)}%` }}
                      >
                        {fmt(v, m.unit)}
                        {ours && measure === 'task' && !r.streaming && <span className="text-faint"> · no streaming</span>}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="tnum text-left font-mono text-[15px] text-wine-700 sm:text-right">
              {r.rel && r.ours ? `${(r.rel / r.ours).toFixed(1)}×` : ''}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-7 text-[13px] leading-[1.65] text-muted">
        {m.note} Released models run their default multi-step samplers; the same inference optimizations, including CUDA graphs where
        supported, are applied to each baseline and its adapted counterpart.
        {measure === 'task' && ' WINK task times use streaming with d = 8 unless marked; released models are synchronous. InternW0-Δ task times are on LIBERO-Plus.'}
        {device !== 'm2' && measure !== 'task' &&
          ' On the H100 and A10, released and adapted models share the same deployment optimizations (compiled kernels, a two-stream video–action schedule and fused attention where they apply); released success rates were measured without them.'}
        {device === 'a10' && measure !== 'task' && ' The A10 has no fp8 support, so OpenWAM-α runs in bf16 there.'}
      </p>
    </div>
  );
}
