import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('pyramid diagram (funnel) — marketing funnel, drawio palette', () => {
  const svg = fig({
    figure: 'pyramid',
    title: 'Marketing Funnel',
    subtitle: 'Audience journey from awareness to advocacy',
    orientation: 'funnel',
    layers: [
      { label: 'Awareness',      sublabel: 'reach & impressions', value: 100 },
      { label: 'Interest',       sublabel: 'clicks & visits',     value: 60  },
      { label: 'Consideration',  sublabel: 'leads & trials',      value: 30  },
      { label: 'Purchase',       sublabel: 'customers',           value: 12  },
      { label: 'Advocacy',       sublabel: 'promoters & referrals', value: 4, accent: true },
    ],
    palette: 'drawio',
  });
  matchSvgSnapshot('pyramid-marketing-funnel-drawio', svg);
});
