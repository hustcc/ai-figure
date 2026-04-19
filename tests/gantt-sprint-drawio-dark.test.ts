import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('gantt chart — sprint plan, drawio palette, dark theme', () => {
  const svg = fig({
    figure: 'gantt',
    title: 'Sprint 12',
    tasks: [
      { id: 't1', label: 'Auth service',    start: '2025-04-07', end: '2025-04-18' },
      { id: 't2', label: 'Dashboard UI',    start: '2025-04-07', end: '2025-04-25' },
      { id: 't3', label: 'API integration', start: '2025-04-14', end: '2025-04-30' },
      { id: 't4', label: 'E2E tests',       start: '2025-04-21', end: '2025-04-30' },
    ],
    milestones: [
      { date: '2025-04-30', label: 'Sprint done' },
    ],
    theme: 'dark',
    palette: 'drawio',
  });
  matchSvgSnapshot('gantt-sprint-drawio-dark', svg);
});
