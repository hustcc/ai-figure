import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('gantt chart — annual product roadmap, paired palette (quarterly ticks)', () => {
  const svg = fig({
    figure: 'gantt',
    title: 'Annual Product Roadmap',
    subtitle: '2025 — Q1 to Q4',
    tasks: [
      // Q1
      { id: 'discovery',  label: 'Discovery',        start: '2025-01-06', end: '2025-02-14', groupId: 'Q1' },
      { id: 'prototypes', label: 'Prototyping',       start: '2025-02-10', end: '2025-03-28', groupId: 'Q1' },
      // Q2
      { id: 'alpha',      label: 'Alpha Build',       start: '2025-04-01', end: '2025-05-30', groupId: 'Q2' },
      { id: 'user-tests', label: 'User Testing',      start: '2025-05-12', end: '2025-06-20', groupId: 'Q2' },
      // Q3
      { id: 'beta',       label: 'Beta Release',      start: '2025-07-01', end: '2025-08-29', groupId: 'Q3' },
      { id: 'marketing',  label: 'Marketing Prep',    start: '2025-08-01', end: '2025-09-30', groupId: 'Q3' },
      // Q4
      { id: 'launch',     label: 'GA Launch',         start: '2025-10-01', end: '2025-10-31', groupId: 'Q4' },
      { id: 'growth',     label: 'Growth Campaign',   start: '2025-11-01', end: '2025-12-19', groupId: 'Q4' },
    ],
    milestones: [
      { date: '2025-03-28', label: 'Prototype done' },
      { date: '2025-07-01', label: 'Beta launch' },
      { date: '2025-10-01', label: 'GA launch' },
    ],
    palette: 'paired',
  });
  matchSvgSnapshot('gantt-annual-roadmap-paired', svg);
});
