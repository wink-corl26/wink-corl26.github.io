import { TitleEyelid } from '@/components/WinkTitle';
import { Architecture } from '@/components/arch/Architecture';
import { Imagination } from '@/components/Imagination';
import { BlurToy } from '@/components/BlurToy';
import { DriftPlayground } from '@/components/DriftPlayground';
import { StreamingNumbers, StreamingTimeline } from '@/components/Streaming';
import { MultiresTable, MultiresViewer } from '@/components/Multires';
import { MainResults } from '@/components/results/MainResults';
import { LatencyLadder } from '@/components/results/LatencyLadder';
import { Staircase } from '@/components/results/Staircase';
import { Backbones } from '@/components/Backbones';
import { Band, Caption, Container, Heading, SubHeading } from '@/components/Section';
import { Tex } from '@/components/Tex';

const ABSTRACT =
  'World-action models (WAMs) bring visual foresight to robot control, but the cost of imagination limits how quickly robots can act. We introduce WINK, a one-step WAM that jointly generates robot actions and future visual observations in one forward pass. We directly adapt pretrained WAMs through teacher-free drifting. Across three pretrained backbones and diverse manipulation benchmarks, WINK matches multi-step samplers in task success and approaches their video fidelity, while reducing inference latency by 2–10× across hardware from consumer laptops to datacenter GPUs. Zero-shot committed-prefix streaming further improves RoboCasa success by 9 percentage points and enables real-time closed-loop control on a laptop, while multi-resolution imagination reduces laptop latency by an additional 20%.';

const CONTRIBUTIONS = [
  {
    lead: 'One-step world-action generation.',
    body: 'We fine-tune EasyWAM, OpenWAM-α and InternW0-Δ with drifting-based objectives, preserving task success and approaching multi-step video fidelity at a fraction of the replanning latency.',
  },
  {
    lead: 'Zero-shot committed-prefix streaming.',
    body: 'Single-pass inference lets the model condition on the actions committed while it computes, enabling uninterrupted control; this improves RoboCasa success by 9 points and achieves real-time LIBERO control on a laptop.',
  },
  {
    lead: 'Multi-resolution imagination.',
    body: 'We allocate fine-resolution future-video tokens to action-relevant regions. On OpenWAM-α this reduces laptop inference latency by 20% without a significant loss in RoboCasa task success.',
  },
];

