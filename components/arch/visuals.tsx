'use client';

import { useState } from 'react';
import { r2 } from '@/lib/num';

const C = {
  vid: 'var(--wine-600)',
  vidSoft: 'var(--coral-100)',
  act: 'var(--coral-400)',
  actSoft: 'var(--coral-200)',
  dino: 'var(--wine-800)',
  ink: 'var(--wine-900)',
  soft: 'var(--ink-muted)',
  faint: 'var(--ink-faint)',
  rule: 'var(--rule-strong)',
  paper: 'var(--paper)',
};

const label = { fontFamily: 'var(--font-body)', fontSize: 11, fill: C.soft } as const;
const labelInk = { ...label, fill: C.ink } as const;
const mono = { fontFamily: 'var(--font-mono)', fontSize: 10, fill: C.soft } as const;

function Frame({ children, h = 190 }: { children: React.ReactNode; h?: number }) {
  return (
    <svg viewBox={`0 0 360 ${h}`} className="block h-auto w-full" role="img" aria-hidden>
      {children}
    </svg>
  );
}

function Pill<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="mb-3 inline-flex rounded-full bg-coral-50 p-0.5 ring-1 ring-rule">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-full px-3 py-1 text-[11.5px] transition-colors ${
            value === o.id ? 'bg-wine-700 text-on-wine' : 'text-muted hover:text-wine-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function TokenLayout({ highlight }: { highlight?: 'future' | 'action' | 'video' }) {
  const cell = 9;
  const frames = [
    { x: 14, label: 'current', kind: 'clean' },
    { x: 104, label: 'future 1', kind: 'noise' },
    { x: 194, label: 'future 2', kind: 'noise' },
  ];
  const dimVideo = highlight === 'action';
  const dimAction = highlight === 'future' || highlight === 'video';
  return (
    <Frame h={176}>
      <defs>
        <pattern id="tl-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4" height="4" fill={C.paper} />
          <line x1="0" y1="0" x2="0" y2="4" stroke={C.vid} strokeWidth="1.2" opacity="0.55" />
        </pattern>
        <pattern id="tl-hatch-a" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4" height="4" fill={C.paper} />
          <line x1="0" y1="0" x2="0" y2="4" stroke={C.act} strokeWidth="1.2" />
        </pattern>
      </defs>
      <g opacity={dimVideo ? 0.3 : 1}>
        {frames.map((f) => (
          <g key={f.label} opacity={highlight === 'future' && f.kind === 'clean' ? 0.35 : 1}>
            {Array.from({ length: 7 }).map((_, r) =>
              Array.from({ length: 8 }).map((__, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={f.x + c * cell}
                  y={14 + r * cell}
                  width={cell - 1.5}
                  height={cell - 1.5}
                  fill={f.kind === 'clean' ? C.vid : 'url(#tl-hatch)'}
                  stroke={C.vid}
                  strokeWidth={0.4}
                  opacity={f.kind === 'clean' ? 0.85 : 1}
                />
              )),
            )}
            <text x={f.x} y={90} style={label}>
              {f.label}
            </text>
          </g>
        ))}
        <text x={290} y={42} style={mono}>
          ×2 cameras
        </text>
        <text x={290} y={56} style={mono}>
          16 ch latents
        </text>
      </g>
      <g opacity={dimAction ? 0.3 : 1}>
        {Array.from({ length: 33 }).map((_, i) => (
          <rect
            key={i}
            x={14 + i * 10}
            y={116}
            width={8.5}
            height={14}
            fill={i === 0 ? C.act : 'url(#tl-hatch-a)'}
            stroke={C.act}
            strokeWidth={0.5}
          />
        ))}
        <text x={14} y={146} style={label}>
          state token + 32 action tokens (7-D)
        </text>
      </g>
      <text x={14} y={168} style={mono}>
        EasyWAM, LIBERO: 3 × 392 video + 33 action = 1,209 tokens
      </text>
    </Frame>
  );
}

type Backbone = 'easywam' | 'openwam' | 'internw0';
const MASKS: Record<Backbone, { vv: boolean; va: boolean; av: boolean; aa: boolean; note: string }> = {
  easywam: { vv: true, va: false, av: true, aa: true, note: 'Video rows never read action tokens: p(v | c) · p(a | v, c).' },
  openwam: { vv: true, va: true, av: true, aa: true, note: 'Mutual attention: committed actions can shape the imagined future.' },
  internw0: { vv: true, va: false, av: false, aa: true, note: 'Streams kept apart; actions read clean context and imprint tokens.' },
};

