'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { r2 } from '@/lib/num';
import { DETAILS, PANELS, type PanelId } from './details';
import { Tex } from '@/components/Tex';

const ActiveCtx = createContext<{ active: string; set: (id: string) => void }>({ active: '', set: () => {} });

const C = {
  vid: 'var(--wine-600)',
  vidSoft: 'var(--coral-100)',
  act: 'var(--coral-400)',
  dino: 'var(--wine-800)',
  ink: 'var(--wine-900)',
  soft: 'var(--ink-muted)',
  faint: 'var(--ink-faint)',
  rule: 'var(--rule-strong)',
  paper: 'var(--paper)',
};

const T = {
  lab: { fontFamily: 'var(--font-body)', fontSize: 15, fill: C.ink } as const,
  note: { fontFamily: 'var(--font-body)', fontSize: 13.5, fill: C.soft } as const,
  box: { fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600 } as const,
};

function Hot({ id, box, children }: { id: string; box: [number, number, number, number]; children: ReactNode }) {
  const { active, set } = useContext(ActiveCtx);
  const on = active === id;
  return (
    <g
      tabIndex={0}
      role="button"
      aria-label={DETAILS[id]?.title}
      aria-pressed={on}
      onMouseEnter={() => set(id)}
      onFocus={() => set(id)}
      onClick={() => set(id)}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      <rect
        x={box[0]}
        y={box[1]}
        width={box[2]}
        height={box[3]}
        rx={10}
        fill={on ? 'var(--coral-100)' : 'transparent'}
        stroke={on ? 'var(--coral-300)' : 'transparent'}
        strokeWidth={1}
        style={{ transition: 'fill 200ms ease, stroke 200ms ease' }}
      />
      {children}
    </g>
  );
}

function Defs() {
  return (
    <defs>
      <pattern id="ar-hv" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="5" height="5" fill="white" />
        <line x1="0" y1="0" x2="0" y2="5" stroke={C.vid} strokeWidth="1.4" opacity="0.6" />
      </pattern>
      <pattern id="ar-ha" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="5" height="5" fill="white" />
        <line x1="0" y1="0" x2="0" y2="5" stroke={C.act} strokeWidth="1.4" />
      </pattern>
      <pattern id="ar-hw" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" fill="white" />
        <line x1="0" y1="0" x2="0" y2="6" stroke="var(--wine-400)" strokeWidth="1.6" />
      </pattern>
      <pattern id="ar-hs" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="5" height="5" fill="white" />
        <line x1="0" y1="0" x2="0" y2="5" stroke={C.faint} strokeWidth="1" />
      </pattern>
      <marker id="ar-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={C.ink} />
      </marker>
      <marker id="ar-arrow-d" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={C.dino} />
      </marker>
      <marker id="ar-arrow-v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={C.vid} />
      </marker>
      <marker id="ar-arrow-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={C.act} />
      </marker>
    </defs>
  );
}

function Tokens({ x, y, n, kind, size = 24, gap = 30 }: { x: number; y: number; n: number; kind: 'v' | 'vn' | 'a' | 'an'; size?: number; gap?: number }) {
  const fill = kind === 'v' ? C.vid : kind === 'vn' ? 'url(#ar-hv)' : kind === 'a' ? C.act : 'url(#ar-ha)';
  const stroke = kind[0] === 'v' ? C.vid : C.act;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={x + i * gap} y={y} width={size} height={size} rx={2} fill={fill} stroke={stroke} strokeWidth={0.8} opacity={kind === 'v' ? 0.85 : 1} />
      ))}
    </g>
  );
}

function Cells({
  x,
  y,
  cols,
  rows,
  c,
  fill,
  on = [],
  onFill,
}: {
  x: number;
  y: number;
  cols: number;
  rows: number;
  c: number;
  fill: string;
  on?: [number, number][];
  onFill?: string;
}) {
  const lit = new Set(on.map(([r, k]) => `${r}-${k}`));
  return (
    <g>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, k) => (
          <rect
            key={`${r}-${k}`}
            x={x + k * c + 0.75}
            y={y + r * c + 0.75}
            width={c - 1.5}
            height={c - 1.5}
            rx={1}
            fill={lit.has(`${r}-${k}`) ? onFill : fill}
          />
        )),
      )}
    </g>
  );
}

