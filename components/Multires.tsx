'use client';

import { useEffect, useState } from 'react';
import { MULTIRES_TABLE } from '@/lib/data';
import { asset, MEDIA, type Overlay } from '@/lib/media';

const ROWS = 12;
const COLS = 10;

function Sprite({ src, frame, frames, aspect, children }: { src: string; frame: number; frames: number; aspect: number; children?: React.ReactNode }) {
  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-md)] bg-brand-950 ring-1 ring-rule"
      style={{
        aspectRatio: aspect,
        backgroundImage: `url(${asset(src)})`,
        backgroundSize: `${frames * 100}% 100%`,
        backgroundPosition: `${(frame / (frames - 1)) * 100}% 0`,
      }}
    >
      {children}
    </div>
  );
}

function FoveaOverlay({ blocks, show }: { blocks: number[]; show: boolean }) {
  const fine = new Set(blocks);
  return (
    <svg viewBox={`0 0 ${COLS} ${ROWS}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full transition-opacity duration-300" style={{ opacity: show ? 1 : 0 }}>
      {Array.from({ length: 30 }).map((_, b) => {
        const r = Math.floor(b / 5);
        const c = b % 5;
        const on = fine.has(b);
        return (
          <g key={b}>
            {!on && <rect x={c * 2} y={r * 2} width={2} height={2} fill="var(--brand-900)" opacity={0.42} />}
            <rect
              x={c * 2 + 0.03}
              y={r * 2 + 0.03}
              width={1.94}
              height={1.94}
              fill="none"
              stroke={on ? 'var(--tint-200)' : 'rgba(255,255,255,0.18)'}
              strokeWidth={on ? 0.08 : 0.03}
            />
            {on && (
              <>
                <line x1={c * 2 + 1} y1={r * 2} x2={c * 2 + 1} y2={r * 2 + 2} stroke="var(--tint-200)" strokeWidth={0.025} opacity={0.8} />
                <line x1={c * 2} y1={r * 2 + 1} x2={c * 2 + 2} y2={r * 2 + 1} stroke="var(--tint-200)" strokeWidth={0.025} opacity={0.8} />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function GateOverlay({ keep, show }: { keep: number[][]; show: boolean }) {
  return (
    <svg viewBox={`0 0 ${COLS} ${ROWS}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full transition-opacity duration-300" style={{ opacity: show ? 1 : 0 }}>
      <defs>
        <pattern id="mr-hatch" width="0.25" height="0.25" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="0.25" stroke="white" strokeWidth="0.05" opacity="0.55" />
        </pattern>
      </defs>
      {keep.map((row, r) =>
        row.map((k, c) =>
          k ? (
            <rect key={`${r}-${c}`} x={c + 0.04} y={r + 0.04} width={0.92} height={0.92} fill="none" stroke="var(--tint-200)" strokeWidth={0.05} />
          ) : (
            <g key={`${r}-${c}`}>
              <rect x={c} y={r} width={1} height={1} fill="var(--brand-900)" opacity={0.5} />
              <rect x={c} y={r} width={1} height={1} fill="url(#mr-hatch)" />
            </g>
          ),
        ),
      )}
    </svg>
  );
}

const START_STEPS = 16;

function OverlayView({ o }: { o: Overlay }) {
  const [frame, setFrame] = useState(Math.min(START_STEPS / 4, o.frames - 1));
  const [show, setShow] = useState(true);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setFrame((f) => (f >= o.frames - 1 ? 1 : f + 1)), 420);
    return () => window.clearInterval(id);
  }, [playing, o.frames]);
  const latent = frame <= 4 ? 0 : 1;
  const kept = o.keep[latent]?.flat().filter(Boolean).length ?? 0;

  const panels = [
    { key: 'recorded', label: 'Recorded', sub: 'ground truth', src: o.recorded, overlay: null },
    { key: 'dense', label: 'Dense', sub: '240 future rows', src: o.dense, overlay: null },
    { key: 'fovea', label: 'Action-guided foveation', sub: '132 future rows', src: o.fovea, overlay: <FoveaOverlay blocks={o.foveaBlocks} show={show && frame > 0} /> },
    {
      key: 'gated',
      label: 'Motion gating',
      sub: `${kept} of 120 tokens computed in this frame`,
      src: o.gated,
      overlay: o.keep.length ? <GateOverlay keep={o.keep[latent]} show={show && frame > 0} /> : null,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {panels.map((p) => (
          <figure key={p.key} className="min-w-0">
            <figcaption className="mb-2">
              <p className={`text-[14px] ${p.key === 'fovea' || p.key === 'gated' ? 'font-semibold text-brand-700' : 'text-ink'}`}>{p.label}</p>
              <p className="font-mono text-[10.5px] text-faint">{p.sub}</p>
            </figcaption>
            <Sprite src={p.src} frame={frame} frames={o.frames} aspect={o.aspect}>
              {p.overlay}
            </Sprite>
          </figure>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setPlaying((x) => !x)}
          aria-label={playing ? 'Pause' : 'Play'}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-700 text-on-brand transition-transform hover:scale-105"
        >
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <rect x="2" y="1.5" width="3" height="9" rx="0.8" fill="currentColor" />
              <rect x="7" y="1.5" width="3" height="9" rx="0.8" fill="currentColor" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path d="M3 1.5 L10.5 6 L3 10.5 Z" fill="currentColor" />
            </svg>
          )}
        </button>
        <input
          className="scrub min-w-[160px] flex-1"
          type="range"
          min={0}
          max={o.frames - 1}
          value={frame}
          aria-label="Predicted frame"
          style={{ ['--fill' as string]: `${(frame / (o.frames - 1)) * 100}%` }}
          onChange={(e) => {
            setPlaying(false);
            setFrame(Number(e.target.value));
          }}
        />
        <span className="tnum w-[96px] font-mono text-[12px] text-muted">{frame === 0 ? 'current frame' : `+${frame * 4} steps`}</span>
        <label className="flex items-center gap-2 text-[13px] text-muted">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="accent-[var(--brand-700)]" />
          Show token layout
        </label>
      </div>
    </div>
  );
}