export function AttentionMask() {
  const [b, setB] = useState<Backbone>('easywam');
  const m = MASKS[b];
  const cells = [
    { r: 0, c: 0, on: m.vv },
    { r: 0, c: 1, on: m.va },
    { r: 1, c: 0, on: m.av },
    { r: 1, c: 1, on: m.aa },
  ];
  const size = 62;
  const ox = 120;
  const oy = 26;
  return (
    <div>
      <Pill
        value={b}
        onChange={setB}
        options={[
          { id: 'easywam', label: 'EasyWAM' },
          { id: 'openwam', label: 'OpenWAM-α' },
          { id: 'internw0', label: 'InternW0-Δ' },
        ]}
      />
      <Frame h={176}>
        <text x={ox + size / 2} y={18} textAnchor="middle" style={label}>
          video keys
        </text>
        <text x={ox + size * 1.5} y={18} textAnchor="middle" style={label}>
          action keys
        </text>
        <text x={ox - 10} y={oy + size / 2 + 4} textAnchor="end" style={label}>
          video queries
        </text>
        <text x={ox - 10} y={oy + size * 1.5 + 4} textAnchor="end" style={label}>
          action queries
        </text>
        {cells.map((cl) => (
          <g key={`${cl.r}${cl.c}`}>
            <rect
              x={ox + cl.c * size + 2}
              y={oy + cl.r * size + 2}
              width={size - 4}
              height={size - 4}
              rx={4}
              fill={cl.on ? (cl.r === 0 ? C.vid : C.act) : C.paper}
              stroke={cl.on ? 'none' : C.rule}
              strokeDasharray={cl.on ? undefined : '3 3'}
              style={{ transition: 'fill 240ms ease' }}
            />
            <text
              x={ox + cl.c * size + size / 2}
              y={oy + cl.r * size + size / 2 + 4}
              textAnchor="middle"
              style={{ ...label, fill: cl.on ? 'var(--on-wine)' : C.faint, fontSize: 11 }}
            >
              {cl.on ? 'reads' : 'masked'}
            </text>
          </g>
        ))}
        <foreignObject x={8} y={156} width={344} height={20}>
          <p className="text-center text-[11px] leading-tight text-muted">{m.note}</p>
        </foreignObject>
      </Frame>
    </div>
  );
}

export function MotionWeight() {
  const [g, setG] = useState(1);
  const lambda = 12;
  const tau = 0.35;
  const alpha = 2.5;
  const w = (n: number) => 1 + lambda * Math.tanh((alpha * Math.max(n - tau, 0)) / (1 - tau) * g);
  const pts = Array.from({ length: 61 }, (_, i) => `${r2(40 + (i / 60) * 290)},${r2(150 - (w(i / 60) - 1) * 10.5)}`).join(' ');
  return (
    <div>
      <Frame h={176}>
        <line x1={40} y1={150} x2={334} y2={150} stroke={C.rule} />
        <line x1={40} y1={14} x2={40} y2={150} stroke={C.rule} />
        <line x1={40 + tau * 290} y1={20} x2={40 + tau * 290} y2={150} stroke={C.faint} strokeDasharray="2 3" />
        <text x={40 + tau * 290 + 4} y={28} style={mono}>
          τ = 0.35
        </text>
        <polyline points={pts} fill="none" stroke={C.vid} strokeWidth={2} />
        <text x={334} y={166} textAnchor="end" style={label}>
          normalized feature change n
        </text>
        <text x={34} y={18} textAnchor="end" style={mono}>
          13
        </text>
        <text x={34} y={153} textAnchor="end" style={mono}>
          1
        </text>
        <text x={50} y={40} style={labelInk}>
          patch weight w
        </text>
      </Frame>
      <label className="mt-1 flex items-center gap-3 text-[11.5px] text-muted">
        <span className="shrink-0">camera-motion gate g = {g.toFixed(2)}</span>
        <input
          className="scrub"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={g}
          onChange={(e) => setG(Number(e.target.value))}
          style={{ ['--fill' as string]: `${g * 100}%` }}
        />
      </label>
    </div>
  );
}