function VFrame({ x, y, ox }: { x: number; y: number; ox: number }) {
  return (
    <g>
      <rect x={x} y={y} width={56} height={42} rx={3} fill="var(--coral-50)" stroke={C.vid} strokeWidth={1} />
      <circle cx={x + ox} cy={y + 28} r={7} fill={C.vid} opacity={0.8} />
    </g>
  );
}

function Star({ x, y, r = 10, fill = C.vid }: { x: number; y: number; r?: number; fill?: string }) {
  const pts = Array.from({ length: 10 }).map((_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    return `${r2(x + rr * Math.cos(a))},${r2(y + rr * Math.sin(a))}`;
  });
  return <polygon points={pts.join(' ')} fill={fill} />;
}

function PanelA() {
  return (
    <>
      <Hot id="a-context" box={[22, 52, 210, 70]}>
        <text x={34} y={76} style={T.lab}>
          current frame
        </text>
        <Tokens x={34} y={88} n={6} kind="v" />
      </Hot>
      <Hot id="a-noise" box={[22, 128, 210, 70]}>
        <text x={34} y={152} style={T.lab}>
          future latents (noise)
        </text>
        <Tokens x={34} y={164} n={6} kind="vn" />
      </Hot>
      <Hot id="a-actnoise" box={[22, 230, 210, 70]}>
        <text x={34} y={254} style={T.lab}>
          action chunk (noise)
        </text>
        <Tokens x={34} y={266} n={6} kind="an" />
      </Hot>
      <Hot id="a-context" box={[22, 306, 210, 34]}>
        <text x={34} y={328} style={T.note}>
          + language ℓ, state q
        </text>
      </Hot>
      <line x1={220} y1={100} x2={368} y2={118} stroke={C.ink} strokeWidth={1.3} markerEnd="url(#ar-arrow)" />
      <line x1={220} y1={176} x2={368} y2={150} stroke={C.ink} strokeWidth={1.3} markerEnd="url(#ar-arrow)" />
      <line x1={220} y1={278} x2={368} y2={278} stroke={C.ink} strokeWidth={1.3} markerEnd="url(#ar-arrow)" />
      <Hot id="a-video" box={[364, 86, 172, 102]}>
        <rect x={374} y={96} width={152} height={82} rx={8} fill="var(--coral-50)" stroke={C.vid} strokeWidth={1.4} />
        <text x={450} y={133} textAnchor="middle" style={{ ...T.box, fill: C.vid }}>
          Video
        </text>
        <text x={450} y={154} textAnchor="middle" style={{ ...T.box, fill: C.vid }}>
          expert
        </text>
      </Hot>
      <Hot id="a-action" box={[364, 244, 172, 70]}>
        <rect x={374} y={254} width={152} height={50} rx={8} fill="var(--coral-50)" stroke={C.act} strokeWidth={1.4} />
        <text x={450} y={284} textAnchor="middle" style={{ ...T.box, fill: 'var(--wine-500)' }}>
          Action expert
        </text>
      </Hot>
      <Hot id="a-attn" box={[420, 186, 200, 60]}>
        <line x1={450} y1={182} x2={450} y2={250} stroke={C.dino} strokeWidth={1.6} markerStart="url(#ar-arrow-d)" markerEnd="url(#ar-arrow-d)" />
        <text x={462} y={221} style={{ ...T.note, fill: C.dino }}>
          shared attention
        </text>
      </Hot>
      <line x1={530} y1={120} x2={604} y2={120} stroke={C.ink} strokeWidth={1.3} markerEnd="url(#ar-arrow)" />
      <line x1={530} y1={279} x2={604} y2={279} stroke={C.ink} strokeWidth={1.3} markerEnd="url(#ar-arrow)" />
      <Hot id="a-future" box={[600, 82, 236, 116]}>
        <VFrame x={612} y={98} ox={14} />
        <VFrame x={682} y={98} ox={28} />
        <VFrame x={752} y={98} ox={42} />
        <text x={718} y={170} textAnchor="middle" style={T.note}>
          imagined future Ẑ
        </text>
      </Hot>
      <Hot id="a-actions" box={[600, 250, 236, 84]}>
        <Tokens x={631} y={266} n={6} kind="a" />
        <text x={718} y={318} textAnchor="middle" style={T.note}>
          actions Â
        </text>
      </Hot>
    </>
  );
}

