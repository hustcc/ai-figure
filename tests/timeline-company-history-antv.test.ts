import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('timeline diagram — company history, antv palette', () => {
  const svg = fig({
    figure: 'timeline',
    title: 'Company History',
    subtitle: 'Key milestones from founding to IPO',
    events: [
      { id: 'founded', label: 'Founded',           date: '2012-03-01', milestone: true },
      { id: 'seed',    label: 'Seed Round',         date: '2013-07-15' },
      { id: 'launch',  label: 'Product Launch',     date: '2014-05-20', milestone: true },
      { id: 'seriesA', label: 'Series A ($10M)',     date: '2015-11-10' },
      { id: 'growth',  label: 'Global Expansion',   date: '2017-06-01', milestone: true },
      { id: 'ipo',     label: 'IPO',                date: '2019-09-18', milestone: true },
    ],
    palette: 'antv',
  });
  matchSvgSnapshot('timeline-company-history-antv', svg);
});
