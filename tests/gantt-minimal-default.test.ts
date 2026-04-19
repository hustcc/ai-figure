import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('gantt chart — minimal, no groups, no milestones, default palette', () => {
  const svg = fig({
    figure: 'gantt',
    tasks: [
      { id: 'research', label: 'Research',    start: '2025-03-03', end: '2025-03-14' },
      { id: 'design',   label: 'Design',      start: '2025-03-10', end: '2025-03-21' },
      { id: 'build',    label: 'Build',       start: '2025-03-17', end: '2025-04-04' },
      { id: 'review',   label: 'Code Review', start: '2025-03-31', end: '2025-04-11' },
      { id: 'ship',     label: 'Ship',        start: '2025-04-07', end: '2025-04-11' },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('gantt-minimal-default', svg);
});
