import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('mindmap — product strategy, default palette', () => {
  const svg = fig({
    figure: 'mindmap',
    title: 'Product Strategy',
    subtitle: '2026 planning map',
    nodes: [
      { id: 'root', label: 'Product Strategy' },
      { id: 'market', label: 'Market', parent: 'root', side: 'left' },
      { id: 'tech', label: 'Technology', parent: 'root', side: 'right' },
      { id: 'smb', label: 'SMB', parent: 'market' },
      { id: 'ent', label: 'Enterprise', parent: 'market' },
      { id: 'ai', label: 'AI Features', parent: 'tech' },
      { id: 'infra', label: 'Infra', parent: 'tech' },
    ],
  });
  matchSvgSnapshot('mindmap-product-default', svg);
});
