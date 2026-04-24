import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('bubble chart — market analysis, default palette', () => {
  const svg = fig({
    figure: 'bubble',
    title: 'Market Analysis',
    subtitle: 'Revenue vs Growth Rate',
    xAxis: { label: 'Revenue', min: 'Low', max: 'High' },
    yAxis: { label: 'Growth Rate', min: 'Low', max: 'High' },
    points: [
      { id: 'a', label: 'Product A', x: 0.20, y: 0.80, size: 0.75 },
      { id: 'b', label: 'Product B', x: 0.55, y: 0.60, size: 0.50 },
      { id: 'c', label: 'Product C', x: 0.80, y: 0.30, size: 0.85 },
      { id: 'd', label: 'Product D', x: 0.35, y: 0.25, size: 0.30 },
      { id: 'e', label: 'Product E', x: 0.65, y: 0.75, size: 0.60 },
      { id: 'f', label: 'Product F', x: 0.10, y: 0.45, size: 0.20 },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('bubble-market-analysis-default', svg);
});
