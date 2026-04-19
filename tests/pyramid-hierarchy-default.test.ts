import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('pyramid diagram — content hierarchy, default palette', () => {
  const svg = fig({
    figure: 'pyramid',
    title: 'Content Hierarchy',
    orientation: 'pyramid',
    layers: [
      { label: 'Strategy',           sublabel: 'mission & vision',   accent: true },
      { label: 'Goals',              sublabel: 'OKRs & KPIs' },
      { label: 'Initiatives',        sublabel: 'projects & epics' },
      { label: 'Tasks',              sublabel: 'day-to-day work' },
    ],
    palette: 'default',
  });
  matchSvgSnapshot('pyramid-content-hierarchy-default', svg);
});

it('pyramid diagram (funnel) — conversion funnel, dark', () => {
  const svg = fig({
    figure: 'pyramid',
    title: 'Conversion Funnel',
    orientation: 'funnel',
    theme: 'dark',
    layers: [
      { label: 'Visitors',          sublabel: '100%',  value: 100 },
      { label: 'Signups',           sublabel: '42%',   value: 42  },
      { label: 'Active Users',      sublabel: '18%',   value: 18  },
      { label: 'Paying Customers',  sublabel: '5%',    value: 5, accent: true },
    ],
    palette: 'antv',
  });
  matchSvgSnapshot('pyramid-funnel-conversion-dark', svg);
});
