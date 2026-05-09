import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('mindmap — org planning, vega dark', () => {
  const svg = fig({
    figure: 'mindmap',
    title: 'Org Planning',
    subtitle: 'Hiring and execution',
    palette: 'vega',
    theme: 'dark',
    nodes: [
      { id: 'root', label: '2026 Org Plan' },
      { id: 'eng', label: 'Engineering', parent: 'root', side: 'right' },
      { id: 'ops', label: 'Operations', parent: 'root', side: 'left' },
      { id: 'platform', label: 'Platform Team', parent: 'eng' },
      { id: 'product', label: 'Product Team', parent: 'eng' },
      { id: 'support', label: 'Support', parent: 'ops' },
      { id: 'finance', label: 'Finance', parent: 'ops' },
    ],
  });
  matchSvgSnapshot('mindmap-org-vega-dark', svg);
});