function Hero() {
  return (
    <header>
      <div className="px-4 pt-12 sm:pt-16">
        <TitleEyelid
          tone="paper"
          banner={[
            'One forward pass for actions and imagined futures',
            'Teacher-free drifting',
            'Multi-step task success at one step',
            '2–10× lower replanning latency',
            '+9 points on RoboCasa with zero-shot streaming',
            'Real-time closed-loop control on a laptop',
            '20% faster on a laptop with multiresolution imagination',
          ]}
        />
      </div>
      <div className="flex flex-col items-center gap-5 px-4 pt-6">
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted">Anonymous Author(s)</p>
        <nav className="flex flex-wrap justify-center gap-3" aria-label="Links">
          <span className="cursor-not-allowed rounded-full px-5 py-2 text-[14px] text-faint ring-1 ring-rule" title="Available after review">
            Paper
          </span>
          <a href="#abstract" className="rounded-full bg-wine-700 px-5 py-2 text-[14px] text-on-wine transition-colors hover:bg-wine-800">
            Abstract
          </a>
          <span className="cursor-not-allowed rounded-full px-5 py-2 text-[14px] text-faint ring-1 ring-rule" title="Available after review">
            BibTeX
          </span>
        </nav>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />

      <Band id="imagine" className="!pt-14 sm:!pt-16">
        <Container wide>
          <Heading
            kicker="Imagined futures"
            title="What each model imagines in one step"
            lede="With a single forward pass, one-step flow averages plausible futures and blurs the scene; budget-matched flow fine-tuning does not recover it. WINK generates sharp, plausible futures at the same cost."
          />
          <Imagination />
        </Container>
      </Band>

      <Band id="abstract" tone="blush">
        <Container>
          <p className="eyebrow mb-5 text-center text-wine-500">Abstract</p>
          <p className="text-[18px] leading-[1.75] text-wine-900">{ABSTRACT}</p>
          <ol className="mt-12 space-y-5 border-t border-coral-200 pt-10">
            {CONTRIBUTIONS.map((c, i) => (
              <li key={c.lead} className="grid grid-cols-[34px_minmax(0,1fr)] gap-2">
                <span className="display pt-0.5 text-[26px] leading-none text-wine-400">{i + 1}</span>
                <p className="text-[15.5px] leading-[1.7] text-wine-900">
                  <strong className="font-semibold">{c.lead}</strong> {c.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </Band>

      <Band id="method">
        <Container wide>
          <Heading
            kicker="Method"
            title="One forward pass for actions and a future"
            lede={
              <>
                We take a pretrained WAM that ordinarily generates videos and actions through multiple denoising steps and train its
                one-step output directly to produce plausible futures and useful robot actions. At decision step <Tex>t</Tex> the model
                conditions on <Tex>{'c_t = (h_t, q_t, \\ell)'}</Tex> and generates the action chunk <Tex>{'A_t'}</Tex> and future-video
                latents <Tex tail=",">{'Z_t'}</Tex> modeling <Tex tail=".">{'p_\\theta(A_t, Z_t \\mid c_t)'}</Tex>
              </>
            }
          />
          <Architecture />
        </Container>
        <Container className="mt-24">
          <SubHeading id="why-blur">Why a single flow step blurs</SubHeading>
          <div className="prose-wink text-[16px] text-ink">
            <p>
              A flow-matching WAM learns the velocity <Tex>{'v_\\theta(x_s, s, c_t) \\approx \\varepsilon - x'}</Tex> along the straight
              path <Tex tail=",">{'x_s = (1 - s)\\,x + s\\,\\varepsilon'}</Tex> where <Tex tail=".">{'x = (A_t, Z_t)'}</Tex> Generation integrates this
              field from noise to data, one network evaluation per step. Taking one Euler step from pure noise gives the one-step map
            </p>
          </div>
          <Tex block>{'g_\\theta(\\varepsilon, c_t) = \\varepsilon - v_\\theta(\\varepsilon, 1, c_t).'}</Tex>
          <div className="prose-wink text-[16px] text-ink">
            <p>
              At <Tex>{'s = 1'}</Tex> the input is independent of the target, so the MSE-optimal velocity is{' '}
              <Tex>{'\\varepsilon - \\mathbb{E}[x \\mid c_t]'}</Tex> and the one-step output collapses to the conditional mean{' '}
              <Tex tail=":">{'g^*(\\varepsilon, c_t) = \\mathbb{E}[x \\mid c_t]'}</Tex> the noise drops out. Two equally good paths around an
              obstacle average to one that goes through it, and averaged futures blur moving objects.
            </p>
          </div>
          <div className="mt-8">
            <BlurToy />
          </div>
        </Container>
        <Container className="mt-24">
          <SubHeading id="drifting">Drifting</SubHeading>
          <div className="prose-wink text-[16px] text-ink">
            <p>
              Drifting trains the one-step map so that different noise draws give different plausible outputs. For each condition we
              draw <Tex>G</Tex> noises and generate <Tex>G</Tex> particles <Tex tail=".">{'u_i'}</Tex> Each particle is attracted toward the
              recorded data and repelled by the other particles, with affinities{' '}
              <Tex>{'w_{ij} = \\sqrt{\\mathrm{softmax}_j(-d_{ij}/s\\tau)\\,\\mathrm{softmax}_i(-d_{ij}/s\\tau)}'}</Tex> normalized over
              both targets and particles:
            </p>
          </div>
          <Tex block>
            {
              'V_i = \\Big(\\sum_n w^-_{in}\\Big) \\sum_p w^+_{ip}\\,(y^+_p - u_i) \\;-\\; \\Big(\\sum_p w^+_{ip}\\Big) \\sum_n w^-_{in}\\,(y^-_n - u_i), \\qquad \\mathcal{L}_{\\text{drift}} = \\frac{1}{G}\\sum_{i=1}^{G} \\big\\|u_i - \\mathrm{sg}(u_i + V_i)\\big\\|^2.'
            }
          </Tex>
          <div className="prose-wink text-[16px] text-ink">
            <p>
              The gradient of the loss moves each particle along <Tex tail=",">{'V_i'}</Tex> and backpropagates through the generator until the
              field vanishes. Because the field is built from distances, the space it lives in matters: we drift the video in{' '}
              <strong>DINOv2 patch features</strong> of the decoded future frames, one small problem per frame, camera and patch, with
              patches that change between the current and future frame weighted up. Actions are drifted{' '}
              <strong>one dimension at a time</strong>, each particle an <Tex>H</Tex>-step trajectory, with a no-op trajectory as an extra
              negative. At deployment we average pretrained and fine-tuned weights.
            </p>
          </div>
          <div className="mt-8">
            <DriftPlayground />
          </div>
        </Container>
        <Container wide className="mt-24">
          <div className="mx-auto max-w-[760px]">
            <SubHeading>Three pretrained backbones</SubHeading>
            <p className="mb-8 text-[16px] leading-[1.7] text-ink">
              We keep each backbone&apos;s architecture, token layout and output heads, and change only the training signal. The
              backbones differ in how their video and action streams attend to each other, which decides what streaming can do.
            </p>
          </div>
          <Backbones />
        </Container>
      </Band>

      <Band id="streaming" tone="wine">
        <Container wide>
          <Heading
            tone="wine"
            kicker="Zero-shot streaming"
            title="Keep moving while the model thinks"
            lede="While the robot executes d previously committed actions, OpenWAM-α predicts the next chunk with those actions fixed as clean tokens (σ = 0) and the remaining H − d actions initialized from noise (σ = 1). Its bidirectional attention lets both future actions and video condition on the committed motion, without retraining. We use d = 8, 400 ms at 20 Hz."
          />
          <StreamingTimeline />
          <div className="mt-8">
            <StreamingNumbers />
          </div>
          <p className="mt-8 max-w-[70ch] text-[15px] leading-[1.7] text-on-wine-muted">
            Streaming improves RoboCasa success by 9.1 ± 0.9 percentage points, reaching 50.1% with faster TAEHV encoding, and the gain
            extends to held-out kitchens (+7.5 ± 0.9 points).
          </p>
        </Container>
      </Band>

      <Band id="multires">
        <Container wide>
          <Heading
            kicker="Multiresolution imagination"
            title="Imagine in detail only where it matters"
            lede="On the M2 Max, video-expert GEMMs account for 83% of OpenWAM-α's inference latency, so we reduce future-video computation rather than network depth. Action-guided foveation keeps fine resolution in the 12 blocks a lightweight router judges most relevant to the predicted actions; motion gating skips future tokens in regions predicted to remain static."
          />
          <MultiresViewer />
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
            <MultiresTable />
            <div className="prose-wink text-[15px] text-ink">
              <p>
                Foveation and gating reduce laptop latency by 20% and 17%, with minimal changes in RoboCasa success. Uniform coarsening,
                by comparison, loses 7.6 percentage points.
              </p>
              <p>
                A coarse token&apos;s head predicts the clean estimate <Tex tail=",">{'\\hat x_0 = \\bar z - h'}</Tex> which is lifted back to the
                dense grid. Upsampling the velocity instead would leave the fine-scale noise that pooling discarded in the output.
              </p>
            </div>
          </div>
        </Container>
      </Band>

      <Band id="results" tone="blush">
        <Container wide>
          <Heading
            tone="blush"
            kicker="Results"
            title="Multi-step success, one-step cost"
            lede="With a single forward pass, WINK matches multi-step task success while largely preserving future-video fidelity, even surpassing the multi-step InternW0-Δ baseline. Neither naive one-step flow nor budget-matched flow fine-tuning recovers comparable video fidelity."
          />
          <MainResults />
        </Container>
        <Container wide className="mt-24">
          <SubHeading>Latency across hardware</SubHeading>
          <p className="mb-8 max-w-[70ch] text-[16px] leading-[1.7] text-ink">
            We measure replanning latency from a consumer laptop to a datacenter GPU, and estimate full task
            completion time at 20 Hz from closed-loop episode lengths and measured device latencies.
          </p>
          <LatencyLadder />
          <div className="mt-12">
            <Staircase />
          </div>
          <Caption>
            Each step reports its own measurement. The foveation step is the relative saving measured on RoboCasa365 (dense 412 ms, fovea
            328 ms on the M2 Max).
          </Caption>
        </Container>
      </Band>

      <Band id="conclusion" tone="wine">
        <Container>
          <p className="eyebrow mb-5 text-coral-300">Conclusion</p>
          <p className="display text-[clamp(26px,3.4vw,36px)] leading-[1.25] text-on-wine">
            WINK is a teacher-free WAM that generates robot actions and imagined futures in a single forward pass. By training with a
            drifting objective, it preserves multi-step sampling&apos;s task success and most of its world fidelity, while substantially
            reducing replanning latency on laptop and GPU deployments.
          </p>
          <p className="mt-8 text-[16px] leading-[1.7] text-on-wine-muted">
            WINK further enables zero-shot streaming and multi-resolution imagination, bringing world-action models closer to real-time
            deployment on onboard hardware.
          </p>
        </Container>
      </Band>

      <footer className="border-t border-rule bg-paper px-4 py-10 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">Imagine in a WINK</p>
      </footer>
    </main>
  );
}
