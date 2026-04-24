import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('bubble chart — server request volume, mono-blue palette, dark', () => {
  const svg = fig({
    figure: 'bubble',
    title: 'Server Request Volume',
    subtitle: 'Last 24 hours',
    items: [
      { label: 'web-01',    value: 8200 },
      { label: 'api-01',    value: 6500 },
      { label: 'api-02',    value: 5800 },
      { label: 'worker-01', value: 4400 },
      { label: 'worker-02', value: 3700 },
      { label: 'db-01',     value: 3200 },
      { label: 'cache-01',  value: 2100 },
      { label: 'cron-01',   value: 1100 },
    ],
    theme: 'dark',
    palette: 'mono-blue',
  });
  matchSvgSnapshot('bubble-servers-mono-blue-dark', svg);
});
