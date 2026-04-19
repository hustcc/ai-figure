import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('timeline diagram — product history, default palette', () => {
  const svg = fig({
    figure: 'timeline',
    title: 'Product History',
    events: [
      { id: 'v1',   label: 'v1.0 Launch',         date: '2020-01-15', milestone: true },
      { id: 'v1a',  label: 'v1.1 Bug fixes',       date: '2020-06-20' },
      { id: 'v2',   label: 'v2.0 Redesign',        date: '2021-03-10', milestone: true },
      { id: 'v2a',  label: 'v2.1 Performance',     date: '2021-09-05' },
      { id: 'v3',   label: 'v3.0 Mobile',          date: '2022-05-18', milestone: true },
      { id: 'v4',   label: 'v4.0 AI Features',     date: '2023-11-01', milestone: true },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('timeline-product-history-default', svg);
});
