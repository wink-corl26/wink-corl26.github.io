import type { ArmId } from './data';
import manifest from './media.json';

export type Bench = 'libero' | 'plus' | 'robocasa';

export type EpisodeArm = { real: string; imagined: string; success: boolean; frames: number };

export type Episode = {
  id: string;
  bench: Bench;
  title: string;
  fps: number;
  aspect: number;
  arms: Partial<Record<ArmId, EpisodeArm>>;
};

export type WindowClip = {
  id: string;
  bench: Bench;
  title: string;
  aspect: number;
  frames: number;
  columns: Partial<Record<ArmId | 'recorded', string>>;
};

export type Overlay = {
  id: string;
  title: string;
  aspect: number;
  frames: number;
  dense: string;
  fovea: string;
  gated: string;
  recorded: string;
  foveaBlocks: number[];
  keep: number[][][];
};

export type Manifest = {
  episodes: Episode[];
  windows: WindowClip[];
  overlays: Overlay[];
};

export const MEDIA = manifest as Manifest;

export const BENCHES: { id: Bench; label: string; base: string }[] = [
  { id: 'libero', label: 'LIBERO', base: 'EasyWAM' },
  { id: 'plus', label: 'LIBERO-Plus', base: 'EasyWAM' },
  { id: 'robocasa', label: 'RoboCasa365', base: 'OpenWAM-α' },
];

export function asset(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  return `${base}/${path}`;
}
