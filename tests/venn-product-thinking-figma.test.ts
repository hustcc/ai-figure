import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('Venn diagram — product thinking, figma palette', () => {
  const svg = fig({
    figure: 'venn',
    title: 'Product Thinking',
    sets: [
      { id: 'desirable', label: 'Desirable', sublabel: 'users want it' },
      { id: 'feasible',  label: 'Feasible',  sublabel: 'can be built'  },
      { id: 'viable',    label: 'Viable',    sublabel: 'business value' },
    ],
    intersections: [
      { sets: ['desirable', 'feasible'], label: 'Useful'   },
      { sets: ['feasible',  'viable'],   label: 'Possible' },
      { sets: ['desirable', 'viable'],   label: 'Lovable'  },
      { sets: ['desirable', 'feasible', 'viable'], label: 'Sweet Spot', accent: true },
    ],
    palette: 'figma',
  });
  matchSvgSnapshot('venn-product-thinking-figma', svg);
});
