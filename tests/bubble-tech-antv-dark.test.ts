import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('bubble chart — tech comparison, antv palette, dark theme', () => {
  const svg = fig({
    figure: 'bubble',
    title: 'Tech Stack Adoption',
    subtitle: 'Community size by language',
    items: [
      { label: 'Rust',    value: 45 },
      { label: 'Go',      value: 65 },
      { label: 'Python',  value: 90 },
      { label: 'Node.js', value: 80 },
      { label: 'Java',    value: 85 },
      { label: 'C++',     value: 40 },
    ],
    theme: 'dark',
    palette: 'antv',
  });
  matchSvgSnapshot('bubble-tech-antv-dark', svg);
});
