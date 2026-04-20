import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('pyramid diagram — AI technology stack, figma palette', () => {
  const svg = fig({
    figure: 'pyramid',
    title: 'AI Technology Stack',
    subtitle: 'Layered view from hardware to user-facing applications',
    orientation: 'pyramid',
    layers: [
      { label: 'Applications',    sublabel: 'chatbots, copilots', accent: true },
      { label: 'Foundation Models', sublabel: 'LLMs, diffusion'   },
      { label: 'ML Frameworks',   sublabel: 'PyTorch, JAX'         },
      { label: 'Cloud Compute',   sublabel: 'GPUs & TPUs'          },
      { label: 'Hardware',        sublabel: 'silicon & memory'     },
    ],
    palette: 'figma',
  });
  matchSvgSnapshot('pyramid-ai-stack-figma', svg);
});
