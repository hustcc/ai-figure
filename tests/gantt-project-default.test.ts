import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('gantt chart — software project plan, default palette', () => {
  const svg = fig({
    figure: 'gantt',
    title: 'Software Project Plan',
    subtitle: 'Q1 2025 — Roadmap',
    tasks: [
      { id: 'design',  label: 'Design',          start: '2025-01-06', end: '2025-01-24' },
      { id: 'dev-fe',  label: 'Frontend Dev',     start: '2025-01-20', end: '2025-02-28', groupId: 'dev' },
      { id: 'dev-be',  label: 'Backend Dev',      start: '2025-01-13', end: '2025-03-07', groupId: 'dev' },
      { id: 'qa',      label: 'QA Testing',       start: '2025-02-24', end: '2025-03-14', groupId: 'qa' },
      { id: 'perf',    label: 'Perf Testing',     start: '2025-03-03', end: '2025-03-14', groupId: 'qa' },
      { id: 'deploy',  label: 'Deploy',           start: '2025-03-17', end: '2025-03-21' },
    ],
    milestones: [
      { date: '2025-01-24', label: 'Design freeze' },
      { date: '2025-03-21', label: 'Launch' },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('gantt-project-default', svg);
});
