import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('bubble chart — global energy mix, vega palette', () => {
  const svg = fig({
    figure: 'bubble',
    title: 'Global Energy Mix',
    subtitle: 'Production by source (TWh)',
    items: [
      { label: 'Coal',    value: 9400 },
      { label: 'Gas',     value: 6700 },
      { label: 'Hydro',   value: 4300 },
      { label: 'Nuclear', value: 2800 },
      { label: 'Wind',    value: 2100 },
      { label: 'Solar',   value: 1300 },
      { label: 'Oil',     value: 900  },
    ],
    palette: 'vega',
  });
  matchSvgSnapshot('bubble-energy-vega', svg);
});
