import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('gantt chart — product launch plan, tableau10 palette', () => {
  const svg = fig({
    figure: 'gantt',
    title: 'Product Launch Plan',
    tasks: [
      // Strategy
      { id: 'market',    label: 'Market Research',   start: '2025-02-03', end: '2025-02-21', groupId: 'strategy' },
      { id: 'roadmap',   label: 'Roadmap Planning',  start: '2025-02-17', end: '2025-02-28', groupId: 'strategy' },
      // Engineering
      { id: 'mvp',       label: 'MVP Development',   start: '2025-03-03', end: '2025-04-25', groupId: 'engineering' },
      { id: 'api',       label: 'API & Integrations', start: '2025-03-17', end: '2025-04-18', groupId: 'engineering' },
      { id: 'testing',   label: 'QA & Testing',      start: '2025-04-14', end: '2025-05-02', groupId: 'engineering' },
      // Marketing
      { id: 'brand',     label: 'Branding',          start: '2025-03-10', end: '2025-04-04', groupId: 'marketing' },
      { id: 'content',   label: 'Content Creation',  start: '2025-04-07', end: '2025-05-09', groupId: 'marketing' },
      { id: 'ads',       label: 'Ad Campaigns',      start: '2025-05-05', end: '2025-05-23', groupId: 'marketing' },
      // Launch
      { id: 'soft',      label: 'Soft Launch',       start: '2025-05-05', end: '2025-05-09' },
      { id: 'full',      label: 'Full Launch',        start: '2025-05-19', end: '2025-05-23' },
    ],
    milestones: [
      { date: '2025-04-25', label: 'MVP done' },
      { date: '2025-05-09', label: 'Soft launch' },
      { date: '2025-05-23', label: 'Full launch' },
    ],
    palette: 'tableau10',
  });
  matchSvgSnapshot('gantt-product-launch-tableau10', svg);
});