function Box({ x, vals, title, tone }: { x: number; vals: number[]; title: string; tone: string }) {
  return (
    <g>
      {vals.map((v, i) => (
        <g key={i}>
          <rect x={x + (i % 2) * 34} y={40 + Math.floor(i / 2) * 34} width={32} height={32} rx={3} fill={tone} opacity={0.9} />
          <text x={x + (i % 2) * 34 + 16} y={40 + Math.floor(i / 2) * 34 + 21} textAnchor="middle" style={{ ...labelInk, fill: 'var(--wine-950)', fontSize: 12 }}>
            {v}
          </text>
        </g>
      ))}
      <text x={x + 33} y={128} textAnchor="middle" style={label}>
        {title}
      </text>
    </g>
  );
}

export function NoiseLift() {
  const [fix, setFix] = useState(true);
  const eps = [2, -1, 1, -2];
  const out = fix ? [5, 5, 5, 5] : [7, 4, 6, 3];
  return (
    <div>
      <Pill
        value={fix ? 'clean' : 'velocity'}
        onChange={(v) => setFix(v === 'clean')}
        options={[
          { id: 'velocity', label: 'Upsample velocity' },
          { id: 'clean', label: 'Upsample clean estimate' },
        ]}
      />
      <Frame h={150}>
        <Box x={12} vals={eps} title="noise ε (mean 0)" tone="var(--coral-100)" />
        <text x={100} y={78} style={mono}>
          pool
        </text>
        <rect x={136} y={56} width={40} height={40} rx={3} fill="var(--coral-200)" />
        <text x={156} y={81} textAnchor="middle" style={{ ...labelInk, fontSize: 11 }}>
          {fix ? 'x̂ = 5' : 'h = −5'}
        </text>
        <text x={156} y={128} textAnchor="middle" style={label}>
          coarse head
        </text>
        <text x={196} y={78} style={mono}>
          lift
        </text>
        <Box x={250} vals={out} title={fix ? 'x̂ (target 5 5 5 5)' : 'ε − U(h): noise leaks'} tone={fix ? 'var(--coral-300)' : 'var(--coral-100)'} />
      </Frame>
    </div>
  );
}

export function RowBudget({ highlight }: { highlight: 'dense' | 'all' }) {
  const rows = [
    { label: 'dense', n: 240, fill: 'var(--coral-400)', stroke: 'var(--coral-400)' },
    { label: 'uniform coarse', n: 60, fill: 'var(--coral-100)', stroke: 'var(--coral-300)' },
    { label: 'foveated', n: 132, fill: 'var(--coral-400)', stroke: 'var(--coral-400)' },
    { label: 'gated', n: 128, fill: 'var(--coral-400)', stroke: 'var(--coral-400)' },
  ];
  const shown = highlight === 'dense' ? rows.slice(0, 1) : rows;
  return (
    <Frame h={30 + shown.length * 34}>
      <text x={10} y={16} style={mono}>
        future-video rows per layer (+120 current)
      </text>
      {shown.map((r, i) => (
        <g key={r.label}>
          <text x={10} y={44 + i * 34} style={labelInk}>
            {r.label}
          </text>
          <rect x={110} y={32 + i * 34} width={r.n * 0.95} height={16} rx={2} fill={r.fill} stroke={r.stroke} strokeWidth={0.6} />
          <text x={116 + r.n * 0.95} y={44 + i * 34} style={mono}>
            {r.n}
          </text>
        </g>
      ))}
    </Frame>
  );
}

