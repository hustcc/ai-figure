import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it("pyramid diagram — Maslow's hierarchy of needs, antv palette", () => {
  const svg = fig({
    figure: 'pyramid',
    title: "Maslow's Hierarchy",
    subtitle: 'Five-tier model of human motivation',
    orientation: 'pyramid',
    layers: [
      { label: 'Self-Actualisation', sublabel: 'achieving full potential', accent: true },
      { label: 'Esteem',             sublabel: 'respect and recognition'   },
      { label: 'Love & Belonging',   sublabel: 'relationships and community' },
      { label: 'Safety',             sublabel: 'security and stability'     },
      { label: 'Physiological',      sublabel: 'food, water and shelter'    },
    ],
    palette: 'antv',
  });
  matchSvgSnapshot('pyramid-maslow-antv', svg);
});