function PanelB() {
  const c = 19;
  return (
    <>
      <Hot id="b-futures" box={[16, 14, 128, 112]}>
        <VFrame x={30} y={30} ox={14} />
        <VFrame x={42} y={42} ox={26} />
        <VFrame x={54} y={54} ox={38} />
        <text x={80} y={118} textAnchor="middle" style={T.note}>
          G futures
        </text>
      </Hot>
      <line x1={118} y1={72} x2={160} y2={72} stroke={C.ink} strokeWidth={1.2} markerEnd="url(#ar-arrow)" />
      <Hot id="b-decode" box={[158, 50, 96, 46]}>
        <rect x={164} y={56} width={84} height={34} rx={6} fill="var(--coral-50)" stroke={C.vid} />
        <text x={206} y={78} textAnchor="middle" style={{ ...T.lab, fontSize: 14 }}>
          decode
        </text>
      </Hot>
      <line x1={250} y1={72} x2={274} y2={72} stroke={C.ink} strokeWidth={1.2} markerEnd="url(#ar-arrow)" />
      <Hot id="b-dino" box={[272, 50, 100, 46]}>
        <rect x={278} y={56} width={88} height={34} rx={6} fill="var(--coral-100)" stroke={C.dino} />
        <text x={322} y={78} textAnchor="middle" style={{ ...T.lab, fontSize: 14, fill: C.dino }}>
          DINOv2
        </text>
      </Hot>
      <line x1={368} y1={72} x2={392} y2={72} stroke={C.ink} strokeWidth={1.2} markerEnd="url(#ar-arrow)" />
      <Hot id="b-patch" box={[386, 6, 134, 136]}>
        {[3, 2, 1].map((k) => (
          <rect key={k} x={398 + 6 * k} y={34 - 6 * k} width={5 * c} height={4 * c} rx={2} fill="var(--coral-50)" stroke={C.rule} />
        ))}
        <rect x={398} y={34} width={5 * c} height={4 * c} rx={2} fill="white" stroke={C.vid} strokeWidth={0.8} />
        <Cells x={398} y={34} cols={5} rows={4} c={c} fill="var(--coral-100)" on={[[1, 3]]} onFill={C.dino} />
        <text x={445.5} y={132} textAnchor="middle" style={T.note}>
          patch p
        </text>
      </Hot>
      <Hot id="b-chunks" box={[566, 4, 286, 142]}>
        {[3, 2, 1].map((k) => (
          <rect key={k} x={584 + 5 * k} y={44 - 5 * k} width={12 * 14} height={5 * 14} rx={2} fill="var(--coral-50)" stroke={C.rule} />
        ))}
        <rect x={584} y={44} width={12 * 14} height={5 * 14} rx={2} fill="white" stroke={C.act} strokeWidth={0.8} />
        <Cells x={584} y={44} cols={12} rows={5} c={14} fill="var(--coral-100)" on={Array.from({ length: 12 }, (_, i) => [2, i] as [number, number])} onFill={C.act} />
        <text x={778} y={83} style={{ ...T.note, fill: 'var(--wine-500)' }}>
          dim. j
        </text>
        <text x={668} y={22} textAnchor="middle" style={T.note}>
          H steps
        </text>
        <text x={668} y={134} textAnchor="middle" style={T.note}>
          G chunks
        </text>
      </Hot>
      <line x1={36} y1={160} x2={76} y2={160} stroke={C.vid} strokeWidth={1.4} markerEnd="url(#ar-arrow-v)" />
      <text x={84} y={165} style={{ ...T.note, fill: C.vid }}>
        attract
      </text>
      <line x1={150} y1={160} x2={190} y2={160} stroke={C.act} strokeWidth={1.4} markerEnd="url(#ar-arrow-a)" />
      <text x={198} y={165} style={{ ...T.note, fill: 'var(--wine-500)' }}>
        repel
      </text>
      <Hot id="b-vfield" box={[22, 176, 392, 172]}>
        <rect x={30} y={184} width={376} height={156} rx={8} fill="white" stroke={C.dino} />
        <text x={42} y={206} style={{ ...T.note, fontSize: 13, fill: C.ink }}>
          video field at patch p: u ∈ ℝ⁷⁶⁸
        </text>
        <Star x={340} y={266} r={11} />
        <text x={340} y={292} textAnchor="middle" style={{ ...T.note, fontSize: 12, fill: C.vid }}>
          data
        </text>
        {[
          [110, 240, -28, 14],
          [150, 306, 14, -24],
          [236, 258, 8, 26],
          [84, 280, -28, 10],
        ].map(([x, y, rx, ry], i) => (
          <g key={i}>
            <line x1={x} y1={y} x2={x + (340 - x) * 0.38} y2={y + (266 - y) * 0.38} stroke={C.vid} strokeWidth={1.3} markerEnd="url(#ar-arrow-v)" />
            <line x1={x} y1={y} x2={x + rx} y2={y + ry} stroke={C.act} strokeWidth={1.3} markerEnd="url(#ar-arrow-a)" />
            <circle cx={x} cy={y} r={6} fill={C.dino} />
          </g>
        ))}
      </Hot>
      <Hot id="b-afield" box={[432, 176, 420, 172]}>
        <rect x={440} y={184} width={404} height={156} rx={8} fill="white" stroke={C.act} />
        <text x={452} y={206} style={{ ...T.note, fontSize: 13, fill: C.ink }}>
          action field at dimension j: u ∈ ℝᴴ
        </text>
        <Star x={790} y={266} r={11} />
        <text x={790} y={292} textAnchor="middle" style={{ ...T.note, fontSize: 12, fill: C.vid }}>
          data
        </text>
        {[
          [560, 236, -22, 18],
          [630, 300, -26, 20],
          [700, 246, 8, 26],
          [544, 274, -30, 22],
        ].map(([x, y, rx, ry], i) => (
          <g key={i}>
            <line x1={x} y1={y} x2={x + (790 - x) * 0.38} y2={y + (266 - y) * 0.38} stroke={C.vid} strokeWidth={1.3} markerEnd="url(#ar-arrow-v)" />
            <line x1={x} y1={y} x2={x + rx} y2={y + ry} stroke={C.act} strokeWidth={1.3} markerEnd="url(#ar-arrow-a)" />
            <circle cx={x} cy={y} r={6} fill={C.act} />
          </g>
        ))}
      </Hot>
      <Hot id="b-noop" box={[448, 300, 112, 40]}>
        <rect x={460} y={310} width={16} height={16} fill="url(#ar-hs)" stroke={C.soft} />
        <text x={484} y={323} style={{ ...T.note, fontSize: 12 }}>
          no-op
        </text>
      </Hot>
      <line x1={464.5} y1={62.5} x2={300} y2={182} stroke={C.dino} strokeWidth={1} strokeDasharray="4 3" markerEnd="url(#ar-arrow-d)" />
      <line x1={752} y1={79} x2={800} y2={182} stroke={C.act} strokeWidth={1} strokeDasharray="4 3" markerEnd="url(#ar-arrow-a)" />
    </>
  );
}

