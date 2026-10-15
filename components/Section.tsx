import type { ReactNode } from 'react';

type Tone = 'paper' | 'blush' | 'wine';

const TONES: Record<Tone, string> = {
  paper: 'bg-paper text-ink',
  blush: 'bg-coral-50 text-wine-900',
  wine: 'on-wine bg-wine-800 text-on-wine',
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
  const onWine = tone === 'wine';
  return (
    <header className={`mb-10 ${center ? 'text-center' : ''}`}>
      <p className="eyebrow mb-3" style={{ color: onWine ? 'var(--coral-300)' : 'var(--wine-500)' }}>
        {kicker}
      </p>
      <h2
        className="display"
        style={{
          fontSize: 'clamp(38px, 5.4vw, 64px)',
          lineHeight: 1.02,
          color: onWine ? 'var(--on-wine)' : 'var(--wine-800)',
        }}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={`mt-5 text-[17px] leading-[1.7] ${center ? 'mx-auto' : ''} max-w-[62ch]`}
          style={{ color: onWine ? 'var(--on-wine-muted)' : 'var(--ink-muted)' }}
        >
          {lede}
        </p>
      )}
    </header>
  );
}

export function SubHeading({ children, tone = 'paper' }: { children: ReactNode; tone?: Tone }) {
  return (
    <h3
      className="display mb-4 mt-16"
      style={{ fontSize: 'clamp(28px, 3.4vw, 38px)', lineHeight: 1.1, color: tone === 'wine' ? 'var(--on-wine)' : 'var(--wine-700)' }}
    >
      {children}
    </h3>
  );
}

export function Caption({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <p className="mt-3 text-[13.5px] leading-[1.65] text-muted">
      {label && <span className="font-semibold text-wine-700">{label} </span>}
      {children}
    </p>
  );
}
