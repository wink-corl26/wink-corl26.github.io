'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ARMS, type ArmId } from '@/lib/data';
import { asset, BENCHES, MEDIA, type Bench, type Episode, type WindowClip } from '@/lib/media';

type Mode = 'loop' | 'state';

function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = 'md',
}: {
  value: T;
  options: { id: T; label: string; disabled?: boolean }[];
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-rule" role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          role="tab"
          type="button"
          disabled={o.disabled}
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full transition-colors disabled:opacity-35 ${size === 'sm' ? 'px-3 py-1 text-[12.5px]' : 'px-4 py-1.5 text-[14px]'} ${
            value === o.id ? 'bg-brand-700 text-on-brand' : 'text-muted hover:text-brand-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PlayButton({ playing, onClick }: { playing: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
  );
}

function Badge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
        ok ? 'bg-tint-100 text-brand-700' : 'bg-white text-faint ring-1 ring-rule'
      }`}
    >
      {ok ? 'success' : 'failure'}
    </span>
  );
}

function EpisodeView({ ep }: { ep: Episode }) {
  const arms = ARMS.filter((a) => ep.arms[a.id]);
  const refs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const clock = useRef<{ start: number; from: number } | null>(null);
  const raf = useRef(0);
  const duration = useMemo(() => Math.max(...arms.map((a) => (ep.arms[a.id]!.frames - 1) / ep.fps)), [arms, ep]);

  const all = useCallback(() => Object.values(refs.current).filter(Boolean) as HTMLVideoElement[], []);

  const seek = useCallback(
    (time: number) => {
      for (const v of all()) {
        const d = Number.isFinite(v.duration) ? v.duration : duration;
        v.currentTime = Math.min(time, Math.max(d - 0.04, 0));
      }
    },
    [all, duration],
  );

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    clock.current = null;
    for (const v of all()) v.pause();
    setPlaying(false);
  }, [all]);

  const start = useCallback(
    (from: number) => {
      const begin = from >= duration - 0.05 ? 0 : from;
      seek(begin);
      clock.current = { start: performance.now(), from: begin };
      for (const v of all()) v.play().catch(() => {});
      setPlaying(true);
      let lastSync = 0;
      const tick = (now: number) => {
        if (!clock.current) return;
        const time = clock.current.from + (now - clock.current.start) / 1000;
        if (time >= duration) {
          setT(duration);
          stop();
          return;
        }
        setT(time);
        if (now - lastSync > 400) {
          lastSync = now;
          for (const v of all()) {
            const d = Number.isFinite(v.duration) ? v.duration : duration;
            if (time >= d - 0.05) {
              if (!v.paused) v.pause();
            } else if (Math.abs(v.currentTime - time) > 0.12) {
              v.currentTime = time;
            }
          }
        }
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    },
    [all, duration, seek, stop],
  );

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const fill = duration > 0 ? (t / duration) * 100 : 0;

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-x-4">
        {arms.map((a) => {
          const clip = ep.arms[a.id]!;
          const isWink = a.id === 'wink';
          return (
            <figure key={a.id} className="min-w-0">
              <figcaption className="mb-2 flex items-baseline justify-between gap-2">
                <span className={`text-[14px] ${isWink ? 'font-semibold text-brand-700' : 'text-ink'}`}>
                  {a.label}
                  <span className="ml-1.5 font-mono text-[10.5px] text-faint">{a.passes}</span>
                </span>
                <Badge ok={clip.success} />
              </figcaption>
              <div className={`overflow-hidden rounded-[var(--radius-md)] ring-1 ${isWink ? 'ring-brand-500' : 'ring-rule'}`}>
                <div className="relative bg-brand-950" style={{ aspectRatio: ep.aspect }}>
                  <video
                    ref={(el) => {
                      refs.current[`${a.id}-i`] = el;
                    }}
                    src={asset(clip.imagined)}
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-sm bg-brand-950/70 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-tint-100">
                    imagined
                  </span>
                </div>
                <div className="relative border-t border-white/40 bg-brand-950" style={{ aspectRatio: ep.aspect }}>
                  <video
                    ref={(el) => {
                      refs.current[`${a.id}-r`] = el;
                    }}
                    src={asset(clip.real)}
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-sm bg-white/80 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-brand-800">
                    executed
                  </span>
                </div>
              </div>
            </figure>
          );
        })}
      </div>
      <div className="mt-6 flex items-center gap-4">
        <PlayButton playing={playing} onClick={() => (playing ? stop() : start(t))} />
        <input
          className="scrub"
          type="range"
          min={0}
          max={duration}
          step={0.01}
          value={t}
          aria-label="Episode time"
          style={{ ['--fill' as string]: `${fill}%` }}
          onChange={(e) => {
            stop();
            const v = Number(e.target.value);
            setT(v);
            seek(v);
          }}
        />
        <span className="tnum w-[64px] shrink-0 text-right font-mono text-[12px] text-muted">{t.toFixed(1)} s</span>
      </div>
    </div>
  );
}

const WINDOW_COLUMNS: { id: ArmId | 'recorded'; label: string; passes: string }[] = [
  { id: 'recorded', label: 'Recorded', passes: 'ground truth' },
  ...ARMS.map((a) => ({ id: a.id, label: a.label, passes: a.passes })),
];

const ROBOCASA_START_STEPS = 16;

function WindowView({ w }: { w: WindowClip }) {
  const [k, setK] = useState(w.bench === 'robocasa' ? Math.round((ROBOCASA_START_STEPS * (w.frames - 1)) / 32) : w.frames - 1);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setK((x) => (x + 1) % w.frames), 380);
    return () => window.clearInterval(id);
  }, [playing, w.frames]);
  const cols = WINDOW_COLUMNS.filter((c) => w.columns[c.id]);
  const steps = 32 / (w.frames - 1);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
        {cols.map((c) => (
          <figure key={c.id} className="min-w-0">
            <figcaption className="mb-2 text-[14px]">
              <span className={c.id === 'wink' ? 'font-semibold text-brand-700' : c.id === 'recorded' ? 'text-muted' : 'text-ink'}>{c.label}</span>
              <span className="ml-1.5 font-mono text-[10.5px] text-faint">{c.passes}</span>
            </figcaption>
            <div
              className={`overflow-hidden rounded-[var(--radius-md)] bg-brand-950 ring-1 ${c.id === 'wink' ? 'ring-brand-500' : 'ring-rule'}`}
              style={{
                aspectRatio: w.aspect,
                backgroundImage: `url(${asset(w.columns[c.id]!)})`,
                backgroundSize: `${w.frames * 100}% 100%`,
                backgroundPosition: `${(k / (w.frames - 1)) * 100}% 0`,
              }}
              role="img"
              aria-label={`${c.label}, frame ${k}`}
            />
          </figure>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-4">
        <PlayButton playing={playing} onClick={() => setPlaying((p) => !p)} />
        <input
          className="scrub"
          type="range"
          min={0}
          max={w.frames - 1}
          step={1}
          value={k}
          aria-label="Prediction horizon"
          style={{ ['--fill' as string]: `${(k / (w.frames - 1)) * 100}%` }}
          onChange={(e) => {
            setPlaying(false);
            setK(Number(e.target.value));
          }}
        />
        <span className="tnum w-[130px] shrink-0 whitespace-nowrap text-right font-mono text-[12px] text-muted">
          +{Math.round(k * steps)} steps · {((k * steps) / 20).toFixed(1)} s
        </span>
      </div>
    </div>
  );
}

export function Imagination() {
  const [bench, setBench] = useState<Bench>('robocasa');
  const [mode, setMode] = useState<Mode>('loop');
  const episodes = useMemo(() => MEDIA.episodes.filter((e) => e.bench === bench), [bench]);
  const windows = useMemo(() => MEDIA.windows.filter((w) => w.bench === bench), [bench]);
  const effective: Mode = mode === 'loop' && episodes.length === 0 ? 'state' : mode === 'state' && windows.length === 0 ? 'loop' : mode;
  const list = effective === 'loop' ? episodes : windows;
  const [idx, setIdx] = useState(0);
  const item = list[Math.min(idx, list.length - 1)];
  const benchInfo = BENCHES.find((b) => b.id === bench)!;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={bench}
          onChange={(b) => {
            setBench(b);
            setIdx(0);
          }}
          options={BENCHES.map((b) => ({
            id: b.id,
            label: b.label,
            disabled: !MEDIA.episodes.some((e) => e.bench === b.id) && !MEDIA.windows.some((w) => w.bench === b.id),
          }))}
        />
        <Segmented
          size="sm"
          value={effective}
          onChange={(m) => {
            setMode(m);
            setIdx(0);
          }}
          options={[
            { id: 'loop', label: 'Closed loop', disabled: episodes.length === 0 },
            { id: 'state', label: 'One state, 1.6 s ahead', disabled: windows.length === 0 },
          ]}
        />
      </div>
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
      {item && (
        <>
          {effective === 'loop' ? <EpisodeView key={item.id} ep={item as Episode} /> : <WindowView key={item.id} w={item as WindowClip} />}
          <p className="mt-4 text-[13px] leading-[1.65] text-muted">
            {effective === 'loop' ? (
              <>
                {benchInfo.base} on {benchInfo.label}. Each model drives its own episode from the same initial state; the imagined row
                shows, at every instant, the frame the model predicted for that instant at its most recent replan.
              </>
            ) : (
              <>
                {benchInfo.base} on {benchInfo.label}. All models see the same observation and the same noise; frames span the
                predicted 32 control steps.
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}
