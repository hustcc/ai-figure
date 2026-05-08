import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('timeline diagram — clips oversized labels at chart bounds', () => {
  const svg = fig({
    figure: 'timeline',
    title: 'Long Label Bounds',
    events: [
      {
        id: 'start',
        label: 'This is an intentionally oversized timeline label that should stay inside the visible timeline plot even when it is much wider than the available chart area',
        date: '2020-01-01',
        milestone: true,
      },
      { id: 'middle', label: 'Middle', date: '2020-02-01' },
      {
        id: 'end',
        label: 'Another intentionally oversized timeline label near the right edge that should also remain clipped to the visible timeline plot area',
        date: '2020-03-01',
        milestone: true,
      },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('timeline-long-label-bounds-default', svg);
});