function PanelC() {
  const sx = (t: number) => 160 + t * 640;
  return (
    <>
      <line x1={sx(0.39)} y1={24} x2={sx(0.39)} y2={210} stroke={C.faint} strokeDasharray="2 4" />
      <Hot id="c-sync" box={[14, 22, 832, 100]}>
        <text x={26} y={36} style={{ ...T.lab, fontSize: 15 }}>
          synchronous
        </text>
        <text x={150} y={58} textAnchor="end" style={T.note}>
          robot
        </text>
        <text x={150} y={98} textAnchor="end" style={T.note}>
          model
        </text>
        <rect x={sx(0)} y={42} width={sx(0.39) - sx(0)} height={24} fill="var(--coral-200)" />
        <text x={(sx(0) + sx(0.39)) / 2} y={59} textAnchor="middle" style={{ ...T.note, fill: C.ink }}>
          chunk k
        </text>
        <rect x={sx(0.39)} y={82} width={sx(0.6) - sx(0.39)} height={24} rx={4} fill={C.vid} />
        <text x={(sx(0.39) + sx(0.6)) / 2} y={99} textAnchor="middle" style={{ ...T.note, fill: 'var(--on-wine)' }}>
          pass k+1
        </text>
        <rect x={sx(0.6)} y={42} width={sx(1) - sx(0.6)} height={24} fill="var(--coral-200)" />
        <text x={(sx(0.6) + sx(1)) / 2} y={59} textAnchor="middle" style={{ ...T.note, fill: C.ink }}>
          chunk k+1
        </text>
      </Hot>
      <Hot id="c-wait" box={[sx(0.39) - 6, 36, sx(0.6) - sx(0.39) + 12, 36]}>
        <rect x={sx(0.39)} y={42} width={sx(0.6) - sx(0.39)} height={24} fill="url(#ar-hw)" stroke="var(--wine-400)" />
        <rect x={(sx(0.39) + sx(0.6)) / 2 - 30} y={46} width={60} height={16} fill="white" />
        <text x={(sx(0.39) + sx(0.6)) / 2} y={59} textAnchor="middle" style={{ ...T.note, fill: 'var(--wine-500)' }}>
          waits
        </text>
      </Hot>
      <Hot id="c-stream" box={[14, 132, 832, 96]}>
        <text x={26} y={146} style={{ ...T.lab, fontSize: 15 }}>
          streaming
        </text>
        <text x={150} y={166} textAnchor="end" style={T.note}>
          robot
        </text>
        <text x={150} y={206} textAnchor="end" style={T.note}>
          model
        </text>
        <rect x={sx(0)} y={150} width={sx(0.2) - sx(0)} height={24} fill="var(--coral-200)" />
        <text x={(sx(0) + sx(0.2)) / 2} y={167} textAnchor="middle" style={{ ...T.note, fill: C.ink }}>
          chunk k
        </text>
        <rect x={sx(0.39)} y={150} width={sx(0.79) - sx(0.39)} height={24} fill="var(--coral-200)" />
        <text x={(sx(0.39) + sx(0.79)) / 2} y={167} textAnchor="middle" style={{ ...T.note, fill: C.ink }}>
          chunk k+1
        </text>
        <rect x={sx(0.79)} y={150} width={sx(1) - sx(0.79)} height={24} fill="var(--coral-100)" stroke="var(--coral-200)" strokeDasharray="3 3" />
        <text x={(sx(0.79) + sx(1)) / 2} y={167} textAnchor="middle" style={{ ...T.note, fill: C.soft }}>
          chunk k+2
        </text>
        <line x1={sx(0.79)} y1={128} x2={sx(0.79)} y2={150} stroke={C.faint} strokeDasharray="2 3" />
        <line x1={sx(0.79)} y1={134} x2={sx(1)} y2={134} stroke="var(--wine-500)" strokeWidth={1} markerStart="url(#ar-arrow)" markerEnd="url(#ar-arrow)" />
        <text x={(sx(0.79) + sx(1)) / 2} y={128} textAnchor="middle" style={{ ...T.note, fontSize: 12, fill: 'var(--wine-500)' }}>
          time saved
        </text>
      </Hot>
      <Hot id="c-commit" box={[sx(0.2) - 6, 144, sx(0.39) - sx(0.2) + 12, 36]}>
        <rect x={sx(0.2)} y={150} width={sx(0.39) - sx(0.2)} height={24} fill={C.vid} opacity={0.85} />
        <text x={(sx(0.2) + sx(0.39)) / 2} y={167} textAnchor="middle" style={{ ...T.note, fill: 'var(--on-wine)' }}>
          committed
        </text>
      </Hot>
      <Hot id="c-pass" box={[sx(0.2) - 6, 184, sx(0.39) - sx(0.2) + 12, 36]}>
        <rect x={sx(0.2)} y={190} width={sx(0.39) - sx(0.2)} height={24} rx={4} fill="var(--wine-800)" />
        <text x={(sx(0.2) + sx(0.39)) / 2} y={207} textAnchor="middle" style={{ ...T.note, fill: 'var(--on-wine)' }}>
          pass k+1
        </text>
      </Hot>
      <Hot id="c-input" box={[14, 236, 832, 112]}>
        <text x={sx(0.2) - 14} y={276} textAnchor="end" style={T.note}>
          input of pass k+1
        </text>
        <line x1={(sx(0.2) + sx(0.39)) / 2} y1={258} x2={(sx(0.2) + sx(0.39)) / 2} y2={220} stroke={C.ink} strokeWidth={1} markerEnd="url(#ar-arrow)" />
        {Array.from({ length: 5 }).map((_, i) => (
          <rect key={`c${i}`} x={sx(0.2) + 4 + i * 24} y={262} width={20} height={20} rx={2} fill={C.vid} opacity={0.85} />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <rect key={`n${i}`} x={sx(0.39) + 6 + i * 24} y={262} width={20} height={20} rx={2} fill="url(#ar-ha)" stroke={C.act} strokeWidth={0.6} />
        ))}
        <text x={(sx(0.2) + sx(0.39)) / 2} y={306} textAnchor="middle" style={{ ...T.note, fill: C.vid }}>
          d clean, σ = 0
        </text>
        <text x={(sx(0.39) + sx(1)) / 2} y={306} textAnchor="middle" style={{ ...T.note, fill: 'var(--wine-500)' }}>
          H − d noise, σ = 1
        </text>
      </Hot>
    </>
  );
}