export function StreamingRule({ mode }: { mode: 'sync' | 'stream' | 'prefix' }) {
  if (mode === 'prefix') {
    return (
      <Frame h={120}>
        <defs>
          <pattern id="sr-h" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="4" fill={C.paper} />
            <line x1="0" y1="0" x2="0" y2="4" stroke={C.act} strokeWidth="1.2" />
          </pattern>
        </defs>
        {Array.from({ length: 32 }).map((_, i) => (
          <rect key={i} x={12 + i * 10.6} y={36} width={9} height={22} fill={i < 8 ? C.vid : 'url(#sr-h)'} stroke={i < 8 ? C.vid : C.act} strokeWidth={0.5} />
        ))}
        <text x={12} y={26} style={labelInk}>
          committed, σ = 0
        </text>
        <text x={348} y={26} textAnchor="end" style={labelInk}>
          to generate, σ = 1
        </text>
        <text x={12 + 4 * 10.6} y={78} textAnchor="middle" style={mono}>
          d = 8
        </text>
        <text x={12 + 20 * 10.6} y={78} textAnchor="middle" style={mono}>
          H − d = 24
        </text>
        <text x={12} y={106} style={label}>
          one action chunk of H = 32 tokens
        </text>
      </Frame>
    );
  }
  const sync = mode === 'sync';
  return (
    <Frame h={120}>
      <defs>
        <pattern id="sr-w" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="5" fill={C.paper} />
          <line x1="0" y1="0" x2="0" y2="5" stroke="var(--wine-400)" strokeWidth="1.4" />
        </pattern>
      </defs>
      <text x={10} y={34} style={label}>
        robot
      </text>
      <text x={10} y={70} style={label}>
        model
      </text>
      {sync ? (
        <>
          <rect x={56} y={22} width={110} height={18} fill="var(--coral-200)" />
          <rect x={166} y={22} width={64} height={18} fill="url(#sr-w)" stroke="var(--wine-400)" strokeWidth={0.6} />
          <rect x={230} y={22} width={118} height={18} fill="var(--coral-200)" />
          <rect x={166} y={58} width={64} height={18} rx={3} fill={C.vid} />
          <text x={198} y={71} textAnchor="middle" style={{ ...label, fill: 'var(--on-wine)' }}>
            pass
          </text>
          <text x={198} y={100} textAnchor="middle" style={labelInk}>
            robot idles for L
          </text>
        </>
      ) : (
        <>
          <rect x={56} y={22} width={74} height={18} fill="var(--coral-200)" />
          <rect x={130} y={22} width={64} height={18} fill={C.vid} />
          <text x={162} y={35} textAnchor="middle" style={{ ...label, fill: 'var(--on-wine)' }}>
            d
          </text>
          <rect x={194} y={22} width={154} height={18} fill="var(--coral-200)" />
          <rect x={130} y={58} width={56} height={18} rx={3} fill={C.vid} />
          <text x={158} y={71} textAnchor="middle" style={{ ...label, fill: 'var(--on-wine)' }}>
            pass
          </text>
          <text x={198} y={100} textAnchor="middle" style={labelInk}>
            L ≤ d Δt and d + s ≤ H
          </text>
        </>
      )}
    </Frame>
  );
}

export function RouterPipeline() {
  const steps = ['frame', '4 layers', '30 blocks', 'MLP', 'top-12'];
  const fine = new Set([2, 7, 8, 11, 12, 13, 17, 18, 22, 23, 26, 28]);
  const B = 20;
  const gx = 22;
  const gy = 60;
  const lines: [string, boolean][] = [
    ['12 fine blocks × 4 tokens', true],
    ['18 coarse blocks × 1 token', true],
    ['66 rows per future frame', false],
    ['252 video rows in total', false],
  ];
  return (
    <Frame h={196}>
      {steps.map((st, i) => (
        <g key={st}>
          <rect x={6 + i * 71} y={10} width={62} height={30} rx={4} fill={i === 4 ? 'var(--coral-400)' : 'var(--coral-50)'} stroke={C.rule} />
          <text x={37 + i * 71} y={29} textAnchor="middle" style={{ ...labelInk, fontSize: 10 }}>
            {st}
          </text>
          {i < 4 && <path d={`M ${68 + i * 71} 25 l 9 0`} stroke={C.soft} />}
        </g>
      ))}
      {Array.from({ length: 30 }).map((_, b) => {
        const r = Math.floor(b / 5);
        const c = b % 5;
        const x = gx + c * B;
        const y = gy + r * B;
        return fine.has(b) ? (
          <g key={b}>
            {[0, 1, 2, 3].map((q) => (
              <rect key={q} x={x + (q % 2) * (B / 2) + 0.6} y={y + Math.floor(q / 2) * (B / 2) + 0.6} width={B / 2 - 1.2} height={B / 2 - 1.2} rx={0.8} fill="var(--coral-400)" />
            ))}
          </g>
        ) : (
          <rect key={b} x={x + 0.6} y={y + 0.6} width={B - 1.2} height={B - 1.2} rx={1.2} fill="var(--coral-100)" stroke="var(--coral-300)" strokeWidth={0.8} />
        );
      })}
      <text x={gx + 2.5 * B} y={gy + 6 * B + 14} textAnchor="middle" style={mono}>
        6 × 5 blocks
      </text>
      {lines.map(([t, swatch], i) => (
        <g key={t}>
          {swatch && (
            <rect x={150} y={gy + 6 + i * 20} width={10} height={10} rx={1.5} fill={i === 0 ? 'var(--coral-400)' : 'var(--coral-100)'} stroke="var(--coral-300)" strokeWidth={0.8} />
          )}
          <text x={swatch ? 168 : 150} y={gy + 15 + i * 20} style={swatch ? labelInk : mono}>
            {t}
          </text>
        </g>
      ))}
      <text x={150} y={gy + 104} style={mono}>
        LayerNorm, 3072→256, GELU, 256→1
      </text>
    </Frame>
  );
}

