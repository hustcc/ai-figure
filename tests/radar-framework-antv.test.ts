import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('radar chart — framework comparison, antv palette', () => {
  const svg = fig({
    figure: 'radar',
    title: 'Framework Comparison',
    subtitle: '2025 technical evaluation',
    axes: ['Performance', 'Scalability', 'DX', 'Ecosystem', 'Tooling'],
    series: [
      { label: 'React',   values: [75, 80, 90, 95, 88] },
      { label: 'Vue',     values: [82, 72, 90, 82, 80] },
      { label: 'Angular', values: [65, 92, 72, 90, 86] },
    ],
    palette: 'antv',
  });
  matchSvgSnapshot('radar-framework-antv', svg);
});
