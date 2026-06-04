import { it } from 'vitest';
import { fig } from '../src/index';
import { matchSvgSnapshot } from './helpers';

it('network diagram — social graph dark mode', () => {
  const svg = fig({
    figure: 'network',
    title: 'Social Network',
    subtitle: 'Friend connections',
    nodes: [
      { id: 'alice', label: 'Alice', weight: 3 },
      { id: 'bob',   label: 'Bob',   weight: 2 },
      { id: 'carol', label: 'Carol' },
      { id: 'dave',  label: 'Dave' },
      { id: 'eve',   label: 'Eve',   weight: 2 },
    ],
    edges: [
      { from: 'alice', to: 'bob' },
      { from: 'alice', to: 'carol' },
      { from: 'bob',   to: 'dave' },
      { from: 'carol', to: 'eve' },
      { from: 'dave',  to: 'eve' },
      { from: 'alice', to: 'eve' },
    ],
    theme: 'dark',
    palette: 'figma',
  });
  matchSvgSnapshot('network-social-figma-dark', svg);
});