export function GatingFill() {
  const keep = (r: number, c: number) => r >= 1 && r <= 8 && c >= (r === 1 || r === 8 ? 5 : 4) && c <= (r === 1 || r === 8 ? 10 : 11);
  return (
    <Frame h={170}>
      <defs>
        <pattern id="gf-h" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4" height="4" fill={C.paper} />
          <line x1="0" y1="0" x2="0" y2="4" stroke={C.faint} strokeWidth="1" />
        </pattern>
      </defs>
      {Array.from({ length: 10 }).map((_, r) =>
        Array.from({ length: 12 }).map((__, c) => (
          <rect
            key={`${r}-${c}`}
            x={14 + c * 13}
            y={14 + r * 13}
            width={12}
            height={12}
            fill={keep(r, c) ? 'var(--coral-400)' : 'url(#gf-h)'}
            stroke={C.rule}
            strokeWidth={0.4}
          />
        )),
      )}
      <rect x={196} y={30} width={12} height={12} fill="var(--coral-400)" />
      <text x={214} y={40} style={labelInk}>
        computed (predicted to move)
      </text>
      <rect x={196} y={56} width={12} height={12} fill="url(#gf-h)" stroke={C.rule} />
      <text x={214} y={66} style={labelInk}>
        filled from a held-still
      </text>
      <text x={214} y={80} style={labelInk}>
        current-frame prediction
      </text>
      <text x={196} y={112} style={mono}>
        top-128 of 240 future tokens
      </text>
      <text x={196} y={128} style={mono}>
        selected per frame, per replan
      </text>
    </Frame>
  );
}