const FOVEA = [9, 10, 15, 16, 21, 22, 19, 24, 25, 2, 12, 28];

function PanelD() {
  const c = 13;
  const W = 12 * c;
  const H = 10 * c;
  const ox = [40, 330, 620];
  const oy = 22;
  const gated = (r: number, k: number) => {
    const rows: Record<number, [number, number]> = { 1: [5, 10], 2: [4, 11], 3: [4, 11], 4: [4, 11], 5: [4, 11], 6: [4, 11], 7: [4, 11], 8: [5, 10] };
    const span = rows[r];
    return span ? k >= span[0] && k <= span[1] : false;
  };
  return (
    <>
      <Hot id="d-dense" box={[ox[0] - 14, 10, W + 28, H + 52]}>
        <Cells x={ox[0]} y={oy} cols={12} rows={10} c={c} fill="var(--coral-400)" />
        <text x={ox[0] + W / 2} y={oy + H + 24} textAnchor="middle" style={T.note}>
          dense
        </text>
      </Hot>
      <Hot id="d-fovea" box={[ox[1] - 14, 10, W + 28, H + 52]}>
        {Array.from({ length: 30 }).map((_, bi) => {
          const br = Math.floor(bi / 6);
          const bc = bi % 6;
          const x = ox[1] + bc * 2 * c;
          const y = oy + br * 2 * c;
          return FOVEA.includes(bi) ? (
            <Cells key={bi} x={x} y={y} cols={2} rows={2} c={c} fill="var(--coral-400)" />
          ) : (
            <rect key={bi} x={x + 0.75} y={y + 0.75} width={2 * c - 1.5} height={2 * c - 1.5} rx={1.5} fill="var(--coral-100)" stroke="var(--coral-300)" strokeWidth={0.8} />
          );
        })}
        <text x={ox[1] + W / 2} y={oy + H + 24} textAnchor="middle" style={T.note}>
          action-guided foveation
        </text>
      </Hot>
      <Hot id="d-gated" box={[ox[2] - 14, 10, W + 28, H + 52]}>
        {Array.from({ length: 10 }).map((_, r) =>
          Array.from({ length: 12 }).map((__, k) => (
            <rect
              key={`${r}-${k}`}
              x={ox[2] + k * c + 0.75}
              y={oy + r * c + 0.75}
              width={c - 1.5}
              height={c - 1.5}
              rx={1}
              fill={gated(r, k) ? 'var(--coral-400)' : 'url(#ar-hs)'}
              stroke={gated(r, k) ? 'none' : 'var(--rule-strong)'}
              strokeWidth={0.5}
            />
          )),
        )}
        <text x={ox[2] + W / 2} y={oy + H + 24} textAnchor="middle" style={T.note}>
          motion gating
        </text>
      </Hot>
      <Hot id="d-coarse" box={[ox[1] + 2 * c - 4, oy - 4, 2 * c + 8, 2 * c + 8]}>
        <rect x={ox[1] + 2 * c} y={oy} width={2 * c} height={2 * c} fill="transparent" />
      </Hot>
      <Hot id="d-rows" box={[26, 200, 820, 146]}>
        {[
          { label: 'dense', n: 240, fill: 'var(--coral-400)', stroke: 'var(--coral-400)' },
          { label: 'foveated', n: 132, fill: 'var(--coral-400)', stroke: 'var(--coral-400)', split: 96 },
          { label: 'gated', n: 128, fill: 'var(--coral-400)', stroke: 'var(--coral-400)' },
        ].map((r, i) => (
          <g key={r.label}>
            <text x={40} y={238 + i * 38} style={T.lab}>
              {r.label}
            </text>
            {r.split ? (
              <>
                <rect x={170} y={224 + i * 38} width={r.split * 2.4} height={20} fill={r.fill} stroke={r.stroke} strokeWidth={0.6} />
                <rect x={170 + r.split * 2.4} y={224 + i * 38} width={(r.n - r.split) * 2.4} height={20} fill="var(--coral-100)" stroke="var(--coral-300)" strokeWidth={0.8} />
              </>
            ) : (
              <rect x={170} y={224 + i * 38} width={r.n * 2.4} height={20} fill={r.fill} stroke={r.stroke} strokeWidth={0.6} opacity={0.85} />
            )}
            <text x={180 + r.n * 2.4} y={239 + i * 38} style={T.note}>
              {r.n}
            </text>
          </g>
        ))}
        <text x={170} y={338} style={{ ...T.note, fontSize: 12 }}>
          future-video rows per layer
        </text>
      </Hot>
    </>
  );
}

