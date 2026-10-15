import type { ReactNode } from 'react';
import { Tex } from '@/components/Tex';
import { AttentionMask, MotionWeight, NoiseLift, RowBudget, StreamingRule, TokenLayout, DriftLossMini, RouterPipeline, GatingFill } from './visuals';

export type PanelId = 'a' | 'b' | 'c' | 'd';

export type Detail = {
  panel: PanelId;
  title: string;
  visual?: ReactNode;
  body: ReactNode;
};

export const PANELS: { id: PanelId; label: string; title: string; first: string }[] = [
  { id: 'a', label: '(a)', title: 'One-step generation', first: 'a-video' },
  { id: 'b', label: '(b)', title: 'Drifting', first: 'b-vfield' },
  { id: 'c', label: '(c)', title: 'Zero-shot streaming', first: 'c-stream' },
  { id: 'd', label: '(d)', title: 'Multiresolution imagination', first: 'd-fovea' },
];

export const DETAILS: Record<string, Detail> = {
  'a-context': {
    panel: 'a',
    title: 'Context',
    visual: <TokenLayout />,
    body: (
      <>
        At decision step <Tex>t</Tex> the model conditions on <Tex tail=":">{'c_t = (h_t, q_t, \\ell)'}</Tex> visual observations,
        proprioceptive state and the language instruction. On LIBERO, EasyWAM encodes a two-camera 224 × 448 canvas into
        Cosmos VAE latents and patchifies each latent frame into 392 tokens; the clean current frame is the first of three
        latent frames.
      </>
    ),
  },
  'a-noise': {
    panel: 'a',
    title: 'Future latents',
    visual: <TokenLayout highlight="future" />,
    body: (
      <>
        The model predicts <Tex>{'H = 32'}</Tex> control steps ahead (1.6 s at 20 Hz) and one frame every <Tex>{'k = 4'}</Tex>{' '}
        steps, so <Tex>{'F = 8'}</Tex> future frames per camera. The video autoencoder compresses these eight frames into two
        latent frames <Tex tail=",">{'Z_t = (z_t^1, z_t^2)'}</Tex> which the WAM generates directly from Gaussian noise.
      </>
    ),
  },
  'a-actnoise': {
    panel: 'a',
    title: 'Action chunk',
    visual: <TokenLayout highlight="action" />,
    body: (
      <>
        The action chunk <Tex>{'A_t = (a_t, \\ldots, a_{t+H-1})'}</Tex> starts as noise. On LIBERO it is a{' '}
        <Tex>{'32 \\times 7'}</Tex> array (translation, rotation, gripper); EasyWAM adds one proprioceptive token, giving 33
        action-stream tokens.
      </>
    ),
  },
  'a-video': {
    panel: 'a',
    title: 'Video expert',
    visual: <TokenLayout highlight="video" />,
    body: (
      <>
        A pretrained video diffusion transformer processes the current and future latent tokens: a 28-layer Cosmos-Predict2.5
        transformer of width 2048 in EasyWAM, a 30-layer Wan2.2 transformer of width 3072 in OpenWAM-α. It carries almost all
        of the computation, which is why the number of passes through it sets the latency.
      </>
    ),
  },
  'a-action': {
    panel: 'a',
    title: 'Action expert',
    visual: <TokenLayout highlight="action" />,
    body: (
      <>
        A separate action transformer of matching depth reads the action and state tokens. Its blocks interleave with the video
        expert&apos;s, layer by layer, through a joint self-attention over both token streams.
      </>
    ),
  },
  'a-attn': {
    panel: 'a',
    title: 'Shared attention',
    visual: <AttentionMask />,
    body: (
      <>
        The attention mask decides which stream reads which. EasyWAM lets actions attend to the generated future but not the
        reverse; OpenWAM-α is bidirectional, so committed actions can shape the imagined future; InternW0-Δ keeps the two
        streams apart and routes prediction through learned causal-imprint tokens.
      </>
    ),
  },
  'a-eq': {
    panel: 'a',
    title: 'The one-step map',
    visual: <DriftLossMini mode="mean" />,
    body: (
      <>
        The pretrained model learns a velocity <Tex>{'v_\\theta(x_s, s, c_t) \\approx \\varepsilon - x'}</Tex> along{' '}
        <Tex tail=".">{'x_s = (1-s)x + s\\varepsilon'}</Tex> A single Euler step from <Tex>{'s = 1'}</Tex> gives{' '}
        <Tex tail=".">{'g_\\theta(\\varepsilon, c_t) = \\varepsilon - v_\\theta(\\varepsilon, 1, c_t)'}</Tex> Because{' '}
        <Tex>\varepsilon</Tex> is independent of the target, the MSE-optimal velocity at <Tex>{'s = 1'}</Tex> is{' '}
        <Tex tail=",">{'\\varepsilon - \\mathbb{E}[x \\mid c_t]'}</Tex> so the one-step output collapses to the conditional mean.
      </>
    ),
  },
  'a-future': {
    panel: 'a',
    title: 'Imagined future',
    visual: <DriftLossMini mode="mean" />,
    body: (
      <>
        Under vanilla flow matching the noise cancels out of <Tex tail=":">{'g^*(\\varepsilon, c_t) = \\mathbb{E}[x \\mid c_t]'}</Tex>
        every sample is the same average of plausible futures, and moving objects blur. WINK trains this same one-step map with
        drifting so that different noise draws give different, sharp futures.
      </>
    ),
  },
  'a-actions': {
    panel: 'a',
    title: 'Actions',
    visual: <DriftLossMini mode="mean" />,
    body: (
      <>
        Averaging actions is less visibly harmful but still wrong in principle: two equally good paths around an obstacle
        average to one that goes through it. The induced policy is the marginal{' '}
        <Tex tail=".">{'\\pi_\\theta(A_t \\mid c_t) = \\int p_\\theta(A_t, Z_t \\mid c_t)\\, dZ_t'}</Tex>
      </>
    ),
  },
  'b-futures': {
    panel: 'b',
    title: 'Particles',
    visual: <DriftLossMini mode="particles" />,
    body: (
      <>
        For each training condition we draw <Tex>G</Tex> independent noises and run the one-step model on each, producing{' '}
        <Tex>G</Tex> joint video–action predictions of the same future. These particles are the samples the drifting field acts
        on; they are not counted as training data.
      </>
    ),
  },
  'b-decode': {
    panel: 'b',
    title: 'Decode',
    visual: <DriftLossMini mode="chain" />,
    body: (
      <>
        Generated latents pass through the frozen VAE decoder to eight RGB frames per camera. The recorded future goes through
        the same encode–decode path, so the positive target is the reconstruction rather than the raw recording. Gradients flow
        back through the frozen decoder into the WAM.
      </>
    ),
  },
  'b-dino': {
    panel: 'b',
    title: 'DINOv2 features',
    visual: <DriftLossMini mode="chain" />,
    body: (
      <>
        Drifting needs distances that mean something. Distances in VAE-latent or pixel space rank blurry one-step samples as
        closer to the truth; DINOv2 patch distances rank samples like LPIPS does (rank correlation ≈ +0.80), so the video field
        is computed on frozen DINOv2-B tokens of the decoded frames.
      </>
    ),
  },
  'b-patch': {
    panel: 'b',
    title: 'One field per patch',
    visual: <MotionWeight />,
    body: (
      <>
        Each (frame, camera, patch) position is its own small drifting problem in <Tex tail=":">{'\\mathbb{R}^{768}'}</Tex> thousands
        of problems per condition (4,096 on EasyWAM, 7,680 on OpenWAM-α), all backpropagating into one shared WAM. Patches whose
        features change between the current and future frame are up-weighted, so the loss concentrates on the gripper and the
        objects it moves.
      </>
    ),
  },
  'b-chunks': {
    panel: 'b',
    title: 'Per-dimension trajectories',
    visual: <DriftLossMini mode="dims" />,
    body: (
      <>
        Actions are drifted one dimension at a time: a particle is the full <Tex>{'H'}</Tex>-step trajectory of one action
        dimension, <Tex tail=",">{'u_i^{(j)} = \\hat A_t^{(i)}[:, j] \\in \\mathbb{R}^{32}'}</Tex> which gives smaller problems and a
        finer training signal than drifting the whole chunk.
      </>
    ),
  },
  'b-vfield': {
    panel: 'b',
    title: 'Video field',
    visual: <DriftLossMini mode="field" />,
    body: (
      <>
        Each particle is attracted to the recorded target and repelled by the other particles, with kernel weights normalized
        over both targets and particles. The loss <Tex>{'\\|u_i - \\mathrm{sg}(u_i + V_i)\\|^2'}</Tex> moves each particle
        along <Tex tail=";">{'V_i'}</Tex> training stops changing the generator once the field vanishes, i.e. when the particle
        population matches the data.
      </>
    ),
  },
  'b-afield': {
    panel: 'b',
    title: 'Action field',
    visual: <DriftLossMini mode="field" />,
    body: (
      <>
        The same attraction–repulsion rule runs on each action dimension&apos;s trajectory, with the demonstrated trajectory as
        the positive and the other generated trajectories as negatives. Video and action losses are summed and update the
        interacting experts together.
      </>
    ),
  },
  'b-noop': {
    panel: 'b',
    title: 'No-op negative',
    visual: <DriftLossMini mode="noop" />,
    body: (
      <>
        One extra negative per condition is the trajectory that does nothing: zero translation and rotation, gripper held at its
        first commanded value. It pushes generated chunks away from the stationary collapse mode.
      </>
    ),
  },
  'c-sync': {
    panel: 'c',
    title: 'Synchronous control',
    visual: <StreamingRule mode="sync" />,
    body: (
      <>
        In the published protocols the robot stops while the model computes the next chunk, then executes it. Every
        millisecond of inference becomes waiting time; on a laptop, released models spend most of a task waiting.
      </>
    ),
  },
  'c-wait': {
    panel: 'c',
    title: 'Waiting',
    visual: <StreamingRule mode="sync" />,
    body: (
      <>
        On the laptop, WINK with streaming reduces average LIBERO task completion time from 54.2 s to 8.3 s, cutting
        inference-induced waiting from 85% to 5%.
      </>
    ),
  },
  'c-stream': {
    panel: 'c',
    title: 'Streaming',
    visual: <StreamingRule mode="stream" />,
    body: (
      <>
        The next pass starts while the robot executes the last <Tex>d</Tex> actions of the current chunk. Uninterrupted
        execution needs the latency to fit the committed window, <Tex tail=",">{'L \\le d\\,\\Delta t'}</Tex> and the chunk to cover the
        delay plus the stride, <Tex tail=".">{'d + s \\le H'}</Tex> We use <Tex tail=":">{'d = 8'}</Tex> 400 ms at 20 Hz.
      </>
    ),
  },
  'c-commit': {
    panel: 'c',
    title: 'Committed prefix',
    visual: <StreamingRule mode="prefix" />,
    body: (
      <>
        The actions already committed to the robot are known when the next pass starts. Feeding them in as clean tokens lets
        the model plan a continuation of the motion that is actually happening, rather than one that ignores it.
      </>
    ),
  },
  'c-input': {
    panel: 'c',
    title: 'Per-token noise levels',
    visual: <StreamingRule mode="prefix" />,
    body: (
      <>
        A per-token action timestep sets the committed tokens to <Tex>{'\\sigma = 0'}</Tex> and the rest to{' '}
        <Tex tail=",">{'\\sigma = 1'}</Tex> with no new parameters and no retraining. Under OpenWAM-α&apos;s bidirectional mask the
        imagined future reads the prefix too.
      </>
    ),
  },
  'c-pass': {
    panel: 'c',
    title: 'One pass per replan',
    visual: <StreamingRule mode="stream" />,
    body: (
      <>
        Streaming only pays off when one pass fits inside the committed window. A ten-step sampler does not fit at 400 ms on a
        laptop; a single pass does.
      </>
    ),
  },
  'd-dense': {
    panel: 'd',
    title: 'Dense future',
    visual: <RowBudget highlight="dense" />,
    body: (
      <>
        OpenWAM-α patchifies each 24 × 20 latent frame into 120 tokens: 360 video rows per layer, 240 of them for the future.
        On the M2 Max, video-expert matrix multiplications account for 83% of inference latency, so future rows are what a
        laptop pays for.
      </>
    ),
  },
  'd-fovea': {
    panel: 'd',
    title: 'Action-guided foveation',
    visual: <RouterPipeline />,
    body: (
      <>
        A 0.8M-parameter router reads the current frame&apos;s features after four transformer layers, pools them into 30
        blocks of 2 × 2 tokens, and keeps the top 12 at full resolution. It is trained to match action saliency: how strongly
        perturbing a block&apos;s features changes the predicted actions. The remaining blocks become single coarse tokens.
      </>
    ),
  },
  'd-coarse': {
    panel: 'd',
    title: 'Coarse tokens',
    visual: <NoiseLift />,
    body: (
      <>
        A coarse token embeds a 4 × 4 latent region through a new embedding initialized from the pretrained one, plus a learned
        extent embedding. Its head predicts the clean estimate, which is lifted back to the dense grid: upsampling a velocity
        instead would leave the discarded fine-scale noise in the output.
      </>
    ),
  },
  'd-gated': {
    panel: 'd',
    title: 'Motion gating',
    visual: <GatingFill />,
    body: (
      <>
        A second head on the same layer-4 features predicts, for each future token, whether its region will change. The 128
        highest-scoring of 240 future tokens are computed; the rest are filled from a held-still prediction of the current
        frame, so the decoder still receives a dense latent video.
      </>
    ),
  },
  'd-rows': {
    panel: 'd',
    title: 'Rows per layer',
    visual: <RowBudget highlight="all" />,
    body: (
      <>
        Fewer rows means less work in every projection, MLP and attention of the video expert. On RoboCasa365, foveation keeps
        task success within noise of the dense model at 70% of the rows (−0.3 ± 0.7 points) and cuts M2 Max latency by 20%;
        uniform coarsening loses 7.6 points.
      </>
    ),
  },
};
