import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('timeline diagram — quarterly project plan, figma palette', () => {
  const svg = fig({
    figure: 'timeline',
    title: 'Q1 – Q3 Roadmap',
    subtitle: 'Feature delivery schedule for 2025',
    events: [
      { id: 'kick',   label: 'Kickoff',         date: '2025-01-06', milestone: true },
      { id: 'design', label: 'Design Complete',  date: '2025-02-14' },
      { id: 'alpha',  label: 'Alpha Release',    date: '2025-03-28', milestone: true },
      { id: 'beta',   label: 'Beta Launch',      date: '2025-05-12' },
      { id: 'rc',     label: 'Release Candidate', date: '2025-06-30', milestone: true },
      { id: 'ga',     label: 'GA Release',       date: '2025-08-15', milestone: true },
    ],
    palette: 'figma',
  });
  matchSvgSnapshot('timeline-quarterly-roadmap-figma', svg);
});
