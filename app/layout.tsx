import type { Metadata, Viewport } from 'next';
import { Instrument_Sans, IBM_Plex_Mono } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';

const body = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body-face',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-face',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Imagine in a WINK',
  description:
    'WINK is a one-step world-action model that jointly generates robot actions and future visual observations in a single forward pass, trained with teacher-free drifting.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#fffaf8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${mono.variable}`}>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/ehl8vfy.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
