import type { ReactNode } from 'react';

type Tone = 'paper' | 'tint' | 'dark';

const TONES: Record<Tone, string> = {
  paper: 'bg-paper text-ink',
  tint: 'bg-tint-50 text-brand-900',
  dark: 'on-brand bg-brand-800 text-on-brand',
};

export function Band({
  id,
  tone = 'paper',
  children,
  className = '',
}: {
  id?: string;
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`${TONES[tone]} px-4 py-20 sm:px-6 sm:py-28 ${className}`}>
      {children}
    </section>
  );
}

export function Container({ children, wide = false, className = '' }: { children: ReactNode; wide?: boolean; className?: string }) {
  return <div className={`mx-auto w-full ${wide ? 'max-w-[1180px]' : 'max-w-[760px]'} ${className}`}>{children}</div>;
}

export function Heading({
  kicker,
  title,
  lede,
  tone = 'paper',
  center = false,
}: {
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: Tone;
  center?: boolean;
}) {
  const onDark = tone === 'dark';
  return (
    <header className={`mb-10 ${center ? 'text-center' : ''}`}>
      <p className="eyebrow mb-3" style={{ color: onDark ? 'var(--tint-300)' : 'var(--brand-500)' }}>
        {kicker}
      </p>
      <h2
        className="display"
        style={{
          fontSize: 'clamp(32px, 4vw, 44px)',
          lineHeight: 1.02,
          color: onDark ? 'var(--on-brand)' : 'var(--brand-800)',
        }}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={`mt-5 text-[17px] leading-[1.7] ${center ? 'mx-auto' : ''} max-w-[62ch]`}
          style={{ color: onDark ? 'var(--on-brand-muted)' : 'var(--ink-muted)' }}
        >
          {lede}
        </p>
      )}
    </header>
  );
}

export function SubHeading({ children, tone = 'paper', id }: { children: ReactNode; tone?: Tone; id?: string }) {
  return (
    <h3
      id={id}
      className="display mb-4 mt-16 scroll-mt-8"
      style={{ fontSize: 'clamp(24px, 2.65vw, 29px)', lineHeight: 1.1, color: tone === 'dark' ? 'var(--on-brand)' : 'var(--brand-700)' }}
    >
      {children}
    </h3>
  );
}

export function Caption({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <p className="mt-3 text-[13.5px] leading-[1.65] text-muted">
      {label && <span className="font-semibold text-brand-700">{label} </span>}
      {children}
    </p>
  );
}