export function MultiresViewer() {
  const list = MEDIA.overlays;
  const [idx, setIdx] = useState(0);
  if (!list.length) return null;
  const o = list[Math.min(idx, list.length - 1)];
  return (
    <div>
      {list.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {list.map((x, i) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setIdx(i)}
              className={`max-w-[280px] truncate rounded-full px-3 py-1 text-[12.5px] ring-1 transition-colors ${
                i === idx ? 'bg-tint-100 text-brand-800 ring-tint-300' : 'bg-white text-muted ring-rule hover:text-brand-700'
              }`}
            >
              {x.title}
            </button>
          ))}
        </div>
      )}
      <OverlayView key={o.id} o={o} />
      <p className="mt-4 text-[13px] leading-[1.65] text-muted">
        One RoboCasa365 observation, the same noise for every model. In the foveated model, outlined blocks keep four fine tokens and
        shaded blocks are a single coarse token. In the gated model, hatched tokens are not computed and are filled from a held-still
        prediction of the current frame.
      </p>
    </div>
  );
}

export function MultiresTable() {
  const maxMs = Math.max(...MULTIRES_TABLE.map((r) => r.m2));
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] bg-white ring-1 ring-rule">
      <table className="w-full min-w-[560px] text-left text-[13.5px]">
        <thead>
          <tr className="border-b border-rule text-muted">
            <th className="px-5 py-3 font-normal">Method</th>
            <th className="px-3 py-3 text-right font-normal">Tokens</th>
            <th className="px-3 py-3 text-right font-normal">ΔSR vs dense (pp)</th>
            <th className="px-5 py-3 font-normal">M2 Max latency</th>
          </tr>
        </thead>
        <tbody>
          {MULTIRES_TABLE.map((r) => {
            const ours = r.method === 'Learned fovea' || r.method === 'Motion gating';
            return (
              <tr key={r.method} className="border-b border-rule last:border-0">
                <td className={`px-5 py-3 ${ours ? 'font-semibold text-brand-700' : 'text-ink'}`}>{r.method}</td>
                <td className="tnum px-3 py-3 text-right font-mono text-[12.5px] text-muted">{r.tokens}</td>
                <td className={`tnum px-3 py-3 text-right font-mono text-[12.5px] ${r.method === 'Learned fovea' ? 'font-semibold text-brand-800' : 'text-muted'}`}>
                  {r.dsr === 0 ? '0.0' : `${r.dsr.toFixed(1)} ± ${r.se?.toFixed(1)}`}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[10px] flex-1 rounded-[2px] bg-tint-50">
                      <div
                        className="h-full rounded-[2px]"
                        style={{ width: `${(r.m2 / maxMs) * 100}%`, background: ours ? 'var(--brand-700)' : r.method === 'Dense' ? 'var(--tint-300)' : 'var(--tint-200)' }}
                      />
                    </div>
                    <span className="tnum w-[52px] text-right font-mono text-[12.5px] text-muted">{r.m2} ms</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