export function DriftLossMini({ mode }: { mode: 'mean' | 'particles' | 'chain' | 'dims' | 'field' | 'noop' }) {
  if (mode === 'chain') {
    const steps = ['θ', 'Ẑ', 'decode', 'DINOv2', 'U', 'L'];
    return (
      <Frame h={110}>
        {steps.map((s, i) => (
          <g key={s}>
            <rect x={8 + i * 58} y={24} width={48} height={30} rx={4} fill={i === 2 || i === 3 ? 'var(--coral-100)' : 'var(--coral-50)'} stroke={C.rule} />
            <text x={32 + i * 58} y={43} textAnchor="middle" style={{ ...labelInk, fontSize: 11 }}>
              {s}
            </text>
            {i < 5 && <path d={`M ${56 + i * 58} 34 l 10 0`} stroke={C.ink} />}
            {i < 5 && <path d={`M ${66 + i * 58} 46 l -10 0`} stroke="var(--wine-400)" strokeDasharray="2 2" />}
          </g>
        ))}
        <text x={8} y={80} style={label}>
          forward: solid · gradients: dashed
        </text>
        <text x={8} y={96} style={mono}>
          decoder and DINOv2 frozen, but differentiated through
        </text>
      </Frame>
    );
  }
  if (mode === 'dims') {
    return (
      <Frame h={140}>
        {Array.from({ length: 7 }).map((_, j) => (
          <g key={j}>
            {Array.from({ length: 32 }).map((__, h) => (
              <rect key={h} x={60 + h * 9} y={12 + j * 15} width={8} height={13} fill={j === 2 ? C.act : 'var(--coral-100)'} />
            ))}
            <text x={52} y={22 + j * 15} textAnchor="end" style={mono}>
              {['Δx', 'Δy', 'Δz', 'Δrx', 'Δry', 'Δrz', 'g'][j]}
            </text>
          </g>
        ))}
        <text x={60} y={130} style={label}>
          one particle = one row: 32 steps of one dimension
        </text>
      </Frame>
    );
  }
  const W = 360;
  const target = { x: 300, y: 70 };
  const modes = [
    { x: 250, y: 40 },
    { x: 260, y: 110 },
  ];
  const particles = [
    { x: 90, y: 44 },
    { x: 120, y: 100 },
    { x: 160, y: 62 },
    { x: 70, y: 82 },
  ];
  if (mode === 'mean') {
    return (
      <Frame h={170}>
        <path d="M 30 66 C 90 66, 120 16, 170 18 S 260 66, 320 66" fill="none" stroke={C.vid} strokeWidth={1.6} />
        <path d="M 30 66 C 90 66, 120 116, 170 114 S 260 66, 320 66" fill="none" stroke={C.vid} strokeWidth={1.6} />
        <path d="M 30 66 L 320 66" fill="none" stroke={C.act} strokeWidth={2} strokeDasharray="5 4" />
        <rect x={152} y={53} width={36} height={26} rx={3} fill="var(--coral-100)" stroke="var(--coral-300)" />
        <text x={170} y={96} textAnchor="middle" style={mono}>
          obstacle
        </text>
        <circle cx={30} cy={66} r={4} fill={C.ink} />
        <circle cx={320} cy={66} r={4} fill="white" stroke={C.ink} strokeWidth={1.4} />
        <line x1={20} y1={146} x2={44} y2={146} stroke={C.vid} strokeWidth={1.6} />
        <text x={50} y={150} style={labelInk}>
          two plausible paths
        </text>
        <line x1={188} y1={146} x2={212} y2={146} stroke={C.act} strokeWidth={2} strokeDasharray="5 4" />
        <text x={218} y={150} style={{ ...label, fill: 'var(--coral-400)' }}>
          one-step flow: the mean
        </text>
      </Frame>
    );
  }

  return (
    <Frame h={150}>
      <defs>
        <marker id="dlm-a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 z" fill={C.vid} />
        </marker>
        <marker id="dlm-r" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 z" fill={C.act} />
        </marker>
        <pattern id="dlm-h" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4" height="4" fill={C.paper} />
          <line x1="0" y1="0" x2="0" y2="4" stroke={C.soft} strokeWidth="1" />
        </pattern>
      </defs>
      {mode === 'particles' && (
        <>
          {modes.map((m, i) => (
            <circle key={i} cx={m.x} cy={m.y} r={22} fill="var(--coral-50)" stroke={C.rule} strokeDasharray="3 3" />
          ))}
          {particles.map((p, i) => {
            const m = modes[i % 2];
            return <circle key={i} cx={m.x + (i - 1.5) * 6} cy={m.y + (i % 3) * 4 - 4} r={5} fill={C.dino} />;
          })}
          <text x={W / 2 - 150} y={140} style={label}>
            G samples from one context should spread over the plausible futures
          </text>
        </>
      )}
      {(mode === 'field' || mode === 'noop') && (
        <>
          <path d={`M ${target.x} ${target.y - 9} l 3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 z`} fill={C.vid} />
          <text x={target.x} y={target.y + 24} textAnchor="middle" style={label}>
            data
          </text>
          {mode === 'noop' && (
            <>
              <rect x={30} y={112} width={14} height={14} fill="url(#dlm-h)" stroke={C.soft} />
              <text x={50} y={123} style={label}>
                no-op
              </text>
            </>
          )}
          {particles.map((p, i) => {
            const dx = target.x - p.x;
            const dy = target.y - p.y;
            const k = 0.35;
            const rx = mode === 'noop' ? (p.x - 37) * 0.25 : (p.x - 110) * 0.22;
            const ry = mode === 'noop' ? (p.y - 119) * 0.25 : (p.y - 72) * 0.3;
            return (
              <g key={i}>
                <line x1={p.x} y1={p.y} x2={p.x + dx * k} y2={p.y + dy * k} stroke={C.vid} strokeWidth={1.2} markerEnd="url(#dlm-a)" />
                <line x1={p.x} y1={p.y} x2={p.x + rx} y2={p.y + ry} stroke={C.act} strokeWidth={1.2} markerEnd="url(#dlm-r)" />
                <circle cx={p.x} cy={p.y} r={5} fill={C.dino} />
              </g>
            );
          })}
          <text x={180} y={140} style={{ ...label, fill: C.vid }}>
            attract
          </text>
          <text x={230} y={140} style={{ ...label, fill: 'var(--coral-400)' }}>
            repel
          </text>
        </>
      )}
    </Frame>
  );
}
