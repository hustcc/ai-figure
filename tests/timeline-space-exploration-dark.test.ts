import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('timeline diagram — space exploration milestones, dark theme', () => {
  const svg = fig({
    figure: 'timeline',
    title: 'Space Exploration',
    subtitle: 'Landmark missions from Sputnik to Artemis',
    theme: 'dark',
    events: [
      { id: 'sputnik',  label: 'Sputnik 1',       date: '1957-10-04', milestone: true },
      { id: 'moon',     label: 'Moon Landing',     date: '1969-07-20', milestone: true },
      { id: 'shuttle',  label: 'Space Shuttle',    date: '1981-04-12' },
      { id: 'iss',      label: 'ISS Assembly',     date: '1998-11-20' },
      { id: 'mars',     label: 'Mars Curiosity',   date: '2012-08-06', milestone: true },
      { id: 'artemis',  label: 'Artemis I',        date: '2022-11-16', milestone: true },
    ],
    palette: 'mono-blue',
  });
  matchSvgSnapshot('timeline-space-exploration-dark', svg);
});
