import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('bubble chart — tech comparison, antv palette, dark theme', () => {
  const svg = fig({
    figure: 'bubble',
    title: 'Tech Stack Comparison',
    xAxis: { label: 'Adoption', min: 'Niche', max: 'Mainstream' },
    yAxis: { label: 'Performance', min: 'Low', max: 'High' },
    points: [
      { id: 'r', label: 'Rust',       x: 0.30, y: 0.95, size: 0.45 },
      { id: 'g', label: 'Go',         x: 0.55, y: 0.88, size: 0.65 },
      { id: 'p', label: 'Python',     x: 0.90, y: 0.50, size: 0.90 },
      { id: 'n', label: 'Node.js',    x: 0.80, y: 0.60, size: 0.80 },
      { id: 'j', label: 'Java',       x: 0.75, y: 0.70, size: 0.85 },
      { id: 'c', label: 'C++',        x: 0.25, y: 0.98, size: 0.40 },
    ],
    theme: 'dark',
    palette: 'antv',
  });
  matchSvgSnapshot('bubble-tech-antv-dark', svg);
});
