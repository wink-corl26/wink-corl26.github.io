'use client';

import { useState } from 'react';
import { ARMS, MAIN_TABLE } from '@/lib/data';

type Metric = 'fvd' | 'sr';

export function MainResults() {
  const [metric, setMetric] = useState<Metric>('fvd');
  const maxFvd = Math.max(...MAIN_TABLE.flatMap((r) => Object.values(r.fvd)));
  return (
    <div>
      <div className="mb-6 inline-flex rounded-full bg-white p-1 ring-1 ring-rule">
        {(
          [
            ['fvd', 'Video fidelity · FVD ↓'],
            ['sr', 'Task success · SR ↑'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMetric(id)}
            className={`rounded-full px-4 py-1.5 text-[13.5px] transition-colors ${
              metric === id ? 'bg-brand-700 text-on-brand' : 'text-muted hover:text-brand-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-7">
        {MAIN_TABLE.map((row) => {
          const vals = metric === 'fvd' ? row.fvd : row.sr;
          const lo = metric === 'sr' ? Math.min(...Object.values(row.sr)) - 2 : 0;
          const hi = metric === 'sr' ? Math.max(...Object.values(row.sr)) + 0.5 : maxFvd;
          const best =
            metric === 'fvd'
              ? Math.min(row.fvd.flow1, row.fvd.flowft, row.fvd.wink)
              : Math.max(row.sr.flow1, row.sr.flowft, row.sr.wink);
          return (
            <div key={`${row.benchmark}-${row.base}`} className="grid gap-3 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-6">
              <div>
                <p className="display text-[26px] leading-none text-brand-800">{row.benchmark}</p>
                <p className="mt-1 text-[13px] text-muted">
                  {row.base}
                  {row.dagger && <sup className="ml-0.5 text-brand-500">†</sup>}
                </p>
              </div>
              <div className="space-y-1.5">
                {ARMS.map((a) => {
                  const v = vals[a.id];
                  const frac = Math.max((v - lo) / (hi - lo), 0.004);
                  const isWink = a.id === 'wink';
                  const bold = a.id !== 'flow10' && v === best;
                  return (
                    <div key={a.id} className="grid grid-cols-[86px_minmax(0,1fr)_56px] items-center gap-3">
                      <span className={`text-[13px] ${isWink ? 'font-semibold text-brand-700' : 'text-muted'}`}>{a.label}</span>
                      <div className="relative h-[14px] rounded-[3px] bg-tint-50">
                        <div
                          className="absolute inset-y-0 left-0 rounded-[3px] transition-[width] duration-700 ease-out"
                          style={{
                            width: `${frac * 100}%`,
                            background: isWink ? 'var(--brand-700)' : a.id === 'flow10' ? 'var(--tint-300)' : 'var(--tint-200)',
                          }}
                        />
                      </div>
                      <span className={`tnum text-right font-mono text-[12.5px] ${bold ? 'font-semibold text-brand-800' : 'text-muted'}`}>
                        {metric === 'sr' ? v.toFixed(2) : v.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-7 text-[13px] leading-[1.65] text-muted">
        Flow denotes the released multi-step sampler; Flow-1 uses one step, and Flow FT is a budget-matched one-step fine-tune.
        {metric === 'sr' && ' Success axes are zoomed to the range of each row.'} <sup className="text-brand-500">†</sup>InternW0-Δ uses video
        drifting with one-step flow supervision for actions; its FVD is measured on LIBERO.
      </p>
    </div>
  );
}
