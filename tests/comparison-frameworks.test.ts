import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('comparison table — frontend frameworks, clean theme', () => {
  const svg = fig({
    figure: 'comparison',
    columns: ['Feature', 'React', 'Vue', 'Svelte'],
    rows: [
      { feature: '学习成本',   values: ['中',      '低',     '低'    ] },
      { feature: '生态',       values: ['★★★★★',  '★★★★',  '★★★'  ] },
      { feature: '性能',       values: ['★★★★',   '★★★★',  '★★★★★'] },
      { feature: 'SSO 支持',   values: ['✓',       '✓',      '✗'    ] },
      { feature: 'SSR 支持',   values: ['✓',       '✓',      '✓'    ] },
    ],
    theme: 'clean',
  });
  matchSvgSnapshot('comparison-frameworks', svg);
});
