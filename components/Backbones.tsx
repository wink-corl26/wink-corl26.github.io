import { BACKBONES } from '@/lib/data';

function Mask({ va, av }: { va: boolean; av: boolean }) {
  const cell = (on: boolean, tone: string) => (
    <span
      className="block h-5 w-5 rounded-[3px]"
      style={on ? { background: tone } : { background: 'white', boxShadow: 'inset 0 0 0 1px var(--rule-strong)' }}
    />
  );
  return (
    <span className="inline-grid grid-cols-2 gap-1" aria-hidden>
      {cell(true, 'var(--brand-600)')}
      {cell(va, 'var(--brand-600)')}
      {cell(av, 'var(--tint-400)')}
      {cell(true, 'var(--tint-400)')}
    </span>
  );
}

export function Backbones() {
  const rows: { label: string; render: (b: (typeof BACKBONES)[number]) => React.ReactNode }[] = [
    { label: 'Video backbone', render: (b) => b.video },
    {
      label: 'Attention (rows read columns: video, action)',
      render: (b) => (
        <span className="flex items-center gap-3">
          <Mask va={b.videoSeesActions} av={b.actionsSeeVideo} />
          <span className="text-[12.5px] text-muted">
            {b.videoSeesActions && b.actionsSeeVideo ? 'bidirectional' : b.actionsSeeVideo ? 'actions read video' : 'separate streams'}
          </span>
        </span>
      ),
    },
    { label: 'Video objective', render: (b) => (b.driftVideo ? 'DINOv2 drifting' : '–') },
    { label: 'Action objective', render: (b) => (b.driftActions ? 'Per-dimension drifting' : b.supervision) },
    { label: 'DINO problems per future', render: (b) => b.tokens.toLocaleString('en-US') },
    { label: 'Particles per condition', render: (b) => b.particles },
  ];
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] bg-white ring-1 ring-rule">
      <table className="w-full min-w-[640px] text-left text-[14px]">
        <thead>
          <tr className="border-b border-rule">
            <th className="px-5 py-4" />
            {BACKBONES.map((b) => (
              <th key={b.name} className="px-5 py-4 font-normal">
                <span className="display text-[26px] leading-none text-brand-800">{b.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-rule last:border-0">
              <td className="px-5 py-3 text-[13px] text-muted">{r.label}</td>
              {BACKBONES.map((b) => (
                <td key={b.name} className="px-5 py-3 text-ink">
                  {r.render(b)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
