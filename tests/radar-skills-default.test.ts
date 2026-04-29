import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('radar chart — skills matrix, default palette', () => {
  const svg = fig({
    figure: 'radar',
    title: 'Engineering Skills Matrix',
    subtitle: 'Senior vs Mid-level',
    axes: ['System Design', 'Coding', 'Testing', 'Communication', 'Leadership', 'Ownership'],
    series: [
      { label: 'Senior', values: [92, 88, 85, 90, 88, 95] },
      { label: 'Mid',    values: [70, 80, 75, 72, 60, 70] },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('radar-skills-default', svg);
});