const PANEL_BODY: Record<PanelId, () => React.ReactElement> = { a: PanelA, b: PanelB, c: PanelC, d: PanelD };

export function Architecture({ initial = 'a' }: { initial?: PanelId }) {
  const [panel, setPanel] = useState<PanelId>(initial);
  const [active, setActive] = useState(PANELS.find((x) => x.id === initial)!.first);
  const detail = DETAILS[active];
  const Body = PANEL_BODY[panel];

  const figure = useRef<HTMLDivElement>(null);
  const [away, setAway] = useState(false);
  const more = PANELS.find((p) => p.id === detail.panel)!.more;

  const choose = (p: PanelId) => {
    setPanel(p);
    setActive(PANELS.find((x) => x.id === p)!.first);
  };

  const jump = (target: string) => {
    const section = document.getElementById(target);
    if (!section) return;
    const heading = section.matches('h2, h3') ? section : section.querySelector<HTMLElement>('h2, h3') ?? section;
    section.scrollIntoView({ block: 'start' });
    heading.style.setProperty('--flash', heading.closest('.on-wine') ? 'var(--coral-300)' : 'var(--coral-400)');
    heading.classList.remove('flash');
    void heading.offsetWidth;
    heading.classList.add('flash');
    setAway(true);
  };

  useEffect(() => {
    if (!away || !figure.current) return;
    let left = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) left = true;
      else if (left) setAway(false);
    });
    io.observe(figure.current);
    const t = window.setTimeout(() => setAway(false), 12000);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [away]);

  return (
    <ActiveCtx.Provider value={{ active, set: setActive }}>
      <div ref={figure} className="mb-6 flex scroll-mt-8 flex-wrap gap-2" role="tablist">
        {PANELS.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={panel === p.id}
            onClick={() => choose(p.id)}
            className={`rounded-full px-4 py-1.5 text-[13.5px] ring-1 transition-colors ${
              panel === p.id ? 'bg-wine-700 text-on-wine ring-wine-700' : 'bg-paper text-muted ring-rule hover:text-wine-700'
            }`}
          >
            <span className="mr-1.5 font-mono text-[11px] opacity-70">{p.label}</span>
            {p.title}
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="rounded-[var(--radius-lg)] bg-white p-3 ring-1 ring-rule sm:p-5">
          {panel === 'a' && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onMouseEnter={() => setActive('a-eq')}
                onFocus={() => setActive('a-eq')}
                onClick={() => setActive('a-eq')}
                aria-pressed={active === 'a-eq'}
                className={`rounded-[10px] px-5 py-1.5 text-[16px] text-muted ring-1 transition-colors ${
                  active === 'a-eq' ? 'bg-coral-100 ring-coral-300' : 'bg-transparent ring-transparent'
                }`}
              >
                <Tex>{'(\\hat A_t, \\hat Z_t) = \\varepsilon - v_\\theta(\\varepsilon, 1, c_t)'}</Tex>
              </button>
            </div>
          )}
          <svg viewBox={panel === 'a' ? '0 44 860 308' : '0 0 860 352'} className="block h-auto w-full" role="group" aria-label={PANELS.find((p) => p.id === panel)?.title}>
            <Defs />
            <Body />
          </svg>
          <p className="mt-2 px-1 font-mono text-[11px] tracking-wide text-faint">Hover or tap any block.</p>
        </div>
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div key={active} className="rise rounded-[var(--radius-lg)] bg-coral-50 p-5 ring-1 ring-rule">
            <p className="eyebrow mb-2 text-wine-500">
              {PANELS.find((p) => p.id === detail.panel)?.label} {PANELS.find((p) => p.id === detail.panel)?.title}
            </p>
            <h4 className="display mb-4 text-[30px] leading-none text-wine-800">{detail.title}</h4>
            {detail.visual && <div className="mb-4 rounded-[var(--radius-md)] bg-white p-3 ring-1 ring-rule">{detail.visual}</div>}
            <p className="text-[14px] leading-[1.7] text-ink">{detail.body}</p>
            <button
              type="button"
              onClick={() => jump(more.target)}
              className="group mt-5 inline-flex items-center gap-2 border-t border-rule pt-4 text-[13.5px] font-medium text-wine-700 transition-colors hover:text-wine-500"
            >
              Read more: {more.label}
              <span aria-hidden className="transition-transform group-hover:translate-y-0.5">
                ↓
              </span>
            </button>
          </div>
        </aside>
      </div>
      {away && (
        <div className="pointer-events-none fixed inset-x-0 z-40 flex justify-center" style={{ bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}>
          <button
            type="button"
            onClick={() => {
              figure.current?.scrollIntoView({ block: 'start' });
              setAway(false);
            }}
            className="rise pointer-events-auto rounded-full bg-wine-700 px-4 py-2 text-[13px] text-on-wine shadow-lg ring-1 ring-wine-800 transition-colors hover:bg-wine-800"
          >
            Back to figure ↑
          </button>
        </div>
      )}
    </ActiveCtx.Provider>
  );
}
