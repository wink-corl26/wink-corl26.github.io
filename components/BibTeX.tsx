'use client';

import { useState } from 'react';

const ENTRY = `@misc{wink2026,
  title  = {Imagine in a {WINK}: One-Step World Action Models via Drifting},
  author = {Anonymous},
  year   = {2026}
}`;

export function BibTeX() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-[var(--radius-lg)] bg-tint-50 p-5 font-mono text-[12.5px] leading-[1.7] text-brand-900 ring-1 ring-rule">
        {ENTRY}
      </pre>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(ENTRY).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          });
        }}
        className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-[12px] text-brand-700 ring-1 ring-rule transition-colors hover:bg-tint-100"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
