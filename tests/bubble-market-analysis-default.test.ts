import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('bubble chart — market analysis, default palette', () => {
  const svg = fig({
    figure: 'bubble',
    title: 'Market Analysis',
    subtitle: 'Revenue by Product',
    items: [
      { label: 'Product A', value: 75 },
      { label: 'Product B', value: 50 },
      { label: 'Product C', value: 85 },
      { label: 'Product D', value: 30 },
      { label: 'Product E', value: 60 },
      { label: 'Product F', value: 20 },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('bubble-market-analysis-default', svg);
});
