import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('gantt chart — db migration, custom hex colors, dark theme', () => {
  const svg = fig({
    figure: 'gantt',
    title: 'Database Migration',
    subtitle: 'Postgres → Aurora',
    tasks: [
      {
        id: 'audit',
        label: 'Schema Audit',
        start: '2025-05-05',
        end: '2025-05-16',
        color: '#20c997',
      },
      {
        id: 'shadow',
        label: 'Shadow Write',
        start: '2025-05-12',
        end: '2025-06-06',
        color: '#74c0fc',
      },
      {
        id: 'backfill',
        label: 'Data Backfill',
        start: '2025-05-26',
        end: '2025-06-20',
        color: '#ffd43b',
      },
      {
        id: 'cutover',
        label: 'Cutover',
        start: '2025-06-23',
        end: '2025-06-27',
        color: '#ff6b6b',
      },
      {
        id: 'monitor',
        label: 'Post-migration Monitor',
        start: '2025-06-23',
        end: '2025-07-11',
        color: '#a9e34b',
      },
    ],
    milestones: [
      { date: '2025-06-23', label: 'Cutover night' },
    ],
    theme: 'dark',
  });
  matchSvgSnapshot('gantt-migration-custom-dark', svg);
});
