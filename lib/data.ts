export type ArmId = 'flow10' | 'flow1' | 'flowft' | 'wink';

export const ARMS: { id: ArmId; label: string; passes: string; note: string }[] = [
  { id: 'flow10', label: 'Flow', passes: 'multi-step', note: 'Released model, its own multi-step sampler' },
  { id: 'flow1', label: 'Flow-1', passes: '1 pass', note: 'Released model, one step' },
  { id: 'flowft', label: 'Flow FT', passes: '1 pass', note: 'Budget-matched one-step flow fine-tune' },
  { id: 'wink', label: 'WINK', passes: '1 pass', note: 'Drifting fine-tune, one step' },
];

export type MainRow = {
  benchmark: string;
  base: string;
  sr: Record<ArmId, number>;
  fvd: Record<ArmId, number>;
  dagger?: boolean;
};

export const MAIN_TABLE: MainRow[] = [
  {
    benchmark: 'LIBERO',
    base: 'EasyWAM',
    sr: { flow10: 98.3, flow1: 98.4, flowft: 98.35, wink: 98.3 },
    fvd: { flow10: 43.1, flow1: 140.2, flowft: 149.8, wink: 54.7 },
  },
  {
    benchmark: 'LIBERO',
    base: 'OpenWAM-α',
    sr: { flow10: 99.25, flow1: 98.8, flowft: 98.95, wink: 99.3 },
    fvd: { flow10: 17.9, flow1: 38.3, flowft: 47.2, wink: 19.9 },
  },
  {
    benchmark: 'LIBERO-Plus',
    base: 'InternW0-Δ',
    sr: { flow10: 92.71, flow1: 92.64, flowft: 92.63, wink: 92.76 },
    fvd: { flow10: 15.2, flow1: 18.8, flowft: 20.6, wink: 14.2 },
    dagger: true,
  },
  {
    benchmark: 'RoboCasa365',
    base: 'OpenWAM-α',
    sr: { flow10: 38.0, flow1: 37.24, flowft: 33.8, wink: 39.16 },
    fvd: { flow10: 11.0, flow1: 152.4, flowft: 162.8, wink: 21.4 },
  },
];

export type Device = 'h100' | 'a10' | 'm2';
export type LatencyPair = { action: number; joint: number | null };
export const STAIRS_H100 = { stock: 317, levers: 129.5, wink: 16.3 };

export type LatencyRow = {
  model: string;
  released: Record<Device, LatencyPair>;
  wink: Record<Device, LatencyPair> | null;
  task: { released: Record<Device, number>; wink: Record<Device, number> | null; winkStreaming: Record<Device, boolean> | null };
};

export const DEVICES: { id: Device; label: string; kind: string }[] = [
  { id: 'h100', label: 'H100', kind: 'Datacenter GPU' },
  { id: 'a10', label: 'A10', kind: 'Workstation-class GPU' },
  { id: 'm2', label: 'M2 Max', kind: 'Consumer laptop' },
];

export const LATENCY: LatencyRow[] = [
  {
    model: 'EasyWAM',
    released: { h100: { action: 129.5, joint: 195.4 }, a10: { action: 1032.9, joint: 1320.5 }, m2: { action: 5285, joint: 8978 } },
    wink: { h100: { action: 16.3, joint: 81.3 }, a10: { action: 99.2, joint: 386.6 }, m2: { action: 525, joint: 4149 } },
    task: {
      released: { h100: 7.9, a10: 19.5, m2: 75.0 },
      wink: { h100: 6.3, a10: 7.3, m2: 12.8 },
      winkStreaming: { h100: false, a10: false, m2: false },
    },
  },
  {
    model: 'OpenWAM-α',
    released: { h100: { action: 91.7, joint: 170.4 }, a10: { action: 405.6, joint: 858.9 }, m2: { action: 2082, joint: 12203 } },
    wink: { h100: { action: 21.5, joint: 99.5 }, a10: { action: 95.2, joint: 541.6 }, m2: { action: 442, joint: 9380 } },
    task: {
      released: { h100: 7.4, a10: 11.5, m2: 33.4 },
      wink: { h100: 6.2, a10: 6.2, m2: 6.9 },
      winkStreaming: { h100: true, a10: true, m2: true },
    },
  },
  {
    model: 'InternW0-Δ',
    released: { h100: { action: 64.3, joint: 896 }, a10: { action: 298.6, joint: 2061.9 }, m2: { action: 2369, joint: 24506 } },
    wink: { h100: { action: 24.1, joint: 221 }, a10: { action: 135.6, joint: 624.0 }, m2: { action: 957, joint: 14920 } },
    task: {
      released: { h100: 7.1, a10: 10.2, m2: 37.1 },
      wink: { h100: 6.6, a10: 8.0, m2: 18.7 },
      winkStreaming: { h100: false, a10: false, m2: false },
    },
  },
  {
    model: 'Faster-WAM',
    released: { h100: { action: 38.4, joint: null }, a10: { action: 144.9, joint: null }, m2: { action: 875, joint: null } },
    wink: null,
    task: { released: { h100: 6.6, a10: 7.9, m2: 17.4 }, wink: null, winkStreaming: null },
  },
];

export const STREAMING_TABLE = {
  columns: ['Sync', 'Prefix', 'Prefix + TAEHV'],
  rows: [
    { label: 'RoboCasa365', values: [39.2, 48.3, 50.1], best: 2 },
    { label: 'Held-out kitchens', values: [34.5, 42.0, 43.8], best: 2 },
    { label: 'LIBERO', values: [99.0, 97.4, 98.5], best: 0 },
  ],
};

export const STREAMING_PLACEBO = [
  { label: 'Committed actions', value: 47.8 },
  { label: 'Zero prefix', value: 38.6 },
  { label: 'Stationary prefix', value: 22.4 },
];

export const MULTIRES_TABLE = [
  { method: 'Dense', tokens: 360, future: 240, dsr: 0.0, se: null as number | null, m2: 412 },
  { method: 'Uniform coarse', tokens: 180, future: 60, dsr: -7.6, se: 1.1, m2: 245 },
  { method: 'Learned fovea', tokens: 252, future: 132, dsr: -0.3, se: 0.7, m2: 328 },
  { method: 'Motion gating', tokens: 248, future: 128, dsr: -0.7, se: 1.0, m2: 340 },
];

export const BACKBONES = [
  {
    name: 'EasyWAM',
    video: 'Cosmos-Predict2.5',
    videoSeesActions: false,
    actionsSeeVideo: true,
    driftVideo: true,
    driftActions: true,
    supervision: 'Drift',
    tokens: 4096,
    particles: 2,
  },
  {
    name: 'OpenWAM-α',
    video: 'Wan2.2',
    videoSeesActions: true,
    actionsSeeVideo: true,
    driftVideo: true,
    driftActions: true,
    supervision: 'Drift',
    tokens: 7680,
    particles: 4,
  },
  {
    name: 'InternW0-Δ',
    video: 'Wan2.2',
    videoSeesActions: false,
    actionsSeeVideo: false,
    driftVideo: true,
    driftActions: false,
    supervision: 'One-step flow',
    tokens: 4800,
    particles: 4,
  },
];
