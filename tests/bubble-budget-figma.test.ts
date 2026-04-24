import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('bubble chart — budget allocation, figma palette', () => {
  const svg = fig({
    figure: 'bubble',
    title: 'Budget Allocation',
    subtitle: 'Q1 2025',
    items: [
      { label: 'Engineering', value: 420 },
      { label: 'Marketing',   value: 250 },
      { label: 'R&D',         value: 380 },
      { label: 'Sales',       value: 300 },
      { label: 'Support',     value: 120 },
      { label: 'HR',          value: 80  },
    ],
    palette: 'figma',
  });
  matchSvgSnapshot('bubble-budget-figma', svg);
});
