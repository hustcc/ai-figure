import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('radar chart — four series cycling all node types, vega palette dark', () => {
  const svg = fig({
    figure: 'radar',
    title: 'Team Velocity',
    subtitle: 'Q1 – Q4',
    axes: ['Backend', 'Frontend', 'QA', 'DevOps'],
    series: [
      { label: 'Q1', values: [70, 65, 80, 60] },
      { label: 'Q2', values: [75, 72, 82, 68] },
      { label: 'Q3', values: [80, 78, 85, 75] },
      { label: 'Q4', values: [88, 85, 90, 82] },
    ],
    palette: 'vega',
    theme: 'dark',
  });
  matchSvgSnapshot('radar-velocity-vega-dark', svg);
});
