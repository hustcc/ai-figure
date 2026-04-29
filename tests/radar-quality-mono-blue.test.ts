import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('radar chart — single series, mono-blue palette', () => {
  const svg = fig({
    figure: 'radar',
    title: 'Product Quality',
    axes: ['Reliability', 'Performance', 'Security', 'Usability', 'Maintainability'],
    series: [
      { label: 'v2.0', values: [88, 76, 92, 80, 70] },
    ],
    palette: 'mono-blue',
  });
  matchSvgSnapshot('radar-quality-mono-blue', svg);
});
