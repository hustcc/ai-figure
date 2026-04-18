import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('quadrant chart — risk matrix: probability vs impact, default palette', () => {
  const svg = fig({
    figure: 'quadrant',
    xAxis: { label: 'Probability', min: 'Unlikely', max: 'Likely' },
    yAxis: { label: 'Impact',      min: 'Minor',    max: 'Critical' },
    quadrants: ['Monitor', 'Escalate', 'Accept', 'Plan'],
    points: [
      { id: 'r1', label: 'Data breach',      x: 0.30, y: 0.95 },
      { id: 'r2', label: 'Outage',           x: 0.55, y: 0.88 },
      { id: 'r3', label: 'Scope creep',      x: 0.80, y: 0.60 },
      { id: 'r4', label: 'Staff turnover',   x: 0.60, y: 0.42 },
      { id: 'r5', label: 'Vendor delay',     x: 0.75, y: 0.72 },
      { id: 'r6', label: 'Budget overrun',   x: 0.45, y: 0.55 },
      { id: 'r7', label: 'Compliance fine',  x: 0.20, y: 0.80 },
      { id: 'r8', label: 'UI bug',           x: 0.85, y: 0.15 },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('quadrant-risk-matrix-default', svg);
});
