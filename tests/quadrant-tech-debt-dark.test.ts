import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('quadrant chart — tech debt evaluation, default palette, dark theme', () => {
  const svg = fig({
    figure: 'quadrant',
    title: 'Tech Debt Evaluation',
    xAxis: { label: 'Fix Cost', min: 'Low', max: 'High' },
    yAxis: { label: 'Business Risk', min: 'Low', max: 'High' },
    quadrants: ['Tackle Now', 'Schedule', 'Accept', 'Defer'],
    points: [
      { id: 'a', label: 'Outdated auth lib',    x: 0.20, y: 0.88 },
      { id: 'b', label: 'Monolith split',       x: 0.82, y: 0.78 },
      { id: 'c', label: 'CSS cleanup',          x: 0.18, y: 0.22 },
      { id: 'd', label: 'DB index gaps',        x: 0.35, y: 0.70 },
      { id: 'e', label: 'Test coverage',        x: 0.45, y: 0.60 },
      { id: 'f', label: 'Legacy Node version',  x: 0.55, y: 0.80 },
      { id: 'g', label: 'Build tool upgrade',   x: 0.60, y: 0.30 },
      { id: 'h', label: 'Deprecated API calls', x: 0.30, y: 0.50 },
    ],
    theme: 'dark',
    palette: 'default',
  });
  matchSvgSnapshot('quadrant-tech-debt-dark', svg);
});
